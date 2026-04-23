"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { deleteBlogPost, toggleBlogPostStatus } from "@/app/actions/admin/blog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BlogActionsProps {
  postId: string;
  status: string;
}

export function BlogActions({ postId, status }: BlogActionsProps) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    setToggling(true);
    const result = await toggleBlogPostStatus(postId);
    setToggling(false);

    if (result.success) {
      toast.success(result.status === "PUBLISHED" ? "Artikkel publisert" : "Artikkel satt som utkast");
      router.refresh();
    } else {
      toast.error(result.error ?? "Noe gikk galt");
    }
  }

  async function handleDelete() {
    const result = await deleteBlogPost(postId);
    if (result.success) {
      toast.success("Artikkel slettet");
      router.refresh();
    } else {
      toast.error(result.error ?? "Kunne ikke slette");
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title={status === "PUBLISHED" ? "Gjør til utkast" : "Publiser"}
        onClick={handleToggle}
        disabled={toggling}
      >
        {toggling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "PUBLISHED" ? (
          <ToggleRight className="h-4 w-4 text-green-600" />
        ) : (
          <ToggleLeft className="h-4 w-4" />
        )}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Slett">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett artikkel?</AlertDialogTitle>
            <AlertDialogDescription>
              Denne handlingen kan ikke angres. Artikkelen og alt tilhørende innhold
              slettes permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
