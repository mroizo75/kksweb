// AI-assistert Facebook Ads optimalisering
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ========================================
// AI AD GENERATION
// ========================================

export interface AdGenerationRequest {
  businessType: string; // "kursvirksomhet", "SaaS", etc.
  productName: string;
  productDescription: string;
  targetAudience: string;
  objective: string; // "leads", "traffic", "conversions"
  tone?: string; // "professional", "casual", "urgent"
  variants?: number; // Antall varianter for A/B testing
}

export interface GeneratedAd {
  variant: string;
  headline: string;
  bodyText: string;
  description: string;
  callToAction: string;
  reasoning: string; // Hvorfor AI valgte denne tilnærmingen
}

export async function generateAdContent(
  request: AdGenerationRequest
): Promise<GeneratedAd[]> {
  const variants = request.variants || 3;
  const tone = request.tone || "professional";

  const prompt = `Du er en ekspert på Facebook-annonsering for norske bedrifter.

OPPGAVE: Lag ${variants} forskjellige annonsevariasjoner for A/B testing.

BEDRIFTSINFORMASJON:
- Bransje: ${request.businessType}
- Produkt: ${request.productName}
- Beskrivelse: ${request.productDescription}
- Målgruppe: ${request.targetAudience}
- Mål: ${request.objective}
- Tone: ${tone}

KRAV:
1. Hver variant må være FORSKJELLIG i tilnærming
2. Overskrift: Maks 40 tegn, fengende og relevant
3. Brødtekst: 90-125 tegn, klar verdiforslag
4. Beskrivelse: 15-30 tegn, utdypende info
5. Call-to-action: Velg riktig CTA for målet
6. Skriv på norsk (bokmål)

TILNÆRMINGER:
- Variant A: Fokus på problemløsning
- Variant B: Fokus på resultat/verdi
- Variant C: Fokus på sosial proof/autoritet

FORMAT:
Returner BARE et JSON-array med følgende struktur (ingen ekstra tekst):
[
  {
    "variant": "A",
    "headline": "...",
    "bodyText": "...",
    "description": "...",
    "callToAction": "LEARN_MORE", 
    "reasoning": "..."
  }
]

GYLDIGE CALL-TO-ACTIONS:
LEARN_MORE, SIGN_UP, SHOP_NOW, BOOK_TRAVEL, CONTACT_US, DOWNLOAD, GET_QUOTE, APPLY_NOW

Start generering nå:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "Du er en ekspert på Facebook-annonsering. Du snakker norsk og lager høykonverterende annonser.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Ingen respons fra AI");

    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.ads || [];
  } catch (error) {
    console.error("AI Ad Generation Error:", error);
    throw new Error("Kunne ikke generere annonser med AI");
  }
}

// ========================================
// AUDIENCE SUGGESTIONS
// ========================================

export interface AudienceSuggestionRequest {
  productName: string;
  productDescription: string;
  existingCustomers?: string; // Beskrivelse av eksisterende kunder
  budget: number;
  goal: string;
}

export interface AudienceSuggestion {
  name: string;
  description: string;
  targeting: {
    ageMin: number;
    ageMax: number;
    genders?: number[];
    interests?: string[];
    behaviors?: string[];
    detailedTargeting?: string[];
  };
  estimatedReach: string;
  reasoning: string;
}

export async function suggestAudiences(
  request: AudienceSuggestionRequest
): Promise<AudienceSuggestion[]> {
  const prompt = `Du er en ekspert på målgruppeanalyse for Facebook-annonser i Norge.

OPPGAVE: Foreslå 3 målgrupper for dette produktet.

PRODUKTINFO:
- Navn: ${request.productName}
- Beskrivelse: ${request.productDescription}
${request.existingCustomers ? `- Eksisterende kunder: ${request.existingCustomers}` : ""}
- Budsjett: ${request.budget} NOK/dag
- Mål: ${request.goal}

KRAV:
1. Hver målgruppe må være DISTINKT
2. Basert på norske demografier og interesser
3. Realistisk reach for det norske markedet
4. Inkluder konkrete interesser/behaviors

FORMAT (returner BARE JSON):
{
  "audiences": [
    {
      "name": "...",
      "description": "...",
      "targeting": {
        "ageMin": 25,
        "ageMax": 54,
        "genders": [1, 2],
        "interests": ["interesse-id"],
        "behaviors": ["behavior-id"]
      },
      "estimatedReach": "50 000 - 100 000",
      "reasoning": "..."
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Du er en ekspert på Facebook-målgrupper i Norge.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Ingen respons fra AI");

    const parsed = JSON.parse(content);
    return parsed.audiences || [];
  } catch (error) {
    console.error("AI Audience Suggestion Error:", error);
    throw new Error("Kunne ikke generere målgruppeforslag");
  }
}

// ========================================
// CAMPAIGN OPTIMIZATION
// ========================================

export interface CampaignPerformance {
  campaignName: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  cpm: number;
  ctr: number;
  conversionRate: number;
  daysRunning: number;
}

export interface OptimizationRecommendation {
  type: "BUDGET" | "TARGETING" | "CREATIVE" | "SCHEDULE" | "BID_STRATEGY";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: string;
  reasoning: string;
}

export async function analyzeAndOptimize(
  performance: CampaignPerformance
): Promise<OptimizationRecommendation[]> {
  const prompt = `Du er en ekspert på Facebook Ads-optimalisering.

KAMPANJE-DATA:
- Navn: ${performance.campaignName}
- Mål: ${performance.objective}
- Brukt: ${performance.spend} NOK
- Visninger: ${performance.impressions}
- Klikk: ${performance.clicks}
- Konverteringer: ${performance.conversions}
- CPC: ${performance.cpc.toFixed(2)} NOK
- CPM: ${performance.cpm.toFixed(2)} NOK
- CTR: ${performance.ctr.toFixed(2)}%
- Konverteringsrate: ${performance.conversionRate.toFixed(2)}%
- Dager kjørt: ${performance.daysRunning}

OPPGAVE: Analyser ytelsen og gi konkrete optimaliseringsforslag.

BENCHMARKS (Norge):
- CTR: 1.5-2.5% (bra), <1% (dårlig)
- CPC: 5-15 NOK (bra), >20 NOK (dårlig)
- Konverteringsrate: >2% (bra), <1% (dårlig)

FORMAT (returner BARE JSON):
{
  "recommendations": [
    {
      "type": "BUDGET|TARGETING|CREATIVE|SCHEDULE|BID_STRATEGY",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "title": "Kort tittel",
      "description": "Detaljert forklaring",
      "actionItems": ["Konkret handling 1", "Konkret handling 2"],
      "estimatedImpact": "Forventet resultat",
      "reasoning": "Hvorfor dette er viktig"
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Du er en Facebook Ads-ekspert som analyserer kampanjer og gir datadrevne råd.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Ingen respons fra AI");

    const parsed = JSON.parse(content);
    return parsed.recommendations || [];
  } catch (error) {
    console.error("AI Optimization Error:", error);
    throw new Error("Kunne ikke generere optimaliseringsforslag");
  }
}

// ========================================
// BUDGET RECOMMENDATIONS
// ========================================

export interface BudgetRecommendation {
  dailyBudget: number;
  weeklyBudget: number;
  monthlyBudget: number;
  expectedResults: {
    impressions: string;
    clicks: string;
    conversions: string;
  };
  reasoning: string;
}

export async function recommendBudget(request: {
  objective: string;
  targetAudience: string;
  audienceSize: number;
  desiredConversions: number;
  industry: string;
}): Promise<BudgetRecommendation> {
  const prompt = `Du er en ekspert på Facebook Ads-budsjettering for norske bedrifter.

KAMPANJEMÅL:
- Mål: ${request.objective}
- Målgruppe: ${request.targetAudience}
- Målgruppestørrelse: ${request.audienceSize}
- Ønsket konverteringer: ${request.desiredConversions}
- Bransje: ${request.industry}

OPPGAVE: Anbefal realistisk budsjett for det norske markedet.

BENCHMARK-KOSTNADER (Norge 2024):
- CPC: 8-15 NOK
- CPM: 60-120 NOK
- Cost per lead: 50-200 NOK (avhengig av bransje)

FORMAT (returner BARE JSON):
{
  "dailyBudget": 500,
  "weeklyBudget": 3500,
  "monthlyBudget": 15000,
  "expectedResults": {
    "impressions": "20 000 - 30 000",
    "clicks": "300 - 500",
    "conversions": "15 - 30"
  },
  "reasoning": "Detaljert forklaring på hvorfor dette budsjettet er riktig"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "Du er en ekspert på Facebook Ads-budsjettering.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Ingen respons fra AI");

    return JSON.parse(content);
  } catch (error) {
    console.error("AI Budget Recommendation Error:", error);
    throw new Error("Kunne ikke generere budsjettforslag");
  }
}

