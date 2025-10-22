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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createProductLicense } from "@/app/actions/admin/product-licenses";

const productLicenseSchema = z.object({
  customerName: z.string().min(1, "Kundenavn er påkrevd"),
  customerEmail: z.string().email("Ugyldig e-postadresse"),
  customerCompany: z.string().optional(),
  customerDomain: z.string().optional(),
  productName: z.string().min(1, "Produktnavn er påkrevd"),
  productVersion: z.string().optional(),
  expirationMonths: z.string().optional(),
  preset: z.enum(["BASIC", "STANDARD", "PREMIUM"]).optional(),
  maxUsers: z.string().optional(),
  maxBookingsPerMonth: z.string().optional(),
  allowedDomain: z.string().optional(),
  notes: z.string().optional(),
});

type ProductLicenseInput = z.infer<typeof productLicenseSchema>;

interface CreateProductLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductLicenseDialog({
  open,
  onOpenChange,
}: CreateProductLicenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductLicenseInput>({
    resolver: zodResolver(productLicenseSchema),
    defaultValues: {
      preset: "STANDARD",
      productName: "Svampen Booking System",
    },
  });

  const onSubmit = async (data: ProductLicenseInput) => {
    setIsSubmitting(true);

    try {
      const result = await createProductLicense(data);

      if (result.success) {
        toast.success("Produktlisens opprettet!");
        reset();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Kunne ikke opprette produktlisens");
      }
    } catch (error) {
      toast.error("En uventet feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Opprett Ny Produktlisens</DialogTitle>
          <DialogDescription>
            Opprett en lisens for Svampen, TaskGuild eller andre produkter
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Kundeinformasjon */}
          <div className="space-y-4">
            <h3 className="font-semibold">Kundeinformasjon</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Kundenavn <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  {...register("customerName")}
                  placeholder="Svampen AS"
                />
                {errors.customerName && (
                  <p className="text-sm text-destructive">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">
                  E-post <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register("customerEmail")}
                  placeholder="post@svampen.no"
                />
                {errors.customerEmail && (
                  <p className="text-sm text-destructive">
                    {errors.customerEmail.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerCompany">Bedrift (valgfritt)</Label>
                <Input
                  id="customerCompany"
                  {...register("customerCompany")}
                  placeholder="Svampen AS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerDomain">
                  Kundens domene (valgfritt)
                </Label>
                <Input
                  id="customerDomain"
                  {...register("customerDomain")}
                  placeholder="svampen.no"
                />
              </div>
            </div>
          </div>

          {/* Produktinformasjon */}
          <div className="space-y-4">
            <h3 className="font-semibold">Produktinformasjon</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">
                  Produktnavn <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(value) => setValue("productName", value)}
                  defaultValue="Svampen Booking System"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Svampen Booking System">
                      Svampen Booking System
                    </SelectItem>
                    <SelectItem value="TaskGuild">TaskGuild</SelectItem>
                    <SelectItem value="Scrut-Man">Scrut-Man</SelectItem>
                    <SelectItem value="Arrango">Arrango</SelectItem>
                  </SelectContent>
                </Select>
                {errors.productName && (
                  <p className="text-sm text-destructive">
                    {errors.productName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="productVersion">Versjon (valgfritt)</Label>
                <Input
                  id="productVersion"
                  {...register("productVersion")}
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expirationMonths">Varighet (måneder)</Label>
                <Input
                  id="expirationMonths"
                  type="number"
                  {...register("expirationMonths")}
                  placeholder="12"
                />
                <p className="text-xs text-muted-foreground">
                  La stå tom for ingen utløpsdato
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preset">Feature Pakke</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("preset", value as "BASIC" | "STANDARD" | "PREMIUM")
                  }
                  defaultValue="STANDARD"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Begrensninger */}
          <div className="space-y-4">
            <h3 className="font-semibold">Begrensninger</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Maks brukere (valgfritt)</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  {...register("maxUsers")}
                  placeholder="Ubegrenset"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBookingsPerMonth">
                  Maks bookinger/mnd (valgfritt)
                </Label>
                <Input
                  id="maxBookingsPerMonth"
                  type="number"
                  {...register("maxBookingsPerMonth")}
                  placeholder="Ubegrenset"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowedDomain">
                Tillatt domene (valgfritt)
              </Label>
              <Input
                id="allowedDomain"
                {...register("allowedDomain")}
                placeholder="svampen.no"
              />
              <p className="text-xs text-muted-foreground">
                La stå tom for å tillate alle domener
              </p>
            </div>
          </div>

          {/* Notater */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notater (valgfritt)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Interne notater..."
              rows={3}
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
              Opprett Lisens
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

