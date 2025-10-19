// TODO: Implementeres i Fase 2
// Fiken API Client

import type { FikenInvoice, FikenInvoiceResponse } from "./types";

const FIKEN_API_URL = "https://api.fiken.no/api/v2";

export class FikenClient {
  private apiKey: string;
  private companySlug: string;

  constructor(apiKey: string, companySlug: string) {
    this.apiKey = apiKey;
    this.companySlug = companySlug;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${FIKEN_API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Fiken API error: ${response.statusText}`);
    }

    return response.json();
  }

  async createInvoice(
    invoice: FikenInvoice
  ): Promise<FikenInvoiceResponse> {
    // TODO: Implementer når Fiken-integrasjon skal tas i bruk
    console.log("TODO: Create Fiken invoice", invoice);
    throw new Error("Not implemented");
  }

  async getInvoice(invoiceId: number): Promise<FikenInvoiceResponse> {
    // TODO: Implementer når Fiken-integrasjon skal tas i bruk
    console.log("TODO: Get Fiken invoice", invoiceId);
    throw new Error("Not implemented");
  }
}

export function createFikenClient(): FikenClient | null {
  const apiKey = process.env.FIKEN_API_KEY;
  const companySlug = process.env.FIKEN_COMPANY_SLUG;

  if (!apiKey || !companySlug) {
    console.warn("Fiken credentials not configured");
    return null;
  }

  return new FikenClient(apiKey, companySlug);
}

