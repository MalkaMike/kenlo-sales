/**
 * Centralized Pricing Configuration
 * Source: MMPlanosH2-2025_2026Final(1).pdf
 * Last Updated: Feb 2026
 * 
 * This is the single source of truth for all pricing across the website.
 * To update prices, modify this file only - all components will automatically use the new values.
 */

// ============================================================================
// PAYMENT FREQUENCY RULES
// ============================================================================

export type PaymentFrequency = "monthly" | "semiannual" | "annual" | "biennial";

/**
 * Payment frequency multipliers (applied to ANNUAL price as reference)
 * Annual is the reference (1.0), others are calculated from it
 */
export const FREQUENCY_MULTIPLIERS: Record<PaymentFrequency, number> = {
  monthly: 1.25,    // Anual ÷ (1 - 20%) = Anual × 1.25
  semiannual: 1.111, // Anual ÷ (1 - 10%) ≈ Anual × 1.111
  annual: 1.0,      // Reference (0% discount)
  biennial: 0.75,   // Anual × (1 - 25%) = Anual × 0.75 ⚠️ UPDATED from 0.72 (was 28%, now 25%)
};

export const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  monthly: "Mensal (0% - Referência)",
  semiannual: "Semestral (-10%)",
  annual: "Anual (-20%)",
  biennial: "Bienal (-25%)", // ⚠️ UPDATED from -28%
};

// ============================================================================
// ROUNDING RULE
// ============================================================================

/**
 * Round price UP to next integer ending in 7
 * Applies to: All products/add-ons, all frequencies
 * Does NOT apply to: Post-paid charges
 */
export function roundToSeven(price: number): number {
  const rounded = Math.ceil(price);
  const lastDigit = rounded % 10;
  
  if (lastDigit === 7) return rounded;
  if (lastDigit < 7) return rounded + (7 - lastDigit);
  return rounded + (10 - lastDigit) + 7;
}

// ============================================================================
// CORE PRODUCTS - KENLO IMOB
// ============================================================================

export const IMOB_PLANS = {
  prime: {
    name: "Prime",
    description: "Até 4 usuários",
    annualPrice: 247, // Already ends in 7
    includedUsers: 2,
    features: {
      crm: true,
      appCorretor: true,
      landingPage: false,
      blog: false,
      training: false,
      apiAccess: false,
    },
  },
  k: {
    name: "K",
    description: "5 até 14 usuários",
    annualPrice: 497, // Already ends in 7
    includedUsers: 7,
    features: {
      crm: true,
      appCorretor: true,
      landingPage: true,
      blog: false,
      training: false,
      apiAccess: false,
    },
  },
  k2: {
    name: "K2",
    description: "Acima de 15 usuários",
    annualPrice: 1197, // Already ends in 7
    includedUsers: 15,
    features: {
      crm: true,
      appCorretor: true,
      landingPage: true,
      blog: true,
      training: true, // 2 Online/year OR 1 Presencial
      apiAccess: true, // Available Mar 2026
    },
  },
} as const;

export const IMOB_IMPLEMENTATION = 1497; // Fixed for all plans

/**
 * Additional users pricing (post-paid or pre-paid, same price)
 * Tiered pricing: the bigger the plan, the cheaper the additional user
 */
export const IMOB_ADDITIONAL_USERS = {
  prime: [
    { from: 1, to: Infinity, price: 57 }, // Fixed R$57 per user
  ],
  k: [
    { from: 1, to: 5, price: 47 },
    { from: 6, to: Infinity, price: 37 },
  ],
  k2: [
    { from: 1, to: 10, price: 37 },
    { from: 11, to: 100, price: 27 },
    { from: 101, to: Infinity, price: 17 },
  ],
} as const;

// ============================================================================
// CORE PRODUCTS - KENLO LOCAÇÃO
// ============================================================================

