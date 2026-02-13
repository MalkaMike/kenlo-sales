/**
 * Tests for performance/performanceCalculators.ts — 7 pure metric calculators.
 */

import { describe, it, expect } from "vitest";
import {
  calculateMetrics,
  calculateKomboBreakdown,
  calculatePlanBreakdown,
  calculateVendorRanking,
  calculateFrequencyBreakdown,
  calculateAddonPopularity,
  calculateTrendData,
} from "../client/src/pages/performance/performanceCalculators";
import type { QuoteRecord } from "../client/src/pages/performance/performanceCalculators";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeQuote(overrides: Partial<QuoteRecord> = {}): QuoteRecord {
  return {
    id: 1,
    createdAt: "2026-01-15T10:00:00Z",
    frequency: "monthly",
    totals: JSON.stringify({ monthly: 1000, postPaid: 200, implantation: 500 }),
    ...overrides,
  };
}

// ─── calculateMetrics ───────────────────────────────────────────────────────

describe("calculateMetrics", () => {
  it("returns zeros for empty/undefined input", () => {
    expect(calculateMetrics(undefined)).toEqual({
      totalQuotes: 0,
      mrrWithoutPostPaid: 0,
      mrrWithPostPaid: 0,
      implantationVolume: 0,
      implantationValue: 0,
      ticketMedio: 0,
    });
    expect(calculateMetrics([])).toEqual({
      totalQuotes: 0,
      mrrWithoutPostPaid: 0,
      mrrWithPostPaid: 0,
      implantationVolume: 0,
      implantationValue: 0,
      ticketMedio: 0,
    });
  });

  it("calculates correct metrics for a single quote", () => {
    const result = calculateMetrics([makeQuote()]);
    expect(result.totalQuotes).toBe(1);
    expect(result.mrrWithoutPostPaid).toBe(1000);
    expect(result.mrrWithPostPaid).toBe(1200);
    expect(result.implantationVolume).toBe(1);
    expect(result.implantationValue).toBe(500);
    expect(result.ticketMedio).toBe(1200);
  });

  it("aggregates multiple quotes correctly", () => {
    const quotes = [
      makeQuote({ id: 1, totals: JSON.stringify({ monthly: 1000, postPaid: 200, implantation: 500 }) }),
      makeQuote({ id: 2, totals: JSON.stringify({ monthly: 2000, postPaid: 300, implantation: 0 }) }),
      makeQuote({ id: 3, totals: JSON.stringify({ monthly: 500, postPaid: 100, implantation: 1000 }) }),
    ];
    const result = calculateMetrics(quotes);
    expect(result.totalQuotes).toBe(3);
    expect(result.mrrWithoutPostPaid).toBe(3500);
    expect(result.mrrWithPostPaid).toBe(4100);
    expect(result.implantationVolume).toBe(2); // only 2 have implantation > 0
    expect(result.implantationValue).toBe(1500);
    expect(result.ticketMedio).toBeCloseTo(4100 / 3);
  });

  it("handles null/invalid totals gracefully", () => {
    const quotes = [
      makeQuote({ id: 1, totals: null }),
      makeQuote({ id: 2, totals: "invalid json" }),
    ];
    const result = calculateMetrics(quotes);
    expect(result.totalQuotes).toBe(2);
    expect(result.mrrWithoutPostPaid).toBe(0);
    expect(result.mrrWithPostPaid).toBe(0);
  });
});

// ─── calculateKomboBreakdown ────────────────────────────────────────────────

describe("calculateKomboBreakdown", () => {
  it("returns empty for undefined/empty input", () => {
    expect(calculateKomboBreakdown(undefined)).toEqual([]);
    expect(calculateKomboBreakdown([])).toEqual([]);
  });

  it("groups by komboId and sorts by count descending", () => {
    const quotes = [
      makeQuote({ id: 1, komboId: "elite" }),
      makeQuote({ id: 2, komboId: "elite" }),
      makeQuote({ id: 3, komboId: "core_gestao" }),
    ];
    const result = calculateKomboBreakdown(quotes);
    expect(result).toHaveLength(2);
    expect(result[0].komboId).toBe("elite");
    expect(result[0].count).toBe(2);
    expect(result[0].komboName).toBe("Elite");
    expect(result[1].komboId).toBe("core_gestao");
    expect(result[1].count).toBe(1);
    expect(result[1].komboName).toBe("Core Gestão");
  });

  it("treats null komboId as sem_kombo", () => {
    const quotes = [makeQuote({ id: 1, komboId: null })];
    const result = calculateKomboBreakdown(quotes);
    expect(result[0].komboId).toBe("sem_kombo");
    expect(result[0].komboName).toBe("Sem Kombo");
  });
});

