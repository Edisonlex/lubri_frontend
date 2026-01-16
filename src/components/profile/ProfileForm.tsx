"use client";

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
import { User } from "lucide-react";
import { profileSchema } from "@/lib/validation";
import { useZodLiveForm } from "@/hooks/use-zod-form";
import React, { useEffect } from "react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}

interface ProfileFormProps {
  profile: ProfileData;
  onProfileChange: (profile: ProfileData) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function ProfileForm({
  profile,
  onProfileChange,
  onSave,
  isSaving,
}: ProfileFormProps) {
  const form = useZodLiveForm(profileSchema, profile);

  useEffect(() => {
    form.setData(profile);
  }, [profile]);

  const hasErrors = Object.keys(form.errors).length > 0;

  const handleSave = () => {
    const validation = form.validate();
    if (validation.ok) {
      onProfileChange(validation.value);
      onSave();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información Personal
        </CardTitle>
        <CardDescription>
          Actualiza tu información personal y de contacto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <p className="text-muted-foreground text-xs">Mínimo 2 caracteres</p>
            <Input
              id="name"
              value={form.data.name}
              onChange={(e) => form.setField("name", e.target.value)}
              {...form.ariaProps("name")}
              className={form.errors.name ? "border-destructive" : ""}
            />
            {form.errors.name && (
              <p className="text-destructive text-sm font-medium">{form.errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <p className="text-muted-foreground text-xs">Correo electrónico válido</p>
            <Input
              id="email"
              type="email"
              value={form.data.email}
              onChange={(e) => form.setField("email", e.target.value)}
              {...form.ariaProps("email")}
              className={form.errors.email ? "border-destructive" : ""}
            />
            {form.errors.email && (
              <p className="text-destructive text-sm font-medium">{form.errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <p className="text-muted-foreground text-xs">Teléfono válido (10 dígitos)</p>
            <Input
              id="phone"
              value={form.data.phone}
              onChange={(e) => form.setField("phone", e.target.value.replace(/\D/g, ""))}
              maxLength={10}
              {...form.ariaProps("phone")}
              className={form.errors.phone ? "border-destructive" : ""}
            />
            {form.errors.phone && (
              <p className="text-destructive text-sm font-medium">{form.errors.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <p className="text-muted-foreground text-xs">Rol asignado (solo lectura)</p>
            <Input
              id="role"
              value={form.data.role}
              disabled
              className="bg-muted"
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={isSaving || hasErrors}>
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardContent>
    </Card>
  );
}
