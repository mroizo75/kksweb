import { InvoiceInputError } from "./money";
import type { FikenSendInvoiceRequest } from "./types";

export const INVOICE_DELIVERIES = ["email", "ehf", "email_and_ehf"] as const;

export type InvoiceDelivery = (typeof INVOICE_DELIVERIES)[number];

export const DELIVERY_LABEL: Record<InvoiceDelivery, string> = {
  email: "E-post",
  ehf: "EHF",
  email_and_ehf: "E-post og EHF",
};

/** E-post brukes for ren e-post og for kombinasjonen med EHF. */
export function deliveryUsesEmail(delivery: InvoiceDelivery): boolean {
  return delivery !== "ehf";
}

/** EHF brukes alene eller sammen med e-post. */
export function deliveryUsesEhf(delivery: InvoiceDelivery): boolean {
  return delivery !== "email";
}

type SendInvoiceInput = {
  invoiceId: number;
  delivery: InvoiceDelivery;
  recipientName: string;
  recipientEmail?: string;
  message?: string;
};

/** Bygger Fiken-kallet for utsending. E-postfelt tas bare med når e-post er valgt. */
export function buildSendInvoiceRequest(input: SendInvoiceInput): FikenSendInvoiceRequest {
  const method: Array<"email" | "ehf"> = [];
  if (deliveryUsesEmail(input.delivery)) method.push("email");
  if (deliveryUsesEhf(input.delivery)) method.push("ehf");

  const email = input.recipientEmail?.trim();
  if (deliveryUsesEmail(input.delivery) && !email) {
    throw new InvoiceInputError("E-post til kunden er påkrevd");
  }

  return {
    invoiceId: input.invoiceId,
    method,
    recipientName: input.recipientName.slice(0, 200),
    ...(email && deliveryUsesEmail(input.delivery)
      ? {
          recipientEmail: email,
          message: (input.message?.trim() || "Hei, vedlagt er faktura.").slice(0, 1000),
          emailSendOption: "attachment" as const,
        }
      : {}),
  };
}
