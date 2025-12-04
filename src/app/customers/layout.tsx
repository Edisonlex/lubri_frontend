

import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - clientes",
  description: "Gestión de clientes, CRM y recordatorios de mantenimiento",
  keywords: ["clientes", "CRM", "mantenimiento", "contactos", "seguimiento"],
  alternates: { canonical: "/customers" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Clientes | LubriSmart",
    description: "Administra clientes y sus mantenimientos",
    url: "https://lubrismart.ec/customers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clientes | LubriSmart",
    description: "Gestión y CRM",
  },
  robots: { index: false, follow: false },
};


export default function CustomersLayout({
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