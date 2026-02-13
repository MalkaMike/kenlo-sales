/**
 * Histórico de Cotaçãos - Página para consultar todos os cotaçãos gerados
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
import * as XLSX from 'xlsx';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';


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

// Colors for charts
const CHART_COLORS = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

export default function HistoricoPage() {

  const utils = trpc.useUtils();
  const { data: quotes, isLoading, error } = trpc.quotes.list.useQuery({ limit: 100 });
  const { data: stats } = trpc.quotes.stats.useQuery();
  const deleteMutation = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      utils.quotes.list.invalidate();
      utils.quotes.stats.invalidate();
    },
    onError: () => {
      console.error("Erro ao deletar cotação");
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

  const exportToExcel = () => {
    if (!filteredQuotes || filteredQuotes.length === 0) {
      alert("Nenhum cotação para exportar");
      return;
    }

    // Prepare data for Excel
    const excelData = filteredQuotes.map((quote) => {
      const totals = parseJSON(quote.totals);
      return {
        "Data": format(new Date(quote.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        "Ação": quote.action === "link_copied" ? "Link Copiado" : "PDF Exportado",
        "Vendedor": quote.vendorName || "-",
        "Cliente": quote.clientName || "-",
        "Imobiliária": quote.agencyName || "-",
        "Celular": quote.cellPhone || "-",
        "Telefone Fixo": quote.landlinePhone || "-",
        "Site": quote.websiteUrl || "-",
        "Produto": productNames[quote.product] || quote.product,
        "Plano Imob": quote.imobPlan ? planNames[quote.imobPlan] : "-",
        "Plano Locação": quote.locPlan ? planNames[quote.locPlan] : "-",
        "Kombo": quote.komboName || "Sem Kombo",
        "Desconto Kombo": quote.komboDiscount ? `${quote.komboDiscount}%` : "-",
        "Frequência": frequencyNames[quote.frequency] || quote.frequency,
        "Valor Mensal": totals?.monthly ? formatCurrency(totals.monthly) : "-",
        "Valor Anual": totals?.annual ? formatCurrency(totals.annual) : "-",
        "Implantação": totals?.implantation ? formatCurrency(totals.implantation) : "-",
        "Pós-Pago": totals?.postPaid ? formatCurrency(totals.postPaid) : "-",
        "Link": quote.shareableUrl || "-",
      };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cotaçãos");

    // Set column widths
    const colWidths = [
      { wch: 18 }, // Data
      { wch: 15 }, // Ação
      { wch: 25 }, // Vendedor
      { wch: 30 }, // Cliente
      { wch: 30 }, // Imobiliária
      { wch: 15 }, // Celular
      { wch: 15 }, // Telefone Fixo
      { wch: 30 }, // Site
      { wch: 18 }, // Produto
      { wch: 12 }, // Plano Imob
      { wch: 15 }, // Plano Locação
      { wch: 20 }, // Kombo
      { wch: 15 }, // Desconto Kombo
      { wch: 12 }, // Frequência
      { wch: 15 }, // Valor Mensal
      { wch: 15 }, // Valor Anual
      { wch: 15 }, // Implantação
      { wch: 12 }, // Pós-Pago
      { wch: 50 }, // Link
    ];
    ws['!cols'] = colWidths;

    // Generate filename with current date
    const filename = `historico-cotacaos-${format(new Date(), "yyyy-MM-dd-HHmm")}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  // Prepare chart data
  const chartData = {
    byVendor: [] as { name: string; count: number; value: number }[],
    byProduct: [] as { name: string; count: number }[],
    byTime: [] as { date: string; count: number }[],
  };

  if (filteredQuotes && filteredQuotes.length > 0) {
    // Group by vendor
    const vendorMap = new Map<string, { count: number; value: number }>();
    filteredQuotes.forEach((quote) => {
      const vendor = quote.vendorName || "Sem vendedor";
      const totals = parseJSON(quote.totals);
      const value = totals?.annual || 0;
      
      if (!vendorMap.has(vendor)) {
        vendorMap.set(vendor, { count: 0, value: 0 });
      }
      const current = vendorMap.get(vendor)!;
      current.count++;
      current.value += value;
    });
    chartData.byVendor = Array.from(vendorMap.entries())
      .map(([name, data]) => ({ name, count: data.count, value: data.value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 vendors

    // Group by product
    const productMap = new Map<string, number>();
    filteredQuotes.forEach((quote) => {
      const product = productNames[quote.product] || quote.product;
      productMap.set(product, (productMap.get(product) || 0) + 1);
    });
    chartData.byProduct = Array.from(productMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Group by date (daily)
    const dateMap = new Map<string, number>();
    filteredQuotes.forEach((quote) => {
      const date = format(new Date(quote.createdAt), "dd/MM", { locale: ptBR });
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });
    chartData.byTime = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        // Sort by date
        const [dayA, monthA] = a.date.split('/').map(Number);
        const [dayB, monthB] = b.date.split('/').map(Number);
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
      })
      .slice(-30); // Last 30 days
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Histórico de Cotaçãos</h1>
            <p className="text-muted-foreground">
              Consulte todos os cotaçãos gerados (links copiados e PDFs exportados)
            </p>
          </div>
          <Button
            onClick={exportToExcel}
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
                <CardDescription>Total de Cotaçãos</CardDescription>
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

        {/* Analytics Charts */}
        {filteredQuotes && filteredQuotes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Análise de Vendas</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Chart 1: Cotaçãos por Vendedor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cotaçãos por Vendedor</CardTitle>
                  <CardDescription>Top 10 vendedores com mais cotaçãos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.byVendor}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#e11d48" name="Cotaçãos" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Chart 2: Distribuição por Produto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição por Produto</CardTitle>
                  <CardDescription>Cotaçãos por tipo de produto</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.byProduct}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.name}: ${entry.count}`}
                      >
                        {chartData.byProduct.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 3: Cotaçãos ao Longo do Tempo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cotaçãos ao Longo do Tempo</CardTitle>
                  <CardDescription>Últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.byTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Cotaçãos" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Chart 4: Valor Total por Vendedor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Valor Total por Vendedor</CardTitle>
                  <CardDescription>Top 10 vendedores por valor anual</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.byVendor}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="value" fill="#10b981" name="Valor Anual" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Filtros</CardTitle>
                <CardDescription>
                  Filtre os cotaçãos por cliente, vendedor ou data
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
            <CardTitle>Cotaçãos Recentes</CardTitle>
            <CardDescription>
              {filteredQuotes && filteredQuotes.length > 0
                ? `Exibindo ${filteredQuotes.length} de ${quotes?.length || 0} cotaçãos`
                : "Últimos 100 cotaçãos gerados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-12 text-muted-foreground">
                Erro ao carregar cotaçãos. Tente novamente.
              </div>
            ) : !filteredQuotes || filteredQuotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {hasActiveFilters
                    ? "Nenhum cotação encontrado com os filtros aplicados."
                    : "Nenhum cotação gerado ainda."}
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
          <h2 className="text-lg font-semibold">Cotaçãos Recentes</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground">
              Erro ao carregar cotaçãos. Tente novamente.
            </div>
          ) : !filteredQuotes || filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {hasActiveFilters
                    ? "Nenhum cotação encontrado com os filtros aplicados."
                    : "Nenhum cotação gerado ainda."}
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
              Tem certeza que deseja deletar este cotação? Esta ação não pode ser desfeita.
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
