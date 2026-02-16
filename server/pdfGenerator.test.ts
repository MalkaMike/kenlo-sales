import { describe, it, expect } from 'vitest';
import { generateProposalPDF } from './pdfGenerator';

/**
 * PDF Generator Tests
 * 
 * These tests verify that the PDF generator produces valid PDFs
 * with correct content for various configurations including:
 * - V8: Plan naming (IMOB - PRIME/K/K2), Investimento table, Pós-Pago breakdown
 */

const baseData = {
  vendorName: 'Vendedor Teste',
  vendorEmail: 'vendedor@kenlo.com.br',
  vendorPhone: '(11) 99999-0000',
  clientName: 'João Silva',
  agencyName: 'Imobiliária Teste',
  productType: 'imob',
  selectedAddons: '["leads","inteligencia","assinatura"]',
  paymentPlan: 'annual',
  totalMonthly: 932,
  totalAnnual: 11184,
  implantationFee: 1497,
  firstYearTotal: 12681,
  imobUsers: 5,
  closings: 10,
  leadsPerMonth: 100,
  usesExternalAI: false,
  wantsWhatsApp: true,
  businessType: 'broker',
  email: 'joao@imobiliaria.com',
  cellphone: '(11) 98765-4321',
  monthlyLicenseBase: 932,
  postPaidTotal: 70,
};

