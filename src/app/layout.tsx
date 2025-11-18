import type React from "react";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AuthProvider } from "@/contexts/auth-context";
import { POSProvider } from "@/contexts/pos-context";
import { GISProvider } from "@/contexts/gis-context";
import { AlertProvider } from "@/contexts/alerts-context";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "LubriSmart - Sistema de Gestión para Lubricadoras",
    template: "%s | LubriSmart",
  },
  description:
    "Sistema integral para la gestión de lubricadoras en La Maná, Ecuador: POS, inventario, CRM, servicios y análisis.",
  keywords: [
    "lubricadora",
    "La Maná",
    "Ecuador",
    "POS",
    "inventario",
    "CRM",
    "servicios",
    "facturación electrónica",
  ],
  authors: [{ name: "LubriSmart" }],
  creator: "LubriSmart",
  metadataBase: new URL("https://lubrismart.ec"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "LubriSmart",
    title: "LubriSmart - Sistema de Gestión para Lubricadoras",
    description:
      "Gestión completa de lubricadoras: ventas, inventario, clientes y servicios.",
    url: "https://lubrismart.ec/",
  },
  twitter: {
    card: "summary_large_image",
    title: "LubriSmart",
    description:
      "Sistema de gestión para lubricadoras en La Maná, Ecuador.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning // ← Agregar esto
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AlertProvider>
            <AuthProvider>
              <POSProvider>
                <GISProvider>
                  <Toaster />
                  {children}
                </GISProvider>
              </POSProvider>
            </AuthProvider>
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}