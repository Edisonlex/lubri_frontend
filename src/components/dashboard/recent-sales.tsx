"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { usePOS } from "@/contexts/pos-context";
import { useEffect, useState, useCallback } from "react";
import { ArrowRight, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";

// Interfaz para ventas recientes
interface RecentSale {
  id: string;
  cliente: string;
  producto: string;
  cantidad: number;
  total: number;
  tiempo: string;
  metodo: string;
  fecha: string;
}

export function RecentSales() {
  const { sales, refreshSales } = usePOS();
  const router = useRouter();
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [viewMode, setViewMode] = useState<"today" | "recent">("recent");

  // Función para convertir ventas al formato de RecentSale
  const convertSalesToRecentSales = useCallback(() => {
    const ordered = [...sales].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const filtered = (() => {
      if (viewMode === "today") {
        const today = new Date();
        return ordered.filter(
          (s) => new Date(s.date).toDateString() === today.toDateString()
        );
      }
      return ordered;
    })();

    const convertedSales: RecentSale[] = filtered.map((sale) => {
      // Calcular el tiempo transcurrido
      const saleTime = new Date(sale.date);
      const now = new Date();
      const diffMs = now.getTime() - saleTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      let tiempo = "";
      if (diffMins < 1) {
        tiempo = "ahora";
      } else if (diffMins < 60) {
        tiempo = `${diffMins} min`;
      } else {
        const diffHours = Math.floor(diffMins / 60);
        tiempo = `${diffHours} h`;
      }

      // Obtener el primer producto para mostrar
      const firstProduct = sale.items[0] || {
        productName: "Varios productos",
        quantity: 1,
      };

      return {
        id: sale.id,
        cliente: sale.customerName || "Cliente no especificado",
        producto:
          sale.items.length > 1
            ? `${firstProduct.productName} y ${sale.items.length - 1} más`
            : firstProduct.productName,
        cantidad: firstProduct.quantity,
        total: sale.total,
        tiempo,
        metodo: sale.paymentMethod,
        fecha: sale.date,
      };
    });

    setRecentSales(convertedSales);
    setIsLoading(false);
  }, [sales, viewMode]);

  // Actualizar las ventas recientes cuando cambien las ventas
  useEffect(() => {
    convertSalesToRecentSales();
  }, [convertSalesToRecentSales]);

  // Actualizar las ventas al montar el componente
  useEffect(() => {
    const loadSales = async () => {
      setIsLoading(true);
      await refreshSales();
    };
    loadSales();
  }, [refreshSales]);

  const handleViewAllSales = () => {
    router.push("/ventas");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Ventas Recientes</span>
          </CardTitle>
          <CardDescription>Cargando ventas...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 animate-pulse"
              >
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Ventas Recientes
              </CardTitle>
              <CardDescription>
                {viewMode === "today" ? "Ventas de hoy" : "Últimas transacciones recientes"} ({recentSales.length})
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("today");
                  setPage(1);
                }}
              >
                Solo hoy
              </Button>
              <Button
                variant={viewMode === "recent" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("recent");
                  setPage(1);
                }}
              >
                Recientes
              </Button>
              {recentSales.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAllSales}
                  className="flex items-center gap-1 text-xs"
                >
                  Ver todas
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSales.length > 0 ? (
              recentSales
                .slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
                .map((sale, index) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={handleViewAllSales}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {sale.cliente
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">
                        {sale.cliente}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {sale.producto} x{sale.cantidad}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      ${sale.total.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0 capitalize"
                      >
                        {sale.metodo}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        hace {sale.tiempo}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6">
                <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-sm mb-4">
                  No hay ventas realizadas hoy
                </p>
                <Button
                  onClick={handleViewAllSales}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  Ver historial de ventas
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          {recentSales.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Mostrar</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
                <span className="text-sm">por página</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                  Anterior
                </Button>
                <span className="text-sm">
                  {page} / {Math.max(1, Math.ceil(recentSales.length / pageSize))}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.min(Math.max(1, Math.ceil(recentSales.length / pageSize)), page + 1))} disabled={page >= Math.ceil(recentSales.length / pageSize)}>
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
