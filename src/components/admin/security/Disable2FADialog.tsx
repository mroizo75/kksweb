"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { disable2FA } from "@/app/actions/security/2fa";
import { AlertTriangle } from "lucide-react";

interface Disable2FADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Disable2FADialog({ open, onOpenChange }: Disable2FADialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const handleDisable = async () => {
    if (!password || !token || token.length !== 6) {
      toast.error("Fyll ut alle feltene");
      return;
    }

    setIsLoading(true);
    try {
      const result = await disable2FA({ password, token });

      if (result.success) {
        toast.success("2FA deaktivert");
        onOpenChange(false);
        router.refresh();
        // Reset
        setPassword("");
        setToken("");
      } else {
        toast.error(result.error || "Kunne ikke deaktivere 2FA");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("En feil oppstod");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Deaktiver to-faktor autentisering</DialogTitle>
          <DialogDescription>
            Bekreft at du vil fjerne det ekstra sikkerhetslaget
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Advarsel!</strong> Dette vil redusere sikkerheten på kontoen din.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="password">Passord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Oppgi ditt passord"
            />
          </div>

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
              onClick={handleDisable}
              variant="destructive"
              className="flex-1"
              disabled={isLoading || !password || token.length !== 6}
            >
              {isLoading ? "Deaktiverer..." : "Deaktiver 2FA"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

