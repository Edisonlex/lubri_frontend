// src/lib/reports-service.ts - Servicio para manejar reportes y análisis con backend
import { backendApi, isBackendEnabled } from "./backend-api";
import {
  convertBackendUserToContext,
  convertContextUserToBackend,
} from "../contexts/pos-context";
import { api } from "./api";
import type { Product as LocalProduct } from "./api";
import type {
  InventoryAnalytics,
  SalesAnalytics,
  CustomerAnalytics,
  SaleFilters,
} from "./backend-api";

// ===== FUNCIÓN AUXILIAR PARA MANEJAR ERRORES DE BACKEND =====
const handleBackendError = (error: unknown, context: string): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  const isBackendMissing =
    message.includes("Respuesta no JSON del servidor") ||
    message.includes(
      "La operación falló. El backend puede no estar implementado"
    ) ||
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

// Función para obtener análisis de inventario del backend con fallback
export async function getInventoryAnalyticsWithFallback(): Promise<InventoryAnalytics> {
  const BACKEND_ENABLED = isBackendEnabled();
  if (!BACKEND_ENABLED) {
    const products = await api.getProducts();
    const categoryDistribution = products.reduce((acc, product) => {
      const category = product.category || "Sin categoría";
      const existing = acc.find((item) => item.name === category);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: category, value: 1 });
      }
      return acc;
    }, [] as { name: string; value: number }[]);
    const stockLevels = products.map((product) => ({
      name: product.name,
      value: product.stock || 0,
    }));
    const minStock = 10;
    const lowStockProducts = products
      .filter((product) => (product.stock || 0) < minStock)
      .map((product) => ({
        name: product.name,
        value: minStock - (product.stock || 0),
      }));
    const cost = (product: LocalProduct) => product.cost ?? product.price * 0.7;
    const totalValue = products.reduce(
      (sum, product) => sum + (product.stock || 0) * cost(product),
      0
    );
    const lowStockCount = products.filter(
      (product) => (product.stock || 0) < minStock
    ).length;
    const outOfStockCount = products.filter(
      (product) => (product.stock || 0) === 0
    ).length;
    const localAnalytics: InventoryAnalytics = {
      categoryDistribution,
      stockLevels: stockLevels.slice(0, 10),
      topSellingProducts: [],
      lowStockProducts,
      inventoryValue: [{ name: "Valor Total", value: totalValue }],
      totalProducts: products.length,
      totalValue,
      lowStockCount,
      outOfStockCount,
    };
    return localAnalytics;
  }
  try {
    // Intentar obtener del backend primero
    const response = await backendApi.getInventoryAnalytics();
    return response.data;
  } catch (error) {
    // Manejar error de backend no implementado
    const isBackendNotImplemented = handleBackendError(
      error,
      "obtener análisis de inventario"
    );
    if (!isBackendNotImplemented) {
      console.error(
        "Error obteniendo análisis de inventario del backend:",
        error
      );
    }

    // Fallback a datos locales simulados
    try {
      // Obtener productos locales para generar análisis básico
      const products = await api.getProducts();

      const categoryDistribution = products.reduce((acc, product) => {
        const category = product.category || "Sin categoría";
        const existing = acc.find((item) => item.name === category);
        if (existing) {
          existing.value += 1;
        } else {
          acc.push({ name: category, value: 1 });
        }
        return acc;
      }, [] as { name: string; value: number }[]);

      const stockLevels = products.map((product) => ({
        name: product.name,
        value: product.stock || 0,
      }));

      // Usar propiedades que existan en el modelo Product
      const minStock = 10; // Valor por defecto ya que no existe minStock en la interfaz Product
      const lowStockProducts = products
        .filter((product) => (product.stock || 0) < minStock)
        .map((product) => ({
          name: product.name,
          value: minStock - (product.stock || 0),
        }));

      const cost = (product: LocalProduct) =>
        product.cost ?? product.price * 0.7;
      const totalValue = products.reduce(
        (sum, product) => sum + (product.stock || 0) * cost(product),
        0
      );
      const lowStockCount = products.filter(
        (product) => (product.stock || 0) < minStock
      ).length;
      const outOfStockCount = products.filter(
        (product) => (product.stock || 0) === 0
      ).length;

      const localAnalytics: InventoryAnalytics = {
        categoryDistribution,
        stockLevels: stockLevels.slice(0, 10), // Top 10
        topSellingProducts: [], // No disponible localmente
        lowStockProducts,
        inventoryValue: [{ name: "Valor Total", value: totalValue }],
        totalProducts: products.length,
        totalValue,
        lowStockCount,
        outOfStockCount,
      };

      return localAnalytics;
    } catch (localError) {
      console.error("Error generando análisis local:", localError);
      throw error; // Lanzar el error original del backend
    }
  }
}

