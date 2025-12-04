

import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - punto de venta",
  description: "Sistema de gestion para talleres automotrices",
  keywords: ["POS", "ventas", "punto de venta", "tickets"],
  alternates: { canonical: "/pos" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Punto de Venta | LubriSmart",
    description: "Registra ventas y genera comprobantes",
    url: "https://lubrismart.ec/pos",
  },
  twitter: {
    card: "summary_large_image",
    title: "Punto de Venta | LubriSmart",
    description: "Ventas en LubriSmart",
  },
  robots: { index: false, follow: false },
};

export default function POSLayout({
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