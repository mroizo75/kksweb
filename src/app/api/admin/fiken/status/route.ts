import { NextResponse } from "next/server";
import { requireStaff, toErrorResponse } from "@/lib/integrations/fiken/access";
import { readFikenConnectionStatus } from "@/lib/integrations/fiken/connection";
import { fikenRedirectUri, requestOrigin } from "@/lib/integrations/fiken/oauth";

/** Forteller om foretaket er koblet til, uten å vise token. */
export async function GET(request: Request) {
  const guard = await requireStaff();
  if (guard.response) return guard.response;

  try {
    const status = await readFikenConnectionStatus();
    return NextResponse.json({
      connected: status.connected,
      companySlug: status.companySlug,
      canConnect: guard.session.user.role === "ADMIN",
      oauthConfigured: Boolean(process.env.FIKEN_CLIENT_ID?.trim() && process.env.FIKEN_CLIENT_SECRET?.trim()),
      redirectUri: fikenRedirectUri(requestOrigin(request)),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
