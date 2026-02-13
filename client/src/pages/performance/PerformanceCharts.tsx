/**
 * PerformanceCharts — MRR trend line chart, Kombo pie chart, and Plan breakdown.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Package, Layers } from "lucide-react";
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
} from "recharts";
import { formatCompactCurrency, CHART_COLORS, KOMBO_COLORS } from "./performanceConstants";
import type {
  TrendDataPoint,
  KomboBreakdownItem,
  PlanBreakdownItem,
} from "./performanceCalculators";

// ─── MRR Trend Chart ────────────────────────────────────────────────────────

interface MrrTrendChartProps {
  trendData: TrendDataPoint[];
}

export function MrrTrendChart({ trendData }: MrrTrendChartProps) {
  if (trendData.length <= 1) return null;

  return (
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
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis
              tickFormatter={(v: number) => formatCompactCurrency(v)}
              className="text-xs"
              width={80}
            />
            <Tooltip
              formatter={(value: number) => formatCompactCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="MRR s/ pós"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="MRR c/ pós"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ─── Kombo & Plan Breakdown ─────────────────────────────────────────────────

interface BreakdownChartsProps {
  komboBreakdown: KomboBreakdownItem[];
  planBreakdown: PlanBreakdownItem[];
}

export function BreakdownCharts({ komboBreakdown, planBreakdown }: BreakdownChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Kombo Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Breakdown por Kombo
          </CardTitle>
          <CardDescription>Distribuição de cotações por tipo de Kombo</CardDescription>
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
                    label={({ komboName, count }: { komboName: string; count: number }) =>
                      `${komboName} (${count})`
                    }
                  >
                    {komboBreakdown.map((entry) => (
                      <Cell
                        key={entry.komboId}
                        fill={KOMBO_COLORS[entry.komboId] || CHART_COLORS[0]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
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
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                KOMBO_COLORS[kombo.komboId] || CHART_COLORS[0],
                            }}
                          />
                          {kombo.komboName}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{kombo.count}</TableCell>
                      <TableCell className="text-right text-blue-600">
                        {formatCompactCurrency(kombo.mrrWithoutPostPaid)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCompactCurrency(kombo.mrrWithPostPaid)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma cotação encontrada
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plan Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-500" />
            Breakdown por Plano
          </CardTitle>
          <CardDescription>Distribuição de cotações por plano de produto</CardDescription>
        </CardHeader>
        <CardContent>
          {planBreakdown.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={planBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="plan" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" name="Cotações" radius={[4, 4, 0, 0]}>
                    {planBreakdown.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
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
                      <TableCell className="text-right text-blue-600">
                        {formatCompactCurrency(plan.mrrWithoutPostPaid)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCompactCurrency(plan.mrrWithPostPaid)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma cotação encontrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
