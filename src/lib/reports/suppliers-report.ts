
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ExportData } from "./types";

export const exportSuppliersToPDF = ({
  headers,
  data,
  fileName,
}: ExportData) => {
  const doc = new jsPDF(); // Default portrait

  doc.text(`Reporte de Proveedores - ${new Date().toLocaleDateString()}`, 14, 15);

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
    `Total de Proveedores: ${data.length}`,
    14,
    (doc.lastAutoTable?.finalY ?? 25) + 10
  );
  doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`);
};
