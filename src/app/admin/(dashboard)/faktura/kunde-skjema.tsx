"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactSummary } from "@/lib/integrations/fiken/types";

type KundeSkjemaProps = {
  onCreated: (contact: ContactSummary) => void;
};

const INITIAL = {
  name: "",
  email: "",
  phoneNumber: "",
  organizationNumber: "",
  streetAddress: "",
  postCode: "",
  city: "",
};

/** Skjema som oppretter en kundekontakt i Fiken. */
export function KundeSkjema({ onCreated }: KundeSkjemaProps) {
  const [values, setValues] = useState(INITIAL);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof INITIAL, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/fiken/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json()) as { message?: string; contact?: ContactSummary };
      if (!response.ok || !body.contact) {
        setError(body.message ?? "Kunne ikke opprette kunden");
        return;
      }
      setValues(INITIAL);
      onCreated(body.contact);
    } catch {
      setError("Kunne ikke opprette kunden");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Navn" value={values.name} onChange={(value) => update("name", value)} required />
      <Field label="E-post" type="email" value={values.email} onChange={(value) => update("email", value)} />
      <Field label="Telefon" value={values.phoneNumber} onChange={(value) => update("phoneNumber", value)} />
      <Field
        label="Organisasjonsnummer"
        value={values.organizationNumber}
        onChange={(value) => update("organizationNumber", value)}
      />
      <Field label="Adresse" value={values.streetAddress} onChange={(value) => update("streetAddress", value)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Postnummer" value={values.postCode} onChange={(value) => update("postCode", value)} />
        <Field label="Sted" value={values.city} onChange={(value) => update("city", value)} />
      </div>
      {error && (
        <p className="sm:col-span-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Oppretter…" : "Opprett kunde"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const id = `kunde-${label}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
