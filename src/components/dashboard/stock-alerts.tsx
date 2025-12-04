"use client";

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
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlerts } from "@/contexts/alerts-context";
import { useAuth } from "@/contexts/auth-context";
import { useState, useMemo, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function StockAlerts() {
  const { getAlertsForRole, loading } = useAlerts();
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 4 : 6;

  const roleAlerts = useMemo(() => getAlertsForRole(user?.role || "admin"), [getAlertsForRole, user]);

  const filteredAlerts = useMemo(() => {
    if (filter === "all") return roleAlerts;
    return roleAlerts.filter((alert) => alert.urgency === filter);
  }, [filter, roleAlerts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, roleAlerts]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

  const alertCounts = useMemo(
    () => ({
      total: roleAlerts.length,
      critical: roleAlerts.filter((a) => a.urgency === "critical").length,
      high: roleAlerts.filter((a) => a.urgency === "high").length,
      medium: roleAlerts.filter((a) => a.urgency === "medium").length,
      low: roleAlerts.filter((a) => a.urgency === "low").length,
    }),
    [roleAlerts]
  );

  const getUrgencyConfig = (urgency: string) => {
    const config = {
      critical: {
        color: "text-red-700 bg-red-50 border-red-200",
        label: "Crítico",
      },
      high: {
        color: "text-orange-700 bg-orange-50 border-orange-200",
        label: "Alto",
      },
      medium: {
        color: "text-yellow-700 bg-yellow-50 border-yellow-200",
        label: "Medio",
      },
      low: { color: "text-blue-700 bg-blue-50 border-blue-200", label: "Bajo" },
    };
    return config[urgency as keyof typeof config] || config.low;
  };

  const getSeverityStyles = (urgency: string) => {
    const styles = {
      critical: {
        iconBg: "bg-red-100",
        leftBorder: "border-l-4 border-red-500",
        trackBg: "bg-red-100",
        percentText: "text-red-700",
      },
      high: {
        iconBg: "bg-orange-100",
        leftBorder: "border-l-4 border-orange-500",
        trackBg: "bg-orange-100",
        percentText: "text-orange-700",
      },
      medium: {
        iconBg: "bg-yellow-100",
        leftBorder: "border-l-4 border-yellow-500",
        trackBg: "bg-yellow-100",
        percentText: "text-yellow-700",
      },
      low: {
        iconBg: "bg-blue-100",
        leftBorder: "border-l-4 border-blue-500",
        trackBg: "bg-blue-100",
        percentText: "text-blue-700",
      },
    } as const;
    return styles[(urgency as keyof typeof styles) || "low"];
  };

  const getTrendIcon = (trend: string) => {
    const Icon =
      trend === "improving"
        ? TrendingDown
        : trend === "worsening"
        ? TrendingUp
        : Minus;
    const color =
      trend === "improving"
        ? "text-green-500"
        : trend === "worsening"
        ? "text-red-500"
        : "text-gray-400";
    return <Icon className={`h-4 w-4 ${color}`} />;
  };

  const getStockPercentage = (current: number, min: number) => {
    return Math.min((current / min) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="border-border bg-background shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-md">
                <AlertTriangle className="h-5 w-5 text-red-700" />
              </div>
              Alertas de Stock
            </CardTitle>
            <CardDescription className="text-sm">
              {alertCounts.total} productos requieren atención
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                Todas las alertas
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter("critical")}>
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Crítico ({alertCounts.critical})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("high")}>
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Alto ({alertCounts.high})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("medium")}>
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Medio ({alertCounts.medium})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("low")}>
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Bajo ({alertCounts.low})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <AnimatePresence>
          {paginatedAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`border border-border rounded-lg p-4 hover:bg-muted/40 transition-colors ${getSeverityStyles(alert.urgency).leftBorder}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 ${getSeverityStyles(alert.urgency).iconBg} rounded-md mt-0.5`}>
                    <Package className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {alert.productName}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alert.category} • {alert.sku}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getUrgencyConfig(alert.urgency).color}
                  >
                    {getUrgencyConfig(alert.urgency).label}
                  </Badge>
                  {getTrendIcon(alert.trend)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Stock actual</span>
                    <span className="text-sm font-medium text-red-700">{alert.currentStock}</span>
                  </div>
                  <div className={`rounded-md p-2 ${getSeverityStyles(alert.urgency).trackBg}`}>
                    <Progress value={getStockPercentage(alert.currentStock, alert.minStock)} />
                    <div className={`mt-1 text-[11px] ${getSeverityStyles(alert.urgency).percentText}`}>
                      {Math.round(getStockPercentage(alert.currentStock, alert.minStock))}% del mínimo
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Mínimo requerido</div>
                  <div className="text-sm font-medium">{alert.minStock}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-2 py-0 text-[11px]">Proveedor: {alert.supplier}</Badge>
                  <Badge variant="outline" className="px-2 py-0 text-[11px]">SKU: {alert.sku}</Badge>
                </div>
                <span>Actualizado: {formatDate(alert.lastUpdated)}</span>
              </div>

              
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAlerts.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 border border-dashed border-border rounded-lg"
          >
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No hay alertas {filter !== "all" ? `de tipo ${filter}` : ""}
            </p>
          </motion.div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">
            Mostrando {filteredAlerts.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredAlerts.length)} de {filteredAlerts.length} alertas
          </div>
          {filteredAlerts.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={isMobile ? "h-8" : "h-9"}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={isMobile ? "h-8" : "h-9"}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
