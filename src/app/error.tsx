"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <AlertTriangle className="h-20 w-20 mx-auto mb-6 text-orange-500" />
        <h1 className="text-4xl font-bold mb-4">Noe gikk galt</h1>
        <p className="text-xl text-muted-foreground mb-8">
          En uventet feil oppstod. Prøv å laste siden på nytt, eller kontakt
          oss hvis problemet vedvarer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => reset()}>
            Prøv igjen
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/">Gå til forsiden</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
