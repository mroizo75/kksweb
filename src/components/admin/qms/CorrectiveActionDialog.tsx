"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  correctiveActionSchema,
  type CorrectiveActionInput,
} from "@/lib/validations/qms";
import { createCorrectiveAction } from "@/app/actions/qms/correctiveActions";

interface CorrectiveActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ncId: string;
  users: Array<{ id: string; name: string | null; email: string }>;
}

export function CorrectiveActionDialog({
  open,
  onOpenChange,
  ncId,
  users,
}: CorrectiveActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CorrectiveActionInput>({
    resolver: zodResolver(correctiveActionSchema),
    defaultValues: {
      ncId,
      title: "",
      description: "",
      actionType: "CORRECTIVE",
      responsibleUser: "",
      dueDate: "",
    },
  });

  async function onSubmit(data: CorrectiveActionInput) {
    setIsLoading(true);

    try {
      const result = await createCorrectiveAction(data);

      if (result.success) {
        toast.success(result.message);
        form.reset();
        onOpenChange(false);
        window.location.reload(); // Reload for å oppdatere listen
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Nytt korrigerende tiltak</DialogTitle>
          <DialogDescription>
            Registrer et tiltak for å håndtere avviket
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
                    <Input {...field} placeholder="Kort beskrivelse av tiltaket" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Detaljert beskrivelse av hva som skal gjøres..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="actionType"
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
                        <SelectItem value="IMMEDIATE">Umiddelbar handling</SelectItem>
                        <SelectItem value="CORRECTIVE">Korrigerende tiltak</SelectItem>
                        <SelectItem value="PREVENTIVE">Forebyggende tiltak</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsibleUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ansvarlig *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forfallsdato *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                disabled={isLoading}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Oppretter..." : "Opprett tiltak"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

