import type { FikenInvoice } from "./types";

/** Fiken-side som tilsvarer visningsside 0 = nyeste. */
export function fikenPageForNewestView(pageCount: number, viewPage: number): number | null {
  if (!Number.isInteger(pageCount) || pageCount < 1) return null;
  if (!Number.isInteger(viewPage) || viewPage < 0 || viewPage >= pageCount) return null;
  return pageCount - 1 - viewPage;
}

/** Nyeste fakturadato og høyeste fakturanummer først. */
export function newestFirstInvoices(invoices: FikenInvoice[]): FikenInvoice[] {
  return [...invoices].sort(compareNewestInvoice);
}

function compareNewestInvoice(left: FikenInvoice, right: FikenInvoice): number {
  const date = (right.issueDate ?? "").localeCompare(left.issueDate ?? "");
  if (date !== 0) return date;
  const number = invoiceNumber(right) - invoiceNumber(left);
  if (number !== 0) return number;
  return right.invoiceId - left.invoiceId;
}

function invoiceNumber(invoice: FikenInvoice): number {
  const value = Number(invoice.invoiceNumber);
  return Number.isFinite(value) ? value : invoice.invoiceId;
}
