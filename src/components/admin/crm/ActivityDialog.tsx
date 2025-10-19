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
import { Checkbox } from "@/components/ui/checkbox";
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
import { activitySchema, type ActivityInput } from "@/lib/validations/crm";
import { createActivity, updateActivity } from "@/app/actions/crm/activities";
import { toast } from "sonner";
import type { Activity } from "@prisma/client";
import { format } from "date-fns";

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: Activity | null;
}

export function ActivityDialog({ open, onOpenChange, activity }: ActivityDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendNow, setSendNow] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/crm/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []));
    fetch("/api/admin/crm/leads")
      .then((res) => res.json())
      .then((data) => setLeads(data.leads || []));
    fetch("/api/admin/crm/deals")
      .then((res) => res.json())
      .then((data) => setDeals(data.deals || []));
    fetch("/api/admin/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data.companies || []));
    fetch("/api/admin/people")
      .then((res) => res.json())
      .then((data) => setPeople(data.people || []));
  }, []);

  const form = useForm<ActivityInput>({
    resolver: zodResolver(activitySchema),
    defaultValues: activity
      ? {
          type: activity.type as any,
          subject: activity.subject,
          description: activity.description || "",
          status: activity.status as any,
          dueDate: activity.dueDate
            ? format(new Date(activity.dueDate), "yyyy-MM-dd'T'HH:mm")
            : "",
          leadId: activity.leadId || "",
          dealId: activity.dealId || "",
          companyId: activity.companyId || "",
          personId: activity.personId || "",
          assignedToId: activity.assignedToId || "",
          emailTo: activity.emailTo || "",
          emailFrom: activity.emailFrom || "",
        }
      : {
          type: "TASK",
          subject: "",
          description: "",
          status: "PENDING",
          dueDate: "",
          leadId: "",
          dealId: "",
          companyId: "",
          personId: "",
          assignedToId: "",
          emailTo: "",
          emailFrom: "",
        },
  });

  const selectedType = form.watch("type");

  useEffect(() => {
    if (activity) {
      form.reset({
        type: activity.type as any,
        subject: activity.subject,
        description: activity.description || "",
        status: activity.status as any,
        dueDate: activity.dueDate
          ? format(new Date(activity.dueDate), "yyyy-MM-dd'T'HH:mm")
          : "",
        leadId: activity.leadId || "",
        dealId: activity.dealId || "",
        companyId: activity.companyId || "",
        personId: activity.personId || "",
        assignedToId: activity.assignedToId || "",
        emailTo: activity.emailTo || "",
        emailFrom: activity.emailFrom || "",
      });
    }
  }, [activity, form]);

  const onSubmit = async (data: ActivityInput) => {
    setIsSubmitting(true);

    try {
      const result = activity
        ? await updateActivity(activity.id, data)
        : await createActivity({ ...data, sendNow } as any);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        form.reset();
        setSendNow(false);
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
      <DialogContent className="max-w-[95vw] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {activity ? "Rediger Aktivitet" : "Opprett Aktivitet"}
          </DialogTitle>
          <DialogDescription>
            Opprett oppgaver, samtaler, e-poster eller møter
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Velg type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TASK">Oppgave</SelectItem>
                        <SelectItem value="CALL">Samtale</SelectItem>
                        <SelectItem value="EMAIL">E-post</SelectItem>
                        <SelectItem value="MEETING">Møte</SelectItem>
                        <SelectItem value="NOTE">Notat</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="PENDING">Venter</SelectItem>
                        <SelectItem value="IN_PROGRESS">Pågår</SelectItem>
                        <SelectItem value="COMPLETED">Fullført</SelectItem>
                        <SelectItem value="CANCELLED">Avbrutt</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emne *</FormLabel>
                  <FormControl>
                    <Input placeholder="Aktivitet emne" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "EMAIL" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emailTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Til (e-post)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="mottaker@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fra (e-post)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="avsender@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Legg til beskrivelse..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forfallsdato</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
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

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Relatert til</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leadId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "NONE" ? "" : value)
                        }
                        value={field.value || "NONE"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg lead" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NONE">Ingen</SelectItem>
                          {leads.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.name}
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
                  name="dealId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avtale</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "NONE" ? "" : value)
                        }
                        value={field.value || "NONE"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg avtale" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NONE">Ingen</SelectItem>
                          {deals.map((deal) => (
                            <SelectItem key={deal.id} value={deal.id}>
                              {deal.title}
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
            </div>

            {selectedType === "EMAIL" && !activity && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendNow"
                  checked={sendNow}
                  onCheckedChange={(checked) => setSendNow(checked as boolean)}
                />
                <label
                  htmlFor="sendNow"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Send e-post nå
                </label>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Lagrer..." : activity ? "Oppdater" : "Opprett"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

