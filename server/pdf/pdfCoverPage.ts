/**
 * Page 1 — Cover page for the server-side PDF.
 */

import path from "path";
import fs from "fs";
import {
  type ProposalData, type DerivedData,
  C, PW, PH, M, CW, fmt, fmtNum,
  label, value, divider, h1,
} from "./pdfTypes";

export function renderCoverPage(
  doc: PDFKit.PDFDocument,
  data: ProposalData,
  derived: DerivedData,
): number {
  let Y = 0;
  const cx = PW / 2;

  // Top accent
  doc.rect(0, 0, PW, 4).fill(C.primary);

  // Logo
  const logoPath = path.join(process.cwd(), "client/public/kenlo-logo-red.png");
  if (fs.existsSync(logoPath)) {
    try { doc.image(logoPath, cx - 55, 200, { height: 32 }); } catch (_) {}
  } else {
    doc.fontSize(28).fillColor(C.primary).font("Helvetica-Bold")
      .text("Kenlo", 0, 210, { width: PW, align: "center" });
  }

  // Title
  doc.fontSize(24).fillColor(C.dark).font("Helvetica-Bold")
    .text("Proposta Comercial", 0, 260, { width: PW, align: "center" });

  // Thin divider
  doc.moveTo(cx - 50, 292).lineTo(cx + 50, 292).lineWidth(0.5).strokeColor(C.border).stroke();

  // Agency name
  const coverName = data.agencyName || data.clientName || "";
  if (coverName) {
    doc.fontSize(15).fillColor(C.text).font("Helvetica")
      .text(coverName, 0, 310, { width: PW, align: "center" });
  }

  // Products contracted
  const prodParts: string[] = [];
  if (derived.showImob) prodParts.push(`Kenlo Imob ${(data.imobPlan || "K").toUpperCase()}`);
  if (derived.showLoc) prodParts.push(`Kenlo Locação ${(data.locPlan || "K").toUpperCase()}`);
  doc.fontSize(11).fillColor(C.primary).font("Helvetica-Bold")
    .text(prodParts.join(" & "), 0, 340, { width: PW, align: "center" });

  // Cycle
  const cycleText = `Plano ${derived.freqInfo.label}${derived.freqInfo.discount ? ` (${derived.freqInfo.discount})` : ""}`;
  doc.fontSize(9).fillColor(C.textMuted).font("Helvetica")
    .text(cycleText, 0, 360, { width: PW, align: "center" });

  // Date
  const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  doc.fontSize(9).fillColor(C.textLight).font("Helvetica")
    .text(dateStr, 0, 380, { width: PW, align: "center" });

  // Bottom accent
  doc.rect(0, PH - 4, PW, 4).fill(C.primary);
  Y = PH;

  return Y;
}
