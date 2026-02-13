/**
 * SplitCostRow - Split cost (Pay) row
 */

import { useCalc } from "../CalculadoraContext";
import { toNum, formatCurrency, fmtNum } from "../types";
import * as Pricing from "@/utils/pricing";

export function SplitCostRow() {
  const { product, addons, metrics, locPlan } = useCalc();

  if (
    !addons.pay ||
    !metrics.chargesSplitToOwner ||
    (product !== "loc" && product !== "both")
  ) {
    return null;
  }

  const totalSplits = toNum(metrics.contractsUnderManagement);
  const totalCost = totalSplits > 0 ? Pricing.calculateSplitsCost(locPlan, totalSplits) : 0;
  const pricePerUnit = totalSplits > 0 ? totalCost / totalSplits : 0;

  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          Custo Split (Pay)
        </span>
        <span className="text-xs text-gray-500 italic">
          Total: {fmtNum(totalSplits)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={
            totalSplits > 0
              ? "text-sm font-semibold text-red-600"
              : "text-sm text-green-600"
          }
        >
          {totalSplits > 0
            ? `-${formatCurrency(totalCost)}/mês`
            : "Incluído no plano"}
        </span>
        {totalSplits > 0 && (
          <span className="text-xs text-gray-500 italic">
            {formatCurrency(pricePerUnit, 2)}/split
          </span>
        )}
      </div>
    </div>
  );
}
