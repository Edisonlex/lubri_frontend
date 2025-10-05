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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePOS } from "@/contexts/pos-context";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShoppingCartProps {
  onCheckout: () => void;
}

export function ShoppingCart({ onCheckout }: ShoppingCartProps) {
  const { cartItems, updateQuantity, clearCart, cartTotal, selectedCustomer } =
    usePOS();
  const isMobile = useIsMobile();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const canCheckout = cartItems.length > 0 && selectedCustomer;

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
                    /* Generate invoice preview */
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
    </div>
  );
}
