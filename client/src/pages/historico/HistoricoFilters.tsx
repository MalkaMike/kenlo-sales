/**
 * Filter panel for the Histórico page.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { VENDOR_NAMES } from "./historicoConstants";

interface Props {
  filterClient: string;
  setFilterClient: (v: string) => void;
  filterVendor: string;
  setFilterVendor: (v: string) => void;
  filterDateFrom: string;
  setFilterDateFrom: (v: string) => void;
  filterDateTo: string;
  setFilterDateTo: (v: string) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export function HistoricoFilters({
  filterClient, setFilterClient,
  filterVendor, setFilterVendor,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  showFilters, setShowFilters,
  hasActiveFilters, clearFilters,
}: Props) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Filtros</CardTitle>
            <CardDescription>Filtre os cotações por cliente, vendedor ou data</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Ocultar" : "Mostrar"}
          </Button>
        </div>
      </CardHeader>
      {showFilters && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filterClient">Nome do Cliente</Label>
              <Input
                id="filterClient"
                placeholder="Digite o nome..."
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterVendor">Vendedor</Label>
              <Select value={filterVendor} onValueChange={setFilterVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os vendedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os vendedores</SelectItem>
                  {VENDOR_NAMES.map((vendor) => (
                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterDateFrom">Data Inicial</Label>
              <Input
                id="filterDateFrom"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterDateTo">Data Final</Label>
              <Input
                id="filterDateTo"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
