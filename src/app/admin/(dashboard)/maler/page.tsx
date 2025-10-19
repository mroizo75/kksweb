import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TemplateDialog } from "@/components/admin/TemplateDialog";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Award, File } from "lucide-react";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";

  const templates = await db.template.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  const kindConfig: Record<string, { label: string; icon: any; color: string }> = {
    DIPLOMA: { label: "Diplom", icon: Award, color: "bg-blue-500" },
    CERTIFICATE: { label: "Kursbevis", icon: FileText, color: "bg-green-500" },
    TEMP_CERT: { label: "Midlertidig sertifikat", icon: FileText, color: "bg-yellow-500" },
    CARD: { label: "Kompetansekort", icon: File, color: "bg-purple-500" },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dokumentmaler</h1>
          <p className="text-muted-foreground">
            Administrer maler for diplomer, kursbevis og kompetansekort
          </p>
        </div>
        <TemplateDialog />
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Søk etter mal..."
            defaultValue={search}
            className="pl-10"
          />
        </div>
        <Button type="submit">Søk</Button>
      </form>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length === 0 ? (
          <div className="col-span-full text-center p-8 text-muted-foreground border rounded-lg">
            Ingen maler funnet
          </div>
        ) : (
          templates.map((template) => {
            const config = kindConfig[template.kind];
            const Icon = config.icon;

            return (
              <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`${config.color} p-2 rounded-lg text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline">{config.label}</Badge>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                )}

                <div className="text-xs text-muted-foreground mb-3">
                  <div>Filnøkkel: {template.fileKey || "Ikke lastet opp"}</div>
                  <div>
                    Opprettet: {new Date(template.createdAt).toLocaleDateString("nb-NO")}
                  </div>
                </div>

                <div className="flex gap-2">
                  <TemplateDialog existingTemplate={template} />
                  <Button variant="outline" size="sm" disabled={!template.fileKey}>
                    Forhåndsvis
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Award className="h-5 w-5" />
            <h3 className="font-semibold">Diplomer</h3>
          </div>
          <p className="text-2xl font-bold">
            {templates.filter((t) => t.kind === "DIPLOMA").length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <FileText className="h-5 w-5" />
            <h3 className="font-semibold">Kursbevis</h3>
          </div>
          <p className="text-2xl font-bold">
            {templates.filter((t) => t.kind === "CERTIFICATE").length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <File className="h-5 w-5" />
            <h3 className="font-semibold">Kompetansekort</h3>
          </div>
          <p className="text-2xl font-bold">
            {templates.filter((t) => t.kind === "CARD").length}
          </p>
        </div>
      </div>
    </div>
  );
}

