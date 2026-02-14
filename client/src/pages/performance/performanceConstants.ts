/**
 * Constants and helpers for the Performance dashboard.
 * Pure functions — no React dependencies.
 */

// ─── Formatters (from shared) ───────────────────────────────────────────────

import { formatCurrencyRounded } from "@shared/formatters";
export const formatCurrency = formatCurrencyRounded;

export const formatCompactCurrency = (value: number): string => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return formatCurrency(value);
};

export const parseJSON = (str: string | null): any => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

// ─── Display Name Maps ──────────────────────────────────────────────────────

export const productNames: Record<string, string> = {
  imob: "Kenlo Imob",
  loc: "Kenlo Locação",
  both: "Imob + Locação",
};

export const planNames: Record<string, string> = {
  prime: "Prime",
  k: "K",
  k2: "K²",
};

export const frequencyNames: Record<string, string> = {
  monthly: "Mensal",
  semestral: "Semestral",
  annual: "Anual",
  biennial: "Bienal",
};

export const komboNames: Record<string, string> = {
  imob_start: "Imob Start",
  imob_pro: "Imob Pro",
  loc_pro: "Locação Pro",
  core_gestao: "Core Gestão",
  elite: "Elite",
  sem_kombo: "Sem Kombo",
};

export const addonNames: Record<string, string> = {
  leads: "Leads",
  inteligencia: "Inteligência",
  assinatura: "Assinatura",
  pay: "Pay",
  seguros: "Seguros",
  cash: "Cash",
};

// ─── Chart Colors ───────────────────────────────────────────────────────────

export const CHART_COLORS = [
  "#e11d48", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

export const KOMBO_COLORS: Record<string, string> = {
  imob_start: "#3b82f6",
  imob_pro: "#8b5cf6",
  loc_pro: "#10b981",
  core_gestao: "#f59e0b",
  elite: "#e11d48",
  sem_kombo: "#6b7280",
};
