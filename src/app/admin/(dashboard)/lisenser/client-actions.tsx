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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MoreHorizontal, Ban, CheckCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createLicense, suspendLicense, resumeLicense, updateLicense } from "@/app/actions/license/manageLicense";
import { useRouter } from "next/navigation";

interface License {
  id: string;
  status: string;
  startDate: Date;
  endDate: Date;
  gracePeriodDays: number;
  maxUsers: number | null;
  maxEnrollments: number | null;
  monthlyPrice: number | null;
  annualPrice: number | null;
  notes: string | null;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
}

interface CreateActionsProps {
  type: "create";
}

interface ManageActionsProps {
  type: "manage";
  license: License;
  companyId: string;
}

type ClientActionsProps = CreateActionsProps | ManageActionsProps;

export function ClientActions(props: ClientActionsProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [extendDays, setExtendDays] = useState<number>(0);

  if (props.type === "create") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ny Lisens
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Opprett Ny Lisens</DialogTitle>
            <DialogDescription>
              Opprett en ny lisens for en bedrift
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsCreating(true);

              const formData = new FormData(e.currentTarget);
              const result = await createLicense({
                companyId: formData.get("companyId") as string,
                startDate: formData.get("startDate") as string,
                endDate: formData.get("endDate") as string,
                gracePeriodDays: parseInt(formData.get("gracePeriodDays") as string),
                maxUsers: formData.get("maxUsers")
                  ? parseInt(formData.get("maxUsers") as string)
                  : null,
                maxEnrollments: formData.get("maxEnrollments")
                  ? parseInt(formData.get("maxEnrollments") as string)
                  : null,
                monthlyPrice: formData.get("monthlyPrice")
                  ? parseFloat(formData.get("monthlyPrice") as string)
                  : null,
                annualPrice: formData.get("annualPrice")
                  ? parseFloat(formData.get("annualPrice") as string)
                  : null,
                notes: formData.get("notes") as string,
              });

              setIsCreating(false);

              if (result.success) {
                toast.success("Lisens opprettet");
                router.refresh();
              } else {
                toast.error(result.error);
              }
            }}
          >
            <div className="space-y-4">
              {/* Company ID - i produksjon bruk en select med companies */}
              <div>
                <Label htmlFor="companyId">Bedrift ID *</Label>
                <Input id="companyId" name="companyId" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Startdato *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Sluttdato *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gracePeriodDays">Grace Period (dager)</Label>
                <Input
                  id="gracePeriodDays"
                  name="gracePeriodDays"
                  type="number"
                  defaultValue={14}
                  min={0}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUsers">Maks Brukere</Label>
                  <Input
                    id="maxUsers"
                    name="maxUsers"
                    type="number"
                    min={1}
                    placeholder="Ubegrenset"
                  />
                </div>
                <div>
                  <Label htmlFor="maxEnrollments">Maks Påmeldinger</Label>
                  <Input
                    id="maxEnrollments"
                    name="maxEnrollments"
                    type="number"
                    min={1}
                    placeholder="Ubegrenset"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyPrice">Måned Pris (kr)</Label>
                  <Input
                    id="monthlyPrice"
                    name="monthlyPrice"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="annualPrice">Årspris (kr)</Label>
                  <Input
                    id="annualPrice"
                    name="annualPrice"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notater</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Oppretter..." : "Opprett Lisens"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Manage actions
  const { license, companyId } = props;
  const canSuspend = license.status === "ACTIVE" || license.status === "TRIAL";
  const canResume = license.status === "SUSPENDED" || license.status === "EXPIRED";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canSuspend && (
            <DropdownMenuItem onSelect={() => setIsSuspending(true)}>
              <Ban className="mr-2 h-4 w-4" />
              Suspender
            </DropdownMenuItem>
          )}
          {canResume && (
            <DropdownMenuItem onSelect={() => setIsResuming(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Reaktiver
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Rediger
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Suspend Dialog */}
      <AlertDialog open={isSuspending} onOpenChange={setIsSuspending}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspender Lisens</AlertDialogTitle>
            <AlertDialogDescription>
              Suspender lisens for <strong>{license.company.name}</strong>?
              <br />
              Alle ansatte i bedriften vil miste tilgang til systemet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="suspendReason">Årsak (påkrevd)</Label>
            <Textarea
              id="suspendReason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="F.eks. Manglende betaling"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!suspendReason.trim()) {
                  toast.error("Årsak er påkrevd");
                  return;
                }
                const result = await suspendLicense(companyId, suspendReason);
                if (result.success) {
                  toast.success("Lisens suspendert");
                  router.refresh();
                  setSuspendReason("");
                } else {
                  toast.error(result.error);
                }
              }}
            >
              Suspender
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Dialog */}
      <AlertDialog open={isResuming} onOpenChange={setIsResuming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reaktiver Lisens</AlertDialogTitle>
            <AlertDialogDescription>
              Reaktiver lisens for <strong>{license.company.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="extendDays">Forleng med (dager)</Label>
            <Input
              id="extendDays"
              type="number"
              value={extendDays}
              onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
              min={0}
              placeholder="0 = ingen forlengelse"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const result = await resumeLicense(companyId, extendDays || undefined);
                if (result.success) {
                  toast.success("Lisens reaktivert");
                  router.refresh();
                  setExtendDays(0);
                } else {
                  toast.error(result.error);
                }
              }}
            >
              Reaktiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rediger Lisens</DialogTitle>
            <DialogDescription>
              Oppdater lisens for {license.company.name}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const result = await updateLicense({
                id: license.id,
                endDate: formData.get("endDate") as string,
                gracePeriodDays: parseInt(formData.get("gracePeriodDays") as string),
                maxUsers: formData.get("maxUsers")
                  ? parseInt(formData.get("maxUsers") as string)
                  : null,
                maxEnrollments: formData.get("maxEnrollments")
                  ? parseInt(formData.get("maxEnrollments") as string)
                  : null,
                monthlyPrice: formData.get("monthlyPrice")
                  ? parseFloat(formData.get("monthlyPrice") as string)
                  : null,
                annualPrice: formData.get("annualPrice")
                  ? parseFloat(formData.get("annualPrice") as string)
                  : null,
                notes: formData.get("notes") as string,
              });

              if (result.success) {
                toast.success("Lisens oppdatert");
                setIsEditing(false);
                router.refresh();
              } else {
                toast.error(result.error);
              }
            }}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-endDate">Sluttdato *</Label>
                <Input
                  id="edit-endDate"
                  name="endDate"
                  type="date"
                  defaultValue={new Date(license.endDate).toISOString().split("T")[0]}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-gracePeriodDays">Grace Period (dager)</Label>
                <Input
                  id="edit-gracePeriodDays"
                  name="gracePeriodDays"
                  type="number"
                  defaultValue={license.gracePeriodDays}
                  min={0}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-maxUsers">Maks Brukere</Label>
                  <Input
                    id="edit-maxUsers"
                    name="maxUsers"
                    type="number"
                    defaultValue={license.maxUsers || ""}
                    min={1}
                    placeholder="Ubegrenset"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-maxEnrollments">Maks Påmeldinger</Label>
                  <Input
                    id="edit-maxEnrollments"
                    name="maxEnrollments"
                    type="number"
                    defaultValue={license.maxEnrollments || ""}
                    min={1}
                    placeholder="Ubegrenset"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-monthlyPrice">Måned Pris (kr)</Label>
                  <Input
                    id="edit-monthlyPrice"
                    name="monthlyPrice"
                    type="number"
                    defaultValue={license.monthlyPrice || ""}
                    min={0}
                    step={0.01}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-annualPrice">Årspris (kr)</Label>
                  <Input
                    id="edit-annualPrice"
                    name="annualPrice"
                    type="number"
                    defaultValue={license.annualPrice || ""}
                    min={0}
                    step={0.01}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-notes">Notater</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  defaultValue={license.notes || ""}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Avbryt
              </Button>
              <Button type="submit">Lagre Endringer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

