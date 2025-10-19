"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Enable2FADialog } from "@/components/admin/security/Enable2FADialog";
import { Disable2FADialog } from "@/components/admin/security/Disable2FADialog";
import { RegenerateBackupCodesDialog } from "@/components/admin/security/RegenerateBackupCodesDialog";

interface TwoFactorSettingsProps {
  enabled: boolean;
  backupCodesCount: number;
}

export function TwoFactorSettings({ enabled, backupCodesCount }: TwoFactorSettingsProps) {
  const [isEnableOpen, setIsEnableOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Innstillinger</CardTitle>
          <CardDescription>
            Administrer to-faktor autentisering for din konto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!enabled ? (
            <div>
              <Button onClick={() => setIsEnableOpen(true)} size="lg">
                Aktiver 2FA
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Vi anbefaler at alle brukere aktiverer 2FA for økt sikkerhet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Button
                  onClick={() => setIsRegenerateOpen(true)}
                  variant="outline"
                >
                  Generer nye backup-koder
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Bruk denne hvis du har brukt opp alle backup-kodene
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={() => setIsDisableOpen(true)}
                  variant="destructive"
                >
                  Deaktiver 2FA
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Dette vil fjerne det ekstra sikkerhetslaget fra kontoen din
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Enable2FADialog
        open={isEnableOpen}
        onOpenChange={setIsEnableOpen}
      />

      <Disable2FADialog
        open={isDisableOpen}
        onOpenChange={setIsDisableOpen}
      />

      <RegenerateBackupCodesDialog
        open={isRegenerateOpen}
        onOpenChange={setIsRegenerateOpen}
      />
    </>
  );
}

