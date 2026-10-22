"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KundeSkjema } from "./kunde-skjema";
import {
  formatNokFromOre,
  InvoiceInputError,
  lineAmounts,
  nokToOre,
  oreToNokInput,
  parseQuantity,
  VAT_LABEL,
} from "@/lib/integrations/fiken/money";
import {
  DELIVERY_LABEL,
  INVOICE_DELIVERIES,
  deliveryUsesEhf,
  deliveryUsesEmail,
  type InvoiceDelivery,
} from "@/lib/integrations/fiken/send";
import { VAT_TYPES, type BankAccountSummary, type ContactSummary, type InvoiceSummary, type ProductSummary, type VatType } from "@/lib/integrations/fiken/types";

type DraftLine = {
  key: string;
  productId: string;
  description: string;
  quantity: string;
  unitPriceNok: string;
  vatType: VatType;
  incomeAccount: string;
};

type SendFakturaPanelProps = {
  contacts: ContactSummary[];
  products: ProductSummary[];
  accounts: BankAccountSummary[];
  onContactCreated: (contact: ContactSummary) => void;
};

/** Skjema for å sette sammen og sende en faktura. */
export function SendFakturaPanel({
  contacts,
  products,
  accounts,
  onContactCreated,
}: SendFakturaPanelProps) {
  const [customerId, setCustomerId] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [issueDate, setIssueDate] = useState(() => isoDate(0));
  const [dueDate, setDueDate] = useState(() => isoDate(14));
  const [bankAccountCode, setBankAccountCode] = useState(accounts[0]?.accountCode ?? "");

  useEffect(() => {
    if (!bankAccountCode && accounts[0]) {
      setBankAccountCode(accounts[0].accountCode);
    }
  }, [accounts, bankAccountCode]);
  const [yourReference, setYourReference] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("Hei, vedlagt er faktura.");
  const [delivery, setDelivery] = useState<InvoiceDelivery>("email");
  const [lines, setLines] = useState<DraftLine[]>([emptyLine()]);
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [invoicePage, setInvoicePage] = useState(0);
  const [invoicePageCount, setInvoicePageCount] = useState(1);
  const [listedInvoices, setListedInvoices] = useState<InvoiceSummary[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const customer = contacts.find((item) => String(item.contactId) === customerId) ?? null;
  const canUseEhf = Boolean(customer?.organizationNumber);

  useEffect(() => {
    if (!canUseEhf && delivery !== "email") setDelivery("email");
  }, [canUseEhf, delivery]);
  const visibleContacts = contacts.filter((item) => {
    const needle = customerQuery.trim().toLowerCase();
    if (!needle) return true;
    return item.name.toLowerCase().includes(needle) || item.email.toLowerCase().includes(needle);
  });

  const totals = useMemo(() => sumLines(lines), [lines]);

  const loadInvoices = useCallback(async (page: number) => {
    setInvoicesLoading(true);
    try {
      const response = await fetch(`/api/admin/fiken/invoices?page=${page}`);
      const body = (await response.json()) as {
        invoices?: InvoiceSummary[];
        page?: number;
        pageCount?: number;
      };
      if (!response.ok) return;
      const invoices = body.invoices ?? [];
      if (page > 0 && invoices.length === 0) {
        setInvoicePageCount(page);
        return;
      }
      setListedInvoices(invoices);
      setInvoicePage(body.page ?? page);
      setInvoicePageCount(body.pageCount ?? 1);
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvoices(0);
  }, [loadInvoices]);

  function updateLine(key: string, patch: Partial<DraftLine>) {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function applyProduct(key: string, productId: string) {
    const product = products.find((item) => String(item.productId) === productId);
    if (!product) {
      updateLine(key, { productId: "" });
      return;
    }
    updateLine(key, {
      productId,
      description: product.name,
      unitPriceNok: product.unitPriceOre > 0 ? oreToNokInput(product.unitPriceOre) : "",
      vatType: product.vatType,
      incomeAccount: product.incomeAccount,
    });
  }

  async function sendInvoice() {
    if (!customer) return;
    setPending(true);
    try {
      const response = await fetch("/api/admin/fiken/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.contactId,
          issueDate,
          dueDate,
          bankAccountCode,
          yourReference,
          comment,
          delivery,
          recipientName: customer.name,
          message,
          ...(customer.email ? { recipientEmail: customer.email } : {}),
          ...(customer.organizationNumber ? { organizationNumber: customer.organizationNumber } : {}),
          lines: lines.map((line) => ({
            description: line.description,
            quantity: line.quantity,
            unitPriceNok: line.unitPriceNok,
            vatType: line.vatType,
            incomeAccount: line.incomeAccount,
            ...(line.productId ? { productId: Number(line.productId) } : {}),
          })),
        }),
      });
      const body = (await response.json()) as {
        code?: string;
        message?: string;
        invoice?: InvoiceSummary | null;
      };
      if (!response.ok) {
        toast.error(body.message ?? "Kunne ikke sende fakturaen");
        if (body.code === "send_failed") await loadInvoices(0);
        return;
      }
      toast.success(
        `Faktura ${body.invoice?.invoiceNumber || ""} er sendt via ${DELIVERY_LABEL[delivery].toLowerCase()}`
      );
      setLines([emptyLine()]);
      setYourReference("");
      setComment("");
      await loadInvoices(0);
    } catch {
      toast.error("Kunne ikke sende fakturaen");
    } finally {
      setPending(false);
      setConfirmOpen(false);
    }
  }

  const canSend = Boolean(
    customer &&
      bankAccountCode &&
      totals &&
      totals.grossOre > 0 &&
      (!deliveryUsesEmail(delivery) || customer.email) &&
      (!deliveryUsesEhf(delivery) || customer.organizationNumber)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kunde</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={customerQuery}
            placeholder="Søk etter kunde"
            aria-label="Søk etter kunde"
            onChange={(event) => setCustomerQuery(event.target.value)}
          />
          <Select value={customerId || undefined} onValueChange={setCustomerId}>
            <SelectTrigger aria-label="Velg kunde">
              <SelectValue placeholder="Velg kunde" />
            </SelectTrigger>
            <SelectContent>
              {visibleContacts.map((item) => (
                <SelectItem key={item.contactId} value={String(item.contactId)}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {customer && deliveryUsesEmail(delivery) && !customer.email && (
            <p className="text-sm text-destructive" role="alert">
              Kunden mangler e-post. Oppdater kunden i Fiken, eller send bare som EHF hvis bedriften har organisasjonsnummer.
            </p>
          )}
          <Button type="button" variant="outline" onClick={() => setShowCustomerForm((open) => !open)}>
            {showCustomerForm ? "Skjul skjema" : "Ny kunde"}
          </Button>
          {showCustomerForm && (
            <KundeSkjema
              onCreated={(contact) => {
                onContactCreated(contact);
                setCustomerId(String(contact.contactId));
                setShowCustomerForm(false);
                toast.success(`${contact.name} er opprettet`);
              }}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Linjer</CardTitle>
          <Button type="button" variant="outline" onClick={() => setLines((current) => [...current, emptyLine()])}>
            <Plus className="h-4 w-4" />
            Legg til linje
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {lines.map((line, index) => (
            <LineEditor
              key={line.key}
              line={line}
              index={index}
              products={products}
              canRemove={lines.length > 1}
              onChange={(patch) => updateLine(line.key, patch)}
              onProduct={(productId) => applyProduct(line.key, productId)}
              onRemove={() => setLines((current) => current.filter((item) => item.key !== line.key))}
            />
          ))}
          <div className="flex justify-end border-t pt-4 text-sm">
            {totals ? (
              <div className="space-y-1 text-right">
                <p>Netto {formatNokFromOre(totals.netOre)}</p>
                <p>MVA {formatNokFromOre(totals.vatOre)}</p>
                <p className="text-base font-semibold">Å betale {formatNokFromOre(totals.grossOre)}</p>
                {totals.grossOre <= 0 && (
                  <p className="text-destructive">Summen må være større enn 0 etter rabatt.</p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Fyll inn antall og pris for å se summen.</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Rabatt legges inn som en egen linje med minus foran beløpet, for eksempel -500.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fakturadetaljer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="faktura-dato">Fakturadato</Label>
            <Input id="faktura-dato" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="forfall">Forfallsdato</Label>
            <Input id="forfall" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Bankkonto</Label>
            <Select value={bankAccountCode || undefined} onValueChange={setBankAccountCode}>
              <SelectTrigger aria-label="Bankkonto">
                <SelectValue placeholder="Velg konto" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.accountCode} value={account.accountCode}>
                    {account.name}
                    {account.bankAccountNumber ? ` · ${account.bankAccountNumber}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {accounts.length === 0 && (
              <p className="text-sm text-destructive">Ingen aktiv bankkonto ble funnet i Fiken.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deres-ref">Kundens referanse</Label>
            <Input id="deres-ref" value={yourReference} onChange={(event) => setYourReference(event.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="kommentar">Tekst på fakturaen</Label>
            <Textarea id="kommentar" value={comment} onChange={(event) => setComment(event.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Sending</Label>
            {canUseEhf ? (
              <Select value={delivery} onValueChange={(value) => setDelivery(value as InvoiceDelivery)}>
                <SelectTrigger aria-label="Sending">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_DELIVERIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {DELIVERY_LABEL[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                E-post. EHF kan velges når kunden har organisasjonsnummer.
              </p>
            )}
          </div>
          {deliveryUsesEmail(delivery) && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="epost-melding">Melding i e-posten</Label>
              <Textarea id="epost-melding" value={message} onChange={(event) => setMessage(event.target.value)} />
            </div>
          )}
          <div className="sm:col-span-2">
            <Button type="button" disabled={!canSend || pending} onClick={() => setConfirmOpen(true)}>
              Opprett og send faktura
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Siste fakturaer</CardTitle>
        </CardHeader>
        <CardContent>
          {listedInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {invoicesLoading ? "Henter fakturaer…" : "Ingen fakturaer er hentet fra Fiken."}
            </p>
          ) : (
            <ul className="divide-y">
              {listedInvoices.map((invoice) => (
                <li key={invoice.invoiceId} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {invoice.invoiceNumber ? `Faktura ${invoice.invoiceNumber}` : `Id ${invoice.invoiceId}`}
                    </p>
                    <p className="text-muted-foreground">
                      {invoice.customerName}
                      {invoice.issueDate ? ` · ${invoice.issueDate}` : ""}
                      {invoice.ourReference ? ` · ${invoice.ourReference}` : ""}
                    </p>
                  </div>
                  <p className="font-medium">{formatNokFromOre(invoice.grossOre)}</p>
                </li>
              ))}
            </ul>
          )}
          {invoicePageCount > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={invoicePage === 0 || invoicesLoading}
                onClick={() => void loadInvoices(invoicePage - 1)}
              >
                Forrige
              </Button>
              <p className="text-sm text-muted-foreground">
                Side {invoicePage + 1} av {invoicePageCount}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={invoicePage + 1 >= invoicePageCount || invoicesLoading}
                onClick={() => void loadInvoices(invoicePage + 1)}
              >
                Neste
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sende faktura?</AlertDialogTitle>
            <AlertDialogDescription>
              Fakturaen opprettes i Fiken og {deliverySentence(delivery, customer?.name ?? "", customer?.email ?? "")}. En
              sendt faktura kan ikke slettes, bare krediteres.
              {totals ? ` Beløp å betale: ${formatNokFromOre(totals.grossOre)}.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Avbryt</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={(event) => { event.preventDefault(); void sendInvoice(); }}>
              {pending ? "Sender…" : "Send faktura"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LineEditor({
  line,
  index,
  products,
  canRemove,
  onChange,
  onProduct,
  onRemove,
}: {
  line: DraftLine;
  index: number;
  products: ProductSummary[];
  canRemove: boolean;
  onChange: (patch: Partial<DraftLine>) => void;
  onProduct: (productId: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border p-3 md:grid-cols-6">
      <div className="space-y-1.5 md:col-span-2">
        <Label>Vare eller tjeneste</Label>
        <Select value={line.productId || "none"} onValueChange={(value) => onProduct(value === "none" ? "" : value)}>
          <SelectTrigger aria-label={`Vare på linje ${index + 1}`}>
            <SelectValue placeholder="Fritekst" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Fritekst</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.productId} value={String(product.productId)}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <Label htmlFor={`beskrivelse-${line.key}`}>Beskrivelse</Label>
        <Input
          id={`beskrivelse-${line.key}`}
          value={line.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`antall-${line.key}`}>Antall</Label>
        <Input
          id={`antall-${line.key}`}
          inputMode="decimal"
          value={line.quantity}
          onChange={(event) => onChange({ quantity: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`pris-${line.key}`}>Nettopris</Label>
        <Input
          id={`pris-${line.key}`}
          inputMode="decimal"
          value={line.unitPriceNok}
          placeholder="-500"
          onChange={(event) => onChange({ unitPriceNok: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>MVA</Label>
        <Select value={line.vatType} onValueChange={(value) => onChange({ vatType: value as VatType })}>
          <SelectTrigger aria-label={`MVA på linje ${index + 1}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VAT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {VAT_LABEL[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end justify-between gap-3 md:col-span-5">
        <div className="space-y-1.5">
          <Label htmlFor={`konto-${line.key}`}>Inntektskonto</Label>
          <Input
            id={`konto-${line.key}`}
            className="w-28"
            value={line.incomeAccount}
            onChange={(event) => onChange({ incomeAccount: event.target.value })}
          />
        </div>
        {canRemove && (
          <Button type="button" variant="ghost" onClick={onRemove} aria-label={`Fjern linje ${index + 1}`}>
            <Trash2 className="h-4 w-4" />
            Fjern
          </Button>
        )}
      </div>
    </div>
  );
}

function deliverySentence(delivery: InvoiceDelivery, name: string, email: string): string {
  if (delivery === "ehf") return `sendes som EHF til ${name}`;
  if (delivery === "email_and_ehf") return `sendes på e-post til ${email} og som EHF til ${name}`;
  return `sendes på e-post til ${email}`;
}

function emptyLine(): DraftLine {
  return {
    key: crypto.randomUUID(),
    productId: "",
    description: "",
    quantity: "1",
    unitPriceNok: "",
    vatType: "HIGH",
    incomeAccount: "3000",
  };
}

function isoDate(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function sumLines(lines: DraftLine[]) {
  let netOre = 0;
  let vatOre = 0;
  let grossOre = 0;
  for (const line of lines) {
    const amounts = previewLine(line);
    if (!amounts) return null;
    netOre += amounts.netOre;
    vatOre += amounts.vatOre;
    grossOre += amounts.grossOre;
  }
  return { netOre, vatOre, grossOre };
}

function previewLine(line: DraftLine) {
  try {
    return lineAmounts(nokToOre(line.unitPriceNok), parseQuantity(line.quantity), line.vatType);
  } catch (error) {
    if (error instanceof InvoiceInputError) return null;
    throw error;
  }
}
