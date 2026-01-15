// components/inventory/stock-movement-history.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  FileText,
  Calendar,
  Hash,
  MessageSquare,
  User,
} from "lucide-react";
import { api, type StockMovement, type Product } from "@/lib/api";
import { inventoryService } from "@/lib/inventory-service";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface StockMovementHistoryProps {
  productId?: string;
  isLoading?: boolean;
  movementType?: string;
  movements?: StockMovement[]; // Prop para recibir movimientos filtrados desde el padre
}

// Mock de usuarios para mostrar nombres en lugar de IDs
const mockUsers: Record<string, string> = {
  "1": "Admin",
  "2": "Vendedor",
  "3": "Inventario",
};

export function StockMovementHistory({
  productId,
  isLoading: externalLoading,
  movementType = "all",
  movements: externalMovements,
}: StockMovementHistoryProps) {
  const [internalMovements, setInternalMovements] = useState<StockMovement[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [selectedType, setSelectedType] = useState<"all" | "entrada" | "salida" | "ajuste">("all");
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(productId);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const movements = externalMovements || internalMovements;
  const totalPages = Math.max(1, Math.ceil(movements.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const visibleMovements = movements.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const list = await api.getProducts();
        setProducts(list);
      } catch {}
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (!externalMovements) {
      const fetchMovements = async () => {
        setIsLoading(true);
        try {
          let data = await inventoryService.getStockMovements(selectedProductId);

          if (selectedType !== "all") {
            data = data.filter((movement) => movement.type === selectedType);
          }

          setInternalMovements(data);
          setPage(1);
        } catch (error) {
          console.error("Error fetching stock movements:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchMovements();
    } else {
      setIsLoading(false);
    }
  }, [selectedProductId, selectedType, externalMovements]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entrada":
        return <ArrowUpCircle className="h-4 w-4 text-emerald-500" />;
      case "salida":
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
      case "ajuste":
        return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "entrada":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
          >
            Entrada
          </Badge>
        );
      case "salida":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 text-xs"
          >
            Salida
          </Badge>
        );
      case "ajuste":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
          >
            Ajuste
          </Badge>
        );
      default:
        return null;
    }
  };

  const getUserName = (userId: string) => {
    return mockUsers[userId] || `Usuario ${userId}`;
  };

  // Vista para móviles - Tarjetas individuales
  const MobileView = () => (
    <div className="space-y-3">
      {visibleMovements.map((movement) => (
        <Card key={movement.id} className="p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              {getTypeIcon(movement.type)}
              {getTypeBadge(movement.type)}
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(movement.date).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Cantidad:</span>
            </div>
            <span
              className={`font-semibold text-right ${
                movement.type === "salida"
                  ? "text-red-600"
                  : movement.type === "entrada"
                  ? "text-emerald-600"
                  : "text-amber-600"
              }`}
            >
              {movement.type === "salida"
                ? "-"
                : movement.type === "entrada"
                ? "+"
                : ""}
              {movement.quantity}
            </span>

            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Motivo:</span>
            </div>
            <span className="text-right truncate" title={movement.reason}>
              {movement.reason}
            </span>

            <div className="flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Usuario:</span>
            </div>
            <span className="text-right text-xs truncate">
              {getUserName(movement.userId)}
            </span>

            {movement.documentRef && (
              <>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">Ref:</span>
                </div>
                <span
                  className="text-right text-xs truncate"
                  title={movement.documentRef}
                >
                  {movement.documentRef}
                </span>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  // Vista para tablets - Tabla compacta
  const TabletView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-[100px]">Fecha</TableHead>
            <TableHead className="w-[100px]">Tipo</TableHead>
            <TableHead className="w-[80px]">Cantidad</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead className="w-[100px]">Usuario</TableHead>
            <TableHead className="w-[120px]">Referencia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleMovements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className="text-sm py-3">
                {new Date(movement.date).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(movement.type)}
                  {getTypeBadge(movement.type)}
                </div>
              </TableCell>
              <TableCell
                className={`font-semibold py-3 ${
                  movement.type === "salida"
                    ? "text-red-600"
                    : movement.type === "entrada"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {movement.type === "salida"
                  ? "-"
                  : movement.type === "entrada"
                  ? "+"
                  : ""}
                {movement.quantity}
              </TableCell>
              <TableCell
                className="py-3 max-w-[200px] truncate"
                title={movement.reason}
              >
                {movement.reason}
              </TableCell>
              <TableCell className="py-3 text-sm">
                {getUserName(movement.userId)}
              </TableCell>
              <TableCell className="py-3">
                {movement.documentRef ? (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span
                      className="text-xs truncate"
                      title={movement.documentRef}
                    >
                      {movement.documentRef}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Vista para desktop - Tabla completa
  const DesktopView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow>
            <TableHead className="w-[120px]">Fecha y Hora</TableHead>
            <TableHead className="w-[120px]">Tipo</TableHead>
            <TableHead className="w-[100px]">Cantidad</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead className="w-[120px]">Usuario</TableHead>
            <TableHead className="w-[150px]">Referencia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleMovements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {new Date(movement.date).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(movement.date).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(movement.type)}
                  {getTypeBadge(movement.type)}
                </div>
              </TableCell>
              <TableCell
                className={`font-semibold ${
                  movement.type === "salida"
                    ? "text-red-600"
                    : movement.type === "entrada"
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {movement.type === "salida"
                  ? "-"
                  : movement.type === "entrada"
                  ? "+"
                  : ""}
                {movement.quantity}
              </TableCell>
              <TableCell
                className="max-w-[250px] truncate"
                title={movement.reason}
              >
                {movement.reason}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">
                    {getUserName(movement.userId)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {movement.documentRef ? (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span
                      className="text-sm truncate"
                      title={movement.documentRef}
                    >
                      {movement.documentRef}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Mostrar skeleton loading si está cargando
  if (externalLoading || isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Historial de Movimientos
          {movements.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {movements.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="w-full sm:w-48">
            <Select
              value={selectedType}
              onValueChange={(v) => setSelectedType(v as "all" | "entrada" | "salida" | "ajuste")}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="salida">Salida</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:flex-1">
            <Select
              value={selectedProductId || "all"}
              onValueChange={(v) =>
                setSelectedProductId(v === "all" ? undefined : v)
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Producto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los productos</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.sku ? `${p.sku} — ${p.name}` : p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {movements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
            <p>No hay movimientos registrados</p>
            <p className="text-sm mt-1">
              Los movimientos aparecerán aquí cuando se realicen operaciones
            </p>
          </div>
        ) : (
          <>
            {isMobile ? (
              <MobileView />
            ) : window.innerWidth < 1024 ? (
              <TabletView />
            ) : (
              <DesktopView />
            )}

            {!isMobile && window.innerWidth < 1024 && (
              <div className="text-center text-xs text-muted-foreground mt-3 p-2 bg-muted/20 rounded">
                ← Desliza horizontalmente para ver más información →
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={page >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filas</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    const size = parseInt(v, 10);
                    setPageSize(size);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
