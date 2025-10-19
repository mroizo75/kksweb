import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KKS AS - Profesjonell kursvirksomhet",
  description:
    "Kurs for truck, kran, stillas, arbeid på vei, HMS og mer. Profesjonell opplæring med erfarne instruktører.",
  keywords: "kurs, truck, kran, stillas, HMS, arbeidssikkerhet, sertifisering",
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
