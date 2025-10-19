"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Edit, Loader2 } from "lucide-react";

const templateSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  kind: z.enum(["DIPLOMA", "TEMP_CERT", "CERTIFICATE", "CARD"]),
  description: z.string().optional(),
  fileKey: z.string().optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

interface TemplateDialogProps {
  existingTemplate?: any;
}

export function TemplateDialog({ existingTemplate }: TemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: existingTemplate
      ? {
          name: existingTemplate.name,
          kind: existingTemplate.kind,
          description: existingTemplate.description || "",
          fileKey: existingTemplate.fileKey || "",
        }
      : undefined,
  });

  const onSubmit = async (data: TemplateForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/templates", {
        method: existingTemplate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          id: existingTemplate?.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(existingTemplate ? "Mal oppdatert!" : "Mal opprettet!");
        setOpen(false);
        reset();
        router.refresh();
      } else {
        alert(`Feil: ${result.error}`);
      }
    } catch (error) {
      alert("En feil oppstod");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existingTemplate ? (
          <Button variant="outline" size="sm" className="gap-1">
            <Edit className="h-3 w-3" />
            Rediger
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ny mal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {existingTemplate ? "Rediger mal" : "Opprett ny mal"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Navn *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="F.eks. Standard diplom"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="kind">Type *</Label>
            <Select
              value={watch("kind")}
              onValueChange={(value) => setValue("kind", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIPLOMA">Diplom</SelectItem>
                <SelectItem value="TEMP_CERT">Midlertidig sertifikat</SelectItem>
                <SelectItem value="CERTIFICATE">Kursbevis</SelectItem>
                <SelectItem value="CARD">Kompetansekort</SelectItem>
              </SelectContent>
            </Select>
            {errors.kind && (
              <p className="text-sm text-red-500 mt-1">{errors.kind.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Beskrivelse</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Beskriv malen..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="fileKey">Filnøkkel</Label>
            <Input
              id="fileKey"
              {...register("fileKey")}
              placeholder="templates/diploma-standard.pdf"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sti til malfilen i S3/Cloudflare R2 (implementeres senere)
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Tilgjengelige variabler:</h4>
            <div className="text-sm space-y-1">
              <div>
                <code className="bg-background px-2 py-1 rounded">
                  {"{{personName}}"}
                </code>{" "}
                - Deltakers navn
              </div>
              <div>
                <code className="bg-background px-2 py-1 rounded">
                  {"{{courseName}}"}
                </code>{" "}
                - Kursnavn
              </div>
              <div>
                <code className="bg-background px-2 py-1 rounded">
                  {"{{completedDate}}"}
                </code>{" "}
                - Fullføringsdato
              </div>
              <div>
                <code className="bg-background px-2 py-1 rounded">
                  {"{{code}}"}
                </code>{" "}
                - Verifikasjonskode
              </div>
              <div>
                <code className="bg-background px-2 py-1 rounded">
                  {"{{qrCode}}"}
                </code>{" "}
                - QR-kode for verifisering
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Lagrer...
                </>
              ) : existingTemplate ? (
                "Oppdater"
              ) : (
                "Opprett"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

