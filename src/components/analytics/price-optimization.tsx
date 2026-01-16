"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  RefreshCw,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { exportPriceOptimizationToPDF } from "@/lib/export-utils";
import { toast } from "sonner";

interface PriceRecommendation {
  productId: string;
  currentPrice: number;
  recommendedPrice: number;
  potentialRevenue: number;
}

interface PriceOptimizationData {
  recommendations: PriceRecommendation[];
}

export function PriceOptimization() {
  const [data, setData] = useState<PriceOptimizationData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [originalPrices, setOriginalPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [priceData, productsData] = await Promise.all([
        api.getPriceOptimization(),
        api.getProducts(),
      ]);
      setData(priceData);
      setProducts(productsData);
      
      // Guardar precios originales al cargar si no existen
      const prices: Record<string, number> = {};
      productsData.forEach((p: any) => {
        prices[p.id] = p.price;
      });
      // Solo actualizar si es la carga inicial para no perder referencias
      setOriginalPrices(prev => Object.keys(prev).length === 0 ? prices : prev);

    } catch (error) {
      console.error("Error loading price optimization data:", error);
      toast.error("Error al cargar recomendaciones de precios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || `Producto ${productId}`;
  };

  const getPriceChangePercentage = (current: number, recommended: number) => {
    return (((recommended - current) / current) * 100).toFixed(1);
  };

  const getTotalPotentialRevenue = () => {
    if (!data) return 0;
    return data.recommendations.reduce(
      (total, rec) => total + rec.potentialRevenue,
      0
    );
  };

  const handleExport = () => {
    if (!data) return;
    const headers = [
      "Producto",
      "Precio Actual",
      "Recomendado",
      "Cambio %",
      "Potencial ($/mes)",
    ];
    const rows = data.recommendations.map((rec) => {
      const change = (((rec.recommendedPrice - rec.currentPrice) / rec.currentPrice) * 100).toFixed(1);
      return [
        getProductName(rec.productId),
        `$${rec.currentPrice.toFixed(2)}`,
        `$${rec.recommendedPrice.toFixed(2)}`,
        `${change}%`,
        `$${rec.potentialRevenue.toFixed(2)}`,
      ];
    });
    exportPriceOptimizationToPDF({ headers, data: rows, fileName: "Recomendaciones_Precios" });
  };

  const handleApplyRecommendations = async () => {
    if (!data) return;
    try {
      setIsApplying(true);
      await Promise.all(
        data.recommendations.map((rec) =>
          api.updateProduct(rec.productId, { price: rec.recommendedPrice })
        )
      );
      toast.success("Recomendaciones aplicadas: precios actualizados");
      await loadData();
    } catch (error) {
      console.error("Error aplicando recomendaciones:", error);
      toast.error("No se pudieron aplicar las recomendaciones");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRevertChanges = async () => {
    if (!data || Object.keys(originalPrices).length === 0) return;
    
    try {
      setIsReverting(true);
      // Revertir solo los productos que están en las recomendaciones
      const revertPromises = data.recommendations
        .filter(rec => originalPrices[rec.productId] !== undefined)
        .map(rec => 
          api.updateProduct(rec.productId, { price: originalPrices[rec.productId] })
        );
      
      if (revertPromises.length === 0) {
        toast.info("No hay cambios para revertir");
        return;
      }

      await Promise.all(revertPromises);
      toast.success("Cambios revertidos: precios restaurados");
      await loadData();
    } catch (error) {
      console.error("Error revertiendo cambios:", error);
      toast.error("No se pudieron revertir los cambios");
    } finally {
      setIsReverting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Optimización de Precios
          </CardTitle>
          <CardDescription>
            Recomendaciones dinámicas de precios basadas en demanda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Optimización de Precios
              </CardTitle>
              <CardDescription>
                Recomendaciones dinámicas de precios basadas en demanda
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data && (
            <>
              {/* Summary Card */}
              <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Potencial de Ingresos Adicionales
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Implementando las recomendaciones de precios
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${getTotalPotentialRevenue().toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      por mes estimado
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground uppercase tracking-wide text-sm">
                  Recomendaciones por Producto
                </h4>

                {data.recommendations.map((recommendation, index) => {
                  const priceChange = parseFloat(
                    getPriceChangePercentage(
                      recommendation.currentPrice,
                      recommendation.recommendedPrice
                    )
                  );
                  const isIncrease = priceChange > 0;

                  return (
                    <motion.div
                      key={recommendation.productId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium">
                            {getProductName(recommendation.productId)}
                          </h5>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Precio actual:{" "}
                              </span>
                              <span className="font-medium">
                                ${recommendation.currentPrice.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Recomendado:{" "}
                              </span>
                              <span className="font-medium text-primary">
                                ${recommendation.recommendedPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              {isIncrease ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <Badge
                                variant={isIncrease ? "default" : "secondary"}
                                className={
                                  isIncrease
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {isIncrease ? "+" : ""}
                                {priceChange}%
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Cambio
                            </p>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-primary" />
                              <span className="font-bold text-primary">
                                ${recommendation.potentialRevenue}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Potencial/mes
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar showing price adjustment */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Ajuste de precio</span>
                          <span>
                            {Math.abs(priceChange)}%{" "}
                            {isIncrease ? "incremento" : "reducción"}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(Math.abs(priceChange), 100)}
                          className="h-2"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-2 justify-end">
                <Button variant="outline" onClick={handleExport}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar Reporte
                </Button>
                {Object.keys(originalPrices).length > 0 && (
                  <Button 
                    variant="secondary" 
                    onClick={handleRevertChanges} 
                    disabled={isReverting || isApplying}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isReverting ? "animate-spin" : ""}`} />
                    {isReverting ? "Revirtiendo..." : "Revertir Cambios"}
                  </Button>
                )}
                <Button onClick={handleApplyRecommendations} disabled={isApplying || isReverting}>
                  <Target className="h-4 w-4 mr-2" />
                  {isApplying ? "Aplicando..." : "Aplicar Recomendaciones"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
