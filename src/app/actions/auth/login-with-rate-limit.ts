"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

interface LoginResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  requires2FA?: boolean;
}

/**
 * Login med rate limiting og security logging
 */
export async function loginWithRateLimit(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    // Hent IP-adresse
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwarded?.split(",")[0].trim() || realIp || "unknown";

    // Sjekk rate limit for IP
    const ipLimit = await checkRateLimit(ip, "ip");
    if (!ipLimit.allowed) {
      // Logg til audit log
      await db.auditLog.create({
        data: {
          action: "LOGIN_FAILED",
          entity: "USER",
          description: "Rate limit overskredet for IP",
          metadata: { email, ip, reason: ipLimit.message },
          ipAddress: ip,
          success: false,
        },
      });
      return {
        success: false,
        error: ipLimit.message || "For mange forsøk. Prøv igjen senere.",
      };
    }

    // Sjekk rate limit for e-post
    const emailLimit = await checkRateLimit(email.toLowerCase(), "email");
    if (!emailLimit.allowed) {
      await db.auditLog.create({
        data: {
          action: "LOGIN_FAILED",
          entity: "USER",
          description: "Rate limit overskredet for e-post",
          metadata: { email, ip, reason: emailLimit.message },
          ipAddress: ip,
          success: false,
        },
      });
      return {
        success: false,
        error: emailLimit.message || "For mange forsøk på denne kontoen.",
      };
    }

    // Valider input
    if (!email || !password) {
      return {
        success: false,
        error: "E-post og passord er påkrevd",
      };
    }

    // Hent bruker
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Alltid gi samme feilmelding (mot user enumeration)
    const genericError = "Ugyldig e-post eller passord";

    if (!user || !user.hashedPassword) {
      await recordFailedAttempt(ip, "ip");
      await recordFailedAttempt(email.toLowerCase(), "email");
      await db.auditLog.create({
        data: {
          action: "LOGIN_FAILED",
          entity: "USER",
          description: "Mislykket innlogging - bruker ikke funnet",
          metadata: { email, ip },
          ipAddress: ip,
          success: false,
        },
      });
      return {
        success: false,
        error: genericError,
      };
    }

    // Verifiser passord
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      await recordFailedAttempt(ip, "ip");
      await recordFailedAttempt(email.toLowerCase(), "email");
      await db.auditLog.create({
        data: {
          action: "LOGIN_FAILED",
          entity: "USER",
          entityId: user.id,
          userId: user.id,
          description: "Mislykket innlogging - feil passord",
          metadata: { email, ip },
          ipAddress: ip,
          success: false,
        },
      });
      return {
        success: false,
        error: genericError,
      };
    }

    // Vellykket autentisering - reset rate limits
    await resetRateLimit(ip);
    await resetRateLimit(email.toLowerCase());

    // Sjekk om 2FA er påkrevd
    const requires2FA = !!user.twoFactorSecret;

    // Logg vellykket innlogging
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        entity: "USER",
        entityId: user.id,
        metadata: {
          email: user.email,
          requires2FA,
        },
        ipAddress: ip,
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      requires2FA,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "En uventet feil oppstod",
    };
  }
}


