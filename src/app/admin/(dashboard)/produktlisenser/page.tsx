"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Power, Trash2, Copy, CheckCircle2 } from "lucide-react";
import { CreateProductLicenseDialog } from "@/components/admin/CreateProductLicenseDialog";
import { ViewProductLicenseDialog } from "@/components/admin/ViewProductLicenseDialog";
import { toast } from "sonner";
import { toggleProductLicenseStatus, deleteProductLicense } from "@/app/actions/admin/product-licenses";
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

export default function ProductLicensesPage() {
  const [licenses, setLicenses] = useState<ProductLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<ProductLicense | null>(null);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const response = await fetch("/api/admin/product-licenses");
      const data = await response.json();
      setLicenses(data.licenses || []);
    } catch (error) {
      toast.error("Kunne ikke hente produktlisenser");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (licenseId: string) => {
    const result = await toggleProductLicenseStatus(licenseId);
    
    if (result.success) {
      toast.success("Lisensstatus oppdatert!");
      fetchLicenses();
    } else {
      toast.error(result.error || "Kunne ikke oppdatere status");
    }
  };

  const handleDelete = async (licenseId: string) => {
    if (!confirm("Er du sikker på at du vil slette denne lisensen?")) return;
    
    const result = await deleteProductLicense(licenseId);
    
    if (result.success) {
      toast.success("Lisens slettet!");
      fetchLicenses();
    } else {
      toast.error(result.error || "Kunne ikke slette lisens");
    }
  };

  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopiert til utklippstavlen!");
  };

  const handleViewDetails = (license: ProductLicense) => {
    setSelectedLicense(license);
    setViewDialogOpen(true);
  };

  const handleCloseCreateDialog = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      fetchLicenses();
    }
  };

  const handleCloseViewDialog = (open: boolean) => {
    setViewDialogOpen(open);
    if (!open) {
      setSelectedLicense(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Produktlisenser</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Administrer lisenser for Svampen, TaskGuild, etc.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Ny Produktlisens
        </Button>
      </div>

      {/* Licenses List */}
      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Laster...</p>
      ) : licenses.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Ingen produktlisenser registrert
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {licenses.map((license) => {
            const isExpired = license.expiresAt && new Date(license.expiresAt) < new Date();
            
            return (
              <Card key={license.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-base md:text-lg">
                        {license.customer.name}
                      </CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {license.customer.email}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {license.productName}
                        </Badge>
                        {license.productVersion && (
                          <Badge variant="outline" className="text-xs">
                            v{license.productVersion}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {license.isActive ? (
                        <Badge className="bg-green-600 text-xs">Aktiv</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Inaktiv</Badge>
                      )}
                      {isExpired && (
                        <Badge variant="destructive" className="text-xs">Utløpt</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-xs md:text-sm">
                    {/* License Key */}
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <span className="text-muted-foreground">Lisenskode:</span>
                        <p className="font-mono font-medium mt-1">{license.licenseKey}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyKey(license.licenseKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                      <div>
                        <span className="text-muted-foreground">Domene:</span>
                        <p className="font-medium">{license.allowedDomain || "Alle"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Utløper:</span>
                        <p className="font-medium">
                          {license.expiresAt
                            ? format(new Date(license.expiresAt), "dd.MM.yyyy", { locale: nb })
                            : "Aldri"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valideringer:</span>
                        <p className="font-medium">{license._count.validationLogs}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Aktivert:</span>
                        <p className="font-medium">
                          {license.activatedAt
                            ? format(new Date(license.activatedAt), "dd.MM.yyyy", { locale: nb })
                            : "Nei"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(license)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Se Detaljer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(license.id)}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {license.isActive ? "Deaktiver" : "Aktiver"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(license.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Slett
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateProductLicenseDialog
        open={createDialogOpen}
        onOpenChange={handleCloseCreateDialog}
      />

      {selectedLicense && (
        <ViewProductLicenseDialog
          open={viewDialogOpen}
          onOpenChange={handleCloseViewDialog}
          license={selectedLicense}
        />
      )}
    </div>
  );
}

