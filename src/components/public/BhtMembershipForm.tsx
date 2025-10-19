"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const bhtMembershipSchema = z.object({
  companyName: z.string().min(2, "Bedriftsnavn må være minst 2 tegn"),
  orgNumber: z.string().optional(),
  contactName: z.string().min(2, "Navn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().min(8, "Telefonnummer må være minst 8 siffer"),
  numberOfEmployees: z.string().optional(),
  message: z.string().optional(),
  gdprConsent: z.boolean().refine((val) => val === true, {
    message: "Du må godta personvernerklæringen",
  }),
});

type BhtMembershipInput = z.infer<typeof bhtMembershipSchema>;

export function BhtMembershipForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<BhtMembershipInput>({
    resolver: zodResolver(bhtMembershipSchema),
    defaultValues: {
      companyName: "",
      orgNumber: "",
      contactName: "",
      email: "",
      phone: "",
      numberOfEmployees: "",
      message: "",
      gdprConsent: false,
    },
  });

  async function onSubmit(data: BhtMembershipInput) {
    setLoading(true);

    try {
      const response = await fetch("/api/public/bht-membership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Takk for din påmelding!");
        setSubmitted(true);
        form.reset();
      } else {
        toast.error(result.error || "Noe gikk galt. Prøv igjen senere.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Noe gikk galt. Prøv igjen senere.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">Takk for din interesse!</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Vi har mottatt din påmelding og kontakter deg innen 24 timer.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline">
          Send ny påmelding
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Bedriftsnavn */}
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bedriftsnavn *</FormLabel>
              <FormControl>
                <Input placeholder="Eks: Bygg AS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Org.nummer */}
        <FormField
          control={form.control}
          name="orgNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organisasjonsnummer</FormLabel>
              <FormControl>
                <Input placeholder="123456789" {...field} />
              </FormControl>
              <FormDescription>Valgfritt</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Kontaktperson */}
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kontaktperson *</FormLabel>
              <FormControl>
                <Input placeholder="Fornavn Etternavn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* E-post og telefon */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-post *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="post@bedrift.no"
                    {...field}
                  />
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
                <FormLabel>Telefon *</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Antall ansatte */}
        <FormField
          control={form.control}
          name="numberOfEmployees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Antall ansatte</FormLabel>
              <FormControl>
                <Input placeholder="Eks: 15" {...field} />
              </FormControl>
              <FormDescription>
                Hjelper oss å gi deg et bedre tilbud
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Melding */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Melding</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Har du spørsmål eller spesielle behov?"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>Valgfritt</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* GDPR-samtykke */}
        <FormField
          control={form.control}
          name="gdprConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Jeg godtar at KKS behandler mine personopplysninger *
                </FormLabel>
                <FormDescription>
                  Vi bruker dine opplysninger kun for å kontakte deg om
                  BHT-medlemskap. Les mer i vår{" "}
                  <a
                    href="/personvern"
                    className="underline hover:text-primary"
                    target="_blank"
                  >
                    personvernerklæring
                  </a>
                  .
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send påmelding
        </Button>
      </form>
    </Form>
  );
}

