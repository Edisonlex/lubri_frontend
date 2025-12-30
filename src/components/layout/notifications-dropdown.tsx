// components/notifications-dropdown.tsx
"use client";

import {
  Bell,
  Package,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAlerts } from "@/contexts/alerts-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NotificationsDropdown() {
  const router = useRouter();
  const {
    alerts,
    markAlertAsResolved,
    markAlertAsViewed,
    hasNewAlerts,
    clearNewAlertsFlag,
  } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);

  const handleDropdownOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && hasNewAlerts) {
      clearNewAlertsFlag();
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <Info className="h-4 w-4 text-yellow-600" />;
      case "low":
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "border-l-destructive bg-destructive/5 hover:bg-destructive/10";
      case "high":
        return "border-l-orange-600 bg-orange-500/5 hover:bg-orange-500/10";
      case "medium":
        return "border-l-yellow-600 bg-yellow-500/5 hover:bg-yellow-500/10";
      case "low":
        return "border-l-blue-600 bg-blue-500/5 hover:bg-blue-500/10";
      default:
        return "border-l-muted-foreground/20 bg-muted/50 hover:bg-muted";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-destructive/80 text-destructive-foreground";
      case "high":
        return "bg-orange-600/80 text-white";
      case "medium":
        return "bg-yellow-600/80 text-white";
      case "low":
        return "bg-blue-600/80 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleAlertClick = (alert: any) => {
    // Marcar como vista y navegar
    markAlertAsViewed(alert.id);
    router.push(`/inventory?alert=${alert.id}&product=${alert.sku}`);
    setIsOpen(false);
  };

  const handleResolveAlert = (event: React.MouseEvent, alertId: string) => {
    event.stopPropagation();
    markAlertAsResolved(alertId);
    // La alerta desaparece inmediatamente
  };

  const handleViewAllAlerts = () => {
    router.push("/inventory?filter=alerts");
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 sm:h-10 sm:w-10 p-0"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {alerts.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px] sm:text-xs"
            >
              {alerts.length}
            </Badge>
          )}
          {hasNewAlerts && alerts.length === 0 && (
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 sm:w-96" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between p-3 sm:p-4">
          <span className="text-sm font-semibold">Alertas de Stock</span>
          {alerts.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {alerts.length} activas
            </Badge>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                No hay alertas activas
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Todo el stock está en niveles normales
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <DropdownMenuItem
                key={alert.id}
                className={`p-3 sm:p-4 border-l-4 ${getUrgencyStyles(
                  alert.urgency
                )} cursor-pointer transition-colors group relative`}
                onClick={() => handleAlertClick(alert)}
              >
                {/* Botón de cerrar */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => handleResolveAlert(e, alert.id)}
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="flex items-start gap-3 w-full pr-6">
                  <div className="flex-shrink-0 mt-0.5">
                    {getUrgencyIcon(alert.urgency)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight truncate">
                        {alert.productName}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getUrgencyBadge(alert.urgency)}`}
                      >
                        {alert.urgency === "critical"
                          ? "Crítico"
                          : alert.urgency === "high"
                          ? "Alto"
                          : alert.urgency === "medium"
                          ? "Medio"
                          : "Bajo"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Stock: {alert.currentStock} {alert.unit} • Mín:{" "}
                      {alert.minStock} {alert.unit}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {alert.category}
                      </span>
                      <span className="text-xs font-medium">
                        ${alert.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {alert.supplier}
                      </span>
                      <span
                        className={`text-xs ${
                          alert.trend === "worsening"
                            ? "text-destructive"
                            : alert.trend === "improving"
                            ? "text-green-700"
                            : "text-muted-foreground"
                        }`}
                      >
                        {alert.trend === "worsening"
                          ? "↓ Empeorando"
                          : alert.trend === "improving"
                          ? "↑ Mejorando"
                          : "→ Estable"}
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>

        {alerts.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => {
                    // Marcar todas como resueltas
                    alerts.forEach((alert) => markAlertAsResolved(alert.id));
                  }}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolver todas
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleViewAllAlerts}
                >
                  Ver en inventario
                </Button>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
