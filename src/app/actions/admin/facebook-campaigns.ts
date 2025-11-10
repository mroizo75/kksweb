"use server";

import { db } from "@/lib/db";
import { facebookAds, buildTargeting } from "@/lib/facebook-ads";
import {
  generateAdContent,
  suggestAudiences,
  analyzeAndOptimize,
  recommendBudget,
  type AdGenerationRequest,
  type AudienceSuggestionRequest,
  type CampaignPerformance,
} from "@/lib/ai-ads-assistant";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// ========================================
// SCHEMAS
// ========================================

const campaignSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  objective: z.string().min(1, "Mål er påkrevd"),
  dailyBudget: z.number().positive().optional(),
  lifetimeBudget: z.number().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetAudience: z.string().optional(),
  aiGenerated: z.boolean().default(false),
  aiPrompt: z.string().optional(),
  notes: z.string().optional(),
});

// ========================================
// CAMPAIGN CRUD
// ========================================

export async function createCampaign(data: z.infer<typeof campaignSchema>) {
  try {
    const validated = campaignSchema.parse(data);

    // Opprett i database først
    const campaign = await db.facebookCampaign.create({
      data: {
        name: validated.name,
        objective: validated.objective,
        dailyBudget: validated.dailyBudget,
        lifetimeBudget: validated.lifetimeBudget,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        targetAudience: validated.targetAudience,
        aiGenerated: validated.aiGenerated,
        aiPrompt: validated.aiPrompt,
        notes: validated.notes,
        status: "DRAFT",
      },
    });

    revalidatePath("/admin/facebook-ads");
    return { success: true, campaign };
  } catch (error) {
    console.error("Error creating campaign:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Kunne ikke opprette kampanje" };
  }
}

export async function publishCampaign(campaignId: string) {
  try {
    const campaign = await db.facebookCampaign.findUnique({
      where: { id: campaignId },
      include: { adSets: { include: { ads: true } } },
    });

    if (!campaign) {
      return { success: false, error: "Kampanje ikke funnet" };
    }

    if (campaign.adSets.length === 0) {
      return {
        success: false,
        error: "Kampanje må ha minst ett annonsesett før publisering",
      };
    }

    // Publiser til Facebook
    const fbCampaign = await facebookAds.createCampaign({
      name: campaign.name,
      objective: campaign.objective,
      status: "ACTIVE",
      dailyBudget: campaign.dailyBudget || undefined,
      lifetimeBudget: campaign.lifetimeBudget || undefined,
    });

    // Oppdater med Facebook ID
    await db.facebookCampaign.update({
      where: { id: campaignId },
      data: {
        facebookCampaignId: fbCampaign.id,
        status: "ACTIVE",
      },
    });

    // Publiser alle ad sets og ads
    for (const adSet of campaign.adSets) {
      const targeting = adSet.targeting ? JSON.parse(adSet.targeting) : buildTargeting({});

      const fbAdSet = await facebookAds.createAdSet({
        campaignId: fbCampaign.id,
        name: adSet.name,
        dailyBudget: adSet.dailyBudget || undefined,
        lifetimeBudget: adSet.lifetimeBudget || undefined,
        targeting,
        optimizationGoal: adSet.optimizationGoal,
        bidStrategy: adSet.bidStrategy,
        startTime: adSet.startTime || undefined,
        endTime: adSet.endTime || undefined,
      });

      await db.facebookAdSet.update({
        where: { id: adSet.id },
        data: {
          facebookAdSetId: fbAdSet.id,
          status: "ACTIVE",
        },
      });

      // Publiser annonser
      for (const ad of adSet.ads) {
        const fbAd = await facebookAds.createAd({
          adSetId: fbAdSet.id,
          name: ad.name,
          creative: {
            headline: ad.headline,
            bodyText: ad.bodyText,
            description: ad.description || "",
            callToAction: ad.callToAction,
            linkUrl: ad.linkUrl,
            imageUrl: ad.imageUrl || undefined,
            videoUrl: ad.videoUrl || undefined,
          },
        });

        await db.facebookAd.update({
          where: { id: ad.id },
          data: {
            facebookAdId: fbAd.id,
            status: "ACTIVE",
          },
        });
      }
    }

    revalidatePath("/admin/facebook-ads");
    return { success: true };
  } catch (error: any) {
    console.error("Error publishing campaign:", error);
    return { success: false, error: error.message || "Kunne ikke publisere kampanje" };
  }
}

export async function pauseCampaign(campaignId: string) {
  try {
    const campaign = await db.facebookCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign?.facebookCampaignId) {
      return { success: false, error: "Kampanje ikke publisert på Facebook" };
    }

    await facebookAds.pauseCampaign(campaign.facebookCampaignId);

    await db.facebookCampaign.update({
      where: { id: campaignId },
      data: { status: "PAUSED" },
    });

    revalidatePath("/admin/facebook-ads");
    return { success: true };
  } catch (error: any) {
    console.error("Error pausing campaign:", error);
    return { success: false, error: error.message };
  }
}

