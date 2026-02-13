/**
 * AssinaturasRow - Digital signatures cost row
 */

import { useCalc } from "../CalculadoraContext";
import { toNum, formatCurrency, fmtNum } from "../types";
import * as Pricing from "@/utils/pricing";

export function AssinaturasRow() {
  const { product, addons, metrics } = useCalc();

  if (!addons.assinatura) return null;

  const included = Pricing.getIncludedSignatures();
  let totalSignatures = 0;
  if (product === "imob") totalSignatures = toNum(metrics.closingsPerMonth);
  else if (product === "loc") totalSignatures = toNum(metrics.newContractsPerMonth);
  else totalSignatures = toNum(metrics.closingsPerMonth) + toNum(metrics.newContractsPerMonth);

  const additional = Math.max(0, totalSignatures - included);
  const totalCost = additional > 0 ? Pricing.calculateAdditionalSignaturesCost(additional) : 0;
  const pricePerUnit = additional > 0 ? totalCost / additional : 0;

  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          Assinaturas Digitais
        </span>
        <span className="text-xs text-gray-500 italic">
          Incluídas: {fmtNum(included)} | Adicionais: {fmtNum(additional)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={
            additional > 0
              ? "text-sm font-semibold text-red-600"
              : "text-sm text-green-600"
          }
        >
          {additional > 0
            ? `-${formatCurrency(totalCost)}/mês`
            : "Incluído no plano"}
        </span>
        {additional > 0 && (
          <span className="text-xs text-gray-500 italic">
            {formatCurrency(pricePerUnit, 2)}/assinatura
          </span>
        )}
      </div>
    </div>
  );
}
