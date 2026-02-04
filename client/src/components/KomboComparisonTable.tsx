/**
 * Kombo Comparison Table Component
 * 
 * Displays a comparison table showing prices for:
 * - Sem Kombo (no discount)
 * - All 5 Kombos with their respective discounts
 * 
 * Features:
 * - Toggle between Monthly and Annual view
 * - Auto-highlight recommended Kombo based on user selections
 * - Clean, modular code for easy modifications
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Info } from "lucide-react";
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
  // Premium services
  vipSupport: boolean;
  dedicatedCS: boolean;
}

type KomboId = "none" | "imob_start" | "imob_pro" | "locacao_pro" | "core_gestao" | "elite";
type ViewMode = "monthly" | "semestral" | "annual" | "biennial";

// Frequency options for the selector
// Anual is the reference (0%), others are relative to annual
const FREQUENCY_OPTIONS: { id: ViewMode; label: string; discount: string }[] = [
  { id: "monthly", label: "Mensal", discount: "+25%" },
  { id: "semestral", label: "Semestral", discount: "+10%" },
  { id: "annual", label: "Anual", discount: "0% - Referência" },
  { id: "biennial", label: "Bienal", discount: "-10%" },
];

interface KomboColumnData {
  id: KomboId;
  name: string;
  shortName: string;
  discount: number; // 0.10 = 10%
  isAvailable: boolean;
  isRecommended: boolean;
  // Prices for each row
  imobPrice: number | null; // null = not included
  locPrice: number | null;
  leadsPrice: number | null;
  inteligenciaPrice: number | null;
  assinaturaPrice: number | null;
  payPrice: string | null; // "Pós-pago" or null
  segurosPrice: string | null;
  cashPrice: string | null; // "Grátis" or null
  vipSupportPrice: number | string | null; // number, "Incluído", or null
  dedicatedCSPrice: number | string | null;
  // Totals
  totalMonthly: number;
  implementation: number;
  annualEquivalent: number; // 12 months + implementation
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

const PREMIUM_SERVICES_PRICES = {
  vipSupport: 97,
  dedicatedCS: 197,
};

const PAYMENT_FREQUENCY_MULTIPLIERS: Record<PaymentFrequency, number> = {
  monthly: 1.25,
  semestral: 1.1111,
  annual: 1.0,
  biennial: 0.90,
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
    freeImplementations: ["leads"], // Leads implementation is free
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
    includesPremiumServices: true, // INCLUI VIP + CS Dedicado
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
    includesPremiumServices: true, // INCLUI VIP + CS Dedicado
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
    discount: 0, // No monthly discount
    products: ["both"] as ProductSelection[],
    includedAddons: [] as string[],
    includesPremiumServices: true, // VIP + CS included
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
    includesPremiumServices: true, // VIP + CS included
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Round price UP to next value ending in 7
 */
const roundToEndIn7 = (price: number): number => {
  const lastDigit = price % 10;
  if (lastDigit === 7) return price;
  if (lastDigit < 7) return price - lastDigit + 7;
  return price - lastDigit + 17;
};

/**
 * Calculate price with frequency multiplier
 */
const calculatePrice = (annualPrice: number, frequency: PaymentFrequency): number => {
  const multiplier = PAYMENT_FREQUENCY_MULTIPLIERS[frequency];
  return roundToEndIn7(Math.round(annualPrice * multiplier));
};

/**
 * Apply Kombo discount to a price
 */
const applyDiscount = (price: number, discount: number): number => {
  if (discount === 0) return price;
  return roundToEndIn7(Math.round(price * (1 - discount)));
};

/**
 * Format currency in Brazilian Real
 */
const formatCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Check if Premium Services are included in plan (K or K2)
 */
const isPremiumIncludedInPlan = (plan: PlanTier): boolean => {
  return plan === "k" || plan === "k2";
};

/**
 * Determine which Kombo is recommended based on user selections
 * A Kombo is recommended when the user has the MINIMUM required items.
 * Having EXTRA add-ons doesn't disqualify a Kombo - we recommend the best match.
 */
