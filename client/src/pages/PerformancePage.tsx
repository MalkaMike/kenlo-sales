/**
 * Performance - Dashboard executivo para acompanhar performance de vendas
 * Visão de CEO com métricas de Kombos, MRR, implantações e ranking de vendedores
 *
 * Sub-modules:
 *   performance/performanceConstants.ts   — formatters, display-name maps, chart colors
 *   performance/performanceCalculators.ts — 7 pure metric calculators
 *   performance/DashboardMetricsCards.tsx — 6 KPI cards
 *   performance/PerformanceCharts.tsx     — MRR trend, Kombo pie, Plan bar
 *   performance/VendorRankingTable.tsx    — Vendor ranking table
 *   performance/FrequencyAddonCharts.tsx  — Frequency & add-on popularity
 *   performance/QuotesTable.tsx           — Recent quotes table + delete dialogs
 *   performance/PerformanceFilters.tsx    — View mode, quick period, filter panel
 */

import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, LogOut, Loader2 } from "lucide-react";
import { format, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from "xlsx";

import {
  formatCurrency,
  productNames,
  planNames,
  frequencyNames,
} from "./performance/performanceConstants";
import {
  calculateMetrics,
  calculateKomboBreakdown,
  calculatePlanBreakdown,
  calculateVendorRanking,
  calculateFrequencyBreakdown,
  calculateAddonPopularity,
  calculateTrendData,
} from "./performance/performanceCalculators";
import type { QuoteRecord } from "./performance/performanceCalculators";
import { MetricsCards } from "./performance/DashboardMetricsCards";
import { MrrTrendChart, BreakdownCharts } from "./performance/PerformanceCharts";
import { VendorRankingTable } from "./performance/VendorRankingTable";
import { FrequencyAddonCharts } from "./performance/FrequencyAddonCharts";
import { QuotesTable } from "./performance/QuotesTable";
import { PerformanceFilters } from "./performance/PerformanceFilters";

// ─── Helpers ────────────────────────────────────────────────────────────────

const parseJSON = (str: string | null) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function PerformancePage() {
  const { user, loading: authLoading, logout } = useAuth();

  // Derive current user info for the performance dashboard
  // All users who reach this page are admins (enforced by AuthGuard)
  const currentUser = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name || user.email || "Usuário",
      email: user.email || "",
      isAdmin: user.role === "admin",
    };
  }, [user]);

  const utils = trpc.useUtils();
  const { data: quotes, isLoading, refetch: refetchQuotes } = trpc.quotes.list.useQuery({ limit: 1000 });
  const { data: performanceMetrics, isLoading: metricsLoading } = trpc.quotes.performance.useQuery();

  const deleteMutation = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      refetchQuotes();
      utils.quotes.performance.invalidate();
    },
  });

  const deleteBatchMutation = trpc.quotes.deleteBatch.useMutation({
    onSuccess: (result) => {
      refetchQuotes();
      utils.quotes.performance.invalidate();
      setSelectedQuotes(new Set());
      if (result.errors && result.errors.length > 0) {
        alert(`${result.deletedCount} cotações apagadas. Erros: ${result.errors.join(", ")}`);
      }
    },
  });

  // ── Selection state ─────────────────────────────────────────────────────
  const [selectedQuotes, setSelectedQuotes] = useState<Set<number>>(new Set());

  // ── Filter state ────────────────────────────────────────────────────────
  const [filterVendor, setFilterVendor] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterKombo, setFilterKombo] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"team" | "individual">("team");
  const [quickPeriod, setQuickPeriod] = useState<"today" | "week" | "month" | "all">("all");


  // ── Delete dialogs ──────────────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<number | null>(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);

  // ── Quick period helper ─────────────────────────────────────────────────
  const applyQuickPeriod = (period: "today" | "week" | "month" | "all") => {
    setQuickPeriod(period);
    const today = new Date();
    switch (period) {
      case "today":
        setFilterDateFrom(format(startOfDay(today), "yyyy-MM-dd"));
        setFilterDateTo(format(today, "yyyy-MM-dd"));
        break;
      case "week":
        setFilterDateFrom(format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"));
        setFilterDateTo(format(today, "yyyy-MM-dd"));
        break;
      case "month":
        setFilterDateFrom(format(startOfMonth(today), "yyyy-MM-dd"));
        setFilterDateTo(format(today, "yyyy-MM-dd"));
        break;
      case "all":
        setFilterDateFrom("");
        setFilterDateTo("");
        break;
    }
  };

  // ── Selection handlers ──────────────────────────────────────────────────
  const toggleQuoteSelection = (quoteId: number) => {
    const next = new Set(selectedQuotes);
    if (next.has(quoteId)) next.delete(quoteId);
    else next.add(quoteId);
    setSelectedQuotes(next);
  };

  const toggleSelectAll = () => {
    if (!filteredQuotes || !currentUser) return;
    const deletable = filteredQuotes.filter(
      (q) => currentUser.isAdmin || q.userId === currentUser.id
    );
    if (selectedQuotes.size === deletable.length && deletable.length > 0) {
      setSelectedQuotes(new Set());
    } else {
      setSelectedQuotes(new Set(deletable.map((q) => q.id)));
    }
  };

  // ── Delete handlers ─────────────────────────────────────────────────────
  const handleDeleteClick = (quoteId: number) => {
    setQuoteToDelete(quoteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (quoteToDelete) {
      const result = await deleteMutation.mutateAsync({ id: quoteToDelete });
      if (!result.success && result.error) alert(result.error);
    }
    setDeleteDialogOpen(false);
    setQuoteToDelete(null);
  };

  const handleBatchDeleteConfirm = async () => {
    if (selectedQuotes.size > 0) {
      await deleteBatchMutation.mutateAsync({ ids: Array.from(selectedQuotes) });
    }
    setBatchDeleteDialogOpen(false);
  };

  // ── View mode side-effects ──────────────────────────────────────────────
  // When switching to individual mode, pre-select the current user's name
  const handleViewModeChange = (mode: "team" | "individual") => {
    setViewMode(mode);
    if (mode === "team") {
      setFilterVendor("all");
    } else if (currentUser) {
      // Pre-select current user's name for convenience
      setFilterVendor(currentUser.name);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // ── Filter logic ────────────────────────────────────────────────────────
  const filteredQuotes = (quotes as QuoteRecord[] | undefined)?.filter((quote) => {
    if (filterVendor && filterVendor !== "all" && quote.vendorName !== filterVendor) return false;
    if (filterKombo && filterKombo !== "all") {
      const quoteKombo = quote.komboId || "sem_kombo";
      if (quoteKombo !== filterKombo) return false;
    }
    const quoteDate = new Date(quote.createdAt);
    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      from.setHours(0, 0, 0, 0);
      if (quoteDate < from) return false;
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      if (quoteDate > to) return false;
    }
    return true;
  });

  const hasActiveFilters =
    filterVendor !== "all" || filterDateFrom !== "" || filterDateTo !== "" || filterKombo !== "all";
  const activeFilterCount = [
    filterVendor !== "all",
    filterDateFrom,
    filterDateTo,
    filterKombo !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterVendor("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterKombo("all");
  };

  const vendorNames = quotes
    ? Array.from(new Set((quotes as QuoteRecord[]).map((q) => q.vendorName).filter(Boolean) as string[]))
    : [];

  // ── Computed metrics ────────────────────────────────────────────────────
  const metrics = calculateMetrics(filteredQuotes);
  const komboBreakdown = calculateKomboBreakdown(filteredQuotes);
  const planBreakdown = calculatePlanBreakdown(filteredQuotes);
  const vendorRanking = calculateVendorRanking(filteredQuotes);
  const frequencyBreakdown = calculateFrequencyBreakdown(filteredQuotes);
  const addonPopularity = calculateAddonPopularity(filteredQuotes);
  const trendData = calculateTrendData(filteredQuotes);

  // ── Excel export ────────────────────────────────────────────────────────
  const exportToExcel = () => {
    if (!filteredQuotes || filteredQuotes.length === 0) {
      alert("Nenhuma cotação para exportar");
      return;
    }
    const excelData = filteredQuotes.map((quote) => {
      const totals = parseJSON(quote.totals ?? null);
      return {
        Data: format(new Date(quote.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        Ação: quote.action === "link_copied" ? "Link Copiado" : "PDF Exportado",
        Vendedor: quote.vendorName || "-",
        Cliente: quote.clientName || "-",
        Imobiliária: quote.agencyName || "-",
        Celular: quote.cellPhone || "-",
        Produto: productNames[quote.product ?? ""] || quote.product || "-",
        "Plano Imob": quote.imobPlan ? planNames[quote.imobPlan] : "-",
        "Plano Locação": quote.locPlan ? planNames[quote.locPlan] : "-",
        Kombo: quote.komboName || "Sem Kombo",
        "Desconto Kombo": quote.komboDiscount ? `${quote.komboDiscount}%` : "-",
        Frequência: frequencyNames[quote.frequency] || quote.frequency,
        "MRR (sem pós-pago)": totals?.monthly ? formatCurrency(totals.monthly) : "-",
        "MRR (com pós-pago)":
          totals?.monthly !== undefined
            ? formatCurrency(totals.monthly + (totals.postPaid || 0))
            : "-",
        Implantação: totals?.implantation ? formatCurrency(totals.implantation) : "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Performance");
    XLSX.writeFile(wb, `performance-${format(new Date(), "yyyy-MM-dd-HHmm")}.xlsx`);
  };

  // ── Loading / auth guard ────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) return null;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Performance</h1>
          </div>
          <p className="text-muted-foreground">
            Dashboard executivo - Acompanhe a performance de vendas do time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Logado como</p>
            <p className="font-medium">{currentUser.name}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      <PerformanceFilters
        currentUser={currentUser}
        vendorNames={vendorNames}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        quickPeriod={quickPeriod}
        onQuickPeriodChange={applyQuickPeriod}
        filterVendor={filterVendor}
        onFilterVendorChange={setFilterVendor}
        filterKombo={filterKombo}
        onFilterKomboChange={setFilterKombo}
        filterDateFrom={filterDateFrom}
        onFilterDateFromChange={setFilterDateFrom}
        filterDateTo={filterDateTo}
        onFilterDateToChange={setFilterDateTo}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        onExportExcel={exportToExcel}
      />

      <MetricsCards metrics={metrics} />

      <MrrTrendChart trendData={trendData} />

      <BreakdownCharts
        komboBreakdown={komboBreakdown}
        planBreakdown={planBreakdown}
      />

      <VendorRankingTable vendorRanking={vendorRanking} />

      <FrequencyAddonCharts
        frequencyBreakdown={frequencyBreakdown}
        addonPopularity={addonPopularity}
      />

      <QuotesTable
        quotes={filteredQuotes}
        isLoading={isLoading}
        currentUser={currentUser}
        selectedQuotes={selectedQuotes}
        onToggleSelection={toggleQuoteSelection}
        onToggleSelectAll={toggleSelectAll}
        onDeleteClick={handleDeleteClick}
        deleteDialogOpen={deleteDialogOpen}
        onDeleteDialogChange={setDeleteDialogOpen}
        onDeleteConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
        onBatchDeleteClick={() => setBatchDeleteDialogOpen(true)}
        batchDeleteDialogOpen={batchDeleteDialogOpen}
        onBatchDeleteDialogChange={setBatchDeleteDialogOpen}
        onBatchDeleteConfirm={handleBatchDeleteConfirm}
        isBatchDeleting={deleteBatchMutation.isPending}
      />
    </div>
  );
}
