import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://www.kksas.no"),
  title: "KKS AS - Profesjonell kursvirksomhet",
  description:
    "Kurs for truck, kran, stillas, arbeid på vei, HMS og mer. Profesjonell opplæring med erfarne instruktører.",
  keywords: "kurs, truck, kran, stillas, HMS, arbeidssikkerhet, sertifisering",
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
    url: "https://www.kksas.no",
    siteName: "KKS AS",
    title: "KKS AS - Profesjonell kursvirksomhet",
    description: "Kurs for truck, kran, stillas, arbeid på vei, HMS og mer. Profesjonell opplæring med erfarne instruktører.",
    images: [
      {
        url: "/logo-black-kks.png",
        width: 1200,
        height: 630,
        alt: "KKS AS Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KKS AS - Profesjonell kursvirksomhet",
    description: "Kurs for truck, kran, stillas, arbeid på vei, HMS og mer",
    images: ["/logo-black-kks.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
