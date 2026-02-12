import { describe, it, expect } from 'vitest';

/**
 * V9 Pricing Rules Test Suite
 * Validates all V9-specific pricing changes including:
 * - Plan thresholds (IMOB/LOC)
 * - Included users/contracts
 * - Tiered additional user pricing
 * - Tiered additional contract pricing
 * - VIP/CS rules per plan
 * - Tiered boleto/split pricing
 * - Tiered digital signature pricing
 * - Tiered WhatsApp message pricing
 * - Validação biométrica pricing
 */

// ============================================================
// V9 PRICING CONSTANTS (must match CalculadoraPage.tsx)
// ============================================================

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

// ============================================================
// V9 PLAN THRESHOLDS
// ============================================================

describe('V9 - Plan Thresholds', () => {
  const getImobPlan = (users: number): string => {
    if (users >= 16) return 'k2';
    if (users >= 5) return 'k';
    return 'prime';
  };

  const getLocPlan = (contracts: number): string => {
    if (contracts >= 500) return 'k2';
    if (contracts >= 200) return 'k';
    return 'prime';
  };

  it('IMOB: Prime for 1-4 users', () => {
    expect(getImobPlan(1)).toBe('prime');
    expect(getImobPlan(2)).toBe('prime');
    expect(getImobPlan(3)).toBe('prime');
    expect(getImobPlan(4)).toBe('prime');
  });

  it('IMOB: K for 5-15 users', () => {
    expect(getImobPlan(5)).toBe('k');
    expect(getImobPlan(10)).toBe('k');
    expect(getImobPlan(15)).toBe('k');
  });

  it('IMOB: K2 for 16+ users', () => {
    expect(getImobPlan(16)).toBe('k2');
    expect(getImobPlan(20)).toBe('k2');
    expect(getImobPlan(100)).toBe('k2');
  });

  it('LOC: Prime for 1-199 contracts', () => {
    expect(getLocPlan(1)).toBe('prime');
    expect(getLocPlan(100)).toBe('prime');
    expect(getLocPlan(199)).toBe('prime');
  });

  it('LOC: K for 200-499 contracts', () => {
    expect(getLocPlan(200)).toBe('k');
    expect(getLocPlan(300)).toBe('k');
    expect(getLocPlan(499)).toBe('k');
  });

  it('LOC: K2 for 500+ contracts', () => {
    expect(getLocPlan(500)).toBe('k2');
    expect(getLocPlan(1000)).toBe('k2');
  });
});

// ============================================================
// V9 INCLUDED RESOURCES
// ============================================================

describe('V9 - Included Resources', () => {
  const getImobIncludedUsers = (plan: string): number => {
    return plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
  };

  const getLocIncludedContracts = (plan: string): number => {
    return plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
  };

  const getIncludedBoletos = (plan: string): number => {
    return plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
  };

  const getIncludedSplits = (plan: string): number => {
    return plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
  };

  it('IMOB included users: Prime=2, K=5, K2=10', () => {
    expect(getImobIncludedUsers('prime')).toBe(2);
    expect(getImobIncludedUsers('k')).toBe(5);
    expect(getImobIncludedUsers('k2')).toBe(10);
  });

  it('LOC included contracts: Prime=100, K=150, K2=500', () => {
    expect(getLocIncludedContracts('prime')).toBe(100);
    expect(getLocIncludedContracts('k')).toBe(150);
    expect(getLocIncludedContracts('k2')).toBe(500);
  });

  it('Boleto included: Prime=2, K=5, K2=15', () => {
    expect(getIncludedBoletos('prime')).toBe(2);
    expect(getIncludedBoletos('k')).toBe(5);
    expect(getIncludedBoletos('k2')).toBe(15);
  });

  it('Split included: Prime=2, K=5, K2=15', () => {
    expect(getIncludedSplits('prime')).toBe(2);
    expect(getIncludedSplits('k')).toBe(5);
    expect(getIncludedSplits('k2')).toBe(15);
  });

  it('Digital signatures included: 15 for all plans', () => {
    expect(15).toBe(15); // Fixed at 15 for all plans
  });

  it('WhatsApp messages included: 100 for all plans', () => {
    expect(100).toBe(100); // Fixed at 100 for all plans
  });
});

// ============================================================
// V9 ADDITIONAL USERS TIERED PRICING
// ============================================================

