/**
 * WhatsAppRow - WhatsApp leads cost row
 */

import { useCalc } from "../CalculadoraContext";
import { toNum, formatCurrency, fmtNum } from "../types";
import * as Pricing from "@/utils/pricing";

export function WhatsAppRow() {
  const { addons, metrics, frequency, prepayAdditionalLeads } = useCalc();

  if (!addons.leads || !metrics.wantsWhatsApp) return null;

  const included = Pricing.getIncludedWhatsAppLeads();
  const totalLeads = toNum(metrics.leadsPerMonth);
  const additional = Math.max(0, totalLeads - included);
  
  // Use prepaid pricing if enabled and frequency is annual/biennial
  const isPrepaidAvailable = frequency === "annual" || frequency === "biennial";
  const usePrepaid = prepayAdditionalLeads && isPrepaidAvailable;
  
  const totalCost = usePrepaid 
    ? Pricing.calculatePrepaidLeads(totalLeads, frequency)
    : (additional > 0 ? Pricing.calculateAdditionalWhatsAppLeadsCost(additional) : 0);
  
  const pricePerUnit = usePrepaid
    ? 1.30
    : (additional > 0 ? totalCost / additional : 0);

  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          WhatsApp (Leads) {usePrepaid && <span className="text-xs text-blue-600 font-semibold ml-1">(Pré-pago)</span>}
        </span>
        <span className="text-xs text-gray-500 italic">
          {usePrepaid 
            ? `${fmtNum(totalLeads)} leads pré-pagos`
            : `Incluídas: ${fmtNum(included)} | Adicionais: ${fmtNum(additional)}`
          }
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={
            usePrepaid || additional > 0
              ? "text-sm font-semibold text-red-600"
              : "text-sm text-green-600"
          }
        >
          {usePrepaid
            ? `-${formatCurrency(totalCost)}/mês`
            : (additional > 0
              ? `-${formatCurrency(totalCost)}/mês`
              : "Incluído no plano")}
        </span>
        {(usePrepaid || additional > 0) && (
          <span className="text-xs text-gray-500 italic">
            {formatCurrency(pricePerUnit, 2)}/lead
          </span>
        )}
      </div>
    </div>
  );
}
