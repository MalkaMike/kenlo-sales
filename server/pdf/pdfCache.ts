/**
 * PDF Cache — Hash-based caching for the Pricing Bible PDF
 *
 * Strategy: compute a SHA-256 hash of pricing-values.json content.
 * If the hash matches the cached version, return the cached PDF buffer.
 * If the hash differs (prices or business rules changed), regenerate and cache.
 */

import * as crypto from "crypto";
import * as fs from "fs/promises";
import * as path from "path";
import { generateReferenceDocumentPDF } from "./pdfReferenceDocument";
import { storagePut, storageGet } from "../storage";

interface CachedPDF {
  hash: string;
  buffer: Buffer;
  generatedAt: Date;
}

// In-memory cache (fast access)
let memoryCache: CachedPDF | null = null;

// S3 cache key for persistent storage
const S3_CACHE_KEY = "pricing-bible-cache/pricing-bible.pdf";
const S3_METADATA_KEY = "pricing-bible-cache/metadata.json";

/**
 * Compute SHA-256 hash of the pricing-values.json file content.
 * Reads from disk each time to detect any changes made via admin panel.
 */
export async function computePricingHash(): Promise<string> {
  const configPath = path.join(process.cwd(), "shared", "pricing-values.json");
  const content = await fs.readFile(configPath, "utf-8");
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Get the cached Pricing Bible PDF, regenerating only if pricing-values.json changed.
 * Strategy:
 * 1. Check memory cache first (fastest)
 * 2. Check S3 cache if memory is empty (survives restarts)
 * 3. Regenerate if hash mismatch or no cache exists
 * Returns { buffer, fromCache, hash, generatedAt }
 */
export async function getCachedPricingBiblePDF(): Promise<{
  buffer: Buffer;
  fromCache: boolean;
  hash: string;
  generatedAt: Date;
}> {
  const currentHash = await computePricingHash();

  // Step 1: Check memory cache
  if (memoryCache && memoryCache.hash === currentHash) {
    console.log("[PricingBible Cache] HIT (memory) — serving cached PDF");
    return {
      buffer: memoryCache.buffer,
      fromCache: true,
      hash: memoryCache.hash,
      generatedAt: memoryCache.generatedAt,
    };
  }

  // Step 2: Check S3 cache
  try {
    const s3Metadata = await loadS3Metadata();
    if (s3Metadata && s3Metadata.hash === currentHash) {
      console.log("[PricingBible Cache] HIT (S3) — loading cached PDF from S3");
      const { url } = await storageGet(S3_CACHE_KEY);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`S3 fetch failed: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const generatedAt = new Date(s3Metadata.generatedAt);

      // Populate memory cache
      memoryCache = { hash: currentHash, buffer, generatedAt };

      return {
        buffer,
        fromCache: true,
        hash: currentHash,
        generatedAt,
      };
    }
  } catch (error) {
    console.warn("[PricingBible Cache] S3 cache check failed:", error);
  }

  // Step 3: Cache miss - regenerate PDF
  console.log(
    memoryCache
      ? "[PricingBible Cache] MISS — pricing changed, regenerating PDF"
      : "[PricingBible Cache] MISS — first request, generating PDF"
  );

  const buffer = await generateReferenceDocumentPDF();
  const generatedAt = new Date();

  // Save to memory cache
  memoryCache = { hash: currentHash, buffer, generatedAt };

  // Save to S3 cache (async, don't wait)
  saveToS3Cache(buffer, currentHash, generatedAt).catch((err) =>
    console.error("[PricingBible Cache] Failed to save to S3:", err)
  );

  return {
    buffer,
    fromCache: false,
    hash: currentHash,
    generatedAt,
  };
}

/**
 * Save PDF and metadata to S3 for persistent caching.
 */
async function saveToS3Cache(
  buffer: Buffer,
  hash: string,
  generatedAt: Date
): Promise<void> {
  // Upload PDF
  await storagePut(S3_CACHE_KEY, buffer, "application/pdf");

  // Upload metadata
  const metadata = {
    hash,
    generatedAt: generatedAt.toISOString(),
    version: "1.0",
  };
  await storagePut(
    S3_METADATA_KEY,
    JSON.stringify(metadata),
    "application/json"
  );

  console.log("[PricingBible Cache] Saved to S3");
}

/**
 * Load metadata from S3 to check if cached PDF is still valid.
 */
async function loadS3Metadata(): Promise<{
  hash: string;
  generatedAt: string;
} | null> {
  try {
    const { url } = await storageGet(S3_METADATA_KEY);
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Invalidate the cache manually (e.g., after admin saves pricing config).
 * Clears memory cache; S3 cache will be overwritten on next generation.
 */
export function invalidatePricingBibleCache(): void {
  memoryCache = null;
  console.log("[PricingBible Cache] Invalidated manually (memory cleared)");
}

/**
 * Get cache status for diagnostics.
 */
export function getCacheStatus(): {
  cached: boolean;
  hash: string | null;
  generatedAt: Date | null;
} {
  return {
    cached: memoryCache !== null,
    hash: memoryCache?.hash ?? null,
    generatedAt: memoryCache?.generatedAt ?? null,
  };
}
