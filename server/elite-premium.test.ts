import { describe, it, expect } from 'vitest';

/**
 * Tests for Kombo Elite Premium Services Rule
 * 
 * Rule: When a client has Kombo Elite (IMOB + LOC + ALL add-ons), 
 * Premium Services (VIP Support + Dedicated CS) are automatically included at no additional cost.
 */

describe('Kombo Elite - Premium Services Included', () => {
  /**
   * Helper function to check if Elite Kombo is active
   */
  function isEliteKombo(
    product: 'imob' | 'loc' | 'both',
    addons: {
      leads: boolean;
      inteligencia: boolean;
      assinatura: boolean;
      pay: boolean;
      seguros: boolean;
      cash: boolean;
    }
  ): boolean {
    // Elite requires IMOB + LOC + ALL add-ons
    if (product !== 'both') return false;
    
    // All add-ons must be enabled
    return (
      addons.leads &&
      addons.inteligencia &&
      addons.assinatura &&
      addons.pay &&
      addons.seguros &&
      addons.cash
    );
  }

  /**
   * Helper function to check if VIP Support is included
   */
  function isVipSupportIncluded(
    product: 'imob' | 'loc' | 'both',
    imobPlan: 'prime' | 'k' | 'k2',
    locPlan: 'prime' | 'k' | 'k2',
    addons: any
  ): boolean {
    // Check if included by plan
    const vipImobIncluded = (product === 'imob' || product === 'both') && (imobPlan === 'k' || imobPlan === 'k2');
    const vipLocIncluded = (product === 'loc' || product === 'both') && (locPlan === 'k' || locPlan === 'k2');
    
    // Check if included by Kombo
    const vipIncludedByCoreGestao = product === 'both'; // Core Gestão
    const vipIncludedByElite = isEliteKombo(product, addons); // Elite
    const vipIncludedByKombo = vipIncludedByCoreGestao || vipIncludedByElite;
    
    return vipImobIncluded || vipLocIncluded || vipIncludedByKombo;
  }

  /**
   * Helper function to check if CS Dedicado is included
   */
  function isCSDedicatedIncluded(
    product: 'imob' | 'loc' | 'both',
    imobPlan: 'prime' | 'k' | 'k2',
    locPlan: 'prime' | 'k' | 'k2',
    addons: any
  ): boolean {
    // Check if included by plan
    const csImobIncluded = (product === 'imob' || product === 'both') && imobPlan === 'k2';
    const csLocIncluded = (product === 'loc' || product === 'both') && locPlan === 'k2';
    
    // Check if included by Kombo
    const csIncludedByCoreGestao = product === 'both'; // Core Gestão
    const csIncludedByElite = isEliteKombo(product, addons); // Elite
    const csIncludedByKombo = csIncludedByCoreGestao || csIncludedByElite;
    
    return csImobIncluded || csLocIncluded || csIncludedByKombo;
  }

  const allAddons = {
    leads: true,
    inteligencia: true,
    assinatura: true,
    pay: true,
    seguros: true,
    cash: true,
  };

  const noAddons = {
    leads: false,
    inteligencia: false,
    assinatura: false,
    pay: false,
    seguros: false,
    cash: false,
  };

  it('should identify Elite Kombo correctly (IMOB + LOC + ALL add-ons)', () => {
    expect(isEliteKombo('both', allAddons)).toBe(true);
    expect(isEliteKombo('imob', allAddons)).toBe(false); // Not both products
    expect(isEliteKombo('loc', allAddons)).toBe(false); // Not both products
    expect(isEliteKombo('both', noAddons)).toBe(false); // Missing add-ons
  });

  it('should include VIP Support in Elite Kombo with Prime plans', () => {
    expect(isVipSupportIncluded('both', 'prime', 'prime', allAddons)).toBe(true);
  });

  it('should include VIP Support in Elite Kombo with K plans', () => {
    expect(isVipSupportIncluded('both', 'k', 'k', allAddons)).toBe(true);
  });

  it('should include VIP Support in Elite Kombo with K2 plans', () => {
    expect(isVipSupportIncluded('both', 'k2', 'k2', allAddons)).toBe(true);
  });

  it('should include VIP Support in Elite Kombo with mixed plans (Prime + K)', () => {
    expect(isVipSupportIncluded('both', 'prime', 'k', allAddons)).toBe(true);
  });

  it('should include VIP Support in Elite Kombo with mixed plans (K + K2)', () => {
    expect(isVipSupportIncluded('both', 'k', 'k2', allAddons)).toBe(true);
  });

  it('should include CS Dedicado in Elite Kombo with Prime plans', () => {
    expect(isCSDedicatedIncluded('both', 'prime', 'prime', allAddons)).toBe(true);
  });

  it('should include CS Dedicado in Elite Kombo with K plans', () => {
    expect(isCSDedicatedIncluded('both', 'k', 'k', allAddons)).toBe(true);
  });

  it('should include CS Dedicado in Elite Kombo with K2 plans', () => {
    expect(isCSDedicatedIncluded('both', 'k2', 'k2', allAddons)).toBe(true);
  });

  it('should include CS Dedicado in Elite Kombo with mixed plans (Prime + K)', () => {
    expect(isCSDedicatedIncluded('both', 'prime', 'k', allAddons)).toBe(true);
  });

  it('should include CS Dedicado in Elite Kombo with mixed plans (K + K2)', () => {
    expect(isCSDedicatedIncluded('both', 'k', 'k2', allAddons)).toBe(true);
  });

  it('should NOT include VIP Support when only IMOB (not Elite)', () => {
    expect(isVipSupportIncluded('imob', 'prime', 'prime', allAddons)).toBe(false);
  });

  it('should NOT include CS Dedicado when only LOC (not Elite)', () => {
    expect(isCSDedicatedIncluded('loc', 'prime', 'prime', allAddons)).toBe(false);
  });

  it('should include Premium Services in Core Gestão (IMOB + LOC without add-ons)', () => {
    // Core Gestão also includes Premium Services
    expect(isVipSupportIncluded('both', 'prime', 'prime', noAddons)).toBe(true);
    expect(isCSDedicatedIncluded('both', 'prime', 'prime', noAddons)).toBe(true);
  });
});
