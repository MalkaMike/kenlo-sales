/**
 * AdditionalUsersRow - IMOB additional users cost row
 */

import { useCalc } from "../CalculadoraContext";
import { toNum, formatCurrency, fmtNum, calculateAdditionalUsersCost, PREPAID_USER_PRICE_PER_MONTH, isPrepaidAvailable } from "../types";
import * as Pricing from "@/utils/pricing";

export function AdditionalUsersRow() {
  const { product, imobPlan, metrics, prepayAdditionalUsers, frequency } = useCalc();

  if (product !== "imob" && product !== "both") return null;

  const included = Pricing.getIncludedQuantity("imob", imobPlan);
  const additional = Math.max(0, toNum(metrics.imobUsers) - included);
  const postPaidCost = additional > 0 ? calculateAdditionalUsersCost(imobPlan, additional) : 0;
  const postPaidPricePerUnit = additional > 0 ? postPaidCost / additional : 0;
  const canPrepay = isPrepaidAvailable(frequency);

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
            ? prepayAdditionalUsers && canPrepay
              ? "Pré-pago"
              : `-${formatCurrency(postPaidCost)}/mês`
            : "Incluído no plano"}
        </span>
        {additional > 0 && prepayAdditionalUsers && canPrepay && (
          <span className="text-xs text-green-600 italic">
            R$ {PREPAID_USER_PRICE_PER_MONTH}/usuário/mês (fixo)
          </span>
        )}
        {additional > 0 && !prepayAdditionalUsers && (
          <span className="text-xs text-gray-500 italic">
            {formatCurrency(postPaidPricePerUnit, 2)}/usuário
          </span>
        )}
      </div>
    </div>
  );
}
