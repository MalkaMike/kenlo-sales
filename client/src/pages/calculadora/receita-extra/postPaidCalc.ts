/**
 * Post-Paid Calculation Utility
 * Centralizes all post-paid cost calculations for the UI rows.
 * Reuses tier calculation helpers from postPaidBuilder to avoid duplication.
 */

import { toNum } from "../types";
import type { ProductSelection, PlanTier, AddonsState, MetricsState } from "../types";
import {
  calcContractsTierCost,
  calcBoletoSplitTierCost,
  calcSignaturesTierCost,
  calcWhatsAppTierCost,
  getIncludedUsers,
  getIncludedContracts,
} from "../quote/postPaidBuilder";
import { calculateAdditionalUsersCost } from "../types";
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
 * Calculate all post-paid costs in a single pass.
 * Uses shared tier helpers from postPaidBuilder for contracts, boletos, splits,
 * signatures, and WhatsApp — eliminating duplicated tier logic.
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
    const included = getIncludedUsers(imobPlan);
    const extra = Math.max(0, toNum(metrics.imobUsers) - included);
    if (extra > 0) {
      additionalUsers = calculateAdditionalUsersCost(imobPlan, extra);
    }
  }

  // Additional Contracts (LOC) - uses shared tier helper
  if ((product === "loc" || product === "both") && !prepayAdditionalContracts) {
    const included = getIncludedContracts(locPlan);
    const extra = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
    if (extra > 0) {
      additionalContracts = calcContractsTierCost(locPlan, extra);
    }
  }

  // WhatsApp Leads - uses shared tier helper
  if (addons.leads && metrics.wantsWhatsApp) {
    const included = Pricing.getIncludedWhatsAppLeads();
    const extra = Math.max(0, toNum(metrics.leadsPerMonth) - included);
    if (extra > 0) {
      whatsApp = calcWhatsAppTierCost(extra);
    }
  }

  // Assinaturas Digitais - uses shared tier helper
  if (addons.assinatura) {
    const included = Pricing.getIncludedSignatures();
    let totalSig = 0;
    if (product === "imob") totalSig = toNum(metrics.closingsPerMonth);
    else if (product === "loc") totalSig = toNum(metrics.newContractsPerMonth);
    else totalSig = toNum(metrics.closingsPerMonth) + toNum(metrics.newContractsPerMonth);
    const extra = Math.max(0, totalSig - included);
    if (extra > 0) {
      assinaturas = calcSignaturesTierCost(extra);
    }
  }

  // Boletos (Pay) - base cost using shared tier helper
  if (addons.pay && (product === "loc" || product === "both")) {
    const totalBoletos = toNum(metrics.contractsUnderManagement);
    if (totalBoletos > 0) {
      boletos = calcBoletoSplitTierCost(locPlan, totalBoletos);
    }
  }

  // Boleto charges (Pay) - when charging tenant
  if (addons.pay && metrics.chargesBoletoToTenant && (product === "loc" || product === "both")) {
    const totalBoletos = toNum(metrics.contractsUnderManagement);
    if (totalBoletos > 0) {
      boletoCharges = calcBoletoSplitTierCost(locPlan, totalBoletos);
    }
  }

  // Split charges (Pay) - when charging owner
  if (addons.pay && metrics.chargesSplitToOwner && (product === "loc" || product === "both")) {
    const totalSplits = toNum(metrics.contractsUnderManagement);
    if (totalSplits > 0) {
      splitCharges = calcBoletoSplitTierCost(locPlan, totalSplits);
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
    segurosRevenue = toNum(metrics.contractsUnderManagement) * Pricing.getSegurosEstimatedRevenuePerContract();
  }

  return {
    boletoRevenue,
    splitRevenue,
    segurosRevenue,
    total: boletoRevenue + splitRevenue + segurosRevenue,
  };
}
