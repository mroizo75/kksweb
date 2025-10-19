"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { z } from "zod";
import { AlertTriangle, CheckCircle } from "lucide-react";

const customerComplaintSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().optional(),
  company: z.string().optional(),
  category: z.enum(["COURSE", "SERVICE", "DOCUMENTATION", "EQUIPMENT", "INSTRUCTOR", "OTHER"]),
  title: z.string().min(3, "Tittel må være minst 3 tegn"),
  description: z.string().min(20, "Beskrivelse må være minst 20 tegn"),
  occurredAt: z.string().min(1, "Dato må fylles ut"),
});

type CustomerComplaintInput = z.infer<typeof customerComplaintSchema>;

export default function ComplaintPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<CustomerComplaintInput>({
    resolver: zodResolver(customerComplaintSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      category: "COURSE",
      title: "",
      description: "",
      occurredAt: new Date().toISOString().slice(0, 10),
    },
  });

  async function onSubmit(data: CustomerComplaintInput) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/public/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Klage mottatt");
        setIsSubmitted(true);
        form.reset();
      } else {
        toast.error(result.error || "Noe gikk galt");
      }
    } catch (error) {
      toast.error("Kunne ikke sende klage");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Takk for din tilbakemelding!</CardTitle>
            <CardDescription className="text-base">
              Vi har mottatt din klage og vil behandle den så snart som mulig. 
              Du vil få tilbakemelding fra oss innen 3-5 virkedager.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Send ny tilbakemelding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Klage eller tilbakemelding</h1>
          <p className="text-lg text-muted-foreground">
            Vi tar all tilbakemelding på alvor og jobber kontinuerlig for å forbedre våre tjenester.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Fortell oss hva som skjedde</CardTitle>
            <CardDescription>
              Alle felt merket med * er obligatoriske. Vi behandler alle henvendelser konfidensielt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Kontaktinformasjon */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Kontaktinformasjon</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navn *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ditt fulle navn" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-post *</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="din@epost.no" />
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
                            <Input {...field} placeholder="Ditt telefonnummer" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrift</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Bedriftsnavn (valgfritt)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Klagedetaljer */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Om klagen</h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Velg kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="COURSE">Kurs/opplæring</SelectItem>
                              <SelectItem value="SERVICE">Kundeservice</SelectItem>
                              <SelectItem value="DOCUMENTATION">Dokumentasjon</SelectItem>
                              <SelectItem value="EQUIPMENT">Utstyr</SelectItem>
                              <SelectItem value="INSTRUCTOR">Instruktør</SelectItem>
                              <SelectItem value="OTHER">Annet</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occurredAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Når skjedde det? *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kort oppsummering *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="En kort beskrivelse av problemet" />
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
                        <FormLabel>Detaljert beskrivelse *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={6}
                            placeholder="Beskriv så detaljert som mulig hva som skjedde, når det skjedde, og hvordan det påvirket deg..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Personvern:</strong> Vi behandler din informasjon i henhold til GDPR. 
                    Dine opplysninger vil kun bli brukt til å behandle denne klagen og forbedre våre tjenester.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Sender..." : "Send inn klage"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Kontaktinfo */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Du kan også kontakte oss direkte:</p>
          <p className="mt-2">
            <strong>E-post:</strong> post@kks.no | <strong>Telefon:</strong> +47 XXX XX XXX
          </p>
        </div>
      </div>
    </div>
  );
}

