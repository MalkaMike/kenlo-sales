/**
 * AdditionalContractsRow - LOC additional contracts cost row
 */

import { useCalc } from "../CalculadoraContext";
import { toNum, formatCurrency, fmtNum, PREPAID_CONTRACT_PRICE_PER_MONTH, isPrepaidAvailable } from "../types";
import * as Pricing from "@/utils/pricing";

export function AdditionalContractsRow() {
  const { product, locPlan, metrics, prepayAdditionalContracts, frequency } = useCalc();

  if (product !== "loc" && product !== "both") return null;

  const included = Pricing.getIncludedQuantity("loc", locPlan);
  const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
  const postPaidCost = additional > 0 ? Pricing.calculateAdditionalContractsCost(locPlan, additional) : 0;
  const postPaidPricePerUnit = additional > 0 ? postPaidCost / additional : 0;
  const canPrepay = isPrepaidAvailable(frequency);

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
            ? prepayAdditionalContracts && canPrepay
              ? "Pré-pago"
              : `-${formatCurrency(postPaidCost)}/mês`
            : "Incluído no plano"}
        </span>
        {additional > 0 && prepayAdditionalContracts && canPrepay && (
          <span className="text-xs text-green-600 italic">
            R$ {PREPAID_CONTRACT_PRICE_PER_MONTH.toFixed(2).replace('.', ',')}/contrato/mês (fixo)
          </span>
        )}
        {additional > 0 && !prepayAdditionalContracts && (
          <span className="text-xs text-gray-500 italic">
            {formatCurrency(postPaidPricePerUnit, 2)}/contrato
          </span>
        )}
      </div>
    </div>
  );
}
