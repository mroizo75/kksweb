import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCrmSession } from "@/lib/crm-guard";
import { startOfDay, subDays } from "date-fns";

export async function GET() {
  try {
    const session = await getCrmSession().catch(() => null);
    if (!session) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const todayStart = startOfDay(now);

    // Scope-filter for instruktør
    const dealScope = session.isAdmin ? {} : { assignedToId: session.userId };
    const leadScope = session.isAdmin ? {} : { assignedToId: session.userId };
    const activityScope = session.isAdmin
      ? {}
      : { OR: [{ assignedToId: session.userId }, { createdById: session.userId }] };
    const companyScope = session.isAdmin ? {} : { ownerId: session.userId };
    const personScope = session.isAdmin ? {} : { ownerId: session.userId };

    const [
      dealsPerStage,
      wonLast30,
      lostLast30,
      activitiesTotal,
      activitiesToday,
      openActivities,
      newLeadsLast30,
      totalLeads,
      totalCompanies,
      totalPersons,
      recentActivities,
    ] = await Promise.all([
      db.deal.groupBy({
        by: ["stage"],
        _count: { id: true },
        _sum: { value: true },
        where: { ...dealScope, stage: { notIn: ["WON", "LOST"] } },
      }),
      db.deal.count({
        where: { ...dealScope, stage: "WON", closedAt: { gte: thirtyDaysAgo } },
      }),
      db.deal.count({
        where: { ...dealScope, stage: "LOST", closedAt: { gte: thirtyDaysAgo } },
      }),
      db.activity.count({ where: activityScope }),
      db.activity.count({
        where: { ...activityScope, createdAt: { gte: todayStart } },
      }),
      db.activity.count({
        where: { ...activityScope, status: { in: ["PENDING", "IN_PROGRESS"] } },
      }),
      db.lead.count({
        where: { ...leadScope, createdAt: { gte: thirtyDaysAgo } },
      }),
      db.lead.count({ where: leadScope }),
      db.company.count({ where: companyScope }),
      db.person.count({ where: personScope }),
      db.activity.findMany({
        where: activityScope,
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { name: true } },
          lead: { select: { name: true } },
          deal: { select: { title: true } },
          company: { select: { name: true } },
          person: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    const stageOrder = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION"];
    const pipeline = stageOrder.map((stage) => {
      const found = dealsPerStage.find((d) => d.stage === stage);
      return {
        stage,
        count: found?._count.id ?? 0,
        value: found?._sum.value ?? 0,
      };
    });

    const totalPipelineValue = pipeline.reduce((s, p) => s + p.value, 0);
    const totalPipelineDeals = pipeline.reduce((s, p) => s + p.count, 0);

    return NextResponse.json({
      pipeline,
      totalPipelineValue,
      totalPipelineDeals,
      wonLast30,
      lostLast30,
      activitiesTotal,
      activitiesToday,
      openActivities,
      newLeadsLast30,
      totalLeads,
      totalCompanies,
      totalPersons,
      recentActivities,
    });
  } catch {
    return NextResponse.json({ error: "Serverfeil" }, { status: 500 });
  }
}
