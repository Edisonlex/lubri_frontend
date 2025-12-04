

import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - Dashboard",
  description:
    "Panel de control del sistema: KPIs, ventas, productos y alertas",
  keywords: ["dashboard", "KPIs", "ventas", "inventario", "alertas"],
  alternates: { canonical: "/dashboard" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Dashboard | LubriSmart",
    description: "Resumen de KPIs y actividad del sistema",
    url: "https://lubrismart.ec/dashboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard | LubriSmart",
    description: "KPIs y actividad",
  },
  robots: { index: true, follow: true },
};

export default function DashboardLayout({
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