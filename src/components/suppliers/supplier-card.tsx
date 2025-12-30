"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Package,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Truck,
  CheckCircle,
  AlertCircle,
  Star,
} from "lucide-react";
import { supplierCategories } from "./types";

interface SupplierCardProps {
  supplier: any;
  onView: (supplier: any) => void;
  onEdit: (supplier: any) => void;
  onDelete: (supplierId: string) => void;
  getSupplierField: (supplier: any, field: string) => any;
}

export function SupplierCard({
  supplier,
  onView,
  onEdit,
  onDelete,
  getSupplierField,
}: SupplierCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          {/* Header with status and actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <Badge
                variant={getStatusBadgeVariant(supplier.status)}
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                {getStatusIcon(supplier.status)}
                {supplier.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(supplier)}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(supplier)}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8">
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. El proveedor{" "}
                      <strong>{supplier.name}</strong> será eliminado
                      permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(supplier.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Supplier info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base sm:text-lg">{supplier.name}</h3>
            {getSupplierField(supplier, "businessName") && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {getSupplierField(supplier, "businessName")}
              </p>
            )}

            {/* Contact info - responsive layout */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">{supplier.email}</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{supplier.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Contacto: {supplier.contactPerson}</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">
                  {getSupplierField(supplier, "city") || "No especificada"}
                </span>
              </div>
            </div>

            {/* Additional info - conditional */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {supplier.category && (
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>
                    {supplierCategories.find(
                      (cat) => cat.value === supplier.category
                    )?.label || supplier.category}
                  </span>
                </div>
              )}

              {getSupplierField(supplier, "deliveryTime") && (
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span>
                    Entrega: {getSupplierField(supplier, "deliveryTime")}
                  </span>
                </div>
              )}

              {getSupplierField(supplier, "minimumOrder") > 0 && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>
                    Mín:{" "}
                    {formatCurrency(
                      Number(getSupplierField(supplier, "minimumOrder"))
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Rating */}
            {getSupplierField(supplier, "rating") && (
              <div className="flex items-center gap-1">
                {renderStars(Number(getSupplierField(supplier, "rating")))}
                <span className="text-xs text-muted-foreground ml-1">
                  ({getSupplierField(supplier, "rating")}/5)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
