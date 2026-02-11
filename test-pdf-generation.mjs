import { generateProposalPDF } from './server/pdfGenerator.ts';
import fs from 'fs';

// Test data matching ProposalData interface
const testData = {
  // Vendor info
  salesPersonName: 'Vendedor Teste',
  vendorEmail: 'vendedor@kenlo.com.br',
  vendorPhone: '(11) 99999-9999',
  vendorRole: 'Executivo(a) de Vendas',
  
  // Client info
  clientName: 'João Silva',
  agencyName: 'Imobiliária Teste Executivo',
  email: 'joao@teste.com',
  cellphone: '(11) 98765-4321',
  landline: '(11) 3456-7890',
  
  // Business context
  businessType: 'corretora',
  hasWebsite: true,
  hasCRM: false,
  crmSystem: null,
  hasERP: false,
  erpSystem: null,
  
  // Business metrics
  imobUsers: 5,
  closings: 10,
  leadsPerMonth: 500,
  usesExternalAI: false,
  wantsWhatsApp: true,
  
  // Products
  productType: 'imob',
  imobPlan: 'prime',
  locPlan: null,
  
  // Add-ons (as JSON string array)
  selectedAddons: JSON.stringify(['leads', 'inteligencia', 'assinatura']),
  
  // Pricing
  paymentPlan: 'annual',
  komboName: 'Imob Pro',
  komboDiscount: 15,
  
  // Premium services
  hasPremiumServices: false,
  premiumServicesPrice: 0,
  vipIncluded: false,
  csIncluded: false,
  
  // Totals
  totalMonthly: 915,
  totalAnnual: 10980,
  implantationFee: 1497,
  firstYearTotal: 12477,
  postPaidTotal: 0,
  
  // Quote info
  installments: 1,
  validityDays: 3,
  
  // Line items
  imobPrice: 447,
  locPrice: undefined,
  addonPrices: JSON.stringify({
    leads: 149,
    inteligencia: 169,
    assinatura: 150
  })
};

console.log('Generating PDF with test data...');

try {
  const pdfBuffer = await generateProposalPDF(testData);
  
  const outputPath = '/home/ubuntu/test-proposal.pdf';
  fs.writeFileSync(outputPath, pdfBuffer);
  
  console.log(`✅ PDF generated successfully: ${outputPath}`);
  console.log(`File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
} catch (error) {
  console.error('❌ Error generating PDF:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}
