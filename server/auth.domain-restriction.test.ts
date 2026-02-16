import { describe, expect, it } from "vitest";

/**
 * Tests for the email domain restriction logic.
 * The ALLOWED_DOMAINS list and isAllowedDomain function are used in:
 *   - server/_core/oauth.ts (server-side callback)
 *   - client/src/components/AuthGuard.tsx (client-side guard)
 *   - client/src/pages/LoginPage.tsx (display)
 *   - client/src/pages/AcessoNegado.tsx (display)
 *
 * We test the pure logic here to ensure consistency.
 */

const ALLOWED_DOMAINS = ["kenlo.com.br", "i-value.com.br", "laik.com.br"];

function isAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false;
  const domain = email.toLowerCase().split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
}

describe("Email Domain Restriction", () => {
  describe("isAllowedDomain", () => {
    it("allows @kenlo.com.br emails", () => {
      expect(isAllowedDomain("user@kenlo.com.br")).toBe(true);
      expect(isAllowedDomain("admin@kenlo.com.br")).toBe(true);
      expect(isAllowedDomain("john.doe@kenlo.com.br")).toBe(true);
    });

    it("allows @i-value.com.br emails", () => {
      expect(isAllowedDomain("user@i-value.com.br")).toBe(true);
      expect(isAllowedDomain("admin@i-value.com.br")).toBe(true);
    });

    it("allows @laik.com.br emails", () => {
      expect(isAllowedDomain("user@laik.com.br")).toBe(true);
      expect(isAllowedDomain("admin@laik.com.br")).toBe(true);
    });

    it("rejects emails from unauthorized domains", () => {
      expect(isAllowedDomain("user@gmail.com")).toBe(false);
      expect(isAllowedDomain("user@hotmail.com")).toBe(false);
      expect(isAllowedDomain("user@outlook.com")).toBe(false);
      expect(isAllowedDomain("user@company.com")).toBe(false);
      expect(isAllowedDomain("user@kenlo.com")).toBe(false); // Missing .br
      expect(isAllowedDomain("user@value.com.br")).toBe(false); // Missing i-
    });

    it("is case-insensitive", () => {
      expect(isAllowedDomain("User@KENLO.COM.BR")).toBe(true);
      expect(isAllowedDomain("User@I-VALUE.COM.BR")).toBe(true);
      expect(isAllowedDomain("User@Laik.Com.Br")).toBe(true);
    });

    it("rejects null, undefined, and empty strings", () => {
      expect(isAllowedDomain(null)).toBe(false);
      expect(isAllowedDomain(undefined)).toBe(false);
      expect(isAllowedDomain("")).toBe(false);
    });

    it("rejects malformed emails", () => {
      expect(isAllowedDomain("not-an-email")).toBe(false);
      expect(isAllowedDomain("user@")).toBe(false);
    });
  });

  describe("ALLOWED_DOMAINS list", () => {
    it("contains exactly 3 domains", () => {
      expect(ALLOWED_DOMAINS).toHaveLength(3);
    });

    it("includes kenlo.com.br", () => {
      expect(ALLOWED_DOMAINS).toContain("kenlo.com.br");
    });

    it("includes i-value.com.br", () => {
      expect(ALLOWED_DOMAINS).toContain("i-value.com.br");
    });

    it("includes laik.com.br", () => {
      expect(ALLOWED_DOMAINS).toContain("laik.com.br");
    });
  });
});
