"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Package,
  Calendar,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { supplierCategories, paymentTermsOptions } from "./types";

interface SupplierDetailProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: any;
  getSupplierField: (supplier: any, field: string) => any;
}

export function SupplierDetail({
  isOpen,
  onClose,
  supplier,
  getSupplierField,
}: SupplierDetailProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "inactive":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (!supplier) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {supplier.name}
          </DialogTitle>
          <DialogDescription>
            Información detallada del proveedor
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Nombre
                </Label>
                <p className="text-sm">{supplier.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Estado
                </Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getStatusBadgeVariant(supplier.status)}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(supplier.status)}
                    {supplier.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
              {getSupplierField(supplier, "businessName") && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Razón Social
                  </Label>
                  <p className="text-sm">
                    {getSupplierField(supplier, "businessName")}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Email
                </Label>
                <p className="text-sm">{supplier.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Teléfono
                </Label>
                <p className="text-sm">{supplier.phone}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Persona de Contacto
                </Label>
                <p className="text-sm">{supplier.contactPerson}</p>
              </div>
              {getSupplierField(supplier, "city") && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Ciudad
                  </Label>
                  <p className="text-sm">
                    {getSupplierField(supplier, "city")}
                  </p>
                </div>
              )}
              {getSupplierField(supplier, "contactPhone") && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Teléfono de contacto adicional
                  </Label>
                  <p className="text-sm">
                    {getSupplierField(supplier, "contactPhone")}
                  </p>
                </div>
              )}
              {getSupplierField(supplier, "website") && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Sitio web
                  </Label>
                  <p className="text-sm">
                    {getSupplierField(supplier, "website")}
                  </p>
                </div>
              )}
              {supplier.category && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Categoría
                  </Label>
                  <p className="text-sm">
                    {supplierCategories.find(
                      (cat) => cat.value === supplier.category
                    )?.label || supplier.category}
                  </p>
                </div>
              )}
              {getSupplierField(supplier, "paymentTerms") && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Términos de pago
                  </Label>
                  <p className="text-sm">
                    {paymentTermsOptions.find(
                      (term) =>
                        term.value ===
                        getSupplierField(supplier, "paymentTerms")
                    )?.label || getSupplierField(supplier, "paymentTerms")}
                  </p>
                </div>
              )}
              {getSupplierField(supplier, "deliveryTime") && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Tiempo de entrega
                  </Label>
                  <p className="text-sm">
                    {getSupplierField(supplier, "deliveryTime")}
                  </p>
                </div>
              )}
              {getSupplierField(supplier, "minimumOrder") > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Pedido mínimo
                  </Label>
                  <p className="text-sm">
                    {formatCurrency(
                      Number(getSupplierField(supplier, "minimumOrder"))
                    )}
                  </p>
                </div>
              )}
              {getSupplierField(supplier, "rating") && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Calificación
                  </Label>
                  <div className="flex items-center gap-1">
                    {renderStars(Number(getSupplierField(supplier, "rating")))}
                    <span className="text-sm text-muted-foreground ml-1">
                      ({getSupplierField(supplier, "rating")}/5)
                    </span>
                  </div>
                </div>
              )}
              <div className="col-span-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Dirección
                </Label>
                <p className="text-sm">{supplier.address || "No registrada"}</p>
              </div>
              {getSupplierField(supplier, "additionalNotes") && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Notas
                  </Label>
                  <p className="text-sm">
                    {getSupplierField(supplier, "additionalNotes")}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Catálogo de productos próximamente</p>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Historial de pedidos próximamente</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
