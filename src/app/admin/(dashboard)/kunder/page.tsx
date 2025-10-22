"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonDetailsDialog } from "@/components/admin/PersonDetailsDialog";
import { CompanyDetailsDialog } from "@/components/admin/CompanyDetailsDialog";
import { CreatePersonDialog } from "@/components/admin/CreatePersonDialog";
import { CreateCompanyDialog } from "@/components/admin/CreateCompanyDialog";
import { Plus, Search, User, Building2 } from "lucide-react";
import type { Person, Company, Enrollment, CourseSession, Course, Contact } from "@prisma/client";

interface PersonWithRelations extends Person {
  company: Company | null;
  enrollments: (Enrollment & {
    session: CourseSession & {
      course: Course;
    };
  })[];
}

interface CompanyWithRelations extends Company {
  people: Person[];
  contacts: Contact[];
  enrollments: Enrollment[];
}

export default function AdminCustomersPage() {
  const [people, setPeople] = useState<PersonWithRelations[]>([]);
  const [companies, setCompanies] = useState<CompanyWithRelations[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<PersonWithRelations[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithRelations[]>([]);
  const [peopleSearchTerm, setPeopleSearchTerm] = useState("");
  const [companiesSearchTerm, setCompaniesSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<PersonWithRelations | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithRelations | null>(null);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [createPersonDialogOpen, setCreatePersonDialogOpen] = useState(false);
  const [createCompanyDialogOpen, setCreateCompanyDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (peopleSearchTerm) {
      const filtered = people.filter((person) => {
        const searchLower = peopleSearchTerm.toLowerCase();
        return (
          person.firstName.toLowerCase().includes(searchLower) ||
          person.lastName.toLowerCase().includes(searchLower) ||
          (person.email || "").toLowerCase().includes(searchLower) ||
          (person.phone || "").toLowerCase().includes(searchLower) ||
          (person.company?.name || "").toLowerCase().includes(searchLower)
        );
      });
      setFilteredPeople(filtered);
    } else {
      setFilteredPeople(people);
    }
  }, [peopleSearchTerm, people]);

  useEffect(() => {
    if (companiesSearchTerm) {
      const filtered = companies.filter((company) => {
        const searchLower = companiesSearchTerm.toLowerCase();
        return (
          company.name.toLowerCase().includes(searchLower) ||
          (company.orgNo || "").toLowerCase().includes(searchLower) ||
          (company.email || "").toLowerCase().includes(searchLower) ||
          (company.phone || "").toLowerCase().includes(searchLower)
        );
      });
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [companiesSearchTerm, companies]);

  const fetchCustomers = async () => {
    try {
      const [peopleRes, companiesRes] = await Promise.all([
        fetch("/api/admin/people"),
        fetch("/api/admin/companies"),
      ]);
      const peopleData = await peopleRes.json();
      const companiesData = await companiesRes.json();
      setPeople(peopleData.people || []);
      setFilteredPeople(peopleData.people || []);
      setCompanies(companiesData.companies || []);
      setFilteredCompanies(companiesData.companies || []);
    } catch (error) {
      console.error("Feil ved henting av kunder:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPersonDetails = (person: PersonWithRelations) => {
    setSelectedPerson(person);
    setPersonDialogOpen(true);
  };

  const handleOpenCompanyDetails = (company: CompanyWithRelations) => {
    setSelectedCompany(company);
    setCompanyDialogOpen(true);
  };

  const handleClosePersonDialog = (open: boolean) => {
    setPersonDialogOpen(open);
    if (!open) {
      setSelectedPerson(null);
      fetchCustomers();
    }
  };

  const handleCloseCompanyDialog = (open: boolean) => {
    setCompanyDialogOpen(open);
    if (!open) {
      setSelectedCompany(null);
      fetchCustomers();
    }
  };

  const handleCreateNewPerson = () => {
    setCreatePersonDialogOpen(true);
  };

  const handleCreateNewCompany = () => {
    setCreateCompanyDialogOpen(true);
  };

  const handleCloseCreatePersonDialog = (open: boolean) => {
    setCreatePersonDialogOpen(open);
    if (!open) {
      fetchCustomers();
    }
  };

  const handleCloseCreateCompanyDialog = (open: boolean) => {
    setCreateCompanyDialogOpen(open);
    if (!open) {
      fetchCustomers();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kunder</h1>
          <p className="text-muted-foreground">
            Administrer deltakere og bedrifter
          </p>
        </div>
      </div>

      <Tabs defaultValue="people" className="space-y-4">
        <TabsList>
          <TabsTrigger value="people">
            <User className="mr-2 h-4 w-4" />
            Privatpersoner
          </TabsTrigger>
          <TabsTrigger value="companies">
            <Building2 className="mr-2 h-4 w-4" />
            Bedrifter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="people" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Deltakere</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Søk deltakere..."
                      className="pl-9 w-64"
                      value={peopleSearchTerm}
                      onChange={(e) => setPeopleSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateNewPerson}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ny deltaker
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Laster...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Navn</th>
                        <th className="text-left py-3 px-4 font-medium">E-post</th>
                        <th className="text-left py-3 px-4 font-medium">Telefon</th>
                        <th className="text-left py-3 px-4 font-medium">Bedrift</th>
                        <th className="text-left py-3 px-4 font-medium">Påmeldinger</th>
                        <th className="text-right py-3 px-4 font-medium">Handlinger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPeople.map((person) => (
                        <tr key={person.id} className="border-b last:border-0">
                          <td className="py-3 px-4">
                            <p className="font-medium">
                              {person.firstName} {person.lastName}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{person.email || "-"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{person.phone || "-"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">
                              {person.company?.name || "-"}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">
                              {person.enrollments.length} {person.enrollments.length === 1 ? "kurs" : "kurs"}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenPersonDetails(person)}
                            >
                              Se detaljer
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && filteredPeople.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  {peopleSearchTerm ? "Ingen deltakere funnet" : "Ingen deltakere registrert"}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bedrifter</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Søk bedrifter..."
                      className="pl-9 w-64"
                      value={companiesSearchTerm}
                      onChange={(e) => setCompaniesSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleCreateNewCompany}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ny bedrift
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Laster...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Navn</th>
                        <th className="text-left py-3 px-4 font-medium">Org.nr</th>
                        <th className="text-left py-3 px-4 font-medium">E-post</th>
                        <th className="text-left py-3 px-4 font-medium">Telefon</th>
                        <th className="text-left py-3 px-4 font-medium">Ansatte</th>
                        <th className="text-left py-3 px-4 font-medium">Påmeldinger</th>
                        <th className="text-right py-3 px-4 font-medium">Handlinger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((company) => (
                        <tr key={company.id} className="border-b last:border-0">
                          <td className="py-3 px-4">
                            <p className="font-medium">{company.name}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{company.orgNo || "-"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{company.email || "-"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{company.phone || "-"}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{company.people.length}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm">{company.enrollments.length}</p>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenCompanyDetails(company)}
                            >
                              Se detaljer
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && filteredCompanies.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  {companiesSearchTerm ? "Ingen bedrifter funnet" : "Ingen bedrifter registrert"}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PersonDetailsDialog
        person={selectedPerson}
        open={personDialogOpen}
        onOpenChange={handleClosePersonDialog}
      />

      <CompanyDetailsDialog
        company={selectedCompany}
        open={companyDialogOpen}
        onOpenChange={handleCloseCompanyDialog}
      />

      <CreatePersonDialog
        open={createPersonDialogOpen}
        onOpenChange={handleCloseCreatePersonDialog}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
      />

      <CreateCompanyDialog
        open={createCompanyDialogOpen}
        onOpenChange={handleCloseCreateCompanyDialog}
      />
    </div>
  );
}
