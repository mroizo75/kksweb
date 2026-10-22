import { fikenMessage, idFromLocation } from "./map";
import { FikenApiError } from "./errors";
import type {
  FikenBankAccount,
  FikenContact,
  FikenContactWrite,
  FikenInvoice,
  FikenInvoiceRequest,
  FikenProduct,
  FikenProductWrite,
  FikenSendInvoiceRequest,
} from "./types";

const FIKEN_API_URL = "https://api.fiken.no/api/v2";
const REQUEST_TIMEOUT_MS = 20_000;

type FikenResult<T> = {
  data: T | null;
  location: string | null;
};

export class FikenClient {
  constructor(
    private readonly apiKey: string,
    private readonly companySlug: string
  ) {}

  async listContacts(): Promise<FikenContact[]> {
    return this.list<FikenContact>(`/companies/${this.companySlug}/contacts?customer=true`);
  }

  async createContact(contact: FikenContactWrite): Promise<FikenContact> {
    const created = await this.request<FikenContact>(`/companies/${this.companySlug}/contacts`, {
      method: "POST",
      body: JSON.stringify(contact),
    });
    if (created.data?.contactId) return created.data;
    const contactId = idFromLocation(created.location);
    if (!contactId) {
      throw new FikenApiError(502, "Fiken opprettet kunden uten å returnere en id");
    }
    return this.getContact(contactId);
  }

  async listProducts(): Promise<FikenProduct[]> {
    return this.list<FikenProduct>(`/companies/${this.companySlug}/products`);
  }

  async createProduct(product: FikenProductWrite): Promise<FikenProduct> {
    const created = await this.request<FikenProduct>(`/companies/${this.companySlug}/products`, {
      method: "POST",
      body: JSON.stringify(product),
    });
    if (created.data?.productId) return created.data;
    const productId = idFromLocation(created.location);
    if (!productId) {
      throw new FikenApiError(502, "Fiken opprettet varen uten å returnere en id");
    }
    return this.getProduct(productId);
  }

  async listBankAccounts(): Promise<FikenBankAccount[]> {
    return this.list<FikenBankAccount>(`/companies/${this.companySlug}/bankAccounts`);
  }

  async listInvoices(): Promise<FikenInvoice[]> {
    const { data } = await this.request<FikenInvoice[]>(
      `/companies/${this.companySlug}/invoices?page=0&pageSize=25`
    );
    return Array.isArray(data) ? data : [];
  }

  async createInvoice(invoice: FikenInvoiceRequest): Promise<FikenInvoice> {
    const created = await this.request<FikenInvoice>(`/companies/${this.companySlug}/invoices`, {
      method: "POST",
      body: JSON.stringify(invoice),
    });
    if (created.data?.invoiceId) return created.data;
    const invoiceId = idFromLocation(created.location);
    if (!invoiceId) {
      throw new FikenApiError(502, "Fiken opprettet fakturaen uten å returnere en id");
    }
    return this.getInvoice(invoiceId);
  }

  /** Sender en allerede opprettet faktura på e-post. */
  async sendInvoice(request: FikenSendInvoiceRequest): Promise<void> {
    await this.request<unknown>(`/companies/${this.companySlug}/invoices/send`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  private async getContact(contactId: number): Promise<FikenContact> {
    const { data } = await this.request<FikenContact>(
      `/companies/${this.companySlug}/contacts/${contactId}`
    );
    if (!data?.contactId) throw new FikenApiError(502, "Kunne ikke hente kunden fra Fiken");
    return data;
  }

  private async getProduct(productId: number): Promise<FikenProduct> {
    const { data } = await this.request<FikenProduct>(
      `/companies/${this.companySlug}/products/${productId}`
    );
    if (!data?.productId) throw new FikenApiError(502, "Kunne ikke hente varen fra Fiken");
    return data;
  }

  private async getInvoice(invoiceId: number): Promise<FikenInvoice> {
    const { data } = await this.request<FikenInvoice>(
      `/companies/${this.companySlug}/invoices/${invoiceId}`
    );
    if (!data?.invoiceId) throw new FikenApiError(502, "Kunne ikke hente fakturaen fra Fiken");
    return data;
  }

  private async list<T>(path: string): Promise<T[]> {
    const items: T[] = [];
    for (let page = 0; page < 5; page += 1) {
      const separator = path.includes("?") ? "&" : "?";
      const { data } = await this.request<T[]>(`${path}${separator}page=${page}&pageSize=100`);
      const batch = Array.isArray(data) ? data : [];
      items.push(...batch);
      if (batch.length < 100) break;
    }
    return items;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<FikenResult<T>> {
    const response = await fetch(`${FIKEN_API_URL}${path}`, {
      ...init,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });

    const text = await response.text();
    const body = parseJson(text);
    if (!response.ok) {
      throw new FikenApiError(
        response.status,
        fikenMessage(body, `Fiken svarte med feil (${response.status})`)
      );
    }

    return {
      data: (body ?? null) as T | null,
      location: response.headers.get("location"),
    };
  }
}

function parseJson(text: string): unknown {
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text.slice(0, 300) };
  }
}

import { getFikenAccess } from "./connection";

/** Returnerer klienten når en administrator har koblet til Fiken. */
export async function getFikenClient(): Promise<FikenClient> {
  const access = await getFikenAccess();
  return new FikenClient(access.accessToken, access.companySlug);
}
