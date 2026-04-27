import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { checkFormRateLimit, getApiRouteIp } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(2),
  message: z.string().min(10),
  gdprConsent: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const ip = getApiRouteIp(req);
    const limit = checkFormRateLimit(ip, "contact");
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: limit.message },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = schema.parse(body);

    const adminEmail = process.env.ADMIN_EMAIL || "post@kksas.no";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>";

    const { error } = await resend.emails.send({
      from: fromEmail,
      replyTo: validated.email,
      to: [adminEmail],
      subject: `📬 Kontaktskjema: ${validated.subject}`,
      html: `
        <h2>Ny henvendelse via kontaktskjema</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 12px;font-weight:bold">Navn</td><td style="padding:6px 12px">${validated.firstName} ${validated.lastName}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">E-post</td><td style="padding:6px 12px"><a href="mailto:${validated.email}">${validated.email}</a></td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">Telefon</td><td style="padding:6px 12px">${validated.phone || "–"}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">Bedrift</td><td style="padding:6px 12px">${validated.company || "–"}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold">Emne</td><td style="padding:6px 12px">${validated.subject}</td></tr>
          <tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top">Melding</td><td style="padding:6px 12px;white-space:pre-line">${validated.message}</td></tr>
        </table>
      `,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: "Kunne ikke sende melding" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Ugyldig input" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "En uventet feil oppstod" },
      { status: 500 }
    );
  }
}
