import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Trash2 } from "lucide-react";

interface BackupFile {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  downloadUrl?: string;
}

interface BackupListProps {
  backupFiles: BackupFile[];
  onDownloadBackup: (backupFile: BackupFile) => void;
  onDeleteBackup: (backupId: string) => void;
}

export function BackupList({
  backupFiles,
  onDownloadBackup,
  onDeleteBackup,
}: BackupListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-3 mt-4">
      <Label>Respaldos disponibles</Label>
      {backupFiles.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay respaldos disponibles
        </p>
      ) : (
        backupFiles.map((backupFile) => (
          <div
            key={backupFile.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {backupFile.filename}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(backupFile.size)} •{" "}
                {new Date(backupFile.createdAt).toLocaleDateString("es-ES")}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadBackup(backupFile)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteBackup(backupFile.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
