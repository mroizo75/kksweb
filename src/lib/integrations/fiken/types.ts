/** Typer mot Fiken API v2. Beløp fra API-et er heltall i øre. */

export const VAT_TYPES = [
  "HIGH",
  "MEDIUM",
  "LOW",
  "EXEMPT",
  "EXEMPT_IMPORT_EXPORT",
  "EXEMPT_REVERSE",
  "OUTSIDE",
  "NONE",
] as const;

export type VatType = (typeof VAT_TYPES)[number];

export type FikenAddress = {
  streetAddress?: string;
  city?: string;
  postCode?: string;
  country?: string;
};

export type FikenContactWrite = {
  name: string;
  email?: string;
  phoneNumber?: string;
  organizationNumber?: string;
  customer: true;
  language: "Norwegian";
  currency: "NOK";
  address?: FikenAddress;
};

export type FikenContact = {
  contactId: number;
  name: string;
  email?: string;
  phoneNumber?: string;
  organizationNumber?: string;
  customer?: boolean;
  address?: FikenAddress;
};

export type FikenProductWrite = {
  name: string;
  unitPrice: number;
  incomeAccount: string;
  vatType: VatType;
  active: true;
};

export type FikenProduct = {
  productId: number;
  name: string;
  unitPrice?: number;
  incomeAccount?: string;
  vatType?: string;
  active?: boolean;
};

export type FikenBankAccount = {
  bankAccountId?: number;
  name?: string;
  accountCode?: string;
  bankAccountNumber?: string;
  type?: string;
  inactive?: boolean;
};

export type InvoiceLineInput = {
  description: string;
  quantity: number;
  unitPriceOre: number;
  vatType: VatType;
  incomeAccount: string;
  discountPercent?: number;
  productId?: number;
};

export type FikenInvoiceLineRequest = {
  description: string;
  quantity: number;
  unitPrice: number;
  vatType: VatType;
  incomeAccount: string;
  discount?: number;
  productId?: number;
};

export type FikenInvoiceRequest = {
  issueDate: string;
  dueDate: string;
  customerId: number;
  bankAccountCode: string;
  cash: false;
  currency: "NOK";
  ourReference: string;
  yourReference?: string;
  comment?: string;
  lines: FikenInvoiceLineRequest[];
};

export type FikenInvoice = {
  invoiceId: number;
  invoiceNumber?: number | string;
  issueDate?: string;
  dueDate?: string;
  net?: number;
  vat?: number;
  gross?: number;
  ourReference?: string;
  customer?: {
    contactId?: number;
    name?: string;
    email?: string;
  };
};

export type FikenSendInvoiceRequest = {
  invoiceId: number;
  method: Array<"email" | "ehf">;
  recipientName: string;
  recipientEmail?: string;
  message?: string;
  emailSendOption?: "attachment";
};

export type ContactSummary = {
  contactId: number;
  name: string;
  email: string;
  phoneNumber: string;
  organizationNumber: string;
  streetAddress: string;
  postCode: string;
  city: string;
};

export type ProductSummary = {
  productId: number;
  name: string;
  unitPriceOre: number;
  vatType: VatType;
  incomeAccount: string;
};

export type BankAccountSummary = {
  name: string;
  accountCode: string;
  bankAccountNumber: string;
  type: string;
};

export type InvoiceSummary = {
  invoiceId: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  grossOre: number;
  customerName: string;
  ourReference: string;
};
