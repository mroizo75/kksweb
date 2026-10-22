import { NextResponse } from "next/server";
import { ourReferenceFromSession, requireStaff, toErrorResponse } from "@/lib/integrations/fiken/access";
import { getFikenClient } from "@/lib/integrations/fiken/client";
import { toInvoiceSummary } from "@/lib/integrations/fiken/map";
import { createInvoiceSchema, toInvoiceDraft } from "@/lib/integrations/fiken/schemas";
import { buildSendInvoiceRequest } from "@/lib/integrations/fiken/send";

/** Lister de siste fakturaene fra Fiken. */
export async function GET() {
  const guard = await requireStaff();
  if (guard.response) return guard.response;

  try {
    const client = await getFikenClient();
    const invoices = await client.listInvoices();
    return NextResponse.json({
      invoices: invoices.flatMap((invoice) => {
        const summary = toInvoiceSummary(invoice);
        return summary ? [summary] : [];
      }),
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
