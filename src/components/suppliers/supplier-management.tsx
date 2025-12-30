"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useGIS } from "@/contexts/gis-context";

import { SupplierForm } from "./supplier-form";
import { SupplierFilters } from "./supplier-filters";
import { SupplierList } from "./supplier-list";
import { SupplierDetail } from "./supplier-detail";
import { SupplierFormData } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplierMap } from "@/components/gis/supplier-map";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";

import type { GeographicEntity } from "@/contexts/gis-context";

export function SupplierManagement() {
  const { suppliers: gisSuppliers, addEntity, removeEntity, updateEntity, getEnhancedCityCoordinates } = useGIS();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Sync GIS suppliers with local state
  useEffect(() => {
    if (gisSuppliers && gisSuppliers.length > 0) {
      setSuppliers(gisSuppliers);
    }
  }, [gisSuppliers]);

  const handleViewSupplier = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsDetailOpen(true);
  };

  // Handler para ver proveedor desde el mapa
  const handleViewSupplierFromMap = (entity: GeographicEntity) => {
    const supplier = suppliers.find((s) => s.id === entity.id) || entity;
    handleViewSupplier(supplier);
  };

  // Crear proveedor dentro del contexto GIS para mantener consistencia global
  const addSupplier = async (supplierData: any) => {
    const city = supplierData.city || "";
    const coords = city ? getEnhancedCityCoordinates(city) : undefined;

    const newSupplierEntity = {
      id: `supplier-${Date.now()}`,
      name: supplierData.name,
      type: "supplier" as const,
      coordinates: coords
        ? { lat: coords.lat, lng: coords.lng }
        : { lat: -0.22985, lng: -78.52495 }, // Quito como fallback
      address: supplierData.address || "",
      city: city,
      status: supplierData.status as "active" | "inactive",
      metadata: {
        contactPerson: supplierData.contactPerson,
        email: supplierData.email,
        phone: supplierData.phone,
        rating:
          typeof supplierData.rating === "number"
            ? supplierData.rating
            : 5,
      },
    };

    addEntity(newSupplierEntity);
  };

  // Actualizar proveedor en el contexto GIS (incluye coordenadas si cambia la ciudad)
  const updateSupplier = async (supplierId: string, supplierData: any) => {
    const city = supplierData.city || "";
    const coords = city ? getEnhancedCityCoordinates(city) : undefined;

    const patch: any = {
      name: supplierData.name,
      address: supplierData.address,
      city,
      status: supplierData.status as "active" | "inactive",
      metadata: {
        contactPerson: supplierData.contactPerson,
        email: supplierData.email,
        phone: supplierData.phone,
        rating:
          typeof supplierData.rating === "number"
            ? supplierData.rating
            : undefined,
      },
    };

    if (coords) {
      patch.coordinates = { lat: coords.lat, lng: coords.lng };
    }

    updateEntity(supplierId, patch);
  };

  // Eliminar proveedor desde el contexto GIS
  const deleteSupplier = async (supplierId: string) => {
    removeEntity(supplierId);
  };

  // Unificar datos extendidos: notas + metadata del contexto GIS
  const getExtendedData = (supplier: any) => {
    const meta = supplier && typeof supplier.metadata === "object" && supplier.metadata !== null ? supplier.metadata : {};

    if (!supplier || !supplier.notes) {
      return { ...meta };
    }

    try {
      if (typeof supplier.notes === "string") {
        const trimmedNotes = supplier.notes.trim();
        if (trimmedNotes.startsWith("{") && trimmedNotes.endsWith("}")) {
          const parsed = JSON.parse(supplier.notes);
          return { ...meta, ...parsed };
        } else if (trimmedNotes.startsWith("[") && trimmedNotes.endsWith("]")) {
          const parsed = JSON.parse(supplier.notes);
          return { ...meta, ...parsed };
        }
        return { ...meta, additionalNotes: supplier.notes };
      } else if (typeof supplier.notes === "object" && supplier.notes !== null) {
        return { ...meta, ...supplier.notes };
      }
    } catch (error) {
      console.error("Error parsing extended data:", error);
      return { ...meta, additionalNotes: supplier.notes || "" };
    }

    return { ...meta };
  };

  const getSupplierField = (supplier: any, field: string) => {
    const extendedData = getExtendedData(supplier);
    return supplier[field] || extendedData[field] || "";
  };

  // NUEVO: construir los datos iniciales del formulario al editar
  const buildInitialFormData = (supplier: any): SupplierFormData => {
    const extended = getExtendedData(supplier);
    return {
      name: supplier.name || "",
      contactPerson: supplier.contactPerson || extended.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      category: supplier.category || "",
      status: (supplier.status as "active" | "inactive") || "active",
      businessName: extended.businessName || "",
      city: extended.city || "",
      taxId: extended.taxId || "",
      contactPhone: extended.contactPhone || "",
      website: extended.website || "",
      paymentTerms: extended.paymentTerms || "",
      deliveryTime: extended.deliveryTime || "",
      minimumOrder:
        typeof extended.minimumOrder === "number"
          ? extended.minimumOrder
          : Number(extended.minimumOrder) || 0,
      rating:
        typeof extended.rating === "number"
          ? extended.rating
          : Number(extended.rating) || 5,
      notes:
        typeof supplier.notes === "string"
          ? extended.additionalNotes || supplier.notes
          : extended.additionalNotes || "",
    };
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const extendedData = getExtendedData(supplier);

    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extendedData.businessName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (supplier.email || extendedData.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.phone || extendedData.phone || "").includes(searchQuery) ||
      extendedData.taxId?.includes(searchQuery);

    const matchesCategory =
      filterCategory === "all" || supplier.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || supplier.status === filterStatus;
    const matchesCity =
      filterCity === "all" || extendedData.city === filterCity || supplier.city === filterCity;

    return matchesSearch && matchesCategory && matchesStatus && matchesCity;
  });

  const handleOpenForm = (supplier?: any) => {
    if (supplier) {
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

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Proveedores</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Administra la información de tus proveedores y sus productos
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const headers = ["Nombre", "Contacto", "Email", "Teléfono", "Ciudad", "Estado"];
              const data = filteredSuppliers.map((s) => {
                const city = getExtendedData(s).city || s.city || "";
                return [s.name, getExtendedData(s).contactPerson || s.contactPerson || "", s.email || "", s.phone || "", city, s.status];
              });
              exportToPDF({ headers, data, fileName: "Proveedores" });
            }}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const headers = ["Nombre", "Contacto", "Email", "Teléfono", "Ciudad", "Estado"];
              const data = filteredSuppliers.map((s) => {
                const city = getExtendedData(s).city || s.city || "";
                return [s.name, getExtendedData(s).contactPerson || s.contactPerson || "", s.email || "", s.phone || "", city, s.status];
              });
              exportToExcel({ headers, data, fileName: "Proveedores" });
            }}
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Exportar Excel</span>
            <span className="sm:hidden">Excel</span>
          </Button>
          <Button 
            onClick={() => handleOpenForm()} 
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Plus className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Proveedor</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {/* Tabs para vista lista y mapa */}
      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Vista Lista
          </TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Vista Mapa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          {/* Mapa de proveedores con GIS */}
          <SupplierMap onViewEntity={handleViewSupplierFromMap} />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <SupplierForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        editingSupplier={editingSupplier}
        initialData={editingSupplier ? buildInitialFormData(editingSupplier) : undefined}
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
