import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - Usuarios",
  description: "Gestión de usuarios en LubriSmart",
  keywords: ["usuarios", "roles", "permisos", "seguridad"],
  alternates: { canonical: "/users" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Usuarios | LubriSmart",
    description: "Gestión de usuarios y roles",
    url: "https://lubrismart.ec/users",
  },
  twitter: {
    card: "summary",
    title: "Usuarios | LubriSmart",
    description: "Roles y permisos",
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