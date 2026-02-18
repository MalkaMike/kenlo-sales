/**
 * Centralized Pricing Configuration — Adapter Layer
 * Source: pricing-values.json v2.0.0 (Deterministic Structure)
 * Last Updated: Feb 2026
 * 
 * This file provides a backward-compatible API for the calculator while consuming
 * the new deterministic pricing structure as the single source of truth.
 * 
 * DO NOT hardcode prices here. All prices come from pricing-values.json.
 */

import pricingValues from "./pricing-values.json";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type PaymentFrequency = "monthly" | "semiannual" | "annual" | "biennial";
export type KomboType = "imob-start" | "imob-pro" | "loc-pro" | "core-gestao" | "elite" | "none";
export type PlanTier = "prime" | "k" | "k2";

// Map JSON cycle names to calculator frequency names
const CYCLE_TO_FREQUENCY: Record<string, PaymentFrequency> = {
  "monthly": "monthly",
  "semiannual": "semiannual",
  "annual": "annual",
  "biennial": "biennial",
};

const FREQUENCY_TO_CYCLE: Record<PaymentFrequency, string> = {
  "monthly": "monthly",
  "semiannual": "semiannual",
  "annual": "annual",
  "biennial": "biennial",
};

// ============================================================================
// PAYMENT FREQUENCY RULES (from BLOCO A)
// ============================================================================

/**
 * Payment frequency multipliers (applied to ANNUAL price as reference)
 * Annual is the reference (1.0), others are calculated from it
 */
export const FREQUENCY_MULTIPLIERS: Record<PaymentFrequency, number> = {
  monthly: pricingValues.paymentCycles.monthly.multiplier,
  semiannual: pricingValues.paymentCycles.semiannual.multiplier,
  annual: pricingValues.paymentCycles.annual.multiplier,
  biennial: pricingValues.paymentCycles.biennial.multiplier,
};

export const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  monthly: pricingValues.paymentCycles.monthly.displayLabel,
  semiannual: pricingValues.paymentCycles.semiannual.displayLabel,
  annual: pricingValues.paymentCycles.annual.displayLabel,
  biennial: pricingValues.paymentCycles.biennial.displayLabel,
};

/**
 * Discount percentages relative to MONTHLY price (for customer display)
 * Monthly is reference (0%), others show savings vs monthly
 */
export const FREQUENCY_DISCOUNTS: Record<PaymentFrequency, number> = {
  monthly: pricingValues.paymentCycles.monthly.discountVsMonthly,
  semiannual: pricingValues.paymentCycles.semiannual.discountVsMonthly,
  annual: pricingValues.paymentCycles.annual.discountVsMonthly,
  biennial: pricingValues.paymentCycles.biennial.discountVsMonthly,
};

/**
 * Maximum installments per cycle
 */
export const FREQUENCY_INSTALLMENTS: Record<PaymentFrequency, number> = {
  monthly: pricingValues.paymentCycles.monthly.maxInstallments,
  semiannual: pricingValues.paymentCycles.semiannual.maxInstallments,
  annual: pricingValues.paymentCycles.annual.maxInstallments,
  biennial: pricingValues.paymentCycles.biennial.maxInstallments,
};

// ============================================================================
// ROUNDING RULE
// ============================================================================

/**
 * Round UP to next integer ending in 7 for prices >= 100.
 * For prices < 100, just round UP to the next integer (Math.ceil).
 * Does NOT apply to: Post-paid charges
 */
export function roundToSeven(price: number): number {
  const rounded = Math.ceil(price);
  if (rounded < 100) return rounded;
  const lastDigit = rounded % 10;
  
  if (lastDigit === 7) return rounded;
  if (lastDigit < 7) return rounded + (7 - lastDigit);
  return rounded + (10 - lastDigit) + 7;
}

// ============================================================================
// CORE PRODUCTS - KENLO IMOB (from BLOCO B)
// ============================================================================

export const IMOB_PLANS = {
  prime: {
    name: "Prime",
    description: pricingValues.basePlans.imob.prime.internalNote || "Até 4 usuários",
    annualPrice: pricingValues.basePlans.imob.prime.annualPrice,
    includedUsers: pricingValues.basePlans.imob.prime.includedUnits.quantity,
    features: buildFeatures("imob", "prime"),
  },
  k: {
    name: "K",
    description: pricingValues.basePlans.imob.k.internalNote || "5 até 14 usuários",
    annualPrice: pricingValues.basePlans.imob.k.annualPrice,
    includedUsers: pricingValues.basePlans.imob.k.includedUnits.quantity,
    features: buildFeatures("imob", "k"),
  },
  k2: {
    name: "K\u00B2",
    description: pricingValues.basePlans.imob.k2.internalNote || "Acima de 15 usuários",
    annualPrice: pricingValues.basePlans.imob.k2.annualPrice,
    includedUsers: pricingValues.basePlans.imob.k2.includedUnits.quantity,
    features: buildFeatures("imob", "k2"),
  },
} as const;