export const LOC_PLANS = {
  prime: {
    name: "Prime",
    description: "Até 100 contratos",
    annualPrice: 247, // Already ends in 7
    includedContracts: 100,
    includedBoletos: 2,
    includedSplits: 2,
    features: {
      basicFeatures: true, // All basic features from page 8-9
      advancedFeatures: false, // Features from page 10 (K+ only)
      exclusiveK2: false, // Features from page 10 (K2 only)
      training: false,
    },
  },
  k: {
    name: "K",
    description: "101 contratos até 499",
    annualPrice: 497, // Already ends in 7
    includedContracts: 150,
    includedBoletos: 5,
    includedSplits: 5,
    features: {
      basicFeatures: true,
      advancedFeatures: true,
      exclusiveK2: false,
      training: false,
    },
  },
  k2: {
    name: "K2",
    description: "Acima de 500 contratos",
    annualPrice: 1197, // Already ends in 7
    includedContracts: 500,
    includedBoletos: 15,
    includedSplits: 15,
    features: {
      basicFeatures: true,
      advancedFeatures: true,
      exclusiveK2: true,
      training: true, // 2 Online/year OR 1 Presencial
    },
  },
} as const;

export const LOC_IMPLEMENTATION = 1497; // Fixed for all plans

/**
 * Additional contracts pricing (post-paid or pre-paid, same price)
 */
export const LOC_ADDITIONAL_CONTRACTS = {
  prime: [
    { from: 1, to: Infinity, price: 3.00 },
  ],
  k: [
    { from: 1, to: 250, price: 3.00 },
    { from: 251, to: Infinity, price: 2.50 },
  ],
  k2: [
    { from: 1, to: 250, price: 3.00 },
    { from: 251, to: 500, price: 2.50 },
    { from: 501, to: Infinity, price: 2.00 },
  ],
} as const;

/**
 * Kenlo Pay - Boletos pricing (post-paid)
 */
export const PAY_BOLETOS = {
  prime: [
    { from: 1, to: Infinity, price: 4.00 },
  ],
  k: [
    { from: 1, to: 250, price: 4.00 },
    { from: 251, to: Infinity, price: 3.50 },
  ],
  k2: [
    { from: 1, to: 250, price: 4.00 },
    { from: 251, to: 500, price: 3.50 },
    { from: 501, to: Infinity, price: 3.00 },
  ],
} as const;

/**
 * Kenlo Pay - Split pricing (post-paid)
 */
export const PAY_SPLITS = {
  prime: [
    { from: 1, to: Infinity, price: 4.00 },
  ],
  k: [
    { from: 1, to: 250, price: 4.00 },
    { from: 251, to: Infinity, price: 3.50 },
  ],
  k2: [
    { from: 1, to: 250, price: 4.00 },
    { from: 251, to: 500, price: 3.50 },
    { from: 501, to: Infinity, price: 3.00 },
  ],
} as const;

/**
 * Kenlo Seguros - Client commission percentage
 */
export const SEGUROS_COMMISSION = {
  prime: 0.35, // 35% of premium
  k: 0.40,     // 40% of premium
  k2: 0.45,    // 45% of premium
} as const;

// ============================================================================
// ADD-ONS
// ============================================================================

export const ADDONS = {
  inteligencia: {
    name: "Kenlo Inteligência",
    annualPrice: 297, // Already ends in 7
    implementation: 497, // Already ends in 7
    availableFor: ["imob", "loc"] as const,
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
    annualPrice: 497, // Already ends in 7
    implementation: 497, // Already ends in 7
    availableFor: ["imob"] as const,
    includedWhatsAppLeads: 100,
    additionalLeadsTiers: [
      { from: 1, to: 200, price: 1.50 },
      { from: 201, to: 350, price: 1.30 },
      { from: 351, to: 1000, price: 1.10 },
      { from: 1001, to: Infinity, price: 0.90 },
    ],
    features: {
      unlimitedDistribution: true, // If client doesn't want WhatsApp
      whatsappIntegration: true,
      aiIntegration: true, // With approved partner (Ex: Lais)
    },
  },
  assinaturas: {
    name: "Kenlo Assinaturas",
    annualPrice: 37, // Already ends in 7
    implementation: 0, // Free
    availableFor: ["imob", "loc"] as const,
    includedSignatures: 15,
    additionalSignaturesTiers: [
      { from: 1, to: 20, price: 1.80 },
      { from: 21, to: 40, price: 1.70 },
      { from: 41, to: Infinity, price: 1.50 },
    ],
    biometricValidation: 6.00, // Per validation (post-paid)
  },
} as const;

// ============================================================================
// PREMIUM SERVICES
// ============================================================================

/**
 * Premium Services pricing and inclusion rules
 * ⚠️ UPDATED: CS Dedicado from R$197 to R$297
 * ⚠️ NEW RULES: K includes VIP, K2 includes VIP+CS
 */
