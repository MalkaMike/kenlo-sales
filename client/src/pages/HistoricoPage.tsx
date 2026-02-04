/**
 * Histórico de Orçamentos - Página para consultar todos os orçamentos gerados
 */

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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function HistoricoPage() {
  const { data: quotes, isLoading, error } = trpc.quotes.list.useQuery({ limit: 100 });
  const { data: stats } = trpc.quotes.stats.useQuery();

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

        {/* Quotes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos Recentes</CardTitle>
            <CardDescription>
              Últimos 100 orçamentos gerados
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
            ) : !quotes || quotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum orçamento gerado ainda.</p>
                <p className="text-sm mt-2">
                  Copie um link ou exporte um PDF na calculadora para começar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Kombo</TableHead>
                      <TableHead>Frequência</TableHead>
                      <TableHead className="text-right">Mensal</TableHead>
                      <TableHead className="text-right">Anual</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => {
                      const totals = parseJSON(quote.totals);
                      const addonsData = parseJSON(quote.addons);
                      const enabledAddons = addonsData 
                        ? Object.entries(addonsData).filter(([_, v]) => v).map(([k]) => k)
                        : [];
                      
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
                            {quote.clientName ? (
                              <span className="text-sm">{quote.clientName}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add-ons Legend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Legenda de Add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline">leads = Kenlo Leads</Badge>
              <Badge variant="outline">inteligencia = Kenlo Inteligência</Badge>
              <Badge variant="outline">assinatura = Kenlo Assinatura</Badge>
              <Badge variant="outline">pay = Kenlo Pay</Badge>
              <Badge variant="outline">seguros = Kenlo Seguros</Badge>
              <Badge variant="outline">cash = Kenlo Cash</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
