/**
 * SupportServicesRow - Support services cost row (VIP Support, CS Dedicado)
 */

import { useCalc } from "../CalculadoraContext";
import { formatCurrency } from "../types";
import * as Pricing from "@/utils/pricing";

export function SupportServicesRow() {
  const { product, metrics, imobPlan, locPlan } = useCalc();

  let totalSupportCost = 0;
  const services: string[] = [];

  if ((product === "imob" || product === "both") && metrics.imobVipSupport && imobPlan === "prime") {
    totalSupportCost += Pricing.getVipSupportPrice();
    services.push("VIP Imob");
  }
  if ((product === "imob" || product === "both") && metrics.imobDedicatedCS && imobPlan === "prime") {
    totalSupportCost += Pricing.getCSDedicadoPrice();
    services.push("CS Imob");
  }
  if ((product === "loc" || product === "both") && metrics.locVipSupport && locPlan === "prime") {
    totalSupportCost += Pricing.getVipSupportPrice();
    services.push("VIP Loc");
  }
  if ((product === "loc" || product === "both") && metrics.locDedicatedCS && locPlan === "prime") {
    totalSupportCost += Pricing.getCSDedicadoPrice();
    services.push("CS Loc");
  }

  if (totalSupportCost === 0) return null;

  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          Serviços de Atendimento
        </span>
        <span className="text-xs text-gray-500 italic">
          {services.join(" + ")}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold text-red-600">
          -{formatCurrency(totalSupportCost)}/mês
        </span>
        <span className="text-xs text-gray-500 italic">
          VIP R$97 | CS R$297
        </span>
      </div>
    </div>
  );
}
