// TODO: Implementeres i Fase 2
// TypeScript types for Fiken API

export interface FikenCompany {
  name: string;
  organizationNumber: string;
  slug: string;
}

export interface FikenContact {
  name: string;
  email?: string;
  phone?: string;
  address?: {
    streetAddress?: string;
    city?: string;
    postCode?: string;
    country?: string;
  };
}

export interface FikenInvoiceLine {
  description: string;
  amount: number;
  vatType: string; // e.g., "HIGH" for 25%
}

export interface FikenInvoice {
  issueDate: string;
  dueDate: string;
  customerId?: number;
  customer?: FikenContact;
  lines: FikenInvoiceLine[];
  currency?: string;
}

export interface FikenInvoiceResponse {
  invoiceId: number;
  invoiceNumber: string;
  kid?: string;
  downloadUrl?: string;
}

