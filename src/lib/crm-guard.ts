import { auth } from "@/lib/auth";

export type CrmSession = {
  userId: string;
  isAdmin: boolean;
};

/**
 * Henter og validerer sesjon for CRM-ruter.
 * Kaster hvis brukeren ikke er autentisert.
 */
export async function getCrmSession(): Promise<CrmSession> {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }

  const role = (session?.user as any)?.role as string | undefined;
  const isAdmin = role === "ADMIN";

  return { userId, isAdmin };
}

/**
 * Bygger Prisma where-klausul for instruktørbegrenset CRM-data.
 *
 * For ADMIN returneres ingen ekstra filter (undefined = ingen begrensning).
 * For INSTRUCTOR returneres filter basert på eier-felt.
 */
export function ownerFilter(
  session: CrmSession,
  field: "ownerId" | "assignedToId" | "createdById" = "ownerId"
): Record<string, string> | undefined {
  if (session.isAdmin) return undefined;
  return { [field]: session.userId };
}

/**
 * Slår sammen et eksisterende where-objekt med instruktør-scope.
 * Brukes der det allerede finnes andre filtere (f.eks. status, stage).
 */
export function withOwnerScope<T extends Record<string, unknown>>(
  base: T,
  session: CrmSession,
  field: "ownerId" | "assignedToId" | "createdById" = "ownerId"
): T | (T & Record<string, string>) {
  if (session.isAdmin) return base;
  return { ...base, [field]: session.userId };
}

/**
 * Sjekker om en instruktør har tilgang til en gitt entitet.
 * Returnerer true for admins alltid.
 */
export function assertOwnership(
  session: CrmSession,
  entityOwnerId: string | null | undefined
): boolean {
  if (session.isAdmin) return true;
  return entityOwnerId === session.userId;
}
