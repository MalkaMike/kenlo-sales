/**
 * Unit tests for postPaidCalc.ts - the UI-facing post-paid calculation utility.
 * Verifies that consolidation with postPaidBuilder tier helpers produces correct results.
 */

import { describe, it, expect } from "vitest";

import {
  calculatePostPaidBreakdown,
  calculateRevenueBreakdown,
} from "../client/src/pages/calculadora/receita-extra/postPaidCalc";
import type { PostPaidCalcInput } from "../client/src/pages/calculadora/receita-extra/postPaidCalc";
import type { MetricsState, AddonsState } from "../client/src/pages/calculadora/types";

// ─── Test Helpers ─────────────────────────────────────────────────────────────

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

// ─── calculatePostPaidBreakdown ───────────────────────────────────────────────

describe("postPaidCalc - calculatePostPaidBreakdown", () => {
  it("should return all zeros when no additional usage and no addons", () => {
    const result = calculatePostPaidBreakdown(makeInput());
    expect(result.additionalUsers).toBe(0);
    expect(result.additionalContracts).toBe(0);
    expect(result.whatsApp).toBe(0);
    expect(result.assinaturas).toBe(0);
    expect(result.boletos).toBe(0);
    expect(result.boletoCharges).toBe(0);
    expect(result.splitCharges).toBe(0);
    expect(result.supportServices).toBe(0);
    expect(result.total).toBe(0);
  });

  describe("Additional Users (IMOB)", () => {
    it("should calculate additional users for imob product", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "imob",
          imobPlan: "prime",
          metrics: makeMetrics({ imobUsers: 5 }),
        })
      );
      // 5 - 2 included = 3 additional at R$57/user = R$171
      expect(result.additionalUsers).toBe(171);
    });

    it("should not charge when prepayAdditionalUsers is true", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "imob",
          imobPlan: "prime",
          metrics: makeMetrics({ imobUsers: 10 }),
          prepayAdditionalUsers: true,
        })
      );
      expect(result.additionalUsers).toBe(0);
    });

    it("should not charge for loc-only product", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "loc",
          metrics: makeMetrics({ imobUsers: 10 }),
        })
      );
      expect(result.additionalUsers).toBe(0);
    });

    it("should charge for both product", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "both",
          imobPlan: "k",
          metrics: makeMetrics({ imobUsers: 8 }),
        })
      );
      // 8 - 7 included (k plan) = 1 additional at R$47/user = R$47
      expect(result.additionalUsers).toBe(47);
    });
  });

  describe("Additional Contracts (LOC)", () => {
    it("should calculate additional contracts for loc product", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "loc",
          locPlan: "prime",
          metrics: makeMetrics({ contractsUnderManagement: 150 }),
        })
      );
      // 150 - 100 included = 50 additional at R$3/contract = R$150
      expect(result.additionalContracts).toBe(150);
    });

    it("should not charge when prepayAdditionalContracts is true", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "loc",
          metrics: makeMetrics({ contractsUnderManagement: 200 }),
          prepayAdditionalContracts: true,
        })
      );
      expect(result.additionalContracts).toBe(0);
    });

    it("should use K plan included quantity (175)", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "loc",
          locPlan: "k",
          metrics: makeMetrics({ contractsUnderManagement: 200 }),
        })
      );
      // 200 - 175 included = 25 additional at R$3 = R$75
      expect(result.additionalContracts).toBe(75);
    });

    it("should use K2 plan included quantity (400)", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "loc",
          locPlan: "k2",
          metrics: makeMetrics({ contractsUnderManagement: 500 }),
        })
      );
      // 500 - 400 included = 100 additional at R$3 = R$300
      expect(result.additionalContracts).toBe(300);
    });
  });

  describe("WhatsApp Leads", () => {
    it("should calculate WhatsApp cost when leads addon and wantsWhatsApp", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          addons: makeAddons({ leads: true }),
          metrics: makeMetrics({ leadsPerMonth: 200, wantsWhatsApp: true }),
        })
      );
      // 200 - 100 included = 100 additional at R$1.50/msg = R$150
      expect(result.whatsApp).toBe(150);
    });

    it("should return 0 when leads addon is off", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          addons: makeAddons({ leads: false }),
          metrics: makeMetrics({ leadsPerMonth: 200, wantsWhatsApp: true }),
        })
      );
      expect(result.whatsApp).toBe(0);
    });

    it("should return 0 when wantsWhatsApp is false", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          addons: makeAddons({ leads: true }),
          metrics: makeMetrics({ leadsPerMonth: 200, wantsWhatsApp: false }),
        })
      );
      expect(result.whatsApp).toBe(0);
    });
  });

  describe("Assinaturas Digitais", () => {
    it("should calculate for imob product (closings only)", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "imob",
          addons: makeAddons({ assinatura: true }),
          metrics: makeMetrics({ closingsPerMonth: 20 }),
        })
      );
      // 20 - 15 included = 5 additional at R$1.80 = R$9
      expect(result.assinaturas).toBeCloseTo(9, 2);
    });

    it("should calculate for loc product (new contracts only)", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "loc",
          addons: makeAddons({ assinatura: true }),
          metrics: makeMetrics({ newContractsPerMonth: 25 }),
        })
      );
      // 25 - 15 included = 10 additional at R$1.80 = R$18
      expect(result.assinaturas).toBeCloseTo(18, 2);
    });

    it("should calculate for both products (closings + new contracts)", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "both",
          addons: makeAddons({ assinatura: true }),
          metrics: makeMetrics({ closingsPerMonth: 10, newContractsPerMonth: 10 }),
        })
      );
      // 10 + 10 = 20 total - 15 included = 5 additional at R$1.80 = R$9
      expect(result.assinaturas).toBeCloseTo(9, 2);
    });

    it("should return 0 when within included", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "imob",
          addons: makeAddons({ assinatura: true }),
          metrics: makeMetrics({ closingsPerMonth: 10 }),
        })
      );
      expect(result.assinaturas).toBe(0);
    });
  });

  describe("Boletos and Splits (Pay)", () => {
    it("should calculate boleto base cost for loc with pay addon", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "loc",
          locPlan: "prime",
          addons: makeAddons({ pay: true }),
          metrics: makeMetrics({ contractsUnderManagement: 100 }),
        })
      );
      // 100 boletos at R$4/boleto = R$400
      expect(result.boletos).toBe(400);
    });

    it("should calculate boleto charges when charging tenant", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "loc",
          locPlan: "prime",
          addons: makeAddons({ pay: true }),
          metrics: makeMetrics({
            contractsUnderManagement: 50,
            chargesBoletoToTenant: true,
          }),
        })
      );
      // boletos: 50 at R$4 = R$200
      // boletoCharges: 50 at R$4 = R$200
      expect(result.boletos).toBe(200);
      expect(result.boletoCharges).toBe(200);
    });

    it("should calculate split charges when charging owner", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "loc",
          locPlan: "prime",
          addons: makeAddons({ pay: true }),
          metrics: makeMetrics({
            contractsUnderManagement: 50,
            chargesSplitToOwner: true,
          }),
        })
      );
      // boletos: 50 at R$4 = R$200
      // splitCharges: 50 at R$4 = R$200
      expect(result.boletos).toBe(200);
      expect(result.splitCharges).toBe(200);
    });

    it("should not charge boletos for imob-only product", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "imob",
          addons: makeAddons({ pay: true }),
          metrics: makeMetrics({ contractsUnderManagement: 100 }),
        })
      );
      expect(result.boletos).toBe(0);
    });
  });

  describe("Support Services", () => {
    it("should charge VIP support for prime plan", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "imob",
          imobPlan: "prime",
          metrics: makeMetrics({ imobVipSupport: true }),
        })
      );
      expect(result.supportServices).toBe(97);
    });

    it("should charge CS Dedicado for prime plan", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "imob",
          imobPlan: "prime",
          metrics: makeMetrics({ imobDedicatedCS: true }),
        })
      );
      expect(result.supportServices).toBe(297);
    });

    it("should not charge support for K or K2 plans", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "imob",
          imobPlan: "k",
          metrics: makeMetrics({ imobVipSupport: true, imobDedicatedCS: true }),
        })
      );
      expect(result.supportServices).toBe(0);
    });

    it("should charge both imob and loc support for both product", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "both",
          imobPlan: "prime",
          locPlan: "prime",
          metrics: makeMetrics({
            imobVipSupport: true,
            imobDedicatedCS: true,
            locVipSupport: true,
            locDedicatedCS: true,
          }),
        })
      );
      // 97 + 297 + 97 + 297 = 788
      expect(result.supportServices).toBe(788);
    });
  });

  describe("Total calculation", () => {
    it("should sum all components correctly", () => {
      const result = calculatePostPaidBreakdown(
        makeInput({
          product: "both",
          imobPlan: "prime",
          locPlan: "prime",
          addons: makeAddons({ leads: true, assinatura: true, pay: true }),
          metrics: makeMetrics({
            imobUsers: 5,
            contractsUnderManagement: 150,
            closingsPerMonth: 20,
            newContractsPerMonth: 5,
            leadsPerMonth: 200,
            wantsWhatsApp: true,
            chargesBoletoToTenant: true,
            imobVipSupport: true,
          }),
        })
      );
      const expectedTotal =
        result.additionalUsers +
        result.additionalContracts +
        result.whatsApp +
        result.assinaturas +
        result.boletos +
        result.boletoCharges +
        result.splitCharges +
        result.supportServices;
      expect(result.total).toBeCloseTo(expectedTotal, 2);
      expect(result.total).toBeGreaterThan(0);
    });
  });
});

