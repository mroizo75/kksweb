"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import {
  qmsDocumentSchema,
  type QmsDocumentInput,
} from "@/lib/validations/qms";
import { createQmsDocument } from "@/app/actions/qms/documents";

interface QmsDocumentDialogProps {
  users: { id: string; name: string | null; email: string }[];
  trigger?: React.ReactNode;
}

export function QmsDocumentDialog({
  users,
  trigger,
}: QmsDocumentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<QmsDocumentInput>({
    resolver: zodResolver(qmsDocumentSchema),
    defaultValues: {
      documentNo: "",
      title: "",
      description: "",
      category: "PROCEDURE",
      version: "1.00",
      fileKey: "",
      ownerId: "",
    },
  });

  async function onSubmit(data: QmsDocumentInput) {
    setLoading(true);

    try {
      const result = await createQmsDocument(data);

      if (result.success) {
        toast.success(result.message);
        form.reset();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nytt dokument
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Opprett nytt dokument</DialogTitle>
          <DialogDescription>
            Registrer en ny prosedyre, instruksjon eller annet QMS-dokument
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Dokumentnummer */}
              <FormField
                control={form.control}
                name="documentNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dokumentnummer *</FormLabel>
                    <FormControl>
                      <Input placeholder="f.eks. 1.00, 6.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      Unikt ID, f.eks. 1.00 (Kvalitetsmanual)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Versjon */}
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versjon *</FormLabel>
                    <FormControl>
                      <Input placeholder="f.eks. 1.00" {...field} />
                    </FormControl>
                    <FormDescription>Versionsnummer</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tittel */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tittel *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="f.eks. Kvalitetsmanual"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kategori */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PROCEDURE">Prosedyre</SelectItem>
                      <SelectItem value="INSTRUCTION">
                        Instruksjon
                      </SelectItem>
                      <SelectItem value="FORM">Skjema</SelectItem>
                      <SelectItem value="POLICY">Policy</SelectItem>
                      <SelectItem value="MANUAL">Håndbok</SelectItem>
                      <SelectItem value="RECORD">Protokoll</SelectItem>
                      <SelectItem value="EXTERNAL">Eksternt</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Beskrivelse */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beskriv formålet med dokumentet"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Filnøkkel */}
            <FormField
              control={form.control}
              name="fileKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filbane / S3 Key *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="f.eks. documents/qms/1-00-kvalitetsmanual.pdf"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Sti til fil på S3 eller lokal server
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dokumenteier */}
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dokumenteier *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg ansvarlig" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Hvem som er ansvarlig for dokumentet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Datoer (valgfritt) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gyldig fra</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reviewDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neste revisjon</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Opprett dokument
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

