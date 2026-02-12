/**
 * Kombo Comparison Table Component
 * 
 * Displays a comparison table showing prices for:
 * - Sua Seleção (no discount) — editable cycle, read-only plan/addons
 * - Compatible Kombos with their respective discounts
 * - Custom scenario columns the user can build from scratch (no Kombo base)
 * 
 * Features:
 * - Per-column payment cycle selector (each column independent, including Sua Seleção)
 * - Per-column plan & add-on selection (clickable cells) for Kombo and Custom columns
 * - Custom scenario columns with full configurator (no Kombo discount)
 * - Editable titles for custom scenario columns (max 11 chars)
 * - Suporte VIP & CS Dedicado toggleable in custom scenarios
 * - Auto-highlight recommended Kombo based on user selections
 * - Smooth transition animation when product type changes
 * - Contextual banner showing available Kombos
 * - Cycle row placed below Anual row
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Info, CheckCircle2, Sparkles, Building2, Home, Layers, ChevronDown, Plus, X, Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================================================
// TYPES
// ============================================================================

type ProductSelection = "imob" | "loc" | "both";
type PlanTier = "prime" | "k" | "k2";
type PaymentFrequency = "monthly" | "semestral" | "annual" | "biennial";

interface KomboComparisonProps {
  // User selections from calculator
  product: ProductSelection;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  addons: {
    leads: boolean;
    inteligencia: boolean;
    assinatura: boolean;
    pay: boolean;
    seguros: boolean;
    cash: boolean;
  };
  frequency: PaymentFrequency;
  // WhatsApp (linked to Leads, post-paid)
  wantsWhatsApp: boolean;
  // Premium services
  vipSupport: boolean;
  dedicatedCS: boolean;
  // Callback when user selects a plan
  onPlanSelected?: (planId: KomboId | null) => void;
  // Callback when user changes frequency in the comparison table
  onFrequencyChange?: (frequency: PaymentFrequency) => void;
}

type KomboId = "none" | "imob_start" | "imob_pro" | "locacao_pro" | "core_gestao" | "elite";
// Column identifier: KomboId for standard columns, or "custom_N" for custom scenarios
type ColumnId = KomboId | string;
type ViewMode = "monthly" | "semestral" | "annual" | "biennial";

// Per-column override state for independent configurator behavior
interface ColumnOverrides {
  frequency: PaymentFrequency;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  addons: {
    leads: boolean;
    inteligencia: boolean;
    assinatura: boolean;
    pay: boolean;
    seguros: boolean;
    cash: boolean;
  };
  // Custom columns: toggleable premium services
  vipSupport?: boolean;
  dedicatedCS?: boolean;
  training?: boolean;
}

// Frequency options for the per-column selector
const FREQUENCY_OPTIONS: { id: ViewMode; label: string; shortLabel: string; discount: string }[] = [
  { id: "monthly", label: "Mensal", shortLabel: "Mensal", discount: "Ref." },
  { id: "semestral", label: "Semestral", shortLabel: "Sem.", discount: "−10%" },
  { id: "annual", label: "Anual", shortLabel: "Anual", discount: "−20%" },
  { id: "biennial", label: "Bienal", shortLabel: "Bienal", discount: "−28%" },
];

// Plan tiers for clickable cycling
const PLAN_TIERS: PlanTier[] = ["prime", "k", "k2"];

interface KomboColumnData {
  id: ColumnId;
  name: string;
  shortName: string;
  discount: number; // 0.10 = 10%
  isAvailable: boolean;
  isRecommended: boolean;
  isCustom: boolean; // true for custom scenario columns
  // Prices for each row
  imobPrice: number | null; // null = not included
  locPrice: number | null;
  leadsPrice: number | null;
  whatsAppPrice: string | null; // "Pós-pago" or null
  inteligenciaPrice: number | null;
  assinaturaPrice: number | null;
  payPrice: string | null; // "Pós-pago" or null
  segurosPrice: string | null;
  cashPrice: string | null; // "Grátis" or null
  vipSupportPrice: number | string | null; // number, "Incluído", or null
  dedicatedCSPrice: number | string | null;
  trainingPrice: number | string | null;
  // Subscription count (products + add-ons, excluding premium services)
  subscriptionCount: number;
  // Implementation breakdown per item
  implBreakdown: { label: string; cost: number; free: boolean }[];
  // Totals
  totalMonthly: number;
  theoreticalImplementation: number;
  implementation: number;
  annualEquivalent: number;
  // Cycle-based total (totalMonthly * cycleMonths + implementation)
  cycleTotalValue: number;
  cycleMonths: number;
  // Per-column overrides (for display in UI)
  overrides?: ColumnOverrides;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PLAN_ANNUAL_PRICES: Record<PlanTier, number> = {
  prime: 247,
  k: 497,
  k2: 1197,
};

const ADDON_ANNUAL_PRICES = {
  leads: 497,
  inteligencia: 297,
  assinatura: 37,
  pay: 0,
  seguros: 0,
  cash: 0,
};

const IMPLEMENTATION_COSTS = {
  imob: 1497,
  loc: 1497,
  leads: 497,
  inteligencia: 497,
  assinatura: 0,
  cash: 0,
  combo: 1497,
};

const PREMIUM_SERVICES_ANNUAL_PRICES = {
  vipSupport: 97,
  dedicatedCS: 297,
  training: 166, // R$166/mês (anual) per training — 2 trainings per product selected
};

const PAYMENT_FREQUENCY_MULTIPLIERS: Record<PaymentFrequency, number> = {
  monthly: 1.25,
  semestral: 1.1111,
  annual: 1.0,
  biennial: 0.90,
};

const CYCLE_MONTHS: Record<PaymentFrequency, number> = {
  monthly: 1,
  semestral: 6,
  annual: 12,
  biennial: 24,
};

const CYCLE_LABELS: Record<PaymentFrequency, string> = {
  monthly: "Mensal",
  semestral: "Semestral",
  annual: "Anual",
  biennial: "Bienal",
};

// Kombo definitions with their rules
const KOMBO_DEFINITIONS = {
  imob_start: {
    name: "Kombo Imob Start",
    shortName: "Imob Start",
    discount: 0.10,
    products: ["imob"] as ProductSelection[],
    includedAddons: ["leads", "assinatura"],
    includesPremiumServices: false,
    includesTraining: false,
    freeImplementations: ["leads"],
    tooltipInfo: {
      description: "Ideal para imobiliárias focadas em vendas",
      includes: ["Imob", "Leads", "Assinatura"],
      discountText: "10% OFF em todos produtos e add-ons",
      premiumServices: "Não inclui (pagar à parte)",
      implementation: "R$ 1.497 (Leads grátis)",
    },
  },
  imob_pro: {
    name: "Kombo Imob Pro",
    shortName: "Imob Pro",
    discount: 0.15,
    products: ["imob"] as ProductSelection[],
    includedAddons: ["leads", "inteligencia", "assinatura"],
    includesPremiumServices: true,
    includesTraining: true,
    freeImplementations: ["leads", "inteligencia"],
    tooltipInfo: {
      description: "Solução completa para vendas com BI",
      includes: ["Imob", "Leads", "Inteligência", "Assinatura"],
      discountText: "15% OFF em todos produtos e add-ons",
      premiumServices: "VIP + CS Dedicado incluídos",
      implementation: "R$ 1.497 (Leads + Intel grátis)",
    },
  },
  locacao_pro: {
    name: "Kombo Locação Pro",
    shortName: "Loc Pro",
    discount: 0.10,
    products: ["loc"] as ProductSelection[],
    includedAddons: ["inteligencia", "assinatura"],
    includesPremiumServices: true,
    includesTraining: true,
    freeImplementations: ["inteligencia"],
    tooltipInfo: {
      description: "Ideal para gestão de locações com BI",
      includes: ["Locação", "Inteligência", "Assinatura"],
      discountText: "10% OFF em todos produtos e add-ons",
      premiumServices: "VIP + CS Dedicado incluídos",
      implementation: "R$ 1.497 (Intel grátis)",
    },
  },
  core_gestao: {
    name: "Kombo Core Gestão",
    shortName: "Core Gestão",
    discount: 0,
    products: ["both"] as ProductSelection[],
    includedAddons: [] as string[],
    includesPremiumServices: true,
    includesTraining: false,
    freeImplementations: ["imob"],
    tooltipInfo: {
      description: "IMOB + LOC sem add-ons",
      includes: ["Imob", "Locação"],
      discountText: "Desconto conforme tabela",
      premiumServices: "VIP + CS Dedicado incluídos",
      implementation: "R$ 1.497 (IMOB grátis)",
    },
  },
  elite: {
    name: "Kombo Elite",
    shortName: "Elite",
    discount: 0.20,
    products: ["both"] as ProductSelection[],
    includedAddons: ["leads", "inteligencia", "assinatura", "pay", "seguros", "cash"],
    includesPremiumServices: true,
    includesTraining: true,
    freeImplementations: ["imob", "leads", "inteligencia"],
    tooltipInfo: {
      description: "Solução completa com todos os produtos",
      includes: ["Imob", "Locação", "Todos Add-ons"],
      discountText: "20% OFF em todos produtos e add-ons",
      premiumServices: "VIP + CS Dedicado incluídos",
      implementation: "R$ 1.497 (IMOB + Leads + Intel grátis)",
    },
  },
};

const MAX_CUSTOM_COLUMNS = 3;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const roundToEndIn7 = (price: number): number => {
  if (price < 100) return Math.round(price);
  const lastDigit = price % 10;
  if (lastDigit === 7) return price;
  if (lastDigit < 7) return price - lastDigit + 7;
  return price - lastDigit + 17;
};

const calculatePrice = (annualPrice: number, frequency: PaymentFrequency): number => {
  const multiplier = PAYMENT_FREQUENCY_MULTIPLIERS[frequency];
  return roundToEndIn7(Math.round(annualPrice * multiplier));
};

const applyDiscount = (price: number, discount: number): number => {
  if (discount === 0) return price;
  return Math.round(price * (1 - discount));
};

const formatCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const isPremiumIncludedInPlan = (plan: PlanTier): boolean => {
  return plan === "k" || plan === "k2";
};

const getRecommendedKombo = (
  product: ProductSelection,
  addons: KomboComparisonProps["addons"]
): KomboId => {
  if (
    product === "both" &&
    addons.leads && addons.inteligencia && addons.assinatura &&
    addons.pay && addons.seguros && addons.cash
  ) return "elite";

  if (
    product === "both" &&
    !addons.leads && !addons.inteligencia && !addons.assinatura &&
    !addons.pay && !addons.seguros && !addons.cash
  ) return "core_gestao";

  if (product === "imob" && addons.leads && addons.inteligencia && addons.assinatura)
    return "imob_pro";

  if (product === "imob" && addons.leads && addons.assinatura && !addons.inteligencia)
    return "imob_start";

  if (product === "loc" && addons.inteligencia && addons.assinatura)
    return "locacao_pro";

  return "none";
};

const isKomboAvailable = (komboId: KomboId, product: ProductSelection): boolean => {
  if (komboId === "none") return true;
  const kombo = KOMBO_DEFINITIONS[komboId];
  return kombo.products.includes(product) ||
    (kombo.products.includes("both" as ProductSelection) && product === "both");
};

// Calculate premium service price with frequency discount
const calculatePremiumPrice = (annualPrice: number, frequency: PaymentFrequency): number => {
  const multiplier = PAYMENT_FREQUENCY_MULTIPLIERS[frequency];
  return Math.round(annualPrice * multiplier);
};

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate all data for a single Kombo column with optional overrides
 */
