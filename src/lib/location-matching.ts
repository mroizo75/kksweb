const sessionLocationKeywordMap: Record<string, readonly string[]> = {
  oslo: ["oslo", "akershus", "baerum", "bærum", "lillestrom", "lillestrøm"],
  bergen: ["bergen", "vestland"],
  trondheim: ["trondheim", "trondelag", "trøndelag"],
  stavanger: ["stavanger", "sandnes", "rogaland"],
  kristiansand: ["kristiansand", "agder"],
  tromso: ["tromso", "tromsø", "nord-norge", "nord norge"],
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
