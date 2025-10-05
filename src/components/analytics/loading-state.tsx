"use client";

export function LoadingState() {
  return (
    <div className="flex bg-background">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando análisis...</p>
          </div>
        </main>
      </div>
    </div>
  );
}
