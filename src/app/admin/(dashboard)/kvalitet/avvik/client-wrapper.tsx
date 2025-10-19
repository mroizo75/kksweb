"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NonConformanceDialog } from "@/components/admin/qms/NonConformanceDialog";

interface ClientWrapperProps {
  users: Array<{ id: string; name: string | null; email: string }>;
  companies: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; title: string }>;
}

export function ClientWrapper({ users, companies, courses }: ClientWrapperProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nytt avvik
      </Button>

      <NonConformanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        users={users}
        companies={companies}
        courses={courses}
      />
    </>
  );
}