// ===== SERVICIO PRINCIPAL DE REPORTES =====
export const reportsService = {
  getInventoryAnalytics: getInventoryAnalyticsWithFallback,
  getSalesAnalytics: getSalesAnalyticsWithFallback,
  getCustomerAnalytics: getCustomerAnalyticsWithFallback,
  generateInventoryReport,
  generateSalesReport,
  getDemandForecast: getDemandForecastWithFallback,
  // Añadir aquí otras funciones que se necesiten
  getProducts: api.getProducts,
  getProductClassification: api.getProductClassification,
  getCustomers: api.getCustomers,
};

// Función para obtener análisis de ventas del backend con fallback
export async function getSalesAnalyticsWithFallback(
  filters?: SaleFilters
): Promise<SalesAnalytics> {
  const BACKEND_ENABLED = isBackendEnabled();
  if (!BACKEND_ENABLED) {
    const sales = await api.getSales();
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const dailySales = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const daySales = sales.filter((sale) => {
        const saleDate = new Date(sale.date);
        const saleDateStr = saleDate.toISOString().split("T")[0];
        return saleDateStr === dateStr;
      });
      const dayAmount = daySales.reduce((sum, sale) => sum + sale.total, 0);
      const dayCount = daySales.length;
      dailySales.push({
        date: dateStr,
        amount: dayAmount,
        count: dayCount,
      });
    }
    const paymentMethods = sales.reduce((acc, sale) => {
      const existing = acc.find((item) => item.method === sale.paymentMethod);
      if (existing) {
        existing.amount += sale.total;
        existing.count += 1;
      } else {
        acc.push({
          method: sale.paymentMethod,
          amount: sale.total,
          count: 1,
        });
      }
      return acc;
    }, [] as { method: string; amount: number; count: number }[]);
    const localAnalytics: SalesAnalytics = {
      dailySales,
      monthlySales: [],
      topCustomers: [],
      paymentMethods,
      totalSales,
      totalRevenue,
      averageTicket,
      growthRate: 0,
    };
    return localAnalytics;
  }
  try {
    // Intentar obtener del backend primero
    const response = await backendApi.getSalesAnalytics(filters);
    return response.data;
  } catch (error) {
    const isBackendNotImplemented = handleBackendError(
      error,
      "obtener análisis de ventas"
    );
    if (!isBackendNotImplemented) {
      console.error("Error obteniendo análisis de ventas del backend:", error);
    }

    // Fallback a datos locales simulados
    try {
      // Obtener ventas locales para generar análisis básico
      const sales = await api.getSales();

      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
      const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Agrupar por día (últimos 7 días)
      const dailySales = [];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const daySales = sales.filter((sale) => {
          const saleDate = new Date(sale.date);
          const saleDateStr = saleDate.toISOString().split("T")[0];
          return saleDateStr === dateStr;
        });

        const dayAmount = daySales.reduce((sum, sale) => sum + sale.total, 0);
        const dayCount = daySales.length;

        dailySales.push({
          date: dateStr,
          amount: dayAmount,
          count: dayCount,
        });
      }

      // Métodos de pago
      const paymentMethods = sales.reduce((acc, sale) => {
        const existing = acc.find((item) => item.method === sale.paymentMethod);
        if (existing) {
          existing.amount += sale.total;
          existing.count += 1;
        } else {
          acc.push({
            method: sale.paymentMethod,
            amount: sale.total,
            count: 1,
          });
        }
        return acc;
      }, [] as { method: string; amount: number; count: number }[]);

      const localAnalytics: SalesAnalytics = {
        dailySales,
        monthlySales: [], // No implementado localmente
        topCustomers: [], // No disponible localmente
        paymentMethods,
        totalSales,
        totalRevenue,
        averageTicket,
        growthRate: 0, // No calculado localmente
      };

      return localAnalytics;
    } catch (localError) {
      console.error("Error generando análisis local:", localError);
      throw error; // Lanzar el error original del backend
    }
  }
}

