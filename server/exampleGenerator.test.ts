/**
 * Unit tests for exampleConfigGenerator.ts and postPaidBuilder.ts tier helpers.
 * Tests the pure utility functions extracted during the useExampleGenerator refactoring.
 */

import { describe, it, expect } from "vitest";

import {
  pick,
  randInt,
  randBool,
  planForImobUsers,
  planForLocContracts,
  buildExamplePostPaid,
  buildExampleProposalData,
  KOMBO_CONFIGS,
} from "../client/src/pages/calculadora/hooks/exampleConfigGenerator";

import {
  calcContractsTierCost,
  calcBoletoSplitTierCost,
  calcSignaturesTierCost,
  calcWhatsAppTierCost,
  getIncludedUsers,
  getIncludedContracts,
  getIncludedBoletosSplits,
} from "../client/src/pages/calculadora/quote/postPaidBuilder";

// ─── Tier Calculation Helpers ──────────────────────────────────────────────

describe("postPaidBuilder - Tier Calculation Helpers", () => {
  describe("getIncludedUsers", () => {
    it("should return correct included users per plan", () => {
      expect(getIncludedUsers("prime")).toBe(2);
      expect(getIncludedUsers("k")).toBe(7);
      expect(getIncludedUsers("k2")).toBe(15);
    });
  });

  describe("getIncludedContracts", () => {
    it("should return correct included contracts per plan", () => {
      expect(getIncludedContracts("prime")).toBe(100);
      expect(getIncludedContracts("k")).toBe(175);
      expect(getIncludedContracts("k2")).toBe(400);
    });
  });

  describe("getIncludedBoletosSplits", () => {
    it("should return correct included boletos/splits per plan (all post-paid now)", () => {
      expect(getIncludedBoletosSplits("prime")).toBe(0);
      expect(getIncludedBoletosSplits("k")).toBe(0);
      expect(getIncludedBoletosSplits("k2")).toBe(0);
    });
  });

  describe("calcContractsTierCost", () => {
    it("should return 0 for zero or negative additional", () => {
      expect(calcContractsTierCost("prime", 0)).toBe(0);
      expect(calcContractsTierCost("k", -5)).toBe(0);
    });

    it("should calculate prime plan at flat R$3/contract", () => {
      expect(calcContractsTierCost("prime", 10)).toBe(30);
      expect(calcContractsTierCost("prime", 100)).toBe(300);
    });

    it("should calculate K plan with 2 tiers (R$3 + R$2.50)", () => {
      // First 250 at R$3, rest at R$2.50
      expect(calcContractsTierCost("k", 250)).toBe(750);
      expect(calcContractsTierCost("k", 300)).toBe(750 + 50 * 2.5);
    });

    it("should calculate K2 plan with 3 tiers (R$3 + R$2.50 + R$2)", () => {
      // First 250 at R$3, next 250 at R$2.50, rest at R$2
      expect(calcContractsTierCost("k2", 250)).toBe(750);
      expect(calcContractsTierCost("k2", 500)).toBe(750 + 250 * 2.5);
      expect(calcContractsTierCost("k2", 600)).toBe(750 + 625 + 100 * 2);
    });
  });

  describe("calcBoletoSplitTierCost", () => {
    it("should return 0 for zero or negative additional", () => {
      expect(calcBoletoSplitTierCost("prime", 0)).toBe(0);
      expect(calcBoletoSplitTierCost("k", -1)).toBe(0);
    });

    it("should calculate prime plan at flat R$4/unit", () => {
      expect(calcBoletoSplitTierCost("prime", 10)).toBe(40);
    });

    it("should calculate K plan with 2 tiers (R$4 + R$3.50)", () => {
      expect(calcBoletoSplitTierCost("k", 250)).toBe(1000);
      expect(calcBoletoSplitTierCost("k", 300)).toBe(1000 + 50 * 3.5);
    });

    it("should calculate K2 plan with 3 tiers (R$4 + R$3.50 + R$3)", () => {
      expect(calcBoletoSplitTierCost("k2", 250)).toBe(1000);
      expect(calcBoletoSplitTierCost("k2", 500)).toBe(1000 + 250 * 3.5);
      expect(calcBoletoSplitTierCost("k2", 600)).toBe(1000 + 875 + 100 * 3);
    });
  });

  describe("calcSignaturesTierCost", () => {
    it("should return 0 for zero or negative additional", () => {
      expect(calcSignaturesTierCost(0)).toBe(0);
      expect(calcSignaturesTierCost(-5)).toBe(0);
    });

    it("should calculate 3 tiers (R$1.80 + R$1.70 + R$1.50)", () => {
      // First 20 at R$1.80
      expect(calcSignaturesTierCost(20)).toBeCloseTo(36, 2);
      // Next 20 at R$1.70
      expect(calcSignaturesTierCost(40)).toBeCloseTo(36 + 34, 2);
      // Rest at R$1.50
      expect(calcSignaturesTierCost(50)).toBeCloseTo(36 + 34 + 15, 2);
    });
  });

  describe("calcWhatsAppTierCost", () => {
    it("should return 0 for zero or negative additional", () => {
      expect(calcWhatsAppTierCost(0)).toBe(0);
      expect(calcWhatsAppTierCost(-10)).toBe(0);
    });

    it("should calculate 4 tiers (R$1.50 + R$1.30 + R$1.10 + R$0.90)", () => {
      // First 200 at R$1.50
      expect(calcWhatsAppTierCost(200)).toBe(300);
      // Next 150 at R$1.30
      expect(calcWhatsAppTierCost(350)).toBeCloseTo(300 + 195, 2);
      // Next 650 at R$1.10
      expect(calcWhatsAppTierCost(1000)).toBeCloseTo(300 + 195 + 715, 2);
      // Rest at R$0.90
      expect(calcWhatsAppTierCost(1100)).toBeCloseTo(300 + 195 + 715 + 90, 2);
    });
  });
});

