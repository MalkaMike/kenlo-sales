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

      {/* Coverage percentage with progress bar */}
      {(recurring + postPaid.total) > 0 && (() => {
        const totalInv = recurring + postPaid.total;
        const coveragePct = Math.min(Math.round((revenue.total / totalInv) * 100), 999);
        const barPct = Math.min(coveragePct, 100);
        return (
          <div className="mt-3 px-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-green-700 font-medium">
                A receita cobre {coveragePct}% do investimento mensal
              </span>
              <span className="text-xs font-bold text-green-600">
                {coveragePct}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${barPct}%`,
                  background: coveragePct >= 100
                    ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                    : 'linear-gradient(90deg, #22c55e, #4ade80)',
                }}
              />
            </div>
            {coveragePct >= 100 && (
              <div className="text-xs text-green-600 font-medium mt-1 text-center">
                A receita supera o investimento!
              </div>
            )}
          </div>
        );
      })()}

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
    </>
  );
}
