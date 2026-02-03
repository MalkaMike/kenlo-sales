import { generateProposalPDF } from "./server/pdfGenerator.ts";
import { writeFileSync } from "fs";

const testData = {
  salesPersonName: "Maria Santos",
  clientName: "Imobiliária Teste Ltda",
  productType: "both",
  imobPlan: "k2",
  locPlan: "k2",
  imobUsers: 18,
  contracts: 550,
  selectedAddons: JSON.stringify(["leads", "inteligencia", "assinatura"]),
  paymentPlan: "annual",
  totalMonthly: 2262,
  totalAnnual: 27144,
  implantationFee: 1497,
  firstYearTotal: 28641,
  postPaidTotal: 4107,
  revenueFromBoletos: 5500,
  revenueFromInsurance: 5500,
  netGain: 4631,
};

try {
  console.log("Generating PDF...");
  const pdfBuffer = await generateProposalPDF(testData);
  console.log(`PDF generated, size: ${pdfBuffer.length} bytes`);
  
  writeFileSync("/home/ubuntu/test-proposal.pdf", pdfBuffer);
  console.log("PDF saved to /home/ubuntu/test-proposal.pdf");
} catch (error) {
  console.error("Error generating PDF:", error);
}
