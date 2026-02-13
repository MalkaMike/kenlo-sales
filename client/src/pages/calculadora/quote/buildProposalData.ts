/**
 * buildProposalData.ts
 * Pure utility function that assembles the proposal data object for PDF generation.
 * Extracted from QuoteInfoHandler.tsx to separate data assembly from dialog UI.
 *
 * This function is pure: it takes all required state as input and returns
 * the fully assembled proposal data object. No side effects, no React hooks.
 */

import type { QuoteInfo } from "@/components/QuoteInfoDialog";
import * as Pricing from "@/utils/pricing";
import {
  KOMBOS,
  PAYMENT_FREQUENCY_MULTIPLIERS,
  toNum,
  roundToEndIn7,
  calculateAdditionalUsersCost,
} from "../types";
import type {
  ProductSelection,
  PlanTier,
  PaymentFrequency,
  AddonsState,
  MetricsState,
  BusinessNatureState,
  LineItem,
  KomboType,
} from "../types";

// ─── Input Types ────────────────────────────────────────────────────────────

export interface ProposalDataInput {
  quoteInfo: QuoteInfo;
  product: ProductSelection;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  addons: AddonsState;
  metrics: MetricsState;
  frequency: PaymentFrequency;
  activeKombo: KomboType;
  komboInfo: (typeof KOMBOS)[keyof typeof KOMBOS] | null;
  businessNature: BusinessNatureState;
  prepayAdditionalUsers: boolean;
  prepayAdditionalContracts: boolean;
  selectedColumnsData: any[];
  getLineItems: () => LineItem[];
  calculateTotalImplementation: (withKombo: boolean) => number;
  calculatePrepaymentAmount: () => { users: number; contracts: number };
}

// ─── Post-Paid Calculation ──────────────────────────────────────────────────

function calculatePostPaidTotal(input: ProposalDataInput): number {
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
    const included = imobPlan === "prime" ? 2 : imobPlan === "k" ? 5 : 10;
    const additional = Math.max(0, toNum(metrics.imobUsers) - included);
    if (additional > 0) {
      total += calculateAdditionalUsersCost(imobPlan, additional);
    }
  }

  // Additional Contracts (Loc)
  if ((product === "loc" || product === "both") && !prepayAdditionalContracts) {
    const included = locPlan === "prime" ? 100 : locPlan === "k" ? 150 : 500;
    const additional = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - included
    );
    if (additional > 0) {
      const tier1 = Math.min(additional, 250);
      const tier2 = Math.min(Math.max(0, additional - 250), 500);
      const tier3 = Math.max(0, additional - 750);
      total += tier1 * 3 + tier2 * 2.5 + tier3 * 2;
    }
  }

  // WhatsApp Messages
  if (addons.leads && metrics.wantsWhatsApp) {
    const additional = Math.max(0, toNum(metrics.leadsPerMonth) - 100);
    if (additional > 0) {
      const t1 = Math.min(additional, 200);
      const t2 = Math.min(Math.max(0, additional - 200), 150);
      const t3 = Math.min(Math.max(0, additional - 350), 650);
      const t4 = Math.max(0, additional - 1000);
      total += t1 * 2.0 + t2 * 1.8 + t3 * 1.5 + t4 * 1.2;
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
      const t1 = Math.min(additional, 20);
      const t2 = Math.min(Math.max(0, additional - 20), 20);
      const t3 = Math.max(0, additional - 40);
      total += t1 * 1.8 + t2 * 1.7 + t3 * 1.5;
    }
  }

  // Boleto costs
  if (
    addons.pay &&
    metrics.chargesBoletoToTenant &&
    (product === "loc" || product === "both")
  ) {
    const includedBoletos =
      locPlan === "prime" ? 2 : locPlan === "k" ? 5 : 15;
    const additionalBoletos = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - includedBoletos
    );
    if (additionalBoletos > 0) {
      if (locPlan === "prime") total += additionalBoletos * 4;
      else if (locPlan === "k") {
        const t1 = Math.min(additionalBoletos, 250);
        const t2 = Math.max(0, additionalBoletos - 250);
        total += t1 * 4 + t2 * 3.5;
      } else {
        const t1 = Math.min(additionalBoletos, 250);
        const t2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
        const t3 = Math.max(0, additionalBoletos - 500);
        total += t1 * 4 + t2 * 3.5 + t3 * 3;
      }
    }
  }

  // Split costs
  if (
    addons.pay &&
    metrics.chargesSplitToOwner &&
    (product === "loc" || product === "both")
  ) {
    const includedSplits =
      locPlan === "prime" ? 2 : locPlan === "k" ? 5 : 15;
    const additionalSplits = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - includedSplits
    );
    if (additionalSplits > 0) {
      if (locPlan === "prime") total += additionalSplits * 4;
      else if (locPlan === "k") {
        const t1 = Math.min(additionalSplits, 250);
        const t2 = Math.max(0, additionalSplits - 250);
        total += t1 * 4 + t2 * 3.5;
      } else {
        const t1 = Math.min(additionalSplits, 250);
        const t2 = Math.min(Math.max(0, additionalSplits - 250), 250);
        const t3 = Math.max(0, additionalSplits - 500);
        total += t1 * 4 + t2 * 3.5 + t3 * 3;
      }
    }
  }

  return total;
}

