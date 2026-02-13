/**
 * Pure calculation functions for Kombo column data.
 * No React dependencies — all functions are deterministic and testable.
 */

import * as Pricing from "@/utils/pricing";
import { KOMBO_DEFINITIONS, isKomboAvailable } from "./komboDefinitions";
import type {
  ProductSelection,
  PlanTier,
  PaymentFrequency,
  KomboId,
  ColumnOverrides,
  KomboColumnData,
  KomboComparisonProps,
} from "./komboComparisonTypes";

// ─── Price Constants ─────────────────────────────────────────────────────────

export const PLAN_ANNUAL_PRICES: Record<PlanTier, number> = Pricing.PLAN_ANNUAL_PRICES;

export const ADDON_ANNUAL_PRICES = {
  ...Pricing.ADDON_ANNUAL_PRICES,
  cash: 0,
};

export const IMPLEMENTATION_COSTS = Pricing.IMPLEMENTATION_COSTS;

export const PREMIUM_SERVICES_ANNUAL_PRICES = {
  vipSupport: Pricing.getVipSupportPrice(),
  dedicatedCS: Pricing.getCSDedicadoPrice(),
  training: 166,
};

export const PAYMENT_FREQUENCY_MULTIPLIERS: Record<PaymentFrequency, number> = {
  monthly: Pricing.getFrequencyMultiplier("monthly"),
  semestral: Pricing.getFrequencyMultiplier("semiannual"),
  annual: Pricing.getFrequencyMultiplier("annual"),
  biennial: Pricing.getFrequencyMultiplier("biennial"),
};

export const CYCLE_MONTHS: Record<PaymentFrequency, number> = {
  monthly: 1,
  semestral: 6,
  annual: 12,
  biennial: 24,
};

export const CYCLE_LABELS: Record<PaymentFrequency, string> = {
  monthly: "Mensal",
  semestral: "Semestral",
  annual: "Anual",
  biennial: "Bienal",
};

// ─── Helper Functions ────────────────────────────────────────────────────────

export const roundToEndIn7 = (price: number): number => {
  return Pricing.roundPrice(price);
};

export const calculatePrice = (annualPrice: number, frequency: PaymentFrequency): number => {
  const freqMap: Record<PaymentFrequency, "monthly" | "semiannual" | "annual" | "biennial"> = {
    monthly: "monthly",
    semestral: "semiannual",
    annual: "annual",
    biennial: "biennial",
  };
  return Pricing.applyFrequency(annualPrice, freqMap[frequency]);
};

