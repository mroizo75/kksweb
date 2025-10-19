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
import { kpiSchema, type KpiInput } from "@/lib/validations/qms";
import { createQmsKpi } from "@/app/actions/qms/kpis";
import { AVAILABLE_CALCULATIONS } from "@/lib/kpi-calculator";
import { Checkbox } from "@/components/ui/checkbox";

interface QmsKpiDialogProps {
  users: { id: string; name: string | null; email: string }[];
}

export function QmsKpiDialog({ users }: QmsKpiDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isAutomatic, setIsAutomatic] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<string>("");

  const form = useForm<KpiInput>({
    resolver: zodResolver(kpiSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "QUALITY",
      unit: "%",
      target: 0,
      threshold: undefined,
      frequency: "MONTHLY",
      dataSource: "",
      ownerId: "",
    },
  });

  // Auto-fyll når automatisk beregning velges
  function handleCalculationChange(calculationType: string) {
    setSelectedCalculation(calculationType);
    const calc = AVAILABLE_CALCULATIONS.find((c) => c.type === calculationType);
    if (calc) {
      form.setValue("name", calc.name);
      form.setValue("description", calc.description);
      form.setValue("category", calc.category);
      form.setValue("unit", calc.unit);
      form.setValue("dataSource", `Automatisk: ${calc.description}`);
    }
  }

  async function onSubmit(data: KpiInput) {
    setLoading(true);

    try {
      const result = await createQmsKpi({
        ...data,
        isAutomatic,
        calculationRule: isAutomatic ? selectedCalculation : undefined,
      });

      if (result.success) {
        toast.success(result.message);
        form.reset();
        setOpen(false);
        setIsAutomatic(false);
        setSelectedCalculation("");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ny KPI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Opprett ny KPI</DialogTitle>
          <DialogDescription>
            Definer en ny nøkkelindikator for kvalitetssystemet
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Automatisk beregning */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="automatic"
                checked={isAutomatic}
                onCheckedChange={(checked) => {
                  setIsAutomatic(checked as boolean);
                  if (!checked) {
                    setSelectedCalculation("");
                  }
                }}
              />
              <label
                htmlFor="automatic"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Automatisk beregning
              </label>
            </div>

            {/* Velg beregningstype */}
            {isAutomatic && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Beregningstype *
                </label>
                <Select
                  onValueChange={handleCalculationChange}
                  value={selectedCalculation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg hva som skal beregnes" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {AVAILABLE_CALCULATIONS.map((calc) => (
                      <SelectItem key={calc.type} value={calc.type}>
                        {calc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Velg hvilken data som skal beregnes automatisk
                </p>
              </div>
            )}

            {/* Navn */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Navn *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="f.eks. Kundetilfredshet"
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
                  <FormLabel>Beskrivelse</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beskriv hva som måles og hvorfor"
                      rows={2}
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
                      <SelectItem value="QUALITY">Kvalitet</SelectItem>
                      <SelectItem value="DELIVERY">Leveranse/Tid</SelectItem>
                      <SelectItem value="CUSTOMER">
                        Kundetilfredshet
                      </SelectItem>
                      <SelectItem value="FINANCIAL">Økonomi</SelectItem>
                      <SelectItem value="PROCESS">Prosess</SelectItem>
                      <SelectItem value="PERSONNEL">Personell</SelectItem>
                      <SelectItem value="SAFETY">HMS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enhet, Mål, Grenseverdi */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enhet *</FormLabel>
                    <FormControl>
                      <Input placeholder="%, antall, timer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mål *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grenseverdi</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valgfritt"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Frekvens */}
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Målefrekvens *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg frekvens" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DAILY">Daglig</SelectItem>
                      <SelectItem value="WEEKLY">Ukentlig</SelectItem>
                      <SelectItem value="MONTHLY">Månedlig</SelectItem>
                      <SelectItem value="QUARTERLY">Kvartalsvis</SelectItem>
                      <SelectItem value="YEARLY">Årlig</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Datakilde */}
            <FormField
              control={form.control}
              name="dataSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Datakilde</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="f.eks. Kundeundersøkelse, CRM-system"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Hvor hentes data fra?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ansvarlig */}
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ansvarlig *</FormLabel>
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
                    Hvem som er ansvarlig for KPIen
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
                Opprett KPI
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

