"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { usePOS } from "@/contexts/pos-context";
import { useIsMobile } from "@/hooks/use-mobile";

const categories = [
  { id: "all", name: "Todos", emoji: "📦" },
  { id: "aceites", name: "Aceites", emoji: "🛢️" },
  { id: "filtros", name: "Filtros", emoji: "🔎" },
  { id: "lubricantes", name: "Lubricantes", emoji: "💧" },
  { id: "aditivos", name: "Aditivos", emoji: "🧪" },
  { id: "baterias", name: "Baterías", emoji: "🔋" },
  { id: "frenos", name: "Frenos", emoji: "🛑" },
  { id: "motor", name: "Motor", emoji: "⚙️" },
];

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = usePOS();
  const isMobile = useIsMobile();

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 p-1">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              size={isMobile ? "sm" : "default"}
              className={`
                whitespace-nowrap flex-shrink-0 transition-all duration-200
                ${
                  isMobile ? "text-xs px-4 py-3 h-10" : "text-sm px-5 py-4 h-12"
                }
                ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-background hover:bg-accent hover:text-accent-foreground border-border hover:scale-105"
                }
                font-medium rounded-lg
              `}
            >
              <span className="mr-2 text-base">{category.emoji}</span>
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
}
