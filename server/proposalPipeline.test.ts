/**
 * E2E tests for the proposal data pipeline.
 * Tests the full flow: config → buildProposalData → PDF data assembly.
 * Verifies that all extracted modules compose correctly.
 */
import { describe, it, expect } from "vitest";
import { buildProposalData, buildQuoteSaveData } from "../client/src/pages/calculadora/quote/buildProposalData";
import { calculatePostPaidTotal, buildPostPaidBreakdown } from "../client/src/pages/calculadora/quote/postPaidBuilder";
import { calculatePostPaidBreakdown, calculateRevenueBreakdown } from "../client/src/pages/calculadora/receita-extra/postPaidCalc";
import { buildKomboComparison, buildFrequencyComparison } from "../client/src/pages/calculadora/quote/comparisonBuilders";
import { classifyAddons, calculatePremiumServices, calculateRevenue } from "../client/src/pages/calculadora/quote/proposalHelpers";
import { KOMBOS } from "../client/src/pages/calculadora/types";
import type { AddonsState, MetricsState, LineItem } from "../client/src/pages/calculadora/types";

// ── Test Fixtures ──────────────────────────────────────────────

const baseAddons: AddonsState = {
  leads: false,
  inteligencia: false,
  assinatura: false,
  pay: false,
  seguros: false,
  cash: false,
};

const baseMetrics: MetricsState = {
  imobUsers: 5,
  closingsPerMonth: 10,
  contractsUnderManagement: 200,
  newContractsPerMonth: 15,
  leadsPerMonth: 150,
  usesExternalAI: false,
  wantsWhatsApp: false,
  chargesBoletoToTenant: false,
  chargesSplitToOwner: false,
  boletoChargeAmount: 0,
  splitChargeAmount: 0,
  imobVipSupport: false,
  imobDedicatedCS: false,
  locVipSupport: false,
  locDedicatedCS: false,
};

const baseQuoteInfo = {
  vendorName: "João Silva",
  vendorEmail: "joao@kenlo.com",
  vendorPhone: "(11) 99999-0000",
  vendorRole: "Consultor",
  salespersonId: "sp-1",
  installments: 1,
  validityDays: 30,
};

const baseBusinessNature = {
  ownerName: "Maria Santos",
  companyName: "Imobiliária Test",
  businessType: "real_estate" as const,
  email: "maria@test.com",
  cellphone: "(11) 88888-0000",
  landline: "",
  hasWebsite: false,
  websiteUrl: "",
  hasCRM: false,
  crmSystem: "",
  crmOther: "",
  hasERP: false,
  erpSystem: "",
  erpOther: "",
};

function makeLineItems(items: Array<{ name: string; sem: number; com: number }>): LineItem[] {
  return items.map((i) => ({
    name: i.name,
    priceSemKombo: i.sem,
    priceComKombo: i.com,
  }));
}

// ── Post-Paid Consistency Tests ────────────────────────────────

