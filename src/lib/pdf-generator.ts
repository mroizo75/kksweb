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

export interface DiplomaPayload {
  personName: string;
  courseName: string;
  completedDate: Date;
  bodyText?: string;
  instructor?: string;
}

function wrapText(
  text: string,
  maxWidth: number,
  font: ReturnType<typeof Object.create>,
  fontSize: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Generer et representativt diploma-PDF
 */
export async function generateDiplomaPdf(payload: DiplomaPayload): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Liggende A4
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontSans = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const navy = rgb(0.04, 0.18, 0.42);
  const gold = rgb(0.72, 0.57, 0.1);
  const lightGold = rgb(0.9, 0.82, 0.45);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const midGray = rgb(0.45, 0.45, 0.45);
  const lightBg = rgb(0.98, 0.97, 0.94);

  // Bakgrunn
  page.drawRectangle({ x: 0, y: 0, width, height, color: lightBg });

  // Ytre ramme – tykk navy
  page.drawRectangle({
    x: 18, y: 18,
    width: width - 36, height: height - 36,
    borderColor: navy, borderWidth: 4,
  });

  // Indre ramme – tynn gull
  page.drawRectangle({
    x: 26, y: 26,
    width: width - 52, height: height - 52,
    borderColor: gold, borderWidth: 1.5,
  });

  // Toppbanner – navy bakgrunn
  const bannerH = 80;
  page.drawRectangle({
    x: 18, y: height - 18 - bannerH,
    width: width - 36, height: bannerH,
    color: navy,
  });

  // KKS AS – logo-tekst i banner
  const logoText = "KKS AS";
  const logoW = fontSansBold.widthOfTextAtSize(logoText, 22);
  page.drawText(logoText, {
    x: (width - logoW) / 2,
    y: height - 18 - bannerH + 42,
    size: 22, font: fontSansBold, color: lightGold,
  });

  const tagline = "Kurs og Kompetanse";
  const tagW = fontSans.widthOfTextAtSize(tagline, 10);
  page.drawText(tagline, {
    x: (width - tagW) / 2,
    y: height - 18 - bannerH + 24,
    size: 10, font: fontSans, color: rgb(0.8, 0.8, 0.8),
  });

  // Gullstripe under banner
  page.drawRectangle({
    x: 18, y: height - 18 - bannerH - 5,
    width: width - 36, height: 5,
    color: gold,
  });

  let y = height - 18 - bannerH - 50;

  // DIPLOM tittel
  const diplomTxt = "D I P L O M";
  const diplomW = fontBold.widthOfTextAtSize(diplomTxt, 38);
  page.drawText(diplomTxt, {
    x: (width - diplomW) / 2, y,
    size: 38, font: fontBold, color: navy,
  });

  y -= 28;

  // Dekorativ linje under tittelen
  const lineX1 = (width - 260) / 2;
  const lineX2 = (width + 260) / 2;
  page.drawLine({ start: { x: lineX1, y }, end: { x: lineX2, y }, thickness: 2, color: gold });
  page.drawLine({ start: { x: lineX1 + 10, y: y - 4 }, end: { x: lineX2 - 10, y: y - 4 }, thickness: 0.5, color: gold });

  y -= 32;

  const herbyTxt = "Dette bekrefter at";
  const herbyW = fontItalic.widthOfTextAtSize(herbyTxt, 13);
  page.drawText(herbyTxt, {
    x: (width - herbyW) / 2, y,
    size: 13, font: fontItalic, color: midGray,
  });

  y -= 40;

  // Navn – fremhevet
  const nameSize = Math.min(32, 32 - Math.max(0, payload.personName.length - 20) * 0.5);
  const nameW = fontBold.widthOfTextAtSize(payload.personName, nameSize);
  page.drawText(payload.personName, {
    x: (width - nameW) / 2, y,
    size: nameSize, font: fontBold, color: navy,
  });

  y -= 14;

  // Underline under navn
  page.drawLine({
    start: { x: (width - nameW) / 2, y },
    end: { x: (width + nameW) / 2, y },
    thickness: 1.5, color: gold,
  });

  y -= 28;

  // Brødtekst fra mal (eller standardtekst)
  const bodyText = payload.bodyText?.trim() || "har fullført og bestått kurset";
  const bodyLines = wrapText(bodyText, 600, fontItalic, 13);
  for (const line of bodyLines) {
    const lw = fontItalic.widthOfTextAtSize(line, 13);
    page.drawText(line, {
      x: (width - lw) / 2, y,
      size: 13, font: fontItalic, color: darkGray,
    });
    y -= 19;
  }

  y -= 12;

  // Kursboks
  const boxW = Math.min(500, fontBold.widthOfTextAtSize(payload.courseName, 18) + 60);
  const boxX = (width - boxW) / 2;
  page.drawRectangle({
    x: boxX, y: y - 14,
    width: boxW, height: 36,
    color: navy,
    borderColor: gold, borderWidth: 1,
  });
  const courseW = fontBold.widthOfTextAtSize(payload.courseName, 18);
  page.drawText(payload.courseName, {
    x: (width - courseW) / 2, y: y - 6,
    size: 18, font: fontBold, color: rgb(1, 1, 1),
  });

  y -= 50;

  // Dato
  const dateStr = format(payload.completedDate, "dd. MMMM yyyy", { locale: nb });
  const dateTxt = `Fullført: ${dateStr}`;
  const dateW = font.widthOfTextAtSize(dateTxt, 12);
  page.drawText(dateTxt, {
    x: (width - dateW) / 2, y,
    size: 12, font, color: midGray,
  });

  y -= 52;

  // Signaturlinje
  const sigY = y;
  const leftSigX = width / 2 - 160;
  const rightSigX = width / 2 + 30;
  const sigLineLen = 130;

  page.drawLine({ start: { x: leftSigX, y: sigY }, end: { x: leftSigX + sigLineLen, y: sigY }, thickness: 1, color: midGray });
  page.drawLine({ start: { x: rightSigX, y: sigY }, end: { x: rightSigX + sigLineLen, y: sigY }, thickness: 1, color: midGray });

  if (payload.instructor) {
    const instrW = fontSans.widthOfTextAtSize(payload.instructor, 9);
    page.drawText(payload.instructor, {
      x: leftSigX + (sigLineLen - instrW) / 2, y: sigY - 13,
      size: 9, font: fontSans, color: darkGray,
    });
  }
  page.drawText("Instruktør", {
    x: leftSigX + (sigLineLen - fontSans.widthOfTextAtSize("Instruktør", 8)) / 2,
    y: sigY - 23,
    size: 8, font: fontSans, color: midGray,
  });

  page.drawText("KKS AS", {
    x: rightSigX + (sigLineLen - fontSansBold.widthOfTextAtSize("KKS AS", 9)) / 2,
    y: sigY - 13,
    size: 9, font: fontSansBold, color: darkGray,
  });
  page.drawText("Daglig leder", {
    x: rightSigX + (sigLineLen - fontSans.widthOfTextAtSize("Daglig leder", 8)) / 2,
    y: sigY - 23,
    size: 8, font: fontSans, color: midGray,
  });

  // Bunnlinje med dato
  const issuedStr = `Utstedt: ${format(new Date(), "dd.MM.yyyy")}`;
  page.drawText(issuedStr, {
    x: width - fontSans.widthOfTextAtSize(issuedStr, 8) - 34,
    y: 34,
    size: 8, font: fontSans, color: midGray,
  });

  return await pdfDoc.save();
}

