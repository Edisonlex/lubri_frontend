
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - Configuración",
  description: "Configura tu cuenta y preferencias en LubriSmart.",
  keywords: ["configuración", "preferencias", "ajustes"],
  alternates: { canonical: "/settings" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Configuración | LubriSmart",
    description: "Ajustes de cuenta y sistema",
    url: "https://lubrismart.ec/settings",
  },
  twitter: {
    card: "summary",
    title: "Configuración | LubriSmart",
    description: "Preferencias",
  },
  robots: { index: false, follow: false },
};

export default function SettingsLayout({
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