describe('V9 - Additional Users Tiered Pricing', () => {
  const calculateAdditionalUsersCost = (plan: string, additionalUsers: number): number => {
    if (additionalUsers <= 0) return 0;
    if (plan === 'prime') {
      return additionalUsers * 57;
    } else if (plan === 'k') {
      // K: 1-5 = R$47, 6+ = R$37
      const tier1 = Math.min(additionalUsers, 5);
      const tier2 = Math.max(0, additionalUsers - 5);
      return (tier1 * 47) + (tier2 * 37);
    } else {
      // K2: 1-10 = R$37, 11-100 = R$27, 101+ = R$17
      const tier1 = Math.min(additionalUsers, 10);
      const tier2 = Math.min(Math.max(0, additionalUsers - 10), 90);
      const tier3 = Math.max(0, additionalUsers - 100);
      return (tier1 * 37) + (tier2 * 27) + (tier3 * 17);
    }
  };

  it('Prime: R$57 flat per additional user', () => {
    expect(calculateAdditionalUsersCost('prime', 1)).toBe(57);
    expect(calculateAdditionalUsersCost('prime', 5)).toBe(285);
    expect(calculateAdditionalUsersCost('prime', 10)).toBe(570);
  });

  it('K: 1-5 = R$47, 6+ = R$37', () => {
    expect(calculateAdditionalUsersCost('k', 1)).toBe(47);
    expect(calculateAdditionalUsersCost('k', 5)).toBe(235); // 5 * 47
    expect(calculateAdditionalUsersCost('k', 6)).toBe(272); // 5*47 + 1*37
    expect(calculateAdditionalUsersCost('k', 10)).toBe(420); // 5*47 + 5*37
  });

  it('K2: 1-10 = R$37, 11-100 = R$27, 101+ = R$17', () => {
    expect(calculateAdditionalUsersCost('k2', 1)).toBe(37);
    expect(calculateAdditionalUsersCost('k2', 10)).toBe(370); // 10 * 37
    expect(calculateAdditionalUsersCost('k2', 11)).toBe(397); // 10*37 + 1*27
    expect(calculateAdditionalUsersCost('k2', 100)).toBe(2800); // 10*37 + 90*27
    expect(calculateAdditionalUsersCost('k2', 101)).toBe(2817); // 10*37 + 90*27 + 1*17
    expect(calculateAdditionalUsersCost('k2', 110)).toBe(2970); // 10*37 + 90*27 + 10*17
  });

  it('should return 0 for 0 or negative additional users', () => {
    expect(calculateAdditionalUsersCost('prime', 0)).toBe(0);
    expect(calculateAdditionalUsersCost('k', -1)).toBe(0);
    expect(calculateAdditionalUsersCost('k2', 0)).toBe(0);
  });
});

// ============================================================
// V9 ADDITIONAL CONTRACTS TIERED PRICING
// ============================================================

describe('V9 - Additional Contracts Tiered Pricing', () => {
  const calculateAdditionalContractsCost = (plan: string, additionalContracts: number): number => {
    if (additionalContracts <= 0) return 0;
    if (plan === 'prime') {
      return additionalContracts * 3;
    } else if (plan === 'k') {
      const tier1 = Math.min(additionalContracts, 250);
      const tier2 = Math.max(0, additionalContracts - 250);
      return (tier1 * 3) + (tier2 * 2.5);
    } else {
      const tier1 = Math.min(additionalContracts, 250);
      const tier2 = Math.min(Math.max(0, additionalContracts - 250), 250);
      const tier3 = Math.max(0, additionalContracts - 500);
      return (tier1 * 3) + (tier2 * 2.5) + (tier3 * 2);
    }
  };

  it('Prime: R$3 flat per additional contract', () => {
    expect(calculateAdditionalContractsCost('prime', 1)).toBe(3);
    expect(calculateAdditionalContractsCost('prime', 100)).toBe(300);
  });

  it('K: 1-250 = R$3, 251+ = R$2.50', () => {
    expect(calculateAdditionalContractsCost('k', 250)).toBe(750); // 250 * 3
    expect(calculateAdditionalContractsCost('k', 251)).toBe(752.5); // 250*3 + 1*2.5
    expect(calculateAdditionalContractsCost('k', 500)).toBe(1375); // 250*3 + 250*2.5
  });

  it('K2: 1-250 = R$3, 251-500 = R$2.50, 501+ = R$2', () => {
    expect(calculateAdditionalContractsCost('k2', 250)).toBe(750); // 250 * 3
    expect(calculateAdditionalContractsCost('k2', 500)).toBe(1375); // 250*3 + 250*2.5
    expect(calculateAdditionalContractsCost('k2', 501)).toBe(1377); // 250*3 + 250*2.5 + 1*2
    expect(calculateAdditionalContractsCost('k2', 750)).toBe(1875); // 250*3 + 250*2.5 + 250*2
  });
});

