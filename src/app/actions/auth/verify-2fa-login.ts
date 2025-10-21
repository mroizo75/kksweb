"use server";

import { db } from "@/lib/db";
import { verifyTOTPToken, decryptSecret, verifyBackupCode } from "@/lib/2fa";
import bcrypt from "bcryptjs";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

/**
 * Verifiser 2FA-token ved innlogging
 * Returnerer brukerdata hvis vellykket
 */
export async function verify2FALogin(email: string, password: string, token: string) {
  try {
    // Hent IP-adresse
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwarded?.split(",")[0].trim() || realIp || "unknown";

    // Rate limit på 2FA-forsøk (5 forsøk per 15 min)
    const twoFaKey = `2fa:${email.toLowerCase()}`;
    const limit = await checkRateLimit(twoFaKey, "email");
    
    if (!limit.allowed) {
      await db.auditLog.create({
        data: {
          action: "LOGIN_FAILED",
          entity: "USER",
          description: "Rate limit overskredet for 2FA",
          metadata: { email, ip, reason: limit.message },
          ipAddress: ip,
          success: false,
        },
      });
      return { success: false, error: limit.message || "For mange forsøk på 2FA" };
    }

    // Først, verifiser e-post og passord
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hashedPassword: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        backupCodes: true,
      },
    });

    if (!user || !user.hashedPassword) {
      await recordFailedAttempt(twoFaKey, "email");
      return { success: false, error: "Ugyldig e-post eller passord" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      await recordFailedAttempt(twoFaKey, "email");
      return { success: false, error: "Ugyldig e-post eller passord" };
    }

    // Sjekk om 2FA er aktivert
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return { success: false, error: "2FA er ikke aktivert for denne brukeren" };
    }

    // Dekrypter secret
    const secret = decryptSecret(user.twoFactorSecret);

    // Verifiser TOTP token
    const isValid = verifyTOTPToken(secret, token);

    if (isValid) {
      // Reset rate limit ved vellykket 2FA
      await resetRateLimit(twoFaKey);
      
      // Logg vellykket 2FA
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          entity: "USER",
          entityId: user.id,
          metadata: { email: user.email, twoFactor: true },
          ipAddress: ip,
        },
      });
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email!,
          name: user.name,
          role: user.role,
        },
      };
    }

    // Hvis TOTP feiler, sjekk backup-koder
    if (user.backupCodes) {
      const hashedCodes = user.backupCodes as string[];
      const { valid, remainingCodes } = verifyBackupCode(token, hashedCodes);

      if (valid) {
        // Reset rate limit ved vellykket backup-kode
        await resetRateLimit(twoFaKey);
        
        // Oppdater backup-koder (fjern brukt kode)
        await db.user.update({
          where: { email },
          data: {
            backupCodes: remainingCodes,
          },
        });

        // Logg bruk av backup-kode
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN",
            entity: "USER",
            entityId: user.id,
            metadata: {
              email: user.email,
              backupCodeUsed: true,
              remaining: remainingCodes.length,
            },
            ipAddress: ip,
          },
        });

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email!,
            name: user.name,
            role: user.role,
          },
          usedBackupCode: true,
          backupCodesRemaining: remainingCodes.length,
        };
      }
    }

    // Mislykket 2FA - registrer forsøk
    await recordFailedAttempt(twoFaKey, "email");
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_FAILED",
        entity: "USER",
        entityId: user.id,
        description: "Mislykket 2FA-verifisering",
        metadata: { email, ip },
        ipAddress: ip,
        success: false,
      },
    });

    return { success: false, error: "Ugyldig 2FA-kode" };
  } catch (error) {
    console.error("Error verifying 2FA login:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Kunne ikke verifisere 2FA",
    };
  }
}

/**
 * Sjekk om bruker har 2FA aktivert
 */
export async function check2FARequired(email: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        hashedPassword: true,
        twoFactorEnabled: true,
      },
    });

    if (!user || !user.hashedPassword) {
      return { success: false, error: "Ugyldig e-post eller passord" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return { success: false, error: "Ugyldig e-post eller passord" };
    }

    return {
      success: true,
      requires2FA: user.twoFactorEnabled,
    };
  } catch (error) {
    console.error("Error checking 2FA required:", error);
    return {
      success: false,
      error: "Kunne ikke sjekke 2FA-status",
    };
  }
}