// ─── Addon Compatibility ────────────────────────────────────────────────────

function classifyAddons(
  selectedAddons: string[],
  product: ProductSelection
): { compatible: string[]; incompatible: string[] } {
  const imobCompatible = ["leads", "inteligencia", "assinatura"];
  const locCompatible = ["pay", "seguros", "inteligencia", "assinatura"];
  const compatible: string[] = [];
  const incompatible: string[] = [];

  selectedAddons.forEach((addon) => {
    let isCompatible = false;
    if (product === "imob") isCompatible = imobCompatible.includes(addon);
    else if (product === "loc") isCompatible = locCompatible.includes(addon);
    else if (product === "both") isCompatible = true;

    if (isCompatible) compatible.push(addon);
    else incompatible.push(addon);
  });

  return { compatible, incompatible };
}

// ─── Premium Services ───────────────────────────────────────────────────────

function calculatePremiumServices(
  komboInfo: ProposalDataInput["komboInfo"],
  metrics: MetricsState
): { hasPremiumIncluded: boolean; premiumServicesPrice: number } {
  const hasPremiumIncluded =
    komboInfo?.name === "Kombo Imob Start" ||
    komboInfo?.name === "Kombo Core Gestão" ||
    komboInfo?.name === "Kombo Elite" ||
    komboInfo?.name === "Kombo Imob Pro" ||
    komboInfo?.name === "Kombo Locação Pro";

  const premiumServicesPrice = hasPremiumIncluded
    ? 0
    : ((metrics.imobVipSupport || metrics.locVipSupport)
        ? Pricing.getVipSupportPrice()
        : 0) +
      ((metrics.imobDedicatedCS || metrics.locDedicatedCS)
        ? Pricing.getCSDedicadoPrice()
        : 0);

  return { hasPremiumIncluded, premiumServicesPrice };
}

// ─── Revenue Calculation ────────────────────────────────────────────────────

function calculateRevenue(input: ProposalDataInput): {
  revenueFromBoletos: number;
  revenueFromInsurance: number;
} {
  const { product, addons, metrics } = input;
  let revenueFromBoletos = 0;

  if (addons.pay && (product === "loc" || product === "both")) {
    if (metrics.chargesBoletoToTenant) {
      revenueFromBoletos +=
        toNum(metrics.contractsUnderManagement) *
        toNum(metrics.boletoChargeAmount);
    }
    if (metrics.chargesSplitToOwner) {
      revenueFromBoletos +=
        toNum(metrics.contractsUnderManagement) *
        toNum(metrics.splitChargeAmount);
    }
  }

  const revenueFromInsurance =
    addons.seguros && (product === "loc" || product === "both")
      ? toNum(metrics.contractsUnderManagement) * 10
      : 0;

  return { revenueFromBoletos, revenueFromInsurance };
}

// ─── Line Item Prices ───────────────────────────────────────────────────────

function getProductPrice(
  lineItems: LineItem[],
  prefix: string,
  activeKombo: KomboType
): number | undefined {
  const item = lineItems.find((it) => it.name.startsWith(prefix));
  if (!item) return undefined;
  return activeKombo !== "none" ? item.priceComKombo : item.priceSemKombo;
}

