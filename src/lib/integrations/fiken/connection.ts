import { db } from "@/lib/db";
import { FikenApiError, FikenConfigError } from "./errors";
import { decryptSecret, encryptSecret } from "./secrets";
import { FIKEN_TOKEN_URL, parseTokenResponse, type FikenTokenResponse } from "./oauth";

const CONNECTION_ID = "company";
const REFRESH_MARGIN_MS = 60_000;

type StoredConnection = {
  accessToken: string;
  companySlug: string;
};

/** Henter et gyldig access-token og fornyer det når det er i ferd med å løpe ut. */
export async function getFikenAccess(): Promise<StoredConnection> {
  const row = await db.fikenConnection.findUnique({ where: { id: CONNECTION_ID } });
  if (!row) throw new FikenConfigError();

  if (row.expiresAt.getTime() > Date.now() + REFRESH_MARGIN_MS) {
    return { accessToken: decryptSecret(row.accessToken), companySlug: row.companySlug };
  }

  const refreshed = await requestToken({
    grant_type: "refresh_token",
    refresh_token: decryptSecret(row.refreshToken),
  });
  await saveFikenConnection({
    token: refreshed,
    companySlug: row.companySlug,
    connectedByUserId: row.connectedByUserId,
  });
  return { accessToken: refreshed.accessToken, companySlug: row.companySlug };
}

/** Lagrer token etter første innlogging eller fornyelse. */
export async function saveFikenConnection(input: {
  token: FikenTokenResponse;
  companySlug: string;
  connectedByUserId: string | null;
}): Promise<void> {
  const expiresAt = new Date(Date.now() + input.token.expiresInSeconds * 1000);
  await db.fikenConnection.upsert({
    where: { id: CONNECTION_ID },
    create: {
      id: CONNECTION_ID,
      accessToken: encryptSecret(input.token.accessToken),
      refreshToken: encryptSecret(input.token.refreshToken),
      expiresAt,
      companySlug: input.companySlug,
      connectedByUserId: input.connectedByUserId,
    },
    update: {
      accessToken: encryptSecret(input.token.accessToken),
      refreshToken: encryptSecret(input.token.refreshToken),
      expiresAt,
      companySlug: input.companySlug,
      connectedByUserId: input.connectedByUserId,
    },
  });
}

/** Bytter innloggingskoden fra redirecten mot access- og refresh-token. */
export async function exchangeAuthorizationCode(code: string, redirectUri: string, state: string): Promise<FikenTokenResponse> {
  return requestToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    state,
  });
}

/** Velger foretaket appen skal fakturere fra. */
export async function resolveCompanySlug(accessToken: string): Promise<string> {
  const response = await fetch("https://api.fiken.no/api/v2/companies", {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  const body = (await response.json().catch(() => null)) as unknown;
  if (!response.ok || !Array.isArray(body)) {
    throw new FikenApiError(response.status, "Kunne ikke hente foretak fra Fiken");
  }

  const slugs = body.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const slug = (item as { slug?: unknown }).slug;
    return typeof slug === "string" && slug.trim() ? [slug.trim()] : [];
  });
  const preferred = process.env.FIKEN_COMPANY_SLUG?.trim();
  if (preferred) {
    if (!slugs.includes(preferred)) {
      throw new FikenApiError(400, "Foretaket i FIKEN_COMPANY_SLUG er ikke tilgjengelig for denne Fiken-brukeren");
    }
    return preferred;
  }
  if (slugs.length === 1) return slugs[0] ?? "";
  throw new FikenApiError(400, "Fiken-brukeren har flere foretak. Sett FIKEN_COMPANY_SLUG.");
}

export async function readFikenConnectionStatus(): Promise<{ connected: boolean; companySlug: string | null }> {
  const row = await db.fikenConnection.findUnique({
    where: { id: CONNECTION_ID },
    select: { companySlug: true },
  });
  return { connected: Boolean(row), companySlug: row?.companySlug ?? null };
}

async function requestToken(fields: Record<string, string>): Promise<FikenTokenResponse> {
  const clientId = process.env.FIKEN_CLIENT_ID?.trim();
  const clientSecret = process.env.FIKEN_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new FikenConfigError();

  const response = await fetch(FIKEN_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams(fields),
    signal: AbortSignal.timeout(20_000),
  });
  const body = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const message = parseTokenError(body);
    throw new FikenApiError(response.status, message);
  }
  return parseTokenResponse(body);
}

function parseTokenError(body: unknown): string {
  if (body && typeof body === "object" && "error_description" in body) {
    const description = (body as { error_description?: unknown }).error_description;
    if (typeof description === "string" && description.trim()) return description.slice(0, 300);
  }
  return "Fiken avviste innloggingen";
}
