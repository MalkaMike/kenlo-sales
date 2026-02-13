/**
 * Pure metric calculation functions for the Performance dashboard.
 * No React dependencies — all functions are deterministic and testable.
 */

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  parseJSON,
  planNames,
  frequencyNames,
  komboNames,
  addonNames,
} from "./performanceConstants";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface QuoteRecord {
  id: number;
  createdAt: string | number | Date;
  action?: string | null;
  vendorName?: string | null;
  clientName?: string | null;
  agencyName?: string | null;
  cellPhone?: string | null;
  product?: string | null;
  imobPlan?: string | null;
  locPlan?: string | null;
  komboId?: string | null;
  komboName?: string | null;
  komboDiscount?: number | null;
  frequency: string;
  addons?: string | null;
  totals?: string | null;
  salespersonId?: number | null;
}

export interface DashboardMetrics {
  totalQuotes: number;
  mrrWithoutPostPaid: number;
  mrrWithPostPaid: number;
  implantationVolume: number;
  implantationValue: number;
  ticketMedio: number;
}

export interface KomboBreakdownItem {
  komboId: string;
  komboName: string;
  count: number;
  mrrWithoutPostPaid: number;
  mrrWithPostPaid: number;
  implantationValue: number;
}

export interface PlanBreakdownItem {
  plan: string;
  count: number;
  mrrWithoutPostPaid: number;
  mrrWithPostPaid: number;
}

export interface VendorRankingItem {
  vendorName: string;
  count: number;
  mrrWithoutPostPaid: number;
  mrrWithPostPaid: number;
  implantationValue: number;
  ticketMedio: number;
  salespersonId: number | null;
}

export interface FrequencyBreakdownItem {
  frequency: string;
  name: string;
  count: number;
  percentage: number;
}

export interface AddonPopularityItem {
  addon: string;
  name: string;
  count: number;
  percentage: number;
}

export interface TrendDataPoint {
  date: string;
  "MRR s/ pós": number;
  "MRR c/ pós": number;
  cotacoes: number;
}

// ─── Calculators ────────────────────────────────────────────────────────────

const EMPTY_METRICS: DashboardMetrics = {
  totalQuotes: 0,
  mrrWithoutPostPaid: 0,
  mrrWithPostPaid: 0,
  implantationVolume: 0,
  implantationValue: 0,
  ticketMedio: 0,
};

export function calculateMetrics(quotes: QuoteRecord[] | undefined): DashboardMetrics {
  if (!quotes || quotes.length === 0) return EMPTY_METRICS;

  let mrrWithoutPostPaid = 0;
  let mrrWithPostPaid = 0;
  let implantationVolume = 0;
  let implantationValue = 0;

  quotes.forEach((quote) => {
    const totals = parseJSON(quote.totals ?? null);
    const monthly = totals?.monthly || 0;
    const postPaid = totals?.postPaid || 0;
    const implantation = totals?.implantation || 0;

    mrrWithoutPostPaid += monthly;
    mrrWithPostPaid += monthly + postPaid;
    if (implantation > 0) {
      implantationVolume++;
      implantationValue += implantation;
    }
  });

  return {
    totalQuotes: quotes.length,
    mrrWithoutPostPaid,
    mrrWithPostPaid,
    implantationVolume,
    implantationValue,
    ticketMedio: quotes.length > 0 ? mrrWithPostPaid / quotes.length : 0,
  };
}

