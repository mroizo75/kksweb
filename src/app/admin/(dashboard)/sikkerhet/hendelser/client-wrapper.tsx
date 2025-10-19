"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SecurityIncidentDialog } from "@/components/admin/security/SecurityIncidentDialog";

export function ClientWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Ny hendelse
      </Button>

      <SecurityIncidentDialog
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}