function getAddonPrices(
  lineItems: LineItem[],
  activeKombo: KomboType
): string | undefined {
  const addonKeys = ["Leads", "Inteligência", "Assinatura"];
  const keyMap: Record<string, string> = {
    Leads: "leads",
    Inteligência: "inteligencia",
    Assinatura: "assinatura",
  };
  const prices: Record<string, number> = {};

  for (const item of lineItems) {
    if (addonKeys.includes(item.name)) {
      const price =
        activeKombo !== "none" ? item.priceComKombo : item.priceSemKombo;
      if (price > 0) prices[keyMap[item.name]] = price;
    }
  }

  return Object.keys(prices).length > 0 ? JSON.stringify(prices) : undefined;
}

// ─── Post-Paid Breakdown (for PDF Section) ──────────────────────────────────

function buildPostPaidBreakdown(input: ProposalDataInput, postPaidTotal: number): string {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
  } = input;

  const bd: any = { total: postPaidTotal };

  // IMOB: Additional Users
  if ((product === "imob" || product === "both") && !prepayAdditionalUsers) {
    const included = imobPlan === "prime" ? 2 : imobPlan === "k" ? 5 : 10;
    const additional = Math.max(0, toNum(metrics.imobUsers) - included);
    if (additional > 0) {
      const userCost = calculateAdditionalUsersCost(imobPlan, additional);
      if (!bd.imobAddons)
        bd.imobAddons = { groupLabel: "IMOB", groupTotal: 0, items: [] };
      bd.imobAddons.items.push({
        label: "Usuários Adicionais",
        included,
        additional,
        total: userCost,
        perUnit: imobPlan === "prime" ? 57 : imobPlan === "k" ? 47 : 37,
        unitLabel: "usuário",
      });
      bd.imobAddons.groupTotal += userCost;
    }
  }

  // LOC: Additional Contracts
  if ((product === "loc" || product === "both") && !prepayAdditionalContracts) {
    const included = locPlan === "prime" ? 100 : locPlan === "k" ? 150 : 500;
    const additional = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - included
    );
    if (additional > 0) {
      let cost = 0;
      if (locPlan === "prime") {
        cost = additional * 3;
      } else if (locPlan === "k") {
        const t1 = Math.min(additional, 250);
        const t2 = Math.max(0, additional - 250);
        cost = t1 * 3 + t2 * 2.5;
      } else {
        const t1 = Math.min(additional, 250);
        const t2 = Math.min(Math.max(0, additional - 250), 250);
        const t3 = Math.max(0, additional - 500);
        cost = t1 * 3 + t2 * 2.5 + t3 * 2;
      }
      if (!bd.locAddons)
        bd.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
      bd.locAddons.items.push({
        label: "Contratos Adicionais",
        included,
        additional,
        total: cost,
        perUnit: 3,
        unitLabel: "contrato",
      });
      bd.locAddons.groupTotal += cost;
    }
  }

  // LOC: Boleto costs
  if (
    addons.pay &&
    metrics.chargesBoletoToTenant &&
    (product === "loc" || product === "both")
  ) {
    const inclBoletos = locPlan === "prime" ? 2 : locPlan === "k" ? 5 : 15;
    const addBoletos = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - inclBoletos
    );
    if (addBoletos > 0) {
      let cost = 0;
      if (locPlan === "prime") cost = addBoletos * 4;
      else if (locPlan === "k") {
        const t1 = Math.min(addBoletos, 250);
        const t2 = Math.max(0, addBoletos - 250);
        cost = t1 * 4 + t2 * 3.5;
      } else {
        const t1 = Math.min(addBoletos, 250);
        const t2 = Math.min(Math.max(0, addBoletos - 250), 250);
        const t3 = Math.max(0, addBoletos - 500);
        cost = t1 * 4 + t2 * 3.5 + t3 * 3;
      }
      if (!bd.locAddons)
        bd.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
      bd.locAddons.items.push({
        label: "Custo Boletos (Pay)",
        included: inclBoletos,
        additional: addBoletos,
        total: cost,
        perUnit: 4,
        unitLabel: "boleto",
      });
      bd.locAddons.groupTotal += cost;
    }
  }

  // LOC: Split costs
  if (
    addons.pay &&
    metrics.chargesSplitToOwner &&
    (product === "loc" || product === "both")
  ) {
    const inclSplits = locPlan === "prime" ? 2 : locPlan === "k" ? 5 : 15;
    const addSplits = Math.max(
      0,
      toNum(metrics.contractsUnderManagement) - inclSplits
    );
    if (addSplits > 0) {
      let cost = 0;
      if (locPlan === "prime") cost = addSplits * 4;
      else if (locPlan === "k") {
        const t1 = Math.min(addSplits, 250);
        const t2 = Math.max(0, addSplits - 250);
        cost = t1 * 4 + t2 * 3.5;
      } else {
        const t1 = Math.min(addSplits, 250);
        const t2 = Math.min(Math.max(0, addSplits - 250), 250);
        const t3 = Math.max(0, addSplits - 500);
        cost = t1 * 4 + t2 * 3.5 + t3 * 3;
      }
      if (!bd.locAddons)
        bd.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
      bd.locAddons.items.push({
        label: "Custo Split (Pay)",
        included: inclSplits,
        additional: addSplits,
        total: cost,
        perUnit: 4,
        unitLabel: "split",
      });
      bd.locAddons.groupTotal += cost;
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
      const t1 = Math.min(additional, 20);
      const t2 = Math.min(Math.max(0, additional - 20), 20);
      const t3 = Math.max(0, additional - 40);
      const cost = t1 * 1.8 + t2 * 1.7 + t3 * 1.5;
      if (!bd.sharedAddons)
        bd.sharedAddons = {
          groupLabel: "Add-ons Compartilhados (IMOB + LOC)",
          groupTotal: 0,
          items: [],
        };
      bd.sharedAddons.items.push({
        label: "Assinaturas Digitais (compartilhado)",
        included,
        additional,
        total: cost,
        perUnit: 1.8,
        unitLabel: "assinatura",
      });
      bd.sharedAddons.groupTotal += cost;
    }
  }

  // Shared: WhatsApp Messages
  if (addons.leads && metrics.wantsWhatsApp) {
    const included = 100;
    const additional = Math.max(0, toNum(metrics.leadsPerMonth) - included);
    if (additional > 0) {
      const t1 = Math.min(additional, 200);
      const t2 = Math.min(Math.max(0, additional - 200), 150);
      const t3 = Math.min(Math.max(0, additional - 350), 650);
      const t4 = Math.max(0, additional - 1000);
      const cost = t1 * 2 + t2 * 1.8 + t3 * 1.5 + t4 * 1.2;
      if (!bd.sharedAddons)
        bd.sharedAddons = {
          groupLabel: "Add-ons Compartilhados (IMOB + LOC)",
          groupTotal: 0,
          items: [],
        };
      bd.sharedAddons.items.push({
        label: "Mensagens WhatsApp",
        included,
        additional,
        total: cost,
        perUnit: 2,
        unitLabel: "msg",
      });
      bd.sharedAddons.groupTotal += cost;
    }
  }

  return JSON.stringify(bd);
}

