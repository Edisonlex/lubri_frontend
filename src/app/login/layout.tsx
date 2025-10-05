

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LubriSmart - Login ",
  description:
    "Sistema integral para la gestión de lubricadoras con POS, inventario, CRM y análisis",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}