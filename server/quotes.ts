import { eq, desc, isNull, and, inArray, sql, or, gte, lte } from "drizzle-orm";
import { quotes, InsertQuote, Quote } from "../drizzle/schema";
import { getDb } from "./db";

// ============================================
// DB Helper - eliminates repeated null-check boilerplate
// ============================================

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

// ============================================
// CRUD Operations
// ============================================

export async function saveQuote(quote: InsertQuote): Promise<number | null> {
  const db = await requireDb();
  const result = await db.insert(quotes).values(quote);
  return result[0].insertId;
}

export async function getQuotes(limit: number = 100): Promise<Quote[]> {
  const db = await requireDb();
  return db
    .select()
    .from(quotes)
    .where(isNull(quotes.deletedAt))
    .orderBy(desc(quotes.createdAt))
    .limit(limit);
}

export async function getQuoteById(id: number): Promise<Quote | null> {
  const db = await requireDb();
  const result = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, id), isNull(quotes.deletedAt)));
  return result[0] || null;
}

// ============================================
// Soft Delete (with ownership check)
// ============================================

export async function softDeleteQuote(
  id: number,
  userId: number,
  isMaster: boolean
): Promise<{ success: boolean; error?: string }> {
  const db = await requireDb();

  const quote = await getQuoteById(id);
  if (!quote) return { success: false, error: "Cotação não encontrada" };
  if (!isMaster && quote.userId !== userId) {
    return { success: false, error: "Você só pode apagar suas próprias cotações" };
  }

  await db.update(quotes).set({ deletedAt: new Date() }).where(eq(quotes.id, id));
  return { success: true };
}

export async function softDeleteQuotesBatch(
  ids: number[],
  userId: number,
  isMaster: boolean
): Promise<{ success: boolean; deletedCount: number; errors: string[] }> {
  if (ids.length === 0) return { success: true, deletedCount: 0, errors: [] };

  const db = await requireDb();
  const errors: string[] = [];
  let deletedCount = 0;

  // Fetch all quotes in one query
  const targetQuotes = await db
    .select()
    .from(quotes)
    .where(and(inArray(quotes.id, ids), isNull(quotes.deletedAt)));

  const quoteMap = new Map(targetQuotes.map((q) => [q.id, q]));

  // Collect IDs that pass ownership check
  const idsToDelete: number[] = [];
  for (const id of ids) {
    const quote = quoteMap.get(id);
    if (!quote) {
      errors.push(`Cotação #${id} não encontrada`);
      continue;
    }
    if (!isMaster && quote.userId !== userId) {
      errors.push(`Cotação #${id}: Você só pode apagar suas próprias cotações`);
      continue;
    }
    idsToDelete.push(id);
  }

  // Single batch update instead of N individual updates
  if (idsToDelete.length > 0) {
    await db
      .update(quotes)
      .set({ deletedAt: new Date() })
      .where(inArray(quotes.id, idsToDelete));
    deletedCount = idsToDelete.length;
  }

  return { success: deletedCount > 0, deletedCount, errors };
}

// ============================================
// Statistics (uses SQL COUNT for efficiency)
// ============================================

export async function getQuoteStats(): Promise<{
  total: number;
  linksCopied: number;
  pdfsExported: number;
}> {
  const db = await requireDb();

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotes)
    .where(isNull(quotes.deletedAt));

  const [linksResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotes)
    .where(and(isNull(quotes.deletedAt), eq(quotes.action, "link_copied")));

  const [pdfsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotes)
    .where(and(isNull(quotes.deletedAt), eq(quotes.action, "pdf_exported")));

  return {
    total: totalResult.count,
    linksCopied: linksResult.count,
    pdfsExported: pdfsResult.count,
  };
}

// ============================================
// Performance Metrics
// ============================================

export interface KomboMetrics {
  komboId: string;
  komboName: string;
  count: number;
  mrrWithoutPostPaid: number;
  mrrWithPostPaid: number;
  implantationVolume: number;
  implantationValue: number;
}

