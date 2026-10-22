import { VAT_TYPES, type VatType } from "./types";

/** MVA i basispunkter (25 % = 2500). Brukes kun til forhåndsvisning; Fiken regner faktisk MVA. */
export const VAT_RATE_BPS: Record<VatType, number> = {
  HIGH: 2500,
  MEDIUM: 1500,
  LOW: 1200,
  EXEMPT: 0,
};

export const VAT_LABEL: Record<VatType, string> = {
  HIGH: "25 %",
  MEDIUM: "15 %",
  LOW: "12 %",
  EXEMPT: "Ingen MVA",
};

export class InvoiceInputError extends Error {
  readonly code = "validation_error";

  constructor(message: string) {
    super(message);
    this.name = "InvoiceInputError";
  }
}

/** Parser et norsk beløp i kroner til øre uten flyttall. */
export function nokToOre(value: string): number {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new InvoiceInputError("Ugyldig beløp");
  }

  const [whole, fraction = ""] = normalized.split(".");
  const ore = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(ore) || ore <= 0) {
    throw new InvoiceInputError("Beløpet må være større enn 0");
  }
  return ore;
}

/** Parser antall. Komma og punktum er begge gyldige desimaltegn. */
export function parseQuantity(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,4})?$/.test(normalized)) {
    throw new InvoiceInputError("Ugyldig antall");
  }

  const quantity = Number(normalized);
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 100_000) {
    throw new InvoiceInputError("Ugyldig antall");
  }
  return quantity;
}

export function isVatType(value: string): value is VatType {
  return (VAT_TYPES as readonly string[]).includes(value);
}

export function lineAmounts(unitPriceOre: number, quantity: number, vatType: VatType) {
  const netOre = Math.round(unitPriceOre * quantity);
  const vatOre = Math.round((netOre * VAT_RATE_BPS[vatType]) / 10_000);
  return { netOre, vatOre, grossOre: netOre + vatOre };
}

/** Viser øre som norske kroner. */
export function formatNokFromOre(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  }).format(ore / 100);
}

/** Viser øre som redigerbart kronebeløp med komma. */
export function oreToNokInput(ore: number): string {
  const whole = Math.floor(ore / 100);
  const fraction = String(ore % 100).padStart(2, "0");
  return fraction === "00" ? String(whole) : `${whole},${fraction}`;
}
