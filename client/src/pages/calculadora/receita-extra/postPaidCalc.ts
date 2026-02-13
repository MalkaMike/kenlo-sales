/**
 * Post-Paid Calculation Utility
 * Centralizes all post-paid cost calculations to eliminate duplication
 * between PostPaidTotalRow, GrandTotalRow, and individual row components.
 */

import { toNum } from "../types";
import type { ProductSelection, PlanTier, AddonsState, MetricsState } from "../types";
import * as Pricing from "@/utils/pricing";

export interface PostPaidCalcInput {
  product: ProductSelection;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  addons: AddonsState;
  metrics: MetricsState;
  prepayAdditionalUsers: boolean;
  prepayAdditionalContracts: boolean;
}

export interface PostPaidBreakdown {
  additionalUsers: number;
  additionalContracts: number;
  whatsApp: number;
  assinaturas: number;
  boletos: number;
  boletoCharges: number;
  splitCharges: number;
  supportServices: number;
  total: number;
}

export interface RevenueBreakdown {
  boletoRevenue: number;
  splitRevenue: number;
  segurosRevenue: number;
  total: number;
}

/**
 * Calculate all post-paid costs in a single pass
 */
export function calculatePostPaidBreakdown(input: PostPaidCalcInput): PostPaidBreakdown {
  const { product, imobPlan, locPlan, addons, metrics, prepayAdditionalUsers, prepayAdditionalContracts } = input;
  let additionalUsers = 0;
  let additionalContracts = 0;
  let whatsApp = 0;
  let assinaturas = 0;
  let boletos = 0;
  let boletoCharges = 0;
  let splitCharges = 0;
  let supportServices = 0;

  // Additional Users (IMOB)
  if ((product === "imob" || product === "both") && !prepayAdditionalUsers) {
    const included = Pricing.getIncludedQuantity("imob", imobPlan);
    const extra = Math.max(0, toNum(metrics.imobUsers) - included);
    if (extra > 0) {
      additionalUsers = Pricing.calculateAdditionalUsersCost(imobPlan, extra);
    }
  }

  // Additional Contracts (LOC)
  if ((product === "loc" || product === "both") && !prepayAdditionalContracts) {
    const included = Pricing.getIncludedQuantity("loc", locPlan);
    const extra = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
    if (extra > 0) {
      additionalContracts = Pricing.calculateAdditionalContractsCost(locPlan, extra);
    }
  }

  // WhatsApp Leads
  if (addons.leads && metrics.wantsWhatsApp) {
    const included = Pricing.getIncludedWhatsAppLeads();
    const extra = Math.max(0, toNum(metrics.leadsPerMonth) - included);
    if (extra > 0) {
      whatsApp = Pricing.calculateAdditionalWhatsAppLeadsCost(extra);
    }
  }

  // Assinaturas Digitais
  if (addons.assinatura) {
    const included = Pricing.getIncludedSignatures();
    let totalSig = 0;
    if (product === "imob") totalSig = toNum(metrics.closingsPerMonth);
    else if (product === "loc") totalSig = toNum(metrics.newContractsPerMonth);
    else totalSig = toNum(metrics.closingsPerMonth) + toNum(metrics.newContractsPerMonth);
    const extra = Math.max(0, totalSig - included);
    if (extra > 0) {
      assinaturas = Pricing.calculateAdditionalSignaturesCost(extra);
    }
  }

  // Boletos (Pay) - base cost
  if (addons.pay && (product === "loc" || product === "both")) {
    const totalBoletos = toNum(metrics.contractsUnderManagement);
    if (totalBoletos > 0) {
      boletos = Pricing.calculateBoletosCost(locPlan, totalBoletos);
    }
  }

  // Boleto charges (Pay) - when charging tenant
  if (addons.pay && metrics.chargesBoletoToTenant && (product === "loc" || product === "both")) {
    const totalBoletos = toNum(metrics.contractsUnderManagement);
    if (totalBoletos > 0) {
      boletoCharges = Pricing.calculateBoletosCost(locPlan, totalBoletos);
    }
  }

  // Split charges (Pay) - when charging owner
  if (addons.pay && metrics.chargesSplitToOwner && (product === "loc" || product === "both")) {
    const totalSplits = toNum(metrics.contractsUnderManagement);
    if (totalSplits > 0) {
      splitCharges = Pricing.calculateSplitsCost(locPlan, totalSplits);
    }
  }

  // Support Services
  if ((product === "imob" || product === "both") && metrics.imobVipSupport && imobPlan === "prime") {
    supportServices += Pricing.getVipSupportPrice();
  }
  if ((product === "imob" || product === "both") && metrics.imobDedicatedCS && imobPlan === "prime") {
    supportServices += Pricing.getCSDedicadoPrice();
  }
  if ((product === "loc" || product === "both") && metrics.locVipSupport && locPlan === "prime") {
    supportServices += Pricing.getVipSupportPrice();
  }
  if ((product === "loc" || product === "both") && metrics.locDedicatedCS && locPlan === "prime") {
    supportServices += Pricing.getCSDedicadoPrice();
  }

  const total = additionalUsers + additionalContracts + whatsApp + assinaturas + boletos + boletoCharges + splitCharges + supportServices;

  return {
    additionalUsers,
    additionalContracts,
    whatsApp,
    assinaturas,
    boletos,
    boletoCharges,
    splitCharges,
    supportServices,
    total,
  };
}

/**
 * Calculate all revenue streams
 */
export function calculateRevenueBreakdown(input: PostPaidCalcInput): RevenueBreakdown {
  const { product, addons, metrics } = input;
  let boletoRevenue = 0;
  let splitRevenue = 0;
  let segurosRevenue = 0;

  if (addons.pay && (product === "loc" || product === "both")) {
    if (metrics.chargesBoletoToTenant) {
      boletoRevenue = toNum(metrics.contractsUnderManagement) * toNum(metrics.boletoChargeAmount);
    }
    if (metrics.chargesSplitToOwner) {
      splitRevenue = toNum(metrics.contractsUnderManagement) * toNum(metrics.splitChargeAmount);
    }
  }
  if (addons.seguros && (product === "loc" || product === "both")) {
    segurosRevenue = toNum(metrics.contractsUnderManagement) * 10;
  }

  return {
    boletoRevenue,
    splitRevenue,
    segurosRevenue,
    total: boletoRevenue + splitRevenue + segurosRevenue,
  };
}
