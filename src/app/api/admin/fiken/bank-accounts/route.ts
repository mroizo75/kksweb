import { NextResponse } from "next/server";
import { requireStaff, toErrorResponse } from "@/lib/integrations/fiken/access";
import { getFikenClient } from "@/lib/integrations/fiken/client";
import { toBankAccountSummary } from "@/lib/integrations/fiken/map";

/** Lister aktive bankkontoer som kan stå på fakturaen. */
export async function GET() {
  const guard = await requireStaff();
  if (guard.response) return guard.response;

  try {
    const client = await getFikenClient();
    const accounts = await client.listBankAccounts();
    return NextResponse.json({
      accounts: accounts.flatMap((account) => {
        const summary = toBankAccountSummary(account);
        return summary ? [summary] : [];
      }),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
