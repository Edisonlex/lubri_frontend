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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { api, SRISettings } from "@/lib/api";
import { sriSettingsSchema } from "@/lib/validation";
import { useState } from "react";

interface SriSettingsTabProps {
  sriSettings: SRISettings;
  setSriSettings: (settings: SRISettings) => void;
}

export function SriSettingsTab({
  sriSettings,
  setSriSettings,
}: SriSettingsTabProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleSaveSriSettings = async () => {
    try {
      const result = sriSettingsSchema.safeParse(sriSettings);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const key = String(err.path[0] ?? "general");
          fieldErrors[key] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      setErrors({});
      await api.updateSriSettings(result.data);
      toast.success("Configuración SRI guardada correctamente");
    } catch (error) {
      console.error("Error saving SRI settings:", error);
      toast.error("Error al guardar la configuración SRI");
    }
  };

  const handleCertificateUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSriSettings({
          ...sriSettings,
          certificateFile: file.name,
        });
        toast.success("Certificado cargado correctamente");
      } catch (error) {
        console.error("Error uploading certificate:", error);
        toast.error("Error al cargar el certificado");
      }
    }
  };

  const handleSriActiveToggle = async (checked: boolean) => {
    try {
      const updatedSettings = await api.updateSriSettings({
        ...sriSettings,
        isActive: checked,
      });
      setSriSettings(updatedSettings);
      toast.success(
        `Facturación electrónica ${checked ? "activada" : "desactivada"}`
      );
    } catch (error) {
      console.error("Error updating SRI settings:", error);
      toast.error("Error al actualizar la configuración SRI");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Configuración SRI
        </CardTitle>
        <CardDescription>
          Parametrización para facturación electrónica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sri-environment">Ambiente</Label>
            <Select
              value={sriSettings.environment}
              onValueChange={(value: "test" | "production") =>
                setSriSettings({ ...sriSettings, environment: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="test">Pruebas</SelectItem>
                <SelectItem value="production">Producción</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sri-emission">Tipo de Emisión</Label>
            <Select
              value={sriSettings.emissionType}
              onValueChange={(value: "normal" | "contingency") =>
                setSriSettings({ ...sriSettings, emissionType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="contingency">Contingencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

          <div className="space-y-2">
            <Label htmlFor="sri-certificate">Certificado Digital</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Seleccionar archivo .p12"
                value={sriSettings.certificateFile}
                readOnly
              />
              {errors.certificateFile && (
                <p className="text-destructive text-sm">
                  {errors.certificateFile}
                </p>
              )}
              <Button variant="outline" asChild>
                <Label htmlFor="certificate-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <input
                    id="certificate-upload"
                  type="file"
                  accept=".p12,.pfx"
                  className="hidden"
                  onChange={handleCertificateUpload}
                />
              </Label>
            </Button>
          </div>
        </div>

          <div className="space-y-2">
            <Label htmlFor="sri-password">Contraseña del Certificado</Label>
            <Input
              id="sri-password"
              type="password"
              value={sriSettings.certificatePassword}
              onChange={(e) =>
                setSriSettings({
                  ...sriSettings,
                  certificatePassword: e.target.value,
                })
              }
            />
            {errors.certificatePassword && (
              <p className="text-destructive text-sm">
                {errors.certificatePassword}
              </p>
            )}
          </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="sri-active"
            checked={sriSettings.isActive}
            onCheckedChange={handleSriActiveToggle}
          />
          <Label htmlFor="sri-active">Activar facturación electrónica</Label>
        </div>

        <Button onClick={handleSaveSriSettings} className="w-full">
          Guardar Configuración SRI
        </Button>
      </CardContent>
    </Card>
  );
}
