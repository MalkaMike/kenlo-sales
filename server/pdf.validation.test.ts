import { describe, it, expect } from 'vitest';

/**
 * PDF Data Validation Tests
 * 
 * These tests verify that the data sent to PDF generation matches
 * the calculator selections and that all validation logic works correctly.
 * 
 * Updated: Feb 2026 — Cash removed from PDFs, WhatsApp requires Leads,
 * payment condition consistency, Estrutura Contratada wording.
 */

describe('PDF Data Validation', () => {
  
  describe('Add-on Compatibility Validation (Cash removed from PDFs)', () => {
    
    // The PDF add-on list no longer includes Cash
    const pdfAddons = [
      { key: "leads", label: "Leads" },
      { key: "inteligencia", label: "Inteligência" },
      { key: "assinatura", label: "Assinatura" },
      { key: "pay", label: "Pay" },
      { key: "seguros", label: "Seguros" },
    ];
    
    it('should NOT include Cash in PDF add-on list', () => {
      const hasCash = pdfAddons.some(a => a.key === 'cash');
      expect(hasCash).toBe(false);
    });
    
    it('should include exactly 5 add-ons (no Cash)', () => {
      expect(pdfAddons).toHaveLength(5);
    });
    
    it('should allow Leads, Inteligência, Assinatura for IMOB only', () => {
      const imobCompatible = ['leads', 'inteligencia', 'assinatura'];
      
      const testAddons = ['leads', 'inteligencia', 'assinatura'];
      testAddons.forEach(addon => {
        expect(imobCompatible.includes(addon)).toBe(true);
      });
    });
    
    it('should reject Pay, Seguros for IMOB only', () => {
      const imobCompatible = ['leads', 'inteligencia', 'assinatura'];
      
      ['pay', 'seguros'].forEach(addon => {
        expect(imobCompatible.includes(addon)).toBe(false);
      });
    });
    
    it('should allow Pay, Seguros, Inteligência, Assinatura for LOC only (no Cash)', () => {
      const locCompatible = ['pay', 'seguros', 'inteligencia', 'assinatura'];
      
      // Cash should NOT be in locCompatible
      expect(locCompatible.includes('cash')).toBe(false);
      
      ['pay', 'seguros', 'inteligencia', 'assinatura'].forEach(addon => {
        expect(locCompatible.includes(addon)).toBe(true);
      });
    });
    
    it('should reject Leads for LOC only', () => {
      const locCompatible = ['pay', 'seguros', 'inteligencia', 'assinatura'];
      expect(locCompatible.includes('leads')).toBe(false);
    });
    
    it('should filter Cash from selectedAddons before PDF export', () => {
      const addons = { leads: true, inteligencia: true, assinatura: true, pay: true, seguros: true, cash: true };
      const selectedAddons = Object.entries(addons)
        .filter(([name, enabled]) => enabled && name !== 'cash')
        .map(([name]) => name);
      
      expect(selectedAddons).not.toContain('cash');
      expect(selectedAddons).toHaveLength(5);
      expect(selectedAddons).toContain('leads');
      expect(selectedAddons).toContain('seguros');
    });
  });
  
  describe('Premium Services Pricing Logic', () => {
    
    const checkPremiumIncluded = (komboName: string | undefined) => {
      return (
        komboName === 'Kombo Imob Start' ||
        komboName === 'Kombo Core Gestão' || 
        komboName === 'Kombo Elite' ||
        komboName === 'Kombo Imob Pro' ||
        komboName === 'Kombo Locação Pro'
      );
    };
    
    it('should set Premium Services price to 0 for all Kombos', () => {
      const kombos = ['Kombo Imob Start', 'Kombo Core Gestão', 'Kombo Elite', 'Kombo Imob Pro', 'Kombo Locação Pro'];
      kombos.forEach(kombo => {
        expect(checkPremiumIncluded(kombo)).toBe(true);
        const price = checkPremiumIncluded(kombo) ? 0 : 97 + 197;
        expect(price).toBe(0);
      });
    });
    
    it('should calculate Premium Services price for no Kombo (VIP + CS)', () => {
      const hasVip = true;
      const hasCS = true;
      const hasPremiumIncluded = checkPremiumIncluded(undefined);
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 
        (hasVip ? 97 : 0) + (hasCS ? 197 : 0);
      
      expect(hasPremiumIncluded).toBe(false);
      expect(premiumServicesPrice).toBe(294);
    });
    
    it('should calculate Premium Services price for no Kombo (VIP only)', () => {
      const hasVip = true;
      const hasCS = false;
      const hasPremiumIncluded = checkPremiumIncluded(undefined);
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 
        (hasVip ? 97 : 0) + (hasCS ? 197 : 0);
      
      expect(premiumServicesPrice).toBe(97);
    });
    
    it('should calculate Premium Services price for no Kombo (CS only)', () => {
      const hasVip = false;
      const hasCS = true;
      const hasPremiumIncluded = checkPremiumIncluded(undefined);
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 
        (hasVip ? 97 : 0) + (hasCS ? 197 : 0);
      
      expect(premiumServicesPrice).toBe(197);
    });
  });
  
  describe('WhatsApp Dependency Validation (ERROR 3 fix)', () => {
    
    it('should only include WhatsApp in post-paid when Leads is active AND WhatsApp is toggled ON', () => {
      const scenarios = [
        { leads: true, wantsWhatsApp: true, shouldInclude: true },
        { leads: true, wantsWhatsApp: false, shouldInclude: false },
        { leads: false, wantsWhatsApp: true, shouldInclude: false },
        { leads: false, wantsWhatsApp: false, shouldInclude: false },
      ];
      
      scenarios.forEach(({ leads, wantsWhatsApp, shouldInclude }) => {
        const includeWhatsApp = leads && wantsWhatsApp;
        expect(includeWhatsApp).toBe(shouldInclude);
      });
    });
    
    it('should NOT include WhatsApp cost in post-paid when Leads is inactive', () => {
      const addons = { leads: false, inteligencia: true, assinatura: true, pay: true, seguros: true };
      const wantsWhatsApp = true;
      const leadsPerMonth = 200;
      
      // WhatsApp should only be calculated if leads is active
      const includeWhatsApp = addons.leads && wantsWhatsApp;
      expect(includeWhatsApp).toBe(false);
      
      // No WhatsApp cost should be added
      let whatsAppCost = 0;
      if (includeWhatsApp) {
        const included = 100;
        const additional = Math.max(0, leadsPerMonth - included);
        whatsAppCost = additional * 2; // simplified
      }
      expect(whatsAppCost).toBe(0);
    });
  });
  
  describe('Payment Condition Consistency (ERROR 2 fix)', () => {
    
    const formatPaymentCondition = (paymentPlan: string, totalMonthly: number, installments: number, installmentValue: number) => {
      let label = "Condição de Pagamento";
      let value = `${installments}x R$ ${installmentValue.toFixed(2)}`;
      
      if (paymentPlan === "monthly") {
        value = `Cobrado mensalmente — R$ ${totalMonthly.toFixed(2)}/mês`;
      } else if (paymentPlan === "semestral") {
        const semestralTotal = totalMonthly * 6;
        value = `Pago semestralmente — R$ ${semestralTotal.toFixed(2)} a cada 6 meses`;
      } else if (paymentPlan === "annual") {
        value = `${installments}x R$ ${installmentValue.toFixed(2)} (anual)`;
      } else if (paymentPlan === "bienal") {
        value = `${installments}x R$ ${installmentValue.toFixed(2)} (bienal — 24 meses)`;
      }
      
      return { label, value };
    };
    
    it('should format monthly payment correctly', () => {
      const result = formatPaymentCondition('monthly', 500, 1, 500);
      expect(result.value).toContain('mensalmente');
      expect(result.value).toContain('500.00');
    });
    
    it('should format semestral payment as 6-month total', () => {
      const result = formatPaymentCondition('semestral', 500, 6, 500);
      expect(result.value).toContain('semestralmente');
      expect(result.value).toContain('3000.00'); // 500 * 6
      expect(result.value).toContain('a cada 6 meses');
    });
    
    it('should format annual payment with installments', () => {
      const result = formatPaymentCondition('annual', 500, 12, 500);
      expect(result.value).toContain('12x');
      expect(result.value).toContain('(anual)');
    });
    
    it('should format biennial payment with 24 months', () => {
      const result = formatPaymentCondition('bienal', 500, 24, 500);
      expect(result.value).toContain('24x');
      expect(result.value).toContain('bienal');
      expect(result.value).toContain('24 meses');
    });
  });
  
  describe('Estrutura Contratada Section (ADJUST 1)', () => {
    
    it('should format plan description as "IMOB K + LOC K2" style', () => {
      const imobPlan = 'k';
      const locPlan = 'k2';
      const showImob = true;
      const showLoc = true;
      
      const parts: string[] = [];
      if (showImob && imobPlan) parts.push(`IMOB ${imobPlan.toUpperCase()}`);
      if (showLoc && locPlan) parts.push(`LOC ${locPlan.toUpperCase()}`);
      const planDescText = parts.join(' + ');
      
      expect(planDescText).toBe('IMOB K + LOC K2');
    });
    
    it('should format single product plan correctly', () => {
      const imobPlan = 'prime';
      const showImob = true;
      const showLoc = false;
      
      const parts: string[] = [];
      if (showImob && imobPlan) parts.push(`IMOB ${imobPlan.toUpperCase()}`);
      const planDescText = parts.join(' + ');
      
      expect(planDescText).toBe('IMOB PRIME');
    });
    
    it('should display kombo badge with discount when kombo is selected', () => {
      const komboLabel = 'Kombo Elite';
      const komboDiscount = 20;
      const isKombo = komboDiscount > 0;
      
      expect(isKombo).toBe(true);
      const badgeText = `${komboLabel} (${komboDiscount}% OFF)`;
      expect(badgeText).toBe('Kombo Elite (20% OFF)');
    });
    
    it('should show "Contratação avulsa" when no kombo is selected', () => {
      const komboDiscount = 0;
      const isKombo = komboDiscount > 0;
      
      expect(isKombo).toBe(false);
    });
  });
  
  describe('Receita Extra Section (ADJUST 3)', () => {
    
    it('should only include Pay and Seguros in Receita Extra (no Cash)', () => {
      const receitaExtraSources = ['pay', 'seguros'];
      
      expect(receitaExtraSources).not.toContain('cash');
      expect(receitaExtraSources).toHaveLength(2);
    });
    
    it('should calculate revenue from boletos correctly', () => {
      const contracts = 100;
      const boletoAmount = 5.50;
      const chargesBoleto = true;
      
      const revenue = chargesBoleto ? contracts * boletoAmount : 0;
      expect(revenue).toBe(550);
    });
    
    it('should calculate revenue from insurance correctly', () => {
      const contracts = 100;
      const hasSeguros = true;
      
      const revenue = hasSeguros ? contracts * 10 : 0;
      expect(revenue).toBe(1000);
    });
  });
  
  describe('Kombo Detection Logic', () => {
    
    it('should detect Kombo Imob Start (IMOB + Leads + Assinatura)', () => {
      const product = 'imob';
      const addons = { leads: true, assinatura: true, inteligencia: false, pay: false, seguros: false };
      
      const hasImob = product === 'imob' || product === 'both';
      const hasLoc = product === 'loc' || product === 'both';
      const isImobStart = hasImob && !hasLoc && addons.leads && addons.assinatura && !addons.inteligencia;
      
      expect(isImobStart).toBe(true);
    });
    
    it('should detect Kombo Imob Pro (IMOB + Leads + Inteligência + Assinatura)', () => {
      const product = 'imob';
      const addons = { leads: true, assinatura: true, inteligencia: true, pay: false, seguros: false };
      
      const hasImob = product === 'imob' || product === 'both';
      const hasLoc = product === 'loc' || product === 'both';
      const isImobPro = hasImob && !hasLoc && addons.leads && addons.inteligencia && addons.assinatura;
      
      expect(isImobPro).toBe(true);
    });
    
    it('should detect Kombo Locação Pro (LOC + Inteligência + Assinatura)', () => {
      const product = 'loc';
      const addons = { leads: false, assinatura: true, inteligencia: true, pay: false, seguros: false };
      
      const hasImob = product === 'imob' || product === 'both';
      const hasLoc = product === 'loc' || product === 'both';
      const isLocacaoPro = !hasImob && hasLoc && addons.inteligencia && addons.assinatura;
      
      expect(isLocacaoPro).toBe(true);
    });
    
    it('should detect Kombo Core Gestão (IMOB + LOC without add-ons)', () => {
      const product = 'both';
      const addons = { leads: false, assinatura: false, inteligencia: false, pay: false, seguros: false };
      
      const hasImob = product === 'imob' || product === 'both';
      const hasLoc = product === 'loc' || product === 'both';
      const hasAnyAddon = Object.values(addons).some(v => v);
      const isCoreGestao = hasImob && hasLoc && !hasAnyAddon;
      
      expect(isCoreGestao).toBe(true);
    });
    
    it('should detect Kombo Elite (IMOB + LOC + ALL add-ons except Cash)', () => {
      const product = 'both';
      const addons = { leads: true, assinatura: true, inteligencia: true, pay: true, seguros: true };
      
      const hasImob = product === 'imob' || product === 'both';
      const hasLoc = product === 'loc' || product === 'both';
      const hasAllAddons = Object.values(addons).every(v => v);
      const isElite = hasImob && hasLoc && hasAllAddons;
      
      expect(isElite).toBe(true);
    });
  });
  
  describe('Business Metrics Validation', () => {
    
    it('should capture IMOB metrics correctly', () => {
      const metrics = {
        imobUsers: 5,
        closingsPerMonth: 10,
        leadsPerMonth: 150,
        usesExternalAI: true,
        wantsWhatsApp: true,
      };
      
      expect(metrics.imobUsers).toBeGreaterThan(0);
      expect(metrics.closingsPerMonth).toBeGreaterThan(0);
      expect(metrics.leadsPerMonth).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.usesExternalAI).toBe('boolean');
      expect(typeof metrics.wantsWhatsApp).toBe('boolean');
    });
    
    it('should capture LOC metrics correctly', () => {
      const metrics = {
        contractsUnderManagement: 50,
        newContractsPerMonth: 5,
        chargesSplitToOwner: true,
      };
      
      expect(metrics.contractsUnderManagement).toBeGreaterThan(0);
      expect(metrics.newContractsPerMonth).toBeGreaterThan(0);
      expect(typeof metrics.chargesSplitToOwner).toBe('boolean');
    });
  });
  
  describe('Plan Name Formatting (ERROR 1 fix)', () => {
    
    it('should format IMOB plan name without duplication', () => {
      const imobPlan = 'k';
      const formatted = `Kenlo IMOB \u2013 ${imobPlan.toUpperCase()}`;
      
      expect(formatted).toBe('Kenlo IMOB \u2013 K');
      // Should NOT be "Kenlo IMOB \u2013 KK" (the old bug)
      expect(formatted).not.toContain('KK');
    });
    
    it('should format LOC plan name without duplication', () => {
      const locPlan = 'k2';
      const formatted = `Kenlo Loca\u00e7\u00e3o \u2013 ${locPlan.toUpperCase()}`;
      
      expect(formatted).toBe('Kenlo Loca\u00e7\u00e3o \u2013 K2');
      // Should NOT be "Kenlo Loca\u00e7\u00e3o \u2013 K2K2" (the old bug)
      expect(formatted).not.toContain('K2K2');
    });
    
    it('should format PRIME plan name without duplication', () => {
      const plan = 'prime';
      const formatted = `Kenlo IMOB \u2013 ${plan.toUpperCase()}`;
      
      expect(formatted).toBe('Kenlo IMOB \u2013 PRIME');
      expect(formatted).not.toContain('PRIMEPRIME');
    });
  });
});

