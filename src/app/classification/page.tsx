"use client";

import { useState } from "react";
import { ClassificationPanel } from "@/components/classification/classification-panel";
import { AnalyticsHeader } from "@/components/analytics/header";

export default function ClassificationPage() {
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
              title="Clasificación Automática"
              subtitle="Categorización inteligente por rotación y margen"
              hideQuickLinks
              hideFilters
            />
            <ClassificationPanel selectedPeriod={selectedPeriod} dateRange={dateRange} />
          </div>
        </main>
      </div>
    </div>
  );
}