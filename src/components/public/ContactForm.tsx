"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toast } from "sonner";
import { Send, CheckCircle } from "lucide-react";

const contactSchema = z.object({
  firstName: z.string().min(2, "Fornavn må være minst 2 tegn"),
  lastName: z.string().min(2, "Etternavn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(2, "Emne må være minst 2 tegn"),
  message: z.string().min(10, "Melding må være minst 10 tegn"),
  gdprConsent: z.literal(true, { error: "Du må godta personvernvilkårene" }),
});

type ContactInput = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      subject: "",
      message: "",
      gdprConsent: false as unknown as true,
    },
  });

  async function onSubmit(data: ContactInput) {
    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        form.reset();
      } else {
        const result = await response.json();
        toast.error(result.error || "Noe gikk galt. Prøv igjen.");
      }
    } catch {
      toast.error("Kunne ikke sende melding. Sjekk tilkoblingen din.");
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-8 space-y-4">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
        <h3 className="text-xl font-bold">Takk for din henvendelse!</h3>
        <p className="text-muted-foreground">
          Vi har mottatt meldingen din og svarer deg så snart som mulig.
        </p>
        <Button variant="outline" onClick={() => setIsSubmitted(false)}>
          Send ny melding
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornavn *</FormLabel>
                <FormControl>
                  <Input placeholder="Ditt fornavn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etternavn *</FormLabel>
                <FormControl>
                  <Input placeholder="Ditt etternavn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-post *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="din@epost.no" {...field} />
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
                <Input type="tel" placeholder="+47 XXX XX XXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bedrift</FormLabel>
              <FormControl>
                <Input placeholder="Bedriftsnavn (valgfritt)" {...field} />
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
                <Input placeholder="Hva gjelder henvendelsen?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Melding *</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder="Skriv din melding her..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gdprConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value === true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  Jeg godtar at KKS AS lagrer mine opplysninger for å besvare
                  henvendelsen, i henhold til{" "}
                  <a
                    href="/personvern"
                    target="_blank"
                    className="text-primary underline"
                  >
                    personvernerklæringen
                  </a>
                  . *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          <Send className="mr-2 h-4 w-4" />
          {form.formState.isSubmitting ? "Sender..." : "Send melding"}
        </Button>
      </form>
    </Form>
  );
}
