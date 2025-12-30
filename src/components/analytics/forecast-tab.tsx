"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface ForecastData {
  month: string;
  actual: number | null;
  forecast: number;
}

interface SalesData {
  month: string;
  ventas: number;
  productos: number;
}

interface ForecastTabProps {
  salesData: SalesData[];
  forecastData: ForecastData[];
}

export function ForecastTab({ salesData, forecastData }: ForecastTabProps) {
  const isMobile = useIsMobile();

  // Transformar los datos para el gráfico
  const chartData = [
    ...salesData.map((item) => ({
      month: item.month,
      actual: item.ventas,
      forecast: null,
    })),
    ...forecastData,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className={`pb-3 ${isMobile ? "px-4 pt-4" : "px-6 pt-6"}`}>
          <CardTitle className={isMobile ? "text-base" : "text-lg"}>
            Pronóstico de Demanda
          </CardTitle>
          <CardDescription className={isMobile ? "text-xs" : "text-sm"}>
            Predicción de ventas basada en tendencias históricas
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "px-2 pb-3" : "px-6 pb-6"}>
          <div className={`h-48 ${isMobile ? "" : "sm:h-60 md:h-80"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ bottom: 30, left: 0, right: 5, top: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="month"
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 50 : 40}
                  tick={{
                    fill: "var(--foreground)",
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={{ stroke: "var(--border)" }}
                  className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                />
                <YAxis
                  tick={{
                    fill: "var(--foreground)",
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 500,
                  }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={{ stroke: "var(--border)" }}
                  className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    padding: "8px",
                    color: "var(--foreground)",
                  }}
                  itemStyle={{
                    color: "var(--foreground)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  labelStyle={{
                    color: "var(--foreground)",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                  cursor={{
                    fill: "hsl(var(--muted))",
                    fillOpacity: 0.3,
                  }}
                  formatter={(value) => [
                    `$${value?.toLocaleString() || "0"}`,
                    "",
                  ]}
                />
                <Legend
                  iconSize={isMobile ? 10 : 12}
                  wrapperStyle={{
                    fontSize: isMobile ? "10px" : "12px",
                    paddingTop: "10px",
                  }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  name="Ventas Reales"
                  dot={{ fill: "var(--chart-1)", strokeWidth: 2, r: isMobile ? 3 : 4 }}
                  activeDot={{ r: isMobile ? 5 : 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Pronóstico"
                  dot={{ fill: "var(--chart-2)", strokeWidth: 2, r: isMobile ? 3 : 4 }}
                  activeDot={{ r: isMobile ? 5 : 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
