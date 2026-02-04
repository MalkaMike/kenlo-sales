/**
 * Histórico de Orçamentos - Página para consultar todos os orçamentos gerados
 */

import { useState } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Link2, 
  Download, 
  Calendar,
  Building2,
  Home,
  Package,
  TrendingUp,
  Loader2,
  ExternalLink,
  Trash2,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";


// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper to parse JSON safely
const parseJSON = (str: string | null) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

// Product display names
const productNames: Record<string, string> = {
  imob: "Kenlo Imob",
  loc: "Kenlo Locação",
  both: "Imob + Locação",
};

// Plan display names
const planNames: Record<string, string> = {
  prime: "Prime",
  k: "K",
  k2: "K2",
};

// Frequency display names
const frequencyNames: Record<string, string> = {
  monthly: "Mensal",
  semestral: "Semestral",
  annual: "Anual",
  biennial: "Bienal",
};

// Vendor names for filter
const VENDOR_NAMES = [
  "AMANDA DE OLIVEIRA MATOS",
  "BRUNO RIBEIRO DA SILVA",
  "CASSIA MOREIRA BARBOSA",
  "EMERSON DE MORAES",
  "IVAN KERR CODO",
  "JAQUELINE SILVA GRANELLI",
  "LARISSA BRANDALISE FAVI",
  "MARINA KIYOMI YOKOMUN",
  "YR MADEIRAS DE GASPERIN",
  "ROBERTA PACHECO DE AZEVEDO",
];

