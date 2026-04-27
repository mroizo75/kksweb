"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  personEnrollmentSchema,
  companyEnrollmentSchema,
  type PersonEnrollmentInput,
  type CompanyEnrollmentInput,
} from "@/lib/validations/enrollment";
import { enrollPerson } from "@/app/actions/enrollPerson";
import { enrollCompany } from "@/app/actions/enrollCompany";
import {
  User,
  Building2,
  CheckCircle,
  Loader2,
  Plus,
  X,
  Calendar,
  MapPin,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  calculateEnrollmentPricing,
  calculateMachinePrice,
  getMachineMultiSelectConfig,
  parseCourseAddOnConfigs,
  type BookingAddOn,
  type CourseAddOnConfig,
} from "@/lib/booking-add-ons";

interface EnrollmentWizardProps {
  sessionId: string;
  courseName: string;
  courseDate: string;
  location: string;
  basePrice: number;
  bookingAddOns: BookingAddOn[];
  /** Raw JSON from course.bookingAddOns — used to extract machine_multi_select if present */
  rawAddOnConfigs?: unknown;
}

type EnrollmentType = "person" | "company";
type WizardStep = "type" | "info" | "success";

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step < current
                ? "bg-amber-500 text-slate-950"
                : step === current
                ? "bg-slate-950 text-white ring-2 ring-amber-500 ring-offset-2"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {step < current ? <CheckCircle className="h-4 w-4" /> : step}
          </div>
          {step < total && (
            <div className={`h-0.5 w-8 ${step < current ? "bg-amber-500" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function CourseSummaryCard({
  courseName,
  courseDate,
  location,
}: {
  courseName: string;
  courseDate: string;
  location: string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
      <h3 className="font-semibold text-slate-900 mb-2 text-sm">Kurs</h3>
      <p className="font-bold text-slate-900">{courseName}</p>
      <div className="mt-2 space-y-1 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {courseDate}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {location}
        </div>
      </div>
    </div>
  );
}

export function EnrollmentWizard({
  sessionId,
  courseName,
  courseDate,
  location,
  basePrice,
  bookingAddOns,
  rawAddOnConfigs,
}: EnrollmentWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("type");
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [step]);

  const allAddOnConfigs: CourseAddOnConfig[] = useMemo(
    () => parseCourseAddOnConfigs(rawAddOnConfigs ?? bookingAddOns),
    [rawAddOnConfigs, bookingAddOns]
  );

  const machineConfig = useMemo(
    () => getMachineMultiSelectConfig(allAddOnConfigs),
    [allAddOnConfigs]
  );

  const machinePrice = useMemo(
    () =>
      machineConfig
        ? calculateMachinePrice(selectedMachines.length, machineConfig.priceTiers)
        : 0,
    [machineConfig, selectedMachines]
  );

  const personForm = useForm<PersonEnrollmentInput>({
    resolver: zodResolver(personEnrollmentSchema),
    defaultValues: {
      sessionId,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
      selectedAddOnIds: [],
    },
  });

  const companyForm = useForm<CompanyEnrollmentInput>({
    resolver: zodResolver(companyEnrollmentSchema),
    defaultValues: {
      sessionId,
      companyName: "",
      orgNo: "",
      companyEmail: "",
      companyPhone: "",
      contactPerson: { firstName: "", lastName: "", email: "", phone: "" },
      participants: [{ firstName: "", lastName: "", email: "", phone: "" }],
      selectedAddOnIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: companyForm.control,
    name: "participants",
  });

  const personSelectedAddOns = personForm.watch("selectedAddOnIds") ?? [];
  const companySelectedAddOns = companyForm.watch("selectedAddOnIds") ?? [];
  const participantCount = fields.length;

  const personPricing = useMemo(
    () =>
      calculateEnrollmentPricing(
        basePrice,
        personSelectedAddOns,
        bookingAddOns,
        1,
        machinePrice
      ),
    [basePrice, bookingAddOns, personSelectedAddOns, machinePrice]
  );

  const companyPricing = useMemo(
    () =>
      calculateEnrollmentPricing(
        basePrice,
        companySelectedAddOns,
        bookingAddOns,
        participantCount,
        machinePrice
      ),
    [basePrice, bookingAddOns, companySelectedAddOns, participantCount, machinePrice]
  );

  const formatNok = (value: number) => `${value.toLocaleString("nb-NO")} kr`;

  const togglePersonAddOn = (addOnId: string, checked: boolean) => {
    const existing = personForm.getValues("selectedAddOnIds") ?? [];
    const selected = checked
      ? [...existing, addOnId]
      : existing.filter((id) => id !== addOnId);
    personForm.setValue("selectedAddOnIds", selected, { shouldValidate: true });
  };

  const toggleCompanyAddOn = (addOnId: string, checked: boolean) => {
    const existing = companyForm.getValues("selectedAddOnIds") ?? [];
    const selected = checked
      ? [...existing, addOnId]
      : existing.filter((id) => id !== addOnId);
    companyForm.setValue("selectedAddOnIds", selected, { shouldValidate: true });
  };

  const toggleMachine = (machine: string) => {
    setSelectedMachines((prev) =>
      prev.includes(machine) ? prev.filter((m) => m !== machine) : [...prev, machine]
    );
  };

  const onSubmitPerson = async (data: PersonEnrollmentInput) => {
    setIsSubmitting(true);
    try {
      const result = await enrollPerson(data);
      if (result.success) {
        setStep("success");
        toast.success(
          result.isWaitlist ? "Du er lagt til på venteliste" : "Påmelding bekreftet!"
        );
      } else {
        toast.error(result.error || "Påmelding feilet");
      }
    } catch {
      toast.error("En uventet feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCompany = async (data: CompanyEnrollmentInput) => {
    setIsSubmitting(true);
    try {
      const result = await enrollCompany(data);
      if (result.success) {
        setStep("success");
        toast.success(
          result.isWaitlist
            ? `${result.enrollmentCount} ${result.enrollmentCount === 1 ? "person" : "personer"} lagt til på venteliste`
            : `${result.enrollmentCount} ${result.enrollmentCount === 1 ? "person" : "personer"} påmeldt!`
        );
      } else {
        toast.error(result.error || "Påmelding feilet");
      }
    } catch {
      toast.error("En uventet feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderAddOnSelector = (
    selectedAddOnIds: string[],
    onToggle: (addOnId: string, checked: boolean) => void,
    idPrefix: string
  ) => {
    if (bookingAddOns.length === 0 && !machineConfig) return null;

    return (
      <div className="space-y-3">
        {/* Machine multi-select */}
        {machineConfig && (
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-semibold text-slate-900 mb-1">{machineConfig.title}</h4>
            {machineConfig.description && (
              <p className="text-xs text-slate-500 mb-3">{machineConfig.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              {machineConfig.options.map((machine) => {
                const selected = selectedMachines.includes(machine);
                return (
                  <button
                    key={machine}
                    type="button"
                    onClick={() => toggleMachine(machine)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      selected
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-white text-slate-700 border-slate-200 hover:border-amber-400"
                    }`}
                  >
                    {machine}
                  </button>
                );
              })}
            </div>
            {selectedMachines.length > 0 && (
              <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="font-semibold">{selectedMachines.length} maskin(er) valgt:</span>{" "}
                {selectedMachines.join(", ")} —{" "}
                <span className="font-bold text-amber-700">{formatNok(machinePrice)}</span>
              </div>
            )}
            <div className="mt-3 space-y-1">
              {machineConfig.priceTiers.map((tier) => (
                <div key={tier.count} className="flex justify-between text-xs text-slate-500">
                  <span>{tier.count} maskin{tier.count > 1 ? "er" : ""}</span>
                  <span className="font-medium">{formatNok(tier.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard add-ons */}
        {bookingAddOns.length > 0 && (
          <div className="border border-slate-200 rounded-xl p-4">
            <h4 className="font-semibold text-slate-900 mb-3">Valgfrie tillegg</h4>
            <div className="space-y-2">
              {bookingAddOns.map((addOn) => {
                const checked = selectedAddOnIds.includes(addOn.id);
                return (
                  <label
                    key={addOn.id}
                    htmlFor={`${idPrefix}-${addOn.id}`}
                    className={`flex items-start justify-between gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      checked
                        ? "border-amber-400 bg-amber-50"
                        : "border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {addOn.image ? (
                        <img
                          src={addOn.image}
                          alt={addOn.title}
                          className="h-10 w-10 rounded-md border border-slate-200 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md border border-slate-200 bg-slate-100 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{addOn.title}</p>
                        {addOn.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{addOn.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-semibold text-sm text-slate-900 whitespace-nowrap">
                        + {formatNok(addOn.price)}
                      </span>
                      <Checkbox
                        id={`${idPrefix}-${addOn.id}`}
                        checked={checked}
                        onCheckedChange={(value) => onToggle(addOn.id, value === true)}
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPriceSummary = (pricing: ReturnType<typeof calculateEnrollmentPricing>, isCompany = false) => (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
      <h4 className="font-semibold text-slate-900 mb-3 text-sm">Prissammendrag</h4>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Kurspris{isCompany ? " per deltaker" : ""}</span>
          <span>{formatNok(pricing.baseUnitPrice)}</span>
        </div>
        {pricing.machinePrice > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Maskinvalg ({selectedMachines.length} maskiner)</span>
            <span>{formatNok(pricing.machinePrice)}</span>
          </div>
        )}
        {pricing.addOnUnitPrice > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Tillegg{isCompany ? " per deltaker" : ""}</span>
            <span>{formatNok(pricing.addOnUnitPrice)}</span>
          </div>
        )}
        {isCompany && (
          <div className="flex justify-between text-slate-600">
            <span>Antall deltakere</span>
            <span>{pricing.participantCount}</span>
          </div>
        )}
        <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-slate-900">
          <span>Totalpris</span>
          <span className="text-amber-700">{formatNok(pricing.totalPrice)}</span>
        </div>
      </div>
    </div>
  );

  // Step 1: Choose enrollment type
  if (step === "type") {
    return (
      <div className="max-w-2xl mx-auto">
        <div ref={topRef} />
        <StepIndicator current={1} total={2} />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Hvem melder du på?</h2>
        <p className="text-slate-500 mb-6">Velg om du melder deg selv eller bedrift</p>

        <CourseSummaryCard
          courseName={courseName}
          courseDate={courseDate}
          location={location}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setEnrollmentType("person");
              setStep("info");
            }}
            className="group flex flex-col items-center p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-lg transition-all text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 group-hover:bg-amber-50 flex items-center justify-center mb-4 transition-colors">
              <User className="h-8 w-8 text-slate-500 group-hover:text-amber-600 transition-colors" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Privatperson</h3>
            <p className="text-sm text-slate-500">Jeg melder meg selv på kurset</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setEnrollmentType("company");
              setStep("info");
            }}
            className="group flex flex-col items-center p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-amber-400 hover:shadow-lg transition-all text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 group-hover:bg-amber-50 flex items-center justify-center mb-4 transition-colors">
              <Building2 className="h-8 w-8 text-slate-500 group-hover:text-amber-600 transition-colors" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Bedrift</h3>
            <p className="text-sm text-slate-500">Jeg melder på ansatte fra bedriften</p>
          </button>
        </div>
      </div>
    );
  }

  // Step 2a: Person form
  if (step === "info" && enrollmentType === "person") {
    return (
      <div className="max-w-2xl mx-auto">
        <div ref={topRef} />
        <button
          type="button"
          onClick={() => setStep("type")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake
        </button>
        <StepIndicator current={2} total={2} />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dine opplysninger</h2>
        <p className="text-slate-500 mb-6">Fyll inn informasjonen din for å fullføre påmeldingen</p>

        <CourseSummaryCard
          courseName={courseName}
          courseDate={courseDate}
          location={location}
        />

        <Form {...personForm}>
          <form onSubmit={personForm.handleSubmit(onSubmitPerson)} className="space-y-5">
            {renderAddOnSelector(personSelectedAddOns, togglePersonAddOn, "person-addon")}

            {renderPriceSummary(personPricing)}

            {/* Personal info */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="font-semibold text-slate-900">Personlige opplysninger</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={personForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Fornavn</FormLabel>
                      <FormControl>
                        <Input placeholder="Ola" {...field} autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Etternavn</FormLabel>
                      <FormControl>
                        <Input placeholder="Nordmann" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={personForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">E-post</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ola.nordmann@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={personForm.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Fødselsdato (valgfritt)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Melder på...
                </>
              ) : (
                <>
                  Bekreft påmelding
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  // Step 2b: Company form
  if (step === "info" && enrollmentType === "company") {
    return (
      <div className="max-w-3xl mx-auto">
        <div ref={topRef} />
        <button
          type="button"
          onClick={() => setStep("type")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake
        </button>
        <StepIndicator current={2} total={2} />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Bedriftspåmelding</h2>
        <p className="text-slate-500 mb-6">Fyll inn bedriftsinfo og legg til deltakere</p>

        <CourseSummaryCard
          courseName={courseName}
          courseDate={courseDate}
          location={location}
        />

        <Form {...companyForm}>
          <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-5">
            {renderAddOnSelector(companySelectedAddOns, toggleCompanyAddOn, "company-addon")}

            {renderPriceSummary(companyPricing, true)}

            {/* Company info */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="font-semibold text-slate-900">Bedriftsinformasjon</h4>
              <FormField
                control={companyForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Bedriftsnavn</FormLabel>
                    <FormControl>
                      <Input placeholder="Bedrift AS" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="orgNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Org.nr (valgfritt)</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={companyForm.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">E-post</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="post@bedrift.no" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact person */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <h4 className="font-semibold text-slate-900">Kontaktperson</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="contactPerson.firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Fornavn</FormLabel>
                      <FormControl>
                        <Input placeholder="Ola" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="contactPerson.lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Etternavn</FormLabel>
                      <FormControl>
                        <Input placeholder="Nordmann" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="contactPerson.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">E-post</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ola@bedrift.no" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="contactPerson.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Participants */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">
                  Deltakere ({fields.length})
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ firstName: "", lastName: "", email: "", phone: "" })}
                  className="border-slate-300 text-slate-700 hover:border-amber-400 hover:text-amber-700 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Legg til deltaker
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 text-sm">Deltaker {index + 1}</span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={companyForm.control}
                      name={`participants.${index}.firstName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 text-xs">Fornavn</FormLabel>
                          <FormControl>
                            <Input placeholder="Fornavn" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name={`participants.${index}.lastName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 text-xs">Etternavn</FormLabel>
                          <FormControl>
                            <Input placeholder="Etternavn" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={companyForm.control}
                      name={`participants.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 text-xs">E-post (valgfritt)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="navn@bedrift.no" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name={`participants.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 text-xs">Telefon (valgfritt)</FormLabel>
                          <FormControl>
                            <Input placeholder="12345678" {...field} className="text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Melder på...
                </>
              ) : (
                <>
                  Bekreft påmelding ({fields.length}{" "}
                  {fields.length === 1 ? "deltaker" : "deltakere"})
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  // Success step
  if (step === "success") {
    return (
      <div className="max-w-xl mx-auto text-center">
        <div ref={topRef} />
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Påmelding bekreftet!</h2>
          <p className="text-slate-500">Du vil motta en bekreftelse på e-post om kort tid</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8 space-y-4">
          <h3 className="font-bold text-slate-900">Hva skjer nå?</h3>
          {[
            { step: 1, title: "Sjekk e-posten din", desc: "Du har fått tilsendt en bekreftelse med alle detaljer" },
            { step: 2, title: "Forbered deg", desc: "Husk å ta med gyldig legitimasjon" },
            { step: 3, title: "Møt opp", desc: `${courseDate} — ${location}` },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/kurs")}
            className="flex-1 border-slate-300 text-slate-700"
          >
            Se flere kurs
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold"
          >
            Til forsiden
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
