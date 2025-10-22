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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createPerson } from "@/app/actions/admin/people";

const personSchema = z.object({
  firstName: z.string().min(1, "Fornavn er påkrevd"),
  lastName: z.string().min(1, "Etternavn er påkrevd"),
  email: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  companyId: z.string().optional(),
});

type PersonInput = z.infer<typeof personSchema>;

interface CreatePersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies?: Array<{ id: string; name: string }>;
}

export function CreatePersonDialog({
  open,
  onOpenChange,
  companies = [],
}: CreatePersonDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PersonInput>({
    resolver: zodResolver(personSchema),
  });

  const onSubmit = async (data: PersonInput) => {
    setIsSubmitting(true);

    try {
      const result = await createPerson(data);

      if (result.success) {
        toast.success("Ny deltaker opprettet!");
        reset();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Kunne ikke opprette deltaker");
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
          <DialogTitle>Ny deltaker</DialogTitle>
          <DialogDescription>
            Registrer en ny deltaker i systemet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Navn */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Fornavn <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Ola"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Etternavn <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Nordmann"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Kontaktinformasjon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="ola@eksempel.no"
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
              placeholder="Eksempelveien 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postnummer</Label>
              <Input
                id="postalCode"
                {...register("postalCode")}
                placeholder="0123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Poststed</Label>
              <Input id="city" {...register("city")} placeholder="Oslo" />
            </div>
          </div>

          {/* Bedriftstilknytning */}
          {companies.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="companyId">Bedrift (valgfritt)</Label>
              <Select
                onValueChange={(value) =>
                  setValue("companyId", value === "none" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg bedrift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Privatperson</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              Opprett deltaker
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

