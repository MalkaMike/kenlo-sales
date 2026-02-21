/**
 * Tests for Pricing Bible PDF caching logic
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as crypto from "crypto";
import * as fs from "fs/promises";
import * as path from "path";

// Mock the PDF generator to avoid slow PDF generation in tests
vi.mock("./pdfReferenceDocument", () => ({
  generateReferenceDocumentPDF: vi.fn().mockResolvedValue(Buffer.from("fake-pdf-content")),
}));

// Mock S3 storage to avoid actual uploads in tests
vi.mock("../storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ key: "test-key", url: "https://test.url/file" }),
  storageGet: vi.fn().mockResolvedValue({ key: "test-key", url: "https://test.url/file" }),
}));

// Import after mocking
import {
  computePricingHash,
  getCachedPricingBiblePDF,
  invalidatePricingBibleCache,
  getCacheStatus,
} from "./pdfCache";
import { generateReferenceDocumentPDF } from "./pdfReferenceDocument";
import { storagePut, storageGet } from "../storage";

const mockedGenerate = vi.mocked(generateReferenceDocumentPDF);
const mockedStoragePut = vi.mocked(storagePut);
const mockedStorageGet = vi.mocked(storageGet);

describe("Pricing Bible PDF Cache", () => {
  beforeEach(() => {
    // Reset cache state before each test
    invalidatePricingBibleCache();
    mockedGenerate.mockClear();
    mockedGenerate.mockResolvedValue(Buffer.from("fake-pdf-content"));
    mockedStoragePut.mockClear();
    mockedStorageGet.mockClear();
    
    // Mock S3 storage to return 404 (no cached file) by default
    mockedStorageGet.mockResolvedValue({ key: "test-key", url: "https://test.url/file" });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);
  });

  describe("computePricingHash", () => {
    it("should return a valid SHA-256 hex string", async () => {
      const hash = await computePricingHash();
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should return the same hash for unchanged content", async () => {
      const hash1 = await computePricingHash();
      const hash2 = await computePricingHash();
      expect(hash1).toBe(hash2);
    });

    it("should match the expected SHA-256 of pricing-values.json", async () => {
      const configPath = path.join(process.cwd(), "shared", "pricing-values.json");
      const content = await fs.readFile(configPath, "utf-8");
      const expectedHash = crypto.createHash("sha256").update(content).digest("hex");
      const hash = await computePricingHash();
      expect(hash).toBe(expectedHash);
    });
  });

  describe("getCachedPricingBiblePDF", () => {
    it("should generate PDF on first call (cache miss)", async () => {
      const result = await getCachedPricingBiblePDF();

      expect(result.fromCache).toBe(false);
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
      expect(result.generatedAt).toBeInstanceOf(Date);
      expect(mockedGenerate).toHaveBeenCalledTimes(1);
    });

    it("should return cached PDF on second call (cache hit)", async () => {
      const result1 = await getCachedPricingBiblePDF();
      expect(result1.fromCache).toBe(false);
      expect(mockedGenerate).toHaveBeenCalledTimes(1);

      const result2 = await getCachedPricingBiblePDF();
      expect(result2.fromCache).toBe(true);
      expect(result2.hash).toBe(result1.hash);
      expect(result2.generatedAt).toEqual(result1.generatedAt);
      // Should NOT have called generate again
      expect(mockedGenerate).toHaveBeenCalledTimes(1);
    });

    it("should return buffer content consistently from cache", async () => {
      const result1 = await getCachedPricingBiblePDF();
      const result2 = await getCachedPricingBiblePDF();

      expect(result1.buffer.toString()).toBe(result2.buffer.toString());
    });
  });

  describe("invalidatePricingBibleCache", () => {
    it("should force regeneration after invalidation", async () => {
      // First call: generates
      await getCachedPricingBiblePDF();
      expect(mockedGenerate).toHaveBeenCalledTimes(1);

      // Invalidate
      invalidatePricingBibleCache();

      // Second call: should regenerate
      const result = await getCachedPricingBiblePDF();
      expect(result.fromCache).toBe(false);
      expect(mockedGenerate).toHaveBeenCalledTimes(2);
    });

    it("should clear cache status", async () => {
      await getCachedPricingBiblePDF();
      expect(getCacheStatus().cached).toBe(true);

      invalidatePricingBibleCache();
      expect(getCacheStatus().cached).toBe(false);
      expect(getCacheStatus().hash).toBeNull();
      expect(getCacheStatus().generatedAt).toBeNull();
    });
  });

  describe("getCacheStatus", () => {
    it("should report empty cache initially", () => {
      const status = getCacheStatus();
      expect(status.cached).toBe(false);
      expect(status.hash).toBeNull();
      expect(status.generatedAt).toBeNull();
    });

    it("should report populated cache after generation", async () => {
      await getCachedPricingBiblePDF();
      const status = getCacheStatus();
      expect(status.cached).toBe(true);
      expect(status.hash).toMatch(/^[a-f0-9]{64}$/);
      expect(status.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe("cache invalidation on pricing change", () => {
    it("should regenerate when hash changes (simulated)", async () => {
      // First call: generates and caches
      const result1 = await getCachedPricingBiblePDF();
      expect(result1.fromCache).toBe(false);
      expect(mockedGenerate).toHaveBeenCalledTimes(1);

      // Second call: cache hit
      const result2 = await getCachedPricingBiblePDF();
      expect(result2.fromCache).toBe(true);
      expect(mockedGenerate).toHaveBeenCalledTimes(1);

      // Simulate pricing change by invalidating cache
      invalidatePricingBibleCache();

      // Third call: should regenerate
      const result3 = await getCachedPricingBiblePDF();
      expect(result3.fromCache).toBe(false);
      expect(mockedGenerate).toHaveBeenCalledTimes(2);
    });
  });
});