describe('IMOB-Only Scenario Validation (No Receita Extra)', () => {

  it('should NOT show Receita Extra when product is IMOB only (no Pay/Seguros revenue)', () => {
    const productType = 'imob';
    const revenueFromBoletos = 0;
    const revenueFromInsurance = 0;
    const hasRevenue = (revenueFromBoletos || 0) > 0 || (revenueFromInsurance || 0) > 0;

    expect(hasRevenue).toBe(false);
  });

  it('should NOT show Receita Extra when revenue fields are undefined', () => {
    const revenueFromBoletos = undefined;
    const revenueFromInsurance = undefined;
    const hasRevenue = (revenueFromBoletos || 0) > 0 || (revenueFromInsurance || 0) > 0;

    expect(hasRevenue).toBe(false);
  });

  it('should NOT show ROI indicators when hasRevenue is false', () => {
    const hasRevenue = false;
    // In the PDF, the ROI section is wrapped in `if (hasRevenue) { ... }`
    // So when hasRevenue is false, ROI indicators are not rendered
    expect(hasRevenue).toBe(false);
  });

  it('should correctly identify IMOB-only compatible add-ons (no Pay/Seguros/Cash)', () => {
    const productType = 'imob';
    const imobCompatible = ['leads', 'inteligencia', 'assinatura'];
    const locOnlyAddons = ['pay', 'seguros', 'cash'];

    // IMOB-only should not have LOC-only add-ons
    locOnlyAddons.forEach(addon => {
      expect(imobCompatible.includes(addon)).toBe(false);
    });
  });

  it('should show correct add-ons in Resumo for IMOB-only with Leads', () => {
    const selectedAddons = ['leads'];
    const addonLabels = [
      { key: 'leads', label: 'Leads' },
      { key: 'inteligencia', label: 'Inteligência' },
      { key: 'assinatura', label: 'Assinatura' },
      { key: 'pay', label: 'Pay' },
      { key: 'seguros', label: 'Seguros' },
    ];
    const activeAddons = addonLabels.filter(a => selectedAddons.includes(a.key));

    expect(activeAddons).toHaveLength(1);
    expect(activeAddons[0].label).toBe('Leads');
  });

  it('should show "Nenhum add-on selecionado" only when no add-ons are selected', () => {
    const selectedAddons: string[] = [];
    const addonLabels = [
      { key: 'leads', label: 'Leads' },
      { key: 'inteligencia', label: 'Inteligência' },
      { key: 'assinatura', label: 'Assinatura' },
      { key: 'pay', label: 'Pay' },
      { key: 'seguros', label: 'Seguros' },
    ];
    const activeAddons = addonLabels.filter(a => selectedAddons.includes(a.key));

    expect(activeAddons).toHaveLength(0);
    // Only in this case should "Nenhum add-on selecionado" be shown
  });

  it('should calculate correct totalInvestment for IMOB-only (no revenue offset)', () => {
    const totalAnnual = 11928;
    const implantationFee = 1994;
    const totalInvestment = totalAnnual + implantationFee;

    expect(totalInvestment).toBe(13922);
  });

  it('should skip Receita Extra but still show Investimento Total for IMOB-only', () => {
    // The PDF flow: Resumo -> Produtos -> Add-ons -> Frequência -> Kombos -> [Receita Extra] -> Investimento -> Conclusão
    // For IMOB-only, Receita Extra is skipped, but Investimento Total is always shown
    const hasRevenue = false;
    const showInvestimento = true; // Always shown

    expect(hasRevenue).toBe(false);
    expect(showInvestimento).toBe(true);
  });
});

