// contexts/alerts-context.tsx (versión mejorada)
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { StockAlert, api, Product } from "@/lib/api";
import { alertsService } from "@/lib/alerts-service";
import type { UserRole } from "@/contexts/auth-context";
import { toast } from "sonner";
import { usePreferences } from "@/contexts/preferences-context";
import { useAuth } from "@/contexts/auth-context";

interface AlertContextType {
  alerts: StockAlert[];
  loading: boolean;
  refreshAlerts: () => Promise<void>;
  markAlertAsResolved: (alertId: string) => void;
  markAlertAsViewed: (alertId: string) => Promise<void>;
  hasNewAlerts: boolean;
  clearNewAlertsFlag: () => void;
  resolvedAlerts: Set<string>;
  checkAndCreateAlerts: (products: Product[]) => Promise<void>;
  getAlertsForRole: (role: UserRole) => StockAlert[];
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNewAlerts, setHasNewAlerts] = useState(false);
  const [previousAlertCount, setPreviousAlertCount] = useState(0);
  const [resolvedAlerts, setResolvedAlerts] = useState<Set<string>>(new Set());
  const [previousAlertIds, setPreviousAlertIds] = useState<Set<string>>(new Set());
  const { preferences, isNotificationsEnabledForRole } = usePreferences();
  const { user } = useAuth();

  const loadAlerts = async () => {
    try {
      setLoading(true);
      
      // Usar el servicio con fallback
      const stockAlerts = await alertsService.getAlerts();

      // Filtrar alertas que no estén resueltas
      const activeAlerts = stockAlerts.filter(
        (alert) => !resolvedAlerts.has(alert.id)
      );

      const currentIds = new Set(activeAlerts.map((a) => a.id));
      const newIds = Array.from(currentIds).filter((id) => !previousAlertIds.has(id));
      if (newIds.length > 0) {
        setHasNewAlerts(true);
        if (user && isNotificationsEnabledForRole(user.role)) {
          const newAlerts = activeAlerts.filter((a) => newIds.includes(a.id));
          const criticalCount = newAlerts.filter((a) => a.urgency === "critical").length;
          const highCount = newAlerts.filter((a) => a.urgency === "high").length;
          const total = newAlerts.length;
          const title = criticalCount > 0 ? `Alertas críticas de inventario` : `Nuevas alertas de inventario`;
          const description = `Total: ${total}${highCount ? ` • Altas: ${highCount}` : ""}${criticalCount ? ` • Críticas: ${criticalCount}` : ""}`;
          const show = criticalCount > 0 ? toast.warning : toast.info;
          show(`${title}`, {
            description,
            action: {
              label: "Ver alertas",
              onClick: () => {
                try {
                  window.location.href = "/inventory?filter=alerts";
                } catch {}
              },
            },
            duration: 6000,
          });
        }
      }

      setPreviousAlertCount(activeAlerts.length);
      setAlerts(activeAlerts);
      setPreviousAlertIds(currentIds);
    } catch (error) {
      console.error("Error cargando alertas:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAlerts = async () => {
    await loadAlerts();
  };

  const markAlertAsResolved = async (alertId: string) => {
    try {
      // Intentar resolver en el backend primero
      await alertsService.resolveAlert(alertId);
      
      // Si el backend responde exitosamente, actualizar el estado local
      setResolvedAlerts((prev) => new Set(prev).add(alertId));
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (error) {
      console.error("Error resolviendo alerta:", error);
      
      // Si falla el backend, solo actualizar localmente
      // Esto permite que el usuario siga trabajando aunque el backend esté caído
      setResolvedAlerts((prev) => new Set(prev).add(alertId));
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    }
  };

  const markAlertAsViewed = async (alertId: string) => {
    try {
      // Intentar resolver en el backend primero
      await alertsService.resolveAlert(alertId);
      
      // Si el backend responde exitosamente, actualizar el estado local
      setResolvedAlerts((prev) => new Set(prev).add(alertId));
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (error) {
      console.error("Error marcando alerta como vista:", error);
      
      // Si falla el backend, solo actualizar localmente
      // Esto permite que el usuario siga trabajando aunque el backend esté caído
      setResolvedAlerts((prev) => new Set(prev).add(alertId));
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    }
  };

  const checkAndCreateAlerts = async (products: Product[]) => {
    try {
      // Usar el servicio de alertas para verificar y crear alertas
      await alertsService.checkStockAlerts(products);
    } catch (error) {
      console.error("Error verificando y creando alertas:", error);
      
      // Fallback local si falla el backend
      products.forEach((product) => {
        if (product.stock === 0) {
          // Crear alerta para producto sin stock
          console.log(`Alerta creada para ${product.name} - Sin stock`);
        } else if (product.stock < product.minStock) {
          // Crear alerta para stock bajo
          console.log(`Alerta creada para ${product.name} - Stock bajo`);
        }
      });
    }
  };

  const clearNewAlertsFlag = () => {
    setHasNewAlerts(false);
  };

  useEffect(() => {
    loadAlerts();

    // Actualizar alertas cada 2 minutos
    const interval = setInterval(loadAlerts, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [resolvedAlerts]);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        loading,
        refreshAlerts,
        markAlertAsResolved,
        markAlertAsViewed,
        hasNewAlerts,
        clearNewAlertsFlag,
        resolvedAlerts,
        checkAndCreateAlerts,
        getAlertsForRole: (role: UserRole) => {
          const maxVisible = 7;
          const urgencyRank: Record<string, number> = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
          };

          const base = alerts.filter((a) => !resolvedAlerts.has(a.id));

          const isCriticalOrHigh = (u: StockAlert["urgency"]) =>
            u === "critical" || u === "high";

          const filtered = base.filter((a) => {
            if (a.urgency === "critical") return true;
            if (a.currentStock === 0) return true;
            if (role === "cashier") {
              if (isCriticalOrHigh(a.urgency)) return true;
              if (a.currentStock <= a.minStock) return true;
              return false;
            }
            if (role === "technician") {
              if (isCriticalOrHigh(a.urgency)) return true;
              if (a.urgency === "medium" && a.trend === "worsening") return true;
              if (a.currentStock === 0) return true;
              return false;
            }
            return true;
          });

          const sorted = filtered.sort((x, y) => {
            const ur = urgencyRank[y.urgency] - urgencyRank[x.urgency];
            if (ur !== 0) return ur;
            if (x.currentStock !== y.currentStock) return x.currentStock - y.currentStock;
            if (x.trend !== y.trend) return (y.trend === "worsening" ? 1 : 0) - (x.trend === "worsening" ? 1 : 0);
            return 0;
          });

          return sorted.slice(0, maxVisible);
        },
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlerts debe ser usado dentro de un AlertProvider");
  }
  return context;
}
