/**
 * postPaidBuilder.ts
 * Pure utility functions for calculating post-paid costs and building
 * the post-paid breakdown section for PDF generation.
 */

import * as Pricing from "@/utils/pricing";
import {
  toNum,
  calculateAdditionalUsersCost,
} from "../types";
import type {
  ProductSelection,
  PlanTier,
  AddonsState,
  MetricsState,
} from "../types";

// ─── Shared Input Type ─────────────────────────────────────────────────────

export interface PostPaidInput {
  product: ProductSelection;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  addons: AddonsState;
  metrics: MetricsState;
  prepayAdditionalUsers: boolean;
  prepayAdditionalContracts: boolean;
}

// ─── Tier Calculation Helpers ──────────────────────────────────────────────

function calcContractsTierCost(locPlan: PlanTier, additional: number): number {
  if (additional <= 0) return 0;
  if (locPlan === "prime") {
    return additional * 3;
  } else if (locPlan === "k") {
    const t1 = Math.min(additional, 250);
    const t2 = Math.max(0, additional - 250);
    return t1 * 3 + t2 * 2.5;
  } else {
    const t1 = Math.min(additional, 250);
    const t2 = Math.min(Math.max(0, additional - 250), 250);
    const t3 = Math.max(0, additional - 500);
    return t1 * 3 + t2 * 2.5 + t3 * 2;
  }
}

function calcBoletoSplitTierCost(locPlan: PlanTier, additional: number): number {
  if (additional <= 0) return 0;
  if (locPlan === "prime") {
    return additional * 4;
  } else if (locPlan === "k") {
    const t1 = Math.min(additional, 250);
    const t2 = Math.max(0, additional - 250);
    return t1 * 4 + t2 * 3.5;
  } else {
    const t1 = Math.min(additional, 250);
    const t2 = Math.min(Math.max(0, additional - 250), 250);
    const t3 = Math.max(0, additional - 500);
    return t1 * 4 + t2 * 3.5 + t3 * 3;
  }
}

function calcSignaturesTierCost(additional: number): number {
  if (additional <= 0) return 0;
  const t1 = Math.min(additional, 20);
  const t2 = Math.min(Math.max(0, additional - 20), 20);
  const t3 = Math.max(0, additional - 40);
  return t1 * 1.8 + t2 * 1.7 + t3 * 1.5;
}

function calcWhatsAppTierCost(additional: number): number {
  if (additional <= 0) return 0;
  const t1 = Math.min(additional, 200);
  const t2 = Math.min(Math.max(0, additional - 200), 150);
  const t3 = Math.min(Math.max(0, additional - 350), 650);
  const t4 = Math.max(0, additional - 1000);
  return t1 * 2.0 + t2 * 1.8 + t3 * 1.5 + t4 * 1.2;
}

// ─── Included Quantities ───────────────────────────────────────────────────

function getIncludedUsers(plan: PlanTier): number {
  return plan === "prime" ? 2 : plan === "k" ? 5 : 10;
}

function getIncludedContracts(plan: PlanTier): number {
  return plan === "prime" ? 100 : plan === "k" ? 150 : 500;
}

function getIncludedBoletosSplits(plan: PlanTier): number {
  return plan === "prime" ? 2 : plan === "k" ? 5 : 15;
}

// ─── Post-Paid Total Calculation ───────────────────────────────────────────

export function calculatePostPaidTotal(input: PostPaidInput): number {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
  } = input;

  let total = 0;

  // Support Services
  if (product === "imob" || product === "both") {
    if (metrics.imobVipSupport && imobPlan === "prime")
      total += Pricing.getVipSupportPrice();
    if (metrics.imobDedicatedCS && imobPlan === "prime")
      total += Pricing.getCSDedicadoPrice();
  }
  if (product === "loc" || product === "both") {
    if (metrics.locVipSupport && locPlan === "prime")
      total += Pricing.getVipSupportPrice();
    if (metrics.locDedicatedCS && locPlan === "prime")
      total += Pricing.getCSDedicadoPrice();
  }

  // Additional Users (Imob)
  if ((product === "imob" || product === "both") && !prepayAdditionalUsers) {
    const included = getIncludedUsers(imobPlan);
    const additional = Math.max(0, toNum(metrics.imobUsers) - included);
    if (additional > 0) {
      total += calculateAdditionalUsersCost(imobPlan, additional);
    }
  }

  // Additional Contracts (Loc)
  if ((product === "loc" || product === "both") && !prepayAdditionalContracts) {
    const included = getIncludedContracts(locPlan);
    const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
    if (additional > 0) {
      total += calcContractsTierCost(locPlan, additional);
    }
  }

  // WhatsApp Messages
  if (addons.leads && metrics.wantsWhatsApp) {
    const additional = Math.max(0, toNum(metrics.leadsPerMonth) - 100);
    if (additional > 0) {
      total += calcWhatsAppTierCost(additional);
    }
  }

  // Digital Signatures
  if (addons.assinatura) {
    let totalSigs = 0;
    if (product === "imob" || product === "both")
      totalSigs += toNum(metrics.closingsPerMonth);
    if (product === "loc" || product === "both")
      totalSigs += toNum(metrics.newContractsPerMonth);
    const additional = Math.max(0, totalSigs - 15);
    if (additional > 0) {
      total += calcSignaturesTierCost(additional);
    }
  }

  // Boleto costs
  if (addons.pay && metrics.chargesBoletoToTenant && (product === "loc" || product === "both")) {
    const included = getIncludedBoletosSplits(locPlan);
    const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
    if (additional > 0) {
      total += calcBoletoSplitTierCost(locPlan, additional);
    }
  }

  // Split costs
  if (addons.pay && metrics.chargesSplitToOwner && (product === "loc" || product === "both")) {
    const included = getIncludedBoletosSplits(locPlan);
    const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
    if (additional > 0) {
      total += calcBoletoSplitTierCost(locPlan, additional);
    }
  }

  return total;
}

