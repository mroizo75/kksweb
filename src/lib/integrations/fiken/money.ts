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

/** Parser et norsk beløp i kroner til øre uten flyttall. Rabattlinjer kan være negative. */
export function nokToOre(value: string, options?: { allowNegative?: boolean }): number {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");
  const match = /^(-)?(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) {
    throw new InvoiceInputError("Ugyldig beløp");
  }

  const negative = match[1] === "-";
  if (negative && !options?.allowNegative) {
    throw new InvoiceInputError("Beløpet må være større enn 0");
  }

  const ore = (negative ? -1 : 1) * (Number(match[2]) * 100 + Number((match[3] ?? "").padEnd(2, "0")));
  if (!Number.isSafeInteger(ore) || ore === 0) {
    throw new InvoiceInputError(negative ? "Beløpet kan ikke være 0" : "Beløpet må være større enn 0");
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

export function lineAmounts(
  unitPriceOre: number,
  quantity: number,
  vatType: VatType,
  discountPercent = 0
) {
  const discountBps = Math.round(discountPercent * 100);
  const beforeDiscount = Math.round(unitPriceOre * quantity);
  const netOre = Math.round((beforeDiscount * (10_000 - discountBps)) / 10_000);
  const vatOre = Math.round((netOre * VAT_RATE_BPS[vatType]) / 10_000);
  return { netOre, vatOre, grossOre: netOre + vatOre };
}

/** Leser rabatt i prosent, 0 til 100. Tomt felt er 0. */
export function parseDiscountPercent(value: string): number {
  const normalized = value.trim().replace("%", "").replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new InvoiceInputError("Ugyldig rabatt");
  }
  const percent = Number(normalized);
  if (percent > 100) {
    throw new InvoiceInputError("Rabatt kan ikke være over 100 %");
  }
  return percent;
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
  const abs = Math.abs(ore);
  const whole = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, "0");
  const amount = fraction === "00" ? String(whole) : `${whole},${fraction}`;
  return ore < 0 ? `-${amount}` : amount;
}
