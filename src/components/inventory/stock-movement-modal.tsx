"use client";

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
import { Product } from "@/lib/api";
import { api } from "@/lib/api"; // Cambiado a importar api en lugar de createStockMovement
import { toast } from "sonner";
import { stockMovementSchema } from "@/lib/validation";

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export function StockMovementModal({
  isOpen,
  onClose,
  product,
}: StockMovementModalProps) {
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("entry");
  const [reason, setReason] = useState(""); // Cambiado de notes a reason
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const parseResult = stockMovementSchema.safeParse({
      type,
      quantity,
      reason,
    });
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.errors.forEach((err) => {
        const key = String(err.path[0] ?? "general");
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      // Convertir a número y validar
      const numQuantity = parseInt(quantity);
      if (isNaN(numQuantity) || numQuantity <= 0) {
        toast.error("La cantidad debe ser un número positivo");
        return;
      }

      // Mapear tipos del formulario a tipos de la API
      const typeMap: Record<string, "entrada" | "salida" | "ajuste"> = {
        entry: "entrada",
        sale: "salida",
        adjustment: "ajuste",
        return: "entrada", // Las devoluciones se manejan como entradas
      };

      // Crear el movimiento usando la API
      await api.createStockMovement({
        productId: product.id,
        quantity: type === "sale" ? -numQuantity : numQuantity,
        type: typeMap[type] || "entrada",
        reason,
        date: new Date().toISOString(),
        userId: "1", // ID de usuario por defecto
      });

      toast.success("Movimiento registrado correctamente");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      toast.error("Error al registrar el movimiento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setQuantity("");
    setType("entry");
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento de Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {product && (
            <div className="grid gap-2">
              <Label>Producto</Label>
              <div className="p-2 border rounded-md bg-muted/20">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Stock actual: {product.stock} unidades
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="type">Tipo de Movimiento</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entrada</SelectItem>
                <SelectItem value="sale">Venta</SelectItem>
                <SelectItem value="adjustment">Ajuste</SelectItem>
                <SelectItem value="return">Devolución</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-destructive text-sm">{errors.type}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
            />
            {errors.quantity && (
              <p className="text-destructive text-sm">{errors.quantity}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detalles adicionales sobre este movimiento"
              rows={3}
              required
            />
            {errors.reason && (
              <p className="text-destructive text-sm">{errors.reason}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
