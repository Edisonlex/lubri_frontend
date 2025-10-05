"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Edit,
  Settings,
  MoreHorizontal,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/app/inventory/page";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock inventory data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Aceite Mobil 1 5W-30",
    brand: "Mobil",
    category: "aceites",
    price: 45.5,
    cost: 32.0,
    stock: 3,
    minStock: 10,
    maxStock: 50,
    sku: "MOB-5W30-001",
    barcode: "1234567890123",
    supplier: "Distribuidora Central",
    location: "A1-B2",
    lastUpdated: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Filtro de Aceite Toyota",
    brand: "Toyota",
    category: "filtros",
    price: 25.0,
    cost: 18.0,
    stock: 15,
    minStock: 15,
    maxStock: 100,
    sku: "TOY-FIL-001",
    supplier: "Repuestos Toyota",
    location: "B2-C1",
    lastUpdated: "2024-01-14",
    status: "active",
  },
  {
    id: "3",
    name: "Lubricante Castrol GTX",
    brand: "Castrol",
    category: "lubricantes",
    price: 52.25,
    cost: 38.0,
    stock: 25,
    minStock: 20,
    maxStock: 80,
    sku: "CAS-GTX-001",
    supplier: "Castrol Ecuador",
    location: "C1-D2",
    lastUpdated: "2024-01-13",
    status: "active",
  },
  {
    id: "4",
    name: "Aditivo Limpiador STP",
    brand: "STP",
    category: "aditivos",
    price: 18.5,
    cost: 12.0,
    stock: 0,
    minStock: 25,
    maxStock: 100,
    sku: "STP-LIM-001",
    supplier: "Químicos del Sur",
    location: "D2-E1",
    lastUpdated: "2024-01-12",
    status: "active",
  },
  {
    id: "5",
    name: "Aceite Shell Helix",
    brand: "Shell",
    category: "aceites",
    price: 42.0,
    cost: 30.0,
    stock: 45,
    minStock: 15,
    maxStock: 60,
    sku: "SHL-HLX-001",
    supplier: "Shell Ecuador",
    location: "E1-F2",
    lastUpdated: "2024-01-11",
    status: "active",
  },
];

interface InventoryTableProps {
  filters: {
    category: string;
    brand: string;
    status: string;
    stockLevel: string;
    search: string;
  };
  onEditProduct: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
  onRegisterMovement?: (product: Product) => void;
  isLoading?: boolean;
  products?: Product[];
}