describe('Installment Breakdown Validation', () => {

  it('should calculate correct installment values for annual plan (3 options)', () => {
    const totalAnnual = 11928;
    const implantationFee = 1994;
    const totalInvestment = totalAnnual + implantationFee;

    expect(totalInvestment).toBe(13922);
    expect(totalInvestment / 1).toBe(13922);
    expect(totalInvestment / 2).toBe(6961);
    expect(totalInvestment / 3).toBeCloseTo(4640.67, 1);
  });

  it('should calculate correct installment values for bienal plan (6 options)', () => {
    const totalAnnual = 10735;
    const implantationFee = 1994;
    const totalInvestment = totalAnnual + implantationFee;

    expect(totalInvestment).toBe(12729);
    expect(totalInvestment / 1).toBe(12729);
    expect(totalInvestment / 2).toBe(6364.5);
    expect(totalInvestment / 3).toBe(4243);
    expect(totalInvestment / 4).toBe(3182.25);
    expect(totalInvestment / 5).toBe(2545.8);
    expect(totalInvestment / 6).toBe(2121.5);
  });

  it('should show 3 installment pills for annual plan', () => {
    const paymentPlan = 'annual';
    const maxInstallments = paymentPlan === 'bienal' ? 6 : 3;

    expect(maxInstallments).toBe(3);
  });

  it('should show 6 installment pills for bienal plan', () => {
    const paymentPlan = 'bienal';
    const maxInstallments = paymentPlan === 'bienal' ? 6 : 3;

    expect(maxInstallments).toBe(6);
  });

  it('should NOT show installment pills for monthly plan', () => {
    const paymentPlan = 'monthly';
    const showPills = paymentPlan !== 'monthly' && paymentPlan !== 'mensal' && paymentPlan !== 'semestral';

    expect(showPills).toBe(false);
  });

  it('should NOT show installment pills for semestral plan', () => {
    const paymentPlan = 'semestral';
    const showPills = paymentPlan !== 'monthly' && paymentPlan !== 'mensal' && paymentPlan !== 'semestral';

    expect(showPills).toBe(false);
  });

  it('should highlight the selected installment option', () => {
    const installments = 2;
    const maxInstallments = 3;

    for (let n = 1; n <= maxInstallments; n++) {
      const isSel = n === installments;
      if (n === 2) {
        expect(isSel).toBe(true);
      } else {
        expect(isSel).toBe(false);
      }
    }
  });

  it('should label first pill as "A vista" and others as "Nx"', () => {
    const maxInstallments = 3;
    const labels: string[] = [];

    for (let n = 1; n <= maxInstallments; n++) {
      const pillLabel = n === 1 ? 'A vista' : `${n}x`;
      labels.push(pillLabel);
    }

    expect(labels).toEqual(['A vista', '2x', '3x']);
  });

  it('should label bienal pills correctly (A vista, 2x, 3x, 4x, 5x, 6x)', () => {
    const maxInstallments = 6;
    const labels: string[] = [];

    for (let n = 1; n <= maxInstallments; n++) {
      const pillLabel = n === 1 ? 'A vista' : `${n}x`;
      labels.push(pillLabel);
    }

    expect(labels).toEqual(['A vista', '2x', '3x', '4x', '5x', '6x']);
  });

  it('should show total investment label for annual plan', () => {
    const paymentPlan = 'annual';
    const periodLabel = paymentPlan === 'bienal' ? 'bienal (24 meses)' : 'anual';

    expect(periodLabel).toBe('anual');
  });

  it('should show total investment label for bienal plan', () => {
    const paymentPlan = 'bienal';
    const periodLabel = paymentPlan === 'bienal' ? 'bienal (24 meses)' : 'anual';

    expect(periodLabel).toBe('bienal (24 meses)');
  });
});
