"use client";

import { useCallback, useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  BankAccountSummary,
  ContactSummary,
  ProductSummary,
} from "@/lib/integrations/fiken/types";
import { KunderPanel } from "./kunder-panel";
import { SendFakturaPanel } from "./send-faktura-panel";
import { VarerPanel } from "./varer-panel";

type LoadState = {
  contacts: ContactSummary[];
  products: ProductSummary[];
  accounts: BankAccountSummary[];
};

const EMPTY: LoadState = { contacts: [], products: [], accounts: [] };

type FikenStatus = {
  connected: boolean;
  companySlug: string | null;
  canConnect: boolean;
  oauthConfigured: boolean;
  redirectUri: string;
};

export default function FakturaPage() {
  const [data, setData] = useState<LoadState>(EMPTY);
  const [status, setStatus] = useState<FikenStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const statusResult = await fetchJson<FikenStatus>("/api/admin/fiken/status");
    if (!statusResult.data) {
      setError(statusResult.error);
      setLoading(false);
      return;
    }
    setStatus(statusResult.data);
    if (!statusResult.data.connected) {
      setData(EMPTY);
      setLoading(false);
      return;
    }

    const [contacts, products, accounts] = await Promise.all([
      fetchJson<{ contacts: ContactSummary[] }>("/api/admin/fiken/contacts"),
      fetchJson<{ products: ProductSummary[] }>("/api/admin/fiken/products"),
      fetchJson<{ accounts: BankAccountSummary[] }>("/api/admin/fiken/bank-accounts"),
    ]);

    const firstError = [contacts, products, accounts].find((result) => result.error)?.error ?? null;
    setError(firstError);
    setData({
      contacts: contacts.data?.contacts ?? [],
      products: products.data?.products ?? [],
      accounts: accounts.data?.accounts ?? [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fiken = params.get("fiken");
    if (fiken === "koblet") toast.success("Fiken er koblet til");
    if (fiken === "feil") toast.error(params.get("melding") || "Kunne ikke koble til Fiken");
    if (fiken) window.history.replaceState(null, "", "/admin/faktura");
    void load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Receipt className="h-6 w-6" />
            Faktura
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Opprett kunde, legg til varer og tjenester, og send faktura fra Fiken.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? "Henter…" : "Oppdater"}
        </Button>
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {status && !status.connected && <FikenConnect status={status} />}

      {status?.connected && (
      <Tabs defaultValue="send">
        <TabsList>
          <TabsTrigger value="send">Send faktura</TabsTrigger>
          <TabsTrigger value="kunder">Kunder</TabsTrigger>
          <TabsTrigger value="varer">Varer og tjenester</TabsTrigger>
        </TabsList>
        <TabsContent value="send">
          <SendFakturaPanel
            contacts={data.contacts}
            products={data.products}
            accounts={data.accounts}
            onContactCreated={(contact) => {
              setData((current) => ({
                contacts: [contact, ...current.contacts.filter((item) => item.contactId !== contact.contactId)],
                products: current.products,
                accounts: current.accounts,
              }));
            }}
          />
        </TabsContent>
        <TabsContent value="kunder">
          <KunderPanel
            contacts={data.contacts}
            onCreated={(contact) => {
              setData((current) => ({
                ...current,
                contacts: [contact, ...current.contacts.filter((item) => item.contactId !== contact.contactId)],
              }));
            }}
          />
        </TabsContent>
        <TabsContent value="varer">
          <VarerPanel
            products={data.products}
            onCreated={(product) => {
              setData((current) => ({
                ...current,
                products: [...current.products.filter((item) => item.productId !== product.productId), product].sort(
                  (a, b) => a.name.localeCompare(b.name, "nb")
                ),
              }));
            }}
          />
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}

function FikenConnect({ status }: { status: FikenStatus }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Koble til Fiken</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          Fiken krever OAuth når flere enn én person bruker integrasjonen. En administrator logger inn i Fiken én
          gang. Instruktørene sender faktura med den tilkoblingen etterpå.
        </p>
        <p>Registrer denne redirect-adressen på Fiken-appen, nøyaktig slik den står:</p>
        <p className="break-all rounded-md bg-slate-100 px-3 py-2 font-mono text-xs">{status.redirectUri}</p>
        {!status.oauthConfigured && (
          <p>Legg inn FIKEN_CLIENT_ID og FIKEN_CLIENT_SECRET, og start serveren på nytt.</p>
        )}
        {status.canConnect && status.oauthConfigured && (
          <Button asChild>
            <a href="/api/admin/fiken/connect">Koble til Fiken</a>
          </Button>
        )}
        {status.oauthConfigured && !status.canConnect && <p>Be en administrator om å koble til Fiken.</p>}
      </CardContent>
    </Card>
  );
}

async function fetchJson<T>(url: string): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(url);
    const body = (await response.json()) as T & { message?: string };
    if (!response.ok) {
      return { data: null, error: body.message ?? "Kunne ikke hente data fra Fiken" };
    }
    return { data: body, error: null };
  } catch {
    return { data: null, error: "Kunne ikke hente data fra Fiken" };
  }
}
