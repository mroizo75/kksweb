"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, RefreshCw } from "lucide-react";
import { CorrectiveActionDialog } from "@/components/admin/qms/CorrectiveActionDialog";
import { StatusChangeDialog } from "@/components/admin/qms/StatusChangeDialog";

interface ClientActionsProps {
  ncId: string;
  users: Array<{ id: string; name: string | null; email: string }>;
}

interface StatusButtonProps {
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

export function EditButton() {
  return (
    <Button variant="outline">
      <Edit className="h-4 w-4 mr-2" />
      Rediger avvik
    </Button>
  );
}

export function StatusButton({
  ncId,
  currentStatus,
  severity,
  hasCorrectiveActions,
  allowedTransitions,
}: StatusButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Endre status
      </Button>

      <StatusChangeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ncId={ncId}
        currentStatus={currentStatus}
        severity={severity}
        hasCorrectiveActions={hasCorrectiveActions}
        allowedTransitions={allowedTransitions}
      />
    </>
  );
}

export function NewActionButton({ ncId, users }: ClientActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nytt tiltak
      </Button>

      <CorrectiveActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ncId={ncId}
        users={users}
      />
    </>
  );
}