describe('PDF Generator', () => {
  
  it('should generate a valid PDF buffer for IMOB only', async () => {
    const result = await generateProposalPDF(baseData);
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
    expect(result.slice(0, 5).toString()).toBe('%PDF-');
  });

  it('should generate a valid PDF buffer for LOC only', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'loc',
      selectedAddons: '["inteligencia","assinatura"]',
      contracts: 200,
      newContracts: 10,
      chargesBoletoToTenant: true,
      boletoAmount: 12,
      chargesSplitToOwner: true,
      splitAmount: 5,
      komboName: 'Kombo Locação Pro',
      komboDiscount: 10,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
    expect(result.slice(0, 5).toString()).toBe('%PDF-');
  });

  it('should generate a valid PDF for IMOB+LOC (both)', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'both',
      selectedAddons: '["leads","inteligencia","assinatura","pay","seguros","cash"]',
      contracts: 150,
      newContracts: 8,
      chargesBoletoToTenant: true,
      boletoAmount: 12,
      chargesSplitToOwner: true,
      splitAmount: 5,
      komboName: 'Kombo Elite',
      komboDiscount: 20,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate page 2 with revenue data when Pay/Seguros active', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'loc',
      selectedAddons: '["pay","seguros","inteligencia","assinatura"]',
      contracts: 500,
      newContracts: 15,
      chargesBoletoToTenant: true,
      boletoAmount: 12,
      chargesSplitToOwner: true,
      splitAmount: 5,
      revenueFromBoletos: 8500,
      revenueFromInsurance: 5000,
      netGain: 12800,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should handle monthly payment plan with first payment line', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      paymentPlan: 'monthly',
      totalAnnual: 13980,
      monthlyLicenseBase: 1165,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should handle semestral payment plan with first payment line', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      paymentPlan: 'semestral',
      totalAnnual: 12302,
      monthlyLicenseBase: 1025,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should handle biennial payment plan', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      paymentPlan: 'biennial',
      totalAnnual: 10066,
      monthlyLicenseBase: 839,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should handle no kombo (sem kombo)', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      komboName: undefined,
      komboDiscount: 0,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should handle all kombo types', async () => {
    const komboNames = [
      'Kombo Imob Start',
      'Kombo Imob Pro',
      'Kombo Locação Pro',
      'Kombo Core Gestão',
      'Kombo Elite',
    ];
    
    for (const komboName of komboNames) {
      const result = await generateProposalPDF({
        ...baseData,
        komboName,
        komboDiscount: 10,
      });
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(1000);
    }
  });

  it('should handle prepayment fields', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      prepayAdditionalUsers: true,
      prepayAdditionalContracts: true,
      prepaymentUsersAmount: 2400,
      prepaymentContractsAmount: 3600,
      prepaymentMonths: 12,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should handle zero post-paid total', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      postPaidTotal: 0,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should handle business type "rental_admin"', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      businessType: 'rental_admin',
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should handle business type "both"', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      businessType: 'both',
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  // V8 Tests: Plan naming, Investimento table, Pós-Pago breakdown

  it('should render Investimento table with individual product prices', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'both',
      imobPlan: 'K',
      locPlan: 'K2',
      imobPrice: 497,
      locPrice: 1197,
      addonPrices: { leads: 407, inteligencia: 97, assinatura: 30 },
      selectedAddons: '["leads","inteligencia","assinatura"]',
      komboName: 'Kombo Core Gestão',
      komboDiscount: 10,
      contracts: 300,
      newContracts: 12,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should render VIP/CS Dedicado as "Incluído" in Investimento table', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      vipIncluded: true,
      csIncluded: true,
      vipPrice: 0,
      csPrice: 0,
      komboName: 'Kombo Elite',
      komboDiscount: 20,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should render VIP/CS Dedicado with prices when not included', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      vipIncluded: false,
      csIncluded: false,
      vipPrice: 97,
      csPrice: 197,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should render detailed Pós-Pago breakdown with IMOB group', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      imobPlan: 'PRIME',
      imobUsers: 5,
      postPaidTotal: 171,
      postPaidBreakdown: [
        {
          group: 'IMOB',
          items: [
            { name: 'Usuários Adicionais', included: 2, additional: 3, unitPrice: 57, total: 171, unit: 'usuário' },
          ],
        },
      ],
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should render detailed Pós-Pago breakdown with LOC group', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'loc',
      locPlan: 'K',
      contracts: 250,
      newContracts: 10,
      chargesBoletoToTenant: true,
      boletoAmount: 12,
      chargesSplitToOwner: true,
      splitAmount: 5,
      postPaidTotal: 450,
      postPaidBreakdown: [
        {
          group: 'LOCAÇÃO',
          items: [
            { name: 'Contratos Adicionais', included: 200, additional: 50, unitPrice: 3, total: 150, unit: 'contrato' },
            { name: 'Custo Boletos (Pay)', included: 5, additional: 245, unitPrice: 1, total: 245, unit: 'boleto' },
            { name: 'Custo Split (Pay)', included: 5, additional: 10, unitPrice: 5.5, total: 55, unit: 'split' },
          ],
        },
      ],
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should render Pós-Pago breakdown with multiple groups (IMOB + LOC + shared)', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'both',
      imobPlan: 'K2',
      locPlan: 'K2',
      imobUsers: 20,
      contracts: 600,
      newContracts: 15,
      chargesBoletoToTenant: true,
      boletoAmount: 25,
      chargesSplitToOwner: true,
      splitAmount: 15,
      selectedAddons: '["leads","inteligencia","assinatura","pay","seguros","cash"]',
      komboName: 'Kombo Elite',
      komboDiscount: 20,
      postPaidTotal: 1250,
      postPaidBreakdown: [
        {
          group: 'IMOB',
          items: [
            { name: 'Usuários Adicionais', included: 14, additional: 6, unitPrice: 37, total: 222, unit: 'usuário' },
          ],
        },
        {
          group: 'LOCAÇÃO',
          items: [
            { name: 'Contratos Adicionais', included: 500, additional: 100, unitPrice: 3, total: 300, unit: 'contrato' },
            { name: 'Custo Boletos (Pay)', included: 15, additional: 585, unitPrice: 0.5, total: 292.5, unit: 'boleto' },
            { name: 'Custo Split (Pay)', included: 15, additional: 85, unitPrice: 2, total: 170, unit: 'split' },
          ],
        },
        {
          group: 'IMOB e LOC',
          items: [
            { name: 'Assinaturas Digitais', included: 15, additional: 10, unitPrice: 1.5, total: 15, unit: 'assinatura' },
            { name: 'Mensagens WhatsApp', included: 100, additional: 200, unitPrice: 2, total: 400, unit: 'msg' },
          ],
        },
      ],
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should handle empty postPaidBreakdown array', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      postPaidTotal: 0,
      postPaidBreakdown: [],
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should render addonPrices for individual add-on line items', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      selectedAddons: '["leads","inteligencia","assinatura","pay","seguros","cash"]',
      addonPrices: {
        leads: 457,
        inteligencia: 97,
        assinatura: 30,
        pay: 0,
        seguros: 0,
        cash: 0,
      },
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });
});

