/**
 * useKomboRecommendation - Kombo recommendation engine
 * Extracted from useCalculadora for better modularity
 */

import { useCallback, useMemo } from "react";
import * as Pricing from "@/utils/pricing";
import {
  type ProductSelection,
  type AddonsState,
  type KomboType,
  type LineItem,
  KOMBOS,
} from "../types";

interface UseKomboRecommendationParams {
  activeKombo: KomboType;
  addons: AddonsState;
  product: ProductSelection;
  getLineItems: () => LineItem[];
}

export function useKomboRecommendation({
  activeKombo,
  addons,
  product,
  getLineItems,
}: UseKomboRecommendationParams) {
  const recommendBestKombo = useCallback((): { kombo: KomboType; savings: number; message: string } | null => {
    if (activeKombo !== "none") return null;

    const currentActiveAddons = Object.entries(addons)
      .filter(([_, enabled]) => enabled)
      .map(([name, _]) => name as keyof AddonsState);

    const currentCost = getLineItems().reduce((sum, item) => sum + item.priceSemKombo, 0);

    let bestKombo: KomboType | null = null;
    let bestSavings = 0;
    let bestMessage = "";

    Object.entries(KOMBOS).forEach(([komboKey, kombo]) => {
      const komboType = komboKey as KomboType;
      if (!kombo.requiredProducts.includes(product)) return;

      const missingAddons = kombo.requiredAddons.filter(
        addon => !currentActiveAddons.includes(addon as keyof AddonsState)
      );

      if ('forbiddenAddons' in kombo && kombo.forbiddenAddons?.some((addon: string) => currentActiveAddons.includes(addon as keyof AddonsState))) return;

      const komboDiscount = 1 - kombo.discount;
      let projectedCost = currentCost * komboDiscount;

      missingAddons.forEach(addon => {
        if (addon === "leads") projectedCost += Pricing.getAddonAnnualPrice('leads') * komboDiscount;
        if (addon === "inteligencia") projectedCost += Pricing.getAddonAnnualPrice('inteligencia') * komboDiscount;
        if (addon === "assinatura") projectedCost += 0;
        if (addon === "pay") projectedCost += 0;
      });

      const savings = currentCost - projectedCost;

      if (savings > 50 && savings > bestSavings) {
        bestKombo = komboType;
        bestSavings = savings;

        if (missingAddons.length === 0) {
          bestMessage = `Ative o ${kombo.name} e economize R$${Math.round(bestSavings).toLocaleString('pt-BR')}/mês!`;
        } else {
          const addonNames = missingAddons.map(a => {
            if (a === "leads") return "Leads";
            if (a === "inteligencia") return "Inteligência";
            if (a === "assinatura") return "Assinatura";
            if (a === "pay") return "Pay";
            return a;
          }).join(", ");
          bestMessage = `Adicione ${addonNames} e ative o ${kombo.name} para economizar R$${Math.round(bestSavings).toLocaleString('pt-BR')}/mês!`;
        }
      }
    });

    return bestKombo ? { kombo: bestKombo, savings: bestSavings, message: bestMessage } : null;
  }, [activeKombo, addons, product, getLineItems]);

  const komboRecommendation = useMemo(() => recommendBestKombo(), [recommendBestKombo]);

  return {
    komboRecommendation,
  };
}
