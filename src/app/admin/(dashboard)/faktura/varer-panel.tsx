"use client";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNokFromOre, VAT_LABEL } from "@/lib/integrations/fiken/money";
import type { ProductSummary } from "@/lib/integrations/fiken/types";
import { VareSkjema } from "./vare-skjema";

type VarerPanelProps = {
  products: ProductSummary[];
  onCreated: (product: ProductSummary) => void;
};

/** Liste og opprettelse av varer og tjenester som kan legges på faktura. */
export function VarerPanel({ products, onCreated }: VarerPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Varer og tjenester</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen varer er registrert i Fiken ennå.</p>
          ) : (
            <ul className="divide-y">
              {products.map((product) => (
                <li key={product.productId} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {VAT_LABEL[product.vatType]} · konto {product.incomeAccount}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{formatNokFromOre(product.unitPriceOre)}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ny vare eller tjeneste</CardTitle>
        </CardHeader>
        <CardContent>
          <VareSkjema
            onCreated={(product) => {
              toast.success(`${product.name} er lagret`);
              onCreated(product);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
