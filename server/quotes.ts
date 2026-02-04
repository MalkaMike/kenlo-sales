import { desc, eq } from "drizzle-orm";
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
 * Get all quotes ordered by creation date (newest first)
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
      .orderBy(desc(quotes.createdAt))
      .limit(limit);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get quotes:", error);
    throw error;
  }
}

/**
 * Delete a quote from the database
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
    const allQuotes = await db.select().from(quotes);
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
