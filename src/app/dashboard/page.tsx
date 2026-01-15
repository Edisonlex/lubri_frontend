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
import { RefreshCw, AlertTriangle, Brain } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { refreshSales, refreshProducts } = usePOS();
  const router = useRouter();

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
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-3 sm:px-6 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Bienvenido, {user?.name || "Usuario"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            
            <Button
              variant="outline"
              onClick={() => router.push("/obsolescence")}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Obsolescencia
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/classification")}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Clasificación
            </Button>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardMetrics />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <SalesChart />
            <ProductsChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
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