const calculateKomboColumn = (
  komboId: KomboId,
  props: KomboComparisonProps,
  recommendedKombo: KomboId,
  overrides?: ColumnOverrides
): KomboColumnData => {
  // Use overrides if provided, otherwise use props
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

  // WhatsApp: "Pós-pago" if Kombo includes leads (WhatsApp is tied to Leads)
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

  // Training: show "Incluído" if Kombo includes training, otherwise check K2
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

  // Build implementation breakdown
  const implBreakdown: { label: string; cost: number; free: boolean }[] = [];
  if (komboIncludesImob) implBreakdown.push({ label: "Imob", cost: IMPLEMENTATION_COSTS.imob, free: true });
  if (komboIncludesLoc) implBreakdown.push({ label: "Locação", cost: IMPLEMENTATION_COSTS.loc, free: true });
  if (kombo.includedAddons.includes("leads")) implBreakdown.push({ label: "Leads", cost: IMPLEMENTATION_COSTS.leads, free: true });
  if (kombo.includedAddons.includes("inteligencia")) implBreakdown.push({ label: "Inteligência", cost: IMPLEMENTATION_COSTS.inteligencia, free: true });

  const cycleMonths = CYCLE_MONTHS[frequency];
  const cycleTotalValue = totalMonthly * cycleMonths + implementation;

  let subscriptionCount = 0;
  if (imobPrice !== null) subscriptionCount++;
  if (locPrice !== null) subscriptionCount++;
  if (leadsPrice !== null) subscriptionCount++;
  if (inteligenciaPrice !== null) subscriptionCount++;
  if (assinaturaPrice !== null) subscriptionCount++;

  return {
    id: komboId, name: kombo.name, shortName: kombo.shortName, discount,
    isAvailable, isRecommended, isCustom: false,
    imobPrice, locPrice, leadsPrice, whatsAppPrice, inteligenciaPrice, assinaturaPrice,
    payPrice, segurosPrice, cashPrice, vipSupportPrice, dedicatedCSPrice, trainingPrice,
    implBreakdown, subscriptionCount, totalMonthly, theoreticalImplementation, implementation,
    annualEquivalent, cycleTotalValue, cycleMonths,
    overrides,
  };
};

