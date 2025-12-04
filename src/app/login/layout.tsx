

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - Login ",
  description:
    "Sistema integral para la gestión de lubricadoras con POS, inventario, CRM y análisis",
  keywords: ["login", "autenticación", "acceso"],
  alternates: { canonical: "/login" },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "Login | LubriSmart",
    description: "Acceso al sistema LubriSmart",
    url: "https://lubrismart.ec/login",
  },
  twitter: {
    card: "summary",
    title: "Login | LubriSmart",
    description: "Acceso al sistema",
  },
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}