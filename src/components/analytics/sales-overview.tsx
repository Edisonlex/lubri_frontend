"use client";

import { motion } from "framer-motion";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign, Package, Users, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile"; // Ajusta la ruta según tu estructura

interface SalesData {
  month: string;
  ventas: number;
  productos: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface SalesOverviewProps {
  analyticsData: any;
  salesData: SalesData[];
  categoryData: CategoryData[];
  activeCustomersCount: number;
}

export function SalesOverview({
  analyticsData,
  salesData,
  categoryData,
  activeCustomersCount,
}: SalesOverviewProps) {
  const isMobile = useIsMobile();

  // Tamaños responsive basados en si es mobile
  const titleSize = isMobile ? "text-xs" : "text-sm";
  const valueSize = isMobile ? "text-lg" : "text-2xl";
  const descriptionSize = isMobile ? "text-xs" : "text-sm";
  const iconSize = isMobile ? "h-4 w-4" : "h-4 w-4";
  const cardPadding = isMobile ? "p-4" : "p-6";
  const cardHeaderPadding = isMobile ? "p-4 pb-2" : "p-6 pb-2";

  // Tamaños para gráficos
  const chartHeight = isMobile ? 200 : 250;

  return (
    <>
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader
              className={`flex flex-row items-center justify-between space-y-0 ${cardHeaderPadding}`}
            >
              <CardTitle className={`${titleSize} font-medium`}>
                Ventas Totales
              </CardTitle>
              <DollarSign className={`${iconSize} text-muted-foreground`} />
            </CardHeader>
            <CardContent className={`${cardPadding} pt-0`}>
              <div className={`${valueSize} font-bold`}>
                ${analyticsData?.totalRevenue?.toLocaleString() || "0"}
              </div>
              <p
                className={`${descriptionSize} text-muted-foreground flex items-center gap-1`}
              >
                <TrendingUp className="h-3 w-3 text-green-600" />
                +12.5% vs período anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader
              className={`flex flex-row items-center justify-between space-y-0 ${cardHeaderPadding}`}
            >
              <CardTitle className={`${titleSize} font-medium`}>
                Productos Vendidos
              </CardTitle>
              <Package className={`${iconSize} text-muted-foreground`} />
            </CardHeader>
            <CardContent className={`${cardPadding} pt-0`}>
              <div className={`${valueSize} font-bold`}>
                {analyticsData?.totalSales || "0"}
              </div>
              <p
                className={`${descriptionSize} text-muted-foreground flex items-center gap-1`}
              >
                <TrendingUp className="h-3 w-3 text-green-600" />
                +8.2% vs período anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader
              className={`flex flex-row items-center justify-between space-y-0 ${cardHeaderPadding}`}
            >
              <CardTitle className={`${titleSize} font-medium`}>
                Ticket Promedio
              </CardTitle>
              <DollarSign className={`${iconSize} text-muted-foreground`} />
            </CardHeader>
            <CardContent className={`${cardPadding} pt-0`}>
              <div className={`${valueSize} font-bold`}>
                ${analyticsData?.averageTicket?.toFixed(2) || "0.00"}
              </div>
              <p
                className={`${descriptionSize} text-muted-foreground flex items-center gap-1`}
              >
                <TrendingUp className="h-3 w-3 text-green-600" />
                +3.8% vs período anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader
              className={`flex flex-row items-center justify-between space-y-0 ${cardHeaderPadding}`}
            >
              <CardTitle className={`${titleSize} font-medium`}>
                Clientes Activos
              </CardTitle>
              <Users className={`${iconSize} text-muted-foreground`} />
            </CardHeader>
            <CardContent className={`${cardPadding} pt-0`}>
              <div className={`${valueSize} font-bold`}>
                {activeCustomersCount}
              </div>
              <p
                className={`${descriptionSize} text-muted-foreground flex items-center gap-1`}
              >
                <TrendingUp className="h-3 w-3 text-green-600" />+
                {Math.round((activeCustomersCount / 3 - 1) * 100)}% vs período
                anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 mt-4 md:mt-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader
              className={`pb-3 ${isMobile ? "px-4 pt-4" : "px-6 pt-6"}`}
            >
              <CardTitle className={isMobile ? "text-base" : "text-lg"}>
                Evolución de Ventas
              </CardTitle>
              <CardDescription className={descriptionSize}>
                Ventas mensuales en los últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-2 pb-3" : "px-6 pb-6"}>
              <div className={`h-48 ${isMobile ? "" : "sm:h-60 md:h-80"}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
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
                        fill: "hsl(222.2 84% 4.9%)",
                        fontSize: isMobile ? 10 : 12,
                        fontWeight: 500,
                      }}
                      axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                      tickLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                      className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                    />
                    <YAxis
                      tick={{
                        fill: "hsl(222.2 84% 4.9%)",
                        fontSize: isMobile ? 10 : 12,
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
                      formatter={(value) => [
                        `$${value.toLocaleString()}`,
                        "Ventas",
                      ]}
                    />
                    <Bar
                      dataKey="ventas"
                      fill="#16a34a"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader
              className={`pb-3 ${isMobile ? "px-4 pt-4" : "px-6 pt-6"}`}
            >
              <CardTitle className={isMobile ? "text-base" : "text-lg"}>
                Ventas por Categoría
              </CardTitle>
              <CardDescription className={descriptionSize}>
                Distribución de ventas por tipo de producto
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-2 pb-3" : "px-6 pb-6"}>
              <div className={`h-48 ${isMobile ? "" : "sm:h-60 md:h-80"}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 70 : 80}
                      innerRadius={isMobile ? 30 : 40}
                      dataKey="value"
                      label={({ name, value }) =>
                        isMobile ? `${value}%` : `${name}: ${value}%`
                      }
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
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
                      formatter={(value, name) => [`${value}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
