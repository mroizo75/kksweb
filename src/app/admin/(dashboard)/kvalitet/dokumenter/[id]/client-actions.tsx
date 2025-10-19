"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, MoreVertical, XCircle, Archive, Play } from "lucide-react";
import { toast } from "sonner";
import {
  approveQmsDocument,
  activateQmsDocument,
  archiveQmsDocument,
} from "@/app/actions/qms/documents";
import type { QmsDocStatus } from "@prisma/client";

interface DocumentActionsProps {
  document: {
    id: string;
    status: QmsDocStatus;
  };
}

export function DocumentActions({ document }: DocumentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  async function handleApprove() {
    setLoading(true);
    try {
      const result = await approveQmsDocument(document.id, true);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setLoading(false);
      setShowApproveDialog(false);
    }
  }

  async function handleReject() {
    setLoading(true);
    try {
      const result = await approveQmsDocument(document.id, false);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setLoading(false);
      setShowRejectDialog(false);
    }
  }

  async function handleActivate() {
    setLoading(true);
    try {
      const result = await activateQmsDocument(document.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setLoading(false);
      setShowActivateDialog(false);
    }
  }

  async function handleArchive() {
    setLoading(true);
    try {
      const result = await archiveQmsDocument(document.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
    } finally {
      setLoading(false);
      setShowArchiveDialog(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <MoreVertical className="h-4 w-4" />
            <span className="ml-2">Handlinger</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Dokumenthandlinger</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Godkjenn - kun for REVIEW */}
          {(document.status === "REVIEW" || document.status === "DRAFT") && (
            <DropdownMenuItem
              onClick={() => setShowApproveDialog(true)}
              disabled={loading}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Godkjenn dokument
            </DropdownMenuItem>
          )}

          {/* Avvis - kun for REVIEW */}
          {document.status === "REVIEW" && (
            <DropdownMenuItem
              onClick={() => setShowRejectDialog(true)}
              disabled={loading}
            >
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              Avvis (tilbake til utkast)
            </DropdownMenuItem>
          )}

          {/* Aktiver - kun for APPROVED */}
          {document.status === "APPROVED" && (
            <DropdownMenuItem
              onClick={() => setShowActivateDialog(true)}
              disabled={loading}
            >
              <Play className="mr-2 h-4 w-4 text-blue-600" />
              Sett som aktiv
            </DropdownMenuItem>
          )}

          {/* Arkiver - kun for EFFECTIVE */}
          {document.status === "EFFECTIVE" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowArchiveDialog(true)}
                disabled={loading}
                className="text-orange-600"
              >
                <Archive className="mr-2 h-4 w-4" />
                Arkiver dokument
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Godkjenn Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Godkjenn dokument?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil godkjenne dokumentet og sette status til "Godkjent". Du
              kan deretter aktivere dokumentet for bruk.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={loading}>
              Godkjenn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Avvis Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Avvis dokument?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil sende dokumentet tilbake til utkast-status for videre
              bearbeiding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={loading}>
              Avvis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Aktiver Dialog */}
      <AlertDialog
        open={showActivateDialog}
        onOpenChange={setShowActivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aktiver dokument?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil sette dokumentet som "Aktiv" og gjøre det tilgjengelig
              for bruk i kvalitetssystemet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate} disabled={loading}>
              Aktiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Arkiver Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arkiver dokument?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette vil arkivere dokumentet. Arkiverte dokumenter er ikke lenger
              aktive, men kan fortsatt ses i systemet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={loading}>
              Arkiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