// ─── Post-Paid Breakdown (for PDF Section) ─────────────────────────────────

interface BreakdownItem {
  label: string;
  included: number;
  additional: number;
  total: number;
  perUnit: number;
  unitLabel: string;
}

interface BreakdownGroup {
  groupLabel: string;
  groupTotal: number;
  items: BreakdownItem[];
}

interface BreakdownResult {
  total: number;
  imobAddons?: BreakdownGroup;
  locAddons?: BreakdownGroup;
  sharedAddons?: BreakdownGroup;
}

function addToGroup(
  bd: BreakdownResult,
  groupKey: "imobAddons" | "locAddons" | "sharedAddons",
  groupLabel: string,
  item: BreakdownItem
): void {
  if (!bd[groupKey]) {
    bd[groupKey] = { groupLabel, groupTotal: 0, items: [] };
  }
  bd[groupKey]!.items.push(item);
  bd[groupKey]!.groupTotal += item.total;
}

export function buildPostPaidBreakdown(input: PostPaidInput, postPaidTotal: number): string {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
  } = input;

  const bd: BreakdownResult = { total: postPaidTotal };

  // IMOB: Additional Users
  if ((product === "imob" || product === "both") && !prepayAdditionalUsers) {
    const included = getIncludedUsers(imobPlan);
    const additional = Math.max(0, toNum(metrics.imobUsers) - included);
    if (additional > 0) {
      const userCost = calculateAdditionalUsersCost(imobPlan, additional);
      addToGroup(bd, "imobAddons", "IMOB", {
        label: "Usuários Adicionais",
        included,
        additional,
        total: userCost,
        perUnit: imobPlan === "prime" ? 57 : imobPlan === "k" ? 47 : 37,
        unitLabel: "usuário",
      });
    }
  }

  // LOC: Additional Contracts
  if ((product === "loc" || product === "both") && !prepayAdditionalContracts) {
    const included = getIncludedContracts(locPlan);
    const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
    if (additional > 0) {
      const cost = calcContractsTierCost(locPlan, additional);
      addToGroup(bd, "locAddons", "LOCAÇÃO", {
        label: "Contratos Adicionais",
        included,
        additional,
        total: cost,
        perUnit: 3,
        unitLabel: "contrato",
      });
    }
  }

  // LOC: Boleto costs
  if (addons.pay && metrics.chargesBoletoToTenant && (product === "loc" || product === "both")) {
    const included = getIncludedBoletosSplits(locPlan);
    const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
    if (additional > 0) {
      const cost = calcBoletoSplitTierCost(locPlan, additional);
      addToGroup(bd, "locAddons", "LOCAÇÃO", {
        label: "Custo Boletos (Pay)",
        included,
        additional,
        total: cost,
        perUnit: 4,
        unitLabel: "boleto",
      });
    }
  }

  // LOC: Split costs
  if (addons.pay && metrics.chargesSplitToOwner && (product === "loc" || product === "both")) {
    const included = getIncludedBoletosSplits(locPlan);
    const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
    if (additional > 0) {
      const cost = calcBoletoSplitTierCost(locPlan, additional);
      addToGroup(bd, "locAddons", "LOCAÇÃO", {
        label: "Custo Split (Pay)",
        included,
        additional,
        total: cost,
        perUnit: 4,
        unitLabel: "split",
      });
    }
  }

  // Shared: Digital Signatures
  if (addons.assinatura) {
    const included = 15;
    let totalSigs = 0;
    if (product === "imob" || product === "both")
      totalSigs += toNum(metrics.closingsPerMonth);
    if (product === "loc" || product === "both")
      totalSigs += toNum(metrics.newContractsPerMonth);
    const additional = Math.max(0, totalSigs - included);
    if (additional > 0) {
      const cost = calcSignaturesTierCost(additional);
      addToGroup(bd, "sharedAddons", "Add-ons Compartilhados (IMOB + LOC)", {
        label: "Assinaturas Digitais (compartilhado)",
        included,
        additional,
        total: cost,
        perUnit: 1.8,
        unitLabel: "assinatura",
      });
    }
  }

  // Shared: WhatsApp Messages
  if (addons.leads && metrics.wantsWhatsApp) {
    const included = 100;
    const additional = Math.max(0, toNum(metrics.leadsPerMonth) - included);
    if (additional > 0) {
      const cost = calcWhatsAppTierCost(additional);
      addToGroup(bd, "sharedAddons", "Add-ons Compartilhados (IMOB + LOC)", {
        label: "Mensagens WhatsApp",
        included,
        additional,
        total: cost,
        perUnit: 2,
        unitLabel: "msg",
      });
    }
  }

  return JSON.stringify(bd);
}
