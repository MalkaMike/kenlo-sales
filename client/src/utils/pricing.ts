/**
 * Calculator Pricing Utilities
 * Adapter layer between centralized pricing config and calculator UI
 * 
 * This file provides calculator-specific functions using the centralized pricing config
 * as the single source of truth, while maintaining the API expected by the calculator UI.
 */

import {
  FREQUENCY_MULTIPLIERS,
  IMOB_PLANS,
  LOC_PLANS,
  IMOB_IMPLEMENTATION,
  LOC_IMPLEMENTATION,
  IMOB_ADDITIONAL_USERS,
  LOC_ADDITIONAL_CONTRACTS,
  PAY_BOLETOS,
  PAY_SPLITS,
  SEGUROS_COMMISSION,
  SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT,
  ADDONS,
  PREMIUM_SERVICES,
  KOMBOS,
  roundToSeven,
  calculatePrice,
  calculateTieredPrice,
  detectKombo as detectKomboFromConfig,
  shouldIncludePremiumService,
  type PaymentFrequency,
  type KomboType as ConfigKomboType,
} from "@shared/pricing-config";

// ============================================================================
// TYPE MAPPINGS (Calculator types → Config types)
// ============================================================================

type CalculatorPlanTier = "prime" | "k" | "k2";
type CalculatorKomboType = "imob_start" | "imob_pro" | "locacao_pro" | "core_gestao" | "elite" | "none";

/**
 * Map calculator's Kombo type to config's Kombo type
 */
function mapKomboType(calcType: CalculatorKomboType): ConfigKomboType {
  const mapping: Record<CalculatorKomboType, ConfigKomboType> = {
    "imob_start": "imob-start",
    "imob_pro": "imob-pro",
    "locacao_pro": "loc-pro",
    "core_gestao": "core-gestao",
    "elite": "elite",
    "none": "none",
  };
  return mapping[calcType];
}

/**
 * Map config's Kombo type to calculator's Kombo type
 */
function mapKomboTypeReverse(configType: ConfigKomboType): CalculatorKomboType {
  const mapping: Record<ConfigKomboType, CalculatorKomboType> = {
    "imob-start": "imob_start",
    "imob-pro": "imob_pro",
    "loc-pro": "locacao_pro",
    "core-gestao": "core_gestao",
    "elite": "elite",
    "none": "none",
  };
  return mapping[configType];
}

// ============================================================================
// PLAN PRICING
// ============================================================================

/**
 * Get annual price for a plan (IMOB or LOC)
 */
export function getPlanAnnualPrice(product: "imob" | "loc", tier: CalculatorPlanTier): number {
  const plans = product === "imob" ? IMOB_PLANS : LOC_PLANS;
  return plans[tier].annualPrice;
}

/**
 * Get price for a plan at a specific frequency
 */
export function getPlanPrice(
  product: "imob" | "loc",
  tier: CalculatorPlanTier,
  frequency: PaymentFrequency
): number {
  const annualPrice = getPlanAnnualPrice(product, tier);
  return calculatePrice(annualPrice, frequency);
}

/**
 * Get implementation cost for a product
 */
export function getImplementationCost(product: "imob" | "loc"): number {
  return product === "imob" ? IMOB_IMPLEMENTATION : LOC_IMPLEMENTATION;
}

/**
 * Get included users/contracts for a plan
 */
export function getIncludedQuantity(product: "imob" | "loc", tier: CalculatorPlanTier): number {
  if (product === "imob") {
    return IMOB_PLANS[tier].includedUsers;
  } else {
    return LOC_PLANS[tier].includedContracts;
  }
}

// ============================================================================
// ADD-ON PRICING
// ============================================================================

/**
 * Get annual price for an add-on
 */
export function getAddonAnnualPrice(addon: "leads" | "inteligencia" | "assinatura"): number {
  const addonKey = addon === "assinatura" ? "assinaturas" : addon;
  return ADDONS[addonKey as keyof typeof ADDONS].annualPrice;
}

/**
 * Get price for an add-on at a specific frequency
 */
export function getAddonPrice(
  addon: "leads" | "inteligencia" | "assinatura",
  frequency: PaymentFrequency
): number {
  const annualPrice = getAddonAnnualPrice(addon);
  return calculatePrice(annualPrice, frequency);
}

/**
 * Get implementation cost for an add-on
 */
export function getAddonImplementationCost(addon: "leads" | "inteligencia" | "assinatura"): number {
  const addonKey = addon === "assinatura" ? "assinaturas" : addon;
  return ADDONS[addonKey as keyof typeof ADDONS].implementation;
}

// ============================================================================
// TIERED PRICING (Post-Paid)
// ============================================================================

/**
 * Calculate cost of additional users (IMOB)
 */
export function calculateAdditionalUsersCost(
  tier: CalculatorPlanTier,
  additionalUsers: number
): number {
  const tiers = IMOB_ADDITIONAL_USERS[tier];
  return calculateTieredPrice(additionalUsers, tiers);
}

