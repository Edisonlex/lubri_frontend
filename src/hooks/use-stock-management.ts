// hooks/use-stock-management.ts
import { useAlerts } from "@/contexts/alerts-context";
import { api, Product } from "@/lib/api";
import { toast } from "sonner";

export function useStockManagement() {
  const { refreshAlerts, markAlertAsResolved } = useAlerts();

  const updateProductStock = async (
    productId: string,
    newStock: number,
    minStock: number
  ) => {
    try {
      // Actualizar el producto en la API
      await api.updateProduct(productId, { stock: newStock });

      // Si el stock ahora es mayor al mínimo, buscar y resolver alertas de este producto
      if (newStock >= minStock) {
        const alerts = await api.getStockAlerts();
        const productAlerts = alerts.filter(
          (alert) => alert.sku === productId || alert.id === productId
        );

        // Resolver alertas de este producto
        productAlerts.forEach((alert) => {
          markAlertAsResolved(alert.id);
        });
      }

      // Refrescar las alertas para reflejar los cambios
      await refreshAlerts();

      return true;
    } catch (error) {
      console.error("Error actualizando stock:", error);
      return false;
    }
  };

  const registerStockMovement = async (
    productId: string,
    type: "entrada" | "salida" | "ajuste",
    quantity: number,
    reason: string,
    minStock: number,
    newStock: number
  ) => {
    try {
      // Registrar movimiento en la API
      await api.createStockMovement({
        productId,
        type,
        quantity,
        reason,
        date: new Date().toISOString(),
        userId: "current-user-id",
        documentRef: `MOV-${Date.now()}`,
      });

      // Si es una entrada y el stock ahora es suficiente, resolver alertas
      if (type === "entrada" && newStock >= minStock) {
        const alerts = await api.getStockAlerts();
        const productAlerts = alerts.filter(
          (alert) => alert.sku === productId || alert.id === productId
        );

        productAlerts.forEach((alert) => {
          markAlertAsResolved(alert.id);
        });
      }

      // Refrescar alertas
      await refreshAlerts();

      return true;
    } catch (error) {
      console.error("Error registrando movimiento:", error);
      return false;
    }
  };

  const createProduct = async (productData: Omit<Product, "id">) => {
    try {
      const newProduct = await api.createProduct(productData);

      // Verificar si el nuevo producto necesita alerta
      if (newProduct.stock < newProduct.minStock) {
        // En una implementación real, aquí crearías la alerta en el backend
        console.log("Alerta potencial para nuevo producto:", newProduct.name);
      }

      await refreshAlerts();
      return newProduct;
    } catch (error) {
      console.error("Error creando producto:", error);
      throw error;
    }
  };

  const updateProduct = async (
    productId: string,
    productData: Partial<Product>
  ) => {
    try {
      const updatedProduct = await api.updateProduct(productId, productData);

      // Verificar si los cambios afectan las alertas
      if (
        productData.stock !== undefined &&
        productData.minStock !== undefined
      ) {
        if (productData.stock >= productData.minStock) {
          // Resolver alertas si el stock ahora es suficiente
          const alerts = await api.getStockAlerts();
          const productAlerts = alerts.filter(
            (alert) => alert.sku === productId || alert.id === productId
          );

          productAlerts.forEach((alert) => {
            markAlertAsResolved(alert.id);
          });
        }
      }

      await refreshAlerts();
      return updatedProduct;
    } catch (error) {
      console.error("Error actualizando producto:", error);
      throw error;
    }
  };

  return {
    updateProductStock,
    registerStockMovement,
    createProduct,
    updateProduct,
  };
}
