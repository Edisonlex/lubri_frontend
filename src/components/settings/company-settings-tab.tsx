import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, CompanySettings, Branch } from "@/lib/api";

interface CompanySettingsTabProps {
  companyData: CompanySettings;
  setCompanyData: (data: CompanySettings) => void;
  branches: Branch[];
  setBranches: (branches: Branch[]) => void;
}

export function CompanySettingsTab({
  companyData,
  setCompanyData,
  branches,
  setBranches,
}: CompanySettingsTabProps) {
  const handleSaveCompany = async () => {
    try {
      await api.updateCompanySettings(companyData);
      toast.success("Información de empresa actualizada correctamente");
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Error al guardar la información de la empresa");
    }
  };

  const handleAddBranch = async () => {
    try {
      const newBranch = await api.createBranch({
        name: "Nueva Sucursal",
        address: "",
        phone: "",
        email: "",
        isMain: false,
        status: "active",
      });
      setBranches([...branches, newBranch]);
      toast.success("Sucursal agregada");
    } catch (error) {
      console.error("Error adding branch:", error);
      toast.error("Error al agregar la sucursal");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información de la Empresa
          </CardTitle>
          <CardDescription>
            Configura los datos básicos de tu lubricadora
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <Input
                id="company-name"
                value={companyData.name}
                onChange={(e) =>
                  setCompanyData({ ...companyData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-ruc">RUC</Label>
              <Input
                id="company-ruc"
                value={companyData.ruc}
                onChange={(e) =>
                  setCompanyData({ ...companyData, ruc: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-address">Dirección</Label>
            <Textarea
              id="company-address"
              value={companyData.address}
              onChange={(e) =>
                setCompanyData({ ...companyData, address: e.target.value })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-phone">Teléfono</Label>
              <Input
                id="company-phone"
                value={companyData.phone}
                onChange={(e) =>
                  setCompanyData({ ...companyData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={companyData.email}
                onChange={(e) =>
                  setCompanyData({ ...companyData, email: e.target.value })
                }
              />
            </div>
          </div>

          <Button onClick={handleSaveCompany} className="w-full">
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Sucursales</CardTitle>
          <CardDescription>
            Gestiona múltiples ubicaciones de tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{branch.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {branch.address}
                  </p>
                </div>
                {branch.isMain ? (
                  <Badge>Principal</Badge>
                ) : (
                  <Badge variant="secondary">
                    {branch.status === "active" ? "Activa" : "Inactiva"}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleAddBranch}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Sucursal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
