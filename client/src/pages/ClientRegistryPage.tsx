/**
 * Registro de Clientes — Admin-only page.
 * Permanent record of all clients who received quotes.
 * Admins can search, view, and clean up (soft delete) records individually or in batch.
 */

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Users, Search, Trash2, AlertTriangle, Loader2, Mail, Phone, Globe, Building2, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Redirect } from "wouter";

export default function ClientRegistryPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => setDebouncedSearch(value), 300)
    );
  };

  const { data: clients, isLoading } = trpc.clientRegistry.list.useQuery(
    { search: debouncedSearch || undefined, limit: 500 },
    { enabled: isAdmin }
  );
  const { data: stats } = trpc.clientRegistry.stats.useQuery(undefined, { enabled: isAdmin });

  const deleteMutation = trpc.clientRegistry.delete.useMutation({
    onSuccess: () => {
      utils.clientRegistry.list.invalidate();
      utils.clientRegistry.stats.invalidate();
      toast.success("Cliente removido do registro.");
    },
    onError: (err) => toast.error("Erro", { description: err.message }),
  });

  const deleteBatchMutation = trpc.clientRegistry.deleteBatch.useMutation({
    onSuccess: (result) => {
      utils.clientRegistry.list.invalidate();
      utils.clientRegistry.stats.invalidate();
      toast.success(`${result.deletedCount} cliente(s) removido(s) do registro.`);
      setSelectedIds(new Set());
    },
    onError: (err) => toast.error("Erro", { description: err.message }),
  });

  const handleDeleteClick = (id: number) => {
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (clientToDelete !== null) {
      deleteMutation.mutate({ id: clientToDelete });
      setDeleteDialogOpen(false);
      setClientToDelete(null);
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
    if (!clients) return;
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map((c) => c.id)));
    }
  };

  const handleBatchDeleteConfirm = () => {
    deleteBatchMutation.mutate({ ids: Array.from(selectedIds) });
    setBatchDeleteDialogOpen(false);
  };

  // Redirect non-admins
  if (!authLoading && !isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Registro de Clientes</h1>
            </div>
            <p className="text-muted-foreground">
              Lista permanente de todos os clientes que receberam cotações. Mesmo quando o vendedor apaga a cotação, o registro do cliente permanece aqui.
            </p>
          </div>
          {selectedIds.size > 0 && (
            <Button
              onClick={() => setBatchDeleteDialogOpen(true)}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpar {selectedIds.size} selecionado(s)
            </Button>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Clientes Registrados</CardDescription>
                <CardTitle className="text-3xl">{stats.totalClients}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Cotações Enviadas</CardDescription>
                <CardTitle className="text-3xl text-primary">{stats.totalQuotesSent}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, imobiliária ou telefone..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Select all header */}
        {clients && clients.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
            <Checkbox
              checked={selectedIds.size === clients.length && clients.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedIds.size > 0
                ? `${selectedIds.size} de ${clients.length} selecionado(s)`
                : "Selecionar todos"}
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

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              {clients
                ? `${clients.length} cliente(s) encontrado(s)`
                : "Carregando..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : !clients || clients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{search ? "Nenhum cliente encontrado com essa busca." : "Nenhum cliente registrado ainda."}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Imobiliária</TableHead>
                      <TableHead>Último Produto</TableHead>
                      <TableHead>Último Kombo</TableHead>
                      <TableHead>Cotações</TableHead>
                      <TableHead>Último Vendedor</TableHead>
                      <TableHead>Atualizado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow
                        key={client.id}
                        className={selectedIds.has(client.id) ? "bg-blue-50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(client.id)}
                            onCheckedChange={() => handleToggleSelect(client.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{client.clientName}</div>
                          {client.businessType && (
                            <Badge variant="outline" className="text-xs mt-1">{client.businessType}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {client.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                {client.email}
                              </div>
                            )}
                            {client.cellPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {client.cellPhone}
                              </div>
                            )}
                            {client.landlinePhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {client.landlinePhone}
                              </div>
                            )}
                            {client.websiteUrl && (
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3 text-muted-foreground" />
                                <span className="truncate max-w-[150px]">{client.websiteUrl}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{client.agencyName || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{client.lastProduct || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{client.lastKomboName || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{client.totalQuotes}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{client.lastVendorName || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(client.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(client.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Single Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle>Remover Cliente do Registro</DialogTitle>
            </div>
            <DialogDescription>
              O registro deste cliente será removido permanentemente. Isso não afeta as cotações existentes.
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
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Removendo...</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> Remover</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Delete Dialog */}
      <Dialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <DialogTitle>Limpeza em Lote</DialogTitle>
            </div>
            <DialogDescription className="space-y-2">
              <p>
                Você está prestes a remover <strong>{selectedIds.size} cliente(s)</strong> do registro.
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
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Removendo...</>
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> Remover {selectedIds.size} Cliente(s)</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
