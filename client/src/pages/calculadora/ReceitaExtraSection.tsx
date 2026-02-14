/**
 * ReceitaExtraSection - "Receitas Kenlo Extra" section
 * 
 * Only shown when there are revenue add-ons (Boleto/Split and/or Seguros).
 * Layout:
 *   1. Receitas (Boleto/Split revenue, Seguros revenue)
 *   2. Investimento (Mensalidade pré-pago + pós-pago total)
 *   3. Resultado (net gain/investment)
 */

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Receipt, Shield } from "lucide-react";
import { useCalc } from "./CalculadoraContext";
import { toNum, formatCurrency, fmtNum, fmtPrice } from "./types";
import { calculatePostPaidBreakdown, calculateRevenueBreakdown } from "./receita-extra/postPaidCalc";

export function ReceitaExtraSection() {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
    calculateMonthlyRecurring,
  } = useCalc();

  // Calculate revenues
  const calcInput = {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
  };

  const revenue = calculateRevenueBreakdown(calcInput);
  const postPaid = calculatePostPaidBreakdown(calcInput);
  const prePaid = calculateMonthlyRecurring(true);

  // Only show this section if there are revenues (Boleto/Split or Seguros)
  const hasPayRevenue =
    addons.pay &&
    (metrics.chargesBoletoToTenant || metrics.chargesSplitToOwner) &&
    (product === "loc" || product === "both");
  const hasSegurosRevenue =
    addons.seguros && (product === "loc" || product === "both");
  const hasAnyRevenue = hasPayRevenue || hasSegurosRevenue;

  if (!hasAnyRevenue) return null;

  // Calculate net result
  const totalInvestment = prePaid + postPaid.total;
  const netResult = revenue.total - totalInvestment;
  const isProfit = netResult > 0;

  // Build boleto/split description
  const boletoSplitDescription = (() => {
    if (!hasPayRevenue) return "";
    const parts: string[] = [];
    if (metrics.chargesBoletoToTenant) {
      parts.push(`${fmtNum(metrics.contractsUnderManagement)} boletos × R$ ${fmtPrice(toNum(metrics.boletoChargeAmount))}`);
    }
    if (metrics.chargesSplitToOwner) {
      parts.push(`${fmtNum(metrics.contractsUnderManagement)} splits × R$ ${fmtPrice(toNum(metrics.splitChargeAmount))}`);
    }
    return parts.join(" + ");
  })();

  return (
    <div className="mt-6 mb-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">
        Receitas Kenlo Extra
      </h2>

      <Card>
        <CardContent className="pt-4 space-y-1">
          {/* ── Section 1: Receitas ── */}
          <div className="py-2 bg-green-50/70 -mx-6 px-6 mb-3 rounded-sm">
            <h3 className="text-sm font-bold text-green-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Receitas
            </h3>
          </div>

          {/* Boletos & Split Revenue */}
          {hasPayRevenue && (
            <div className="flex justify-between items-start py-3 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-green-100 rounded-md mt-0.5">
                  <Receipt className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Boletos & Split</span>
                  <span className="text-xs text-gray-500 italic">{boletoSplitDescription}</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                +{formatCurrency(revenue.boletoRevenue + revenue.splitRevenue)}/mês
              </span>
            </div>
          )}

          {/* Seguros Revenue */}
          {hasSegurosRevenue && (
            <div className="flex justify-between items-start py-3 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-green-100 rounded-md mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Seguros</span>
                  <span className="text-xs text-gray-500 italic">
                    {fmtNum(metrics.contractsUnderManagement)} contratos × R$ 10,00
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600 whitespace-nowrap">
                +{formatCurrency(revenue.segurosRevenue)}/mês
              </span>
            </div>
          )}

          {/* Revenue Total */}
          <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded-lg mt-2">
            <span className="text-sm font-bold text-green-800">Total Receitas</span>
            <span className="text-base font-bold text-green-600">
              +{formatCurrency(revenue.total)}/mês
            </span>
          </div>

          {/* ── Section 2: Investimento ── */}
          <div className="py-2 bg-red-50/70 -mx-6 px-6 mb-3 mt-4 rounded-sm">
            <h3 className="text-sm font-bold text-red-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Investimento
            </h3>
          </div>

          {/* Mensalidade Pré-Pago */}
          <div className="flex justify-between items-start py-3 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-red-100 rounded-md mt-0.5">
                <DollarSign className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">Mensalidade (Pré-Pago)</span>
                <span className="text-xs text-gray-500 italic">Assinatura mensal fixa</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-red-600 whitespace-nowrap">
              -{formatCurrency(prePaid)}/mês
            </span>
          </div>

          {/* Mensalidade Pós-Pago (only if > 0) */}
          {postPaid.total > 0 && (
            <div className="flex justify-between items-start py-3 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 rounded-md mt-0.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Mensalidade (Pós-Pago)</span>
                  <span className="text-xs text-gray-500 italic">Custos variáveis estimados</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-red-600 whitespace-nowrap">
                -{formatCurrency(postPaid.total)}/mês
              </span>
            </div>
          )}

          {/* Investment Total */}
          <div className="flex justify-between items-center py-2 px-3 bg-red-50 rounded-lg mt-2">
            <span className="text-sm font-bold text-red-800">Total Investimento</span>
            <span className="text-base font-bold text-red-600">
              -{formatCurrency(totalInvestment)}/mês
            </span>
          </div>

          {/* ── Section 3: Resultado ── */}
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center py-4 px-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-base font-bold text-gray-900">
                  {isProfit ? "Ganho Líquido" : "Investimento Líquido"}
                </span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {isProfit ? "+" : "-"}{formatCurrency(Math.abs(netResult))}/mês
              </span>
            </div>

            {/* Killer phrase */}
            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-green-700 bg-green-100 py-3 px-4 rounded-lg">
                Kenlo é a única plataforma que pode se pagar enquanto você usa.
              </p>
            </div>

            {/* Footnote */}
            <div className="mt-3 text-xs text-gray-500 italic">
              Não inclui impostos.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