/**
 * Calculate cost of additional contracts (LOC)
 */
export function calculateAdditionalContractsCost(
  tier: CalculatorPlanTier,
  additionalContracts: number
): number {
  const tiers = LOC_ADDITIONAL_CONTRACTS[tier];
  return calculateTieredPrice(additionalContracts, tiers);
}

/**
 * Calculate cost of Kenlo Pay Boletos
 */
export function calculateBoletosCost(
  tier: CalculatorPlanTier,
  quantity: number
): number {
  const tiers = PAY_BOLETOS[tier];
  return calculateTieredPrice(quantity, tiers);
}

/**
 * Calculate cost of Kenlo Pay Splits
 */
export function calculateSplitsCost(
  tier: CalculatorPlanTier,
  quantity: number
): number {
  const tiers = PAY_SPLITS[tier];
  return calculateTieredPrice(quantity, tiers);
}

/**
 * Get Seguros commission percentage
 */
export function getSegurosCommission(tier: CalculatorPlanTier): number {
  return SEGUROS_COMMISSION[tier];
}

/**
 * Get estimated revenue per contract/month from Seguros
 */
export function getSegurosEstimatedRevenuePerContract(): number {
  return SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT;
}

/**
 * Get tier pricing array for additional users (IMOB)
 */
export function getAdditionalUsersTiers(tier: CalculatorPlanTier) {
  return IMOB_ADDITIONAL_USERS[tier];
}

/**
 * Get tier pricing array for additional contracts (LOC)
 */
export function getAdditionalContractsTiers(tier: CalculatorPlanTier) {
  return LOC_ADDITIONAL_CONTRACTS[tier];
}

/**
 * Get tier pricing array for boletos (Pay)
 */
export function getBoletosTiers(tier: CalculatorPlanTier) {
  return PAY_BOLETOS[tier];
}

/**
 * Get tier pricing array for splits (Pay)
 */
export function getSplitsTiers(tier: CalculatorPlanTier) {
  return PAY_SPLITS[tier];
}

/**
 * Get tier pricing array for additional signatures (Assinaturas)
 */
export function getAdditionalSignaturesTiers() {
  return ADDONS.assinaturas.additionalSignaturesTiers;
}

/**
 * Get tier pricing array for additional WhatsApp leads
 */
export function getAdditionalWhatsAppLeadsTiers() {
  return ADDONS.leads.additionalLeadsTiers;
}

/**
 * Get biometric validation price
 */
export function getBiometricValidationPrice(): number {
  return ADDONS.assinaturas.biometricValidation;
}

/**
 * Calculate cost of additional signatures (Assinaturas)
 */
export function calculateAdditionalSignaturesCost(additionalSignatures: number): number {
  return calculateTieredPrice(additionalSignatures, ADDONS.assinaturas.additionalSignaturesTiers);
}

/**
 * Get included signatures per month
 */
export function getIncludedSignatures(): number {
  return ADDONS.assinaturas.includedSignatures;
}

/**
 * Calculate cost of additional leads (Leads)
 */
export function calculateAdditionalLeadsCost(additionalLeads: number): number {
  return calculateTieredPrice(additionalLeads, ADDONS.leads.additionalLeadsTiers);
}

/**
 * Get included WhatsApp leads per month
 */
export function getIncludedWhatsAppLeads(): number {
  return ADDONS.leads.includedWhatsAppLeads;
}

/**
 * Calculate cost of additional WhatsApp leads (same tiers as Leads)
 */
export function calculateAdditionalWhatsAppLeadsCost(additionalLeads: number): number {
  return calculateTieredPrice(additionalLeads, ADDONS.leads.additionalLeadsTiers);
}

/**
 * Get base price for additional users (first tier) for a plan
 */
export function getAdditionalUserBasePrice(tier: CalculatorPlanTier): number {
  return IMOB_ADDITIONAL_USERS[tier][0].price;
}

/**
 * Get base price for additional contracts (first tier)
 */
export function getAdditionalContractBasePrice(): number {
  return LOC_ADDITIONAL_CONTRACTS.prime[0].price;
}

/**
 * Get base price for boletos (first tier)
 */
export function getBoletoBasePrice(): number {
  return PAY_BOLETOS.prime[0].price;
}

/**
 * Get base price for signatures (first tier)
 */
export function getSignatureBasePrice(): number {
  return ADDONS.assinaturas.additionalSignaturesTiers[0].price;
}

/**
 * Get base price for WhatsApp leads (first tier)
 */
export function getWhatsAppBasePrice(): number {
  return ADDONS.leads.additionalLeadsTiers[0].price;
}

// ============================================================================
// PREMIUM SERVICES
// ============================================================================

/**
 * Get monthly price for VIP Support
 */
export function getVipSupportPrice(): number {
  return PREMIUM_SERVICES.vipSupport.monthlyPrice;
}

/**
 * Get monthly price for CS Dedicado
 */
export function getCSDedicadoPrice(): number {
  return PREMIUM_SERVICES.csDedicado.monthlyPrice;
}

