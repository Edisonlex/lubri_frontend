"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/pos/product-grid";
import { ShoppingCart } from "@/components/pos/shopping-cart";
import { ProductSearch } from "@/components/pos/product-search";
import { CategoryFilter } from "@/components/pos/category-filter";
import { CustomerSelector } from "@/components/pos/customer-selector";
import { PaymentModal } from "@/components/pos/payment-modal";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart as CartIcon,
  Menu,
  X,
  Search,
  Users,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { POSProvider, usePOS } from "@/contexts/pos-context";
import { useIsMobile } from "@/hooks/use-mobile";

export default function POSPage() {
  return (
    <POSProvider>
      <POSContent />
    </POSProvider>
  );
}

function POSContent() {
  const { cartItemCount, clearCart } = usePOS();
  const [showPayment, setShowPayment] = useState(false);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Normal - Se desplaza con el contenido */}
      <header className="bg-background border-b">
        <div className="px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center">
                  <Package className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Punto de Venta
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t bg-muted/5 px-4 py-3"
            >
              <div className="space-y-3">
                <div>
                  <CustomerSelector />
                </div>
                <div className="space-y-2">
                  <ProductSearch />
                  <CategoryFilter />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {isMobile ? (
          <div className="h-full">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2 px-4 pt-3">
                <TabsTrigger
                  value="products"
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Productos
                </TabsTrigger>
                <TabsTrigger
                  value="customer"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Cliente
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="flex-1 mt-0 p-4">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <ProductSearch />
                    <CategoryFilter />
                  </div>
                  <ProductGrid />
                </div>
              </TabsContent>

              <TabsContent value="customer" className="flex-1 mt-0 p-4">
                <div className="space-y-4">
                  <CustomerSelector />
                </div>
              </TabsContent>
            </Tabs>

            {/* Botón del Carrito Móvil - Fijo en esquina */}
            <div className="fixed bottom-4 right-4 z-40">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg relative bg-primary hover:bg-primary/90"
                  >
                    <CartIcon className="h-5 w-5 text-primary-foreground" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-destructive text-destructive-foreground rounded-full flex items-center justify-center font-medium border border-background">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="bottom"
                  className="p-0 flex flex-col h-[80vh] rounded-t-2xl"
                >
                  <div className="flex-1 overflow-auto">
                    <ShoppingCart onCheckout={() => setShowPayment(true)} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        ) : (
          // Desktop - Layout
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Sección de Cliente */}
              <div className="bg-card rounded-lg border p-4">
                <CustomerSelector />
              </div>

              {/* Búsqueda y Filtros */}
              <div className="bg-card rounded-lg border p-4 space-y-4">
                <div className="space-y-2">
                  <ProductSearch />
                  <CategoryFilter />
                </div>
              </div>

              {/* Productos */}
              <div className="bg-card rounded-lg border p-4">
                <ProductGrid />
              </div>
            </div>

            {/* Botón del Carrito Desktop - Fijo en esquina */}
            <div className="fixed bottom-6 right-6 z-40">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    size="lg"
                    className="rounded-full shadow-lg px-6 py-6 relative bg-primary hover:bg-primary/90"
                  >
                    <CartIcon className="h-5 w-5 mr-2 text-primary-foreground" />
                    <span className="text-primary-foreground">Carrito</span>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 h-6 w-6 text-xs bg-destructive text-destructive-foreground rounded-full flex items-center justify-center font-medium border border-background">
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 flex flex-col w-96">
                  <div className="flex-1 overflow-auto">
                    <ShoppingCart onCheckout={() => setShowPayment(true)} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}
      </main>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentComplete={clearCart}
      />
    </div>
  );
}