const calculateNoKomboColumn = (
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

  // WhatsApp: "Pós-pago" if leads is active and wantsWhatsApp is true
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

  // Build implementation breakdown
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

  return {
    id: "none", name: "Sua Seleção (Sem Kombo)", shortName: "Sua Seleção", discount: 0,
    isAvailable: true, isRecommended, isCustom: false,
    imobPrice, locPrice, leadsPrice, whatsAppPrice, inteligenciaPrice, assinaturaPrice,
    payPrice, segurosPrice, cashPrice, vipSupportPrice, dedicatedCSPrice, trainingPrice,
    implBreakdown, subscriptionCount, totalMonthly,
    theoreticalImplementation: implementation, implementation, annualEquivalent,
    cycleTotalValue, cycleMonths,
    overrides,
  };
};

/**
 * Calculate a custom scenario column — no Kombo discount, full price, all items toggleable
 * Premium services (Suporte VIP, CS Dedicado) are independently toggleable
 */
const calculateCustomColumn = (
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

  // WhatsApp in custom columns: toggleable, shown as "Pós-pago" when leads is active
  // For custom columns, WhatsApp follows the leads toggle (if leads is on, WhatsApp is available)
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

  // Premium services: independently toggleable in custom columns with frequency discount
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

  // Training: toggleable in custom columns, or auto-included if K2
  let trainingPrice: number | string | null = null;
  const imobIsK2 = (product === "imob" || product === "both") && imobPlan === "k2";
  const locIsK2 = (product === "loc" || product === "both") && locPlan === "k2";
  if (imobIsK2 || locIsK2) {
    // K2 includes training automatically
    if (imobIsK2 && locIsK2) trainingPrice = "4x online ou 2 presencial";
    else trainingPrice = "2x online ou 1 presencial";
  } else if (overrides.training) {
    // 2 trainings per product selected
    let productCount = 0;
    if (product === "imob" || product === "both") productCount++;
    if (product === "loc" || product === "both") productCount++;
    const perTraining = calculatePremiumPrice(PREMIUM_SERVICES_ANNUAL_PRICES.training, frequency);
    const totalTraining = perTraining * 2 * productCount;
    trainingPrice = totalTraining;
    totalMonthly += totalTraining;
  }

  const annualEquivalent = totalMonthly * 12 + implementation;

  // Build implementation breakdown
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
  return {
    id: customId,
    name: customName,
    shortName: customName,
    discount: 0,
    isAvailable: true,
    isRecommended: false,
    isCustom: true,
    imobPrice, locPrice, leadsPrice, whatsAppPrice, inteligenciaPrice, assinaturaPrice,
    payPrice, segurosPrice, cashPrice, vipSupportPrice, dedicatedCSPrice, trainingPrice,
    implBreakdown, subscriptionCount, totalMonthly,
    theoreticalImplementation: implementation, implementation, annualEquivalent,
    cycleTotalValue, cycleMonths,
    overrides,
  };
};

// ============================================================================
// COMPONENT
// ============================================================================

// Contextual banner config per product type
const PRODUCT_BANNER_CONFIG: Record<ProductSelection, { icon: typeof Building2; title: string; description: string; color: string }> = {
  imob: {
    icon: Building2,
    title: "Kombos para Vendas",
    description: "Compare sua seleção com os Kombos disponíveis para imobiliárias focadas em vendas.",
    color: "text-primary",
  },
  loc: {
    icon: Home,
    title: "Kombo para Locação",
    description: "Compare sua seleção com o Kombo otimizado para gestão de locações.",
    color: "text-blue-600",
  },
  both: {
    icon: Layers,
    title: "Kombos Integrados",
    description: "Compare sua seleção com os Kombos que combinam vendas e locação em uma única solução.",
    color: "text-purple-600",
  },
};

