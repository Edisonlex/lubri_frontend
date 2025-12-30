"use client";

import { ClassificationPanel } from "@/components/classification/classification-panel";
import { AnalyticsHeader } from "@/components/analytics/header";

export default function ClassificationPage() {
  return (
    <div className="flex bg-background">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-6">
            <AnalyticsHeader
              selectedPeriod={"6m"}
              onPeriodChange={() => {}}
              title="Clasificación Automática"
              subtitle="Categorización inteligente por rotación y margen"
              hideQuickLinks
            />
            <ClassificationPanel />
          </div>
        </main>
      </div>
    </div>
  );
}