const getRecommendedKombo = (
  product: ProductSelection,
  addons: KomboComparisonProps["addons"]
): KomboId => {
  // Elite: IMOB + LOC + ALL 6 add-ons
  if (
    product === "both" &&
    addons.leads &&
    addons.inteligencia &&
    addons.assinatura &&
    addons.pay &&
    addons.seguros &&
    addons.cash
  ) {
    return "elite";
  }

  // Core Gestão: IMOB + LOC + NO add-ons
  if (
    product === "both" &&
    !addons.leads &&
    !addons.inteligencia &&
    !addons.assinatura &&
    !addons.pay &&
    !addons.seguros &&
    !addons.cash
  ) {
    return "core_gestao";
  }

  // Imob Pro: IMOB + Leads + Inteligência + Assinatura (priority over Imob Start)
  if (
    product === "imob" &&
    addons.leads &&
    addons.inteligencia &&
    addons.assinatura
  ) {
    return "imob_pro";
  }

  // Imob Start: IMOB + Leads + Assinatura (without Inteligência)
  if (
    product === "imob" &&
    addons.leads &&
    addons.assinatura &&
    !addons.inteligencia
  ) {
    return "imob_start";
  }

  // Locação Pro: LOC + Inteligência + Assinatura
  if (
    product === "loc" &&
    addons.inteligencia &&
    addons.assinatura
  ) {
    return "locacao_pro";
  }

  return "none";
};

/**
 * Check if a Kombo is available for the current product selection
 */
const isKomboAvailable = (komboId: KomboId, product: ProductSelection): boolean => {
  if (komboId === "none") return true;
  const kombo = KOMBO_DEFINITIONS[komboId];
  return kombo.products.includes(product) || 
    (kombo.products.includes("both" as ProductSelection) && product === "both");
};

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate all data for a single Kombo column
 */
const calculateKomboColumn = (
  komboId: KomboId,
  props: KomboComparisonProps,
  recommendedKombo: KomboId
): KomboColumnData => {
  const { product, imobPlan, locPlan, addons, frequency, vipSupport, dedicatedCS } = props;

  // Sem Kombo (no discount)
  if (komboId === "none") {
    return calculateNoKomboColumn(props, recommendedKombo === "none");
  }

  const kombo = KOMBO_DEFINITIONS[komboId];
  const isAvailable = isKomboAvailable(komboId, product);
  const isRecommended = komboId === recommendedKombo;

  // Always calculate prices, even when Kombo is not available
  // This allows users to see hypothetical prices for comparison

  // Calculate prices with Kombo discount
  const discount = kombo.discount;
  let totalMonthly = 0;
  let implementation = IMPLEMENTATION_COSTS.combo; // All Kombos have fixed R$1.497 implementation

  // Products - always show prices based on Kombo definition, not user selection
  // This allows comparison even when Kombo is not applicable
  let imobPrice: number | null = null;
  let locPrice: number | null = null;

  // Check if Kombo includes IMOB
  const komboIncludesImob = kombo.products.includes("imob" as ProductSelection) || kombo.products.includes("both" as ProductSelection);
  // Check if Kombo includes LOC
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

  // Add-ons - always show prices based on Kombo definition
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

  if (kombo.includedAddons.includes("pay")) {
    payPrice = "Pós-pago";
  }

  if (kombo.includedAddons.includes("seguros")) {
    segurosPrice = "Pós-pago";
  }

  if (kombo.includedAddons.includes("cash")) {
    cashPrice = "Grátis";
  }

  // Premium Services
  // Regra: Imob Pro, Locação Pro, Core Gestão, Elite = VIP + CS INCLUÍDO no Kombo
  // Imob Start = NÃO inclui VIP/CS (cliente paga à parte se quiser)
  let vipSupportPrice: number | string | null = null;
  let dedicatedCSPrice: number | string | null = null;

  if (kombo.includesPremiumServices) {
    // Imob Pro, Locação Pro, Core Gestão, Elite incluem VIP + CS Dedicado
    vipSupportPrice = "Incluído";
    dedicatedCSPrice = "Incluído";
  } else {
    // Imob Start NÃO inclui VIP/CS - cliente paga à parte
    // Verificar se o plano (K/K2) já inclui
    const relevantPlan = komboIncludesLoc && !komboIncludesImob ? locPlan : imobPlan;
    if (isPremiumIncludedInPlan(relevantPlan)) {
      // K e K2 já incluem VIP/CS no plano base
      vipSupportPrice = "Incluído";
      dedicatedCSPrice = "Incluído";
    } else {
      // Prime: VIP/CS são opcionais e pagos à parte
      // Mostrar preço se o usuário selecionou
      if (vipSupport) {
        vipSupportPrice = PREMIUM_SERVICES_PRICES.vipSupport;
        totalMonthly += PREMIUM_SERVICES_PRICES.vipSupport;
      }
      if (dedicatedCS) {
        dedicatedCSPrice = PREMIUM_SERVICES_PRICES.dedicatedCS;
        totalMonthly += PREMIUM_SERVICES_PRICES.dedicatedCS;
      }
    }
  }

  const annualEquivalent = totalMonthly * 12 + implementation;

  return {
    id: komboId,
    name: kombo.name,
    shortName: kombo.shortName,
    discount,
    isAvailable,
    isRecommended,
    imobPrice,
    locPrice,
    leadsPrice,
    inteligenciaPrice,
    assinaturaPrice,
    payPrice,
    segurosPrice,
    cashPrice,
    vipSupportPrice,
    dedicatedCSPrice,
    totalMonthly,
    implementation,
    annualEquivalent,
  };
};

