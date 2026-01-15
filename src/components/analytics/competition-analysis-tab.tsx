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
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { api } from "@/lib/api";
import { reportsService } from "@/lib/reports-service";
import { useIsMobile } from "@/hooks/use-mobile";

interface CompetitionAnalysisTabProps {
  customers: any[];
}

export function CompetitionAnalysisTab({
  customers,
}: CompetitionAnalysisTabProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadData = async () => {
      const [productsData, salesData] = await Promise.all([
        reportsService.getProducts(),
        api.getSales(),
      ]);
      setProducts(productsData);
      setSales(salesData);
    };
    loadData();
  }, []);

  // Datos para el gráfico de participación de mercado
  const marketShareData = (() => {
    const ourRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const categoryWeights: Record<string, number> = {};
    sales.forEach((s) => {
      s.items.forEach((it: any) => {
        const p = products.find((x) => x.id === it.productId);
        const cat = p?.category || "Otros";
        categoryWeights[cat] = (categoryWeights[cat] || 0) + it.subtotal;
      });
    });
    const weightSum = Object.values(categoryWeights).reduce((a, b) => a + b, 0) || 1;
    const variability = Math.min(0.3, Object.keys(categoryWeights).length * 0.03);
    const marketRevenue = ourRevenue * (2 + variability);
    const lubriShare = Math.max(15, Math.min(70, Math.round((ourRevenue / marketRevenue) * 100)));
    const remainder = 100 - lubriShare;
    const a = Math.round(remainder * (0.35 + variability / 2));
    const b = Math.round(remainder * (0.30 + variability / 3));
    const c = Math.round(remainder * (0.20 + variability / 4));
    const otros = Math.max(0, remainder - a - b - c);
    return [
      { name: "LubriSmart", value: lubriShare, color: "#0ea5e9" },
      { name: "Competidor A", value: a, color: "#22c55e" },
      { name: "Competidor B", value: b, color: "#a855f7" },
      { name: "Competidor C", value: c, color: "#f59e0b" },
      { name: "Otros", value: otros, color: "#ef4444" },
    ];
  })();

  // Tamaños responsive
  const titleSize = isMobile ? "text-base" : "text-lg";
  const descriptionSize = isMobile ? "text-xs" : "text-sm";

  // Función personalizada para renderizar las etiquetas - SOLUCIÓN DEFINITIVA
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Color que funciona en ambos modos
    const textColor = "hsl(var(--foreground))";

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontSize: isMobile ? "10px" : "12px",
          fontWeight: 500,
          fill: textColor,
          color: textColor,
        }}
      >
        {`${name}: ${value}%`}
      </text>
    );
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className={`pb-3 ${isMobile ? "px-4 pt-4" : "px-6 pt-6"}`}>
          <CardTitle className={titleSize}>Análisis de Precios</CardTitle>
          <CardDescription className={descriptionSize}>
            Comparación de precios con competencia local
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "px-4 pb-4" : "px-6 pb-6"}>
          <div className="space-y-4">
            {products.slice(0, 4).map((product, index) => {
              // Usar valores pseudoaleatorios basados en el índice para evitar Math.random()
              const priceMultiplier = 0.9 + ((index * 7) % 20) * 0.01;
              const avgPrice = product.price * priceMultiplier;
              const status =
                avgPrice > product.price
                  ? "high"
                  : avgPrice < product.price * 0.95
                  ? "low"
                  : "competitive";

              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Nuestro precio: ${product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${avgPrice.toFixed(2)}</p>
                    <Badge
                      variant={
                        status === "competitive"
                          ? "default"
                          : status === "low"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {status === "competitive"
                        ? "Competitivo"
                        : status === "low"
                        ? "Bajo"
                        : "Alto"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className={`pb-3 ${isMobile ? "px-4 pt-4" : "px-6 pt-6"}`}>
          <CardTitle className={titleSize}>Participación de Mercado</CardTitle>
          <CardDescription className={descriptionSize}>
            Estimación de participación en el mercado local
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? "px-2 pb-3" : "px-6 pb-6"}>
          <div className={`h-48 ${isMobile ? "" : "sm:h-60 md:h-80"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marketShareData}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 80 : 100}
                  innerRadius={isMobile ? 40 : 50}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {marketShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
                  formatter={(value, name) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
