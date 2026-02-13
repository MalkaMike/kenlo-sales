/**
 * Unit tests for comparisonBuilders.ts and proposalHelpers.ts
 * Tests the pure utility functions used by buildProposalData for PDF generation.
 */

import { describe, it, expect } from "vitest";

import {
  buildKomboComparison,
  buildFrequencyComparison,
} from "../client/src/pages/calculadora/quote/comparisonBuilders";
import type { KomboComparisonEntry, FrequencyComparisonEntry } from "../client/src/pages/calculadora/quote/comparisonBuilders";

import {
  classifyAddons,
  calculatePremiumServices,
  calculateRevenue,
  getProductPrice,
  getAddonPrices,
} from "../client/src/pages/calculadora/quote/proposalHelpers";

import { KOMBOS } from "../client/src/pages/calculadora/types";
import type { LineItem, MetricsState, AddonsState } from "../client/src/pages/calculadora/types";

// ─── Test Helpers ─────────────────────────────────────────────────────────────

function makeLineItems(): LineItem[] {
  return [
    { name: "Imob Prime", priceSemKombo: 497, priceComKombo: 447 },
    { name: "Loc Prime", priceSemKombo: 497, priceComKombo: 447 },
    { name: "Leads", priceSemKombo: 297, priceComKombo: 267 },
    { name: "Inteligência", priceSemKombo: 197, priceComKombo: 177 },
    { name: "Assinatura", priceSemKombo: 97, priceComKombo: 87 },
  ];
}

function makeMetrics(overrides: Partial<MetricsState> = {}): MetricsState {
  return {
    imobUsers: 2,
    closingsPerMonth: 5,
    leadsPerMonth: 50,
    usesExternalAI: false,
    externalAIName: "",
    wantsWhatsApp: false,
    imobVipSupport: false,
    imobDedicatedCS: false,
    contractsUnderManagement: 100,
    newContractsPerMonth: 5,
    locVipSupport: false,
    locDedicatedCS: false,
    chargesBoletoToTenant: false,
    boletoChargeAmount: 0,
    chargesSplitToOwner: false,
    splitChargeAmount: 0,
    ...overrides,
  };
}

function makeAddons(overrides: Partial<AddonsState> = {}): AddonsState {
  return {
    leads: false,
    inteligencia: false,
    assinatura: false,
    pay: false,
    seguros: false,
    cash: false,
    ...overrides,
  };
}

// ─── classifyAddons ───────────────────────────────────────────────────────────

describe("proposalHelpers - classifyAddons", () => {
  it("should classify all addons as compatible for both product", () => {
    const result = classifyAddons(
      ["leads", "inteligencia", "assinatura", "pay", "seguros"],
      "both"
    );
    expect(result.compatible).toEqual(["leads", "inteligencia", "assinatura", "pay", "seguros"]);
    expect(result.incompatible).toEqual([]);
  });

  it("should classify leads as imob-compatible only", () => {
    const imobResult = classifyAddons(["leads"], "imob");
    expect(imobResult.compatible).toEqual(["leads"]);

    const locResult = classifyAddons(["leads"], "loc");
    expect(locResult.incompatible).toEqual(["leads"]);
  });

  it("should classify pay as loc-compatible only", () => {
    const locResult = classifyAddons(["pay"], "loc");
    expect(locResult.compatible).toEqual(["pay"]);

    const imobResult = classifyAddons(["pay"], "imob");
    expect(imobResult.incompatible).toEqual(["pay"]);
  });

  it("should classify inteligencia as compatible with both imob and loc", () => {
    expect(classifyAddons(["inteligencia"], "imob").compatible).toEqual(["inteligencia"]);
    expect(classifyAddons(["inteligencia"], "loc").compatible).toEqual(["inteligencia"]);
  });

  it("should classify seguros as loc-compatible only", () => {
    expect(classifyAddons(["seguros"], "loc").compatible).toEqual(["seguros"]);
    expect(classifyAddons(["seguros"], "imob").incompatible).toEqual(["seguros"]);
  });

  it("should handle mixed compatible/incompatible for imob", () => {
    const result = classifyAddons(["leads", "pay", "assinatura", "seguros"], "imob");
    expect(result.compatible).toEqual(["leads", "assinatura"]);
    expect(result.incompatible).toEqual(["pay", "seguros"]);
  });
});

// ─── calculatePremiumServices ─────────────────────────────────────────────────

