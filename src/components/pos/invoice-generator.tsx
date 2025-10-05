"use client";

import { CartItem, Customer } from "@/contexts/pos-context";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customer: Customer;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
}

export const generateInvoicePDF = (invoiceData: InvoiceData): boolean => {
  try {
    // Crear un nuevo documento PDF
    const doc = new jsPDF();

    // Configuración de la página
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Encabezado de la factura
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("LubriSmart", pageWidth / 2, margin, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Sistema de Gestión para Lubricadoras",
      pageWidth / 2,
      margin + 7,
      {
        align: "center",
      }
    );
    doc.text(
      "Teléfono: (04) 123-4567 | Email: info@lubrismart.com",
      pageWidth / 2,
      margin + 12,
      { align: "center" }
    );

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 15, pageWidth - margin, margin + 15);

    // Información de la factura
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURA", margin, margin + 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Número: ${invoiceData.invoiceNumber}`, margin, margin + 32);
    doc.text(`Fecha: ${invoiceData.date}`, margin, margin + 37);
    doc.text(
      `Método de Pago: ${invoiceData.paymentMethod}`,
      margin,
      margin + 42
    );

    // Información del cliente
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CLIENTE", pageWidth - margin - 60, margin + 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Nombre: ${invoiceData.customer.name}`,
      pageWidth - margin - 60,
      margin + 32
    );

    if (invoiceData.customer.customerType === "business") {
      doc.text(
        `RUC: ${invoiceData.customer.ruc || ""}`,
        pageWidth - margin - 60,
        margin + 37
      );
      doc.text(
        `Dirección: ${invoiceData.customer.address || ""}`,
        pageWidth - margin - 60,
        margin + 42
      );
    } else {
      doc.text(
        `Cédula: ${invoiceData.customer.idNumber || ""}`,
        pageWidth - margin - 60,
        margin + 37
      );
    }

    if (invoiceData.customer.email) {
      doc.text(
        `Email: ${invoiceData.customer.email}`,
        pageWidth - margin - 60,
        margin + 47
      );
    }

    if (invoiceData.customer.phone) {
      doc.text(
        `Teléfono: ${invoiceData.customer.phone}`,
        pageWidth - margin - 60,
        margin + 52
      );
    }

    // Información de pago en efectivo si aplica
    if (invoiceData.paymentMethod === "Efectivo" && invoiceData.cashReceived) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Efectivo Recibido: $${invoiceData.cashReceived.toFixed(2)}`,
        margin,
        margin + 57
      );
      doc.text(
        `Cambio: $${invoiceData.change?.toFixed(2) || "0.00"}`,
        margin,
        margin + 62
      );
    }

    // Tabla de productos
    const tableStartY = margin + 70;

    // Preparar los datos para la tabla
    const tableHeaders = [
      ["Producto", "Categoría", "Precio Unit.", "Cantidad", "Total"],
    ];

    const tableData = invoiceData.items.map((item) => [
      item.name,
      item.category,
      `$${item.price.toFixed(2)}`,
      item.quantity.toString(),
      `$${(item.price * item.quantity).toFixed(2)}`,
    ]);

    // Crear la tabla
    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: tableStartY,
      margin: { left: margin, right: margin },
      headStyles: { fillColor: [22, 163, 74], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 20, halign: "right" },
        4: { cellWidth: 25, halign: "right" },
      },
    });

    // Obtener la posición Y después de la tabla
    const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 100;

    // Resumen de totales
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", pageWidth - margin - 50, finalY);
    doc.text(
      `$${invoiceData.subtotal.toFixed(2)}`,
      pageWidth - margin,
      finalY,
      {
        align: "right",
      }
    );

    doc.text("IVA (12%):", pageWidth - margin - 50, finalY + 5);
    doc.text(`$${invoiceData.tax.toFixed(2)}`, pageWidth - margin, finalY + 5, {
      align: "right",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", pageWidth - margin - 50, finalY + 12);
    doc.text(
      `$${invoiceData.total.toFixed(2)}`,
      pageWidth - margin,
      finalY + 12,
      { align: "right" }
    );

    // Pie de página
    const footerY = pageHeight - margin;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("¡Gracias por su compra!", pageWidth / 2, footerY - 10, {
      align: "center",
    });
    doc.text(
      "Esta factura fue generada electrónicamente por LubriSmart",
      pageWidth / 2,
      footerY - 5,
      { align: "center" }
    );

    // Guardar el PDF
    doc.save(`factura-${invoiceData.invoiceNumber}.pdf`);

    return true;
  } catch (error) {
    console.error("Error generando PDF:", error);
    return false;
  }
};

export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const time = String(now.getTime()).slice(-6);

  return `INV-${year}${month}${day}-${time}`;
};