// ─── Kombo Comparison (for PDF Section 6) ───────────────────────────────────

function buildKomboComparison(
  lineItems: LineItem[],
  activeKombo: KomboType,
  product: ProductSelection
): string {
  const baseTotalNoKombo = lineItems.reduce(
    (sum, item) => sum + item.priceSemKombo,
    0
  );

  const comparison: Array<{
    name: string;
    discount: number;
    totalMonthly: number;
    savings: number;
    isSelected: boolean;
    isAvailable: boolean;
  }> = [];

  // "Sem Kombo" entry
  comparison.push({
    name: "Sem Kombo",
    discount: 0,
    totalMonthly: baseTotalNoKombo,
    savings: 0,
    isSelected: activeKombo === "none",
    isAvailable: true,
  });

  // Each Kombo
  Object.entries(KOMBOS).forEach(([key, kombo]) => {
    const isAvailable = kombo.requiredProducts.includes(product);
    const discountFactor = 1 - kombo.discount;
    const komboTotal = Math.round(baseTotalNoKombo * discountFactor);
    comparison.push({
      name: kombo.name,
      discount: Math.round(kombo.discount * 100),
      totalMonthly: komboTotal,
      savings: baseTotalNoKombo - komboTotal,
      isSelected: activeKombo === key,
      isAvailable,
    });
  });

  return JSON.stringify(comparison);
}

// ─── Frequency Comparison (for PDF Section 5) ──────────────────────────────

