import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ExportData } from "./types";

export const exportSalesToPDF = ({ headers, data, fileName }: ExportData) => {
  const doc = new jsPDF(); // Default portrait

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
      fillColor: [66, 135, 245], // Azul para consistencia
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 25 },
  });

  // Agregar resumen
  const totalVentas = data.reduce((sum, row) => {
    // Extraer el valor numérico de la columna Total (índice 4), eliminando símbolos de moneda
    const valStr = String(row[4] || "").replace(/[^0-9.-]/g, "");
    return sum + (parseFloat(valStr) || 0);
  }, 0);

  doc.text(
    `Total de Ventas: $${totalVentas.toFixed(2)}`,
    14,
    (doc.lastAutoTable?.finalY ?? 25) + 10
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
