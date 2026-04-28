"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createOrder } from "@/app/actions/bestillinger/orders";
import { Plus, Trash2, Building2, User } from "lucide-react";

interface Company { id: string; name: string; orgNo: string | null }
interface Person { id: string; firstName: string; lastName: string; email: string | null }
interface Course { id: string; title: string; code: string; category: string }

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const emptyParticipant = { firstName: "", lastName: "", email: "", phone: "" };

export function NyBestillingDialog({ open, onClose, onCreated }: Props) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Kundevalg
  const [customerType, setCustomerType] = useState<"COMPANY" | "PERSON">("COMPANY");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");

  // Kurs
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  // Deltakere
  const [participants, setParticipants] = useState([{ ...emptyParticipant }]);

  // Pris
  const [agreedPrice, setAgreedPrice] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    const [compRes, personRes, courseRes] = await Promise.all([
      fetch("/api/admin/crm/companies"),
      fetch("/api/admin/crm/persons"),
      fetch("/api/admin/courses"),
    ]);
    const [compData, personData, courseData] = await Promise.all([
      compRes.json(), personRes.json(), courseRes.json(),
    ]);
    setCompanies(compData.companies ?? []);
    setPersons(personData.persons ?? []);
    setCourses(courseData.courses ?? []);
  }, []);

  useEffect(() => { if (open) { loadData(); setStep(1); } }, [open, loadData]);

  function reset() {
    setStep(1);
    setCustomerType("COMPANY");
    setSelectedCompanyId("");
    setSelectedPersonId("");
    setSelectedCourseIds([]);
    setParticipants([{ ...emptyParticipant }]);
    setAgreedPrice("");
    setNotes("");
  }

  function toggleCourse(id: string) {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function addParticipant() {
    setParticipants((prev) => [...prev, { ...emptyParticipant }]);
  }

  function removeParticipant(idx: number) {
    setParticipants((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateParticipant(idx: number, field: string, value: string) {
    setParticipants((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const result = await createOrder({
        customerType,
        companyId: customerType === "COMPANY" ? selectedCompanyId : undefined,
        personId: customerType === "PERSON" ? selectedPersonId : undefined,
        courseIds: selectedCourseIds,
        participants,
        agreedPrice: Number(agreedPrice) || 0,
        notes,
        status: "DRAFT",
      });

      if (result.success) {
        toast.success(result.message);
        reset();
        onCreated();
        onClose();
      } else {
        toast.error(result.error);
      }
    } finally {
      setSaving(false);
    }
  }

  const canNextStep1 =
    customerType === "COMPANY" ? !!selectedCompanyId : !!selectedPersonId;
  const canNextStep2 = selectedCourseIds.length > 0;
  const canNextStep3 = participants.every((p) => p.firstName && p.lastName);
  const canSubmit = canNextStep1 && canNextStep2 && canNextStep3 && agreedPrice !== "";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ny bestilling</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  step === s ? "bg-primary text-primary-foreground border-primary" :
                  step > s ? "bg-primary/20 text-primary border-primary/30" :
                  "bg-muted text-muted-foreground border-muted"
                }`}>{s}</div>
                {s < 4 && <div className={`h-0.5 w-8 ${step > s ? "bg-primary/40" : "bg-muted"}`} />}
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {step === 1 ? "Kunde" : step === 2 ? "Kurs" : step === 3 ? "Deltakere" : "Pris"}
            </span>
          </div>
        </DialogHeader>

        {/* Steg 1: Kunde */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <Button
                variant={customerType === "COMPANY" ? "default" : "outline"}
                size="sm"
                onClick={() => setCustomerType("COMPANY")}
              >
                <Building2 className="h-4 w-4 mr-1" /> Bedrift
              </Button>
              <Button
                variant={customerType === "PERSON" ? "default" : "outline"}
                size="sm"
                onClick={() => setCustomerType("PERSON")}
              >
                <User className="h-4 w-4 mr-1" /> Privatperson
              </Button>
            </div>

            {customerType === "COMPANY" ? (
              <div className="space-y-1.5">
                <Label>Velg bedrift</Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Søk og velg bedrift..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.orgNo ? `(${c.orgNo})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Bedriften må være registrert i CRM → Bedrifter først.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Velg person</Label>
                <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Søk og velg person..." />
                  </SelectTrigger>
                  <SelectContent>
                    {persons.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} {p.email ? `– ${p.email}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Personen må være registrert i CRM → Kontakter først.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Steg 2: Kurs */}
        {step === 2 && (
          <div className="space-y-3 py-2">
            <Label>Velg kurs (ett eller flere)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCourseIds.includes(course.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={selectedCourseIds.includes(course.id)}
                    onCheckedChange={() => toggleCourse(course.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium leading-tight">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.code} · {course.category}</p>
                  </div>
                </label>
              ))}
            </div>
            {selectedCourseIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedCourseIds.map((id) => {
                  const c = courses.find((x) => x.id === id);
                  return c ? <Badge key={id} variant="secondary">{c.title}</Badge> : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* Steg 3: Deltakere */}
        {step === 3 && (
          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between">
              <Label>Deltakere ({participants.length})</Label>
              <Button size="sm" variant="outline" onClick={addParticipant}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Legg til
              </Button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {participants.map((p, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 p-3 rounded-lg border bg-muted/30">
                  <div className="space-y-1">
                    <Label className="text-xs">Fornavn *</Label>
                    <Input
                      value={p.firstName}
                      onChange={(e) => updateParticipant(idx, "firstName", e.target.value)}
                      placeholder="Ola"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Etternavn *</Label>
                    <Input
                      value={p.lastName}
                      onChange={(e) => updateParticipant(idx, "lastName", e.target.value)}
                      placeholder="Normann"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">E-post</Label>
                    <Input
                      type="email"
                      value={p.email}
                      onChange={(e) => updateParticipant(idx, "email", e.target.value)}
                      placeholder="ola@example.com"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Telefon</Label>
                    <div className="flex gap-1">
                      <Input
                        value={p.phone}
                        onChange={(e) => updateParticipant(idx, "phone", e.target.value)}
                        placeholder="900 00 000"
                        className="h-8 text-sm"
                      />
                      {participants.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive shrink-0"
                          onClick={() => removeParticipant(idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steg 4: Pris */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Avtalt pris (NOK) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">kr</span>
                <Input
                  type="number"
                  min="0"
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  placeholder="25000"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Dette er prisen som er avtalt med kunden og som danner grunnlag for fakturering.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Notater (valgfritt)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Eventuelle særavtaler, rabatter eller annen info..."
                rows={3}
              />
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1.5">
              <p className="font-medium">Oppsummering</p>
              <p className="text-muted-foreground">
                Kunder: {customerType === "COMPANY"
                  ? companies.find((c) => c.id === selectedCompanyId)?.name
                  : persons.find((p) => p.id === selectedPersonId)
                    ? `${persons.find((p) => p.id === selectedPersonId)?.firstName} ${persons.find((p) => p.id === selectedPersonId)?.lastName}`
                    : "–"}
              </p>
              <p className="text-muted-foreground">Kurs: {selectedCourseIds.length} valgt</p>
              <p className="text-muted-foreground">Deltakere: {participants.length}</p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>Tilbake</Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !canNextStep1) ||
                (step === 2 && !canNextStep2) ||
                (step === 3 && !canNextStep3)
              }
            >
              Neste
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving || !canSubmit}>
              {saving ? "Lagrer..." : "Opprett bestilling"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
