"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import {
  generateTOTPSecret,
  generateQRCode,
  verifyTOTPToken,
  generateBackupCodes,
  encryptSecret,
  decryptSecret,
} from "@/lib/2fa";
import { log2FAChange } from "@/lib/audit-logger";
import {
  enable2FASchema,
  verify2FASchema,
  disable2FASchema,
  type Enable2FAInput,
  type Verify2FAInput,
  type Disable2FAInput,
} from "@/lib/validations/security";

/**
 * Steg 1: Generer 2FA secret og QR-kode
 * Returnerer secret og QR-kode for scanning i Google Authenticator
 */
export async function setup2FA() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return { success: false, error: "Bruker ikke funnet" };
    }

    if (user.twoFactorEnabled) {
      return { success: false, error: "2FA er allerede aktivert" };
    }

    // Generer secret og QR-kode
    const { secret, otpauthUrl } = generateTOTPSecret(user.email!);
    const qrCode = await generateQRCode(otpauthUrl);

    return {
      success: true,
      secret, // Vises til bruker for manuell registrering
      qrCode, // Data URL for QR-kode
    };
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke sette opp 2FA",
    };
  }
}

/**
 * Steg 2: Aktiver 2FA etter verifisering av token
 * Brukeren må skanne QR-kode og oppgi token for å bekrefte at det fungerer
 */
export async function enable2FA(data: Enable2FAInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    const validated = enable2FASchema.parse(data);

    // Verifiser token
    const isValid = verifyTOTPToken(validated.secret, validated.token);
    if (!isValid) {
      return { success: false, error: "Ugyldig token. Prøv igjen." };
    }

    // Generer backup-koder
    const { codes, hashedCodes } = generateBackupCodes();

    // Krypter secret før lagring
    const encryptedSecret = encryptSecret(validated.secret);

    // Aktiver 2FA i database
    await db.user.update({
      where: { email: session.user.email! },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: encryptedSecret,
        backupCodes: hashedCodes,
      },
    });

    // Logg i audit log
    await log2FAChange(
      (session.user as any).id,
      session.user.email!,
      true
    );

    revalidatePath("/admin/settings");
    revalidatePath("/min-side/profil");

    return {
      success: true,
      backupCodes: codes, // Vises til bruker EN GANG
      message: "2FA aktivert! Lagre backup-kodene på et trygt sted.",
    };
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke aktivere 2FA",
    };
  }
}

/**
 * Verifiser 2FA-token ved innlogging
 */
export async function verify2FA(data: Verify2FAInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    const validated = verify2FASchema.parse(data);

    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      select: {
        twoFactorSecret: true,
        backupCodes: true,
      },
    });

    if (!user || !user.twoFactorSecret) {
      return { success: false, error: "2FA ikke konfigurert" };
    }

    // Dekrypter secret
    const secret = decryptSecret(user.twoFactorSecret);

    // Verifiser TOTP token
    const isValid = verifyTOTPToken(secret, validated.token);

    if (isValid) {
      return { success: true, message: "Token verifisert" };
    }

    // Hvis TOTP feiler, sjekk backup-koder
    if (user.backupCodes) {
      const hashedCodes = user.backupCodes as string[];
      const { valid, remainingCodes } = await import("@/lib/2fa").then((m) =>
        m.verifyBackupCode(validated.token, hashedCodes)
      );

      if (valid) {
        // Oppdater backup-koder (fjern brukt kode)
        await db.user.update({
          where: { email: session.user.email! },
          data: {
            backupCodes: remainingCodes,
          },
        });

        return {
          success: true,
          message: "Backup-kode verifisert",
          backupCodesRemaining: remainingCodes.length,
        };
      }
    }

    return { success: false, error: "Ugyldig token eller backup-kode" };
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke verifisere token",
    };
  }
}

/**
 * Deaktiver 2FA
 * Krever passord og gyldig token for sikkerhet
 */
export async function disable2FA(data: Disable2FAInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    const validated = disable2FASchema.parse(data);

    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        hashedPassword: true,
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      return { success: false, error: "Bruker ikke funnet" };
    }

    if (!user.twoFactorEnabled) {
      return { success: false, error: "2FA er ikke aktivert" };
    }

    // Verifiser passord
    if (!user.hashedPassword) {
      return { success: false, error: "Ingen passord satt" };
    }

    const passwordValid = await bcrypt.compare(
      validated.password,
      user.hashedPassword
    );

    if (!passwordValid) {
      return { success: false, error: "Feil passord" };
    }

    // Verifiser token
    if (user.twoFactorSecret) {
      const secret = decryptSecret(user.twoFactorSecret);
      const isValid = verifyTOTPToken(secret, validated.token);

      if (!isValid) {
        return { success: false, error: "Ugyldig token" };
      }
    }

    // Deaktiver 2FA
    await db.user.update({
      where: { email: session.user.email! },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: undefined,
      },
    });

    // Logg i audit log
    await log2FAChange(user.id, session.user.email!, false);

    revalidatePath("/admin/settings");
    revalidatePath("/min-side/profil");

    return {
      success: true,
      message: "2FA deaktivert",
    };
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke deaktivere 2FA",
    };
  }
}

/**
 * Hent 2FA-status for innlogget bruker
 */
export async function get2FAStatus() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      select: {
        twoFactorEnabled: true,
        backupCodes: true,
      },
    });

    if (!user) {
      return { success: false, error: "Bruker ikke funnet" };
    }

    const backupCodesCount = user.backupCodes
      ? (user.backupCodes as string[]).length
      : 0;

    return {
      success: true,
      enabled: user.twoFactorEnabled,
      backupCodesRemaining: backupCodesCount,
    };
  } catch (error) {
    console.error("Error getting 2FA status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke hente status",
    };
  }
}

/**
 * Generer nye backup-koder (hvis gamle er brukt opp)
 * Krever gyldig 2FA-token
 */
export async function regenerateBackupCodes(token: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Ingen tilgang" };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      select: {
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return { success: false, error: "2FA ikke aktivert" };
    }

    // Verifiser token
    const secret = decryptSecret(user.twoFactorSecret);
    const isValid = verifyTOTPToken(secret, token);

    if (!isValid) {
      return { success: false, error: "Ugyldig token" };
    }

    // Generer nye backup-koder
    const { codes, hashedCodes } = generateBackupCodes();

    // Oppdater i database
    await db.user.update({
      where: { email: session.user.email! },
      data: {
        backupCodes: hashedCodes,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/min-side/profil");

    return {
      success: true,
      backupCodes: codes,
      message: "Nye backup-koder generert. Lagre dem på et trygt sted.",
    };
  } catch (error) {
    console.error("Error regenerating backup codes:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Kunne ikke generere nye backup-koder",
    };
  }
}

