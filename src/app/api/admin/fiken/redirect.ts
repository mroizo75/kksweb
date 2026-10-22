import { NextResponse } from "next/server";
import { requestOrigin } from "@/lib/integrations/fiken/oauth";

/** Sender brukeren tilbake til fakturasiden med en kort status. */
export function redirectToFaktura(request: Request, params: Record<string, string>): NextResponse {
  const url = new URL("/admin/faktura", requestOrigin(request));
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value.slice(0, 180));
  }
  return NextResponse.redirect(url);
}
