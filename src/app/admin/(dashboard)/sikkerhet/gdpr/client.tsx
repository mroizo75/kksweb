"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Trash2, Loader2, Search } from "lucide-react";
import { exportPersonData } from "@/app/actions/gdpr/data-export";
import { checkDeletionEligibility } from "@/app/actions/gdpr/data-deletion";

export function GDPRAdminActions() {
  const [personId, setPersonId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!personId) {
      toast.error("Oppgi Person ID");
      return;
    }

    setIsLoading(true);
    try {
      const result = await exportPersonData(personId);

      if (result.success && result.data && result.filename) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        link.click();
        URL.revokeObjectURL(url);

        toast.success("Persondata eksportert!");
      } else {
        toast.error(result.error || "Kunne ikke eksportere data");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("En feil oppstod");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!personId) {
      toast.error("Oppgi Person ID");
      return;
    }

    setIsLoading(true);
    try {
      const result = await checkDeletionEligibility(personId);

      if (result.success) {
        const message = result.canDelete
          ? `✅ Kan slettes ${result.mustAnonymize ? "(må anonymiseres)" : "(full sletting)"}`
          : `❌ Kan ikke slettes: ${result.blockers?.activeEnrollments || 0} aktive påmeldinger, ${result.blockers?.activeCredentials || 0} aktive bevis`;

        toast.info(message, { duration: 5000 });
      } else {
        toast.error(result.error || "Kunne ikke sjekke status");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("En feil oppstod");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin-handlinger</CardTitle>
        <CardDescription>
          Eksporter eller slett persondata for brukere
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="personId">Person ID</Label>
          <Input
            id="personId"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            placeholder="Oppgi Person ID (finn i /admin/kunder)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button
            onClick={handleExport}
            disabled={isLoading || !personId}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Eksporter data
          </Button>

          <Button
            onClick={handleCheck}
            disabled={isLoading || !personId}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Sjekk sletting
          </Button>

          <Button
            disabled
            variant="destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Slett (via Min side)
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          <strong>Merk:</strong> Sletting må gjøres av brukeren selv via "Min side" → "Personvern",
          eller ved å kontakte support med gyldig identifikasjon.
        </p>
      </CardContent>
    </Card>
  );
}

