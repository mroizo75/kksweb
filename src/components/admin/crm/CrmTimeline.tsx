"use client";

import { formatDistanceToNow, format } from "date-fns";
import { nb } from "date-fns/locale";
import {
  CheckSquare,
  Phone,
  Mail,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Activity, Note, EmailLog } from "@prisma/client";

type ActivityWithUser = Activity & {
  assignedTo: { id: string; name: string | null } | null;
  createdBy: { id: string; name: string | null };
};

type NoteWithUser = Note & {
  createdBy: { id: string; name: string | null };
};

type EmailLogWithUser = EmailLog & {
  sentBy: { id: string; name: string | null };
};

type TimelineItem =
  | { kind: "activity"; data: ActivityWithUser }
  | { kind: "note"; data: NoteWithUser }
  | { kind: "email"; data: EmailLogWithUser };

interface Props {
  activities?: ActivityWithUser[];
  notes?: NoteWithUser[];
  emailLogs?: EmailLogWithUser[];
}

const activityIcons: Record<string, React.ElementType> = {
  TASK: CheckSquare,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  NOTE: FileText,
};

const activityColors: Record<string, string> = {
  TASK: "bg-blue-100 text-blue-700",
  CALL: "bg-green-100 text-green-700",
  EMAIL: "bg-yellow-100 text-yellow-700",
  MEETING: "bg-purple-100 text-purple-700",
  NOTE: "bg-gray-100 text-gray-700",
};

const activityLabels: Record<string, string> = {
  TASK: "Oppgave",
  CALL: "Samtale",
  EMAIL: "E-post",
  MEETING: "Møte",
  NOTE: "Notat",
};

const statusLabels: Record<string, string> = {
  PENDING: "Venter",
  IN_PROGRESS: "Pågår",
  COMPLETED: "Fullført",
  CANCELLED: "Kansellert",
};

export function CrmTimeline({ activities = [], notes = [], emailLogs = [] }: Props) {
  const items: TimelineItem[] = [
    ...activities.map((a) => ({ kind: "activity" as const, data: a })),
    ...notes.map((n) => ({ kind: "note" as const, data: n })),
    ...emailLogs.map((e) => ({ kind: "email" as const, data: e })),
  ].sort((a, b) => {
    const dateA =
      a.kind === "activity"
        ? a.data.createdAt
        : a.kind === "note"
          ? a.data.createdAt
          : a.data.sentAt;
    const dateB =
      b.kind === "activity"
        ? b.data.createdAt
        : b.kind === "note"
          ? b.data.createdAt
          : b.data.sentAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Ingen aktivitet ennå
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

      {items.map((item, idx) => {
        if (item.kind === "activity") {
          const act = item.data;
          const Icon = activityIcons[act.type] || CheckSquare;
          return (
            <div key={`act-${act.id}`} className="flex gap-4 pl-10 relative">
              <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${activityColors[act.type]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-card border rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activityLabels[act.type]}
                    </Badge>
                    <span className="font-medium text-sm">{act.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${act.status === "COMPLETED" ? "text-green-700" : ""}`}
                    >
                      {statusLabels[act.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true, locale: nb })}
                    </span>
                  </div>
                </div>
                {act.description && (
                  <p className="text-sm text-muted-foreground">{act.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Av {act.createdBy.name || "ukjent"}
                  {act.dueDate && ` · Frist: ${format(new Date(act.dueDate), "dd.MM.yyyy")}`}
                </p>
              </div>
            </div>
          );
        }

        if (item.kind === "note") {
          const note = item.data;
          return (
            <div key={`note-${note.id}`} className="flex gap-4 pl-10 relative">
              <div className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 text-amber-700">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">Notat</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: nb })}
                  </span>
                </div>
                <p className="text-sm">{note.content}</p>
                <p className="text-xs text-muted-foreground">Av {note.createdBy.name || "ukjent"}</p>
              </div>
            </div>
          );
        }

        const email = item.data;
        return (
          <div key={`email-${email.id}`} className="flex gap-4 pl-10 relative">
            <div className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center bg-sky-100 text-sky-700">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1 bg-sky-50 border border-sky-200 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">E-post</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(email.sentAt), { addSuffix: true, locale: nb })}
                </span>
              </div>
              <p className="font-medium text-sm">{email.subject}</p>
              <p className="text-xs text-muted-foreground">
                Til: {email.toEmail} · Av {email.sentBy.name || "ukjent"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
