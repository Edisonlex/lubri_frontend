"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Search,
  X,
  UserPlus,
  UserCheck,
  Phone,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePOS, type Customer } from "@/contexts/pos-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddCustomerModal } from "../customers/add-customer-modal";


export function CustomerSelector() {
  const {
    customers,
    selectedCustomer,
    setSelectedCustomer,
    addCustomer,
    refreshCustomers,
  } = usePOS();
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveCustomer = async (customerData: Omit<Customer, "id">) => {
    try {
      if (editingCustomer) {
        // Editar cliente existente - necesitarías implementar updateCustomer en tu contexto
        console.log("Editando cliente:", editingCustomer.id, customerData);
        // await updateCustomer(editingCustomer.id, customerData);
      } else {
        // Crear nuevo cliente
        await addCustomer(customerData);
        await refreshCustomers(); // Actualizar la lista de clientes

        // Opcional: seleccionar automáticamente el nuevo cliente
        // const newCustomer = await addCustomer(customerData);
        // setSelectedCustomer(newCustomer);
      }

      setShowAddCustomer(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Error guardando cliente:", error);
    }
  };

  const handleAddNewCustomer = () => {
    setEditingCustomer(null); // Asegurar que estamos en modo creación
    setShowAddCustomer(true);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <User className="h-4 w-4" />
          Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedCustomer ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-green-800 dark:text-green-200 truncate">
                    {selectedCustomer.name}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {selectedCustomer.customerType === "business"
                      ? "Empresa"
                      : "Individual"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-green-600 dark:text-green-400">
                  {selectedCustomer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedCustomer.phone}
                    </span>
                  )}
                  {selectedCustomer.ruc && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      RUC: {selectedCustomer.ruc}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg"
              onClick={() => setSelectedCustomer(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <div
            className={`grid gap-3 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
          >
            <Dialog open={showCustomerList} onOpenChange={setShowCustomerList}>
              <DialogTrigger asChild>
                <Button
                  size={isMobile ? "default" : "lg"}
                  className="flex-1 h-12"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Seleccionar
                </Button>
              </DialogTrigger>
              <DialogContent
                className={`${isMobile ? "w-[95vw] max-w-md" : "sm:max-w-lg"}`}
              >
                <DialogHeader>
                  <DialogTitle className="text-lg">
                    Seleccionar Cliente
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nombre, teléfono o email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    <AnimatePresence>
                      {filteredCustomers.map((customer) => (
                        <motion.div
                          key={customer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 border border-border rounded-lg cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 group"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowCustomerList(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-foreground truncate">
                                  {customer.name}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {customer.customerType === "business"
                                    ? "Empresa"
                                    : "Individual"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {customer.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {customer.phone}
                                  </span>
                                )}
                                {customer.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {customer.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {filteredCustomers.length === 0 && searchQuery && (
                      <div className="text-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">
                          No se encontraron clientes
                        </p>
                        <p className="text-sm mt-1">
                          Intenta con otros términos de búsqueda
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Botón Nuevo Cliente - Ahora usa el mismo modal */}
            <Button
              variant="outline"
              size={isMobile ? "default" : "lg"}
              className="flex-1 h-12"
              onClick={handleAddNewCustomer}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Nuevo
            </Button>
          </div>
        )}

        {/* Modal de Agregar Cliente - Reutilizado */}
        <AddCustomerModal
          isOpen={showAddCustomer}
          onClose={() => {
            setShowAddCustomer(false);
            setEditingCustomer(null);
          }}
          customer={editingCustomer}
          onSave={handleSaveCustomer}
        />
      </CardContent>
    </Card>
  );
}
