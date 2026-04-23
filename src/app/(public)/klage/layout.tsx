import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata: Metadata = {
  title: "Klage eller tilbakemelding — KKS AS",
  description:
    "Send inn klage eller tilbakemelding til KKS AS. Vi tar alle henvendelser på alvor og svarer innen 3–5 virkedager.",
  alternates: {
    canonical: `${BASE_URL}/klage`,
  },
};

export default function KlageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