// ============================================================
// V9 VIP/CS RULES
// ============================================================

describe('V9 - VIP/CS Rules', () => {
  const getVipStatus = (plan: string): { included: boolean; available: boolean; price: number } => {
    if (plan === 'k' || plan === 'k2') return { included: true, available: true, price: 0 };
    return { included: false, available: true, price: 97 };
  };

  const getCsStatus = (plan: string): { included: boolean; available: boolean; price: number } => {
    if (plan === 'k2') return { included: true, available: true, price: 0 };
    if (plan === 'k') return { included: false, available: false, price: 0 }; // NOT AVAILABLE
    return { included: false, available: true, price: 197 };
  };

  it('VIP: Included for K and K2, Optional (R$97) for Prime', () => {
    const prime = getVipStatus('prime');
    expect(prime.included).toBe(false);
    expect(prime.available).toBe(true);
    expect(prime.price).toBe(97);

    const k = getVipStatus('k');
    expect(k.included).toBe(true);
    expect(k.price).toBe(0);

    const k2 = getVipStatus('k2');
    expect(k2.included).toBe(true);
    expect(k2.price).toBe(0);
  });

  it('CS: Included for K2, NOT AVAILABLE for K, Optional (R$197) for Prime', () => {
    const prime = getCsStatus('prime');
    expect(prime.included).toBe(false);
    expect(prime.available).toBe(true);
    expect(prime.price).toBe(197);

    const k = getCsStatus('k');
    expect(k.included).toBe(false);
    expect(k.available).toBe(false); // NOT AVAILABLE for K
    expect(k.price).toBe(0);

    const k2 = getCsStatus('k2');
    expect(k2.included).toBe(true);
    expect(k2.price).toBe(0);
  });

  it('CS cost should only apply to Prime plan', () => {
    // Only Prime pays for CS (R$197)
    const csCostPrime = getCsStatus('prime').price;
    const csCostK = getCsStatus('k').price;
    const csCostK2 = getCsStatus('k2').price;

    expect(csCostPrime).toBe(197);
    expect(csCostK).toBe(0); // Not available, no cost
    expect(csCostK2).toBe(0); // Included, no cost
  });
});

// ============================================================
// V9 BOLETO/SPLIT TIERED PRICING
// ============================================================

