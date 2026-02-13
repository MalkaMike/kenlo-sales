/**
 * ReceitaExtraSection - Revenue extra section showing revenues vs investments
 * Extracted from CalculadoraPage.tsx (lines ~3421-4055)
 */

import { Card, CardContent } from "@/components/ui/card";
import { useCalc } from "./CalculadoraContext";
import {
  toNum,
  formatCurrency,
  fmtNum,
  fmtPrice,
  calculateAdditionalUsersCost,
} from "./types";
import * as Pricing from "@/utils/pricing";

export function ReceitaExtraSection() {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    frequency,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
    calculateMonthlyRecurring,
  } = useCalc();

  // Calculate if there are any revenues
  const currentProduct = product;
  const hasPayRevenue =
    addons.pay &&
    (metrics.chargesBoletoToTenant || metrics.chargesSplitToOwner) &&
    (currentProduct === "loc" || currentProduct === "both");
  const hasSegurosRevenue =
    addons.seguros &&
    (currentProduct === "loc" || currentProduct === "both");
  const hasAnyRevenue = hasPayRevenue || hasSegurosRevenue;

  if (!hasAnyRevenue) return null;

  return (
    <div className="mt-6 mb-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">
        Receita Extra
      </h2>

      <Card>
        <CardContent className="pt-4">
          {/* Receitas Category Header */}
          {((addons.pay &&
            (metrics.chargesBoletoToTenant || metrics.chargesSplitToOwner) &&
            (product === "loc" || product === "both")) ||
            (addons.seguros &&
              (product === "loc" || product === "both"))) && (
            <div className="py-3 bg-slate-50 -mx-6 px-6 mb-2">
              <h3 className="text-base font-bold text-gray-900">Receitas</h3>
            </div>
          )}

          {/* Boletos & Split */}
          {addons.pay &&
            (metrics.chargesBoletoToTenant || metrics.chargesSplitToOwner) &&
            (product === "loc" || product === "both") && (
              <div className="flex justify-between items-start py-4 border-b border-gray-200">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">
                    Boletos & Split
                  </span>
                  <span className="text-xs text-gray-500 italic">
                    {metrics.chargesBoletoToTenant &&
                    metrics.chargesSplitToOwner
                      ? `${fmtNum(metrics.contractsUnderManagement)} boletos × R$ ${fmtPrice(toNum(metrics.boletoChargeAmount))} + ${fmtNum(metrics.contractsUnderManagement)} splits × R$ ${fmtPrice(toNum(metrics.splitChargeAmount))}`
                      : metrics.chargesBoletoToTenant
                        ? `${fmtNum(metrics.contractsUnderManagement)} boletos × R$ ${fmtPrice(toNum(metrics.boletoChargeAmount))}`
                        : `${fmtNum(metrics.contractsUnderManagement)} splits × R$ ${fmtPrice(toNum(metrics.splitChargeAmount))}`}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-green-600">
                    +
                    {formatCurrency(
                      (() => {
                        let revenue = 0;
                        if (metrics.chargesBoletoToTenant) {
                          revenue +=
                            toNum(metrics.contractsUnderManagement) *
                            toNum(metrics.boletoChargeAmount);
                        }
                        if (metrics.chargesSplitToOwner) {
                          revenue +=
                            toNum(metrics.contractsUnderManagement) *
                            toNum(metrics.splitChargeAmount);
                        }
                        return revenue;
                      })()
                    )}
                    /mês
                  </span>
                </div>
              </div>
            )}

          {/* Seguros */}
          {addons.seguros &&
            (product === "loc" || product === "both") && (
              <div className="flex justify-between items-start py-4 border-b border-gray-200">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">
                    Seguros
                  </span>
                  <span className="text-xs text-gray-500 italic">
                    R$10 por contrato/mês
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-green-600">
                    +
                    {formatCurrency(
                      toNum(metrics.contractsUnderManagement) * 10
                    )}
                    /mês
                  </span>
                </div>
              </div>
            )}

          {/* Investimentos Category Header */}
          <div className="py-3 bg-slate-50 -mx-6 px-6 mb-2 mt-4">
            <h3 className="text-base font-bold text-gray-900">Investimentos</h3>
          </div>

          {/* Mensalidade (pré-pago) */}
          <div className="flex justify-between items-start py-4 border-b border-gray-200">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">
                Mensalidade (pré-pago)
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-red-600">
                -{formatCurrency(calculateMonthlyRecurring(true))}/mês
              </span>
            </div>
          </div>

          {/* Usuários Adicionais (IMOB) */}
          <AdditionalUsersRow />

          {/* Contratos Adicionais (LOC) */}
          <AdditionalContractsRow />

          {/* WhatsApp (Leads) */}
          <WhatsAppRow />

          {/* Assinaturas Digitais */}
          <AssinaturasRow />

          {/* Custo Boletos (Pay) */}
          <BoletoCostRow />

          {/* Custo Split (Pay) */}
          <SplitCostRow />

          {/* Serviços de Atendimento */}
          <SupportServicesRow />

          {/* Total Pós-Pago Estimado */}
          <PostPaidTotalRow />

          {/* Grand Total */}
          <GrandTotalRow />
        </CardContent>
      </Card>
    </div>
  );
}