describe("Post-Paid Engine Consistency", () => {
  it("calculatePostPaidTotal should equal calculatePostPaidBreakdown.total for IMOB", () => {
    const input = {
      product: "imob" as const,
      imobPlan: "prime" as const,
      locPlan: "prime" as const,
      addons: { ...baseAddons, leads: true, assinatura: true },
      metrics: { ...baseMetrics, imobUsers: 10, wantsWhatsApp: true, closingsPerMonth: 30 },
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
    };
    const total = calculatePostPaidTotal(input);
    const breakdown = calculatePostPaidBreakdown(input);
    expect(total).toBe(breakdown.total);
    expect(total).toBeGreaterThan(0);
  });

  it("calculatePostPaidTotal should equal calculatePostPaidBreakdown.total for LOC with Pay", () => {
    const input = {
      product: "loc" as const,
      imobPlan: "prime" as const,
      locPlan: "k" as const,
      addons: { ...baseAddons, pay: true, seguros: true },
      metrics: {
        ...baseMetrics,
        contractsUnderManagement: 400,
        chargesBoletoToTenant: true,
        chargesSplitToOwner: true,
        boletoChargeAmount: 5,
        splitChargeAmount: 3,
      },
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
    };
    const total = calculatePostPaidTotal(input);
    const breakdown = calculatePostPaidBreakdown(input);
    expect(total).toBe(breakdown.total);
    expect(breakdown.additionalContracts).toBeGreaterThan(0);
    expect(breakdown.boletos).toBeGreaterThan(0);
  });

  it("calculatePostPaidTotal should equal calculatePostPaidBreakdown.total for BOTH with all addons", () => {
    const input = {
      product: "both" as const,
      imobPlan: "k2" as const,
      locPlan: "k2" as const,
      addons: { ...baseAddons, leads: true, inteligencia: true, assinatura: true, pay: true, seguros: true },
      metrics: {
        ...baseMetrics,
        imobUsers: 20,
        closingsPerMonth: 50,
        contractsUnderManagement: 800,
        newContractsPerMonth: 30,
        leadsPerMonth: 500,
        wantsWhatsApp: true,
        chargesBoletoToTenant: true,
        chargesSplitToOwner: true,
        boletoChargeAmount: 6,
        splitChargeAmount: 4,
      },
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
    };
    const total = calculatePostPaidTotal(input);
    const breakdown = calculatePostPaidBreakdown(input);
    expect(total).toBe(breakdown.total);
    expect(breakdown.additionalUsers).toBeGreaterThan(0);
    expect(breakdown.additionalContracts).toBeGreaterThan(0);
    expect(breakdown.whatsApp).toBeGreaterThan(0);
    expect(breakdown.assinaturas).toBeGreaterThan(0);
  });

  it("should return zero for both when all usage is within included quantities", () => {
    const input = {
      product: "both" as const,
      imobPlan: "k2" as const,
      locPlan: "k2" as const,
      addons: baseAddons,
      metrics: { ...baseMetrics, imobUsers: 5, contractsUnderManagement: 100 },
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
    };
    const total = calculatePostPaidTotal(input);
    const breakdown = calculatePostPaidBreakdown(input);
    expect(total).toBe(0);
    expect(breakdown.total).toBe(0);
  });

  it("prepay flags should suppress user/contract costs in both engines", () => {
    const input = {
      product: "both" as const,
      imobPlan: "prime" as const,
      locPlan: "prime" as const,
      addons: baseAddons,
      metrics: { ...baseMetrics, imobUsers: 20, contractsUnderManagement: 500 },
      prepayAdditionalUsers: true,
      prepayAdditionalContracts: true,
    };
    const total = calculatePostPaidTotal(input);
    const breakdown = calculatePostPaidBreakdown(input);
    expect(total).toBe(0);
    expect(breakdown.additionalUsers).toBe(0);
    expect(breakdown.additionalContracts).toBe(0);
  });
});

// ── Revenue Calculation Tests ──────────────────────────────────

describe("Revenue Calculation Consistency", () => {
  it("calculateRevenue and calculateRevenueBreakdown should agree on boleto revenue", () => {
    const addons = { ...baseAddons, pay: true };
    const metrics = {
      ...baseMetrics,
      contractsUnderManagement: 300,
      chargesBoletoToTenant: true,
      boletoChargeAmount: 5,
    };
    const { revenueFromBoletos } = calculateRevenue("loc", addons, metrics);
    const revBreakdown = calculateRevenueBreakdown({
      product: "loc",
      imobPlan: "prime",
      locPlan: "prime",
      addons,
      metrics,
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
    });
    expect(revenueFromBoletos).toBe(revBreakdown.boletoRevenue);
    expect(revenueFromBoletos).toBe(300 * 5);
  });

  it("calculateRevenue and calculateRevenueBreakdown should agree on insurance revenue", () => {
    const addons = { ...baseAddons, seguros: true };
    const metrics = { ...baseMetrics, contractsUnderManagement: 200 };
    const { revenueFromInsurance } = calculateRevenue("loc", addons, metrics);
    const revBreakdown = calculateRevenueBreakdown({
      product: "loc",
      imobPlan: "prime",
      locPlan: "prime",
      addons,
      metrics,
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
    });
    expect(revenueFromInsurance).toBe(revBreakdown.segurosRevenue);
    expect(revenueFromInsurance).toBe(200 * 10);
  });
});

