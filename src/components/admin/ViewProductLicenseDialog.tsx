"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface ProductLicense {
  id: string;
  licenseKey: string;
  validationToken: string;
  productName: string;
  productVersion: string | null;
  isActive: boolean;
  activatedAt: Date | null;
  expiresAt: Date | null;
  features: string;
  maxUsers: number | null;
  maxBookingsPerMonth: number | null;
  allowedDomain: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    domain: string | null;
  };
  _count: {
    validationLogs: number;
  };
}

interface ViewProductLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  license: ProductLicense;
}

export function ViewProductLicenseDialog({
  open,
  onOpenChange,
  license,
}: ViewProductLicenseDialogProps) {
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopiert!`);
  };

  let features = {};
  try {
    features = JSON.parse(license.features);
  } catch (error) {
    console.error("Error parsing features:", error);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Produktlisens Detaljer</DialogTitle>
          <DialogDescription>
            Se all informasjon om denne produktlisensen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Kundeinformasjon */}
          <div>
            <h3 className="font-semibold mb-3">Kundeinformasjon</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Navn:</span>
                <p className="font-medium">{license.customer.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">E-post:</span>
                <p className="font-medium">{license.customer.email}</p>
              </div>
              {license.customer.company && (
                <div>
                  <span className="text-muted-foreground">Bedrift:</span>
                  <p className="font-medium">{license.customer.company}</p>
                </div>
              )}
              {license.customer.domain && (
                <div>
                  <span className="text-muted-foreground">Domene:</span>
                  <p className="font-medium">{license.customer.domain}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lisenskoder */}
          <div>
            <h3 className="font-semibold mb-3">Lisensinformasjon</h3>
            
            {/* License Key */}
            <div className="space-y-2 mb-4">
              <span className="text-sm text-muted-foreground">Lisenskode:</span>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <code className="flex-1 font-mono text-sm">
                  {license.licenseKey}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(license.licenseKey, "Lisenskode")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Validation Token */}
            <div className="space-y-2 mb-4">
              <span className="text-sm text-muted-foreground">
                Validerings-token (for API):
              </span>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <code className="flex-1 font-mono text-sm break-all">
                  {license.validationToken}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(license.validationToken, "Validerings-token")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Produkt & Status */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Produkt:</span>
                <p className="font-medium">{license.productName}</p>
              </div>
              {license.productVersion && (
                <div>
                  <span className="text-muted-foreground">Versjon:</span>
                  <p className="font-medium">v{license.productVersion}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="mt-1">
                  {license.isActive ? (
                    <Badge className="bg-green-600">Aktiv</Badge>
                  ) : (
                    <Badge variant="destructive">Inaktiv</Badge>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Valideringer:</span>
                <p className="font-medium">{license._count.validationLogs}</p>
              </div>
            </div>
          </div>

          {/* Datoer */}
          <div>
            <h3 className="font-semibold mb-3">Datoer</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Opprettet:</span>
                <p className="font-medium">
                  {format(new Date(license.createdAt), "dd.MM.yyyy HH:mm", {
                    locale: nb,
                  })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Aktivert:</span>
                <p className="font-medium">
                  {license.activatedAt
                    ? format(new Date(license.activatedAt), "dd.MM.yyyy HH:mm", {
                        locale: nb,
                      })
                    : "Ikke aktivert ennå"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Utløper:</span>
                <p className="font-medium">
                  {license.expiresAt
                    ? format(new Date(license.expiresAt), "dd.MM.yyyy", {
                        locale: nb,
                      })
                    : "Aldri"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Sist oppdatert:</span>
                <p className="font-medium">
                  {format(new Date(license.updatedAt), "dd.MM.yyyy HH:mm", {
                    locale: nb,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Begrensninger */}
          <div>
            <h3 className="font-semibold mb-3">Begrensninger</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tillatt domene:</span>
                <p className="font-medium">{license.allowedDomain || "Alle"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Maks brukere:</span>
                <p className="font-medium">{license.maxUsers || "Ubegrenset"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Maks bookinger/mnd:</span>
                <p className="font-medium">
                  {license.maxBookingsPerMonth || "Ubegrenset"}
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="font-semibold mb-3">Features</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(features).map(([key, value]) => (
                <Badge
                  key={key}
                  variant={value as boolean ? "default" : "outline"}
                  className="text-xs"
                >
                  {(value as boolean) && <CheckCircle2 className="mr-1 h-3 w-3" />}
                  {key}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notater */}
          {license.notes && (
            <div>
              <h3 className="font-semibold mb-3">Notater</h3>
              <div className="p-3 bg-muted rounded-md text-sm">
                {license.notes}
              </div>
            </div>
          )}

          {/* API Eksempel */}
          <div>
            <h3 className="font-semibold mb-3">API Validering Eksempel</h3>
            <div className="p-3 bg-muted rounded-md">
              <pre className="text-xs overflow-x-auto">
                {`curl -X POST https://www.kksas.no/api/product-license/validate \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${license.validationToken}" \\
  -d '{
    "licenseKey": "${license.licenseKey}",
    "domain": "${license.allowedDomain || 'din-domene.no'}",
    "appVersion": "1.0.0"
  }'`}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

