"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sendCrmEmail, logEmailOnly } from "@/app/actions/crm/emails";
import { toast } from "sonner";
import { Send, FileText } from "lucide-react";

const schema = z.object({
  toEmail: z.string().email("Ugyldig e-postadresse"),
  subject: z.string().min(1, "Emne er påkrevd"),
  body: z.string().min(1, "Melding er påkrevd"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultToEmail?: string;
  leadId?: string;
  dealId?: string;
  companyId?: string;
  personId?: string;
  onSuccess?: () => void;
}

export function EmailLogDialog({
  open,
  onOpenChange,
  defaultToEmail = "",
  leadId,
  dealId,
  companyId,
  personId,
  onSuccess,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      toEmail: defaultToEmail,
      subject: "",
      body: "",
    },
  });

  const handleSend = async (values: FormValues) => {
    const result = await sendCrmEmail({
      ...values,
      leadId,
      dealId,
      companyId,
      personId,
    });

    if (result.success) {
      toast.success(result.message);
      form.reset({ toEmail: defaultToEmail, subject: "", body: "" });
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast.error(result.error);
    }
  };

  const handleLog = async (values: FormValues) => {
    const result = await logEmailOnly({
      ...values,
      leadId,
      dealId,
      companyId,
      personId,
    });

    if (result.success) {
      toast.success(result.message);
      form.reset({ toEmail: defaultToEmail, subject: "", body: "" });
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Send / logg e-post</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="send">
          <TabsList className="w-full">
            <TabsTrigger value="send" className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              Send via Resend
            </TabsTrigger>
            <TabsTrigger value="log" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Logg manuelt sendt
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <div className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="toEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Til *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="mottaker@eksempel.no" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emne *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Angående..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Melding *</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Skriv melding..." rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <TabsContent value="send">
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Avbryt
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit(handleSend)}
                  disabled={form.formState.isSubmitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? "Sender..." : "Send e-post"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="log">
              <p className="text-xs text-muted-foreground mt-2 mb-3">
                Bruk dette hvis du allerede har sendt e-posten manuelt og ønsker å logge den i CRM.
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Avbryt
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={form.handleSubmit(handleLog)}
                  disabled={form.formState.isSubmitting}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {form.formState.isSubmitting ? "Logger..." : "Logg e-post"}
                </Button>
              </div>
            </TabsContent>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
