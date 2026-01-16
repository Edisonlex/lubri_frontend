import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ExportData } from "./types";

export const exportToPDF = ({ headers, data, fileName }: ExportData) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(14);
  doc.text(
    `Reporte de Inventario - ${new Date().toLocaleDateString()}`,
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
      fillColor: [66, 135, 245],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    columnStyles: {
      0: { cellWidth: 80 }, // SKU
      1: { cellWidth: 160 }, // Nombre
      2: { cellWidth: 90 }, // Marca
      3: { cellWidth: 90 }, // Categoría
      4: { cellWidth: 75 }, // Precio
      5: { cellWidth: 70 }, // Stock
      6: { cellWidth: 140 }, // Proveedor
      7: { cellWidth: 80 }, // Ubicación
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
