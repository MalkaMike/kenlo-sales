/**
 * exampleConfigGenerator.ts
 * Pure utility functions for generating random example proposal data.
 * Reuses tier calculation helpers from postPaidBuilder to avoid duplication.
 */

import {
  type ProductSelection,
  type PlanTier,
  type PaymentFrequency,
  PLAN_ANNUAL_PRICES,
  ADDON_ANNUAL_PRICES,
  PAYMENT_FREQUENCY_MULTIPLIERS,
  roundToEndIn7,
  calculateAdditionalUsersCost,
} from "../types";
import * as Pricing from "@/utils/pricing";

import {
  calcContractsTierCost,
  calcBoletoSplitTierCost,
  calcSignaturesTierCost,
  calcWhatsAppTierCost,
  getIncludedUsers,
  getIncludedContracts,
  getIncludedBoletosSplits,
} from "../quote/postPaidBuilder";

// ─── Random Helpers ──────────────────────────────────────────────────────────

export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const randBool = () => Math.random() > 0.5;

// ─── Static Data ─────────────────────────────────────────────────────────────

const COMPANY_NAMES = [
  "Imobiliária Sol Nascente", "Rede Imóveis Premium", "Casa & Lar Imóveis",
  "Horizonte Imobiliária", "Ponto Certo Imóveis", "Alpha Gestão Imobiliária",
  "Morada Real Imóveis", "Viva Imóveis", "Central Imobiliária", "Top House Imóveis",
];

const OWNER_NAMES = [
  "Carlos Mendes", "Ana Beatriz Costa", "Roberto Almeida",
  "Fernanda Oliveira", "Marcos Pereira", "Juliana Santos",
  "Pedro Henrique Lima", "Camila Rodrigues", "Lucas Ferreira",
];

const FREQUENCIES: PaymentFrequency[] = ["monthly", "semestral", "annual", "biennial"];
const BUSINESS_TYPES = ["broker", "rental_admin", "both"] as const;

export const KOMBO_CONFIGS = [
  { product: "imob" as ProductSelection, addons: ["leads", "assinatura"], komboId: "imob_start", komboName: "Kombo Imob Start", discount: 10 },
  { product: "imob" as ProductSelection, addons: ["leads", "inteligencia", "assinatura"], komboId: "imob_pro", komboName: "Kombo Imob Pro", discount: 15 },
  { product: "loc" as ProductSelection, addons: ["inteligencia", "assinatura"], komboId: "locacao_pro", komboName: "Kombo Locação Pro", discount: 10 },
  { product: "both" as ProductSelection, addons: [] as string[], komboId: "core_gestao", komboName: "Kombo Core Gestão", discount: 0 },
  { product: "both" as ProductSelection, addons: ["leads", "inteligencia", "assinatura", "pay", "seguros"], komboId: "elite", komboName: "Kombo Elite", discount: 20 },
  { product: "imob" as ProductSelection, addons: ["leads"], komboId: null as string | null, komboName: undefined as string | undefined, discount: 0 },
  { product: "loc" as ProductSelection, addons: ["pay", "seguros"], komboId: null as string | null, komboName: undefined as string | undefined, discount: 0 },
  { product: "both" as ProductSelection, addons: ["leads", "assinatura", "pay"], komboId: null as string | null, komboName: undefined as string | undefined, discount: 0 },
];

export type KomboConfig = typeof KOMBO_CONFIGS[0];

// ─── Plan Recommendation Helpers ─────────────────────────────────────────────

export function planForImobUsers(users: number): PlanTier {
  const k2Threshold = Pricing.getIncludedQuantity("imob", "k2") + 1;
  const kThreshold = Pricing.getIncludedQuantity("imob", "k");
  if (users >= k2Threshold) return "k2";
  if (users >= kThreshold) return "k";
  return "prime";
}

