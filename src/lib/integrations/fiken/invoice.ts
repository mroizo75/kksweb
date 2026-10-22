import { InvoiceInputError, lineAmounts } from "./money";
import type { FikenInvoiceRequest, InvoiceLineInput } from "./types";

export type { InvoiceLineInput } from "./types";

export type InvoiceDraft = {
  customerId: number;
  issueDate: string;
  dueDate: string;
  bankAccountCode: string;
  ourReference: string;
  yourReference?: string;
  comment?: string;
  lines: InvoiceLineInput[];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Bygger Fiken-forespørselen. Enhetspris er netto i øre.
 * MVA settes ikke her; Fiken beregner den ut fra vatType.
 */
export function buildFikenInvoiceRequest(draft: InvoiceDraft): FikenInvoiceRequest {
  if (!Number.isInteger(draft.customerId) || draft.customerId <= 0) {
    throw new InvoiceInputError("Velg en kunde");
  }
  if (!ISO_DATE.test(draft.issueDate) || !ISO_DATE.test(draft.dueDate)) {
    throw new InvoiceInputError("Ugyldig dato");
  }
  if (draft.dueDate < draft.issueDate) {
    throw new InvoiceInputError("Forfallsdato kan ikke være før fakturadato");
  }
  if (!draft.bankAccountCode.trim()) {
    throw new InvoiceInputError("Velg bankkonto");
  }
  if (draft.lines.length === 0) {
    throw new InvoiceInputError("Fakturaen må ha minst én linje");
  }
  const netOre = draft.lines.reduce(
    (sum, line) =>
      sum + lineAmounts(line.unitPriceOre, line.quantity, line.vatType, line.discountPercent ?? 0).netOre,
    0
  );
  if (netOre <= 0) {
    throw new InvoiceInputError("Summen må være større enn 0 etter rabatt");
  }

  return {
    issueDate: draft.issueDate,
    dueDate: draft.dueDate,
    customerId: draft.customerId,
    bankAccountCode: draft.bankAccountCode.trim(),
    cash: false,
    currency: "NOK",
    ourReference: draft.ourReference.slice(0, 100),
    ...(draft.yourReference ? { yourReference: draft.yourReference.slice(0, 100) } : {}),
    ...(draft.comment ? { comment: draft.comment.slice(0, 500) } : {}),
    lines: draft.lines.map(toLine),
  };
}

function toLine(line: InvoiceLineInput): FikenInvoiceRequest["lines"][number] {
  const description = line.description.trim();
  if (!description) {
    throw new InvoiceInputError("Hver linje må ha en beskrivelse");
  }
  if (!/^\d{4}$/.test(line.incomeAccount)) {
    throw new InvoiceInputError("Inntektskonto må være fire siffer");
  }
  if (!Number.isInteger(line.unitPriceOre) || line.unitPriceOre === 0) {
    throw new InvoiceInputError("Ugyldig linjebeløp");
  }

  const discount = line.discountPercent ?? 0;
  if (discount < 0 || discount > 100) {
    throw new InvoiceInputError("Rabatt kan ikke være over 100 %");
  }

  return {
    description: description.slice(0, 200),
    quantity: line.quantity,
    unitPrice: line.unitPriceOre,
    vatType: line.vatType,
    incomeAccount: line.incomeAccount,
    ...(discount > 0 ? { discount } : {}),
    ...(line.productId ? { productId: line.productId } : {}),
  };
}
