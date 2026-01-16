export * from "./reports/types";
export * from "./reports/inventory-report";
export * from "./reports/sales-report";
export * from "./reports/customers-report";
export * from "./reports/suppliers-report";
export * from "./reports/users-report";
export * from "./reports/obsolescence-report";
export * from "./reports/price-optimization-report";
export * from "./reports/classification-report";

// Helper functions for data preparation
export const prepareInventoryData = (products: any[]) => {
  const headers = [
    "SKU",
    "Nombre",
    "Marca",
    "Categoría",
    "Precio",
    "Stock",
    "Proveedor",
    "Ubicación",
  ];

  const data = products.map((product) => [
    product.sku,
    product.name,
    product.brand,
    product.category,
    `$${product.price.toFixed(2)}`,
    product.stock,
    product.supplier,
    product.location,
  ]);

  return { headers, data };
};

export const prepareSalesData = (sales: any[]) => {
  const headers = [
    "Factura",
    "Fecha",
    "Cliente",
    "Productos",
    "Total",
    "Método de Pago",
    "Estado",
    "Vendedor",
  ];

  const data = sales.map((sale) => [
    sale.invoiceNumber,
    sale.date,
    sale.customerName || "Cliente Ocasional",
    sale.items.map((item: any) => item.productName).join(", "),
    `$${sale.total.toFixed(2)}`,
    sale.paymentMethod,
    sale.status,
    "Sistema", // Podrías obtener el nombre del usuario si está disponible
  ]);

  return { headers, data };
};

export const prepareCustomersData = (customers: any[]) => {
  const headers = [
    "ID",
    "Nombre",
    "Email",
    "Teléfono",
    "Tipo",
    "Vehículos",
    "Compras Totales",
    "Última Compra",
    "Estado",
  ];

  const data = customers.map((customer) => [
    customer.idNumber,
    customer.name,
    customer.email,
    customer.phone,
    customer.customerType === "individual" ? "Individual" : "Empresa",
    customer.vehicles.length,
    `$${customer.totalPurchases.toFixed(2)}`,
    customer.lastPurchase || "Sin compras",
    customer.status === "active" ? "Activo" : "Inactivo",
  ]);

  return { headers, data };
};
