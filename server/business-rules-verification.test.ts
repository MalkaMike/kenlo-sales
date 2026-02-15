/**
 * Business Rules Verification Tests
 * 
 * These tests validate the ACTUAL exports from pricing-config.ts against
 * the documented business rules. Unlike pricing.rules.test.ts (which uses
 * local hardcoded values), these tests import the real config and verify
 * end-to-end correctness.
 * 
 * Covers:
 * 1. Payment frequency multipliers
 * 2. Rounding rule (round UP to next integer ending in 7)
 * 3. Add-on availability restrictions
 * 4. Kombo discounts
 * 5. Kombo implementation costs and free implementations
 * 6. Kombo structure (products + add-ons composition)
 * 7. Kombo detection logic
 * 8. Premium services inclusion rules
 * 9. calculatePrice end-to-end (frequency × rounding)
 */

import { describe, it, expect } from "vitest";
import {
  FREQUENCY_MULTIPLIERS,
  FREQUENCY_DISCOUNTS,
  FREQUENCY_INSTALLMENTS,
  IMOB_PLANS,
  IMOB_IMPLEMENTATION,
  IMOB_ADDITIONAL_USERS,
  LOC_PLANS,
  LOC_IMPLEMENTATION,
  LOC_ADDITIONAL_CONTRACTS,
  ADDONS,
  PREMIUM_SERVICES,
  KOMBOS,
  SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT,
  roundToSeven,
  calculatePrice,
  calculateTieredPrice,
  detectKombo,
  shouldIncludePremiumService,
  type PaymentFrequency,
  type KomboType,
} from "@shared/pricing-config";

// ============================================================================
// 1. PAYMENT FREQUENCY MULTIPLIERS
// ============================================================================

describe("Business Rule: Payment Frequency Multipliers", () => {
  it("annual is the reference (multiplier = 1.0)", () => {
    expect(FREQUENCY_MULTIPLIERS.annual).toBe(1.0);
  });

  it("monthly is more expensive than annual (multiplier = 1.25)", () => {
    expect(FREQUENCY_MULTIPLIERS.monthly).toBe(1.25);
    expect(FREQUENCY_MULTIPLIERS.monthly).toBeGreaterThan(FREQUENCY_MULTIPLIERS.annual);
  });

  it("semiannual is between monthly and annual (multiplier = 1.125)", () => {
    expect(FREQUENCY_MULTIPLIERS.semiannual).toBe(1.125);
    expect(FREQUENCY_MULTIPLIERS.semiannual).toBeGreaterThan(FREQUENCY_MULTIPLIERS.annual);
    expect(FREQUENCY_MULTIPLIERS.semiannual).toBeLessThan(FREQUENCY_MULTIPLIERS.monthly);
  });

  it("biennial is cheaper than annual (multiplier = 0.875)", () => {
    expect(FREQUENCY_MULTIPLIERS.biennial).toBe(0.875);
    expect(FREQUENCY_MULTIPLIERS.biennial).toBeLessThan(FREQUENCY_MULTIPLIERS.annual);
  });

  it("multipliers are ordered: biennial < annual < semiannual < monthly", () => {
    expect(FREQUENCY_MULTIPLIERS.biennial).toBeLessThan(FREQUENCY_MULTIPLIERS.annual);
    expect(FREQUENCY_MULTIPLIERS.annual).toBeLessThan(FREQUENCY_MULTIPLIERS.semiannual);
    expect(FREQUENCY_MULTIPLIERS.semiannual).toBeLessThan(FREQUENCY_MULTIPLIERS.monthly);
  });

  it("discount vs monthly percentages are correct", () => {
    expect(FREQUENCY_DISCOUNTS.monthly).toBe(0);     // Reference
    expect(FREQUENCY_DISCOUNTS.semiannual).toBe(10);  // 10% OFF vs mensal
    expect(FREQUENCY_DISCOUNTS.annual).toBe(20);      // 20% OFF vs mensal
    expect(FREQUENCY_DISCOUNTS.biennial).toBe(30);    // 30% OFF vs mensal
  });

  it("max installments are correct", () => {
    expect(FREQUENCY_INSTALLMENTS.monthly).toBe(1);
    expect(FREQUENCY_INSTALLMENTS.semiannual).toBe(1);
    expect(FREQUENCY_INSTALLMENTS.annual).toBe(3);
    expect(FREQUENCY_INSTALLMENTS.biennial).toBe(6);
  });

  it("applying multiplier to a base price produces expected results", () => {
    const annualBase = 497; // Kenlo K annual price
    expect(annualBase * FREQUENCY_MULTIPLIERS.monthly).toBe(621.25);
    expect(annualBase * FREQUENCY_MULTIPLIERS.semiannual).toBe(559.125);
    expect(annualBase * FREQUENCY_MULTIPLIERS.annual).toBe(497);
    expect(annualBase * FREQUENCY_MULTIPLIERS.biennial).toBe(434.875);
  });
});