// ─── calculatePlanBreakdown ─────────────────────────────────────────────────

describe("calculatePlanBreakdown", () => {
  it("returns empty for undefined/empty input", () => {
    expect(calculatePlanBreakdown(undefined)).toEqual([]);
  });

  it("creates separate entries for imob and loc plans", () => {
    const quotes = [
      makeQuote({ id: 1, imobPlan: "k", locPlan: "prime" }),
    ];
    const result = calculatePlanBreakdown(quotes);
    expect(result).toHaveLength(2);
    const plans = result.map((r) => r.plan);
    expect(plans).toContain("IMOB K");
    expect(plans).toContain("LOC Prime");
  });

  it("splits MRR evenly when both plans present", () => {
    const quotes = [
      makeQuote({
        id: 1,
        imobPlan: "k",
        locPlan: "prime",
        totals: JSON.stringify({ monthly: 1000, postPaid: 200 }),
      }),
    ];
    const result = calculatePlanBreakdown(quotes);
    const imob = result.find((r) => r.plan === "IMOB K")!;
    expect(imob.mrrWithoutPostPaid).toBe(500); // 1000 / 2
    expect(imob.mrrWithPostPaid).toBe(600); // (1000 + 200) / 2
  });

  it("assigns full MRR when only one plan present", () => {
    const quotes = [
      makeQuote({
        id: 1,
        imobPlan: "k2",
        locPlan: null,
        totals: JSON.stringify({ monthly: 1000, postPaid: 200 }),
      }),
    ];
    const result = calculatePlanBreakdown(quotes);
    expect(result).toHaveLength(1);
    expect(result[0].mrrWithoutPostPaid).toBe(1000);
  });
});

// ─── calculateVendorRanking ─────────────────────────────────────────────────

describe("calculateVendorRanking", () => {
  it("returns empty for undefined/empty input", () => {
    expect(calculateVendorRanking(undefined)).toEqual([]);
  });

  it("ranks vendors by MRR without post-paid descending", () => {
    const quotes = [
      makeQuote({ id: 1, vendorName: "Alice", totals: JSON.stringify({ monthly: 2000, postPaid: 100, implantation: 0 }) }),
      makeQuote({ id: 2, vendorName: "Bob", totals: JSON.stringify({ monthly: 3000, postPaid: 200, implantation: 500 }) }),
      makeQuote({ id: 3, vendorName: "Alice", totals: JSON.stringify({ monthly: 1000, postPaid: 50, implantation: 0 }) }),
    ];
    const result = calculateVendorRanking(quotes);
    expect(result[0].vendorName).toBe("Alice");
    expect(result[0].mrrWithoutPostPaid).toBe(3000);
    expect(result[0].count).toBe(2);
    expect(result[0].ticketMedio).toBeCloseTo((2000 + 100 + 1000 + 50) / 2);
    expect(result[1].vendorName).toBe("Bob");
    expect(result[1].mrrWithoutPostPaid).toBe(3000);
  });

  it("uses 'Sem vendedor' for null vendor names", () => {
    const quotes = [makeQuote({ id: 1, vendorName: null })];
    const result = calculateVendorRanking(quotes);
    expect(result[0].vendorName).toBe("Sem vendedor");
  });
});

// ─── calculateFrequencyBreakdown ────────────────────────────────────────────

