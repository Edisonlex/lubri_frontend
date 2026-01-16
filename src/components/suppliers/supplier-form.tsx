"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supplierFormSchema } from "@/lib/validation";
import { useZodLiveForm } from "@/hooks/use-zod-form";
import {
  SupplierFormData,
  supplierCategories,
  paymentTermsOptions,
  cities,
} from "./types";

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  editingSupplier?: any;
  initialData?: SupplierFormData;
  isLoading?: boolean;
}

const initialFormData: SupplierFormData = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  category: "",
  status: "active",
  businessName: "",
  city: "",
  taxId: "",
  contactPhone: "",
  website: "",
  paymentTerms: "",
  deliveryTime: "",
  minimumOrder: 0,
  rating: 5,
  notes: "",
};

export function SupplierForm({
  isOpen,
  onClose,
  onSubmit,
  editingSupplier,
  initialData = initialFormData,
  isLoading = false,
}: SupplierFormProps) {
  const form = useZodLiveForm(supplierFormSchema, initialData);

  // Actualizar los datos del formulario cuando cambie initialData o se abra el diálogo
  useEffect(() => {
    if (isOpen) {
      form.setData(initialData);
    }
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const res = form.validate();
    if (!res.ok) {
      toast.error("Revisa los campos marcados en rojo");
      return false;
    }
    return true;
  };

  useEffect(() => {}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit(form.data);
  };

  const handleClose = () => {
    form.reset(initialData);
    onClose();
  };

  const hasErrors = Object.keys(form.errors).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
            </DialogTitle>
            <DialogDescription>
              {editingSupplier
                ? "Modifica la información del proveedor"
                : "Completa los datos para registrar un nuevo proveedor"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del proveedor *</Label>
                <p className="text-muted-foreground text-xs">
                  Mínimo 2 caracteres
                </p>
                <Input
                  id="name"
                  value={form.data.name}
                  onChange={(e) => form.setField("name", e.target.value.trim())}
                  placeholder="Nombre del proveedor"
                  required
                  aria-invalid={Boolean(form.errors.name)}
                  aria-describedby="name-help"
                  className={form.errors.name ? "border-destructive" : ""}
                />
                <span id="name-help" className="sr-only">
                  Nombre mínimo 2 caracteres
                </span>
                {form.errors.name && (
                  <p className="text-destructive text-sm font-medium">{form.errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Persona de contacto *</Label>
                <p className="text-muted-foreground text-xs">
                  Nombre del contacto principal
                </p>
                <Input
                  id="contactPerson"
                  value={form.data.contactPerson}
                  onChange={(e) =>
                    form.setField("contactPerson", e.target.value.trim())
                  }
                  placeholder="Nombre del contacto principal"
                  required
                  aria-invalid={Boolean(form.errors.contactPerson)}
                  aria-describedby="contactPerson-help"
                  className={form.errors.contactPerson ? "border-destructive" : ""}
                />
                <span id="contactPerson-help" className="sr-only">
                  Persona de contacto requerida
                </span>
                {form.errors.contactPerson && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.contactPerson}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <p className="text-muted-foreground text-xs">
                  Formato de correo válido (ej: usuario@dominio.com)
                </p>
                <Input
                  id="email"
                  type="email"
                  value={form.data.email}
                  onChange={(e) =>
                    form.setField("email", e.target.value.trim())
                  }
                  placeholder="proveedor@ejemplo.com"
                  required
                  aria-invalid={Boolean(form.errors.email)}
                  aria-describedby="email-help"
                  className={form.errors.email ? "border-destructive" : ""}
                />
                <span id="email-help" className="sr-only">
                  Email válido requerido
                </span>
                {form.errors.email && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <p className="text-muted-foreground text-xs">
                  Solo dígitos, código local o +593 (10 dígitos)
                </p>
                <Input
                  id="phone"
                  value={form.data.phone}
                  onChange={(e) =>
                    form.setField("phone", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0987654321"
                  required
                  aria-invalid={Boolean(form.errors.phone)}
                  aria-describedby="phone-help"
                  className={form.errors.phone ? "border-destructive" : ""}
                />
                <span id="phone-help" className="sr-only">
                  Teléfono ecuatoriano válido requerido
                </span>
                {form.errors.phone && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Razón Social</Label>
                <p className="text-muted-foreground text-xs">
                  Nombre legal de la empresa (opcional)
                </p>
                <Input
                  id="businessName"
                  value={form.data.businessName}
                  onChange={(e) =>
                    form.setField("businessName", e.target.value)
                  }
                  placeholder="Razón social de la empresa"
                  className={form.errors.businessName ? "border-destructive" : ""}
                />
                {form.errors.businessName && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.businessName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">RUC</Label>
                <p className="text-muted-foreground text-xs">
                  Debe ser un RUC ecuatoriano válido (13 dígitos)
                </p>
                <Input
                  id="taxId"
                  value={form.data.taxId}
                  onChange={(e) =>
                    form.setField("taxId", e.target.value.trim())
                  }
                  placeholder="1234567890001"
                  aria-invalid={Boolean(form.errors.taxId)}
                  aria-describedby="taxId-help"
                  className={form.errors.taxId ? "border-destructive" : ""}
                />
                <span id="taxId-help" className="sr-only">
                  RUC ecuatoriano válido
                </span>
                {form.errors.taxId && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.taxId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <p className="text-muted-foreground text-xs">
                  Ciudad principal de operaciones
                </p>
                <Select
                  value={form.data.city}
                  onValueChange={(value) => form.setField("city", value)}
                >
                  <SelectTrigger className={form.errors.city ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecciona una ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.city && (
                  <p className="text-destructive text-sm font-medium">{form.errors.city}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <p className="text-muted-foreground text-xs">
                  Tipo de productos que suministra
                </p>
                <Select
                  value={form.data.category}
                  onValueChange={(value) => form.setField("category", value)}
                  required
                >
                  <SelectTrigger className={form.errors.category ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.category && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.category}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <p className="text-muted-foreground text-xs">
                Dirección completa (Calle, Nro, Referencia)
              </p>
              <Textarea
                id="address"
                value={form.data.address}
                onChange={(e) => form.setField("address", e.target.value)}
                placeholder="Dirección completa del proveedor"
                rows={2}
                className={form.errors.address ? "border-destructive" : ""}
              />
              {form.errors.address && (
                <p className="text-destructive text-sm font-medium">
                  {form.errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">
                  Teléfono de contacto adicional
                </Label>
                <p className="text-muted-foreground text-xs">
                  Opcional. Solo dígitos.
                </p>
                <Input
                  id="contactPhone"
                  value={form.data.contactPhone}
                  onChange={(e) =>
                    form.setField(
                      "contactPhone",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="0987654321"
                  className={form.errors.contactPhone ? "border-destructive" : ""}
                />
                {form.errors.contactPhone && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.contactPhone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Sitio web</Label>
                <p className="text-muted-foreground text-xs">
                  Debe comenzar con http:// o https://
                </p>
                <Input
                  id="website"
                  value={form.data.website}
                  onChange={(e) =>
                    form.setField("website", e.target.value.trim())
                  }
                  placeholder="https://www.ejemplo.com"
                  aria-invalid={Boolean(form.errors.website)}
                  aria-describedby="website-help"
                  className={form.errors.website ? "border-destructive" : ""}
                />
                <span id="website-help" className="sr-only">
                  URL debe comenzar con http:// o https://
                </span>
                {form.errors.website && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.website}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Términos de pago</Label>
                <p className="text-muted-foreground text-xs">
                  Condiciones de crédito
                </p>
                <Select
                  value={form.data.paymentTerms}
                  onValueChange={(value) =>
                    form.setField("paymentTerms", value)
                  }
                >
                  <SelectTrigger className={form.errors.paymentTerms ? "border-destructive" : ""}>
                    <SelectValue placeholder="Selecciona términos" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTermsOptions.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.paymentTerms && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.paymentTerms}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Tiempo de entrega</Label>
                <p className="text-muted-foreground text-xs">
                  Estimado (ej: 3-5 días)
                </p>
                <Input
                  id="deliveryTime"
                  value={form.data.deliveryTime}
                  onChange={(e) =>
                    form.setField("deliveryTime", e.target.value.trim())
                  }
                  placeholder="ej: 3-5 días"
                  className={form.errors.deliveryTime ? "border-destructive" : ""}
                />
                {form.errors.deliveryTime && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.deliveryTime}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumOrder">Pedido mínimo ($)</Label>
                <p className="text-muted-foreground text-xs">
                  Solo números, mínimo 0
                </p>
                <Input
                  id="minimumOrder"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.data.minimumOrder}
                  onChange={(e) =>
                    form.setField(
                      "minimumOrder",
                      Math.max(0, parseFloat(e.target.value) || 0)
                    )
                  }
                  placeholder="0.00"
                  aria-invalid={Boolean(form.errors.minimumOrder)}
                  aria-describedby="minimumOrder-help"
                  className={form.errors.minimumOrder ? "border-destructive" : ""}
                />
                <span id="minimumOrder-help" className="sr-only">
                  Pedido mínimo debe ser ≥ 0
                </span>
                {form.errors.minimumOrder && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.minimumOrder}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Calificación (1-5)</Label>
                <p className="text-muted-foreground text-xs">
                  Evaluación del proveedor
                </p>
                <Select
                  value={form.data.rating?.toString() || "5"}
                  onValueChange={(value) =>
                    form.setField("rating", parseInt(value))
                  }
                >
                  <SelectTrigger className={form.errors.rating ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} estrella{rating !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.rating && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.rating}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <p className="text-muted-foreground text-xs">
                  Estado actual del proveedor
                </p>
                <Select
                  value={form.data.status}
                  onValueChange={(value: string) =>
                    form.setField("status", value)
                  }
                >
                  <SelectTrigger className={form.errors.status ? "border-destructive" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                {form.errors.status && (
                  <p className="text-destructive text-sm font-medium">
                    {form.errors.status}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <p className="text-muted-foreground text-xs">
                Información interna relevante
              </p>
              <Textarea
                id="notes"
                value={form.data.notes}
                onChange={(e) => form.setField("notes", e.target.value)}
                placeholder="Información adicional sobre el proveedor"
                rows={3}
                className={form.errors.notes ? "border-destructive" : ""}
              />
              {form.errors.notes && (
                <p className="text-destructive text-sm font-medium">{form.errors.notes}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || hasErrors}>
              {isLoading
                ? "Guardando..."
                : editingSupplier
                ? "Actualizar"
                : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