// ============================================================================
// 2. ROUNDING RULE
// ============================================================================

describe("Business Rule: Round UP to Next Integer Ending in 7", () => {
  it("already ending in 7 stays the same", () => {
    expect(roundToSeven(7)).toBe(7);
    expect(roundToSeven(17)).toBe(17);
    expect(roundToSeven(37)).toBe(37);
    expect(roundToSeven(97)).toBe(97);
    expect(roundToSeven(247)).toBe(247);
    expect(roundToSeven(497)).toBe(497);
    expect(roundToSeven(1197)).toBe(1197);
  });

  it("rounds UP to next 7, never down", () => {
    expect(roundToSeven(490)).toBe(497);
    expect(roundToSeven(491)).toBe(497);
    expect(roundToSeven(492)).toBe(497);
    expect(roundToSeven(493)).toBe(497);
    expect(roundToSeven(494)).toBe(497);
    expect(roundToSeven(495)).toBe(497);
    expect(roundToSeven(496)).toBe(497);
  });

  it("when last digit > 7, rounds to next decade + 7", () => {
    expect(roundToSeven(498)).toBe(507);
    expect(roundToSeven(499)).toBe(507);
    expect(roundToSeven(500)).toBe(507);
    expect(roundToSeven(501)).toBe(507);
    expect(roundToSeven(508)).toBe(517);
    expect(roundToSeven(509)).toBe(517);
  });

  it("handles decimal inputs by ceiling first", () => {
    expect(roundToSeven(496.5)).toBe(497);
    expect(roundToSeven(497.1)).toBe(507);
    expect(roundToSeven(490.01)).toBe(497);
  });

  it("result always ends in digit 7", () => {
    for (let i = 1; i <= 2000; i++) {
      const result = roundToSeven(i);
      expect(result % 10).toBe(7);
      expect(result).toBeGreaterThanOrEqual(i);
    }
  });

  it("result is always >= input (never rounds down)", () => {
    for (let i = 1; i <= 2000; i++) {
      expect(roundToSeven(i)).toBeGreaterThanOrEqual(i);
    }
  });
});

// ============================================================================
// 3. ADD-ON AVAILABILITY RESTRICTIONS
// ============================================================================

describe("Business Rule: Add-on Availability", () => {
  it("Leads is available for IMOB only", () => {
    expect(ADDONS.leads.availableFor).toContain("imob");
    expect(ADDONS.leads.availableFor).not.toContain("locacao");
    expect(ADDONS.leads.availableFor).toHaveLength(1);
  });

  it("Inteligência is available for both IMOB and LOC", () => {
    expect(ADDONS.inteligencia.availableFor).toContain("imob");
    expect(ADDONS.inteligencia.availableFor).toContain("locacao");
    expect(ADDONS.inteligencia.availableFor).toHaveLength(2);
  });

  it("Assinaturas is available for both IMOB and LOC", () => {
    expect(ADDONS.assinaturas.availableFor).toContain("imob");
    expect(ADDONS.assinaturas.availableFor).toContain("locacao");
    expect(ADDONS.assinaturas.availableFor).toHaveLength(2);
  });

  // Pay, Seguros, Cash are LOC-only but are not in ADDONS export
  // (they are separate: PAY_BOLETOS, PAY_SPLITS, SEGUROS_COMMISSION)
  // Their availability is enforced by the calculator UI, not the config
});

