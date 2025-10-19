import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export async function RecentActivities() {
  // Hent nylige påmeldinger
  const recentEnrollments = await db.enrollment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      person: { select: { firstName: true, lastName: true } },
      session: {
        select: {
          course: { select: { title: true } },
          startsAt: true,
        },
      },
    },
  });

  // Hent nylige leads
  const recentLeads = await db.lead.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      email: true,
      status: true,
      source: true,
      createdAt: true,
    },
  });

  // Hent nylige avvik
  const recentNonConformances = await db.qmsNonConformance.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      ncNumber: true,
      title: true,
      severity: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Nylige Påmeldinger */}
      <Card>
        <CardHeader>
          <CardTitle>Nylige Påmeldinger</CardTitle>
          <CardDescription>Siste 5 påmeldinger</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentEnrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen påmeldinger enda</p>
            ) : (
              recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {enrollment.person.firstName} {enrollment.person.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {enrollment.session.course.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(enrollment.createdAt), "dd.MM.yyyy HH:mm", {
                        locale: nb,
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      enrollment.status === "CONFIRMED"
                        ? "default"
                        : enrollment.status === "PENDING"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {enrollment.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nylige Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Nylige Leads</CardTitle>
          <CardDescription>Siste 5 leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen leads enda</p>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.email} className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(lead.createdAt), "dd.MM.yyyy HH:mm", {
                        locale: nb,
                      })}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <Badge
                      variant={
                        lead.status === "NEW"
                          ? "default"
                          : lead.status === "CONTACTED"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {lead.status}
                    </Badge>
                    {lead.source && (
                      <p className="text-xs text-muted-foreground">{lead.source}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nylige Avvik */}
      <Card>
        <CardHeader>
          <CardTitle>Nylige Avvik</CardTitle>
          <CardDescription>Siste 5 avvik</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNonConformances.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen avvik enda</p>
            ) : (
              recentNonConformances.map((nc) => (
                <div key={nc.id} className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{nc.ncNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {nc.title.length > 40 ? nc.title.substring(0, 40) + "..." : nc.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(nc.createdAt), "dd.MM.yyyy HH:mm", {
                        locale: nb,
                      })}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <Badge
                      variant={
                        nc.severity === "CRITICAL"
                          ? "destructive"
                          : nc.severity === "MAJOR"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {nc.severity}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{nc.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

