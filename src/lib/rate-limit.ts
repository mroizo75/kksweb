/**
 * Rate Limiting System for Login Attempts
 * Beskytter mot brute force og credential stuffing angrep
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

// In-memory store (produksjon: bruk Redis/Upstash)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Konfigurering
const CONFIG = {
  // Forsøk tillatt
  MAX_ATTEMPTS_PER_IP: 5,        // 5 forsøk per IP
  MAX_ATTEMPTS_PER_EMAIL: 5,     // 5 forsøk per e-post
  
  // Tidsperioder (i millisekunder)
  WINDOW_MS: 15 * 60 * 1000,     // 15 minutter
  LOCKOUT_MS: 30 * 60 * 1000,    // 30 minutter lockout
  
  // Automatisk blokkering
  AUTO_BLOCK_ATTEMPTS: 10,       // Blokker etter 10 forsøk
  AUTO_BLOCK_MS: 24 * 60 * 60 * 1000, // 24 timer
};

/**
 * Sjekk om en nøkkel (IP eller e-post) er rate limited
 */
export async function checkRateLimit(
  key: string,
  type: "ip" | "email"
): Promise<{ allowed: boolean; remainingAttempts?: number; resetIn?: number; message?: string }> {
  const now = Date.now();
  const maxAttempts = type === "ip" ? CONFIG.MAX_ATTEMPTS_PER_IP : CONFIG.MAX_ATTEMPTS_PER_EMAIL;
  
  let record = rateLimitStore.get(key);

  // Fjern utdaterte poster automatisk
  if (record && now > record.resetAt && !record.blockedUntil) {
    rateLimitStore.delete(key);
    record = undefined;
  }

  // Sjekk om blokket
  if (record?.blockedUntil && now < record.blockedUntil) {
    const minutesLeft = Math.ceil((record.blockedUntil - now) / 60000);
    return {
      allowed: false,
      message: `For mange feilede forsøk. Prøv igjen om ${minutesLeft} minutter.`,
    };
  }

  // Fjern blokkeringen hvis tiden er utløpt
  if (record?.blockedUntil && now >= record.blockedUntil) {
    rateLimitStore.delete(key);
    record = undefined;
  }

  // Ny record eller reset
  if (!record || now > record.resetAt) {
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
    };
  }

  // Sjekk om over grensen
  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetIn: Math.ceil((record.resetAt - now) / 60000),
      message: `For mange forsøk. Prøv igjen om ${Math.ceil((record.resetAt - now) / 60000)} minutter.`,
    };
  }

  return {
    allowed: true,
    remainingAttempts: maxAttempts - record.count - 1,
  };
}

/**
 * Registrer et mislykket forsøk
 */
export async function recordFailedAttempt(
  key: string,
  type: "ip" | "email"
): Promise<{ blocked: boolean; message?: string }> {
  const now = Date.now();
  const maxAttempts = type === "ip" ? CONFIG.MAX_ATTEMPTS_PER_IP : CONFIG.MAX_ATTEMPTS_PER_EMAIL;
  
  let record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // Nytt forsøk
    record = {
      count: 1,
      resetAt: now + CONFIG.WINDOW_MS,
    };
  } else {
    // Øk telleren
    record.count += 1;
  }

  // Automatisk blokkering etter for mange forsøk
  if (record.count >= CONFIG.AUTO_BLOCK_ATTEMPTS) {
    record.blockedUntil = now + CONFIG.AUTO_BLOCK_MS;
    rateLimitStore.set(key, record);
    return {
      blocked: true,
      message: `Kontoen er midlertidig blokkert på grunn av for mange mislykkede forsøk. Prøv igjen om 24 timer.`,
    };
  }

  rateLimitStore.set(key, record);

  if (record.count >= maxAttempts) {
    return {
      blocked: true,
      message: `For mange forsøk. Prøv igjen om ${Math.ceil(CONFIG.WINDOW_MS / 60000)} minutter.`,
    };
  }

  return { blocked: false };
}

/**
 * Nullstill rate limit (ved vellykket innlogging)
 */
export async function resetRateLimit(key: string): Promise<void> {
  rateLimitStore.delete(key);
}

/**
 * Hent klient-IP fra request
 */
export function getClientIp(request: Request): string {
  // Sjekk vanlige proxy headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  
  return "unknown";
}

/**
 * Cleanup-funksjon (kjør periodisk)
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt && !record.blockedUntil) {
      rateLimitStore.delete(key);
    }
  }
}

// Kjør cleanup hvert 10. minutt
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredRecords, 10 * 60 * 1000);
}

