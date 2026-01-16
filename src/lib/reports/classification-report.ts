import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ExportData } from "./types";

export const exportClassificationToPDF = ({
  headers,
  data,
  fileName,
}: ExportData) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(14);
  doc.text(
    `Clasificación ABC de Inventario - ${new Date().toLocaleDateString()}`,
    40,
    40
  );

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 60,
    styles: {
      fontSize: 9,
      cellPadding: 4,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [66, 135, 245], // Blue header
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    // Customize column widths if needed based on headers:
    // ["Producto", "Clase", "Ingresos", "Stock", "Valor Inv.", "Acción Recomendada"]
    columnStyles: {
      0: { cellWidth: 200 }, // Producto
      1: { cellWidth: 60, halign: "center" }, // Clase
      2: { cellWidth: 100, halign: "right" }, // Ingresos
      3: { cellWidth: 80, halign: "center" }, // Stock
      4: { cellWidth: 100, halign: "right" }, // Valor Inv
      5: { cellWidth: 150 }, // Acción
    },
    margin: { top: 60, left: 30, right: 30 },
    tableWidth: pageWidth - 60,
    didDrawPage: (dataHook: any) => {
      doc.setFontSize(8);
      const pageLabel = `Página ${
        dataHook.pageNumber
      }/${doc.getNumberOfPages()}`;
      doc.text(pageLabel, pageWidth - 80, pageHeight - 20);
    },
  });

  doc.save(`${fileName}.pdf`);
};

export const exportAutoClassificationToPDF = ({
  headers,
  data,
  fileName,
}: ExportData) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(14);
  doc.text(
    `Reporte de Clasificación Automática - ${new Date().toLocaleDateString()}`,
    40,
    40
  );

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 60,
    styles: {
      fontSize: 10,
      cellPadding: 6,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: [66, 135, 245], // Blue header
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: "bold" }, // Categoría
      1: { cellWidth: 80, halign: "center" }, // Cantidad
      2: { cellWidth: "auto" }, // Ejemplos
    },
    margin: { top: 60, left: 40, right: 40 },
    tableWidth: pageWidth - 80,
    didDrawPage: (dataHook: any) => {
      doc.setFontSize(8);
      const pageLabel = `Página ${
        dataHook.pageNumber
      }/${doc.getNumberOfPages()}`;
      doc.text(pageLabel, pageWidth - 80, pageHeight - 20);
    },
  });

  doc.save(`${fileName}.pdf`);
};

export const exportClassificationToExcel = ({
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
    ["CLASIFICACIÓN ABC DE INVENTARIO"],
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
    wch: Math.max(headers[index].length + 5, 15),
  }));
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Clasificación ABC");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
