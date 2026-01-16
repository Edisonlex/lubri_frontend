import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ExportData } from "./types";

export const exportObsolescenceHistoryToPDF = ({
  headers,
  data,
  fileName,
}: ExportData) => {
  const doc = new jsPDF(); // Default portrait
  doc.text(
    `Histórico de Obsolescencia - ${new Date().toLocaleDateString()}`,
    14,
    15
  );
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 25,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [66, 135, 245],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 25 },
  });

  const totalObsoletos = data.reduce(
    (sum, row) => sum + Number(row[1] || 0),
    0
  );
  const impactoTotal = data.reduce((sum, row) => {
    const val = parseFloat(String(row[2]).replace(/[^0-9.-]/g, "")) || 0;
    return sum + val;
  }, 0);

  const y = (doc.lastAutoTable?.finalY ?? 25) + 10;
  doc.text(`Totales del período`, 14, y);
  doc.text(`Obsoletos: ${totalObsoletos}`, 14, y + 6);
  doc.text(
    `Impacto acumulado: $${impactoTotal.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
    })}`,
    14,
    y + 12
  );

  doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const exportObsolescenceHistoryToExcel = ({
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
    ["HISTÓRICO DE OBSOLESCENCIA"],
    [`Generado el: ${new Date().toLocaleDateString("es-ES")}`],
    [""],
  ];

  XLSX.utils.sheet_add_aoa(worksheet, companyRows, { origin: "A1" });
  XLSX.utils.sheet_add_aoa(worksheet, [headers], {
    origin: `A${companyRows.length + 1}`,
  });
  XLSX.utils.sheet_add_aoa(worksheet, data, {
    origin: `A${companyRows.length + 2}`,
  });

  const totalObsoletos = data.reduce(
    (sum, row) => sum + Number(row[1] || 0),
    0
  );
  const impactoTotal = data.reduce((sum, row) => {
    const val = parseFloat(String(row[2]).replace(/[^0-9.-]/g, "")) || 0;
    return sum + val;
  }, 0);

  const summaryStartRow = companyRows.length + data.length + 3;
  const summaryRows = [
    [""],
    ["RESUMEN"],
    ["Total obsoletos", totalObsoletos],
    ["Impacto acumulado", impactoTotal],
  ];
  XLSX.utils.sheet_add_aoa(worksheet, summaryRows, {
    origin: `A${summaryStartRow}`,
  });

  const colWidths = headers.map((h) => ({ wch: Math.max(h.length, 15) }));
  worksheet["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Obsolescencia");
  XLSX.writeFile(
    workbook,
    `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};
