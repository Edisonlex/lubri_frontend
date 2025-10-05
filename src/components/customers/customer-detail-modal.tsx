"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Building2,
  Car,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Edit,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import { Customer } from "@/lib/mock-data";

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEdit: (customer: Customer) => void;
}

// Mock purchase history
const mockPurchaseHistory = [
  {
    id: "1",
    date: "2024-01-15",
    products: ["Aceite Mobil 1 5W-30", "Filtro de Aceite"],
    total: 89.5,
    vehicle: "ABC-1234",
  },
  {
    id: "2",
    date: "2023-12-10",
    products: ["Aceite Shell Helix", "Aditivo Limpiador"],
    total: 65.75,
    vehicle: "ABC-1234",
  },
  {
    id: "3",
    date: "2023-10-05",
    products: ["Lubricante Castrol GTX"],
    total: 52.25,
    vehicle: "ABC-1234",
  },
];

export function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  onEdit,
}: CustomerDetailModalProps) {
  if (!customer) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isMaintenanceDue = (vehicle: any) => {
    const nextService = new Date(vehicle.nextService);
    const today = new Date();
    const daysUntilService = Math.ceil(
      (nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilService <= 7;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base md:text-lg">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold">
                  {customer.name}
                </h2>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {customer.customerType === "individual" ? (
                    <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                  )}
                  <span className="text-xs sm:text-sm text-muted-foreground capitalize">
                    {customer.customerType === "individual"
                      ? "Individual"
                      : "Empresa"}
                  </span>
                  <Badge
                    variant={
                      customer.status === "active" ? "default" : "secondary"
                    }
                    className="text-[10px] sm:text-xs px-1.5 sm:px-2.5"
                  >
                    {customer.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={() => onEdit(customer)}
              variant="outline"
              className="h-7 sm:h-8 md:h-9 text-xs sm:text-sm"
            >
              <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1 sm:mr-1.5 md:mr-2" />
              Editar
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
            <TabsTrigger value="info" className="text-xs sm:text-sm">
              Información
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="text-xs sm:text-sm">
              Vehículos
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{customer.phone}</p>
                      <p className="text-xs text-muted-foreground">
                        Preferido:{" "}
                        {customer.preferredContact === "phone"
                          ? "Teléfono"
                          : customer.preferredContact === "email"
                          ? "Email"
                          : "WhatsApp"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <p>{customer.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <div>
                      <p>{customer.address}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {customer.city}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              {customer.customerType === "business" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base">
                      Información Empresarial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Razón Social
                      </p>
                      <p className="font-medium">{customer.name}</p>
                    </div>
                    {customer.businessName && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Nombre Comercial
                        </p>
                        <p className="font-medium">{customer.businessName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">RUC</p>
                      <p className="font-medium">
                        {customer.ruc || customer.idNumber}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Purchase Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">
                    Resumen de Compras
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-base sm:text-lg">
                        ${customer.totalPurchases.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total en compras
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {new Date(customer.lastPurchase).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Última compra
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {new Date(
                          customer.registrationDate
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cliente desde
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {customer.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm sm:text-base">
                      Notas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-sm">{customer.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-4">
            {customer.vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.vehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                          <div className="flex items-center gap-2">
                            <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {vehicle.brand} {vehicle.model}
                          </div>
                          {isMaintenanceDue(vehicle) && (
                            <Badge variant="destructive" className="text-xs">
                              <Bell className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                              Mantenimiento
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Placa</p>
                            <p className="font-medium">{vehicle.plate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Año</p>
                            <p className="font-medium">{vehicle.year}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Motor</p>
                            <p className="font-medium">{vehicle.engine}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Kilometraje</p>
                            <p className="font-medium">
                              {vehicle.mileage.toLocaleString()} km
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Aceite</p>
                            <p className="font-medium">{vehicle.oilType}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Filtro</p>
                            <p className="font-medium">{vehicle.filterType}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Último Servicio
                            </p>
                            <p className="font-medium">
                              {new Date(
                                vehicle.lastService
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Próximo Servicio
                            </p>
                            <p
                              className={`font-medium ${
                                isMaintenanceDue(vehicle)
                                  ? "text-destructive"
                                  : ""
                              }`}
                            >
                              {new Date(
                                vehicle.nextService
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p>No hay vehículos registrados</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm sm:text-base">
                  Historial de Compras
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  {mockPurchaseHistory.map((purchase, index) => (
                    <motion.div
                      key={purchase.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 sm:p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(purchase.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {purchase.products.join(", ")} - {purchase.vehicle}
                        </p>
                      </div>
                      <p className="font-bold">${purchase.total}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
