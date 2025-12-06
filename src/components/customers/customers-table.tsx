"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Bell,
  MoreHorizontal,
  Users,
  Car,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePOS } from "@/contexts/pos-context";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomersTableProps {
  customers: Customer[];
  filters: {
    customerType: string;
    status: string;
    city: string;
    search: string;
  };
  onViewCustomer: (customer: Customer) => void;
  onEditCustomer: (customer: Customer) => void;
  onMaintenanceReminder: (customer: Customer) => void;
}

// Importar la interfaz Customer desde el contexto POS
type Customer = ReturnType<typeof usePOS>["customers"][0];

export function CustomersTable({
  customers,
  filters,
  onViewCustomer,
  onEditCustomer,
  onMaintenanceReminder,
}: CustomersTableProps) {
  const [sortField, setSortField] = useState<keyof Customer>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { refreshCustomers, loadingCustomers } = usePOS();
  const filteredCustomers = customers.filter((customer) => {
    const matchesType =
      filters.customerType === "all" ||
      customer.customerType === filters.customerType;
    const matchesStatus =
      filters.status === "all" || customer.status === filters.status;
    const matchesCity =
      filters.city === "all" ||
      (customer.city && filters.city &&
        customer.city.toLowerCase() === String(filters.city).toLowerCase());
    const matchesSearch =
      customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      customer.phone.includes(filters.search) ||
      customer.idNumber.includes(filters.search) ||
      (customer.businessName &&
        customer.businessName
          .toLowerCase()
          .includes(filters.search.toLowerCase()));

    return matchesType && matchesStatus && matchesCity && matchesSearch;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * direction;
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * direction;
    }

    // Manejar fechas
    if (sortField === "lastPurchase" || sortField === "registrationDate") {
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      return (aDate - bDate) * direction;
    }

    return 0;
  });

  const totalItems = sortedCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pagedCustomers = sortedCustomers.slice(startIdx, startIdx + pageSize);

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isMaintenanceDue = (customer: Customer) => {
    return customer.vehicles.some((vehicle) => {
      const nextService = new Date(vehicle.nextService);
      const today = new Date();
      const daysUntilService = Math.ceil(
        (nextService.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilService <= 7;
    });
  };

  // Loading State
  if (!customers || customers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-8">
            <Users className="h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay clientes disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mobile Card Component
  const CustomerCard = ({
    customer,
    index,
  }: {
    customer: Customer;
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm truncate">
                    {customer.name}
                  </h3>
                  {isMaintenanceDue(customer) && (
                    <Bell className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {customer.idNumber}
                </p>
                {customer.businessName && (
                  <p className="text-xs text-muted-foreground truncate">
                    {customer.businessName}
                  </p>
                )}
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant={customer.status === "active" ? "default" : "secondary"}
                className="text-xs"
              >
                {customer.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => onViewCustomer(customer)}
                    className="text-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEditCustomer(customer)}
                    className="text-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  {isMaintenanceDue(customer) && (
                    <DropdownMenuItem
                      onClick={() => onMaintenanceReminder(customer)}
                      className="text-sm"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Recordatorio
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Customer Info Grid */}
          <div className="grid grid-cols-1 gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="capitalize">{customer.city}</span>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs px-2">
                  {customer.customerType === "individual" ? (
                    <User className="h-3 w-3 mr-1" />
                  ) : (
                    <Building2 className="h-3 w-3 mr-1" />
                  )}
                  {customer.customerType === "individual"
                    ? "Individual"
                    : "Empresa"}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Car className="h-3 w-3" />
                <span>{customer.vehicles.length}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-medium">
                <DollarSign className="h-3 w-3" />
                <span>{customer.totalPurchases.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(customer.lastPurchase).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center justify-between text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Clientes ({sortedCustomers.length})</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCustomers}
              disabled={loadingCustomers}
            >
              {loadingCustomers ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Actualizar"
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {isMobile ? (
            // Mobile Card Layout
            <div className="space-y-3">
              {pagedCustomers.map((customer, index) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  index={index}
                />
              ))}
              {totalItems === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron clientes</p>
                  {filters.search && (
                    <p className="text-sm mt-2">
                      Intenta ajustar los términos de búsqueda
                    </p>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Mostrar</span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm">por página</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                    Anterior
                  </Button>
                  <span className="text-sm">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Desktop Table Layout
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Cliente
                        {sortField === "name" && (
                          <span className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Vehículos</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("totalPurchases")}
                    >
                      <div className="flex items-center gap-1">
                        Total Compras
                        {sortField === "totalPurchases" && (
                          <span className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort("lastPurchase")}
                    >
                      <div className="flex items-center gap-1">
                        Última Compra
                        {sortField === "lastPurchase" && (
                          <span className="text-xs">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedCustomers.map((customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{customer.name}</p>
                              {isMaintenanceDue(customer) && (
                                <Bell className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {customer.idNumber}
                            </p>
                            {customer.businessName && (
                              <p className="text-xs text-muted-foreground">
                                {customer.businessName}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{customer.phone}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer.email}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {customer.city}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {customer.customerType === "individual" ? (
                            <User className="h-3 w-3 mr-1" />
                          ) : (
                            <Building2 className="h-3 w-3 mr-1" />
                          )}
                          {customer.customerType === "individual"
                            ? "Individual"
                            : "Empresa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.vehicles.length}</span>
                          {customer.vehicles.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({customer.vehicles[0].brand}{" "}
                              {customer.vehicles[0].model}
                              {customer.vehicles.length > 1 &&
                                ` +${customer.vehicles.length - 1}`}
                              )
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${customer.totalPurchases.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(customer.lastPurchase).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {customer.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => onViewCustomer(customer)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onEditCustomer(customer)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {isMaintenanceDue(customer) && (
                              <DropdownMenuItem
                                onClick={() => onMaintenanceReminder(customer)}
                              >
                                <Bell className="h-4 w-4 mr-2" />
                                Recordatorio Mantenimiento
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
              {totalItems === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    No se encontraron clientes
                  </h3>
                  <p>
                    {filters.search ||
                    filters.customerType !== "all" ||
                    filters.status !== "all" ||
                    filters.city !== "all"
                      ? "Intenta ajustar los filtros de búsqueda"
                      : "No hay clientes registrados en el sistema"}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Mostrar</span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm">por página</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                    Anterior
                  </Button>
                  <span className="text-sm">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
