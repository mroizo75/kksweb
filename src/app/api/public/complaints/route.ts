import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const customerComplaintSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  category: z.enum(["COURSE", "SERVICE", "DOCUMENTATION", "EQUIPMENT", "INSTRUCTOR", "OTHER"]),
  title: z.string().min(3),
  description: z.string().min(20),
  occurredAt: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = customerComplaintSchema.parse(body);

    const refNumber = `KLG-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS <post@kksas.no>",
      to: [process.env.COMPLAINTS_EMAIL || "post@kksas.no"],
      subject: `Ny kundeklage: ${validated.title}`,
      text: `
Referanse: ${refNumber}
Kategori: ${validated.category}
Dato: ${validated.occurredAt}

Kundeinfo:
- Navn: ${validated.name}
- E-post: ${validated.email}
- Telefon: ${validated.phone || "ikke oppgitt"}
- Bedrift: ${validated.company || "ikke oppgitt"}

Beskrivelse:
${validated.description}
      `.trim(),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      refNumber,
      message: "Klage mottatt",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Ugyldig data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Kunne ikke opprette klage" }, { status: 500 });
  }
}