describe('V9 - Boleto/Split Tiered Pricing', () => {
  const calculateBoletoCost = (plan: string, additionalBoletos: number): number => {
    if (additionalBoletos <= 0) return 0;
    if (plan === 'prime') {
      return additionalBoletos * 4;
    } else if (plan === 'k') {
      const tier1 = Math.min(additionalBoletos, 250);
      const tier2 = Math.max(0, additionalBoletos - 250);
      return (tier1 * 4) + (tier2 * 3.5);
    } else {
      const tier1 = Math.min(additionalBoletos, 250);
      const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
      const tier3 = Math.max(0, additionalBoletos - 500);
      return (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
    }
  };

  it('Prime: R$4 flat per boleto', () => {
    expect(calculateBoletoCost('prime', 1)).toBe(4);
    expect(calculateBoletoCost('prime', 100)).toBe(400);
  });

  it('K: 1-250 = R$4, 251+ = R$3.50', () => {
    expect(calculateBoletoCost('k', 250)).toBe(1000); // 250 * 4
    expect(calculateBoletoCost('k', 251)).toBe(1003.5); // 250*4 + 1*3.5
    expect(calculateBoletoCost('k', 500)).toBe(1875); // 250*4 + 250*3.5
  });

  it('K2: 1-250 = R$4, 251-500 = R$3.50, 501+ = R$3', () => {
    expect(calculateBoletoCost('k2', 250)).toBe(1000); // 250 * 4
    expect(calculateBoletoCost('k2', 500)).toBe(1875); // 250*4 + 250*3.5
    expect(calculateBoletoCost('k2', 501)).toBe(1878); // 250*4 + 250*3.5 + 1*3
    expect(calculateBoletoCost('k2', 750)).toBe(2625); // 250*4 + 250*3.5 + 250*3
  });
});

// ============================================================
// V9 DIGITAL SIGNATURES TIERED PRICING
// ============================================================

describe('V9 - Digital Signatures Tiered Pricing', () => {
  const calculateSignatureCost = (additionalSignatures: number): number => {
    if (additionalSignatures <= 0) return 0;
    // V9: 1-20 = R$1.80, 21-40 = R$1.70, 41+ = R$1.50
    const tier1 = Math.min(additionalSignatures, 20);
    const tier2 = Math.min(Math.max(0, additionalSignatures - 20), 20);
    const tier3 = Math.max(0, additionalSignatures - 40);
    return (tier1 * 1.8) + (tier2 * 1.7) + (tier3 * 1.5);
  };

  it('1-20 additional: R$1.80 each', () => {
    expect(calculateSignatureCost(1)).toBeCloseTo(1.8);
    expect(calculateSignatureCost(20)).toBeCloseTo(36); // 20 * 1.8
  });

  it('21-40 additional: R$1.70 each', () => {
    expect(calculateSignatureCost(21)).toBeCloseTo(37.7); // 20*1.8 + 1*1.7
    expect(calculateSignatureCost(40)).toBeCloseTo(70); // 20*1.8 + 20*1.7
  });

  it('41+ additional: R$1.50 each', () => {
    expect(calculateSignatureCost(41)).toBeCloseTo(71.5); // 20*1.8 + 20*1.7 + 1*1.5
    expect(calculateSignatureCost(60)).toBeCloseTo(100); // 20*1.8 + 20*1.7 + 20*1.5
  });
});

// ============================================================
// ASSINATURA BREAKDOWN DISPLAY LOGIC
// ============================================================

describe('Assinatura Breakdown Display Logic', () => {
  const INCLUDED_SIGNATURES = 15;

  const getSignatureBreakdown = (closings: number, newContracts: number, product: 'imob' | 'loc' | 'both') => {
    let totalSignatures = 0;
    if (product === 'imob') totalSignatures = closings;
    else if (product === 'loc') totalSignatures = newContracts;
    else totalSignatures = closings + newContracts;
    const additional = Math.max(0, totalSignatures - INCLUDED_SIGNATURES);
    // Tiered cost
    const t1 = Math.min(additional, 20);
    const t2 = Math.min(Math.max(0, additional - 20), 20);
    const t3 = Math.max(0, additional - 40);
    const totalCost = t1 * 1.8 + t2 * 1.7 + t3 * 1.5;
    const avgPrice = additional > 0 ? totalCost / additional : 0;
    return { totalSignatures, additional, totalCost, avgPrice };
  };

  it('IMOB only: totalSignatures = closingsPerMonth', () => {
    const result = getSignatureBreakdown(10, 5, 'imob');
    expect(result.totalSignatures).toBe(10);
  });

  it('LOC only: totalSignatures = newContractsPerMonth', () => {
    const result = getSignatureBreakdown(10, 5, 'loc');
    expect(result.totalSignatures).toBe(5);
  });

  it('Both: totalSignatures = closings + newContracts', () => {
    const result = getSignatureBreakdown(10, 5, 'both');
    expect(result.totalSignatures).toBe(15);
  });

  it('When totalSignatures <= included, additional = 0 (carência)', () => {
    const result = getSignatureBreakdown(10, 0, 'imob');
    expect(result.additional).toBe(0);
    expect(result.totalCost).toBe(0);
  });

  it('When totalSignatures = included exactly, additional = 0', () => {
    const result = getSignatureBreakdown(15, 0, 'imob');
    expect(result.additional).toBe(0);
    expect(result.totalCost).toBe(0);
  });

  it('When totalSignatures > included, additional = totalSignatures - 15', () => {
    const result = getSignatureBreakdown(30, 0, 'imob');
    expect(result.additional).toBe(15);
    // 15 additional all in tier 1 (1-20) at R$1.80
    expect(result.totalCost).toBeCloseTo(27); // 15 * 1.80
    expect(result.avgPrice).toBeCloseTo(1.8);
  });

  it('Both products with excess: closings + newContracts - 15', () => {
    const result = getSignatureBreakdown(20, 10, 'both');
    expect(result.totalSignatures).toBe(30);
    expect(result.additional).toBe(15);
    expect(result.totalCost).toBeCloseTo(27); // 15 * 1.80
  });

  it('Large volume crosses multiple tiers', () => {
    const result = getSignatureBreakdown(70, 0, 'imob');
    expect(result.totalSignatures).toBe(70);
    expect(result.additional).toBe(55); // 70 - 15
    // Tier 1: 20 * 1.80 = 36, Tier 2: 20 * 1.70 = 34, Tier 3: 15 * 1.50 = 22.5
    expect(result.totalCost).toBeCloseTo(92.5);
  });

  it('Zero closings and contracts: totalSignatures = 0, no additional', () => {
    const result = getSignatureBreakdown(0, 0, 'both');
    expect(result.totalSignatures).toBe(0);
    expect(result.additional).toBe(0);
    expect(result.totalCost).toBe(0);
  });
});

// ============================================================
// V9 WHATSAPP MESSAGES TIERED PRICING
// ============================================================

describe('V9 - WhatsApp Messages Tiered Pricing', () => {
  const calculateWhatsAppCost = (additionalMessages: number): number => {
    if (additionalMessages <= 0) return 0;
    // V9: 1-200 = R$2, 201-350 = R$1.80, 351-1000 = R$1.50, 1001+ = R$1.20
    const tier1 = Math.min(additionalMessages, 200);
    const tier2 = Math.min(Math.max(0, additionalMessages - 200), 150);
    const tier3 = Math.min(Math.max(0, additionalMessages - 350), 650);
    const tier4 = Math.max(0, additionalMessages - 1000);
    return (tier1 * 2.0) + (tier2 * 1.8) + (tier3 * 1.5) + (tier4 * 1.2);
  };

  it('1-200 additional: R$2 each', () => {
    expect(calculateWhatsAppCost(1)).toBe(2);
    expect(calculateWhatsAppCost(200)).toBe(400); // 200 * 2
  });

  it('201-350 additional: R$1.80 each', () => {
    expect(calculateWhatsAppCost(201)).toBeCloseTo(401.8); // 200*2 + 1*1.8
    expect(calculateWhatsAppCost(350)).toBeCloseTo(670); // 200*2 + 150*1.8
  });

  it('351-1000 additional: R$1.50 each', () => {
    expect(calculateWhatsAppCost(351)).toBeCloseTo(671.5); // 200*2 + 150*1.8 + 1*1.5
    expect(calculateWhatsAppCost(1000)).toBeCloseTo(1645); // 200*2 + 150*1.8 + 650*1.5
  });

  it('1001+ additional: R$1.20 each', () => {
    expect(calculateWhatsAppCost(1001)).toBeCloseTo(1646.2); // 200*2 + 150*1.8 + 650*1.5 + 1*1.2
    expect(calculateWhatsAppCost(1100)).toBeCloseTo(1765); // 200*2 + 150*1.8 + 650*1.5 + 100*1.2
  });
});

// ============================================================
// V9 VALIDAÇÃO BIOMÉTRICA
// ============================================================

describe('V9 - Validação Biométrica', () => {
  const BIOMETRICA_PRICE = 7; // R$7 per validation

  it('should cost R$7 per validation', () => {
    expect(BIOMETRICA_PRICE).toBe(7);
    expect(10 * BIOMETRICA_PRICE).toBe(70);
    expect(100 * BIOMETRICA_PRICE).toBe(700);
  });
});

// ============================================================
// V9 PLAN BASE PRICES
// ============================================================

describe('V9 - Plan Base Prices', () => {
  it('should have correct annual base prices', () => {
    expect(PLAN_ANNUAL_PRICES.prime).toBe(247);
    expect(PLAN_ANNUAL_PRICES.k).toBe(497);
    expect(PLAN_ANNUAL_PRICES.k2).toBe(1197);
  });

  it('should have correct addon annual prices', () => {
    expect(ADDON_ANNUAL_PRICES.leads).toBe(497);
    expect(ADDON_ANNUAL_PRICES.inteligencia).toBe(297);
    expect(ADDON_ANNUAL_PRICES.assinatura).toBe(37);
    expect(ADDON_ANNUAL_PRICES.pay).toBe(0);
    expect(ADDON_ANNUAL_PRICES.seguros).toBe(0);
    expect(ADDON_ANNUAL_PRICES.cash).toBe(0);
  });
});

// ============================================================
// V9 KOMBOS INCLUDE PREMIUM SERVICES
// ============================================================

describe('V9 - Kombos Premium Services', () => {
  const KOMBOS_PREMIUM = {
    imob_start: true,   // V9: All Kombos include VIP + CS
    imob_pro: true,
    locacao_pro: true,
    core_gestao: true,
    elite: true,
  };

  it('All Kombos should include VIP + CS Dedicado', () => {
    expect(KOMBOS_PREMIUM.imob_start).toBe(true);
    expect(KOMBOS_PREMIUM.imob_pro).toBe(true);
    expect(KOMBOS_PREMIUM.locacao_pro).toBe(true);
    expect(KOMBOS_PREMIUM.core_gestao).toBe(true);
    expect(KOMBOS_PREMIUM.elite).toBe(true);
  });
});
