/**
 * AdditionalContractsRow - LOC additional contracts cost row
 */

import { useCalc } from "../CalculadoraContext";
import { toNum, formatCurrency, fmtNum } from "../types";
import * as Pricing from "@/utils/pricing";

export function AdditionalContractsRow() {
  const { product, locPlan, metrics, prepayAdditionalContracts } = useCalc();

  if (product !== "loc" && product !== "both") return null;

  const included = Pricing.getIncludedQuantity("loc", locPlan);
  const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
  const totalCost = additional > 0 ? Pricing.calculateAdditionalContractsCost(locPlan, additional) : 0;
  const pricePerUnit = additional > 0 ? totalCost / additional : 0;

  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          Contratos Adicionais
        </span>
        <span className="text-xs text-gray-500 italic">
          Incluídos: {fmtNum(included)} | Adicionais: {fmtNum(additional)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={
            additional > 0 && !prepayAdditionalContracts
              ? "text-sm font-semibold text-red-600"
              : "text-sm text-green-600"
          }
        >
          {additional > 0
            ? prepayAdditionalContracts
              ? "Pré-pago"
              : `-${formatCurrency(totalCost)}/mês`
            : "Incluído no plano"}
        </span>
        {additional > 0 && !prepayAdditionalContracts && (
          <span className="text-xs text-gray-500 italic">
            {formatCurrency(pricePerUnit, 2)}/contrato
          </span>
        )}
      </div>
    </div>
  );
}
