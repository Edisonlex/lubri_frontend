"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Brain, ListTree, ThumbsUp, ThumbsDown, Info, Download, CheckCircle } from "lucide-react";
import { api, type Product, classifyProductCategory } from "@/lib/api";
import { reportsService } from "@/lib/reports-service";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { exportToExcel, exportToPDF } from "@/lib/export-utils";

interface DecisionLog {
  productId: string;
  productName: string;
  decision: string;
  explanation: string;
  timestamp: string;
  predictedCategory: string;
  currentCategory: string;
  confidence: number;
  feedback?: "up" | "down";
}

export function ClassificationPanel() {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [classification, setClassification] = useState<any>(null);
  const [logs, setLogs] = useState<DecisionLog[]>([]);

  

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [data, autoClass] = await Promise.all([
          reportsService.getProducts(),
          reportsService.getProductClassification(),
        ]);
        setProducts(data);
        setClassification(autoClass);
        const initialLogs: DecisionLog[] = data.map((p) => {
          const res = classifyProductCategory(p);
          return {
            productId: p.id,
            productName: p.name,
            decision: `${res.category} • Confianza ${(res.confidence * 100).toFixed(0)}%`,
            explanation: res.reasons.join("; "),
            timestamp: new Date().toISOString(),
            predictedCategory: res.category,
            currentCategory: p.category,
            confidence: res.confidence,
          };
        });
        setLogs(initialLogs);
      } catch (e) {
        console.error("Error loading classification", e);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recalculate = () => {
    const newLogs: DecisionLog[] = products.map((p) => {
      const res = classifyProductCategory(p);
      return {
        productId: p.id,
        productName: p.name,
        decision: `${res.category} • Confianza ${(res.confidence * 100).toFixed(0)}%`,
        explanation: res.reasons.join("; "),
        timestamp: new Date().toISOString(),
        predictedCategory: res.category,
        currentCategory: p.category,
        confidence: res.confidence,
      };
    });
    setLogs(newLogs);
    toast.success("Clasificación automática recalculada");
  };

  const applyFeedback = (log: DecisionLog, type: "up" | "down") => {
    setLogs((prev) => prev.map((l) => (l.productId === log.productId ? { ...l, feedback: type } : l)));
    toast.message("Feedback registrado");
  };

  const applyCorrections = async () => {
    const toFix = logs.filter((l) => l.predictedCategory !== l.currentCategory);
    if (toFix.length === 0) {
      toast.info("No hay correcciones pendientes");
      return;
    }
    try {
      await Promise.all(
        toFix.map((l) =>
          api.updateProduct(l.productId, { category: l.predictedCategory as any })
        )
      );
      toast.success("Categorías actualizadas automáticamente");
      recalculate();
    } catch (e) {
      console.error(e);
      toast.error("Error aplicando correcciones");
    }
  };

  const exportSummary = (type: "excel" | "pdf") => {
    const headers = ["Categoría", "Cantidad", "Ejemplos"];
    const examples = (arr: Product[]) => arr.slice(0, 3).map((p) => p.name).join(", ");
    const data = [
      ["Aceites", classification?.byCategory?.aceites?.length || 0, examples(classification?.byCategory?.aceites || [])],
      ["Filtros", classification?.byCategory?.filtros?.length || 0, examples(classification?.byCategory?.filtros || [])],
      ["Lubricantes", classification?.byCategory?.lubricantes?.length || 0, examples(classification?.byCategory?.lubricantes || [])],
      ["Aditivos", classification?.byCategory?.aditivos?.length || 0, examples(classification?.byCategory?.aditivos || [])],
    ];
    const fileName = `Resumen_Clasificacion_${new Date().toISOString().split("T")[0]}`;
    if (type === "excel") {
      exportToExcel({ headers, data, fileName });
      toast.success("Resumen exportado a Excel");
    } else {
      exportToPDF({ headers, data, fileName });
      toast.success("Resumen exportado a PDF");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="process" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="process">Resumen</TabsTrigger>
          <TabsTrigger value="logs">Registros</TabsTrigger>
        </TabsList>

        <TabsContent value="process" className="space-y-4">
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">Panel IA</CardTitle>
                <CardDescription className="text-xs">Clasificación automática visible</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Motor activo</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">Aprendizaje Continuo</CardTitle>
                <CardDescription className="text-xs">Basado en feedback</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ListTree className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Ajuste de umbrales</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">Correcciones Automáticas</CardTitle>
                <CardDescription className="text-xs">Aplicar correcciones sugeridas</CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
                <Button onClick={applyCorrections} size="sm" className="w-full sm:w-auto">
                  <CheckCircle className="h-4 w-4 mr-2" /> Aplicar correcciones
                </Button>
                <Button variant="outline" onClick={recalculate} size="sm" className="w-full sm:w-auto">
                  <ListTree className="h-4 w-4 mr-2" /> Recalcular
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">Explicabilidad</CardTitle>
                <CardDescription className="text-xs">Motivos de decisiones</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Comparación con umbrales</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Resumen de Clasificación</CardTitle>
              <CardDescription className="text-xs">Agrupación automática por categoría y precisión</CardDescription>
              <div className="mt-2 flex items-center gap-2">
                <Button variant="default" size="sm" onClick={() => exportSummary("excel")}>
                  <Download className="h-4 w-4 mr-2" /> Exportar resumen
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportSummary("pdf")}>
                  <Download className="h-4 w-4 mr-2" /> Exportar PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-md p-3">
                  <div className="text-sm font-medium">Aceites</div>
                  <Badge variant="secondary" className="mt-2">{classification?.byCategory?.aceites?.length || 0} productos</Badge>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-sm font-medium">Filtros</div>
                  <Badge variant="secondary" className="mt-2">{classification?.byCategory?.filtros?.length || 0} productos</Badge>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-sm font-medium">Lubricantes</div>
                  <Badge variant="secondary" className="mt-2">{classification?.byCategory?.lubricantes?.length || 0} productos</Badge>
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-sm font-medium">Aditivos</div>
                  <Badge variant="secondary" className="mt-2">{classification?.byCategory?.aditivos?.length || 0} productos</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="border rounded-md p-3">
                  <div className="text-sm font-medium">Precisión esperada</div>
                  <Badge variant="secondary" className="mt-2">{Math.round((classification?.accuracyEstimate || 0.95) * 100)}%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Registros de decisiones</CardTitle>
              <CardDescription className="text-xs">Historial detallado de clasificaciones</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">Producto</TableHead>
                      <TableHead className="w-48">Decisión</TableHead>
                      <TableHead className="sm:w-[420px] w-[240px]">Explicación</TableHead>
                      <TableHead className="w-40">Fecha</TableHead>
                      <TableHead className="w-32">Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((l) => (
                      <TableRow key={`${l.productId}-${l.timestamp}`}>
                        <TableCell className="font-medium">{l.productName}</TableCell>
                        <TableCell>{l.decision}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-normal break-words sm:max-w-[420px] max-w-[240px]">{l.explanation}</TableCell>
                        <TableCell>{new Date(l.timestamp).toLocaleString("es-ES")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant={l.feedback === "up" ? "default" : "outline"} size="sm" onClick={() => applyFeedback(l, "up")}>
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button variant={l.feedback === "down" ? "default" : "outline"} size="sm" onClick={() => applyFeedback(l, "down")}>
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {logs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">Sin registros</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        
      </Tabs>
    </div>
  );
}