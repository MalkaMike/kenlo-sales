/**
 * Unit tests for shared/formatters.ts
 */
import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  fmt,
  formatCurrencyRounded,
  formatCurrencyFromCents,
  formatCurrencyCompact,
  fmtNum,
  formatNumber,
  formatNumberFlexible,
  fmtNumFromAny,
  formatPercent,
} from "../shared/formatters";

// ── Currency Formatters ─────────────────────────────────────────

describe("formatCurrency", () => {
  it("should format with R$ prefix and 2 decimals by default", () => {
    const result = formatCurrency(1234.5);
    expect(result).toContain("R$");
    expect(result).toContain("1.234,50");
  });

  it("should respect custom decimals", () => {
    const result = formatCurrency(1234.567, 0);
    expect(result).toContain("1.235");
    expect(result).not.toContain(",");
  });

  it("should handle zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0,00");
  });

  it("should handle negative values", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("500,00");
  });
});

describe("fmt", () => {
  it("should be an alias for formatCurrency with 2 decimals", () => {
    expect(fmt(1234.5)).toBe(formatCurrency(1234.5, 2));
  });
});

describe("formatCurrencyRounded", () => {
  it("should format with no decimals", () => {
    const result = formatCurrencyRounded(1234.7);
    expect(result).toContain("R$");
    expect(result).toContain("1.235");
    expect(result).not.toContain(",");
  });
});

describe("formatCurrencyFromCents", () => {
  it("should divide by 100 before formatting", () => {
    const result = formatCurrencyFromCents(12345);
    expect(result).toContain("123,45");
  });

  it("should handle zero cents", () => {
    const result = formatCurrencyFromCents(0);
    expect(result).toContain("0,00");
  });
});

describe("formatCurrencyCompact", () => {
  it("should format without R$ prefix and no decimals", () => {
    const result = formatCurrencyCompact(1234);
    expect(result).not.toContain("R$");
    expect(result).toBe("1.234");
  });

  it("should round to integer", () => {
    const result = formatCurrencyCompact(1234.7);
    expect(result).toBe("1.235");
  });
});

// ── Number Formatters ───────────────────────────────────────────

describe("fmtNum", () => {
  it("should format integer with thousands separator", () => {
    expect(fmtNum(1234567)).toBe("1.234.567");
  });

  it("should round decimals to 0", () => {
    expect(fmtNum(1234.7)).toBe("1.235");
  });

  it("should handle zero", () => {
    expect(fmtNum(0)).toBe("0");
  });
});

describe("formatNumber", () => {
  it("should format integers without decimals", () => {
    expect(formatNumber(1234)).toBe("1.234");
  });

  it("should format decimals with 1 fraction digit", () => {
    expect(formatNumber(1.2)).toBe("1,2");
  });

  it("should format large decimals", () => {
    const result = formatNumber(1234.5);
    expect(result).toBe("1.234,5");
  });
});

describe("formatNumberFlexible", () => {
  it("should format integer with no trailing decimals", () => {
    expect(formatNumberFlexible(1234)).toBe("1.234");
  });

  it("should show up to 2 decimals", () => {
    expect(formatNumberFlexible(1234.56)).toBe("1.234,56");
  });

  it("should not show more than 2 decimals", () => {
    expect(formatNumberFlexible(1234.567)).toBe("1.234,57");
  });
});

describe("fmtNumFromAny", () => {
  it("should format a number", () => {
    expect(fmtNumFromAny(1234)).toBe("1.234");
  });

  it("should parse and format a string number", () => {
    expect(fmtNumFromAny("1234")).toBe("1.234");
  });

  it("should handle comma-decimal strings", () => {
    expect(fmtNumFromAny("1234,5")).toBe("1.234,5");
  });

  it("should return 0 for invalid strings", () => {
    expect(fmtNumFromAny("abc")).toBe("0");
  });
});

// ── Percentage Formatters ───────────────────────────────────────

describe("formatPercent", () => {
  it("should format as percentage with 0 decimals by default", () => {
    expect(formatPercent(0.25)).toBe("25%");
  });

  it("should respect custom decimals", () => {
    expect(formatPercent(0.256, 1)).toBe("25,6%");
  });

  it("should handle zero", () => {
    expect(formatPercent(0)).toBe("0%");
  });

  it("should handle 100%", () => {
    expect(formatPercent(1)).toBe("100%");
  });
});
