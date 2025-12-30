"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Package, Save } from "lucide-react";
import { motion } from "framer-motion";

import { toast } from "sonner";
import { api, Product, classifyProductCategory } from "@/lib/api";
import { productSchema } from "@/lib/validation";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onProductSaved?: () => void; // Prop opcional añadida
}

export function AddProductModal({
  isOpen,
  onClose,
  product,
  onProductSaved,
}: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    maxStock: "",
    sku: "",
    barcode: "",
    supplier: "",
    location: "",
    description: "",
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        maxStock: product.maxStock.toString(),
        sku: product.sku,
        barcode: product.barcode || "",
        supplier: product.supplier,
        location: product.location,
        description: "",
        status: product.status,
      });
    } else {
      setFormData({
        name: "",
        brand: "",
        category: "",
        price: "",
        cost: "",
        stock: "",
        minStock: "",
        maxStock: "",
        sku: "",
        barcode: "",
        supplier: "",
        location: "",
        description: "",
        status: "active",
      });
    }
  }, [product]);

  useEffect(() => {
    const res = classifyProductCategory({
      name: formData.name,
      brand: formData.brand,
      sku: formData.sku,
      supplier: formData.supplier,
    });
    setFormData((prev) => ({ ...prev, category: res.category }));
  }, [formData.name, formData.brand, formData.sku, formData.supplier]);

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const data = await api.getSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error("Error cargando proveedores:", error);
      } finally {
        setLoadingSuppliers(false);
      }
    };
    loadSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = productSchema.safeParse({
      ...formData,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = String(err.path[0] ?? "general");
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }
    setErrors({});

    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        product
          ? "Producto actualizado exitosamente"
          : "Producto creado exitosamente"
      );
      if (onProductSaved) onProductSaved();
      onClose();
    }, 800);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name") {
        const shouldSetSku = !next.sku;
        const shouldSetBarcode = !next.barcode;
        if (shouldSetSku) {
          const words = value.trim().split(/\s+/);
          const brandCode = (words[0] || "").substring(0, 3).toUpperCase();
          const match = value.toUpperCase().match(/(\d{1,2}W)[ -]?(\d{1,2})/);
          const gradeCode = match ? `${match[1]}${match[2]}` : "GEN";
          const suffix = String(Math.floor(100 + Math.random() * 900));
          next.sku = `${brandCode}-${gradeCode}-${suffix}`;
        }
        if (shouldSetBarcode) {
          const base = Date.now().toString();
          const random = String(Math.floor(1000000000000 + Math.random() * 899999999999));
          next.barcode = (base + random).slice(0, 13);
        }
      }
      return next;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 mx-auto my-4">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Package className="h-5 w-5 sm:h-6 sm:w-6" />
            {product ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base text-foreground uppercase tracking-wide border-b pb-2">
              Información Básica
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre del Producto *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ej: Aceite Mobil 1 5W-30"
                  required
                  className="h-10 text-sm"
                />
                {errors.name && (
                  <p className="text-destructive text-sm">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-sm font-medium">
                  Marca *
                </Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  placeholder="Ej: Mobil"
                  required
                  className="h-10 text-sm"
                />
                {errors.brand && (
                  <p className="text-destructive text-sm">{errors.brand}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Categoría *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aceites" className="text-sm">
                      Aceites
                    </SelectItem>
                    <SelectItem value="filtros" className="text-sm">
                      Filtros
                    </SelectItem>
                    <SelectItem value="lubricantes" className="text-sm">
                      Lubricantes
                    </SelectItem>
                    <SelectItem value="aditivos" className="text-sm">
                      Aditivos
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-destructive text-sm">{errors.category}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Estado
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active" className="text-sm">
                      Activo
                    </SelectItem>
                    <SelectItem value="inactive" className="text-sm">
                      Inactivo
                    </SelectItem>
                    <SelectItem value="discontinued" className="text-sm">
                      Descontinuado
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-destructive text-sm">{errors.status}</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Pricing */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base text-foreground uppercase tracking-wide border-b pb-2">
              Precios
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-sm font-medium">
                  Costo *
                </Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  placeholder="0.00"
                  required
                  className="h-10 text-sm"
                />
                {errors.cost && (
                  <p className="text-destructive text-sm">{errors.cost}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Precio de Venta *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                  required
                  className="h-10 text-sm"
                />
                {errors.price && (
                  <p className="text-destructive text-sm">{errors.price}</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Inventory */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base text-foreground uppercase tracking-wide border-b pb-2">
              Inventario
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-medium">
                  Stock Actual *
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  placeholder="0"
                  required
                  className="h-10 text-sm"
                />
                {errors.stock && (
                  <p className="text-destructive text-sm">{errors.stock}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock" className="text-sm font-medium">
                  Stock Mínimo *
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) =>
                    handleInputChange("minStock", e.target.value)
                  }
                  placeholder="0"
                  required
                  className="h-10 text-sm"
                />
                {errors.minStock && (
                  <p className="text-destructive text-sm">{errors.minStock}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStock" className="text-sm font-medium">
                  Stock Máximo *
                </Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) =>
                    handleInputChange("maxStock", e.target.value)
                  }
                  placeholder="0"
                  required
                  className="h-10 text-sm"
                />
                {errors.maxStock && (
                  <p className="text-destructive text-sm">{errors.maxStock}</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Additional Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base text-foreground uppercase tracking-wide border-b pb-2">
              Información Adicional
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium">
                  SKU *
                </Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="Ej: MOB-5W30-001"
                  required
                  className="h-10 text-sm"
                />
                {errors.sku && (
                  <p className="text-destructive text-sm">{errors.sku}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-sm font-medium">
                  Código de Barras
                </Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                  placeholder="Opcional"
                  className="h-10 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-sm font-medium">
                  Proveedor *
                </Label>
                <Select
                  value={formData.supplier}
                  onValueChange={(value) => handleInputChange("supplier", value)}
                >
                  <SelectTrigger id="supplier" className="h-10 text-sm">
                    <SelectValue placeholder={loadingSuppliers ? "Cargando..." : "Seleccionar proveedor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.name} className="text-sm">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supplier && (
                  <p className="text-destructive text-sm">{errors.supplier}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Ubicación *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Ej: A1-B2"
                  required
                  className="h-10 text-sm"
                />
                {errors.location && (
                  <p className="text-destructive text-sm">{errors.location}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Descripción opcional del producto..."
                rows={3}
                className="text-sm min-h-[80px] resize-vertical"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
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
              className="flex-1 h-11 text-sm font-medium bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {product ? "Actualizar" : "Crear"} Producto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