export function calculateKomboBreakdown(quotes: QuoteRecord[] | undefined): KomboBreakdownItem[] {
  if (!quotes || quotes.length === 0) return [];

  const map = new Map<string, Omit<KomboBreakdownItem, "komboId" | "komboName">>();

  quotes.forEach((quote) => {
    const komboId = quote.komboId || "sem_kombo";
    const totals = parseJSON(quote.totals ?? null);
    const monthly = totals?.monthly || 0;
    const postPaid = totals?.postPaid || 0;
    const implantation = totals?.implantation || 0;

    if (!map.has(komboId)) {
      map.set(komboId, { count: 0, mrrWithoutPostPaid: 0, mrrWithPostPaid: 0, implantationValue: 0 });
    }
    const data = map.get(komboId)!;
    data.count++;
    data.mrrWithoutPostPaid += monthly;
    data.mrrWithPostPaid += monthly + postPaid;
    data.implantationValue += implantation;
  });

  return Array.from(map.entries())
    .map(([komboId, data]) => ({
      komboId,
      komboName: komboNames[komboId] || komboId,
      ...data,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculatePlanBreakdown(quotes: QuoteRecord[] | undefined): PlanBreakdownItem[] {
  if (!quotes || quotes.length === 0) return [];

  const map = new Map<string, { count: number; mrrWithoutPostPaid: number; mrrWithPostPaid: number }>();

  quotes.forEach((quote) => {
    const totals = parseJSON(quote.totals ?? null);
    const monthly = totals?.monthly || 0;
    const postPaid = totals?.postPaid || 0;

    if (quote.imobPlan) {
      const key = `IMOB ${planNames[quote.imobPlan] || quote.imobPlan}`;
      if (!map.has(key)) map.set(key, { count: 0, mrrWithoutPostPaid: 0, mrrWithPostPaid: 0 });
      const data = map.get(key)!;
      data.count++;
      data.mrrWithoutPostPaid += monthly / (quote.locPlan ? 2 : 1);
      data.mrrWithPostPaid += (monthly + postPaid) / (quote.locPlan ? 2 : 1);
    }

    if (quote.locPlan) {
      const key = `LOC ${planNames[quote.locPlan] || quote.locPlan}`;
      if (!map.has(key)) map.set(key, { count: 0, mrrWithoutPostPaid: 0, mrrWithPostPaid: 0 });
      const data = map.get(key)!;
      data.count++;
      data.mrrWithoutPostPaid += monthly / (quote.imobPlan ? 2 : 1);
      data.mrrWithPostPaid += (monthly + postPaid) / (quote.imobPlan ? 2 : 1);
    }
  });

  return Array.from(map.entries())
    .map(([plan, data]) => ({ plan, ...data }))
    .sort((a, b) => b.count - a.count);
}

export function calculateVendorRanking(quotes: QuoteRecord[] | undefined): VendorRankingItem[] {
  if (!quotes || quotes.length === 0) return [];

  const map = new Map<string, {
    count: number;
    mrrWithoutPostPaid: number;
    mrrWithPostPaid: number;
    implantationValue: number;
    salespersonId: number | null;
  }>();

  quotes.forEach((quote) => {
    const vendorName = quote.vendorName || "Sem vendedor";
    const totals = parseJSON(quote.totals ?? null);
    const monthly = totals?.monthly || 0;
    const postPaid = totals?.postPaid || 0;
    const implantation = totals?.implantation || 0;

    if (!map.has(vendorName)) {
      map.set(vendorName, {
        count: 0,
        mrrWithoutPostPaid: 0,
        mrrWithPostPaid: 0,
        implantationValue: 0,
        salespersonId: quote.salespersonId ?? null,
      });
    }
    const data = map.get(vendorName)!;
    data.count++;
    data.mrrWithoutPostPaid += monthly;
    data.mrrWithPostPaid += monthly + postPaid;
    data.implantationValue += implantation;
  });

  return Array.from(map.entries())
    .map(([vendorName, data]) => ({
      vendorName,
      ...data,
      ticketMedio: data.count > 0 ? data.mrrWithPostPaid / data.count : 0,
    }))
    .sort((a, b) => b.mrrWithoutPostPaid - a.mrrWithoutPostPaid);
}

export function calculateFrequencyBreakdown(quotes: QuoteRecord[] | undefined): FrequencyBreakdownItem[] {
  if (!quotes || quotes.length === 0) return [];

  const map = new Map<string, number>();
  quotes.forEach((quote) => {
    const freq = quote.frequency || "unknown";
    map.set(freq, (map.get(freq) || 0) + 1);
  });

  const total = quotes.length;
  return Array.from(map.entries())
    .map(([frequency, count]) => ({
      frequency,
      name: frequencyNames[frequency] || frequency,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateAddonPopularity(quotes: QuoteRecord[] | undefined): AddonPopularityItem[] {
  if (!quotes || quotes.length === 0) return [];

  const map = new Map<string, number>();
  quotes.forEach((quote) => {
    const addons = parseJSON(quote.addons ?? null);
    if (addons && typeof addons === "object") {
      for (const [addon, enabled] of Object.entries(addons)) {
        if (enabled) {
          map.set(addon, (map.get(addon) || 0) + 1);
        }
      }
    }
  });

  const total = quotes.length;
  return Array.from(map.entries())
    .map(([addon, count]) => ({
      addon,
      name: addonNames[addon] || addon,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateTrendData(quotes: QuoteRecord[] | undefined): TrendDataPoint[] {
  if (!quotes || quotes.length === 0) return [];

  const dateMap = new Map<string, { mrrWithoutPostPaid: number; mrrWithPostPaid: number; count: number }>();

  quotes.forEach((quote) => {
    const date = format(new Date(quote.createdAt), "dd/MM", { locale: ptBR });
    const totals = parseJSON(quote.totals ?? null);
    const monthly = totals?.monthly || 0;
    const postPaid = totals?.postPaid || 0;

    if (!dateMap.has(date)) {
      dateMap.set(date, { mrrWithoutPostPaid: 0, mrrWithPostPaid: 0, count: 0 });
    }
    const data = dateMap.get(date)!;
    data.mrrWithoutPostPaid += monthly;
    data.mrrWithPostPaid += monthly + postPaid;
    data.count++;
  });

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      "MRR s/ pós": data.mrrWithoutPostPaid,
      "MRR c/ pós": data.mrrWithPostPaid,
      cotacoes: data.count,
    }))
    .sort((a, b) => {
      const [dayA, monthA] = a.date.split("/").map(Number);
      const [dayB, monthB] = b.date.split("/").map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });
}
