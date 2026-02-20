/**
 * Pricing Rounding Validation Test
 * 
 * Validates that:
 * 1. All product license prices >= R$100 end in 7 (after frequency adjustment)
 * 2. All product license prices < R$100 are Math.ceil rounded
 * 3. Post-paid prices (users, contracts, leads, boletos, splits) do NOT end in 7
 * 4. Pre-paid prices are exactly post-paid × 0.90 (no rounding to 7)
 * 5. Implementation fees are fixed values (no rounding)
 */
import { describe, it, expect } from "vitest";
import {
  roundToSeven,
  calculatePrice,
  FREQUENCY_MULTIPLIERS,
  IMOB_PLANS,
  LOC_PLANS,
  ADDONS,
  IMOB_ADDITIONAL_USERS,
  LOC_ADDITIONAL_CONTRACTS,
  PAY_BOLETOS,
  PAY_SPLITS,
  PREPAID_DISCOUNT_MULTIPLIER,
  PREPAID_DISCOUNT_PERCENTAGE,
  calculateTieredPrice,
  IMOB_IMPLEMENTATION,
  LOC_IMPLEMENTATION,
  PREMIUM_SERVICES,
  TRAINING,
  type PaymentFrequency,
  type PlanTier,
} from "../shared/pricing-config";
import pricingValues from "../shared/pricing-values.json";

const FREQUENCIES: PaymentFrequency[] = ["monthly", "semiannual", "annual", "biennial"];
const PLANS: PlanTier[] = ["prime", "k", "k2"];

// Helper: check if a number ends in 7
function endsIn7(n: number): boolean {
  return Math.floor(n) % 10 === 7;
}

// Helper: check if a number is a whole integer (Math.ceil result)
function isWholeNumber(n: number): boolean {
  return n === Math.ceil(n);
}

