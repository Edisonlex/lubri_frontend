
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ExportData } from "./types";

export const exportPriceOptimizationToPDF = ({
  headers,
  data,
  fileName,
}: ExportData) => {
  const doc = new jsPDF(); // Default portrait

  doc.text(`Reporte de Optimización de Precios - ${new Date().toLocaleDateString()}`, 14, 15);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 25,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 135, 245], // Azul
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { top: 25 },
  });

  const totalPotential = data.reduce((sum, row) => {
    const val = parseFloat(String(row[4] || "").replace(/[^0-9.-]/g, "")) || 0;
    return sum + val;
  }, 0);

  doc.text(
    `Potencial Total Estimado: $${totalPotential.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
    })}`,
    14,
    (doc.lastAutoTable?.finalY ?? 25) + 10
  );

  doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`);
};
