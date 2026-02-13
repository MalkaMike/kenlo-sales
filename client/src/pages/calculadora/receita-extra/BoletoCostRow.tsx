/**
 * BoletoCostRow - Boleto cost (Pay) row
 */

import { useCalc } from "../CalculadoraContext";
import { toNum, formatCurrency, fmtNum } from "../types";
import * as Pricing from "@/utils/pricing";

export function BoletoCostRow() {
  const { product, addons, metrics, locPlan } = useCalc();

  if (
    !addons.pay ||
    !metrics.chargesBoletoToTenant ||
    (product !== "loc" && product !== "both")
  ) {
    return null;
  }

  const totalBoletos = toNum(metrics.contractsUnderManagement);
  const totalCost = totalBoletos > 0 ? Pricing.calculateBoletosCost(locPlan, totalBoletos) : 0;
  const pricePerUnit = totalBoletos > 0 ? totalCost / totalBoletos : 0;

  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          Custo Boletos (Pay)
        </span>
        <span className="text-xs text-gray-500 italic">
          Total: {fmtNum(totalBoletos)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={
            totalBoletos > 0
              ? "text-sm font-semibold text-red-600"
              : "text-sm text-green-600"
          }
        >
          {totalBoletos > 0
            ? `-${formatCurrency(totalCost)}/mês`
            : "Incluído no plano"}
        </span>
        {totalBoletos > 0 && (
          <span className="text-xs text-gray-500 italic">
            {formatCurrency(pricePerUnit, 2)}/boleto
          </span>
        )}
      </div>
    </div>
  );
}