// ── buildProposalData E2E Tests ────────────────────────────────

describe("buildProposalData E2E", () => {
  const lineItems = makeLineItems([
    { name: "Kenlo Imob PRIME", sem: 297, com: 223 },
    { name: "Kenlo Leads", sem: 197, com: 148 },
  ]);

  const makeInput = (overrides: Record<string, any> = {}) => ({
    quoteInfo: baseQuoteInfo,
    product: "imob" as const,
    imobPlan: "prime" as const,
    locPlan: "prime" as const,
    addons: { ...baseAddons, leads: true },
    metrics: baseMetrics,
    frequency: "annual" as const,
    activeKombo: "imob_start" as const,
    komboInfo: KOMBOS.imob_start,
    businessNature: baseBusinessNature,
    prepayAdditionalUsers: false,
    prepayAdditionalContracts: false,
    selectedColumnsData: [],
    getLineItems: () => lineItems,
    calculateTotalImplementation: (withKombo: boolean) => (withKombo ? 1497 : 2000),
    calculatePrepaymentAmount: () => ({ users: 0, contracts: 0 }),
    ...overrides,
  });

  it("should assemble complete proposal data with all required fields", () => {
    const data = buildProposalData(makeInput());

    // Vendor info
    expect(data.salesPersonName).toBe("João Silva");
    expect(data.vendorEmail).toBe("joao@kenlo.com");

    // Client info
    expect(data.clientName).toBe("Maria Santos");
    expect(data.agencyName).toBe("Imobiliária Test");

    // Product config
    expect(data.productType).toBe("imob");
    expect(data.imobPlan).toBe("prime");
    expect(data.komboName).toBe(KOMBOS.imob_start.name);

    // Financial totals
    expect(data.totalMonthly).toBe(223 + 148); // kombo prices
    expect(data.totalAnnual).toBe((223 + 148) * 12);
    expect(data.implantationFee).toBe(1497);
    expect(data.firstYearTotal).toBe((223 + 148) * 12 + 1497);

    // Payment
    expect(data.paymentPlan).toBe("annual");
    expect(data.installments).toBe(1);
    expect(data.validityDays).toBe(30);
  });

  it("should include postPaidBreakdown as JSON string", () => {
    const data = buildProposalData(makeInput());
    expect(typeof data.postPaidBreakdown).toBe("string");
    const parsed = JSON.parse(data.postPaidBreakdown);
    expect(parsed).toHaveProperty("total");
  });

  it("should include komboComparison as JSON string", () => {
    const data = buildProposalData(makeInput());
    expect(typeof data.komboComparison).toBe("string");
    const parsed = JSON.parse(data.komboComparison);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("should include frequencyComparison as JSON string", () => {
    const data = buildProposalData(makeInput());
    expect(typeof data.frequencyComparison).toBe("string");
    const parsed = JSON.parse(data.frequencyComparison);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("should exclude Cash from selectedAddons", () => {
    const data = buildProposalData(
      makeInput({ addons: { ...baseAddons, leads: true, cash: true } })
    );
    const addons = JSON.parse(data.selectedAddons);
    expect(addons).not.toContain("cash");
    expect(addons).toContain("leads");
  });

  it("should use sem-kombo prices when activeKombo is none", () => {
    const data = buildProposalData(
      makeInput({ activeKombo: "none", komboInfo: null })
    );
    expect(data.totalMonthly).toBe(297 + 197); // sem-kombo prices
    expect(data.komboName).toBeUndefined();
    expect(data.komboDiscount).toBeUndefined();
  });

  it("should calculate revenue fields when Pay and Seguros are active", () => {
    const data = buildProposalData(
      makeInput({
        product: "loc",
        addons: { ...baseAddons, pay: true, seguros: true },
        metrics: {
          ...baseMetrics,
          contractsUnderManagement: 300,
          chargesBoletoToTenant: true,
          boletoChargeAmount: 5,
        },
      })
    );
    expect(data.revenueFromBoletos).toBe(300 * 5);
    expect(data.revenueFromInsurance).toBe(300 * 10);
  });

  it("should set prepayment fields correctly", () => {
    const data = buildProposalData(
      makeInput({
        prepayAdditionalUsers: true,
        prepayAdditionalContracts: true,
        frequency: "annual",
        calculatePrepaymentAmount: () => ({ users: 500, contracts: 300 }),
      })
    );
    expect(data.prepayAdditionalUsers).toBe(true);
    expect(data.prepayAdditionalContracts).toBe(true);
    expect(data.prepaymentUsersAmount).toBe(500);
    expect(data.prepaymentContractsAmount).toBe(300);
    expect(data.prepaymentMonths).toBe(12);
  });
});

// ── buildQuoteSaveData Tests ───────────────────────────────────

describe("buildQuoteSaveData E2E", () => {
  it("should build save data with correct structure", () => {
    const lineItems = makeLineItems([
      { name: "Kenlo Imob PRIME", sem: 297, com: 223 },
    ]);
    const input = {
      quoteInfo: baseQuoteInfo,
      product: "imob" as const,
      imobPlan: "prime" as const,
      locPlan: "prime" as const,
      addons: { ...baseAddons, leads: true },
      metrics: baseMetrics,
      frequency: "annual" as const,
      activeKombo: "imob_start" as const,
      komboInfo: KOMBOS.imob_start,
      businessNature: baseBusinessNature,
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
      selectedColumnsData: [],
      getLineItems: () => lineItems,
      calculateTotalImplementation: () => 1497,
      calculatePrepaymentAmount: () => ({ users: 0, contracts: 0 }),
    };
    const proposalData = buildProposalData(input);
    const saveData = buildQuoteSaveData(input, proposalData);

    expect(saveData.action).toBe("pdf_exported");
    expect(saveData.product).toBe("imob");
    expect(saveData.imobPlan).toBe("prime");
    expect(saveData.locPlan).toBeUndefined(); // imob-only
    expect(saveData.frequency).toBe("annual");
    expect(saveData.clientName).toBe("Maria Santos");
    expect(saveData.vendorName).toBe("João Silva");
    expect(saveData.komboId).toBe("imob_start");

    const totals = JSON.parse(saveData.totals);
    expect(totals.monthly).toBe(proposalData.totalMonthly);
    expect(totals.annual).toBe(proposalData.totalAnnual);
  });

  it("should exclude kombo fields when no kombo selected", () => {
    const lineItems = makeLineItems([
      { name: "Kenlo Imob PRIME", sem: 297, com: 297 },
    ]);
    const input = {
      quoteInfo: baseQuoteInfo,
      product: "imob" as const,
      imobPlan: "prime" as const,
      locPlan: "prime" as const,
      addons: baseAddons,
      metrics: baseMetrics,
      frequency: "monthly" as const,
      activeKombo: "none" as const,
      komboInfo: null,
      businessNature: baseBusinessNature,
      prepayAdditionalUsers: false,
      prepayAdditionalContracts: false,
      selectedColumnsData: [],
      getLineItems: () => lineItems,
      calculateTotalImplementation: () => 2000,
      calculatePrepaymentAmount: () => ({ users: 0, contracts: 0 }),
    };
    const proposalData = buildProposalData(input);
    const saveData = buildQuoteSaveData(input, proposalData);

    expect(saveData.komboId).toBeUndefined();
    expect(saveData.komboName).toBeUndefined();
    expect(saveData.komboDiscount).toBeUndefined();
  });
});

// ── Addon Classification E2E ───────────────────────────────────

describe("Addon Classification in Pipeline", () => {
  it("should filter incompatible addons for IMOB-only", () => {
    const { compatible, incompatible } = classifyAddons(
      ["leads", "inteligencia", "pay", "seguros"],
      "imob"
    );
    // Pay and Seguros are LOC-only
    expect(compatible).toContain("leads");
    expect(compatible).toContain("inteligencia");
    expect(incompatible).toContain("pay");
    expect(incompatible).toContain("seguros");
  });

  it("should keep all addons for BOTH product", () => {
    const { compatible } = classifyAddons(
      ["leads", "inteligencia", "pay", "seguros", "assinatura"],
      "both"
    );
    expect(compatible).toHaveLength(5);
  });
});
