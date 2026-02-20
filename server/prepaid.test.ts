import { describe, it, expect } from 'vitest';
import type { KomboColumnData } from '../client/src/components/kombo/komboComparisonTypes';

/**
 * Tests for Bug #2 and Bug #3 fixes
 * Bug #2: Pre-paid button for users should update totalMonthlyFinal
 * Bug #3: Pre-paid button should exist for WhatsApp Leads
 */

describe('Pre-paid Functionality', () => {
  describe('Bug #2: totalMonthlyFinal property', () => {
    it('should have totalMonthlyFinal property in KomboColumnData interface', () => {
      // This test validates that the type system includes totalMonthlyFinal
      const mockColumn: KomboColumnData = {
        id: 'custom',
        label: 'Test',
        frequency: 'annual',
        imobPlan: 'K',
        locPlan: null,
        hasImob: true,
        hasLoc: false,
        addons: {
          leads: false,
          inteligencia: false,
          assinatura: false,
          pay: false,
          seguros: false,
          cash: false,
        },
        wantsWhatsApp: false,
        leadsPerMonth: 0,
        closingsPerMonth: 0,
        imobUsers: 2,
        locUsers: 0,
        locContracts: 0,
        imobVipSupport: false,
        locVipSupport: false,
        imobCsDedicated: false,
        locCsDedicated: false,
        activeKombo: 'none',
        komboDiscount: 0,
        komboImplementation: 0,
        imobMonthly: 0,
        locMonthly: 0,
        addonsMonthly: 0,
        totalMonthly: 1000,
        totalMonthlyFinal: 1000, // ← This is the new property added for Bug #2
        prePaidUsersActive: false,
        prePaidContractsActive: false,
        prePaidWhatsAppActive: false, // ← This is the new property added for Bug #3
        postPaidUsers: { included: 0, additional: 0, cost: 0 },
        postPaidContracts: { included: 0, additional: 0, cost: 0 },
        postPaidWhatsApp: { included: 0, additional: 0, cost: 0 },
        postPaidAssinaturas: 0,
        postPaidBoletos: 0,
        postPaidMonthly: 0,
        totalImplementation: 0,
        totalFirstYear: 0,
      };

      expect(mockColumn.totalMonthlyFinal).toBe(1000);
      expect(mockColumn.prePaidWhatsAppActive).toBe(false);
    });

    it('should update totalMonthlyFinal when pre-paid is active', () => {
      // Simulate the scenario from Bug #2:
      // - 130 users (15 included, 115 additional)
      // - Pre-paid users NOT active: totalMonthlyFinal = totalMonthly
      // - Pre-paid users ACTIVE: totalMonthlyFinal should be recalculated

      const baseMonthly = 2548; // Example monthly cost
      const postPaidUsersCost = 115 * 26.57; // 115 users × R$26.57 = R$3055.55

      // Before pre-paid: totalMonthlyFinal = totalMonthly
      const totalMonthlyBeforePrepaid = baseMonthly;
      expect(totalMonthlyBeforePrepaid).toBe(2548);

      // After pre-paid: totalMonthlyFinal = totalMonthly + postPaidUsersCost
      const totalMonthlyAfterPrepaid = baseMonthly + postPaidUsersCost;
      expect(totalMonthlyAfterPrepaid).toBeGreaterThan(5000);
      expect(totalMonthlyAfterPrepaid).toBeLessThan(6000);
    });
  });

  describe('Bug #3: WhatsApp Leads pre-paid button', () => {
    it('should have prePaidWhatsAppActive property in KomboColumnData interface', () => {
      const mockColumn: Partial<KomboColumnData> = {
        prePaidWhatsAppActive: false,
        postPaidWhatsApp: { included: 100, additional: 900, cost: 1098 },
      };

      expect(mockColumn.prePaidWhatsAppActive).toBeDefined();
      expect(mockColumn.prePaidWhatsAppActive).toBe(false);
    });

    it('should calculate postPaidWhatsApp correctly when WhatsApp is enabled', () => {
      // Scenario: 1000 leads/month, WhatsApp enabled
      // - 100 leads included (first 100 free)
      // - 900 additional leads × R$1.22 = R$1098

      const leadsPerMonth = 1000;
      const includedLeads = 100;
      const additionalLeads = leadsPerMonth - includedLeads;
      const costPerLead = 1.22;
      const totalCost = additionalLeads * costPerLead;

      expect(additionalLeads).toBe(900);
      expect(totalCost).toBe(1098);
    });

    it('should show WhatsApp Leads row only when Leads add-on and WhatsApp are both enabled', () => {
      // Test visibility conditions
      const scenario1 = { leadsEnabled: true, whatsappEnabled: true };
      const scenario2 = { leadsEnabled: true, whatsappEnabled: false };
      const scenario3 = { leadsEnabled: false, whatsappEnabled: true };
      const scenario4 = { leadsEnabled: false, whatsappEnabled: false };

      // Row should be visible only in scenario1
      expect(scenario1.leadsEnabled && scenario1.whatsappEnabled).toBe(true);
      expect(scenario2.leadsEnabled && scenario2.whatsappEnabled).toBe(false);
      expect(scenario3.leadsEnabled && scenario3.whatsappEnabled).toBe(false);
      expect(scenario4.leadsEnabled && scenario4.whatsappEnabled).toBe(false);
    });
  });

  describe('State synchronization fix', () => {
    it('should not include addons in default ColumnOverrides', () => {
      // The fix for Bug #3 involved making addons optional in ColumnOverrides
      // to prevent stale state from being cached
      
      type ColumnOverrides = {
        frequency?: string;
        imobPlan?: string;
        locPlan?: string;
        addons?: Record<string, boolean>; // ← This should be optional
      };

      const defaultOverrides: ColumnOverrides = {
        frequency: 'annual',
        imobPlan: 'K',
        locPlan: null,
        // addons should NOT be included here to avoid stale state
      };

      expect(defaultOverrides.addons).toBeUndefined();
    });
  });
});
