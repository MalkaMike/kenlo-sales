/**
 * Section 1: Capa (Cover page)
 *
 * Design: White background, centered content, double bar at top (dark + red),
 * single red bar at bottom. Red Kenlo logo, bold title, client/plan info.
 */

import type { jsPDF } from "jspdf";
import { KENLO_LOGO_RED_BASE64 } from "../kenloLogoBase64";
import { type ProposalPrintData, PW, PH, M, CW, rgb, C } from "./pdfHelpers";

/** Frequency key → display label */
const FREQ_LABELS: Record<string, string> = {
  monthly: "Mensal",
  semestral: "Semestral (–10%)",
  annual: "Anual (–20%)",
  biennial: "Bienal (–30%)",
};

export function renderCover(doc: jsPDF, data: ProposalPrintData): void {
  // ── White background ──────────────────────────────────────────
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, PW, PH, "F");

  // ── Top border bars ───────────────────────────────────────────
  // Dark charcoal bar
  doc.setFillColor(...rgb(C.dark));
  doc.rect(0, 0, PW, 6, "F");
  // Red bar below
  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, 6, PW, 4, "F");

  // ── Bottom border bar ─────────────────────────────────────────
  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, PH - 5, PW, 5, "F");

  // ── Centered content ──────────────────────────────────────────
  const cx = PW / 2;

  // Logo (centered)
  const logoW = 120;
  const logoH = 36;
  const logoY = 210;
  doc.addImage(
    KENLO_LOGO_RED_BASE64,
    "PNG",
    cx - logoW / 2,
    logoY,
    logoW,
    logoH,
  );

  // "Proposta Comercial" title
  doc.setFontSize(26);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Proposta Comercial", cx, logoY + logoH + 50, { align: "center" });

  // Thin divider line
  const dividerY = logoY + logoH + 62;
  const dividerW = 50;
  doc.setDrawColor(...rgb(C.textLight));
  doc.setLineWidth(0.5);
  doc.line(cx - dividerW / 2, dividerY, cx + dividerW / 2, dividerY);

  // Client / agency name
  let infoY = dividerY + 28;
  const clientLabel = data.agencyName || data.clientName || "Cliente";
  doc.setFontSize(16);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", "normal");
  doc.text(clientLabel, cx, infoY, { align: "center" });

  // Plan name (e.g. "Kenlo Imob PRIME") in red bold
  infoY += 30;
  const planParts: string[] = [];
  if (data.productType === "imob" || data.productType === "both") {
    planParts.push(`Kenlo Imob ${(data.imobPlan || "").toUpperCase().replace(/K2/gi, "K\u00B2")}`);
  }
  if (data.productType === "locacao" || data.productType === "both") {
    planParts.push(`Kenlo Locação ${(data.locPlan || "").toUpperCase().replace(/K2/gi, "K\u00B2")}`);
  }
  if (data.komboName) {
    planParts.length = 0;
    planParts.push(data.komboName);
  }
  const planLabel = planParts.join(" + ") || "Kenlo";
  doc.setFontSize(13);
  doc.setTextColor(...rgb(C.primary));
  doc.setFont("helvetica", "bold");
  doc.text(planLabel, cx, infoY, { align: "center" });

  // Payment frequency (e.g. "Plano Semestral (–10%)")
  infoY += 22;
  const freqLabel = FREQ_LABELS[data.paymentPlan] || data.paymentPlan;
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text(`Plano ${freqLabel}`, cx, infoY, { align: "center" });

  // Date
  infoY += 18;
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(today, cx, infoY, { align: "center" });

  // ── Vendor info (prominent, below date) ──────────────────
  if (data.vendorName || data.vendorEmail || data.vendorPhone) {
    // Thin divider
    infoY += 24;
    const sellerDivW = 30;
    doc.setDrawColor(...rgb(C.textLight));
    doc.setLineWidth(0.4);
    doc.line(cx - sellerDivW / 2, infoY, cx + sellerDivW / 2, infoY);

    // Vendor name
    infoY += 20;
    if (data.vendorName) {
      doc.setFontSize(11);
      doc.setTextColor(...rgb(C.dark));
      doc.setFont("helvetica", "bold");
      doc.text(data.vendorName, cx, infoY, { align: "center" });
      infoY += 14;
    }

    // Role (if available)
    if (data.vendorRole) {
      doc.setFontSize(9);
      doc.setTextColor(...rgb(C.textMuted));
      doc.setFont("helvetica", "normal");
      doc.text(data.vendorRole, cx, infoY, { align: "center" });
      infoY += 14;
    }

    // Email and phone on one line
    const contactParts: string[] = [];
    if (data.vendorEmail) contactParts.push(data.vendorEmail);
    if (data.vendorPhone) contactParts.push(data.vendorPhone);
    if (contactParts.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(...rgb(C.textMuted));
      doc.setFont("helvetica", "normal");
      doc.text(contactParts.join("  \u00b7  "), cx, infoY, { align: "center" });
    }
  }
}
