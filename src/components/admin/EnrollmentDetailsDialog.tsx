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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateEnrollmentStatus } from "@/app/actions/updateEnrollmentStatus";
import { toast } from "sonner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Loader2, Mail, Phone, Calendar, MapPin, Building2, User } from "lucide-react";
import type { Enrollment, Person, Company, CourseSession, Course } from "@prisma/client";

interface EnrollmentWithRelations extends Enrollment {
  person: Person;
  company: Company | null;
  session: CourseSession & {
    course: Course;
  };
}

interface EnrollmentDetailsDialogProps {
  enrollment: EnrollmentWithRelations | null;
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

export function EnrollmentDetailsDialog({
  enrollment,
  open,
  onOpenChange,
}: EnrollmentDetailsDialogProps) {
  const router = useRouter();
  const [status, setStatus] = useState(enrollment?.status || "PENDING");
  const [notes, setNotes] = useState(enrollment?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!enrollment) return null;

  const handleUpdateStatus = async () => {
    setIsSubmitting(true);

    try {
      const result = await updateEnrollmentStatus(enrollment.id, status, notes);

      if (result.success) {
        toast.success("Status oppdatert");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke oppdatere status");
      }
    } catch (error) {
      toast.error("En uventet feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Påmeldingsdetaljer</DialogTitle>
          <DialogDescription>
            Se og oppdater informasjon om påmeldingen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Kursinformasjon */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Kursinformasjon</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Kurs</p>
                <p className="font-medium">{enrollment.session.course.title}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Kurskode</p>
                <p className="font-medium">{enrollment.session.course.code}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm">Dato</p>
                </div>
                <p className="font-medium">
                  {format(enrollment.session.startsAt, "dd.MM.yyyy", { locale: nb })}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <p className="text-sm">Sted</p>
                </div>
                <p className="font-medium">{enrollment.session.location}</p>
              </div>
            </div>
          </div>

          {/* Deltakerinformasjon */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Deltakerinformasjon</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <p className="text-sm">Navn</p>
                </div>
                <p className="font-medium">
                  {enrollment.person.firstName} {enrollment.person.lastName}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <p className="text-sm">E-post</p>
                </div>
                <p className="font-medium">{enrollment.person.email}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <p className="text-sm">Telefon</p>
                </div>
                <p className="font-medium">{enrollment.person.phone}</p>
              </div>
              {enrollment.person.birthDate && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Fødselsdato</p>
                  <p className="font-medium">
                    {format(enrollment.person.birthDate, "dd.MM.yyyy", { locale: nb })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bedriftsinformasjon */}
          {enrollment.company && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Bedriftsinformasjon</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <p className="text-sm">Bedriftsnavn</p>
                  </div>
                  <p className="font-medium">{enrollment.company.name}</p>
                </div>
                {enrollment.company.orgNo && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Org.nr</p>
                    <p className="font-medium">{enrollment.company.orgNo}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status og notater */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger id="status" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Venter</SelectItem>
                  <SelectItem value="CONFIRMED">Bekreftet</SelectItem>
                  <SelectItem value="WAITLIST">Venteliste</SelectItem>
                  <SelectItem value="ATTENDED">Deltok</SelectItem>
                  <SelectItem value="NO_SHOW">Møtte ikke</SelectItem>
                  <SelectItem value="CANCELLED">Avlyst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notater</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Legg til notater..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="text-sm text-muted-foreground">
            <p>
              Påmeldt:{" "}
              {format(enrollment.createdAt, "dd.MM.yyyy 'kl.' HH:mm", { locale: nb })}
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
          <Button onClick={handleUpdateStatus} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lagrer...
              </>
            ) : (
              "Oppdater status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