// ─── calculateRevenueBreakdown ────────────────────────────────────────────────

describe("postPaidCalc - calculateRevenueBreakdown", () => {
  it("should return all zeros when no revenue-generating addons", () => {
    const result = calculateRevenueBreakdown(makeInput());
    expect(result.boletoRevenue).toBe(0);
    expect(result.splitRevenue).toBe(0);
    expect(result.segurosRevenue).toBe(0);
    expect(result.total).toBe(0);
  });

  it("should calculate boleto revenue when charging tenant", () => {
    const result = calculateRevenueBreakdown(
      makeInput({
        product: "loc",
        addons: makeAddons({ pay: true }),
        metrics: makeMetrics({
          contractsUnderManagement: 100,
          chargesBoletoToTenant: true,
          boletoChargeAmount: 5,
        }),
      })
    );
    expect(result.boletoRevenue).toBe(500);
    expect(result.total).toBe(500);
  });

  it("should calculate split revenue when charging owner", () => {
    const result = calculateRevenueBreakdown(
      makeInput({
        product: "loc",
        addons: makeAddons({ pay: true }),
        metrics: makeMetrics({
          contractsUnderManagement: 100,
          chargesSplitToOwner: true,
          splitChargeAmount: 3,
        }),
      })
    );
    expect(result.splitRevenue).toBe(300);
    expect(result.total).toBe(300);
  });

  it("should calculate seguros revenue", () => {
    const result = calculateRevenueBreakdown(
      makeInput({
        product: "loc",
        addons: makeAddons({ seguros: true }),
        metrics: makeMetrics({ contractsUnderManagement: 100 }),
      })
    );
    expect(result.segurosRevenue).toBe(1000);
    expect(result.total).toBe(1000);
  });

  it("should sum all revenue streams", () => {
    const result = calculateRevenueBreakdown(
      makeInput({
        product: "loc",
        addons: makeAddons({ pay: true, seguros: true }),
        metrics: makeMetrics({
          contractsUnderManagement: 100,
          chargesBoletoToTenant: true,
          boletoChargeAmount: 5,
          chargesSplitToOwner: true,
          splitChargeAmount: 3,
        }),
      })
    );
    expect(result.boletoRevenue).toBe(500);
    expect(result.splitRevenue).toBe(300);
    expect(result.segurosRevenue).toBe(1000);
    expect(result.total).toBe(1800);
  });

  it("should not generate revenue for imob-only product", () => {
    const result = calculateRevenueBreakdown(
      makeInput({
        product: "imob",
        addons: makeAddons({ pay: true, seguros: true }),
        metrics: makeMetrics({
          contractsUnderManagement: 100,
          chargesBoletoToTenant: true,
          boletoChargeAmount: 5,
        }),
      })
    );
    expect(result.total).toBe(0);
  });
});
