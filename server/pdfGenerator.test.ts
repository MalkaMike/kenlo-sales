import { describe, it, expect } from 'vitest';
import { generateProposalPDF } from './pdfGenerator';

/**
 * PDF Generator Tests
 * 
 * These tests verify that the PDF generator produces valid PDFs
 * with correct content for various configurations.
 */

const baseData = {
  salesPersonName: 'Vendedor Teste',
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
    // Check PDF header magic bytes
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
    // Revenue page makes it larger
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
});