// Función para obtener análisis de clientes del backend con fallback
export async function getCustomerAnalyticsWithFallback(): Promise<CustomerAnalytics> {
  const BACKEND_ENABLED = isBackendEnabled();
  if (!BACKEND_ENABLED) {
    const customers = await api.getCustomers();
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(
      (customer) => customer.status === "active"
    ).length;
    const inactiveCustomers = customers.filter(
      (customer) => customer.status === "inactive"
    ).length;
    const topCustomers = customers
      .map((customer) => ({
        name: customer.name,
        totalPurchases: customer.totalPurchases || 0,
        lastPurchase: customer.lastPurchase || null,
      }))
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 5);
    const customerGrowth = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthStr = date.toLocaleString("es-ES", {
        month: "long",
        year: "numeric",
      });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = customers.filter((customer) => {
        const registrationDate = new Date(customer.registrationDate);
        return registrationDate >= monthStart && registrationDate <= monthEnd;
      }).length;
      customerGrowth.push({
        month: monthStr,
        count,
      });
    }
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const currentMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const newCustomersThisMonth = customers.filter((customer) => {
      const registrationDate = new Date(customer.registrationDate);
      return (
        registrationDate >= currentMonthStart &&
        registrationDate <= currentMonthEnd
      );
    }).length;
    const localAnalytics: CustomerAnalytics = {
      totalCustomers,
      newCustomersThisMonth,
      activeCustomers,
      inactiveCustomers,
      topCustomers,
      customerGrowth,
    };
    return localAnalytics;
  }
  try {
    // Intentar obtener del backend primero
    const response = await backendApi.getCustomerAnalytics();
    return response.data;
  } catch (error) {
    const isBackendNotImplemented = handleBackendError(
      error,
      "obtener análisis de clientes"
    );
    if (!isBackendNotImplemented) {
      console.error(
        "Error obteniendo análisis de clientes del backend:",
        error
      );
    }

    // Fallback a datos locales simulados
    try {
      // Obtener clientes locales para generar análisis básico
      const customers = await api.getCustomers();

      const totalCustomers = customers.length;

      // Propiedades que pueden no existir en Customer - usando valores por defecto
      const activeCustomers = customers.filter(
        (customer) => customer.status === "active"
      ).length;
      const inactiveCustomers = customers.filter(
        (customer) => customer.status === "inactive"
      ).length;

      // Top clientes por compras totales - usando propiedades existentes
      const topCustomers = customers
        .map((customer) => ({
          name: customer.name,
          totalPurchases: customer.totalPurchases || 0,
          lastPurchase: customer.lastPurchase || null,
        }))
        .sort((a, b) => b.totalPurchases - a.totalPurchases)
        .slice(0, 5);

      // Crecimiento de clientes (últimos 6 meses)
      const customerGrowth = [];
      const currentDate = new Date();

      for (let i = 5; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const monthStr = date.toLocaleString("es-ES", {
          month: "long",
          year: "numeric",
        });

        // Estimación simple basada en fecha de creación
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const count = customers.filter((customer) => {
          const registrationDate = new Date(customer.registrationDate);
          return registrationDate >= monthStart && registrationDate <= monthEnd;
        }).length;

        customerGrowth.push({
          month: monthStr,
          count,
        });
      }

      // Clientes nuevos este mes (calculado basado en fecha de creación)
      const currentMonthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const currentMonthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const newCustomersThisMonth = customers.filter((customer) => {
        const registrationDate = new Date(customer.registrationDate);
        return (
          registrationDate >= currentMonthStart &&
          registrationDate <= currentMonthEnd
        );
      }).length;

      const localAnalytics: CustomerAnalytics = {
        totalCustomers,
        newCustomersThisMonth,
        activeCustomers,
        inactiveCustomers,
        topCustomers,
        customerGrowth,
      };

      return localAnalytics;
    } catch (localError) {
      console.error("Error generando análisis local:", localError);
      throw error; // Lanzar el error original del backend
    }
  }
}

