/**
 * Excel export logic for the Histórico page.
 */

import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, parseJSON, productNames, planNames, frequencyNames } from "./historicoConstants";
import type { Quote } from "@shared/types";

export function exportQuotesToExcel(filteredQuotes: Quote[]) {
  if (!filteredQuotes || filteredQuotes.length === 0) {
    alert("Nenhum cotação para exportar");
    return;
  }

  const excelData = filteredQuotes.map((quote) => {
    const totals = parseJSON(quote.totals);
    return {
      Data: format(new Date(quote.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      Ação: quote.action === "link_copied" ? "Link Copiado" : "PDF Exportado",
      Vendedor: quote.vendorName || "-",
      Cliente: quote.clientName || "-",
      Imobiliária: quote.agencyName || "-",
      Celular: quote.cellPhone || "-",
      "Telefone Fixo": quote.landlinePhone || "-",
      Site: quote.websiteUrl || "-",
      Produto: productNames[quote.product] || quote.product,
      "Plano Imob": quote.imobPlan ? planNames[quote.imobPlan] : "-",
      "Plano Locação": quote.locPlan ? planNames[quote.locPlan] : "-",
      Kombo: quote.komboName || "Sem Kombo",
      "Desconto Kombo": quote.komboDiscount ? `${quote.komboDiscount}%` : "-",
      Frequência: frequencyNames[quote.frequency] || quote.frequency,
      "Valor Mensal": totals?.monthly ? formatCurrency(totals.monthly) : "-",
      "Valor Anual": totals?.annual ? formatCurrency(totals.annual) : "-",
      Implantação: totals?.implantation ? formatCurrency(totals.implantation) : "-",
      "Pós-Pago": totals?.postPaid ? formatCurrency(totals.postPaid) : "-",
      Link: quote.shareableUrl || "-",
    };
  });

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Cotações");

  ws["!cols"] = [
    { wch: 18 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 30 },
    { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 18 }, { wch: 12 },
    { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 50 },
  ];

  const filename = `historico-cotacoes-${format(new Date(), "yyyy-MM-dd-HHmm")}.xlsx`;
  XLSX.writeFile(wb, filename);
}
