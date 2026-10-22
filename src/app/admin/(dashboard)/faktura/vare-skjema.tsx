"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VAT_LABEL } from "@/lib/integrations/fiken/money";
import { VAT_TYPES, type ProductSummary, type VatType } from "@/lib/integrations/fiken/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VareSkjemaProps = {
  onCreated: (product: ProductSummary) => void;
};

/** Skjema som oppretter en vare eller tjeneste i Fiken. */
export function VareSkjema({ onCreated }: VareSkjemaProps) {
  const [name, setName] = useState("");
  const [unitPriceNok, setUnitPriceNok] = useState("");
  const [vatType, setVatType] = useState<VatType>("HIGH");
  const [incomeAccount, setIncomeAccount] = useState("3000");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/fiken/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, unitPriceNok, vatType, incomeAccount }),
      });
      const body = (await response.json()) as { message?: string; product?: ProductSummary };
      if (!response.ok || !body.product) {
        setError(body.message ?? "Kunne ikke opprette varen");
        return;
      }
      setName("");
      setUnitPriceNok("");
      setVatType("HIGH");
      setIncomeAccount("3000");
      onCreated(body.product);
    } catch {
      setError("Kunne ikke opprette varen");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="vare-navn">Navn</Label>
        <Input id="vare-navn" value={name} required onChange={(event) => setName(event.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="vare-pris">Nettopris (kr)</Label>
        <Input
          id="vare-pris"
          inputMode="decimal"
          placeholder="1500"
          value={unitPriceNok}
          required
          onChange={(event) => setUnitPriceNok(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>MVA</Label>
        <Select value={vatType} onValueChange={(value) => setVatType(value as VatType)}>
          <SelectTrigger aria-label="MVA">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VAT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {VAT_LABEL[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="vare-konto">Inntektskonto</Label>
        <Input
          id="vare-konto"
          value={incomeAccount}
          required
          onChange={(event) => setIncomeAccount(event.target.value)}
        />
      </div>
      {error && (
        <p className="sm:col-span-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Lagrer…" : "Lagre vare eller tjeneste"}
        </Button>
      </div>
    </form>
  );
}
