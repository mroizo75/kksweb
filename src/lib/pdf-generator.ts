/**
 * PDF-generering med pdf-lib
 */

import { PDFDocument, rgb, StandardFonts, PDFPage } from "pdf-lib";
import QRCode from "qrcode";
import type { Template, Credential, Person, Course, CredentialType } from "@prisma/client";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { COMPETENCE_CODES, getCompetenceCode } from "./competence-codes";
import { readFile } from "fs/promises";
import { join } from "path";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  font: any,
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
 * Generer et representativt diploma-PDF (A4 portrait) med KKS AS-logo
 */
export async function generateDiplomaPdf(payload: DiplomaPayload): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // A4 portrait
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const margin = 36;
  const contentW = width - margin * 2;

  const font      = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold  = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontSans  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSansB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const navy     = rgb(0.04, 0.18, 0.42);
  const gold     = rgb(0.72, 0.57, 0.1);
  const darkGray = rgb(0.2,  0.2,  0.2);
  const midGray  = rgb(0.45, 0.45, 0.45);
  const cream    = rgb(0.985, 0.975, 0.955);

  // ── Bakgrunn ──────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height, color: cream });

  // ── Ytre og indre ramme ───────────────────────────────────────────
  page.drawRectangle({ x: 16, y: 16, width: width - 32, height: height - 32, borderColor: navy, borderWidth: 3 });
  page.drawRectangle({ x: 22, y: 22, width: width - 44, height: height - 44, borderColor: gold, borderWidth: 1 });

  // ── Toppbanner (navy) ─────────────────────────────────────────────
  const bannerH = 105;
  const bannerY = height - 16 - bannerH;
  page.drawRectangle({ x: 16, y: bannerY, width: width - 32, height: bannerH, color: navy });

  // Gullstripe under banner
  page.drawRectangle({ x: 16, y: bannerY - 5, width: width - 32, height: 5, color: gold });

  // Logo (hvit versjon) i banneret
  try {
    const logoPath = join(process.cwd(), "public", "logo-white-kks.png");
    const logoBytes = await readFile(logoPath);
    const logoImg   = await pdfDoc.embedPng(logoBytes);
    const logoNatW  = logoImg.width;
    const logoNatH  = logoImg.height;
    const maxLogoW  = 190;
    const maxLogoH  = 75;
    const scale     = Math.min(maxLogoW / logoNatW, maxLogoH / logoNatH);
    const lw = logoNatW * scale;
    const lh = logoNatH * scale;
    page.drawImage(logoImg, {
      x: (width - lw) / 2,
      y: bannerY + (bannerH - lh) / 2,
      width: lw,
      height: lh,
    });
  } catch {
    // Fallback til tekst hvis logo ikke finnes
    const txt = "KKS AS";
    const tw = fontSansB.widthOfTextAtSize(txt, 24);
    page.drawText(txt, { x: (width - tw) / 2, y: bannerY + 40, size: 24, font: fontSansB, color: rgb(0.9, 0.82, 0.45) });
    const sub = "Kurs og Kompetansesystemer AS";
    const sw = fontSans.widthOfTextAtSize(sub, 9);
    page.drawText(sub, { x: (width - sw) / 2, y: bannerY + 22, size: 9, font: fontSans, color: rgb(0.78, 0.78, 0.78) });
  }

  // ── Innhold ───────────────────────────────────────────────────────
  let y = bannerY - 42;

  // DIPLOM
  const titleTxt = "D I P L O M";
  const titleSize = 34;
  const titleW = fontBold.widthOfTextAtSize(titleTxt, titleSize);
  page.drawText(titleTxt, { x: (width - titleW) / 2, y, size: titleSize, font: fontBold, color: navy });
  y -= 20;

  // Dekorative linjer
  const lx1 = (width - 240) / 2;
  const lx2 = (width + 240) / 2;
  page.drawLine({ start: { x: lx1, y }, end: { x: lx2, y }, thickness: 2, color: gold });
  page.drawLine({ start: { x: lx1 + 12, y: y - 5 }, end: { x: lx2 - 12, y: y - 5 }, thickness: 0.8, color: gold });
  y -= 30;

  // "Dette bekrefter at"
  const herbyTxt = "Dette bekrefter at";
  const herbyW   = fontItalic.widthOfTextAtSize(herbyTxt, 12);
  page.drawText(herbyTxt, { x: (width - herbyW) / 2, y, size: 12, font: fontItalic, color: midGray });
  y -= 38;

  // Navn
  const nameSize = Math.max(22, Math.min(28, 28 - Math.max(0, payload.personName.length - 22)));
  const nameW    = fontBold.widthOfTextAtSize(payload.personName, nameSize);
  page.drawText(payload.personName, { x: (width - nameW) / 2, y, size: nameSize, font: fontBold, color: navy });
  y -= 12;
  page.drawLine({ start: { x: (width - nameW) / 2, y }, end: { x: (width + nameW) / 2, y }, thickness: 1.5, color: gold });
  y -= 28;

  // Brødtekst (fra mal)
  const bodyRaw   = payload.bodyText?.trim() || "har fullført og bestått kurset";
  const bodyLines = wrapText(bodyRaw, contentW - 40, fontItalic, 12);
  for (const line of bodyLines) {
    const lw = fontItalic.widthOfTextAtSize(line, 12);
    page.drawText(line, { x: (width - lw) / 2, y, size: 12, font: fontItalic, color: darkGray });
    y -= 18;
  }
  y -= 14;

  // Kursboks
  const courseSize = 16;
  const courseRaw  = payload.courseName;
  const courseLines = wrapText(courseRaw, contentW - 60, fontBold, courseSize);
  const boxPadV    = 10;
  const boxH       = courseLines.length * 22 + boxPadV * 2;
  const boxX       = margin + 10;
  const boxW       = contentW - 20;
  page.drawRectangle({ x: boxX, y: y - boxH, width: boxW, height: boxH, color: navy, borderColor: gold, borderWidth: 1 });
  let cy = y - boxPadV - 16;
  for (const cline of courseLines) {
    const clw = fontBold.widthOfTextAtSize(cline, courseSize);
    page.drawText(cline, { x: (width - clw) / 2, y: cy, size: courseSize, font: fontBold, color: rgb(1, 1, 1) });
    cy -= 22;
  }
  y = y - boxH - 20;

  // Fullføringsdato
  const dateStr = format(payload.completedDate, "dd. MMMM yyyy", { locale: nb });
  const dateTxt = `Fullført: ${dateStr}`;
  const dateW   = font.widthOfTextAtSize(dateTxt, 11);
  page.drawText(dateTxt, { x: (width - dateW) / 2, y, size: 11, font, color: midGray });
  y -= 48;

  // Signaturlinjer
  const sigLineLen = 140;
  const leftSigX   = width / 2 - 155;
  const rightSigX  = width / 2 + 15;

  page.drawLine({ start: { x: leftSigX,  y }, end: { x: leftSigX  + sigLineLen, y }, thickness: 0.8, color: midGray });
  page.drawLine({ start: { x: rightSigX, y }, end: { x: rightSigX + sigLineLen, y }, thickness: 0.8, color: midGray });

  const instrName = payload.instructor ?? "";
  if (instrName) {
    const iw = fontSans.widthOfTextAtSize(instrName, 8);
    page.drawText(instrName, { x: leftSigX + (sigLineLen - iw) / 2, y: y - 13, size: 8, font: fontSans, color: darkGray });
  }
  const instrLbl  = "Instruktør";
  const instrLblW = fontSans.widthOfTextAtSize(instrLbl, 8);
  page.drawText(instrLbl, { x: leftSigX + (sigLineLen - instrLblW) / 2, y: y - 24, size: 8, font: fontSans, color: midGray });

  const kksW = fontSansB.widthOfTextAtSize("KKS AS", 8);
  page.drawText("KKS AS", { x: rightSigX + (sigLineLen - kksW) / 2, y: y - 13, size: 8, font: fontSansB, color: darkGray });
  const dlLbl  = "Daglig leder";
  const dlLblW = fontSans.widthOfTextAtSize(dlLbl, 8);
  page.drawText(dlLbl, { x: rightSigX + (sigLineLen - dlLblW) / 2, y: y - 24, size: 8, font: fontSans, color: midGray });

  // Utstedelsesdato nederst
  const issuedStr = `Utstedt: ${format(new Date(), "dd.MM.yyyy")}`;
  const issuedW   = fontSans.widthOfTextAtSize(issuedStr, 7);
  page.drawText(issuedStr, { x: width - issuedW - 30, y: 28, size: 7, font: fontSans, color: midGray });

  return await pdfDoc.save();
}

