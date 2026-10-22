"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KundeSkjema } from "./kunde-skjema";
import type { ContactSummary } from "@/lib/integrations/fiken/types";

type KunderPanelProps = {
  contacts: ContactSummary[];
  onCreated: (contact: ContactSummary) => void;
};

/** Liste og opprettelse av kunder som kan faktureres. */
export function KunderPanel({ contacts, onCreated }: KunderPanelProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return contacts;
    return contacts.filter((contact) =>
      [contact.name, contact.email, contact.organizationNumber, contact.city]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [contacts, query]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Kunder i Fiken</CardTitle>
          <Input
            value={query}
            placeholder="Søk på navn, e-post eller org.nr"
            aria-label="Søk etter kunde"
            onChange={(event) => setQuery(event.target.value)}
          />
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen kunder å vise.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((contact) => (
                <li key={contact.contactId} className="py-3">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[contact.email, contact.organizationNumber, contact.city].filter(Boolean).join(" · ") ||
                      "Ingen kontaktinfo"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ny kunde</CardTitle>
        </CardHeader>
        <CardContent>
          <KundeSkjema
            onCreated={(contact) => {
              toast.success(`${contact.name} er opprettet`);
              onCreated(contact);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
