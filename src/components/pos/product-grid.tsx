"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePOS, type Product } from "@/contexts/pos-context";
import { useIsMobile } from "@/hooks/use-mobile";

export function ProductGrid() {
  const { products, addToCart, searchQuery, selectedCategory } = usePOS();
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = isMobile ? 6 : 8;

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    const productName = product.name || "";
    const productBrand = product.brand || "";
    const query = searchQuery || "";

    const matchesSearch =
      productName.toLowerCase().includes(query.toLowerCase()) ||
      productBrand.toLowerCase().includes(query.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div
        className={`grid gap-6 ${
          isMobile
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-foreground">
            {filteredProducts.length} productos encontrados
          </p>
          <p className="text-sm text-muted-foreground">
            {selectedCategory !== "all"
              ? `En ${selectedCategory}`
              : "En todas las categorías"}
          </p>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">
              Página {currentPage} de {totalPages}
            </span>
          </div>
        )}
      </div>

      {/* Products Grid - Cards grandes con colores originales */}
      <div
        className={`grid gap-6 ${
          isMobile
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        <AnimatePresence mode="popLayout">
          {currentProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              layout
            >
              <Card className="h-full border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Header con Categoría y Stock */}
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {product.category}
                    </Badge>
                    {product.stock <= 5 && (
                      <Badge
                        variant={
                          product.stock === 0 ? "destructive" : "outline"
                        }
                        className="text-xs font-medium"
                      >
                        {product.stock === 0
                          ? "Agotado"
                          : `Stock: ${product.stock}`}
                      </Badge>
                    )}
                  </div>

                  {/* Product Image/Icon Area - Más grande */}
                  <div className="relative mb-4">
                    <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Package className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 space-y-4 mb-5">
                    {/* Product Name and Brand */}
                    <div>
                      <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {product.brand}
                      </p>
                    </div>

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-2xl text-primary">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground block">
                          c/u
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">
                          {product.stock} unidades
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button - Más grande */}
                  <Button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full transition-all duration-200 font-medium py-3 ${
                      product.stock === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105 hover:shadow-md"
                    }`}
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No se encontraron productos
          </h3>
          <p className="text-sm text-muted-foreground/80 max-w-md">
            {searchQuery
              ? `No hay productos que coincidan con "${searchQuery}"`
              : "No hay productos disponibles en esta categoría"}
          </p>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t gap-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-
            {Math.min(endIndex, filteredProducts.length)} de{" "}
            {filteredProducts.length} productos
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-10 px-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="h-10 w-10 p-0 text-sm font-medium"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-10 px-4"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
