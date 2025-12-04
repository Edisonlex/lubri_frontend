"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { type VariantProps } from "class-variance-authority"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Search, Building2, Phone, Mail, MapPin } from "lucide-react"
import { toast } from "sonner"
import { usePOS } from "@/contexts/pos-context"

interface SupplierFormData {
  name: string
  email: string
  phone: string
  address: string
  category: string
  status: "active" | "inactive"
  contactPerson: string
  notes?: string
}

const initialFormData: SupplierFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  category: "Lubricantes",
  status: "active",
  contactPerson: "",
  notes: ""
}

const categories = [
  { value: "Lubricantes", label: "Lubricantes" },
  { value: "Filtros", label: "Filtros" },
  { value: "Aceites", label: "Aceites" },
  { value: "Repuestos", label: "Repuestos" },
  { value: "Herramientas", label: "Herramientas" },
  { value: "Otros", label: "Otros" }
]

const statuses = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" }
]

export function SupplierManagement() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = usePOS()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [formData, setFormData] = useState<SupplierFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone.includes(searchQuery) ||
      supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || supplier.status === filterStatus
    const matchesCategory = filterCategory === "all" || supplier.category === filterCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleOpenDialog = (supplier?: any) => {
    if (supplier) {
      setEditingSupplier(supplier)
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        category: supplier.category,
        status: supplier.status,
        contactPerson: supplier.contactPerson,
        notes: supplier.notes || ""
      })
    } else {
      setEditingSupplier(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSupplier(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData)
        toast.success("Proveedor actualizado correctamente")
      } else {
        await addSupplier(formData)
        toast.success("Proveedor creado correctamente")
      }
      handleCloseDialog()
    } catch (error) {
      toast.error("Error al guardar el proveedor")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (supplierId: string) => {
    try {
      await deleteSupplier(supplierId)
      toast.success("Proveedor eliminado correctamente")
    } catch (error) {
      toast.error("Error al eliminar el proveedor")
    }
  }

  const getCategoryBadgeVariant = (
    category: string
  ): VariantProps<typeof badgeVariants>["variant"] => {
    switch (category) {
      case "Lubricantes":
        return "default"
      case "Filtros":
        return "secondary"
      case "Aceites":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Gestión de Proveedores</h3>
          <p className="text-sm text-muted-foreground">Administra proveedores y sus datos de contacto</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
                </DialogTitle>
                <DialogDescription>
                  {editingSupplier 
                    ? "Modifica la información del proveedor" 
                    : "Completa los datos para crear un nuevo proveedor"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la empresa</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre de la empresa"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Persona de contacto</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Nombre del contacto"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@empresa.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Dirección completa"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionales sobre el proveedor"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : editingSupplier ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar proveedores por nombre, email o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredSuppliers.map((supplier) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{supplier.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenDialog(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. El proveedor <strong>{supplier.name}</strong> será eliminado permanentemente del sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(supplier.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getCategoryBadgeVariant(supplier.category || "")}> 
                      {supplier.category}
                    </Badge>
                    <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                      {supplier.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium">Contacto: {supplier.contactPerson}</p>
                    {supplier.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {supplier.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron proveedores</p>
            <p className="text-sm">Intenta con otros términos de búsqueda o filtros</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}