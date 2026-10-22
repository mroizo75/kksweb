import { isVatType } from "./money";
import type {
  BankAccountSummary,
  ContactSummary,
  FikenBankAccount,
  FikenContact,
  FikenInvoice,
  FikenProduct,
  InvoiceSummary,
  ProductSummary,
} from "./types";

/** Henter numerisk id fra Fiken sin Location-header. */
export function idFromLocation(location: string | null): number | null {
  if (!location) return null;
  const match = location.match(/\/(\d+)\/?$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) ? id : null;
}

/** Leser en feilmelding fra Fiken sitt svar uten å ta med rådata videre. */
export function fikenMessage(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim()) return body.trim().slice(0, 400);
  if (Array.isArray(body)) {
    const parts = body
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "message" in item) {
          return String((item as { message: unknown }).message);
        }
        return "";
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join(" ").slice(0, 400);
  }
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    const message = record.message ?? record.error_description ?? record.error;
    if (typeof message === "string" && message.trim()) return message.trim().slice(0, 400);
  }
  return fallback;
}

export function toContactSummary(contact: FikenContact): ContactSummary | null {
  if (!Number.isInteger(contact.contactId) || !contact.name?.trim()) return null;
  return {
    contactId: contact.contactId,
    name: contact.name.trim(),
    email: contact.email?.trim() ?? "",
    phoneNumber: contact.phoneNumber?.trim() ?? "",
    organizationNumber: contact.organizationNumber?.trim() ?? "",
    streetAddress: contact.address?.streetAddress?.trim() ?? "",
    postCode: contact.address?.postCode?.trim() ?? "",
    city: contact.address?.city?.trim() ?? "",
  };
}

export function toProductSummary(product: FikenProduct): ProductSummary | null {
  if (!Number.isInteger(product.productId) || !product.name?.trim()) return null;
  const vatType = product.vatType && isVatType(product.vatType) ? product.vatType : "HIGH";
  return {
    productId: product.productId,
    name: product.name.trim(),
    unitPriceOre: typeof product.unitPrice === "number" ? product.unitPrice : 0,
    vatType,
    incomeAccount: product.incomeAccount?.trim() || "3000",
  };
}

export function toBankAccountSummary(account: FikenBankAccount): BankAccountSummary | null {
  if (account.inactive) return null;
  const accountCode = account.accountCode?.trim() ?? "";
  if (!accountCode) return null;
  return {
    name: account.name?.trim() || "Bankkonto",
    accountCode,
    bankAccountNumber: account.bankAccountNumber?.trim() ?? "",
  };
}

export function toInvoiceSummary(invoice: FikenInvoice): InvoiceSummary | null {
  if (!Number.isInteger(invoice.invoiceId)) return null;
  return {
    invoiceId: invoice.invoiceId,
    invoiceNumber: invoice.invoiceNumber != null ? String(invoice.invoiceNumber) : "",
    issueDate: invoice.issueDate ?? "",
    dueDate: invoice.dueDate ?? "",
    grossOre: typeof invoice.gross === "number" ? invoice.gross : 0,
    customerName: invoice.customer?.name?.trim() || "Ukjent kunde",
    ourReference: invoice.ourReference?.trim() ?? "",
  };
}