// ============================================================================
// 4. KOMBO DISCOUNTS
// ============================================================================

describe("Business Rule: Kombo Discounts", () => {
  it("Imob Start has 10% discount", () => {
    expect(KOMBOS["imob-start"].monthlyDiscount).toBe(0.10);
  });

  it("Imob Pro has 15% discount", () => {
    expect(KOMBOS["imob-pro"].monthlyDiscount).toBe(0.15);
  });

  it("Locação Pro has 10% discount", () => {
    expect(KOMBOS["loc-pro"].monthlyDiscount).toBe(0.10);
  });

  it("Core Gestão has 0% discount (conforme tabela)", () => {
    expect(KOMBOS["core-gestao"].monthlyDiscount).toBe(0);
  });

  it("Elite has 20% discount", () => {
    expect(KOMBOS.elite.monthlyDiscount).toBe(0.20);
  });

  it("discounts are ordered: Core Gestão < Start = Loc Pro < Pro < Elite", () => {
    expect(KOMBOS["core-gestao"].monthlyDiscount).toBeLessThan(KOMBOS["imob-start"].monthlyDiscount);
    expect(KOMBOS["imob-start"].monthlyDiscount).toBe(KOMBOS["loc-pro"].monthlyDiscount);
    expect(KOMBOS["imob-start"].monthlyDiscount).toBeLessThan(KOMBOS["imob-pro"].monthlyDiscount);
    expect(KOMBOS["imob-pro"].monthlyDiscount).toBeLessThan(KOMBOS.elite.monthlyDiscount);
  });

  it("applying discount to a base price produces correct result", () => {
    const basePrice = 1000;
    expect(basePrice * (1 - KOMBOS["imob-start"].monthlyDiscount)).toBe(900);
    expect(basePrice * (1 - KOMBOS["imob-pro"].monthlyDiscount)).toBe(850);
    expect(basePrice * (1 - KOMBOS["loc-pro"].monthlyDiscount)).toBe(900);
    expect(basePrice * (1 - KOMBOS["core-gestao"].monthlyDiscount)).toBe(1000);
    expect(basePrice * (1 - KOMBOS.elite.monthlyDiscount)).toBe(800);
  });
});

// ============================================================================
// 5. KOMBO IMPLEMENTATION COSTS & FREE IMPLEMENTATIONS
// ============================================================================

describe("Business Rule: Kombo Implementation Costs", () => {
  const FIXED_IMPL = 1497;

  it("all Kombos have fixed implementation cost of R$ 1.497", () => {
    expect(KOMBOS["imob-start"].implementation).toBe(FIXED_IMPL);
    expect(KOMBOS["imob-pro"].implementation).toBe(FIXED_IMPL);
    expect(KOMBOS["loc-pro"].implementation).toBe(FIXED_IMPL);
    expect(KOMBOS["core-gestao"].implementation).toBe(FIXED_IMPL);
    expect(KOMBOS.elite.implementation).toBe(FIXED_IMPL);
  });

  it("base implementation cost matches Kombo implementation", () => {
    expect(IMOB_IMPLEMENTATION).toBe(FIXED_IMPL);
    expect(LOC_IMPLEMENTATION).toBe(FIXED_IMPL);
  });
});

describe("Business Rule: Kombo Free (Zeroed) Implementations", () => {
  it("Imob Start: Leads implementation is free", () => {
    expect(KOMBOS["imob-start"].freeImplementations).toContain("leads");
    expect(KOMBOS["imob-start"].freeImplementations).toHaveLength(1);
  });

  it("Imob Pro: Leads + Inteligência implementations are free", () => {
    expect(KOMBOS["imob-pro"].freeImplementations).toContain("leads");
    expect(KOMBOS["imob-pro"].freeImplementations).toContain("inteligencia");
    expect(KOMBOS["imob-pro"].freeImplementations).toHaveLength(2);
  });

  it("Locação Pro: Inteligência implementation is free", () => {
    expect(KOMBOS["loc-pro"].freeImplementations).toContain("inteligencia");
    expect(KOMBOS["loc-pro"].freeImplementations).toHaveLength(1);
  });

  it("Core Gestão: no free implementations (empty list)", () => {
    expect(KOMBOS["core-gestao"].freeImplementations).toHaveLength(0);
  });

  it("Elite: Leads + Inteligência + Pay implementations are free", () => {
    expect(KOMBOS.elite.freeImplementations).toContain("leads");
    expect(KOMBOS.elite.freeImplementations).toContain("inteligencia");
    expect(KOMBOS.elite.freeImplementations).toContain("pay");
    expect(KOMBOS.elite.freeImplementations).toHaveLength(3);
  });
});

