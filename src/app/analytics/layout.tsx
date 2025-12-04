

import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - Analisis",
  description: "Panel de análisis, reportes y tendencias",
  keywords: ["análisis", "reportes", "tendencias", "ventas", "clientes"],
  alternates: { canonical: "/analytics" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Análisis | LubriSmart",
    description: "Reportes y tendencias del negocio",
    url: "https://lubrismart.ec/analytics",
  },
  twitter: {
    card: "summary_large_image",
    title: "Análisis | LubriSmart",
    description: "Reportes y tendencias",
  },
  robots: { index: true, follow: true },
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedLayout>
      {children}
    </ProtectedLayout>
  )
}