describe("calculateFrequencyBreakdown", () => {
  it("returns empty for undefined/empty input", () => {
    expect(calculateFrequencyBreakdown(undefined)).toEqual([]);
  });

  it("calculates correct percentages", () => {
    const quotes = [
      makeQuote({ id: 1, frequency: "monthly" }),
      makeQuote({ id: 2, frequency: "monthly" }),
      makeQuote({ id: 3, frequency: "annual" }),
      makeQuote({ id: 4, frequency: "annual" }),
      makeQuote({ id: 5, frequency: "semestral" }),
    ];
    const result = calculateFrequencyBreakdown(quotes);
    expect(result).toHaveLength(3);
    expect(result[0].count).toBe(2); // monthly or annual (tied)
    const monthly = result.find((r) => r.frequency === "monthly")!;
    expect(monthly.percentage).toBe(40);
    expect(monthly.name).toBe("Mensal");
  });

  it("maps frequency names correctly", () => {
    const quotes = [makeQuote({ id: 1, frequency: "biennial" })];
    const result = calculateFrequencyBreakdown(quotes);
    expect(result[0].name).toBe("Bienal");
  });
});

// ─── calculateAddonPopularity ───────────────────────────────────────────────

describe("calculateAddonPopularity", () => {
  it("returns empty for undefined/empty input", () => {
    expect(calculateAddonPopularity(undefined)).toEqual([]);
  });

  it("counts enabled addons correctly", () => {
    const quotes = [
      makeQuote({ id: 1, addons: JSON.stringify({ leads: true, pay: true, seguros: false }) }),
      makeQuote({ id: 2, addons: JSON.stringify({ leads: true, cash: true }) }),
      makeQuote({ id: 3, addons: null }),
    ];
    const result = calculateAddonPopularity(quotes);
    const leads = result.find((r) => r.addon === "leads")!;
    expect(leads.count).toBe(2);
    expect(leads.percentage).toBeCloseTo((2 / 3) * 100);
    expect(leads.name).toBe("Leads");
    const pay = result.find((r) => r.addon === "pay")!;
    expect(pay.count).toBe(1);
  });

  it("ignores disabled addons", () => {
    const quotes = [
      makeQuote({ id: 1, addons: JSON.stringify({ leads: false, pay: false }) }),
    ];
    const result = calculateAddonPopularity(quotes);
    expect(result).toHaveLength(0);
  });
});

// ─── calculateTrendData ─────────────────────────────────────────────────────

describe("calculateTrendData", () => {
  it("returns empty for undefined/empty input", () => {
    expect(calculateTrendData(undefined)).toEqual([]);
    expect(calculateTrendData([])).toEqual([]);
  });

  it("groups by date and sums MRR", () => {
    const quotes = [
      makeQuote({ id: 1, createdAt: "2026-01-15T10:00:00Z", totals: JSON.stringify({ monthly: 1000, postPaid: 200 }) }),
      makeQuote({ id: 2, createdAt: "2026-01-15T14:00:00Z", totals: JSON.stringify({ monthly: 500, postPaid: 100 }) }),
      makeQuote({ id: 3, createdAt: "2026-01-16T10:00:00Z", totals: JSON.stringify({ monthly: 2000, postPaid: 300 }) }),
    ];
    const result = calculateTrendData(quotes);
    expect(result).toHaveLength(2);
    // First date should be 15/01
    const day15 = result.find((r) => r.date.startsWith("15"))!;
    expect(day15["MRR s/ pós"]).toBe(1500);
    expect(day15["MRR c/ pós"]).toBe(1800);
    expect(day15.cotacoes).toBe(2);
  });

  it("sorts by date ascending", () => {
    const quotes = [
      makeQuote({ id: 1, createdAt: "2026-02-20T10:00:00Z" }),
      makeQuote({ id: 2, createdAt: "2026-01-05T10:00:00Z" }),
      makeQuote({ id: 3, createdAt: "2026-01-15T10:00:00Z" }),
    ];
    const result = calculateTrendData(quotes);
    expect(result).toHaveLength(3);
    // Jan dates should come before Feb
    expect(result[0].date).toMatch(/05\/01/);
    expect(result[1].date).toMatch(/15\/01/);
    expect(result[2].date).toMatch(/20\/02/);
  });
});
