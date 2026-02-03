import { describe, it, expect } from 'vitest';

/**
 * Test suite for Core Gestão Premium Services Rule
 * 
 * Rule: When a customer has IMOB + LOC (any plan combination), 
 * Premium Services (VIP Support + Dedicated CS) are automatically included at no extra cost.
 */

describe('Core Gestão Premium Services Rule', () => {
  // Helper function to simulate the premium services logic
  const checkPremiumServicesIncluded = (
    product: 'imob' | 'loc' | 'both',
    imobPlan?: 'prime' | 'k' | 'k2',
    locPlan?: 'prime' | 'k' | 'k2'
  ) => {
    const results = {
      imobVipSupport: false,
      imobDedicatedCS: false,
      locVipSupport: false,
      locDedicatedCS: false,
    };

    // IMOB VIP Support
    if (product === 'imob' || product === 'both') {
      const isIncludedByPlan = imobPlan === 'k' || imobPlan === 'k2';
      const isIncludedByCoreGestao = product === 'both';
      results.imobVipSupport = isIncludedByPlan || isIncludedByCoreGestao;
    }

    // IMOB Dedicated CS
    if (product === 'imob' || product === 'both') {
      const isIncludedByPlan = imobPlan === 'k2';
      const isIncludedByCoreGestao = product === 'both';
      results.imobDedicatedCS = isIncludedByPlan || isIncludedByCoreGestao;
    }

    // LOC VIP Support
    if (product === 'loc' || product === 'both') {
      const isIncludedByPlan = locPlan === 'k' || locPlan === 'k2';
      const isIncludedByCoreGestao = product === 'both';
      results.locVipSupport = isIncludedByPlan || isIncludedByCoreGestao;
    }

    // LOC Dedicated CS
    if (product === 'loc' || product === 'both') {
      const isIncludedByPlan = locPlan === 'k2';
      const isIncludedByCoreGestao = product === 'both';
      results.locDedicatedCS = isIncludedByPlan || isIncludedByCoreGestao;
    }

    return results;
  };

  describe('Core Gestão (IMOB + LOC) - All Premium Services Included', () => {
    it('should include all premium services for Prime + Prime', () => {
      const result = checkPremiumServicesIncluded('both', 'prime', 'prime');
      expect(result.imobVipSupport).toBe(true);
      expect(result.imobDedicatedCS).toBe(true);
      expect(result.locVipSupport).toBe(true);
      expect(result.locDedicatedCS).toBe(true);
    });

    it('should include all premium services for K + K', () => {
      const result = checkPremiumServicesIncluded('both', 'k', 'k');
      expect(result.imobVipSupport).toBe(true);
      expect(result.imobDedicatedCS).toBe(true);
      expect(result.locVipSupport).toBe(true);
      expect(result.locDedicatedCS).toBe(true);
    });

    it('should include all premium services for K2 + K2', () => {
      const result = checkPremiumServicesIncluded('both', 'k2', 'k2');
      expect(result.imobVipSupport).toBe(true);
      expect(result.imobDedicatedCS).toBe(true);
      expect(result.locVipSupport).toBe(true);
      expect(result.locDedicatedCS).toBe(true);
    });

    it('should include all premium services for Prime + K', () => {
      const result = checkPremiumServicesIncluded('both', 'prime', 'k');
      expect(result.imobVipSupport).toBe(true);
      expect(result.imobDedicatedCS).toBe(true);
      expect(result.locVipSupport).toBe(true);
      expect(result.locDedicatedCS).toBe(true);
    });

    it('should include all premium services for K + Prime', () => {
      const result = checkPremiumServicesIncluded('both', 'k', 'prime');
      expect(result.imobVipSupport).toBe(true);
      expect(result.imobDedicatedCS).toBe(true);
      expect(result.locVipSupport).toBe(true);
      expect(result.locDedicatedCS).toBe(true);
    });

    it('should include all premium services for K2 + Prime', () => {
      const result = checkPremiumServicesIncluded('both', 'k2', 'prime');
      expect(result.imobVipSupport).toBe(true);
      expect(result.imobDedicatedCS).toBe(true);
      expect(result.locVipSupport).toBe(true);
      expect(result.locDedicatedCS).toBe(true);
    });
  });

  describe('IMOB Only - Premium Services by Plan', () => {
    it('should NOT include premium services for IMOB Prime only', () => {
      const result = checkPremiumServicesIncluded('imob', 'prime');
      expect(result.imobVipSupport).toBe(false);
      expect(result.imobDedicatedCS).toBe(false);
    });

    it('should include VIP Support for IMOB K only', () => {
      const result = checkPremiumServicesIncluded('imob', 'k');
      expect(result.imobVipSupport).toBe(true);
      expect(result.imobDedicatedCS).toBe(false);
    });

    it('should include both premium services for IMOB K2 only', () => {
      const result = checkPremiumServicesIncluded('imob', 'k2');
      expect(result.imobVipSupport).toBe(true);
      expect(result.imobDedicatedCS).toBe(true);
    });
  });

  describe('LOC Only - Premium Services by Plan', () => {
    it('should NOT include premium services for LOC Prime only', () => {
      const result = checkPremiumServicesIncluded('loc', undefined, 'prime');
      expect(result.locVipSupport).toBe(false);
      expect(result.locDedicatedCS).toBe(false);
    });

    it('should include VIP Support for LOC K only', () => {
      const result = checkPremiumServicesIncluded('loc', undefined, 'k');
      expect(result.locVipSupport).toBe(true);
      expect(result.locDedicatedCS).toBe(false);
    });

    it('should include both premium services for LOC K2 only', () => {
      const result = checkPremiumServicesIncluded('loc', undefined, 'k2');
      expect(result.locVipSupport).toBe(true);
      expect(result.locDedicatedCS).toBe(true);
    });
  });
});
