"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile"; // Asegúrate de que la ruta sea correcta

interface CustomDateRange {
  from: Date;
  to: Date;
}

interface DatePickerWithRangeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: CustomDateRange | undefined;
  onChange?: (range: CustomDateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  value,
  onChange,
  ...props
}: DatePickerWithRangeProps) {
  const isMobile = useIsMobile();

  // Inicializar con la fecha actual como rango por defecto (hoy mismo)
  const [internalDate, setInternalDate] = React.useState<
    CustomDateRange | undefined
  >(() => {
    const today = new Date();
    return {
      from: today,
      to: today,
    };
  });

  const date = value !== undefined ? value : internalDate;

  const handleDateChange = (
    newDate: { from?: Date; to?: Date } | undefined
  ) => {
    if (onChange) {
      onChange(newDate as CustomDateRange | undefined);
    } else {
      setInternalDate(newDate as CustomDateRange | undefined);
    }
  };

  // Formatear fecha para mostrar de manera más compacta en móviles
  const formatDateForDisplay = (dateObj: Date) => {
    if (isMobile) {
      // Formato corto para móviles: DD/MM/YYYY
      return dateObj.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    // Formato completo para desktop
    return dateObj.toLocaleDateString();
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              "sm:w-[300px]", // Ancho fijo solo en desktop
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  <span className="hidden sm:inline">
                    {date.from.toLocaleDateString()} -{" "}
                    {date.to.toLocaleDateString()}
                  </span>
                  <span className="sm:hidden">
                    {formatDateForDisplay(date.from)} -{" "}
                    {formatDateForDisplay(date.to)}
                  </span>
                </>
              ) : (
                formatDateForDisplay(date.from)
              )
            ) : (
              <span>Seleccionar fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={isMobile ? 1 : 2} // Solo 1 mes en móviles, 2 en desktop
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
