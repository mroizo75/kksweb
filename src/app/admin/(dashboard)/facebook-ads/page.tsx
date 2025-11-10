import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  DollarSign, 
  Eye, 
  MousePointerClick,
  Plus,
  AlertCircle,
  Sparkles,
  BarChart3
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Facebook Ads | KKS Admin",
  description: "Administrer Facebook-kampanjer med AI-assistanse",
};

async function getCampaigns() {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/facebook-campaigns`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) return { campaigns: [] };
    return response.json();
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return { campaigns: [] };
  }
}

export default async function FacebookAdsPage() {
  const { campaigns } = await getCampaigns();

  // Beregn totale stats
  const totalStats = campaigns.reduce(
    (acc: any, campaign: any) => {
      const campaignTotals = campaign.insights.reduce(
        (sum: any, insight: any) => ({
          spend: sum.spend + insight.spend,
          impressions: sum.impressions + insight.impressions,
          clicks: sum.clicks + insight.clicks,
          conversions: sum.conversions + insight.conversions,
        }),
        { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
      );

      return {
        spend: acc.spend + campaignTotals.spend,
        impressions: acc.impressions + campaignTotals.impressions,
        clicks: acc.clicks + campaignTotals.clicks,
        conversions: acc.conversions + campaignTotals.conversions,
      };
    },
    { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  const avgCpc = totalStats.clicks > 0 ? totalStats.spend / totalStats.clicks : 0;
  const avgCtr =
    totalStats.impressions > 0
      ? (totalStats.clicks / totalStats.impressions) * 100
      : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            Facebook Ads Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-assistert kampanjestyring for maksimal ROI
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/facebook-ads/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/facebook-ads/new">
              <Plus className="mr-2 h-4 w-4" />
              Ny kampanje med AI
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total brukt
              </p>
              <p className="text-2xl font-bold mt-1">
                {totalStats.spend.toFixed(0)} kr
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Visninger
              </p>
              <p className="text-2xl font-bold mt-1">
                {totalStats.impressions.toLocaleString("no")}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Klikk
              </p>
              <p className="text-2xl font-bold mt-1">
                {totalStats.clicks.toLocaleString("no")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                CTR: {avgCtr.toFixed(2)}%
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <MousePointerClick className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Gj.snitt CPC
              </p>
              <p className="text-2xl font-bold mt-1">{avgCpc.toFixed(2)} kr</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Kampanjer</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {campaigns.length} {campaigns.length === 1 ? "kampanje" : "kampanjer"}
          </p>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Ingen kampanjer ennå
            </h3>
            <p className="text-muted-foreground mb-6">
              Kom i gang ved å lage din første AI-genererte kampanje
            </p>
            <Button asChild>
              <Link href="/admin/facebook-ads/new">
                <Plus className="mr-2 h-4 w-4" />
                Lag kampanje med AI
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {campaigns.map((campaign: any) => {
              const stats = campaign.insights.reduce(
                (sum: any, insight: any) => ({
                  spend: sum.spend + insight.spend,
                  impressions: sum.impressions + insight.impressions,
                  clicks: sum.clicks + insight.clicks,
                  conversions: sum.conversions + insight.conversions,
                }),
                { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
              );

              const cpc = stats.clicks > 0 ? stats.spend / stats.clicks : 0;
              const ctr =
                stats.impressions > 0
                  ? (stats.clicks / stats.impressions) * 100
                  : 0;

              const pendingOptimizations = campaign.optimizationLogs.filter(
                (log: any) => !log.implemented
              );

              return (
                <div key={campaign.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{campaign.name}</h3>
                        {campaign.aiGenerated && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : campaign.status === "PAUSED"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.objective} • {campaign._count.adSets} annonsesett •{" "}
                        {campaign.adSets.reduce((sum: number, as: any) => sum + as.ads.length, 0)}{" "}
                        annonser
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/facebook-ads/${campaign.id}`}>
                          Detaljer
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/facebook-ads/${campaign.id}/optimize`}>
                          <Sparkles className="h-4 w-4 mr-1" />
                          Optimaliser
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Brukt</p>
                      <p className="font-semibold">{stats.spend.toFixed(0)} kr</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Visninger</p>
                      <p className="font-semibold">
                        {stats.impressions.toLocaleString("no")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Klikk</p>
                      <p className="font-semibold">
                        {stats.clicks.toLocaleString("no")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CPC</p>
                      <p className="font-semibold">{cpc.toFixed(2)} kr</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-semibold">{ctr.toFixed(2)}%</p>
                    </div>
                  </div>

                  {pendingOptimizations.length > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {pendingOptimizations.length} AI-forslag venter på implementering
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

