import { cookies } from "next/headers";
import { requireStaff } from "@/lib/integrations/fiken/access";
import { exchangeAuthorizationCode, resolveCompanySlug, saveFikenConnection } from "@/lib/integrations/fiken/connection";
import { fikenRedirectUri, requestOrigin } from "@/lib/integrations/fiken/oauth";
import { safeEqual } from "@/lib/integrations/fiken/secrets";
import { redirectToFaktura } from "../redirect";

const STATE_COOKIE = "fiken_oauth_state";

/** Tar imot redirecten fra Fiken og lagrer tilgangen for foretaket. */
export async function GET(request: Request) {
  const guard = await requireStaff();
  if (guard.response) {
    return finish(request, { fiken: "feil", melding: "Du må være innlogget for å koble til Fiken" });
  }
  if (guard.session.user.role !== "ADMIN") {
    return finish(request, { fiken: "feil", melding: "Bare en administrator kan koble til Fiken" });
  }

  const url = new URL(request.url);
  const oauthError = url.searchParams.get("error_description") || url.searchParams.get("error");
  if (oauthError) return finish(request, { fiken: "feil", melding: oauthError });

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = (await cookies()).get(STATE_COOKIE)?.value;
  if (!code || !state || !storedState || !safeEqual(state, storedState)) {
    return finish(request, { fiken: "feil", melding: "Innloggingen mot Fiken ble avbrutt. Prøv igjen." });
  }

  try {
    const redirectUri = fikenRedirectUri(requestOrigin(request));
    const token = await exchangeAuthorizationCode(code, redirectUri, state);
    const companySlug = await resolveCompanySlug(token.accessToken);
    await saveFikenConnection({
      token,
      companySlug,
      connectedByUserId: guard.session.user.id ?? null,
    });
    return finish(request, { fiken: "koblet" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kunne ikke koble til Fiken";
    return finish(request, { fiken: "feil", melding: message });
  }
}

function finish(request: Request, params: Record<string, string>) {
  const response = redirectToFaktura(request, params);
  response.cookies.set(STATE_COOKIE, "", { httpOnly: true, path: "/api/admin/fiken/callback", maxAge: 0 });
  return response;
}
