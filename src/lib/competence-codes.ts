/**
 * Kompetansekoder for sertifiserte kurs
 */

export interface CompetenceCode {
  code: string;
  name: string;
  description: string;
  category: "T" | "M" | "G" | "C"; // Truck, Maskin, Graving, Crane
}

export const COMPETENCE_CODES: CompetenceCode[] = [
  // T-koder (Truck)
  {
    code: "T1",
    name: "Motvektstruck 1-10 tonn",
    description: "Føre motvektstruck med kapasitet 1-10 tonn",
    category: "T",
  },
  {
    code: "T2",
    name: "Motvektstruck over 10 tonn",
    description: "Føre motvektstruck med kapasitet over 10 tonn",
    category: "T",
  },
  {
    code: "T4",
    name: "Smalgangstruck",
    description: "Føre smalgangstruck",
    category: "T",
  },

  // M-koder (Maskin)
  {
    code: "M1",
    name: "Hjullaster",
    description: "Føre hjullaster",
    category: "M",
  },
  {
    code: "M2",
    name: "Gravemaskin",
    description: "Føre gravemaskin",
    category: "M",
  },
  {
    code: "M3",
    name: "Dumpere",
    description: "Føre dumpere",
    category: "M",
  },
  {
    code: "M4",
    name: "Minigraver",
    description: "Føre minigraver",
    category: "M",
  },
  {
    code: "M5",
    name: "Kompaktlaster",
    description: "Føre kompaktlaster (bobcat)",
    category: "M",
  },
  {
    code: "M6",
    name: "Teleskoplaster",
    description: "Føre teleskoplaster",
    category: "M",
  },

  // G-koder (Graving/Spesial)
  {
    code: "G4",
    name: "Varme arbeider",
    description: "Utføre varme arbeider",
    category: "G",
  },
  {
    code: "G8",
    name: "Arbeid i høyden",
    description: "Arbeid i høyden",
    category: "G",
  },
  {
    code: "G11",
    name: "Stilas",
    description: "Montering og demontering av stilas",
    category: "G",
  },

  // C-koder (Crane - Kran)
  {
    code: "C1",
    name: "Mobilkran",
    description: "Føre mobilkran",
    category: "C",
  },
  {
    code: "C2",
    name: "Tårnkran",
    description: "Føre tårnkran",
    category: "C",
  },
];

/**
 * Finn kompetansekode info
 */
export function getCompetenceCode(code: string): CompetenceCode | undefined {
  return COMPETENCE_CODES.find((c) => c.code === code);
}

/**
 * Valider kompetansekoder
 */
export function validateCompetenceCodes(codes: string[]): {
  valid: boolean;
  invalidCodes: string[];
} {
  const validCodes = COMPETENCE_CODES.map((c) => c.code);
  const invalidCodes = codes.filter((code) => !validCodes.includes(code));

  return {
    valid: invalidCodes.length === 0,
    invalidCodes,
  };
}

/**
 * Grupper koder etter kategori
 */
export function groupCodesByCategory(codes: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {
    T: [],
    M: [],
    G: [],
    C: [],
  };

  codes.forEach((code) => {
    const info = getCompetenceCode(code);
    if (info) {
      grouped[info.category].push(code);
    }
  });

  return grouped;
}

