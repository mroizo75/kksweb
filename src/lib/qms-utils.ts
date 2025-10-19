/**
 * ISO 9001 validering av statusendringer
 */
export function validateStatusChange(
  currentStatus: string,
  newStatus: string,
  severity: string,
  hasCorrectiveActions: boolean
): { valid: boolean; error?: string } {
  // REJECTED kan alltid settes (avvik som ikke er reelle)
  if (newStatus === "REJECTED") {
    return { valid: true };
  }

  // Observasjoner (OBSERVATION) kan lukkes uten tiltak
  if (newStatus === "CLOSED" && severity === "OBSERVATION") {
    return { valid: true };
  }

  // Kan ikke lukke uten korrigerende tiltak (ISO 9001 krav)
  if (newStatus === "CLOSED" && !hasCorrectiveActions) {
    return {
      valid: false,
      error: "Avvik kan ikke lukkes uten korrigerende tiltak. Legg til minst ett tiltak først.",
    };
  }

  // Kan ikke lukke direkte fra OPEN (må gjennom prosess)
  if (currentStatus === "OPEN" && newStatus === "CLOSED") {
    return {
      valid: false,
      error: "Avvik må gå gjennom undersøkelse og verifisering før lukking (ISO 9001 krav).",
    };
  }

  // Kan ikke lukke fra INVESTIGATING (må iverksette tiltak først)
  if (currentStatus === "INVESTIGATING" && newStatus === "CLOSED") {
    return {
      valid: false,
      error: "Avvik må ha iverksatte tiltak før lukking.",
    };
  }

  // Kun VERIFICATION kan gå til CLOSED (normal flyt)
  if (newStatus === "CLOSED" && currentStatus !== "VERIFICATION") {
    return {
      valid: false,
      error: "Avvik må være i VERIFICATION før det kan lukkes.",
    };
  }

  // Alle andre endringer er OK
  return { valid: true };
}

/**
 * Få tillatte statusendringer basert på nåværende status (for UI)
 */
export function getAllowedStatusTransitions(
  currentStatus: string,
  severity: string,
  hasCorrectiveActions: boolean
): Array<{ value: string; label: string; description: string }> {
  const transitions = [
    {
      value: "OPEN",
      label: "Åpen",
      description: "Avvik er registrert",
    },
    {
      value: "INVESTIGATING",
      label: "Under undersøkelse",
      description: "Årsaksanalyse pågår",
    },
    {
      value: "ACTION",
      label: "Tiltak iverksatt",
      description: "Korrigerende tiltak er iverksatt",
    },
    {
      value: "VERIFICATION",
      label: "Til verifisering",
      description: "Verifiserer effektivitet av tiltak",
    },
    {
      value: "CLOSED",
      label: "Lukket",
      description: "Avvik er lukket etter verifisering",
    },
    {
      value: "REJECTED",
      label: "Avvist",
      description: "Ikke et reelt avvik",
    },
  ];

  // Filtrer basert på regler
  return transitions.filter((t) => {
    const validation = validateStatusChange(
      currentStatus,
      t.value,
      severity,
      hasCorrectiveActions
    );
    return validation.valid;
  });
}