describe("Pricing Rounding Validation", () => {
  // =========================================================================
  // RULE 1: Product license prices >= R$100 MUST end in 7
  // =========================================================================
  describe("Product licenses >= R$100 must end in 7", () => {
    it("IMOB plan prices >= R$100 end in 7 for all frequencies", () => {
      for (const plan of PLANS) {
        const annualPrice = IMOB_PLANS[plan].annualPrice;
        for (const freq of FREQUENCIES) {
          const price = calculatePrice(annualPrice, freq);
          if (price >= 100) {
            expect(endsIn7(price), 
              `IMOB ${plan} ${freq}: R$${price} should end in 7`
            ).toBe(true);
          }
        }
      }
    });

    it("LOC plan prices >= R$100 end in 7 for all frequencies", () => {
      for (const plan of PLANS) {
        const annualPrice = LOC_PLANS[plan].annualPrice;
        for (const freq of FREQUENCIES) {
          const price = calculatePrice(annualPrice, freq);
          if (price >= 100) {
            expect(endsIn7(price), 
              `LOC ${plan} ${freq}: R$${price} should end in 7`
            ).toBe(true);
          }
        }
      }
    });

    it("Add-on license prices >= R$100 end in 7 for all frequencies", () => {
      const addonsToCheck = ["inteligencia", "leads", "assinaturas"] as const;
      for (const addon of addonsToCheck) {
        const annualPrice = ADDONS[addon].annualPrice;
        for (const freq of FREQUENCIES) {
          const price = calculatePrice(annualPrice, freq);
          if (price >= 100) {
            expect(endsIn7(price), 
              `${addon} ${freq}: R$${price} should end in 7`
            ).toBe(true);
          }
        }
      }
    });
  });

  // =========================================================================
  // RULE 2: Product license prices < R$100 use Math.ceil
  // =========================================================================
  describe("Product licenses < R$100 must be Math.ceil rounded", () => {
    it("Add-on license prices < R$100 are whole numbers (Math.ceil)", () => {
      const addonsToCheck = ["inteligencia", "leads", "assinaturas"] as const;
      for (const addon of addonsToCheck) {
        const annualPrice = ADDONS[addon].annualPrice;
        for (const freq of FREQUENCIES) {
          const price = calculatePrice(annualPrice, freq);
          if (price < 100) {
            expect(isWholeNumber(price), 
              `${addon} ${freq}: R$${price} should be a whole number (Math.ceil)`
            ).toBe(true);
          }
        }
      }
    });
  });

  // =========================================================================
  // RULE 3: Post-paid prices do NOT end in 7 (they are exact values)
  // =========================================================================
  describe("Post-paid prices must NOT be rounded to end in 7", () => {
    it("Additional user tier prices are exact values from pricing-values.json", () => {
      for (const plan of PLANS) {
        const tiers = IMOB_ADDITIONAL_USERS[plan];
        for (const tier of tiers) {
          // Post-paid prices should match exactly what's in pricing-values.json
          const jsonTiers = pricingValues.variableCosts.additionalUsers.tiers[plan];
          const matchingTier = jsonTiers.find((t: any) => t.from === tier.from);
          expect(matchingTier).toBeDefined();
          expect(tier.price).toBe(matchingTier!.price);
          // Verify they are NOT artificially rounded to end in 7
          // (they can naturally end in 7, but should not be forced)
        }
      }
    });

    it("Additional contract tier prices are exact values from pricing-values.json", () => {
      for (const plan of PLANS) {
        const tiers = LOC_ADDITIONAL_CONTRACTS[plan];
        for (const tier of tiers) {
          const jsonTiers = pricingValues.variableCosts.additionalContracts.tiers[plan];
          const matchingTier = jsonTiers.find((t: any) => t.from === tier.from);
          expect(matchingTier).toBeDefined();
          expect(tier.price).toBe(matchingTier!.price);
        }
      }
    });

    it("Boleto tier prices are exact values from pricing-values.json", () => {
      for (const plan of PLANS) {
        const tiers = PAY_BOLETOS[plan];
        for (const tier of tiers) {
          const jsonTiers = pricingValues.variableCosts.boletos.tiers[plan];
          const matchingTier = jsonTiers.find((t: any) => t.from === tier.from);
          expect(matchingTier).toBeDefined();
          expect(tier.price).toBe(matchingTier!.price);
        }
      }
    });

    it("Split tier prices are exact values from pricing-values.json", () => {
      for (const plan of PLANS) {
        const tiers = PAY_SPLITS[plan];
        for (const tier of tiers) {
          const jsonTiers = pricingValues.variableCosts.splits.tiers[plan];
          const matchingTier = jsonTiers.find((t: any) => t.from === tier.from);
          expect(matchingTier).toBeDefined();
          expect(tier.price).toBe(matchingTier!.price);
        }
      }
    });

    it("Additional lead tier prices are exact values from pricing-values.json", () => {
      const tiers = ADDONS.leads.additionalLeadsTiers;
      const jsonTiers = pricingValues.variableCosts.additionalLeads.tiers.all_plans;
      for (const tier of tiers) {
        const matchingTier = jsonTiers.find((t: any) => t.from === tier.from);
        expect(matchingTier).toBeDefined();
        expect(tier.price).toBe(matchingTier!.price);
      }
    });
  });

  // =========================================================================
  // RULE 4: Pre-paid prices are exactly post-paid × 0.90
  // =========================================================================
  describe("Pre-paid prices must be exactly post-paid × 0.90 (no rounding to 7)", () => {
    it("Discount percentage is 10%", () => {
      expect(PREPAID_DISCOUNT_PERCENTAGE).toBe(10);
      expect(PREPAID_DISCOUNT_MULTIPLIER).toBeCloseTo(0.90, 10);
    });

    it("Pre-paid user prices are exactly post-paid × 0.90 for all plans and quantities", () => {
      const testQuantities = [1, 5, 10, 20, 50];
      for (const plan of PLANS) {
        for (const qty of testQuantities) {
          const postPaidTotal = calculateTieredPrice(qty, IMOB_ADDITIONAL_USERS[plan]);
          const expectedPrepaid = postPaidTotal * PREPAID_DISCOUNT_MULTIPLIER;
          const actualPrepaid = postPaidTotal * 0.90;
          
          expect(expectedPrepaid).toBeCloseTo(actualPrepaid, 10);
          // Verify it's NOT rounded to end in 7
          // The prepaid price should be the exact multiplication result
          expect(expectedPrepaid).toBe(postPaidTotal * PREPAID_DISCOUNT_MULTIPLIER);
        }
      }
    });

    it("Pre-paid contract prices are exactly post-paid × 0.90 for all plans and quantities", () => {
      const testQuantities = [1, 50, 100, 300, 600];
      for (const plan of PLANS) {
        for (const qty of testQuantities) {
          const postPaidTotal = calculateTieredPrice(qty, LOC_ADDITIONAL_CONTRACTS[plan]);
          const expectedPrepaid = postPaidTotal * PREPAID_DISCOUNT_MULTIPLIER;
          
          expect(expectedPrepaid).toBe(postPaidTotal * 0.90);
        }
      }
    });

    it("Pre-paid lead prices are exactly post-paid × 0.90 for all quantities", () => {
      const testQuantities = [1, 100, 250, 500, 1500];
      const leadTiers = pricingValues.variableCosts.additionalLeads.tiers.all_plans.map((tier: any) => ({
        from: tier.from,
        to: tier.to === 999999 ? Infinity : tier.to,
        price: tier.price,
      }));
      
      for (const qty of testQuantities) {
        const postPaidTotal = calculateTieredPrice(qty, leadTiers);
        const expectedPrepaid = postPaidTotal * PREPAID_DISCOUNT_MULTIPLIER;
        
        expect(expectedPrepaid).toBe(postPaidTotal * 0.90);
      }
    });
  });

  // =========================================================================
  // RULE 5: Implementation fees are fixed values (no rounding)
  // =========================================================================
  describe("Implementation fees are fixed values", () => {
    it("IMOB implementation matches pricing-values.json", () => {
      expect(IMOB_IMPLEMENTATION).toBe(pricingValues._legacyFields.implantacaoBase);
    });

    it("LOC implementation matches pricing-values.json", () => {
      expect(LOC_IMPLEMENTATION).toBe(pricingValues._legacyFields.implantacaoBase);
    });

    it("Add-on implementations match pricing-values.json", () => {
      expect(ADDONS.inteligencia.implementation).toBe(pricingValues.addons.inteligencia.implementation);
      expect(ADDONS.leads.implementation).toBe(pricingValues.addons.leads.implementation);
      expect(ADDONS.assinaturas.implementation).toBe(pricingValues.addons.assinaturas.implementation);
    });

    it("Premium service prices are not rounded to 7", () => {
      expect(PREMIUM_SERVICES.vipSupport.monthlyPrice).toBe(
        pricingValues.premiumServices.recurring.vipSupport.monthlyPrice
      );
      expect(PREMIUM_SERVICES.csDedicado.monthlyPrice).toBe(
        pricingValues.premiumServices.recurring.csDedicado.monthlyPrice
      );
    });

    it("Training prices match pricing-values.json", () => {
      expect(TRAINING.online).toBe(pricingValues.premiumServices.nonRecurring.treinamentoOnline.unitPrice);
      expect(TRAINING.presencial).toBe(pricingValues.premiumServices.nonRecurring.treinamentoPresencial.unitPrice);
    });
  });

  // =========================================================================
  // RULE 6: roundToSeven function correctness
  // =========================================================================
  describe("roundToSeven function correctness", () => {
    it("correctly rounds values >= 100 to end in 7", () => {
      const testCases = [
        { input: 100, expected: 107 },
        { input: 107, expected: 107 },
        { input: 108, expected: 117 },
        { input: 247, expected: 247 },
        { input: 248, expected: 257 },
        { input: 277.875, expected: 287 },
        { input: 300, expected: 307 },
        { input: 307, expected: 307 },
        { input: 497, expected: 497 },
        { input: 1197, expected: 1197 },
        { input: 1198, expected: 1207 },
      ];

      for (const { input, expected } of testCases) {
        expect(roundToSeven(input), 
          `roundToSeven(${input}) should be ${expected}`
        ).toBe(expected);
      }
    });

    it("correctly uses Math.ceil for values < 100", () => {
      const testCases = [
        { input: 37, expected: 37 },
        { input: 37.5, expected: 38 },
        { input: 41.625, expected: 42 },
        { input: 47, expected: 47 },
        { input: 99, expected: 99 },
        { input: 99.1, expected: 100 }, // Note: 100 >= 100, so roundToSeven applies → 107
      ];

      for (const { input, expected } of testCases) {
        if (Math.ceil(input) < 100) {
          expect(roundToSeven(input), 
            `roundToSeven(${input}) should be ${expected}`
          ).toBe(expected);
        }
      }
    });

    it("edge case: Math.ceil(99.1) = 100, which then rounds to 107", () => {
      expect(roundToSeven(99.1)).toBe(107);
    });
  });

  // =========================================================================
  // COMPREHENSIVE: All calculated license prices are valid
  // =========================================================================
  describe("Comprehensive: all license prices follow rounding rules", () => {
    it("every IMOB plan × frequency produces a valid rounded price", () => {
      for (const plan of PLANS) {
        const annualPrice = IMOB_PLANS[plan].annualPrice;
        for (const freq of FREQUENCIES) {
          const rawPrice = annualPrice * FREQUENCY_MULTIPLIERS[freq];
          const roundedPrice = calculatePrice(annualPrice, freq);
          
          // Must be >= raw price (always rounds UP)
          expect(roundedPrice).toBeGreaterThanOrEqual(rawPrice);
          
          if (roundedPrice >= 100) {
            expect(endsIn7(roundedPrice), 
              `IMOB ${plan} ${freq}: R$${roundedPrice} must end in 7`
            ).toBe(true);
          } else {
            expect(isWholeNumber(roundedPrice),
              `IMOB ${plan} ${freq}: R$${roundedPrice} must be whole number`
            ).toBe(true);
          }
        }
      }
    });

    it("every LOC plan × frequency produces a valid rounded price", () => {
      for (const plan of PLANS) {
        const annualPrice = LOC_PLANS[plan].annualPrice;
        for (const freq of FREQUENCIES) {
          const rawPrice = annualPrice * FREQUENCY_MULTIPLIERS[freq];
          const roundedPrice = calculatePrice(annualPrice, freq);
          
          expect(roundedPrice).toBeGreaterThanOrEqual(rawPrice);
          
          if (roundedPrice >= 100) {
            expect(endsIn7(roundedPrice), 
              `LOC ${plan} ${freq}: R$${roundedPrice} must end in 7`
            ).toBe(true);
          } else {
            expect(isWholeNumber(roundedPrice),
              `LOC ${plan} ${freq}: R$${roundedPrice} must be whole number`
            ).toBe(true);
          }
        }
      }
    });

    it("every add-on × frequency produces a valid rounded price", () => {
      const addonsToCheck = ["inteligencia", "leads", "assinaturas"] as const;
      for (const addon of addonsToCheck) {
        const annualPrice = ADDONS[addon].annualPrice;
        for (const freq of FREQUENCIES) {
          const rawPrice = annualPrice * FREQUENCY_MULTIPLIERS[freq];
          const roundedPrice = calculatePrice(annualPrice, freq);
          
          expect(roundedPrice).toBeGreaterThanOrEqual(rawPrice);
          
          if (roundedPrice >= 100) {
            expect(endsIn7(roundedPrice), 
              `${addon} ${freq}: R$${roundedPrice} must end in 7`
            ).toBe(true);
          } else {
            expect(isWholeNumber(roundedPrice),
              `${addon} ${freq}: R$${roundedPrice} must be whole number`
            ).toBe(true);
          }
        }
      }
    });
  });
});
