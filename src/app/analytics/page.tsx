"use client";

import { useState, useEffect, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceOptimization } from "@/components/analytics/price-optimization";
import { api } from "@/lib/api";
import { reportsService } from "@/lib/reports-service";
import { LoadingState } from "@/components/analytics/loading-state";
import { AnalyticsHeader } from "@/components/analytics/header";
import { SalesOverview } from "@/components/analytics/sales-overview";
import { ForecastTab } from "@/components/analytics/forecast-tab";
import { InventoryRotationTab } from "@/components/analytics/inventory-rotation-tab";
import { ReportsTab } from "@/components/analytics/reports-tab";
import { AnalyticsMap } from "@/components/gis/analytics-map";
import { UniversalMap } from "@/components/gis/universal-map";
import { GISProvider } from "@/contexts/gis-context";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useScrollIndicator } from "@/hooks/use-scroll-indicator";

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

const VALID_TABS = new Set([
  "sales",
  "forecast",
  "inventory",
  "pricing",
  "reports",
  "gis",
]);

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6m");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
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
        salesList,
        productsList,
      ] = await Promise.all([
        reportsService.getSalesAnalytics(),
        reportsService.getInventoryAnalytics(),
        reportsService.getDemandForecast(), // Ahora usa el servicio con fallback
        reportsService.getCustomers(), // Ahora usa el servicio con fallback
        api.getSales(),
        api.getProducts(),
      ]);

      // Construir serie mensual dinámica desde ventas reales
      const monthNames = [
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

      const now = new Date();
      
      // Filtrar ventas según período seleccionado o rango personalizado
      const filteredSales = salesList.filter(sale => {
        const saleDate = new Date(sale.date);
        
        if (dateRange && dateRange.from && dateRange.to) {
          const from = new Date(dateRange.from);
          from.setHours(0,0,0,0);
          const to = new Date(dateRange.to);
          to.setHours(23,59,59,999);
          return saleDate >= from && saleDate <= to;
        }

        // Si no hay rango personalizado, usar selectedPeriod
        const limitDate = new Date();
        switch (selectedPeriod) {
          case "1m":
            limitDate.setMonth(now.getMonth() - 1);
            break;
          case "3m":
            limitDate.setMonth(now.getMonth() - 3);
            break;
          case "6m":
            limitDate.setMonth(now.getMonth() - 6);
            break;
          case "1y":
            limitDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            limitDate.setMonth(now.getMonth() - 6);
        }
        return saleDate >= limitDate;
      });

      // Determinar meses a mostrar en el gráfico
      let monthsToShow = 6;
      if (dateRange && dateRange.from && dateRange.to) {
        // Calcular diferencia en meses
        monthsToShow = (dateRange.to.getFullYear() - dateRange.from.getFullYear()) * 12 + (dateRange.to.getMonth() - dateRange.from.getMonth()) + 1;
        monthsToShow = Math.max(1, Math.min(monthsToShow, 12)); // Mínimo 1, máximo 12 para gráfico
      } else {
        switch (selectedPeriod) {
          case "1m": monthsToShow = 1; break;
          case "3m": monthsToShow = 3; break;
          case "6m": monthsToShow = 6; break;
          case "1y": monthsToShow = 12; break;
        }
      }

      const lastMonths = Array.from({ length: monthsToShow }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1 - i), 1);
        return { key: `${d.getFullYear()}-${d.getMonth() + 1}`, label: monthNames[d.getMonth()] };
      });

      const monthlyTotals: Record<string, { ventas: number; productos: number }> = {};
      for (const m of lastMonths) monthlyTotals[m.key] = { ventas: 0, productos: 0 };

      filteredSales.forEach((sale) => {
        const d = new Date(sale.date);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        if (monthlyTotals[key]) {
          monthlyTotals[key].ventas += sale.total;
          monthlyTotals[key].productos += sale.items.reduce((acc: number, it: any) => acc + (it.quantity || 0), 0);
        }
      });

      const processedSalesData = lastMonths.map(({ key, label }) => ({
        month: label,
        ventas: monthlyTotals[key]?.ventas || 0,
        productos: monthlyTotals[key]?.productos || 0,
      }));

      // Construir distribución por categoría en tiempo real (basado en ventas filtradas)
      const productCategoryMap = new Map<string, string>();
      productsList.forEach((p: any) => productCategoryMap.set(p.id, p.category || "Otros"));

      const categoryTotals: Record<string, number> = {};
      let totalRevenue = 0;
      filteredSales.forEach((sale) => {
        totalRevenue += sale.total;
        sale.items.forEach((it: any) => {
          const cat = productCategoryMap.get(it.productId) || "Otros";
          categoryTotals[cat] = (categoryTotals[cat] || 0) + ((it.subtotal ?? (it.quantity * (it.unitPrice ?? 0))) || 0);
        });
      });

      const processedCategoryData = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value], index) => ({
          name,
          value: totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0,
          color: categoryColors[index % categoryColors.length],
        }));

      // Pronóstico simple basado en tendencia de los últimos meses (usando datos filtrados o históricos completos si es muy corto)
      const recent = processedSalesData.slice(-4);
      const processedForecastData = recent.map((r, idx) => ({
        month: r.month,
        actual: idx === 0 ? r.ventas : null,
        forecast: Math.floor((r.ventas || 0) * (1 + (idx + 1) * 0.08)),
      }));

      setSalesData(processedSalesData);
      setCategoryData(processedCategoryData);
      setForecastData(processedForecastData);
      setAnalyticsData({
        totalSales: filteredSales.length,
        totalRevenue: filteredSales.reduce((sum: number, s: any) => sum + (s.total || 0), 0),
        averageTicket:
          filteredSales.length > 0
            ? filteredSales.reduce((sum: number, s: any) => sum + (s.total || 0), 0) / filteredSales.length
            : 0,
        paymentMethods: salesAnalytics.paymentMethods,
      });
      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
    const interval = setInterval(loadAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  // active tab handled in child wrapper with Suspense

  const activeCustomersCount = customers.filter(
    (customer) => customer.status === "active"
  ).length;

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <div className="flex bg-background">
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
            <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-6">
              <AnalyticsHeader
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                onDateRangeChange={setDateRange}
              />

              <Suspense fallback={<LoadingState />}>
                <AnalyticsTabsWrapper
                  selectedPeriod={selectedPeriod}
                  setSelectedPeriod={setSelectedPeriod}
                  dateRange={dateRange}
                  salesData={salesData}
                  categoryData={categoryData}
                  forecastData={forecastData}
                  analyticsData={analyticsData}
                  customers={customers}
                  activeCustomersCount={activeCustomersCount}
                />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </Suspense>
  );
}

