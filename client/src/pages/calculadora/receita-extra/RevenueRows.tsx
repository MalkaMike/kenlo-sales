/**
 * RevenueRows - Revenue line items (Boletos & Split, Seguros)
 */

import { useCalc } from "../CalculadoraContext";
import { toNum, formatCurrency, fmtNum, fmtPrice } from "../types";

export function BoletosSplitRevenueRow() {
  const { product, addons, metrics } = useCalc();

  if (
    !addons.pay ||
    (!metrics.chargesBoletoToTenant && !metrics.chargesSplitToOwner) ||
    (product !== "loc" && product !== "both")
  ) {
    return null;
  }

  let revenue = 0;
  if (metrics.chargesBoletoToTenant) {
    revenue += toNum(metrics.contractsUnderManagement) * toNum(metrics.boletoChargeAmount);
  }
  if (metrics.chargesSplitToOwner) {
    revenue += toNum(metrics.contractsUnderManagement) * toNum(metrics.splitChargeAmount);
  }

  const description =
    metrics.chargesBoletoToTenant && metrics.chargesSplitToOwner
      ? `${fmtNum(metrics.contractsUnderManagement)} boletos × R$ ${fmtPrice(toNum(metrics.boletoChargeAmount))} + ${fmtNum(metrics.contractsUnderManagement)} splits × R$ ${fmtPrice(toNum(metrics.splitChargeAmount))}`
      : metrics.chargesBoletoToTenant
        ? `${fmtNum(metrics.contractsUnderManagement)} boletos × R$ ${fmtPrice(toNum(metrics.boletoChargeAmount))}`
        : `${fmtNum(metrics.contractsUnderManagement)} splits × R$ ${fmtPrice(toNum(metrics.splitChargeAmount))}`;

  return (
    <div className="flex justify-between items-start py-4 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">Boletos & Split</span>
        <span className="text-xs text-gray-500 italic">{description}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold text-green-600">
          +{formatCurrency(revenue)}/mês
        </span>
      </div>
    </div>
  );
}

export function SegurosRevenueRow() {
  const { product, addons, metrics } = useCalc();

  if (!addons.seguros || (product !== "loc" && product !== "both")) {
    return null;
  }

  const revenue = toNum(metrics.contractsUnderManagement) * 10;

  return (
    <div className="flex justify-between items-start py-4 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">Seguros</span>
        <span className="text-xs text-gray-500 italic">R$10 por contrato/mês</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold text-green-600">
          +{formatCurrency(revenue)}/mês
        </span>
      </div>
    </div>
  );
}
