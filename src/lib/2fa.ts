import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * 2FA Helper-funksjoner for ISO 27001 compliance
 */

/**
 * Generer TOTP secret for 2FA
 */
export function generateTOTPSecret(userEmail: string): {
  secret: string;
  otpauthUrl: string;
} {
  const secret = speakeasy.generateSecret({
    name: `KKS Kurs (${userEmail})`,
    issuer: "KKS AS",
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url || "",
  };
}

/**
 * Generer QR-kode for 2FA setup
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(otpauthUrl);
    return qrCode;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Kunne ikke generere QR-kode");
  }
}

/**
 * Verifiser TOTP token
 */
export function verifyTOTPToken(secret: string, token: string): boolean {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2, // Allow 2 time steps before/after (±60 seconds)
    });
  } catch (error) {
    console.error("Error verifying TOTP token:", error);
    return false;
  }
}

/**
 * Generer backup-koder for 2FA
 * Returnerer 10 koder som kan brukes hvis bruker mister telefon
 */
export function generateBackupCodes(): {
  codes: string[];
  hashedCodes: string[];
} {
  const codes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < 10; i++) {
    // Generer 8-tegns kode (XXXX-XXXX format)
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const formattedCode = `${code.slice(0, 4)}-${code.slice(4)}`;
    
    codes.push(formattedCode);
    // Hash koden før lagring (samme som passord)
    hashedCodes.push(bcrypt.hashSync(formattedCode, 10));
  }

  return { codes, hashedCodes };
}

/**
 * Verifiser backup-kode
 */
export function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): { valid: boolean; remainingCodes: string[] } {
  for (let i = 0; i < hashedCodes.length; i++) {
    if (bcrypt.compareSync(code, hashedCodes[i])) {
      // Koden er gyldig - fjern den fra listen
      const remainingCodes = hashedCodes.filter((_, index) => index !== i);
      return { valid: true, remainingCodes };
    }
  }

  return { valid: false, remainingCodes: hashedCodes };
}

/**
 * Krypter secret før lagring i database
 * (Ekstra sikkerhetslag utover database-kryptering)
 */
export function encryptSecret(secret: string): string {
  // For nå, lagrer vi secret i klartekst siden database allerede er kryptert
  // I produksjon bør du sette opp en ordentlig krypteringsnøkkel
  return secret;
}

/**
 * Dekrypter secret fra database
 */
export function decryptSecret(encryptedSecret: string): string {
  // For nå, returnerer vi secret direkte
  return encryptedSecret;
}

