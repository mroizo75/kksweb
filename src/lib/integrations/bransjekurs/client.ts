// TODO: Implementeres i Fase 2
// Bransjekurs.no API Client

import type { BransjekursResult } from "./types";

const BRANSJEKURS_API_URL = "https://api.bransjekurs.no/v1"; // Eksempel-URL

export class BransjekursClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${BRANSJEKURS_API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Bransjekurs API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getResults(params?: {
    from?: string;
    to?: string;
    courseCode?: string;
  }): Promise<BransjekursResult[]> {
    // TODO: Implementer når Bransjekurs-integrasjon skal tas i bruk
    console.log("TODO: Get results from Bransjekurs.no", params);
    throw new Error("Not implemented");
  }

  async getResult(externalId: string): Promise<BransjekursResult> {
    // TODO: Implementer når Bransjekurs-integrasjon skal tas i bruk
    console.log("TODO: Get result from Bransjekurs.no", externalId);
    throw new Error("Not implemented");
  }
}

export function createBransjekursClient(): BransjekursClient | null {
  const apiKey = process.env.BRANSJEKURS_API_KEY;

  if (!apiKey) {
    console.warn("Bransjekurs API key not configured");
    return null;
  }

  return new BransjekursClient(apiKey);
}

