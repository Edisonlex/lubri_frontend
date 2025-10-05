

import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventario - Lubricentro",
  description:
    "Gestiona tu inventario de lubricantes y productos automotrices de manera eficiente con nuestra plataforma intuitiva.",
};

export default function InventoryLayout({
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