/**
 * Calculate "Sem Kombo" column (no discounts)
 */
const calculateNoKomboColumn = (
  props: KomboComparisonProps,
  isRecommended: boolean
): KomboColumnData => {
  const { product, imobPlan, locPlan, addons, frequency, vipSupport, dedicatedCS } = props;

  let totalMonthly = 0;
  let implementation = 0;

  // Products
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

  // Add-ons
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

  if (addons.inteligencia) {
    inteligenciaPrice = calculatePrice(ADDON_ANNUAL_PRICES.inteligencia, frequency);
    totalMonthly += inteligenciaPrice;
    implementation += IMPLEMENTATION_COSTS.inteligencia;
  }

  if (addons.assinatura) {
    assinaturaPrice = calculatePrice(ADDON_ANNUAL_PRICES.assinatura, frequency);
    totalMonthly += assinaturaPrice;
  }

  if (addons.pay && (product === "loc" || product === "both")) {
    payPrice = "Pós-pago";
  }

  if (addons.seguros && (product === "loc" || product === "both")) {
    segurosPrice = "Pós-pago";
  }

  if (addons.cash && (product === "loc" || product === "both")) {
    cashPrice = "Grátis";
  }

  // Premium Services
  let vipSupportPrice: number | string | null = null;
  let dedicatedCSPrice: number | string | null = null;

  // Check if any plan includes Premium Services
  const imobIncludesPremium = (product === "imob" || product === "both") && isPremiumIncludedInPlan(imobPlan);
  const locIncludesPremium = (product === "loc" || product === "both") && isPremiumIncludedInPlan(locPlan);

  if (imobIncludesPremium || locIncludesPremium) {
    vipSupportPrice = "Incluído";
    dedicatedCSPrice = "Incluído";
  } else {
    if (vipSupport) {
      vipSupportPrice = PREMIUM_SERVICES_PRICES.vipSupport;
      totalMonthly += PREMIUM_SERVICES_PRICES.vipSupport;
    }
    if (dedicatedCS) {
      dedicatedCSPrice = PREMIUM_SERVICES_PRICES.dedicatedCS;
      totalMonthly += PREMIUM_SERVICES_PRICES.dedicatedCS;
    }
  }

  const annualEquivalent = totalMonthly * 12 + implementation;

  return {
    id: "none",
    name: "Sua Seleção (Sem Kombo)",
    shortName: "Sua Seleção",
    discount: 0,
    isAvailable: true,
    isRecommended,
    imobPrice,
    locPrice,
    leadsPrice,
    inteligenciaPrice,
    assinaturaPrice,
    payPrice,
    segurosPrice,
    cashPrice,
    vipSupportPrice,
    dedicatedCSPrice,
    totalMonthly,
    implementation,
    annualEquivalent,
  };
};

/**
 * Create an unavailable column (grayed out)
 */
