/**
 * proposalHelpers.ts
 * Pure utility functions for addon classification, premium services calculation,
 * revenue calculation, and line item price extraction.
 */

import * as Pricing from "@/utils/pricing";
import { toNum } from "../types";
import type {
  ProductSelection,
  AddonsState,
  MetricsState,
  LineItem,
  KomboType,
} from "../types";
import { KOMBOS } from "../types";

// ─── Addon Compatibility ───────────────────────────────────────────────────

export function classifyAddons(
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

// ─── Premium Services ──────────────────────────────────────────────────────

export function calculatePremiumServices(
  komboInfo: (typeof KOMBOS)[keyof typeof KOMBOS] | null,
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

// ─── Revenue Calculation ───────────────────────────────────────────────────

export function calculateRevenue(
  product: ProductSelection,
  addons: AddonsState,
  metrics: MetricsState
): { revenueFromBoletos: number; revenueFromInsurance: number } {
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

// ─── Line Item Price Extraction ────────────────────────────────────────────

export function getProductPrice(
  lineItems: LineItem[],
  prefix: string,
  activeKombo: KomboType
): number | undefined {
  const item = lineItems.find((it) => it.name.startsWith(prefix));
  if (!item) return undefined;
  return activeKombo !== "none" ? item.priceComKombo : item.priceSemKombo;
}

export function getAddonPrices(
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
