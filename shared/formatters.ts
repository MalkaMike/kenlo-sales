/**
 * Shared formatting utilities for pt-BR locale.
 *
 * All currency, number, and percentage formatters live here.
 * Import from "@shared/formatters" in both client and server code.
 */

// ── Currency Formatters ─────────────────────────────────────────

/**
 * Format as BRL currency with R$ prefix.
 * @param value  Amount in reais (not cents)
 * @param decimals  Fraction digits (default 2)
 */
export const formatCurrency = (value: number, decimals: number = 2): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

/**
 * Alias for formatCurrency(value, 2) — used in PDF generators.
 */
export const fmt = (value: number): string => formatCurrency(value, 2);

/**
 * Format as BRL currency with no decimals (R$ 1.234).
 */
export const formatCurrencyRounded = (value: number): string =>
  formatCurrency(value, 0);

/**
 * Format cents as BRL currency (divides by 100 first).
 */
export const formatCurrencyFromCents = (cents: number): string =>
  formatCurrency(cents / 100);

/**
 * Format as number with pt-BR thousands separator, no R$ prefix, no decimals.
 * Used in Kombo comparison tables for compact display.
 */
export const formatCurrencyCompact = (value: number): string =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

// ── Number Formatters ───────────────────────────────────────────

/**
 * Format integer with pt-BR thousands separator (no decimals).
 */
export const fmtNum = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);

/**
 * Format number with pt-BR locale, auto-detecting integer vs decimal.
 * Integers: "1.234", Decimals: "1,2"
 */
export const formatNumber = (value: number): string => {
  if (value % 1 !== 0) {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }
  return value.toLocaleString("pt-BR");
};

/**
 * Format number with pt-BR locale, 0-2 decimal places.
 * Used in pricing admin for flexible display.
 */
export const formatNumberFlexible = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

/**
 * Format a value that may be string or number as pt-BR integer.
 */
export const fmtNumFromAny = (value: number | string): string => {
  const num = typeof value === "number" ? value : parseFloat(String(value).replace(",", ".")) || 0;
  return num.toLocaleString("pt-BR");
};

// ── Percentage Formatters ───────────────────────────────────────

/**
 * Format as percentage with pt-BR locale.
 * @param value  Fraction (0.25 = 25%)
 * @param decimals  Fraction digits (default 0)
 */
export const formatPercent = (value: number, decimals: number = 0): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
