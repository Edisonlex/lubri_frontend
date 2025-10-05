"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Users, Clock } from "lucide-react";

interface UserStats {
  totalSales: number;
  customersServed: number;
  hoursWorked: number;
  recentActivity: Array<{
    action: string;
    timestamp: string;
  }>;
}

interface ProfileStatsProps {
  userStats: UserStats;
}

export function ProfileStats({ userStats }: ProfileStatsProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) {
      return "Hace unos minutos";
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas de Actividad</CardTitle>
        <CardDescription>Tu actividad reciente en el sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:gap-4 grid-cols-3 md:grid-cols-3">
          <div className="text-center p-2 sm:p-4 border rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {userStats.totalSales}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Ventas Procesadas
            </p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Este mes
            </p>
          </div>

          <div className="text-center p-2 sm:p-4 border rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {userStats.customersServed}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Clientes Atendidos
            </p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Este mes
            </p>
          </div>

          <div className="text-center p-2 sm:p-4 border rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-orange-600">
              {userStats.hoursWorked}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Horas Trabajadas
            </p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Este mes
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
          <h4 className="font-medium text-sm sm:text-base">
            Actividad Reciente
          </h4>
          <div className="space-y-1.5 sm:space-y-2">
            {userStats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay actividad reciente
              </p>
            ) : (
              userStats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-1.5 sm:p-2 border rounded"
                >
                  <span className="text-xs sm:text-sm line-clamp-1">
                    {activity.action}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
