/**
 * PDF Accuracy Test Suite
 * 
 * Verifies that buildProposalData produces exactly the same numbers
 * as the calculator for every product/plan/addon/frequency combination.
 * 
 * The PDF must be a faithful representation of what the user configured.
 */

import { describe, it, expect } from "vitest";

import {
  IMOB_PLANS,
  LOC_PLANS,
  ADDONS,
  KOMBOS as CONFIG_KOMBOS,
  FREQUENCY_MULTIPLIERS,
  calculateTieredPrice,
  IMOB_ADDITIONAL_USERS,
  LOC_ADDITIONAL_CONTRACTS,
  PAY_BOLETOS,
  SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT,
  PREPAID_PRICING,
  type PlanTier,
  type PaymentFrequency,
} from "@shared/pricing-config";

import * as Pricing from "../client/src/utils/pricing";
import {
  PLAN_ANNUAL_PRICES,
  ADDON_ANNUAL_PRICES,
  IMPLEMENTATION_COSTS,
} from "../client/src/utils/pricing";

import { buildProposalData, type ProposalDataInput } from "../client/src/pages/calculadora/quote/buildProposalData";
import { calculatePostPaidBreakdown } from "../client/src/pages/calculadora/receita-extra/postPaidCalc";
import { calculateRevenue } from "../client/src/pages/calculadora/quote/proposalHelpers";
import type { MetricsState, AddonsState, LineItem, ProductSelection, KomboType } from "../client/src/pages/calculadora/types.tsx";
import {
  KOMBOS,
  PAYMENT_FREQUENCY_MULTIPLIERS,
  roundToEndIn7,
  calculateAdditionalUsersCost,
  toNum,
} from "../client/src/pages/calculadora/types.tsx";

// ─── Test Helpers ─────────────────────────────────────────────────────────────

const ALL_PLANS: PlanTier[] = ["prime", "k", "k2"];
const ALL_FREQUENCIES: PaymentFrequency[] = ["monthly", "semiannual", "annual", "biennial"];
const CALC_FREQUENCIES = ["monthly", "semestral", "annual", "biennial"] as const;

