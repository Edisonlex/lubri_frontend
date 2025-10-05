// lib/movements-export-utils.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { StockMovement } from "@/lib/api";

// Extender la interfaz de jsPDF para incluir autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface MovementsExportData {
  movements: StockMovement[];
  fileName: string;
  dateRange?: { from: Date; to: Date };
  movementType?: string;
  companyInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export const exportMovementsToPDF = ({
  movements,
  fileName,
  dateRange,
  movementType,
  companyInfo,
}: MovementsExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Colores corporativos
  const primaryColor = [41, 128, 185];
  const secondaryColor = [52, 152, 219];

  // Encabezado con información de la empresa
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 25, "F");

  // Logo o nombre de la empresa
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(companyInfo?.name || "LUBRICENTRO PROFESIONAL", pageWidth / 2, 15, {
    align: "center",
  });

  // Información de la empresa
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  if (companyInfo?.address) {
    doc.text(companyInfo.address, pageWidth / 2, 22, { align: "center" });
  }

  // Título del reporte
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, "bold");
  doc.text("REPORTE DE MOVIMIENTOS DE INVENTARIO", pageWidth / 2, 40, {
    align: "center",
  });

  // Información del reporte
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, "normal");

  let infoY = 50;
  doc.text(`Generado el: ${currentDate}`, margin, infoY);

  if (dateRange) {
    infoY += 7;
    doc.text(
      `Período: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`,
      margin,
      infoY
    );
  }

  if (movementType && movementType !== "all") {
    infoY += 7;
    const typeNames: Record<string, string> = {
      entry: "Entradas",
      sale: "Ventas",
      adjustment: "Ajustes",
    };
    doc.text(`Tipo: ${typeNames[movementType] || movementType}`, margin, infoY);
  }

  infoY += 7;
  doc.text(`Total de movimientos: ${movements.length}`, margin, infoY);

  // Línea separadora
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, infoY + 5, pageWidth - margin, infoY + 5);

  // Preparar datos para la tabla
  const headers = ["Fecha", "Tipo", "Cantidad", "Motivo", "Referencia"];
  const data = movements.map((movement) => [
    new Date(movement.date).toLocaleDateString("es-ES"),
    movement.type === "entrada"
      ? "ENTRADA"
      : movement.type === "salida"
      ? "SALIDA"
      : "AJUSTE",
    movement.type === "salida"
      ? `-${movement.quantity}`
      : `+${movement.quantity}`,
    movement.reason,
    movement.documentRef || "-",
  ]);

  // Tabla con diseño mejorado
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: infoY + 10,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: infoY + 10, right: margin, bottom: 30, left: margin },
    theme: "grid",
    didDrawPage: (data) => {
      // Pie de página en cada página
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Página ${doc.getNumberOfPages()}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );

      doc.text(
        "Confidencial - Uso interno",
        margin,
        doc.internal.pageSize.height - 10
      );

      doc.text(
        `Generado: ${new Date().toLocaleString()}`,
        pageWidth - margin,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    },
  });

  // Resumen al final del documento
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  if (finalY < doc.internal.pageSize.height - 50) {
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, "bold");
    doc.text("RESUMEN DE MOVIMIENTOS", margin, finalY);

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");

    // Calcular resúmenes
    const entradas = movements.filter((m) => m.type === "entrada").length;
    const salidas = movements.filter((m) => m.type === "salida").length;
    const ajustes = movements.filter((m) => m.type === "ajuste").length;
    const totalEntradas = movements
      .filter((m) => m.type === "entrada")
      .reduce((sum, m) => sum + m.quantity, 0);
    const totalSalidas = movements
      .filter((m) => m.type === "salida")
      .reduce((sum, m) => sum + m.quantity, 0);

    doc.text(
      `• Entradas: ${entradas} movimientos (${totalEntradas} unidades)`,
      margin,
      finalY + 10
    );
    doc.text(
      `• Salidas: ${salidas} movimientos (${totalSalidas} unidades)`,
      margin,
      finalY + 17
    );
    doc.text(`• Ajustes: ${ajustes} movimientos`, margin, finalY + 24);
    doc.text(
      `• Balance neto: ${totalEntradas - totalSalidas} unidades`,
      margin,
      finalY + 31
    );
  }

  doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`);
};

export const exportMovementsToExcel = ({
  movements,
  fileName,
  dateRange,
  movementType,
  companyInfo,
}: MovementsExportData) => {
  const workbook = XLSX.utils.book_new();

  // Crear hoja de trabajo
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  // Información de la empresa
  const companyRows = [
    [companyInfo?.name || "LUBRICENTRO PROFESIONAL"],
    [companyInfo?.address || ""],
    [companyInfo?.phone ? `Tel: ${companyInfo.phone}` : ""],
    [companyInfo?.email ? `Email: ${companyInfo.email}` : ""],
    [""],
    ["REPORTE DE MOVIMIENTOS DE INVENTARIO"],
    [`Generado el: ${new Date().toLocaleDateString("es-ES")}`],
  ];

  // Agregar información específica del reporte
  if (dateRange) {
    companyRows.push([
      `Período: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`,
    ]);
  }

  if (movementType && movementType !== "all") {
    const typeNames: Record<string, string> = {
      entry: "Entradas",
      sale: "Ventas",
      adjustment: "Ajustes",
    };
    companyRows.push([`Tipo: ${typeNames[movementType] || movementType}`]);
  }

  companyRows.push([`Total de movimientos: ${movements.length}`], [""]);

  // Agregar información de la empresa
  XLSX.utils.sheet_add_aoa(worksheet, companyRows, { origin: "A1" });

  // Agregar encabezados de tabla
  const headers = ["Fecha", "Tipo", "Cantidad", "Motivo", "Referencia"];
  XLSX.utils.sheet_add_aoa(worksheet, [headers], {
    origin: `A${companyRows.length + 1}`,
  });

  // Agregar datos
  const data = movements.map((movement) => [
    new Date(movement.date).toLocaleDateString("es-ES"),
    movement.type === "entrada"
      ? "ENTRADA"
      : movement.type === "salida"
      ? "SALIDA"
      : "AJUSTE",
    movement.type === "salida" ? -movement.quantity : movement.quantity,
    movement.reason,
    movement.documentRef || "-",
  ]);

  XLSX.utils.sheet_add_aoa(worksheet, data, {
    origin: `A${companyRows.length + 2}`,
  });

  // Aplicar estilos y formato
  if (worksheet["!ref"]) {
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);

        if (!worksheet[cell_ref]) continue;

        // Título principal
        if (R === 0) {
          worksheet[cell_ref].s = {
            font: { sz: 16, bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2980B9" } },
            alignment: { horizontal: "center" },
          };
        }

        // Encabezados de tabla
        if (R === companyRows.length) {
          worksheet[cell_ref].s = {
            font: { sz: 11, bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3498DB" } },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        }

        // Datos de la tabla
        if (R > companyRows.length) {
          worksheet[cell_ref].s = {
            font: { sz: 10 },
            border: {
              top: { style: "thin", color: { rgb: "DDDDDD" } },
              bottom: { style: "thin", color: { rgb: "DDDDDD" } },
              left: { style: "thin", color: { rgb: "DDDDDD" } },
              right: { style: "thin", color: { rgb: "DDDDDD" } },
            },
          };

          // Resaltar filas pares
          if ((R - companyRows.length - 1) % 2 === 0) {
            worksheet[cell_ref].s.fill = { fgColor: { rgb: "F8F9FA" } };
          }

          // Formato para columna de cantidad (columna C, índice 2)
          if (C === 2) {
            worksheet[cell_ref].s.numFmt = "#,##0;[Red]-#,##0";
          }
        }
      }
    }
  }

  // Ajustar el ancho de las columnas
  const colWidths = headers.map((_, index) => ({
    wch: Math.max(
      ...data.map((row) => String(row[index] || "").length),
      headers[index].length,
      12
    ),
  }));
  worksheet["!cols"] = colWidths;

  // Congelar paneles
  worksheet["!freeze"] = { x: 0, y: companyRows.length };

  // Agregar la hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");

  XLSX.writeFile(
    workbook,
    `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`
  );
};

// Función principal de exportación
export const exportMovements = (
  movements: StockMovement[],
  options: {
    fileName?: string;
    dateRange?: { from: Date; to: Date };
    movementType?: string;
    companyInfo?: any;
  }
) => {
  const baseFileName =
    options.fileName ||
    `Reporte_Movimientos_${new Date().toISOString().split("T")[0]}`;

  return {
    exportToPDF: () =>
      exportMovementsToPDF({
        movements,
        fileName: baseFileName,
        dateRange: options.dateRange,
        movementType: options.movementType,
        companyInfo: options.companyInfo || {
          name: "LUBRICENTRO PROFESIONAL",
          address: "Av. Principal 123, Quito, Ecuador",
          phone: "+593 2 234 5678",
          email: "info@lubricentro.com",
        },
      }),
    exportToExcel: () =>
      exportMovementsToExcel({
        movements,
        fileName: baseFileName,
        dateRange: options.dateRange,
        movementType: options.movementType,
        companyInfo: options.companyInfo || {
          name: "LUBRICENTRO PROFESIONAL",
          address: "Av. Principal 123, Quito, Ecuador",
          phone: "+593 2 234 5678",
          email: "info@lubricentro.com",
        },
      }),
  };
};
