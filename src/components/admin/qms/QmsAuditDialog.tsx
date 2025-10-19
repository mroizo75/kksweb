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
import { auditSchema, type AuditInput } from "@/lib/validations/qms";
import { createQmsAudit } from "@/app/actions/qms/audits";

interface QmsAuditDialogProps {
  users: { id: string; name: string | null; email: string }[];
}

export function QmsAuditDialog({ users }: QmsAuditDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<AuditInput>({
    resolver: zodResolver(auditSchema),
    defaultValues: {
      type: "INTERNAL",
      scope: "",
      standard: "ISO 9001:2015",
      plannedDate: "",
      plannedDuration: 8,
      location: "",
      leadAuditor: "",
    },
  });

  async function onSubmit(data: AuditInput) {
    setLoading(true);

    try {
      const result = await createQmsAudit(data);

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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ny revisjon
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Planlegg revisjon</DialogTitle>
          <DialogDescription>
            Registrer en ny internrevisjon eller ekstern revisjon
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revisjonstype *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INTERNAL">Internrevisjon</SelectItem>
                      <SelectItem value="EXTERNAL">
                        Ekstern revisjon (sertifisering)
                      </SelectItem>
                      <SelectItem value="SUPPLIER">
                        Leverandørrevisjon
                      </SelectItem>
                      <SelectItem value="CUSTOMER">Kunderevisjon</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Omfang */}
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Omfang *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beskriv hva som skal revideres, f.eks. 'Prosess 4.1 til 4.4, dokumenthåndtering'"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Standard */}
            <FormField
              control={form.control}
              name="standard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Standard</FormLabel>
                  <FormControl>
                    <Input placeholder="f.eks. ISO 9001:2015" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dato og varighet */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plannedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planlagt dato *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Varighet (timer) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Lokasjon */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasjon</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="f.eks. Hovedkontor, Avdeling A"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Revisjonsleder */}
            <FormField
              control={form.control}
              name="leadAuditor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revisjonsleder *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg revisjonsleder" />
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
                    Hvem som leder revisjonen
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Opprett revisjon
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

