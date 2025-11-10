// Facebook Marketing API Integration
// Dokumentasjon: https://developers.facebook.com/docs/marketing-api

interface FacebookConfig {
  accessToken: string;
  accountId: string;
  appId: string;
  appSecret: string;
}

class FacebookAdsClient {
  private config: FacebookConfig;
  private baseUrl = "https://graph.facebook.com/v18.0";

  constructor() {
    this.config = {
      accessToken: process.env.FACEBOOK_ACCESS_TOKEN || "",
      accountId: process.env.FACEBOOK_AD_ACCOUNT_ID || "",
      appId: process.env.FACEBOOK_APP_ID || "",
      appSecret: process.env.FACEBOOK_APP_SECRET || "",
    };
  }

  private async request(endpoint: string, method: string = "GET", data?: any) {
    const url = `${this.baseUrl}/${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const params = new URLSearchParams({
      access_token: this.config.accessToken,
    });

    if (method === "GET" && data) {
      Object.keys(data).forEach((key) => params.append(key, data[key]));
    }

    if (method === "POST" && data) {
      options.body = JSON.stringify(data);
    }

    const fullUrl = `${url}?${params.toString()}`;
    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${error.error?.message || "Unknown error"}`);
    }

    return response.json();
  }

  // ========================================
  // KAMPANJE (Campaign)
  // ========================================

  async createCampaign(data: {
    name: string;
    objective: string;
    status?: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    specialAdCategories?: string[];
  }) {
    const campaignData: any = {
      name: data.name,
      objective: data.objective,
      status: data.status || "PAUSED",
      special_ad_categories: data.specialAdCategories || [],
    };

    if (data.dailyBudget) {
      campaignData.daily_budget = Math.round(data.dailyBudget * 100); // Øre til Facebook
    }

    if (data.lifetimeBudget) {
      campaignData.lifetime_budget = Math.round(data.lifetimeBudget * 100);
    }

    return this.request(`act_${this.config.accountId}/campaigns`, "POST", campaignData);
  }

  async updateCampaign(campaignId: string, data: any) {
    return this.request(campaignId, "POST", data);
  }

  async getCampaign(campaignId: string) {
    return this.request(campaignId, "GET", {
      fields: "name,objective,status,daily_budget,lifetime_budget,start_time,stop_time",
    });
  }

  async pauseCampaign(campaignId: string) {
    return this.updateCampaign(campaignId, { status: "PAUSED" });
  }

  async resumeCampaign(campaignId: string) {
    return this.updateCampaign(campaignId, { status: "ACTIVE" });
  }

  async deleteCampaign(campaignId: string) {
    return this.request(campaignId, "DELETE");
  }

  // ========================================
  // AD SET
  // ========================================

  async createAdSet(data: {
    campaignId: string;
    name: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    targeting: any;
    optimizationGoal: string;
    bidStrategy: string;
    startTime?: Date;
    endTime?: Date;
  }) {
    const adSetData: any = {
      campaign_id: data.campaignId,
      name: data.name,
      targeting: data.targeting,
      optimization_goal: data.optimizationGoal,
      bid_strategy: data.bidStrategy,
      billing_event: "IMPRESSIONS",
      status: "PAUSED",
    };

    if (data.dailyBudget) {
      adSetData.daily_budget = Math.round(data.dailyBudget * 100);
    }

    if (data.lifetimeBudget) {
      adSetData.lifetime_budget = Math.round(data.lifetimeBudget * 100);
    }

    if (data.startTime) {
      adSetData.start_time = data.startTime.toISOString();
    }

    if (data.endTime) {
      adSetData.end_time = data.endTime.toISOString();
    }

    return this.request(`act_${this.config.accountId}/adsets`, "POST", adSetData);
  }

  async updateAdSet(adSetId: string, data: any) {
    return this.request(adSetId, "POST", data);
  }

  // ========================================
  // AD (Annonse)
  // ========================================

  async createAd(data: {
    adSetId: string;
    name: string;
    creative: {
      headline: string;
      bodyText: string;
      description?: string;
      callToAction: string;
      linkUrl: string;
      imageUrl?: string;
      videoUrl?: string;
    };
  }) {
    // Først opprett creative
    const creativeData: any = {
      name: `${data.name} - Creative`,
      object_story_spec: {
        page_id: process.env.FACEBOOK_PAGE_ID,
        link_data: {
          link: data.creative.linkUrl,
          message: data.creative.bodyText,
          name: data.creative.headline,
          description: data.creative.description,
          call_to_action: {
            type: data.creative.callToAction,
            value: {
              link: data.creative.linkUrl,
            },
          },
        },
      },
    };

    if (data.creative.imageUrl) {
      creativeData.object_story_spec.link_data.picture = data.creative.imageUrl;
    }

    const creative = await this.request(
      `act_${this.config.accountId}/adcreatives`,
      "POST",
      creativeData
    );

    // Så opprett annonsen
    const adData = {
      name: data.name,
      adset_id: data.adSetId,
      creative: { creative_id: creative.id },
      status: "PAUSED",
    };

    return this.request(`act_${this.config.accountId}/ads`, "POST", adData);
  }

  async updateAd(adId: string, data: any) {
    return this.request(adId, "POST", data);
  }

  // ========================================
  // INSIGHTS (Statistikk)
  // ========================================

  async getInsights(
    objectId: string,
    level: "campaign" | "adset" | "ad",
    datePreset: string = "last_7d"
  ) {
    return this.request(`${objectId}/insights`, "GET", {
      level,
      date_preset: datePreset,
      fields: [
        "spend",
        "impressions",
        "reach",
        "clicks",
        "cpc",
        "cpm",
        "ctr",
        "actions",
        "cost_per_action_type",
      ].join(","),
    });
  }

  async getInsightsByDate(
    objectId: string,
    startDate: string,
    endDate: string
  ) {
    return this.request(`${objectId}/insights`, "GET", {
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      fields: [
        "spend",
        "impressions",
        "reach",
        "clicks",
        "cpc",
        "cpm",
        "ctr",
        "actions",
        "conversions",
      ].join(","),
    });
  }

  // ========================================
  // MÅLGRUPPER (Audiences)
  // ========================================

  async createCustomAudience(data: {
    name: string;
    description?: string;
    subtype: string;
  }) {
    return this.request(`act_${this.config.accountId}/customaudiences`, "POST", {
      name: data.name,
      description: data.description,
      subtype: data.subtype,
    });
  }

  async createLookalikeAudience(data: {
    name: string;
    sourceAudienceId: string;
    countries: string[];
    ratio: number; // 0.01 - 0.20 (1% - 20%)
  }) {
    return this.request(`act_${this.config.accountId}/customaudiences`, "POST", {
      name: data.name,
      subtype: "LOOKALIKE",
      origin_audience_id: data.sourceAudienceId,
      lookalike_spec: {
        type: "similarity",
        ratio: data.ratio,
        country: data.countries.join(","),
      },
    });
  }

  // ========================================
  // AUDIENCE INSIGHTS
  // ========================================

  async getAudienceInsights(targeting: any) {
    return this.request(`act_${this.config.accountId}/audienceinsights`, "GET", {
      targeting_spec: JSON.stringify(targeting),
    });
  }

  // ========================================
  // BATCH OPERATIONS
  // ========================================

  async batchRequest(requests: Array<{ method: string; relative_url: string }>) {
    return this.request("", "POST", {
      batch: requests,
    });
  }
}