function AdditionalUsersRow() {
  const { product, imobPlan, metrics, prepayAdditionalUsers } = useCalc();
  if (product !== "imob" && product !== "both") return null;

  const plan = imobPlan;
  const included = plan === "prime" ? 2 : plan === "k" ? 5 : 10;
  const additional = Math.max(0, toNum(metrics.imobUsers) - included);
  const totalCost =
    additional > 0 ? calculateAdditionalUsersCost(plan, additional) : 0;
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

function AdditionalContractsRow() {
  const { product, locPlan, metrics, prepayAdditionalContracts } = useCalc();
  if (product !== "loc" && product !== "both") return null;

  const plan = locPlan;
  const included = plan === "prime" ? 100 : plan === "k" ? 150 : 500;
  const additional = Math.max(
    0,
    toNum(metrics.contractsUnderManagement) - included
  );
  const totalCost = (() => {
    if (additional === 0) return 0;
    if (plan === "prime") return additional * 3;
    else if (plan === "k") {
      const tier1 = Math.min(additional, 250);
      const tier2 = Math.max(0, additional - 250);
      return tier1 * 3 + tier2 * 2.5;
    } else {
      const tier1 = Math.min(additional, 250);
      const tier2 = Math.min(Math.max(0, additional - 250), 250);
      const tier3 = Math.max(0, additional - 500);
      return tier1 * 3 + tier2 * 2.5 + tier3 * 2;
    }
  })();
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

function WhatsAppRow() {
  const { addons, metrics } = useCalc();
  if (!addons.leads || !metrics.wantsWhatsApp) return null;

  const included = 100;
  const totalLeads = toNum(metrics.leadsPerMonth);
  const additional = Math.max(0, totalLeads - included);
  const totalCost = (() => {
    if (additional === 0) return 0;
    const tier1 = Math.min(additional, 200);
    const tier2 = Math.min(Math.max(0, additional - 200), 150);
    const tier3 = Math.min(Math.max(0, additional - 350), 650);
    const tier4 = Math.max(0, additional - 1000);
    return tier1 * 2.0 + tier2 * 1.8 + tier3 * 1.5 + tier4 * 1.2;
  })();
  const pricePerUnit = additional > 0 ? totalCost / additional : 0;

  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          WhatsApp (Leads)
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
            {formatCurrency(pricePerUnit, 2)}/mensagem
          </span>
        )}
      </div>
    </div>
  );
}

