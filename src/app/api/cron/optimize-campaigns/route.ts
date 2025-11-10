import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facebookAds } from "@/lib/facebook-ads";
import { analyzeAndOptimize, type CampaignPerformance } from "@/lib/ai-ads-assistant";

export const dynamic = "force-dynamic";

/**
 * CRON JOB: Automatisk kampanjeoptimalisering
 * 
 * Kjører daglig for å:
 * 1. Synkronisere insights fra Facebook
 * 2. Analysere kampanjeytelse med AI
 * 3. Generere optimaliseringsforslag
 * 4. Sende varsler om kritiske problemer
 * 
 * Sett opp i cron eller Vercel: 0 8 * * * (hver dag kl 08:00)
 */
export async function GET(request: NextRequest) {
  try {
    // Verifiser cron-nøkkel
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
      synced: 0,
      optimized: 0,
      errors: [] as string[],
    };

    // Hent aktive kampanjer
    const campaigns = await db.facebookCampaign.findMany({
      where: {
        status: "ACTIVE",
        facebookCampaignId: { not: null },
      },
      include: {
        insights: {
          orderBy: { date: "desc" },
          take: 7, // Siste 7 dager
        },
      },
    });

    console.log(`📊 Fant ${campaigns.length} aktive kampanjer`);

    for (const campaign of campaigns) {
      try {
        // 1. Synkroniser insights fra Facebook
        if (campaign.facebookCampaignId) {
          const insights = await facebookAds.getInsights(
            campaign.facebookCampaignId,
            "campaign",
            "yesterday"
          );

          for (const insight of insights.data || []) {
            const date = new Date(insight.date_start);

            await db.facebookInsight.upsert({
              where: {
                campaignId_date: {
                  campaignId: campaign.id,
                  date,
                },
              },
              create: {
                campaignId: campaign.id,
                date,
                spend: parseFloat(insight.spend || "0"),
                impressions: parseInt(insight.impressions || "0"),
                reach: parseInt(insight.reach || "0"),
                clicks: parseInt(insight.clicks || "0"),
                cpc: parseFloat(insight.cpc || "0"),
                cpm: parseFloat(insight.cpm || "0"),
                ctr: parseFloat(insight.ctr || "0"),
              },
              update: {
                spend: parseFloat(insight.spend || "0"),
                impressions: parseInt(insight.impressions || "0"),
                reach: parseInt(insight.reach || "0"),
                clicks: parseInt(insight.clicks || "0"),
                cpc: parseFloat(insight.cpc || "0"),
                cpm: parseFloat(insight.cpm || "0"),
                ctr: parseFloat(insight.ctr || "0"),
              },
            });
          }
          results.synced++;
        }

        // 2. Analyser ytelse hvis vi har nok data
        if (campaign.insights.length >= 3) {
          const totals = campaign.insights.reduce(
            (acc, insight) => ({
              spend: acc.spend + insight.spend,
              impressions: acc.impressions + insight.impressions,
              clicks: acc.clicks + insight.clicks,
              conversions: acc.conversions + insight.conversions,
            }),
            { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
          );

          const performance: CampaignPerformance = {
            campaignName: campaign.name,
            objective: campaign.objective,
            spend: totals.spend,
            impressions: totals.impressions,
            clicks: totals.clicks,
            conversions: totals.conversions,
            cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
            cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
            ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
            conversionRate:
              totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0,
            daysRunning: campaign.insights.length,
          };

          // 3. Få AI-anbefalinger
          try {
            const recommendations = await analyzeAndOptimize(performance);

            // 4. Lagre kun HØYE/KRITISKE anbefalinger (unngå spam)
            for (const rec of recommendations) {
              if (rec.priority === "HIGH" || rec.priority === "CRITICAL") {
                await db.campaignOptimizationLog.create({
                  data: {
                    campaignId: campaign.id,
                    analysisType: rec.type,
                    findings: JSON.stringify({ performance }),
                    recommendations: JSON.stringify(rec),
                    priority: rec.priority,
                  },
                });

                console.log(`⚠️  ${rec.priority} forslag for ${campaign.name}: ${rec.title}`);
              }
            }

            results.optimized++;
          } catch (aiError) {
            console.error(`AI-analyse feilet for ${campaign.name}:`, aiError);
            results.errors.push(`AI failed: ${campaign.name}`);
          }
        }
      } catch (error: any) {
        console.error(`Feil ved behandling av kampanje ${campaign.name}:`, error);
        results.errors.push(`${campaign.name}: ${error.message}`);
      }
    }

    console.log("✅ Optimalisering fullført:", results);

    return NextResponse.json({
      success: true,
      message: "Kampanjeoptimalisering fullført",
      results,
    });
  } catch (error) {
    console.error("❌ Kritisk feil i kampanjeoptimalisering:", error);
    return NextResponse.json(
      { error: "Kampanjeoptimalisering feilet" },
      { status: 500 }
    );
  }
}

