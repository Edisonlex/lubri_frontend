"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { usePOS } from "@/contexts/pos-context";
import { SupplierForm } from "./supplier-form";
import { SupplierFilters } from "./supplier-filters";
import { SupplierList } from "./supplier-list";
import { SupplierDetail } from "./supplier-detail";
import { SupplierFormData } from "./types";

export function SupplierManagement() {
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    loadingSuppliers,
    errorSuppliers,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Función para obtener datos extendidos desde el campo notes
  const getExtendedData = (supplier: any) => {
    if (!supplier || !supplier.notes) return {};

    try {
      if (typeof supplier.notes === "string") {
        const trimmedNotes = supplier.notes.trim();
        if (trimmedNotes.startsWith("{") && trimmedNotes.endsWith("}")) {
          const parsed = JSON.parse(supplier.notes);
          return parsed;
        } else if (trimmedNotes.startsWith("[") && trimmedNotes.endsWith("]")) {
          const parsed = JSON.parse(supplier.notes);
          return parsed;
        }
        return { additionalNotes: supplier.notes };
      } else if (typeof supplier.notes === "object") {
        return supplier.notes;
      }
    } catch (error) {
      console.error("Error parsing extended data:", error);
      return { additionalNotes: supplier.notes };
    }

    return {};
  };

  const getSupplierField = (supplier: any, field: string) => {
    const extendedData = getExtendedData(supplier);
    return supplier[field] || extendedData[field] || "";
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const extendedData = getExtendedData(supplier);

    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extendedData.businessName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery) ||
      extendedData.taxId?.includes(searchQuery);

    const matchesCategory =
      filterCategory === "all" || supplier.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || supplier.status === filterStatus;
    const matchesCity =
      filterCity === "all" || extendedData.city === filterCity;

    return matchesSearch && matchesCategory && matchesStatus && matchesCity;
  });

  const handleOpenForm = (supplier?: any) => {
    if (supplier) {
      const extendedData = getExtendedData(supplier);
      setEditingSupplier(supplier);
    } else {
      setEditingSupplier(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  const handleViewSupplier = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsDetailOpen(true);
  };

  const handleSubmitForm = async (formData: SupplierFormData) => {
    setIsFormLoading(true);

    try {
      const supplierData = {
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        category: formData.category,
        status: formData.status as "active" | "inactive",
        notes:
          formData.businessName ||
          formData.city ||
          formData.taxId ||
          formData.contactPhone ||
          formData.website ||
          formData.paymentTerms ||
          formData.deliveryTime ||
          formData.minimumOrder ||
          formData.rating !== 5
            ? JSON.stringify({
                businessName: formData.businessName,
                city: formData.city,
                taxId: formData.taxId,
                contactPhone: formData.contactPhone,
                website: formData.website,
                paymentTerms: formData.paymentTerms,
                deliveryTime: formData.deliveryTime,
                minimumOrder: formData.minimumOrder,
                rating: formData.rating,
                additionalNotes: formData.notes,
              })
            : formData.notes || "",
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
        toast.success("Proveedor actualizado correctamente");
      } else {
        await addSupplier(supplierData);
        toast.success("Proveedor creado correctamente");
      }
      handleCloseForm();
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error("Error al guardar el proveedor");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      await deleteSupplier(supplierId);
      toast.success("Proveedor eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el proveedor");
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterStatus("all");
    setFilterCity("all");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    filterCategory !== "all" ||
    filterStatus !== "all" ||
    filterCity !== "all";

  if (loadingSuppliers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  if (errorSuppliers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Error al cargar proveedores</p>
          <p className="text-sm text-muted-foreground mt-2">{errorSuppliers}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
          <p className="text-muted-foreground">
            Administra la información de tus proveedores y sus productos
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Filters */}
      <SupplierFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterCity={filterCity}
        onCityChange={setFilterCity}
        onClearAll={clearAllFilters}
      />

      {/* Suppliers List */}
      <SupplierList
        suppliers={filteredSuppliers}
        onViewSupplier={handleViewSupplier}
        onEditSupplier={handleOpenForm}
        onDeleteSupplier={handleDeleteSupplier}
        getSupplierField={getSupplierField}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
      />

      {/* Form Dialog */}
      <SupplierForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        editingSupplier={editingSupplier}
        isLoading={isFormLoading}
      />

      {/* Detail Dialog */}
      <SupplierDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        supplier={selectedSupplier}
        getSupplierField={getSupplierField}
      />
    </div>
  );
}
