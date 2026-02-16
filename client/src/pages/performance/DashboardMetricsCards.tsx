/**
 * MetricsCards — 6 KPI cards for the Performance dashboard header.
 */

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FileText, DollarSign, TrendingUp, CreditCard, PiggyBank, Target } from "lucide-react";
import { formatCompactCurrency } from "./performanceConstants";
import type { DashboardMetrics } from "./performanceCalculators";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
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
  );
}
