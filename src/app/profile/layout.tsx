

import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - Perfil",
  description:
    "Gestione su perfil y preferencias en LubriSmart",
  keywords: ["perfil", "preferencias", "notificaciones", "cuenta"],
  alternates: { canonical: "/profile" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Perfil | LubriSmart",
    description: "Preferencias y cuenta",
    url: "https://lubrismart.ec/profile",
  },
  twitter: {
    card: "summary",
    title: "Perfil | LubriSmart",
    description: "Gestión de cuenta",
  },
  robots: { index: false, follow: false },
};

export default function ProfileLayout({
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