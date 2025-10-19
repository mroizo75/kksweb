"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Link2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ImportLeadsPage() {
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [defaultSource, setDefaultSource] = useState("Innut.no");
  const [defaultAssignedTo, setDefaultAssignedTo] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
      toast.success("Fil lastet inn - sjekk CSV-dataene nedenfor");
    };
    reader.readAsText(file);
  };

  const handleImportCSV = async () => {
    if (!csvData.trim()) {
      toast.error("Legg til CSV-data først");
      return;
    }

    setIsImporting(true);

    try {
      const response = await fetch("/api/admin/crm/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvData,
          defaultSource,
          defaultAssignedTo: defaultAssignedTo || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setCsvData("");
        setTimeout(() => router.push("/admin/crm/leads"), 1500);
      } else {
        toast.error(result.error || "Import feilet");
      }
    } catch (error) {
      toast.error("En uventet feil oppstod");
    } finally {
      setIsImporting(false);
    }
  };

  const handleTestWebhook = async () => {
    try {
      const response = await fetch("/api/webhooks/leads");
      const result = await response.json();
      
      if (result.webhookUrl) {
        navigator.clipboard.writeText(result.webhookUrl);
        toast.success("Webhook URL kopiert til utklippstavlen!");
      }
    } catch (error) {
      toast.error("Kunne ikke hente webhook URL");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/crm/leads")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake til Leads
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Importer Leads</h1>
            <p className="text-muted-foreground">
              Last opp leads fra markedsføringskampanjer
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="csv" className="space-y-4">
        <TabsList>
          <TabsTrigger value="csv">
            <Upload className="mr-2 h-4 w-4" />
            CSV/Excel Import
          </TabsTrigger>
          <TabsTrigger value="webhook">
            <Link2 className="mr-2 h-4 w-4" />
            Webhook/API
          </TabsTrigger>
          <TabsTrigger value="manual">
            <FileText className="mr-2 h-4 w-4" />
            Manuell Input
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Last opp CSV/Excel fil</CardTitle>
              <CardDescription>
                Støtter CSV-filer med følgende kolonner: Navn, E-post, Telefon, Bedrift, Kilde
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultSource">Standard kilde</Label>
                  <Input
                    id="defaultSource"
                    value={defaultSource}
                    onChange={(e) => setDefaultSource(e.target.value)}
                    placeholder="Innut.no"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Brukes hvis CSV ikke har "Kilde" kolonne
                  </p>
                </div>

                <div>
                  <Label htmlFor="file">Velg fil</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    .csv eller .txt fil
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="csvData">CSV Data (eller lim inn)</Label>
                <Textarea
                  id="csvData"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="Navn,E-post,Telefon,Bedrift&#10;Ola Nordmann,ola@example.com,12345678,Nordmann AS&#10;Kari Hansen,kari@bedrift.no,98765432,Hansen Bygg"
                  rows={10}
                  className="mt-2 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: Navn,E-post,Telefon,Bedrift (første linje kan være header)
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleImportCSV} disabled={isImporting || !csvData.trim()}>
                  {isImporting ? "Importerer..." : "Importer Leads"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCsvData("")}
                  disabled={!csvData.trim()}
                >
                  Tøm
                </Button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Eksempel CSV-format:</h3>
                <pre className="bg-muted p-3 rounded text-xs">
{`Navn,E-post,Telefon,Bedrift,Kilde
Ola Nordmann,ola@example.com,12345678,Nordmann AS,Innut.no
Kari Hansen,kari@bedrift.no,98765432,Hansen Bygg,Innut.no
Per Olsen,per@firma.no,55512345,Olsen Transport,Nettside`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook/API Integrasjon</CardTitle>
              <CardDescription>
                Motta leads automatisk fra Innut.no eller andre systemer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Webhook URL:</h3>
                <div className="flex gap-2">
                  <Input
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/leads`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={handleTestWebhook} variant="outline">
                    Kopier
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">API Dokumentasjon:</h3>
                
                <div className="border rounded p-3">
                  <p className="font-mono text-sm mb-2">POST /api/webhooks/leads</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send lead-data som JSON:
                  </p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "name": "Ola Nordmann",
  "email": "ola@example.com",
  "phone": "12345678",
  "companyName": "Nordmann AS",
  "source": "Innut.no",
  "notes": "Interessert i HMS-kurs"
}`}
                  </pre>
                </div>

                <div className="border rounded p-3">
                  <p className="font-mono text-sm mb-2">POST /api/webhooks/leads (Bulk)</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send flere leads samtidig:
                  </p>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`{
  "leads": [
    {
      "name": "Ola Nordmann",
      "email": "ola@example.com",
      "phone": "12345678",
      "companyName": "Nordmann AS",
      "source": "Innut.no"
    },
    {
      "name": "Kari Hansen",
      "email": "kari@bedrift.no",
      "phone": "98765432",
      "companyName": "Hansen Bygg",
      "source": "Innut.no"
    }
  ]
}`}
                  </pre>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    💡 Tips for Innut.no integrasjon:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
                    <li>Sett opp webhook i Innut.no-kampanjen din</li>
                    <li>Bruk URL-en ovenfor som destinasjon</li>
                    <li>Leads opprettes automatisk når noen svarer på kampanjen</li>
                    <li>Alle leads får status "NEW" og kan tildeles senere</li>
                  </ul>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Test Webhook:</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Test at webhook fungerer ved å sende en test-lead
                </p>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/webhooks/leads", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: "Test Lead",
                          email: "test@example.com",
                          phone: "12345678",
                          companyName: "Test Bedrift",
                          source: "Webhook Test",
                        }),
                      });
                      const result = await response.json();
                      if (result.success) {
                        toast.success("Test lead opprettet!");
                      } else {
                        toast.error("Test feilet: " + result.error);
                      }
                    } catch (error) {
                      toast.error("Webhook test feilet");
                    }
                  }}
                >
                  Send Test Lead
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Lead Input</CardTitle>
              <CardDescription>
                Lim inn flere leads som tekst (én per linje)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bulkText">Bulk Lead Data</Label>
                <Textarea
                  id="bulkText"
                  placeholder="Format: Navn | E-post | Telefon | Bedrift&#10;&#10;Ola Nordmann | ola@example.com | 12345678 | Nordmann AS&#10;Kari Hansen | kari@bedrift.no | 98765432 | Hansen Bygg"
                  rows={15}
                  className="mt-2 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bruk | (pipe) som separator mellom felter
                </p>
              </div>

              <div>
                <Label htmlFor="bulkSource">Kilde for alle leads</Label>
                <Input
                  id="bulkSource"
                  placeholder="Innut.no"
                  className="mt-2"
                />
              </div>

              <Button>
                Importer fra Tekst
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

