/**
 * Tests for Kombo Comparison Table Logic
 * 
 * These tests validate the pricing calculations and recommendation logic
 * for the "4 bis. Preço Sem Kombo vs Kombo" section
 */

import { describe, it, expect } from 'vitest';

// ============================================================================
// CONSTANTS (mirrored from component for testing)
// ============================================================================

const PLAN_ANNUAL_PRICES = {
  prime: 247,
  k: 497,
  k2: 1197,
};

const ADDON_ANNUAL_PRICES = {
  leads: 497,
  inteligencia: 297,
  assinatura: 37,
  pay: 0,
  seguros: 0,
  cash: 0,
};

const IMPLEMENTATION_COSTS = {
  imob: 1497,
  loc: 1497,
  leads: 497,
  inteligencia: 497,
  assinatura: 0,
  cash: 0,
  combo: 1497,
};

const PREMIUM_SERVICES_PRICES = {
  vipSupport: 97,
  dedicatedCS: 197,
};

const PAYMENT_FREQUENCY_MULTIPLIERS = {
  monthly: 1.25,
  semestral: 1.1111,
  annual: 1.0,
  biennial: 0.90,
};

// ============================================================================
// HELPER FUNCTIONS (mirrored from component)
// ============================================================================

const roundToEndIn7 = (price: number): number => {
  const lastDigit = price % 10;
  if (lastDigit === 7) return price;
  if (lastDigit < 7) return price - lastDigit + 7;
  return price - lastDigit + 17;
};

const calculatePrice = (annualPrice: number, frequency: string): number => {
  const multiplier = PAYMENT_FREQUENCY_MULTIPLIERS[frequency as keyof typeof PAYMENT_FREQUENCY_MULTIPLIERS] || 1;
  return roundToEndIn7(Math.round(annualPrice * multiplier));
};

const applyDiscount = (price: number, discount: number): number => {
  if (discount === 0) return price;
  return roundToEndIn7(Math.round(price * (1 - discount)));
};

type ProductSelection = 'imob' | 'loc' | 'both';
type KomboId = 'none' | 'imob_start' | 'imob_pro' | 'locacao_pro' | 'core_gestao' | 'elite';

interface AddonsState {
  leads: boolean;
  inteligencia: boolean;
  assinatura: boolean;
  pay: boolean;
  seguros: boolean;
  cash: boolean;
}

const getRecommendedKombo = (
  product: ProductSelection,
  addons: AddonsState
): KomboId => {
  const activeAddons = Object.entries(addons)
    .filter(([_, active]) => active)
    .map(([name]) => name);

  // Elite: IMOB + LOC + ALL 6 add-ons
  if (product === 'both' && activeAddons.length === 6) {
    return 'elite';
  }

  // Core Gestão: IMOB + LOC + NO add-ons
  if (product === 'both' && activeAddons.length === 0) {
    return 'core_gestao';
  }

  // Imob Pro: IMOB + Leads + Inteligência + Assinatura
  if (
    product === 'imob' &&
    addons.leads &&
    addons.inteligencia &&
    addons.assinatura &&
    !addons.pay &&
    !addons.seguros &&
    !addons.cash
  ) {
    return 'imob_pro';
  }

  // Imob Start: IMOB + Leads + Assinatura (without Inteligência)
  if (
    product === 'imob' &&
    addons.leads &&
    addons.assinatura &&
    !addons.inteligencia &&
    !addons.pay &&
    !addons.seguros &&
    !addons.cash
  ) {
    return 'imob_start';
  }

  // Locação Pro: LOC + Inteligência + Assinatura
  if (
    product === 'loc' &&
    addons.inteligencia &&
    addons.assinatura &&
    !addons.leads &&
    !addons.pay &&
    !addons.seguros &&
    !addons.cash
  ) {
    return 'locacao_pro';
  }

  return 'none';
};

// ============================================================================
// TESTS
// ============================================================================

describe('Kombo Comparison Table - Price Calculations', () => {
  describe('roundToEndIn7', () => {
    it('should keep prices already ending in 7', () => {
      expect(roundToEndIn7(497)).toBe(497);
      expect(roundToEndIn7(1197)).toBe(1197);
      expect(roundToEndIn7(247)).toBe(247);
    });

    it('should round up to next 7', () => {
      expect(roundToEndIn7(490)).toBe(497);
      expect(roundToEndIn7(495)).toBe(497);
      expect(roundToEndIn7(491)).toBe(497);
    });

    it('should round up to next decade when digit > 7', () => {
      expect(roundToEndIn7(498)).toBe(507);
      expect(roundToEndIn7(499)).toBe(507);
      expect(roundToEndIn7(500)).toBe(507);
    });
  });

  describe('calculatePrice with frequency multipliers', () => {
    it('should apply monthly multiplier (25% more)', () => {
      const annualPrice = 497;
      const monthlyPrice = calculatePrice(annualPrice, 'monthly');
      // 497 * 1.25 = 621.25 → rounded to end in 7 = 627
      expect(monthlyPrice).toBe(627);
    });

    it('should keep annual price unchanged', () => {
      const annualPrice = 497;
      const price = calculatePrice(annualPrice, 'annual');
      expect(price).toBe(497);
    });

    it('should apply biennial discount (10% less)', () => {
      const annualPrice = 497;
      const biennialPrice = calculatePrice(annualPrice, 'biennial');
      // 497 * 0.90 = 447.3 → rounded to end in 7 = 447
      expect(biennialPrice).toBe(447);
    });
  });

  describe('applyDiscount', () => {
    it('should apply 10% discount (Imob Start, Locação Pro)', () => {
      const price = 497;
      const discounted = applyDiscount(price, 0.10);
      // 497 * 0.90 = 447.3 → rounded to end in 7 = 447
      expect(discounted).toBe(447);
    });

    it('should apply 15% discount (Imob Pro)', () => {
      const price = 497;
      const discounted = applyDiscount(price, 0.15);
      // 497 * 0.85 = 422.45 → rounded to end in 7 = 427
      expect(discounted).toBe(427);
    });

    it('should apply 20% discount (Elite)', () => {
      const price = 1197;
      const discounted = applyDiscount(price, 0.20);
      // 1197 * 0.80 = 957.6 → rounded to end in 7 = 967
      expect(discounted).toBe(967);
    });

    it('should return same price when discount is 0 (Core Gestão)', () => {
      const price = 497;
      const discounted = applyDiscount(price, 0);
      expect(discounted).toBe(497);
    });
  });
});

