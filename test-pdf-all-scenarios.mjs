import { generateProposalPDF } from "./server/pdfGenerator.ts";
import fs from "fs";

// Scenario 1: 2 products (Imob K2 + Loc K) + multiple add-ons (Leads, Inteligência, Pay)
const scenario1 = {
  companyName: "Imobiliária Teste Cenário 1",
  ownerName: "João Silva",
  email: "joao@teste.com.br",
  cellphone: "(11) 98765-4321",
  landline: "(11) 3456-7890",
  businessType: "both",
  productType: "both",
  hasWebsite: true,
  usesCRM: true,
  imobUsers: 8,
  closings: 15,
  leadsPerMonth: 600,
  contracts: 150,
  newContracts: 12,
  imobPlan: "K2",
  locPlan: "K",
  selectedKombo: "Core Gestão",
  selectedAddons: "leads,inteligencia,pay",
  addonPrices: JSON.stringify({
    leads: 297,
    inteligencia: 267,
    pay: 247,
  }),
  paymentPlan: "annual",
  installments: 12,
  totalMonthly: 1694,
  totalAnnual: 21825,
  implantationFee: 1497,
  discount: 20,
  salesPersonName: "Vendedor Exemplo",
  salesPersonEmail: "vendedor@kenlo.com",
  salesPersonPhone: "(11) 99999-9999",
};

// Scenario 2: Single product (Imob K only) + add-ons (Inteligência, Assinatura)
const scenario2 = {
  companyName: "Imobiliária Só Vendas",
  ownerName: "Maria Santos",
  email: "maria@sovendas.com.br",
  cellphone: "(21) 91234-5678",
  landline: "",
  businessType: "corretora",
  productType: "imob",
  hasWebsite: true,
  usesCRM: false,
  imobUsers: 5,
  closings: 8,
  leadsPerMonth: 400,
  contracts: 0,
  newContracts: 0,
  imobPlan: "K",
  locPlan: "",
  selectedKombo: "Imob Pro",
  selectedAddons: "inteligencia,assinatura",
  addonPrices: JSON.stringify({
    inteligencia: 267,
    assinatura: 37,
  }),
  paymentPlan: "monthly",
  installments: 1,
  totalMonthly: 397,
  totalAnnual: 4764,
  implantationFee: 1497,  discount: 15,
  salesPersonName: "Vendedor Exemplo",
  salesPersonEmail: "vendedor@kenlo.com",
  salesPersonPhone: "(11) 99999-9999",
};

// Scenario 3: Single product (Locação Prime only) + no add-ons
const scenario3 = {
  companyName: "Administradora Viva",
  ownerName: "Carlos Oliveira",
  email: "carlos@viva.com.br",
  cellphone: "(31) 98888-7777",
  landline: "(31) 3333-4444",
  businessType: "administradora",
  productType: "loc",
  hasWebsite: false,
  usesCRM: true,
  imobUsers: 0,
  closings: 0,
  leadsPerMonth: 0,
  contracts: 200,
  newContracts: 18,
  imobPlan: "",
  locPlan: "Prime",
  selectedKombo: "Loc Pro",
  selectedAddons: "",
  addonPrices: JSON.stringify({}),
  paymentPlan: "semestral",
  installments: 6,
  totalMonthly: 847,
  totalAnnual: 10164,
  implantationFee: 1497,  discount: 10,
  salesPersonName: "Vendedor Exemplo",
  salesPersonEmail: "vendedor@kenlo.com",
  salesPersonPhone: "(11) 99999-9999",
};

// Scenario 4: 2 products (Imob Prime + Loc K2) + all add-ons (Bienal cycle)
const scenario4 = {
  companyName: "Imobiliária Completa Elite",
  ownerName: "Ana Paula Costa",
  email: "ana@elite.com.br",
  cellphone: "(11) 97777-8888",
  landline: "(11) 3111-2222",
  businessType: "both",
  productType: "both",
  hasWebsite: true,
  usesCRM: true,
  imobUsers: 12,
  closings: 25,
  leadsPerMonth: 1000,
  contracts: 300,
  newContracts: 20,
  imobPlan: "Prime",
  locPlan: "K2",
  selectedKombo: "Elite",
  selectedAddons: "leads,inteligencia,assinatura,pay,seguros,cash",
  addonPrices: JSON.stringify({
    leads: 497,
    inteligencia: 267,
    assinatura: 37,
    pay: 247,
  }),
  paymentPlan: "biennial",
  installments: 24,
  totalMonthly: 2022,
  totalAnnual: 48528,
  implantationFee: 1497,
  discount: 28,
  salesPersonName: "Vendedor Exemplo",
  salesPersonEmail: "vendedor@kenlo.com",
  salesPersonPhone: "(11) 99999-9999",
};

const scenarios = [
  { name: "Scenario_1_2Products_MultipleAddons", data: scenario1 },
  { name: "Scenario_2_ImobOnly_SomeAddons", data: scenario2 },
  { name: "Scenario_3_LocOnly_NoAddons", data: scenario3 },
  { name: "Scenario_4_2Products_AllAddons_Bienal", data: scenario4 },
];

console.log("🧪 Testing PDF generation with 4 real scenarios...\n");

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
  }
}

console.log("🎉 All scenarios tested!");
