import { NextResponse } from "next/server";
import { ourReferenceFromSession, requireStaff, toErrorResponse } from "@/lib/integrations/fiken/access";
import { getFikenClient, INVOICE_PAGE_SIZE } from "@/lib/integrations/fiken/client";
import { toInvoiceSummary } from "@/lib/integrations/fiken/map";
import { createInvoiceSchema, toInvoiceDraft } from "@/lib/integrations/fiken/schemas";
import { buildSendInvoiceRequest } from "@/lib/integrations/fiken/send";

/** Lister fakturaer fra Fiken, 10 om gangen, nyeste først. */
export async function GET(request: Request) {
  const guard = await requireStaff();
  if (guard.response) return guard.response;

  try {
    const pageParam = new URL(request.url).searchParams.get("page") ?? "0";
    const page = /^\d+$/.test(pageParam) ? Number(pageParam) : 0;
    const client = await getFikenClient();
    const result = await client.listInvoices(page);
    return NextResponse.json({
      invoices: result.invoices.flatMap((invoice) => {
        const summary = toInvoiceSummary(invoice);
        return summary ? [summary] : [];
      }),
      page: result.page,
      pageSize: INVOICE_PAGE_SIZE,
      pageCount: result.pageCount,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * Oppretter faktura i Fiken og sender den på e-post, EHF eller begge.
 * Hvis utsending feiler etter opprettelse, returneres fakturanummeret slik at den ikke lages på nytt.
 */
export async function POST(request: Request) {
  const guard = await requireStaff();
  if (guard.response) return guard.response;

  try {
    const input = createInvoiceSchema.parse(await request.json());
    const draft = toInvoiceDraft(input, ourReferenceFromSession(guard.session));
    const client = await getFikenClient();
    const invoice = await client.createInvoice(draft);

    try {
      await client.sendInvoice(
        buildSendInvoiceRequest({
          invoiceId: invoice.invoiceId,
          delivery: input.delivery,
          recipientName: input.recipientName,
          recipientEmail: input.recipientEmail,
          message: input.message,
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ukjent feil";
      return NextResponse.json(
        {
          code: "send_failed",
          message: `Faktura ${invoice.invoiceNumber ?? invoice.invoiceId} er opprettet i Fiken, men ble ikke sendt: ${message}`,
          invoice: toInvoiceSummary(invoice),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ invoice: toInvoiceSummary(invoice) }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