// ============================================================================
// 6. KOMBO STRUCTURE (Products + Add-ons Composition)
// ============================================================================

describe("Business Rule: Kombo Composition", () => {
  it("Imob Start = IMOB + Leads", () => {
    const structure = KOMBOS["imob-start"].structure;
    expect(structure).toContain("imob");
    expect(structure).toContain("leads");
    expect(structure).not.toContain("locacao");
    expect(structure).not.toContain("inteligencia");
  });

  it("Imob Pro = IMOB + Leads + Inteligência", () => {
    const structure = KOMBOS["imob-pro"].structure;
    expect(structure).toContain("imob");
    expect(structure).toContain("leads");
    expect(structure).toContain("inteligencia");
    expect(structure).not.toContain("locacao");
  });

  it("Locação Pro = LOC + Inteligência + Assinaturas", () => {
    const structure = KOMBOS["loc-pro"].structure;
    expect(structure).toContain("locacao");
    expect(structure).toContain("inteligencia");
    expect(structure).toContain("assinaturas");
    expect(structure).not.toContain("imob");
  });

  it("Core Gestão = IMOB + LOC (no add-ons)", () => {
    const structure = KOMBOS["core-gestao"].structure;
    expect(structure).toContain("imob");
    expect(structure).toContain("locacao");
    // No add-ons
    expect(structure).not.toContain("leads");
    expect(structure).not.toContain("inteligencia");
    expect(structure).not.toContain("assinaturas");
    expect(structure).not.toContain("pay");
    expect(structure).toHaveLength(2);
  });

  it("Elite = IMOB + LOC + Leads + Inteligência + Pay + Assinaturas", () => {
    const structure = KOMBOS.elite.structure;
    expect(structure).toContain("imob");
    expect(structure).toContain("locacao");
    expect(structure).toContain("leads");
    expect(structure).toContain("inteligencia");
    expect(structure).toContain("pay");
    expect(structure).toContain("assinaturas");
  });
});

// ============================================================================
// 7. KOMBO DETECTION LOGIC
// ============================================================================

describe("Business Rule: Kombo Detection", () => {
  const base = { imob: false, loc: false, leads: false, inteligencia: false, assinaturas: false };

  it("detects Elite: IMOB + LOC + all add-ons", () => {
    expect(detectKombo({ ...base, imob: true, loc: true, leads: true, inteligencia: true, assinaturas: true })).toBe("elite");
  });

  it("detects Core Gestão: IMOB + LOC without add-ons", () => {
    expect(detectKombo({ ...base, imob: true, loc: true })).toBe("core-gestao");
  });

  it("detects Imob Pro: IMOB + Leads + Inteligência + Assinatura", () => {
    expect(detectKombo({ ...base, imob: true, leads: true, inteligencia: true, assinaturas: true })).toBe("imob-pro");
  });

  it("detects Imob Start: IMOB + Leads + Assinatura", () => {
    expect(detectKombo({ ...base, imob: true, leads: true, assinaturas: true })).toBe("imob-start");
  });

  it("detects Locação Pro: LOC + Inteligência + Assinatura", () => {
    expect(detectKombo({ ...base, loc: true, inteligencia: true, assinaturas: true })).toBe("loc-pro");
  });

  it("returns none for single product without matching add-ons", () => {
    expect(detectKombo({ ...base, imob: true })).toBe("none");
    expect(detectKombo({ ...base, loc: true })).toBe("none");
    expect(detectKombo({ ...base, imob: true, leads: true })).toBe("none");
    expect(detectKombo({ ...base, imob: true, inteligencia: true })).toBe("none");
  });

  it("returns none when nothing is selected", () => {
    expect(detectKombo(base)).toBe("none");
  });
});

