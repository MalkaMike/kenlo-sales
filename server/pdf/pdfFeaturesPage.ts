/**
 * Page 3 — Platform Functionalities (comparison matrix) for the server-side PDF.
 */

import { getAllFeatures, type PlanTier } from "@shared/pricing-config";
import {
  type ProposalData, type DerivedData,
  C, M, CW, h1, newPage,
} from "./pdfTypes";

export function renderFeaturesPage(
  doc: PDFKit.PDFDocument,
  data: ProposalData,
  derived: DerivedData,
): void {
  let Y = newPage(doc, data);

  const { showImob, showLoc } = derived;

  const imobAllFeatures = showImob ? getAllFeatures("imob") : [];
  const locAllFeatures = showLoc ? getAllFeatures("locacao") : [];

  const imobPlanKey = (data.imobPlan || "k").toLowerCase() as PlanTier;
  const locPlanKey = (data.locPlan || "k").toLowerCase() as PlanTier;

  const imobFeatures = imobAllFeatures.map(f => ({
    name: f.name,
    description: f.description || "",
    included: imobPlanKey === "prime" ? f.includedInPrime : imobPlanKey === "k" ? f.includedInK : f.includedInK2,
  }));

  const locFeatures = locAllFeatures.map(f => ({
    name: f.name,
    description: f.description || "",
    included: locPlanKey === "prime" ? f.includedInPrime : locPlanKey === "k" ? f.includedInK : f.includedInK2,
  }));

  if (showImob && showLoc) {
    // 2 products: split page vertically
    const colGap = 14;
    const halfW = (CW - colGap) / 2;
    const leftX = M;
    const rightX = M + halfW + colGap;

    // LEFT: Imob
    let lY = h1(doc, `Kenlo Imob — Plano ${(data.imobPlan || "K").toUpperCase()}`, leftX, Y, halfW);
    lY = renderPlanBand(doc, data.imobPlan || "K", leftX, lY, halfW);
    lY = renderFeatureList(doc, imobFeatures, leftX, lY, halfW);

    // RIGHT: Locação
    let rY = h1(doc, `Kenlo Locação — Plano ${(data.locPlan || "K").toUpperCase()}`, rightX, Y, halfW);
    rY = renderPlanBand(doc, data.locPlan || "K", rightX, rY, halfW);
    rY = renderFeatureList(doc, locFeatures, rightX, rY, halfW);

    Y = Math.max(lY, rY);
  } else {
    // Single product
    const features = showImob ? imobFeatures : locFeatures;
    const productName = showImob
      ? `Kenlo Imob — Plano ${(data.imobPlan || "K").toUpperCase()}`
      : `Kenlo Locação — Plano ${(data.locPlan || "K").toUpperCase()}`;

    Y = h1(doc, productName, M, Y);
    const planKey = showImob ? (data.imobPlan || "K") : (data.locPlan || "K");
    Y = renderPlanBand(doc, planKey, M, Y, CW);
    Y = renderFeatureList(doc, features, M, Y, CW);
  }
}

// ── Helpers ─────────────────────────────────────────────────────

function renderPlanBand(doc: PDFKit.PDFDocument, plan: string, x: number, y: number, w: number): number {
  doc.rect(x, y - 2, w, 14).fill(C.greenLight);
  doc.fontSize(6.5).fillColor(C.green).font("Helvetica-Bold")
    .text(`Plano ${plan.toUpperCase()} selecionado`, x + 4, y + 1, { lineBreak: false });
  return y + 16;
}

function renderFeatureList(
  doc: PDFKit.PDFDocument,
  features: { name: string; description: string; included: boolean }[],
  x: number,
  y: number,
  w: number,
): number {
  for (const feat of features) {
    if (feat.included) {
      doc.circle(x + 4, y + 3.5, 3.5).fill(C.green);
      doc.fontSize(5).fillColor("#FFFFFF").font("Helvetica-Bold")
        .text("v", x + 1.8, y + 0.8, { lineBreak: false });
    } else {
      doc.fontSize(7).fillColor(C.textLight).font("Helvetica")
        .text("\u2014", x + 1, y, { lineBreak: false });
    }
    doc.fontSize(7).fillColor(feat.included ? C.text : C.textLight).font("Helvetica")
      .text(feat.name, x + 14, y, { lineBreak: false });
    y += 11;
    if (feat.description) {
      doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
        .text(feat.description, x + 14, y, { width: w - 20, lineBreak: true });
      y += 9;
    }
  }
  return y;
}
