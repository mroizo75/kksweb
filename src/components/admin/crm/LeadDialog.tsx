"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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
import { leadSchema, type LeadInput } from "@/lib/validations/crm";
import { createLead, updateLead } from "@/app/actions/crm/leads";
import { toast } from "sonner";
import type { Lead, User } from "@prisma/client";

interface LeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
}

export function LeadDialog({ open, onOpenChange, lead }: LeadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<Pick<User, "id" | "name">[]>([]);

  useEffect(() => {
    // Last brukerliste
    fetch("/api/admin/crm/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => {});
  }, []);

  const form = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead
      ? {
          source: lead.source || "",
          name: lead.name,
          email: lead.email || "",
          phone: lead.phone || "",
          companyName: lead.companyName || "",
          status: lead.status as any,
          assignedToId: lead.assignedToId || "",
          notes: lead.notes || "",
        }
      : {
          source: "",
          name: "",
          email: "",
          phone: "",
          companyName: "",
          status: "NEW",
          assignedToId: "",
          notes: "",
        },
  });

  useEffect(() => {
    if (lead) {
      form.reset({
        source: lead.source || "",
        name: lead.name,
        email: lead.email || "",
        phone: lead.phone || "",
        companyName: lead.companyName || "",
        status: lead.status as any,
        assignedToId: lead.assignedToId || "",
        notes: lead.notes || "",
      });
    } else {
      form.reset({
        source: "",
        name: "",
        email: "",
        phone: "",
        companyName: "",
        status: "NEW",
        assignedToId: "",
        notes: "",
      });
    }
  }, [lead, form]);

  const onSubmit = async (data: LeadInput) => {
    setIsSubmitting(true);

    try {
      const result = lead
        ? await updateLead(lead.id, data)
        : await createLead(data);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "Noe gikk galt");
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
          <DialogTitle>{lead ? "Rediger Lead" : "Opprett Lead"}</DialogTitle>
          <DialogDescription>
            Fyll ut informasjon om potensielle kunder
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Navn *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ola Nordmann" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrift</FormLabel>
                    <FormControl>
                      <Input placeholder="Bedrift AS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-post</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ola@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilde</FormLabel>
                    <FormControl>
                      <Input placeholder="Nettside" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEW">Ny</SelectItem>
                        <SelectItem value="CONTACTED">Kontaktet</SelectItem>
                        <SelectItem value="QUALIFIED">Kvalifisert</SelectItem>
                        <SelectItem value="CONVERTED">Konvertert</SelectItem>
                        <SelectItem value="LOST">Tapt</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tildelt</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "NONE" ? "" : value)
                      }
                      value={field.value || "NONE"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg bruker" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">Ingen</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notater</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Legg til notater..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Lagrer..." : lead ? "Oppdater" : "Opprett"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