// ============================================================================
// 8. PREMIUM SERVICES INCLUSION RULES
// ============================================================================

describe("Business Rule: Premium Services Inclusion", () => {
  it("all Kombos include Premium Services (VIP + CS)", () => {
    const komboKeys: KomboType[] = ["imob-start", "imob-pro", "loc-pro", "core-gestao", "elite"];
    for (const kombo of komboKeys) {
      expect(KOMBOS[kombo].premiumServicesIncluded).toBe(true);
      expect(shouldIncludePremiumService("vipSupport", "prime", null, kombo)).toBe(true);
      expect(shouldIncludePremiumService("csDedicado", "prime", null, kombo)).toBe(true);
    }
  });

  it("VIP Support is included in K and K2 plans (without Kombo)", () => {
    expect(shouldIncludePremiumService("vipSupport", "k", null, "none")).toBe(true);
    expect(shouldIncludePremiumService("vipSupport", "k2", null, "none")).toBe(true);
    expect(shouldIncludePremiumService("vipSupport", null, "k", "none")).toBe(true);
    expect(shouldIncludePremiumService("vipSupport", null, "k2", "none")).toBe(true);
  });

  it("VIP Support is NOT included in Prime plan (without Kombo)", () => {
    expect(shouldIncludePremiumService("vipSupport", "prime", null, "none")).toBe(false);
    expect(shouldIncludePremiumService("vipSupport", null, "prime", "none")).toBe(false);
  });

  it("CS Dedicado is included in K2 plan only (without Kombo)", () => {
    expect(shouldIncludePremiumService("csDedicado", "k2", null, "none")).toBe(true);
    expect(shouldIncludePremiumService("csDedicado", null, "k2", "none")).toBe(true);
  });

  it("CS Dedicado is NOT included in Prime or K plans (without Kombo)", () => {
    expect(shouldIncludePremiumService("csDedicado", "prime", null, "none")).toBe(false);
    expect(shouldIncludePremiumService("csDedicado", "k", null, "none")).toBe(false);
    expect(shouldIncludePremiumService("csDedicado", null, "prime", "none")).toBe(false);
    expect(shouldIncludePremiumService("csDedicado", null, "k", "none")).toBe(false);
  });

  it("cross-product benefit: highest plan tier applies to both products", () => {
    // IMOB K + LOC Prime → VIP included (from IMOB K)
    expect(shouldIncludePremiumService("vipSupport", "k", "prime", "none")).toBe(true);
    // IMOB Prime + LOC K2 → CS Dedicado included (from LOC K2)
    expect(shouldIncludePremiumService("csDedicado", "prime", "k2", "none")).toBe(true);
  });

  it("VIP Support costs R$ 97/month", () => {
    expect(PREMIUM_SERVICES.vipSupport.monthlyPrice).toBe(97);
  });

  it("CS Dedicado costs R$ 297/month", () => {
    expect(PREMIUM_SERVICES.csDedicado.monthlyPrice).toBe(297);
  });
});

// ============================================================================
// 9. calculatePrice END-TO-END (frequency × rounding)
// ============================================================================

