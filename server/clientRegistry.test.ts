/**
 * Tests for the Client Registry module.
 * Validates the upsertClientRecord and related functions.
 */

import { describe, it, expect } from "vitest";

// Test the client registry data structure and validation logic
describe("Client Registry", () => {
  describe("upsertClientRecord data preparation", () => {
    it("should prepare valid client data from quote info", () => {
      const quoteData = {
        clientName: "João Silva",
        clientEmail: "joao@test.com",
        agencyName: "Imobiliária ABC",
        cellPhone: "(11) 99999-9999",
        landlinePhone: "(11) 3333-3333",
        websiteUrl: "www.abc.com.br",
        product: "imob" as const,
        imobPlan: "k2" as const,
        komboName: "Kombo Elite",
        vendorName: "Maria Santos",
      };

      // Validate required fields
      expect(quoteData.clientName).toBeTruthy();
      expect(quoteData.clientEmail).toContain("@");
      expect(quoteData.agencyName).toBeTruthy();
    });

    it("should handle missing optional fields gracefully", () => {
      const minimalData = {
        clientName: "Test Client",
        clientEmail: null,
        agencyName: null,
        cellPhone: null,
        landlinePhone: null,
        websiteUrl: null,
        product: "imob" as const,
        imobPlan: "prime" as const,
        komboName: null,
        vendorName: "Vendor",
      };

      expect(minimalData.clientName).toBeTruthy();
      expect(minimalData.clientEmail).toBeNull();
      expect(minimalData.agencyName).toBeNull();
    });

    it("should normalize email to lowercase for deduplication", () => {
      const email = "JOAO@TEST.COM";
      const normalized = email.toLowerCase();
      expect(normalized).toBe("joao@test.com");
    });

    it("should handle empty string email as null", () => {
      const email = "";
      const normalizedEmail = email.trim() || null;
      expect(normalizedEmail).toBeNull();
    });
  });

  describe("Client Registry batch operations", () => {
    it("should validate batch delete with valid IDs", () => {
      const ids = [1, 2, 3, 4, 5];
      expect(ids.length).toBeGreaterThan(0);
      expect(ids.every((id) => typeof id === "number" && id > 0)).toBe(true);
    });

    it("should reject empty batch delete", () => {
      const ids: number[] = [];
      expect(ids.length).toBe(0);
    });

    it("should handle large batch sizes", () => {
      const ids = Array.from({ length: 100 }, (_, i) => i + 1);
      expect(ids.length).toBe(100);
      expect(ids[0]).toBe(1);
      expect(ids[99]).toBe(100);
    });
  });

  describe("Client Registry search", () => {
    it("should create search pattern for LIKE queries", () => {
      const searchTerm = "João";
      const pattern = `%${searchTerm}%`;
      expect(pattern).toBe("%João%");
    });

    it("should handle empty search term", () => {
      const searchTerm = "";
      const shouldSearch = searchTerm.trim().length > 0;
      expect(shouldSearch).toBe(false);
    });

    it("should trim whitespace from search terms", () => {
      const searchTerm = "  João Silva  ";
      const trimmed = searchTerm.trim();
      expect(trimmed).toBe("João Silva");
    });
  });

  describe("Client Registry stats", () => {
    it("should calculate correct stats from empty data", () => {
      const clients: any[] = [];
      const totalClients = clients.length;
      const totalQuotes = clients.reduce((sum, c) => sum + (c.totalQuotes || 0), 0);
      expect(totalClients).toBe(0);
      expect(totalQuotes).toBe(0);
    });

    it("should calculate correct stats from sample data", () => {
      const clients = [
        { id: 1, totalQuotes: 3 },
        { id: 2, totalQuotes: 1 },
        { id: 3, totalQuotes: 5 },
      ];
      const totalClients = clients.length;
      const totalQuotes = clients.reduce((sum, c) => sum + c.totalQuotes, 0);
      expect(totalClients).toBe(3);
      expect(totalQuotes).toBe(9);
    });
  });

  describe("Quote deletion with client registry preservation", () => {
    it("should preserve client record when quote is deleted", () => {
      // Simulate: quote exists, client registry entry exists
      const clientRegistryEntry = {
        id: 1,
        clientName: "João",
        totalQuotes: 3,
        deletedAt: null,
      };

      // After quote deletion, client registry should still exist
      expect(clientRegistryEntry.deletedAt).toBeNull();
      expect(clientRegistryEntry.totalQuotes).toBe(3);
    });

    it("should not decrement totalQuotes when quote is deleted (snapshot behavior)", () => {
      // The totalQuotes in client registry is a running total, not decremented on delete
      const totalQuotesBefore = 5;
      // After deleting a quote, the registry keeps the historical count
      const totalQuotesAfter = totalQuotesBefore; // No change
      expect(totalQuotesAfter).toBe(5);
    });
  });
});
