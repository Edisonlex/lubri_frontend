import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - Proveedores",
  description: "Gestión de proveedores, contactos y compras",
  keywords: [
    "proveedores",
    "compras",
    "contactos",
    "logística",
    "lubricadora",
  ],
  alternates: { canonical: "/suppliers" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Proveedores | LubriSmart",
    description: "Administra proveedores, contactos y compras",
    url: "https://lubrismart.ec/suppliers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Proveedores | LubriSmart",
    description: "Gestión de proveedores y compras",
  },
  robots: { index: false, follow: false },
};

export default function SuppliersLayout({
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