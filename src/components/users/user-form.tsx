"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import { UserFormData, roles, statuses, convertApiUserToFormData } from "./types";
import { userFormSchema } from "@/lib/validation";
import { useZodLiveForm } from "@/hooks/use-zod-form";

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  editingUser?: any;
  isLoading?: boolean;
}

const initialFormData: UserFormData = {
  name: "",
  email: "",
  role: "Cajero",
  status: "Activo",
  password: "",
};

export function UserForm({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
  isLoading = false,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const schema = userFormSchema({ requirePassword: !editingUser });
  const form = useZodLiveForm(schema, initialFormData);

  useEffect(() => {
    if (!isOpen) return;
    if (editingUser) {
      const filled = convertApiUserToFormData(editingUser);
      form.setData({ ...initialFormData, ...filled });
    } else {
      form.reset(initialFormData);
    }
  }, [editingUser, isOpen]);

  useEffect(() => {}, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = form.validate();
    if (!res.ok) return;
    await onSubmit(res.value as UserFormData);
  };

  const handleClose = () => {
    form.reset(initialFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
              <p className="text-muted-foreground text-xs">Mínimo 2 caracteres</p>
              <Input
                id="name"
                value={form.data.name}
                onChange={(e) =>
                  form.setField("name", e.target.value)
                }
                placeholder="Ingresa el nombre completo"
                required
                {...form.ariaProps("name", "name-help")}
              />
              {form.errors.name && (
                <p className="text-destructive text-sm">{form.errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <p className="text-muted-foreground text-xs">Formato de correo válido</p>
              <Input
                id="email"
                type="email"
                value={form.data.email}
                onChange={(e) =>
                  form.setField("email", e.target.value)
                }
                placeholder="usuario@ejemplo.com"
                required
                {...form.ariaProps("email", "email-help")}
              />
              {form.errors.email && (
                <p className="text-destructive text-sm">{form.errors.email}</p>
              )}
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <p className="text-muted-foreground text-xs">Mínimo 6 caracteres</p>
                <Input
                  id="password"
                  type="password"
                  value={form.data.password}
                  onChange={(e) =>
                    form.setField("password", e.target.value)
                  }
                  placeholder="Contraseña temporal"
                  required
                  {...form.ariaProps("password", "password-help")}
                />
                {form.errors.password && (
                  <p className="text-destructive text-sm">
                    {form.errors.password}
                  </p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <p className="text-muted-foreground text-xs">Selecciona el rol del usuario</p>
                <Select
                  value={form.data.role}
                  onValueChange={(value) =>
                    form.setField("role", value)
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
                {form.errors.role && (
                  <p className="text-destructive text-sm">{form.errors.role}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <p className="text-muted-foreground text-xs">Activo o Inactivo</p>
                <Select
                  value={form.data.status}
                  onValueChange={(value) =>
                    form.setField("status", value)
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
                {form.errors.status && (
                  <p className="text-destructive text-sm">{form.errors.status}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Guardando..."
                : editingUser
                ? "Actualizar"
                : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