// Función para generar reporte de inventario en PDF
export async function generateInventoryReport(
  format: "pdf" | "excel" = "pdf"
): Promise<Blob> {
  try {
    // Intentar obtener del backend primero
    console.log(`Generando reporte de inventario en ${format}...`);

    // En una implementación completa, aquí se llamaría a:
    // return await backendApi.generateInventoryReport(format);

    // Por ahora, retornamos un Blob vacío como placeholder
    return new Blob([], {
      type:
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  } catch (error) {
    console.error("Error generando reporte de inventario:", error);
    throw error;
  }
}

// Función para generar reporte de ventas
export async function generateSalesReport(
  startDate: string,
  endDate: string,
  format: "pdf" | "excel" = "pdf"
): Promise<Blob> {
  try {
    // Intentar obtener del backend primero
    console.log(
      `Generando reporte de ventas del ${startDate} al ${endDate} en ${format}...`
    );

    // En una implementación completa, aquí se llamaría a:
    // return await backendApi.generateSalesReport(startDate, endDate, format);

    // Por ahora, retornamos un Blob vacío como placeholder
    return new Blob([], {
      type:
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  } catch (error) {
    console.error("Error generando reporte de ventas:", error);
    throw error;
  }
}

// Función para obtener pronóstico de demanda con fallback
export async function getDemandForecastWithFallback(): Promise<any[]> {
  const BACKEND_ENABLED = isBackendEnabled();
  if (!BACKEND_ENABLED) {
    try {
      const products = await api.getProducts();
      const sales = await api.getSales();
      const currentDate = new Date();
      const forecast: any[] = [];

      // Agrupar ventas por producto
      const salesByProduct: Record<string, number> = {};
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          salesByProduct[item.productId] =
            (salesByProduct[item.productId] || 0) + item.quantity;
        });
      });

      // Tomar top 5 productos más vendidos
      const topProducts = products
        .map((p) => ({ ...p, totalSales: salesByProduct[p.id] || 0 }))
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      // Generar pronóstico para los próximos 6 meses
      for (let i = 1; i <= 6; i++) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + i,
          1
        );
        const monthName = date.toLocaleString("es-ES", {
          month: "long",
          year: "numeric",
        });

        for (const product of topProducts) {
          // Calculo simple: promedio mensual + variacion aleatoria pequeña
          // Asumimos que totalSales es histórico total. Para hacerlo mejor, necesitaríamos fecha de ventas.
          // Simplificación: usaremos un factor base del stock actual o ventas históricas
          const baseDemand = Math.max(product.totalSales / 6, 5); // Promedio estimado o min 5
          const trendFactor = 1 + (Math.random() * 0.2 - 0.1); // +/- 10%

          forecast.push({
            month: monthName,
            productId: product.id,
            productName: product.name,
            actual: null, // Futuro
            forecast: Math.round(baseDemand * trendFactor),
            confidence: 0.8 + Math.random() * 0.15,
          });
        }
      }

      return forecast;
    } catch (localError) {
      console.error("Error generando pronóstico local:", localError);
      return []; // Retornar array vacío en lugar de lanzar error para no romper la UI
    }
  }

  try {
    const response = await api.getDemandForecast();
    return response.forecastByProduct || [];
  } catch (error) {
    const isBackendNotImplemented = handleBackendError(
      error,
      "obtener pronóstico de demanda"
    );
    if (!isBackendNotImplemented) {
      console.error(
        "Error obteniendo pronóstico de demanda del backend:",
        error
      );
    }

    // Fallback a datos locales si falla backend
    try {
      const products = await api.getProducts();
      const sales = await api.getSales();
      const currentDate = new Date();
      const forecast: any[] = [];

      const salesByProduct: Record<string, number> = {};
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          salesByProduct[item.productId] =
            (salesByProduct[item.productId] || 0) + item.quantity;
        });
      });

      const topProducts = products
        .map((p) => ({ ...p, totalSales: salesByProduct[p.id] || 0 }))
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      for (let i = 1; i <= 6; i++) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + i,
          1
        );
        const monthName = date.toLocaleString("es-ES", {
          month: "long",
          year: "numeric",
        });

        for (const product of topProducts) {
          const baseDemand = Math.max(product.totalSales / 6, 5);
          const trendFactor = 1 + (Math.random() * 0.2 - 0.1);

          forecast.push({
            month: monthName,
            productId: product.id,
            productName: product.name,
            actual: null,
            forecast: Math.round(baseDemand * trendFactor),
            confidence: 0.8 + Math.random() * 0.15,
          });
        }
      }

      return forecast;
    } catch (localError) {
      console.error("Error generando pronóstico local:", localError);
      return [];
    }
  }
}
