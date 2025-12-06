// components/inventory/stock-adjustment-modal.tsx
"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Minus, Package } from "lucide-react";
import { motion } from "framer-motion";

import { toast } from "sonner";
import { useStockManagement } from "@/hooks/use-stock-management";
import { api } from "@/lib/api";
import { Product } from "@/lib/api";
import { stockAdjustmentSchema } from "@/lib/validation";

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onStockUpdated?: () => void; // Callback para actualizar la lista
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  product,
  onStockUpdated,
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<
    "add" | "subtract" | "set"
  >("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { updateProductStock } = useStockManagement();

  if (!product) return null;

  const currentStock = product.stock;
  const newStock =
    adjustmentType === "add"
      ? currentStock + Number.parseInt(quantity || "0")
      : adjustmentType === "subtract"
      ? Math.max(0, currentStock - Number.parseInt(quantity || "0"))
      : Number.parseInt(quantity || "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = stockAdjustmentSchema.safeParse({
      adjustmentType,
      quantity,
      reason,
      notes,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = String(err.path[0] ?? "general");
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    if (
      adjustmentType === "subtract" &&
      Number.parseInt(quantity) > currentStock
    ) {
      toast.error("No puede restar más stock del disponible");
      return;
    }

    setIsLoading(true);

    try {
      // Actualizar el stock del producto
      const success = await updateProductStock(
        product.id,
        newStock,
        product.minStock
      );

      if (success) {
        try {
          await api.createStockMovement({
            productId: product.id,
            type: "ajuste",
            quantity: Number.parseInt(quantity),
            reason: reason || "Ajuste manual",
            date: new Date().toISOString(),
            userId: "current-user-id",
            documentRef: `ADJ-${Date.now()}`,
          });
        } catch (err) {
          console.error("Error registrando ajuste:", err);
        }
        toast.success("Ajuste de stock realizado exitosamente");
        onClose();
        setQuantity("");
        setReason("");
        setNotes("");
        setAdjustmentType("add");

        // Llamar callback para actualizar la lista
        if (onStockUpdated) {
          onStockUpdated();
        }
      } else {
        toast.error("Error al actualizar el stock");
      }
    } catch (error) {
      console.error("Error en ajuste de stock:", error);
      toast.error("Error al realizar el ajuste de stock");
    } finally {
      setIsLoading(false);
    }
  };

  const adjustmentReasons = [
    "Recepción de mercancía",
    "Venta no registrada",
    "Producto dañado",
    "Inventario físico",
    "Devolución de cliente",
    "Transferencia entre ubicaciones",
    "Corrección de error",
    "Otro",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header fijo */}
        <DialogHeader className="p-4 sm:p-6 border-b bg-background sticky top-0 z-10">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Ajustar Stock
          </DialogTitle>
        </DialogHeader>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Product Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {product.sku}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Stock actual:
                </span>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  {currentStock} unidades
                </Badge>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Stock mínimo:
                </span>
                <Badge variant="outline" className="px-2 py-1 text-sm">
                  {product.minStock} unidades
                </Badge>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Adjustment Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de Ajuste</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={adjustmentType === "add" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("add")}
                  className="h-12 flex flex-col gap-1 px-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-xs">Agregar</span>
                </Button>
                <Button
                  type="button"
                  variant={
                    adjustmentType === "subtract" ? "default" : "outline"
                  }
                  onClick={() => setAdjustmentType("subtract")}
                  className="h-12 flex flex-col gap-1 px-2"
                >
                  <Minus className="h-4 w-4" />
                  <span className="text-xs">Quitar</span>
                </Button>
                <Button
                  type="button"
                  variant={adjustmentType === "set" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("set")}
                  className="h-12 flex flex-col gap-1 px-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">Establecer</span>
                </Button>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                {adjustmentType === "set" ? "Nuevo Stock" : "Cantidad"}
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                required
                className="h-10 text-sm"
              />
              {errors.quantity && (
                <p className="text-destructive text-sm">{errors.quantity}</p>
              )}
            </div>

            {/* Preview */}
            {quantity && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-muted rounded-lg border"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Nuevo stock:</span>
                  <Badge
                    variant={
                      newStock < product.minStock ? "destructive" : "default"
                    }
                    className="px-3 py-1 text-sm"
                  >
                    {newStock} unidades
                  </Badge>
                </div>
                {newStock < product.minStock && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    ⚠️ El stock quedará por debajo del mínimo
                  </p>
                )}
                {newStock >= product.minStock &&
                  currentStock < product.minStock && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      ✅ El stock ahora está por encima del mínimo
                    </p>
                  )}
              </motion.div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Motuto *
              </Label>
              <Select value={reason} onValueChange={setReason} required>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentReasons.map((reasonOption) => (
                    <SelectItem
                      key={reasonOption}
                      value={reasonOption}
                      className="text-sm"
                    >
                      {reasonOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reason && (
                <p className="text-destructive text-sm">{errors.reason}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notas Adicionales
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Información adicional sobre el ajuste..."
                rows={3}
                className="text-sm min-h-[80px] resize-vertical"
              />
            </div>
          </form>
        </div>

        {/* Footer fijo con botones */}
        <div className="p-4 sm:p-6 border-t bg-background sticky bottom-0 z-10">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 text-sm font-medium"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="flex-1 h-11 text-sm font-medium bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Procesando...
                </>
              ) : (
                "Confirmar Ajuste"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
