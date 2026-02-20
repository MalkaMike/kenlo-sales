/**
 * Server-side PDF generation — MASTER REDESIGN v4 (PDFKit)
 *
 * STRUCTURE (4 PAGES MAX):
 *   1️⃣ Cover (simplified)
 *   2️⃣ Strategic Overview (3-column grid)
 *   3️⃣ Platform Functionalities (comparison matrix)
 *   4️⃣ Extra Revenue Kenlo (only if applicable)
 *
 * ABSOLUTE RULES:
 * ❌ No blank pages
 * ❌ No duplicated content
 * ❌ No alternative options shown (only what is selected)
 * ❌ No horizontal overflow
 * ❌ No inconsistent bullet styles
 * ❌ Maximum 4 pages
 */

import PDFDocument from "pdfkit";
import {
  type ProposalData,
  buildDerivedData,
} from "./pdf/pdfTypes";
import { renderCoverPage } from "./pdf/pdfCoverPage";
import { renderStrategicPageV2 } from "./pdf/pdfStrategicPageV2";
import { renderFeaturesPageV3 } from "./pdf/pdfFeaturesPageV3";
import { renderRevenuePage } from "./pdf/pdfRevenuePage";

// Re-export ProposalData so routers.ts keeps working
export type { ProposalData };

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      autoFirstPage: true,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const derived = buildDerivedData(data);

    // 1️⃣ Cover
    renderCoverPage(doc, data, derived);

    // 2️⃣ Strategic Overview (SEPARATED IMOB & LOCAÇÃO)
    renderStrategicPageV2(doc, data, derived);

    // 3️⃣ Platform Functionalities (APPLE-STYLE, SELECTED PLANS ONLY)
    renderFeaturesPageV3(doc, data, derived);

    // 4️⃣ Extra Revenue (conditional)
    renderRevenuePage(doc, data, derived);

    // Finalize
    doc.end();
  });
}
