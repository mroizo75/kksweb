/** True når Prisma ikke får kontakt med databasen. Andre feil skal fortsatt stoppe bygget. */
export function isDatabaseUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "PrismaClientInitializationError" ||
    error.message.includes("Can't reach database server")
  );
}

/** Kjører spørringen. Returnerer tomt resultat når databasen ikke svarer, slik at bygget ikke stopper. */
export async function queryOrEmpty<T>(query: () => Promise<T>, empty: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (isDatabaseUnavailable(error)) return empty;
    throw error;
  }
}
