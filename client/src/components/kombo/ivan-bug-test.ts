/**
 * Test to reproduce Ivan's bug report
 * Scenario: 130 users, 1000 leads, Imob K2, Kombo Imob Pro
 */

import { calculateNoKomboColumn, calculateKomboColumn } from "./komboColumnCalculators";
import type { KomboComparisonProps } from "./komboComparisonTypes";

// Ivan's scenario
const ivanProps: KomboComparisonProps = {
  product: "imob",
  imobUsers: 130,
  contractsUnderManagement: 0,
  closingsPerMonth: 10,
  leadsPerMonth: 1000,
  newContractsPerMonth: 0,
  imobPlan: "k2", // K2 because 130 users
  locPlan: "prime",
  frequency: "annual",
  addons: {
    leads: true,
    inteligencia: true,
    assinatura: true,
    pay: false,
    seguros: false,
    cash: false,
  },
  vipSupport: false,
  dedicatedCS: false,
  wantsWhatsApp: true,
};

console.log("=== Testing Ivan's Scenario ===");
console.log("130 users, 1000 leads, Imob K2, Leads + Inteligência + Assinatura");
console.log("");

// Calculate "Sua Seleção" column (no Kombo)
const suaSelecao = calculateNoKomboColumn(ivanProps, false);

console.log("Sua Seleção (no Kombo):");
console.log("- Imob K2:", suaSelecao.imobPrice);
console.log("- Leads:", suaSelecao.leadsPrice);
console.log("- Inteligência:", suaSelecao.inteligenciaPrice);
console.log("- Assinatura:", suaSelecao.assinaturaPrice);
console.log("- VIP Support:", suaSelecao.vipSupportPrice);
console.log("- CS Dedicado:", suaSelecao.dedicatedCSPrice);
console.log("");
console.log("Total Monthly (Pré-Pago - raw):", suaSelecao.totalMonthly);
console.log("Monthly Before Discounts:", suaSelecao.monthlyBeforeDiscounts);
console.log("Cycle Discount Amount:", suaSelecao.cycleDiscountAmount);
console.log("Kombo Discount Amount:", suaSelecao.komboDiscountAmount);
console.log("");
console.log("Pós-Pago:");
console.log("- Users:", suaSelecao.postPaidUsers);
console.log("- WhatsApp:", suaSelecao.postPaidWhatsApp);
console.log("- Assinaturas:", suaSelecao.postPaidAssinaturas);
console.log("- Post Paid Total:", suaSelecao.postPaidTotal);
console.log("");
console.log("=== GRAND TOTAL ===");
console.log("totalMonthly + postPaidTotal =", suaSelecao.totalMonthly, "+", suaSelecao.postPaidTotal, "=", suaSelecao.totalMonthly + suaSelecao.postPaidTotal);
console.log("");

// Calculate Imob Pro Kombo
const imobPro = calculateKomboColumn("imobPro" as any, ivanProps, "imobPro" as any);
console.log("Imob Pro (15% OFF):");
console.log("- Total Monthly (Pré-Pago):", imobPro.totalMonthly);
console.log("- Post Paid Total:", imobPro.postPaidTotal);
console.log("- GRAND TOTAL:", imobPro.totalMonthly + imobPro.postPaidTotal);