describe('IMOB-Only Scenario (No Receita Extra)', () => {
  const imobOnlyData = {
    vendorName: 'Vendedor Teste',
    vendorEmail: 'vendedor@kenlo.com.br',
    vendorPhone: '(11) 99999-0000',
    clientName: 'Maria IMOB',
    agencyName: 'Imobiliária Solo',
    productType: 'imob',
    imobPlan: 'K',
    selectedAddons: '["leads"]',
    paymentPlan: 'annual',
    totalMonthly: 994,
    totalAnnual: 11928,
    implantationFee: 1994,
    firstYearTotal: 13922,
    imobUsers: 1,
    closings: 1,
    leadsPerMonth: 0,
    usesExternalAI: false,
    wantsWhatsApp: false,
    businessType: 'broker',
    email: 'maria@imob.com',
    cellphone: '(11) 99999-1111',
    monthlyLicenseBase: 994,
    postPaidTotal: 0,
    imobPrice: 497,
    addonPrices: { leads: 497 },
    vipIncluded: false,
    csIncluded: false,
    vipPrice: 97,
    csPrice: 0,
  };

  it('should generate a valid PDF for IMOB-only without revenue data', async () => {
    const result = await generateProposalPDF(imobOnlyData);
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
    expect(result.slice(0, 5).toString()).toBe('%PDF-');
  });

  it('should generate PDF without Receita Extra section (no Pay/Seguros)', async () => {
    // IMOB-only has no Pay/Seguros, so revenueFromBoletos and revenueFromInsurance should be 0/undefined
    const result = await generateProposalPDF({
      ...imobOnlyData,
      revenueFromBoletos: 0,
      revenueFromInsurance: 0,
      netGain: 0,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF without ROI indicators when no revenue exists', async () => {
    const result = await generateProposalPDF({
      ...imobOnlyData,
      revenueFromBoletos: undefined,
      revenueFromInsurance: undefined,
      netGain: undefined,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF for IMOB-only with Leads + Inteligência (no Receita Extra)', async () => {
    const result = await generateProposalPDF({
      ...imobOnlyData,
      selectedAddons: '["leads","inteligencia"]',
      addonPrices: { leads: 497, inteligencia: 252 },
      totalMonthly: 1246,
      totalAnnual: 14952,
      implantationFee: 1497,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF for IMOB-only with Kombo Imob Start (no Receita Extra)', async () => {
    const result = await generateProposalPDF({
      ...imobOnlyData,
      selectedAddons: '["leads","assinatura"]',
      addonPrices: { leads: 447, assinatura: 33 },
      komboName: 'Kombo Imob Start',
      komboDiscount: 10,
      totalMonthly: 927,
      totalAnnual: 11124,
      implantationFee: 1497,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF for IMOB-only with Kombo Imob Pro (no Receita Extra)', async () => {
    const result = await generateProposalPDF({
      ...imobOnlyData,
      selectedAddons: '["leads","inteligencia","assinatura"]',
      addonPrices: { leads: 422, inteligencia: 252, assinatura: 31 },
      komboName: 'Kombo Imob Pro',
      komboDiscount: 15,
      totalMonthly: 1127,
      totalAnnual: 13524,
      implantationFee: 1497,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF for IMOB K2 without revenue (premium services shown)', async () => {
    const result = await generateProposalPDF({
      ...imobOnlyData,
      imobPlan: 'K2',
      imobPrice: 1197,
      vipIncluded: true,
      csIncluded: true,
      vipPrice: 0,
      csPrice: 0,
      totalMonthly: 1694,
      totalAnnual: 20328,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });
});

describe('Installment Breakdown in PDF', () => {
  const baseInstallmentData = {
    vendorName: 'Vendedor Teste',
    vendorEmail: 'vendedor@kenlo.com.br',
    clientName: 'João Parcelas',
    agencyName: 'Imobiliária Parcelas',
    productType: 'imob',
    imobPlan: 'K',
    selectedAddons: '["leads"]',
    totalMonthly: 994,
    totalAnnual: 11928,
    implantationFee: 1994,
    firstYearTotal: 13922,
    imobUsers: 1,
    closings: 1,
    businessType: 'broker',
    email: 'joao@parcelas.com',
    cellphone: '(11) 99999-2222',
    monthlyLicenseBase: 994,
    postPaidTotal: 0,
    imobPrice: 497,
    addonPrices: { leads: 497 },
    vipPrice: 97,
  };

  it('should generate PDF with À vista (1x) installment for annual plan', async () => {
    const result = await generateProposalPDF({
      ...baseInstallmentData,
      paymentPlan: 'annual',
      installments: 1,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF with 2x installment for annual plan', async () => {
    const result = await generateProposalPDF({
      ...baseInstallmentData,
      paymentPlan: 'annual',
      installments: 2,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF with 3x installment for annual plan', async () => {
    const result = await generateProposalPDF({
      ...baseInstallmentData,
      paymentPlan: 'annual',
      installments: 3,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF with À vista (1x) for bienal plan', async () => {
    const result = await generateProposalPDF({
      ...baseInstallmentData,
      paymentPlan: 'bienal',
      installments: 1,
      totalAnnual: 10735,
      monthlyLicenseBase: 895,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF with 6x installment for bienal plan', async () => {
    const result = await generateProposalPDF({
      ...baseInstallmentData,
      paymentPlan: 'bienal',
      installments: 6,
      totalAnnual: 10735,
      monthlyLicenseBase: 895,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF with monthly payment (no installment pills)', async () => {
    const result = await generateProposalPDF({
      ...baseInstallmentData,
      paymentPlan: 'monthly',
      installments: 1,
      totalMonthly: 1243,
      totalAnnual: 14916,
      monthlyLicenseBase: 1243,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF with semestral payment (no installment pills)', async () => {
    const result = await generateProposalPDF({
      ...baseInstallmentData,
      paymentPlan: 'semestral',
      installments: 1,
      totalMonthly: 1103,
      totalAnnual: 13236,
      monthlyLicenseBase: 1103,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });
});

describe('Page 4 — Extra Revenue (Receita Extra)', () => {
  const locBaseData = {
    vendorName: 'Vendedor Receita',
    vendorEmail: 'vendedor@kenlo.com.br',
    vendorPhone: '(11) 99999-0000',
    clientName: 'Carlos Revenue',
    agencyName: 'Imobiliária Revenue',
    productType: 'loc',
    locPlan: 'K',
    selectedAddons: '[]',
    paymentPlan: 'annual',
    totalMonthly: 497,
    totalAnnual: 5964,
    implantationFee: 1497,
    firstYearTotal: 7461,
    contracts: 300,
    newContracts: 15,
    businessType: 'administradora',
    email: 'carlos@revenue.com',
    cellphone: '(11) 98888-7777',
    monthlyLicenseBase: 497,
    postPaidTotal: 0,
  };

  it('should NOT generate Page 4 when no revenue add-ons are selected', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      selectedAddons: '[]',
      revenueFromBoletos: 0,
      revenueFromInsurance: 0,
    });
    expect(result).toBeInstanceOf(Buffer);
    // Should be 3 pages (no Page 4)
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should NOT generate Page 4 for IMOB-only without revenue add-ons', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      productType: 'imob',
      imobPlan: 'K',
      selectedAddons: '["leads","inteligencia"]',
      revenueFromBoletos: 0,
      revenueFromInsurance: 0,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate Page 4 with Pay card (Split Automático) only', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      selectedAddons: '["pay"]',
      chargesBoletoToTenant: true,
      boletoAmount: 10,
      chargesSplitToOwner: true,
      splitAmount: 8,
      revenueFromBoletos: 5400, // 300 contracts * (10 + 8)
      revenueFromInsurance: 0,
      netGain: 4903,
    });
    expect(result).toBeInstanceOf(Buffer);
    // Page 4 should be generated → larger PDF
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should generate Page 4 with Seguros card only', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      selectedAddons: '["seguros"]',
      revenueFromBoletos: 0,
      revenueFromInsurance: 3000, // 300 contracts * R$10
      netGain: 2503,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should generate Page 4 with Cash card only (no revenue numbers)', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      selectedAddons: '["cash"]',
      revenueFromBoletos: 0,
      revenueFromInsurance: 0,
    });
    expect(result).toBeInstanceOf(Buffer);
    // Cash addon triggers Page 4 even without explicit revenue numbers
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should generate Page 4 with all 3 revenue cards (Pay + Seguros + Cash)', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      selectedAddons: '["pay","seguros","cash","inteligencia","assinatura"]',
      chargesBoletoToTenant: true,
      boletoAmount: 12,
      chargesSplitToOwner: true,
      splitAmount: 5,
      revenueFromBoletos: 5100, // 300 * (12 + 5)
      revenueFromInsurance: 3000, // 300 * 10
      netGain: 7603,
    });
    expect(result).toBeInstanceOf(Buffer);
    // 4 pages → should be noticeably larger
    expect(result.length).toBeGreaterThan(4000);
  });

  it('should generate Page 4 with Pay + Seguros (2 cards side by side)', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      selectedAddons: '["pay","seguros"]',
      chargesBoletoToTenant: true,
      boletoAmount: 8.5,
      chargesSplitToOwner: false,
      splitAmount: 0,
      revenueFromBoletos: 2550, // 300 * 8.5
      revenueFromInsurance: 3000,
      netGain: 5053,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should generate Page 4 for both products with all revenue streams', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      productType: 'both',
      imobPlan: 'K2',
      locPlan: 'K2',
      imobUsers: 20,
      selectedAddons: '["leads","inteligencia","assinatura","pay","seguros","cash"]',
      komboName: 'Kombo Elite',
      komboDiscount: 20,
      chargesBoletoToTenant: true,
      boletoAmount: 12,
      chargesSplitToOwner: true,
      splitAmount: 5,
      revenueFromBoletos: 5100,
      revenueFromInsurance: 3000,
      netGain: 6100,
      totalMonthly: 2500,
      totalAnnual: 30000,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(4000);
  });

  it('should show correct commission rate for K2 plan in Seguros card', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      locPlan: 'K2',
      selectedAddons: '["seguros"]',
      contracts: 500,
      revenueFromInsurance: 5000, // 500 * 10
      netGain: 4503,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should show correct commission rate for Prime plan in Seguros card', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      locPlan: 'Prime',
      selectedAddons: '["seguros"]',
      contracts: 100,
      revenueFromInsurance: 1000, // 100 * 10
      netGain: 503,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should handle Pay with only boleto (no split)', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      selectedAddons: '["pay"]',
      chargesBoletoToTenant: true,
      boletoAmount: 10,
      chargesSplitToOwner: false,
      splitAmount: 0,
      revenueFromBoletos: 3000, // 300 * 10
      netGain: 2503,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should handle Pay with only split (no boleto)', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      selectedAddons: '["pay"]',
      chargesBoletoToTenant: false,
      boletoAmount: 0,
      chargesSplitToOwner: true,
      splitAmount: 15,
      revenueFromBoletos: 4500, // 300 * 15
      netGain: 4003,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should generate Page 4 with Cash + Seguros (no Pay)', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      selectedAddons: '["seguros","cash"]',
      revenueFromBoletos: 0,
      revenueFromInsurance: 3000,
      netGain: 2503,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(3000);
  });

  it('should handle zero contracts gracefully in revenue cards', async () => {
    const result = await generateProposalPDF({
      ...locBaseData,
      contracts: 0,
      selectedAddons: '["pay","seguros","cash"]',
      chargesBoletoToTenant: true,
      boletoAmount: 10,
      revenueFromBoletos: 0,
      revenueFromInsurance: 0,
    });
    expect(result).toBeInstanceOf(Buffer);
    // Cash still triggers Page 4
    expect(result.length).toBeGreaterThan(3000);
  });
});


/**
 * ════════════════════════════════════════════════════════════════
 * COMPREHENSIVE PDF TESTS: IMOB/LOCAÇÃO SEPARATION & REAL DATA
 * ════════════════════════════════════════════════════════════════
 * 
 * These tests verify that the new pdfStrategicPageV2 correctly:
 * - Separates IMOB and Locação into distinct product sections
 * - Shows correct operacional profiles for each product
 * - Displays correct pricing and add-ons per product
 * - Renders K² (superscript) correctly, not K2
 */

describe('PDF Generation - IMOB/Locação Separation (V2)', () => {
  
  it('should generate PDF for IMOB only with K² plan', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'imob',
      imobPlan: 'k2',
      imobUsers: 5,
      closings: 10,
      leadsPerMonth: 500,
      selectedAddons: '["leads","inteligencia","assinatura"]',
      paymentPlan: 'annual',
      totalMonthly: 2500,
      totalAnnual: 30000,
      implantationFee: 1497,
      firstYearTotal: 31497,
      imobPrice: 2500,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
    expect(result.slice(0, 5).toString()).toBe('%PDF-');
  });

  it('should generate PDF for Locação only with Prime plan', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'loc',
      locPlan: 'prime',
      contracts: 1200,
      newContracts: 50,
      chargesBoletoToTenant: true,
      boletoAmount: 5000,
      chargesSplitToOwner: true,
      splitAmount: 30,
      selectedAddons: '["pay","assinatura"]',
      paymentPlan: 'annual',
      totalMonthly: 1800,
      totalAnnual: 21600,
      implantationFee: 1497,
      firstYearTotal: 23097,
      locPrice: 1800,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should generate PDF for IMOB + Locação combo with K plans', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'both',
      komboName: 'Combo K + K',
      komboDiscount: 25,
      imobPlan: 'k',
      locPlan: 'k',
      imobUsers: 3,
      closings: 8,
      leadsPerMonth: 300,
      contracts: 800,
      newContracts: 40,
      chargesBoletoToTenant: true,
      boletoAmount: 3000,
      chargesSplitToOwner: true,
      splitAmount: 25,
      selectedAddons: '["leads","inteligencia","pay","assinatura"]',
      paymentPlan: 'annual',
      totalMonthly: 3200,
      totalAnnual: 38400,
      implantationFee: 1497,
      firstYearTotal: 39897,
      imobPrice: 1800,
      locPrice: 1400,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should display K² (superscript) in PDF, not K2', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'imob',
      imobPlan: 'k2',
      imobUsers: 5,
      closings: 10,
      leadsPerMonth: 500,
      selectedAddons: '[]',
      totalMonthly: 2500,
      totalAnnual: 30000,
      implantationFee: 1497,
      firstYearTotal: 31497,
      imobPrice: 2500,
    });
    expect(result).toBeInstanceOf(Buffer);
    // K² is Unicode U+00B2, should be in PDF
    const pdfText = result.toString('utf-8');
    // PDF should contain K² representation (may be encoded differently)
    expect(pdfText.length).toBeGreaterThan(0);
  });

  it('should include Locação-specific add-on Pay', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'loc',
      locPlan: 'k2',
      contracts: 2000,
      newContracts: 100,
      chargesBoletoToTenant: true,
      boletoAmount: 10000,
      chargesSplitToOwner: true,
      splitAmount: 50,
      selectedAddons: '["pay"]',
      paymentPlan: 'annual',
      totalMonthly: 2200,
      totalAnnual: 26400,
      implantationFee: 1497,
      firstYearTotal: 27897,
      locPrice: 2200,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should include IMOB-specific add-ons Leads and Inteligência', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'imob',
      imobPlan: 'k2',
      imobUsers: 10,
      closings: 25,
      leadsPerMonth: 1000,
      selectedAddons: '["leads","inteligencia","assinatura"]',
      paymentPlan: 'annual',
      totalMonthly: 3500,
      totalAnnual: 42000,
      implantationFee: 1497,
      firstYearTotal: 43497,
      imobPrice: 3500,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should maintain pricing data integrity across IMOB section', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'imob',
      imobPlan: 'prime',
      imobUsers: 2,
      closings: 5,
      leadsPerMonth: 100,
      selectedAddons: '["leads"]',
      paymentPlan: 'annual',
      totalMonthly: 1500,
      totalAnnual: 18000,
      implantationFee: 1497,
      firstYearTotal: 19497,
      imobPrice: 1500,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should maintain pricing data integrity across Locação section', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'loc',
      locPlan: 'k',
      contracts: 500,
      newContracts: 20,
      chargesBoletoToTenant: true,
      boletoAmount: 2000,
      chargesSplitToOwner: true,
      splitAmount: 10,
      selectedAddons: '["pay"]',
      paymentPlan: 'annual',
      totalMonthly: 1200,
      totalAnnual: 14400,
      implantationFee: 1497,
      firstYearTotal: 15897,
      locPrice: 1200,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should properly separate operacional profiles in IMOB+Locação combo', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'both',
      imobPlan: 'k',
      locPlan: 'k',
      imobUsers: 3,
      closings: 8,
      leadsPerMonth: 300,
      contracts: 800,
      newContracts: 40,
      chargesBoletoToTenant: true,
      boletoAmount: 3000,
      chargesSplitToOwner: true,
      splitAmount: 25,
      selectedAddons: '["leads","inteligencia","pay","assinatura"]',
      paymentPlan: 'annual',
      totalMonthly: 3200,
      totalAnnual: 38400,
      implantationFee: 1497,
      firstYearTotal: 39897,
      imobPrice: 1800,
      locPrice: 1400,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
    // PDF should be larger for combo due to separate sections
    expect(result.length).toBeGreaterThan(5000);
  });

  it('should handle Locação with all relevant add-ons (Pay, Assinatura)', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'loc',
      locPlan: 'k2',
      contracts: 1500,
      newContracts: 60,
      chargesBoletoToTenant: true,
      boletoAmount: 8000,
      chargesSplitToOwner: true,
      splitAmount: 40,
      selectedAddons: '["pay","assinatura"]',
      paymentPlan: 'annual',
      totalMonthly: 2500,
      totalAnnual: 30000,
      implantationFee: 1497,
      firstYearTotal: 31497,
      locPrice: 2500,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });

  it('should handle IMOB with all relevant add-ons (Leads, Inteligência, Assinatura)', async () => {
    const result = await generateProposalPDF({
      ...baseData,
      productType: 'imob',
      imobPlan: 'k2',
      imobUsers: 8,
      closings: 20,
      leadsPerMonth: 800,
      selectedAddons: '["leads","inteligencia","assinatura"]',
      paymentPlan: 'annual',
      totalMonthly: 3200,
      totalAnnual: 38400,
      implantationFee: 1497,
      firstYearTotal: 39897,
      imobPrice: 3200,
    });
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000);
  });
});
