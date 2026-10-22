import { z } from "zod";
import { buildFikenInvoiceRequest } from "./invoice";
import { isVatType, nokToOre, parseQuantity } from "./money";
import { INVOICE_DELIVERIES, deliveryUsesEhf, deliveryUsesEmail } from "./send";
import type { FikenContactWrite, FikenInvoiceRequest, FikenProductWrite, VatType } from "./types";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const optionalText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().max(max).optional());

export const createContactSchema = z.object({
  name: z.string().trim().min(1, "Navn er påkrevd").max(200),
  email: z.preprocess(emptyToUndefined, z.string().email("Ugyldig e-post").max(200).optional()),
  phoneNumber: optionalText(30),
  organizationNumber: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const digits = value.replace(/\s/g, "");
      return digits === "" ? undefined : digits;
    },
    z.string().regex(/^\d{9}$/, "Organisasjonsnummer må være 9 siffer").optional()
  ),
  streetAddress: optionalText(200),
  postCode: z.preprocess(
    emptyToUndefined,
    z.string().regex(/^\d{4}$/, "Postnummer må være 4 siffer").optional()
  ),
  city: optionalText(80),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Navn er påkrevd").max(200),
  unitPriceNok: z.string().trim().min(1, "Pris er påkrevd"),
  vatType: z.string().refine(isVatType, "Ugyldig MVA-sats"),
  incomeAccount: z.string().trim().regex(/^\d{4}$/, "Inntektskonto må være fire siffer"),
});

const lineSchema = z.object({
  description: z.string().trim().min(1, "Beskrivelse er påkrevd").max(200),
  quantity: z.string().trim().min(1, "Antall er påkrevd"),
  unitPriceNok: z.string().trim().min(1, "Pris er påkrevd"),
  vatType: z.string().refine(isVatType, "Ugyldig MVA-sats"),
  incomeAccount: z.string().trim().regex(/^\d{4}$/, "Inntektskonto må være fire siffer"),
  productId: z.number().int().positive().optional(),
});

const organizationNumberSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const digits = value.replace(/\s/g, "");
    return digits === "" ? undefined : digits;
  },
  z.string().regex(/^\d{9}$/, "Organisasjonsnummer må være 9 siffer").optional()
);

export const createInvoiceSchema = z
  .object({
    customerId: z.number().int().positive("Velg en kunde"),
    issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig fakturadato"),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ugyldig forfallsdato"),
    bankAccountCode: z.string().trim().min(1, "Velg bankkonto").max(40),
    yourReference: optionalText(100),
    comment: optionalText(500),
    delivery: z.enum(INVOICE_DELIVERIES),
    recipientEmail: z.preprocess(
      emptyToUndefined,
      z.string().email("Ugyldig e-post").max(200).optional()
    ),
    organizationNumber: organizationNumberSchema,
    recipientName: z.string().trim().min(1, "Kundenavn er påkrevd").max(200),
    message: optionalText(1000),
    lines: z.array(lineSchema).min(1, "Fakturaen må ha minst én linje").max(50),
  })
  .superRefine((input, ctx) => {
    if (deliveryUsesEmail(input.delivery) && !input.recipientEmail) {
      ctx.addIssue({
        code: "custom",
        message: "E-post til kunden er påkrevd",
        path: ["recipientEmail"],
      });
    }
    if (deliveryUsesEhf(input.delivery) && !input.organizationNumber) {
      ctx.addIssue({
        code: "custom",
        message: "EHF krever organisasjonsnummer på kunden",
        path: ["organizationNumber"],
      });
    }
  });

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

/** Mapper validert kundeskjema til Fiken-kontakten. */
export function toContactWrite(input: CreateContactInput): FikenContactWrite {
  const hasAddress = Boolean(input.streetAddress || input.postCode || input.city);
  return {
    name: input.name,
    customer: true,
    language: "Norwegian",
    currency: "NOK",
    ...(input.email ? { email: input.email } : {}),
    ...(input.phoneNumber ? { phoneNumber: input.phoneNumber } : {}),
    ...(input.organizationNumber ? { organizationNumber: input.organizationNumber } : {}),
    ...(hasAddress
      ? {
          address: {
            ...(input.streetAddress ? { streetAddress: input.streetAddress } : {}),
            ...(input.postCode ? { postCode: input.postCode } : {}),
            ...(input.city ? { city: input.city } : {}),
            country: "Norge",
          },
        }
      : {}),
  };
}

/** Mapper validert vareskjema til Fiken-produktet. Pris lagres som netto øre. */
export function toProductWrite(input: z.infer<typeof createProductSchema>): FikenProductWrite {
  return {
    name: input.name,
    unitPrice: nokToOre(input.unitPriceNok),
    incomeAccount: input.incomeAccount,
    vatType: input.vatType as VatType,
    active: true,
  };
}

/** Mapper validert fakturaskjema til utkastet som sendes til Fiken. */
export function toInvoiceDraft(input: CreateInvoiceInput, ourReference: string): FikenInvoiceRequest {
  return buildFikenInvoiceRequest({
    customerId: input.customerId,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    bankAccountCode: input.bankAccountCode,
    ourReference,
    yourReference: input.yourReference,
    comment: input.comment,
    lines: input.lines.map((line) => ({
      description: line.description,
      quantity: parseQuantity(line.quantity),
      unitPriceOre: nokToOre(line.unitPriceNok, { allowNegative: true }),
      vatType: line.vatType as VatType,
      incomeAccount: line.incomeAccount,
      ...(line.productId ? { productId: line.productId } : {}),
    })),
  });
}