function AssinaturasRow() {
  const { product, addons, metrics } = useCalc();
  if (!addons.assinatura) return null;

  const included = 15;
  let totalSignatures = 0;
  if (product === "imob") totalSignatures = toNum(metrics.closingsPerMonth);
  else if (product === "loc")
    totalSignatures = toNum(metrics.newContractsPerMonth);
  else
    totalSignatures =
      toNum(metrics.closingsPerMonth) + toNum(metrics.newContractsPerMonth);
  const additional = Math.max(0, totalSignatures - included);
  const totalCost = (() => {
    if (additional === 0) return 0;
    const tier1 = Math.min(additional, 20);
    const tier2 = Math.min(Math.max(0, additional - 20), 20);
    const tier3 = Math.max(0, additional - 40);
    return tier1 * 1.8 + tier2 * 1.7 + tier3 * 1.5;
  })();
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

function BoletoCostRow() {
  const { product, addons, metrics, locPlan } = useCalc();
  if (
    !addons.pay ||
    !metrics.chargesBoletoToTenant ||
    (product !== "loc" && product !== "both")
  )
    return null;

  const plan = locPlan;
  const includedBoletos = plan === "prime" ? 2 : plan === "k" ? 5 : 15;
  const additionalBoletos = Math.max(
    0,
    toNum(metrics.contractsUnderManagement) - includedBoletos
  );
  const totalCost = (() => {
    if (additionalBoletos === 0) return 0;
    if (plan === "prime") return additionalBoletos * 4;
    else if (plan === "k") {
      const tier1 = Math.min(additionalBoletos, 250);
      const tier2 = Math.max(0, additionalBoletos - 250);
      return tier1 * 4 + tier2 * 3.5;
    } else {
      const tier1 = Math.min(additionalBoletos, 250);
      const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
      const tier3 = Math.max(0, additionalBoletos - 500);
      return tier1 * 4 + tier2 * 3.5 + tier3 * 3;
    }
  })();
  const pricePerUnit =
    additionalBoletos > 0 ? totalCost / additionalBoletos : 0;

  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          Custo Boletos (Pay)
        </span>
        <span className="text-xs text-gray-500 italic">
          Incluídos: {fmtNum(includedBoletos)} | Adicionais:{" "}
          {fmtNum(additionalBoletos)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={
            additionalBoletos > 0
              ? "text-sm font-semibold text-red-600"
              : "text-sm text-green-600"
          }
        >
          {additionalBoletos > 0
            ? `-${formatCurrency(totalCost)}/mês`
            : "Incluído no plano"}
        </span>
        {additionalBoletos > 0 && (
          <span className="text-xs text-gray-500 italic">
            {formatCurrency(pricePerUnit, 2)}/boleto
          </span>
        )}
      </div>
    </div>
  );
}

function SplitCostRow() {
  const { product, addons, metrics, locPlan } = useCalc();
  if (
    !addons.pay ||
    !metrics.chargesSplitToOwner ||
    (product !== "loc" && product !== "both")
  )
    return null;

  const plan = locPlan;
  const includedSplits = plan === "prime" ? 2 : plan === "k" ? 5 : 15;
  const additionalSplits = Math.max(
    0,
    toNum(metrics.contractsUnderManagement) - includedSplits
  );
  const totalCost = (() => {
    if (additionalSplits === 0) return 0;
    if (plan === "prime") return additionalSplits * 4;
    else if (plan === "k") {
      const tier1 = Math.min(additionalSplits, 250);
      const tier2 = Math.max(0, additionalSplits - 250);
      return tier1 * 4 + tier2 * 3.5;
    } else {
      const tier1 = Math.min(additionalSplits, 250);
      const tier2 = Math.min(Math.max(0, additionalSplits - 250), 250);
      const tier3 = Math.max(0, additionalSplits - 500);
      return tier1 * 4 + tier2 * 3.5 + tier3 * 3;
    }
  })();
  const pricePerUnit =
    additionalSplits > 0 ? totalCost / additionalSplits : 0;

  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          Custo Split (Pay)
        </span>
        <span className="text-xs text-gray-500 italic">
          Incluídos: {fmtNum(includedSplits)} | Adicionais:{" "}
          {fmtNum(additionalSplits)}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span
          className={
            additionalSplits > 0
              ? "text-sm font-semibold text-red-600"
              : "text-sm text-green-600"
          }
        >
          {additionalSplits > 0
            ? `-${formatCurrency(totalCost)}/mês`
            : "Incluído no plano"}
        </span>
        {additionalSplits > 0 && (
          <span className="text-xs text-gray-500 italic">
            {formatCurrency(pricePerUnit, 2)}/split
          </span>
        )}
      </div>
    </div>
  );
}

