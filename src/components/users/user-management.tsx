"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertCircle, UserX } from "lucide-react";
import { toast } from "sonner";
import { usePOS } from "@/contexts/pos-context";
import { UserForm } from "./user-form";
import { UserFilters } from "./user-filters";
import { UserList } from "./user-list";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, FileText, Table as TableIcon } from "lucide-react";
import {
  UserFormData,
  convertApiRoleToFormRole,
  convertApiStatusToFormStatus,
  convertFormDataToApiUser,
  convertApiUserToFormData,
} from "./types";

export function UserManagement() {
  const { users, addUser, updateUser, deleteUser, loadingUsers, errorUsers } =
    usePOS();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterRole("all");
    setFilterStatus("all");
  };

  // Verificar si hay filtros activos
  const hasActiveFilters =
    searchQuery !== "" || filterRole !== "all" || filterStatus !== "all";

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

  const handleOpenForm = (user?: any) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser(null);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleSubmitForm = async (formData: UserFormData) => {
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
      handleCloseForm();
    } catch (error) {
      toast.error("Error al guardar el usuario");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("Usuario eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el usuario");
    }
  };

  // Mostrar estado de carga inicial
  if (loadingUsers) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Gestión de Usuarios</h3>
          <p className="text-sm text-muted-foreground">
            Administra usuarios y sus roles en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Exportar Usuarios</DialogTitle>
                <DialogDescription>
                  Exporta tus usuarios. Se exportarán {filteredUsers.length}{" "}
                  usuarios.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button
                  onClick={() => {
                    const headers = ["Nombre", "Email", "Rol", "Estado"];
                    const data = filteredUsers.map((u) => [
                      u.name,
                      u.email,
                      u.role,
                      u.status,
                    ]);
                    exportToExcel({ headers, data, fileName: "Usuarios" });
                  }}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  variant="outline"
                >
                  <TableIcon className="h-8 w-8 text-green-600" />
                  <span>Excel (.xlsx)</span>
                  <span className="text-xs text-muted-foreground">
                    Recomendado para análisis
                  </span>
                </Button>
                <Button
                  onClick={() => {
                    const headers = ["Nombre", "Email", "Rol", "Estado"];
                    const data = filteredUsers.map((u) => [
                      u.name,
                      u.email,
                      u.role,
                      u.status,
                    ]);
                    exportToPDF({ headers, data, fileName: "Usuarios" });
                  }}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  variant="outline"
                >
                  <FileText className="h-8 w-8 text-red-600" />
                  <span>PDF (.pdf)</span>
                  <span className="text-xs text-muted-foreground">
                    Para impresión
                  </span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterRole={filterRole}
        onRoleChange={setFilterRole}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        onClearAll={clearAllFilters}
      />

      {/* Users List */}
      <UserList
        users={filteredUsers}
        onEditUser={handleOpenForm}
        onDeleteUser={handleDeleteUser}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
      />

      {/* Form Dialog */}
      <UserForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        editingUser={editingUser}
        isLoading={isFormLoading}
      />
    </div>
  );
}