export const applyDiscount = (price: number, discount: number): number => {
  if (discount === 0) return price;
  return Math.round(price * (1 - discount));
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const isPremiumIncludedInPlan = (plan: PlanTier): boolean => {
  return plan === "k" || plan === "k2";
};

export const calculatePremiumPrice = (annualPrice: number, frequency: PaymentFrequency): number => {
  const multiplier = PAYMENT_FREQUENCY_MULTIPLIERS[frequency];
  return Math.round(annualPrice * multiplier);
};

// ─── Post-Paid Data Calculator ───────────────────────────────────────────────

export const calculatePostPaidData = (
  props: KomboComparisonProps,
  columnImobPlan: PlanTier,
  columnLocPlan: PlanTier,
  hasImob: boolean,
  hasLoc: boolean,
  hasLeads: boolean,
  hasAssinatura: boolean,
  hasPay: boolean,
) => {
  const { imobUsers, closingsPerMonth, leadsPerMonth, contractsUnderManagement, newContractsPerMonth, wantsWhatsApp } = props;

  let postPaidUsers: KomboColumnData["postPaidUsers"] = null;
  if (hasImob) {
    const included = Pricing.getIncludedQuantity("imob", columnImobPlan);
    const additional = Math.max(0, imobUsers - included);
    if (additional > 0) {
      const cost = Pricing.calculateAdditionalUsersCost(columnImobPlan, additional);
      postPaidUsers = { cost, additional, included, perUnit: cost / additional };
    } else {
      postPaidUsers = { cost: 0, additional: 0, included, perUnit: 0 };
    }
  }

  let postPaidContracts: KomboColumnData["postPaidContracts"] = null;
  if (hasLoc) {
    const included = Pricing.getIncludedQuantity("loc", columnLocPlan);
    const additional = Math.max(0, contractsUnderManagement - included);
    if (additional > 0) {
      const cost = Pricing.calculateAdditionalContractsCost(columnLocPlan, additional);
      postPaidContracts = { cost, additional, included, perUnit: cost / additional };
    } else {
      postPaidContracts = { cost: 0, additional: 0, included, perUnit: 0 };
    }
  }

  let postPaidWhatsApp: KomboColumnData["postPaidWhatsApp"] = null;
  if (hasLeads && hasImob && wantsWhatsApp) {
    const included = Pricing.getIncludedWhatsAppLeads();
    const additional = Math.max(0, leadsPerMonth - included);
    if (additional > 0) {
      const cost = Pricing.calculateAdditionalWhatsAppLeadsCost(additional);
      const perUnit = 1.5;
      postPaidWhatsApp = { cost, additional, included, perUnit };
    } else {
      postPaidWhatsApp = { cost: 0, additional: 0, included, perUnit: 0 };
    }
  }

  let postPaidAssinaturas: KomboColumnData["postPaidAssinaturas"] = null;
  if (hasAssinatura) {
    const totalVolume = (hasImob ? closingsPerMonth : 0) + (hasLoc ? newContractsPerMonth : 0);
    const included = Pricing.getIncludedSignatures();
    const additional = Math.max(0, totalVolume - included);
    if (additional > 0) {
      const cost = Pricing.calculateAdditionalSignaturesCost(additional);
      postPaidAssinaturas = { cost, additional, included, total: totalVolume, perUnit: cost / additional };
    } else {
      postPaidAssinaturas = { cost: 0, additional: 0, included, total: totalVolume, perUnit: 0 };
    }
  }

  let postPaidBoletos: KomboColumnData["postPaidBoletos"] = null;
  if (hasPay && hasLoc && contractsUnderManagement > 0) {
    const cost = Pricing.calculateBoletosCost(columnLocPlan, contractsUnderManagement);
    postPaidBoletos = { cost, quantity: contractsUnderManagement, perUnit: cost / contractsUnderManagement };
  }

  let postPaidSplits: KomboColumnData["postPaidSplits"] = null;
  if (hasPay && hasLoc && contractsUnderManagement > 0) {
    const cost = Pricing.calculateSplitsCost(columnLocPlan, contractsUnderManagement);
    postPaidSplits = { cost, quantity: contractsUnderManagement, perUnit: cost / contractsUnderManagement };
  }

  const postPaidTotal =
    (postPaidUsers?.cost ?? 0) +
    (postPaidContracts?.cost ?? 0) +
    (postPaidWhatsApp?.cost ?? 0) +
    (postPaidAssinaturas?.cost ?? 0) +
    (postPaidBoletos?.cost ?? 0) +
    (postPaidSplits?.cost ?? 0);

  return { postPaidUsers, postPaidContracts, postPaidWhatsApp, postPaidAssinaturas, postPaidBoletos, postPaidSplits, postPaidTotal };
};

// ─── Column Calculators ──────────────────────────────────────────────────────

/** Calculate the "Sua Seleção" (no Kombo) column */
export const calculateNoKomboColumn = (
  props: KomboComparisonProps,
  isRecommended: boolean,
  overrides?: ColumnOverrides
): KomboColumnData => {
  const frequency = overrides?.frequency ?? props.frequency;
  const imobPlan = overrides?.imobPlan ?? props.imobPlan;
  const locPlan = overrides?.locPlan ?? props.locPlan;
  const addons = overrides?.addons ?? props.addons;
  const { product, vipSupport, dedicatedCS } = props;

  let totalMonthly = 0;
  let implementation = 0;

  let imobPrice: number | null = null;
  let locPrice: number | null = null;

  if (product === "imob" || product === "both") {
    imobPrice = calculatePrice(PLAN_ANNUAL_PRICES[imobPlan], frequency);
    totalMonthly += imobPrice;
    implementation += IMPLEMENTATION_COSTS.imob;
  }
  if (product === "loc" || product === "both") {
    locPrice = calculatePrice(PLAN_ANNUAL_PRICES[locPlan], frequency);
    totalMonthly += locPrice;
    implementation += IMPLEMENTATION_COSTS.loc;
  }

  let leadsPrice: number | null = null;
  let inteligenciaPrice: number | null = null;
  let assinaturaPrice: number | null = null;
  let payPrice: string | null = null;
  let segurosPrice: string | null = null;
  let cashPrice: string | null = null;

  if (addons.leads && (product === "imob" || product === "both")) {
    leadsPrice = calculatePrice(ADDON_ANNUAL_PRICES.leads, frequency);
    totalMonthly += leadsPrice;
    implementation += IMPLEMENTATION_COSTS.leads;
  }

  let whatsAppPrice: string | null = null;
  if (addons.leads && (product === "imob" || product === "both") && props.wantsWhatsApp) {
    whatsAppPrice = "Pós-pago";
  }

  if (addons.inteligencia) {
    inteligenciaPrice = calculatePrice(ADDON_ANNUAL_PRICES.inteligencia, frequency);
    totalMonthly += inteligenciaPrice;
    implementation += IMPLEMENTATION_COSTS.inteligencia;
  }
  if (addons.assinatura) {
    assinaturaPrice = calculatePrice(ADDON_ANNUAL_PRICES.assinatura, frequency);
    totalMonthly += assinaturaPrice;
  }
  if (addons.pay && (product === "loc" || product === "both")) payPrice = "Pós-pago";
  if (addons.seguros && (product === "loc" || product === "both")) segurosPrice = "Pós-pago";
  if (addons.cash && (product === "loc" || product === "both")) cashPrice = "Grátis";

  let vipSupportPrice: number | string | null = null;
  let dedicatedCSPrice: number | string | null = null;

  const imobIncludesPremium = (product === "imob" || product === "both") && isPremiumIncludedInPlan(imobPlan);
  const locIncludesPremium = (product === "loc" || product === "both") && isPremiumIncludedInPlan(locPlan);

  if (imobIncludesPremium || locIncludesPremium) {
    vipSupportPrice = "Incluído";
    dedicatedCSPrice = "Incluído";
  } else {
    if (vipSupport) {
      vipSupportPrice = PREMIUM_SERVICES_ANNUAL_PRICES.vipSupport;
      totalMonthly += PREMIUM_SERVICES_ANNUAL_PRICES.vipSupport;
    }
    if (dedicatedCS) {
      dedicatedCSPrice = PREMIUM_SERVICES_ANNUAL_PRICES.dedicatedCS;
      totalMonthly += PREMIUM_SERVICES_ANNUAL_PRICES.dedicatedCS;
    }
  }

  let trainingPrice: string | null = null;
  const imobIsK2 = (product === "imob" || product === "both") && imobPlan === "k2";
  const locIsK2 = (product === "loc" || product === "both") && locPlan === "k2";
  if (imobIsK2 && locIsK2) trainingPrice = "4x online ou 2 presencial";
  else if (imobIsK2 || locIsK2) trainingPrice = "2x online ou 1 presencial";

  const annualEquivalent = totalMonthly * 12 + implementation;

  const implBreakdown: { label: string; cost: number; free: boolean }[] = [];
  if (product === "imob" || product === "both") implBreakdown.push({ label: "Imob", cost: IMPLEMENTATION_COSTS.imob, free: false });
  if (product === "loc" || product === "both") implBreakdown.push({ label: "Locação", cost: IMPLEMENTATION_COSTS.loc, free: false });
  if (addons.leads && (product === "imob" || product === "both")) implBreakdown.push({ label: "Leads", cost: IMPLEMENTATION_COSTS.leads, free: false });
  if (addons.inteligencia) implBreakdown.push({ label: "Inteligência", cost: IMPLEMENTATION_COSTS.inteligencia, free: false });

  const cycleMonths = CYCLE_MONTHS[frequency];
  const cycleTotalValue = totalMonthly * cycleMonths + implementation;

  let subscriptionCount = 0;
  if (imobPrice !== null) subscriptionCount++;
  if (locPrice !== null) subscriptionCount++;
  if (leadsPrice !== null) subscriptionCount++;
  if (inteligenciaPrice !== null) subscriptionCount++;
  if (assinaturaPrice !== null) subscriptionCount++;

  const hasImob = product === "imob" || product === "both";
  const hasLoc = product === "loc" || product === "both";
  const postPaid = calculatePostPaidData(
    props, imobPlan, locPlan,
    hasImob, hasLoc,
    addons.leads && hasImob,
    addons.assinatura,
    addons.pay && hasLoc,
  );

  return {
    id: "none", name: "Sua Seleção (Sem Kombo)", shortName: "Sua Seleção", discount: 0,
    isAvailable: true, isRecommended, isCustom: false, sourceKombo: null,
    imobPrice, locPrice, leadsPrice, whatsAppPrice, inteligenciaPrice, assinaturaPrice,
    payPrice, segurosPrice, cashPrice, vipSupportPrice, dedicatedCSPrice, trainingPrice,
    ...postPaid,
    prePaidUsersActive: false, prePaidContractsActive: false,
    implBreakdown, subscriptionCount, totalMonthly,
    theoreticalImplementation: implementation, implementation, annualEquivalent,
    cycleTotalValue, cycleMonths,
    overrides: overrides ? overrides : { frequency } as ColumnOverrides,
  };
};

/** Calculate data for a Kombo column */
export const calculateKomboColumn = (
  komboId: KomboId,
  props: KomboComparisonProps,
  recommendedKombo: KomboId,
  overrides?: ColumnOverrides
): KomboColumnData => {
  const frequency = overrides?.frequency ?? props.frequency;
  const imobPlan = overrides?.imobPlan ?? props.imobPlan;
  const locPlan = overrides?.locPlan ?? props.locPlan;
  const addons = overrides?.addons ?? props.addons;
  const { product, vipSupport, dedicatedCS } = props;

  if (komboId === "none") {
    return calculateNoKomboColumn(
      { ...props, frequency, imobPlan, locPlan, addons },
      recommendedKombo === "none",
      overrides
    );
  }

  const kombo = KOMBO_DEFINITIONS[komboId];
  const isAvailable = isKomboAvailable(komboId, product);
  const isRecommended = komboId === recommendedKombo;

  const discount = kombo.discount;
  let totalMonthly = 0;
  let implementation = IMPLEMENTATION_COSTS.combo;

  let theoreticalImplementation = 0;
  if (kombo.products.includes("imob" as ProductSelection) || kombo.products.includes("both" as ProductSelection)) {
    theoreticalImplementation += IMPLEMENTATION_COSTS.imob;
  }
  if (kombo.products.includes("loc" as ProductSelection) || kombo.products.includes("both" as ProductSelection)) {
    theoreticalImplementation += IMPLEMENTATION_COSTS.loc;
  }
  if (kombo.includedAddons.includes("leads")) theoreticalImplementation += IMPLEMENTATION_COSTS.leads;
  if (kombo.includedAddons.includes("inteligencia")) theoreticalImplementation += IMPLEMENTATION_COSTS.inteligencia;

  let imobPrice: number | null = null;
  let locPrice: number | null = null;

  const komboIncludesImob = kombo.products.includes("imob" as ProductSelection) || kombo.products.includes("both" as ProductSelection);
  const komboIncludesLoc = kombo.products.includes("loc" as ProductSelection) || kombo.products.includes("both" as ProductSelection);

  if (komboIncludesImob) {
    const basePrice = calculatePrice(PLAN_ANNUAL_PRICES[imobPlan], frequency);
    imobPrice = applyDiscount(basePrice, discount);
    totalMonthly += imobPrice;
  }

  if (komboIncludesLoc) {
    const basePrice = calculatePrice(PLAN_ANNUAL_PRICES[locPlan], frequency);
    locPrice = applyDiscount(basePrice, discount);
    totalMonthly += locPrice;
  }

  let leadsPrice: number | null = null;
  let inteligenciaPrice: number | null = null;
  let assinaturaPrice: number | null = null;
  let payPrice: string | null = null;
  let segurosPrice: string | null = null;
  let cashPrice: string | null = null;

  if (kombo.includedAddons.includes("leads")) {
    const basePrice = calculatePrice(ADDON_ANNUAL_PRICES.leads, frequency);
    leadsPrice = applyDiscount(basePrice, discount);
    totalMonthly += leadsPrice;
  }

  let whatsAppPrice: string | null = null;
  if (kombo.includedAddons.includes("leads")) {
    whatsAppPrice = "Pós-pago";
  }
  if (kombo.includedAddons.includes("inteligencia")) {
    const basePrice = calculatePrice(ADDON_ANNUAL_PRICES.inteligencia, frequency);
    inteligenciaPrice = applyDiscount(basePrice, discount);
    totalMonthly += inteligenciaPrice;
  }
  if (kombo.includedAddons.includes("assinatura")) {
    const basePrice = calculatePrice(ADDON_ANNUAL_PRICES.assinatura, frequency);
    assinaturaPrice = applyDiscount(basePrice, discount);
    totalMonthly += assinaturaPrice;
  }
  if (kombo.includedAddons.includes("pay")) payPrice = "Pós-pago";
  if (kombo.includedAddons.includes("seguros")) segurosPrice = "Pós-pago";
  if (kombo.includedAddons.includes("cash")) cashPrice = "Grátis";

  let vipSupportPrice: number | string | null = null;
  let dedicatedCSPrice: number | string | null = null;

  if (kombo.includesPremiumServices) {
    vipSupportPrice = "Incluído";
    dedicatedCSPrice = "Incluído";
  } else {
    const relevantPlan = komboIncludesLoc && !komboIncludesImob ? locPlan : imobPlan;
    if (isPremiumIncludedInPlan(relevantPlan)) {
      vipSupportPrice = "Incluído";
      dedicatedCSPrice = "Incluído";
    } else {
      if (vipSupport) {
        vipSupportPrice = PREMIUM_SERVICES_ANNUAL_PRICES.vipSupport;
        totalMonthly += PREMIUM_SERVICES_ANNUAL_PRICES.vipSupport;
      }
      if (dedicatedCS) {
        dedicatedCSPrice = PREMIUM_SERVICES_ANNUAL_PRICES.dedicatedCS;
        totalMonthly += PREMIUM_SERVICES_ANNUAL_PRICES.dedicatedCS;
      }
    }
  }

  let trainingPrice: string | null = null;
  if (kombo.includesTraining) {
    trainingPrice = "Incluído";
  } else {
    const imobIsK2 = komboIncludesImob && imobPlan === "k2";
    const locIsK2 = komboIncludesLoc && locPlan === "k2";
    if (imobIsK2 && locIsK2) trainingPrice = "4x online ou 2 presencial";
    else if (imobIsK2 || locIsK2) trainingPrice = "2x online ou 1 presencial";
  }

  const annualEquivalent = totalMonthly * 12 + implementation;

  const implBreakdown: { label: string; cost: number; free: boolean }[] = [];
  if (komboIncludesImob) implBreakdown.push({ label: "Imob", cost: IMPLEMENTATION_COSTS.imob, free: kombo.freeImplementations.includes("imob") });
  if (komboIncludesLoc) implBreakdown.push({ label: "Locação", cost: IMPLEMENTATION_COSTS.loc, free: kombo.freeImplementations.includes("loc") });
  if (kombo.includedAddons.includes("leads")) implBreakdown.push({ label: "Leads", cost: IMPLEMENTATION_COSTS.leads, free: kombo.freeImplementations.includes("leads") });
  if (kombo.includedAddons.includes("inteligencia")) implBreakdown.push({ label: "Inteligência", cost: IMPLEMENTATION_COSTS.inteligencia, free: kombo.freeImplementations.includes("inteligencia") });

  const cycleMonths = CYCLE_MONTHS[frequency];
  const cycleTotalValue = totalMonthly * cycleMonths + implementation;

  let subscriptionCount = 0;
  if (imobPrice !== null) subscriptionCount++;
  if (locPrice !== null) subscriptionCount++;
  if (leadsPrice !== null) subscriptionCount++;
  if (inteligenciaPrice !== null) subscriptionCount++;
  if (assinaturaPrice !== null) subscriptionCount++;

  const postPaid = calculatePostPaidData(
    props, imobPlan, locPlan,
    komboIncludesImob, komboIncludesLoc,
    props.addons.leads && komboIncludesImob,
    kombo.includedAddons.includes("assinatura"),
    kombo.includedAddons.includes("pay"),
  );

  return {
    id: komboId, name: kombo.name, shortName: kombo.shortName, discount,
    isAvailable, isRecommended, isCustom: false, sourceKombo: null,
    imobPrice, locPrice, leadsPrice, whatsAppPrice, inteligenciaPrice, assinaturaPrice,
    payPrice, segurosPrice, cashPrice, vipSupportPrice, dedicatedCSPrice, trainingPrice,
    ...postPaid,
    prePaidUsersActive: false, prePaidContractsActive: false,
    implBreakdown, subscriptionCount, totalMonthly, theoreticalImplementation, implementation,
    annualEquivalent, cycleTotalValue, cycleMonths,
    overrides: overrides ? overrides : { frequency } as ColumnOverrides,
  };
};

/** Calculate a custom scenario column — no Kombo discount, full price, all items toggleable */
export const calculateCustomColumn = (
  customId: string,
  customIndex: number,
  customName: string,
  props: KomboComparisonProps,
  overrides: ColumnOverrides
): KomboColumnData => {
  const { frequency, imobPlan, locPlan, addons } = overrides;
  const { product } = props;

  let totalMonthly = 0;
  let implementation = 0;

  let imobPrice: number | null = null;
  let locPrice: number | null = null;

  if (product === "imob" || product === "both") {
    imobPrice = calculatePrice(PLAN_ANNUAL_PRICES[imobPlan], frequency);
    totalMonthly += imobPrice;
    implementation += IMPLEMENTATION_COSTS.imob;
  }
  if (product === "loc" || product === "both") {
    locPrice = calculatePrice(PLAN_ANNUAL_PRICES[locPlan], frequency);
    totalMonthly += locPrice;
    implementation += IMPLEMENTATION_COSTS.loc;
  }

  let leadsPrice: number | null = null;
  let inteligenciaPrice: number | null = null;
  let assinaturaPrice: number | null = null;
  let payPrice: string | null = null;
  let segurosPrice: string | null = null;
  let cashPrice: string | null = null;

  if (addons.leads && (product === "imob" || product === "both")) {
    leadsPrice = calculatePrice(ADDON_ANNUAL_PRICES.leads, frequency);
    totalMonthly += leadsPrice;
    implementation += IMPLEMENTATION_COSTS.leads;
  }

  let whatsAppPrice: string | null = null;
  if (addons.leads && (product === "imob" || product === "both")) {
    whatsAppPrice = "Pós-pago";
  }

  if (addons.inteligencia) {
    inteligenciaPrice = calculatePrice(ADDON_ANNUAL_PRICES.inteligencia, frequency);
    totalMonthly += inteligenciaPrice;
    implementation += IMPLEMENTATION_COSTS.inteligencia;
  }
  if (addons.assinatura) {
    assinaturaPrice = calculatePrice(ADDON_ANNUAL_PRICES.assinatura, frequency);
    totalMonthly += assinaturaPrice;
  }
  if (addons.pay && (product === "loc" || product === "both")) payPrice = "Pós-pago";
  if (addons.seguros && (product === "loc" || product === "both")) segurosPrice = "Pós-pago";
  if (addons.cash && (product === "loc" || product === "both")) cashPrice = "Grátis";

  let vipSupportPrice: number | string | null = null;
  let dedicatedCSPrice: number | string | null = null;

  const imobIncludesPremium = (product === "imob" || product === "both") && isPremiumIncludedInPlan(imobPlan);
  const locIncludesPremium = (product === "loc" || product === "both") && isPremiumIncludedInPlan(locPlan);

  if (imobIncludesPremium || locIncludesPremium) {
    vipSupportPrice = "Incluído";
    dedicatedCSPrice = "Incluído";
  } else {
    if (overrides.vipSupport) {
      const price = calculatePremiumPrice(PREMIUM_SERVICES_ANNUAL_PRICES.vipSupport, frequency);
      vipSupportPrice = price;
      totalMonthly += price;
    }
    if (overrides.dedicatedCS) {
      const price = calculatePremiumPrice(PREMIUM_SERVICES_ANNUAL_PRICES.dedicatedCS, frequency);
      dedicatedCSPrice = price;
      totalMonthly += price;
    }
  }

  let trainingPrice: number | string | null = null;
  const imobIsK2 = (product === "imob" || product === "both") && imobPlan === "k2";
  const locIsK2 = (product === "loc" || product === "both") && locPlan === "k2";
  if (imobIsK2 || locIsK2) {
    if (imobIsK2 && locIsK2) trainingPrice = "4x online ou 2 presencial";
    else trainingPrice = "2x online ou 1 presencial";
  } else if (overrides.training) {
    let productCount = 0;
    if (product === "imob" || product === "both") productCount++;
    if (product === "loc" || product === "both") productCount++;
    const perTraining = calculatePremiumPrice(PREMIUM_SERVICES_ANNUAL_PRICES.training, frequency);
    const totalTraining = perTraining * 2 * productCount;
    trainingPrice = totalTraining;
    totalMonthly += totalTraining;
  }

  const annualEquivalent = totalMonthly * 12 + implementation;

  const implBreakdown: { label: string; cost: number; free: boolean }[] = [];
  if (product === "imob" || product === "both") implBreakdown.push({ label: "Imob", cost: IMPLEMENTATION_COSTS.imob, free: false });
  if (product === "loc" || product === "both") implBreakdown.push({ label: "Locação", cost: IMPLEMENTATION_COSTS.loc, free: false });
  if (addons.leads && (product === "imob" || product === "both")) implBreakdown.push({ label: "Leads", cost: IMPLEMENTATION_COSTS.leads, free: false });
  if (addons.inteligencia) implBreakdown.push({ label: "Inteligência", cost: IMPLEMENTATION_COSTS.inteligencia, free: false });

  const cycleMonths = CYCLE_MONTHS[frequency];
  const cycleTotalValue = totalMonthly * cycleMonths + implementation;

  let subscriptionCount = 0;
  if (imobPrice !== null) subscriptionCount++;
  if (locPrice !== null) subscriptionCount++;
  if (leadsPrice !== null) subscriptionCount++;
  if (inteligenciaPrice !== null) subscriptionCount++;
  if (assinaturaPrice !== null) subscriptionCount++;

  const hasImob = product === "imob" || product === "both";
  const hasLoc = product === "loc" || product === "both";
  const postPaid = calculatePostPaidData(
    props, imobPlan, locPlan,
    hasImob, hasLoc,
    addons.leads && hasImob,
    addons.assinatura,
    addons.pay && hasLoc,
  );

  return {
    id: customId,
    name: customName,
    shortName: customName,
    discount: 0,
    isAvailable: true,
    isRecommended: false,
    isCustom: true,
    sourceKombo: null,
    imobPrice, locPrice, leadsPrice, whatsAppPrice, inteligenciaPrice, assinaturaPrice,
    payPrice, segurosPrice, cashPrice, vipSupportPrice, dedicatedCSPrice, trainingPrice,
    ...postPaid,
    prePaidUsersActive: false, prePaidContractsActive: false,
    implBreakdown, subscriptionCount, totalMonthly,
    theoreticalImplementation: implementation, implementation, annualEquivalent,
    cycleTotalValue, cycleMonths,
    overrides,
  };
};
