"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function BedriftKontaktForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      companyName: formData.get("companyName") as string,
      orgNo: formData.get("orgNo") as string,
      contactPerson: formData.get("contactPerson") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      employees: formData.get("employees") as string,
      courseType: formData.get("courseType") as string,
      message: formData.get("message") as string,
      gdprConsent,
    };

    try {
      const response = await fetch("/api/public/bedrift-kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Noe gikk galt");
      }

      toast.success("Takk for henvendelsen! Vi tar kontakt snart.");
      (e.target as HTMLFormElement).reset();
      setGdprConsent(false);
    } catch (error) {
      toast.error("Kunne ikke sende skjema. Prøv igjen senere.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Bedriftsinformasjon */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName">Bedriftsnavn *</Label>
          <Input
            id="companyName"
            name="companyName"
            required
            placeholder="Eks: Bedriften AS"
          />
        </div>

        <div>
          <Label htmlFor="orgNo">Organisasjonsnummer</Label>
          <Input
            id="orgNo"
            name="orgNo"
            placeholder="123456789"
          />
        </div>
      </div>

      {/* Kontaktperson */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="contactPerson">Kontaktperson *</Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            required
            placeholder="Fullt navn"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">E-post *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="post@bedrift.no"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefon *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="12345678"
            />
          </div>
        </div>
      </div>

      {/* Antall ansatte */}
      <div>
        <Label htmlFor="employees">Antall ansatte som skal delta *</Label>
        <Select name="employees" required>
          <SelectTrigger>
            <SelectValue placeholder="Velg antall" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-5">1-5 ansatte</SelectItem>
            <SelectItem value="6-10">6-10 ansatte</SelectItem>
            <SelectItem value="11-20">11-20 ansatte</SelectItem>
            <SelectItem value="21-50">21-50 ansatte</SelectItem>
            <SelectItem value="50+">Mer enn 50 ansatte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kurstype */}
      <div>
        <Label htmlFor="courseType">Hvilket kurs er du interessert i? *</Label>
        <Select name="courseType" required>
          <SelectTrigger>
            <SelectValue placeholder="Velg kurs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="truck">Truckkurs</SelectItem>
            <SelectItem value="kran">Krankurs</SelectItem>
            <SelectItem value="stillas">Stillaskurs</SelectItem>
            <SelectItem value="hms">HMS-kurs</SelectItem>
            <SelectItem value="forstehjelp">Førstehjelp</SelectItem>
            <SelectItem value="verneutstyr">Verne- og sikkerhetsutstyr</SelectItem>
            <SelectItem value="annet">Annet / Flere kurs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Melding */}
      <div>
        <Label htmlFor="message">Melding</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Fortell oss mer om deres behov, ønsket tidspunkt, lokasjon, etc."
        />
      </div>

      {/* GDPR */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="gdpr"
          checked={gdprConsent}
          onCheckedChange={(checked) => setGdprConsent(checked === true)}
          required
        />
        <label
          htmlFor="gdpr"
          className="text-sm leading-relaxed cursor-pointer"
        >
          Jeg samtykker til at KKS AS lagrer og behandler mine
          opplysninger for å kunne kontakte meg angående denne henvendelsen. *
        </label>
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isSubmitting ? "Sender..." : "Send forespørsel"}
      </Button>
    </form>
  );
}

