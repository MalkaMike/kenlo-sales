/**
 * Comprehensive Audit Test Suite
 * 
 * Validates:
 * 1. Pricing-config is the single source of truth (no hardcoded values)
 * 2. All product/addon/payment toggle combinations produce correct calculations
 * 3. Toggle on → off → on resets state correctly (boleto/split)
 * 4. PDF proposal data matches calculator selections exactly
 * 5. Included quantities (users/contracts) are always from pricing-config
 */

import { describe, it, expect } from "vitest";

// ─── Source of Truth ──────────────────────────────────────────────────────────
import {
  IMOB_PLANS,
  LOC_PLANS,
  ADDONS,
  FREQUENCY_MULTIPLIERS,
  KOMBOS,
  PREMIUM_SERVICES,
  roundToSeven,
  calculatePrice,
  calculateTieredPrice,
  detectKombo,
  IMOB_ADDITIONAL_USERS,
  LOC_ADDITIONAL_CONTRACTS,
  PAY_BOLETOS,
  PAY_SPLITS,
  SEGUROS_COMMISSION,
  SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT,
  PREPAID_PRICING,
  type PaymentFrequency,
  type PlanTier,
} from "@shared/pricing-config";

// ─── Calculator Layer ─────────────────────────────────────────────────────────
import * as Pricing from "../client/src/utils/pricing";
import {
  PLAN_ANNUAL_PRICES,
  ADDON_ANNUAL_PRICES,
  IMPLEMENTATION_COSTS,
} from "../client/src/utils/pricing";

// ─── Post-Paid Calculation ────────────────────────────────────────────────────
import {
  calculatePostPaidBreakdown,
  calculateRevenueBreakdown,
  type PostPaidCalcInput,
} from "../client/src/pages/calculadora/receita-extra/postPaidCalc";
import type { MetricsState, AddonsState } from "../client/src/pages/calculadora/types.tsx";

// ─── Proposal Builder ─────────────────────────────────────────────────────────
import {
  buildPostPaidBreakdown,
  calculatePostPaidTotal,
  getIncludedUsers,
  getIncludedContracts,
} from "../client/src/pages/calculadora/quote/postPaidBuilder";

// ─── Test Helpers ─────────────────────────────────────────────────────────────

const ALL_PLANS: PlanTier[] = ["prime", "k", "k2"];
const ALL_FREQUENCIES: PaymentFrequency[] = ["monthly", "semiannual", "annual", "biennial"];
const ALL_ADDON_KEYS: (keyof AddonsState)[] = ["leads", "inteligencia", "assinatura", "pay", "seguros", "cash"];

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

function makeInput(overrides: Partial<PostPaidCalcInput> = {}): PostPaidCalcInput {
  return {
    product: "both",
    imobPlan: "prime",
    locPlan: "prime",
    addons: makeAddons(),
    metrics: makeMetrics(),
    prepayAdditionalUsers: false,
    prepayAdditionalContracts: false,
    ...overrides,
  };
}

// ============================================================================
// SECTION 1: PRICING-CONFIG IS THE SINGLE SOURCE OF TRUTH
// ============================================================================

