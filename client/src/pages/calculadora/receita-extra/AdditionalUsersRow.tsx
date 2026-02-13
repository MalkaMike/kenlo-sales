/**
 * AdditionalUsersRow - IMOB additional users cost row
 */

import { useCalc } from "../CalculadoraContext";
import { toNum, formatCurrency, fmtNum, calculateAdditionalUsersCost } from "../types";
import * as Pricing from "@/utils/pricing";

export function AdditionalUsersRow() {
  const { product, imobPlan, metrics, prepayAdditionalUsers } = useCalc();

  if (product !== "imob" && product !== "both") return null;

  const included = Pricing.getIncludedQuantity("imob", imobPlan);
  const additional = Math.max(0, toNum(metrics.imobUsers) - included);
  const totalCost = additional > 0 ? calculateAdditionalUsersCost(imobPlan, additional) : 0;
  const pricePerUnit = additional > 0 ? totalCost / additional : 0;

  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          Usuários Adicionais
        </span>
        <span className="text-xs text-gray-500 italic">
          Incluídos: {fmtNum(included)} | Adicionais: {fmtNum(additional)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={
            additional > 0 && !prepayAdditionalUsers
              ? "text-sm font-semibold text-red-600"
              : "text-sm text-green-600"
          }
        >
          {additional > 0
            ? prepayAdditionalUsers
              ? "Pré-pago"
              : `-${formatCurrency(totalCost)}/mês`
            : "Incluído no plano"}
        </span>
        {additional > 0 && !prepayAdditionalUsers && (
          <span className="text-xs text-gray-500 italic">
            {formatCurrency(pricePerUnit, 2)}/usuário
          </span>
        )}
      </div>
    </div>
  );
}
