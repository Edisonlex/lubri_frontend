// components/inventory/real-time-inventory.tsx (versión conectada)
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { api, type Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAlerts } from "@/contexts/alerts-context";

export function RealTimeInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0,
  });

  const { alerts, refreshAlerts } = useAlerts();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);

      // Calcular estadísticas
      setInventoryStats({
        totalProducts: data.length,
        lowStockCount: data.filter((p) => p.stock < p.minStock && p.stock > 0)
          .length,
        outOfStockCount: data.filter((p) => p.stock === 0).length,
        totalValue: data.reduce((sum, p) => sum + p.cost * p.stock, 0),
      });
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchProducts();
    await refreshAlerts();
  };

  useEffect(() => {
    fetchProducts();

    // Simular actualizaciones en tiempo real cada 30 segundos
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getLowStockProducts = () => {
    return products
      .filter((p) => p.stock < p.minStock && p.stock > 0)
      .sort((a, b) => a.stock / a.minStock - b.stock / b.minStock)
      .slice(0, 5);
  };

  const getOutOfStockProducts = () => {
    return products.filter((p) => p.stock === 0).slice(0, 5);
  };

  const getStockLevelColor = (
    stock: number,
    minStock: number,
    maxStock: number
  ) => {
    const ratio = stock / minStock;
    if (stock === 0) return "bg-red-500";
    if (ratio < 1) return "bg-amber-500";
    if (stock > maxStock) return "bg-blue-500";
    return "bg-emerald-500";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-medium">
            Inventario en Tiempo Real
          </CardTitle>
          <CardDescription>
            Última actualización: {new Date().toLocaleTimeString()}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-background rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Total Productos</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {inventoryStats.totalProducts}
                </p>
              </div>

              <div className="bg-background rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Stock Bajo</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {inventoryStats.lowStockCount}
                </p>
                {alerts.length > 0 && (
                  <Badge
                    variant="outline"
                    className="mt-1 bg-amber-50 text-amber-700"
                  >
                    {
                      alerts.filter(
                        (a) => a.urgency === "high" || a.urgency === "medium"
                      ).length
                    }{" "}
                    alertas activas
                  </Badge>
                )}
              </div>

              <div className="bg-background rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Sin Stock</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {inventoryStats.outOfStockCount}
                </p>
                {alerts.length > 0 && (
                  <Badge
                    variant="outline"
                    className="mt-1 bg-red-50 text-red-700"
                  >
                    {alerts.filter((a) => a.urgency === "critical").length}{" "}
                    alertas críticas
                  </Badge>
                )}
              </div>

              <div className="bg-background rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Valor Total</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  ${inventoryStats.totalValue.toFixed(2)}
                </p>
              </div>
            </div>

            <Tabs defaultValue="low-stock">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="low-stock">Stock Bajo</TabsTrigger>
                <TabsTrigger value="out-of-stock">Sin Stock</TabsTrigger>
              </TabsList>

              <TabsContent value="low-stock" className="mt-4">
                {getLowStockProducts().length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No hay productos con stock bajo
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getLowStockProducts().map((product) => (
                      <div key={product.id} className="flex flex-col space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {product.sku}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                          >
                            {product.stock} / {product.minStock}
                          </Badge>
                        </div>
                        <Progress
                          value={(product.stock / product.minStock) * 100}
                          className={getStockLevelColor(
                            product.stock,
                            product.minStock,
                            product.maxStock
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="out-of-stock" className="mt-4">
                {getOutOfStockProducts().length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No hay productos sin stock
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getOutOfStockProducts().map((product) => (
                      <div
                        key={product.id}
                        className="flex justify-between items-start p-3 border rounded-lg bg-red-50"
                      >
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {product.sku}
                            </span>
                          </div>
                        </div>
                        <Badge variant="destructive">Sin Stock</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
