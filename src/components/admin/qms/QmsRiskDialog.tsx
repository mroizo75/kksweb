"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { riskSchema, type RiskInput } from "@/lib/validations/qms";
import { createQmsRisk } from "@/app/actions/qms/risks";

interface QmsRiskDialogProps {
  users: { id: string; name: string | null; email: string }[];
}

export function QmsRiskDialog({ users }: QmsRiskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<RiskInput>({
    resolver: zodResolver(riskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "OPERATIONAL",
      process: "",
      likelihood: 3,
      consequence: 3,
      mitigationPlan: "",
      ownerId: "",
      reviewDate: "",
    },
  });

  async function onSubmit(data: RiskInput) {
    setLoading(true);

    try {
      const result = await createQmsRisk(data);

      if (result.success) {
        toast.success(result.message);
        form.reset();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Noe gikk galt");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Kalkuler risikoscore live
  const likelihood = form.watch("likelihood");
  const consequence = form.watch("consequence");
  const riskScore = likelihood * consequence;

  function getRiskColor(score: number): string {
    if (score >= 15) return "text-red-600";
    if (score >= 8) return "text-yellow-600";
    return "text-green-600";
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ny risiko
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Registrer ny risiko</DialogTitle>
          <DialogDescription>
            Identifiser og vurder en risiko i kvalitetssystemet
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tittel */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tittel *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="f.eks. Manglende kompetanse hos instruktører"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Beskrivelse */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beskrivelse *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beskriv risikoen i detalj"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kategori */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STRATEGIC">Strategisk</SelectItem>
                      <SelectItem value="OPERATIONAL">Operasjonell</SelectItem>
                      <SelectItem value="FINANCIAL">Økonomisk</SelectItem>
                      <SelectItem value="COMPLIANCE">Regelverk</SelectItem>
                      <SelectItem value="REPUTATION">Omdømme</SelectItem>
                      <SelectItem value="SAFETY">HMS/Sikkerhet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prosess */}
            <FormField
              control={form.control}
              name="process"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prosess</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="f.eks. Kursproduksjon, Kundeservice"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sannsynlighet og Konsekvens */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="likelihood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sannsynlighet (1-5) *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Svært usannsynlig</SelectItem>
                        <SelectItem value="2">2 - Usannsynlig</SelectItem>
                        <SelectItem value="3">3 - Mulig</SelectItem>
                        <SelectItem value="4">4 - Sannsynlig</SelectItem>
                        <SelectItem value="5">5 - Svært sannsynlig</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="consequence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konsekvens (1-5) *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Ubetydelig</SelectItem>
                        <SelectItem value="2">2 - Mindre</SelectItem>
                        <SelectItem value="3">3 - Moderat</SelectItem>
                        <SelectItem value="4">4 - Alvorlig</SelectItem>
                        <SelectItem value="5">5 - Kritisk</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Risikoscore (beregnet) */}
            <div className="rounded-lg border p-4 bg-muted">
              <p className="text-sm font-medium text-muted-foreground">
                Risikoscore (beregnet)
              </p>
              <p className={`text-3xl font-bold ${getRiskColor(riskScore)}`}>
                {riskScore}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {riskScore >= 15 && "⚠️ HØY RISIKO"}
                {riskScore >= 8 && riskScore < 15 && "⚡ MIDDELS RISIKO"}
                {riskScore < 8 && "✅ LAV RISIKO"}
              </p>
            </div>

            {/* Tiltaksplan */}
            <FormField
              control={form.control}
              name="mitigationPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiltaksplan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beskriv hvilke tiltak som skal iverksettes for å redusere risikoen"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Risikoeier */}
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risikoeier *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg ansvarlig" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Hvem som er ansvarlig for risikoen
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Neste revidering */}
            <FormField
              control={form.control}
              name="reviewDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neste revidering *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Når risikoen skal vurderes på nytt
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrer risiko
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

