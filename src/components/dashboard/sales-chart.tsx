"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const salesData = [
  { name: "Lun", ventas: 1200, meta: 1500 },
  { name: "Mar", ventas: 1800, meta: 1500 },
  { name: "Mié", ventas: 1600, meta: 1500 },
  { name: "Jue", ventas: 2200, meta: 1500 },
  { name: "Vie", ventas: 2800, meta: 1500 },
  { name: "Sáb", ventas: 3200, meta: 1500 },
  { name: "Dom", ventas: 2450, meta: 1500 },
];

export function SalesChart() {

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Ventas</CardTitle>
          <CardDescription>
            Ventas de los últimos 7 días vs meta diaria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fill: "hsl(222.2 84% 4.9%)", // Texto oscuro para modo claro
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  tickLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                  className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                />
                <YAxis
                  tick={{
                    fill: "hsl(222.2 84% 4.9%)", // Texto oscuro para modo claro
                    fontSize: 12,
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
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                  cursor={{
                    stroke: "hsl(var(--muted-foreground))",
                    strokeWidth: 1,
                    strokeDasharray: "5 5",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#059669" }}
                />
                <Line
                  type="monotone"
                  dataKey="meta"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