function SupportServicesRow() {
  const { product, metrics, imobPlan, locPlan } = useCalc();

  let totalSupportCost = 0;
  const services: string[] = [];
  if (
    (product === "imob" || product === "both") &&
    metrics.imobVipSupport &&
    imobPlan === "prime"
  ) {
    totalSupportCost += Pricing.getVipSupportPrice();
    services.push("VIP Imob");
  }
  if (
    (product === "imob" || product === "both") &&
    metrics.imobDedicatedCS &&
    imobPlan === "prime"
  ) {
    totalSupportCost += Pricing.getCSDedicadoPrice();
    services.push("CS Imob");
  }
  if (
    (product === "loc" || product === "both") &&
    metrics.locVipSupport &&
    locPlan === "prime"
  ) {
    totalSupportCost += Pricing.getVipSupportPrice();
    services.push("VIP Loc");
  }
  if (
    (product === "loc" || product === "both") &&
    metrics.locDedicatedCS &&
    locPlan === "prime"
  ) {
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

function PostPaidTotalRow() {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
  } = useCalc();

  let totalPP = 0;
  // Usuários Adicionais (IMOB)
  if ((product === "imob" || product === "both") && !prepayAdditionalUsers) {
    const plan = imobPlan;
    const included = plan === "prime" ? 2 : plan === "k" ? 5 : 10;
    const additional = Math.max(0, toNum(metrics.imobUsers) - included);
    if (additional > 0) {
      if (plan === "prime") totalPP += additional * 57;
      else if (plan === "k") {
        totalPP +=
          Math.min(additional, 5) * 47 + Math.max(0, additional - 5) * 37;
      } else {
        totalPP +=
          Math.min(additional, 10) * 37 +
          Math.min(Math.max(0, additional - 10), 90) * 27 +
          Math.max(0, additional - 100) * 17;
      }
    }
  }
  // Contratos Adicionais (LOC)
  if (
    (product === "loc" || product === "both") &&
    !prepayAdditionalContracts
  ) {
    const plan = locPlan;
    const included = plan === "prime" ? 100 : plan === "k" ? 150 : 500;
    const additional = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - included
    );
    if (additional > 0) {
      if (plan === "prime") totalPP += additional * 3;
      else if (plan === "k") {
        totalPP +=
          Math.min(additional, 250) * 3 + Math.max(0, additional - 250) * 2.5;
      } else {
        totalPP +=
          Math.min(additional, 250) * 3 +
          Math.min(Math.max(0, additional - 250), 250) * 2.5 +
          Math.max(0, additional - 500) * 2;
      }
    }
  }
  // WhatsApp Leads
  if (addons.leads && metrics.wantsWhatsApp) {
    const additional = Math.max(0, toNum(metrics.leadsPerMonth) - 100);
    if (additional > 0) {
      totalPP +=
        Math.min(additional, 200) * 2.0 +
        Math.min(Math.max(0, additional - 200), 150) * 1.8 +
        Math.min(Math.max(0, additional - 350), 650) * 1.5 +
        Math.max(0, additional - 1000) * 1.2;
    }
  }
  // Assinaturas Digitais
  if (addons.assinatura) {
    let totalSig = 0;
    if (product === "imob") totalSig = toNum(metrics.closingsPerMonth);
    else if (product === "loc")
      totalSig = toNum(metrics.newContractsPerMonth);
    else
      totalSig =
        toNum(metrics.closingsPerMonth) + toNum(metrics.newContractsPerMonth);
    const additional = Math.max(0, totalSig - 15);
    if (additional > 0) {
      totalPP +=
        Math.min(additional, 20) * 1.8 +
        Math.min(Math.max(0, additional - 20), 20) * 1.7 +
        Math.max(0, additional - 40) * 1.5;
    }
  }
  // Boletos (Pay)
  if (addons.pay && (product === "loc" || product === "both")) {
    const plan = locPlan;
    const inclB = plan === "prime" ? 2 : plan === "k" ? 5 : 15;
    const addB = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - inclB
    );
    if (addB > 0) {
      if (plan === "prime") totalPP += addB * 4;
      else if (plan === "k")
        totalPP += Math.min(addB, 250) * 4 + Math.max(0, addB - 250) * 3.5;
      else
        totalPP +=
          Math.min(addB, 250) * 4 +
          Math.min(Math.max(0, addB - 250), 250) * 3.5 +
          Math.max(0, addB - 500) * 3;
    }
  }
  // Custo Boletos cobrados (Pay)
  if (
    addons.pay &&
    metrics.chargesBoletoToTenant &&
    (product === "loc" || product === "both")
  ) {
    const plan = locPlan;
    const inclB = plan === "prime" ? 2 : plan === "k" ? 5 : 15;
    const addB = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - inclB
    );
    if (addB > 0) {
      if (plan === "prime") totalPP += addB * 4;
      else if (plan === "k")
        totalPP += Math.min(addB, 250) * 4 + Math.max(0, addB - 250) * 3.5;
      else
        totalPP +=
          Math.min(addB, 250) * 4 +
          Math.min(Math.max(0, addB - 250), 250) * 3.5 +
          Math.max(0, addB - 500) * 3;
    }
  }
  // Custo Split cobrados (Pay)
  if (
    addons.pay &&
    metrics.chargesSplitToOwner &&
    (product === "loc" || product === "both")
  ) {
    const plan = locPlan;
    const inclS = plan === "prime" ? 2 : plan === "k" ? 5 : 15;
    const addS = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - inclS
    );
    if (addS > 0) {
      if (plan === "prime") totalPP += addS * 4;
      else if (plan === "k")
        totalPP += Math.min(addS, 250) * 4 + Math.max(0, addS - 250) * 3.5;
      else
        totalPP +=
          Math.min(addS, 250) * 4 +
          Math.min(Math.max(0, addS - 250), 250) * 3.5 +
          Math.max(0, addS - 500) * 3;
    }
  }
  // Serviços de Atendimento
  if (
    (product === "imob" || product === "both") &&
    metrics.imobVipSupport &&
    imobPlan === "prime"
  )
    totalPP += Pricing.getVipSupportPrice();
  if (
    (product === "imob" || product === "both") &&
    metrics.imobDedicatedCS &&
    imobPlan === "prime"
  )
    totalPP += Pricing.getCSDedicadoPrice();
  if (
    (product === "loc" || product === "both") &&
    metrics.locVipSupport &&
    locPlan === "prime"
  )
    totalPP += Pricing.getVipSupportPrice();
  if (
    (product === "loc" || product === "both") &&
    metrics.locDedicatedCS &&
    locPlan === "prime"
  )
    totalPP += Pricing.getCSDedicadoPrice();

  if (totalPP === 0) return null;

  return (
    <div className="flex justify-between items-center py-3 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-4">
      <span className="text-sm font-bold text-amber-800">
        Total Pós-Pago Estimado
      </span>
      <span className="text-base font-bold text-amber-700">
        {formatCurrency(totalPP)}/mês
      </span>
    </div>
  );
}