export const IMOB_IMPLEMENTATION = pricingValues._legacyFields.implantacaoBase;

/**
 * Additional users pricing (from BLOCO F)
 */
export const IMOB_ADDITIONAL_USERS = {
  prime: pricingValues.variableCosts.additionalUsers.tiers.prime.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
  k: pricingValues.variableCosts.additionalUsers.tiers.k.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
  k2: pricingValues.variableCosts.additionalUsers.tiers.k2.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
} as const;

// ============================================================================
// CORE PRODUCTS - KENLO LOCAÇÃO (from BLOCO B)
// ============================================================================

export const LOC_PLANS = {
  prime: {
    name: "Prime",
    description: pricingValues.basePlans.locacao.prime.internalNote || "Até 100 contratos",
    annualPrice: pricingValues.basePlans.locacao.prime.annualPrice,
    includedContracts: pricingValues.basePlans.locacao.prime.includedUnits.quantity,
    includedBoletos: 0, // Removed: all post-paid now
    includedSplits: 0,  // Removed: all post-paid now
    features: buildFeatures("locacao", "prime"),
  },
  k: {
    name: "K",
    description: pricingValues.basePlans.locacao.k.internalNote || "101 contratos até 499",
    annualPrice: pricingValues.basePlans.locacao.k.annualPrice,
    includedContracts: pricingValues.basePlans.locacao.k.includedUnits.quantity,
    includedBoletos: 0, // Removed: all post-paid now
    includedSplits: 0,  // Removed: all post-paid now
    features: buildFeatures("locacao", "k"),
  },
  k2: {
    name: "K\u00B2",
    description: pricingValues.basePlans.locacao.k2.internalNote || "Acima de 500 contratos",
    annualPrice: pricingValues.basePlans.locacao.k2.annualPrice,
    includedContracts: pricingValues.basePlans.locacao.k2.includedUnits.quantity,
    includedBoletos: 0, // Removed: all post-paid now
    includedSplits: 0,  // Removed: all post-paid now
    features: buildFeatures("locacao", "k2"),
  },
} as const;

export const LOC_IMPLEMENTATION = pricingValues._legacyFields.implantacaoBase;

/**
 * Additional contracts pricing (from BLOCO F)
 */
export const LOC_ADDITIONAL_CONTRACTS = {
  prime: pricingValues.variableCosts.additionalContracts.tiers.prime.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
  k: pricingValues.variableCosts.additionalContracts.tiers.k.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
  k2: pricingValues.variableCosts.additionalContracts.tiers.k2.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
} as const;

/**
 * Kenlo Pay - Boletos pricing (from BLOCO F)
 */
export const PAY_BOLETOS = {
  prime: pricingValues.variableCosts.boletos.tiers.prime.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
  k: pricingValues.variableCosts.boletos.tiers.k.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
  k2: pricingValues.variableCosts.boletos.tiers.k2.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
} as const;

/**
 * Kenlo Pay - Split pricing (from BLOCO F)
 */
export const PAY_SPLITS = {
  prime: pricingValues.variableCosts.splits.tiers.prime.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
  k: pricingValues.variableCosts.splits.tiers.k.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
  k2: pricingValues.variableCosts.splits.tiers.k2.map((tier: any) => ({
    from: tier.from,
    to: tier.to === 999999 ? Infinity : tier.to,
    price: tier.price,
  })),
} as const;

/**
 * Kenlo Seguros - Client commission percentage (from BLOCO F)
 */
export const SEGUROS_COMMISSION = {
  prime: pricingValues.variableCosts.segurosCommission.tiers.prime[0].rate / 100,
  k: pricingValues.variableCosts.segurosCommission.tiers.k[0].rate / 100,
  k2: pricingValues.variableCosts.segurosCommission.tiers.k2[0].rate / 100,
} as const;

/**
 * Estimated revenue per contract/month from Seguros (~35% of average premium)
 */
