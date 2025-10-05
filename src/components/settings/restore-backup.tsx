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
import { Upload } from "lucide-react";
import { toast } from "sonner";
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

interface RestoreBackupProps {
  selectedBackupFile: File | null;
  setSelectedBackupFile: (file: File | null) => void;
  onRestoreBackup: () => Promise<void>;
}

export function RestoreBackup({
  selectedBackupFile,
  setSelectedBackupFile,
  onRestoreBackup,
}: RestoreBackupProps) {
  const handleBackupFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        toast.error("Por favor selecciona un archivo JSON válido");
        return;
      }

      setSelectedBackupFile(file);
      const input = document.getElementById(
        "backup-file-input"
      ) as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
      }
      toast.success("Archivo de respaldo seleccionado");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurar Datos</CardTitle>
        <CardDescription>
          Restaura información desde un respaldo anterior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="backup-file">Archivo de Respaldo</Label>
          <div className="flex gap-2">
            <Input
              id="backup-file-input"
              placeholder="Seleccionar archivo .json"
              value={selectedBackupFile?.name || ""}
              readOnly
            />
            <Button variant="outline" asChild>
              <Label htmlFor="backup-upload" className="cursor-pointer">
                <Upload className="h-4 w-4" />
                <input
                  id="backup-upload"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleBackupFileSelect}
                />
              </Label>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Selecciona un archivo JSON de respaldo generado previamente
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full"
              disabled={!selectedBackupFile}
            >
              Restaurar Datos
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Restaurar respaldo?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                Esta acción reemplazará todos los datos actuales con la
                información del respaldo seleccionado. Esta acción no se puede
                deshacer.
                {selectedBackupFile && (
                  <div className="mt-2 p-2 bg-muted rounded">
                    <div className="text-sm font-medium">
                      Archivo seleccionado:
                    </div>
                    <div className="text-sm">{selectedBackupFile.name}</div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onRestoreBackup}>
                Restaurar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
