import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const callbackSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  reason: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = callbackSchema.parse(body);

    await db.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        source: "CHATBOT_CALLBACK",
        status: "NEW",
        notes: `Ring tilbake-forespørsel fra chatbot.\n\nGjelder: ${data.reason}\nTelefon: ${data.phone}\nNavn: ${data.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Ugyldig informasjon" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Noe gikk galt" },
      { status: 500 }
    );
  }
}
