/**
 * Quotes table (desktop) and cards (mobile) for the Histórico page.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, Link2, Download, Calendar, Building2, Home, Package,
  TrendingUp, Loader2, ExternalLink, Trash2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, parseJSON, productNames, planNames, frequencyNames } from "./historicoConstants";
import type { Quote } from "@shared/types";

interface Props {
  quotes: Quote[] | undefined;
  filteredQuotes: Quote[] | undefined;
  isLoading: boolean;
  error: unknown;
  hasActiveFilters: boolean;
  onDeleteClick: (id: number) => void;
  isAdmin?: boolean;
  selectedIds?: Set<number>;
  onToggleSelect?: (id: number) => void;
}

// ── Desktop Table ───────────────────────────────────────────────
export function HistoricoDesktopTable({
  quotes, filteredQuotes, isLoading, error, hasActiveFilters, onDeleteClick,
  isAdmin, selectedIds, onToggleSelect,
}: Props) {
  return (
    <Card className="hidden md:block">
      <CardHeader>
        <CardTitle>Cotações Recentes</CardTitle>
        <CardDescription>
          {filteredQuotes && filteredQuotes.length > 0
            ? `Exibindo ${filteredQuotes.length} de ${quotes?.length || 0} cotações`
            : "Últimos 100 cotações gerados"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            Erro ao carregar cotações. Tente novamente.
          </div>
        ) : !filteredQuotes || filteredQuotes.length === 0 ? (
          <EmptyState hasActiveFilters={hasActiveFilters} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead className="w-10"></TableHead>}
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
                {filteredQuotes.map((quote) => (
                  <QuoteRow
                    key={quote.id}
                    quote={quote}
                    onDeleteClick={onDeleteClick}
                    isAdmin={isAdmin}
                    isSelected={selectedIds?.has(quote.id) || false}
                    onToggleSelect={onToggleSelect}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Mobile Cards ────────────────────────────────────────────────
export function HistoricoMobileCards({
  filteredQuotes, isLoading, error, hasActiveFilters, onDeleteClick,
}: Omit<Props, "quotes">) {
  return (
    <div className="md:hidden space-y-4">
      <h2 className="text-lg font-semibold">Cotações Recentes</h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-muted-foreground">
          Erro ao carregar cotações. Tente novamente.
        </div>
      ) : !filteredQuotes || filteredQuotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <EmptyState hasActiveFilters={hasActiveFilters} />
          </CardContent>
        </Card>
      ) : (
        filteredQuotes.map((quote) => (
          <QuoteMobileCard key={quote.id} quote={quote} onDeleteClick={onDeleteClick} />
        ))
      )}
    </div>
  );
}

// ── Shared sub-components ───────────────────────────────────────

function EmptyState({ hasActiveFilters }: { hasActiveFilters: boolean }) {
  return (
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
  );
}

function ActionBadge({ action }: { action: string }) {
  return action === "link_copied" ? (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
      <Link2 className="w-3 h-3 mr-1" />
      Link
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
      <Download className="w-3 h-3 mr-1" />
      PDF
    </Badge>
  );
}

function ProductIcon({ product }: { product: string }) {
  if (product === "imob") return <Building2 className="w-4 h-4 text-primary" />;
  if (product === "loc") return <Home className="w-4 h-4 text-secondary" />;
  if (product === "both") return <Package className="w-4 h-4 text-purple-600" />;
  return null;
}

function QuoteRow({ quote, onDeleteClick, isAdmin, isSelected, onToggleSelect }: {
  quote: Quote;
  onDeleteClick: (id: number) => void;
  isAdmin?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
}) {
  const totals = parseJSON(quote.totals);

  return (
    <TableRow className={isSelected ? "bg-blue-50" : ""}>
      {isAdmin && (
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(quote.id)}
          />
        </TableCell>
      )}
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {format(new Date(quote.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
        </div>
      </TableCell>
      <TableCell><ActionBadge action={quote.action} /></TableCell>
      <TableCell><span className="text-sm">{quote.clientName || <span className="text-muted-foreground">-</span>}</span></TableCell>
      <TableCell><span className="text-sm">{quote.vendorName || <span className="text-muted-foreground">-</span>}</span></TableCell>
      <TableCell><span className="text-sm">{quote.agencyName || <span className="text-muted-foreground">-</span>}</span></TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 text-sm">
          {quote.cellPhone && <span>📱 {quote.cellPhone}</span>}
          {quote.landlinePhone && <span>☎️ {quote.landlinePhone}</span>}
          {!quote.cellPhone && !quote.landlinePhone && <span className="text-muted-foreground">-</span>}
        </div>
      </TableCell>
      <TableCell><span className="text-sm">{quote.websiteUrl || <span className="text-muted-foreground">-</span>}</span></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ProductIcon product={quote.product} />
          <span className="text-sm">{productNames[quote.product] || quote.product}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          {quote.imobPlan && <Badge variant="secondary" className="text-xs w-fit">Imob: {planNames[quote.imobPlan] || quote.imobPlan}</Badge>}
          {quote.locPlan && <Badge variant="secondary" className="text-xs w-fit">Loc: {planNames[quote.locPlan] || quote.locPlan}</Badge>}
        </div>
      </TableCell>
      <TableCell>
        {quote.komboName ? (
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm">{quote.komboName}</span>
            {quote.komboDiscount && quote.komboDiscount > 0 && (
              <Badge className="ml-1 bg-green-100 text-green-700 text-xs">-{quote.komboDiscount}%</Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell><span className="text-sm">{frequencyNames[quote.frequency] || quote.frequency}</span></TableCell>
      <TableCell className="text-right font-medium">{totals?.monthly ? formatCurrency(totals.monthly) : "-"}</TableCell>
      <TableCell className="text-right font-medium">{totals?.annual ? formatCurrency(totals.annual) : "-"}</TableCell>
      <TableCell>
        {quote.shareableUrl ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(quote.shareableUrl!, "_blank")}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDeleteClick(quote.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function QuoteMobileCard({ quote, onDeleteClick }: { quote: Quote; onDeleteClick: (id: number) => void }) {
  const totals = parseJSON(quote.totals);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {format(new Date(quote.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </span>
          </div>
          <ActionBadge action={quote.action} />
        </div>
        <CardTitle className="text-base mt-2">{quote.clientName || "Cliente não informado"}</CardTitle>
        <CardDescription>{quote.agencyName || "Imobiliária não informada"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Vendedor:</span>
            <p className="font-medium">{quote.vendorName || "-"}</p>
          </div>
        </div>
        <div className="text-sm space-y-1">
          {quote.cellPhone && <p>📱 {quote.cellPhone}</p>}
          {quote.landlinePhone && <p>☎️ {quote.landlinePhone}</p>}
          {quote.websiteUrl && <p className="text-muted-foreground">🌐 {quote.websiteUrl}</p>}
        </div>
        <div className="flex items-center gap-2">
          <ProductIcon product={quote.product} />
          <span className="text-sm font-medium">{productNames[quote.product] || quote.product}</span>
          {quote.imobPlan && <Badge variant="secondary" className="text-xs">Imob: {planNames[quote.imobPlan] || quote.imobPlan}</Badge>}
          {quote.locPlan && <Badge variant="secondary" className="text-xs">Loc: {planNames[quote.locPlan] || quote.locPlan}</Badge>}
        </div>
        {quote.komboName && (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm">{quote.komboName}</span>
            {quote.komboDiscount && quote.komboDiscount > 0 && (
              <Badge className="bg-green-100 text-green-700 text-xs">-{quote.komboDiscount}%</Badge>
            )}
          </div>
        )}
        <div className="text-sm">
          <span className="text-muted-foreground">Frequência: </span>
          <span className="font-medium">{frequencyNames[quote.frequency] || quote.frequency}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Mensal:</span>
            <p className="font-medium">{totals?.monthly ? formatCurrency(totals.monthly) : "-"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Anual:</span>
            <p className="font-medium">{totals?.annual ? formatCurrency(totals.annual) : "-"}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          {quote.shareableUrl && (
            <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(quote.shareableUrl!, "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Link
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDeleteClick(quote.id)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
