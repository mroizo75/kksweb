const FIKEN_AUTHORIZE_URL = "https://fiken.no/oauth/authorize";
export const FIKEN_TOKEN_URL = "https://fiken.no/oauth/token";

export type FikenTokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

/** Bygger adressen Fiken sender brukeren tilbake til. Må være registrert på appen. */
export function fikenRedirectUri(origin: string): string {
  const configured = process.env.FIKEN_REDIRECT_URI?.trim();
  if (configured) return configured;
  return `${origin.replace(/\/$/, "")}/api/admin/fiken/callback`;
}

/** Leser opprinnelig protokoll og vert når appen står bak en proxy. */
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (proto && host) return `${proto}://${host}`;
  return url.origin;
}

/** Samtykke-adressen brukeren sendes til i Fiken. */
export function buildAuthorizeUrl(input: { clientId: string; redirectUri: string; state: string }): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    state: input.state,
  });
  return `${FIKEN_AUTHORIZE_URL}?${params.toString()}`;
}

/** Leser token-svaret fra Fiken. Ugyldig svar avvises før det lagres. */
export function parseTokenResponse(body: unknown): FikenTokenResponse {
  if (!body || typeof body !== "object") {
    throw new Error("Fiken returnerte ikke et token");
  }
  const record = body as Record<string, unknown>;
  const accessToken = record.access_token;
  const refreshToken = record.refresh_token;
  const expiresIn = record.expires_in;
  if (typeof accessToken !== "string" || typeof refreshToken !== "string" || typeof expiresIn !== "number") {
    const description = typeof record.error_description === "string" ? record.error_description : "Fiken returnerte ikke et token";
    throw new Error(description);
  }
  return { accessToken, refreshToken, expiresInSeconds: expiresIn };
}
