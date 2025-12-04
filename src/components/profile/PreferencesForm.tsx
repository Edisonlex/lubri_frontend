"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette } from "lucide-react";
import { useTheme } from "next-themes";

interface Preferences {
  theme: string;
  notifications: boolean;
  emailAlerts: boolean;
  language: string;
  roleNotifications: {
    admin: {
      inventoryAlerts: boolean;
      userManagementAlerts: boolean;
    };
    cashier: {
      salesAlerts: boolean;
      customerAlerts: boolean;
    };
    technician: {
      maintenanceAlerts: boolean;
      stockAlerts: boolean;
    };
  };
}

interface PreferencesFormProps {
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
  onSave: () => void;
  isSaving: boolean;
  role: "admin" | "cashier" | "technician";
}

export function PreferencesForm({
  preferences,
  onPreferencesChange,
  onSave,
  isSaving,
  role,
}: PreferencesFormProps) {
  const { setTheme } = useTheme();

  const handleThemeChange = (value: string) => {
    const newPreferences = { ...preferences, theme: value };
    onPreferencesChange(newPreferences);
    setTheme(value);
  };

  const handleSwitchChange = (field: keyof Preferences, checked: boolean) => {
    onPreferencesChange({ ...preferences, [field]: checked });
  };

  const handleRoleSwitchChange = (field: string, checked: boolean) => {
    const updatedRolePrefs = {
      ...preferences.roleNotifications[role],
      [field]: checked,
    };
    onPreferencesChange({
      ...preferences,
      roleNotifications: {
        ...preferences.roleNotifications,
        [role]: updatedRolePrefs,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Preferencias de Visualización
        </CardTitle>
        <CardDescription>
          Personaliza la apariencia y comportamiento de la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="theme">Tema</Label>
          <Select value={preferences.theme} onValueChange={handleThemeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Oscuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            El tema se aplica inmediatamente
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notificaciones</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones en la aplicación
              </p>
            </div>
            <Switch
              id="notifications"
              checked={preferences.notifications}
              onCheckedChange={(checked) =>
                handleSwitchChange("notifications", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-alerts">Alertas por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibir alertas importantes por correo electrónico
              </p>
            </div>
            <Switch
              id="email-alerts"
              checked={preferences.emailAlerts}
              onCheckedChange={(checked) =>
                handleSwitchChange("emailAlerts", checked)
              }
            />
          </div>
          {role === "admin" && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="admin-inventory">Alertas de inventario</Label>
                  <p className="text-sm text-muted-foreground">Notificaciones sobre stock y movimientos</p>
                </div>
                <Switch
                  id="admin-inventory"
                  checked={preferences.roleNotifications.admin.inventoryAlerts}
                  onCheckedChange={(checked) =>
                    handleRoleSwitchChange("inventoryAlerts", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="admin-users">Alertas de gestión de usuarios</Label>
                  <p className="text-sm text-muted-foreground">Cambios y solicitudes de usuarios</p>
                </div>
                <Switch
                  id="admin-users"
                  checked={preferences.roleNotifications.admin.userManagementAlerts}
                  onCheckedChange={(checked) =>
                    handleRoleSwitchChange("userManagementAlerts", checked)
                  }
                />
              </div>
            </>
          )}
          {role === "cashier" && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cashier-sales">Alertas de ventas</Label>
                  <p className="text-sm text-muted-foreground">Estado y anomalías de ventas</p>
                </div>
                <Switch
                  id="cashier-sales"
                  checked={preferences.roleNotifications.cashier.salesAlerts}
                  onCheckedChange={(checked) =>
                    handleRoleSwitchChange("salesAlerts", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cashier-customers">Alertas de clientes</Label>
                  <p className="text-sm text-muted-foreground">Clientes nuevos y seguimiento</p>
                </div>
                <Switch
                  id="cashier-customers"
                  checked={preferences.roleNotifications.cashier.customerAlerts}
                  onCheckedChange={(checked) =>
                    handleRoleSwitchChange("customerAlerts", checked)
                  }
                />
              </div>
            </>
          )}
          {role === "technician" && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="technician-maintenance">Alertas de mantenimiento</Label>
                  <p className="text-sm text-muted-foreground">Servicios y recordatorios técnicos</p>
                </div>
                <Switch
                  id="technician-maintenance"
                  checked={preferences.roleNotifications.technician.maintenanceAlerts}
                  onCheckedChange={(checked) =>
                    handleRoleSwitchChange("maintenanceAlerts", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="technician-stock">Alertas de stock</Label>
                  <p className="text-sm text-muted-foreground">Disponibilidad de repuestos</p>
                </div>
                <Switch
                  id="technician-stock"
                  checked={preferences.roleNotifications.technician.stockAlerts}
                  onCheckedChange={(checked) =>
                    handleRoleSwitchChange("stockAlerts", checked)
                  }
                />
              </div>
            </>
          )}
        </div>

        <Button onClick={onSave} className="w-full" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar Preferencias"}
        </Button>
      </CardContent>
    </Card>
  );
}