function buildFrequencyComparison(
  lineItems: LineItem[],
  komboInfo: ProposalDataInput["komboInfo"],
  frequency: PaymentFrequency
): string {
  const baseTotalNoKombo = lineItems.reduce(
    (sum, item) => sum + item.priceSemKombo,
    0
  );
  const komboFactor = komboInfo ? 1 - komboInfo.discount : 1;
  const baseAnnual = Math.round(baseTotalNoKombo * komboFactor);

  const freqs = [
    { name: "Mensal", key: "monthly", multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.monthly },
    { name: "Semestral", key: "semestral", multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.semestral },
    { name: "Anual", key: "annual", multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.annual },
    { name: "Bienal", key: "biennial", multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.biennial },
  ];

  return JSON.stringify(
    freqs.map((f) => ({
      name: f.name,
      monthlyEquivalent: roundToEndIn7(Math.round(baseAnnual * f.multiplier)),
      isSelected: frequency === f.key,
    }))
  );
}

// ─── Main Builder ───────────────────────────────────────────────────────────

export function buildProposalData(input: ProposalDataInput): Record<string, any> {
  const {
    quoteInfo,
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    frequency,
    activeKombo,
    komboInfo,
    businessNature,
    selectedColumnsData,
    getLineItems,
    calculateTotalImplementation,
    calculatePrepaymentAmount,
  } = input;

  // Get selected addons (exclude Cash from PDFs per business rule)
  const selectedAddons = Object.entries(addons)
    .filter(([name, enabled]) => enabled && name !== "cash")
    .map(([name]) => name);

  // Calculate totals
  const items = getLineItems();
  const totalMonthly = items.reduce(
    (sum: number, item: LineItem) =>
      sum + (activeKombo !== "none" ? item.priceComKombo : item.priceSemKombo),
    0
  );
  const totalAnnual = totalMonthly * 12;
  const implantationFee = calculateTotalImplementation(activeKombo !== "none");
  const firstYearTotal = totalAnnual + implantationFee;

  // Post-paid
  const postPaidTotal = calculatePostPaidTotal(input);

  // Revenue
  const { revenueFromBoletos, revenueFromInsurance } = calculateRevenue(input);
  const netGain =
    revenueFromBoletos + revenueFromInsurance - totalMonthly - (postPaidTotal || 0);

  // Prepayment
  const prepayment = calculatePrepaymentAmount();
  const prepaymentMonths =
    frequency === "annual" ? 12 : frequency === "biennial" ? 24 : 0;

  // Addon compatibility
  const { compatible: compatibleAddons } = classifyAddons(selectedAddons, product);

  // Premium services
  const { hasPremiumIncluded, premiumServicesPrice } = calculatePremiumServices(
    komboInfo,
    metrics
  );

  // Line item prices
  const lineItems = getLineItems();

  return {
    salesPersonName: quoteInfo.vendorName,
    vendorEmail: quoteInfo.vendorEmail,
    vendorPhone: quoteInfo.vendorPhone,
    vendorRole: quoteInfo.vendorRole,
    clientName: businessNature.ownerName,
    agencyName: businessNature.companyName,
    productType: product,
    komboName: komboInfo?.name,
    komboDiscount: komboInfo ? Math.round(komboInfo.discount * 100) : undefined,
    imobPlan: product === "imob" || product === "both" ? imobPlan : undefined,
    locPlan: product === "loc" || product === "both" ? locPlan : undefined,
    imobUsers: typeof metrics.imobUsers === "number" ? metrics.imobUsers : 0,
    closings:
      typeof metrics.closingsPerMonth === "number"
        ? metrics.closingsPerMonth
        : 0,
    contracts:
      typeof metrics.contractsUnderManagement === "number"
        ? metrics.contractsUnderManagement
        : 0,
    newContracts:
      typeof metrics.newContractsPerMonth === "number"
        ? metrics.newContractsPerMonth
        : 0,
    leadsPerMonth:
      typeof metrics.leadsPerMonth === "number" ? metrics.leadsPerMonth : 0,
    usesExternalAI: metrics.usesExternalAI,
    wantsWhatsApp: metrics.wantsWhatsApp,
    chargesSplitToOwner: metrics.chargesSplitToOwner,
    chargesBoletoToTenant: metrics.chargesBoletoToTenant,
    boletoAmount: toNum(metrics.boletoChargeAmount),
    splitAmount: toNum(metrics.splitChargeAmount),
    businessType: businessNature.businessType,
    email: businessNature.email,
    cellphone: businessNature.cellphone,
    selectedAddons: JSON.stringify(compatibleAddons),
    paymentPlan: frequency,
    totalMonthly,
    totalAnnual,
    implantationFee,
    firstYearTotal,
    postPaidTotal,
    revenueFromBoletos,
    revenueFromInsurance,
    netGain,
    prepayAdditionalUsers: input.prepayAdditionalUsers,
    prepayAdditionalContracts: input.prepayAdditionalContracts,
    prepaymentUsersAmount: prepayment.users,
    prepaymentContractsAmount: prepayment.contracts,
    prepaymentMonths,
    monthlyLicenseBase: totalMonthly,
    hasPremiumServices:
      hasPremiumIncluded ||
      ((metrics.imobVipSupport || metrics.locVipSupport) &&
        (metrics.imobDedicatedCS || metrics.locDedicatedCS)),
    premiumServicesPrice,
    installments: quoteInfo.installments,
    validityDays: quoteInfo.validityDays,
    imobPrice: getProductPrice(lineItems, "Imob", activeKombo),
    locPrice: getProductPrice(lineItems, "Loc", activeKombo),
    addonPrices: getAddonPrices(lineItems, activeKombo),
    vipIncluded:
      hasPremiumIncluded &&
      (metrics.imobVipSupport || metrics.locVipSupport),
    csIncluded:
      hasPremiumIncluded &&
      (metrics.imobDedicatedCS || metrics.locDedicatedCS),
    vipPrice:
      !hasPremiumIncluded && (metrics.imobVipSupport || metrics.locVipSupport)
        ? 97
        : 0,
    csPrice:
      !hasPremiumIncluded &&
      (metrics.imobDedicatedCS || metrics.locDedicatedCS)
        ? Pricing.getCSDedicadoPrice()
        : 0,
    postPaidBreakdown: buildPostPaidBreakdown(input, postPaidTotal),
    komboComparison: buildKomboComparison(lineItems, activeKombo, product),
    frequencyComparison: buildFrequencyComparison(lineItems, komboInfo, frequency),
    selectedColumnsJson:
      selectedColumnsData.length > 0
        ? JSON.stringify(selectedColumnsData)
        : undefined,
  };
}

