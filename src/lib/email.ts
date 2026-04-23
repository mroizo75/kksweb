import { Resend } from "resend";
import { EnrollmentConfirmationEmail } from "@/emails/EnrollmentConfirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EnrollmentEmailData {
  personName: string;
  email: string;
  courseName: string;
  courseDate: string;
  courseTime: string;
  location: string;
  duration: string;
}

export async function sendEnrollmentConfirmation(data: EnrollmentEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>",
      replyTo: process.env.RESEND_REPLY_TO || "post@kksas.no",
      to: [data.email],
      subject: `Påmeldingsbekreftelse - ${data.courseName}`,
      react: EnrollmentConfirmationEmail(data),
    });

    if (error) {
      console.error("Feil ved sending av e-post:", error);
      throw new Error("Kunne ikke sende e-post");
    }

    return emailData;
  } catch (error) {
    console.error("Uventet feil ved sending av e-post:", error);
    throw error;
  }
}

export async function sendEnrollmentReminder(data: EnrollmentEmailData) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>",
      replyTo: process.env.RESEND_REPLY_TO || "post@kksas.no",
      to: [data.email],
      subject: `Påminnelse: ${data.courseName} starter snart!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <div style="background-color: #0e4fa8; padding: 32px 40px; text-align: center;">
            <img src="${BASE_URL}/logo-white-kks.png" width="160" alt="KKS AS" style="margin: 0 auto;" />
          </div>

          <!-- Reminder banner -->
          <div style="background-color: #fef3c7; border-bottom: 1px solid #fde68a; padding: 16px 40px; text-align: center;">
            <p style="color: #92400e; font-size: 16px; font-weight: 600; margin: 0;">Kurset ditt starter om 3 dager!</p>
          </div>

          <!-- Content -->
          <div style="padding: 32px 40px;">
            <p style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">Hei ${data.personName},</p>

            <p style="color: #4b5563; font-size: 15px; line-height: 26px; margin: 0 0 24px 0;">
              Dette er en vennlig påminnelse om at kurset ditt starter snart. Sørg for at du er klar!
            </p>

            <!-- Course details -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; margin: 0 0 24px 0;">
              <p style="color: #0e4fa8; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">Kursdetaljer</p>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #6b7280; font-size: 14px; padding: 8px 0; width: 110px; vertical-align: top;">Kurs</td>
                  <td style="color: #111827; font-size: 15px; font-weight: 600; padding: 8px 0;">${data.courseName}</td>
                </tr>
                <tr><td colspan="2" style="border-bottom: 1px solid #e5e7eb;"></td></tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px; padding: 8px 0; vertical-align: top;">Dato</td>
                  <td style="color: #111827; font-size: 15px; font-weight: 600; padding: 8px 0;">${data.courseDate}</td>
                </tr>
                <tr><td colspan="2" style="border-bottom: 1px solid #e5e7eb;"></td></tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px; padding: 8px 0; vertical-align: top;">Tidspunkt</td>
                  <td style="color: #111827; font-size: 15px; font-weight: 600; padding: 8px 0;">${data.courseTime}</td>
                </tr>
                <tr><td colspan="2" style="border-bottom: 1px solid #e5e7eb;"></td></tr>
                <tr>
                  <td style="color: #6b7280; font-size: 14px; padding: 8px 0; vertical-align: top;">Sted</td>
                  <td style="color: #111827; font-size: 15px; font-weight: 600; padding: 8px 0;">${data.location}</td>
                </tr>
              </table>
            </div>

            <!-- Checklist -->
            <p style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">Husk å ta med</p>
            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 20px 24px; margin: 0 0 24px 0;">
              <table style="width: 100%;">
                <tr>
                  <td style="color: #0e4fa8; font-size: 18px; width: 28px; vertical-align: top; padding: 6px 0;">&#9745;</td>
                  <td style="color: #374151; font-size: 14px; line-height: 22px; padding: 6px 0;"><strong>Gyldig legitimasjon</strong><br/><span style="color: #6b7280; font-size: 13px;">Førerkort, pass eller bankkort med bilde</span></td>
                </tr>
                <tr><td colspan="2" style="border-bottom: 1px solid #fde68a; padding: 4px 0;"></td></tr>
                <tr>
                  <td style="color: #0e4fa8; font-size: 18px; width: 28px; vertical-align: top; padding: 6px 0;">&#9745;</td>
                  <td style="color: #374151; font-size: 14px; line-height: 22px; padding: 6px 0;"><strong>Behagelige arbeidsklær</strong><br/><span style="color: #6b7280; font-size: 13px;">Lange bukser og lukkede sko (vernesko anbefales)</span></td>
                </tr>
                <tr><td colspan="2" style="border-bottom: 1px solid #fde68a; padding: 4px 0;"></td></tr>
                <tr>
                  <td style="color: #0e4fa8; font-size: 18px; width: 28px; vertical-align: top; padding: 6px 0;">&#9745;</td>
                  <td style="color: #374151; font-size: 14px; line-height: 22px; padding: 6px 0;"><strong>Mat og drikke</strong><br/><span style="color: #6b7280; font-size: 13px;">Ta med lunsj og drikke. Det finnes kjøpemuligheter i nærheten.</span></td>
                </tr>
              </table>
            </div>

            <p style="color: #4b5563; font-size: 15px; line-height: 26px; margin: 0 0 24px 0;">
              Har du spørsmål? Ta kontakt med oss — vi hjelper deg gjerne!
            </p>

            <table style="width: 100%; text-align: center; margin: 0 0 8px 0;">
              <tr>
                <td style="padding: 0 12px;"><a href="tel:+4791540824" style="color: #0e4fa8; font-size: 15px; font-weight: 600; text-decoration: none;">+47 91 54 08 24</a></td>
                <td style="padding: 0 12px;"><a href="mailto:post@kksas.no" style="color: #0e4fa8; font-size: 15px; font-weight: 600; text-decoration: none;">post@kksas.no</a></td>
              </tr>
            </table>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 28px 40px; text-align: center;">
            <img src="${BASE_URL}/logo-black-kks.png" width="100" alt="KKS AS" style="margin: 0 auto 12px auto; opacity: 0.7;" />
            <p style="color: #9ca3af; font-size: 12px; line-height: 20px; margin: 0 0 12px 0;">
              Kurs og Kompetansesystemer AS<br/>Org.nr: 925 897 019<br/>Frøbergvegen 71, 2320 Furnes
            </p>
            <p style="margin: 0; font-size: 12px;">
              <a href="${BASE_URL}" style="color: #0a3d82; text-decoration: underline;">kksas.no</a>
              &middot;
              <a href="${BASE_URL}/personvern" style="color: #0a3d82; text-decoration: underline;">Personvern</a>
              &middot;
              <a href="${BASE_URL}/vilkar" style="color: #0a3d82; text-decoration: underline;">Vilkår</a>
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      throw new Error(error.message);
    }

    return emailData;
  } catch (error) {
    throw error;
  }
}

// Admin notifikasjon for ny påmelding
export interface EnrollmentNotificationData {
  personName: string;
  personEmail: string;
  personPhone: string;
  courseName: string;
  courseDate: string;
  courseTime: string;
  location: string;
  enrollmentType: "person" | "company";
  companyName?: string;
  status: "CONFIRMED" | "WAITLIST";
}

export async function sendEnrollmentNotification(data: EnrollmentNotificationData) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "post@kksas.no";
    
    const statusText = data.status === "WAITLIST" ? "⏳ VENTELISTE" : "✅ BEKREFTET";
    const statusColor = data.status === "WAITLIST" ? "#f59e0b" : "#10b981";
    
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>",
      replyTo: data.personEmail,
      to: [adminEmail],
      subject: `${statusText} - Ny påmelding til ${data.courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${statusColor}; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0; color: white;">${statusText}</h2>
            <p style="margin: 5px 0 0 0; color: white; font-size: 14px;">Ny kurspåmelding mottatt</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 5px 5px;">
            <h3 style="color: #111827; margin-top: 0;">Kursdetaljer</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Kurs:</td>
                <td style="padding: 8px 0; color: #111827;">${data.courseName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Dato:</td>
                <td style="padding: 8px 0; color: #111827;">${data.courseDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Tid:</td>
                <td style="padding: 8px 0; color: #111827;">${data.courseTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Sted:</td>
                <td style="padding: 8px 0; color: #111827;">${data.location}</td>
              </tr>
            </table>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

            <h3 style="color: #111827; margin-bottom: 10px;">Deltaker</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Navn:</td>
                <td style="padding: 8px 0; color: #111827;">${data.personName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">E-post:</td>
                <td style="padding: 8px 0; color: #111827;">
                  <a href="mailto:${data.personEmail}" style="color: #3b82f6;">${data.personEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Telefon:</td>
                <td style="padding: 8px 0; color: #111827;">
                  <a href="tel:${data.personPhone}" style="color: #3b82f6;">${data.personPhone}</a>
                </td>
              </tr>
              ${data.companyName ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Bedrift:</td>
                <td style="padding: 8px 0; color: #111827;">${data.companyName}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Type:</td>
                <td style="padding: 8px 0; color: #111827;">${data.enrollmentType === "company" ? "Bedriftspåmelding" : "Privatperson"}</td>
              </tr>
            </table>

            ${data.status === "WAITLIST" ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Venteliste</p>
                <p style="margin: 5px 0 0 0; color: #78350f; font-size: 14px;">
                  Kurset er fullt. Deltakeren er satt på venteliste.
                </p>
              </div>
            ` : ''}

            <div style="margin-top: 30px; padding: 15px; background-color: white; border: 1px solid #e5e7eb; border-radius: 5px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                <strong>Logg inn i admin-panelet for å se alle detaljer:</strong>
              </p>
              <a href="${process.env.NEXTAUTH_URL}/admin/pameldinger" 
                 style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 600;">
                Se påmeldinger
              </a>
            </div>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              Dette er en automatisk notifikasjon fra KKS Kurssystem.
              <br/>
              Svar på denne e-posten går direkte til deltakeren.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Feil ved sending av admin-notifikasjon:", error);
      // Ikke kast feil - vi vil ikke at påmeldingen skal feile hvis admin-e-post feiler
      return null;
    }

    return emailData;
  } catch (error) {
    console.error("Uventet feil ved sending av admin-notifikasjon:", error);
    return null;
  }
}

// CRM E-post funksjoner

export interface ActivityEmailData {
  to: string;
  subject: string;
  content: string;
  fromName?: string;
}

export async function sendActivityEmail(data: ActivityEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_CRM_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "KKS CRM <crm@innut.no>",
      replyTo: process.env.RESEND_REPLY_TO || "post@kksas.no",
      to: [data.to],
      subject: data.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${data.subject}</h2>
          <div style="white-space: pre-wrap; color: #666; line-height: 1.6;">
            ${data.content}
          </div>
          ${data.fromName ? `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999;">
              <p>Med vennlig hilsen,<br/>${data.fromName}<br/>KKS AS</p>
            </div>
          ` : ''}
        </div>
      `,
    });

    if (error) {
      console.error("Feil ved sending av CRM e-post:", error);
      throw new Error("Kunne ikke sende e-post");
    }

    return emailData;
  } catch (error) {
    console.error("Uventet feil ved sending av CRM e-post:", error);
    throw error;
  }
}

export interface RenewalReminderData {
  personName: string;
  email: string;
  courseName: string;
  expiryDate: string;
  renewalLink: string;
}

export async function sendRenewalReminder(data: RenewalReminderData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>",
      replyTo: process.env.RESEND_REPLY_TO || "post@kksas.no",
      to: [data.email],
      subject: `Påminnelse: ${data.courseName} utløper snart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hei ${data.personName}</h2>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Dette er en påminnelse om at ditt kurs <strong>${data.courseName}</strong> utløper ${data.expiryDate}.
          </p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            For å fornye kurset, vennligst meld deg på et nytt kurs:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.renewalLink}" style="background-color: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Forny kurs
            </a>
          </div>
          <p style="font-size: 14px; color: #999;">
            Hvis du har spørsmål, ta kontakt med oss.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>Med vennlig hilsen,<br/>KKS AS</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Feil ved sending av fornyelsespåminnelse:", error);
      throw new Error("Kunne ikke sende påminnelse");
    }

    return emailData;
  } catch (error) {
    console.error("Uventet feil ved sending av fornyelsespåminnelse:", error);
    throw error;
  }
}

// ============================================
// BEDRIFTSTILBUD E-POST
// ============================================

export interface BedriftKontaktData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  employees: string;
  courseType: string;
  message?: string;
}

export async function sendBedriftKontaktConfirmation(data: BedriftKontaktData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>",
      replyTo: process.env.RESEND_REPLY_TO || "post@kksas.no",
      to: [data.email],
      subject: "Takk for din henvendelse - KKS AS",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Takk for din henvendelse!</h2>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Hei ${data.contactPerson},
          </p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Vi har mottatt din forespørsel om kursløsning for <strong>${data.companyName}</strong>.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Din forespørsel:</h3>
            <p style="margin: 5px 0;"><strong>Bedrift:</strong> ${data.companyName}</p>
            <p style="margin: 5px 0;"><strong>Antall deltakere:</strong> ${data.employees}</p>
            <p style="margin: 5px 0;"><strong>Ønsket kurs:</strong> ${data.courseType}</p>
            ${data.message ? `<p style="margin: 5px 0;"><strong>Melding:</strong> ${data.message}</p>` : ''}
          </div>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            En av våre rådgivere vil ta kontakt med deg innen 1-2 virkedager for en uforpliktende samtale.
          </p>
          <p style="font-size: 14px; color: #999;">
            Hvis du har spørsmål i mellomtiden, kan du ringe oss på telefon eller svare på denne e-posten.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>Med vennlig hilsen,<br/>KKS AS</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Feil ved sending av bedriftskontakt-bekreftelse:", error);
      throw new Error("Kunne ikke sende bekreftelse");
    }

    return emailData;
  } catch (error) {
    console.error("Uventet feil ved sending av bedriftskontakt-bekreftelse:", error);
    throw error;
  }
}

export async function sendBedriftKontaktNotification(data: BedriftKontaktData) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "post@kksas.no";
    
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>",
      replyTo: data.email,
      to: [adminEmail],
      subject: `Ny bedriftsforespørsel fra ${data.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Ny bedriftsforespørsel</h2>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            En ny bedrift har sendt forespørsel om kurs.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Detaljer:</h3>
            <p style="margin: 5px 0;"><strong>Bedrift:</strong> ${data.companyName}</p>
            <p style="margin: 5px 0;"><strong>Kontaktperson:</strong> ${data.contactPerson}</p>
            <p style="margin: 5px 0;"><strong>E-post:</strong> ${data.email}</p>
            <p style="margin: 5px 0;"><strong>Telefon:</strong> ${data.phone}</p>
            <p style="margin: 5px 0;"><strong>Antall deltakere:</strong> ${data.employees}</p>
            <p style="margin: 5px 0;"><strong>Ønsket kurs:</strong> ${data.courseType}</p>
            ${data.message ? `<p style="margin: 5px 0;"><strong>Melding:</strong> ${data.message}</p>` : ''}
          </div>
          <p style="font-size: 14px; color: #666;">
            Logg inn i CRM for å følge opp denne henvendelsen.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Feil ved sending av admin-notifikasjon:", error);
      // Ikke kast feil her - vi vil ikke at hele forespørselen skal feile
      return null;
    }

    return emailData;
  } catch (error) {
    console.error("Uventet feil ved sending av admin-notifikasjon:", error);
    return null;
  }
}

// ============================================
// LISENS E-POST
// ============================================

export interface LicenseExpiryWarningData {
  companyName: string;
  email: string;
  daysUntilExpiry: number;
  expiryDate: string;
  contactEmail: string;
}

export async function sendLicenseExpiryWarning(data: LicenseExpiryWarningData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>",
      replyTo: process.env.RESEND_REPLY_TO || "post@kksas.no",
      to: [data.email],
      subject: `Viktig: Din lisens utløper om ${data.daysUntilExpiry} dager`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #92400e; margin: 0;">⚠️ Lisens utløper snart</h2>
          </div>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Hei fra KKS AS,
          </p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Dette er en påminnelse om at lisensen for <strong>${data.companyName}</strong> utløper om <strong>${data.daysUntilExpiry} dager</strong> (${data.expiryDate}).
          </p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            For å unngå avbrudd i tjenesten, vennligst forny lisensen så snart som mulig.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Hva skjer hvis lisensen utløper?</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li>14 dagers nådeperiode før full suspensjon</li>
              <li>Alle ansatte mister tilgang til systemet etter nådeperioden</li>
              <li>Kurspåmeldinger og kompetansebevis blir utilgjengelige</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; color: #666;">
              Ta kontakt med oss for å fornye lisensen:
            </p>
            <p style="font-size: 18px; color: #0070f3;">
              <a href="mailto:${data.contactEmail}" style="color: #0070f3;">${data.contactEmail}</a>
            </p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>Med vennlig hilsen,<br/>KKS AS</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Feil ved sending av lisensvarsel:", error);
      throw new Error("Kunne ikke sende lisensvarsel");
    }

    return emailData;
  } catch (error) {
    console.error("Uventet feil ved sending av lisensvarsel:", error);
    throw error;
  }
}

export interface LicenseSuspendedData {
  companyName: string;
  email: string;
  reason: string;
  contactEmail: string;
}

export async function sendLicenseSuspended(data: LicenseSuspendedData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>",
      replyTo: process.env.RESEND_REPLY_TO || "post@kksas.no",
      to: [data.email],
      subject: `Viktig: Lisens suspendert for ${data.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #991b1b; margin: 0;">🚫 Lisens suspendert</h2>
          </div>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Hei fra KKS AS,
          </p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Lisensen for <strong>${data.companyName}</strong> har blitt suspendert.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Årsak:</strong></p>
            <p style="margin: 10px 0 0 0; color: #666;">${data.reason}</p>
          </div>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Dette betyr at alle ansatte i bedriften nå har mistet tilgang til systemet.
          </p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            For å reaktivere lisensen, vennligst ta kontakt med oss så snart som mulig.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; color: #0070f3;">
              <a href="mailto:${data.contactEmail}" style="color: #0070f3;">${data.contactEmail}</a>
            </p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>Med vennlig hilsen,<br/>KKS AS</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Feil ved sending av suspensjonsvarsling:", error);
      throw new Error("Kunne ikke sende suspensjonsvarsling");
    }

    return emailData;
  } catch (error) {
    console.error("Uventet feil ved sending av suspensjonsvarsling:", error);
    throw error;
  }
}

export interface LicenseResumedData {
  companyName: string;
  email: string;
  newExpiryDate: string;
}

// ============================================
// DIPLOM E-POST
// ============================================

export interface DiplomaEmailData {
  personName: string;
  email: string;
  courseName: string;
  completedDate: string;
  pdfBytes: Uint8Array;
}

export async function sendDiplomaEmail(data: DiplomaEmailData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>",
      replyTo: process.env.RESEND_REPLY_TO || "post@kksas.no",
      to: [data.email],
      subject: `Diplom – ${data.courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #0e4fa8; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 4px;">DIPLOM</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #374151; margin: 0 0 8px 0;">Hei ${data.personName},</p>
            <p style="font-size: 16px; color: #374151; line-height: 1.7; margin: 0 0 24px 0;">
              Gratulerer! Vi er glade for å kunne dele ut ditt diplom for å ha fullført
              <strong>${data.courseName}</strong> den ${data.completedDate}.
            </p>
            <p style="font-size: 15px; color: #6b7280;">
              Diplomet er vedlagt denne e-posten som PDF.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 13px; color: #9ca3af; margin: 0;">
              Med vennlig hilsen,<br/>KKS AS
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `diplom-${data.courseName.replace(/\s+/g, "-").toLowerCase()}.pdf`,
          content: Buffer.from(data.pdfBytes),
        },
      ],
    });

    if (error) {
      throw new Error(error.message);
    }

    return emailData;
  } catch (error) {
    throw error;
  }
}

export async function sendLicenseResumed(data: LicenseResumedData) {
  try {
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KKS Kurs <kurs@innut.no>",
      replyTo: process.env.RESEND_REPLY_TO || "post@kksas.no",
      to: [data.email],
      subject: `Lisens reaktivert for ${data.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dcfce7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h2 style="color: #166534; margin: 0;">✅ Lisens reaktivert</h2>
          </div>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Hei fra KKS AS,
          </p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Gode nyheter! Lisensen for <strong>${data.companyName}</strong> har blitt reaktivert.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Ny utløpsdato:</strong> ${data.newExpiryDate}</p>
          </div>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Alle ansatte har nå tilgang til systemet igjen.
          </p>
          <p style="font-size: 14px; color: #999;">
            Takk for at du er kunde hos oss!
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>Med vennlig hilsen,<br/>KKS AS</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Feil ved sending av reaktiveringsvarsling:", error);
      throw new Error("Kunne ikke sende reaktiveringsvarsling");
    }

    return emailData;
  } catch (error) {
    console.error("Uventet feil ved sending av reaktiveringsvarsling:", error);
    throw error;
  }
}