export const SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT: number =
  pricingValues.variableCosts.segurosCommission.estimatedRevenuePerContract;

// ============================================================================
// PREPAID PRICING (from BLOCO F-PRE)
// ============================================================================

/**
 * Prepaid pricing for additional users and contracts
 * Available only for annual and biennial frequencies
 * Flat rate regardless of plan tier or volume
 */
export const PREPAID_PRICING = {
  additionalUsers: {
    product: pricingValues.prepaidPricing.additionalUsers.product as "imob",
    pricePerMonth: pricingValues.prepaidPricing.additionalUsers.pricePerMonth,
    availableFrequencies: pricingValues.prepaidPricing.additionalUsers.availableFrequencies as PaymentFrequency[],
  },
  additionalContracts: {
    product: pricingValues.prepaidPricing.additionalContracts.product as "locacao",
    pricePerMonth: pricingValues.prepaidPricing.additionalContracts.pricePerMonth,
    availableFrequencies: pricingValues.prepaidPricing.additionalContracts.availableFrequencies as PaymentFrequency[],
  },
  additionalLeads: {
    product: pricingValues.prepaidPricing.additionalLeads.product as "imob",
    pricePerMonth: pricingValues.prepaidPricing.additionalLeads.pricePerMonth,
    availableFrequencies: pricingValues.prepaidPricing.additionalLeads.availableFrequencies as PaymentFrequency[],
  },
} as const;

/**
 * Get the prepaid period in months based on frequency
 */
export function getPrepaidMonths(frequency: PaymentFrequency): number {
  switch (frequency) {
    case "annual": return 12;
    case "biennial": return 24;
    default: return 0; // Not available for monthly/semiannual
  }
}

/**
 * Check if prepaid option is available for a given frequency
 */
export function isPrepaidAvailable(frequency: PaymentFrequency): boolean {
  return frequency === "annual" || frequency === "biennial";
}

/**
 * Calculate prepaid total for additional users
 */
export function calculatePrepaidUsers(quantity: number, frequency: PaymentFrequency): number {
  if (!isPrepaidAvailable(frequency)) return 0;
  const months = getPrepaidMonths(frequency);
  return quantity * PREPAID_PRICING.additionalUsers.pricePerMonth * months;
}

/**
 * Calculate prepaid total for additional contracts
 */
export function calculatePrepaidContracts(quantity: number, frequency: PaymentFrequency): number {
  if (!isPrepaidAvailable(frequency)) return 0;
  const months = getPrepaidMonths(frequency);
  return quantity * PREPAID_PRICING.additionalContracts.pricePerMonth * months;
}

/**
 * Calculate prepaid total for additional leads
 */
export function calculatePrepaidLeads(quantity: number, frequency: PaymentFrequency): number {
  if (!isPrepaidAvailable(frequency)) return 0;
  const months = getPrepaidMonths(frequency);
  return quantity * PREPAID_PRICING.additionalLeads.pricePerMonth * months;
}

// ============================================================================
// ADD-ONS (from BLOCO C)
// ============================================================================

export const ADDONS = {
  inteligencia: {
    name: "Kenlo Inteligência",
    annualPrice: pricingValues.addons.inteligencia.annualPrice,
    implementation: pricingValues.addons.inteligencia.implementation,
    availableFor: pricingValues.addons.inteligencia.availability as readonly ("imob" | "loc")[],
    features: {
      basicReports: true,
      imobPricePerM2: true,
      imobSafraReports: true,
      imobMarketComparison: true,
      explorer: true,
    },
  },
  leads: {
    name: "Kenlo Leads",
    annualPrice: pricingValues.addons.leads.annualPrice,
    implementation: pricingValues.addons.leads.implementation,
    availableFor: pricingValues.addons.leads.availability as readonly ("imob" | "loc")[],
    includedWhatsAppLeads: pricingValues.addons.leads.includedUnits?.quantity || 100,
    additionalLeadsTiers: pricingValues.variableCosts.additionalLeads.tiers.all_plans.map((tier: any) => ({
      from: tier.from,
      to: tier.to === 999999 ? Infinity : tier.to,
      price: tier.price,
    })),
    features: {
      unlimitedDistribution: true,
      whatsappIntegration: true,
      aiIntegration: true,
    },
  },
  assinaturas: {
    name: "Kenlo Assinaturas",
    annualPrice: pricingValues.addons.assinaturas.annualPrice,
    implementation: pricingValues.addons.assinaturas.implementation,
    availableFor: pricingValues.addons.assinaturas.availability as readonly ("imob" | "loc")[],
    includedSignatures: pricingValues.addons.assinaturas.includedUnits?.quantity || 15,
    additionalSignaturesTiers: pricingValues.variableCosts.additionalSignatures.tiers.all_plans.map((tier: any) => ({
      from: tier.from,
      to: tier.to === 999999 ? Infinity : tier.to,
      price: tier.price,
    })),
    biometricValidation: 6.00, // TODO: Add to variableCosts if needed
  },
} as const;

