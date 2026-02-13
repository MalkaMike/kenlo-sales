/**
 * Shared constants and helpers for the Histórico page.
 */

// ── Currency formatter ──────────────────────────────────────────
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// ── Safe JSON parser ────────────────────────────────────────────
export const parseJSON = (str: string | null) => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

// ── Display name maps ───────────────────────────────────────────
export const productNames: Record<string, string> = {
  imob: "Kenlo Imob",
  loc: "Kenlo Locação",
  both: "Imob + Locação",
};

export const planNames: Record<string, string> = {
  prime: "Prime",
  k: "K",
  k2: "K2",
};

export const frequencyNames: Record<string, string> = {
  monthly: "Mensal",
  semestral: "Semestral",
  annual: "Anual",
  biennial: "Bienal",
};

// ── Vendor list for filter ──────────────────────────────────────
export const VENDOR_NAMES = [
  "AMANDA DE OLIVEIRA MATOS",
  "BRUNO RIBEIRO DA SILVA",
  "CASSIA MOREIRA BARBOSA",
  "EMERSON DE MORAES",
  "IVAN KERR CODO",
  "JAQUELINE SILVA GRANELLI",
  "LARISSA BRANDALISE FAVI",
  "MARINA KIYOMI YOKOMUN",
  "YR MADEIRAS DE GASPERIN",
  "ROBERTA PACHECO DE AZEVEDO",
];

// ── Chart colors ────────────────────────────────────────────────
export const CHART_COLORS = [
  "#e11d48", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];