// ─── Random Helpers ──────────────────────────────────────────────────────────

describe("exampleConfigGenerator - Random Helpers", () => {
  describe("pick", () => {
    it("should return an element from the array", () => {
      const arr = [1, 2, 3, 4, 5];
      for (let i = 0; i < 20; i++) {
        expect(arr).toContain(pick(arr));
      }
    });
  });

  describe("randInt", () => {
    it("should return values within the specified range", () => {
      for (let i = 0; i < 50; i++) {
        const val = randInt(5, 10);
        expect(val).toBeGreaterThanOrEqual(5);
        expect(val).toBeLessThanOrEqual(10);
        expect(Number.isInteger(val)).toBe(true);
      }
    });
  });

  describe("randBool", () => {
    it("should return a boolean", () => {
      for (let i = 0; i < 20; i++) {
        expect(typeof randBool()).toBe("boolean");
      }
    });
  });
});

// ─── Plan Recommendation ─────────────────────────────────────────────────────

describe("exampleConfigGenerator - Plan Recommendation", () => {
  describe("planForImobUsers", () => {
    it("should recommend prime for users below k threshold (1-6)", () => {
      expect(planForImobUsers(1)).toBe("prime");
      expect(planForImobUsers(2)).toBe("prime");
      expect(planForImobUsers(3)).toBe("prime");
      expect(planForImobUsers(6)).toBe("prime");
    });

    it("should recommend k for users at or above k included (7-15)", () => {
      expect(planForImobUsers(7)).toBe("k");
      expect(planForImobUsers(10)).toBe("k");
      expect(planForImobUsers(15)).toBe("k");
    });

    it("should recommend k2 for 16+ users", () => {
      expect(planForImobUsers(16)).toBe("k2");
      expect(planForImobUsers(30)).toBe("k2");
    });
  });

  describe("planForLocContracts", () => {
    it("should recommend prime for 1-175 contracts", () => {
      expect(planForLocContracts(1)).toBe("prime");
      expect(planForLocContracts(175)).toBe("prime");
    });

    it("should recommend k for 176-399 contracts", () => {
      expect(planForLocContracts(176)).toBe("k");
      expect(planForLocContracts(399)).toBe("k");
    });

    it("should recommend k2 for 400+ contracts", () => {
      expect(planForLocContracts(400)).toBe("k2");
      expect(planForLocContracts(800)).toBe("k2");
    });
  });
});

// ─── Post-Paid Breakdown for Examples ────────────────────────────────────────

