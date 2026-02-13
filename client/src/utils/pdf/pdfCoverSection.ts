/**
 * Section 1: Capa (Cover page)
 */

import type { jsPDF } from "jspdf";
import { KENLO_LOGO_WHITE_BASE64 } from "../kenloLogoBase64";
import { type ProposalPrintData, M, PH, rgb, C } from "./pdfHelpers";

export function renderCover(doc: jsPDF, data: ProposalPrintData): void {
  // Full red background
  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, 0, 595.28, PH, "F");

  // Logo
  doc.addImage(KENLO_LOGO_WHITE_BASE64, "PNG", M, 60, 80, 24);

  // Title
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Proposta Comercial", M, 160);

  // Client info
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(data.agencyName || "Cliente", M, 200);
  doc.text(data.clientName || "", M, 220);

  // Footer info
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Consultor: ${data.salesPersonName}`, M, PH - 100);
  if (data.vendorEmail) doc.text(data.vendorEmail, M, PH - 85);
  if (data.vendorPhone) doc.text(data.vendorPhone, M, PH - 70);

  const today = new Date().toLocaleDateString("pt-BR");
  doc.text(`Data: ${today}`, M, PH - 50);
  if (data.validityDays) {
    doc.text(`Validade: ${data.validityDays} dias`, M, PH - 35);
  }
}