/**
 * Check if VIP Support should be included for a plan tier
 */
export function isVipSupportIncluded(tier: CalculatorPlanTier): boolean {
  return PREMIUM_SERVICES.vipSupport.includedIn[tier];
}

/**
 * Check if CS Dedicado should be included for a plan tier
 */
export function isCSDedicadoIncluded(tier: CalculatorPlanTier): boolean {
  return PREMIUM_SERVICES.csDedicado.includedIn[tier];
}

/**
 * Check if Premium Services should be included based on plans and Kombo
 */
export function shouldIncludePremium(
  service: "vipSupport" | "csDedicado",
  imobPlan: CalculatorPlanTier | null,
  locPlan: CalculatorPlanTier | null,
  activeKombo: CalculatorKomboType
): boolean {
  const configKombo = mapKomboType(activeKombo);
  return shouldIncludePremiumService(service, imobPlan, locPlan, configKombo);
}

// ============================================================================
// KOMBOS
// ============================================================================

/**
 * Get Kombo configuration
 */
export function getKomboConfig(komboType: CalculatorKomboType) {
  if (komboType === "none") return null;
  const configType = mapKomboType(komboType);
  if (configType === "none") return null;
  return KOMBOS[configType];
}

/**
 * Get Kombo monthly discount percentage
 */
export function getKomboDiscount(komboType: CalculatorKomboType): number {
  const config = getKomboConfig(komboType);
  return config?.monthlyDiscount ?? 0;
}

/**
 * Get Kombo implementation cost
 */
export function getKomboImplementationCost(komboType: CalculatorKomboType): number {
  const config = getKomboConfig(komboType);
  return config?.implementation ?? 0;
}

/**
 * Check if Kombo includes Premium Services
 */
export function komboIncludesPremiumServices(komboType: CalculatorKomboType): boolean {
  const config = getKomboConfig(komboType);
  return config?.premiumServicesIncluded ?? false;
}

/**
 * Get list of free implementations for a Kombo
 */
export function getKomboFreeImplementations(komboType: CalculatorKomboType): readonly string[] {
  const config = getKomboConfig(komboType);
  return config?.freeImplementations ?? [];
}

/**
 * Detect active Kombo based on selection
 */
export function detectActiveKombo(selection: {
  imob: boolean;
  loc: boolean;
  leads: boolean;
  inteligencia: boolean;
  assinaturas: boolean;
}): CalculatorKomboType {
  const configKombo = detectKomboFromConfig(selection);
  return mapKomboTypeReverse(configKombo);
}

// ============================================================================
// FREQUENCY HELPERS
// ============================================================================

/**
 * Get frequency multiplier
 */
export function getFrequencyMultiplier(frequency: PaymentFrequency): number {
  return FREQUENCY_MULTIPLIERS[frequency];
}

/**
 * Calculate price for any annual price at a specific frequency
 */
export function applyFrequency(annualPrice: number, frequency: PaymentFrequency): number {
  return calculatePrice(annualPrice, frequency);
}

// ============================================================================
// ROUNDING
// ============================================================================

/**
 * Round price to end in 7 (for pre-paid prices only)
 */
export function roundPrice(price: number): number {
  return roundToSeven(price);
}

// ============================================================================
// LEGACY CONSTANTS (for backward compatibility)
// ============================================================================

/**
 * @deprecated Use getPlanAnnualPrice() instead
 */
export const PLAN_ANNUAL_PRICES = {
  prime: IMOB_PLANS.prime.annualPrice,
  k: IMOB_PLANS.k.annualPrice,
  k2: IMOB_PLANS.k2.annualPrice,
};

/**
 * @deprecated Use getAddonAnnualPrice() instead
 */
export const ADDON_ANNUAL_PRICES = {
  leads: ADDONS.leads.annualPrice,
  inteligencia: ADDONS.inteligencia.annualPrice,
  assinatura: ADDONS.assinaturas.annualPrice,
  pay: 0, // Post-paid
  seguros: 0, // Post-paid
};

/**
 * @deprecated Use getImplementationCost() or getAddonImplementationCost() instead
 */
export const IMPLEMENTATION_COSTS = {
  imob: IMOB_IMPLEMENTATION,
  loc: LOC_IMPLEMENTATION,
  leads: ADDONS.leads.implementation,
  inteligencia: ADDONS.inteligencia.implementation,
  assinatura: ADDONS.assinaturas.implementation,
  cash: 0,
  combo: IMOB_IMPLEMENTATION, // Kombo implementation = single product implementation
};

/**
 * Calculate prepaid leads cost (R$1.30/lead/month for annual/biennial plans)
 * @param totalLeads - Total number of leads per month
 * @param frequency - Payment frequency (annual or biennial)
 * @returns Monthly cost for prepaid leads
 */
export function calculatePrepaidLeads(totalLeads: number, frequency: PaymentFrequency): number {
  if (frequency !== "annual" && frequency !== "biennial") return 0;
  const monthlyPricePerLead = 1.30;
  return totalLeads * monthlyPricePerLead;
}