// ============================================================================
// PREMIUM SERVICES (from BLOCO D)
// ============================================================================

export const PREMIUM_SERVICES = {
  vipSupport: {
    name: "Suporte VIP",
    monthlyPrice: pricingValues.premiumServices.recurring.vipSupport.monthlyPrice,
    features: {
      responseTime: "15min",
      resolutionTime: "Até 8 horas úteis",
    },
    includedIn: pricingValues.premiumServices.recurring.vipSupport.defaultByPlan,
  },
  csDedicado: {
    name: "Customer Success Dedicado",
    monthlyPrice: pricingValues.premiumServices.recurring.csDedicado.monthlyPrice,
    features: {
      exclusiveWhatsApp: true,
      closeFollowUp: true,
      criticalIssues: true,
      bestPractices: true,
      internalFacilitation: true,
      valueGeneration: true,
    },
    includedIn: pricingValues.premiumServices.recurring.csDedicado.defaultByPlan,
  },
} as const;

/**
 * Training pricing (from BLOCO D)
 */
export const TRAINING = {
  online: pricingValues.premiumServices.nonRecurring.treinamentoOnline.unitPrice,
  presencial: pricingValues.premiumServices.nonRecurring.treinamentoPresencial.unitPrice,
} as const;

// ============================================================================
// KOMBOS (from BLOCO E)
// ============================================================================

