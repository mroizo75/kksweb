import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ValidityPolicyDialog } from "@/components/admin/ValidityPolicyDialog";
import { Badge } from "@/components/ui/badge";
import { Search, Infinity, Calendar, Code } from "lucide-react";

export default async function ValidityPolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";

  const policies = await db.validityPolicy.findMany({
    where: search
      ? {
          name: { contains: search },
        }
      : undefined,
    include: {
      renewalCourse: true,
      _count: {
        select: {
          courses: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const kindConfig = {
    NONE: { label: "Ingen utløp", icon: Infinity, color: "bg-green-500" },
    FIXED_YEARS: { label: "Fast antall år", icon: Calendar, color: "bg-blue-500" },
    CUSTOM_RULE: { label: "Egendefinert regel", icon: Code, color: "bg-purple-500" },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gyldighetspolicies</h1>
          <p className="text-muted-foreground">
            Administrer regler for hvor lenge kurs er gyldige
          </p>
        </div>
        <ValidityPolicyDialog />
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Søk etter policy..."
            defaultValue={search}
            className="pl-10"
          />
        </div>
        <Button type="submit">Søk</Button>
      </form>

      {/* Policies Table */}
      <div className="border rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">Navn</th>
                <th className="text-left p-4 font-medium">Type</th>
                <th className="text-left p-4 font-medium">Varighet</th>
                <th className="text-left p-4 font-medium">Utsettelse</th>
                <th className="text-left p-4 font-medium">Fornyelseskurs</th>
                <th className="text-left p-4 font-medium">Antall kurs</th>
                <th className="text-left p-4 font-medium">Handlinger</th>
              </tr>
            </thead>
            <tbody>
              {policies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-muted-foreground">
                    Ingen policies funnet
                  </td>
                </tr>
              ) : (
                policies.map((policy) => {
                  const config = kindConfig[policy.kind];
                  const Icon = config.icon;

                  return (
                    <tr key={policy.id} className="border-t hover:bg-muted/50">
                      <td className="p-4 font-medium">{policy.name}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="gap-1">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {policy.kind === "FIXED_YEARS"
                          ? `${policy.years} år`
                          : policy.kind === "NONE"
                          ? "Ingen utløp"
                          : "Egendefinert"}
                      </td>
                      <td className="p-4">
                        {policy.graceDays ? `${policy.graceDays} dager` : "-"}
                      </td>
                      <td className="p-4">
                        {policy.renewalCourse ? (
                          <span className="text-sm">{policy.renewalCourse.title}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{policy._count.courses}</Badge>
                      </td>
                      <td className="p-4">
                        <ValidityPolicyDialog existingPolicy={policy} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <Infinity className="h-5 w-5" />
            <h3 className="font-semibold">Ingen utløp</h3>
          </div>
          <p className="text-2xl font-bold">
            {policies.filter((p) => p.kind === "NONE").length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Calendar className="h-5 w-5" />
            <h3 className="font-semibold">Fast varighet</h3>
          </div>
          <p className="text-2xl font-bold">
            {policies.filter((p) => p.kind === "FIXED_YEARS").length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Code className="h-5 w-5" />
            <h3 className="font-semibold">Egendefinert</h3>
          </div>
          <p className="text-2xl font-bold">
            {policies.filter((p) => p.kind === "CUSTOM_RULE").length}
          </p>
        </div>
      </div>
    </div>
  );
}

