"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Loader2, Mail, Phone, Calendar, Building2, User, FileText } from "lucide-react";
import type { Person, Company, Enrollment, CourseSession, Course } from "@prisma/client";

interface PersonWithRelations extends Person {
  company: Company | null;
  enrollments: (Enrollment & {
    session: CourseSession & {
      course: Course;
    };
  })[];
}

interface PersonDetailsDialogProps {
  person: PersonWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  CONFIRMED: "default",
  WAITLIST: "secondary",
  ATTENDED: "default",
  NO_SHOW: "destructive",
  CANCELLED: "destructive",
};

const statusText: Record<string, string> = {
  PENDING: "Venter",
  CONFIRMED: "Bekreftet",
  WAITLIST: "Venteliste",
  ATTENDED: "Deltok",
  NO_SHOW: "Møtte ikke",
  CANCELLED: "Avlyst",
};

export function PersonDetailsDialog({
  person,
  open,
  onOpenChange,
}: PersonDetailsDialogProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!person) return null;

  const handleSaveNotes = async () => {
    setIsSubmitting(true);

    try {
      // TODO: Implementer lagring av notater
      toast.success("Notater lagret");
      onOpenChange(false);
    } catch (error) {
      toast.error("Kunne ikke lagre notater");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Deltaker detaljer</DialogTitle>
          <DialogDescription>
            Se informasjon og historikk for {person.firstName} {person.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Kontaktinformasjon */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Kontaktinformasjon</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <p className="text-sm">Navn</p>
                </div>
                <p className="font-medium">
                  {person.firstName} {person.lastName}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <p className="text-sm">E-post</p>
                </div>
                <p className="font-medium">{person.email || "-"}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <p className="text-sm">Telefon</p>
                </div>
                <p className="font-medium">{person.phone || "-"}</p>
              </div>
              {person.birthDate && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <p className="text-sm">Fødselsdato</p>
                  </div>
                  <p className="font-medium">
                    {format(person.birthDate, "dd.MM.yyyy", { locale: nb })}
                  </p>
                </div>
              )}
              {person.company && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <p className="text-sm">Bedrift</p>
                  </div>
                  <p className="font-medium">{person.company.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Kurshistorikk */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Kurshistorikk</h3>
            {person.enrollments.length > 0 ? (
              <div className="space-y-3">
                {person.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{enrollment.session.course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(enrollment.session.startsAt, "dd.MM.yyyy", { locale: nb })} • {enrollment.session.location}
                      </p>
                    </div>
                    <Badge variant={statusColors[enrollment.status]}>
                      {statusText[enrollment.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ingen kurs registrert</p>
            )}
          </div>

          {/* Notater */}
          <div>
            <Label htmlFor="notes">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                <span>Notater</span>
              </div>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Legg til notater om denne deltakeren..."
              rows={4}
            />
          </div>

          {/* Metadata */}
          <div className="text-sm text-muted-foreground">
            <p>
              Registrert:{" "}
              {format(person.createdAt, "dd.MM.yyyy 'kl.' HH:mm", { locale: nb })}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Lukk
          </Button>
          <Button onClick={handleSaveNotes} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lagrer...
              </>
            ) : (
              "Lagre notater"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

