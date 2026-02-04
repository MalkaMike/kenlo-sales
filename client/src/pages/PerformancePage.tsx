/**
 * Performance - Página protegida para consultar performance de vendas do time
 */

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useSalesperson } from "@/hooks/useSalesperson";
import { useLocation } from "wouter";
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
  Download, 
  Calendar,
  Building2,
  Home,
  Package,
  TrendingUp,
  Loader2,
  Filter,
  X,
  Users,
  User,
  BarChart3,
  Trophy,
  Target,
  LogOut,
} from "lucide-react";
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

// Colors for charts
const CHART_COLORS = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

export default function PerformancePage() {
  const [, navigate] = useLocation();
  const { salesperson, isLoading: authLoading, logout } = useSalesperson();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !salesperson) {
      navigate("/login?redirect=/performance");
    }
  }, [authLoading, salesperson, navigate]);

  const utils = trpc.useUtils();
  const { data: quotes, isLoading, error } = trpc.quotes.list.useQuery({ limit: 500 });
  const { data: stats } = trpc.quotes.stats.useQuery();
  const { data: salespeople } = trpc.salesperson.list.useQuery();

  // Filter states
  const [filterVendor, setFilterVendor] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"team" | "individual">("team");

  // Set default filter to current user if not master
  useEffect(() => {
    if (salesperson && !salesperson.isMaster && viewMode === "individual") {
      setFilterVendor(salesperson.name);
    }
  }, [salesperson, viewMode]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Filter quotes
  const filteredQuotes = quotes?.filter((quote) => {
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

  const hasActiveFilters = filterVendor !== "all" || filterDateFrom || filterDateTo;

  const clearFilters = () => {
    setFilterVendor("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  // Get unique vendor names from quotes
  const vendorNames = quotes 
    ? Array.from(new Set(quotes.map(q => q.vendorName).filter(Boolean)))
    : [];

  const exportToExcel = () => {
    if (!filteredQuotes || filteredQuotes.length === 0) {
      alert("Nenhuma cotação para exportar");
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
        "Produto": productNames[quote.product] || quote.product,
        "Plano Imob": quote.imobPlan ? planNames[quote.imobPlan] : "-",
        "Plano Locação": quote.locPlan ? planNames[quote.locPlan] : "-",
        "Kombo": quote.komboName || "Sem Kombo",
        "Desconto Kombo": quote.komboDiscount ? `${quote.komboDiscount}%` : "-",
        "Frequência": frequencyNames[quote.frequency] || quote.frequency,
        "Valor Mensal": totals?.monthly ? formatCurrency(totals.monthly) : "-",
        "Valor Anual": totals?.annual ? formatCurrency(totals.annual) : "-",
        "Implantação": totals?.implantation ? formatCurrency(totals.implantation) : "-",
      };
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Performance");

    // Generate filename with current date
    const filename = `performance-${format(new Date(), "yyyy-MM-dd-HHmm")}.xlsx`;

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

  // Calculate totals for filtered quotes
  const totalQuotes = filteredQuotes?.length || 0;
  const totalValue = filteredQuotes?.reduce((sum, quote) => {
    const totals = parseJSON(quote.totals);
    return sum + (totals?.annual || 0);
  }, 0) || 0;

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!salesperson) {
    return null;
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Performance</h1>
            </div>
            <p className="text-muted-foreground">
              Acompanhe a performance de vendas do time
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Logado como</p>
              <p className="font-medium">{salesperson.name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "team" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setViewMode("team");
                setFilterVendor("all");
              }}
              className="gap-2"
            >
              <Users className="w-4 h-4" />
              Time Inteiro
            </Button>
            <Button
              variant={viewMode === "individual" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setViewMode("individual");
                if (salesperson && !salesperson.isMaster) {
                  setFilterVendor(salesperson.name);
                }
              }}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              Individual
            </Button>
          </div>

          {viewMode === "individual" && (
            <Select value={filterVendor} onValueChange={setFilterVendor}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {salesperson.isMaster && (
                  <SelectItem value="all">Todos os vendedores</SelectItem>
                )}
                {vendorNames.map((name) => (
                  <SelectItem key={name} value={name!}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {[filterVendor !== "all", filterDateFrom, filterDateTo].filter(Boolean).length}
              </Badge>
            )}
          </Button>

          <Button onClick={exportToExcel} variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Excel
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filtros</CardTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                    <X className="w-4 h-4" />
                    Limpar filtros
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Vendedor</Label>
                  <Select value={filterVendor} onValueChange={setFilterVendor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {vendorNames.map((name) => (
                        <SelectItem key={name} value={name!}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data inicial</Label>
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data final</Label>
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Total de Cotações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalQuotes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Valor Total (Anual)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(totalValue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Ticket Médio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {totalQuotes > 0 ? formatCurrency(totalValue / totalQuotes) : "R$ 0"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Vendedores Ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {chartData.byVendor.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {filteredQuotes && filteredQuotes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Ranking by Vendor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Ranking de Vendedores
                </CardTitle>
                <CardDescription>Por número de cotações</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.byVendor} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'count') return [value, 'Cotações'];
                        return [formatCurrency(value), 'Valor'];
                      }}
                    />
                    <Bar dataKey="count" fill="#e11d48" name="count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quotes Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Cotações por Dia
                </CardTitle>
                <CardDescription>Últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.byTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                      name="Cotações"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* By Product */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-500" />
                  Por Produto
                </CardTitle>
                <CardDescription>Distribuição de cotações</CardDescription>
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
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {chartData.byProduct.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Value by Vendor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Valor por Vendedor
                </CardTitle>
                <CardDescription>Valor anual total cotado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.byVendor} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Valor']}
                    />
                    <Bar dataKey="value" fill="#10b981" name="Valor" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quotes Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cotações Recentes</CardTitle>
                <CardDescription>
                  {filteredQuotes?.length || 0} cotações encontradas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Erro ao carregar cotações
              </div>
            ) : !filteredQuotes || filteredQuotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma cotação encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Kombo</TableHead>
                      <TableHead className="text-right">Valor Anual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.slice(0, 50).map((quote) => {
                      const totals = parseJSON(quote.totals);
                      return (
                        <TableRow key={quote.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(quote.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{quote.vendorName || "-"}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{quote.clientName || "-"}</div>
                              {quote.agencyName && (
                                <div className="text-sm text-muted-foreground">{quote.agencyName}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              {quote.product === "imob" && <Building2 className="w-3 h-3" />}
                              {quote.product === "loc" && <Home className="w-3 h-3" />}
                              {quote.product === "both" && <Package className="w-3 h-3" />}
                              {productNames[quote.product] || quote.product}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {quote.imobPlan && (
                                <Badge variant="secondary" className="text-xs">
                                  Imob: {planNames[quote.imobPlan]}
                                </Badge>
                              )}
                              {quote.locPlan && (
                                <Badge variant="secondary" className="text-xs">
                                  Loc: {planNames[quote.locPlan]}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {quote.komboName ? (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                {quote.komboName}
                                {quote.komboDiscount && ` (-${quote.komboDiscount}%)`}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {totals?.annual ? formatCurrency(totals.annual) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filteredQuotes.length > 50 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Mostrando 50 de {filteredQuotes.length} cotações. Exporte para Excel para ver todas.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
