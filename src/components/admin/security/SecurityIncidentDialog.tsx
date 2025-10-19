"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createSecurityIncident } from "@/app/actions/security/incidents";
import {
  securityIncidentSchema,
  type SecurityIncidentInput,
} from "@/lib/validations/security";

interface SecurityIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SecurityIncidentDialog({
  open,
  onOpenChange,
}: SecurityIncidentDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SecurityIncidentInput>({
    resolver: zodResolver(securityIncidentSchema),
    defaultValues: {
      detectedAt: new Date().toISOString().slice(0, 16),
      dataAffected: false,
      notificationRequired: false,
    },
  });

  // Hent brukere for tildeling
  useEffect(() => {
    if (open) {
      fetch("/api/admin/crm/users")
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((err) => console.error("Failed to fetch users:", err));
    }
  }, [open]);

  const onSubmit = async (data: SecurityIncidentInput) => {
    setIsLoading(true);
    try {
      const result = await createSecurityIncident(data);

      if (result.success) {
        toast.success(`Sikkerhetshendelse opprettet: ${result.incidentNumber}`);
        reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke opprette hendelse");
      }
    } catch (error) {
      console.error("Error creating incident:", error);
      toast.error("En feil oppstod");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ny sikkerhetshendelse</DialogTitle>
          <DialogDescription>
            Rapporter en sikkerhetshendelse for oppfølging (ISO 27001)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div>
            <Label htmlFor="type">Type hendelse *</Label>
            <Select
              onValueChange={(value) => setValue("type", value as any)}
              defaultValue="OTHER"
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNAUTHORIZED_ACCESS">Uautorisert tilgang</SelectItem>
                <SelectItem value="DATA_BREACH">Datainnbrudd</SelectItem>
                <SelectItem value="MALWARE">Skadelig programvare</SelectItem>
                <SelectItem value="PHISHING">Phishing-forsøk</SelectItem>
                <SelectItem value="DDOS">DDoS-angrep</SelectItem>
                <SelectItem value="DATA_LOSS">Datatap</SelectItem>
                <SelectItem value="SYSTEM_FAILURE">Systemfeil</SelectItem>
                <SelectItem value="POLICY_VIOLATION">Brudd på policy</SelectItem>
                <SelectItem value="SUSPICIOUS_ACTIVITY">Mistenkelig aktivitet</SelectItem>
                <SelectItem value="OTHER">Annet</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
            )}
          </div>

          {/* Alvorlighetsgrad */}
          <div>
            <Label htmlFor="severity">Alvorlighetsgrad *</Label>
            <Select
              onValueChange={(value) => setValue("severity", value as any)}
              defaultValue="MEDIUM"
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg alvorlighetsgrad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CRITICAL">Kritisk (umiddelbar handling)</SelectItem>
                <SelectItem value="HIGH">Høy (innen 24t)</SelectItem>
                <SelectItem value="MEDIUM">Medium (innen 1 uke)</SelectItem>
                <SelectItem value="LOW">Lav (etter prioritet)</SelectItem>
              </SelectContent>
            </Select>
            {errors.severity && (
              <p className="text-sm text-red-500 mt-1">{errors.severity.message}</p>
            )}
          </div>

          {/* Tittel */}
          <div>
            <Label htmlFor="title">Tittel *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Kort beskrivelse av hendelsen"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Beskrivelse */}
          <div>
            <Label htmlFor="description">Beskrivelse *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Detaljert beskrivelse av hendelsen"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Berørte systemer */}
          <div>
            <Label htmlFor="affectedAssets">Berørte systemer/data</Label>
            <Textarea
              id="affectedAssets"
              {...register("affectedAssets")}
              placeholder="Hvilke systemer eller data er påvirket?"
              rows={2}
            />
          </div>

          {/* Oppdaget tidspunkt */}
          <div>
            <Label htmlFor="detectedAt">Oppdaget tidspunkt *</Label>
            <Input
              id="detectedAt"
              type="datetime-local"
              {...register("detectedAt")}
            />
            {errors.detectedAt && (
              <p className="text-sm text-red-500 mt-1">{errors.detectedAt.message}</p>
            )}
          </div>

          {/* Umiddelbare tiltak */}
          <div>
            <Label htmlFor="immediateAction">Umiddelbare tiltak</Label>
            <Textarea
              id="immediateAction"
              {...register("immediateAction")}
              placeholder="Hva ble gjort umiddelbart?"
              rows={2}
            />
          </div>

          {/* Tildel til */}
          <div>
            <Label htmlFor="assignedTo">Tildel til</Label>
            <Select
              onValueChange={(value) => setValue("assignedTo", value === "NONE" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg ansvarlig" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Ikke tildelt</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dataAffected"
                checked={watch("dataAffected")}
                onCheckedChange={(checked) => setValue("dataAffected", checked as boolean)}
              />
              <Label htmlFor="dataAffected" className="font-normal cursor-pointer">
                Persondata påvirket (GDPR)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notificationRequired"
                checked={watch("notificationRequired")}
                onCheckedChange={(checked) => setValue("notificationRequired", checked as boolean)}
              />
              <Label htmlFor="notificationRequired" className="font-normal cursor-pointer">
                Varsling påkrevd (Datatilsynet)
              </Label>
            </div>
          </div>

          {/* Handlinger */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Oppretter..." : "Opprett hendelse"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

