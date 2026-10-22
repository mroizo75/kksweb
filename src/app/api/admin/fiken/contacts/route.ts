import { NextResponse } from "next/server";
import { requireStaff, toErrorResponse } from "@/lib/integrations/fiken/access";
import { getFikenClient } from "@/lib/integrations/fiken/client";
import { toContactSummary } from "@/lib/integrations/fiken/map";
import { createContactSchema, toContactWrite } from "@/lib/integrations/fiken/schemas";

/** Lister kundekontakter fra Fiken. */
export async function GET() {
  const guard = await requireStaff();
  if (guard.response) return guard.response;

  try {
    const client = await getFikenClient();
    const contacts = await client.listContacts();
    return NextResponse.json({
      contacts: contacts.flatMap((contact) => {
        const summary = toContactSummary(contact);
        return summary ? [summary] : [];
      }),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Oppretter en kunde i Fiken. */
export async function POST(request: Request) {
  const guard = await requireStaff();
  if (guard.response) return guard.response;

  try {
    const input = createContactSchema.parse(await request.json());
    const client = await getFikenClient();
    const contact = await client.createContact(toContactWrite(input));
    const summary = toContactSummary(contact);
    if (!summary) {
      return NextResponse.json(
        { code: "fiken_error", message: "Fiken opprettet kunden, men svaret kunne ikke leses" },
        { status: 502 }
      );
    }
    return NextResponse.json({ contact: summary }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
