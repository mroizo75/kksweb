"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function CalculateKpisButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCalculate() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/qms/kpi/calculate", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        if (result.errors && result.errors.length > 0) {
          toast.error(`${result.message}\n${result.errors.join("\n")}`);
        } else {
          toast.error(result.message || "Kunne ikke beregne KPIer");
        }
        router.refresh();
      }
    } catch (error) {
      toast.error("Noe gikk galt ved beregning av KPIer");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleCalculate} disabled={loading} variant="outline">
      {loading ? (
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      Beregn automatiske KPIer
    </Button>
  );
}

