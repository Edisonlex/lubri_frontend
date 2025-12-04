import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - Ventas",
  description: "Gestión de ventas en LubriSmart",
  keywords: ["ventas", "facturación", "comprobantes", "SRI"],
  alternates: { canonical: "/ventas" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Ventas | LubriSmart",
    description: "Listado y detalle de ventas",
    url: "https://lubrismart.ec/ventas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventas | LubriSmart",
    description: "Gestión de ventas",
  },
  robots: { index: false, follow: false },
};


export default function UsersLayout({
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