export async function resumeCampaign(campaignId: string) {
  try {
    const campaign = await db.facebookCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign?.facebookCampaignId) {
      return { success: false, error: "Kampanje ikke publisert på Facebook" };
    }

    await facebookAds.resumeCampaign(campaign.facebookCampaignId);

    await db.facebookCampaign.update({
      where: { id: campaignId },
      data: { status: "ACTIVE" },
    });

    revalidatePath("/admin/facebook-ads");
    return { success: true };
  } catch (error: any) {
    console.error("Error resuming campaign:", error);
    return { success: false, error: error.message };
  }
}

// ========================================
// AI-POWERED ACTIONS
// ========================================

export async function generateCampaignWithAI(request: AdGenerationRequest) {
  try {
    // Generer annonsetekster med AI
    const adVariants = await generateAdContent(request);

    // Opprett kampanje
    const campaign = await db.facebookCampaign.create({
      data: {
        name: `${request.productName} - AI Kampanje`,
        objective: request.objective === "leads" ? "LEAD_GENERATION" : "LINK_CLICKS",
        aiGenerated: true,
        aiPrompt: JSON.stringify(request),
        status: "DRAFT",
      },
    });

    // Opprett ad set
    const adSet = await db.facebookAdSet.create({
      data: {
        campaignId: campaign.id,
        name: `${request.productName} - Ad Set`,
        optimizationGoal: request.objective === "leads" ? "LEAD_GENERATION" : "LINK_CLICKS",
        bidStrategy: "LOWEST_COST",
        status: "DRAFT",
      },
    });

    // Opprett annonser for hver variant
    for (const variant of adVariants) {
      await db.facebookAd.create({
        data: {
          adSetId: adSet.id,
          name: `${request.productName} - Variant ${variant.variant}`,
          headline: variant.headline,
          bodyText: variant.bodyText,
          description: variant.description,
          callToAction: variant.callToAction,
          linkUrl: process.env.NEXT_PUBLIC_BASE_URL || "",
          aiGenerated: true,
          aiVariant: variant.variant,
          status: "DRAFT",
        },
      });
    }

    revalidatePath("/admin/facebook-ads");
    return { success: true, campaignId: campaign.id };
  } catch (error: any) {
    console.error("Error generating campaign with AI:", error);
    return { success: false, error: error.message };
  }
}

export async function getAudienceSuggestions(request: AudienceSuggestionRequest) {
  try {
    const suggestions = await suggestAudiences(request);
    return { success: true, suggestions };
  } catch (error: any) {
    console.error("Error getting audience suggestions:", error);
    return { success: false, error: error.message };
  }
}

export async function optimizeCampaign(campaignId: string) {
  try {
    // Hent kampanjedata
    const campaign = await db.facebookCampaign.findUnique({
      where: { id: campaignId },
      include: {
        insights: {
          orderBy: { date: "desc" },
          take: 7, // Siste 7 dager
        },
      },
    });

    if (!campaign) {
      return { success: false, error: "Kampanje ikke funnet" };
    }

    // Beregn totale metrics
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

    // Få AI-anbefalinger
    const recommendations = await analyzeAndOptimize(performance);

    // Lagre i database
    for (const rec of recommendations) {
      await db.campaignOptimizationLog.create({
        data: {
          campaignId: campaign.id,
          analysisType: rec.type,
          findings: JSON.stringify({ performance }),
          recommendations: JSON.stringify(rec),
          priority: rec.priority,
        },
      });
    }

    revalidatePath("/admin/facebook-ads");
    return { success: true, recommendations };
  } catch (error: any) {
    console.error("Error optimizing campaign:", error);
    return { success: false, error: error.message };
  }
}

export async function getBudgetRecommendation(data: {
  objective: string;
  targetAudience: string;
  audienceSize: number;
  desiredConversions: number;
  industry: string;
}) {
  try {
    const recommendation = await recommendBudget(data);
    return { success: true, recommendation };
  } catch (error: any) {
    console.error("Error getting budget recommendation:", error);
    return { success: false, error: error.message };
  }
}

// ========================================
// INSIGHTS SYNC
// ========================================

export async function syncCampaignInsights(campaignId: string) {
  try {
    const campaign = await db.facebookCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign?.facebookCampaignId) {
      return { success: false, error: "Kampanje ikke publisert på Facebook" };
    }

    // Hent insights fra Facebook
    const insights = await facebookAds.getInsights(
      campaign.facebookCampaignId,
      "campaign",
      "last_7d"
    );

    // Lagre i database
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

    revalidatePath("/admin/facebook-ads");
    return { success: true };
  } catch (error: any) {
    console.error("Error syncing insights:", error);
    return { success: false, error: error.message };
  }
}

