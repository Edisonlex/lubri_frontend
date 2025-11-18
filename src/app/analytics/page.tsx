"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceOptimization } from "@/components/analytics/price-optimization";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/analytics/loading-state";
import { AnalyticsHeader } from "@/components/analytics/header";
import { SalesOverview } from "@/components/analytics/sales-overview";
import { ForecastTab } from "@/components/analytics/forecast-tab";
import { InventoryRotationTab } from "@/components/analytics/inventory-rotation-tab";
import { CompetitionAnalysisTab } from "@/components/analytics/competition-analysis-tab";
import { ReportsTab } from "@/components/analytics/reports-tab";
import { AnalyticsMap } from "@/components/gis/analytics-map";
import { GISProvider } from "@/contexts/gis-context";
import { ProtectedRoute } from "@/contexts/auth-context";

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

interface ForecastData {
  month: string;
  actual: number | null;
  forecast: number;
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6m");
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryColors = [
    "#16a34a",
    "#059669",
    "#10b981",
    "#34d399",
    "#6ee7b7",
  ];

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const [
        salesAnalytics,
        inventoryAnalytics,
        demandForecast,
        customersData,
      ] = await Promise.all([
        api.getSalesAnalytics(),
        api.getInventoryAnalytics(),
        api.getDemandForecast(),
        api.getCustomers(),
      ]);

      // Procesar datos (código existente)
      const processedSalesData = Object.entries(
        salesAnalytics.salesByMonth
      ).map(([month, ventas], index) => ({
        month,
        ventas: ventas as number,
        productos: Math.floor((ventas as number) / 40),
      }));

      const processedCategoryData = Object.entries(
        salesAnalytics.salesByCategory
      ).map(([name, value], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(
          ((value as number) / salesAnalytics.totalRevenue) * 100
        ),
        color: categoryColors[index % categoryColors.length],
      }));

      const currentMonth = new Date().getMonth();
      const months = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];

      const processedForecastData = months
        .slice(currentMonth, currentMonth + 4)
        .map((month, index) => ({
          month,
          actual:
            index === 0
              ? (salesAnalytics.salesByMonth[
                  month as keyof typeof salesAnalytics.salesByMonth
                ] as number)
              : null,
          forecast: Math.floor(
            (salesAnalytics.totalRevenue / 6) * (1 + index * 0.1)
          ),
        }));

      setSalesData(processedSalesData);
      setCategoryData(processedCategoryData);
      setForecastData(processedForecastData);
      setAnalyticsData(salesAnalytics);
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const activeCustomersCount = customers.filter(
    (customer) => customer.status === "active"
  ).length;

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ProtectedRoute permission="analytics.view">
    <div className="flex bg-background">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-6">
            <AnalyticsHeader
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />

            <Tabs defaultValue="sales" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 gap-2 p-1 bg-muted/50 rounded-lg">
                <TabsTrigger
                  value="sales"
                  className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <span className="hidden sm:inline">Análisis de Ventas</span>
                  <span className="sm:hidden">Ventas</span>
                </TabsTrigger>

                <TabsTrigger
                  value="forecast"
                  className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <span className="hidden sm:inline">Pronósticos</span>
                  <span className="sm:hidden">Pronós.</span>
                </TabsTrigger>

                <TabsTrigger
                  value="inventory"
                  className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <span className="hidden sm:inline">Rotación</span>
                  <span className="sm:hidden">Rot.</span>
                </TabsTrigger>

                <TabsTrigger
                  value="pricing"
                  className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <span className="hidden sm:inline">Precios</span>
                  <span className="sm:hidden">Precios</span>
                </TabsTrigger>

                <TabsTrigger
                  value="competition"
                  className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <span className="hidden sm:inline">Competencia</span>
                  <span className="sm:hidden">Comp.</span>
                </TabsTrigger>

                <TabsTrigger
                  value="reports"
                  className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <span className="hidden sm:inline">Reportes</span>
                  <span className="sm:hidden">Rep.</span>
                </TabsTrigger>

                <TabsTrigger
                  value="gis"
                  className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <span className="hidden sm:inline">Mapa Geográfico</span>
                  <span className="sm:hidden">GIS</span>
                </TabsTrigger>
              </TabsList>

              <div className="mb-8"></div>

              <TabsContent value="sales" className="space-y-4 sm:space-y-8">
                <SalesOverview
                  analyticsData={analyticsData}
                  salesData={salesData}
                  categoryData={categoryData}
                  activeCustomersCount={activeCustomersCount}
                />
              </TabsContent>

              <TabsContent
                value="forecast"
                className="space-y-3 sm:space-y-4 md:space-y-6"
              >
                <ForecastTab
                  salesData={salesData}
                  forecastData={forecastData}
                />
              </TabsContent>

              <TabsContent
                value="inventory"
                className="space-y-3 sm:space-y-4 md:space-y-6"
              >
                <InventoryRotationTab customers={customers} />
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <PriceOptimization />
              </TabsContent>

              <TabsContent value="competition" className="space-y-6">
                <CompetitionAnalysisTab customers={customers} />
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <ReportsTab customers={customers} />
              </TabsContent>

              <TabsContent value="gis" className="space-y-6">
                <GISProvider>
                  <AnalyticsMap />
                </GISProvider>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
