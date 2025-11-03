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
  // TODO: Implementeres i Fase 2
  console.log("Påminnelse vil bli sendt til:", data.email);
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

