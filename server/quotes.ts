import { desc, eq, isNull, and, sql } from "drizzle-orm";
import { quotes, InsertQuote, Quote } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Save a quote to the database
 */
export async function saveQuote(quote: InsertQuote): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save quote: database not available");
    return null;
  }

  try {
    const result = await db.insert(quotes).values(quote);
    return result[0].insertId;
  } catch (error) {
    console.error("[Database] Failed to save quote:", error);
    throw error;
  }
}

/**
 * Get all active quotes (not soft-deleted) ordered by creation date (newest first)
 */
export async function getQuotes(limit: number = 100): Promise<Quote[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quotes: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(quotes)
      .where(isNull(quotes.deletedAt))
      .orderBy(desc(quotes.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get quotes:", error);
    throw error;
  }
}

/**
 * Get a single quote by ID
 */
export async function getQuoteById(id: number): Promise<Quote | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quote: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.id, id), isNull(quotes.deletedAt)));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get quote:", error);
    throw error;
  }
}

/**
 * Soft delete a quote - only if salesperson owns it or is master
 * Returns: { success: boolean, error?: string }
 */
export async function softDeleteQuote(
  id: number, 
  salespersonId: number, 
  isMaster: boolean
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete quote: database not available");
    return { success: false, error: "Database not available" };
  }

  try {
    // First, get the quote to check ownership
    const quote = await getQuoteById(id);
    if (!quote) {
      return { success: false, error: "Cotação não encontrada" };
    }

    // Check ownership - master can delete any, others only their own
    if (!isMaster && quote.salespersonId !== salespersonId) {
      return { success: false, error: "Você só pode apagar suas próprias cotações" };
    }

    // Soft delete by setting deletedAt
    await db
      .update(quotes)
      .set({ deletedAt: new Date() })
      .where(eq(quotes.id, id));
    
    return { success: true };
  } catch (error) {
    console.error("[Database] Failed to delete quote:", error);
    throw error;
  }
}

/**
 * Soft delete multiple quotes in batch - only if salesperson owns them or is master
 * Returns: { success: boolean, deletedCount: number, errors: string[] }
 */
export async function softDeleteQuotesBatch(
  ids: number[], 
  salespersonId: number, 
  isMaster: boolean
): Promise<{ success: boolean; deletedCount: number; errors: string[] }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete quotes: database not available");
    return { success: false, deletedCount: 0, errors: ["Database not available"] };
  }

  const errors: string[] = [];
  let deletedCount = 0;

  try {
    for (const id of ids) {
      // Get the quote to check ownership
      const quote = await getQuoteById(id);
      if (!quote) {
        errors.push(`Cotação #${id} não encontrada`);
        continue;
      }

      // Check ownership - master can delete any, others only their own
      if (!isMaster && quote.salespersonId !== salespersonId) {
        errors.push(`Cotação #${id}: Você só pode apagar suas próprias cotações`);
        continue;
      }

      // Soft delete by setting deletedAt
      await db
        .update(quotes)
        .set({ deletedAt: new Date() })
        .where(eq(quotes.id, id));
      
      deletedCount++;
    }

    return { 
      success: deletedCount > 0, 
      deletedCount, 
      errors 
    };
  } catch (error) {
    console.error("[Database] Failed to delete quotes batch:", error);
    throw error;
  }
}

/**
 * Hard delete a quote (legacy - kept for compatibility)
 */
export async function deleteQuote(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete quote: database not available");
    return false;
  }

  try {
    await db.delete(quotes).where(eq(quotes.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete quote:", error);
    throw error;
  }
}

/**
 * Get quote statistics
 */
export async function getQuoteStats(): Promise<{
  total: number;
  linksCopied: number;
  pdfsExported: number;
}> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quote stats: database not available");
    return { total: 0, linksCopied: 0, pdfsExported: 0 };
  }

  try {
    const allQuotes = await db
      .select()
      .from(quotes)
      .where(isNull(quotes.deletedAt));
    const linksCopied = allQuotes.filter(q => q.action === "link_copied").length;
    const pdfsExported = allQuotes.filter(q => q.action === "pdf_exported").length;
    
    return {
      total: allQuotes.length,
      linksCopied,
      pdfsExported,
    };
  } catch (error) {
    console.error("[Database] Failed to get quote stats:", error);
    throw error;
  }
}

