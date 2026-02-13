/**
 * Section 7: Funcionalidades da Plataforma
 */

import type { jsPDF } from "jspdf";
import { getAllFeatures, type PlanTier } from "../../../../shared/pricing-config";
import {
  type ProposalPrintData, M, CW,
  rgb, C, sectionTitle, needsNewPage, newPage,
  getDerivedFlags,
} from "./pdfHelpers";

export function renderFeatures(doc: jsPDF, data: ProposalPrintData, Y: number): number {
  const { showImob, showLoc, imobPlanKey, locPlanKey } = getDerivedFlags(data);

  if (needsNewPage(Y, 300)) Y = newPage(doc, data);
  Y = sectionTitle(doc, "Funcionalidades da Plataforma", Y);

  const imobAllFeatures = showImob ? getAllFeatures("imob") : [];
  const locAllFeatures = showLoc ? getAllFeatures("locacao") : [];

  const imobFeatures = imobAllFeatures.map(f => ({
    name: f.name,
    included: imobPlanKey === "prime" ? f.includedInPrime : imobPlanKey === "k" ? f.includedInK : f.includedInK2,
  }));

  const locFeatures = locAllFeatures.map(f => ({
    name: f.name,
    included: locPlanKey === "prime" ? f.includedInPrime : locPlanKey === "k" ? f.includedInK : f.includedInK2,
  }));

  if (showImob && showLoc) {
    // Side-by-side comparison
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "bold");
    doc.text("Funcionalidade", M + 14, Y);
    doc.text("IMOB", M + CW - 80, Y, { align: "center" });
    doc.text("LOC", M + CW - 20, Y, { align: "center" });
    Y += 12;
    doc.setDrawColor(...rgb(C.border));
    doc.setLineWidth(0.3);
    doc.line(M, Y, M + CW, Y);
    Y += 8;

    const allFeatureNames = Array.from(new Set([
      ...imobFeatures.map(f => f.name),
      ...locFeatures.map(f => f.name),
    ]));

    for (const fname of allFeatureNames) {
      if (needsNewPage(Y, 20)) Y = newPage(doc, data);

      const imobHas = imobFeatures.some(f => f.name === fname && f.included);
      const locHas = locFeatures.some(f => f.name === fname && f.included);

      doc.setFontSize(7);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text(fname, M + 14, Y);

      // Checkmarks — use filled circles + text for better visibility
      if (imobHas) {
        doc.setFillColor(...rgb(C.green));
        doc.circle(M + CW - 80, Y - 2, 4, "F");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("✓", M + CW - 80, Y, { align: "center" });
      } else {
        doc.setFontSize(9);
        doc.setTextColor(...rgb(C.textLight));
        doc.setFont("helvetica", "normal");
        doc.text("—", M + CW - 80, Y, { align: "center" });
      }

      if (locHas) {
        doc.setFillColor(...rgb(C.green));
        doc.circle(M + CW - 20, Y - 2, 4, "F");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("✓", M + CW - 20, Y, { align: "center" });
      } else {
        doc.setFontSize(9);
        doc.setTextColor(...rgb(C.textLight));
        doc.setFont("helvetica", "normal");
        doc.text("—", M + CW - 20, Y, { align: "center" });
      }

      Y += 12;
    }
  } else {
    // Single product
    const features = showImob ? imobFeatures : locFeatures;
    for (const feat of features) {
      if (needsNewPage(Y, 20)) Y = newPage(doc, data);

      doc.setFontSize(7);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text(feat.name, M + 14, Y);

      if (feat.included) {
        doc.setFillColor(...rgb(C.green));
        doc.circle(M + CW - 18, Y - 2, 4, "F");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("✓", M + CW - 18, Y, { align: "center" });
      } else {
        doc.setFontSize(9);
        doc.setTextColor(...rgb(C.textLight));
        doc.setFont("helvetica", "normal");
        doc.text("—", M + CW - 18, Y, { align: "right" });
      }

      Y += 12;
    }
  }

  Y += 10;
  return Y;
}
