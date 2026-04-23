"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "kks-cookie-consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pointer-events-none">
      <div className="mx-auto max-w-4xl rounded-xl border bg-background p-6 shadow-lg pointer-events-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold">Informasjonskapsler</p>
            <p className="text-sm text-muted-foreground">
              Vi bruker informasjonskapsler for å forbedre din opplevelse. Les
              vår{" "}
              <Link href="/personvern" className="text-primary underline">
                personvernerklæring
              </Link>{" "}
              for mer informasjon.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={decline}>
              Kun nødvendige
            </Button>
            <Button size="sm" onClick={accept}>
              Godta alle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