export function planForLocContracts(contracts: number): PlanTier {
  const k2Threshold = Pricing.getIncludedQuantity("loc", "k2");     // 400
  const kThreshold = Pricing.getIncludedQuantity("loc", "k") + 1;   // 175 + 1 = 176
  if (contracts >= k2Threshold) return "k2";
  if (contracts >= kThreshold) return "k";
  return "prime";
}

// ─── Post-Paid Breakdown Builder (for examples) ─────────────────────────────

interface PostPaidBreakdownGroup {
  groupLabel: string;
  groupTotal: number;
  items: Array<{
    label: string;
    included: number;
    additional: number;
    total: number;
    perUnit: number;
    unitLabel: string;
  }>;
}

interface PostPaidBreakdown {
  total: number;
  imobAddons?: PostPaidBreakdownGroup;
  locAddons?: PostPaidBreakdownGroup;
  sharedAddons?: PostPaidBreakdownGroup;
}

function addToGroup(
  bd: PostPaidBreakdown,
  groupKey: "imobAddons" | "locAddons" | "sharedAddons",
  groupLabel: string,
  item: PostPaidBreakdownGroup["items"][0],
): void {
  if (!bd[groupKey]) {
    bd[groupKey] = { groupLabel, groupTotal: 0, items: [] };
  }
  bd[groupKey]!.items.push(item);
  bd[groupKey]!.groupTotal += item.total;
}

export function buildExamplePostPaid(
  config: KomboConfig,
  iplan: PlanTier,
  lplan: PlanTier,
  imobUsers: number,
  contracts: number,
  closings: number,
  newContracts: number,
  leadsMonth: number,
  wantsWA: boolean,
  chargesBoleto: boolean,
  chargesSplit: boolean,
): PostPaidBreakdown {
  const bd: PostPaidBreakdown = { total: 0 };

  // IMOB: Additional Users
  if (config.product === "imob" || config.product === "both") {
    const included = getIncludedUsers(iplan);
    const additional = Math.max(0, imobUsers - included);
    if (additional > 0) {
      const userCost = calculateAdditionalUsersCost(iplan, additional);
      bd.total += userCost;
      addToGroup(bd, "imobAddons", "IMOB", {
        label: "Usuários Adicionais", included, additional, total: userCost,
        perUnit: Pricing.getAdditionalUserBasePrice(iplan), unitLabel: "usuário",
      });
    }
  }

  // LOC: Additional Contracts
  if (config.product === "loc" || config.product === "both") {
    const included = getIncludedContracts(lplan);
    const additional = Math.max(0, contracts - included);
    if (additional > 0) {
      const cost = calcContractsTierCost(lplan, additional);
      bd.total += cost;
      addToGroup(bd, "locAddons", "LOCAÇÃO", {
        label: "Contratos Adicionais", included, additional, total: cost,
        perUnit: Pricing.getAdditionalContractBasePrice(), unitLabel: "contrato",
      });
    }

    // Boleto costs
    if (chargesBoleto && config.addons.includes("pay")) {
      const inclBoletos = getIncludedBoletosSplits(lplan);
      const addBoletos = Math.max(0, contracts - inclBoletos);
      if (addBoletos > 0) {
        const cost = calcBoletoSplitTierCost(lplan, addBoletos);
        bd.total += cost;
        addToGroup(bd, "locAddons", "LOCAÇÃO", {
          label: "Custo Boletos (Pay)", included: inclBoletos, additional: addBoletos,
          total: cost, perUnit: Pricing.getBoletoBasePrice(), unitLabel: "boleto",
        });
      }
    }

    // Split costs
    if (chargesSplit && config.addons.includes("pay")) {
      const inclSplits = getIncludedBoletosSplits(lplan);
      const addSplits = Math.max(0, contracts - inclSplits);
      if (addSplits > 0) {
        const cost = calcBoletoSplitTierCost(lplan, addSplits);
        bd.total += cost;
        addToGroup(bd, "locAddons", "LOCAÇÃO", {
          label: "Custo Split (Pay)", included: inclSplits, additional: addSplits,
          total: cost, perUnit: Pricing.getBoletoBasePrice(), unitLabel: "split",
        });
      }
    }
  }

  // Shared: Digital Signatures
  if (config.addons.includes("assinatura")) {
    const included = Pricing.getIncludedSignatures();
    let totalSigs = 0;
    if (config.product === "imob" || config.product === "both") totalSigs += closings;
    if (config.product === "loc" || config.product === "both") totalSigs += newContracts;
    const additional = Math.max(0, totalSigs - included);
    if (additional > 0) {
      const cost = calcSignaturesTierCost(additional);
      bd.total += cost;
      addToGroup(bd, "sharedAddons", "Add-ons Compartilhados (IMOB + LOC)", {
        label: "Assinaturas Digitais (compartilhado)", included, additional,
        total: cost, perUnit: Pricing.getSignatureBasePrice(), unitLabel: "assinatura",
      });
    }
  }

  // WhatsApp Messages
  if (config.addons.includes("leads") && wantsWA) {
    const included = Pricing.getIncludedWhatsAppLeads();
    const additional = Math.max(0, leadsMonth - included);
    if (additional > 0) {
      const cost = calcWhatsAppTierCost(additional);
      bd.total += cost;
      addToGroup(bd, "sharedAddons", "Add-ons Compartilhados (IMOB + LOC)", {
        label: "Mensagens WhatsApp", included, additional,
        total: cost, perUnit: Pricing.getWhatsAppBasePrice(), unitLabel: "msg",
      });
    }
  }

  return bd;
}

