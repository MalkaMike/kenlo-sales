/**
 * Client-side PDF generation — Executive Redesign v3
 *
 * MANDATORY 8-SECTION STRUCTURE (answers 4 key questions):
 *   1. Capa (cover)
 *   2. Perfil Operacional do Cliente (grid, not prose)
 *   3. Estrutura Contratada (cycle + products with "&" + add-ons as bullets)
 *   4. Investimento Contratual (REAL value charged in selected cycle — never monthly equivalent)
 *   5. Escopo Incluído na Contratação (explicit bullets)
 *   6. Serviços Premium Ativados (clear status: Incluído or —)
 *   7. Funcionalidades da Plataforma (table with ✔ and —, side-by-side if 2 products)
 *   8. Potencial de Receita Extra (only if applicable)
 *
 * ABSOLUTE RULES:
 * ❌ No blank pages
 * ❌ No repeating discount explanation
 * ❌ No mixing equivalent value with charged value
 * ❌ No didactic texts about cycle
 * ❌ No repeated "Incluído no plano"
 */

import { jsPDF } from "jspdf";
import { renderCover } from "./pdf/pdfCoverSection";
import { renderProfile } from "./pdf/pdfProfileSection";
import { renderContractLayout } from "./pdf/pdfContractSection";
import { renderComparison } from "./pdf/pdfComparisonSection";
import { renderFeatures } from "./pdf/pdfFeaturesSection";
import { renderRevenue, renderConclusion } from "./pdf/pdfRevenueSection";

// Re-export the data interface for consumers
export type { ProposalPrintData } from "./pdf/pdfHelpers";
import type { ProposalPrintData } from "./pdf/pdfHelpers";

// ══════════════════════════════════════════════════════════════════
// MAIN PDF GENERATION
// ══════════════════════════════════════════════════════════════════
export async function generateProposalPDFClient(
  data: ProposalPrintData
): Promise<{ blob: Blob; filename: string }> {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  // Section 1: Capa
  renderCover(doc, data);

  // Section 2: Perfil Operacional do Cliente
  let Y = renderProfile(doc, data);

  // Sections 3-6: Estrutura Contratada + Investimento + Escopo + Premium
  Y = renderContractLayout(doc, data);

  // Section 4B: Comparativo de Cenários (selected columns)
  Y = renderComparison(doc, data, Y);

  // Section 7: Funcionalidades da Plataforma
  Y = renderFeatures(doc, data, Y);

  // Section 8: Potencial de Receita Extra
  Y = renderRevenue(doc, data, Y);

  // Final: Conclusion (Próximos Passos)
  renderConclusion(doc, data, Y);

  // ── Generate Output ──
  const pdfBlob = doc.output("blob");
  const filename = `Proposta_Kenlo_${data.agencyName?.replace(/\s+/g, "_") || "Cliente"}_${new Date().toISOString().split("T")[0]}.pdf`;

  return { blob: pdfBlob, filename };
}

/**
 * Generate and download the PDF directly
 */
export async function downloadProposalPDF(data: ProposalPrintData): Promise<void> {
  const { blob, filename } = await generateProposalPDFClient(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
