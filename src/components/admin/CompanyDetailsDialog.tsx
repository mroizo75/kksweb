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
import { Loader2, Mail, Phone, Building2, User, FileText, Users } from "lucide-react";
import type { Company, Person, Contact, Enrollment } from "@prisma/client";

interface CompanyWithRelations extends Company {
  people: Person[];
  contacts: Contact[];
  enrollments: Enrollment[];
}

interface CompanyDetailsDialogProps {
  company: CompanyWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompanyDetailsDialog({
  company,
  open,
  onOpenChange,
}: CompanyDetailsDialogProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!company) return null;

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
          <DialogTitle>Bedriftsdetaljer</DialogTitle>
          <DialogDescription>
            Se informasjon og historikk for {company.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bedriftsinformasjon */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Bedriftsinformasjon</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <p className="text-sm">Bedriftsnavn</p>
                </div>
                <p className="font-medium">{company.name}</p>
              </div>
              {company.orgNo && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Org.nr</p>
                  <p className="font-medium">{company.orgNo}</p>
                </div>
              )}
              {company.email && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <p className="text-sm">E-post</p>
                  </div>
                  <p className="font-medium">{company.email}</p>
                </div>
              )}
              {company.phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <p className="text-sm">Telefon</p>
                  </div>
                  <p className="font-medium">{company.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ansatte/Deltakere */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ansatte/Deltakere ({company.people.length})
            </h3>
            {company.people.length > 0 ? (
              <div className="space-y-2">
                {company.people.map((person) => (
                  <div
                    key={person.id}
                    className="border rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {person.firstName} {person.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {person.email} • {person.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Ingen ansatte registrert</p>
            )}
          </div>

          {/* Kontaktpersoner */}
          {company.contacts && company.contacts.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Kontaktpersoner</h3>
              <div className="space-y-2">
                {company.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="border rounded-lg p-3"
                  >
                    <p className="font-medium">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {contact.email} • {contact.phone}
                    </p>
                    {contact.role && (
                      <Badge variant="outline" className="mt-2">
                        {contact.role}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistikk */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Statistikk</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{company.people.length}</p>
                <p className="text-sm text-muted-foreground">Ansatte</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{company.enrollments.length}</p>
                <p className="text-sm text-muted-foreground">Påmeldinger</p>
              </div>
              <div className="border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{company.contacts?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Kontakter</p>
              </div>
            </div>
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
              placeholder="Legg til notater om denne bedriften..."
              rows={4}
            />
          </div>

          {/* Metadata */}
          <div className="text-sm text-muted-foreground">
            <p>
              Registrert:{" "}
              {format(company.createdAt, "dd.MM.yyyy 'kl.' HH:mm", { locale: nb })}
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

