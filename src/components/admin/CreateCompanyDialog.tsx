"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createCompany } from "@/app/actions/admin/companies";

const companySchema = z.object({
  name: z.string().min(1, "Bedriftsnavn er påkrevd"),
  orgNo: z.string().optional(),
  email: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CompanyInput = z.infer<typeof companySchema>;

interface CreateCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompanyDialog({
  open,
  onOpenChange,
}: CreateCompanyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = async (data: CompanyInput) => {
    setIsSubmitting(true);

    try {
      const result = await createCompany(data);

      if (result.success) {
        toast.success("Ny bedrift opprettet!");
        reset();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Kunne ikke opprette bedrift");
      }
    } catch (error) {
      toast.error("En uventet feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ny bedrift</DialogTitle>
          <DialogDescription>
            Registrer en ny bedrift i systemet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Bedriftsnavn */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Bedriftsnavn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Eksempel AS"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Organisasjonsnummer */}
          <div className="space-y-2">
            <Label htmlFor="orgNo">Organisasjonsnummer</Label>
            <Input
              id="orgNo"
              {...register("orgNo")}
              placeholder="123456789"
              maxLength={9}
            />
          </div>

          {/* Kontaktinformasjon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="post@eksempel.no"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+47 123 45 678"
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Eksempelveien 1, 0123 Oslo"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Opprett bedrift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

