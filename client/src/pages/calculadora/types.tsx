/**
 * Kenlo Calculadora - Types and Constants
 * Extracted from CalculadoraPage.tsx for better modularity
 */

import * as Pricing from "@/utils/pricing";
import type { CRMSystem, ERPSystem } from "@/constants/systems";
import React from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
export type ProductSelection = "imob" | "loc" | "both";
export type PlanTier = "prime" | "k" | "k2";
export type PaymentFrequency = "monthly" | "semestral" | "annual" | "biennial";
export type KomboType = "imob_start" | "imob_pro" | "locacao_pro" | "core_gestao" | "elite" | "none";
export type BusinessType = "broker" | "rental_admin" | "both";

export interface BusinessNatureState {
  businessType: BusinessType;
  companyName: string;
  ownerName: string;
  email: string;
  cellphone: string;
  landline: string;
  hasWebsite: boolean | null;
  websiteUrl: string;
  hasCRM: boolean | null;
  crmSystem: CRMSystem | "";
  crmOther: string;
  hasERP: boolean | null;
  erpSystem: ERPSystem | "";
  erpOther: string;
}

export interface MetricsState {
  imobUsers: number | "";
  closingsPerMonth: number | "";
  leadsPerMonth: number | "";
  usesExternalAI: boolean;
  externalAIName: string;
  wantsWhatsApp: boolean;
  imobVipSupport: boolean;
  imobDedicatedCS: boolean;
  contractsUnderManagement: number | "";
  newContractsPerMonth: number | "";
  locVipSupport: boolean;
  locDedicatedCS: boolean;
  chargesBoletoToTenant: boolean;
  boletoChargeAmount: number;
  chargesSplitToOwner: boolean;
  splitChargeAmount: number;
}

export interface AddonsState {
  leads: boolean;
  inteligencia: boolean;
  assinatura: boolean;
  pay: boolean;
  seguros: boolean;
  cash: boolean;
}

// ─── Kombo Definitions ──────────────────────────────────────────────────────
/**
 * KOMBO DEFINITIONS
 * 
 * includesPremiumServices: true = VIP Support + CS Dedicado INCLUDED in Kombo price
 * All 5 Kombos include VIP + CS Dedicado
 * freeImplementations: lista de implantações gratuitas no Kombo
 */
export const KOMBOS = {
  imob_start: {
    name: "Kombo Imob Start",
    description: "IMOB + Leads + Assinaturas",
    discount: 0.10,
    implantationDiscount: 0,
    requiredProducts: ["imob"] as ProductSelection[],
    requiredAddons: ["leads", "assinatura"],
    forbiddenAddons: ["inteligencia"],
    includesPremiumServices: true,
    freeImplementations: ["leads"],
  },
  imob_pro: {
    name: "Kombo Imob Pro",
    description: "IMOB + Leads + Inteligência + Assinatura",
    discount: 0.15,
    implantationDiscount: 0,
    requiredProducts: ["imob"] as ProductSelection[],
    requiredAddons: ["leads", "inteligencia", "assinatura"],
    includesPremiumServices: true,
    freeImplementations: ["leads", "inteligencia"],
  },
  locacao_pro: {
    name: "Kombo Locação Pro",
    description: "LOC + Inteligência + Assinatura",
    discount: 0.10,
    implantationDiscount: 0,
    requiredProducts: ["loc"] as ProductSelection[],
    requiredAddons: ["inteligencia", "assinatura"],
    forbiddenAddons: ["leads"],
    includesPremiumServices: true,
    freeImplementations: ["inteligencia"],
  },
  core_gestao: {
    name: "Kombo Core Gestão",
    description: "IMOB + LOC sem add-ons",
    discount: 0,
    implantationDiscount: 0,
    requiredProducts: ["both"] as ProductSelection[],
    requiredAddons: [],
    maxAddons: 0,
    includesPremiumServices: true,
    freeImplementations: ["imob"],
  },
  elite: {
    name: "Kombo Elite",
    description: "IMOB + LOC + Todos Add-ons",
    discount: 0.20,
    implantationDiscount: 0,
    requiredProducts: ["both"] as ProductSelection[],
    requiredAddons: ["leads", "inteligencia", "assinatura", "pay", "seguros"],
    includesPremiumServices: true,
    freeImplementations: ["imob", "leads", "inteligencia"],
  },
};

// ─── Pricing Constants ──────────────────────────────────────────────────────
export const PLAN_ANNUAL_PRICES = Pricing.PLAN_ANNUAL_PRICES;
export const ADDON_ANNUAL_PRICES = Pricing.ADDON_ANNUAL_PRICES;
export const IMPLEMENTATION_COSTS = Pricing.IMPLEMENTATION_COSTS;

export const PAYMENT_FREQUENCY_MULTIPLIERS = {
  monthly: Pricing.getFrequencyMultiplier('monthly'),
  semestral: Pricing.getFrequencyMultiplier('semiannual'),
  annual: Pricing.getFrequencyMultiplier('annual'),
  biennial: Pricing.getFrequencyMultiplier('biennial'),
};

// ─── Utility Functions ──────────────────────────────────────────────────────
export const roundToEndIn7 = (price: number): number => {
  return Pricing.roundPrice(price);
};

