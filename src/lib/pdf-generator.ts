/**
 * PDF-generering med pdf-lib
 */

import { PDFDocument, rgb, StandardFonts, PDFPage } from "pdf-lib";
import QRCode from "qrcode";
import type { Template, Credential, Person, Course, CredentialType } from "@prisma/client";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { COMPETENCE_CODES, getCompetenceCode } from "./competence-codes";

export interface DocumentPayload {
  person: Pick<Person, "firstName" | "lastName" | "birthDate" | "profileImage" | "address" | "phone" | "email">;
  course: Pick<Course, "title" | "code" | "category" | "durationDays">;
  credential: Pick<Credential, "code" | "validFrom" | "validTo" | "type" | "competenceCodes">;
  completedAt: Date;
  location?: string;
  instructor?: string;
}

/**
 * Generer PDF-dokument fra mal og payload
 */
export async function generateDocument(
  template: Template & { variables: string[] },
  payload: DocumentPayload
): Promise<Uint8Array> {
  // Opprett nytt PDF-dokument
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4-størrelse i punkter
  const { width, height } = page.getSize();

  // Last inn fonter
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Farge
  const primaryColor = rgb(0.05, 0.3, 0.6); // Mørkeblå

  // Bakgrunn (lys grå ramme)
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: primaryColor,
    borderWidth: 2,
  });

  // Logo-område (placeholder)
  let yPosition = height - 100;

  // Tittel basert på template kind
  const title = getTitleForKind(template.kind);
  page.drawText(title, {
    x: width / 2 - (title.length * 12) / 2,
    y: yPosition,
    size: 28,
    font: fontBold,
    color: primaryColor,
  });

  yPosition -= 80;

  // Type-spesifikk visning
  const credentialType = payload.credential.type || "DOCUMENTED";
  const competenceCodes = Array.isArray(payload.credential.competenceCodes) 
    ? payload.credential.competenceCodes as string[]
    : [];

  if (credentialType === "CERTIFIED" && competenceCodes.length > 0) {
    page.drawText("SERTIFISERT KOMPETANSEBEVIS", {
      x: width / 2 - 120,
      y: yPosition,
      size: 16,
      font: fontBold,
      color: rgb(0, 0.5, 0),
    });
    yPosition -= 35;
  }

  // Person-info
  const personName = `${payload.person.firstName} ${payload.person.lastName}`;
  page.drawText("Dette bekrefter at", {
    x: width / 2 - 60,
    y: yPosition,
    size: 12,
    font,
  });

  yPosition -= 30;

  page.drawText(personName, {
    x: width / 2 - (personName.length * 9) / 2,
    y: yPosition,
    size: 20,
    font: fontBold,
    color: primaryColor,
  });
  
  // Fødselsdato og kontaktinfo
  yPosition -= 25;
  if (payload.person.birthDate) {
    const birthDateStr = `Født: ${format(new Date(payload.person.birthDate), "dd.MM.yyyy", { locale: nb })}`;
    page.drawText(birthDateStr, {
      x: width / 2 - (birthDateStr.length * 4),
      y: yPosition,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 15;
  }

  if (payload.person.email || payload.person.phone) {
    const contactInfo = [payload.person.email, payload.person.phone].filter(Boolean).join(" • ");
    page.drawText(contactInfo, {
      x: width / 2 - (contactInfo.length * 3.5),
      y: yPosition,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 15;
  }

  if (payload.person.address) {
    page.drawText(payload.person.address, {
      x: width / 2 - (payload.person.address.length * 3),
      y: yPosition,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 25;
  } else {
    yPosition -= 10;
  }

  yPosition -= 60;

  // Kurs-info
  page.drawText("har fullført", {
    x: width / 2 - 45,
    y: yPosition,
    size: 12,
    font,
  });

  yPosition -= 30;

  page.drawText(payload.course.title, {
    x: width / 2 - (payload.course.title.length * 7) / 2,
    y: yPosition,
    size: 16,
    font: fontBold,
  });

  yPosition -= 40;

  // Kurskode
  page.drawText(`Kurskode: ${payload.course.code}`, {
    x: width / 2 - 80,
    y: yPosition,
    size: 11,
    font,
  });

  yPosition -= 30;

  // Kategori
  page.drawText(`Kategori: ${payload.course.category}`, {
    x: width / 2 - 80,
    y: yPosition,
    size: 11,
    font,
  });

  yPosition -= 30;

  // Varighet
  page.drawText(`Varighet: ${payload.course.durationDays} dag(er)`, {
    x: width / 2 - 80,
    y: yPosition,
    size: 11,
    font,
  });

  yPosition -= 50;

  // Datoer
  const completedDate = format(payload.completedAt, "dd. MMMM yyyy", { locale: nb });
  page.drawText(`Fullført: ${completedDate}`, {
    x: width / 2 - 80,
    y: yPosition,
    size: 11,
    font,
  });

  yPosition -= 25;

  if (payload.credential.validTo) {
    const validToDate = format(new Date(payload.credential.validTo), "dd. MMMM yyyy", { locale: nb });
    page.drawText(`Gyldig til: ${validToDate}`, {
      x: width / 2 - 80,
      y: yPosition,
      size: 11,
      font,
      color: rgb(0.8, 0, 0), // Rød for utløpsdato
    });
  } else {
    page.drawText(`Gyldig: Ingen utløpsdato`, {
      x: width / 2 - 80,
      y: yPosition,
      size: 11,
      font,
      color: rgb(0, 0.6, 0), // Grønn for "ingen utløp"
    });
  }

  yPosition -= 50;

  // Credential code
  page.drawText(`Bevis-ID: ${payload.credential.code}`, {
    x: width / 2 - 80,
    y: yPosition,
    size: 10,
    font,
  });

  yPosition -= 40;

  // QR-kode
  try {
    const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify/${payload.credential.code}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 120,
      margin: 1,
    });

    // Konverter data URL til bytes
    const qrImageBytes = Buffer.from(
      qrCodeDataUrl.split(",")[1],
      "base64"
    );

    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    const qrDims = qrImage.scale(0.8);

    page.drawImage(qrImage, {
      x: width / 2 - qrDims.width / 2,
      y: yPosition - qrDims.height,
      width: qrDims.width,
      height: qrDims.height,
    });

    yPosition -= qrDims.height + 15;

    // QR tekst
    page.drawText("Scan for å verifisere", {
      x: width / 2 - 65,
      y: yPosition,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  } catch (error) {
    console.error("Feil ved generering av QR-kode:", error);
  }

  // Bunntekst
  page.drawText("KKS AS", {
    x: 60,
    y: 60,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Dato for utstedelse
  const issuedDate = format(new Date(), "dd.MM.yyyy");
  page.drawText(`Utstedt: ${issuedDate}`, {
    x: width - 150,
    y: 60,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Generer PDF bytes
  return await pdfDoc.save();
}

/**
 * Hent tittel basert på template kind
 */
function getTitleForKind(kind: string): string {
  switch (kind) {
    case "DIPLOMA":
      return "DIPLOM";
    case "TEMP_CERT":
      return "MIDLERTIDIG SERTIFIKAT";
    case "CERTIFICATE":
      return "KURSBEVIS";
    case "CARD":
      return "KOMPETANSEKORT";
    default:
      return "KOMPETANSEBEVIS";
  }
}

/**
 * Generer QR-kode som base64
 */
export async function generateQRCode(data: string): Promise<string> {
  return await QRCode.toDataURL(data, {
    width: 200,
    margin: 2,
  });
}

