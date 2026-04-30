const sessionLocationKeywordMap: Record<string, readonly string[]> = {
  // ─── Eksisterende storbyer ─────────────────────────────────────────────
  oslo: ["oslo", "akershus", "baerum", "bærum", "lillestrom", "lillestrøm", "jessheim", "ski "],
  bergen: ["bergen", "vestland"],
  trondheim: ["trondheim", "trondelag", "trøndelag"],
  stavanger: ["stavanger", "sandnes", "rogaland"],
  kristiansand: ["kristiansand", "agder"],
  tromso: ["tromso", "tromsø", "nord-norge", "nord norge"],

  // ─── Viken og Østlandet ─────────────────────────────────────────────────
  hamar: ["hamar", "hedmarken", "hedmark"],
  drammen: ["drammen", "nedre eiker", "øvre eiker", "sande ", "svelvik"],
  lierbyen: ["lierbyen", "lier ", "lier,"],
  fredrikstad: ["fredrikstad", "østfold"],
  sarpsborg: ["sarpsborg"],
  moss: ["moss ", "moss,", "rygge", "råde"],
  lillestrøm: ["lillestrøm", "lillestrom", "skedsmo", "lørenskog", "rælingen"],
  asker: ["asker", "sandvika", "bærum", "baerum"],
  kongsberg: ["kongsberg", "numedal"],
  halden: ["halden", "aremark"],

  // ─── Vestfold og Telemark ──────────────────────────────────────────────
  horten: ["horten", "re kommune", "åsgårdstrand"],
  "tønsberg": ["tønsberg", "tonsberg", "sandefjord", "stokke"],
  larvik: ["larvik", "stavern"],
  skien: ["skien", "telemark", "grenland"],
  porsgrunn: ["porsgrunn", "grenland", "bamble"],

  // ─── Agder ────────────────────────────────────────────────────────────
  arendal: ["arendal", "aust-agder", "grimstad"],

  // ─── Rogaland ──────────────────────────────────────────────────────────
  haugesund: ["haugesund", "haugalandet", "karmøy", "tysvær"],

  // ─── Møre og Romsdal ──────────────────────────────────────────────────
  ålesund: ["ålesund", "alesund", "sunnmøre", "sunnmore", "ørsta", "volda"],
  molde: ["molde", "romsdal", "rauma"],

  // ─── Innlandet ────────────────────────────────────────────────────────
  gjøvik: ["gjøvik", "gjovik", "toten", "land "],
  lillehammer: ["lillehammer", "gudbrandsdalen", "øyer", "gausdal"],
  elverum: ["elverum", "solør", "åmot"],

  // ─── Nordland og Nord-Norge ───────────────────────────────────────────
  bodø: ["bodø", "bodo ", "bodo,", "nordland", "fauske"],
  harstad: ["harstad", "sør-troms", "kvæfjord"],
  narvik: ["narvik", "ofoten", "ballangen"],
  "mo-i-rana": ["mo i rana", "mo-i-rana", "rana ", "helgeland"],
  alta: ["alta ", "alta,", "finnmark"],
};

export function getSessionLocationKeywords(locationSlug: string): readonly string[] {
  const normalizedSlug = locationSlug.trim().toLowerCase();
  const mappedKeywords = sessionLocationKeywordMap[normalizedSlug];
  if (mappedKeywords && mappedKeywords.length > 0) {
    return mappedKeywords;
  }

  if (!normalizedSlug) {
    return [];
  }

  return [normalizedSlug];
}

export function buildSessionLocationOrFilter(locationSlug: string) {
  const keywords = getSessionLocationKeywords(locationSlug);
  return keywords.map((keyword) => ({
    location: {
      contains: keyword,
    },
  }));
}
