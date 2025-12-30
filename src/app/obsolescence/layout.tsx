import { ProtectedLayout } from "@/components/layout/protected-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obsolescencia",
  description: "Análisis de productos obsoletos y métricas de impacto",
  alternates: { canonical: "/obsolescence" },
};

export default function ObsolescenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}