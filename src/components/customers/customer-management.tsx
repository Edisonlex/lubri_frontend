"use client";

import { useState } from "react";
import { CustomerDetailModal } from "./customer-detail-modal";
import { AddCustomerModal } from "./add-customer-modal";
import { CustomerFilters } from "./customer-filters";
import { CustomersTable } from "./customers-table";
import { Customer, mockCustomers } from "@/lib/mock-data";
import { Button } from "../ui/button";

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [filters, setFilters] = useState({
    customerType: "all",
    status: "all",
    city: "all",
    search: "",
  });

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Handlers para los modales
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = (customer: Customer) => {
    // Lógica para guardar/actualizar
    if (customer.id.startsWith("customer-")) {
      // Nuevo cliente
      setCustomers([...customers, customer]);
    } else {
      // Editar cliente existente
      setCustomers(customers.map((c) => (c.id === customer.id ? customer : c)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header y botón */}
      <div className="flex justify-between items-center">
        <h1>Gestión de Clientes</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Nuevo Cliente</Button>
      </div>

      {/* Filtros */}
      <CustomerFilters filters={filters} setFilters={setFilters} />

      {/* Tabla */}
      <CustomersTable
        filters={filters}
        onViewCustomer={handleViewCustomer}
        onEditCustomer={handleEditCustomer}
        onMaintenanceReminder={(customer) => {
          setSelectedCustomer(customer);
          setIsReminderOpen(true);
        }}
      />

      {/* Modales */}
      <CustomerDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        customer={selectedCustomer}
        onEdit={handleEditCustomer}
      />

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />

    </div>
  );
}
