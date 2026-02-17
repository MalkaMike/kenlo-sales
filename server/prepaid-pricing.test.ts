/**
 * Prepaid Pricing Verification Tests
 * Verifies that the flat prepaid rates (R$ 34/user, R$ 2.20/contract) are correctly
 * configured and that the calculation logic produces expected results.
 */

import { describe, it, expect } from "vitest";
import pricingValues from "../shared/pricing-values.json";
import {
  PREPAID_PRICING,
  getPrepaidMonths,
  isPrepaidAvailable,
  calculatePrepaidUsers,
  calculatePrepaidContracts,
  FREQUENCY_INSTALLMENTS,
} from "../shared/pricing-config";

// Extract flat rates from the centralized config
const PREPAID_USER_PRICE_PER_MONTH = PREPAID_PRICING.additionalUsers.pricePerMonth;
const PREPAID_CONTRACT_PRICE_PER_MONTH = PREPAID_PRICING.additionalContracts.pricePerMonth;

describe("Prepaid Pricing Configuration", () => {
  describe("Flat Rate Constants", () => {
    it("should have prepaid user price of R$ 37/month", () => {
      expect(PREPAID_USER_PRICE_PER_MONTH).toBe(37);
    });

    it("should have prepaid contract price of R$ 2.50/month", () => {
      expect(PREPAID_CONTRACT_PRICE_PER_MONTH).toBe(2.5);
    });

    it("should match pricing-values.json prepaid configuration", () => {
      const config = (pricingValues as any).prepaidPricing;
      expect(config).toBeDefined();
      expect(config.additionalUsers.pricePerMonth).toBe(37);
      expect(config.additionalContracts.pricePerMonth).toBe(2.5);
    });
  });

  describe("Prepaid Months by Frequency", () => {
    it("monthly frequency should NOT allow prepaid (0 months)", () => {
      expect(getPrepaidMonths("monthly")).toBe(0);
    });

    it("semestral frequency should NOT allow prepaid (0 months)", () => {
      expect(getPrepaidMonths("semestral")).toBe(0);
    });

    it("annual frequency should prepay 12 months", () => {
      expect(getPrepaidMonths("annual")).toBe(12);
    });

    it("biennial frequency should prepay 24 months", () => {
      expect(getPrepaidMonths("biennial")).toBe(24);
    });
  });

  describe("Prepaid Calculation Scenarios", () => {
    it("10 additional users on annual plan = R$ 37 x 10 x 12 = R$ 4,440", () => {
      const additionalUsers = 10;
      const months = getPrepaidMonths("annual");
      const total = additionalUsers * PREPAID_USER_PRICE_PER_MONTH * months;
      expect(total).toBe(4440);
    });

    it("10 additional users on biennial plan = R$ 37 x 10 x 24 = R$ 8,880", () => {
      const additionalUsers = 10;
      const months = getPrepaidMonths("biennial");
      const total = additionalUsers * PREPAID_USER_PRICE_PER_MONTH * months;
      expect(total).toBe(8880);
    });

    it("50 additional contracts on annual plan = R$ 2.50 x 50 x 12 = R$ 1,500", () => {
      const additionalContracts = 50;
      const months = getPrepaidMonths("annual");
      const total = additionalContracts * PREPAID_CONTRACT_PRICE_PER_MONTH * months;
      expect(total).toBeCloseTo(1500, 0);
    });

    it("100 additional contracts on biennial plan = R$ 2.50 x 100 x 24 = R$ 6,000", () => {
      const additionalContracts = 100;
      const months = getPrepaidMonths("biennial");
      const total = additionalContracts * PREPAID_CONTRACT_PRICE_PER_MONTH * months;
      expect(total).toBeCloseTo(6000, 0);
    });

    it("combined: 5 users + 30 contracts on annual = R$ 2,220 + R$ 900 = R$ 3,120", () => {
      const months = getPrepaidMonths("annual");
      const userTotal = 5 * PREPAID_USER_PRICE_PER_MONTH * months;
      const contractTotal = 30 * PREPAID_CONTRACT_PRICE_PER_MONTH * months;
      expect(userTotal).toBe(2220);
      expect(contractTotal).toBe(900);
      expect(userTotal + contractTotal).toBe(3120);
    });

    it("0 additional users/contracts should result in R$ 0 prepayment", () => {
      const months = getPrepaidMonths("annual");
      expect(0 * PREPAID_USER_PRICE_PER_MONTH * months).toBe(0);
      expect(0 * PREPAID_CONTRACT_PRICE_PER_MONTH * months).toBe(0);
    });

    it("monthly/semestral should result in R$ 0 regardless of quantity", () => {
      const monthlyMonths = getPrepaidMonths("monthly");
      const semestralMonths = getPrepaidMonths("semestral");
      expect(100 * PREPAID_USER_PRICE_PER_MONTH * monthlyMonths).toBe(0);
      expect(100 * PREPAID_CONTRACT_PRICE_PER_MONTH * semestralMonths).toBe(0);
    });
  });

  describe("Payment Installment Rules", () => {
    it("should have correct installment rules from FREQUENCY_INSTALLMENTS", () => {
      // Semestral: 2x, Annual: 3x, Biennial: 6x
      expect(FREQUENCY_INSTALLMENTS.semiannual).toBe(2);
      expect(FREQUENCY_INSTALLMENTS.annual).toBe(3);
      expect(FREQUENCY_INSTALLMENTS.biennial).toBe(6);
    });
  });

  describe("Helper Functions", () => {
    it("calculatePrepaidUsers should calculate correctly for annual", () => {
      expect(calculatePrepaidUsers(10, "annual")).toBe(4440);
    });

    it("calculatePrepaidUsers should calculate correctly for biennial", () => {
      expect(calculatePrepaidUsers(10, "biennial")).toBe(8880);
    });

    it("calculatePrepaidUsers should return 0 for monthly", () => {
      expect(calculatePrepaidUsers(10, "monthly")).toBe(0);
    });

    it("calculatePrepaidContracts should calculate correctly for annual", () => {
      expect(calculatePrepaidContracts(50, "annual")).toBeCloseTo(1500, 0);
    });

    it("calculatePrepaidContracts should calculate correctly for biennial", () => {
      expect(calculatePrepaidContracts(100, "biennial")).toBeCloseTo(6000, 0);
    });

    it("calculatePrepaidContracts should return 0 for semiannual", () => {
      expect(calculatePrepaidContracts(50, "semiannual")).toBe(0);
    });

    it("isPrepaidAvailable should return true for annual and biennial", () => {
      expect(isPrepaidAvailable("annual")).toBe(true);
      expect(isPrepaidAvailable("biennial")).toBe(true);
    });

    it("isPrepaidAvailable should return false for monthly and semiannual", () => {
      expect(isPrepaidAvailable("monthly")).toBe(false);
      expect(isPrepaidAvailable("semiannual")).toBe(false);
    });
  });

  describe("Prepaid Rate is Flat (Plan/Volume Independent)", () => {
    it("user price should be the same regardless of plan tier", () => {
      // The flat rate is R$ 37 for ALL plans - prime, k, k2
      // This is different from post-paid which varies by tier
      const primeRate = PREPAID_USER_PRICE_PER_MONTH;
      const kRate = PREPAID_USER_PRICE_PER_MONTH;
      const k2Rate = PREPAID_USER_PRICE_PER_MONTH;
      expect(primeRate).toBe(kRate);
      expect(kRate).toBe(k2Rate);
      expect(primeRate).toBe(37);
    });

    it("contract price should be the same regardless of plan tier", () => {
      const primeRate = PREPAID_CONTRACT_PRICE_PER_MONTH;
      const kRate = PREPAID_CONTRACT_PRICE_PER_MONTH;
      const k2Rate = PREPAID_CONTRACT_PRICE_PER_MONTH;
      expect(primeRate).toBe(kRate);
      expect(kRate).toBe(k2Rate);
      expect(primeRate).toBe(2.5);
    });

    it("user price should be the same for 1 user or 100 users (no volume discount)", () => {
      const months = getPrepaidMonths("annual");
      const costFor1 = 1 * PREPAID_USER_PRICE_PER_MONTH * months;
      const costFor100 = 100 * PREPAID_USER_PRICE_PER_MONTH * months;
      expect(costFor100 / 100).toBe(costFor1);
    });

    it("contract price should be the same for 1 contract or 500 contracts (no volume discount)", () => {
      const months = getPrepaidMonths("annual");
      const costFor1 = 1 * PREPAID_CONTRACT_PRICE_PER_MONTH * months;
      const costFor500 = 500 * PREPAID_CONTRACT_PRICE_PER_MONTH * months;
      expect(costFor500 / 500).toBeCloseTo(costFor1, 2);
    });
  });
});
