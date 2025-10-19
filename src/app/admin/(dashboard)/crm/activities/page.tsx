"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Pencil, Trash2, Phone, Mail, CalendarDays, FileText } from "lucide-react";
import { ActivityDialog } from "@/components/admin/crm/ActivityDialog";
import { deleteActivity, completeActivity } from "@/app/actions/crm/activities";
import { toast } from "sonner";
import type { Activity, User, Lead, Deal, Company, Person } from "@prisma/client";
import { format } from "date-fns";

type ActivityWithRelations = Activity & {
  lead: Pick<Lead, "id" | "name"> | null;
  deal: Pick<Deal, "id" | "title"> | null;
  company: Pick<Company, "id" | "name"> | null;
  person: Pick<Person, "id" | "firstName" | "lastName"> | null;
  assignedTo: Pick<User, "id" | "name"> | null;
  createdBy: Pick<User, "id" | "name">;
};

const typeIcons = {
  TASK: CheckCircle,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: CalendarDays,
  NOTE: FileText,
};

const typeLabels: Record<string, string> = {
  TASK: "Oppgave",
  CALL: "Samtale",
  EMAIL: "E-post",
  MEETING: "Møte",
  NOTE: "Notat",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Venter",
  IN_PROGRESS: "Pågår",
  COMPLETED: "Fullført",
  CANCELLED: "Avbrutt",
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityWithRelations[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const url = filterType
        ? `/api/admin/crm/activities?type=${filterType}`
        : "/api/admin/crm/activities";
      const response = await fetch(url);
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      toast.error("Kunne ikke laste aktiviteter");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [filterType]);

  const handleEdit = (activity: Activity) => {
    setSelectedActivity(activity);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedActivity(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Er du sikker på at du vil slette denne aktiviteten?")) return;

    const result = await deleteActivity(id);
    if (result.success) {
      toast.success("Aktivitet slettet");
      loadActivities();
    } else {
      toast.error(result.error || "Kunne ikke slette aktivitet");
    }
  };

  const handleComplete = async (id: string) => {
    const result = await completeActivity(id);
    if (result.success) {
      toast.success("Aktivitet fullført");
      loadActivities();
    } else {
      toast.error(result.error || "Kunne ikke fullføre aktivitet");
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      loadActivities();
    }
  };

  const getRelatedTo = (activity: ActivityWithRelations) => {
    if (activity.lead) return `Lead: ${activity.lead.name}`;
    if (activity.deal) return `Avtale: ${activity.deal.title}`;
    if (activity.company) return `Bedrift: ${activity.company.name}`;
    if (activity.person)
      return `Person: ${activity.person.firstName} ${activity.person.lastName}`;
    return "-";
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aktiviteter</h1>
          <p className="text-muted-foreground">
            Håndter oppgaver, samtaler, e-poster og møter
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ny Aktivitet
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filterType === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType(null)}
        >
          Alle
        </Button>
        {Object.entries(typeLabels).map(([type, label]) => (
          <Button
            key={type}
            variant={filterType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(type)}
          >
            {label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitetsliste</CardTitle>
          <CardDescription>{activities.length} aktiviteter totalt</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Laster...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Ingen aktiviteter funnet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Emne</th>
                    <th className="text-left p-3 font-medium">Relatert til</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Forfallsdato</th>
                    <th className="text-left p-3 font-medium">Tildelt</th>
                    <th className="text-right p-3 font-medium">Handlinger</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => {
                    const Icon = typeIcons[activity.type];
                    return (
                      <tr key={activity.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            {typeLabels[activity.type]}
                          </div>
                        </td>
                        <td className="p-3 font-medium">{activity.subject}</td>
                        <td className="p-3 text-muted-foreground">
                          {getRelatedTo(activity)}
                        </td>
                        <td className="p-3">
                          <Badge className={statusColors[activity.status]}>
                            {statusLabels[activity.status]}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {activity.dueDate
                            ? format(new Date(activity.dueDate), "dd.MM.yyyy")
                            : "-"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {activity.assignedTo?.name || "-"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            {activity.status !== "COMPLETED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleComplete(activity.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Fullfør
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(activity)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(activity.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ActivityDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        activity={selectedActivity}
      />
    </div>
  );
}