const createUnavailableColumn = (
  id: KomboId,
  name: string,
  shortName: string
): KomboColumnData => ({
  id,
  name,
  shortName,
  discount: 0,
  isAvailable: false,
  isRecommended: false,
  imobPrice: null,
  locPrice: null,
  leadsPrice: null,
  inteligenciaPrice: null,
  assinaturaPrice: null,
  payPrice: null,
  segurosPrice: null,
  cashPrice: null,
  vipSupportPrice: null,
  dedicatedCSPrice: null,
  totalMonthly: 0,
  implementation: 0,
  annualEquivalent: 0,
});

// ============================================================================
// COMPONENT
// ============================================================================

export function KomboComparisonTable(props: KomboComparisonProps) {
  // Default to annual as reference (0%)
  const [viewMode, setViewMode] = useState<ViewMode>("annual");
  
  // Selected Kombo (user can manually select)
  const [selectedKombo, setSelectedKombo] = useState<KomboId | null>(null);

  // Determine recommended Kombo (auto-detected)
  const autoRecommendedKombo = getRecommendedKombo(props.product, props.addons);
  
  // Use selected if available, otherwise use auto-recommended
  const recommendedKombo = selectedKombo || autoRecommendedKombo;

  // Create modified props with viewMode as frequency for calculations
  const propsWithFrequency = { ...props, frequency: viewMode as PaymentFrequency };

  // Calculate all columns using the selected frequency
  const columns: KomboColumnData[] = [
    calculateKomboColumn("none", propsWithFrequency, recommendedKombo),
    calculateKomboColumn("imob_start", propsWithFrequency, recommendedKombo),
    calculateKomboColumn("imob_pro", propsWithFrequency, recommendedKombo),
    calculateKomboColumn("locacao_pro", propsWithFrequency, recommendedKombo),
    calculateKomboColumn("core_gestao", propsWithFrequency, recommendedKombo),
    calculateKomboColumn("elite", propsWithFrequency, recommendedKombo),
  ];

  // Row definitions for the table
  // Include plan name (K2) in red for Imob and Loc rows
  const imobLabel = props.product === "imob" || props.product === "both" 
    ? <span>Imob - <span className="text-primary font-bold">{props.imobPlan.toUpperCase()}</span></span>
    : "Imob";
  const locLabel = props.product === "loc" || props.product === "both"
    ? <span>Loc - <span className="text-primary font-bold">{props.locPlan.toUpperCase()}</span></span>
    : "Loc";

  const rows = [
    { key: "products", label: "Produtos", isHeader: true },
    { key: "imob", label: imobLabel, indent: true },
    { key: "loc", label: locLabel, indent: true },
    { key: "addons", label: "Add-ons", isHeader: true },
    { key: "leads", label: "Leads", indent: true },
    { key: "inteligencia", label: "Inteligência", indent: true },
    { key: "assinatura", label: "Assinatura", indent: true },
    { key: "premium", label: "Serviços Premium", isHeader: true },
    { key: "vipSupport", label: "Suporte VIP", indent: true },
    { key: "dedicatedCS", label: "CS Dedicado", indent: true },
    { key: "totalMonthly", label: "Total Mensal", isTotal: true },
    { key: "implementation", label: "Implantação", isHeaderWithValue: true },
    { key: "annualEquivalent", label: "Anual Equivalente", isTotal: true },
  ];

  /**
   * Get cell value for a specific row and column
   * Always shows values even when Kombo is not available (for comparison)
   */
  const getCellValue = (rowKey: string, column: KomboColumnData): React.ReactNode => {
    // Helper to render price - all values in normal gray/black color
    const renderPrice = (price: number | null) => {
      if (price === null) return <span className="text-gray-300">—</span>;
      const priceStr = `R$ ${formatCurrency(price)}`;
      return <span className="font-medium text-gray-700">{priceStr}</span>;
    };

    switch (rowKey) {
      case "imob":
        return renderPrice(column.imobPrice);
      case "loc":
        return renderPrice(column.locPrice);
      case "leads":
        return renderPrice(column.leadsPrice);
      case "inteligencia":
        return renderPrice(column.inteligenciaPrice);
      case "assinatura":
        return renderPrice(column.assinaturaPrice);
      case "pay":
        return column.payPrice || <span className="text-gray-300">—</span>;
      case "seguros":
        return column.segurosPrice || <span className="text-gray-300">—</span>;
      case "cash":
        return column.cashPrice || <span className="text-gray-300">—</span>;
      case "vipSupport":
        if (column.vipSupportPrice === "Incluído") {
          return <span className="text-green-600 font-semibold">Incluído</span>;
        }
        return typeof column.vipSupportPrice === "number"
          ? <span className="font-medium">R$ {formatCurrency(column.vipSupportPrice)}</span>
          : <span className="text-gray-300">—</span>;
      case "dedicatedCS":
        if (column.dedicatedCSPrice === "Incluído") {
          return <span className="text-green-600 font-semibold">Incluído</span>;
        }
        return typeof column.dedicatedCSPrice === "number"
          ? <span className="font-medium">R$ {formatCurrency(column.dedicatedCSPrice)}</span>
          : <span className="text-gray-300">—</span>;
      case "totalMonthly":
        return <span className="font-bold">R$ {formatCurrency(column.totalMonthly)}</span>;
      case "implementation":
        return <span className="font-medium">R$ {formatCurrency(column.implementation)}</span>;
      case "annualEquivalent":
        return <span className="font-bold">R$ {formatCurrency(column.annualEquivalent)}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-3">
        4. Sua Seleção vs Kombos
      </h2>

      <Card>
        <CardContent className="p-4">
          {/* Frequency Selector - 4 Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6">
            {FREQUENCY_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setViewMode(option.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  viewMode === option.id
                    ? "bg-pink-50 border-primary text-primary"
                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className={`text-lg font-semibold ${
                  viewMode === option.id ? "text-primary" : "text-gray-900"
                }`}>
                  {option.label}
                </span>
                <span className={`text-sm mt-1 px-3 py-0.5 rounded-full ${
                  viewMode === option.id
                    ? "bg-pink-100 text-primary"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {option.discount}
                </span>
              </button>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 w-[180px]"></th>
                  {columns.map((col) => {
                    // Get tooltip data only for valid kombo keys (not "none")
                    const tooltipData = col.id !== "none" && col.id in KOMBO_DEFINITIONS
                      ? KOMBO_DEFINITIONS[col.id as Exclude<KomboId, "none">]?.tooltipInfo
                      : null;
                    
                    return (
                      <th
                        key={col.id}
                        onClick={() => setSelectedKombo(col.id)}
                        className={`text-center py-4 px-3 min-w-[130px] cursor-pointer hover:bg-gray-50 transition-colors ${
                          col.isRecommended
                            ? "bg-green-50 border-t-2 border-l-2 border-r-2 border-green-500 rounded-t-xl"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          {col.isRecommended && (
                            <Badge className="bg-green-500 text-white text-[10px] px-2 py-0.5">
                              <Star className="w-3 h-3 mr-1" />
                              Recomendado
                            </Badge>
                          )}
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
                          {col.discount > 0 && (
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                              {Math.round(col.discount * 100)}% OFF
                            </Badge>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={row.key}
                    className={
                      row.isHeader || row.isHeaderWithValue
                        ? "bg-blue-50/70 border-t-2 border-b-2 border-gray-200"
                        : row.isTotal
                        ? "bg-gray-100/70 border-b border-gray-200"
                        : "border-b border-gray-100 hover:bg-gray-50/30"
                    }
                  >
                    <td
                      className={`py-3 px-4 ${row.indent ? "pl-8" : ""} ${
                        row.isHeader || row.isHeaderWithValue
                          ? "font-semibold text-gray-700 text-sm" 
                          : row.isTotal
                          ? "font-bold text-gray-700"
                          : "text-gray-600"
                      }`}
                    >
                      {row.label}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={`${row.key}-${col.id}`}
                        className={`text-center py-3 px-3 ${
                          col.isRecommended
                            ? "bg-green-50 border-l-2 border-r-2 border-green-500"
                            : ""
                        } ${
                          row.isTotal || row.isHeaderWithValue
                            ? "font-bold text-gray-700"
                            : "text-gray-700"
                        }`}
                      >
                        {row.isHeader ? null : getCellValue(row.key, col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Anual Equivalente:</strong> Inclui 12 meses de mensalidade + custo de implantação (única vez).
              {viewMode === "annual" && " Valores exibidos em base anual."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default KomboComparisonTable;