describe("exampleConfigGenerator - buildExamplePostPaid", () => {
  const imobConfig = KOMBO_CONFIGS[0]; // imob_start: imob + leads + assinatura

  it("should return zero total when no additional usage", () => {
    const result = buildExamplePostPaid(
      imobConfig, "prime", "prime",
      2, 50, 5, 5, 50, false, false, false,
    );
    // 2 users = included in prime (2), 50 contracts not applicable for imob-only
    // 5+5=10 signatures < 15 included, 50 leads < 100 included
    expect(result.total).toBe(0);
    expect(result.imobAddons).toBeUndefined();
    expect(result.locAddons).toBeUndefined();
    expect(result.sharedAddons).toBeUndefined();
  });

  it("should calculate additional users for imob product", () => {
    const result = buildExamplePostPaid(
      imobConfig, "prime", "prime",
      5, 50, 5, 5, 50, false, false, false,
    );
    // 5 users - 2 included = 3 additional at R$57/user = R$171
    expect(result.total).toBe(171);
    expect(result.imobAddons).toBeDefined();
    expect(result.imobAddons!.items[0].additional).toBe(3);
    expect(result.imobAddons!.items[0].perUnit).toBe(57);
  });

  it("should calculate additional contracts for loc product", () => {
    const locConfig = KOMBO_CONFIGS[2]; // locacao_pro: loc + inteligencia + assinatura
    const result = buildExamplePostPaid(
      locConfig, "prime", "prime",
      1, 150, 0, 5, 0, false, false, false,
    );
    // 150 contracts - 100 included = 50 additional at R$3/contract = R$150
    expect(result.total).toBe(150);
    expect(result.locAddons).toBeDefined();
    expect(result.locAddons!.items[0].additional).toBe(50);
  });

  it("should calculate signature costs when exceeding included", () => {
    const result = buildExamplePostPaid(
      imobConfig, "prime", "prime",
      2, 50, 20, 0, 50, false, false, false,
    );
    // 20 closings + 0 newContracts = 20 total, 20 - 15 included = 5 additional
    // 5 at R$1.80 = R$9
    expect(result.total).toBeCloseTo(9, 2);
    expect(result.sharedAddons).toBeDefined();
    expect(result.sharedAddons!.items[0].label).toContain("Assinaturas");
  });

  it("should calculate WhatsApp costs when enabled and exceeding included", () => {
    const result = buildExamplePostPaid(
      imobConfig, "prime", "prime",
      2, 50, 5, 5, 200, true, false, false,
    );
    // 200 leads - 100 included = 100 additional at R$1.50/msg = R$150
    expect(result.total).toBeCloseTo(150, 2);
    expect(result.sharedAddons).toBeDefined();
    expect(result.sharedAddons!.items.some(i => i.label.includes("WhatsApp"))).toBe(true);
  });

  it("should calculate boleto and split costs for loc with pay addon", () => {
    const eliteConfig = KOMBO_CONFIGS[4]; // elite: both + all addons
    const result = buildExamplePostPaid(
      eliteConfig, "prime", "prime",
      2, 150, 5, 5, 50, false, true, true,
    );
    // Contracts: 150 - 100 = 50 additional at R$3 = R$150
    // Boletos: 150 - 0 (all post-paid) = 150 at R$4 = R$600
    // Splits: 150 - 0 (all post-paid) = 150 at R$4 = R$600
    expect(result.locAddons).toBeDefined();
    expect(result.locAddons!.items.length).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeGreaterThan(0);
  });
});

// ─── Full Proposal Builder ───────────────────────────────────────────────────

describe("exampleConfigGenerator - buildExampleProposalData", () => {
  it("should return a valid proposal data structure", () => {
    const result = buildExampleProposalData();

    expect(result).toHaveProperty("proposalData");
    expect(result).toHaveProperty("company");
    expect(result).toHaveProperty("komboId");

    const pd = result.proposalData;
    expect(pd.salesPersonName).toBe("Vendedor Exemplo");
    expect(pd.vendorEmail).toBe("vendedor@kenlo.com.br");
    expect(typeof pd.clientName).toBe("string");
    expect(typeof pd.agencyName).toBe("string");
    expect(["imob", "loc", "both"]).toContain(pd.productType);
    expect(typeof pd.totalMonthly).toBe("number");
    expect(pd.totalMonthly).toBeGreaterThan(0);
    expect(typeof pd.totalAnnual).toBe("number");
    expect(pd.totalAnnual).toBe(pd.totalMonthly * 12);
    expect(typeof pd.implantationFee).toBe("number");
    expect(pd.implantationFee).toBeGreaterThan(0);
    expect(typeof pd.firstYearTotal).toBe("number");
    expect(pd.firstYearTotal).toBe(pd.totalAnnual + pd.implantationFee);
  });

  it("should generate different results on repeated calls (randomness)", () => {
    const results = Array.from({ length: 10 }, () => buildExampleProposalData());
    const companies = new Set(results.map(r => r.company));
    // With 10 random picks from 10 names, we expect at least 2 different companies
    expect(companies.size).toBeGreaterThanOrEqual(2);
  });

  it("should set correct plan when product is imob", () => {
    // Run multiple times to get an imob-only result
    for (let i = 0; i < 50; i++) {
      const result = buildExampleProposalData();
      const pd = result.proposalData;
      if (pd.productType === "imob") {
        expect(pd.imobPlan).toBeDefined();
        expect(["prime", "k", "k2"]).toContain(pd.imobPlan);
        expect(pd.imobPrice).toBeGreaterThan(0);
        return; // Test passed
      }
    }
    // If we never got imob in 50 tries, that's statistically very unlikely but skip
  });

  it("should include payment plan from valid frequencies", () => {
    const validFreqs = ["monthly", "semestral", "annual", "biennial"];
    for (let i = 0; i < 20; i++) {
      const result = buildExampleProposalData();
      expect(validFreqs).toContain(result.proposalData.paymentPlan);
    }
  });

  it("should include postPaidBreakdown as JSON string", () => {
    const result = buildExampleProposalData();
    expect(typeof result.proposalData.postPaidBreakdown).toBe("string");
    const parsed = JSON.parse(result.proposalData.postPaidBreakdown);
    expect(typeof parsed.total).toBe("number");
  });

  it("should include selectedAddons as JSON string", () => {
    const result = buildExampleProposalData();
    expect(typeof result.proposalData.selectedAddons).toBe("string");
    const parsed = JSON.parse(result.proposalData.selectedAddons);
    expect(Array.isArray(parsed)).toBe(true);
  });
});