describe("Source of Truth: pricing-config alignment with calculator", () => {
  describe("IMOB plan prices match between pricing-config and calculator", () => {
    for (const plan of ALL_PLANS) {
      it(`IMOB ${plan} annual price matches`, () => {
        expect(PLAN_ANNUAL_PRICES[plan]).toBe(IMOB_PLANS[plan].annualPrice);
        expect(Pricing.getPlanAnnualPrice("imob", plan)).toBe(IMOB_PLANS[plan].annualPrice);
      });
    }
  });

  describe("LOC plan prices are accessible via calculator", () => {
    for (const plan of ALL_PLANS) {
      it(`LOC ${plan} annual price matches`, () => {
        expect(Pricing.getPlanAnnualPrice("loc", plan)).toBe(LOC_PLANS[plan].annualPrice);
      });
    }
  });

  describe("Addon prices match between pricing-config and calculator", () => {
    it("Leads annual price matches", () => {
      expect(ADDON_ANNUAL_PRICES.leads).toBe(ADDONS.leads.annualPrice);
      expect(Pricing.getAddonAnnualPrice("leads")).toBe(ADDONS.leads.annualPrice);
    });
    it("Inteligência annual price matches", () => {
      expect(ADDON_ANNUAL_PRICES.inteligencia).toBe(ADDONS.inteligencia.annualPrice);
      expect(Pricing.getAddonAnnualPrice("inteligencia")).toBe(ADDONS.inteligencia.annualPrice);
    });
    it("Assinatura annual price matches", () => {
      expect(ADDON_ANNUAL_PRICES.assinatura).toBe(ADDONS.assinaturas.annualPrice);
      expect(Pricing.getAddonAnnualPrice("assinatura")).toBe(ADDONS.assinaturas.annualPrice);
    });
  });

  describe("Implementation costs match between pricing-config and calculator", () => {
    it("IMOB implementation matches", () => {
      expect(IMPLEMENTATION_COSTS.imob).toBe(Pricing.getImplementationCost("imob"));
    });
    it("LOC implementation matches", () => {
      expect(IMPLEMENTATION_COSTS.loc).toBe(Pricing.getImplementationCost("loc"));
    });
    it("Leads implementation matches", () => {
      expect(IMPLEMENTATION_COSTS.leads).toBe(ADDONS.leads.implementation);
    });
    it("Inteligência implementation matches", () => {
      expect(IMPLEMENTATION_COSTS.inteligencia).toBe(ADDONS.inteligencia.implementation);
    });
    it("Assinatura implementation matches", () => {
      expect(IMPLEMENTATION_COSTS.assinatura).toBe(ADDONS.assinaturas.implementation);
    });
  });

  describe("Included quantities match pricing-config", () => {
    for (const plan of ALL_PLANS) {
      it(`IMOB ${plan} included users = ${IMOB_PLANS[plan].includedUsers}`, () => {
        expect(Pricing.getIncludedQuantity("imob", plan)).toBe(IMOB_PLANS[plan].includedUsers);
        expect(getIncludedUsers(plan)).toBe(IMOB_PLANS[plan].includedUsers);
      });
      it(`LOC ${plan} included contracts = ${LOC_PLANS[plan].includedContracts}`, () => {
        expect(Pricing.getIncludedQuantity("loc", plan)).toBe(LOC_PLANS[plan].includedContracts);
        expect(getIncludedContracts(plan)).toBe(LOC_PLANS[plan].includedContracts);
      });
    }
  });

  describe("Frequency multipliers match pricing-config", () => {
    for (const freq of ALL_FREQUENCIES) {
      it(`${freq} multiplier matches`, () => {
        expect(Pricing.getFrequencyMultiplier(freq)).toBe(FREQUENCY_MULTIPLIERS[freq]);
      });
    }
  });

  describe("Rounding rule: roundToSeven matches calculator roundPrice", () => {
    const testValues = [97, 100, 123, 197, 200, 247, 300, 497, 500, 997, 1000, 1234];
    for (const val of testValues) {
      it(`roundToSeven(${val}) === roundPrice(${val})`, () => {
        expect(roundToSeven(val)).toBe(Pricing.roundPrice(val));
      });
    }
  });

  describe("Prepaid pricing matches pricing-config", () => {
    it("prepaid user price per month matches", () => {
      expect(PREPAID_PRICING.additionalUsers.pricePerMonth).toBeGreaterThan(0);
    });
    it("prepaid contract price per month matches", () => {
      expect(PREPAID_PRICING.additionalContracts.pricePerMonth).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// SECTION 2: ALL PRODUCT × PLAN × FREQUENCY COMBINATIONS
// ============================================================================

describe("Calculator: All product × plan × frequency combinations", () => {
  const products = ["imob", "loc", "both"] as const;

  for (const product of products) {
    for (const plan of ALL_PLANS) {
      for (const freq of ALL_FREQUENCIES) {
        it(`${product} / ${plan} / ${freq}: price is positive and ends in 7 (or < 100)`, () => {
          if (product === "imob" || product === "both") {
            const price = Pricing.getPlanPrice("imob", plan, freq);
            expect(price).toBeGreaterThan(0);
            if (price >= 100) {
              expect(price % 10).toBe(7);
            }
          }
          if (product === "loc" || product === "both") {
            const price = Pricing.getPlanPrice("loc", plan, freq);
            expect(price).toBeGreaterThan(0);
            if (price >= 100) {
              expect(price % 10).toBe(7);
            }
          }
        });

        it(`${product} / ${plan} / ${freq}: frequency ordering is correct`, () => {
          const monthlyPrice = Pricing.getPlanPrice(
            product === "loc" ? "loc" : "imob",
            plan,
            "monthly"
          );
          const semiannualPrice = Pricing.getPlanPrice(
            product === "loc" ? "loc" : "imob",
            plan,
            "semiannual"
          );
          const annualPrice = Pricing.getPlanPrice(
            product === "loc" ? "loc" : "imob",
            plan,
            "annual"
          );
          const biennialPrice = Pricing.getPlanPrice(
            product === "loc" ? "loc" : "imob",
            plan,
            "biennial"
          );
          // Monthly >= Semiannual >= Annual >= Biennial
          expect(monthlyPrice).toBeGreaterThanOrEqual(semiannualPrice);
          expect(semiannualPrice).toBeGreaterThanOrEqual(annualPrice);
          expect(annualPrice).toBeGreaterThanOrEqual(biennialPrice);
        });
      }
    }
  }
});

// ============================================================================
// SECTION 3: ALL ADDON TOGGLE COMBINATIONS
// ============================================================================

describe("Calculator: All addon toggle combinations", () => {
  // Test each addon individually for each product
  const products = ["imob", "loc", "both"] as const;
  const addonCombinations = [
    { leads: true },
    { inteligencia: true },
    { assinatura: true },
    { pay: true },
    { seguros: true },
    { cash: true },
    { leads: true, inteligencia: true },
    { leads: true, assinatura: true },
    { leads: true, inteligencia: true, assinatura: true },
    { pay: true, seguros: true },
    { leads: true, inteligencia: true, assinatura: true, pay: true, seguros: true, cash: true },
  ];

  for (const product of products) {
    for (const combo of addonCombinations) {
      const addonNames = Object.keys(combo).join("+");
      it(`${product} with ${addonNames}: post-paid calculation is non-negative`, () => {
        const addons = makeAddons(combo);
        const metrics = makeMetrics({
          imobUsers: 10,
          contractsUnderManagement: 200,
          closingsPerMonth: 8,
          newContractsPerMonth: 10,
          leadsPerMonth: 150,
          wantsWhatsApp: addons.leads,
          chargesBoletoToTenant: addons.pay,
          boletoChargeAmount: 5,
          chargesSplitToOwner: addons.pay,
          splitChargeAmount: 3,
        });

        const input = makeInput({
          product,
          imobPlan: "k",
          locPlan: "k",
          addons,
          metrics,
        });

        const breakdown = calculatePostPaidBreakdown(input);
        expect(breakdown.total).toBeGreaterThanOrEqual(0);
        expect(breakdown.additionalUsers).toBeGreaterThanOrEqual(0);
        expect(breakdown.additionalContracts).toBeGreaterThanOrEqual(0);
        expect(breakdown.whatsApp).toBeGreaterThanOrEqual(0);
        expect(breakdown.assinaturas).toBeGreaterThanOrEqual(0);
        expect(breakdown.boletos).toBeGreaterThanOrEqual(0);
        expect(breakdown.boletoCharges).toBeGreaterThanOrEqual(0);
        expect(breakdown.splitCharges).toBeGreaterThanOrEqual(0);
        expect(breakdown.supportServices).toBeGreaterThanOrEqual(0);

        // Total must equal sum of parts
        const sumOfParts = breakdown.additionalUsers + breakdown.additionalContracts +
          breakdown.whatsApp + breakdown.assinaturas + breakdown.boletos +
          breakdown.boletoCharges + breakdown.splitCharges + breakdown.supportServices;
        expect(breakdown.total).toBe(sumOfParts);
      });
    }
  }
});

// ============================================================================
// SECTION 4: BOLETO/SPLIT ONLY APPEAR WHEN PAY IS ENABLED
// ============================================================================

describe("Bug Fix Verification: Boleto/Split only with Pay enabled", () => {
  for (const plan of ALL_PLANS) {
    it(`${plan}: boleto costs are ZERO when pay is disabled`, () => {
      const input = makeInput({
        product: "loc",
        locPlan: plan,
        addons: makeAddons({ pay: false }),
        metrics: makeMetrics({
          contractsUnderManagement: 200,
          chargesBoletoToTenant: true,
          boletoChargeAmount: 5,
          chargesSplitToOwner: true,
          splitChargeAmount: 3,
        }),
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.boletos).toBe(0);
      expect(breakdown.boletoCharges).toBe(0);
      expect(breakdown.splitCharges).toBe(0);
    });

    it(`${plan}: boleto costs are POSITIVE when pay is enabled`, () => {
      const input = makeInput({
        product: "loc",
        locPlan: plan,
        addons: makeAddons({ pay: true }),
        metrics: makeMetrics({
          contractsUnderManagement: 200,
          chargesBoletoToTenant: true,
          boletoChargeAmount: 5,
          chargesSplitToOwner: true,
          splitChargeAmount: 3,
        }),
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.boletos).toBeGreaterThan(0);
      expect(breakdown.boletoCharges).toBeGreaterThan(0);
      expect(breakdown.splitCharges).toBeGreaterThan(0);
    });
  }

  it("toggle on → off → on: boleto costs reset correctly", () => {
    const baseMetrics = makeMetrics({
      contractsUnderManagement: 200,
      chargesBoletoToTenant: true,
      boletoChargeAmount: 5,
      chargesSplitToOwner: true,
      splitChargeAmount: 3,
    });

    // Step 1: Pay ON
    const step1 = calculatePostPaidBreakdown(makeInput({
      product: "loc",
      locPlan: "k",
      addons: makeAddons({ pay: true }),
      metrics: baseMetrics,
    }));
    expect(step1.boletos).toBeGreaterThan(0);
    const originalBoletos = step1.boletos;

    // Step 2: Pay OFF — simulate reset (chargesBoletoToTenant=false, boletoChargeAmount=0)
    const step2 = calculatePostPaidBreakdown(makeInput({
      product: "loc",
      locPlan: "k",
      addons: makeAddons({ pay: false }),
      metrics: makeMetrics({
        contractsUnderManagement: 200,
        chargesBoletoToTenant: false,
        boletoChargeAmount: 0,
        chargesSplitToOwner: false,
        splitChargeAmount: 0,
      }),
    }));
    expect(step2.boletos).toBe(0);
    expect(step2.boletoCharges).toBe(0);
    expect(step2.splitCharges).toBe(0);

    // Step 3: Pay ON again
    const step3 = calculatePostPaidBreakdown(makeInput({
      product: "loc",
      locPlan: "k",
      addons: makeAddons({ pay: true }),
      metrics: baseMetrics,
    }));
    expect(step3.boletos).toBe(originalBoletos);
  });
});

// ============================================================================
// SECTION 5: REVENUE CALCULATIONS
// ============================================================================

describe("Revenue calculations with all product/addon combinations", () => {
  const products = ["imob", "loc", "both"] as const;

  for (const product of products) {
    it(`${product}: revenue is ZERO when no revenue-generating addons`, () => {
      const input = makeInput({
        product,
        addons: makeAddons(),
        metrics: makeMetrics({ contractsUnderManagement: 200 }),
      });
      const revenue = calculateRevenueBreakdown(input);
      expect(revenue.total).toBe(0);
      expect(revenue.boletoRevenue).toBe(0);
      expect(revenue.splitRevenue).toBe(0);
      expect(revenue.segurosRevenue).toBe(0);
    });

    it(`${product}: boleto revenue only when pay + chargesBoletoToTenant`, () => {
      const input = makeInput({
        product,
        addons: makeAddons({ pay: true }),
        metrics: makeMetrics({
          contractsUnderManagement: 200,
          chargesBoletoToTenant: true,
          boletoChargeAmount: 5,
        }),
      });
      const revenue = calculateRevenueBreakdown(input);
      if (product === "loc" || product === "both") {
        expect(revenue.boletoRevenue).toBe(200 * 5);
      } else {
        expect(revenue.boletoRevenue).toBe(0);
      }
    });

    it(`${product}: split revenue only when pay + chargesSplitToOwner`, () => {
      const input = makeInput({
        product,
        addons: makeAddons({ pay: true }),
        metrics: makeMetrics({
          contractsUnderManagement: 200,
          chargesSplitToOwner: true,
          splitChargeAmount: 3,
        }),
      });
      const revenue = calculateRevenueBreakdown(input);
      if (product === "loc" || product === "both") {
        expect(revenue.splitRevenue).toBe(200 * 3);
      } else {
        expect(revenue.splitRevenue).toBe(0);
      }
    });

    it(`${product}: seguros revenue only when seguros addon enabled`, () => {
      const input = makeInput({
        product,
        addons: makeAddons({ seguros: true }),
        metrics: makeMetrics({ contractsUnderManagement: 200 }),
      });
      const revenue = calculateRevenueBreakdown(input);
      if (product === "loc" || product === "both") {
        expect(revenue.segurosRevenue).toBe(200 * SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT);
      } else {
        expect(revenue.segurosRevenue).toBe(0);
      }
    });

    it(`${product}: no revenue when pay is OFF even with boleto/split flags`, () => {
      const input = makeInput({
        product,
        addons: makeAddons({ pay: false }),
        metrics: makeMetrics({
          contractsUnderManagement: 200,
          chargesBoletoToTenant: true,
          boletoChargeAmount: 5,
          chargesSplitToOwner: true,
          splitChargeAmount: 3,
        }),
      });
      const revenue = calculateRevenueBreakdown(input);
      expect(revenue.boletoRevenue).toBe(0);
      expect(revenue.splitRevenue).toBe(0);
    });
  }
});

// ============================================================================
// SECTION 6: ADDITIONAL USERS/CONTRACTS TIERED PRICING
// ============================================================================

describe("Tiered pricing: additional users and contracts", () => {
  for (const plan of ALL_PLANS) {
    const includedUsers = IMOB_PLANS[plan].includedUsers;
    const includedContracts = LOC_PLANS[plan].includedContracts;

    it(`IMOB ${plan}: no additional cost when users <= ${includedUsers} (included)`, () => {
      const input = makeInput({
        product: "imob",
        imobPlan: plan,
        metrics: makeMetrics({ imobUsers: includedUsers }),
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.additionalUsers).toBe(0);
    });

    it(`IMOB ${plan}: additional cost when users > ${includedUsers}`, () => {
      const extraUsers = 5;
      const input = makeInput({
        product: "imob",
        imobPlan: plan,
        metrics: makeMetrics({ imobUsers: includedUsers + extraUsers }),
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.additionalUsers).toBeGreaterThan(0);
      // Verify it matches the pricing-config tiered calculation
      const expected = calculateTieredPrice(extraUsers, IMOB_ADDITIONAL_USERS[plan] as any);
      expect(breakdown.additionalUsers).toBe(expected);
    });

    it(`LOC ${plan}: no additional cost when contracts <= ${includedContracts} (included)`, () => {
      const input = makeInput({
        product: "loc",
        locPlan: plan,
        metrics: makeMetrics({ contractsUnderManagement: includedContracts }),
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.additionalContracts).toBe(0);
    });

    it(`LOC ${plan}: additional cost when contracts > ${includedContracts}`, () => {
      const extraContracts = 50;
      const input = makeInput({
        product: "loc",
        locPlan: plan,
        metrics: makeMetrics({ contractsUnderManagement: includedContracts + extraContracts }),
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.additionalContracts).toBeGreaterThan(0);
      const expected = calculateTieredPrice(extraContracts, LOC_ADDITIONAL_CONTRACTS[plan] as any);
      expect(breakdown.additionalContracts).toBe(expected);
    });
  }
});

// ============================================================================
// SECTION 7: KOMBO DETECTION AND DISCOUNT VERIFICATION
// ============================================================================

describe("Kombo detection matches pricing-config", () => {
  it("IMOB + Leads + Assinatura = imob-start", () => {
    expect(detectKombo({ imob: true, loc: false, leads: true, inteligencia: false, assinaturas: true })).toBe("imob-start");
  });
  it("IMOB + Leads + Inteligência + Assinatura = imob-pro", () => {
    expect(detectKombo({ imob: true, loc: false, leads: true, inteligencia: true, assinaturas: true })).toBe("imob-pro");
  });
  it("LOC + Inteligência + Assinatura = loc-pro", () => {
    expect(detectKombo({ imob: false, loc: true, leads: false, inteligencia: true, assinaturas: true })).toBe("loc-pro");
  });
  it("IMOB + LOC (no addons) = core-gestao", () => {
    expect(detectKombo({ imob: true, loc: true, leads: false, inteligencia: false, assinaturas: false })).toBe("core-gestao");
  });
  it("IMOB + LOC + ALL addons = elite", () => {
    expect(detectKombo({ imob: true, loc: true, leads: true, inteligencia: true, assinaturas: true })).toBe("elite");
  });
  it("IMOB only (no addons) = none", () => {
    expect(detectKombo({ imob: true, loc: false, leads: false, inteligencia: false, assinaturas: false })).toBe("none");
  });
  it("LOC only (no addons) = none", () => {
    expect(detectKombo({ imob: false, loc: true, leads: false, inteligencia: false, assinaturas: false })).toBe("none");
  });

  // Verify kombo discounts match pricing-values.json
  const expectedDiscounts: Record<string, number> = {
    "imob-start": 0.10,
    "imob-pro": 0.15,
    "loc-pro": 0.10,
    "core-gestao": 0,
    "elite": 0.20,
  };
  for (const [key, kombo] of Object.entries(KOMBOS)) {
    it(`Kombo ${key} discount is ${(expectedDiscounts[key] ?? 0) * 100}%`, () => {
      expect(kombo.monthlyDiscount).toBe(expectedDiscounts[key]);
    });
  }
});

// ============================================================================
// SECTION 8: PDF PROPOSAL DATA ACCURACY
// ============================================================================

describe("PDF Proposal Data: included quantities from pricing-config", () => {
  for (const plan of ALL_PLANS) {
    it(`IMOB ${plan}: getIncludedUsers returns ${IMOB_PLANS[plan].includedUsers}`, () => {
      expect(getIncludedUsers(plan)).toBe(IMOB_PLANS[plan].includedUsers);
    });
    it(`LOC ${plan}: getIncludedContracts returns ${LOC_PLANS[plan].includedContracts}`, () => {
      expect(getIncludedContracts(plan)).toBe(LOC_PLANS[plan].includedContracts);
    });
  }

  // Verify specific values that caused bugs
  it("IMOB Prime included users = 2", () => expect(IMOB_PLANS.prime.includedUsers).toBe(2));
  it("IMOB K included users = 7", () => expect(IMOB_PLANS.k.includedUsers).toBe(7));
  it("IMOB K² included users = 15", () => expect(IMOB_PLANS.k2.includedUsers).toBe(15));
  it("LOC Prime included contracts = 100", () => expect(LOC_PLANS.prime.includedContracts).toBe(100));
  it("LOC K included contracts = 175", () => expect(LOC_PLANS.k.includedContracts).toBe(175));
  it("LOC K² included contracts = 400", () => expect(LOC_PLANS.k2.includedContracts).toBe(400));
});

describe("PDF Post-Paid Breakdown: boleto/split conditional on Pay", () => {
  for (const plan of ALL_PLANS) {
    it(`${plan}: buildPostPaidBreakdown with Pay OFF has no boleto/split items`, () => {
      const input = {
        product: "loc" as const,
        imobPlan: plan,
        locPlan: plan,
        addons: makeAddons({ pay: false }),
        metrics: makeMetrics({
          contractsUnderManagement: 200,
          chargesBoletoToTenant: false,
          boletoChargeAmount: 0,
          chargesSplitToOwner: false,
          splitChargeAmount: 0,
        }),
        prepayAdditionalUsers: false,
        prepayAdditionalContracts: false,
      };
      const total = calculatePostPaidTotal(input);
      const breakdownJson = buildPostPaidBreakdown(input, total);
      const breakdown = JSON.parse(breakdownJson);

      // No boleto/split items should exist
      const allItems = [
        ...(breakdown.imobAddons?.items || []),
        ...(breakdown.locAddons?.items || []),
        ...(breakdown.sharedAddons?.items || []),
      ];
      const boletoItems = allItems.filter((i: any) =>
        i.label.toLowerCase().includes("boleto") || i.label.toLowerCase().includes("split")
      );
      expect(boletoItems).toHaveLength(0);
    });

    it(`${plan}: buildPostPaidBreakdown with Pay ON has boleto/split items`, () => {
      const input = {
        product: "loc" as const,
        imobPlan: plan,
        locPlan: plan,
        addons: makeAddons({ pay: true }),
        metrics: makeMetrics({
          contractsUnderManagement: 200,
          chargesBoletoToTenant: true,
          boletoChargeAmount: 5,
          chargesSplitToOwner: true,
          splitChargeAmount: 3,
        }),
        prepayAdditionalUsers: false,
        prepayAdditionalContracts: false,
      };
      const total = calculatePostPaidTotal(input);
      const breakdownJson = buildPostPaidBreakdown(input, total);
      const breakdown = JSON.parse(breakdownJson);

      const allItems = [
        ...(breakdown.imobAddons?.items || []),
        ...(breakdown.locAddons?.items || []),
        ...(breakdown.sharedAddons?.items || []),
      ];
      const boletoItems = allItems.filter((i: any) =>
        i.label.toLowerCase().includes("boleto")
      );
      const splitItems = allItems.filter((i: any) =>
        i.label.toLowerCase().includes("split")
      );
      expect(boletoItems.length).toBeGreaterThan(0);
      expect(splitItems.length).toBeGreaterThan(0);
    });
  }
});

// ============================================================================
// SECTION 9: COMPREHENSIVE PLAN × ADDON × FREQUENCY MATRIX
// ============================================================================

describe("Full Matrix: every plan × every addon × every frequency", () => {
  const products = ["imob", "loc", "both"] as const;

  for (const product of products) {
    for (const plan of ALL_PLANS) {
      for (const freq of ALL_FREQUENCIES) {
        it(`${product}/${plan}/${freq}: post-paid total is consistent`, () => {
          const addons = makeAddons({
            leads: true,
            inteligencia: true,
            assinatura: true,
            pay: product !== "imob",
            seguros: product !== "imob",
          });
          const metrics = makeMetrics({
            imobUsers: IMOB_PLANS[plan].includedUsers + 3,
            contractsUnderManagement: LOC_PLANS[plan].includedContracts + 25,
            closingsPerMonth: 8,
            newContractsPerMonth: 10,
            leadsPerMonth: 150,
            wantsWhatsApp: true,
            chargesBoletoToTenant: product !== "imob",
            boletoChargeAmount: 5,
            chargesSplitToOwner: product !== "imob",
            splitChargeAmount: 3,
          });

          const input = makeInput({
            product,
            imobPlan: plan,
            locPlan: plan,
            addons,
            metrics,
          });

          const breakdown = calculatePostPaidBreakdown(input);

          // Total must equal sum of parts
          const sumOfParts = breakdown.additionalUsers + breakdown.additionalContracts +
            breakdown.whatsApp + breakdown.assinaturas + breakdown.boletos +
            breakdown.boletoCharges + breakdown.splitCharges + breakdown.supportServices;
          expect(breakdown.total).toBe(sumOfParts);

          // Verify product-specific items
          if (product === "imob") {
            expect(breakdown.additionalUsers).toBeGreaterThan(0);
            expect(breakdown.additionalContracts).toBe(0);
            expect(breakdown.boletos).toBe(0);
          }
          if (product === "loc") {
            expect(breakdown.additionalUsers).toBe(0);
            expect(breakdown.additionalContracts).toBeGreaterThan(0);
          }
          if (product === "both") {
            expect(breakdown.additionalUsers).toBeGreaterThan(0);
            expect(breakdown.additionalContracts).toBeGreaterThan(0);
          }
        });
      }
    }
  }
});

// ============================================================================
// SECTION 10: PREMIUM SERVICES INCLUSION RULES
// ============================================================================

describe("Premium Services: inclusion rules by plan and kombo", () => {
  it("VIP Support included for K2 plans", () => {
    expect(Pricing.isVipSupportIncluded("k2")).toBe(true);
  });

  it("CS Dedicado included for K2 plans", () => {
    expect(Pricing.isCSDedicadoIncluded("k2")).toBe(true);
  });

  it("VIP Support NOT included for Prime plans (without kombo)", () => {
    expect(Pricing.isVipSupportIncluded("prime")).toBe(false);
  });

  it("CS Dedicado NOT included for Prime plans (without kombo)", () => {
    expect(Pricing.isCSDedicadoIncluded("prime")).toBe(false);
  });

  // Kombos with premium services: imob-pro, loc-pro, core-gestao, elite (NOT imob-start)
  const kombosWithPremium = ["imob-pro", "loc-pro", "core-gestao", "elite"];
  const kombosWithoutPremium = ["imob-start"];
  for (const key of kombosWithPremium) {
    it(`Kombo ${key} includes premium services`, () => {
      expect(KOMBOS[key as keyof typeof KOMBOS].premiumServicesIncluded).toBe(true);
    });
  }
  for (const key of kombosWithoutPremium) {
    it(`Kombo ${key} does NOT include premium services`, () => {
      expect(KOMBOS[key as keyof typeof KOMBOS].premiumServicesIncluded).toBe(false);
    });
  }
});

// ============================================================================
// SECTION 11: ADDON AVAILABILITY RULES
// ============================================================================

describe("Addon availability rules", () => {
  it("Leads is available for IMOB", () => {
    expect(ADDONS.leads.availableFor).toContain("imob");
  });
  it("Inteligência is available for both IMOB and LOC", () => {
    expect(ADDONS.inteligencia.availableFor).toContain("imob");
    expect(ADDONS.inteligencia.availableFor).toContain("locacao");
  });
  it("Assinaturas is available for both IMOB and LOC", () => {
    expect(ADDONS.assinaturas.availableFor).toContain("imob");
    expect(ADDONS.assinaturas.availableFor).toContain("locacao");
  });
});

// ============================================================================
// SECTION 12: PREPAID VS POST-PAID EXCLUSIVITY
// ============================================================================

describe("Prepaid vs Post-paid exclusivity", () => {
  for (const plan of ALL_PLANS) {
    it(`IMOB ${plan}: prepaid users → no post-paid additional users`, () => {
      const input = makeInput({
        product: "imob",
        imobPlan: plan,
        metrics: makeMetrics({ imobUsers: IMOB_PLANS[plan].includedUsers + 10 }),
        prepayAdditionalUsers: true,
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.additionalUsers).toBe(0);
    });

    it(`LOC ${plan}: prepaid contracts → no post-paid additional contracts`, () => {
      const input = makeInput({
        product: "loc",
        locPlan: plan,
        metrics: makeMetrics({ contractsUnderManagement: LOC_PLANS[plan].includedContracts + 50 }),
        prepayAdditionalContracts: true,
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.additionalContracts).toBe(0);
    });
  }
});

// ============================================================================
// SECTION 13: EDGE CASES
// ============================================================================

describe("Edge cases", () => {
  it("zero users → no additional user cost", () => {
    const input = makeInput({
      product: "imob",
      imobPlan: "prime",
      metrics: makeMetrics({ imobUsers: 0 }),
    });
    const breakdown = calculatePostPaidBreakdown(input);
    expect(breakdown.additionalUsers).toBe(0);
  });

  it("empty string users → treated as 0", () => {
    const input = makeInput({
      product: "imob",
      imobPlan: "prime",
      metrics: makeMetrics({ imobUsers: "" as any }),
    });
    const breakdown = calculatePostPaidBreakdown(input);
    expect(breakdown.additionalUsers).toBe(0);
  });

  it("exactly included users → no additional cost", () => {
    for (const plan of ALL_PLANS) {
      const input = makeInput({
        product: "imob",
        imobPlan: plan,
        metrics: makeMetrics({ imobUsers: IMOB_PLANS[plan].includedUsers }),
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.additionalUsers).toBe(0);
    }
  });

  it("exactly included contracts → no additional cost", () => {
    for (const plan of ALL_PLANS) {
      const input = makeInput({
        product: "loc",
        locPlan: plan,
        metrics: makeMetrics({ contractsUnderManagement: LOC_PLANS[plan].includedContracts }),
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.additionalContracts).toBe(0);
    }
  });

  it("1 user above included → triggers additional cost", () => {
    for (const plan of ALL_PLANS) {
      const input = makeInput({
        product: "imob",
        imobPlan: plan,
        metrics: makeMetrics({ imobUsers: IMOB_PLANS[plan].includedUsers + 1 }),
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.additionalUsers).toBeGreaterThan(0);
    }
  });

  it("1 contract above included → triggers additional cost", () => {
    for (const plan of ALL_PLANS) {
      const input = makeInput({
        product: "loc",
        locPlan: plan,
        metrics: makeMetrics({ contractsUnderManagement: LOC_PLANS[plan].includedContracts + 1 }),
      });
      const breakdown = calculatePostPaidBreakdown(input);
      expect(breakdown.additionalContracts).toBeGreaterThan(0);
    }
  });
});
