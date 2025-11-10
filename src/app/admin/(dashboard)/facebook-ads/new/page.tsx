"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { generateCampaignWithAI } from "@/app/actions/admin/facebook-campaigns";
import { useToast } from "@/hooks/use-toast";

export default function NewCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessType: "kursvirksomhet",
    productName: "",
    productDescription: "",
    targetAudience: "",
    objective: "leads",
    tone: "professional",
    variants: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await generateCampaignWithAI(formData);

      if (result.success) {
        toast({
          title: "Kampanje opprettet! 🎉",
          description: "AI har generert annonser for deg. Gjennomgå og publiser når du er klar.",
        });
        router.push(`/admin/facebook-ads/${result.campaignId}`);
      } else {
        toast({
          title: "Feil",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke opprette kampanje",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin/facebook-ads">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake
          </Link>
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Ny kampanje med AI
        </h1>
        <p className="text-muted-foreground mt-1">
          La AI generere høykonverterende annonsetekster basert på ditt produkt
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="businessType">Bransje</Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) =>
                setFormData({ ...formData, businessType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kursvirksomhet">Kursvirksomhet</SelectItem>
                <SelectItem value="SaaS">SaaS / Software</SelectItem>
                <SelectItem value="ecommerce">E-handel</SelectItem>
                <SelectItem value="service">Tjenester</SelectItem>
                <SelectItem value="consulting">Konsulent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName">Produktnavn *</Label>
            <Input
              id="productName"
              placeholder="F.eks. Truckkurs, Kranførerbevis, Fallsikringskurs"
              value={formData.productName}
              onChange={(e) =>
                setFormData({ ...formData, productName: e.target.value })
              }
              required
            />
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <Label htmlFor="productDescription">Produktbeskrivelse *</Label>
            <Textarea
              id="productDescription"
              placeholder="Beskriv produktet/tjenesten. Hva gjør det unikt? Hvilke problemer løser det?"
              rows={4}
              value={formData.productDescription}
              onChange={(e) =>
                setFormData({ ...formData, productDescription: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              Tips: Jo mer detaljert, jo bedre annonsetekster får du
            </p>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Målgruppe *</Label>
            <Input
              id="targetAudience"
              placeholder="F.eks. Bedriftseiere innen bygg og anlegg, 30-55 år"
              value={formData.targetAudience}
              onChange={(e) =>
                setFormData({ ...formData, targetAudience: e.target.value })
              }
              required
            />
          </div>

          {/* Objective */}
          <div className="space-y-2">
            <Label htmlFor="objective">Kampanjemål</Label>
            <Select
              value={formData.objective}
              onValueChange={(value) =>
                setFormData({ ...formData, objective: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leads">Generere leads</SelectItem>
                <SelectItem value="traffic">Øke trafikk</SelectItem>
                <SelectItem value="conversions">Konverteringer</SelectItem>
                <SelectItem value="awareness">Merkevarebevissthet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select
              value={formData.tone}
              onValueChange={(value) =>
                setFormData({ ...formData, tone: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Profesjonell</SelectItem>
                <SelectItem value="casual">Avslappet</SelectItem>
                <SelectItem value="urgent">Hastende</SelectItem>
                <SelectItem value="friendly">Vennlig</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Variants */}
          <div className="space-y-2">
            <Label htmlFor="variants">Antall varianter for A/B testing</Label>
            <Select
              value={formData.variants.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, variants: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 varianter</SelectItem>
                <SelectItem value="3">3 varianter</SelectItem>
                <SelectItem value="4">4 varianter</SelectItem>
                <SelectItem value="5">5 varianter</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              AI vil generere forskjellige tilnærminger for testing
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/facebook-ads">Avbryt</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Genererer med AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generer kampanje
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Hvordan fungerer det?
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>1️⃣ AI analyserer produkt og målgruppe</li>
          <li>2️⃣ Genererer flere høykonverterende annonsetekster</li>
          <li>3️⃣ Lager A/B-testvarianter med ulike tilnærminger</li>
          <li>4️⃣ Du kan redigere og tilpasse før publisering</li>
          <li>5️⃣ AI overvåker og foreslår optimaliseringer løpende</li>
        </ul>
      </Card>
    </div>
  );
}

