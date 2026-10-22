import { NextResponse } from "next/server";
import { requireStaff, toErrorResponse } from "@/lib/integrations/fiken/access";
import { getFikenClient } from "@/lib/integrations/fiken/client";
import { toProductSummary } from "@/lib/integrations/fiken/map";
import { createProductSchema, toProductWrite } from "@/lib/integrations/fiken/schemas";

/** Lister varer og tjenester fra Fiken. */
export async function GET() {
  const guard = await requireStaff();
  if (guard.response) return guard.response;

  try {
    const client = await getFikenClient();
    const products = await client.listProducts();
    return NextResponse.json({
      products: products.flatMap((product) => {
        if (product.active === false) return [];
        const summary = toProductSummary(product);
        return summary ? [summary] : [];
      }),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

/** Oppretter en vare eller tjeneste i Fiken. */
export async function POST(request: Request) {
  const guard = await requireStaff();
  if (guard.response) return guard.response;

  try {
    const input = createProductSchema.parse(await request.json());
    const client = await getFikenClient();
    const product = await client.createProduct(toProductWrite(input));
    const summary = toProductSummary(product);
    if (!summary) {
      return NextResponse.json(
        { code: "fiken_error", message: "Fiken opprettet varen, men svaret kunne ikke leses" },
        { status: 502 }
      );
    }
    return NextResponse.json({ product: summary }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
