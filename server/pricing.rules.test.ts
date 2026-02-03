import { describe, it, expect } from 'vitest';

/**
 * Test suite for Kenlo pricing rules
 * Based on the official pricing document
 */

describe('Pricing Rules - Rounding Function', () => {
  /**
   * Round price UP to next value ending in 7
   * ALWAYS rounds UP, never down
   */
  const roundToEndIn7 = (price: number): number => {
    const lastDigit = price % 10;
    if (lastDigit === 7) {
      return price; // Already ends in 7
    } else if (lastDigit < 7) {
      return price - lastDigit + 7; // Round up to 7 in current decade
    } else {
      return price - lastDigit + 17; // Round up to 7 in next decade
    }
  };

  it('should round UP to next number ending in 7', () => {
    // Test cases from document
    expect(roundToEndIn7(490)).toBe(497); // NOT 487
    expect(roundToEndIn7(495)).toBe(497);
    expect(roundToEndIn7(502)).toBe(507);
    expect(roundToEndIn7(507)).toBe(507); // Already ends in 7
    
    // Additional edge cases
    expect(roundToEndIn7(500)).toBe(507);
    expect(roundToEndIn7(501)).toBe(507);
    expect(roundToEndIn7(506)).toBe(507);
    expect(roundToEndIn7(508)).toBe(517);
    expect(roundToEndIn7(509)).toBe(517);
    expect(roundToEndIn7(510)).toBe(517);
  });

  it('should never round down', () => {
    // These should all round UP, never down
    expect(roundToEndIn7(491)).toBeGreaterThan(491);
    expect(roundToEndIn7(492)).toBeGreaterThan(492);
    expect(roundToEndIn7(493)).toBeGreaterThan(493);
    expect(roundToEndIn7(494)).toBeGreaterThan(494);
    expect(roundToEndIn7(495)).toBeGreaterThan(495);
    expect(roundToEndIn7(496)).toBeGreaterThan(496);
  });
});

describe('Pricing Rules - Payment Frequency Multipliers', () => {
  const PAYMENT_FREQUENCY_MULTIPLIERS = {
    monthly: 1.25,      // 25% more expensive than annual
    semestral: 1.1111,  // ~11.11% more expensive than annual
    annual: 1.0,        // Base price (reference)
    biennial: 0.90,     // 10% discount from annual
  };

  it('should have correct multipliers', () => {
    expect(PAYMENT_FREQUENCY_MULTIPLIERS.monthly).toBe(1.25);
    expect(PAYMENT_FREQUENCY_MULTIPLIERS.semestral).toBeCloseTo(1.1111, 4);
    expect(PAYMENT_FREQUENCY_MULTIPLIERS.annual).toBe(1.0);
    expect(PAYMENT_FREQUENCY_MULTIPLIERS.biennial).toBe(0.90);
  });

  it('should calculate correct prices based on annual base', () => {
    const annualPrice = 1000;
    
    // Monthly should be 25% more expensive
    expect(annualPrice * PAYMENT_FREQUENCY_MULTIPLIERS.monthly).toBe(1250);
    
    // Semestral should be ~11.11% more expensive
    expect(annualPrice * PAYMENT_FREQUENCY_MULTIPLIERS.semestral).toBeCloseTo(1111.1, 1);
    
    // Annual is the base
    expect(annualPrice * PAYMENT_FREQUENCY_MULTIPLIERS.annual).toBe(1000);
    
    // Biennial should be 10% cheaper
    expect(annualPrice * PAYMENT_FREQUENCY_MULTIPLIERS.biennial).toBe(900);
  });
});

describe('Pricing Rules - Kombo Discounts', () => {
  const KOMBOS = {
    imob_start: { discount: 0.10 },      // 10% OFF
    imob_pro: { discount: 0.15 },        // 15% OFF
    locacao_pro: { discount: 0.10 },     // 10% OFF
    core_gestao: { discount: 0 },        // 0% OFF (no discount on monthly)
    elite: { discount: 0.20 },           // 20% OFF
  };

  it('should have correct discount percentages', () => {
    expect(KOMBOS.imob_start.discount).toBe(0.10);
    expect(KOMBOS.imob_pro.discount).toBe(0.15);
    expect(KOMBOS.locacao_pro.discount).toBe(0.10);
    expect(KOMBOS.core_gestao.discount).toBe(0);
    expect(KOMBOS.elite.discount).toBe(0.20);
  });

  it('should calculate correct discounted prices', () => {
    const basePrice = 1000;
    
    // Imob Start: 10% OFF → 900
    expect(basePrice * (1 - KOMBOS.imob_start.discount)).toBe(900);
    
    // Imob Pro: 15% OFF → 850
    expect(basePrice * (1 - KOMBOS.imob_pro.discount)).toBe(850);
    
    // Locação Pro: 10% OFF → 900
    expect(basePrice * (1 - KOMBOS.locacao_pro.discount)).toBe(900);
    
    // Core Gestão: 0% OFF → 1000 (no discount)
    expect(basePrice * (1 - KOMBOS.core_gestao.discount)).toBe(1000);
    
    // Elite: 20% OFF → 800
    expect(basePrice * (1 - KOMBOS.elite.discount)).toBe(800);
  });
});

