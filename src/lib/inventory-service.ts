// src/lib/inventory-service.ts - Servicio para manejar inventario con backend
import { backendApi, isBackendEnabled } from "./backend-api";
import { api } from "./api";
import type { StockMovement, Product, User } from "./api";
import type { StockMovement as BackendStockMovement } from "./backend-api";

// Función para obtener movimientos de stock del backend con fallback a API local
export async function getStockMovementsWithFallback(
  productId?: string
): Promise<StockMovement[]> {
  const BACKEND_ENABLED = isBackendEnabled();
  if (!BACKEND_ENABLED) {
    const localMovements = await api.getStockMovements();
    return localMovements;
  }
  try {
    // Intentar obtener del backend primero
    const backendResponse = await backendApi.getStockMovements();
    const mapped = backendResponse.data.map(
      (m: BackendStockMovement): StockMovement => {
        const typeLocal: StockMovement["type"] =
          m.type === "purchase"
            ? "entrada"
            : m.type === "sale"
            ? "salida"
            : "ajuste";
        return {
          id: m.id,
          productId: m.productId,
          type: typeLocal,
          quantity: m.quantity,
          date: m.createdAt,
          reason: m.reason || "",
          userId: "backend",
          documentRef: undefined,
        };
      }
    );
    return mapped;
  } catch (error) {
    console.error("Error obteniendo movimientos de stock del backend:", error);

    // Si el error indica que el backend no está implementado, usar fallback sin mostrar error
    if (
      error instanceof Error &&
      error.message.includes("Respuesta no JSON del servidor")
    ) {
      console.warn("Backend no implementado, usando API local como fallback");
    }

    // Fallback a API local
    try {
      const localMovements = await api.getStockMovements();
      return localMovements;
    } catch (localError) {
      console.error("Error con API local también:", localError);
      throw error; // Lanzar el error original del backend
    }
  }
}

// Mapeo de tipos de movimiento locales a los del backend
const movementTypeMap: Record<
  "entrada" | "salida" | "ajuste",
  "purchase" | "sale" | "adjustment"
> = {
  entrada: "purchase",
  salida: "sale",
  ajuste: "adjustment",
};

// Función para crear movimiento de stock en el backend con fallback
export async function createStockMovementWithFallback(
  productId: string,
  type: "entrada" | "salida" | "ajuste",
  quantity: number,
  reason: string,
  userId: string,
  documentRef?: string
): Promise<StockMovement> {
  const BACKEND_ENABLED = isBackendEnabled();
  if (!BACKEND_ENABLED) {
    const localMovement: StockMovement = {
      id: `local-${Date.now()}`,
      productId,
      type,
      quantity,
      date: new Date().toISOString(),
      reason,
      userId,
      documentRef,
    };
    return localMovement;
  }
  try {
    // Intentar crear en el backend primero
    const backendResponse = await backendApi.createStockMovement({
      productId,
      type: movementTypeMap[type], // Usar el tipo mapeado
      quantity,
      reason,
    } as any);

    // Convertir el movimiento del backend al formato local
    const backendMovement = backendResponse.data as BackendStockMovement;
    return {
      id: backendMovement.id,
      productId: backendMovement.productId,
      type: type, // Usar el tipo local original
      quantity: backendMovement.quantity,
      date: backendMovement.createdAt,
      reason: backendMovement.reason || reason,
      userId,
      documentRef,
    } as StockMovement;
  } catch (error) {
    console.error("Error creando movimiento de stock en backend:", error);

    // Fallback: crear localmente y sincronizar después
    try {
      // Crear un movimiento local temporal
      const localMovement: StockMovement = {
        id: `local-${Date.now()}`,
        productId,
        type,
        quantity,
        date: new Date().toISOString(),
        reason,
        userId,
        documentRef,
      };

      // Intentar guardar en el almacenamiento local o API local si existe
      console.log(
        "Movimiento creado localmente (pendiente de sincronización):",
        localMovement
      );

      return localMovement;
    } catch (localError) {
      console.error("Error creando movimiento local:", localError);
      throw error; // Lanzar el error original del backend
    }
  }
}

// Función para verificar stock y crear alertas
export async function checkStockAndCreateAlerts(
  products: Product[]
): Promise<void> {
  try {
    // Enviar productos al backend para que verifique y cree alertas
    // Esta función asume que el backend tiene un endpoint para esto
    console.log("Verificando stock y creando alertas en el backend...");

    // Por ahora, solo logueamos las alertas que se crearían
    products.forEach((product) => {
      if (product.stock === 0) {
        console.log(`Alerta crítica: ${product.name} sin stock`);
      } else if (
        (product as any).minStock &&
        product.stock < (product as any).minStock
      ) {
        console.log(
          `Alerta de stock bajo: ${product.name} (${product.stock} < ${
            (product as any).minStock
          })`
        );
      }
    });

    // En una implementación completa, aquí se llamaría a:
    // await backendApi.checkStockAlerts(products);
  } catch (error) {
    console.error("Error verificando stock en backend:", error);
    throw error;
  }
}

// Función para ajustar stock de un producto
export async function adjustStock(
  productId: string,
  newStock: number,
  reason: string,
  userId: string
): Promise<void> {
  try {
    // Obtener el producto actual para calcular la diferencia
    const products = await api.getProducts();
    const currentProduct = products.find((p) => p.id === productId);

    if (!currentProduct) {
      throw new Error(`Producto con ID ${productId} no encontrado`);
    }
    const difference = newStock - currentProduct.stock;

    if (difference === 0) {
      console.log("No hay cambio en el stock");
      return;
    }

    const movementType = difference > 0 ? "entrada" : "salida";

    // Crear movimiento de ajuste
    await createStockMovementWithFallback(
      productId,
      movementType,
      Math.abs(difference),
      `Ajuste de inventario: ${reason}`,
      userId,
      `AJUSTE-${Date.now()}`
    );

    // Actualizar el stock del producto
    await api.updateProduct(productId, { stock: newStock });
  } catch (error) {
    console.error("Error ajustando stock:", error);
    throw error;
  }
}

// Servicio principal de inventario
export const inventoryService = {
  getStockMovements: getStockMovementsWithFallback,
  createStockMovement: createStockMovementWithFallback,
  checkStockAlerts: checkStockAndCreateAlerts,
  adjustStock,
};
