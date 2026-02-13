/**
 * VendorRankingTable — Salesperson ranking table for the Performance dashboard.
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
import { Trophy } from "lucide-react";
import { formatCurrency } from "./performanceConstants";
import type { VendorRankingItem } from "./performanceCalculators";

interface VendorRankingTableProps {
  vendorRanking: VendorRankingItem[];
}

export function VendorRankingTable({ vendorRanking }: VendorRankingTableProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Ranking de Vendedores
        </CardTitle>
        <CardDescription>
          Performance por vendedor ordenado por MRR pré-pago (mensalidade fixa)
        </CardDescription>
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
                  <TableCell className="text-right text-primary font-bold">
                    {formatCurrency(vendor.mrrWithoutPostPaid)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(vendor.mrrWithPostPaid)}
                  </TableCell>
                  <TableCell className="text-right text-amber-600">
                    {formatCurrency(vendor.implantationValue)}
                  </TableCell>
                  <TableCell className="text-right text-purple-600">
                    {formatCurrency(vendor.ticketMedio)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma cotação encontrada
          </p>
        )}
      </CardContent>
    </Card>
  );
}
