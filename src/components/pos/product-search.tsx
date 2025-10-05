"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePOS } from "@/contexts/pos-context";
import { useIsMobile } from "@/hooks/use-mobile";

export function ProductSearch() {
  const { searchQuery, setSearchQuery } = usePOS();
  const isMobile = useIsMobile();

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="w-full">
      <div className="relative group">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 transition-colors duration-200 group-focus-within:text-primary">
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
        </div>
        <Input
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`
            pl-10 pr-10 w-full
            bg-background/50 border-border/60 
            focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20
            hover:border-border hover:bg-background/80
            transition-all duration-200 ease-in-out
            placeholder:text-muted-foreground/70
            ${searchQuery ? "border-primary/50 bg-background" : ""}
          `}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
