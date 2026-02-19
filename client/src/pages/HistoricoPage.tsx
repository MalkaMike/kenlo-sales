/**
 * Histórico de Cotações — Thin orchestrator.
 * All sub-components live in ./historico/ sub-modules.
 */

import { useState } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, Download, Loader2, Trash2, AlertTriangle, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { buildChartData } from "./historico/historicoChartData";
import { HistoricoCharts } from "./historico/HistoricoCharts";
import { HistoricoFilters } from "./historico/HistoricoFilters";
import { HistoricoDesktopTable, HistoricoMobileCards } from "./historico/HistoricoTable";
import { exportQuotesToExcel } from "./historico/historicoExcelExport";

export default function HistoricoPage() {
  const utils = trpc.useUtils();
  const { isAdmin } = useAuth();

  const { data: quotes, isLoading, error } = trpc.quotes.list.useQuery({ limit: 100 });
  const { data: stats } = trpc.quotes.stats.useQuery();

  const deleteMutation = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      utils.quotes.list.invalidate();
      utils.quotes.stats.invalidate();
      toast.success("Cotação excluída", { description: "A cotação foi removida com sucesso." });
    },
    onError: (err) => {
      toast.error("Erro", { description: err.message });
    },
  });

  const deleteBatchMutation = trpc.quotes.deleteBatch.useMutation({
    onSuccess: (result) => {
      utils.quotes.list.invalidate();
      utils.quotes.stats.invalidate();
      toast.success("Cotações excluídas", {
        description: `${result.deletedCount} cotação(ões) removida(s) com sucesso.`,
      });
      setSelectedIds(new Set());
    },
    onError: (err) => {
      toast.error("Erro", { description: err.message });
    },
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

  // Batch selection (admin only)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);

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

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!filteredQuotes) return;
    if (selectedIds.size === filteredQuotes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuotes.map((q) => q.id)));
    }
  };

  const handleBatchDeleteConfirm = () => {
    deleteBatchMutation.mutate({ ids: Array.from(selectedIds) });
    setBatchDeleteDialogOpen(false);
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
          <div className="flex gap-2">
            {isAdmin && selectedIds.size > 0 && (
              <Button
                onClick={() => setBatchDeleteDialogOpen(true)}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir {selectedIds.size} selecionada(s)
              </Button>
            )}
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

        {/* Admin batch select header */}
        {isAdmin && filteredQuotes && filteredQuotes.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              checked={selectedIds.size === filteredQuotes.length && filteredQuotes.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.size > 0
                ? `${selectedIds.size} de ${filteredQuotes.length} selecionada(s)`
                : "Selecionar todas"}
            </span>
            {selectedIds.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs"
              >
                Limpar seleção
              </Button>
            )}
          </div>
        )}

        {/* Desktop Table */}
        <HistoricoDesktopTable
          quotes={quotes}
          filteredQuotes={filteredQuotes}
          isLoading={isLoading}
          error={error}
          hasActiveFilters={hasActiveFilters}
          onDeleteClick={handleDeleteClick}
          isAdmin={isAdmin}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
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

      {/* Single Delete Confirmation Dialog — Enhanced for sellers */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle>Confirmar Exclusão de Cotação</DialogTitle>
            </div>
            <DialogDescription className="space-y-3">
              <p>
                Ao excluir esta cotação, <strong>todos os dados do plano enviado serão perdidos permanentemente</strong>, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Configuração de produtos e add-ons selecionados</li>
                <li>Valores calculados (mensalidade, implantação, pós-pago)</li>
                <li>Link compartilhável (se houver)</li>
                <li>Histórico de interação com o cliente</li>
              </ul>
              <p className="text-sm font-medium text-red-600">
                Esta ação não pode ser desfeita.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Excluindo...</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> Sim, Excluir Cotação</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Delete Confirmation Dialog — Admin only */}
      <Dialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle>Exclusão em Lote</DialogTitle>
            </div>
            <DialogDescription className="space-y-3">
              <p>
                Você está prestes a excluir <strong>{selectedIds.size} cotação(ões)</strong> de uma vez.
              </p>
              <p>
                Todos os dados dessas cotações serão perdidos permanentemente. Os registros dos clientes serão mantidos no Registro de Clientes.
              </p>
              <p className="text-sm font-medium text-red-600">
                Esta ação não pode ser desfeita.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDeleteConfirm}
              disabled={deleteBatchMutation.isPending}
            >
              {deleteBatchMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Excluindo...</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> Excluir {selectedIds.size} Cotação(ões)</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