export const facebookAds = new FacebookAdsClient();

// ========================================
// HELPER FUNCTIONS
// ========================================

export function buildTargeting(options: {
  countries?: string[];
  ageMin?: number;
  ageMax?: number;
  genders?: number[]; // 1=male, 2=female
  interests?: string[];
  behaviors?: string[];
  customAudiences?: string[];
  excludeAudiences?: string[];
}) {
  const targeting: any = {
    geo_locations: {
      countries: options.countries || ["NO"],
    },
  };

  if (options.ageMin) targeting.age_min = options.ageMin;
  if (options.ageMax) targeting.age_max = options.ageMax;
  if (options.genders) targeting.genders = options.genders;

  if (options.interests && options.interests.length > 0) {
    targeting.interests = options.interests.map((id) => ({ id }));
  }

  if (options.behaviors && options.behaviors.length > 0) {
    targeting.behaviors = options.behaviors.map((id) => ({ id }));
  }

  if (options.customAudiences && options.customAudiences.length > 0) {
    targeting.custom_audiences = options.customAudiences.map((id) => ({ id }));
  }

  if (options.excludeAudiences && options.excludeAudiences.length > 0) {
    targeting.excluded_custom_audiences = options.excludeAudiences.map((id) => ({ id }));
  }

  return targeting;
}

export function calculateMetrics(insights: any) {
  const spend = parseFloat(insights.spend || "0");
  const impressions = parseInt(insights.impressions || "0");
  const clicks = parseInt(insights.clicks || "0");
  const reach = parseInt(insights.reach || "0");

  return {
    spend,
    impressions,
    reach,
    clicks,
    cpc: clicks > 0 ? spend / clicks : 0,
    cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
  };
}

