import { Prisma } from "@prisma/client";

export function isMissingColumnError(
  error: unknown,
  columnCandidates: string[]
): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code !== "P2022") {
      return false;
    }

    const metaColumn =
      typeof error.meta?.column === "string" ? error.meta.column : "";
    return columnCandidates.some((candidate) => metaColumn.includes(candidate));
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("unknown column") &&
      columnCandidates.some((candidate) =>
        message.includes(candidate.toLowerCase())
      )
    );
  }

  return false;
}