// ─── Single Example Proposal Builder ─────────────────────────────────────────

export interface ExampleProposalResult {
  proposalData: Record<string, any>;
  company: string;
  komboId: string | null;
}

export function buildExampleProposalData(): ExampleProposalResult {
  const config = pick(KOMBO_CONFIGS);
  const freq = pick(FREQUENCIES);
  const company = pick(COMPANY_NAMES);
  const owner = pick(OWNER_NAMES);
  const bizType = pick([...BUSINESS_TYPES]);

  const imobUsers = randInt(2, 30);
  const closings = randInt(2, 20);
  const leadsMonth = randInt(50, 500);
  const contracts = randInt(50, 800);
  const newContracts = randInt(2, 25);

  const iplan = planForImobUsers(imobUsers);
  const lplan = planForLocContracts(contracts);
  const wantsWA = config.addons.includes("leads") ? randBool() : false;
  const chargesBoleto = config.addons.includes("pay") ? randBool() : false;
  const chargesSplit = config.addons.includes("pay") ? randBool() : false;
  const boletoAmt = chargesBoleto ? pick([5, 7.5, 8.5, 10, 12]) : 0;
  const splitAmt = chargesSplit ? pick([5, 8, 10, 12, 15]) : 0;

  const freqMult = PAYMENT_FREQUENCY_MULTIPLIERS[freq];
  const discountMult = config.komboId ? (1 - config.discount / 100) : 1;

  // Calculate monthly totals
  let totalMonthly = 0;
  if (config.product === "imob" || config.product === "both") {
    totalMonthly += roundToEndIn7(PLAN_ANNUAL_PRICES[iplan] * freqMult * discountMult);
  }
  if (config.product === "loc" || config.product === "both") {
    totalMonthly += roundToEndIn7(PLAN_ANNUAL_PRICES[lplan] * freqMult * discountMult);
  }
  for (const addon of config.addons) {
    const addonPrice = ADDON_ANNUAL_PRICES[addon as keyof typeof ADDON_ANNUAL_PRICES] || 0;
    if (addonPrice > 0) {
      totalMonthly += roundToEndIn7(addonPrice * freqMult * discountMult);
    }
  }

  const totalAnnual = totalMonthly * 12;
  const implantationFee = config.komboId ? Pricing.getImplementationCost("imob") : (
    (config.product === "imob" || config.product === "both" ? Pricing.getImplementationCost("imob") : 0) +
    (config.product === "loc" || config.product === "both" ? Pricing.getImplementationCost("loc") : 0)
  );
  const firstYearTotal = totalAnnual + implantationFee;

  // Calculate individual prices
  let imobPrice = 0;
  let locPrice = 0;
  const addonPricesObj: Record<string, number> = {};

  if (config.product === "imob" || config.product === "both") {
    imobPrice = roundToEndIn7(PLAN_ANNUAL_PRICES[iplan] * freqMult * discountMult);
  }
  if (config.product === "loc" || config.product === "both") {
    locPrice = roundToEndIn7(PLAN_ANNUAL_PRICES[lplan] * freqMult * discountMult);
  }
  for (const addon of config.addons) {
    const ap = ADDON_ANNUAL_PRICES[addon as keyof typeof ADDON_ANNUAL_PRICES] || 0;
    if (ap > 0) {
      addonPricesObj[addon] = roundToEndIn7(ap * freqMult * discountMult);
    }
  }

  // Post-paid breakdown (reusing shared tier helpers)
  const ppBreakdown = buildExamplePostPaid(
    config, iplan, lplan, imobUsers, contracts,
    closings, newContracts, leadsMonth, wantsWA,
    chargesBoleto, chargesSplit,
  );
  const postPaidTotal = ppBreakdown.total;

  // Revenue calculations
  const revenueFromBoletos = (chargesBoleto || chargesSplit) && (config.product === "loc" || config.product === "both")
    ? contracts * (boletoAmt + splitAmt) : 0;
  const revenueFromInsurance = config.addons.includes("seguros") && (config.product === "loc" || config.product === "both")
    ? contracts * Pricing.getSegurosEstimatedRevenuePerContract() : 0;
  const netGain = revenueFromBoletos + revenueFromInsurance - totalMonthly - postPaidTotal;

  const installments = pick([1, 2, 3]);

  return {
    proposalData: {
      vendorName: "Vendedor Exemplo",
      vendorEmail: "vendedor@kenlo.com.br",
      vendorPhone: "(11) 99999-0000",
      vendorRole: "Executivo(a) de Vendas",
      clientName: owner,
      agencyName: company,
      productType: config.product,
      komboName: config.komboName,
      komboDiscount: config.discount > 0 ? config.discount : undefined,
      imobPlan: (config.product === "imob" || config.product === "both") ? iplan : undefined,
      locPlan: (config.product === "loc" || config.product === "both") ? lplan : undefined,
      imobUsers,
      closings,
      contracts,
      newContracts,
      leadsPerMonth: leadsMonth,
      usesExternalAI: false,
      wantsWhatsApp: wantsWA,
      chargesSplitToOwner: chargesSplit,
      chargesBoletoToTenant: chargesBoleto,
      boletoAmount: boletoAmt,
      splitAmount: splitAmt,
      monthlyLicenseBase: totalMonthly,
      selectedAddons: JSON.stringify(config.addons),
      paymentPlan: freq,
      totalMonthly,
      totalAnnual,
      implantationFee,
      firstYearTotal,
      postPaidTotal,
      revenueFromBoletos,
      revenueFromInsurance,
      netGain,
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
      prepaymentUsersAmount: 0,
      prepaymentContractsAmount: 0,
      prepaymentMonths: 0,
      hasPremiumServices: !!config.komboId,
      premiumServicesPrice: 0,
      installments,
      businessType: bizType,
      imobPrice: imobPrice > 0 ? imobPrice : undefined,
      locPrice: locPrice > 0 ? locPrice : undefined,
      addonPrices: Object.keys(addonPricesObj).length > 0 ? JSON.stringify(addonPricesObj) : undefined,
      vipIncluded: !!config.komboId,
      csIncluded: !!config.komboId,
      vipPrice: 0,
      csPrice: 0,
      postPaidBreakdown: JSON.stringify(ppBreakdown),
    },
    company,
    komboId: config.komboId,
  };
}
