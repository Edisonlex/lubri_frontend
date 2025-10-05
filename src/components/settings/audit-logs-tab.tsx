import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, User } from "lucide-react";
import { AuditLog } from "@/lib/api";

interface AuditLogsTabProps {
  auditLogs: AuditLog[];
}

export function AuditLogsTab({ auditLogs }: AuditLogsTabProps) {
  // Función para formatear la fecha de manera más legible en móvil
  const formatDateForMobile = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("es-ES", {
        weekday: "short",
      });
    } else {
      return date.toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Card className="mx-2 sm:mx-0">
      <CardHeader className="pb-3 sm:pb-5">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
          Logs de Auditoría
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Registro de actividades del sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {auditLogs.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay registros de auditoría
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
              >
                {/* Header para móvil - Información principal */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base line-clamp-2">
                      {log.action}
                    </p>

                    {/* Información de usuario y fecha para móvil */}
                    <div className="flex items-center gap-3 mt-2 sm:hidden">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">{log.user}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDateForMobile(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      log.status === "success"
                        ? "default"
                        : log.status === "error"
                        ? "destructive"
                        : "secondary"
                    }
                    className="shrink-0 text-xs px-2 py-1"
                  >
                    {log.status === "success"
                      ? "✓"
                      : log.status === "error"
                      ? "✗"
                      : "!"}
                  </Badge>
                </div>

                {/* Información detallada - Solo visible en desktop */}
                <div className="hidden sm:flex sm:items-center sm:justify-between sm:mt-1">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{log.user}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(log.timestamp).toLocaleString("es-ES")}
                      </span>
                    </div>
                  </div>

                  {/* Badge con texto completo en desktop */}
                  <Badge
                    variant={
                      log.status === "success"
                        ? "default"
                        : log.status === "error"
                        ? "destructive"
                        : "secondary"
                    }
                    className="hidden sm:inline-flex text-xs"
                  >
                    {log.status === "success"
                      ? "Exitoso"
                      : log.status === "error"
                      ? "Error"
                      : "Advertencia"}
                  </Badge>
                </div>

                {/* Información adicional si existe */}
                {log.details && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs sm:text-sm">
                    <p className="text-muted-foreground">{log.details}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer con información de paginación o estadísticas */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Exitoso</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Error</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Advertencia</span>
              </div>
            </div>
            <div>Mostrando {auditLogs.length} registros</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
