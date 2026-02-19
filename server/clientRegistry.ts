/**
 * Client Registry — DB helpers for permanent client tracking.
 * Clients are registered when quotes are created, and persist even after quote deletion.
 * Only admins can clean up client records.
 */

import { eq, desc, isNull, and, inArray, sql, like, or } from "drizzle-orm";
import { clientRegistry, InsertClientRegistry, ClientRegistry } from "../drizzle/schema";
import { getDb } from "./db";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

// ============================================
// Upsert — called whenever a quote is saved
// ============================================

export async function upsertClientFromQuote(params: {
  clientName: string;
  email?: string | null;
  agencyName?: string | null;
  cellPhone?: string | null;
  landlinePhone?: string | null;
  websiteUrl?: string | null;
  businessType?: string | null;
  quoteId: number;
  vendorName?: string | null;
  vendorUserId?: number | null;
  product?: string | null;
  plans?: string | null;
  komboName?: string | null;
}): Promise<number> {
  const db = await requireDb();

  // Try to find existing client by name + email (or just name if no email)
  const conditions = [isNull(clientRegistry.deletedAt)];
  
  if (params.email) {
    conditions.push(
      or(
        and(
          eq(clientRegistry.clientName, params.clientName),
          eq(clientRegistry.email, params.email)
        )!,
        and(
          eq(clientRegistry.clientName, params.clientName),
          isNull(clientRegistry.email)
        )!
      )!
    );
  } else {
    conditions.push(eq(clientRegistry.clientName, params.clientName));
  }

  const existing = await db
    .select()
    .from(clientRegistry)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    // Update existing record
    const record = existing[0];
    await db
      .update(clientRegistry)
      .set({
        email: params.email || record.email,
        agencyName: params.agencyName || record.agencyName,
        cellPhone: params.cellPhone || record.cellPhone,
        landlinePhone: params.landlinePhone || record.landlinePhone,
        websiteUrl: params.websiteUrl || record.websiteUrl,
        businessType: params.businessType || record.businessType,
        lastQuoteId: params.quoteId,
        totalQuotes: sql`${clientRegistry.totalQuotes} + 1`,
        lastVendorName: params.vendorName || record.lastVendorName,
        lastVendorUserId: params.vendorUserId || record.lastVendorUserId,
        lastProduct: params.product || record.lastProduct,
        lastPlans: params.plans || record.lastPlans,
        lastKomboName: params.komboName || record.lastKomboName,
      })
      .where(eq(clientRegistry.id, record.id));
    return record.id;
  }

  // Create new record
  const result = await db.insert(clientRegistry).values({
    clientName: params.clientName,
    email: params.email,
    agencyName: params.agencyName,
    cellPhone: params.cellPhone,
    landlinePhone: params.landlinePhone,
    websiteUrl: params.websiteUrl,
    businessType: params.businessType,
    firstQuoteId: params.quoteId,
    lastQuoteId: params.quoteId,
    totalQuotes: 1,
    firstVendorName: params.vendorName,
    lastVendorName: params.vendorName,
    firstVendorUserId: params.vendorUserId,
    lastVendorUserId: params.vendorUserId,
    lastProduct: params.product,
    lastPlans: params.plans,
    lastKomboName: params.komboName,
  });
  return result[0].insertId;
}

// ============================================
// List — admin only
// ============================================

export async function listClients(params?: {
  search?: string;
  limit?: number;
}): Promise<ClientRegistry[]> {
  const db = await requireDb();
  const limit = params?.limit || 500;

  const conditions = [isNull(clientRegistry.deletedAt)];

  if (params?.search) {
    const searchTerm = `%${params.search}%`;
    conditions.push(
      or(
        like(clientRegistry.clientName, searchTerm),
        like(clientRegistry.email, searchTerm),
        like(clientRegistry.agencyName, searchTerm),
        like(clientRegistry.cellPhone, searchTerm)
      )!
    );
  }

  return db
    .select()
    .from(clientRegistry)
    .where(and(...conditions))
    .orderBy(desc(clientRegistry.updatedAt))
    .limit(limit);
}

// ============================================
// Stats — admin only
// ============================================

export async function getClientRegistryStats(): Promise<{
  totalClients: number;
  totalQuotesSent: number;
}> {
  const db = await requireDb();

  const [clientsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(clientRegistry)
    .where(isNull(clientRegistry.deletedAt));

  const [quotesResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${clientRegistry.totalQuotes}), 0)` })
    .from(clientRegistry)
    .where(isNull(clientRegistry.deletedAt));

  return {
    totalClients: clientsResult.count,
    totalQuotesSent: quotesResult.total,
  };
}

// ============================================
// Soft Delete — admin only
// ============================================

export async function softDeleteClient(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const db = await requireDb();

  const [existing] = await db
    .select()
    .from(clientRegistry)
    .where(and(eq(clientRegistry.id, id), isNull(clientRegistry.deletedAt)));

  if (!existing) return { success: false, error: "Cliente não encontrado" };

  await db
    .update(clientRegistry)
    .set({ deletedAt: new Date() })
    .where(eq(clientRegistry.id, id));

  return { success: true };
}

export async function softDeleteClientsBatch(
  ids: number[]
): Promise<{ success: boolean; deletedCount: number; errors: string[] }> {
  if (ids.length === 0) return { success: true, deletedCount: 0, errors: [] };

  const db = await requireDb();

  // Verify all exist
  const existing = await db
    .select({ id: clientRegistry.id })
    .from(clientRegistry)
    .where(and(inArray(clientRegistry.id, ids), isNull(clientRegistry.deletedAt)));

  const existingIds = new Set(existing.map((r) => r.id));
  const errors: string[] = [];
  const idsToDelete: number[] = [];

  for (const id of ids) {
    if (!existingIds.has(id)) {
      errors.push(`Cliente #${id} não encontrado`);
    } else {
      idsToDelete.push(id);
    }
  }

  if (idsToDelete.length > 0) {
    await db
      .update(clientRegistry)
      .set({ deletedAt: new Date() })
      .where(inArray(clientRegistry.id, idsToDelete));
  }

  return { success: idsToDelete.length > 0, deletedCount: idsToDelete.length, errors };
}
