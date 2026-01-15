// src/lib/alerts-service.ts - Servicio para manejar alertas con backend
import { backendApi, isBackendEnabled } from "./backend-api";
import { api } from "./api";
import type { StockAlert } from "./api";

// ===== FUNCIÓN AUXILIAR PARA MANEJAR ERRORES DE BACKEND =====
const handleBackendError = (error: unknown, context: string): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  const isBackendMissing =
    message.includes("Respuesta no JSON del servidor") ||
    message.includes("La operación falló. El backend puede no estar implementado") ||
    message.includes("Failed to fetch") ||
    message.includes("NetworkError");

  if (isBackendMissing) {
    console.warn(
      `Backend no disponible/implementado para ${context}, usando API local como fallback`
    );
    return true;
  }
  console.error(`Error en ${context}:`, error);
  return false;
};

// Función para obtener alertas del backend con fallback a API local
export async function getAlertsWithFallback(): Promise<StockAlert[]> {
  const BACKEND_ENABLED = isBackendEnabled();
  if (!BACKEND_ENABLED) {
    const localAlerts = await api.getStockAlerts();
    return localAlerts;
  }
  try {
    // Intentar obtener del backend primero
    const backendAlerts = await backendApi.getStockAlerts();
    return backendAlerts;
  } catch (error) {
    const isBackendNotImplemented = handleBackendError(
      error,
      "obtener alertas de stock"
    );
    if (!isBackendNotImplemented) {
      console.error("Error obteniendo alertas del backend:", error);
    }
    
    // Fallback a API local
    try {
      const localAlerts = await api.getStockAlerts();
      return localAlerts;
    } catch (localError) {
      console.error("Error con API local también:", localError);
      throw error; // Lanzar el error original del backend
    }
  }
}

// Función para resolver alerta en el backend con fallback
export async function resolveAlertWithFallback(alertId: string): Promise<void> {
  const BACKEND_ENABLED = isBackendEnabled();
  if (!BACKEND_ENABLED) {
    return;
  }
  try {
    // Intentar resolver en el backend primero
    await backendApi.resolveStockAlert(alertId);
  } catch (error) {
    console.error("Error resolviendo alerta en backend:", error);
    
    // Si el backend falla, no hay fallback local para esta operación
    // Ya que la API local no tiene esta funcionalidad
    throw error;
  }
}

// Función para crear alertas basadas en productos
export function checkStockAndCreateAlerts(products: any[]): StockAlert[] {
  const alerts: StockAlert[] = [];
  
  products.forEach(product => {
    if (product.stock <= product.minStock) {
      const urgency = product.stock === 0 ? "critical" : 
                     product.stock <= product.minStock * 0.5 ? "high" : "medium";
      
      alerts.push({
        id: `alert-${product.id}-${Date.now()}`,
        productName: product.name,
        currentStock: product.stock,
        minStock: product.minStock,
        category: product.category,
        urgency,
        supplier: product.supplier,
        sku: product.sku,
        lastUpdated: new Date().toISOString(),
        trend: "stable", // Esto podría ser calculado con datos históricos
        price: product.price,
        unit: "unidad", // Podría venir del producto
      });
    }
  });
  
  return alerts;
}

// Servicio principal de alertas
export const alertsService = {
  getAlerts: getAlertsWithFallback,
  resolveAlert: resolveAlertWithFallback,
  checkStockAlerts: checkStockAndCreateAlerts,
};