function makeMetrics(overrides: Partial<MetricsState> = {}): MetricsState {
  return {
    imobUsers: 10,
    closingsPerMonth: 8,
    leadsPerMonth: 100,
    usesExternalAI: false,
    externalAIName: "",
    wantsWhatsApp: false,
    imobVipSupport: false,
    imobDedicatedCS: false,
    contractsUnderManagement: 200,
    newContractsPerMonth: 10,
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

/**
 * Simulate the usePricing.getLineItems() function to create line items
 * This mirrors the exact logic in usePricing.ts
 */
function simulateGetLineItems(
  product: ProductSelection,
  imobPlan: PlanTier,
  locPlan: PlanTier,
  addons: AddonsState,
  frequency: string,
  komboInfo: (typeof KOMBOS)[keyof typeof KOMBOS] | null,
): LineItem[] {
  const freq = frequency as keyof typeof PAYMENT_FREQUENCY_MULTIPLIERS;
  const komboDiscount = komboInfo ? (1 - komboInfo.discount) : 1;
  const items: LineItem[] = [];

  const calcMonthlyRef = (annualPrice: number) => roundToEndIn7(Math.round(annualPrice * PAYMENT_FREQUENCY_MULTIPLIERS.monthly));
  const calcPrice = (annualPrice: number) => roundToEndIn7(Math.round(annualPrice * PAYMENT_FREQUENCY_MULTIPLIERS[freq]));

  if (product === "imob" || product === "both") {
    const baseMonthlyRef = calcMonthlyRef(PLAN_ANNUAL_PRICES[imobPlan]);
    const basePrice = calcPrice(PLAN_ANNUAL_PRICES[imobPlan]);
    items.push({
      name: `Imob - ${imobPlan === "k2" ? "K\u00B2" : imobPlan.toUpperCase()}`,
      monthlyRefSemKombo: baseMonthlyRef,
      monthlyRefComKombo: Math.round(baseMonthlyRef * komboDiscount),
      priceSemKombo: basePrice,
      priceComKombo: Math.round(basePrice * komboDiscount),
      implantation: IMPLEMENTATION_COSTS.imob,
    });
  }

  if (product === "loc" || product === "both") {
    const baseMonthlyRef = calcMonthlyRef(PLAN_ANNUAL_PRICES[locPlan]);
    const basePrice = calcPrice(PLAN_ANNUAL_PRICES[locPlan]);
    items.push({
      name: `Loc - ${locPlan === "k2" ? "K\u00B2" : locPlan.toUpperCase()}`,
      monthlyRefSemKombo: baseMonthlyRef,
      monthlyRefComKombo: Math.round(baseMonthlyRef * komboDiscount),
      priceSemKombo: basePrice,
      priceComKombo: Math.round(basePrice * komboDiscount),
      implantation: IMPLEMENTATION_COSTS.loc,
    });
  }

  if (addons.leads) {
    const baseMonthlyRef = calcMonthlyRef(ADDON_ANNUAL_PRICES.leads);
    const basePrice = calcPrice(ADDON_ANNUAL_PRICES.leads);
    items.push({
      name: "Leads",
      monthlyRefSemKombo: baseMonthlyRef,
      monthlyRefComKombo: Math.round(baseMonthlyRef * komboDiscount),
      priceSemKombo: basePrice,
      priceComKombo: Math.round(basePrice * komboDiscount),
      implantation: IMPLEMENTATION_COSTS.leads,
    });
  }

  if (addons.inteligencia) {
    const baseMonthlyRef = calcMonthlyRef(ADDON_ANNUAL_PRICES.inteligencia);
    const basePrice = calcPrice(ADDON_ANNUAL_PRICES.inteligencia);
    items.push({
      name: "Inteligência",
      monthlyRefSemKombo: baseMonthlyRef,
      monthlyRefComKombo: Math.round(baseMonthlyRef * komboDiscount),
      priceSemKombo: basePrice,
      priceComKombo: Math.round(basePrice * komboDiscount),
      implantation: IMPLEMENTATION_COSTS.inteligencia,
    });
  }

  if (addons.assinatura) {
    const baseMonthlyRef = calcMonthlyRef(ADDON_ANNUAL_PRICES.assinatura);
    const basePrice = calcPrice(ADDON_ANNUAL_PRICES.assinatura);
    items.push({
      name: "Assinatura",
      monthlyRefSemKombo: baseMonthlyRef,
      monthlyRefComKombo: Math.round(baseMonthlyRef * komboDiscount),
      priceSemKombo: basePrice,
      priceComKombo: Math.round(basePrice * komboDiscount),
      implantation: IMPLEMENTATION_COSTS.assinatura,
    });
  }

  return items;
}

function getKomboInfo(komboType: KomboType) {
  if (komboType === "none") return null;
  return KOMBOS[komboType] || null;
}

function buildTestInput(
  product: ProductSelection,
  imobPlan: PlanTier,
  locPlan: PlanTier,
  addons: AddonsState,
  metrics: MetricsState,
  frequency: string,
  activeKombo: KomboType,
): ProposalDataInput {
  const komboInfo = getKomboInfo(activeKombo);
  const lineItems = simulateGetLineItems(product, imobPlan, locPlan, addons, frequency, komboInfo);

  return {
    quoteInfo: {
      vendorName: "Test Vendor",
      vendorEmail: "test@kenlo.com",
      vendorPhone: "(11) 99999-9999",
      vendorRole: "Consultor",
      installments: 3,
      validityDays: 30,
    },
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    frequency: frequency as any,
    activeKombo,
    komboInfo,
    businessNature: {
      businessType: "both",
      companyName: "Test Imobiliária",
      ownerName: "Test Owner",
      email: "test@test.com",
      cellphone: "(11) 99999-9999",
      landline: "",
      hasWebsite: true,
      websiteUrl: "https://test.com",
      hasCRM: false,
      crmSystem: "",
      crmOther: "",
      hasERP: false,
      erpSystem: "",
      erpOther: "",
    },
    prepayAdditionalUsers: false,
    prepayAdditionalContracts: false,
    selectedColumnsData: [],
    getLineItems: () => lineItems,
    calculateTotalImplementation: (withKombo: boolean) => {
      if (withKombo && komboInfo) return IMPLEMENTATION_COSTS.imob;
      return lineItems.reduce((sum, item) => sum + (item.implantation || 0), 0);
    },
    calculatePrepaymentAmount: () => ({ users: 0, contracts: 0 }),
  };
}

// ============================================================================
// SECTION 1: buildProposalData metrics match user input exactly
// ============================================================================

describe("PDF Accuracy: buildProposalData reflects user input", () => {
  for (const plan of ALL_PLANS) {
    const userCounts = [
      { imobUsers: IMOB_PLANS[plan].includedUsers, contracts: LOC_PLANS[plan].includedContracts },
      { imobUsers: IMOB_PLANS[plan].includedUsers + 5, contracts: LOC_PLANS[plan].includedContracts + 50 },
      { imobUsers: 1, contracts: 50 },
      { imobUsers: 30, contracts: 500 },
    ];

    for (const counts of userCounts) {
      it(`${plan} with ${counts.imobUsers} users / ${counts.contracts} contracts: proposal data matches`, () => {
        const metrics = makeMetrics({
          imobUsers: counts.imobUsers,
          contractsUnderManagement: counts.contracts,
        });
        const input = buildTestInput("both", plan, plan, makeAddons(), metrics, "annual", "none");
        const data = buildProposalData(input);

        // User counts in proposal must match input exactly
        expect(data.imobUsers).toBe(counts.imobUsers);
        expect(data.contracts).toBe(counts.contracts);
      });
    }
  }
});

// ============================================================================
// SECTION 2: Monthly total matches line item sum
// ============================================================================

describe("PDF Accuracy: totalMonthly matches line item sum", () => {
  const products: ProductSelection[] = ["imob", "loc", "both"];
  const addonCombos = [
    makeAddons(),
    makeAddons({ leads: true }),
    makeAddons({ inteligencia: true }),
    makeAddons({ assinatura: true }),
    makeAddons({ leads: true, inteligencia: true, assinatura: true }),
  ];

  for (const product of products) {
    for (const plan of ALL_PLANS) {
      for (const addons of addonCombos) {
        const addonNames = Object.entries(addons).filter(([_, v]) => v).map(([k]) => k).join("+") || "none";
        it(`${product}/${plan}/${addonNames}: totalMonthly = sum of line items`, () => {
          const metrics = makeMetrics();
          const input = buildTestInput(product, plan, plan, addons, metrics, "annual", "none");
          const data = buildProposalData(input);
          const lineItems = input.getLineItems();

          const expectedTotal = lineItems.reduce((sum, item) => sum + item.priceSemKombo, 0);
          expect(data.totalMonthly).toBe(expectedTotal);
          expect(data.totalAnnual).toBe(expectedTotal * 12);
        });
      }
    }
  }
});

// ============================================================================
// SECTION 3: Post-paid total in proposal matches calculator
// ============================================================================

describe("PDF Accuracy: postPaidTotal matches calculator", () => {
  const scenarios = [
    {
      name: "IMOB K with 15 users (additional users)",
      product: "imob" as const,
      imobPlan: "k" as PlanTier,
      locPlan: "k" as PlanTier,
      addons: makeAddons(),
      metrics: makeMetrics({ imobUsers: 15 }),
    },
    {
      name: "LOC K2 with 500 contracts (additional contracts)",
      product: "loc" as const,
      imobPlan: "k2" as PlanTier,
      locPlan: "k2" as PlanTier,
      addons: makeAddons(),
      metrics: makeMetrics({ contractsUnderManagement: 500 }),
    },
    {
      name: "Both with Pay + boleto + split",
      product: "both" as const,
      imobPlan: "k" as PlanTier,
      locPlan: "k" as PlanTier,
      addons: makeAddons({ pay: true }),
      metrics: makeMetrics({
        imobUsers: 15,
        contractsUnderManagement: 300,
        chargesBoletoToTenant: true,
        boletoChargeAmount: 5,
        chargesSplitToOwner: true,
        splitChargeAmount: 3,
      }),
    },
    {
      name: "Both with all addons",
      product: "both" as const,
      imobPlan: "k2" as PlanTier,
      locPlan: "k2" as PlanTier,
      addons: makeAddons({ leads: true, inteligencia: true, assinatura: true, pay: true, seguros: true }),
      metrics: makeMetrics({
        imobUsers: 20,
        contractsUnderManagement: 500,
        closingsPerMonth: 10,
        newContractsPerMonth: 15,
        leadsPerMonth: 200,
        wantsWhatsApp: true,
        chargesBoletoToTenant: true,
        boletoChargeAmount: 5,
        chargesSplitToOwner: true,
        splitChargeAmount: 3,
      }),
    },
    {
      name: "Pay OFF with boleto flags still set (bug scenario)",
      product: "loc" as const,
      imobPlan: "k" as PlanTier,
      locPlan: "k" as PlanTier,
      addons: makeAddons({ pay: false }),
      metrics: makeMetrics({
        contractsUnderManagement: 200,
        chargesBoletoToTenant: true,
        boletoChargeAmount: 5,
        chargesSplitToOwner: true,
        splitChargeAmount: 3,
      }),
    },
  ];

  for (const scenario of scenarios) {
    it(`${scenario.name}: postPaidTotal matches`, () => {
      const input = buildTestInput(
        scenario.product,
        scenario.imobPlan,
        scenario.locPlan,
        scenario.addons,
        scenario.metrics,
        "annual",
        "none",
      );
      const data = buildProposalData(input);

      // Calculate expected post-paid from the canonical calculator
      const calcInput = {
        product: scenario.product,
        imobPlan: scenario.imobPlan,
        locPlan: scenario.locPlan,
        addons: scenario.addons,
        metrics: scenario.metrics,
        prepayAdditionalUsers: false,
        prepayAdditionalContracts: false,
      };
      const expectedBreakdown = calculatePostPaidBreakdown(calcInput);

      expect(data.postPaidTotal).toBe(expectedBreakdown.total);
    });
  }
});

// ============================================================================
// SECTION 4: Revenue in proposal matches calculator
// ============================================================================

describe("PDF Accuracy: revenue matches calculator", () => {
  const scenarios = [
    {
      name: "Pay ON + boleto + split",
      product: "loc" as const,
      addons: makeAddons({ pay: true }),
      metrics: makeMetrics({
        contractsUnderManagement: 200,
        chargesBoletoToTenant: true,
        boletoChargeAmount: 5,
        chargesSplitToOwner: true,
        splitChargeAmount: 3,
      }),
    },
    {
      name: "Pay OFF (no revenue from boleto/split)",
      product: "loc" as const,
      addons: makeAddons({ pay: false }),
      metrics: makeMetrics({
        contractsUnderManagement: 200,
        chargesBoletoToTenant: true,
        boletoChargeAmount: 5,
      }),
    },
    {
      name: "Seguros ON",
      product: "loc" as const,
      addons: makeAddons({ seguros: true }),
      metrics: makeMetrics({ contractsUnderManagement: 200 }),
    },
    {
      name: "Pay + Seguros ON",
      product: "both" as const,
      addons: makeAddons({ pay: true, seguros: true }),
      metrics: makeMetrics({
        contractsUnderManagement: 300,
        chargesBoletoToTenant: true,
        boletoChargeAmount: 5,
        chargesSplitToOwner: true,
        splitChargeAmount: 3,
      }),
    },
    {
      name: "IMOB only (no LOC revenue)",
      product: "imob" as const,
      addons: makeAddons({ pay: true, seguros: true }),
      metrics: makeMetrics({
        contractsUnderManagement: 200,
        chargesBoletoToTenant: true,
        boletoChargeAmount: 5,
      }),
    },
  ];

  for (const scenario of scenarios) {
    it(`${scenario.name}: revenue matches`, () => {
      const input = buildTestInput(
        scenario.product,
        "k",
        "k",
        scenario.addons,
        scenario.metrics,
        "annual",
        "none",
      );
      const data = buildProposalData(input);

      const expectedRevenue = calculateRevenue(scenario.product, scenario.addons, scenario.metrics);

      expect(data.revenueFromBoletos).toBe(expectedRevenue.revenueFromBoletos);
      expect(data.revenueFromInsurance).toBe(expectedRevenue.revenueFromInsurance);
    });
  }
});

// ============================================================================
// SECTION 5: Kombo pricing in proposal is correct
// ============================================================================

describe("PDF Accuracy: Kombo pricing", () => {
  const komboScenarios: { kombo: KomboType; product: ProductSelection; addons: AddonsState }[] = [
    {
      kombo: "imob_start",
      product: "imob",
      addons: makeAddons({ leads: true, assinatura: true }),
    },
    {
      kombo: "imob_pro",
      product: "imob",
      addons: makeAddons({ leads: true, inteligencia: true, assinatura: true }),
    },
    {
      kombo: "locacao_pro",
      product: "loc",
      addons: makeAddons({ inteligencia: true, assinatura: true }),
    },
    {
      kombo: "core_gestao",
      product: "both",
      addons: makeAddons(),
    },
    {
      kombo: "elite",
      product: "both",
      addons: makeAddons({ leads: true, inteligencia: true, assinatura: true }),
    },
  ];

  for (const scenario of komboScenarios) {
    for (const plan of ALL_PLANS) {
      it(`Kombo ${scenario.kombo} / ${plan}: totalMonthly uses kombo discount`, () => {
        const metrics = makeMetrics();
        const input = buildTestInput(
          scenario.product,
          plan,
          plan,
          scenario.addons,
          metrics,
          "annual",
          scenario.kombo,
        );
        const data = buildProposalData(input);
        const lineItems = input.getLineItems();

        // With kombo, totalMonthly should use priceComKombo
        const expectedTotal = lineItems.reduce((sum, item) => sum + item.priceComKombo, 0);
        expect(data.totalMonthly).toBe(expectedTotal);

        // Kombo discount should be set
        expect(data.komboDiscount).toBeGreaterThanOrEqual(0);
      });
    }
  }
});

// ============================================================================
// SECTION 6: Post-paid breakdown JSON in proposal is parseable and accurate
// ============================================================================

describe("PDF Accuracy: postPaidBreakdown JSON structure", () => {
  it("breakdown JSON is valid and has correct total", () => {
    const metrics = makeMetrics({
      imobUsers: 15,
      contractsUnderManagement: 300,
      chargesBoletoToTenant: true,
      boletoChargeAmount: 5,
      chargesSplitToOwner: true,
      splitChargeAmount: 3,
      closingsPerMonth: 10,
      newContractsPerMonth: 15,
      wantsWhatsApp: true,
      leadsPerMonth: 200,
    });
    const addons = makeAddons({ leads: true, assinatura: true, pay: true });
    const input = buildTestInput("both", "k", "k", addons, metrics, "annual", "none");
    const data = buildProposalData(input);

    // postPaidBreakdown should be valid JSON
    expect(() => JSON.parse(data.postPaidBreakdown)).not.toThrow();

    const breakdown = JSON.parse(data.postPaidBreakdown);
    expect(breakdown.total).toBe(data.postPaidTotal);
  });

  it("breakdown with Pay OFF has no boleto/split items", () => {
    const metrics = makeMetrics({
      contractsUnderManagement: 200,
      chargesBoletoToTenant: false,
      boletoChargeAmount: 0,
      chargesSplitToOwner: false,
      splitChargeAmount: 0,
    });
    const addons = makeAddons({ pay: false });
    const input = buildTestInput("loc", "k", "k", addons, metrics, "annual", "none");
    const data = buildProposalData(input);

    const breakdown = JSON.parse(data.postPaidBreakdown);
    const allItems = [
      ...(breakdown.imobAddons?.items || []),
      ...(breakdown.locAddons?.items || []),
      ...(breakdown.sharedAddons?.items || []),
    ];
    const boletoSplitItems = allItems.filter((i: any) =>
      i.label.toLowerCase().includes("boleto") || i.label.toLowerCase().includes("split")
    );
    expect(boletoSplitItems).toHaveLength(0);
  });
});

// ============================================================================
// SECTION 7: Implementation fee matches expected values
// ============================================================================

describe("PDF Accuracy: implementation fees", () => {
  it("IMOB only: implementation = IMOB cost", () => {
    const input = buildTestInput("imob", "k", "k", makeAddons(), makeMetrics(), "annual", "none");
    const data = buildProposalData(input);
    expect(data.implantationFee).toBe(IMPLEMENTATION_COSTS.imob);
  });

  it("LOC only: implementation = LOC cost", () => {
    const input = buildTestInput("loc", "k", "k", makeAddons(), makeMetrics(), "annual", "none");
    const data = buildProposalData(input);
    expect(data.implantationFee).toBe(IMPLEMENTATION_COSTS.loc);
  });

  it("Both: implementation = IMOB + LOC cost", () => {
    const input = buildTestInput("both", "k", "k", makeAddons(), makeMetrics(), "annual", "none");
    const data = buildProposalData(input);
    expect(data.implantationFee).toBe(IMPLEMENTATION_COSTS.imob + IMPLEMENTATION_COSTS.loc);
  });

  it("With addons: implementation includes addon costs", () => {
    const addons = makeAddons({ leads: true, inteligencia: true, assinatura: true });
    const input = buildTestInput("imob", "k", "k", addons, makeMetrics(), "annual", "none");
    const data = buildProposalData(input);
    const expected = IMPLEMENTATION_COSTS.imob + IMPLEMENTATION_COSTS.leads +
      IMPLEMENTATION_COSTS.inteligencia + IMPLEMENTATION_COSTS.assinatura;
    expect(data.implantationFee).toBe(expected);
  });

  it("With Kombo: implementation = single product cost", () => {
    const addons = makeAddons({ leads: true, assinatura: true });
    const input = buildTestInput("imob", "k", "k", addons, makeMetrics(), "annual", "imob_start");
    const data = buildProposalData(input);
    expect(data.implantationFee).toBe(IMPLEMENTATION_COSTS.imob);
  });
});

// ============================================================================
// SECTION 8: Addon prices in proposal match line items
// ============================================================================

describe("PDF Accuracy: addon prices match line items", () => {
  it("leads price in proposal matches line item", () => {
    const addons = makeAddons({ leads: true });
    const input = buildTestInput("imob", "k", "k", addons, makeMetrics(), "annual", "none");
    const data = buildProposalData(input);
    const lineItems = input.getLineItems();
    const leadsItem = lineItems.find(i => i.name === "Leads");
    expect(leadsItem).toBeDefined();
    const addonPrices = JSON.parse(data.addonPrices);
    expect(addonPrices.leads).toBe(leadsItem!.priceSemKombo);
  });

  it("inteligencia price in proposal matches line item", () => {
    const addons = makeAddons({ inteligencia: true });
    const input = buildTestInput("imob", "k", "k", addons, makeMetrics(), "annual", "none");
    const data = buildProposalData(input);
    const lineItems = input.getLineItems();
    const intItem = lineItems.find(i => i.name === "Inteligência");
    expect(intItem).toBeDefined();
    const addonPrices = JSON.parse(data.addonPrices);
    expect(addonPrices.inteligencia).toBe(intItem!.priceSemKombo);
  });

  it("assinatura price in proposal matches line item", () => {
    const addons = makeAddons({ assinatura: true });
    const input = buildTestInput("imob", "k", "k", addons, makeMetrics(), "annual", "none");
    const data = buildProposalData(input);
    const lineItems = input.getLineItems();
    const sigItem = lineItems.find(i => i.name === "Assinatura");
    expect(sigItem).toBeDefined();
    const addonPrices = JSON.parse(data.addonPrices);
    expect(addonPrices.assinatura).toBe(sigItem!.priceSemKombo);
  });
});

// ============================================================================
// SECTION 9: Specific bug regression tests
// ============================================================================

describe("PDF Accuracy: Bug regression tests", () => {
  it("K2 with 15 users: proposal shows 15 users (not 10)", () => {
    const metrics = makeMetrics({ imobUsers: 15 });
    const input = buildTestInput("imob", "k2", "k2", makeAddons(), metrics, "annual", "none");
    const data = buildProposalData(input);
    expect(data.imobUsers).toBe(15);
  });

  it("K with 7 users: proposal shows 7 users (not 5)", () => {
    const metrics = makeMetrics({ imobUsers: 7 });
    const input = buildTestInput("imob", "k", "k", makeAddons(), metrics, "annual", "none");
    const data = buildProposalData(input);
    expect(data.imobUsers).toBe(7);
  });

  it("Pay OFF: boleto flags in proposal data", () => {
    const metrics = makeMetrics({
      chargesBoletoToTenant: false,
      boletoChargeAmount: 0,
      chargesSplitToOwner: false,
      splitChargeAmount: 0,
    });
    const input = buildTestInput("loc", "k", "k", makeAddons({ pay: false }), metrics, "annual", "none");
    const data = buildProposalData(input);
    expect(data.chargesBoletoToTenant).toBe(false);
    expect(data.chargesSplitToOwner).toBe(false);
    expect(data.boletoAmount).toBe(0);
    expect(data.splitAmount).toBe(0);
    expect(data.postPaidTotal).toBe(
      calculatePostPaidBreakdown({
        product: "loc",
        imobPlan: "k",
        locPlan: "k",
        addons: makeAddons({ pay: false }),
        metrics,
        prepayAdditionalUsers: false,
        prepayAdditionalContracts: false,
      }).total
    );
  });

  it("LOC K with 175 contracts (exactly included): no additional contract cost", () => {
    const metrics = makeMetrics({ contractsUnderManagement: 175 });
    const input = buildTestInput("loc", "k", "k", makeAddons(), metrics, "annual", "none");
    const data = buildProposalData(input);
    const breakdown = calculatePostPaidBreakdown({
      product: "loc",
      imobPlan: "k",
      locPlan: "k",
      addons: makeAddons(),
      metrics,
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
    });
    expect(breakdown.additionalContracts).toBe(0);
    expect(data.postPaidTotal).toBe(breakdown.total);
  });

  it("LOC K with 176 contracts (1 above included): has additional contract cost", () => {
    const metrics = makeMetrics({ contractsUnderManagement: 176 });
    const input = buildTestInput("loc", "k", "k", makeAddons(), metrics, "annual", "none");
    const data = buildProposalData(input);
    const breakdown = calculatePostPaidBreakdown({
      product: "loc",
      imobPlan: "k",
      locPlan: "k",
      addons: makeAddons(),
      metrics,
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
    });
    expect(breakdown.additionalContracts).toBeGreaterThan(0);
    expect(data.postPaidTotal).toBe(breakdown.total);
  });
});

// ============================================================================
// SECTION 10: Full matrix - every product × plan × frequency → proposal total consistency
// ============================================================================

describe("PDF Accuracy: Full matrix consistency check", () => {
  const products: ProductSelection[] = ["imob", "loc", "both"];

  for (const product of products) {
    for (const plan of ALL_PLANS) {
      for (const freq of CALC_FREQUENCIES) {
        it(`${product}/${plan}/${freq}: firstYearTotal = (monthly * 12) + implementation`, () => {
          const metrics = makeMetrics();
          const input = buildTestInput(product, plan, plan, makeAddons(), metrics, freq, "none");
          const data = buildProposalData(input);

          expect(data.firstYearTotal).toBe(data.totalAnnual + data.implantationFee);
          expect(data.totalAnnual).toBe(data.totalMonthly * 12);
        });
      }
    }
  }
});
