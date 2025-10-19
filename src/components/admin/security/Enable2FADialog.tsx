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
import { setup2FA, enable2FA } from "@/app/actions/security/2fa";
import { AlertTriangle, Copy, CheckCircle } from "lucide-react";
import Image from "next/image";

interface Enable2FADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Enable2FADialog({ open, onOpenChange }: Enable2FADialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "verify" | "backup">("setup");
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const result = await setup2FA();

      if (result.success && result.secret && result.qrCode) {
        setSecret(result.secret);
        setQrCode(result.qrCode);
        setStep("verify");
      } else {
        toast.error(result.error || "Kunne ikke sette opp 2FA");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("En feil oppstod");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      toast.error("Oppgi en 6-sifret kode");
      return;
    }

    setIsLoading(true);
    try {
      const result = await enable2FA({ secret, token });

      if (result.success && result.backupCodes) {
        setBackupCodes(result.backupCodes);
        setStep("backup");
        toast.success("2FA aktivert!");
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

  const handleComplete = () => {
    onOpenChange(false);
    router.refresh();
    // Reset state
    setStep("setup");
    setSecret("");
    setQrCode("");
    setToken("");
    setBackupCodes([]);
    setCopiedSecret(false);
    setCopiedBackup(false);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    toast.success("Secret kopiert");
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedBackup(true);
    toast.success("Backup-koder kopiert");
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aktiver to-faktor autentisering</DialogTitle>
          <DialogDescription>
            {step === "setup" && "Sett opp 2FA for din konto"}
            {step === "verify" && "Skann QR-koden med autentiserings-appen"}
            {step === "backup" && "Lagre backup-kodene dine"}
          </DialogDescription>
        </DialogHeader>

        {/* STEG 1: Setup */}
        {step === "setup" && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Før du starter:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Last ned Google Authenticator eller Authy</li>
                    <li>Klikk "Start oppsett"</li>
                    <li>Skann QR-koden i appen</li>
                    <li>Oppgi 6-sifret kode</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <Button onClick={handleSetup} disabled={isLoading} className="w-full">
              {isLoading ? "Setter opp..." : "Start oppsett"}
            </Button>
          </div>
        )}

        {/* STEG 2: Verify */}
        {step === "verify" && qrCode && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Skann denne QR-koden i autentiserings-appen din
              </p>
              <div className="flex justify-center">
                <Image
                  src={qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                  className="border rounded"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">
                Eller oppgi denne koden manuelt:
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={copySecret}
                  variant="outline"
                  size="icon"
                >
                  {copiedSecret ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="token">
                Oppgi 6-sifret kode fra appen
              </Label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={isLoading || token.length !== 6}
              className="w-full"
            >
              {isLoading ? "Verifiserer..." : "Verifiser og aktiver"}
            </Button>
          </div>
        )}

        {/* STEG 3: Backup codes */}
        {step === "backup" && backupCodes.length > 0 && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Viktig!</strong> Lagre disse backup-kodene på et trygt sted.
                Du vil trenge dem hvis du mister telefonen.
              </AlertDescription>
            </Alert>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Backup-koder (10 stk)</Label>
                <Button
                  onClick={copyBackupCodes}
                  variant="outline"
                  size="sm"
                >
                  {copiedBackup ? (
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

