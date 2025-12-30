import { ProtectedLayout } from "@/components/layout/protected-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clasificación",
  description: "Clasificación automática de productos por rotación y margen",
  alternates: { canonical: "/classification" },
};

export default function ClassificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}