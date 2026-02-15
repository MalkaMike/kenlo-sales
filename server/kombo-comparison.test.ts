/**
 * Tests for Kombo Comparison Table Logic
 * 
 * These tests validate the pricing calculations and recommendation logic
 * for the "4 bis. Preço Sem Kombo vs Kombo" section
 * 
 * NOW USING CENTRALIZED PRICING CONFIG as single source of truth
 */

import { describe, it, expect } from 'vitest';
import {
  IMOB_PLANS,
  LOC_PLANS,
  ADDONS,
  PREMIUM_SERVICES,
  FREQUENCY_MULTIPLIERS,
  roundToSeven,
  calculatePrice,
  type PaymentFrequency,
} from '../shared/pricing-config';

// ============================================================================
// CONSTANTS (derived from centralized pricing config)
// ============================================================================

const PLAN_ANNUAL_PRICES = {
  prime: IMOB_PLANS.prime.annualPrice,
  k: IMOB_PLANS.k.annualPrice,
  k2: IMOB_PLANS.k2.annualPrice,
};

const ADDON_ANNUAL_PRICES = {
  leads: ADDONS.leads.annualPrice,
  inteligencia: ADDONS.inteligencia.annualPrice,
  assinatura: ADDONS.assinaturas.annualPrice,
  pay: 0,
  seguros: 0,
  cash: 0,
};

const IMPLEMENTATION_COSTS = {
  imob: 1497,
  loc: 1497,
  leads: ADDONS.leads.implementation,
  inteligencia: ADDONS.inteligencia.implementation,
  assinatura: ADDONS.assinaturas.implementation,
  cash: 0,
  combo: 1497,
};

const PREMIUM_SERVICES_PRICES = {
  vipSupport: PREMIUM_SERVICES.vipSupport.monthlyPrice,
  dedicatedCS: PREMIUM_SERVICES.csDedicado.monthlyPrice,
};

// ============================================================================
// HELPER FUNCTIONS (using centralized pricing)
// ============================================================================

const roundToEndIn7 = (price: number): number => {
  return roundToSeven(price);
};

const calcPrice = (annualPrice: number, frequency: PaymentFrequency): number => {
  return calculatePrice(annualPrice, frequency);
};

