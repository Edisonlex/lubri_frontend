// components/inventory/analytics-modal.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BarChart2,
  PieChart,
  TrendingUp,
  Package,
  RefreshCw,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import type { Product, Sale } from "@/lib/api";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface AnalyticsModalProps {
  products: Product[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AnalyticsModal({
  products,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: AnalyticsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [obsoleteMetrics, setObsoleteMetrics] = useState<{
    count: number;
    avgDays: number;
    impact: number;
  } | null>(null);
  const [productClassification, setProductClassification] = useState<any>(null);
  const [obsoleteProducts, setObsoleteProducts] = useState<
    Array<{ id: string; name: string; daysSinceLastSale: number; stock: number }>
  >([]);

  // Cargar datos de análisis cuando se abre el modal
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (externalOpen) {
        setIsLoading(true);
        try {
          // Cargar datos de análisis del inventario
          const inventoryAnalytics = await api.getInventoryAnalytics();
          const salesAnalytics = await api.getSalesAnalytics();
          const metrics = await api.getObsolescenceMetrics();
          const classification = await api.getProductClassification();
          const sales: Sale[] = await api.getSales();

          setAnalyticsData(inventoryAnalytics);
          setSalesData(salesAnalytics);
          setObsoleteMetrics(metrics);
          setProductClassification(classification);

          const lastSaleByProduct: Record<string, number | null> = {};
          products.forEach((p) => (lastSaleByProduct[p.id] = null));
          sales.forEach((s) => {
            s.items.forEach((item) => {
              const dt = new Date(s.date).getTime();
              const prev = lastSaleByProduct[item.productId];
              if (!prev || dt > prev) lastSaleByProduct[item.productId] = dt;
            });
          });
          const now = Date.now();
          const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
          const computedObsolete = products
            .map((p) => {
              const last = lastSaleByProduct[p.id];
              const days = last
                ? Math.floor((now - last) / (1000 * 60 * 60 * 24))
                : 9999;
              return {
                id: p.id,
                name: p.name,
                daysSinceLastSale: days,
                stock: p.stock,
              };
            })
            .filter((o) => o.daysSinceLastSale * 24 * 60 * 60 * 1000 >= sixMonthsMs);
          setObsoleteProducts(
            computedObsolete
              .sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale)
              .slice(0, 10)
          );
        } catch (error) {
          console.error("Error loading analytics data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAnalyticsData();
  }, [externalOpen]);

  // Usar datos de la API si están disponibles, de lo contrario usar datos locales
  const stats = {
    totalProducts: analyticsData?.totalProducts || products.length,
    activeProducts: products.filter((p) => p.status === "active").length,
    lowStock:
      analyticsData?.lowStockCount ||
      products.filter((p) => p.stock <= p.minStock && p.stock > 0).length,
    outOfStock:
      analyticsData?.outOfStockCount ||
      products.filter((p) => p.stock === 0).length,
    totalValue:
      analyticsData?.totalValue ||
      products.reduce((sum, p) => sum + p.stock * p.cost, 0),
    categories: [...new Set(products.map((p) => p.category))].length,
    brands: [...new Set(products.map((p) => p.brand))].length,
  };

  // Calcular distribución de categorías desde datos reales
  const categoryDistribution =
    analyticsData?.categoryDistribution ||
    Object.entries(
      products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

  // Productos con stock bajo (usando datos reales)
  const lowStockProducts =
    analyticsData?.lowStockProducts?.slice(0, 5)?.map((item: any) => ({
      name: item.name,
      stock: item.value,
    })) ||
    products
      .filter((p) => p.stock <= p.minStock && p.stock > 0)
      .slice(0, 5)
      .map((product) => ({
        name: product.name,
        stock: product.stock,
        minStock: product.minStock,
      }));

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const inventoryAnalytics = await api.getInventoryAnalytics();
      const salesAnalytics = await api.getSalesAnalytics();
      const metrics = await api.getObsolescenceMetrics();
      const classification = await api.getProductClassification();
      const sales: Sale[] = await api.getSales();

      setAnalyticsData(inventoryAnalytics);
      setSalesData(salesAnalytics);
      setObsoleteMetrics(metrics);
      setProductClassification(classification);

      const lastSaleByProduct: Record<string, number | null> = {};
      products.forEach((p) => (lastSaleByProduct[p.id] = null));
      sales.forEach((s) => {
        s.items.forEach((item) => {
          const dt = new Date(s.date).getTime();
          const prev = lastSaleByProduct[item.productId];
          if (!prev || dt > prev) lastSaleByProduct[item.productId] = dt;
        });
      });
      const now = Date.now();
      const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
      const computedObsolete = products
        .map((p) => {
          const last = lastSaleByProduct[p.id];
          const days = last
            ? Math.floor((now - last) / (1000 * 60 * 60 * 24))
            : 9999;
          return {
            id: p.id,
            name: p.name,
            daysSinceLastSale: days,
            stock: p.stock,
          };
        })
        .filter((o) => o.daysSinceLastSale * 24 * 60 * 60 * 1000 >= sixMonthsMs);
      setObsoleteProducts(
        computedObsolete
          .sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale)
          .slice(0, 10)
      );
    } catch (error) {
      console.error("Error refreshing analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={externalOpen} onOpenChange={externalOnOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
        >
          <BarChart2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Análisis
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle>Análisis de Inventario</DialogTitle>
              <DialogDescription>
                Resumen y estadísticas de tu inventario actual
                {analyticsData && " • Datos en tiempo real"}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border dark:border-blue-900/30">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium dark:text-blue-100">
                  Total Productos
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 dark:text-white">
                {stats.totalProducts}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border dark:border-green-900/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium dark:text-green-100">
                  Activos
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 dark:text-white">
                {stats.activeProducts}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border dark:border-yellow-900/30">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium dark:text-yellow-100">
                  Stock Bajo
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 dark:text-white">
                {stats.lowStock}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border dark:border-red-900/30">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium dark:text-red-100">
                  Sin Stock
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 dark:text-white">
                {stats.outOfStock}
              </p>
            </div>
          </div>

          {/* Valor total del inventario */}
          <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border dark:border-purple-900/30">
            <h3 className="font-semibold mb-2 dark:text-purple-100">
              Valor Total del Inventario
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              $
              {stats.totalValue.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-sm text-muted-foreground mt-1 dark:text-purple-200">
              Basado en el costo de los productos en stock
              {salesData &&
                ` • Ventas totales: $${
                  salesData.totalRevenue?.toLocaleString("es-MX") || "0"
                }`}
            </p>
          </div>

          {/* Distribución por categoría */}
          <div>
            <h3 className="font-semibold mb-3 dark:text-white">
              Distribución por Categoría
            </h3>
            <div className="space-y-2">
              {categoryDistribution
                .sort((a: any, b: any) => b.value - a.value)
                .map((item: any) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm dark:text-gray-300">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full"
                          style={{
                            width: `${
                              (item.value / stats.totalProducts) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right dark:text-white">
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Productos con stock bajo */}
          {stats.lowStock > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border dark:border-orange-900/30">
              <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                Productos con Stock Bajo
              </h3>
              <ul className="text-sm space-y-1">
                {lowStockProducts.map((product: any, index: number) => (
                  <li
                    key={index}
                    className="flex justify-between dark:text-orange-200"
                  >
                    <span>{product.name}</span>
                    <span className="font-medium">
                      Stock: {product.stock}
                      {product.minStock && ` (Mín: ${product.minStock})`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Información adicional de ventas si está disponible */}
          {salesData && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border dark:border-blue-900/30">
              <h3 className="font-semibold mb-2 dark:text-blue-100">
                Resumen de Ventas
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground dark:text-blue-200">
                    Ventas totales:
                  </span>
                  <p className="font-semibold dark:text-white">
                    {salesData.totalSales}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-blue-200">
                    Ticket promedio:
                  </span>
                  <p className="font-semibold dark:text-white">
                    $
                    {salesData.averageTicket?.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || "0.00"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {obsoleteMetrics && (
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border dark:border-red-900/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-800 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" /> Productos Obsoletos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground dark:text-red-200">
                    Cantidad detectada
                  </span>
                  <p className="font-semibold dark:text-white">
                    {obsoleteMetrics.count}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-red-200">
                    Días promedio sin venta
                  </span>
                  <p className="font-semibold dark:text-white">
                    {obsoleteMetrics.avgDays}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-red-200">
                    Impacto en valor
                  </span>
                  <p className="font-semibold dark:text-white">
                    ${obsoleteMetrics.impact.toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
              {obsoleteProducts.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground dark:text-red-200 mb-1">
                    Criterio: sin ventas en los últimos 6 meses
                  </p>
                  <ul className="text-sm space-y-1">
                    {obsoleteProducts.map((p) => (
                      <li key={p.id} className="flex justify-between">
                        <span className="dark:text-red-100">{p.name}</span>
                        <span className="font-medium dark:text-white">
                          {p.daysSinceLastSale} días • Stock: {p.stock}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {productClassification && (
            <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border dark:border-purple-900/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-purple-800 dark:text-purple-300">
                <Gauge className="h-4 w-4" /> Clasificación Automática
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground dark:text-purple-200">
                    Alta rotación
                  </span>
                  <p className="font-semibold dark:text-white">
                    {productClassification.highRotation.length}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-purple-200">
                    Rotación media
                  </span>
                  <p className="font-semibold dark:text-white">
                    {productClassification.mediumRotation.length}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-purple-200">
                    Baja rotación
                  </span>
                  <p className="font-semibold dark:text-white">
                    {productClassification.lowRotation.length}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-muted-foreground dark:text-purple-200">
                    Alto margen
                  </span>
                  <p className="font-semibold dark:text-white">
                    {productClassification.highProfitMargin.length}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-purple-200">
                    Margen medio
                  </span>
                  <p className="font-semibold dark:text-white">
                    {productClassification.mediumProfitMargin.length}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground dark:text-purple-200">
                    Margen bajo
                  </span>
                  <p className="font-semibold dark:text-white">
                    {productClassification.lowProfitMargin.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Indicador de carga */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Cargando datos actualizados...
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
