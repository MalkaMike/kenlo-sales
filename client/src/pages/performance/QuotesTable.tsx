/**
 * QuotesTable — Recent quotes table with selection, batch delete, and individual delete.
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { FileText, Loader2, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, planNames, frequencyNames } from "./performanceConstants";
import type { QuoteRecord } from "./performanceCalculators";

interface CurrentUser {
  id: number;
  name: string;
  isAdmin?: boolean;
}

interface QuotesTableProps {
  quotes: QuoteRecord[] | undefined;
  isLoading: boolean;
  currentUser: CurrentUser;
  // Selection
  selectedQuotes: Set<number>;
  onToggleSelection: (quoteId: number) => void;
  onToggleSelectAll: () => void;
  // Delete
  onDeleteClick: (quoteId: number) => void;
  deleteDialogOpen: boolean;
  onDeleteDialogChange: (open: boolean) => void;
  onDeleteConfirm: () => void;
  isDeleting: boolean;
  // Batch delete
  onBatchDeleteClick: () => void;
  batchDeleteDialogOpen: boolean;
  onBatchDeleteDialogChange: (open: boolean) => void;
  onBatchDeleteConfirm: () => void;
  isBatchDeleting: boolean;
}

export function QuotesTable({
  quotes,
  isLoading,
  currentUser,
  selectedQuotes,
  onToggleSelection,
  onToggleSelectAll,
  onDeleteClick,
  deleteDialogOpen,
  onDeleteDialogChange,
  onDeleteConfirm,
  isDeleting,
  onBatchDeleteClick,
  batchDeleteDialogOpen,
  onBatchDeleteDialogChange,
  onBatchDeleteConfirm,
  isBatchDeleting,
}: QuotesTableProps) {
  const parseJSON = (str: string | null | undefined) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const allDeletable = quotes?.filter(
    (q) => currentUser.isAdmin || q.userId === currentUser.id
  ) ?? [];

  const allSelected = allDeletable.length > 0 && selectedQuotes.size === allDeletable.length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Cotações Recentes
              </CardTitle>
              <CardDescription>
                {quotes?.length || 0} cotações encontradas
                {!currentUser.isAdmin && " (você pode apagar apenas suas próprias cotações)"}
              </CardDescription>
            </div>
            {selectedQuotes.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onBatchDeleteClick}
                disabled={isBatchDeleting}
              >
                {isBatchDeleting ? (
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
          ) : quotes && quotes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox checked={allSelected} onCheckedChange={onToggleSelectAll} />
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
                  {quotes.slice(0, 50).map((quote) => {
                    const totals = parseJSON(quote.totals);
                    const canDelete =
                      currentUser.isAdmin || quote.userId === currentUser.id;

                    return (
                      <TableRow
                        key={quote.id}
                        className={selectedQuotes.has(quote.id) ? "bg-muted/50" : ""}
                      >
                        <TableCell>
                          {canDelete && (
                            <Checkbox
                              checked={selectedQuotes.has(quote.id)}
                              onCheckedChange={() => onToggleSelection(quote.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(quote.createdAt), "dd/MM/yy HH:mm", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="font-medium">
                          {quote.vendorName || "-"}
                        </TableCell>
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
                          {totals?.monthly !== undefined
                            ? formatCurrency(
                                (totals.monthly || 0) + (totals.postPaid || 0)
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right text-amber-600">
                          {totals?.implantation
                            ? formatCurrency(totals.implantation)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => onDeleteClick(quote.id)}
                              disabled={isDeleting}
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
              {quotes.length > 50 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Mostrando 50 de {quotes.length} cotações. Exporte para Excel para ver
                  todas.
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma cotação encontrada
            </p>
          )}
        </CardContent>
      </Card>

      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={onDeleteDialogChange}>
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
              onClick={onDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Delete Dialog */}
      <AlertDialog open={batchDeleteDialogOpen} onOpenChange={onBatchDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Confirmar exclusão em lote
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar{" "}
              <strong>{selectedQuotes.size}</strong> cotação
              {selectedQuotes.size > 1 ? "ões" : ""}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onBatchDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBatchDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Apagar {selectedQuotes.size} cotação{selectedQuotes.size > 1 ? "ões" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
