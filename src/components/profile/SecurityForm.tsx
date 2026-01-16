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
import { Lock } from "lucide-react";
import { useZodLiveForm } from "@/hooks/use-zod-form";
import { passwordChangeSchema } from "@/lib/password-validation";
import { useEffect } from "react";

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecurityFormProps {
  passwordData: PasswordData;
  onPasswordChange: (passwordData: PasswordData) => void;
  onChangePassword: () => void;
  isSaving: boolean;
}

export function SecurityForm({
  passwordData,
  onPasswordChange,
  onChangePassword,
  isSaving,
}: SecurityFormProps) {
  const form = useZodLiveForm(passwordChangeSchema, passwordData);

  useEffect(() => {
    form.setData(passwordData);
  }, [passwordData]);

  const hasErrors = Object.keys(form.errors).length > 0;

  const handleChange = (field: keyof PasswordData, value: string) => {
    form.setField(field, value);
    onPasswordChange({ ...form.data, [field]: value });
  };

  const handleSubmit = () => {
    const validation = form.validate();
    if (validation.ok) {
      onChangePassword();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Cambiar Contraseña
        </CardTitle>
        <CardDescription>
          Actualiza tu contraseña para mantener tu cuenta segura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Contraseña Actual</Label>
          <p className="text-muted-foreground text-xs">Tu contraseña actual para verificar identidad</p>
          <Input
            id="current-password"
            type="password"
            value={form.data.currentPassword}
            onChange={(e) => handleChange("currentPassword", e.target.value)}
            {...form.ariaProps("currentPassword")}
            className={form.errors.currentPassword ? "border-destructive" : ""}
          />
          {form.errors.currentPassword && (
            <p className="text-destructive text-sm font-medium">{form.errors.currentPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">Nueva Contraseña</Label>
          <p className="text-muted-foreground text-xs">Mínimo 6 caracteres</p>
          <Input
            id="new-password"
            type="password"
            value={form.data.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
            {...form.ariaProps("newPassword")}
            className={form.errors.newPassword ? "border-destructive" : ""}
          />
          {form.errors.newPassword && (
            <p className="text-destructive text-sm font-medium">{form.errors.newPassword}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
          <p className="text-muted-foreground text-xs">Debe coincidir con la nueva contraseña</p>
          <Input
            id="confirm-password"
            type="password"
            value={form.data.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            {...form.ariaProps("confirmPassword")}
            className={form.errors.confirmPassword ? "border-destructive" : ""}
          />
          {form.errors.confirmPassword && (
            <p className="text-destructive text-sm font-medium">{form.errors.confirmPassword}</p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={isSaving || hasErrors}
        >
          {isSaving ? "Actualizando..." : "Actualizar Contraseña"}
        </Button>
      </CardContent>
    </Card>
  );
}
