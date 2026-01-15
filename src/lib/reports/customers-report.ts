
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ExportData } from "./types";

export const exportCustomersToPDF = ({
  headers,
  data,
  fileName,
}: ExportData) => {
  const doc = new jsPDF(); // Default portrait

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
      fillColor: [66, 135, 245], // Azul original
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
    (doc.lastAutoTable?.finalY ?? 25) + 10
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
