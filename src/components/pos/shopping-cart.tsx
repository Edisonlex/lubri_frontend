"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart as CartIcon,
  AlertTriangle,
  Receipt,
  User,
  X,
  CreditCard,
  Package,
  Search,
  Phone,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { usePOS } from "@/contexts/pos-context";
import { generateInvoicePDF, generateInvoiceNumber } from "./invoice-generator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShoppingCartProps {
  onCheckout: () => void;
}

export function ShoppingCart({ onCheckout }: ShoppingCartProps) {
  const {
    cartItems,
    updateQuantity,
    clearCart,
    cartTotal,
    selectedCustomer,
    setSelectedCustomer,
    customers,
  } = usePOS();
  const isMobile = useIsMobile();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const canCheckout = cartItems.length > 0 && selectedCustomer;
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-background to-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CartIcon className="h-6 w-6 text-primary" />
              </div>
              {itemCount > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold border-2 border-background"
                  variant="destructive"
                >
                  {itemCount}
                </Badge>
              )}
            </div>
            <div>
              <h2 className="font-semibold text-lg">Carrito de Compras</h2>
              <p className="text-sm text-muted-foreground">
                {itemCount} {itemCount === 1 ? "producto" : "productos"} en el
                carrito
              </p>
            </div>
          </div>
          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearCart}
              className="text-muted-foreground hover:text-destructive h-10 w-10"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Customer Info */}
      {selectedCustomer && (
        <div className="flex-shrink-0 p-4 bg-green-50 dark:bg-green-950/20 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-500 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-green-800 dark:text-green-200 truncate text-sm">
                {selectedCustomer.name}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 truncate">
                {selectedCustomer.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center mb-4">
            <CartIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Carrito vacío
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Agrega productos desde el catálogo para comenzar una venta
          </p>
        </div>
      ) : (
        <>
          {/* Scrollable Items */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              <AnimatePresence initial={false}>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20, height: 0 }}
                    transition={{ type: "spring", bounce: 0.2 }}
                    className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex gap-4">
                      {/* Product Image/Icon */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground leading-tight line-clamp-2 text-sm">
                              {item.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.category}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2 flex-shrink-0"
                            onClick={() => updateQuantity(item.id, 0)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="font-bold text-primary text-lg">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              ${item.price.toFixed(2)} c/u
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-base font-semibold text-foreground">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {item.quantity >= item.stock && item.stock > 0 && (
                      <div className="flex items-center gap-2 mt-3 p-2 bg-amber-50 dark:bg-amber-950/30 rounded text-amber-800 dark:text-amber-300 text-xs">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        <span className="font-medium">
                          Stock máximo: {item.stock} unidades
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

      {/* Footer */}
      <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm">
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">IVA (12%)</span>
                  <span className="font-semibold text-foreground">
                    ${(cartTotal * 0.12).toFixed(2)}
                  </span>
                </div>
                <Separator />
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-foreground">
                Total
              </span>
              <span className="font-bold text-2xl text-primary">
                ${(cartTotal * 1.12).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className={
                "rounded-lg border p-3 flex items-center gap-2 " +
                (selectedCustomer
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-amber-50 dark:bg-amber-950/20")
              }
              onClick={() => setShowCustomerList(true)}
            >
              <User className={"h-4 w-4 " + (selectedCustomer ? "text-green-700 dark:text-green-300" : "text-amber-600 dark:text-amber-400")} />
              <div className="text-xs">
                <p className="font-semibold">Cliente</p>
                <p className="text-muted-foreground">{selectedCustomer ? "Seleccionado" : "Falta seleccionar"}</p>
              </div>
            </div>
            <div className="rounded-lg border p-3 flex items-center gap-2 bg-muted/30">
              <CartIcon className="h-4 w-4 text-muted-foreground" />
              <div className="text-xs">
                <p className="font-semibold">Items</p>
                <p className="text-muted-foreground">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Preparación de pago</p>
            <Progress value={selectedCustomer ? 100 : 50} />
          </div>

          {/* Warnings */}
          {!selectedCustomer && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                    Cliente requerido
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 text-xs">
                    Selecciona un cliente para continuar con la venta
                  </p>
                </div>
              </div>
            </div>
          )}

              {/* Actions */}
              <div className="grid gap-3">
                <Button
                  variant="outline"
                  className="w-full h-12 font-semibold"
                  onClick={() => {
                    if (!selectedCustomer) return;
                    const subtotal = cartTotal;
                    const tax = subtotal * 0.12;
                    const total = subtotal + tax;
                    const invoiceData = {
                      invoiceNumber: generateInvoiceNumber(),
                      date: new Date().toLocaleString("es-EC", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      customer: selectedCustomer,
                      items: cartItems,
                      subtotal,
                      tax,
                      total,
                      paymentMethod: "Por definir",
                    };
                    generateInvoicePDF(invoiceData, { action: "print" });
                  }}
                  disabled={!canCheckout}
                >
                  <Receipt className="h-5 w-5 mr-2" />
                  Vista previa factura
                </Button>

                <Button
                  className="w-full h-14 text-lg font-semibold"
                  onClick={onCheckout}
                  disabled={!canCheckout}
                  size="lg"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceder al Pago
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      <Dialog open={showCustomerList} onOpenChange={setShowCustomerList}>
        <DialogContent className={`${isMobile ? "w-[95vw] max-w-md" : "sm:max-w-lg"}`}>
          <DialogHeader>
            <DialogTitle className="text-lg">Seleccionar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nombre, teléfono o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2">
              <AnimatePresence>
                {("consumidor final cf".includes(searchQuery.toLowerCase()) || searchQuery.trim() === "") && (
                  <motion.div
                    key="cf-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 border border-border rounded-lg cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 group"
                    onClick={() => {
                      setSelectedCustomer({
                        id: "CF",
                        name: "Consumidor Final",
                        email: "",
                        phone: "",
                        address: "",
                        city: "",
                        idNumber: "9999999999",
                        customerType: "individual",
                        vehicles: [],
                        totalPurchases: 0,
                        lastPurchase: "",
                        registrationDate: new Date().toISOString().split("T")[0],
                        status: "active",
                        notes: "",
                        preferredContact: "phone",
                      });
                      setShowCustomerList(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground truncate">
                            Consumidor Final
                          </p>
                          <Badge variant="outline" className="text-xs">
                            Individual
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Usar sin datos del cliente
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                {filteredCustomers.map((customer) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 border border-border rounded-lg cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 group"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowCustomerList(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground truncate">
                            {customer.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {customer.customerType === "business" ? "Empresa" : "Individual"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          )}
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
