import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/integrations/fiken/access";
import { buildAuthorizeUrl, fikenRedirectUri, requestOrigin } from "@/lib/integrations/fiken/oauth";
import { redirectToFaktura } from "../redirect";

const STATE_COOKIE = "fiken_oauth_state";

/** Starter OAuth mot Fiken. Bare administratorer kan koble til foretaket. */
export async function GET(request: Request) {
  const guard = await requireStaff();
  if (guard.response) return guard.response;
  if (guard.session.user.role !== "ADMIN") {
    return redirectToFaktura(request, { fiken: "feil", melding: "Bare en administrator kan koble til Fiken" });
  }

  const clientId = process.env.FIKEN_CLIENT_ID?.trim();
  if (!clientId || !process.env.FIKEN_CLIENT_SECRET?.trim()) {
    return redirectToFaktura(request, {
      fiken: "feil",
      melding: "Legg inn FIKEN_CLIENT_ID og FIKEN_CLIENT_SECRET",
    });
  }

  const state = randomBytes(24).toString("base64url");
  const response = NextResponse.redirect(
    buildAuthorizeUrl({
      clientId,
      redirectUri: fikenRedirectUri(requestOrigin(request)),
      state,
    })
  );
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/admin/fiken/callback",
    maxAge: 600,
  });
  return response;
}
