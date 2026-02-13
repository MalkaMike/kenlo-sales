/**
 * PostPaidTotalRow - Total post-paid estimated cost row
 * Uses the shared postPaidCalc utility to eliminate duplicated tier calculations.
 */

import { useCalc } from "../CalculadoraContext";
import { formatCurrency } from "../types";
import { calculatePostPaidBreakdown } from "./postPaidCalc";

export function PostPaidTotalRow() {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
  } = useCalc();

  const breakdown = calculatePostPaidBreakdown({
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
  });

  if (breakdown.total === 0) return null;

  return (
    <div className="flex justify-between items-center py-3 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-4">
      <span className="text-sm font-bold text-amber-800">
        Total Pós-Pago Estimado
      </span>
      <span className="text-base font-bold text-amber-700">
        {formatCurrency(breakdown.total)}/mês
      </span>
    </div>
  );
}
