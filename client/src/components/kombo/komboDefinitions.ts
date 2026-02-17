/**
 * Kombo definitions, availability rules, recommendation logic, and banner config.
 */

import { Building2, Home, Layers } from "lucide-react";
import type { ProductSelection, KomboId, KomboComparisonProps } from "./komboComparisonTypes";
import { KOMBOS, ADDONS, IMOB_IMPLEMENTATION } from "@shared/pricing-config";

/** Format implementation text dynamically from config */
const formatImpl = (komboKey: keyof typeof KOMBOS) => {
  const impl = KOMBOS[komboKey].implementation;
  const freeImpls = KOMBOS[komboKey].freeImplementations;
  const freeNames = freeImpls.length > 0 ? ` (${freeImpls.join(" + ")} grátis)` : "";
  return `R$ ${impl.toLocaleString("pt-BR")}${freeNames}`;
};

export interface KomboDefinition {
  name: string;
  shortName: string;
  discount: number;
  products: ProductSelection[];
  includedAddons: string[];
  includesPremiumServices: boolean;
  includesTraining: boolean;
  freeImplementations: string[];
  tooltipInfo: {
    description: string;
    includes: string[];
    discountText: string;
    premiumServices: string;
    implementation: string;
  };
}

export const KOMBO_DEFINITIONS: Record<Exclude<KomboId, "none">, KomboDefinition> = {
  imob_start: {
    name: "Kombo Imob Start",
    shortName: "Imob Start",
    discount: 0.10,
    products: ["imob"],
    includedAddons: ["leads", "assinatura"],
    includesPremiumServices: false,
    includesTraining: false,
    freeImplementations: ["leads"],
    tooltipInfo: {
      description: "Ideal para imobiliárias focadas em vendas",
      includes: ["Imob", "Leads", "Assinatura"],
      discountText: "10% OFF em todos produtos e add-ons",
      premiumServices: "Não inclui (pagar à parte)",
      implementation: formatImpl("imob-start"),
    },
  },
  imob_pro: {
    name: "Kombo Imob Pro",
    shortName: "Imob Pro",
    discount: 0.15,
    products: ["imob"],
    includedAddons: ["leads", "inteligencia", "assinatura"],
    includesPremiumServices: true,
    includesTraining: true,
    freeImplementations: ["leads", "inteligencia"],
    tooltipInfo: {
      description: "Solução completa para vendas com BI",
      includes: ["Imob", "Leads", "Inteligência", "Assinatura"],
      discountText: "15% OFF em todos produtos e add-ons",
      premiumServices: "VIP + CS Dedicado incluídos",
      implementation: formatImpl("imob-pro"),
    },
  },
  locacao_pro: {
    name: "Kombo Locação Pro",
    shortName: "Loc Pro",
    discount: 0.10,
    products: ["loc"],
    includedAddons: ["inteligencia", "assinatura"],
    includesPremiumServices: true,
    includesTraining: true,
    freeImplementations: ["inteligencia"],
    tooltipInfo: {
      description: "Ideal para gestão de locações com BI",
      includes: ["Locação", "Inteligência", "Assinatura"],
      discountText: "10% OFF em todos produtos e add-ons",
      premiumServices: "VIP + CS Dedicado incluídos",
      implementation: formatImpl("loc-pro"),
    },
  },
  core_gestao: {
    name: "Kombo Core Gestão",
    shortName: "Core Gestão",
    discount: 0,
    products: ["both"],
    includedAddons: [],
    includesPremiumServices: true,
    includesTraining: false,
    freeImplementations: ["imob"],
    tooltipInfo: {
      description: "IMOB + LOC sem add-ons",
      includes: ["Imob", "Locação"],
      discountText: "Desconto conforme tabela",
      premiumServices: "VIP + CS Dedicado incluídos",
      implementation: formatImpl("core-gestao"),
    },
  },
  elite: {
    name: "Kombo Elite",
    shortName: "Elite",
    discount: 0.20,
    products: ["both"],
    includedAddons: ["leads", "inteligencia", "assinatura", "pay", "seguros", "cash"],
    includesPremiumServices: true,
    includesTraining: true,
    freeImplementations: ["imob", "leads", "inteligencia"],
    tooltipInfo: {
      description: "Solução completa com todos os produtos",
      includes: ["Imob", "Locação", "Todos Add-ons"],
      discountText: "20% OFF em todos produtos e add-ons",
      premiumServices: "VIP + CS Dedicado incluídos",
      implementation: formatImpl("elite"),
    },
  },
};

/** Contextual banner config per product type */
export const PRODUCT_BANNER_CONFIG: Record<ProductSelection, { icon: typeof Building2; title: string; description: string; color: string }> = {
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

/** Check if a Kombo is available for the given product selection */
export const isKomboAvailable = (komboId: KomboId, product: ProductSelection): boolean => {
  if (komboId === "none") return true;
  const kombo = KOMBO_DEFINITIONS[komboId];
  return kombo.products.includes(product) ||
    (kombo.products.includes("both" as ProductSelection) && product === "both");
};

/** Determine the recommended Kombo based on user selections */
export const getRecommendedKombo = (
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

/** Get compatible Kombo IDs for a product selection */
export const getCompatibleKomboIds = (product: ProductSelection): KomboId[] => {
  switch (product) {
    case "imob": return ["imob_start", "imob_pro"];
    case "loc": return ["locacao_pro"];
    case "both": return ["core_gestao", "elite"];
    default: return [];
  }
};