function GrandTotalRow() {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
    calculateMonthlyRecurring,
  } = useCalc();

  const recurring = calculateMonthlyRecurring(true);
  let totalPostPaid = 0;

  // Additional Users (IMOB)
  if ((product === "imob" || product === "both") && !prepayAdditionalUsers) {
    const plan = imobPlan;
    const included = plan === "prime" ? 2 : plan === "k" ? 5 : 10;
    const additional = Math.max(0, toNum(metrics.imobUsers) - included);
    if (additional > 0) {
      if (plan === "prime") totalPostPaid += additional * 57;
      else if (plan === "k") {
        const tier1 = Math.min(additional, 5);
        const tier2 = Math.max(0, additional - 5);
        totalPostPaid += tier1 * 47 + tier2 * 37;
      } else {
        const tier1 = Math.min(additional, 10);
        const tier2 = Math.min(Math.max(0, additional - 10), 90);
        const tier3 = Math.max(0, additional - 100);
        totalPostPaid += tier1 * 37 + tier2 * 27 + tier3 * 17;
      }
    }
  }
  // Additional Contracts (LOC)
  if (
    (product === "loc" || product === "both") &&
    !prepayAdditionalContracts
  ) {
    const plan = locPlan;
    const included = plan === "prime" ? 100 : plan === "k" ? 150 : 500;
    const additional = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - included
    );
    if (additional > 0) {
      if (plan === "prime") totalPostPaid += additional * 3;
      else if (plan === "k") {
        const tier1 = Math.min(additional, 250);
        const tier2 = Math.max(0, additional - 250);
        totalPostPaid += tier1 * 3 + tier2 * 2.5;
      } else {
        const tier1 = Math.min(additional, 250);
        const tier2 = Math.min(Math.max(0, additional - 250), 250);
        const tier3 = Math.max(0, additional - 500);
        totalPostPaid += tier1 * 3 + tier2 * 2.5 + tier3 * 2;
      }
    }
  }
  // Boletos (Pay)
  if (addons.pay && (product === "loc" || product === "both")) {
    const plan = locPlan;
    const includedBoletos = plan === "prime" ? 2 : plan === "k" ? 5 : 15;
    const totalBoletos = toNum(metrics.contractsUnderManagement);
    const additionalBoletos = Math.max(0, totalBoletos - includedBoletos);
    if (additionalBoletos > 0) {
      if (plan === "prime") totalPostPaid += additionalBoletos * 4;
      else if (plan === "k") {
        const tier1 = Math.min(additionalBoletos, 250);
        const tier2 = Math.max(0, additionalBoletos - 250);
        totalPostPaid += tier1 * 4 + tier2 * 3.5;
      } else {
        const tier1 = Math.min(additionalBoletos, 250);
        const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
        const tier3 = Math.max(0, additionalBoletos - 500);
        totalPostPaid += tier1 * 4 + tier2 * 3.5 + tier3 * 3;
      }
    }
  }
  // WhatsApp
  if (addons.leads && metrics.wantsWhatsApp) {
    const included = 100;
    const totalLeads = toNum(metrics.leadsPerMonth);
    const additional = Math.max(0, totalLeads - included);
    if (additional > 0) {
      const tier1 = Math.min(additional, 200);
      const tier2 = Math.min(Math.max(0, additional - 200), 150);
      const tier3 = Math.min(Math.max(0, additional - 350), 650);
      const tier4 = Math.max(0, additional - 1000);
      totalPostPaid += tier1 * 2.0 + tier2 * 1.8 + tier3 * 1.5 + tier4 * 1.2;
    }
  }
  // Assinaturas
  if (addons.assinatura) {
    const included = 15;
    let totalSignatures = 0;
    if (product === "imob")
      totalSignatures = toNum(toNum(metrics.closingsPerMonth));
    else if (product === "loc")
      totalSignatures = toNum(toNum(metrics.newContractsPerMonth));
    else
      totalSignatures =
        toNum(toNum(metrics.closingsPerMonth)) +
        toNum(toNum(metrics.newContractsPerMonth));
    const additional = Math.max(0, totalSignatures - included);
    if (additional > 0) {
      const tier1 = Math.min(additional, 20);
      const tier2 = Math.min(Math.max(0, additional - 20), 20);
      const tier3 = Math.max(0, additional - 40);
      totalPostPaid += tier1 * 1.8 + tier2 * 1.7 + tier3 * 1.5;
    }
  }
  // Boleto charges
  if (
    addons.pay &&
    metrics.chargesBoletoToTenant &&
    (product === "loc" || product === "both")
  ) {
    const plan = locPlan;
    const includedBoletos = plan === "prime" ? 2 : plan === "k" ? 5 : 15;
    const additionalBoletos = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - includedBoletos
    );
    if (additionalBoletos > 0) {
      if (plan === "prime") totalPostPaid += additionalBoletos * 4;
      else if (plan === "k") {
        const tier1 = Math.min(additionalBoletos, 250);
        const tier2 = Math.max(0, additionalBoletos - 250);
        totalPostPaid += tier1 * 4 + tier2 * 3.5;
      } else {
        const tier1 = Math.min(additionalBoletos, 250);
        const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
        const tier3 = Math.max(0, additionalBoletos - 500);
        totalPostPaid += tier1 * 4 + tier2 * 3.5 + tier3 * 3;
      }
    }
  }
  // Split charges
  if (
    addons.pay &&
    metrics.chargesSplitToOwner &&
    (product === "loc" || product === "both")
  ) {
    const plan = locPlan;
    const includedSplits = plan === "prime" ? 2 : plan === "k" ? 5 : 15;
    const additionalSplits = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - includedSplits
    );
    if (additionalSplits > 0) {
      if (plan === "prime") totalPostPaid += additionalSplits * 4;
      else if (plan === "k") {
        const tier1 = Math.min(additionalSplits, 250);
        const tier2 = Math.max(0, additionalSplits - 250);
        totalPostPaid += tier1 * 4 + tier2 * 3.5;
      } else {
        const tier1 = Math.min(additionalSplits, 250);
        const tier2 = Math.min(Math.max(0, additionalSplits - 250), 250);
        const tier3 = Math.max(0, additionalSplits - 500);
        totalPostPaid += tier1 * 4 + tier2 * 3.5 + tier3 * 3;
      }
    }
  }
  // Support Services
  if (product === "imob" || product === "both") {
    if (metrics.imobVipSupport && imobPlan === "prime")
      totalPostPaid += Pricing.getVipSupportPrice();
    if (metrics.imobDedicatedCS && imobPlan === "prime")
      totalPostPaid += Pricing.getCSDedicadoPrice();
    if (metrics.locVipSupport && locPlan === "prime")
      totalPostPaid += Pricing.getVipSupportPrice();
    if (metrics.locDedicatedCS && locPlan === "prime")
      totalPostPaid += Pricing.getCSDedicadoPrice();
  }

  let totalRevenue = 0;
  if (addons.pay && (product === "loc" || product === "both")) {
    if (metrics.chargesBoletoToTenant) {
      totalRevenue +=
        toNum(metrics.contractsUnderManagement) *
        toNum(metrics.boletoChargeAmount);
    }
    if (metrics.chargesSplitToOwner) {
      totalRevenue +=
        toNum(metrics.contractsUnderManagement) *
        toNum(metrics.splitChargeAmount);
    }
  }
  if (addons.seguros && (product === "loc" || product === "both")) {
    totalRevenue += toNum(metrics.contractsUnderManagement) * 10;
  }
  const total = totalRevenue - recurring - totalPostPaid;
  const isProfit = total > 0;

  return (
    <>
      <div className="flex justify-between items-center py-4 mt-2 bg-primary/5 rounded-lg px-4">
        <span className="text-base font-bold text-gray-900">
          {isProfit ? "Ganho" : "Investimento"}
        </span>
        <span
          className={`text-xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}
        >
          {formatCurrency(Math.abs(total))}/mês
        </span>
      </div>

      {/* Killer phrase */}
      <div className="mt-4 text-center">
        {isProfit ? (
          <p className="text-sm font-medium text-green-700 bg-green-100 py-3 px-4 rounded-lg">
            Kenlo é a única plataforma que pode se pagar enquanto você usa.
          </p>
        ) : (
          <p className="text-sm font-medium text-primary bg-primary/10 py-3 px-4 rounded-lg">
            Kenlo é a única plataforma que pode se pagar enquanto você usa.
          </p>
        )}
      </div>

      {/* Footnote */}
      <div className="mt-4 text-xs text-gray-500 italic">
        Não inclui impostos.
      </div>
    </>
  );
}