describe("proposalHelpers - calculatePremiumServices", () => {
  it("should include premium for all Kombos", () => {
    const komboKeys = Object.keys(KOMBOS) as (keyof typeof KOMBOS)[];
    for (const key of komboKeys) {
      const result = calculatePremiumServices(KOMBOS[key], makeMetrics());
      expect(result.hasPremiumIncluded).toBe(true);
      expect(result.premiumServicesPrice).toBe(0);
    }
  });

  it("should charge premium when no kombo and VIP support selected", () => {
    const result = calculatePremiumServices(null, makeMetrics({ imobVipSupport: true }));
    expect(result.hasPremiumIncluded).toBe(false);
    expect(result.premiumServicesPrice).toBe(97);
  });

  it("should charge premium when no kombo and CS Dedicado selected", () => {
    const result = calculatePremiumServices(null, makeMetrics({ imobDedicatedCS: true }));
    expect(result.hasPremiumIncluded).toBe(false);
    expect(result.premiumServicesPrice).toBe(297);
  });

  it("should charge both VIP and CS when no kombo", () => {
    const result = calculatePremiumServices(
      null,
      makeMetrics({ imobVipSupport: true, imobDedicatedCS: true })
    );
    // 97 (VIP) + 297 (CS) = 394
    expect(result.premiumServicesPrice).toBe(394);
  });

  it("should return 0 when no kombo and no premium selected", () => {
    const result = calculatePremiumServices(null, makeMetrics());
    expect(result.premiumServicesPrice).toBe(0);
  });
});

// ─── calculateRevenue ─────────────────────────────────────────────────────────

describe("proposalHelpers - calculateRevenue", () => {
  it("should return zeros when no revenue addons", () => {
    const result = calculateRevenue("loc", makeAddons(), makeMetrics());
    expect(result.revenueFromBoletos).toBe(0);
    expect(result.revenueFromInsurance).toBe(0);
  });

  it("should calculate boleto revenue", () => {
    const result = calculateRevenue(
      "loc",
      makeAddons({ pay: true }),
      makeMetrics({ contractsUnderManagement: 100, chargesBoletoToTenant: true, boletoChargeAmount: 5 })
    );
    expect(result.revenueFromBoletos).toBe(500);
  });

  it("should calculate split revenue", () => {
    const result = calculateRevenue(
      "loc",
      makeAddons({ pay: true }),
      makeMetrics({ contractsUnderManagement: 100, chargesSplitToOwner: true, splitChargeAmount: 3 })
    );
    expect(result.revenueFromBoletos).toBe(300);
  });

  it("should calculate insurance revenue at R$10/contract", () => {
    const result = calculateRevenue(
      "loc",
      makeAddons({ seguros: true }),
      makeMetrics({ contractsUnderManagement: 200 })
    );
    expect(result.revenueFromInsurance).toBe(2000);
  });

  it("should not calculate revenue for imob-only", () => {
    const result = calculateRevenue(
      "imob",
      makeAddons({ pay: true, seguros: true }),
      makeMetrics({ contractsUnderManagement: 100, chargesBoletoToTenant: true, boletoChargeAmount: 5 })
    );
    expect(result.revenueFromBoletos).toBe(0);
    expect(result.revenueFromInsurance).toBe(0);
  });
});

// ─── getProductPrice / getAddonPrices ─────────────────────────────────────────

describe("proposalHelpers - getProductPrice", () => {
  it("should return kombo price when activeKombo is not none", () => {
    const items = makeLineItems();
    expect(getProductPrice(items, "Imob", "imob_start")).toBe(447);
    expect(getProductPrice(items, "Loc", "imob_start")).toBe(447);
  });

  it("should return sem-kombo price when activeKombo is none", () => {
    const items = makeLineItems();
    expect(getProductPrice(items, "Imob", "none")).toBe(497);
    expect(getProductPrice(items, "Loc", "none")).toBe(497);
  });

  it("should return undefined for missing product", () => {
    const items = makeLineItems();
    expect(getProductPrice(items, "Missing", "none")).toBeUndefined();
  });
});

describe("proposalHelpers - getAddonPrices", () => {
  it("should return addon prices as JSON when addons have prices", () => {
    const items = makeLineItems();
    const result = getAddonPrices(items, "none");
    expect(result).toBeDefined();
    const parsed = JSON.parse(result!);
    expect(parsed.leads).toBe(297);
    expect(parsed.inteligencia).toBe(197);
    expect(parsed.assinatura).toBe(97);
  });

  it("should use kombo prices when activeKombo is not none", () => {
    const items = makeLineItems();
    const result = getAddonPrices(items, "elite");
    const parsed = JSON.parse(result!);
    expect(parsed.leads).toBe(267);
    expect(parsed.inteligencia).toBe(177);
    expect(parsed.assinatura).toBe(87);
  });

  it("should return undefined when no addon line items exist", () => {
    const items = [
      { name: "Imob Prime", priceSemKombo: 497, priceComKombo: 447 },
    ];
    expect(getAddonPrices(items, "none")).toBeUndefined();
  });

  it("should exclude addons with zero price", () => {
    const items = [
      { name: "Leads", priceSemKombo: 0, priceComKombo: 0 },
      { name: "Inteligência", priceSemKombo: 197, priceComKombo: 177 },
    ];
    const result = getAddonPrices(items, "none");
    const parsed = JSON.parse(result!);
    expect(parsed.leads).toBeUndefined();
    expect(parsed.inteligencia).toBe(197);
  });
});

