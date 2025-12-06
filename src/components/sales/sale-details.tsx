// src/components/ventas/sale-details.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sale } from "@/contexts/pos-context";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Download,
  User,
  FileText,
  Calendar,
  DollarSign,
  Package,
  X,
  Printer,
} from "lucide-react";

interface SaleDetailsProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadInvoice: (sale: Sale) => void;
  onPrintInvoice: (sale: Sale) => void;
}

export function SaleDetails({
  sale,
  isOpen,
  onClose,
  onDownloadInvoice,
  onPrintInvoice,
}: SaleDetailsProps) {
  if (!sale) return null;

  const getStatusVariant = (status: Sale["status"]) => {
    switch (status) {
      case "completada":
        return "default";
      case "pendiente":
        return "secondary";
      case "anulada":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles de Venta - {sale.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Factura
              </h3>
              <p className="font-mono font-bold">{sale.invoiceNumber}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Fecha
              </h3>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(parseISO(sale.date), "dd/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Estado
              </h3>
              <Badge
                variant={getStatusVariant(sale.status)}
                className="capitalize"
              >
                {sale.status}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Método de Pago
              </h3>
              <p className="flex items-center gap-2 capitalize">
                <DollarSign className="h-4 w-4" />
                {sale.paymentMethod}
              </p>
            </div>
          </div>

          {/* Información del Cliente */}
          {sale.customerName && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Cliente
                </h3>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{sale.customerName}</p>
                    {sale.customerId && (
                      <p className="text-sm text-muted-foreground">
                        ID: {sale.customerId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Productos */}
          <Separator />
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">
              Productos Vendidos
            </h3>
            <div className="space-y-3">
              {sale.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.unitPrice.toFixed(2)} x {item.quantity} unidades
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">${sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA (12%):</span>
              <span className="font-medium">${sale.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-primary">${sale.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Notas */}
          {sale.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Notas
                </h3>
                <p className="text-sm p-3 bg-muted rounded-lg">{sale.notes}</p>
              </div>
            </>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
            <Button onClick={() => onDownloadInvoice(sale)} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Descargar Factura
            </Button>
            <Button
              onClick={() => onPrintInvoice(sale)}
              variant="secondary"
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
