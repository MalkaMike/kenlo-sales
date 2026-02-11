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
  cycle: "anual",
  installments: 12,
  monthlyPrice: 1694,
  totalPrice: 21825,
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
  cycle: "mensal",
  installments: 1,
  monthlyPrice: 958,
  totalPrice: 958,
  discount: 15,
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
  cycle: "semestral",
  installments: 6,
  monthlyPrice: 447,
  totalPrice: 2682,
  discount: 10,
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
  cycle: "bienal",
  installments: 24,
  monthlyPrice: 2022,
  totalPrice: 48528,
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
