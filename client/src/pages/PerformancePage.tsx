/**
 * Performance - Dashboard executivo para acompanhar performance de vendas
 * Visão de CEO com métricas de Kombos, MRR, implantações e ranking de vendedores
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
  DollarSign,
  Trash2,
  AlertCircle,
  Layers,
  Zap,
  CreditCard,
  PiggyBank,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format, startOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";
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

// Helper to format compact currency
const formatCompactCurrency = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
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

// Kombo display names
const komboNames: Record<string, string> = {
  imob_start: "Imob Start",
  imob_pro: "Imob Pro",
  loc_pro: "Locação Pro",
  core_gestao: "Core Gestão",
  elite: "Elite",
  sem_kombo: "Sem Kombo",
};

// Add-on display names
const addonNames: Record<string, string> = {
  leads: "Leads",
  inteligencia: "Inteligência",
  assinatura: "Assinatura",
  pay: "Pay",
  seguros: "Seguros",
  cash: "Cash",
};

// Colors for charts
const CHART_COLORS = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

// Kombo colors
const KOMBO_COLORS: Record<string, string> = {
  imob_start: '#3b82f6',
  imob_pro: '#8b5cf6',
  loc_pro: '#10b981',
  core_gestao: '#f59e0b',
  elite: '#e11d48',
  sem_kombo: '#6b7280',
};

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
  const { data: quotes, isLoading, refetch: refetchQuotes } = trpc.quotes.list.useQuery({ limit: 1000 });
  const { data: performanceMetrics, isLoading: metricsLoading } = trpc.quotes.performance.useQuery();
  const { data: salespeople } = trpc.salesperson.list.useQuery();
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

  // Selection state for batch delete
  const [selectedQuotes, setSelectedQuotes] = useState<Set<number>>(new Set());

  // Filter states
  const [filterVendor, setFilterVendor] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterKombo, setFilterKombo] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"team" | "individual">("team");
  const [quickPeriod, setQuickPeriod] = useState<"today" | "week" | "month" | "all">("all");

  // Quick period filter helper
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<number | null>(null);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);

  // Toggle single quote selection
  const toggleQuoteSelection = (quoteId: number) => {
    const newSelected = new Set(selectedQuotes);
    if (newSelected.has(quoteId)) {
      newSelected.delete(quoteId);
    } else {
      newSelected.add(quoteId);
    }
    setSelectedQuotes(newSelected);
  };

  // Toggle all quotes selection (only deletable ones)
  const toggleSelectAll = () => {
    if (!filteredQuotes || !salesperson) return;
    
    const deletableQuotes = filteredQuotes.filter(
      (q) => salesperson.isMaster || q.salespersonId === salesperson.id
    );
    
    if (selectedQuotes.size === deletableQuotes.length && deletableQuotes.length > 0) {
      // Deselect all
      setSelectedQuotes(new Set());
    } else {
      // Select all deletable
      setSelectedQuotes(new Set(deletableQuotes.map((q) => q.id)));
    }
  };

  // Handle batch delete
  const handleBatchDeleteConfirm = async () => {
    if (selectedQuotes.size > 0) {
      await deleteBatchMutation.mutateAsync({ ids: Array.from(selectedQuotes) });
    }
    setBatchDeleteDialogOpen(false);
  };

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

  const handleDeleteClick = (quoteId: number) => {
    setQuoteToDelete(quoteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (quoteToDelete) {
      const result = await deleteMutation.mutateAsync({ id: quoteToDelete });
      if (!result.success && result.error) {
        alert(result.error);
      }
    }
    setDeleteDialogOpen(false);
    setQuoteToDelete(null);
  };

  // Filter quotes
  const filteredQuotes = quotes?.filter((quote) => {
    // Filter by vendor name
    if (filterVendor && filterVendor !== "all" && quote.vendorName !== filterVendor) {
      return false;
    }

    // Filter by Kombo
    if (filterKombo && filterKombo !== "all") {
      const quoteKombo = quote.komboId || "sem_kombo";
      if (quoteKombo !== filterKombo) {
        return false;
      }
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

  const hasActiveFilters = filterVendor !== "all" || filterDateFrom || filterDateTo || filterKombo !== "all";

  const clearFilters = () => {
    setFilterVendor("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterKombo("all");
  };

  // Get unique vendor names from quotes
  const vendorNames = quotes 
    ? Array.from(new Set(quotes.map(q => q.vendorName).filter(Boolean)))
    : [];

  // Calculate metrics from filtered quotes
  const calculateMetrics = () => {
    if (!filteredQuotes || filteredQuotes.length === 0) {
      return {
        totalQuotes: 0,
        mrrWithoutPostPaid: 0,
        mrrWithPostPaid: 0,
        implantationVolume: 0,
        implantationValue: 0,
        ticketMedio: 0,
      };
    }

    let mrrWithoutPostPaid = 0;
    let mrrWithPostPaid = 0;
    let implantationVolume = 0;
    let implantationValue = 0;

    filteredQuotes.forEach((quote) => {
      const totals = parseJSON(quote.totals);
      const monthly = totals?.monthly || 0;
      const postPaid = totals?.postPaid || 0;
      const implantation = totals?.implantation || 0;

      mrrWithoutPostPaid += monthly;
      mrrWithPostPaid += monthly + postPaid;
      if (implantation > 0) {
        implantationVolume++;
        implantationValue += implantation;
      }
    });

    return {
      totalQuotes: filteredQuotes.length,
      mrrWithoutPostPaid,
      mrrWithPostPaid,
      implantationVolume,
      implantationValue,
      ticketMedio: filteredQuotes.length > 0 ? mrrWithPostPaid / filteredQuotes.length : 0,
    };
  };

  const metrics = calculateMetrics();

  // Calculate Kombo breakdown from filtered quotes
  const calculateKomboBreakdown = () => {
    if (!filteredQuotes || filteredQuotes.length === 0) return [];

    const komboMap = new Map<string, { count: number; mrrWithoutPostPaid: number; mrrWithPostPaid: number; implantationValue: number }>();

    filteredQuotes.forEach((quote) => {
      const komboId = quote.komboId || "sem_kombo";
      const totals = parseJSON(quote.totals);
      const monthly = totals?.monthly || 0;
      const postPaid = totals?.postPaid || 0;
      const implantation = totals?.implantation || 0;

      if (!komboMap.has(komboId)) {
        komboMap.set(komboId, { count: 0, mrrWithoutPostPaid: 0, mrrWithPostPaid: 0, implantationValue: 0 });
      }
      const data = komboMap.get(komboId)!;
      data.count++;
      data.mrrWithoutPostPaid += monthly;
      data.mrrWithPostPaid += monthly + postPaid;
      data.implantationValue += implantation;
    });

    return Array.from(komboMap.entries())
      .map(([komboId, data]) => ({
        komboId,
        komboName: komboNames[komboId] || komboId,
        ...data,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const komboBreakdown = calculateKomboBreakdown();

  // Calculate Plan breakdown for non-Kombo quotes
  const calculatePlanBreakdown = () => {
    if (!filteredQuotes || filteredQuotes.length === 0) return [];

    const planMap = new Map<string, { count: number; mrrWithoutPostPaid: number; mrrWithPostPaid: number }>();

    filteredQuotes.forEach((quote) => {
      const totals = parseJSON(quote.totals);
      const monthly = totals?.monthly || 0;
      const postPaid = totals?.postPaid || 0;

      if (quote.imobPlan) {
        const key = `IMOB ${planNames[quote.imobPlan] || quote.imobPlan}`;
        if (!planMap.has(key)) {
          planMap.set(key, { count: 0, mrrWithoutPostPaid: 0, mrrWithPostPaid: 0 });
        }
        const data = planMap.get(key)!;
        data.count++;
        data.mrrWithoutPostPaid += monthly / (quote.locPlan ? 2 : 1);
        data.mrrWithPostPaid += (monthly + postPaid) / (quote.locPlan ? 2 : 1);
      }

      if (quote.locPlan) {
        const key = `LOC ${planNames[quote.locPlan] || quote.locPlan}`;
        if (!planMap.has(key)) {
          planMap.set(key, { count: 0, mrrWithoutPostPaid: 0, mrrWithPostPaid: 0 });
        }
        const data = planMap.get(key)!;
        data.count++;
        data.mrrWithoutPostPaid += monthly / (quote.imobPlan ? 2 : 1);
        data.mrrWithPostPaid += (monthly + postPaid) / (quote.imobPlan ? 2 : 1);
      }
    });

    return Array.from(planMap.entries())
      .map(([plan, data]) => ({ plan, ...data }))
      .sort((a, b) => b.count - a.count);
  };

  const planBreakdown = calculatePlanBreakdown();

  // Calculate Vendor ranking
  const calculateVendorRanking = () => {
    if (!filteredQuotes || filteredQuotes.length === 0) return [];

    const vendorMap = new Map<string, { 
      count: number; 
      mrrWithoutPostPaid: number; 
      mrrWithPostPaid: number; 
      implantationValue: number;
      salespersonId: number | null;
    }>();

    filteredQuotes.forEach((quote) => {
      const vendorName = quote.vendorName || "Sem vendedor";
      const totals = parseJSON(quote.totals);
      const monthly = totals?.monthly || 0;
      const postPaid = totals?.postPaid || 0;
      const implantation = totals?.implantation || 0;

      if (!vendorMap.has(vendorName)) {
        vendorMap.set(vendorName, { 
          count: 0, 
          mrrWithoutPostPaid: 0, 
          mrrWithPostPaid: 0, 
          implantationValue: 0,
          salespersonId: quote.salespersonId,
        });
      }
      const data = vendorMap.get(vendorName)!;
      data.count++;
      data.mrrWithoutPostPaid += monthly;
      data.mrrWithPostPaid += monthly + postPaid;
      data.implantationValue += implantation;
    });

    return Array.from(vendorMap.entries())
      .map(([vendorName, data]) => ({
        vendorName,
        ...data,
        ticketMedio: data.count > 0 ? data.mrrWithPostPaid / data.count : 0,
      }))
      .sort((a, b) => b.mrrWithoutPostPaid - a.mrrWithoutPostPaid);
  };

  const vendorRanking = calculateVendorRanking();

  // Calculate Frequency breakdown
  const calculateFrequencyBreakdown = () => {
    if (!filteredQuotes || filteredQuotes.length === 0) return [];

    const freqMap = new Map<string, number>();
    filteredQuotes.forEach((quote) => {
      const freq = quote.frequency || "unknown";
      freqMap.set(freq, (freqMap.get(freq) || 0) + 1);
    });

    const total = filteredQuotes.length;
    return Array.from(freqMap.entries())
      .map(([frequency, count]) => ({
        frequency,
        name: frequencyNames[frequency] || frequency,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const frequencyBreakdown = calculateFrequencyBreakdown();

  // Calculate Add-on popularity
  const calculateAddonPopularity = () => {
    if (!filteredQuotes || filteredQuotes.length === 0) return [];

    const addonMap = new Map<string, number>();
    filteredQuotes.forEach((quote) => {
      const addons = parseJSON(quote.addons);
      if (addons && typeof addons === "object") {
        for (const [addon, enabled] of Object.entries(addons)) {
          if (enabled) {
            addonMap.set(addon, (addonMap.get(addon) || 0) + 1);
          }
        }
      }
    });

    const total = filteredQuotes.length;
    return Array.from(addonMap.entries())
      .map(([addon, count]) => ({
        addon,
        name: addonNames[addon] || addon,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const addonPopularity = calculateAddonPopularity();

  // Calculate trend data for line chart
  const calculateTrendData = () => {
    if (!filteredQuotes || filteredQuotes.length === 0) return [];

    // Group by date
    const dateMap = new Map<string, { mrrWithoutPostPaid: number; mrrWithPostPaid: number; count: number }>();

    filteredQuotes.forEach((quote) => {
      const date = format(new Date(quote.createdAt), "dd/MM", { locale: ptBR });
      const totals = parseJSON(quote.totals);
      const monthly = totals?.monthly || 0;
      const postPaid = totals?.postPaid || 0;

      if (!dateMap.has(date)) {
        dateMap.set(date, { mrrWithoutPostPaid: 0, mrrWithPostPaid: 0, count: 0 });
      }
      const data = dateMap.get(date)!;
      data.mrrWithoutPostPaid += monthly;
      data.mrrWithPostPaid += monthly + postPaid;
      data.count++;
    });

    // Convert to array and sort by date
    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        "MRR s/ pós": data.mrrWithoutPostPaid,
        "MRR c/ pós": data.mrrWithPostPaid,
        cotacoes: data.count,
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split("/").map(Number);
        const [dayB, monthB] = b.date.split("/").map(Number);
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
      });
  };

  const trendData = calculateTrendData();

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
        "MRR (sem pós-pago)": totals?.monthly ? formatCurrency(totals.monthly) : "-",
        "MRR (com pós-pago)": totals?.monthly && totals?.postPaid !== undefined ? formatCurrency(totals.monthly + (totals.postPaid || 0)) : "-",
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
              Dashboard executivo - Acompanhe a performance de vendas do time
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Logado como</p>
              <p className="font-medium">{salesperson.name}</p>
              {salesperson.isMaster && (
                <Badge variant="secondary" className="mt-1">Master</Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
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

          {/* Quick Period Filters */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 overflow-x-auto w-full sm:w-auto">
            <Button
              variant={quickPeriod === "today" ? "default" : "ghost"}
              size="sm"
              onClick={() => applyQuickPeriod("today")}
              className="text-xs px-2 sm:px-3 whitespace-nowrap"
            >
              Hoje
            </Button>
            <Button
              variant={quickPeriod === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => applyQuickPeriod("week")}
              className="text-xs px-2 sm:px-3 whitespace-nowrap"
            >
              Esta semana
            </Button>
            <Button
              variant={quickPeriod === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => applyQuickPeriod("month")}
              className="text-xs px-2 sm:px-3 whitespace-nowrap"
            >
              Este mês
            </Button>
            <Button
              variant={quickPeriod === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => applyQuickPeriod("all")}
              className="text-xs px-2 sm:px-3 whitespace-nowrap"
            >
              Todo período
            </Button>
          </div>

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
                {[filterVendor !== "all", filterDateFrom, filterDateTo, filterKombo !== "all"].filter(Boolean).length}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <Label>Kombo</Label>
                  <Select value={filterKombo} onValueChange={setFilterKombo}>
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

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-xs">
                <FileText className="w-3 h-3" />
                Cotações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{metrics.totalQuotes}</div>
              <p className="text-xs text-muted-foreground">volume</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                <DollarSign className="w-3 h-3" />
                MRR (s/ pós-pago)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCompactCurrency(metrics.mrrWithoutPostPaid)}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">mensalidade fixa</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
                <TrendingUp className="w-3 h-3" />
                MRR (c/ pós-pago)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCompactCurrency(metrics.mrrWithPostPaid)}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">receita total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-xs">
                <CreditCard className="w-3 h-3" />
                Implantações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.implantationVolume}</div>
              <p className="text-xs text-muted-foreground">volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-xs">
                <PiggyBank className="w-3 h-3" />
                Implantações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {formatCompactCurrency(metrics.implantationValue)}
              </div>
              <p className="text-xs text-muted-foreground">valor total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-xs">
                <Target className="w-3 h-3" />
                Ticket Médio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCompactCurrency(metrics.ticketMedio)}
              </div>
              <p className="text-xs text-muted-foreground">MRR/cotação</p>
            </CardContent>
          </Card>
        </div>

        {/* Trend Chart */}
        {trendData.length > 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Tendência de MRR
              </CardTitle>
              <CardDescription>Evolução do MRR ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent className="-mx-2 sm:mx-0">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis 
                    tickFormatter={(value) => formatCompactCurrency(value)} 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']} 
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="MRR s/ pós" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="MRR c/ pós" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Kombo Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Vendas por Kombo
              </CardTitle>
              <CardDescription>Volume e valor por tipo de Kombo</CardDescription>
            </CardHeader>
            <CardContent>
              {komboBreakdown.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={komboBreakdown}
                        dataKey="count"
                        nameKey="komboName"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {komboBreakdown.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={KOMBO_COLORS[entry.komboId] || CHART_COLORS[index % CHART_COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, 'Cotações']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kombo</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">MRR s/ pós</TableHead>
                        <TableHead className="text-right">MRR c/ pós</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {komboBreakdown.map((kombo) => (
                        <TableRow key={kombo.komboId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: KOMBO_COLORS[kombo.komboId] || '#6b7280' }}
                              />
                              {komboNames[kombo.komboId] || kombo.komboId}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">{kombo.count}</TableCell>
                          <TableCell className="text-right text-blue-600">{formatCompactCurrency(kombo.mrrWithoutPostPaid)}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCompactCurrency(kombo.mrrWithPostPaid)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Nenhuma cotação encontrada</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-secondary" />
                Vendas por Plano
              </CardTitle>
              <CardDescription>Detalhamento por tipo de plano (IMOB/LOC)</CardDescription>
            </CardHeader>
            <CardContent>
              {planBreakdown.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={planBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="plan" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => [value, 'Cotações']} />
                      <Bar dataKey="count" fill="#e11d48" />
                    </BarChart>
                  </ResponsiveContainer>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plano</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">MRR s/ pós</TableHead>
                        <TableHead className="text-right">MRR c/ pós</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planBreakdown.map((plan) => (
                        <TableRow key={plan.plan}>
                          <TableCell className="font-medium">{plan.plan}</TableCell>
                          <TableCell className="text-right">{plan.count}</TableCell>
                          <TableCell className="text-right text-blue-600">{formatCompactCurrency(plan.mrrWithoutPostPaid)}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCompactCurrency(plan.mrrWithPostPaid)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Nenhuma cotação encontrada</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vendor Ranking */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Ranking de Vendedores
            </CardTitle>
            <CardDescription>Performance por vendedor ordenado por MRR pré-pago (mensalidade fixa)</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {vendorRanking.length > 0 ? (
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Cotações</TableHead>
                    <TableHead className="text-right">MRR s/ pós-pago</TableHead>
                    <TableHead className="text-right">MRR c/ pós-pago</TableHead>
                    <TableHead className="text-right">Implantação</TableHead>
                    <TableHead className="text-right">Ticket Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendorRanking.map((vendor, index) => (
                    <TableRow key={vendor.vendorName}>
                      <TableCell>
                        {index === 0 ? (
                          <span className="text-2xl">🥇</span>
                        ) : index === 1 ? (
                          <span className="text-2xl">🥈</span>
                        ) : index === 2 ? (
                          <span className="text-2xl">🥉</span>
                        ) : (
                          <span className="text-muted-foreground">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{vendor.vendorName}</TableCell>
                      <TableCell className="text-right">{vendor.count}</TableCell>
                      <TableCell className="text-right text-primary font-bold">{formatCurrency(vendor.mrrWithoutPostPaid)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatCurrency(vendor.mrrWithPostPaid)}</TableCell>
                      <TableCell className="text-right text-amber-600">{formatCurrency(vendor.implantationValue)}</TableCell>
                      <TableCell className="text-right text-purple-600">{formatCurrency(vendor.ticketMedio)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma cotação encontrada</p>
            )}
          </CardContent>
        </Card>

        {/* Frequency and Add-ons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Frequência de Pagamento
              </CardTitle>
              <CardDescription>Distribuição por tipo de pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              {frequencyBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {frequencyBreakdown.map((freq) => (
                    <div key={freq.frequency} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium">{freq.name}</div>
                      <div className="flex-1">
                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${freq.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm">
                        <span className="font-medium">{freq.count}</span>
                        <span className="text-muted-foreground ml-1">({freq.percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Nenhuma cotação encontrada</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Add-ons Mais Populares
              </CardTitle>
              <CardDescription>Frequência de uso de cada add-on</CardDescription>
            </CardHeader>
            <CardContent>
              {addonPopularity.length > 0 ? (
                <div className="space-y-3">
                  {addonPopularity.map((addon) => (
                    <div key={addon.addon} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium">{addon.name}</div>
                      <div className="flex-1">
                        <div className="h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary rounded-full transition-all"
                            style={{ width: `${addon.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm">
                        <span className="font-medium">{addon.count}</span>
                        <span className="text-muted-foreground ml-1">({addon.percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Nenhum add-on encontrado</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotes Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Cotações Recentes
                </CardTitle>
                <CardDescription>
                  {filteredQuotes?.length || 0} cotações encontradas
                  {salesperson && !salesperson.isMaster && " (você pode apagar apenas suas próprias cotações)"}
                </CardDescription>
              </div>
              {selectedQuotes.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBatchDeleteDialogOpen(true)}
                  disabled={deleteBatchMutation.isPending}
                >
                  {deleteBatchMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Apagar {selectedQuotes.size} selecionada{selectedQuotes.size > 1 ? "s" : ""}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredQuotes && filteredQuotes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={(() => {
                            if (!filteredQuotes || !salesperson) return false;
                            const deletableQuotes = filteredQuotes.filter(
                              (q) => salesperson.isMaster || q.salespersonId === salesperson.id
                            );
                            return deletableQuotes.length > 0 && selectedQuotes.size === deletableQuotes.length;
                          })()}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Kombo/Plano</TableHead>
                      <TableHead>Frequência</TableHead>
                      <TableHead className="text-right">MRR s/ pós</TableHead>
                      <TableHead className="text-right">MRR c/ pós</TableHead>
                      <TableHead className="text-right">Impl.</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.slice(0, 50).map((quote) => {
                      const totals = parseJSON(quote.totals);
                      const canDelete = salesperson.isMaster || quote.salespersonId === salesperson.id;
                      
                      return (
                        <TableRow key={quote.id} className={selectedQuotes.has(quote.id) ? "bg-muted/50" : ""}>
                          <TableCell>
                            {canDelete && (
                              <Checkbox
                                checked={selectedQuotes.has(quote.id)}
                                onCheckedChange={() => toggleQuoteSelection(quote.id)}
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(quote.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="font-medium">{quote.vendorName || "-"}</TableCell>
                          <TableCell>{quote.clientName || "-"}</TableCell>
                          <TableCell>
                            {quote.komboName ? (
                              <Badge variant="secondary" className="text-xs">
                                {quote.komboName}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {quote.imobPlan && `IMOB ${planNames[quote.imobPlan]}`}
                                {quote.imobPlan && quote.locPlan && " + "}
                                {quote.locPlan && `LOC ${planNames[quote.locPlan]}`}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {frequencyNames[quote.frequency] || quote.frequency}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-blue-600">
                            {totals?.monthly ? formatCurrency(totals.monthly) : "-"}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {totals?.monthly !== undefined ? formatCurrency((totals.monthly || 0) + (totals.postPaid || 0)) : "-"}
                          </TableCell>
                          <TableCell className="text-right text-amber-600">
                            {totals?.implantation ? formatCurrency(totals.implantation) : "-"}
                          </TableCell>
                          <TableCell>
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteClick(quote.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filteredQuotes.length > 50 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Mostrando 50 de {filteredQuotes.length} cotações. Exporte para Excel para ver todas.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhuma cotação encontrada</p>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Confirmar exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja apagar esta cotação? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Apagar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Batch Delete Confirmation Dialog */}
        <AlertDialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Confirmar exclusão em lote
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja apagar <strong>{selectedQuotes.size}</strong> cotação{selectedQuotes.size > 1 ? "ões" : ""}? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBatchDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteBatchMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Apagar {selectedQuotes.size} cotação{selectedQuotes.size > 1 ? "ões" : ""}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
