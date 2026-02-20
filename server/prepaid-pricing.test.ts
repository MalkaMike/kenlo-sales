/**
 * Prepaid Pricing Verification Tests
 * Verifies that the dynamic prepaid pricing (10% discount on post-paid) is correctly
 * configured and that the calculation logic produces expected results.
 * 
 * NEW RULE (v3.0): Prepaid price = Post-paid price × 0.90 (10% discount)
 * This replaces the old flat-rate model (R$ 34/user, R$ 2.20/contract).
 */

import { describe, it, expect } from "vitest";
import pricingValues from "../shared/pricing-values.json";
import {
  PREPAID_PRICING,
  PREPAID_DISCOUNT_PERCENTAGE,
  PREPAID_DISCOUNT_MULTIPLIER,
  getPrepaidMonths,
  isPrepaidAvailable,
  calculatePrepaidUsers,
  calculatePrepaidContracts,
  calculatePrepaidUserPricePerUnit,
  calculatePrepaidContractPricePerUnit,
  FREQUENCY_INSTALLMENTS,
  IMOB_ADDITIONAL_USERS,
  LOC_ADDITIONAL_CONTRACTS,
  calculateTieredPrice,
} from "../shared/pricing-config";

describe("Prepaid Pricing Configuration", () => {
  describe("Discount Constants", () => {
    it("should have 10% discount percentage", () => {
      expect(PREPAID_DISCOUNT_PERCENTAGE).toBe(10);
    });

    it("should have 0.90 discount multiplier", () => {
      expect(PREPAID_DISCOUNT_MULTIPLIER).toBe(0.9);
    });

    it("should match pricing-values.json prepaid configuration", () => {
      const config = (pricingValues as any).prepaidPricing;
      expect(config).toBeDefined();
      expect(config.discountPercentage).toBe(10);
      expect(config.additionalUsers.pricingMethod).toBe("discount_on_postpaid");
      expect(config.additionalContracts.pricingMethod).toBe("discount_on_postpaid");
      expect(config.additionalLeads.pricingMethod).toBe("discount_on_postpaid");
    });

    it("PREPAID_PRICING should have correct structure", () => {
      expect(PREPAID_PRICING.discountPercentage).toBe(10);
      expect(PREPAID_PRICING.discountMultiplier).toBe(0.9);
      expect(PREPAID_PRICING.additionalUsers.product).toBe("imob");
      expect(PREPAID_PRICING.additionalContracts.product).toBe("locacao");
    });
  });

  describe("Prepaid Months by Frequency", () => {
    it("monthly frequency should NOT allow prepaid (0 months)", () => {
      expect(getPrepaidMonths("monthly")).toBe(0);
    });

    it("semestral frequency should NOT allow prepaid (0 months)", () => {
      expect(getPrepaidMonths("semiannual")).toBe(0);
    });

    it("annual frequency should prepay 12 months", () => {
      expect(getPrepaidMonths("annual")).toBe(12);
    });

    it("biennial frequency should prepay 24 months", () => {
      expect(getPrepaidMonths("biennial")).toBe(24);
    });
  });

  describe("Dynamic Prepaid Price Per Unit", () => {
    it("Prime user prepaid: R$ 57 × 0.90 = R$ 51.30/month", () => {
      // Prime has flat R$ 57 for all users
      const prepaidPrice = calculatePrepaidUserPricePerUnit("prime", 1);
      expect(prepaidPrice).toBeCloseTo(57 * 0.9, 2);
      expect(prepaidPrice).toBeCloseTo(51.3, 2);
    });

    it("K user prepaid tier 1: R$ 47 × 0.90 = R$ 42.30/month (1-5 users)", () => {
      const prepaidPrice = calculatePrepaidUserPricePerUnit("k", 3);
      expect(prepaidPrice).toBeCloseTo(47 * 0.9, 2);
      expect(prepaidPrice).toBeCloseTo(42.3, 2);
    });

    it("K user prepaid tier 2: R$ 37 × 0.90 = R$ 33.30/month (6+ users)", () => {
      // For 10 users on K: first 5 at R$ 47, next 5 at R$ 37
      // Average per user = (5*47 + 5*37) / 10 = 420/10 = R$ 42
      // Prepaid = R$ 42 × 0.90 = R$ 37.80
      const prepaidPrice = calculatePrepaidUserPricePerUnit("k", 10);
      const postPaidTotal = calculateTieredPrice(10, IMOB_ADDITIONAL_USERS.k);
      expect(prepaidPrice).toBeCloseTo((postPaidTotal / 10) * 0.9, 2);
    });

    it("K2 user prepaid tier 1: R$ 37 × 0.90 = R$ 33.30/month (1-10 users)", () => {
      const prepaidPrice = calculatePrepaidUserPricePerUnit("k2", 5);
      expect(prepaidPrice).toBeCloseTo(37 * 0.9, 2);
      expect(prepaidPrice).toBeCloseTo(33.3, 2);
    });

    it("Prime contract prepaid: R$ 3.00 × 0.90 = R$ 2.70/month", () => {
      const prepaidPrice = calculatePrepaidContractPricePerUnit("prime", 50);
      expect(prepaidPrice).toBeCloseTo(3.0 * 0.9, 2);
      expect(prepaidPrice).toBeCloseTo(2.7, 2);
    });

    it("K contract prepaid tier 2: blended rate × 0.90 (251+ contracts)", () => {
      const prepaidPrice = calculatePrepaidContractPricePerUnit("k", 300);
      const postPaidTotal = calculateTieredPrice(300, LOC_ADDITIONAL_CONTRACTS.k);
      expect(prepaidPrice).toBeCloseTo((postPaidTotal / 300) * 0.9, 2);
    });

    it("K2 contract prepaid tier 3: blended rate × 0.90 (501+ contracts)", () => {
      const prepaidPrice = calculatePrepaidContractPricePerUnit("k2", 600);
      const postPaidTotal = calculateTieredPrice(600, LOC_ADDITIONAL_CONTRACTS.k2);
      expect(prepaidPrice).toBeCloseTo((postPaidTotal / 600) * 0.9, 2);
    });
  });

  describe("Prepaid Total Calculation Scenarios", () => {
    it("10 additional users on Prime annual = tiered cost × 0.90 × 12", () => {
      const total = calculatePrepaidUsers("prime", 10, "annual");
      const postPaidMonthly = calculateTieredPrice(10, IMOB_ADDITIONAL_USERS.prime);
      expect(total).toBeCloseTo(postPaidMonthly * 0.9 * 12, 2);
      // Prime: 10 × R$ 57 = R$ 570/month post-paid
      // Prepaid: R$ 570 × 0.90 × 12 = R$ 6,156
      expect(total).toBeCloseTo(570 * 0.9 * 12, 2);
    });

    it("10 additional users on K biennial = tiered cost × 0.90 × 24", () => {
      const total = calculatePrepaidUsers("k", 10, "biennial");
      const postPaidMonthly = calculateTieredPrice(10, IMOB_ADDITIONAL_USERS.k);
      expect(total).toBeCloseTo(postPaidMonthly * 0.9 * 24, 2);
    });

    it("50 additional contracts on Prime annual = tiered cost × 0.90 × 12", () => {
      const total = calculatePrepaidContracts("prime", 50, "annual");
      const postPaidMonthly = calculateTieredPrice(50, LOC_ADDITIONAL_CONTRACTS.prime);
      expect(total).toBeCloseTo(postPaidMonthly * 0.9 * 12, 2);
      // Prime: 50 × R$ 3.00 = R$ 150/month post-paid
      // Prepaid: R$ 150 × 0.90 × 12 = R$ 1,620
      expect(total).toBeCloseTo(150 * 0.9 * 12, 2);
    });

    it("100 additional contracts on K2 biennial = tiered cost × 0.90 × 24", () => {
      const total = calculatePrepaidContracts("k2", 100, "biennial");
      const postPaidMonthly = calculateTieredPrice(100, LOC_ADDITIONAL_CONTRACTS.k2);
      expect(total).toBeCloseTo(postPaidMonthly * 0.9 * 24, 2);
    });

    it("0 additional users/contracts should result in R$ 0 prepayment", () => {
      expect(calculatePrepaidUsers("prime", 0, "annual")).toBe(0);
      expect(calculatePrepaidContracts("prime", 0, "annual")).toBe(0);
    });

    it("monthly/semestral should result in R$ 0 regardless of quantity", () => {
      expect(calculatePrepaidUsers("prime", 100, "monthly")).toBe(0);
      expect(calculatePrepaidContracts("prime", 100, "semiannual")).toBe(0);
    });
  });

  describe("Payment Installment Rules", () => {
    it("should have correct installment rules from FREQUENCY_INSTALLMENTS", () => {
      expect(FREQUENCY_INSTALLMENTS.semiannual).toBe(2);
      expect(FREQUENCY_INSTALLMENTS.annual).toBe(3);
      expect(FREQUENCY_INSTALLMENTS.biennial).toBe(6);
    });
  });

  describe("Prepaid Discount is Always 10%", () => {
    it("discount is consistent across all plans for users", () => {
      const primePrepaid = calculatePrepaidUserPricePerUnit("prime", 5);
      const primePostPaid = calculateTieredPrice(5, IMOB_ADDITIONAL_USERS.prime) / 5;
      expect(primePrepaid / primePostPaid).toBeCloseTo(0.9, 4);

      const kPrepaid = calculatePrepaidUserPricePerUnit("k", 5);
      const kPostPaid = calculateTieredPrice(5, IMOB_ADDITIONAL_USERS.k) / 5;
      expect(kPrepaid / kPostPaid).toBeCloseTo(0.9, 4);

      const k2Prepaid = calculatePrepaidUserPricePerUnit("k2", 5);
      const k2PostPaid = calculateTieredPrice(5, IMOB_ADDITIONAL_USERS.k2) / 5;
      expect(k2Prepaid / k2PostPaid).toBeCloseTo(0.9, 4);
    });

    it("discount is consistent across all plans for contracts", () => {
      const primePrepaid = calculatePrepaidContractPricePerUnit("prime", 50);
      const primePostPaid = calculateTieredPrice(50, LOC_ADDITIONAL_CONTRACTS.prime) / 50;
      expect(primePrepaid / primePostPaid).toBeCloseTo(0.9, 4);

      const kPrepaid = calculatePrepaidContractPricePerUnit("k", 50);
      const kPostPaid = calculateTieredPrice(50, LOC_ADDITIONAL_CONTRACTS.k) / 50;
      expect(kPrepaid / kPostPaid).toBeCloseTo(0.9, 4);

      const k2Prepaid = calculatePrepaidContractPricePerUnit("k2", 50);
      const k2PostPaid = calculateTieredPrice(50, LOC_ADDITIONAL_CONTRACTS.k2) / 50;
      expect(k2Prepaid / k2PostPaid).toBeCloseTo(0.9, 4);
    });
  });

  describe("isPrepaidAvailable", () => {
    it("should return true for annual and biennial", () => {
      expect(isPrepaidAvailable("annual")).toBe(true);
      expect(isPrepaidAvailable("biennial")).toBe(true);
    });

    it("should return false for monthly and semiannual", () => {
      expect(isPrepaidAvailable("monthly")).toBe(false);
      expect(isPrepaidAvailable("semiannual")).toBe(false);
    });
  });
});
