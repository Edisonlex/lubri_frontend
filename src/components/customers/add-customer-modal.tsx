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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building2, Car, Plus, Trash2, Save } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Customer, Vehicle } from "@/lib/api";
import { usePOS } from "@/contexts/pos-context";
import { customerFormSchema, plateRegex } from "@/lib/validation";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSave?: (customer: Customer) => void;
}

export function AddCustomerModal({
  isOpen,
  onClose,
  customer,
  onSave,
}: AddCustomerModalProps) {
  const { addCustomer, updateCustomer } = usePOS();
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    idNumber: "",
    customerType: "individual" as "individual" | "business",
    businessName: "",
    ruc: "",
    notes: "",
    preferredContact: "phone" as "phone" | "email" | "whatsapp",
    status: "active" as "active" | "inactive",
  });

  const [vehicles, setVehicles] = useState<Omit<Vehicle, "id">[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setCustomerData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        idNumber: customer.idNumber,
        customerType: customer.customerType,
        businessName: customer.businessName || "",
        ruc: customer.ruc || "",
        notes: customer.notes,
        preferredContact: customer.preferredContact,
        status: customer.status,
      });
      setVehicles(customer.vehicles.map(({ id, ...vehicle }) => vehicle));
    } else {
      setCustomerData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        idNumber: "",
        customerType: "individual",
        businessName: "",
        ruc: "",
        notes: "",
        preferredContact: "phone",
        status: "active",
      });
      setVehicles([]);
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = customerFormSchema.safeParse({
        ...customerData,
        vehicles: vehicles.map((v) => ({
          brand: v.brand,
          model: v.model,
          year: v.year,
          plate: v.plate,
          engine: v.engine || "",
          mileage: v.mileage || 0,
          lastService: v.lastService || "",
          nextService: v.nextService || "",
          oilType: v.oilType || "",
          filterType: v.filterType || "",
          color: v.color || "",
        })),
      });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const key = String(err.path.join(".") || "general");
          fieldErrors[key] = err.message;
        });
        setErrors(fieldErrors);
        toast.error("Revisa los campos marcados y corrige los datos");
        return;
      }
      setErrors({});
      if (customer) {
        // Actualización de cliente existente
        const updatedVehicles = vehicles.map((vehicle, index) => ({
          id: customer.vehicles[index]?.id || `vehicle-${Date.now()}-${index}`,
          ...vehicle,
        }));
        const updatedCustomer: Partial<Customer> = {
          ...customerData,
          vehicles: updatedVehicles,
        };
        const result = await updateCustomer(customer.id, updatedCustomer);
        toast.success("Cliente actualizado exitosamente");
        // Opcionalmente notificar hacia arriba
        if (onSave) onSave(result);
      } else {
        // Creación de nuevo cliente
        const newCustomer = {
          ...result.data,
          vehicles: vehicles.map((vehicle, index) => ({
            id: `vehicle-${Date.now()}-${index}`,
            ...vehicle,
          })),
          totalPurchases: 0,
          lastPurchase: new Date().toISOString().split("T")[0],
          registrationDate: new Date().toISOString().split("T")[0],
        } as Omit<Customer, "id">;

        const created = await addCustomer(newCustomer);
        toast.success("Cliente creado exitosamente");
        if (onSave) onSave(created);
      }
      onClose();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error("Error al guardar el cliente");
    } finally {
      setIsLoading(false);
    }
  };

  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        plate: "",
        engine: "",
        mileage: 0,
        lastService: "",
        nextService: "",
        oilType: "",
        filterType: "",
        color: "",
      },
    ]);
  };

  const removeVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const updateVehicle = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setVehicles(
      vehicles.map((vehicle, i) =>
        i === index ? { ...vehicle, [field]: value } : vehicle
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[95vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            {customer ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="customer" className="space-y-4 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11 p-1">
              <TabsTrigger
                value="customer"
                className="text-xs sm:text-sm px-2 py-2"
              >
                Información del Cliente
              </TabsTrigger>
              <TabsTrigger
                value="vehicles"
                className="text-xs sm:text-sm px-2 py-2"
              >
                Vehículos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="space-y-4 sm:space-y-6">
              {/* Customer Type */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                  Tipo de Cliente
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Button
                    type="button"
                    variant={
                      customerData.customerType === "individual"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setCustomerData({
                        ...customerData,
                        customerType: "individual",
                      })
                    }
                    className="h-12 sm:h-14 flex flex-col gap-1 text-xs sm:text-sm py-2"
                  >
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    Individual
                  </Button>
                  <Button
                    type="button"
                    variant={
                      customerData.customerType === "business"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setCustomerData({
                        ...customerData,
                        customerType: "business",
                      })
                    }
                    className="h-12 sm:h-14 flex flex-col gap-1 text-xs sm:text-sm py-2"
                  >
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    Empresa
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs sm:text-sm">
                      {customerData.customerType === "individual"
                        ? "Nombre Completo"
                        : "Razón Social"}{" "}
                      *
                    </Label>
                    <Input
                      id="name"
                      value={customerData.name}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          name: e.target.value,
                        })
                      }
                      placeholder={
                        customerData.customerType === "individual"
                          ? "Juan Pérez"
                          : "Empresa de Transportes S.A."
                      }
                      required
                      className="h-9 sm:h-10 text-sm"
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="text-xs sm:text-sm">
                      {customerData.customerType === "individual"
                        ? "Cédula"
                        : "RUC"}{" "}
                      *
                    </Label>
                    <Input
                      id="idNumber"
                      value={customerData.idNumber}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          idNumber: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder={
                        customerData.customerType === "individual"
                          ? "1712345678"
                          : "1792345678001"
                      }
                      required
                      className="h-9 sm:h-10 text-sm"
                    />
                    {errors.idNumber && (
                      <p className="text-destructive text-sm">{errors.idNumber}</p>
                    )}
                  </div>
                  {customerData.customerType === "business" && (
                    <>
                      <div className="space-y-2">
                        <Label
                          htmlFor="businessName"
                          className="text-xs sm:text-sm"
                        >
                          Nombre Comercial
                        </Label>
                        <Input
                          id="businessName"
                          value={customerData.businessName}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              businessName: e.target.value,
                            })
                          }
                          placeholder="Transportes García"
                          className="h-9 sm:h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ruc" className="text-xs sm:text-sm">
                          RUC
                        </Label>
                      <Input
                        id="ruc"
                        value={customerData.ruc}
                          onChange={(e) =>
                            setCustomerData({
                              ...customerData,
                              ruc: e.target.value.replace(/\D/g, ""),
                            })
                          }
                          placeholder="1792345678001"
                        className="h-9 sm:h-10 text-sm"
                      />
                      {errors.ruc && (
                        <p className="text-destructive text-sm">{errors.ruc}</p>
                      )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs sm:text-sm">
                      Teléfono *
                    </Label>
                    <Input
                      id="phone"
                      value={customerData.phone}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          phone: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="+593 99 123 4567"
                      required
                      className="h-9 sm:h-10 text-sm"
                    />
                    {errors.phone && (
                      <p className="text-destructive text-sm">{errors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerData.email}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          email: e.target.value.trim(),
                        })
                      }
                      placeholder="cliente@email.com"
                      required
                      className="h-9 sm:h-10 text-sm"
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs sm:text-sm">
                      Dirección *
                    </Label>
                    <Input
                      id="address"
                      value={customerData.address}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          address: e.target.value,
                        })
                      }
                      placeholder="Av. Amazonas 123"
                      required
                      className="h-9 sm:h-10 text-sm"
                    />
                    {errors.address && (
                      <p className="text-destructive text-sm">{errors.address}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs sm:text-sm">
                      Ciudad *
                    </Label>
                    <Input
                      id="city"
                      value={customerData.city}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const value = raw
                          ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
                          : "";
                        setCustomerData({ ...customerData, city: value });
                      }}
                      placeholder="La Maná"
                      required
                      className="h-9 sm:h-10 text-sm"
                    />
                    {errors.city && (
                      <p className="text-destructive text-sm">{errors.city}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="preferredContact"
                        className="text-xs sm:text-sm"
                      >
                        Contacto Preferido
                      </Label>
                      <Select
                        value={customerData.preferredContact}
                        onValueChange={(
                          value: "phone" | "email" | "whatsapp"
                        ) =>
                          setCustomerData({
                            ...customerData,
                            preferredContact: value,
                          })
                        }
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Teléfono</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-xs sm:text-sm">
                        Estado
                      </Label>
                      <Select
                        value={customerData.status}
                        onValueChange={(value: "active" | "inactive") =>
                          setCustomerData({ ...customerData, status: value })
                        }
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-xs sm:text-sm">
                      Notas
                    </Label>
                    <Textarea
                      id="notes"
                      value={customerData.notes}
                      onChange={(e) =>
                        setCustomerData({
                          ...customerData,
                          notes: e.target.value,
                        })
                      }
                      placeholder="Información adicional sobre el cliente..."
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-medium text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                  Vehículos
                </h3>
                <Button
                  type="button"
                  onClick={addVehicle}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  Agregar Vehículo
                </Button>
              </div>

              <div className="space-y-4">
                {vehicles.map((vehicle, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="sm:border sm:shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-sm sm:text-base">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <span className="truncate">
                              Vehículo {index + 1}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVehicle(index)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Marca *
                              </Label>
                              <Input
                                value={vehicle.brand}
                                onChange={(e) =>
                                  updateVehicle(index, "brand", e.target.value)
                                }
                                placeholder="Toyota"
                                required
                                className="h-8 sm:h-9 text-sm"
                              />
                              {errors[`vehicles.${index}.brand`] && (
                                <p className="text-destructive text-sm">{errors[`vehicles.${index}.brand`]}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Modelo *
                              </Label>
                              <Input
                                value={vehicle.model}
                                onChange={(e) =>
                                  updateVehicle(index, "model", e.target.value)
                                }
                                placeholder="Corolla"
                                required
                                className="h-8 sm:h-9 text-sm"
                              />
                              {errors[`vehicles.${index}.model`] && (
                                <p className="text-destructive text-sm">{errors[`vehicles.${index}.model`]}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Año *
                              </Label>
                              <Input
                                type="number"
                                value={vehicle.year}
                                onChange={(e) =>
                                  updateVehicle(
                                    index,
                                    "year",
                                    Number.parseInt(e.target.value) ||
                                      new Date().getFullYear()
                                  )
                                }
                                placeholder="2020"
                                required
                                className="h-8 sm:h-9 text-sm"
                              />
                              {errors[`vehicles.${index}.year`] && (
                                <p className="text-destructive text-sm">{errors[`vehicles.${index}.year`]}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Placa *
                              </Label>
                              <Input
                                value={vehicle.plate}
                                onChange={(e) =>
                                  updateVehicle(
                                    index,
                                    "plate",
                                    e.target.value.toUpperCase().trim()
                                  )
                                }
                                placeholder="ABC-1234"
                                required
                                className="h-8 sm:h-9 text-sm"
                              />
                              {errors[`vehicles.${index}.plate`] && (
                                <p className="text-destructive text-sm">{errors[`vehicles.${index}.plate`]}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Motor
                              </Label>
                              <Input
                                value={vehicle.engine}
                                onChange={(e) =>
                                  updateVehicle(index, "engine", e.target.value)
                                }
                                placeholder="1.8L"
                                className="h-8 sm:h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Kilometraje
                              </Label>
                              <Input
                                type="number"
                                value={vehicle.mileage}
                                onChange={(e) =>
                                  updateVehicle(
                                    index,
                                    "mileage",
                                    Number.parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder="45000"
                                className="h-8 sm:h-9 text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Tipo de Aceite
                              </Label>
                              <Input
                                value={vehicle.oilType}
                                onChange={(e) =>
                                  updateVehicle(
                                    index,
                                    "oilType",
                                    e.target.value
                                  )
                                }
                                placeholder="5W-30"
                                className="h-8 sm:h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Tipo de Filtro
                              </Label>
                              <Input
                                value={vehicle.filterType}
                                onChange={(e) =>
                                  updateVehicle(
                                    index,
                                    "filterType",
                                    e.target.value
                                  )
                                }
                                placeholder="Toyota Original"
                                className="h-8 sm:h-9 text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Último Servicio
                              </Label>
                              <Input
                                type="date"
                                value={vehicle.lastService}
                                onChange={(e) =>
                                  updateVehicle(
                                    index,
                                    "lastService",
                                    e.target.value
                                  )
                                }
                                className="h-8 sm:h-9 text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm">
                                Próximo Servicio
                              </Label>
                              <Input
                                type="date"
                                value={vehicle.nextService}
                                onChange={(e) =>
                                  updateVehicle(
                                    index,
                                    "nextService",
                                    e.target.value
                                  )
                                }
                                className="h-8 sm:h-9 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {vehicles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base mb-2">
                      No hay vehículos agregados
                    </p>
                    <p className="text-xs sm:text-sm">
                      Haz clic en "Agregar Vehículo" para comenzar
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent h-9 sm:h-10 text-sm px-3"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-9 sm:h-10 text-sm px-3"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              )}
              {customer ? "Actualizar" : "Crear"} Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
