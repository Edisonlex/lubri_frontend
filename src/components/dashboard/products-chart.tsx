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
import { useMemo } from "react";
import { usePOS } from "@/contexts/pos-context";

export function ProductsChart() {
  const { sales, products } = usePOS();

  const productsData = useMemo(() => {
    const idToCategory = new Map(products.map((p) => [p.id, p.category]));
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    const agg: Record<string, { vendidos: number; ingresos: number }> = {};
    for (const sale of sales) {
      const saleDate = new Date(sale.date);
      if (saleDate < weekAgo) continue;
      for (const item of sale.items) {
        const category = idToCategory.get(item.productId) || "otros";
        if (!agg[category]) agg[category] = { vendidos: 0, ingresos: 0 };
        agg[category].vendidos += item.quantity;
        agg[category].ingresos += item.subtotal;
      }
    }
    const rows = Object.entries(agg)
      .map(([categoria, v]) => ({ categoria, vendidos: v.vendidos, ingresos: Number(v.ingresos.toFixed(2)) }))
      .sort((a, b) => b.vendidos - a.vendidos)
      .slice(0, 8);
    return rows.length > 0
      ? rows
      : [{ categoria: "Sin datos", vendidos: 0, ingresos: 0 }];
  }, [sales, products]);

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
          <div className="h-64 sm:h-72 md:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productsData}
                margin={{ bottom: 40, left: 0, right: 5, top: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="categoria"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{
                    fill: "hsl(222.2 84% 4.9%)", // Texto oscuro para modo claro
                    fontSize: 9,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  tickLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                  interval={0}
                />
                <YAxis
                  tick={{
                    fill: "hsl(222.2 84% 4.9%)", // Texto oscuro para modo claro
                    fontSize: 9,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  tickLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                  tickFormatter={(value) => `${value}`}
                  domain={[0, (dataMax: number) => Math.max(2, Math.ceil(dataMax * 1.2))]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "11px",
                    padding: "6px",
                    color: "hsl(var(--foreground))",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                    fontSize: "11px",
                    fontWeight: "500",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: "bold",
                    marginBottom: "2px",
                  }}
                  cursor={{
                    fill: "hsl(var(--muted))",
                    fillOpacity: 0.3,
                  }}
                  formatter={(value, name) => [
                    `${value} unidades`, 
                    name === 'vendidos' ? 'Vendidos' : name
                  ]}
                />
                <Bar dataKey="vendidos" fill="#16a34a" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
