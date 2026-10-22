import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { FikenApiError, FikenConfigError } from "./errors";
import { InvoiceInputError } from "./money";

type StaffSession = {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  };
};

/** Krever innlogget admin eller instruktør. */
export async function requireStaff(): Promise<
  { session: StaffSession; response: null } | { session: null; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user) {
    return {
      session: null,
      response: NextResponse.json(
        { code: "not_authenticated", message: "Du må være innlogget" },
        { status: 401 }
      ),
    };
  }

  const user = session.user as { id?: string; role?: string; name?: string | null; email?: string | null };
  const role = user.role;
  if (role !== "ADMIN" && role !== "INSTRUCTOR") {
    return {
      session: null,
      response: NextResponse.json(
        { code: "not_authenticated", message: "Du må være innlogget" },
        { status: 401 }
      ),
    };
  }

  return {
    session: {
      user: {
        id: user.id,
        name: session.user.name,
        email: session.user.email,
        role,
      },
    },
    response: null,
  };
}

/** Referanse som skrives på fakturaen, slik at avsenderen er synlig i Fiken. */
export function ourReferenceFromSession(session: StaffSession): string {
  const value = session.user.name?.trim() || session.user.email?.trim() || "Instruktør";
  return value.slice(0, 100);
}

/** Oversetter kjente feil til standardsvaret på API-grensen. */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof FikenConfigError) {
    return NextResponse.json({ code: error.code, message: error.message }, { status: 503 });
  }
  if (error instanceof InvoiceInputError || error instanceof z.ZodError) {
    const message = error instanceof z.ZodError ? (error.issues[0]?.message ?? "Ugyldig forespørsel") : error.message;
    return NextResponse.json({ code: "validation_error", message }, { status: 400 });
  }
  if (error instanceof FikenApiError) {
    const status = error.status === 401 || error.status === 403 || error.status >= 500 ? 502 : 400;
    return NextResponse.json({ code: error.code, message: error.message }, { status });
  }
  if (error instanceof Error && error.name === "TimeoutError") {
    return NextResponse.json(
      { code: "fiken_timeout", message: "Fiken svarte ikke i tide. Prøv igjen." },
      { status: 504 }
    );
  }
  return NextResponse.json(
    { code: "internal_error", message: "Kunne ikke fullføre forespørselen" },
    { status: 500 }
  );
}
