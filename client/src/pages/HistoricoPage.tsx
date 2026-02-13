/**
 * Histórico de Cotações — Thin orchestrator.
 * All sub-components live in ./historico/ sub-modules.
 */

import { useState } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

import { buildChartData } from "./historico/historicoChartData";
import { HistoricoCharts } from "./historico/HistoricoCharts";
import { HistoricoFilters } from "./historico/HistoricoFilters";
import { HistoricoDesktopTable, HistoricoMobileCards } from "./historico/HistoricoTable";
import { exportQuotesToExcel } from "./historico/historicoExcelExport";

export default function HistoricoPage() {
  const utils = trpc.useUtils();
  const { data: quotes, isLoading, error } = trpc.quotes.list.useQuery({ limit: 100 });
  const { data: stats } = trpc.quotes.stats.useQuery();
  const deleteMutation = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      utils.quotes.list.invalidate();
      utils.quotes.stats.invalidate();
    },
    onError: () => console.error("Erro ao deletar cotação"),
  });

  // Filter states
  const [filterClient, setFilterClient] = useState("");
  const [filterVendor, setFilterVendor] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setQuoteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (quoteToDelete !== null) {
      deleteMutation.mutate({ id: quoteToDelete });
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    }
  };

  // Filter quotes
  const filteredQuotes = quotes?.filter((quote) => {
    if (filterClient && !quote.clientName?.toLowerCase().includes(filterClient.toLowerCase())) return false;
    if (filterVendor && filterVendor !== "all" && quote.vendorName !== filterVendor) return false;
    const quoteDate = new Date(quote.createdAt);
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (quoteDate < fromDate) return false;
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      if (quoteDate > toDate) return false;
    }
    return true;
  });

  const hasActiveFilters = !!(filterClient || filterVendor || filterDateFrom || filterDateTo);
  const clearFilters = () => {
    setFilterClient("");
    setFilterVendor("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const chartData = buildChartData(filteredQuotes || []);

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Histórico de Cotações</h1>
            <p className="text-muted-foreground">
              Consulte todos os cotações gerados (links copiados e PDFs exportados)
            </p>
          </div>
          <Button
            onClick={() => exportQuotesToExcel(filteredQuotes || [])}
            variant="outline"
            className="gap-2"
            disabled={!filteredQuotes || filteredQuotes.length === 0}
          >
            <Download className="w-4 h-4" />
            Exportar para Excel
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Cotações</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Links Copiados
                </CardDescription>
                <CardTitle className="text-3xl text-blue-600">{stats.linksCopied}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  PDFs Exportados
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats.pdfsExported}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Charts */}
        {filteredQuotes && filteredQuotes.length > 0 && (
          <HistoricoCharts chartData={chartData} />
        )}

        {/* Filters */}
        <HistoricoFilters
          filterClient={filterClient} setFilterClient={setFilterClient}
          filterVendor={filterVendor} setFilterVendor={setFilterVendor}
          filterDateFrom={filterDateFrom} setFilterDateFrom={setFilterDateFrom}
          filterDateTo={filterDateTo} setFilterDateTo={setFilterDateTo}
          showFilters={showFilters} setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters} clearFilters={clearFilters}
        />

        {/* Desktop Table */}
        <HistoricoDesktopTable
          quotes={quotes}
          filteredQuotes={filteredQuotes}
          isLoading={isLoading}
          error={error}
          hasActiveFilters={hasActiveFilters}
          onDeleteClick={handleDeleteClick}
        />

        {/* Mobile Cards */}
        <HistoricoMobileCards
          filteredQuotes={filteredQuotes}
          isLoading={isLoading}
          error={error}
          hasActiveFilters={hasActiveFilters}
          onDeleteClick={handleDeleteClick}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este cotação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deletando...</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> Deletar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