describe('Kombo Comparison Table - Recommendation Logic', () => {
  describe('Elite Kombo recommendation', () => {
    it('should recommend Elite when IMOB + LOC + ALL add-ons', () => {
      const result = getRecommendedKombo('both', {
        leads: true,
        inteligencia: true,
        assinatura: true,
        pay: true,
        seguros: true,
        cash: true,
      });
      expect(result).toBe('elite');
    });
  });

  describe('Core Gestão recommendation', () => {
    it('should recommend Core Gestão when IMOB + LOC + NO add-ons', () => {
      const result = getRecommendedKombo('both', {
        leads: false,
        inteligencia: false,
        assinatura: false,
        pay: false,
        seguros: false,
        cash: false,
      });
      expect(result).toBe('core_gestao');
    });
  });

  describe('Imob Pro recommendation', () => {
    it('should recommend Imob Pro when IMOB + Leads + Inteligência + Assinatura', () => {
      const result = getRecommendedKombo('imob', {
        leads: true,
        inteligencia: true,
        assinatura: true,
        pay: false,
        seguros: false,
        cash: false,
      });
      expect(result).toBe('imob_pro');
    });
  });

  describe('Imob Start recommendation', () => {
    it('should recommend Imob Start when IMOB + Leads + Assinatura (no Inteligência)', () => {
      const result = getRecommendedKombo('imob', {
        leads: true,
        inteligencia: false,
        assinatura: true,
        pay: false,
        seguros: false,
        cash: false,
      });
      expect(result).toBe('imob_start');
    });
  });

  describe('Locação Pro recommendation', () => {
    it('should recommend Locação Pro when LOC + Inteligência + Assinatura', () => {
      const result = getRecommendedKombo('loc', {
        leads: false,
        inteligencia: true,
        assinatura: true,
        pay: false,
        seguros: false,
        cash: false,
      });
      expect(result).toBe('locacao_pro');
    });
  });

  describe('No Kombo recommendation', () => {
    it('should return none when no Kombo matches', () => {
      // IMOB only with just Leads (no Assinatura)
      const result = getRecommendedKombo('imob', {
        leads: true,
        inteligencia: false,
        assinatura: false,
        pay: false,
        seguros: false,
        cash: false,
      });
      expect(result).toBe('none');
    });

    it('should return none for IMOB + LOC with partial add-ons', () => {
      // Both products but only some add-ons (not all 6)
      const result = getRecommendedKombo('both', {
        leads: true,
        inteligencia: true,
        assinatura: true,
        pay: false,
        seguros: false,
        cash: false,
      });
      expect(result).toBe('none');
    });
  });
});

describe('Kombo Comparison Table - Premium Services', () => {
  it('should have correct VIP Support price', () => {
    expect(PREMIUM_SERVICES_PRICES.vipSupport).toBe(97);
  });

  it('should have correct CS Dedicado price', () => {
    expect(PREMIUM_SERVICES_PRICES.dedicatedCS).toBe(197);
  });

  it('should have correct total for both premium services', () => {
    const total = PREMIUM_SERVICES_PRICES.vipSupport + PREMIUM_SERVICES_PRICES.dedicatedCS;
    expect(total).toBe(294);
  });
});

describe('Kombo Comparison Table - Implementation Costs', () => {
  it('should have fixed combo implementation cost of R$1.497', () => {
    expect(IMPLEMENTATION_COSTS.combo).toBe(1497);
  });

  it('should calculate correct Sem Kombo implementation for IMOB + LOC', () => {
    const total = IMPLEMENTATION_COSTS.imob + IMPLEMENTATION_COSTS.loc;
    expect(total).toBe(2994);
  });

  it('should calculate correct Sem Kombo implementation with Leads + BI', () => {
    const total = IMPLEMENTATION_COSTS.imob + IMPLEMENTATION_COSTS.loc + 
                  IMPLEMENTATION_COSTS.leads + IMPLEMENTATION_COSTS.inteligencia;
    expect(total).toBe(3988);
  });
});

describe('Kombo Comparison Table - Annual Equivalent Calculation', () => {
  it('should calculate annual equivalent correctly (12 months + implementation)', () => {
    const monthlyTotal = 2625; // Example Elite monthly
    const implementation = 1497;
    const annualEquivalent = monthlyTotal * 12 + implementation;
    expect(annualEquivalent).toBe(32997);
  });

  it('should calculate Sem Kombo annual equivalent correctly', () => {
    const monthlyTotal = 3225; // Example Sem Kombo monthly
    const implementation = 3988; // IMOB + LOC + Leads + BI
    const annualEquivalent = monthlyTotal * 12 + implementation;
    expect(annualEquivalent).toBe(42688);
  });
});
