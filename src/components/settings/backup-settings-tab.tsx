import { useState } from "react";
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
import { Database, Download, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, BackupSettings, CompanySettings, Branch } from "@/lib/api";
import { BackupList } from "./backup-list";
import { RestoreBackup } from "./restore-backup";

interface BackupFile {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  downloadUrl?: string;
}

interface BackupSettingsTabProps {
  backupSettings: BackupSettings;
  setBackupSettings: (settings: BackupSettings) => void;
  companyData: CompanySettings;
  branches: Branch[];
}

export function BackupSettingsTab({
  backupSettings,
  setBackupSettings,
  companyData,
  branches,
}: BackupSettingsTabProps) {
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(
    null
  );
  const [isGeneratingBackup, setIsGeneratingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = async () => {
    try {
      setIsGeneratingBackup(true);

      const backupData = {
        company: companyData,
        branches: branches,
        backupSettings: backupSettings,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });

      const url = URL.createObjectURL(blob);
      const filename = `respaldo-${
        new Date().toISOString().split("T")[0]
      }.json`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const timestamp = new Date().toISOString();
      setBackupSettings({
        ...backupSettings,
        lastBackup: timestamp,
      });

      const newBackupFile: BackupFile = {
        id: Math.random().toString(36).substring(2, 9),
        filename: filename,
        size: blob.size,
        createdAt: timestamp,
        downloadUrl: url,
      };

      setBackupFiles((prev) => [newBackupFile, ...prev]);
      await api.updateBackupSettings({
        ...backupSettings,
        lastBackup: timestamp,
      });

      toast.success("Respaldo generado y descargado correctamente");
    } catch (error) {
      console.error("Error generating backup:", error);
      toast.error("Error al generar el respaldo");
    } finally {
      setIsGeneratingBackup(false);
    }
  };

  const handleAutoBackupToggle = async (checked: boolean) => {
    try {
      const updatedSettings = await api.updateBackupSettings({
        ...backupSettings,
        autoBackup: checked,
      });
      setBackupSettings(updatedSettings);
      toast.success(
        `Respaldo automático ${checked ? "activado" : "desactivado"}`
      );
    } catch (error) {
      console.error("Error updating backup settings:", error);
      toast.error("Error al actualizar la configuración de respaldos");
    }
  };

  const handleRestore = async () => {
    if (!selectedBackupFile) return;
    try {
      setIsRestoring(true);
      const text = await selectedBackupFile.text();
      const data = JSON.parse(text);

      if (!data.company || !data.branches) {
        toast.error("El respaldo no contiene datos válidos de empresa o sucursales");
        return;
      }

      await api.updateCompanySettings(data.company);
      if (Array.isArray(data.branches)) {
        for (const b of data.branches as Branch[]) {
          if (b.id) {
            try {
              await api.updateBranch(b.id, b);
            } catch {
              // si no existe, lo crea
              await api.createBranch({
                name: b.name,
                address: b.address,
                phone: b.phone,
                email: b.email,
                isMain: b.isMain,
                status: b.status,
              });
            }
          } else {
            await api.createBranch({
              name: b.name,
              address: b.address,
              phone: b.phone,
              email: b.email,
              isMain: b.isMain,
              status: b.status,
            });
          }
        }
      }

      const timestamp = new Date().toISOString();
      setBackupSettings({ ...backupSettings, lastBackup: timestamp });
      await api.updateBackupSettings({ ...backupSettings, lastBackup: timestamp });

      toast.success("Datos restaurados desde el respaldo");
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast.error("Error al restaurar el respaldo");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Respaldo de Datos
          </CardTitle>
          <CardDescription>
            Genera y gestiona respaldos de seguridad de tu información
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Último respaldo</Label>
            <p className="text-sm text-muted-foreground">
              {backupSettings.lastBackup
                ? new Date(backupSettings.lastBackup).toLocaleString("es-ES")
                : "No se han generado respaldos"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-backup"
              checked={backupSettings.autoBackup}
              onCheckedChange={handleAutoBackupToggle}
            />
            <Label htmlFor="auto-backup">Respaldo automático diario</Label>
          </div>

          <Button
            onClick={handleBackup}
            className="w-full"
            disabled={isGeneratingBackup}
          >
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingBackup
              ? "Generando..."
              : "Generar y Descargar Respaldo"}
          </Button>

          <BackupList
            backupFiles={backupFiles}
            onDownloadBackup={(backupFile) => {
              toast.info(
                "En una implementación real, esto descargaría el respaldo desde el servidor"
              );
            }}
            onDeleteBackup={(backupId) => {
              setBackupFiles((prev) =>
                prev.filter((file) => file.id !== backupId)
              );
              toast.success("Respaldo eliminado");
            }}
          />
        </CardContent>
      </Card>

      <RestoreBackup
        selectedBackupFile={selectedBackupFile}
        setSelectedBackupFile={setSelectedBackupFile}
        onRestoreBackup={handleRestore}
      />
    </div>
  );
}
