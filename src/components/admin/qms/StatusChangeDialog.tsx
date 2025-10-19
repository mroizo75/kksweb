"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateNonConformanceStatus } from "@/app/actions/qms/updateStatus";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ncId: string;
  currentStatus: string;
  severity: string;
  hasCorrectiveActions: boolean;
  allowedTransitions: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  ncId,
  currentStatus,
  allowedTransitions,
}: StatusChangeDialogProps) {
  const [newStatus, setNewStatus] = useState<string>("");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!newStatus || newStatus === currentStatus) {
      toast.error("Velg en ny status");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateNonConformanceStatus(
        ncId,
        newStatus as any,
        comment
      );

      if (result.success) {
        toast.success(result.message);
        setNewStatus("");
        setComment("");
        onOpenChange(false);
        window.location.reload(); // Reload for å oppdatere siden
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedTransition = allowedTransitions.find(
    (t) => t.value === newStatus
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Endre status</DialogTitle>
          <DialogDescription>
            Velg ny status for avviket. ISO 9001 krever at avvik følger en
            prosess før lukking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ny status *</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Velg ny status" />
              </SelectTrigger>
              <SelectContent>
                {allowedTransitions
                  .filter((t) => t.value !== currentStatus)
                  .map((transition) => (
                    <SelectItem key={transition.value} value={transition.value}>
                      {transition.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {selectedTransition && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                <p>{selectedTransition.description}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Kommentar (valgfritt)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Beskriv hvorfor statusen endres..."
              rows={3}
            />
          </div>

          {/* ISO 9001 informasjon */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-gray-50 rounded-lg border">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">ISO 9001 krav:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Avvik må ha korrigerende tiltak før lukking</li>
                <li>Effektivitet av tiltak må verifiseres</li>
                <li>All dokumentasjon må være komplett</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !newStatus}>
            {isLoading ? "Endrer..." : "Endre status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

