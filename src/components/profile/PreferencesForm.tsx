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
}

interface PreferencesFormProps {
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function PreferencesForm({
  preferences,
  onPreferencesChange,
  onSave,
  isSaving,
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
        </div>

        <Button onClick={onSave} className="w-full" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar Preferencias"}
        </Button>
      </CardContent>
    </Card>
  );
}
