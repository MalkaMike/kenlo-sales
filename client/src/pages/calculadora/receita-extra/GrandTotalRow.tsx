/**
 * GrandTotalRow - Grand total (revenue vs investment) with killer phrase
 * Uses the shared postPaidCalc utility to eliminate duplicated tier calculations.
 */

import { useCalc } from "../CalculadoraContext";
import { formatCurrency } from "../types";
import { calculatePostPaidBreakdown, calculateRevenueBreakdown } from "./postPaidCalc";

export function GrandTotalRow() {
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

  const calcInput = {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
  };

  const recurring = calculateMonthlyRecurring(true);
  const postPaid = calculatePostPaidBreakdown(calcInput);
  const revenue = calculateRevenueBreakdown(calcInput);

  const total = revenue.total - recurring - postPaid.total;
  const isProfit = total > 0;

  return (
    <>
      <div className="flex justify-between items-center py-4 mt-2 bg-green-50 border border-green-200 rounded-lg px-4">
        <span className="text-base font-bold text-gray-900">
          {isProfit ? "Ganho" : "Custo Reduzido"}
        </span>
        <span className="text-xl font-bold text-green-600">
          {formatCurrency(Math.abs(total))}/mês
        </span>
      </div>

      {/* Killer phrase */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-green-700 bg-green-100 py-3 px-4 rounded-lg">
          Kenlo é a única plataforma que pode se pagar enquanto você usa.
        </p>
      </div>

      {/* Footnote */}
      <div className="mt-4 text-xs text-gray-500 italic">
        Não inclui impostos.
      </div>
    </>
  );
}
