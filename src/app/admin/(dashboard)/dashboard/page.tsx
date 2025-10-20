import { Suspense } from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Award,
  Briefcase,
  AlertTriangle,
  Building2,
  Key,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { nb } from "date-fns/locale";
import { DashboardCharts } from "./charts";
import { RecentActivities } from "./recent-activities";

export default async function DashboardPage() {
  // Hent data for statistikk
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const lastMonth = subMonths(now, 1);

  // Parallell data-henting
  const [
    totalCourses,
    activeSessions,
    totalEnrollments,
    enrollmentsThisMonth,
    totalCredentials,
    validCredentials,
    totalLeads,
    activeDeals,
    totalCompanies,
    activeCompanies,
    openNonConformances,
    activeLicenses,
    enrollmentsByDay,
    dealsByStage,
    topCourses,
  ] = await Promise.all([
    // Kurs
    db.course.count({ where: { published: true } }),
    
    // Aktive sesjoner (neste 30 dager)
    db.courseSession.count({
      where: {
        status: "OPEN",
        startsAt: { gte: now },
      },
    }),
    
    // Påmeldinger
    db.enrollment.count(),
    db.enrollment.count({
      where: {
        createdAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
    }),
    
    // Kompetansebevis
    db.credential.count(),
    db.credential.count({
      where: {
        status: "ACTIVE",
        OR: [
          { validTo: null },
          { validTo: { gte: now } },
        ],
      },
    }),
    
    // CRM
    db.lead.count({ where: { status: { notIn: ["CONVERTED", "LOST"] } } }),
    db.deal.count({ where: { stage: { notIn: ["WON", "LOST"] } } }),
    
    // Bedrifter
    db.company.count(),
    db.company.count({ where: { licenseStatus: "ACTIVE" } }),
    
    // QMS
    db.qmsNonConformance.count({
      where: { status: { in: ["OPEN", "INVESTIGATING", "ACTION"] } },
    }),
    
    // Lisenser
    db.license.count({ where: { status: "ACTIVE" } }),
    
    // Påmeldinger siste 30 dager (per dag)
    db.enrollment.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    }),
    
    // Deals per stage
    db.deal.groupBy({
      by: ["stage"],
      _count: true,
    }),
    
    // Topp 5 kurs (via sessions -> enrollments)
    db.course.findMany({
      where: { published: true },
      include: {
        sessions: {
          include: {
            enrollments: true,
          },
        },
      },
    }),
  ]);

  // Beregn prosenter
  const credentialValidityRate = totalCredentials > 0 
    ? Math.round((validCredentials / totalCredentials) * 100) 
    : 0;

  const companyActivityRate = totalCompanies > 0
    ? Math.round((activeCompanies / totalCompanies) * 100)
    : 0;

  // Sorter og ta topp 5 kurs (tell enrollments via sessions)
  const sortedCourses = topCourses
    .map((c) => ({
      title: c.title,
      enrollmentCount: c.sessions.reduce(
        (total, session) => total + session.enrollments.length,
        0
      ),
    }))
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 5);

  // Statistikk-kort
  const stats = [
    {
      title: "Aktive Kurs",
      value: totalCourses.toString(),
      description: `${activeSessions} sesjoner planlagt`,
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Påmeldinger",
      value: totalEnrollments.toString(),
      description: `+${enrollmentsThisMonth} denne måneden`,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Kompetansebevis",
      value: totalCredentials.toString(),
      description: `${credentialValidityRate}% gyldige`,
      icon: Award,
      color: "text-purple-600",
    },
    {
      title: "CRM Pipeline",
      value: activeDeals.toString(),
      description: `${totalLeads} aktive leads`,
      icon: Briefcase,
      color: "text-orange-600",
    },
    {
      title: "Bedrifter",
      value: totalCompanies.toString(),
      description: `${companyActivityRate}% aktive`,
      icon: Building2,
      color: "text-indigo-600",
    },
    {
      title: "Åpne Avvik",
      value: openNonConformances.toString(),
      description: "Krever oppfølging",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      title: "Aktive Lisenser",
      value: activeLicenses.toString(),
      description: `${totalCompanies - activeCompanies} inaktive`,
      icon: Key,
      color: "text-yellow-600",
    },
    {
      title: "Denne Måneden",
      value: enrollmentsThisMonth.toString(),
      description: "Nye påmeldinger",
      icon: TrendingUp,
      color: "text-teal-600",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Oversikt over aktivitet og nøkkeltall
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grafer */}
      <DashboardCharts
        enrollmentsByDay={enrollmentsByDay}
        dealsByStage={dealsByStage}
        topCourses={sortedCourses}
      />

      {/* Nylige aktiviteter */}
      <RecentActivities />
    </div>
  );
}
