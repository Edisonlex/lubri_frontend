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

interface AlertContextType {
  alerts: StockAlert[];
  loading: boolean;
  refreshAlerts: () => Promise<void>;
  markAlertAsResolved: (alertId: string) => void;
  markAlertAsViewed: (alertId: string) => void;
  hasNewAlerts: boolean;
  clearNewAlertsFlag: () => void;
  resolvedAlerts: Set<string>;
  checkAndCreateAlerts: (products: Product[]) => void;
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

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const stockAlerts = await api.getStockAlerts();

      // Filtrar alertas que no estén resueltas
      const activeAlerts = stockAlerts.filter(
        (alert) => !resolvedAlerts.has(alert.id)
      );

      // Verificar si hay nuevas alertas
      if (activeAlerts.length > previousAlertCount) {
        setHasNewAlerts(true);
      }

      setPreviousAlertCount(activeAlerts.length);
      setAlerts(activeAlerts);
    } catch (error) {
      console.error("Error cargando alertas:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAlerts = async () => {
    await loadAlerts();
  };

  const markAlertAsResolved = (alertId: string) => {
    setResolvedAlerts((prev) => new Set(prev).add(alertId));
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const markAlertAsViewed = (alertId: string) => {
    setResolvedAlerts((prev) => new Set(prev).add(alertId));
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const checkAndCreateAlerts = (products: Product[]) => {
    // Esta función verifica los productos y crea alertas si es necesario
    // En una implementación real, esto se haría en el backend
    products.forEach((product) => {
      if (product.stock === 0) {
        // Crear alerta para producto sin stock
        console.log(`Alerta creada para ${product.name} - Sin stock`);
      } else if (product.stock < product.minStock) {
        // Crear alerta para stock bajo
        console.log(`Alerta creada para ${product.name} - Stock bajo`);
      }
    });
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
