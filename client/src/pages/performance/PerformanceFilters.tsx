/**
 * PerformanceFilters — View mode toggle, quick period selector, and expandable filter panel.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X, Users, User, Download } from "lucide-react";

interface SalespersonInfo {
  name: string;
  isMaster?: boolean;
}

interface PerformanceFiltersProps {
  salesperson: SalespersonInfo;
  vendorNames: string[];
  // View mode
  viewMode: "team" | "individual";
  onViewModeChange: (mode: "team" | "individual") => void;
  // Quick period
  quickPeriod: "today" | "week" | "month" | "all";
  onQuickPeriodChange: (period: "today" | "week" | "month" | "all") => void;
  // Filters
  filterVendor: string;
  onFilterVendorChange: (value: string) => void;
  filterKombo: string;
  onFilterKomboChange: (value: string) => void;
  filterDateFrom: string;
  onFilterDateFromChange: (value: string) => void;
  filterDateTo: string;
  onFilterDateToChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onClearFilters: () => void;
  // Export
  onExportExcel: () => void;
}

export function PerformanceFilters({
  salesperson,
  vendorNames,
  viewMode,
  onViewModeChange,
  quickPeriod,
  onQuickPeriodChange,
  filterVendor,
  onFilterVendorChange,
  filterKombo,
  onFilterKomboChange,
  filterDateFrom,
  onFilterDateFromChange,
  filterDateTo,
  onFilterDateToChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  activeFilterCount,
  onClearFilters,
  onExportExcel,
}: PerformanceFiltersProps) {
  return (
    <>
      {/* View Mode + Quick Period + Actions */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === "team" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("team")}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Time Inteiro
          </Button>
          <Button
            variant={viewMode === "individual" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("individual")}
            className="gap-2"
          >
            <User className="w-4 h-4" />
            Individual
          </Button>
        </div>

        {viewMode === "individual" && (
          <Select value={filterVendor} onValueChange={onFilterVendorChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione um vendedor" />
            </SelectTrigger>
            <SelectContent>
              {salesperson.isMaster && (
                <SelectItem value="all">Todos os vendedores</SelectItem>
              )}
              {vendorNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Quick Period Filters */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 overflow-x-auto w-full sm:w-auto">
          {(["today", "week", "month", "all"] as const).map((period) => (
            <Button
              key={period}
              variant={quickPeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => onQuickPeriodChange(period)}
              className="text-xs px-2 sm:px-3 whitespace-nowrap"
            >
              {period === "today"
                ? "Hoje"
                : period === "week"
                ? "Esta semana"
                : period === "month"
                ? "Este mês"
                : "Todo período"}
            </Button>
          ))}
        </div>

        <div className="flex-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <Button onClick={onExportExcel} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Expandable Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Vendedor</Label>
                <Select value={filterVendor} onValueChange={onFilterVendorChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {vendorNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kombo</Label>
                <Select value={filterKombo} onValueChange={onFilterKomboChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                    <SelectItem value="core_gestao">Core Gestão</SelectItem>
                    <SelectItem value="imob_pro">Imob Pro</SelectItem>
                    <SelectItem value="imob_start">Imob Start</SelectItem>
                    <SelectItem value="loc_pro">Locação Pro</SelectItem>
                    <SelectItem value="sem_kombo">Sem Kombo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data inicial</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => onFilterDateFromChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Data final</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => onFilterDateToChange(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
