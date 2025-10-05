"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface InventoryRotationTabProps {
  customers: any[];
}

export function InventoryRotationTab({ customers }: InventoryRotationTabProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData] = await Promise.all([
          api.getProducts(),
          api.getProductClassification(),
        ]);
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading inventory data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-sm text-muted-foreground">
          Cargando rotación de inventario...
        </div>
      </div>
    );
  }

  const rotationData = [
    { category: "Aceites", rotation: 8.5, optimal: 6 },
    { category: "Filtros", rotation: 12.3, optimal: 10 },
    { category: "Lubricantes", rotation: 4.2, optimal: 5 },
    { category: "Aditivos", rotation: 3.1, optimal: 4 },
  ];

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader
            className={`pb-3 ${isMobile ? "px-4 pt-4" : "px-6 pt-6"}`}
          >
            <CardTitle className={isMobile ? "text-base" : "text-lg"}>
              Productos Más Vendidos
            </CardTitle>
            <CardDescription className={isMobile ? "text-xs" : "text-sm"}>
              Top 5 productos por rotación
            </CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "px-4 pb-4" : "px-6 pb-6"}>
            <div className="space-y-3 md:space-y-4">
              {products
                .sort((a, b) => (b.rotationRate || 0) - (a.rotationRate || 0))
                .slice(0, 5)
                .map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 md:p-4 border rounded-lg bg-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={`${
                          isMobile ? "text-sm" : "text-base"
                        } font-medium truncate`}
                      >
                        {product.name}
                      </p>
                      <p
                        className={`${
                          isMobile ? "text-xs" : "text-sm"
                        } text-muted-foreground mt-1`}
                      >
                        Stock: {product.stock} | Rotación:{" "}
                        {((product.rotationRate || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p
                        className={`${
                          isMobile ? "text-sm" : "text-base"
                        } font-bold`}
                      >
                        ${product.price?.toFixed(2) || "0.00"}
                      </p>
                      <p
                        className={`${
                          isMobile ? "text-xs" : "text-sm"
                        } text-muted-foreground`}
                      >
                        Precio
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader
            className={`pb-3 ${isMobile ? "px-4 pt-4" : "px-6 pt-6"}`}
          >
            <CardTitle className={isMobile ? "text-base" : "text-lg"}>
              Rotación de Inventario
            </CardTitle>
            <CardDescription className={isMobile ? "text-xs" : "text-sm"}>
              Análisis de rotación por categoría
            </CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "px-2 pb-3" : "px-6 pb-6"}>
            <div className={`h-48 ${isMobile ? "" : "sm:h-60 md:h-80"}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rotationData}
                  margin={{ bottom: 30, left: 0, right: 5, top: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--muted))"
                  />
                  <XAxis
                    dataKey="category"
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 50 : 40}
                    tick={{
                      fill: "hsl(222.2 84% 4.9%)",
                      fontSize: isMobile ? 10 : 12,
                      fontWeight: 500,
                    }}
                    axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                    tickLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                    className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                  />
                  <YAxis
                    tick={{
                      fill: "hsl(222.2 84% 4.9%)",
                      fontSize: isMobile ? 10 : 12,
                      fontWeight: 500,
                    }}
                    axisLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                    tickLine={{ stroke: "hsl(214.3 31.8% 91.4%)" }}
                    className="dark:[fill:hsl(0_0%_90%)] dark:[&_line]:stroke-gray-500"
                  />
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
                    cursor={{
                      fill: "hsl(var(--muted))",
                      fillOpacity: 0.3,
                    }}
                    formatter={(value) => [`${value}`, "Rotación"]}
                  />
                  <Legend
                    iconSize={isMobile ? 10 : 12}
                    wrapperStyle={{
                      fontSize: isMobile ? "10px" : "12px",
                      paddingTop: "10px",
                    }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="rotation"
                    fill="#16a34a"
                    name="Rotación Actual"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="optimal"
                    fill="#059669"
                    name="Rotación Óptima"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