export function InventoryTable({
  filters,
  onEditProduct,
  onAdjustStock,
  onRegisterMovement,
  isLoading = false,
  products = mockProducts,
}: InventoryTableProps) {
  const isMobile = useIsMobile();
  const [sortField, setSortField] = useState<keyof Product>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      filters.category === "all" || product.category === filters.category;
    const matchesBrand =
      filters.brand === "all" || product.brand.toLowerCase() === filters.brand;
    const matchesStatus =
      filters.status === "all" || product.status === filters.status;
    const matchesSearch =
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.sku.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.brand.toLowerCase().includes(filters.search.toLowerCase());

    let matchesStockLevel = true;
    if (filters.stockLevel !== "all") {
      switch (filters.stockLevel) {
        case "low":
          matchesStockLevel =
            product.stock > 0 && product.stock <= product.minStock;
          break;
        case "normal":
          matchesStockLevel =
            product.stock > product.minStock &&
            product.stock < product.maxStock * 0.8;
          break;
        case "high":
          matchesStockLevel = product.stock >= product.maxStock * 0.8;
          break;
        case "out":
          matchesStockLevel = product.stock === 0;
          break;
      }
    }

    return (
      matchesCategory &&
      matchesBrand &&
      matchesStatus &&
      matchesSearch &&
      matchesStockLevel
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === "asc" ? 1 : -1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * direction;
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * direction;
    }
    return 0;
  });

  const getStockStatus = (product: Product) => {
    if (product.stock === 0)
      return { status: "out", color: "destructive", text: "Sin Stock" };
    if (product.stock <= product.minStock)
      return { status: "low", color: "destructive", text: "Stock Bajo" };
    if (product.stock >= product.maxStock * 0.8)
      return { status: "high", color: "default", text: "Stock Alto" };
    return { status: "normal", color: "secondary", text: "Stock Normal" };
  };

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Versión móvil simplificada - Card view
  const MobileProductCard = ({
    product,
    index,
  }: {
    product: Product;
    index: number;
  }) => {
    const stockStatus = getStockStatus(product);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className={`p-3 border rounded-lg mb-2 ${
          stockStatus.status === "out" || stockStatus.status === "low"
            ? "bg-destructive/5 border-destructive/20"
            : ""
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {(stockStatus.status === "out" ||
                stockStatus.status === "low") && (
                <AlertTriangle className="h-3 w-3 text-destructive" />
              )}
              <h4 className="font-medium text-sm truncate">{product.name}</h4>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{product.brand}</span>
              <span>•</span>
              <span>{product.sku}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => onEditProduct(product)}
                className="text-xs"
              >
                <Edit className="h-3 w-3 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAdjustStock(product)}
                className="text-xs"
              >
                <Settings className="h-3 w-3 mr-2" />
                Ajustar Stock
              </DropdownMenuItem>
              {onRegisterMovement && (
                <DropdownMenuItem
                  onClick={() => onRegisterMovement(product)}
                  className="text-xs"
                >
                  <Package className="h-3 w-3 mr-2" />
                  Registrar Movimiento
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Stock:</span>
            <div className="flex items-center gap-1 mt-1">
              <span
                className={
                  stockStatus.status === "out"
                    ? "text-destructive font-medium"
                    : ""
                }
              >
                {product.stock}/{product.maxStock}
              </span>
              {product.stock > product.minStock ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Precio:</span>
            <div className="font-medium mt-1">${product.price}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Estado:</span>
            <div className="mt-1">
              <Badge variant={stockStatus.color as any} className="text-xs">
                {stockStatus.text}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Ubicación:</span>
            <div className="mt-1">{product.location}</div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader className={isMobile ? "p-3" : "p-6"}>
          <CardTitle className="flex items-center gap-2">
            <Package className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
            <span className={isMobile ? "text-sm" : "text-lg"}>
              Productos ({sortedProducts.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-3" : "p-6"}>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-sm text-muted-foreground">
                  Cargando inventario...
                </span>
              </div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm mb-3">
                No se encontraron productos con los filtros seleccionados
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Reiniciar filtros
              </Button>
            </div>
          ) : isMobile ? (
            // Vista móvil - Cards
            <div className="space-y-2">
              {sortedProducts.map((product, index) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          ) : (
            // Vista desktop - Tabla
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer py-3"
                      onClick={() => handleSort("name")}
                    >
                      Producto
                      {sortField === "name" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer py-3"
                      onClick={() => handleSort("brand")}
                    >
                      Marca
                      {sortField === "brand" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer py-3"
                      onClick={() => handleSort("category")}
                    >
                      Categoría
                      {sortField === "category" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer py-3"
                      onClick={() => handleSort("stock")}
                    >
                      Stock
                      {sortField === "stock" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer py-3"
                      onClick={() => handleSort("price")}
                    >
                      Precio
                      {sortField === "price" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TableHead>
                    <TableHead className="py-3">Estado</TableHead>
                    <TableHead className="py-3">Ubicación</TableHead>
                    <TableHead className="text-right py-3">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.map((product, index) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={`hover:bg-muted/50 ${
                          stockStatus.status === "out" ||
                          stockStatus.status === "low"
                            ? "bg-destructive/5"
                            : ""
                        }`}
                      >
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            {(stockStatus.status === "out" ||
                              stockStatus.status === "low") && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.sku}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">{product.brand}</TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                stockStatus.status === "out"
                                  ? "text-destructive font-medium"
                                  : ""
                              }
                            >
                              {product.stock}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              / {product.maxStock}
                            </span>
                            {product.stock > product.minStock ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium py-3">
                          ${product.price}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge variant={stockStatus.color as any}>
                            {stockStatus.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-muted-foreground">
                          {product.location}
                        </TableCell>
                        <TableCell className="text-right py-3">
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
                                onClick={() => onEditProduct(product)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onAdjustStock(product)}
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Ajustar Stock
                              </DropdownMenuItem>
                              {onRegisterMovement && (
                                <DropdownMenuItem
                                  onClick={() => onRegisterMovement(product)}
                                >
                                  <Package className="h-4 w-4 mr-2" />
                                  Registrar Movimiento
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