// Inline cycle selector component for each column
function ColumnCycleSelector({
  value,
  onChange,
}: {
  value: PaymentFrequency;
  onChange: (freq: PaymentFrequency) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = FREQUENCY_OPTIONS.find(o => o.id === value)!;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-medium rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all"
      >
        {current.shortLabel}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[100px]">
          {FREQUENCY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={(e) => { e.stopPropagation(); onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 transition-colors ${
                opt.id === value ? "font-bold text-primary bg-primary/5" : "text-gray-600"
              }`}
            >
              {opt.label} <span className="text-gray-400 ml-1">{opt.discount}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Editable title component for custom columns
function EditableTitle({
  value,
  onChange,
  maxLength = 11,
}: {
  value: string;
  onChange: (newTitle: string) => void;
  maxLength?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0) {
      onChange(trimmed.slice(0, maxLength));
    } else {
      setDraft(value);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        maxLength={maxLength}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-[90px] text-center text-xs font-bold border border-amber-400 rounded px-1 py-0.5 bg-white text-amber-700 outline-none focus:ring-2 focus:ring-amber-300"
      />
    );
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setDraft(value); setEditing(true); }}
      className="inline-flex items-center gap-1 group"
      title="Clique para renomear"
    >
      <span className="font-bold text-amber-700">{value}</span>
      <Pencil className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

export function KomboComparisonTable(props: KomboComparisonProps) {
  // Selected Plan for export (user confirms their choice)
  const [selectedPlan, setSelectedPlan] = useState<ColumnId | null>(null);

  // Hovered column for temporary visual focus
  const [hoveredColumn, setHoveredColumn] = useState<ColumnId | null>(null);

  // Track previous product for transition animation
  const prevProductRef = useRef<ProductSelection>(props.product);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Custom scenario columns: array of { id, name }
  const [customColumns, setCustomColumns] = useState<{ id: string; name: string }[]>([]);
  const customCounterRef = useRef(0);

  // Per-column overrides state: keyed by column key
  // "sua_selecao" = Sua Seleção (editable cycle only), "kombo_0", "kombo_1" = Kombo columns, "custom_0", "custom_1" = custom columns
  const [columnOverrides, setColumnOverrides] = useState<Record<string, ColumnOverrides>>({});

  // Initialize/reset overrides when product or parent props change
  const getDefaultOverrides = useCallback((): ColumnOverrides => ({
    frequency: props.frequency,
    imobPlan: props.imobPlan,
    locPlan: props.locPlan,
    addons: { ...props.addons },
  }), [props.frequency, props.imobPlan, props.locPlan, props.addons]);

  // Get a clean starting state for custom columns (nothing selected)
  const getCustomDefaultOverrides = useCallback((): ColumnOverrides => ({
    frequency: "annual" as PaymentFrequency,
    imobPlan: props.imobPlan,
    locPlan: props.locPlan,
    addons: {
      leads: false,
      inteligencia: false,
      assinatura: false,
      pay: false,
      seguros: false,
      cash: false,
    },
    vipSupport: false,
    dedicatedCS: false,
    training: false,
  }), [props.imobPlan, props.locPlan]);

  // Reset overrides when product type changes (columns change entirely)
  useEffect(() => {
    if (prevProductRef.current !== props.product) {
      setColumnOverrides({});
      setCustomColumns([]);
      customCounterRef.current = 0;
      
      if (selectedPlan && selectedPlan !== "none" && !String(selectedPlan).startsWith("custom_")) {
        const newCompatible = (() => {
          switch (props.product) {
            case "imob": return ["imob_start", "imob_pro"];
            case "loc": return ["locacao_pro"];
            case "both": return ["core_gestao", "elite"];
            default: return [];
          }
        })();
        if (!newCompatible.includes(selectedPlan as string)) {
          setSelectedPlan(null);
          props.onPlanSelected?.(null);
        }
      }

      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 400);
      prevProductRef.current = props.product;
      return () => clearTimeout(timer);
    }
  }, [props.product]);

  // Update column override for a specific column key
  const updateColumnOverride = useCallback((colKey: string, update: Partial<ColumnOverrides>) => {
    setColumnOverrides(prev => {
      const isCustom = colKey.startsWith("custom_");
      const current = prev[colKey] || (isCustom ? getCustomDefaultOverrides() : getDefaultOverrides());
      return {
        ...prev,
        [colKey]: {
          ...current,
          ...update,
          addons: update.addons ? { ...current.addons, ...update.addons } : current.addons,
        },
      };
    });
  }, [getDefaultOverrides, getCustomDefaultOverrides]);

  // Add a new custom column
  const addCustomColumn = useCallback(() => {
    if (customColumns.length >= MAX_CUSTOM_COLUMNS) return;
    const newId = `custom_${customCounterRef.current++}`;
    const newName = `Cenário ${customColumns.length + 1}`;
    setCustomColumns(prev => [...prev, { id: newId, name: newName }]);
    // Initialize with clean defaults
    setColumnOverrides(prev => ({
      ...prev,
      [newId]: getCustomDefaultOverrides(),
    }));
  }, [customColumns.length, getCustomDefaultOverrides]);

  // Remove a custom column
  const removeCustomColumn = useCallback((customId: string) => {
    setCustomColumns(prev => prev.filter(c => c.id !== customId));
    setColumnOverrides(prev => {
      const next = { ...prev };
      delete next[customId];
      return next;
    });
    if (selectedPlan === customId) {
      setSelectedPlan(null);
      props.onPlanSelected?.(null);
    }
  }, [selectedPlan, props.onPlanSelected]);

  // Rename a custom column
  const renameCustomColumn = useCallback((customId: string, newName: string) => {
    setCustomColumns(prev => prev.map(c => c.id === customId ? { ...c, name: newName } : c));
  }, []);

  // Notify parent when plan selection changes
  const handlePlanSelect = (planId: ColumnId) => {
    if (String(planId).startsWith("custom_")) {
      setSelectedPlan(planId);
      return;
    }
    setSelectedPlan(planId);
    props.onPlanSelected?.(planId as KomboId);
  };

  // Determine recommended Kombo
  const recommendedKombo = getRecommendedKombo(props.product, props.addons);

  // Determine compatible Kombos
  const compatibleKomboIds: KomboId[] = useMemo(() => {
    switch (props.product) {
      case "imob": return ["imob_start", "imob_pro"] as KomboId[];
      case "loc": return ["locacao_pro"] as KomboId[];
      case "both": return ["core_gestao", "elite"] as KomboId[];
      default: return [] as KomboId[];
    }
  }, [props.product]);

  // Calculate all columns: Sua Seleção + Kombos + Custom Scenarios
  const columns: KomboColumnData[] = useMemo(() => {
    // Column 0: Sua Seleção — uses parent props but can have frequency override
    const suaSelecaoOverrides = columnOverrides["sua_selecao"];
    const suaSelecaoFreqOverride = suaSelecaoOverrides
      ? { ...getDefaultOverrides(), frequency: suaSelecaoOverrides.frequency }
      : undefined;
    const suaSelecao = calculateKomboColumn("none", props, recommendedKombo, suaSelecaoFreqOverride);
    
    // Kombo columns with per-column overrides
    const komboColumns = compatibleKomboIds.map((id, idx) => {
      const colKey = `kombo_${idx}`;
      const overrides = columnOverrides[colKey] || undefined;
      return calculateKomboColumn(id, props, recommendedKombo, overrides);
    });
    
    // Custom scenario columns
    const customCols = customColumns.map((custom, idx) => {
      const overrides = columnOverrides[custom.id] || getCustomDefaultOverrides();
      return calculateCustomColumn(custom.id, idx, custom.name, props, overrides);
    });

    return [suaSelecao, ...komboColumns, ...customCols];
  }, [props, recommendedKombo, compatibleKomboIds, columnOverrides, customColumns, getCustomDefaultOverrides, getDefaultOverrides]);

  // Map column index to column key for overrides
  const getColumnKey = useCallback((colIndex: number): string => {
    if (colIndex === 0) return "sua_selecao";
    const komboCount = compatibleKomboIds.length;
    if (colIndex <= komboCount) return `kombo_${colIndex - 1}`;
    const customIdx = colIndex - komboCount - 1;
    return customColumns[customIdx]?.id || "";
  }, [compatibleKomboIds.length, customColumns]);

  // Banner config
  const bannerConfig = PRODUCT_BANNER_CONFIG[props.product];

  // Row definitions — restructured with Implantação section, Pós-Pago section, and cycle total
  const rows = [
    { key: "products", label: "Produtos", isHeader: true },
    { key: "imob", label: "Imob", indent: true },
    { key: "loc", label: "Loc", indent: true },
    { key: "addons", label: "Add-ons", isHeader: true },
    { key: "leads", label: "Leads", indent: true },
    { key: "inteligencia", label: "Inteligência", indent: true },
    { key: "assinatura", label: "Assinatura", indent: true },

    { key: "premium", label: "Serviços Premium", isHeader: true },
    { key: "vipSupport", label: "Suporte VIP", indent: true },
    { key: "dedicatedCS", label: "CS Dedicado", indent: true },
    { key: "training", label: "Treinamentos", indent: true },
    { key: "totalMonthly", label: "Mensalidades (Pré-Pago)", isTotal: true },
    { key: "subscriptionCount", label: "", isSubRow: true },

    { key: "implantacao", label: "Implantação", isHeader: true },
    { key: "implBreakdown", label: "", isSubRow: true },
    { key: "implementation", label: "Total Implantação", isTotal: true },

    { key: "cycleTotal", label: "Valor Total do Ciclo", isTotal: true },
    { key: "savings", label: "", isSubRow: true },
    { key: "cycle", label: "Ciclo", isTotal: true },

    { key: "postpaid", label: "Pós-Pago", isHeader: true },
    { key: "postpaidUsers", label: "Usuários adicionais", indent: true },
    { key: "postpaidContracts", label: "Contratos adicionais", indent: true },
    { key: "postpaidWhatsApp", label: "WhatsApp Leads", indent: true },
    { key: "postpaidAssinaturas", label: "Assinaturas", indent: true },
    { key: "postpaidBoletos", label: "Boletos", indent: true },
    { key: "postpaidSplits", label: "Splits", indent: true },
    { key: "postpaidSeguros", label: "Seguros", indent: true },
  ];

  /**
   * Handle click on a plan cell (Imob/Loc row) to cycle through plan tiers
   */
  const handlePlanCellClick = (colIndex: number, planType: "imob" | "loc", e: React.MouseEvent) => {
    if (colIndex === 0) return; // Sua Seleção: plan is read-only
    e.stopPropagation();
    
    const colKey = getColumnKey(colIndex);
    const isCustom = colKey.startsWith("custom_");
    const overrides = columnOverrides[colKey] || (isCustom ? getCustomDefaultOverrides() : getDefaultOverrides());
    const currentPlan = planType === "imob" ? overrides.imobPlan : overrides.locPlan;
    const currentIdx = PLAN_TIERS.indexOf(currentPlan);
    const nextPlan = PLAN_TIERS[(currentIdx + 1) % PLAN_TIERS.length];
    
    updateColumnOverride(colKey, planType === "imob" ? { imobPlan: nextPlan } : { locPlan: nextPlan });
  };

  /**
   * Handle click on an add-on cell to toggle it
   */
  const handleAddonCellClick = (colIndex: number, addonKey: string, e: React.MouseEvent) => {
    if (colIndex === 0) return; // Sua Seleção is read-only
    e.stopPropagation();
    
    const colKey = getColumnKey(colIndex);
    const col = columns[colIndex];
    
    // For Kombo columns: add-ons are fixed, cannot be toggled
    if (!col.isCustom && col.id !== "none") return;
    
    const isCustom = colKey.startsWith("custom_");
    const overrides = columnOverrides[colKey] || (isCustom ? getCustomDefaultOverrides() : getDefaultOverrides());
    const currentValue = overrides.addons[addonKey as keyof typeof overrides.addons];
    
    updateColumnOverride(colKey, {
      addons: { ...overrides.addons, [addonKey]: !currentValue },
    });
  };

  /**
   * Handle click on premium service cell in custom columns
   */
  const handlePremiumCellClick = (colIndex: number, serviceKey: "vipSupport" | "dedicatedCS" | "training", e: React.MouseEvent) => {
    e.stopPropagation();
    const colKey = getColumnKey(colIndex);
    const col = columns[colIndex];
    if (!col.isCustom) return; // Only custom columns can toggle premium services
    
    const overrides = columnOverrides[colKey] || getCustomDefaultOverrides();
    const currentValue = overrides[serviceKey] ?? false;
    updateColumnOverride(colKey, { [serviceKey]: !currentValue });
  };

  /**
   * Get cell value for a specific row and column
   */
  const getCellValue = (rowKey: string, column: KomboColumnData, colIndex: number): React.ReactNode => {
    const colKey = getColumnKey(colIndex);
    const isCustom = colKey.startsWith("custom_");
    const isSuaSelecao = colIndex === 0;
    const isKomboCol = !column.isCustom && column.id !== "none";
    const overrides = colIndex > 0 ? (columnOverrides[colKey] || (isCustom ? getCustomDefaultOverrides() : getDefaultOverrides())) : null;

    // Helper to render a plan cell (clickable for Kombo/Custom, read-only for Sua Seleção)
    const renderPlanCell = (price: number | null, planType: "imob" | "loc") => {
      if (price === null) return <span className="text-gray-300">—</span>;
      const currentPlan = overrides
        ? (planType === "imob" ? overrides.imobPlan : overrides.locPlan)
        : (planType === "imob" ? props.imobPlan : props.locPlan);
      
      const isEditable = !isSuaSelecao;
      
      return (
        <div
          className={`flex flex-col items-center gap-0.5 ${isEditable ? "cursor-pointer group" : ""}`}
          onClick={isEditable ? (e) => handlePlanCellClick(colIndex, planType, e) : undefined}
        >
          <span className="font-medium text-gray-700">R$ {formatCurrency(price)}</span>
          <span className={`text-[10px] font-bold ${isEditable ? "text-primary group-hover:underline" : "text-gray-500"}`}>
            {currentPlan.toUpperCase()}
          </span>
        </div>
      );
    };

    // Helper to render an add-on cell
    const renderAddonCell = (price: number | null, addonKey: string) => {
      // === Sua Seleção (col 0): read-only, just show price or dash ===
      if (isSuaSelecao) {
        if (["pay", "seguros", "cash"].includes(addonKey)) {
          const isOn = props.addons[addonKey as keyof typeof props.addons];
          if (!isOn) return <span className="text-gray-300">—</span>;
          return <span className="font-medium text-gray-700">{addonKey === "cash" ? "Grátis" : "Pós-pago"}</span>;
        }
        if (price === null) return <span className="text-gray-300">—</span>;
        return <span className="font-medium text-gray-700">R$ {formatCurrency(price)}</span>;
      }

      // === Kombo columns: fixed, just show price or dash (no "Incluído" label, no "Adicionar" button) ===
      if (isKomboCol) {
        if (["pay", "seguros", "cash"].includes(addonKey)) {
          const komboId = column.id as Exclude<KomboId, "none">;
          const isIncluded = KOMBO_DEFINITIONS[komboId]?.includedAddons.includes(addonKey);
          if (isIncluded) {
            const label = addonKey === "cash" ? "Grátis" : "Pós-pago";
            return <span className="font-medium text-gray-700">{label}</span>;
          }
          return <span className="text-gray-300">—</span>;
        }
        // Paid add-ons
        if (price !== null) {
          return <span className="font-medium text-gray-700">R$ {formatCurrency(price)}</span>;
        }
        return <span className="text-gray-300">—</span>;
      }

      // === Custom columns: fully toggleable ===
      if (["pay", "seguros", "cash"].includes(addonKey)) {
        const label = addonKey === "cash" ? "Grátis" : "Pós-pago";
        const isActive = overrides?.addons[addonKey as keyof typeof overrides.addons] ?? false;
        return (
          <div
            className="cursor-pointer group"
            onClick={(e) => handleAddonCellClick(colIndex, addonKey, e)}
          >
            {isActive ? (
              <span className="text-green-600 font-semibold text-xs group-hover:underline">{label}</span>
            ) : (
              <span className="text-gray-300 group-hover:text-gray-500 transition-colors">—</span>
            )}
          </div>
        );
      }

      // Paid add-ons in custom columns
      const isActive = overrides?.addons[addonKey as keyof typeof overrides.addons] ?? false;
      if (isActive && price !== null) {
        return (
          <div
            className="cursor-pointer group"
            onClick={(e) => handleAddonCellClick(colIndex, addonKey, e)}
          >
            <span className="font-medium text-gray-700 group-hover:line-through group-hover:text-red-400 transition-colors">
              R$ {formatCurrency(price)}
            </span>
          </div>
        );
      }

      return (
        <div
          className="cursor-pointer group"
          onClick={(e) => handleAddonCellClick(colIndex, addonKey, e)}
        >
          <span className="text-gray-300 group-hover:text-green-500 transition-colors">—</span>
        </div>
      );
    };

    // Helper to render premium service cell (toggleable in custom columns)
    const renderPremiumCell = (priceOrLabel: number | string | null, serviceKey: "vipSupport" | "dedicatedCS") => {
      if (priceOrLabel === "Incluído") {
        return <span className="text-green-600 font-semibold text-xs">Incluído</span>;
      }
      
      // Custom columns: toggleable
      if (isCustom) {
        const overridesData = columnOverrides[colKey] || getCustomDefaultOverrides();
        const isActive = overridesData[serviceKey] ?? false;
        
        if (typeof priceOrLabel === "number") {
          return (
            <div
              className="cursor-pointer group"
              onClick={(e) => handlePremiumCellClick(colIndex, serviceKey, e)}
            >
              <span className="font-medium text-gray-700 group-hover:line-through group-hover:text-red-400 transition-colors">
                R$ {formatCurrency(priceOrLabel)}
              </span>
            </div>
          );
        }
        
        // Not active — show clickable dash
        return (
          <div
            className="cursor-pointer group"
            onClick={(e) => handlePremiumCellClick(colIndex, serviceKey, e)}
          >
            <span className="text-gray-300 group-hover:text-green-500 transition-colors">—</span>
          </div>
        );
      }
      
      // Non-custom columns: just show price or dash
      if (typeof priceOrLabel === "number") {
        return <span className="font-medium">R$ {formatCurrency(priceOrLabel)}</span>;
      }
      return <span className="text-gray-300">—</span>;
    };

    switch (rowKey) {
      case "imob":
        return renderPlanCell(column.imobPrice, "imob");
      case "loc":
        return renderPlanCell(column.locPrice, "loc");
      case "leads":
        return renderAddonCell(column.leadsPrice, "leads");
      case "inteligencia":
        return renderAddonCell(column.inteligenciaPrice, "inteligencia");
      case "assinatura":
        return renderAddonCell(column.assinaturaPrice, "assinatura");

      case "seguros":
        return renderAddonCell(null, "seguros");
      case "cash":
        return renderAddonCell(null, "cash");
      case "vipSupport":
        return renderPremiumCell(column.vipSupportPrice, "vipSupport");
      case "dedicatedCS":
        return renderPremiumCell(column.dedicatedCSPrice, "dedicatedCS");
      case "training": {
        // Kombo "Incluído"
        if (column.trainingPrice === "Incluído") return <span className="text-green-600 font-semibold text-xs">Incluído</span>;
        // K2 auto-included (string description)
        if (typeof column.trainingPrice === "string" && column.trainingPrice) {
          return <span className="text-green-600 font-semibold text-xs">{column.trainingPrice}</span>;
        }
        // Custom columns: toggleable
        if (isCustom) {
          const overridesData = columnOverrides[colKey] || getCustomDefaultOverrides();
          const isActive = overridesData.training ?? false;
          if (typeof column.trainingPrice === "number") {
            return (
              <div
                className="cursor-pointer group"
                onClick={(e) => handlePremiumCellClick(colIndex, "training", e)}
              >
                <span className="font-medium text-gray-700 group-hover:line-through group-hover:text-red-400 transition-colors">
                  R$ {formatCurrency(column.trainingPrice)}
                </span>
              </div>
            );
          }
          // Not active — show clickable dash
          return (
            <div
              className="cursor-pointer group"
              onClick={(e) => handlePremiumCellClick(colIndex, "training", e)}
            >
              <span className="text-gray-300 group-hover:text-green-500 transition-colors">—</span>
            </div>
          );
        }
        // Non-custom, non-Kombo: just show dash
        if (typeof column.trainingPrice === "number") {
          return <span className="font-medium">R$ {formatCurrency(column.trainingPrice)}</span>;
        }
        return <span className="text-gray-300">—</span>;
      }
      case "cycle": {
        // Per-column cycle selector — ALL columns are editable (including Sua Seleção)
        const colKey2 = getColumnKey(colIndex);
        const isCustom2 = colKey2.startsWith("custom_");
        let currentFreq: PaymentFrequency;
        if (colIndex === 0) {
          // Sua Seleção: use override frequency if set, otherwise parent frequency
          currentFreq = (columnOverrides["sua_selecao"]?.frequency) ?? props.frequency;
        } else {
          currentFreq = (columnOverrides[colKey2] || (isCustom2 ? getCustomDefaultOverrides() : getDefaultOverrides())).frequency;
        }
        return (
          <ColumnCycleSelector
            value={currentFreq}
            onChange={(freq) => {
              if (colIndex === 0) {
                // Update Sua Seleção frequency override
                updateColumnOverride("sua_selecao", { frequency: freq });
                // Also notify parent
                props.onFrequencyChange?.(freq);
              } else {
                updateColumnOverride(colKey2, { frequency: freq });
              }
            }}
          />
        );
      }
      case "totalMonthly":
        return <span className="font-bold">R$ {formatCurrency(column.totalMonthly)}</span>;
      case "subscriptionCount":
        return (
          <span className="text-[11px] text-gray-400 font-normal">
            {column.subscriptionCount} {column.subscriptionCount === 1 ? "assinatura" : "assinaturas"}
          </span>
        );
      case "implBreakdown": {
        if (column.implBreakdown.length === 0) return <span className="text-gray-300">—</span>;
        const isKombo = column.id !== "none" && !column.isCustom;
        return (
          <div className="flex flex-col items-center gap-0.5">
            {column.implBreakdown.map((item, idx) => (
              <span key={idx} className="text-[10px] text-gray-500 font-normal leading-tight">
                {item.label}: {isKombo ? (
                  <span className="line-through text-gray-400">R$ {formatCurrency(item.cost)}</span>
                ) : (
                  <span>R$ {formatCurrency(item.cost)}</span>
                )}
              </span>
            ))}
            {isKombo && (
              <span className="text-[10px] text-green-600 font-medium leading-tight">
                Oferta Kombo: R$ {formatCurrency(column.implementation)}
              </span>
            )}
          </div>
        );
      }
      case "implementation": {
        return (
          <span className="font-bold text-gray-700">R$ {formatCurrency(column.implementation)}</span>
        );
      }
      case "cycleTotal": {
        const cycleLabel = CYCLE_LABELS[column.overrides?.frequency ?? props.frequency];
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-bold text-gray-800">R$ {formatCurrency(column.cycleTotalValue)}</span>
            <span className="text-[10px] text-gray-400 font-normal">({cycleLabel})</span>
          </div>
        );
      }
      case "savings": {
        const semKombo = columns[0];
        if (column.id === "none" || semKombo.cycleTotalValue === 0) return null;
        const savings = semKombo.cycleTotalValue - column.cycleTotalValue;
        if (savings <= 0) return null;
        const cycleLabel = CYCLE_LABELS[column.overrides?.frequency ?? props.frequency].toLowerCase();
        return (
          <span className="text-[11px] text-green-600 font-semibold">
            Economia de R$ {formatCurrency(savings)}/{cycleLabel}
          </span>
        );
      }
      // Pós-Pago items
      case "postpaidUsers": {
        // IMOB only: show "Pós-pago" if IMOB is active
        const hasImob = column.imobPrice !== null;
        if (!hasImob) return <span className="text-gray-300">—</span>;
        return <span className="text-[11px] text-amber-600 font-medium">Pós-pago</span>;
      }
      case "postpaidContracts": {
        // LOC only: show "Pós-pago" if LOC is active
        const hasLoc = column.locPrice !== null;
        if (!hasLoc) return <span className="text-gray-300">—</span>;
        return <span className="text-[11px] text-amber-600 font-medium">Pós-pago</span>;
      }
      case "postpaidWhatsApp": {
        // IMOB only (via Leads): show "Pós-pago" if WhatsApp is active
        if (column.whatsAppPrice) return <span className="text-[11px] text-amber-600 font-medium">Pós-pago</span>;
        return <span className="text-gray-300">—</span>;
      }
      case "postpaidAssinaturas": {
        // Both IMOB + LOC: show "Pós-pago" if Assinatura is active
        if (column.assinaturaPrice !== null) return <span className="text-[11px] text-amber-600 font-medium">Pós-pago</span>;
        return <span className="text-gray-300">—</span>;
      }
      case "postpaidBoletos": {
        // LOC only: show "Pós-pago" if Pay is active
        if (column.payPrice) return <span className="text-[11px] text-amber-600 font-medium">Pós-pago</span>;
        return <span className="text-gray-300">—</span>;
      }
      case "postpaidSplits": {
        // LOC only: show "Pós-pago" if Pay is active (splits come with Pay)
        if (column.payPrice) return <span className="text-[11px] text-amber-600 font-medium">Pós-pago</span>;
        return <span className="text-gray-300">—</span>;
      }
      case "postpaidSeguros": {
        // LOC only: show "Pós-pago" if Seguros is active
        if (column.segurosPrice) return <span className="text-[11px] text-amber-600 font-medium">Pós-pago</span>;
        return <span className="text-gray-300">—</span>;
      }
      default:
        return null;
    }
  };

  // Determine the number of kombo columns (for visual separator)
  const komboColumnCount = compatibleKomboIds.length;

  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-4">
          {/* Table Header: Title */}
          <div className="pb-2 mb-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Sua Seleção vs Kombos — até 40% de desconto na contratação (ciclo + combo cumulativos)</h3>
          </div>

          {/* Comparison Table with transition animation */}
          <div className={`w-full transition-all duration-300 overflow-x-auto ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            <table className="w-full text-sm border-collapse" onMouseLeave={() => setHoveredColumn(null)}>
              <colgroup>
                <col style={{ width: "160px" }} />
                {columns.map((_, idx) => (
                  <col key={idx} style={{ minWidth: "120px" }} />
                ))}
                {/* Extra col for the "+" button */}
                {customColumns.length < MAX_CUSTOM_COLUMNS && (
                  <col style={{ width: "50px" }} />
                )}
              </colgroup>
              <thead className="sticky top-0 z-10 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
                {/* Row 1: Nome do Kombo + Tooltip + Badge de Desconto */}
                <tr className="border-b border-gray-200 bg-white">
                  <th className="text-left py-3 px-2 bg-white"></th>
                  {columns.map((col, colIndex) => {
                    const isKomboCol = !col.isCustom && col.id !== "none";
                    const tooltipData = isKomboCol && col.id in KOMBO_DEFINITIONS
                      ? KOMBO_DEFINITIONS[col.id as Exclude<KomboId, "none">]?.tooltipInfo
                      : null;
                    
                    // Visual separator between Kombo and Custom columns
                    const isFirstCustom = col.isCustom && colIndex === 1 + komboColumnCount;
                    
                    return (
                      <th
                        key={col.id}
                        onMouseEnter={() => setHoveredColumn(col.id)}
                        onClick={() => handlePlanSelect(col.id)}
                        className={`text-center py-3 px-1 cursor-pointer transition-colors duration-150 relative ${
                          isFirstCustom ? "border-l-2 border-dashed border-gray-300" : ""
                        } ${
                          selectedPlan === col.id
                            ? col.isCustom
                              ? "bg-amber-50 border-t-4 border-l-4 border-r-4 border-amber-500 rounded-t-xl shadow-lg shadow-amber-100"
                              : "bg-green-50 border-t-4 border-l-4 border-r-4 border-green-600 rounded-t-xl shadow-lg shadow-green-200"
                            : hoveredColumn === col.id && selectedPlan !== col.id
                            ? col.isCustom ? "bg-amber-50/50" : "bg-blue-50/70"
                            : colIndex % 2 === 1
                            ? "bg-gray-50/50"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Custom column: show remove button */}
                          {col.isCustom && (
                            <button
                              onClick={(e) => { e.stopPropagation(); removeCustomColumn(col.id); }}
                              className="absolute top-1 right-1 p-0.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remover cenário"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          {/* Column title */}
                          {col.isCustom ? (
                            <EditableTitle
                              value={col.shortName}
                              onChange={(newName) => renameCustomColumn(col.id, newName)}
                            />
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-gray-900">{col.shortName}</span>
                              {tooltipData && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="w-4 h-4 text-gray-400 hover:text-primary cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[280px] p-3">
                                      <div className="space-y-2 text-left">
                                        <p className="font-semibold text-sm">{tooltipData.description}</p>
                                        <div className="text-xs space-y-1">
                                          <p><span className="font-medium">Inclui:</span> {tooltipData.includes.join(", ")}</p>
                                          <p><span className="font-medium">Desconto:</span> {tooltipData.discountText}</p>
                                          <p><span className="font-medium">Serviços Premium:</span> {tooltipData.premiumServices}</p>
                                          <p><span className="font-medium">Implantação:</span> {tooltipData.implementation}</p>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          )}
                          {col.discount > 0 && (
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                              {Math.round(col.discount * 100)}% OFF
                            </Badge>
                          )}
                          {col.isCustom && (
                            <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-600 bg-amber-50">
                              Livre
                            </Badge>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  {/* "+" button to add custom column */}
                  {customColumns.length < MAX_CUSTOM_COLUMNS && (
                    <th className="text-center py-3 px-1 bg-white align-middle" rowSpan={1}>
                      <button
                        onClick={addCustomColumn}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-green-400 text-green-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all"
                        title="Adicionar cenário personalizado"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.key}
                    className={
                      row.isHeader
                        ? "bg-blue-50/70 border-t-2 border-b-2 border-gray-200"
                        : row.isTotal
                        ? "bg-gray-100/70 border-b border-gray-200"
                        : row.isSubRow
                        ? "border-b border-gray-100"
                        : "border-b border-gray-100 hover:bg-gray-50/30"
                    }
                  >
                    <td
                      colSpan={row.isHeader ? 2 : 1}
                      className={`${row.isSubRow ? "py-0.5 px-4" : "py-3 px-4"} ${row.indent ? "pl-8" : ""} ${
                        row.isHeader
                          ? "font-semibold text-gray-700 text-sm" 
                          : row.isTotal
                          ? "font-bold text-gray-700"
                          : row.isSubRow
                          ? "text-gray-400 text-[11px]"
                          : "text-gray-600"
                      }`}
                    >
                      {row.key === "training" ? (
                        <span className="inline-flex items-center gap-1">
                          {row.label}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3.5 h-3.5 text-gray-400 hover:text-primary cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[240px] p-3">
                                <div className="space-y-1.5 text-left">
                                  <p className="font-semibold text-sm">Disponível no K2</p>
                                  <p className="text-xs">Online: <span className="font-bold">R$2.000</span></p>
                                  <p className="text-xs">Presencial: <span className="font-bold">R$3.000</span></p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                      ) : row.key === "vipSupport" ? (
                        <span className="inline-flex items-center gap-1">
                          {row.label}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3.5 h-3.5 text-gray-400 hover:text-primary cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[240px] p-3">
                                <div className="space-y-1.5 text-left">
                                  <p className="font-semibold text-sm">Preço de ref:</p>
                                  <p className="text-xs"><span className="font-bold">R$97</span>/mês (ciclo anual)</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                      ) : row.key === "dedicatedCS" ? (
                        <span className="inline-flex items-center gap-1">
                          {row.label}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="w-3.5 h-3.5 text-gray-400 hover:text-primary cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[240px] p-3">
                                <div className="space-y-1.5 text-left">
                                  <p className="font-semibold text-sm">Preço de ref:</p>
                                  <p className="text-xs"><span className="font-bold">R$297</span>/mês (ciclo anual)</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </span>
                      ) : (
                        row.label
                      )}
                    </td>
                    {columns.map((col, colIndex) => {
                      if (row.isHeader && colIndex === 0) return null;
                      
                      // Visual separator between Kombo and Custom columns
                      const isFirstCustom = col.isCustom && colIndex === 1 + komboColumnCount;
                      
                      return (
                        <td
                          key={`${row.key}-${col.id}`}
                          onMouseEnter={() => setHoveredColumn(col.id)}
                          className={`text-center ${row.isSubRow ? "py-0.5 px-2" : "py-3 px-2"} transition-colors duration-150 ${
                            isFirstCustom ? "border-l-2 border-dashed border-gray-300" : ""
                          } ${
                            selectedPlan === col.id
                              ? col.isCustom
                                ? "bg-amber-50 border-l-4 border-r-4 border-amber-500 shadow-lg shadow-amber-100"
                                : "bg-green-50 border-l-4 border-r-4 border-green-600 shadow-lg shadow-green-200"
                              : hoveredColumn === col.id && selectedPlan !== col.id
                              ? col.isCustom ? "bg-amber-50/50" : "bg-blue-50/70"
                              : colIndex % 2 === 1
                              ? "bg-gray-50/50"
                              : ""
                          } ${
                            row.isTotal
                              ? "font-bold text-gray-700"
                              : row.isSubRow
                              ? "text-gray-400"
                              : "text-gray-700"
                          }`}
                        >
                          {row.isHeader ? null : getCellValue(row.key, col, colIndex)}
                        </td>
                      );
                    })}
                    {/* Empty cell for the "+" column */}
                    {customColumns.length < MAX_CUSTOM_COLUMNS && (
                      <td className="text-center py-2 px-1"></td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                  <td className="py-3 px-2"></td>
                  {columns.map((col, colIndex) => {
                    const isFirstCustom = col.isCustom && colIndex === 1 + komboColumnCount;
                    return (
                      <td 
                        key={`select-btn-${col.id}`} 
                        onMouseEnter={() => setHoveredColumn(col.id)} 
                        onClick={() => handlePlanSelect(col.id)} 
                        className={`text-center py-3 px-1 cursor-pointer transition-colors duration-150 ${
                          isFirstCustom ? "border-l-2 border-dashed border-gray-300" : ""
                        } ${
                          selectedPlan === col.id
                            ? col.isCustom
                              ? "bg-amber-50 border-l-4 border-r-4 border-b-4 border-amber-500 rounded-b-xl shadow-lg shadow-amber-100"
                              : "bg-green-50 border-l-4 border-r-4 border-b-4 border-green-600 rounded-b-xl shadow-lg shadow-green-200"
                            : hoveredColumn === col.id && selectedPlan !== col.id
                            ? col.isCustom ? "bg-amber-50/50" : "bg-blue-50/70"
                            : colIndex % 2 === 1
                            ? "bg-gray-50/50"
                            : ""
                        }`}
                      >
                        <Button
                          onClick={() => handlePlanSelect(col.id)}
                          variant={selectedPlan === col.id ? "default" : "outline"}
                          className={`w-full text-xs transition-all duration-300 ${
                            selectedPlan === col.id 
                              ? col.isCustom
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : "bg-green-600 hover:bg-green-700 text-white" 
                              : "bg-white text-gray-600 border-gray-300 hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                          }`}
                          size="sm"
                        >
                          {col.isRecommended && !selectedPlan ? (
                            <>
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Selecionar
                            </>
                          ) : selectedPlan === col.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Selecionado
                            </>
                          ) : (
                            "Selecionar"
                          )}
                        </Button>
                      </td>
                    );
                  })}
                  {/* Empty cell for the "+" column in footer */}
                  {customColumns.length < MAX_CUSTOM_COLUMNS && (
                    <td className="text-center py-3 px-1"></td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footnote */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Mensalidades (Pré-Pago):</strong> Valor mensal recorrente das assinaturas. <strong>Valor Total do Ciclo:</strong> Mensalidades × meses do ciclo + implantação (cobrada apenas no primeiro ciclo).
              <br />
              <strong>Pós-Pago:</strong> Itens cobrados conforme uso (usuários, contratos, boletos, etc.) — não incluídos no valor do ciclo.
              <br />
              <strong>Colunas interativas:</strong> Clique nos planos (Prime/K/K2) nas colunas de Kombo para simular cenários diferentes. A coluna "Sua Seleção" reflete a configuração principal.
              <br />
              <strong>Cenários personalizados:</strong> Use o botão "+" para adicionar cenários livres (até {MAX_CUSTOM_COLUMNS}). Clique no título para renomear (máx. 11 caracteres).
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

export default KomboComparisonTable;
