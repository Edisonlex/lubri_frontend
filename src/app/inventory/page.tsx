// app/inventory/page.tsx (versión conectada)
"use client";

import { useState, useEffect } from "react";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { InventoryFilters } from "@/components/inventory/inventory-filters";
import { AddProductModal } from "@/components/inventory/add-product-modal";
import { StockAdjustmentModal } from "@/components/inventory/stock-adjustment-modal";
import { StockMovementModal } from "@/components/inventory/stock-movement-modal";
import { RealTimeInventory } from "@/components/inventory/real-time-inventory";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Download,
  Upload,
  BarChart2,
  History,
  Menu,
  Filter,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { api, Product } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExportModal } from "@/components/inventory/export-modal";
import { AnalyticsModal } from "@/components/inventory/analytics-modal";
import { useAlerts } from "@/contexts/alerts-context";
import { toast } from "sonner";
import type { InventoryFilters as InventoryFiltersType } from "@/lib/validation";
import type { Sale } from "@/lib/api";
import { useScrollIndicator } from "@/hooks/use-scroll-indicator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StockMovementHistory } from "@/components/inventory/stock-movement-history";

export default function InventoryPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { refreshAlerts } = useAlerts();
  const { scrollRef, canScroll, isScrolledLeft, scrollToActiveTab } = useScrollIndicator();
  const [activeTab, setActiveTab] = useState("inventory");

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockAdjustment, setShowStockAdjustment] = useState(false);
  const [showStockMovement, setShowStockMovement] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<InventoryFiltersType>({
    category: "all",
    brand: "all",
    status: "all",
    stockLevel: "all",
    obsolescence: "all",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [obsoleteProductIds, setObsoleteProductIds] = useState<Set<string>>(new Set());
  const [daysSinceLastSaleById, setDaysSinceLastSaleById] = useState<Map<string, number>>(new Map());

  // Estados para controlar la visibilidad de los modales en móvil
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showMovementHistory, setShowMovementHistory] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);

      const sales: Sale[] = await api.getSales();
      const lastSaleByProduct: Record<string, number | null> = {};
      data.forEach((p) => (lastSaleByProduct[p.id] = null));
      sales.forEach((s) => {
        s.items.forEach((item) => {
          const dt = new Date(s.date).getTime();
          const prev = lastSaleByProduct[item.productId];
          if (!prev || dt > prev) lastSaleByProduct[item.productId] = dt;
        });
      });
      const now = Date.now();
      const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
      const obsoleteIds = new Set<string>();
      const daysMap = new Map<string, number>();
      data.forEach((p) => {
        const last = lastSaleByProduct[p.id];
        const isObsolete = !last || now - last >= sixMonthsMs;
        if (isObsolete) obsoleteIds.add(p.id);
        const days = last ? Math.floor((now - last) / (1000 * 60 * 60 * 24)) : 9999;
        daysMap.set(p.id, days);
      });
      setObsoleteProductIds(obsoleteIds);
      setDaysSinceLastSaleById(daysMap);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Error al cargar los productos");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    await refreshAlerts(); // Actualizar alertas también
    toast.success("Inventario actualizado");
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleProductSaved = () => {
    loadProducts(); // Recargar productos después de guardar
  };

  const handleStockUpdated = () => {
    loadProducts(); // Recargar productos después de ajustar stock
  };

  // Botones para móvil en dropdown
  const MobileActionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setShowAddProduct(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowExportModal(true)}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowAnalyticsModal(true)}>
          <BarChart2 className="h-4 w-4 mr-2" />
          Análisis
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowMovementHistory(true)}>
          <History className="h-4 w-4 mr-2" />
          Movimientos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Botones principales para desktop
  const DesktopButtons = () => (
    <div className="flex flex-row flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={refreshing}
        className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${
            refreshing ? "animate-spin" : ""
          }`}
        />
        {refreshing ? "Actualizando..." : "Actualizar"}
      </Button>

      <ExportModal products={products} />

      <Button
        onClick={() => setShowAddProduct(true)}
        className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
        size="sm"
      >
        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        Nuevo Producto
      </Button>

      <AnalyticsModal products={products} />

     
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-3 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  Gestión de Inventario
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Administra productos, stock y precios • {products.length}{" "}
                  productos
                </p>
              </div>
              {isMobile && <MobileActionsDropdown />}
            </div>

            {!isMobile && <DesktopButtons />}
          </div>
        </div>
      </motion.div>

      <Tabs 
        defaultValue="inventory" 
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          scrollToActiveTab(value);
        }}
        className="w-full"
      >
        <TabsList 
          ref={scrollRef}
          className={`w-full overflow-x-auto flex gap-2 min-w-max mb-4 h-10 sm:grid sm:grid-cols-3 ${canScroll ? 'can-scroll' : ''} ${isScrolledLeft ? 'scrolled-left' : ''}`}
        >
          <TabsTrigger value="inventory" className="text-xs sm:text-sm">
            Inventario
          </TabsTrigger>
          <TabsTrigger value="realtime" className="text-xs sm:text-sm">
            Tiempo Real
          </TabsTrigger>
          <TabsTrigger value="movements" className="text-xs sm:text-sm">
            Movimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Header de productos con botón de filtros para móvil */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Productos</h3>
            {isMobile && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>
            )}
          </div>

          {/* Filtros para desktop (siempre visibles) */}
          {!isMobile && (
            <InventoryFilters filters={filters} setFilters={setFilters} />
          )}

          {/* Filtros para móvil (expandibles) */}
          <AnimatePresence>
            {isMobile && showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border rounded-lg p-4 bg-background">
                  <InventoryFilters filters={filters} setFilters={setFilters} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-hidden">
            <InventoryTable
              filters={filters}
              products={products}
              isLoading={isLoading}
              obsoleteProductIds={obsoleteProductIds}
              daysSinceLastSaleById={daysSinceLastSaleById}
              onEditProduct={(product) => {
                setSelectedProduct(product);
                setShowAddProduct(true);
              }}
              onAdjustStock={(product) => {
                setSelectedProduct(product);
                setShowStockAdjustment(true);
              }}
              onRegisterMovement={(product: Product) => {
                setSelectedProduct(product);
                setShowStockMovement(true);
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="realtime">
          <div className="overflow-hidden">
            <RealTimeInventory />
          </div>
        </TabsContent>
        <TabsContent value="movements" className="space-y-4">
          <StockMovementHistory />
        </TabsContent>
      </Tabs>

      <AddProductModal
        isOpen={showAddProduct}
        onClose={() => {
          setShowAddProduct(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onProductSaved={handleProductSaved}
      />

      <StockAdjustmentModal
        isOpen={showStockAdjustment}
        onClose={() => {
          setShowStockAdjustment(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onStockUpdated={handleStockUpdated}
      />

      <StockMovementModal
        isOpen={showStockMovement}
        onClose={() => {
          setShowStockMovement(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      {/* Modales para móvil - controlados por estado */}
      {isMobile && (
        <>
          <ExportModal
            products={products}
            open={showExportModal}
            onOpenChange={setShowExportModal}
          />

          <AnalyticsModal
            products={products}
            open={showAnalyticsModal}
            onOpenChange={setShowAnalyticsModal}
          />
        </>
      )}
    </div>
  );
}