/**
 * Performance metrics types
 */
export interface KomboMetrics {
  komboId: string;
  komboName: string;
  count: number;
  mrrWithoutPostPaid: number; // MRR sem pós-pago
  mrrWithPostPaid: number; // MRR com pós-pago
  implantationVolume: number;
  implantationValue: number;
}

export interface PlanMetrics {
  product: string; // "imob" | "loc"
  plan: string; // "prime" | "k" | "k2"
  count: number;
  mrrWithoutPostPaid: number;
  mrrWithPostPaid: number;
  implantationVolume: number;
  implantationValue: number;
}

export interface VendorMetrics {
  vendorName: string;
  salespersonId: number | null;
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
  // Summary
  totalQuotes: number;
  totalMrrWithoutPostPaid: number;
  totalMrrWithPostPaid: number;
  totalImplantationVolume: number;
  totalImplantationValue: number;
  ticketMedio: number;
  
  // By Kombo
  byKombo: KomboMetrics[];
  
  // By Plan (for non-Kombo quotes)
  byPlan: PlanMetrics[];
  
  // By Vendor
  byVendor: VendorMetrics[];
  
  // By Frequency
  byFrequency: FrequencyMetrics[];
  
  // Top Add-ons
  topAddons: { addon: string; count: number; percentage: number }[];
}

/**
 * Parse JSON safely
 */
