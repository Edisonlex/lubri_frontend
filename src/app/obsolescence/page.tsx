"use client";

import { useState } from "react";
import { ObsolescenceTab } from "@/components/analytics/obsolescence-tab";
import { AnalyticsHeader } from "@/components/analytics/header";

export default function ObsolescencePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("6m");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();

  return (
    <div className="flex bg-background">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-6">
            <AnalyticsHeader
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              onDateRangeChange={setDateRange}
              title="Obsolescencia"
              subtitle="Identificación de productos sin venta en 6 meses e impacto"
              hideQuickLinks
            />
            <ObsolescenceTab selectedPeriod={selectedPeriod} dateRange={dateRange} />
          </div>
        </main>
      </div>
    </div>
  );
}