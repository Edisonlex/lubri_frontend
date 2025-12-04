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
  ChevronLeft,
  ChevronRight,
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

export function StockAlerts() {
  const { getAlertsForRole, loading } = useAlerts();
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMobile ? 4 : 4;

  const roleAlerts = useMemo(
    () => getAlertsForRole(user?.role || "admin"),
    [getAlertsForRole, user]
  );

  const filteredAlerts = useMemo(() => {
    if (filter === "all") return roleAlerts;
    return roleAlerts.filter((alert) => alert.urgency === filter);
  }, [filter, roleAlerts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, roleAlerts]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAlerts.length / itemsPerPage)
  );
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

  // Configuración para modo claro y oscuro
  const getUrgencyConfig = (urgency: string) => {
    const config = {
      critical: {
        light:
          "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/30 dark:border-red-800/50",
        dark: "text-red-300 bg-red-950/30 border-red-800/50",
        label: "Crítico",
      },
      high: {
        light:
          "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-300 dark:bg-orange-950/30 dark:border-orange-800/50",
        dark: "text-orange-300 bg-orange-950/30 border-orange-800/50",
        label: "Alto",
      },
      medium: {
        light:
          "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-800/50",
        dark: "text-yellow-300 bg-yellow-950/30 border-yellow-800/50",
        label: "Medio",
      },
      low: {
        light:
          "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/30 dark:border-blue-800/50",
        dark: "text-blue-300 bg-blue-950/30 border-blue-800/50",
        label: "Bajo",
      },
    };
    return config[urgency as keyof typeof config] || config.low;
  };

  const getSeverityStyles = (urgency: string) => {
    const styles = {
      critical: {
        iconBg: "bg-red-100 dark:bg-red-900/30",
        leftBorder: "border-l-4 border-red-500 dark:border-red-700",
        trackBg: "bg-red-100 dark:bg-red-900/20",
        percentText: "text-red-700 dark:text-red-400",
        stockText: "text-red-700 dark:text-red-400",
        iconColor: "text-red-700 dark:text-red-400",
      },
      high: {
        iconBg: "bg-orange-100 dark:bg-orange-900/30",
        leftBorder: "border-l-4 border-orange-500 dark:border-orange-700",
        trackBg: "bg-orange-100 dark:bg-orange-900/20",
        percentText: "text-orange-700 dark:text-orange-400",
        stockText: "text-orange-700 dark:text-orange-400",
        iconColor: "text-orange-700 dark:text-orange-400",
      },
      medium: {
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        leftBorder: "border-l-4 border-yellow-500 dark:border-yellow-700",
        trackBg: "bg-yellow-100 dark:bg-yellow-900/20",
        percentText: "text-yellow-700 dark:text-yellow-400",
        stockText: "text-yellow-700 dark:text-yellow-400",
        iconColor: "text-yellow-700 dark:text-yellow-400",
      },
      low: {
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        leftBorder: "border-l-4 border-blue-500 dark:border-blue-700",
        trackBg: "bg-blue-100 dark:bg-blue-900/20",
        percentText: "text-blue-700 dark:text-blue-400",
        stockText: "text-blue-700 dark:text-blue-400",
        iconColor: "text-blue-700 dark:text-blue-400",
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
        ? "text-green-500 dark:text-green-400"
        : trend === "worsening"
        ? "text-red-500 dark:text-red-400"
        : "text-gray-400 dark:text-gray-500";
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

  return (
    <Card className="border-border bg-background shadow-sm dark:shadow-lg dark:shadow-black/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-md">
                <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-400" />
              </div>
              Alertas de Stock
            </CardTitle>
            <CardDescription className="text-sm dark:text-gray-400">
              {alertCounts.total} productos requieren atención
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 dark:bg-gray-900 dark:border-gray-800"
            >
              <DropdownMenuItem
                onClick={() => setFilter("all")}
                className="dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Todas las alertas
              </DropdownMenuItem>
              <DropdownMenuSeparator className="dark:bg-gray-800" />
              <DropdownMenuItem
                onClick={() => setFilter("critical")}
                className="dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <span className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full mr-2"></span>
                Crítico ({alertCounts.critical})
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter("high")}
                className="dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <span className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full mr-2"></span>
                Alto ({alertCounts.high})
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter("medium")}
                className="dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <span className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full mr-2"></span>
                Medio ({alertCounts.medium})
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setFilter("low")}
                className="dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-2"></span>
                Bajo ({alertCounts.low})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary-foreground"></div>
          </div>
        )}

        <AnimatePresence>
          {paginatedAlerts.map((alert) => {
            const styles = getSeverityStyles(alert.urgency);
            const urgencyConfig = getUrgencyConfig(alert.urgency);

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`border border-border dark:border-gray-800 rounded-lg p-3 sm:p-4 hover:bg-muted/40 dark:hover:bg-gray-800/50 transition-colors ${styles.leftBorder}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`p-2 ${styles.iconBg} rounded-md mt-0.5 flex-shrink-0`}
                    >
                      <Package className={`h-4 w-4 ${styles.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground dark:text-gray-100 truncate">
                        {alert.productName}
                      </h4>
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mt-0.5 truncate">
                        {alert.category} • {alert.sku}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`${urgencyConfig.light} text-xs dark:${urgencyConfig.dark}`}
                    >
                      {urgencyConfig.label}
                    </Badge>
                    {getTrendIcon(alert.trend)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                  <div className="min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground dark:text-gray-400">
                        Stock actual
                      </span>
                      <span
                        className={`text-sm font-medium ${styles.stockText}`}
                      >
                        {alert.currentStock}
                      </span>
                    </div>
                    <div className={`rounded-md p-2 ${styles.trackBg}`}>
                      <Progress
                        value={getStockPercentage(
                          alert.currentStock,
                          alert.minStock
                        )}
                        className="h-2 dark:[&>div]:bg-gradient-to-r dark:[&>div]:from-red-500 dark:[&>div]:to-orange-500"
                      />
                      <div
                        className={`mt-1 text-[11px] sm:text-xs ${styles.percentText}`}
                      >
                        {Math.round(
                          getStockPercentage(alert.currentStock, alert.minStock)
                        )}
                        % del mínimo
                      </div>
                    </div>
                  </div>

                  <div className="text-right min-w-0">
                    <div className="text-xs text-muted-foreground dark:text-gray-400">
                      Mínimo requerido
                    </div>
                    <div className="text-sm font-medium dark:text-gray-200">
                      {alert.minStock}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 text-xs text-muted-foreground dark:text-gray-400">
                  
                  <span className="text-[11px] sm:text-xs whitespace-nowrap dark:text-gray-500">
                    Actualizado: {formatDate(alert.lastUpdated)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 border border-dashed border-border dark:border-gray-800 rounded-lg"
          >
            <Package className="h-12 w-12 text-muted-foreground dark:text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              No hay alertas {filter !== "all" ? `de tipo ${filter}` : ""}
            </p>
          </motion.div>
        )}

        {/* Sección de paginación corregida - RESPONSIVE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground dark:text-gray-400 text-center sm:text-left w-full sm:w-auto">
            Mostrando {filteredAlerts.length === 0 ? 0 : startIndex + 1}-
            {Math.min(endIndex, filteredAlerts.length)} de{" "}
            {filteredAlerts.length} alertas
          </div>

          {filteredAlerts.length > 0 && (
            <div className="flex flex-col xs:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center justify-center sm:justify-normal gap-2 order-2 xs:order-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2 sm:px-3 flex items-center gap-1 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Anterior</span>
                </Button>

                <span className="text-xs text-muted-foreground dark:text-gray-400 min-w-[80px] text-center">
                  Página {currentPage} de {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="h-8 px-2 sm:px-3 flex items-center gap-1 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <span className="hidden xs:inline">Siguiente</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