function parseJSON(str: string | null): any {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * Get comprehensive performance metrics
 */
export async function getPerformanceMetrics(
  filters?: {
    salespersonId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<PerformanceMetrics> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get performance metrics: database not available");
    return {
      totalQuotes: 0,
      totalMrrWithoutPostPaid: 0,
      totalMrrWithPostPaid: 0,
      totalImplantationVolume: 0,
      totalImplantationValue: 0,
      ticketMedio: 0,
      byKombo: [],
      byPlan: [],
      byVendor: [],
      byFrequency: [],
      topAddons: [],
    };
  }

  try {
    // Get all active quotes
    let allQuotes = await db
      .select()
      .from(quotes)
      .where(isNull(quotes.deletedAt))
      .orderBy(desc(quotes.createdAt));

    // Apply filters
    if (filters?.salespersonId) {
      allQuotes = allQuotes.filter(q => q.salespersonId === filters.salespersonId);
    }
    if (filters?.dateFrom) {
      allQuotes = allQuotes.filter(q => new Date(q.createdAt) >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      allQuotes = allQuotes.filter(q => new Date(q.createdAt) <= filters.dateTo!);
    }

    // Initialize metrics
    const komboMap = new Map<string, KomboMetrics>();
    const planMap = new Map<string, PlanMetrics>();
    const vendorMap = new Map<string, VendorMetrics>();
    const frequencyMap = new Map<string, number>();
    const addonMap = new Map<string, number>();

    let totalMrrWithoutPostPaid = 0;
    let totalMrrWithPostPaid = 0;
    let totalImplantationVolume = 0;
    let totalImplantationValue = 0;

    // Process each quote
    for (const quote of allQuotes) {
      const totals = parseJSON(quote.totals);
      const addons = parseJSON(quote.addons);
      
      // Calculate MRR (monthly recurring revenue)
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
      if (!komboMap.has(komboId)) {
        komboMap.set(komboId, {
          komboId,
          komboName,
          count: 0,
          mrrWithoutPostPaid: 0,
          mrrWithPostPaid: 0,
          implantationVolume: 0,
          implantationValue: 0,
        });
      }
      const komboMetrics = komboMap.get(komboId)!;
      komboMetrics.count++;
      komboMetrics.mrrWithoutPostPaid += monthly;
      komboMetrics.mrrWithPostPaid += monthly + postPaid;
      if (implantation > 0) {
        komboMetrics.implantationVolume++;
        komboMetrics.implantationValue += implantation;
      }

      // By Plan (for non-Kombo or detailed breakdown)
      if (quote.imobPlan) {
        const planKey = `imob_${quote.imobPlan}`;
        if (!planMap.has(planKey)) {
          planMap.set(planKey, {
            product: "imob",
            plan: quote.imobPlan,
            count: 0,
            mrrWithoutPostPaid: 0,
            mrrWithPostPaid: 0,
            implantationVolume: 0,
            implantationValue: 0,
          });
        }
        const planMetrics = planMap.get(planKey)!;
        planMetrics.count++;
        planMetrics.mrrWithoutPostPaid += monthly / (quote.locPlan ? 2 : 1);
        planMetrics.mrrWithPostPaid += (monthly + postPaid) / (quote.locPlan ? 2 : 1);
      }
      if (quote.locPlan) {
        const planKey = `loc_${quote.locPlan}`;
        if (!planMap.has(planKey)) {
          planMap.set(planKey, {
            product: "loc",
            plan: quote.locPlan,
            count: 0,
            mrrWithoutPostPaid: 0,
            mrrWithPostPaid: 0,
            implantationVolume: 0,
            implantationValue: 0,
          });
        }
        const planMetrics = planMap.get(planKey)!;
        planMetrics.count++;
        planMetrics.mrrWithoutPostPaid += monthly / (quote.imobPlan ? 2 : 1);
        planMetrics.mrrWithPostPaid += (monthly + postPaid) / (quote.imobPlan ? 2 : 1);
      }

      // By Vendor
      const vendorName = quote.vendorName || "Sem vendedor";
      const salespersonId = quote.salespersonId;
      if (!vendorMap.has(vendorName)) {
        vendorMap.set(vendorName, {
          vendorName,
          salespersonId,
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
      const vendorMetrics = vendorMap.get(vendorName)!;
      vendorMetrics.totalQuotes++;
      vendorMetrics.mrrWithoutPostPaid += monthly;
      vendorMetrics.mrrWithPostPaid += monthly + postPaid;
      if (implantation > 0) {
        vendorMetrics.implantationVolume++;
        vendorMetrics.implantationValue += implantation;
      }

      // By Frequency
      const frequency = quote.frequency || "unknown";
      frequencyMap.set(frequency, (frequencyMap.get(frequency) || 0) + 1);

      // Add-ons
      if (addons && typeof addons === "object") {
        for (const [addon, enabled] of Object.entries(addons)) {
          if (enabled) {
            addonMap.set(addon, (addonMap.get(addon) || 0) + 1);
          }
        }
      }
    }

    // Calculate ticket medio for each vendor
    for (const vendor of Array.from(vendorMap.values())) {
      if (vendor.totalQuotes > 0) {
        vendor.ticketMedio = vendor.mrrWithPostPaid / vendor.totalQuotes;
      }
    }

    // Convert maps to arrays and sort
    const byKombo = Array.from(komboMap.values())
      .sort((a, b) => b.count - a.count);

    const byPlan = Array.from(planMap.values())
      .sort((a, b) => b.count - a.count);

    const byVendor = Array.from(vendorMap.values())
      .sort((a, b) => b.mrrWithPostPaid - a.mrrWithPostPaid);

    const totalQuotes = allQuotes.length;
    const byFrequency = Array.from(frequencyMap.entries())
      .map(([frequency, count]) => ({
        frequency,
        count,
        percentage: totalQuotes > 0 ? (count / totalQuotes) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const topAddons = Array.from(addonMap.entries())
      .map(([addon, count]) => ({
        addon,
        count,
        percentage: totalQuotes > 0 ? (count / totalQuotes) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalQuotes,
      totalMrrWithoutPostPaid,
      totalMrrWithPostPaid,
      totalImplantationVolume,
      totalImplantationValue,
      ticketMedio: totalQuotes > 0 ? totalMrrWithPostPaid / totalQuotes : 0,
      byKombo,
      byPlan,
      byVendor,
      byFrequency,
      topAddons,
    };
  } catch (error) {
    console.error("[Database] Failed to get performance metrics:", error);
    throw error;
  }
}