export const calculateAdditionalUsersCost = (plan: PlanTier, additionalUsers: number): number => {
  return Pricing.calculateAdditionalUsersCost(plan, additionalUsers);
};

/** Convert empty string metrics to numbers for calculations */
export const toNum = (val: number | string): number => {
  if (typeof val === "number") return val;
  if (val === "" || val == null) return 0;
  const cleaned = String(val).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/** Validate and parse integer-only input */
export const parseIntegerInput = (value: string, min: number = 0): number | "" => {
  if (value === "") return "";
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (cleaned === "") return "";
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return "";
  return Math.max(min, Math.round(parsed));
};

/** Parse currency string to number */
export const parseCurrency = (value: string): number => {
  const cleaned = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/** Format number as BRL currency */
import { formatCurrency as _formatCurrency, fmtNumFromAny } from "@shared/formatters";
export const formatCurrency = _formatCurrency;

/** Format number with thousands separator (pt-BR) */
export const fmtNum = fmtNumFromAny;

/** Format price with comma decimal (e.g., 37,00) */
export const fmtPrice = (value: number): string => {
  return value.toFixed(2).replace('.', ',');
};

/** Highlight plan names in JSX */
export const highlightPlanName = (name: string): React.ReactNode => {
  const parts = name.split(' - ');
  if (parts.length === 2) {
    return (
      <>
        {parts[0]} - <span className="text-foreground font-bold">{parts[1]}</span>
      </>
    );
  }
  return name;
};

/** Check if email is from authorized domain */
export const isAuthorizedEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const authorizedDomains = ['@kenlo.com.br', '@i-value.com.br', '@laik.com.br'];
  return authorizedDomains.some(domain => email.toLowerCase().endsWith(domain));
};

// ─── Line Item Type ─────────────────────────────────────────────────────────
export interface LineItem {
  name: string;
  monthlyRefSemKombo: number;
  monthlyRefComKombo: number;
  priceSemKombo: number;
  priceComKombo: number;
  implantation?: number;
}

// ─── Frequency Labels ──────────────────────────────────────────────────────
export const frequencyLabels: Record<PaymentFrequency, string> = {
  monthly: "Mensal",
  semestral: "Semestral",
  annual: "Anual",
  biennial: "Bienal",
};

export const frequencyBadges: Record<PaymentFrequency, string> = {
  monthly: "Referência",
  semestral: "10% OFF",
  annual: "20% OFF",
  biennial: "30% OFF",
};

export const frequencyInstallments: Record<PaymentFrequency, string> = {
  monthly: "",
  semestral: "até 2x",
  annual: "até 3x",
  biennial: "até 6x",
};

/** Prepaid pricing constants (flat rate, any plan, any volume) */
export const PREPAID_USER_PRICE_PER_MONTH = 34;
export const PREPAID_CONTRACT_PRICE_PER_MONTH = 2.20;

/** Get prepaid period in months based on frequency */
export const getPrepaidMonths = (freq: PaymentFrequency): number => {
  switch (freq) {
    case 'annual': return 12;
    case 'biennial': return 24;
    default: return 0;
  }
};

/** Check if prepaid option is available for a given frequency */
export const isPrepaidAvailable = (freq: PaymentFrequency): boolean => {
  return freq === 'annual' || freq === 'biennial';
};

// ─── Default States ─────────────────────────────────────────────────────────
export const DEFAULT_BUSINESS_NATURE: BusinessNatureState = {
  businessType: "broker",
  companyName: "",
  ownerName: "",
  email: "",
  cellphone: "",
  landline: "",
  hasWebsite: null,
  websiteUrl: "",
  hasCRM: null,
  crmSystem: "",
  crmOther: "",
  hasERP: null,
  erpSystem: "",
  erpOther: "",
};

export const DEFAULT_METRICS: MetricsState = {
  imobUsers: "",
  closingsPerMonth: "",
  leadsPerMonth: "",
  usesExternalAI: false,
  externalAIName: "",
  wantsWhatsApp: false,
  imobVipSupport: false,
  imobDedicatedCS: false,
  contractsUnderManagement: "",
  newContractsPerMonth: "",
  locVipSupport: false,
  locDedicatedCS: false,
  chargesBoletoToTenant: false,
  boletoChargeAmount: 0,
  chargesSplitToOwner: false,
  splitChargeAmount: 0,
};

export const DEFAULT_ADDONS: AddonsState = {
  leads: true,
  inteligencia: true,
  assinatura: true,
  pay: true,
  seguros: true,
  cash: true,
};

export const RESET_ADDONS: AddonsState = {
  leads: false,
  inteligencia: false,
  assinatura: false,
  pay: false,
  seguros: false,
  cash: false,
};

export const RESET_METRICS: MetricsState = {
  imobUsers: 1,
  closingsPerMonth: 1,
  leadsPerMonth: 0,
  usesExternalAI: false,
  externalAIName: "",
  wantsWhatsApp: false,
  imobVipSupport: false,
  imobDedicatedCS: false,
  contractsUnderManagement: 1,
  newContractsPerMonth: 1,
  locVipSupport: false,
  locDedicatedCS: false,
  chargesBoletoToTenant: false,
  boletoChargeAmount: 0,
  chargesSplitToOwner: false,
  splitChargeAmount: 0,
};