export const PREMIUM_SERVICES = {
  vipSupport: {
    name: "Suporte VIP",
    monthlyPrice: 97, // Already ends in 7
    features: {
      responseTime: "15min",
      resolutionTime: "Até 8 horas úteis",
    },
    // Inclusion rules by plan tier
    includedIn: {
      prime: false, // Disabled by default
      k: true,      // ⚠️ NEW: Included automatically (no cost)
      k2: true,     // ⚠️ NEW: Included automatically (no cost)
    },
  },
  csDedicado: {
    name: "Customer Success Dedicado",
    monthlyPrice: 297, // ⚠️ UPDATED from 197 to 297
    features: {
      exclusiveWhatsApp: true,
      closeFollowUp: true,
      criticalIssues: true,
      bestPractices: true,
      internalFacilitation: true,
      valueGeneration: true,
    },
    // Inclusion rules by plan tier
    includedIn: {
      prime: false, // Disabled by default
      k: false,     // Disabled by default
      k2: true,     // ⚠️ NEW: Included automatically (no cost)
    },
  },
} as const;

/**
 * ⚠️ CROSS-PRODUCT BENEFIT RULE:
 * If client has VIP Support or CS Dedicado included in ANY product (IMOB or LOC),
 * the benefit applies to ALL Kenlo products used by the client.
 * 
 * Example: Client with IMOB K + LOC Prime → VIP Support included in both
 *          (because K from IMOB already includes it)
 */

/**
 * Training pricing (optional, not included by default except K2)
 */
export const TRAINING = {
  online: 2000, // Per training
  presencial: 3000, // Per training
} as const;

// ============================================================================
// KOMBOS
// ============================================================================

export type KomboType = "imob-start" | "imob-pro" | "loc-pro" | "core-gestao" | "elite" | "none";

export const KOMBOS = {
  "imob-start": {
    name: "Kombo Imob Start",
    structure: ["imob", "leads", "assinaturas"] as const,
    monthlyDiscount: 0.10, // 10% OFF all products/add-ons
    implementation: 1497,
    freeImplementations: ["leads"], // Leads impl. free (saves R$497)
    premiumServicesIncluded: true, // ⚠️ NEW: All Kombos include VIP + CS
  },
  "imob-pro": {
    name: "Kombo Imob Pro",
    structure: ["imob", "leads", "inteligencia", "assinaturas"] as const,
    monthlyDiscount: 0.15, // 15% OFF all products/add-ons
    implementation: 1497,
    freeImplementations: ["leads", "inteligencia"], // Saves R$994
    premiumServicesIncluded: true, // ⚠️ NEW: All Kombos include VIP + CS
  },
  "loc-pro": {
    name: "Kombo Locação Pro",
    structure: ["loc", "inteligencia", "assinaturas"] as const,
    monthlyDiscount: 0.10, // 10% OFF all products/add-ons
    implementation: 1497,
    freeImplementations: ["inteligencia"], // Saves R$497
    premiumServicesIncluded: true, // ⚠️ NEW: All Kombos include VIP + CS
  },
  "core-gestao": {
    name: "Kombo Core Gestão",
    structure: ["imob", "loc"] as const, // No add-ons
    monthlyDiscount: 0, // "Conforme tabela" = 0% discount on monthly
    implementation: 1497,
    freeImplementations: ["imob"], // IMOB impl. free (saves R$1.497)
    premiumServicesIncluded: true, // ⚠️ Already included, now explicit
  },
  elite: {
    name: "Kombo Elite",
    structure: ["imob", "loc", "leads", "inteligencia", "assinaturas"] as const,
    monthlyDiscount: 0.20, // 20% OFF all products/add-ons
    implementation: 1497,
    freeImplementations: ["imob", "leads", "inteligencia"], // Saves R$2.491
    premiumServicesIncluded: true, // ⚠️ Already included, now explicit
  },
} as const;

/**
 * ⚠️ IMPORTANT: ALL 5 KOMBOS now include Premium Services (VIP + CS Dedicado)
 * Previously only Core Gestão and Elite included them.
 */

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

    const tierSize = tier.to - tier.from + 1;
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
  imobPlan: keyof typeof IMOB_PLANS | null,
  locPlan: keyof typeof LOC_PLANS | null,
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

  // Cross-product benefit: if included in ANY product, applies to ALL
  // (This is already covered by the checks above, but made explicit for clarity)

  return false;
}
