// lib/export-utils.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Extender la interfaz de jsPDF para incluir autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportData {
  headers: string[];
  data: any[][];
  fileName: string;
  companyInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

// ===== FUNCIONES PARA REPORTE DE INVENTARIO (YA EXISTENTES) =====
export const exportToPDF = ({ headers, data, fileName }: ExportData) => {
  const doc = new jsPDF();

  // Título del documento
  doc.text(
    `Reporte de Inventario - ${new Date().toLocaleDateString()}`,
    14,
    15
  );

  // Tabla usando autoTable
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 25,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 135, 245],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 25 },
  });

  doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const exportToExcel = ({
  headers,
  data,
  fileName,
  companyInfo,
}: ExportData) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  // Información de la empresa
  const companyRows = [
    [companyInfo?.name || "LUBRICENTRO PROFESIONAL"],
    [companyInfo?.address || ""],
    [companyInfo?.phone ? `Tel: ${companyInfo.phone}` : ""],
    [companyInfo?.email ? `Email: ${companyInfo.email}` : ""],
    [""],
    ["REPORTE DE INVENTARIO"],
    [`Generado el: ${new Date().toLocaleDateString()}`],
    [`Total de productos: ${data.length}`],
    [""],
  ];

  XLSX.utils.sheet_add_aoa(worksheet, companyRows, { origin: "A1" });
  XLSX.utils.sheet_add_aoa(worksheet, [headers], {
    origin: `A${companyRows.length + 1}`,
  });
  XLSX.utils.sheet_add_aoa(worksheet, data, {
    origin: `A${companyRows.length + 2}`,
  });

  // Ajustar ancho de columnas
  const colWidths = headers.map((_, index) => ({
    wch: Math.max(headers[index].length, 12),
  }));
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
  XLSX.writeFile(
    workbook,
    `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

// ===== FUNCIONES PARA REPORTE DE VENTAS =====
export const exportSalesToPDF = ({ headers, data, fileName }: ExportData) => {
  const doc = new jsPDF();

  doc.text(`Reporte de Ventas - ${new Date().toLocaleDateString()}`, 14, 15);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 25,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [34, 139, 34], // Verde para ventas
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 25 },
  });

  // Agregar resumen
  const totalVentas = data.reduce(
    (sum, row) => sum + parseFloat(row[4] || 0),
    0
  );
  doc.text(
    `Total de Ventas: $${totalVentas.toFixed(2)}`,
    14,
    doc.lastAutoTable.finalY + 10
  );

  doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const exportSalesToExcel = ({
  headers,
  data,
  fileName,
  companyInfo,
}: ExportData) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  const companyRows = [
    [companyInfo?.name || "LUBRICENTRO PROFESIONAL"],
    [companyInfo?.address || ""],
    [companyInfo?.phone ? `Tel: ${companyInfo.phone}` : ""],
    [companyInfo?.email ? `Email: ${companyInfo.email}` : ""],
    [""],
    ["REPORTE DE VENTAS"],
    [`Generado el: ${new Date().toLocaleDateString()}`],
    [`Total de ventas: ${data.length}`],
    [""],
  ];

  XLSX.utils.sheet_add_aoa(worksheet, companyRows, { origin: "A1" });
  XLSX.utils.sheet_add_aoa(worksheet, [headers], {
    origin: `A${companyRows.length + 1}`,
  });
  XLSX.utils.sheet_add_aoa(worksheet, data, {
    origin: `A${companyRows.length + 2}`,
  });

  // Resumen
  const totalVentas = data.reduce(
    (sum, row) => sum + parseFloat(row[4] || 0),
    0
  );
  const summaryStartRow = companyRows.length + data.length + 3;
  const summaryRows = [
    [""],
    ["RESUMEN DE VENTAS"],
    [`Total de ventas: ${data.length}`],
    [
      `Ingreso total: $${totalVentas.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
      })}`,
    ],
    [
      `Promedio por venta: $${(totalVentas / data.length).toLocaleString(
        "es-ES",
        { minimumFractionDigits: 2 }
      )}`,
    ],
  ];

  XLSX.utils.sheet_add_aoa(worksheet, summaryRows, {
    origin: `A${summaryStartRow}`,
  });

  const colWidths = headers.map((_, index) => ({
    wch: Math.max(headers[index].length, 15),
  }));
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");
  XLSX.writeFile(
    workbook,
    `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

// ===== FUNCIONES PARA REPORTE DE CLIENTES =====
export const exportCustomersToPDF = ({
  headers,
  data,
  fileName,
}: ExportData) => {
  const doc = new jsPDF();

  doc.text(`Reporte de Clientes - ${new Date().toLocaleDateString()}`, 14, 15);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 25,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [128, 0, 128], // Púrpura para clientes
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 25 },
  });

  doc.text(
    `Total de Clientes: ${data.length}`,
    14,
    doc.lastAutoTable.finalY + 10
  );
  doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const exportCustomersToExcel = ({
  headers,
  data,
  fileName,
  companyInfo,
}: ExportData) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  const companyRows = [
    [companyInfo?.name || "LUBRICENTRO PROFESIONAL"],
    [companyInfo?.address || ""],
    [companyInfo?.phone ? `Tel: ${companyInfo.phone}` : ""],
    [companyInfo?.email ? `Email: ${companyInfo.email}` : ""],
    [""],
    ["REPORTE DE CLIENTES"],
    [`Generado el: ${new Date().toLocaleDateString()}`],
    [`Total de clientes: ${data.length}`],
    [""],
  ];

  XLSX.utils.sheet_add_aoa(worksheet, companyRows, { origin: "A1" });
  XLSX.utils.sheet_add_aoa(worksheet, [headers], {
    origin: `A${companyRows.length + 1}`,
  });
  XLSX.utils.sheet_add_aoa(worksheet, data, {
    origin: `A${companyRows.length + 2}`,
  });

  const colWidths = headers.map((_, index) => ({
    wch: Math.max(headers[index].length, 15),
  }));
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
  XLSX.writeFile(
    workbook,
    `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

// ===== PREPARACIÓN DE DATOS =====
export const prepareInventoryData = (products: any[]) => {
  const headers = [
    "SKU",
    "Nombre",
    "Marca",
    "Categoría",
    "Precio",
    "Costo",
    "Stock",
    "Stock Mínimo",
    "Stock Máximo",
    "Proveedor",
    "Ubicación",
    "Estado",
  ];

  const data = products.map((product) => [
    product.sku,
    product.name,
    product.brand,
    product.category,
    `$${product.price.toFixed(2)}`,
    `$${product.cost.toFixed(2)}`,
    product.stock,
    product.minStock,
    product.maxStock,
    product.supplier,
    product.location,
    product.status === "active" ? "Activo" : "Inactivo",
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
