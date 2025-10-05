"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { usePOS } from "@/contexts/pos-context";

// Interfaz para las métricas
interface MetricData {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: any;
  color: string;
}

// Métricas por defecto
const defaultMetrics: MetricData[] = [
  {
    title: "Ventas Hoy",
    value: "$0.00",
    change: "0%",
    trend: "up",
    icon: DollarSign,
    color: "text-primary",
  },
  {
    title: "Productos Vendidos",
    value: "0",
    change: "0%",
    trend: "up",
    icon: Package,
    color: "text-primary",
  },
  {
    title: "Stock Bajo",
    value: "0",
    change: "0",
    trend: "down",
    icon: AlertTriangle,
    color: "text-destructive",
  },
  {
    title: "Clientes Nuevos",
    value: "0",
    change: "0%",
    trend: "up",
    icon: Users,
    color: "text-accent",
  },
];

export function DashboardMetrics() {
  const { sales, products, customers } = usePOS();

  const metrics = useMemo(() => {
    if (sales.length === 0 || products.length === 0 || customers.length === 0) {
      return defaultMetrics;
    }

    // Ventas de hoy
    const today = new Date().toISOString().split("T")[0];
    const todaySales = sales.filter((sale) => sale.date === today);
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

    // Ventas de ayer (para comparación)
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    const yesterdaySales = sales.filter((sale) => sale.date === yesterday);
    const yesterdayRevenue = yesterdaySales.reduce(
      (sum, sale) => sum + sale.total,
      0
    );

    // Productos vendidos hoy
    const productsSoldToday = todaySales.reduce(
      (sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    // Productos vendidos ayer
    const productsSoldYesterday = yesterdaySales.reduce(
      (sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    // Stock bajo
    const lowStockProducts = products.filter(
      (product) => product.stock <= product.minStock && product.stock > 0
    );

    // Clientes nuevos hoy
    const newCustomersToday = customers.filter((customer) => {
      const regDate = new Date(customer.registrationDate);
      const today = new Date();
      return regDate.toDateString() === today.toDateString();
    });

    // Clientes nuevos ayer
    const newCustomersYesterday = customers.filter((customer) => {
      const regDate = new Date(customer.registrationDate);
      const yesterday = new Date(Date.now() - 86400000);
      return regDate.toDateString() === yesterday.toDateString();
    });

    // Calcular cambios porcentuales
    const revenueChange =
      yesterdayRevenue > 0
        ? (
            ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) *
            100
          ).toFixed(1)
        : todayRevenue > 0
        ? "100"
        : "0";

    const productsChange =
      productsSoldYesterday > 0
        ? (
            ((productsSoldToday - productsSoldYesterday) /
              productsSoldYesterday) *
            100
          ).toFixed(1)
        : productsSoldToday > 0
        ? "100"
        : "0";

    const customersChange =
      newCustomersYesterday.length > 0
        ? (
            ((newCustomersToday.length - newCustomersYesterday.length) /
              newCustomersYesterday.length) *
            100
          ).toFixed(1)
        : newCustomersToday.length > 0
        ? "100"
        : "0";

    return [
      {
        title: "Ventas Hoy",
        value: `$${todayRevenue.toFixed(2)}`,
        change: `${
          todayRevenue > yesterdayRevenue ? "+" : ""
        }${revenueChange}%`,
        trend: todayRevenue >= yesterdayRevenue ? "up" : "down",
        icon: DollarSign,
        color: "text-primary",
      },
      {
        title: "Productos Vendidos",
        value: productsSoldToday,
        change: `${
          productsSoldToday > productsSoldYesterday ? "+" : ""
        }${productsChange}%`,
        trend: productsSoldToday >= productsSoldYesterday ? "up" : "down",
        icon: Package,
        color: "text-primary",
      },
      {
        title: "Stock Bajo",
        value: lowStockProducts.length,
        change: "+2",
        trend: "down",
        icon: AlertTriangle,
        color: "text-destructive",
      },
      {
        title: "Clientes Nuevos",
        value: newCustomersToday.length,
        change: `${
          newCustomersToday.length > newCustomersYesterday.length ? "+" : ""
        }${customersChange}%`,
        trend:
          newCustomersToday.length >= newCustomersYesterday.length
            ? "up"
            : "down",
        icon: Users,
        color: "text-accent",
      },
    ];
  }, [sales, products, customers]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon
                className={`h-4 w-4 sm:h-5 sm:w-5 ${metric.color}`}
              />
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-card-foreground mb-1 sm:mb-2">
                {metric.value}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                )}
                <Badge
                  variant={metric.trend === "up" ? "default" : "destructive"}
                  className="text-[10px] sm:text-xs px-1 sm:px-2 py-0 sm:py-0.5"
                >
                  {metric.change}
                </Badge>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  vs ayer
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