// ─── buildKomboComparison ─────────────────────────────────────────────────────

describe("comparisonBuilders - buildKomboComparison", () => {
  it("should include Sem Kombo entry first", () => {
    const items = makeLineItems();
    const result: KomboComparisonEntry[] = JSON.parse(
      buildKomboComparison(items, "none", "both")
    );
    expect(result[0].name).toBe("Sem Kombo");
    expect(result[0].discount).toBe(0);
    expect(result[0].isSelected).toBe(true);
    expect(result[0].savings).toBe(0);
  });

  it("should include all kombos plus Sem Kombo", () => {
    const items = makeLineItems();
    const result: KomboComparisonEntry[] = JSON.parse(
      buildKomboComparison(items, "none", "both")
    );
    // 1 (Sem Kombo) + number of kombos
    expect(result.length).toBe(1 + Object.keys(KOMBOS).length);
  });

  it("should mark the active kombo as selected", () => {
    const items = makeLineItems();
    const result: KomboComparisonEntry[] = JSON.parse(
      buildKomboComparison(items, "elite", "both")
    );
    const semKombo = result.find((r) => r.name === "Sem Kombo");
    expect(semKombo?.isSelected).toBe(false);
    const elite = result.find((r) => r.name === KOMBOS.elite.name);
    expect(elite?.isSelected).toBe(true);
  });

  it("should calculate savings correctly", () => {
    const items = makeLineItems();
    const baseTotalNoKombo = items.reduce((s, i) => s + i.priceSemKombo, 0);
    const result: KomboComparisonEntry[] = JSON.parse(
      buildKomboComparison(items, "none", "both")
    );
    for (const entry of result) {
      if (entry.name === "Sem Kombo") continue;
      expect(entry.savings).toBe(baseTotalNoKombo - entry.totalMonthly);
      expect(entry.savings).toBeGreaterThanOrEqual(0);
    }
  });

  it("should mark availability based on product type", () => {
    const items = makeLineItems();
    const result: KomboComparisonEntry[] = JSON.parse(
      buildKomboComparison(items, "none", "imob")
    );
    // Kombos that require "both" should not be available for "imob"
    const coreGestao = result.find((r) => r.name === KOMBOS.core_gestao.name);
    expect(coreGestao?.isAvailable).toBe(false);
    const elite = result.find((r) => r.name === KOMBOS.elite.name);
    expect(elite?.isAvailable).toBe(false);
  });
});

// ─── buildFrequencyComparison ─────────────────────────────────────────────────

describe("comparisonBuilders - buildFrequencyComparison", () => {
  it("should return 4 frequency entries", () => {
    const items = makeLineItems();
    const result: FrequencyComparisonEntry[] = JSON.parse(
      buildFrequencyComparison(items, null, "annual")
    );
    expect(result.length).toBe(4);
    expect(result.map((r) => r.name)).toEqual(["Mensal", "Semestral", "Anual", "Bienal"]);
  });

  it("should mark the selected frequency", () => {
    const items = makeLineItems();
    const result: FrequencyComparisonEntry[] = JSON.parse(
      buildFrequencyComparison(items, null, "semestral")
    );
    expect(result.find((r) => r.name === "Semestral")?.isSelected).toBe(true);
    expect(result.find((r) => r.name === "Anual")?.isSelected).toBe(false);
  });

  it("should have monthly > semestral > annual > biennial prices", () => {
    const items = makeLineItems();
    const result: FrequencyComparisonEntry[] = JSON.parse(
      buildFrequencyComparison(items, null, "annual")
    );
    expect(result[0].monthlyEquivalent).toBeGreaterThan(result[1].monthlyEquivalent);
    expect(result[1].monthlyEquivalent).toBeGreaterThan(result[2].monthlyEquivalent);
    expect(result[2].monthlyEquivalent).toBeGreaterThan(result[3].monthlyEquivalent);
  });

  it("should apply kombo discount to base before frequency", () => {
    const items = makeLineItems();
    const noKombo: FrequencyComparisonEntry[] = JSON.parse(
      buildFrequencyComparison(items, null, "annual")
    );
    const withKombo: FrequencyComparisonEntry[] = JSON.parse(
      buildFrequencyComparison(items, KOMBOS.elite, "annual")
    );
    // Elite has 20% discount, so all prices should be lower
    for (let i = 0; i < 4; i++) {
      expect(withKombo[i].monthlyEquivalent).toBeLessThan(noKombo[i].monthlyEquivalent);
    }
  });

  it("should round all prices to end in 7", () => {
    const items = makeLineItems();
    const result: FrequencyComparisonEntry[] = JSON.parse(
      buildFrequencyComparison(items, null, "annual")
    );
    for (const entry of result) {
      expect(entry.monthlyEquivalent % 10).toBe(7);
    }
  });
});
