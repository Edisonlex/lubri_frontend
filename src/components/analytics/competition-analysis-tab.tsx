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
import { useIsMobile } from "@/hooks/use-mobile";

interface CompetitionAnalysisTabProps {
  customers: any[];
}

export function CompetitionAnalysisTab({
  customers,
}: CompetitionAnalysisTabProps) {
  const [products, setProducts] = useState<any[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadData = async () => {
      const productsData = await api.getProducts();
      setProducts(productsData);
    };
    loadData();
  }, []);

  // Datos para el gráfico de participación de mercado
  const marketShareData = [
    { name: "LubriSmart", value: 18, color: "#16a34a" },
    { name: "Competidor A", value: 25, color: "#059669" },
    { name: "Competidor B", value: 22, color: "#10b981" },
    { name: "Competidor C", value: 15, color: "#34d399" },
    { name: "Otros", value: 20, color: "#6ee7b7" },
  ];

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
            {products.slice(0, 4).map((product) => {
              const avgPrice = product.price * (0.9 + Math.random() * 0.2);
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
    </div>
  );
}