// ─── Quote Save Data Builder ────────────────────────────────────────────────

export function buildQuoteSaveData(
  input: ProposalDataInput,
  proposalData: Record<string, any>
): Record<string, any> {
  const {
    quoteInfo,
    product,
    imobPlan,
    locPlan,
    frequency,
    addons,
    metrics,
    activeKombo,
    businessNature,
  } = input;

  return {
    action: "pdf_exported",
    product,
    imobPlan: product !== "loc" ? imobPlan : undefined,
    locPlan: product !== "imob" ? locPlan : undefined,
    frequency,
    addons: JSON.stringify(addons),
    metrics: JSON.stringify(metrics),
    totals: JSON.stringify({
      monthly: proposalData.totalMonthly,
      annual: proposalData.totalAnnual,
      implantation: proposalData.implantationFee,
      postPaid: proposalData.postPaidTotal,
      firstYear: proposalData.firstYearTotal,
    }),
    komboId: activeKombo !== "none" ? activeKombo : undefined,
    komboName:
      activeKombo !== "none" ? KOMBOS[activeKombo]?.name : undefined,
    komboDiscount:
      activeKombo !== "none"
        ? Math.round((KOMBOS[activeKombo]?.discount || 0) * 100)
        : undefined,
    clientName: businessNature.ownerName,
    vendorName: quoteInfo.vendorName,
    salespersonId: quoteInfo.salespersonId,
    agencyName: businessNature.companyName,
    cellPhone: businessNature.cellphone,
    landlinePhone: businessNature.landline,
    websiteUrl: businessNature.hasWebsite
      ? businessNature.websiteUrl
      : "Cliente não tem site ainda",
    businessType: businessNature.businessType,
    email: businessNature.email,
    hasCRM: businessNature.hasCRM ? 1 : 0,
    crmSystem: businessNature.hasCRM ? businessNature.crmSystem : undefined,
    crmOther:
      businessNature.hasCRM && businessNature.crmSystem === "Outro"
        ? businessNature.crmOther
        : undefined,
    hasERP: businessNature.hasERP ? 1 : 0,
    erpSystem: businessNature.hasERP ? businessNature.erpSystem : undefined,
    erpOther:
      businessNature.hasERP && businessNature.erpSystem === "Outro"
        ? businessNature.erpOther
        : undefined,
  };
}
