"use client";

import { useState, useEffect } from "react";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { ProductsChart } from "@/components/dashboard/products-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { usePOS } from "@/contexts/pos-context";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { refreshSales, refreshProducts } = usePOS();

  // Función para recargar todos los datos
  const refreshDashboardData = async () => {
    try {
      await Promise.all([refreshSales(), refreshProducts()]);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await refreshDashboardData();

      // Simulate data loading
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    loadData();
  }, [refreshSales, refreshProducts]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Bienvenido, {user?.name || "Usuario"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refreshDashboardData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardMetrics />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
            <SalesChart />
            <ProductsChart />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            <div className="xl:col-span-2">
              <RecentSales />
            </div>
            <div className="space-y-6 md:space-y-8">
              <StockAlerts />
            </div>
          </div>

          
        </>
      )}
    </div>
  );
}
