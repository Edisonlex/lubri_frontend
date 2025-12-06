// hooks/use-stock-management.ts
import { useAlerts } from "@/contexts/alerts-context";
import { api, Product } from "@/lib/api";
import { toast } from "sonner";

export function useStockManagement() {
  const { refreshAlerts } = useAlerts();

  const updateProductStock = async (
    productId: string,
    newStock: number,
    minStock: number
  ) => {
    try {
      // Actualizar el producto en la API
      await api.updateProduct(productId, { stock: newStock });

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