function AnalyticsTabsWrapper({
  selectedPeriod,
  setSelectedPeriod,
  dateRange,
  salesData,
  categoryData,
  forecastData,
  analyticsData,
  customers,
  activeCustomersCount,
}: any) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("sales");
  const { scrollRef, canScroll, isScrolledLeft, scrollToActiveTab } = useScrollIndicator();

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab && VALID_TABS.has(tab)) {
      setTimeout(() => setActiveTab(tab), 0);
    }
  }, [searchParams]);

  useEffect(() => {
    scrollToActiveTab(activeTab);
  }, [activeTab, scrollToActiveTab]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
        const params = new URLSearchParams(searchParams?.toString());
        params.set("tab", value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }}
      className="space-y-4 sm:space-y-6"
    >
      <TabsList 
        ref={scrollRef}
        className={`w-full p-1 bg-muted/50 rounded-lg overflow-x-auto flex gap-1 sm:gap-2 min-w-max ${canScroll ? 'can-scroll' : ''} ${isScrolledLeft ? 'scrolled-left' : ''}`}
      >
        <TabsTrigger
          value="sales"
          className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-none min-w-[80px] sm:min-w-[120px]"
        >
          <span className="hidden sm:inline">Análisis de Ventas</span>
          <span className="sm:hidden">Ventas</span>
        </TabsTrigger>

        <TabsTrigger
          value="forecast"
          className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-none min-w-[80px] sm:min-w-[120px]"
        >
          <span className="hidden sm:inline">Pronósticos</span>
          <span className="sm:hidden">Pronós.</span>
        </TabsTrigger>

        <TabsTrigger
          value="inventory"
          className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-none min-w-[80px] sm:min-w-[120px]"
        >
          <span className="hidden sm:inline">Rotación</span>
          <span className="sm:hidden">Rot.</span>
        </TabsTrigger>

        <TabsTrigger
          value="pricing"
          className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-none min-w-[80px] sm:min-w-[120px]"
        >
          <span className="hidden sm:inline">Precios</span>
          <span className="sm:hidden">Precios</span>
        </TabsTrigger>

        

        <TabsTrigger
          value="reports"
          className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-none min-w-[80px] sm:min-w-[120px]"
        >
          <span className="hidden sm:inline">Reportes</span>
          <span className="sm:hidden">Rep.</span>
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
        <ForecastTab salesData={salesData} forecastData={forecastData} />
      </TabsContent>

      <TabsContent
        value="inventory"
        className="space-y-3 sm:space-y-4 md:space-y-6"
      >
        <InventoryRotationTab customers={customers} selectedPeriod={selectedPeriod} dateRange={dateRange} />
      </TabsContent>

      <TabsContent value="pricing" className="space-y-6">
        <PriceOptimization />
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <ReportsTab customers={customers} dateRange={dateRange} />
      </TabsContent>
    </Tabs>
  );
}
