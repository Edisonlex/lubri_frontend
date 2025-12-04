

import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventario - Lubricentro",
  description:
    "Gestiona inventario, stock mínimo/máximo, alertas y movimientos",
  keywords: ["inventario", "stock", "alertas", "movimientos", "productos"],
  alternates: { canonical: "/inventory" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Inventario | LubriSmart",
    description: "Gestión de inventario y stock",
    url: "https://lubrismart.ec/inventory",
  },
  twitter: {
    card: "summary_large_image",
    title: "Inventario | LubriSmart",
    description: "Control de stock y alertas",
  },
  robots: { index: false, follow: false },
};

export default function InventoryLayout({
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