export default function HistoricoPage() {

  const utils = trpc.useUtils();
  const { data: quotes, isLoading, error } = trpc.quotes.list.useQuery({ limit: 100 });
  const { data: stats } = trpc.quotes.stats.useQuery();
  const deleteMutation = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      console.log("Orçamento deletado com sucesso");
      utils.quotes.list.invalidate();
      utils.quotes.stats.invalidate();
    },
    onError: () => {
      console.error("Erro ao deletar orçamento");
    },
  });

  // Filter states
  const [filterClient, setFilterClient] = useState("");
  const [filterVendor, setFilterVendor] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Delete confirmation dialog
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
    // Filter by client name
    if (filterClient && !quote.clientName?.toLowerCase().includes(filterClient.toLowerCase())) {
      return false;
    }

    // Filter by vendor name
    if (filterVendor && filterVendor !== "all" && quote.vendorName !== filterVendor) {
      return false;
    }

    // Filter by date range
    const quoteDate = new Date(quote.createdAt);
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      if (quoteDate < fromDate) {
        return false;
      }
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      if (quoteDate > toDate) {
        return false;
      }
    }

    return true;
  });

  const hasActiveFilters = filterClient || filterVendor || filterDateFrom || filterDateTo;

  const clearFilters = () => {
    setFilterClient("");
    setFilterVendor("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Histórico de Orçamentos</h1>
          <p className="text-muted-foreground">
            Consulte todos os orçamentos gerados (links copiados e PDFs exportados)
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total de Orçamentos</CardDescription>
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

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Filtros</CardTitle>
                <CardDescription>
                  Filtre os orçamentos por cliente, vendedor ou data
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Client Name Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filterClient">Nome do Cliente</Label>
                  <Input
                    id="filterClient"
                    placeholder="Digite o nome..."
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                  />
                </div>

                {/* Vendor Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filterVendor">Vendedor</Label>
                  <Select value={filterVendor} onValueChange={setFilterVendor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os vendedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os vendedores</SelectItem>
                      {VENDOR_NAMES.map((vendor) => (
                        <SelectItem key={vendor} value={vendor}>
                          {vendor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From Filter */}
                <div className="space-y-2">
                  <Label htmlFor="filterDateFrom">Data Inicial</Label>
                  <Input
                    id="filterDateFrom"
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </div>

                {/* Date To Filter */}
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

        {/* Quotes Table - Desktop */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>Orçamentos Recentes</CardTitle>
            <CardDescription>
              {filteredQuotes && filteredQuotes.length > 0
                ? `Exibindo ${filteredQuotes.length} de ${quotes?.length || 0} orçamentos`
                : "Últimos 100 orçamentos gerados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-muted-foreground">
                Erro ao carregar orçamentos. Tente novamente.
              </div>
            ) : !filteredQuotes || filteredQuotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {hasActiveFilters
                    ? "Nenhum orçamento encontrado com os filtros aplicados."
                    : "Nenhum orçamento gerado ainda."}
                </p>
                {!hasActiveFilters && (
                  <p className="text-sm mt-2">
                    Copie um link ou exporte um PDF na calculadora para começar.
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Imobiliária</TableHead>

                      <TableHead>Telefones</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Kombo</TableHead>
                      <TableHead>Frequência</TableHead>
                      <TableHead className="text-right">Mensal</TableHead>
                      <TableHead className="text-right">Anual</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => {
                      const totals = parseJSON(quote.totals);
                      
                      return (
                        <TableRow key={quote.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {format(new Date(quote.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </div>
                          </TableCell>
                          <TableCell>
                            {quote.action === "link_copied" ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <Link2 className="w-3 h-3 mr-1" />
                                Link
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Download className="w-3 h-3 mr-1" />
                                PDF
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {quote.clientName ? (
                              <span className="text-sm">{quote.clientName}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {quote.vendorName ? (
                              <span className="text-sm">{quote.vendorName}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {quote.agencyName ? (
                              <span className="text-sm">{quote.agencyName}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                              {quote.cellPhone && (
                                <span>📱 {quote.cellPhone}</span>
                              )}
                              {quote.landlinePhone && (
                                <span>☎️ {quote.landlinePhone}</span>
                              )}
                              {!quote.cellPhone && !quote.landlinePhone && (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {quote.websiteUrl ? (
                              <span className="text-sm">{quote.websiteUrl}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {quote.product === "imob" && <Building2 className="w-4 h-4 text-primary" />}
                              {quote.product === "loc" && <Home className="w-4 h-4 text-secondary" />}
                              {quote.product === "both" && <Package className="w-4 h-4 text-purple-600" />}
                              <span className="text-sm">{productNames[quote.product] || quote.product}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {quote.imobPlan && (
                                <Badge variant="secondary" className="text-xs w-fit">
                                  Imob: {planNames[quote.imobPlan] || quote.imobPlan}
                                </Badge>
                              )}
                              {quote.locPlan && (
                                <Badge variant="secondary" className="text-xs w-fit">
                                  Loc: {planNames[quote.locPlan] || quote.locPlan}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {quote.komboName ? (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm">{quote.komboName}</span>
                                {quote.komboDiscount && quote.komboDiscount > 0 && (
                                  <Badge className="ml-1 bg-green-100 text-green-700 text-xs">
                                    -{quote.komboDiscount}%
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {frequencyNames[quote.frequency] || quote.frequency}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {totals?.monthly ? formatCurrency(totals.monthly) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {totals?.annual ? formatCurrency(totals.annual) : "-"}
                          </TableCell>
                          <TableCell>
                            {quote.shareableUrl ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => window.open(quote.shareableUrl!, "_blank")}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(quote.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quotes Cards - Mobile */}
        <div className="md:hidden space-y-4">
          <h2 className="text-lg font-semibold">Orçamentos Recentes</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground">
              Erro ao carregar orçamentos. Tente novamente.
            </div>
          ) : !filteredQuotes || filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {hasActiveFilters
                    ? "Nenhum orçamento encontrado com os filtros aplicados."
                    : "Nenhum orçamento gerado ainda."}
                </p>
                {!hasActiveFilters && (
                  <p className="text-sm mt-2">
                    Copie um link ou exporte um PDF na calculadora para começar.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredQuotes.map((quote) => {
              const totals = parseJSON(quote.totals);
              
              return (
                <Card key={quote.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(quote.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      {quote.action === "link_copied" ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Link2 className="w-3 h-3 mr-1" />
                          Link
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Download className="w-3 h-3 mr-1" />
                          PDF
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-2">
                      {quote.clientName || "Cliente não informado"}
                    </CardTitle>
                    <CardDescription>
                      {quote.agencyName || "Imobiliária não informada"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Vendor and Owner */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Vendedor:</span>
                        <p className="font-medium">{quote.vendorName || "-"}</p>
                      </div>

                    </div>

                    {/* Phones and Website */}
                    <div className="text-sm space-y-1">
                      {quote.cellPhone && (
                        <p>📱 {quote.cellPhone}</p>
                      )}
                      {quote.landlinePhone && (
                        <p>☎️ {quote.landlinePhone}</p>
                      )}
                      {quote.websiteUrl && (
                        <p className="text-muted-foreground">🌐 {quote.websiteUrl}</p>
                      )}
                    </div>

                    {/* Product and Plan */}
                    <div className="flex items-center gap-2">
                      {quote.product === "imob" && <Building2 className="w-4 h-4 text-primary" />}
                      {quote.product === "loc" && <Home className="w-4 h-4 text-secondary" />}
                      {quote.product === "both" && <Package className="w-4 h-4 text-purple-600" />}
                      <span className="text-sm font-medium">
                        {productNames[quote.product] || quote.product}
                      </span>
                      {quote.imobPlan && (
                        <Badge variant="secondary" className="text-xs">
                          Imob: {planNames[quote.imobPlan] || quote.imobPlan}
                        </Badge>
                      )}
                      {quote.locPlan && (
                        <Badge variant="secondary" className="text-xs">
                          Loc: {planNames[quote.locPlan] || quote.locPlan}
                        </Badge>
                      )}
                    </div>

                    {/* Kombo */}
                    {quote.komboName && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{quote.komboName}</span>
                        {quote.komboDiscount && quote.komboDiscount > 0 && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            -{quote.komboDiscount}%
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Frequency and Totals */}
                    <div className="text-sm">
                      <span className="text-muted-foreground">Frequência: </span>
                      <span className="font-medium">
                        {frequencyNames[quote.frequency] || quote.frequency}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mensal:</span>
                        <p className="font-medium">
                          {totals?.monthly ? formatCurrency(totals.monthly) : "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Anual:</span>
                        <p className="font-medium">
                          {totals?.annual ? formatCurrency(totals.annual) : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {quote.shareableUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(quote.shareableUrl!, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Abrir Link
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(quote.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este orçamento? Esta ação não pode ser desfeita.
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
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
