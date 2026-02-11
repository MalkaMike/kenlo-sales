import { generateProposalPDF } from "./server/pdfGenerator.ts";
import fs from "fs";

// Scenario A: All 3 revenue cards (Pay + Seguros + Cash) — Elite Kombo
const scenarioA = {
  salesPersonName: "Vendedor Exemplo",
  vendorEmail: "vendedor@kenlo.com.br",
  vendorPhone: "(11) 99999-0000",
  vendorRole: "Executivo(a) de Vendas",
  clientName: "Ana Paula Costa",
  agencyName: "Imobiliária Completa Elite",
  productType: "both",
  imobPlan: "K2",
  locPlan: "K2",
  imobUsers: 20,
  closings: 25,
  contracts: 500,
  newContracts: 20,
  leadsPerMonth: 800,
  businessType: "both",
  email: "ana@elite.com.br",
  cellphone: "(11) 97777-8888",
  selectedAddons: JSON.stringify(["leads", "inteligencia", "assinatura", "pay", "seguros", "cash"]),
  addonPrices: JSON.stringify({ leads: 397, inteligencia: 213, assinatura: 29 }),
  komboName: "Kombo Elite",
  komboDiscount: 20,
  paymentPlan: "annual",
  installments: 12,
  totalMonthly: 2022,
  totalAnnual: 24264,
  implantationFee: 1497,
  firstYearTotal: 25761,
  postPaidTotal: 350,
  chargesBoletoToTenant: true,
  boletoAmount: 12,
  chargesSplitToOwner: true,
  splitAmount: 5,
  revenueFromBoletos: 8500, // 500 * (12 + 5)
  revenueFromInsurance: 5000, // 500 * 10
  netGain: 12828, // 8500 + 5000 - 2022 - 350
  vipIncluded: true,
  csIncluded: true,
  vipPrice: 0,
  csPrice: 0,
  imobPrice: 957,
  locPrice: 957,
};

// Scenario B: Pay + Seguros (2 cards side by side)
const scenarioB = {
  salesPersonName: "Vendedor Exemplo",
  vendorEmail: "vendedor@kenlo.com.br",
  vendorPhone: "(11) 99999-0000",
  clientName: "Roberto Administrador",
  agencyName: "Administradora Premium",
  productType: "loc",
  locPlan: "K",
  contracts: 300,
  newContracts: 15,
  businessType: "administradora",
  email: "roberto@premium.com.br",
  cellphone: "(21) 98765-4321",
  selectedAddons: JSON.stringify(["pay", "seguros", "inteligencia", "assinatura"]),
  addonPrices: JSON.stringify({ inteligencia: 267, assinatura: 37 }),
  paymentPlan: "annual",
  installments: 1,
  totalMonthly: 1048,
  totalAnnual: 12576,
  implantationFee: 1497,
  firstYearTotal: 14073,
  postPaidTotal: 200,
  chargesBoletoToTenant: true,
  boletoAmount: 8.5,
  chargesSplitToOwner: true,
  splitAmount: 5,
  revenueFromBoletos: 4050, // 300 * (8.5 + 5)
  revenueFromInsurance: 3000, // 300 * 10
  netGain: 5802, // 4050 + 3000 - 1048 - 200
  vipIncluded: false,
  csIncluded: false,
  vipPrice: 97,
  csPrice: 197,
  locPrice: 497,
};

// Scenario C: Cash only (single card centered)
const scenarioC = {
  salesPersonName: "Vendedor Exemplo",
  vendorEmail: "vendedor@kenlo.com.br",
  vendorPhone: "(11) 99999-0000",
  clientName: "Fernanda Cash",
  agencyName: "Imobiliária Cash Flow",
  productType: "loc",
  locPlan: "K2",
  contracts: 600,
  newContracts: 25,
  businessType: "administradora",
  email: "fernanda@cashflow.com.br",
  cellphone: "(31) 91234-5678",
  selectedAddons: JSON.stringify(["cash"]),
  paymentPlan: "annual",
  installments: 1,
  totalMonthly: 1197,
  totalAnnual: 14364,
  implantationFee: 1497,
  firstYearTotal: 15861,
  postPaidTotal: 0,
  revenueFromBoletos: 0,
  revenueFromInsurance: 0,
  netGain: 0,
  locPrice: 1197,
};

// Scenario D: No revenue streams (should NOT generate Page 4)
const scenarioD = {
  salesPersonName: "Vendedor Exemplo",
  vendorEmail: "vendedor@kenlo.com.br",
  vendorPhone: "(11) 99999-0000",
  clientName: "Pedro Imob Only",
  agencyName: "Imobiliária Vendas Puras",
  productType: "imob",
  imobPlan: "K",
  imobUsers: 8,
  closings: 12,
  leadsPerMonth: 500,
  businessType: "corretora",
  email: "pedro@vendas.com.br",
  cellphone: "(11) 96666-5555",
  selectedAddons: JSON.stringify(["leads", "inteligencia"]),
  addonPrices: JSON.stringify({ leads: 497, inteligencia: 267 }),
  paymentPlan: "annual",
  installments: 1,
  totalMonthly: 1261,
  totalAnnual: 15132,
  implantationFee: 1497,
  firstYearTotal: 16629,
  postPaidTotal: 47,
  revenueFromBoletos: 0,
  revenueFromInsurance: 0,
  netGain: 0,
  imobPrice: 497,
};

const scenarios = [
  { name: "Page4_A_3Cards_AllRevenue", data: scenarioA },
  { name: "Page4_B_2Cards_PaySeguros", data: scenarioB },
  { name: "Page4_C_1Card_CashOnly", data: scenarioC },
  { name: "Page4_D_NoPage4_ImobOnly", data: scenarioD },
];

console.log("🧪 Testing Page 4 (Extra Revenue) PDF generation...\n");

for (const scenario of scenarios) {
  try {
    console.log(`📄 Generating: ${scenario.name}`);
    const pdfBuffer = await generateProposalPDF(scenario.data);
    const outputPath = `/home/ubuntu/${scenario.name}.pdf`;
    fs.writeFileSync(outputPath, pdfBuffer);
    const sizeKB = (pdfBuffer.length / 1024).toFixed(2);
    console.log(`   ✅ Success: ${sizeKB} KB → ${outputPath}\n`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    console.error(error.stack);
  }
}

console.log("🎉 Page 4 test scenarios complete!");
