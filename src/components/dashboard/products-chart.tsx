"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const productsData = [
  { categoria: "Aceites Motor", vendidos: 45, ingresos: 1350 },
  { categoria: "Filtros", vendidos: 32, ingresos: 960 },
  { categoria: "Lubricantes", vendidos: 28, ingresos: 840 },
  { categoria: "Aditivos", vendidos: 22, ingresos: 660 },
];

export function ProductsChart() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3 sm:pb-5 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">
            Productos Más Vendidos
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Ventas por categoría en los últimos 7 días
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
          <div className="h-48 sm:h-60 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productsData}
                margin={{ bottom: 30, left: 0, right: 5, top: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="categoria"
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  tick={{
                    fill: "hsl(222.2 84% 4.9%)", // Texto oscuro para modo claro
                    fontSize: 10,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  tickLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                />
                <YAxis
                  tick={{
                    fill: "hsl(222.2 84% 4.9%)", // Texto oscuro para modo claro
                    fontSize: 10,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  tickLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                    padding: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                  cursor={{
                    fill: "hsl(var(--muted))",
                    fillOpacity: 0.3,
                  }}
                />
                <Bar dataKey="vendidos" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
