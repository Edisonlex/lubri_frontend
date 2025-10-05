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
  const handleChange = (field: keyof PasswordData, value: string) => {
    onPasswordChange({ ...passwordData, [field]: value });
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
          <Input
            id="current-password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => handleChange("currentPassword", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">Nueva Contraseña</Label>
          <Input
            id="new-password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
          <Input
            id="confirm-password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
          />
        </div>

        <Button
          onClick={onChangePassword}
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? "Actualizando..." : "Actualizar Contraseña"}
        </Button>
      </CardContent>
    </Card>
  );
}