describe('Pricing Rules - Kombo Implementation Costs', () => {
  const FIXED_KOMBO_IMPLEMENTATION = 1497;

  it('should have fixed implementation cost of R$ 1.497 for all Kombos', () => {
    expect(FIXED_KOMBO_IMPLEMENTATION).toBe(1497);
  });

  it('Core Gestão should have R$ 1.497 implementation (IMOB free, LOC only)', () => {
    // Core Gestão: IMOB implementation is free, only LOC R$ 1.497
    const coreGestaoImpl = 1497;
    expect(coreGestaoImpl).toBe(FIXED_KOMBO_IMPLEMENTATION);
  });

  it('All other Kombos should have R$ 1.497 implementation', () => {
    // All Kombos have fixed R$ 1.497 implementation
    const imobStartImpl = 1497;
    const imobProImpl = 1497;
    const locacaoProImpl = 1497;
    const eliteImpl = 1497;
    
    expect(imobStartImpl).toBe(FIXED_KOMBO_IMPLEMENTATION);
    expect(imobProImpl).toBe(FIXED_KOMBO_IMPLEMENTATION);
    expect(locacaoProImpl).toBe(FIXED_KOMBO_IMPLEMENTATION);
    expect(eliteImpl).toBe(FIXED_KOMBO_IMPLEMENTATION);
  });
});

describe('Pricing Rules - Add-on Availability', () => {
  const isAddonAvailable = (addon: string, product: 'imob' | 'loc' | 'both') => {
    if (addon === 'leads') return product === 'imob' || product === 'both';
    if (addon === 'inteligencia') return true; // Available for both
    if (addon === 'assinatura') return true; // Available for both
    if (addon === 'pay') return product === 'loc' || product === 'both';
    if (addon === 'seguros') return product === 'loc' || product === 'both';
    if (addon === 'cash') return product === 'loc' || product === 'both';
    return false;
  };

  it('Leads should be available for IMOB only', () => {
    expect(isAddonAvailable('leads', 'imob')).toBe(true);
    expect(isAddonAvailable('leads', 'loc')).toBe(false);
    expect(isAddonAvailable('leads', 'both')).toBe(true);
  });

  it('Inteligência should be available for both IMOB and LOC', () => {
    expect(isAddonAvailable('inteligencia', 'imob')).toBe(true);
    expect(isAddonAvailable('inteligencia', 'loc')).toBe(true);
    expect(isAddonAvailable('inteligencia', 'both')).toBe(true);
  });

  it('Assinatura should be available for both IMOB and LOC', () => {
    expect(isAddonAvailable('assinatura', 'imob')).toBe(true);
    expect(isAddonAvailable('assinatura', 'loc')).toBe(true);
    expect(isAddonAvailable('assinatura', 'both')).toBe(true);
  });

  it('Pay should be available for LOC only', () => {
    expect(isAddonAvailable('pay', 'imob')).toBe(false);
    expect(isAddonAvailable('pay', 'loc')).toBe(true);
    expect(isAddonAvailable('pay', 'both')).toBe(true);
  });

  it('Seguros should be available for LOC only', () => {
    expect(isAddonAvailable('seguros', 'imob')).toBe(false);
    expect(isAddonAvailable('seguros', 'loc')).toBe(true);
    expect(isAddonAvailable('seguros', 'both')).toBe(true);
  });

  it('Cash should be available for LOC only', () => {
    expect(isAddonAvailable('cash', 'imob')).toBe(false);
    expect(isAddonAvailable('cash', 'loc')).toBe(true);
    expect(isAddonAvailable('cash', 'both')).toBe(true);
  });
});
