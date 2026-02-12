/**
 * Unit tests for centralized pricing configuration
 * Validates all pricing rules from MMPlanosH2-2025_2026Final.pdf
 */

import { describe, it, expect } from 'vitest';
import {
  FREQUENCY_MULTIPLIERS,
  IMOB_PLANS,
  LOC_PLANS,
  ADDONS,
  PREMIUM_SERVICES,
  KOMBOS,
  roundToSeven,
  calculatePrice,
  calculateTieredPrice,
  detectKombo,
  shouldIncludePremiumService,
} from '@shared/pricing-config';

describe('Pricing Configuration', () => {
  describe('Payment Frequency Multipliers', () => {
    it('should have correct multipliers for all frequencies', () => {
      expect(FREQUENCY_MULTIPLIERS.monthly).toBe(1.25);
      expect(FREQUENCY_MULTIPLIERS.semiannual).toBeCloseTo(1.125, 3);
      expect(FREQUENCY_MULTIPLIERS.annual).toBe(1.0);
      expect(FREQUENCY_MULTIPLIERS.biennial).toBe(0.875); // ⚠️ UPDATED: Anual × (1-12.5%) = 30% OFF vs mensal
    });
  });

  describe('IMOB Plans', () => {
    it('should have correct annual prices', () => {
      expect(IMOB_PLANS.prime.annualPrice).toBe(247);
      expect(IMOB_PLANS.k.annualPrice).toBe(497);
      expect(IMOB_PLANS.k2.annualPrice).toBe(1197);
    });

    it('should have correct included users', () => {
      expect(IMOB_PLANS.prime.includedUsers).toBe(2);
      expect(IMOB_PLANS.k.includedUsers).toBe(7);
      expect(IMOB_PLANS.k2.includedUsers).toBe(15);
    });
  });

  describe('LOC Plans', () => {
    it('should have correct annual prices', () => {
      expect(LOC_PLANS.prime.annualPrice).toBe(247);
      expect(LOC_PLANS.k.annualPrice).toBe(497);
      expect(LOC_PLANS.k2.annualPrice).toBe(1197);
    });

    it('should have correct included contracts', () => {
      expect(LOC_PLANS.prime.includedContracts).toBe(100);
      expect(LOC_PLANS.k.includedContracts).toBe(150);
      expect(LOC_PLANS.k2.includedContracts).toBe(500);
    });
  });

  describe('Add-ons', () => {
    it('should have correct annual prices', () => {
      expect(ADDONS.leads.annualPrice).toBe(497);
      expect(ADDONS.inteligencia.annualPrice).toBe(297);
      expect(ADDONS.assinaturas.annualPrice).toBe(37);
    });

    it('should have correct implementation costs', () => {
      expect(ADDONS.leads.implementation).toBe(497);
      expect(ADDONS.inteligencia.implementation).toBe(497);
      expect(ADDONS.assinaturas.implementation).toBe(0);
    });
  });

  describe('Premium Services', () => {
    it('should have correct monthly prices', () => {
      expect(PREMIUM_SERVICES.vipSupport.monthlyPrice).toBe(97);
      expect(PREMIUM_SERVICES.csDedicado.monthlyPrice).toBe(297); // ⚠️ UPDATED from 197
    });

    it('should have correct inclusion rules for VIP Support', () => {
      expect(PREMIUM_SERVICES.vipSupport.includedIn.prime).toBe(false);
      expect(PREMIUM_SERVICES.vipSupport.includedIn.k).toBe(true); // ⚠️ NEW
      expect(PREMIUM_SERVICES.vipSupport.includedIn.k2).toBe(true); // ⚠️ NEW
    });

    it('should have correct inclusion rules for CS Dedicado', () => {
      expect(PREMIUM_SERVICES.csDedicado.includedIn.prime).toBe(false);
      expect(PREMIUM_SERVICES.csDedicado.includedIn.k).toBe(false);
      expect(PREMIUM_SERVICES.csDedicado.includedIn.k2).toBe(true); // ⚠️ NEW
    });
  });

  describe('Kombos', () => {
    it('should have correct discounts', () => {
      expect(KOMBOS['imob-start'].monthlyDiscount).toBe(0.10);
      expect(KOMBOS['imob-pro'].monthlyDiscount).toBe(0.15);
      expect(KOMBOS['loc-pro'].monthlyDiscount).toBe(0.10);
      expect(KOMBOS['core-gestao'].monthlyDiscount).toBe(0);
      expect(KOMBOS.elite.monthlyDiscount).toBe(0.20);
    });

    it('should have correct implementation costs', () => {
      expect(KOMBOS['imob-start'].implementation).toBe(1497);
      expect(KOMBOS['imob-pro'].implementation).toBe(1497);
      expect(KOMBOS['loc-pro'].implementation).toBe(1497);
      expect(KOMBOS['core-gestao'].implementation).toBe(1497);
      expect(KOMBOS.elite.implementation).toBe(1497);
    });

    it('should include Premium Services in ALL 5 Kombos', () => {
      // ⚠️ NEW: All Kombos now include Premium Services
      expect(KOMBOS['imob-start'].premiumServicesIncluded).toBe(true);
      expect(KOMBOS['imob-pro'].premiumServicesIncluded).toBe(true);
      expect(KOMBOS['loc-pro'].premiumServicesIncluded).toBe(true);
      expect(KOMBOS['core-gestao'].premiumServicesIncluded).toBe(true);
      expect(KOMBOS.elite.premiumServicesIncluded).toBe(true);
    });
  });

  describe('roundToSeven', () => {
    it('should round prices to end in 7', () => {
      expect(roundToSeven(490)).toBe(497);
      expect(roundToSeven(495)).toBe(497);
      expect(roundToSeven(497)).toBe(497);
      expect(roundToSeven(502)).toBe(507);
      expect(roundToSeven(507)).toBe(507);
    });

    it('should handle small prices correctly', () => {
      expect(roundToSeven(37)).toBe(37);
      expect(roundToSeven(40)).toBe(47);
    });
  });

  describe('calculatePrice', () => {
    it('should calculate monthly price correctly', () => {
      const annual = 247;
      const monthly = calculatePrice(annual, 'monthly');
      expect(monthly).toBeGreaterThan(annual); // Should be more expensive
      expect(monthly).toBe(roundToSeven(annual * 1.25));
    });

    it('should calculate biennial price correctly with new 25% discount', () => {
      const annual = 247;
      const biennial = calculatePrice(annual, 'biennial');
      expect(biennial).toBeLessThan(annual); // Should be cheaper
      expect(biennial).toBe(roundToSeven(annual * 0.875)); // ⚠️ NEW: 30% discount vs mensal
    });
  });

  describe('calculateTieredPrice', () => {
    it('should calculate tiered pricing for IMOB Prime additional users', () => {
      // Prime: R$57 per user (flat rate)
      const tiers = [{ from: 1, to: Infinity, price: 57 }];
      expect(calculateTieredPrice(1, tiers)).toBe(57);
      expect(calculateTieredPrice(5, tiers)).toBe(285);
      expect(calculateTieredPrice(10, tiers)).toBe(570);
    });

    it('should calculate tiered pricing for IMOB K additional users', () => {
      // K: 1-5 = R$47, 6+ = R$37
      const tiers = [
        { from: 1, to: 5, price: 47 },
        { from: 6, to: Infinity, price: 37 },
      ];
      expect(calculateTieredPrice(3, tiers)).toBe(141); // 3 * 47
      expect(calculateTieredPrice(5, tiers)).toBe(235); // 5 * 47
      expect(calculateTieredPrice(7, tiers)).toBe(309); // (5 * 47) + (2 * 37)
      expect(calculateTieredPrice(10, tiers)).toBe(420); // (5 * 47) + (5 * 37)
    });

    it('should calculate tiered pricing for IMOB K2 additional users', () => {
      // K2: 1-10 = R$37, 11-100 = R$27, 101+ = R$17
      const tiers = [
        { from: 1, to: 10, price: 37 },
        { from: 11, to: 100, price: 27 },
        { from: 101, to: Infinity, price: 17 },
      ];
      expect(calculateTieredPrice(5, tiers)).toBe(185); // 5 * 37
      expect(calculateTieredPrice(10, tiers)).toBe(370); // 10 * 37
      expect(calculateTieredPrice(15, tiers)).toBe(505); // (10 * 37) + (5 * 27)
      expect(calculateTieredPrice(100, tiers)).toBe(2800); // (10 * 37) + (90 * 27)
      expect(calculateTieredPrice(105, tiers)).toBe(2885); // (10 * 37) + (90 * 27) + (5 * 17)
    });
  });

  describe('detectKombo', () => {
    it('should detect Elite Kombo', () => {
      const selection = {
        imob: true,
        loc: true,
        leads: true,
        inteligencia: true,
        assinaturas: true,
      };
      expect(detectKombo(selection)).toBe('elite');
    });

    it('should detect Core Gestão Kombo', () => {
      const selection = {
        imob: true,
        loc: true,
        leads: false,
        inteligencia: false,
        assinaturas: false,
      };
      expect(detectKombo(selection)).toBe('core-gestao');
    });

    it('should detect Imob Pro Kombo', () => {
      const selection = {
        imob: true,
        loc: false,
        leads: true,
        inteligencia: true,
        assinaturas: true,
      };
      expect(detectKombo(selection)).toBe('imob-pro');
    });

    it('should detect Imob Start Kombo', () => {
      const selection = {
        imob: true,
        loc: false,
        leads: true,
        inteligencia: false,
        assinaturas: true,
      };
      expect(detectKombo(selection)).toBe('imob-start');
    });

    it('should detect Locação Pro Kombo', () => {
      const selection = {
        imob: false,
        loc: true,
        leads: false,
        inteligencia: true,
        assinaturas: true,
      };
      expect(detectKombo(selection)).toBe('loc-pro');
    });

    it('should return none for non-Kombo selections', () => {
      const selection = {
        imob: true,
        loc: false,
        leads: false,
        inteligencia: false,
        assinaturas: false,
      };
      expect(detectKombo(selection)).toBe('none');
    });
  });

  describe('shouldIncludePremiumService', () => {
    it('should include VIP Support for K plan', () => {
      expect(shouldIncludePremiumService('vipSupport', 'k', null, 'none')).toBe(true);
    });

    it('should include VIP Support for K2 plan', () => {
      expect(shouldIncludePremiumService('vipSupport', 'k2', null, 'none')).toBe(true);
    });

    it('should NOT include VIP Support for Prime plan without Kombo', () => {
      expect(shouldIncludePremiumService('vipSupport', 'prime', null, 'none')).toBe(false);
    });

    it('should include CS Dedicado for K2 plan', () => {
      expect(shouldIncludePremiumService('csDedicado', 'k2', null, 'none')).toBe(true);
    });

    it('should NOT include CS Dedicado for K plan', () => {
      expect(shouldIncludePremiumService('csDedicado', 'k', null, 'none')).toBe(false);
    });

    it('should include both services for ALL Kombos', () => {
      const kombos: Array<'imob-start' | 'imob-pro' | 'loc-pro' | 'core-gestao' | 'elite'> = [
        'imob-start',
        'imob-pro',
        'loc-pro',
        'core-gestao',
        'elite',
      ];

      kombos.forEach((kombo) => {
        expect(shouldIncludePremiumService('vipSupport', 'prime', null, kombo)).toBe(true);
        expect(shouldIncludePremiumService('csDedicado', 'prime', null, kombo)).toBe(true);
      });
    });

    it('should apply cross-product benefit rule', () => {
      // If IMOB has K, LOC Prime should also get VIP Support
      expect(shouldIncludePremiumService('vipSupport', 'k', 'prime', 'none')).toBe(true);
      
      // If LOC has K2, IMOB Prime should also get CS Dedicado
      expect(shouldIncludePremiumService('csDedicado', 'prime', 'k2', 'none')).toBe(true);
    });
  });
});