export const KOMBOS = {
  "imob-start": {
    name: pricingValues.kombos.imob_start.name,
    structure: pricingValues.kombos.imob_start.productsIncluded.concat(
      pricingValues.kombos.imob_start.addonsIncluded
    ) as readonly string[],
    monthlyDiscount: pricingValues.kombos.imob_start.discount / 100,
    implementation: pricingValues._legacyFields.implantacaoBase,
    freeImplementations: pricingValues.kombos.imob_start.zeroedImplementationsList,
    premiumServicesIncluded: pricingValues.kombos.imob_start.premiumServicesIncluded.length > 0,
  },
  "imob-pro": {
    name: pricingValues.kombos.imob_pro.name,
    structure: pricingValues.kombos.imob_pro.productsIncluded.concat(
      pricingValues.kombos.imob_pro.addonsIncluded
    ) as readonly string[],
    monthlyDiscount: pricingValues.kombos.imob_pro.discount / 100,
    implementation: pricingValues._legacyFields.implantacaoBase,
    freeImplementations: pricingValues.kombos.imob_pro.zeroedImplementationsList,
    premiumServicesIncluded: pricingValues.kombos.imob_pro.premiumServicesIncluded.length > 0,
  },
  "loc-pro": {
    name: pricingValues.kombos.locacao_pro.name,
    structure: pricingValues.kombos.locacao_pro.productsIncluded.concat(
      pricingValues.kombos.locacao_pro.addonsIncluded
    ) as readonly string[],
    monthlyDiscount: pricingValues.kombos.locacao_pro.discount / 100,
    implementation: pricingValues._legacyFields.implantacaoBase,
    freeImplementations: pricingValues.kombos.locacao_pro.zeroedImplementationsList,
    premiumServicesIncluded: pricingValues.kombos.locacao_pro.premiumServicesIncluded.length > 0,
  },
  "core-gestao": {
    name: pricingValues.kombos.core_gestao.name,
    structure: pricingValues.kombos.core_gestao.productsIncluded.concat(
      pricingValues.kombos.core_gestao.addonsIncluded
    ) as readonly string[],
    monthlyDiscount: pricingValues.kombos.core_gestao.discount / 100,
    implementation: pricingValues._legacyFields.implantacaoBase,
    freeImplementations: pricingValues.kombos.core_gestao.zeroedImplementationsList,
    premiumServicesIncluded: pricingValues.kombos.core_gestao.premiumServicesIncluded.length > 0,
  },
  elite: {
    name: pricingValues.kombos.elite.name,
    structure: pricingValues.kombos.elite.productsIncluded.concat(
      pricingValues.kombos.elite.addonsIncluded
    ) as readonly string[],
    monthlyDiscount: pricingValues.kombos.elite.discount / 100,
    implementation: pricingValues._legacyFields.implantacaoBase,
    freeImplementations: pricingValues.kombos.elite.zeroedImplementationsList,
    premiumServicesIncluded: pricingValues.kombos.elite.premiumServicesIncluded.length > 0,
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate price for a given frequency based on annual price
 */
export function calculatePrice(annualPrice: number, frequency: PaymentFrequency): number {
  return roundToSeven(annualPrice * FREQUENCY_MULTIPLIERS[frequency]);
}

/**
 * Calculate tiered pricing (for additional users, contracts, leads, etc.)
 */
export function calculateTieredPrice(
  quantity: number,
  tiers: readonly { from: number; to: number; price: number }[]
): number {
  let total = 0;
  let remaining = quantity;

  for (const tier of tiers) {
    if (remaining <= 0) break;

    const tierSize = tier.to === Infinity ? Infinity : tier.to - tier.from + 1;
    const quantityInTier = Math.min(remaining, tierSize);
    total += quantityInTier * tier.price;
    remaining -= quantityInTier;
  }

  return total;
}

/**
 * Detect active Kombo based on selected products/add-ons
 */
export function detectKombo(selection: {
  imob: boolean;
  loc: boolean;
  leads: boolean;
  inteligencia: boolean;
  assinaturas: boolean;
}): KomboType {
  const { imob, loc, leads, inteligencia, assinaturas } = selection;

  // Elite: IMOB + LOC + ALL add-ons
  if (imob && loc && leads && inteligencia && assinaturas) {
    return "elite";
  }

  // Core Gestão: IMOB + LOC without add-ons
  if (imob && loc && !leads && !inteligencia && !assinaturas) {
    return "core-gestao";
  }

  // Imob Pro: IMOB + Leads + Inteligência + Assinatura
  if (imob && !loc && leads && inteligencia && assinaturas) {
    return "imob-pro";
  }

  // Imob Start: IMOB + Leads + Assinatura
  if (imob && !loc && leads && !inteligencia && assinaturas) {
    return "imob-start";
  }

  // Locação Pro: LOC + Inteligência + Assinatura
  if (!imob && loc && inteligencia && assinaturas) {
    return "loc-pro";
  }

  return "none";
}

/**
 * Check if Premium Services should be included based on plan tiers and Kombo
 */
export function shouldIncludePremiumService(
  service: "vipSupport" | "csDedicado",
  imobPlan: PlanTier | null,
  locPlan: PlanTier | null,
  activeKombo: KomboType
): boolean {
  // All Kombos include both services
  if (activeKombo !== "none" && KOMBOS[activeKombo].premiumServicesIncluded) {
    return true;
  }

  const serviceConfig = PREMIUM_SERVICES[service];

  // Check if included in IMOB plan
  if (imobPlan && serviceConfig.includedIn[imobPlan]) {
    return true;
  }

  // Check if included in LOC plan
  if (locPlan && serviceConfig.includedIn[locPlan]) {
    return true;
  }

  return false;
}

// ============================================================================
// NEW FUNCTIONS - FEATURE MATRIX (from BLOCO G)
// ============================================================================

/**
 * Build features object from feature matrix
 * featureMatrix structure: { imob: { prime: [features], k: [features], k2: [features] } }
 */
function buildFeatures(product: "imob" | "locacao", plan: PlanTier): Record<string, boolean> {
  const productMatrix = pricingValues.featureMatrix[product];
  const features: Record<string, boolean> = {};

  // featureMatrix is structured as product.plan[array of features]
  const planFeatures = productMatrix[plan];
  if (Array.isArray(planFeatures)) {
    planFeatures.forEach((feature: any) => {
      // Use feature name as key (sanitized for use as object key)
      const key = feature.name.toLowerCase().replace(/\s+/g, '_');
      features[key] = feature.included;
    });
  }

  return features;
}

/**
 * Get all features for a product/plan from feature matrix
 */
export function getFeatures(product: "imob" | "locacao", plan: PlanTier): Record<string, boolean> {
  return buildFeatures(product, plan);
}

/**
 * Get feature by name (case-insensitive)
 */
function findFeatureByName(product: "imob" | "locacao", plan: PlanTier, featureName: string): any {
  const productMatrix = pricingValues.featureMatrix[product];
  const planFeatures = productMatrix[plan];
  if (Array.isArray(planFeatures)) {
    return planFeatures.find((f: any) => 
      f.name.toLowerCase() === featureName.toLowerCase()
    );
  }
  return null;
}

/**
 * Check if a specific feature is included in a product/plan
 */
export function isFeatureIncluded(
  product: "imob" | "locacao",
  plan: PlanTier,
  featureName: string
): boolean {
  const feature = findFeatureByName(product, plan, featureName);
  return feature ? feature.included : false;
}

/**
 * Get feature details (name, description, linked services)
 */
export function getFeatureDetails(product: "imob" | "locacao", plan: PlanTier, featureName: string) {
  const feature = findFeatureByName(product, plan, featureName);
  if (!feature) return null;

  return {
    name: feature.name,
    description: feature.description,
    linkedToAddon: feature.linkedToAddon,
    linkedToPremiumService: feature.linkedToPremiumService,
    included: feature.included,
  };
}

/**
 * Get all features for a product with their details across all plans
 */
export function getAllFeatures(product: "imob" | "locacao") {
  const productMatrix = pricingValues.featureMatrix[product];
  const primeFeatures = productMatrix.prime || [];
  const kFeatures = productMatrix.k || [];
  const k2Features = productMatrix.k2 || [];

  // Merge features from all plans (assuming same features across plans)
  const allFeatures = primeFeatures.map((primeFeature: any, idx: number) => {
    const kFeature = kFeatures[idx];
    const k2Feature = k2Features[idx];

    return {
      key: primeFeature.name.toLowerCase().replace(/\s+/g, '_'),
      name: primeFeature.name,
      description: primeFeature.description,
      category: primeFeature.category || "core",
      linkedToAddon: primeFeature.linkedToAddon,
      linkedToPremiumService: primeFeature.linkedToPremiumService,
      includedInPrime: primeFeature.included,
      includedInK: kFeature ? kFeature.included : false,
      includedInK2: k2Feature ? k2Feature.included : false,
    };
  });

  return allFeatures;
}

// ============================================================================
// PAY PRICING HELPERS
// ============================================================================

/**
 * Get the price range for boletos across all plans
 * Returns { min, max } representing the lowest and highest prices
 */
export function getBoletosPriceRange(): { min: number; max: number } {
  const allPrices: number[] = [];
  
  // Collect all prices from all plans
  Object.values(PAY_BOLETOS).forEach((tiers) => {
    tiers.forEach((tier) => {
      allPrices.push(tier.price);
    });
  });
  
  return {
    min: Math.min(...allPrices),
    max: Math.max(...allPrices),
  };
}

/**
 * Get the price range for splits across all plans
 * Returns { min, max } representing the lowest and highest prices
 */
export function getSplitsPriceRange(): { min: number; max: number } {
  const allPrices: number[] = [];
  
  // Collect all prices from all plans
  Object.values(PAY_SPLITS).forEach((tiers) => {
    tiers.forEach((tier) => {
      allPrices.push(tier.price);
    });
  });
  
  return {
    min: Math.min(...allPrices),
    max: Math.max(...allPrices),
  };
}

/**
 * Calculate estimated profit range for imobiliária
 * Given a suggested charge amount (e.g., R$ 5,00), calculate profit after paying Kenlo
 * @param suggestedCharge - Amount imobiliária charges to tenant/owner (e.g., 5.00)
 * @param type - 'boleto' or 'split'
 * @returns { min, max } profit range
 */
export function calculatePayProfitRange(
  suggestedCharge: number,
  type: 'boleto' | 'split'
): { min: number; max: number } {
  const priceRange = type === 'boleto' ? getBoletosPriceRange() : getSplitsPriceRange();
  
  return {
    min: Math.max(0, suggestedCharge - priceRange.max), // Profit when paying highest Kenlo fee
    max: Math.max(0, suggestedCharge - priceRange.min), // Profit when paying lowest Kenlo fee
  };
}

// ============================================================================
// ELITE KOMBO SAVINGS ESTIMATE
// ============================================================================

/**
 * Estimated first-year savings for the Elite Kombo.
 * This marketing estimate includes zeroed addon implementations,
 * implementation discount, and monthly subscription savings.
 * Source of truth: pricing-values.json → kombos.elite.estimatedFirstYearSavings
 */
export const ELITE_FIRST_YEAR_SAVINGS = pricingValues.kombos.elite.estimatedFirstYearSavings;
