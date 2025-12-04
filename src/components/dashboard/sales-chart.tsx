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
import { usePOS } from "@/contexts/pos-context";
import { useMemo } from "react";

function getWeekdayShort(date: Date) {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return days[date.getDay()];
}

export function SalesChart() {
  const { sales } = usePOS();

  const salesData = useMemo(() => {
    const today = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today.getTime() - (6 - i) * dayMs);
      const label = getWeekdayShort(d);
      const dayTotal = sales
        .filter((s) => {
          const sd = new Date(s.date);
          return sd.toDateString() === d.toDateString();
        })
        .reduce((sum, s) => sum + s.total, 0);
      return { name: label, ventas: Number(dayTotal.toFixed(2)), meta: 1500 };
    });
    return days;
  }, [sales]);

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
