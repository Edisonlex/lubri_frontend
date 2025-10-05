"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, Search, UserCheck, UserX, X } from "lucide-react"; // Agregué X icon
import { toast } from "sonner";
import { usePOS } from "@/contexts/pos-context";

// Tipos para el formulario (interfaz de usuario)
interface UserFormData {
  name: string;
  email: string;
  role: string;
  status: string;
  password?: string;
}

// Tipos mapeados para la API
type ApiRole = "admin" | "cashier" | "manager";
type ApiStatus = "active" | "inactive";

type FormRole = "Administrador" | "Cajero" | "Técnico" | "Supervisor";
type FormStatus = "Activo" | "Inactivo";

const initialFormData: UserFormData = {
  name: "",
  email: "",
  role: "Cajero",
  status: "Activo",
  password: "",
};

const roles = [
  { value: "Administrador", label: "Administrador" },
  { value: "Cajero", label: "Cajero" },
  { value: "Técnico", label: "Técnico" },
  { value: "Supervisor", label: "Supervisor" },
];

const statuses = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
];

// Funciones de conversión
const convertFormRoleToApiRole = (formRole: FormRole): ApiRole => {
  switch (formRole) {
    case "Administrador":
      return "admin";
    case "Cajero":
      return "cashier";
    case "Técnico":
      return "manager";
    case "Supervisor":
      return "manager";
    default:
      return "cashier";
  }
};

const convertApiRoleToFormRole = (apiRole: ApiRole): FormRole => {
  switch (apiRole) {
    case "admin":
      return "Administrador";
    case "cashier":
      return "Cajero";
    case "manager":
      return "Técnico";
    default:
      return "Cajero";
  }
};

const convertFormStatusToApiStatus = (formStatus: FormStatus): ApiStatus => {
  return formStatus === "Activo" ? "active" : "inactive";
};

const convertApiStatusToFormStatus = (apiStatus: ApiStatus): FormStatus => {
  return apiStatus === "active" ? "Activo" : "Inactivo";
};

// Convertir datos del formulario a datos de API
const convertFormDataToApiUser = (formData: UserFormData): Omit<any, "id"> => {
  return {
    name: formData.name,
    email: formData.email,
    role: convertFormRoleToApiRole(formData.role as FormRole),
    status: convertFormStatusToApiStatus(formData.status as FormStatus),
    ...(formData.password && { password: formData.password }),
  };
};

// Convertir datos de API a datos del formulario
const convertApiUserToFormData = (apiUser: any): UserFormData => {
  return {
    name: apiUser.name,
    email: apiUser.email,
    role: convertApiRoleToFormRole(apiUser.role),
    status: convertApiStatusToFormStatus(apiUser.status),
  };
};

export function UserManagement() {
  const { users, addUser, updateUser, deleteUser, loadingUsers, errorUsers } =
    usePOS();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [isFormLoading, setIsFormLoading] = useState(false); // Estado para carga del formulario

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterRole("all");
    setFilterStatus("all");
  };

  // Verificar si hay filtros activos
  const hasActiveFilters =
    searchQuery !== "" || filterRole !== "all" || filterStatus !== "all";

  // Función para convertir rol de API a formato de filtro
  const convertApiRoleForFilter = (apiRole: string): string => {
    return convertApiRoleToFormRole(apiRole as ApiRole);
  };

  // Función para convertir estado de API a formato de filtro
  const convertApiStatusForFilter = (apiStatus: string): string => {
    return convertApiStatusToFormStatus(apiStatus as ApiStatus);
  };

  const filteredUsers = users.filter((user) => {
    const userFormRole = convertApiRoleToFormRole(user.role);
    const userFormStatus = convertApiStatusToFormStatus(user.status);

    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userFormRole.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || userFormRole === filterRole;
    const matchesStatus =
      filterStatus === "all" || userFormStatus === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData(convertApiUserToFormData(user));
    } else {
      setEditingUser(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormLoading(true);

    try {
      const apiUserData = convertFormDataToApiUser(formData);

      if (editingUser) {
        await updateUser(editingUser.id, apiUserData);
        toast.success("Usuario actualizado correctamente");
      } else {
        await addUser(apiUserData);
        toast.success("Usuario creado correctamente");
      }
      handleCloseDialog();
    } catch (error) {
      toast.error("Error al guardar el usuario");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("Usuario eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el usuario");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    const formRole = convertApiRoleToFormRole(role as ApiRole);
    switch (formRole) {
      case "Administrador":
        return "default";
      case "Supervisor":
        return "secondary";
      case "Cajero":
        return "outline";
      case "Técnico":
        return "outline";
      default:
        return "outline";
    }
  };

  // Mostrar estado de carga inicial
  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay
  if (errorUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-destructive">
          <UserX className="h-8 w-8 mx-auto mb-2" />
          <p>Error al cargar usuarios</p>
          <p className="text-sm text-muted-foreground mt-2">{errorUsers}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Gestión de Usuarios</h3>
          <p className="text-sm text-muted-foreground">
            Administra usuarios y sus roles en el sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser
                    ? "Modifica la información del usuario"
                    : "Completa los datos para crear un nuevo usuario"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ingresa el nombre completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Contraseña temporal"
                      required
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value })
                      }
                    >
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
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isFormLoading}>
                  {isFormLoading
                    ? "Guardando..."
                    : editingUser
                    ? "Actualizar"
                    : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar usuarios por nombre, email o rol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
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

            {/* Botón para limpiar filtros */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="whitespace-nowrap"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Mostrar filtros activos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Búsqueda: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterRole !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Rol: {roles.find((r) => r.value === filterRole)?.label}
                  <button
                    onClick={() => setFilterRole("all")}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterStatus !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Estado:{" "}
                  {statuses.find((s) => s.value === filterStatus)?.label}
                  <button
                    onClick={() => setFilterStatus("all")}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            <AnimatePresence>
              {filteredUsers.map((user) => {
                const userFormRole = convertApiRoleToFormRole(user.role);
                const userFormStatus = convertApiStatusToFormStatus(
                  user.status
                );

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {user.status === "active" ? (
                          <UserCheck className="h-8 w-8 text-green-600" />
                        ) : (
                          <UserX className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{user.name}</h4>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {userFormRole}
                          </Badge>
                          <Badge
                            variant={
                              userFormStatus === "Activo"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {userFormStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Eliminar usuario?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. El usuario{" "}
                              <strong>{user.name}</strong> será eliminado
                              permanentemente del sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <UserX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron usuarios</p>
                <p className="text-sm">
                  {hasActiveFilters
                    ? "Intenta con otros términos de búsqueda o limpia los filtros"
                    : "No hay usuarios registrados en el sistema"}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="mt-2"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