const applyDiscount = (price: number, discount: number): number => {
  if (discount === 0) return price;
  return Math.round(price * (1 - discount));
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

describe('Kombo Comparison Table - Centralized Pricing Config', () => {
  describe('Plan annual prices match centralized config', () => {
    it('should have IMOB Prime = 247', () => {
      expect(PLAN_ANNUAL_PRICES.prime).toBe(247);
    });
    it('should have IMOB K = 497', () => {
      expect(PLAN_ANNUAL_PRICES.k).toBe(497);
    });
    it('should have IMOB K2 = 1197', () => {
      expect(PLAN_ANNUAL_PRICES.k2).toBe(1197);
    });
  });

  describe('Add-on annual prices match centralized config', () => {
    it('should have Leads = 497', () => {
      expect(ADDON_ANNUAL_PRICES.leads).toBe(497);
    });
    it('should have Inteligência = 297', () => {
      expect(ADDON_ANNUAL_PRICES.inteligencia).toBe(297);
    });
    it('should have Assinatura = 37', () => {
      expect(ADDON_ANNUAL_PRICES.assinatura).toBe(37);
    });
  });

  describe('Frequency multipliers match centralized config', () => {
    it('should have monthly = 1.25', () => {
      expect(FREQUENCY_MULTIPLIERS.monthly).toBe(1.25);
    });
    it('should have semiannual = 1.125', () => {
      expect(FREQUENCY_MULTIPLIERS.semiannual).toBe(1.125);
    });
    it('should have annual = 1.0', () => {
      expect(FREQUENCY_MULTIPLIERS.annual).toBe(1.0);
    });
    it('should have biennial = 0.875', () => {
      expect(FREQUENCY_MULTIPLIERS.biennial).toBe(0.875);
    });
  });
});

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

    it('should handle small prices correctly (Assinatura) - no ending-in-7 for < 100', () => {
      // 37 * 1.25 = 46.25 → ceil = 47 (< 100, no ending-in-7)
      expect(roundToEndIn7(46.25)).toBe(47);
      // 37 * 0.875 = 32.375 → ceil = 33 (< 100, no ending-in-7)
      expect(roundToEndIn7(32.375)).toBe(33);
    });
  });

  describe('calculatePrice with frequency multipliers', () => {
    it('should apply monthly multiplier (25% more)', () => {
      const annualPrice = 497;
      const monthlyPrice = calcPrice(annualPrice, 'monthly');
      // 497 * 1.25 = 621.25 → roundToSeven = 627
      expect(monthlyPrice).toBe(627);
    });

    it('should keep annual price unchanged', () => {
      const annualPrice = 497;
      const price = calcPrice(annualPrice, 'annual');
      expect(price).toBe(497);
    });

    it('should apply semiannual multiplier (12.5% more)', () => {
      const annualPrice = 497;
      const semiannualPrice = calcPrice(annualPrice, 'semiannual');
      // 497 * 1.125 = 559.125 → roundToSeven = 567
      expect(semiannualPrice).toBe(567);
    });

    it('should apply biennial multiplier (12.5% less / 30% OFF vs mensal)', () => {
      const annualPrice = 497;
      const biennialPrice = calcPrice(annualPrice, 'biennial');
      // 497 * 0.875 = 434.875 → roundToSeven = 437
      expect(biennialPrice).toBe(437);
    });

    it('should calculate Assinatura monthly correctly (was bug: showed 46 instead of 47)', () => {
      const annualPrice = 37;
      const monthlyPrice = calcPrice(annualPrice, 'monthly');
      // 37 * 1.25 = 46.25 → roundToSeven = 47
      expect(monthlyPrice).toBe(47);
    });

    it('should calculate Assinatura biennial correctly (< 100, no ending-in-7)', () => {
      const annualPrice = 37;
      const biennialPrice = calcPrice(annualPrice, 'biennial');
      // 37 * 0.875 = 32.375 → ceil = 33 (< 100, just Math.ceil)
      expect(biennialPrice).toBe(33);
    });

    it('should calculate Imob Prime biennial correctly', () => {
      const annualPrice = 247;
      const biennialPrice = calcPrice(annualPrice, 'biennial');
      // 247 * 0.875 = 216.125 → roundToSeven = 217
      expect(biennialPrice).toBe(217);
    });

    it('should calculate Inteligência biennial correctly', () => {
      const annualPrice = 297;
      const biennialPrice = calcPrice(annualPrice, 'biennial');
      // 297 * 0.875 = 259.875 → roundToSeven = 267
      expect(biennialPrice).toBe(267);
    });
  });

  describe('applyDiscount (Kombo discount applied after cycle)', () => {
    it('should apply 10% discount (Imob Start)', () => {
      const price = 497;
      const discounted = applyDiscount(price, 0.10);
      // 497 * 0.90 = 447.3 → round = 447
      expect(discounted).toBe(447);
    });

    it('should apply 15% discount (Imob Pro)', () => {
      const price = 497;
      const discounted = applyDiscount(price, 0.15);
      // 497 * 0.85 = 422.45 → round = 422
      expect(discounted).toBe(422);
    });

    it('should apply 20% discount (Elite)', () => {
      const price = 1197;
      const discounted = applyDiscount(price, 0.20);
      // 1197 * 0.80 = 957.6 → round = 958
      expect(discounted).toBe(958);
    });

    it('should return same price when discount is 0 (Core Gestão)', () => {
      const price = 497;
      const discounted = applyDiscount(price, 0);
      expect(discounted).toBe(497);
    });
  });

  describe('Full pipeline: Annual → Cycle → Kombo discount', () => {
    it('Imob Prime + Bienal + Imob Start (10%)', () => {
      const cyclePrice = calcPrice(247, 'biennial'); // 217
      const finalPrice = applyDiscount(cyclePrice, 0.10); // 217 * 0.90 = 195.3 → 195
      expect(cyclePrice).toBe(217);
      expect(finalPrice).toBe(195);
    });

    it('Leads + Monthly + Imob Pro (15%)', () => {
      const cyclePrice = calcPrice(497, 'monthly'); // 627
      const finalPrice = applyDiscount(cyclePrice, 0.15); // 627 * 0.85 = 532.95 → 533
      expect(cyclePrice).toBe(627);
      expect(finalPrice).toBe(533);
    });

    it('Assinatura + Monthly + Imob Pro (15%) — regression test for rounding bug', () => {
      const cyclePrice = calcPrice(37, 'monthly'); // 47
      const finalPrice = applyDiscount(cyclePrice, 0.15); // 47 * 0.85 = 39.95 → 40
      expect(cyclePrice).toBe(47);
      expect(finalPrice).toBe(40);
    });

    it('K2 + Bienal + Elite (20%)', () => {
      const cyclePrice = calcPrice(1197, 'biennial'); // 1197 * 0.875 = 1047.375 → ceil=1048 → roundToSeven=1057
      const finalPrice = applyDiscount(cyclePrice, 0.20); // 1057 * 0.80 = 845.6 → round=846
      expect(cyclePrice).toBe(1057);
      expect(finalPrice).toBe(846);
    });

    it('Assinatura + Bienal + Imob Pro (15%) — with < 100 rounding', () => {
      const cyclePrice = calcPrice(37, 'biennial'); // 37 * 0.875 = 32.375 → ceil = 33
      const finalPrice = applyDiscount(cyclePrice, 0.15); // 33 * 0.85 = 28.05 → 28
      expect(cyclePrice).toBe(33);
      expect(finalPrice).toBe(28);
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
    expect(PREMIUM_SERVICES_PRICES.dedicatedCS).toBe(297);
  });

  it('should have correct total for both premium services', () => {
    const total = PREMIUM_SERVICES_PRICES.vipSupport + PREMIUM_SERVICES_PRICES.dedicatedCS;
    expect(total).toBe(394);
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


// ============================================================================
// KOMBO COLUMN FILTERING TESTS
// ============================================================================

type KomboIdFilter = 'none' | 'imob_start' | 'imob_pro' | 'locacao_pro' | 'core_gestao' | 'elite';

const getCompatibleKomboIds = (product: ProductSelection): KomboIdFilter[] => {
  switch (product) {
    case 'imob':
      return ['imob_start', 'imob_pro'];
    case 'loc':
      return ['locacao_pro'];
    case 'both':
      return ['core_gestao', 'elite'];
    default:
      return [];
  }
};

const getVisibleColumns = (product: ProductSelection): KomboIdFilter[] => {
  return ['none', ...getCompatibleKomboIds(product)];
};

describe('Kombo Column Filtering by Product Type', () => {
  describe('Imob only selection', () => {
    it('should show only Sua Seleção + Imob Start + Imob Pro (3 columns)', () => {
      const visible = getVisibleColumns('imob');
      expect(visible).toEqual(['none', 'imob_start', 'imob_pro']);
      expect(visible).toHaveLength(3);
    });

    it('should NOT include Loc Pro for Imob only', () => {
      const visible = getVisibleColumns('imob');
      expect(visible).not.toContain('locacao_pro');
    });

    it('should NOT include Core Gestão or Elite for Imob only', () => {
      const visible = getVisibleColumns('imob');
      expect(visible).not.toContain('core_gestao');
      expect(visible).not.toContain('elite');
    });
  });

  describe('Loc only selection', () => {
    it('should show only Sua Seleção + Loc Pro (2 columns)', () => {
      const visible = getVisibleColumns('loc');
      expect(visible).toEqual(['none', 'locacao_pro']);
      expect(visible).toHaveLength(2);
    });

    it('should NOT include Imob Start or Imob Pro for Loc only', () => {
      const visible = getVisibleColumns('loc');
      expect(visible).not.toContain('imob_start');
      expect(visible).not.toContain('imob_pro');
    });

    it('should NOT include Core Gestão or Elite for Loc only', () => {
      const visible = getVisibleColumns('loc');
      expect(visible).not.toContain('core_gestao');
      expect(visible).not.toContain('elite');
    });
  });

  describe('Both (Imob + Loc) selection', () => {
    it('should show only Sua Seleção + Core Gestão + Elite (3 columns)', () => {
      const visible = getVisibleColumns('both');
      expect(visible).toEqual(['none', 'core_gestao', 'elite']);
      expect(visible).toHaveLength(3);
    });

    it('should NOT include Imob Start or Imob Pro for Both', () => {
      const visible = getVisibleColumns('both');
      expect(visible).not.toContain('imob_start');
      expect(visible).not.toContain('imob_pro');
    });

    it('should NOT include Loc Pro for Both', () => {
      const visible = getVisibleColumns('both');
      expect(visible).not.toContain('locacao_pro');
    });
  });

  describe('Sua Seleção column always present', () => {
    it('should always have "none" (Sua Seleção) as first column for imob', () => {
      expect(getVisibleColumns('imob')[0]).toBe('none');
    });

    it('should always have "none" (Sua Seleção) as first column for loc', () => {
      expect(getVisibleColumns('loc')[0]).toBe('none');
    });

    it('should always have "none" (Sua Seleção) as first column for both', () => {
      expect(getVisibleColumns('both')[0]).toBe('none');
    });
  });

  describe('Mutual exclusivity — never all Kombos together', () => {
    it('should never show more than 3 columns total (Sua Seleção + max 2 Kombos)', () => {
      for (const product of ['imob', 'loc', 'both'] as ProductSelection[]) {
        const visible = getVisibleColumns(product);
        expect(visible.length).toBeLessThanOrEqual(3);
      }
    });

    it('should never show Imob-only and Both Kombos together', () => {
      for (const product of ['imob', 'loc', 'both'] as ProductSelection[]) {
        const visible = getVisibleColumns(product);
        const hasImobKombos = visible.includes('imob_start') || visible.includes('imob_pro');
        const hasBothKombos = visible.includes('core_gestao') || visible.includes('elite');
        expect(hasImobKombos && hasBothKombos).toBe(false);
      }
    });

    it('should never show Loc-only and Imob-only Kombos together', () => {
      for (const product of ['imob', 'loc', 'both'] as ProductSelection[]) {
        const visible = getVisibleColumns(product);
        const hasImobKombos = visible.includes('imob_start') || visible.includes('imob_pro');
        const hasLocKombos = visible.includes('locacao_pro');
        expect(hasImobKombos && hasLocKombos).toBe(false);
      }
    });
  });
});
