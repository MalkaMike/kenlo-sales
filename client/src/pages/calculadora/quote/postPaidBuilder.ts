/**
 * postPaidBuilder.ts
 * Pure utility functions for calculating post-paid costs and building
 * the post-paid breakdown section for PDF generation.
 *
 * All pricing data comes from the centralized pricing config via @/utils/pricing.
 */

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
import * as Pricing from "@/utils/pricing";

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
// All delegate to the centralized calculateTieredPrice via Pricing.*

export function calcContractsTierCost(locPlan: PlanTier, additional: number): number {
  if (additional <= 0) return 0;
  return Pricing.calculateAdditionalContractsCost(locPlan, additional);
}

export function calcBoletoSplitTierCost(locPlan: PlanTier, additional: number): number {
  if (additional <= 0) return 0;
  return Pricing.calculateBoletosCost(locPlan, additional);
}

export function calcSignaturesTierCost(additional: number): number {
  if (additional <= 0) return 0;
  return Pricing.calculateAdditionalSignaturesCost(additional);
}

export function calcWhatsAppTierCost(additional: number): number {
  if (additional <= 0) return 0;
  return Pricing.calculateAdditionalWhatsAppLeadsCost(additional);
}

// ─── Included Quantities ───────────────────────────────────────────────────

export function getIncludedUsers(plan: PlanTier): number {
  return Pricing.getIncludedQuantity("imob", plan);
}

export function getIncludedContracts(plan: PlanTier): number {
  return Pricing.getIncludedQuantity("loc", plan);
}

export function getIncludedBoletosSplits(_plan: PlanTier): number {
  // Pay boletos/splits are fully post-paid (no included quantity)
  return 0;
}

// ─── Post-Paid Total Calculation (delegates to postPaidCalc) ──────────────

import { calculatePostPaidBreakdown } from "../receita-extra/postPaidCalc";

/**
 * Returns the total post-paid cost. Delegates to the canonical
 * calculatePostPaidBreakdown in postPaidCalc.ts to avoid duplicated logic.
 */
export function calculatePostPaidTotal(input: PostPaidInput): number {
  return calculatePostPaidBreakdown(input).total;
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

  // Get tier arrays for display (first tier price as representative)
  const userTiers = Pricing.getAdditionalUsersTiers(imobPlan);
  const contractTiers = Pricing.getAdditionalContractsTiers(locPlan);
  const boletoTiers = Pricing.getBoletosTiers(locPlan);
  const sigTiers = Pricing.getAdditionalSignaturesTiers();
  const waTiers = Pricing.getAdditionalWhatsAppLeadsTiers();

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
        perUnit: userTiers[0]?.price ?? 0,
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
        perUnit: contractTiers[0]?.price ?? 0,
        unitLabel: "contrato",
      });
    }
  }

  // LOC: Boleto costs
  if (addons.pay && metrics.chargesBoletoToTenant && (product === "loc" || product === "both")) {
    const totalBoletos = toNum(metrics.contractsUnderManagement);
    if (totalBoletos > 0) {
      const cost = calcBoletoSplitTierCost(locPlan, totalBoletos);
      addToGroup(bd, "locAddons", "LOCAÇÃO", {
        label: "Custo Boletos (Pay)",
        included: 0,
        additional: totalBoletos,
        total: cost,
        perUnit: boletoTiers[0]?.price ?? 0,
        unitLabel: "boleto",
      });
    }
  }

  // LOC: Split costs
  if (addons.pay && metrics.chargesSplitToOwner && (product === "loc" || product === "both")) {
    const totalSplits = toNum(metrics.contractsUnderManagement);
    if (totalSplits > 0) {
      const cost = calcBoletoSplitTierCost(locPlan, totalSplits);
      addToGroup(bd, "locAddons", "LOCAÇÃO", {
        label: "Custo Split (Pay)",
        included: 0,
        additional: totalSplits,
        total: cost,
        perUnit: boletoTiers[0]?.price ?? 0,
        unitLabel: "split",
      });
    }
  }

  // Shared: Digital Signatures
  if (addons.assinatura) {
    const included = Pricing.getIncludedSignatures();
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
        perUnit: sigTiers[0]?.price ?? 0,
        unitLabel: "assinatura",
      });
    }
  }

  // Shared: WhatsApp Messages
  if (addons.leads && metrics.wantsWhatsApp) {
    const included = Pricing.getIncludedWhatsAppLeads();
    const additional = Math.max(0, toNum(metrics.leadsPerMonth) - included);
    if (additional > 0) {
      const cost = calcWhatsAppTierCost(additional);
      addToGroup(bd, "sharedAddons", "Add-ons Compartilhados (IMOB + LOC)", {
        label: "Mensagens WhatsApp",
        included,
        additional,
        total: cost,
        perUnit: waTiers[0]?.price ?? 0,
        unitLabel: "msg",
      });
    }
  }

  return JSON.stringify(bd);
}
