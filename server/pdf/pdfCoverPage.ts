/**
 * Page 1 — Cover page for the server-side PDF.
 *
 * Design aligned with client-side cover:
 *   - White background
 *   - Top double bar (dark charcoal + red)
 *   - Bottom red bar
 *   - Centered Kenlo logo, "Proposta Comercial" title
 *   - Client name, plan name in red, frequency with discount, date
 */

import path from "path";
import fs from "fs";
import {
  type ProposalData, type DerivedData,
  C, PW, PH, M, CW,
} from "./pdfTypes";

export function renderCoverPage(
  doc: PDFKit.PDFDocument,
  data: ProposalData,
  derived: DerivedData,
): number {
  const cx = PW / 2;

  // ── White background ──────────────────────────────────────────
  doc.rect(0, 0, PW, PH).fill("#FFFFFF");

  // ── Top border bars (dark charcoal + red) ─────────────────────
  doc.rect(0, 0, PW, 6).fill(C.dark);
  doc.rect(0, 6, PW, 4).fill(C.primary);

  // ── Bottom border bar (red) ───────────────────────────────────
  doc.rect(0, PH - 5, PW, 5).fill(C.primary);

  // ── Logo (centered) ───────────────────────────────────────────
  const logoY = 210;
  const logoPath = path.join(process.cwd(), "client/public/kenlo-logo-red.png");
  if (fs.existsSync(logoPath)) {
    try { doc.image(logoPath, cx - 60, logoY, { height: 36 }); } catch (_) {}
  } else {
    doc.fontSize(28).fillColor(C.primary).font("Helvetica-Bold")
      .text("Kenlo", 0, logoY + 4, { width: PW, align: "center" });
  }

  // ── "Proposta Comercial" title ────────────────────────────────
  const titleY = logoY + 36 + 50;
  doc.fontSize(26).fillColor(C.dark).font("Helvetica-Bold")
    .text("Proposta Comercial", 0, titleY, { width: PW, align: "center" });

  // ── Thin divider line ─────────────────────────────────────────
  const dividerY = titleY + 32;
  doc.moveTo(cx - 25, dividerY).lineTo(cx + 25, dividerY)
    .lineWidth(0.5).strokeColor(C.textLight).stroke();

  // ── Client / agency name ──────────────────────────────────────
  let infoY = dividerY + 28;
  const clientLabel = data.agencyName || data.clientName || "Cliente";
  doc.fontSize(16).fillColor(C.text).font("Helvetica")
    .text(clientLabel, 0, infoY, { width: PW, align: "center" });

  // ── Plan name in red bold ─────────────────────────────────────
  infoY += 30;
  const prodParts: string[] = [];
  if (derived.showImob) prodParts.push(`Kenlo Imob ${(data.imobPlan || "K").toUpperCase()}`);
  if (derived.showLoc) prodParts.push(`Kenlo Locação ${(data.locPlan || "K").toUpperCase()}`);
  const planLabel = prodParts.join(" + ") || "Kenlo";
  doc.fontSize(13).fillColor(C.primary).font("Helvetica-Bold")
    .text(planLabel, 0, infoY, { width: PW, align: "center" });

  // ── Frequency with discount ───────────────────────────────────
  infoY += 22;
  const cycleText = `Plano ${derived.freqInfo.label}${derived.freqInfo.discount ? ` (${derived.freqInfo.discount})` : ""}`;
  doc.fontSize(10).fillColor(C.textMuted).font("Helvetica")
    .text(cycleText, 0, infoY, { width: PW, align: "center" });

  // ── Date ──────────────────────────────────────────────────────
  infoY += 18;
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.fontSize(10).fillColor(C.textLight).font("Helvetica")
    .text(dateStr, 0, infoY, { width: PW, align: "center" });

  return PH;
}
