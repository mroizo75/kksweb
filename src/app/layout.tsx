import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo/schema";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "KKS AS — Profesjonell kursvirksomhet i Norge",
    template: "%s | KKS AS",
  },
  description:
    "KKS AS er en ledende norsk kurstilbyder innen truck, kran, stillas, arbeid på vei, HMS og BHT-opplæring. Sertifiserte instruktører i hele Norge.",
  keywords: [
    "kurs",
    "truckkurs",
    "krankurs",
    "stillasmontørkurs",
    "HMS kurs",
    "BHT kurs",
    "arbeid på vei",
    "maskinførerkurs",
    "sertifisering Norge",
    "KKS AS",
  ],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome", url: "/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "android-chrome", url: "/android-chrome-512x512.png", sizes: "512x512" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KKS AS",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: BASE_URL,
    siteName: "KKS AS",
    title: "KKS AS — Profesjonell kursvirksomhet i Norge",
    description:
      "KKS AS er en ledende norsk kurstilbyder innen truck, kran, stillas, arbeid på vei, HMS og BHT-opplæring. Sertifiserte instruktører i hele Norge.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "KKS AS — Profesjonell kursvirksomhet i Norge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KKS AS — Profesjonell kursvirksomhet i Norge",
    description:
      "Truck, kran, stillas, arbeid på vei, HMS og BHT-kurs. Sertifiserte instruktører i hele Norge.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema(BASE_URL);
  const webSiteSchema = generateWebSiteSchema(BASE_URL);

  return (
    <html lang="nb">
      <body className={inter.className}>
        <StructuredData data={[organizationSchema, webSiteSchema]} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