describe("Business Rule: calculatePrice End-to-End", () => {
  it("IMOB Prime prices across all frequencies", () => {
    const annual = IMOB_PLANS.prime.annualPrice; // 247
    
    const monthly = calculatePrice(annual, "monthly");
    const semiannual = calculatePrice(annual, "semiannual");
    const annualPrice = calculatePrice(annual, "annual");
    const biennial = calculatePrice(annual, "biennial");

    // All must end in 7
    expect(monthly % 10).toBe(7);
    expect(semiannual % 10).toBe(7);
    expect(annualPrice % 10).toBe(7);
    expect(biennial % 10).toBe(7);

    // Order: biennial < annual < semiannual < monthly
    expect(biennial).toBeLessThan(annualPrice);
    expect(annualPrice).toBeLessThanOrEqual(semiannual);
    expect(semiannual).toBeLessThan(monthly);

    // Verify specific values
    expect(annualPrice).toBe(247); // 247 × 1.0 = 247 → already ends in 7
    expect(monthly).toBe(roundToSeven(247 * 1.25)); // 308.75 → 317
    expect(semiannual).toBe(roundToSeven(247 * 1.125)); // 277.875 → 287
    expect(biennial).toBe(roundToSeven(247 * 0.875)); // 216.125 → 217
  });

  it("IMOB K prices across all frequencies", () => {
    const annual = IMOB_PLANS.k.annualPrice; // 497

    const monthly = calculatePrice(annual, "monthly");
    const annualPrice = calculatePrice(annual, "annual");
    const biennial = calculatePrice(annual, "biennial");

    expect(annualPrice).toBe(497);
    expect(monthly).toBe(roundToSeven(497 * 1.25)); // 621.25 → 627
    expect(biennial).toBe(roundToSeven(497 * 0.875)); // 434.875 → 437
  });

  it("IMOB K2 prices across all frequencies", () => {
    const annual = IMOB_PLANS.k2.annualPrice; // 1197

    const monthly = calculatePrice(annual, "monthly");
    const annualPrice = calculatePrice(annual, "annual");
    const biennial = calculatePrice(annual, "biennial");

    expect(annualPrice).toBe(1197);
    expect(monthly).toBe(roundToSeven(1197 * 1.25)); // 1496.25 → 1497
    expect(biennial).toBe(roundToSeven(1197 * 0.875)); // 1047.375 → 1047 → 1047 ends in 7!
  });

  it("add-on prices also follow frequency + rounding", () => {
    const leadsAnnual = ADDONS.leads.annualPrice; // 497
    const intAnnual = ADDONS.inteligencia.annualPrice; // 297
    const assAnnual = ADDONS.assinaturas.annualPrice; // 37

    // Monthly prices
    expect(calculatePrice(leadsAnnual, "monthly") % 10).toBe(7);
    expect(calculatePrice(intAnnual, "monthly") % 10).toBe(7);
    expect(calculatePrice(assAnnual, "monthly") % 10).toBe(7);

    // Biennial prices
    expect(calculatePrice(leadsAnnual, "biennial") % 10).toBe(7);
    expect(calculatePrice(intAnnual, "biennial") % 10).toBe(7);
    expect(calculatePrice(assAnnual, "biennial") % 10).toBe(7);
  });
});

// ============================================================================
// 10. PRODUCT BASE PRICES AND INCLUDED QUANTITIES
// ============================================================================

describe("Business Rule: IMOB Plan Base Prices and Included Users", () => {
  it("Prime: R$ 247/month, 2 users included", () => {
    expect(IMOB_PLANS.prime.annualPrice).toBe(247);
    expect(IMOB_PLANS.prime.includedUsers).toBe(2);
  });

  it("K: R$ 497/month, 7 users included", () => {
    expect(IMOB_PLANS.k.annualPrice).toBe(497);
    expect(IMOB_PLANS.k.includedUsers).toBe(7);
  });

  it("K²: R$ 1.197/month, 15 users included", () => {
    expect(IMOB_PLANS.k2.annualPrice).toBe(1197);
    expect(IMOB_PLANS.k2.includedUsers).toBe(15);
  });
});

describe("Business Rule: LOC Plan Base Prices and Included Contracts", () => {
  it("Prime: R$ 247/month, 100 contracts included", () => {
    expect(LOC_PLANS.prime.annualPrice).toBe(247);
    expect(LOC_PLANS.prime.includedContracts).toBe(100);
  });

  it("K: R$ 497/month, 150 contracts included", () => {
    expect(LOC_PLANS.k.annualPrice).toBe(497);
    expect(LOC_PLANS.k.includedContracts).toBe(150);
  });

  it("K²: R$ 1.197/month, 500 contracts included", () => {
    expect(LOC_PLANS.k2.annualPrice).toBe(1197);
    expect(LOC_PLANS.k2.includedContracts).toBe(500);
  });
});

// ============================================================================
// 11. TIERED PRICING (Additional Users, Contracts)
// ============================================================================

