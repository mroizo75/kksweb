"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  type CompanyEnrollmentInput 
} from "@/lib/validations/enrollment";
import { enrollPerson } from "@/app/actions/enrollPerson";
import { enrollCompany } from "@/app/actions/enrollCompany";
import { User, Building2, CheckCircle, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface EnrollmentWizardProps {
  sessionId: string;
  courseName: string;
  courseDate: string;
  location: string;
}

type EnrollmentType = "person" | "company";
type WizardStep = "type" | "info" | "confirmation" | "success";

export function EnrollmentWizard({
  sessionId,
  courseName,
  courseDate,
  location,
}: EnrollmentWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("type");
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  const personForm = useForm<PersonEnrollmentInput>({
    resolver: zodResolver(personEnrollmentSchema),
    defaultValues: {
      sessionId,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
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
      contactPerson: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      },
      participants: [
        {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: companyForm.control,
    name: "participants",
  });

  const handleTypeSelection = (type: EnrollmentType) => {
    setEnrollmentType(type);
    setStep("info");
  };

  const onSubmitPerson = async (data: PersonEnrollmentInput) => {
    setIsSubmitting(true);
    
    try {
      const result = await enrollPerson(data);
      
      if (result.success) {
        setEnrollmentId(result.enrollmentId || null);
        setStep("success");
        toast.success(
          result.isWaitlist 
            ? "Du er lagt til på venteliste" 
            : "Påmelding bekreftet!"
        );
      } else {
        toast.error(result.error || "Påmelding feilet");
      }
    } catch (error) {
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
            ? `${result.enrollmentCount} ${result.enrollmentCount === 1 ? 'person' : 'personer'} lagt til på venteliste` 
            : `${result.enrollmentCount} ${result.enrollmentCount === 1 ? 'person' : 'personer'} påmeldt!`
        );
      } else {
        toast.error(result.error || "Påmelding feilet");
      }
    } catch (error) {
      toast.error("En uventet feil oppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Choose type
  if (step === "type") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Hvem melder du på?</h2>
          <p className="text-muted-foreground">
            Velg om du melder deg selv eller bedrift
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleTypeSelection("person")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Privatperson</CardTitle>
              <CardDescription>
                Jeg melder meg selv på kurset
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleTypeSelection("company")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Bedrift</CardTitle>
              <CardDescription>
                Jeg melder på ansatte fra bedriften
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Personal info
  if (step === "info" && enrollmentType === "person") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Dine opplysninger</h2>
          <p className="text-muted-foreground">
            Fyll inn informasjonen din for å fullføre påmeldingen
          </p>
        </div>

        <Form {...personForm}>
          <form onSubmit={personForm.handleSubmit(onSubmitPerson)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personlige opplysninger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={personForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fornavn</FormLabel>
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
                        <FormLabel>Etternavn</FormLabel>
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
                      <FormLabel>E-post</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ola.nordmann@example.com"
                          {...field}
                        />
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
                      <FormLabel>Telefon</FormLabel>
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
                      <FormLabel>Fødselsdato (valgfritt)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kursdetaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Kurs:</span>
                  <span className="font-medium">{courseName}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Dato:</span>
                  <span className="font-medium">{courseDate}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Sted:</span>
                  <span className="font-medium">{location}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("type")}
                className="w-full"
              >
                Tilbake
              </Button>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Melder på...
                  </>
                ) : (
                  "Bekreft påmelding"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // Step 2b: Company info
  if (step === "info" && enrollmentType === "company") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Bedriftspåmelding</h2>
          <p className="text-muted-foreground">
            Fyll inn bedriftsinfo og deltakere
          </p>
        </div>

        <Form {...companyForm}>
          <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bedriftsinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={companyForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedriftsnavn</FormLabel>
                      <FormControl>
                        <Input placeholder="Bedrift AS" {...field} autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={companyForm.control}
                    name="orgNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Org.nr (valgfritt)</FormLabel>
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
                        <FormLabel>Telefon</FormLabel>
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
                      <FormLabel>E-post</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="post@bedrift.no" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kontaktperson</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={companyForm.control}
                    name="contactPerson.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fornavn</FormLabel>
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
                        <FormLabel>Etternavn</FormLabel>
                        <FormControl>
                          <Input placeholder="Nordmann" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={companyForm.control}
                    name="contactPerson.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-post</FormLabel>
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
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input placeholder="12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Deltakere</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Legg til deltaker
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Deltaker {index + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={companyForm.control}
                        name={`participants.${index}.firstName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornavn</FormLabel>
                            <FormControl>
                              <Input placeholder="Fornavn" {...field} />
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
                            <FormLabel>Etternavn</FormLabel>
                            <FormControl>
                              <Input placeholder="Etternavn" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={companyForm.control}
                        name={`participants.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-post (valgfritt)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="navn@bedrift.no" {...field} />
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
                            <FormLabel>Telefon (valgfritt)</FormLabel>
                            <FormControl>
                              <Input placeholder="12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kursdetaljer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Kurs:</span>
                  <span className="font-medium">{courseName}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Dato:</span>
                  <span className="font-medium">{courseDate}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Sted:</span>
                  <span className="font-medium">{location}</span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Antall deltakere:</span>
                  <span className="font-medium">{fields.length}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("type")}
                className="w-full"
              >
                Tilbake
              </Button>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Melder på...
                  </>
                ) : (
                  "Bekreft påmelding"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // Step 3: Success
  if (step === "success") {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Påmelding bekreftet!</h2>
          <p className="text-lg text-muted-foreground">
            Du vil motta en bekreftelse på e-post om kort tid
          </p>
        </div>

        <Card className="text-left mb-8">
          <CardHeader>
            <CardTitle>Hva skjer nå?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Sjekk e-posten din</p>
                <p className="text-sm text-muted-foreground">
                  Du har fått tilsendt en bekreftelse med alle detaljer
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Forbered deg</p>
                <p className="text-sm text-muted-foreground">
                  Husk å ta med gyldig legitimasjon
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Møt opp</p>
                <p className="text-muted-foreground">
                  {courseDate} - {location}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push("/kurs")} className="w-full">
            Se flere kurs
          </Button>
          <Button onClick={() => router.push("/")} className="w-full">
            Tilbake til forsiden
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

