"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { regenerateBackupCodes } from "@/app/actions/security/2fa";
import { AlertTriangle, Copy, CheckCircle } from "lucide-react";

interface RegenerateBackupCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegenerateBackupCodesDialog({
  open,
  onOpenChange,
}: RegenerateBackupCodesDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<"verify" | "codes">("verify");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (token.length !== 6) {
      toast.error("Oppgi en 6-sifret kode");
      return;
    }

    setIsLoading(true);
    try {
      const result = await regenerateBackupCodes(token);

      if (result.success && result.backupCodes) {
        setBackupCodes(result.backupCodes);
        setStep("codes");
        toast.success("Nye backup-koder generert");
      } else {
        toast.error(result.error || "Ugyldig token");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("En feil oppstod");
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    toast.success("Backup-koder kopiert");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    onOpenChange(false);
    router.refresh();
    // Reset
    setStep("verify");
    setToken("");
    setBackupCodes([]);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generer nye backup-koder</DialogTitle>
          <DialogDescription>
            {step === "verify"
              ? "Bekreft med 2FA-kode for å generere nye koder"
              : "Lagre de nye backup-kodene dine"}
          </DialogDescription>
        </DialogHeader>

        {/* STEG 1: Verify */}
        {step === "verify" && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                De gamle backup-kodene vil bli ugyldiggjort når du genererer nye.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="token">2FA-kode</Label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-xl tracking-widest font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Oppgi koden fra autentiserings-appen
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Avbryt
              </Button>
              <Button
                onClick={handleGenerate}
                className="flex-1"
                disabled={isLoading || token.length !== 6}
              >
                {isLoading ? "Genererer..." : "Generer nye koder"}
              </Button>
            </div>
          </div>
        )}

        {/* STEG 2: Codes */}
        {step === "codes" && backupCodes.length > 0 && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Viktig!</strong> Lagre disse backup-kodene på et trygt sted.
                De gamle kodene er nå ugyldige.
              </AlertDescription>
            </Alert>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Nye backup-koder (10 stk)</Label>
                <Button
                  onClick={copyBackupCodes}
                  variant="outline"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Kopiert
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Kopier alle
                    </>
                  )}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                {backupCodes.map((code, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="font-mono text-sm py-2 justify-center"
                  >
                    {code}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Hver kode kan kun brukes én gang
              </p>
            </div>

            <Button onClick={handleComplete} className="w-full">
              Ferdig
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

