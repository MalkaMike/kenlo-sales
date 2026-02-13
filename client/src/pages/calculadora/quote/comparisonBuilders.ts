/**
 * comparisonBuilders.ts
 * Pure utility functions for building kombo and frequency comparison
 * data structures for PDF generation.
 */

import {
  KOMBOS,
  PAYMENT_FREQUENCY_MULTIPLIERS,
  roundToEndIn7,
} from "../types";
import type {
  ProductSelection,
  PaymentFrequency,
  LineItem,
  KomboType,
} from "../types";

// ─── Kombo Comparison (for PDF Section 6) ──────────────────────────────────

export interface KomboComparisonEntry {
  name: string;
  discount: number;
  totalMonthly: number;
  savings: number;
  isSelected: boolean;
  isAvailable: boolean;
}

export function buildKomboComparison(
  lineItems: LineItem[],
  activeKombo: KomboType,
  product: ProductSelection
): string {
  const baseTotalNoKombo = lineItems.reduce(
    (sum, item) => sum + item.priceSemKombo,
    0
  );

  const comparison: KomboComparisonEntry[] = [];

  // "Sem Kombo" entry
  comparison.push({
    name: "Sem Kombo",
    discount: 0,
    totalMonthly: baseTotalNoKombo,
    savings: 0,
    isSelected: activeKombo === "none",
    isAvailable: true,
  });

  // Each Kombo
  Object.entries(KOMBOS).forEach(([key, kombo]) => {
    const isAvailable = kombo.requiredProducts.includes(product);
    const discountFactor = 1 - kombo.discount;
    const komboTotal = Math.round(baseTotalNoKombo * discountFactor);
    comparison.push({
      name: kombo.name,
      discount: Math.round(kombo.discount * 100),
      totalMonthly: komboTotal,
      savings: baseTotalNoKombo - komboTotal,
      isSelected: activeKombo === key,
      isAvailable,
    });
  });

  return JSON.stringify(comparison);
}

// ─── Frequency Comparison (for PDF Section 5) ─────────────────────────────

export interface FrequencyComparisonEntry {
  name: string;
  monthlyEquivalent: number;
  isSelected: boolean;
}

export function buildFrequencyComparison(
  lineItems: LineItem[],
  komboInfo: (typeof KOMBOS)[keyof typeof KOMBOS] | null,
  frequency: PaymentFrequency
): string {
  const baseTotalNoKombo = lineItems.reduce(
    (sum, item) => sum + item.priceSemKombo,
    0
  );
  const komboFactor = komboInfo ? 1 - komboInfo.discount : 1;
  const baseAnnual = Math.round(baseTotalNoKombo * komboFactor);

  const freqs = [
    { name: "Mensal", key: "monthly", multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.monthly },
    { name: "Semestral", key: "semestral", multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.semestral },
    { name: "Anual", key: "annual", multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.annual },
    { name: "Bienal", key: "biennial", multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.biennial },
  ];

  return JSON.stringify(
    freqs.map((f) => ({
      name: f.name,
      monthlyEquivalent: roundToEndIn7(Math.round(baseAnnual * f.multiplier)),
      isSelected: frequency === f.key,
    }))
  );
}
