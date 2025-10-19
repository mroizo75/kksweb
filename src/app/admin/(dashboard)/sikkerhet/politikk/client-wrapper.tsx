"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createStandardPolicies } from "@/app/actions/security/policies";

interface ClientWrapperProps {
  hasPolicies: boolean;
}

export function ClientWrapper({ hasPolicies }: ClientWrapperProps) {
  const router = useRouter();
  const [isCreatingStandard, setIsCreatingStandard] = useState(false);

  const handleCreateStandard = async () => {
    if (!confirm("Dette vil opprette 5 standard sikkerhetspolitikker. Fortsette?")) {
      return;
    }

    setIsCreatingStandard(true);
    try {
      const result = await createStandardPolicies();

      if (result.success) {
        toast.success(result.message || "Standard-politikker opprettet");
        router.refresh();
      } else {
        toast.error(result.error || "Kunne ikke opprette politikker");
      }
    } catch (error) {
      console.error("Error creating standard policies:", error);
      toast.error("En feil oppstod");
    } finally {
      setIsCreatingStandard(false);
    }
  };

  return (
    <div className="flex gap-2">
      {!hasPolicies && (
        <Button
          onClick={handleCreateStandard}
          disabled={isCreatingStandard}
          variant="default"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isCreatingStandard ? "Oppretter..." : "Opprett standard-politikker"}
        </Button>
      )}
      <Button variant="outline">
        <Plus className="mr-2 h-4 w-4" />
        Ny politikk
      </Button>
    </div>
  );
}