describe("Business Rule: Tiered Pricing for Additional Users", () => {
  it("IMOB Prime: flat R$ 57/user", () => {
    const tiers = IMOB_ADDITIONAL_USERS.prime;
    expect(tiers).toHaveLength(1);
    expect(tiers[0].price).toBe(57);
    expect(calculateTieredPrice(5, tiers)).toBe(285);
  });

  it("IMOB K: R$ 47 (1-5), R$ 37 (6+)", () => {
    const tiers = IMOB_ADDITIONAL_USERS.k;
    expect(tiers).toHaveLength(2);
    expect(tiers[0].price).toBe(47);
    expect(tiers[1].price).toBe(37);
    expect(calculateTieredPrice(3, tiers)).toBe(141);   // 3 × 47
    expect(calculateTieredPrice(7, tiers)).toBe(309);   // 5×47 + 2×37
  });

  it("IMOB K²: R$ 37 (1-10), R$ 27 (11-100), R$ 17 (101+)", () => {
    const tiers = IMOB_ADDITIONAL_USERS.k2;
    expect(tiers).toHaveLength(3);
    expect(tiers[0].price).toBe(37);
    expect(tiers[1].price).toBe(27);
    expect(tiers[2].price).toBe(17);
    expect(calculateTieredPrice(10, tiers)).toBe(370);   // 10 × 37
    expect(calculateTieredPrice(15, tiers)).toBe(505);   // 10×37 + 5×27
  });
});

describe("Business Rule: Tiered Pricing for Additional Contracts", () => {
  it("LOC Prime: flat R$ 3/contract", () => {
    const tiers = LOC_ADDITIONAL_CONTRACTS.prime;
    expect(tiers[0].price).toBe(3);
    expect(calculateTieredPrice(50, tiers)).toBe(150);
  });

  it("LOC K: R$ 3.00 (1-250), R$ 2.50 (251+)", () => {
    const tiers = LOC_ADDITIONAL_CONTRACTS.k;
    expect(tiers).toHaveLength(2);
    expect(tiers[0].price).toBe(3);
    expect(tiers[1].price).toBe(2.5);
    expect(calculateTieredPrice(100, tiers)).toBe(300);   // 100 × 3.00
    expect(calculateTieredPrice(250, tiers)).toBe(750);   // 250 × 3.00
    expect(calculateTieredPrice(300, tiers)).toBe(875);   // 250×3.00 + 50×2.50
  });

  it("LOC K²: R$ 3.00 (1-250), R$ 2.50 (251-500), R$ 2.00 (501+)", () => {
    const tiers = LOC_ADDITIONAL_CONTRACTS.k2;
    expect(tiers).toHaveLength(3);
    expect(tiers[0].price).toBe(3);
    expect(tiers[1].price).toBe(2.5);
    expect(tiers[2].price).toBe(2);
    expect(calculateTieredPrice(250, tiers)).toBe(750);   // 250 × 3.00
    expect(calculateTieredPrice(400, tiers)).toBe(1125);  // 250×3.00 + 150×2.50
    expect(calculateTieredPrice(600, tiers)).toBe(1575);  // 250×3.00 + 250×2.50 + 100×2.00
  });
});

// ============================================================================
// 12. ADD-ON PRICES AND INCLUDED QUANTITIES
// ============================================================================

describe("Business Rule: Add-on Prices", () => {
  it("Leads: R$ 497/month, R$ 497 implementation, 100 WhatsApp leads included", () => {
    expect(ADDONS.leads.annualPrice).toBe(497);
    expect(ADDONS.leads.implementation).toBe(497);
    expect(ADDONS.leads.includedWhatsAppLeads).toBe(100);
  });

  it("Inteligência: R$ 297/month, R$ 497 implementation", () => {
    expect(ADDONS.inteligencia.annualPrice).toBe(297);
    expect(ADDONS.inteligencia.implementation).toBe(497);
  });

  it("Assinaturas: R$ 37/month, R$ 0 implementation, 15 signatures included", () => {
    expect(ADDONS.assinaturas.annualPrice).toBe(37);
    expect(ADDONS.assinaturas.implementation).toBe(0);
    expect(ADDONS.assinaturas.includedSignatures).toBe(15);
  });
});

// ============================================================================
// 13. SEGUROS ESTIMATED REVENUE
// ============================================================================

describe("Business Rule: Seguros Estimated Revenue", () => {
  it("estimated revenue per contract is R$ 10", () => {
    expect(SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT).toBe(10);
  });
});
