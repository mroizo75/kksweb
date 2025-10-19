"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { exportPersonData } from "@/app/actions/gdpr/data-export";
import { requestDataDeletion, checkDeletionEligibility } from "@/app/actions/gdpr/data-deletion";

interface GDPRActionsProps {
  personId: string;
}

export function GDPRActions({ personId }: GDPRActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eligibility, setEligibility] = useState<any>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportPersonData();

      if (result.success && result.data && result.filename) {
        // Last ned som JSON
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
      setIsExporting(false);
    }
  };

  const handleCheckEligibility = async () => {
    try {
      const result = await checkDeletionEligibility(personId);
      if (result.success) {
        setEligibility(result);
      } else {
        toast.error(result.error || "Kunne ikke sjekke status");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("En feil oppstod");
    }
  };

  const handleDelete = async () => {
    if (!deleteReason || deleteReason.length < 10) {
      toast.error("Oppgi en årsak (minst 10 tegn)");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await requestDataDeletion({
        personId,
        reason: deleteReason,
        deleteAll: false,
      });

      if (result.success) {
        if (result.anonymized) {
          toast.success("Persondata anonymisert");
        } else if (result.deleted) {
          toast.success("Persondata slettet");
        }
        setDeleteDialogOpen(false);
        // Redirect eller refresh
        window.location.href = "/min-side/logg-inn";
      } else {
        toast.error(result.error || "Kunne ikke slette data");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("En feil oppstod");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Handlinger</CardTitle>
        <CardDescription>
          Utøv dine GDPR-rettigheter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Eksporter data */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Eksporter dine data</h3>
              <p className="text-sm text-muted-foreground">
                Last ned alle dine personopplysninger i JSON-format
              </p>
            </div>
          </div>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eksporterer...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Eksporter
              </>
            )}
          </Button>
        </div>

        {/* Slett data */}
        <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium">Slett dine data</h3>
              <p className="text-sm text-muted-foreground">
                Be om sletting eller anonymisering av dine personopplysninger
              </p>
            </div>
          </div>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" onClick={handleCheckEligibility}>
                <Trash2 className="mr-2 h-4 w-4" />
                Be om sletting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Be om sletting av persondata</DialogTitle>
                <DialogDescription>
                  I henhold til GDPR artikkel 17 (retten til sletting)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {eligibility && !eligibility.canDelete && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Kan ikke slette nå:</strong>
                      {eligibility.blockers.activeEnrollments > 0 && (
                        <p>• {eligibility.blockers.activeEnrollments} aktive påmeldinger</p>
                      )}
                      {eligibility.blockers.activeCredentials > 0 && (
                        <p>• {eligibility.blockers.activeCredentials} aktive kompetansebevis</p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {eligibility && eligibility.mustAnonymize && (
                  <Alert>
                    <AlertDescription>
                      <strong>Merk:</strong> Du har historiske records (kurspåmeldinger, kompetansebevis).
                      Vi vil anonymisere dine persondata, men beholde records av juridiske årsaker.
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="reason">Årsak til sletting</Label>
                  <Textarea
                    id="reason"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Oppgi årsak til at du ønsker å slette dine data..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 10 tegn
                  </p>
                </div>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Advarsel:</strong> Denne handlingen kan ikke angres.
                    Alle dine personopplysninger vil bli slettet eller anonymisert.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setDeleteDialogOpen(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={isDeleting}
                  >
                    Avbryt
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="flex-1"
                    disabled={isDeleting || !eligibility?.canDelete}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sletter...
                      </>
                    ) : (
                      "Bekreft sletting"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