export interface PlanMetrics {
  product: string;
  plan: string;
  count: number;
  mrrWithoutPostPaid: number;
  mrrWithPostPaid: number;
  implantationVolume: number;
  implantationValue: number;
}

export interface VendorMetrics {
  vendorName: string;
  userId: number | null;
  totalQuotes: number;
  mrrWithoutPostPaid: number;
  mrrWithPostPaid: number;
  implantationVolume: number;
  implantationValue: number;
  ticketMedio: number;
  komboBreakdown: KomboMetrics[];
  planBreakdown: PlanMetrics[];
}

export interface FrequencyMetrics {
  frequency: string;
  count: number;
  percentage: number;
}

export interface PerformanceMetrics {
  totalQuotes: number;
  totalMrrWithoutPostPaid: number;
  totalMrrWithPostPaid: number;
  totalImplantationVolume: number;
  totalImplantationValue: number;
  ticketMedio: number;
  byKombo: KomboMetrics[];
  byPlan: PlanMetrics[];
  byVendor: VendorMetrics[];
  byFrequency: FrequencyMetrics[];
  topAddons: { addon: string; count: number; percentage: number }[];
}

function parseJSON(str: string | null): any {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/** Accumulate metrics into a Map entry, creating it if needed */
function accumulateMetrics<T extends { count: number; mrrWithoutPostPaid: number; mrrWithPostPaid: number; implantationVolume: number; implantationValue: number }>(
  map: Map<string, T>,
  key: string,
  factory: () => T,
  monthly: number,
  postPaid: number,
  implantation: number,
  divisor: number = 1
) {
  if (!map.has(key)) map.set(key, factory());
  const m = map.get(key)!;
  m.count++;
  m.mrrWithoutPostPaid += monthly / divisor;
  m.mrrWithPostPaid += (monthly + postPaid) / divisor;
  if (implantation > 0) {
    m.implantationVolume++;
    m.implantationValue += implantation;
  }
}

export async function getPerformanceMetrics(
  filters?: { userId?: number; dateFrom?: Date; dateTo?: Date }
): Promise<PerformanceMetrics> {
  const db = await requireDb();

  // Build WHERE conditions
  const conditions = [isNull(quotes.deletedAt)];
  if (filters?.userId) conditions.push(eq(quotes.userId, filters.userId));
  if (filters?.dateFrom) conditions.push(gte(quotes.createdAt, filters.dateFrom));
  if (filters?.dateTo) conditions.push(lte(quotes.createdAt, filters.dateTo));

  const allQuotes = await db
    .select()
    .from(quotes)
    .where(and(...conditions))
    .orderBy(desc(quotes.createdAt));

  // Aggregation maps
  const komboMap = new Map<string, KomboMetrics>();
  const planMap = new Map<string, PlanMetrics>();
  const vendorMap = new Map<string, VendorMetrics>();
  const frequencyMap = new Map<string, number>();
  const addonMap = new Map<string, number>();

  let totalMrrWithoutPostPaid = 0;
  let totalMrrWithPostPaid = 0;
  let totalImplantationVolume = 0;
  let totalImplantationValue = 0;

  for (const quote of allQuotes) {
    const totals = parseJSON(quote.totals);
    const addons = parseJSON(quote.addons);

    const monthly = totals?.monthly || 0;
    const postPaid = totals?.postPaid || 0;
    const implantation = totals?.implantation || 0;

    totalMrrWithoutPostPaid += monthly;
    totalMrrWithPostPaid += monthly + postPaid;
    if (implantation > 0) {
      totalImplantationVolume++;
      totalImplantationValue += implantation;
    }

    // By Kombo
    const komboId = quote.komboId || "sem_kombo";
    const komboName = quote.komboName || "Sem Kombo";
    accumulateMetrics(komboMap, komboId, () => ({
      komboId, komboName, count: 0, mrrWithoutPostPaid: 0, mrrWithPostPaid: 0, implantationVolume: 0, implantationValue: 0,
    }), monthly, postPaid, implantation);

    // By Plan
    const hasBothPlans = !!(quote.imobPlan && quote.locPlan);
    const divisor = hasBothPlans ? 2 : 1;

    if (quote.imobPlan) {
      accumulateMetrics(planMap, `imob_${quote.imobPlan}`, () => ({
        product: "imob", plan: quote.imobPlan!, count: 0, mrrWithoutPostPaid: 0, mrrWithPostPaid: 0, implantationVolume: 0, implantationValue: 0,
      }), monthly, postPaid, implantation, divisor);
    }
    if (quote.locPlan) {
      accumulateMetrics(planMap, `loc_${quote.locPlan}`, () => ({
        product: "loc", plan: quote.locPlan!, count: 0, mrrWithoutPostPaid: 0, mrrWithPostPaid: 0, implantationVolume: 0, implantationValue: 0,
      }), monthly, postPaid, implantation, divisor);
    }

    // By Vendor
    const vendorName = quote.vendorName || "Sem vendedor";
    if (!vendorMap.has(vendorName)) {
      vendorMap.set(vendorName, {
        vendorName,
        userId: quote.userId,
        totalQuotes: 0,
        mrrWithoutPostPaid: 0,
        mrrWithPostPaid: 0,
        implantationVolume: 0,
        implantationValue: 0,
        ticketMedio: 0,
        komboBreakdown: [],
        planBreakdown: [],
      });
    }
    const vm = vendorMap.get(vendorName)!;
    vm.totalQuotes++;
    vm.mrrWithoutPostPaid += monthly;
    vm.mrrWithPostPaid += monthly + postPaid;
    if (implantation > 0) {
      vm.implantationVolume++;
      vm.implantationValue += implantation;
    }

    // By Frequency
    const frequency = quote.frequency || "unknown";
    frequencyMap.set(frequency, (frequencyMap.get(frequency) || 0) + 1);

    // Add-ons
    if (addons && typeof addons === "object") {
      for (const [addon, enabled] of Object.entries(addons)) {
        if (enabled) addonMap.set(addon, (addonMap.get(addon) || 0) + 1);
      }
    }
  }

  // Calculate ticket medio for each vendor
  for (const vendor of Array.from(vendorMap.values())) {
    if (vendor.totalQuotes > 0) vendor.ticketMedio = vendor.mrrWithPostPaid / vendor.totalQuotes;
  }

  const totalQuotes = allQuotes.length;

  return {
    totalQuotes,
    totalMrrWithoutPostPaid,
    totalMrrWithPostPaid,
    totalImplantationVolume,
    totalImplantationValue,
    ticketMedio: totalQuotes > 0 ? totalMrrWithPostPaid / totalQuotes : 0,
    byKombo: Array.from(komboMap.values()).sort((a, b) => b.count - a.count),
    byPlan: Array.from(planMap.values()).sort((a, b) => b.count - a.count),
    byVendor: Array.from(vendorMap.values()).sort((a, b) => b.mrrWithPostPaid - a.mrrWithPostPaid),
    byFrequency: Array.from(frequencyMap.entries())
      .map(([frequency, count]) => ({ frequency, count, percentage: totalQuotes > 0 ? (count / totalQuotes) * 100 : 0 }))
      .sort((a, b) => b.count - a.count),
    topAddons: Array.from(addonMap.entries())
      .map(([addon, count]) => ({ addon, count, percentage: totalQuotes > 0 ? (count / totalQuotes) * 100 : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  };
}

// ============================================
// User-specific Queries
// ============================================

export async function getQuotesByUser(params: {
  userId?: number;
  userName?: string;
  limit?: number;
}): Promise<Quote[]> {
  const db = await requireDb();

  const conditions = [isNull(quotes.deletedAt)];
  const userConditions = [];
  if (params.userId) userConditions.push(eq(quotes.userId, params.userId));
  if (params.userName) userConditions.push(eq(quotes.vendorName, params.userName));
  if (userConditions.length > 0) conditions.push(or(...userConditions)!);

  return db
    .select()
    .from(quotes)
    .where(and(...conditions))
    .orderBy(desc(quotes.createdAt))
    .limit(params.limit || 100);
}
