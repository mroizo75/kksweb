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
import { dealSchema, type DealInput } from "@/lib/validations/crm";
import { createDeal, updateDeal } from "@/app/actions/crm/deals";
import { toast } from "sonner";
import type { Deal } from "@prisma/client";
import { format } from "date-fns";

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
}

export function DealDialog({ open, onOpenChange, deal }: DealDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/crm/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
    fetch("/api/admin/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data.companies || []));
    fetch("/api/admin/people")
      .then((res) => res.json())
      .then((data) => setPeople(data.people || []));
  }, []);

  const form = useForm<DealInput>({
    resolver: zodResolver(dealSchema),
    defaultValues: deal
      ? {
          title: deal.title,
          companyId: deal.companyId || "",
          personId: deal.personId || "",
          value: deal.value,
          stage: deal.stage as any,
          probability: deal.probability,
          expectedCloseDate: deal.expectedCloseDate
            ? format(new Date(deal.expectedCloseDate), "yyyy-MM-dd")
            : "",
          assignedToId: deal.assignedToId || "",
          notes: deal.notes || "",
        }
      : {
          title: "",
          companyId: "",
          personId: "",
          value: 0,
          stage: "LEAD",
          probability: 50,
          expectedCloseDate: "",
          assignedToId: "",
          notes: "",
        },
  });

  useEffect(() => {
    if (deal) {
      form.reset({
        title: deal.title,
        companyId: deal.companyId || "",
        personId: deal.personId || "",
        value: deal.value,
        stage: deal.stage as any,
        probability: deal.probability,
        expectedCloseDate: deal.expectedCloseDate
          ? format(new Date(deal.expectedCloseDate), "yyyy-MM-dd")
          : "",
        assignedToId: deal.assignedToId || "",
        notes: deal.notes || "",
      });
    }
  }, [deal, form]);

  const onSubmit = async (data: DealInput) => {
    setIsSubmitting(true);

    try {
      const result = deal ? await updateDeal(deal.id, data) : await createDeal(data);

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
          <DialogTitle>{deal ? "Rediger Avtale" : "Opprett Avtale"}</DialogTitle>
          <DialogDescription>
            Håndter salgsmuligheter og avtaler
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tittel *</FormLabel>
                  <FormControl>
                    <Input placeholder="Avtale tittel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrift</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "NONE" ? "" : value)
                      }
                      value={field.value || "NONE"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg bedrift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">Ingen</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Person</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "NONE" ? "" : value)
                      }
                      value={field.value || "NONE"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg person" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">Ingen</SelectItem>
                        {people.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.firstName} {person.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verdi (kr) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stadium *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg stadium" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LEAD">Lead</SelectItem>
                        <SelectItem value="QUALIFIED">Kvalifisert</SelectItem>
                        <SelectItem value="PROPOSAL">Tilbud</SelectItem>
                        <SelectItem value="NEGOTIATION">Forhandling</SelectItem>
                        <SelectItem value="WON">Vunnet</SelectItem>
                        <SelectItem value="LOST">Tapt</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="probability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sannsynlighet % *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expectedCloseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forventet avslutning</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                    <Textarea placeholder="Legg til notater..." rows={4} {...field} />
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
                {isSubmitting ? "Lagrer..." : deal ? "Oppdater" : "Opprett"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

