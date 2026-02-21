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

interface CachedPDF {
  hash: string;
  buffer: Buffer;
  generatedAt: Date;
}

let cache: CachedPDF | null = null;

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
 * Returns { buffer, fromCache, hash, generatedAt }
 */
export async function getCachedPricingBiblePDF(): Promise<{
  buffer: Buffer;
  fromCache: boolean;
  hash: string;
  generatedAt: Date;
}> {
  const currentHash = await computePricingHash();

  // Cache hit: hash matches, return cached PDF
  if (cache && cache.hash === currentHash) {
    console.log("[PricingBible Cache] HIT — serving cached PDF");
    return {
      buffer: cache.buffer,
      fromCache: true,
      hash: cache.hash,
      generatedAt: cache.generatedAt,
    };
  }

  // Cache miss: regenerate PDF
  console.log(
    cache
      ? "[PricingBible Cache] MISS — pricing changed, regenerating PDF"
      : "[PricingBible Cache] MISS — first request, generating PDF"
  );

  const buffer = await generateReferenceDocumentPDF();
  const generatedAt = new Date();

  cache = { hash: currentHash, buffer, generatedAt };

  return {
    buffer,
    fromCache: false,
    hash: currentHash,
    generatedAt,
  };
}

/**
 * Invalidate the cache manually (e.g., after admin saves pricing config).
 */
export function invalidatePricingBibleCache(): void {
  cache = null;
  console.log("[PricingBible Cache] Invalidated manually");
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
    cached: cache !== null,
    hash: cache?.hash ?? null,
    generatedAt: cache?.generatedAt ?? null,
  };
}
