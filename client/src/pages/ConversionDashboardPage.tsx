import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, Trophy, Target, Calendar } from "lucide-react";

type DateRange = "7d" | "30d" | "90d" | "all";

export default function ConversionDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const { data: dashboardData, isLoading } = trpc.analytics.getConversionDashboard.useQuery({
    dateRange,
  });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const { overview, salespeople, topProducts, topAddons } = dashboardData || {
    overview: { totalQuotes: 0, wonQuotes: 0, lostQuotes: 0, conversionRate: 0, avgTicket: 0 },
    salespeople: [],
    topProducts: [],
    topAddons: [],
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard de Conversão</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o desempenho de vendas e conversões da equipe
          </p>
        </div>

        <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cotações</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalQuotes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.wonQuotes} ganhas · {overview.lostQuotes} perdidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#4ABD8D]">
              {overview.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.wonQuotes} de {overview.totalQuotes} cotações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F82E52]">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(overview.avgTicket / 100)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Valor médio anual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format((overview.avgTicket * overview.wonQuotes) / 100)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Vendas fechadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Salespeople Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Desempenho por Vendedor</CardTitle>
          <CardDescription>Taxa de conversão e ticket médio de cada vendedor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salespeople.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum dado disponível para o período selecionado
              </p>
            ) : (
              salespeople.map((person: any) => (
                <div
                  key={person.vendorName}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{person.vendorName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {person.totalQuotes} cotações · {person.wonQuotes} ganhas ·{" "}
                      {person.lostQuotes} perdidas
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                      <p className="text-lg font-bold text-[#4ABD8D]">
                        {person.conversionRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Ticket Médio</p>
                      <p className="text-lg font-bold text-[#F82E52]">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(person.avgTicket / 100)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Products and Add-ons */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Ranking de produtos por número de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado disponível
                </p>
              ) : (
                topProducts.map((product: any, index: number) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.count} vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {((product.count / overview.wonQuotes) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Add-ons */}
        <Card>
          <CardHeader>
            <CardTitle>Add-ons Mais Vendidos</CardTitle>
            <CardDescription>Ranking de add-ons por número de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topAddons.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado disponível
                </p>
              ) : (
                topAddons.map((addon: any, index: number) => (
                  <div
                    key={addon.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary/10 text-secondary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{addon.name}</p>
                        <p className="text-sm text-muted-foreground">{addon.count} vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {((addon.count / overview.wonQuotes) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
