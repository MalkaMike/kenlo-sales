/**
 * Section 8: Potencial de Receita Extra + Conclusion (Próximos Passos)
 */

import type { jsPDF } from "jspdf";
import {
  type ProposalPrintData, M, CW,
  rgb, C, sectionTitle, divider, needsNewPage, newPage, fmt,
  getDerivedFlags,
} from "./pdfHelpers";

export function renderRevenue(doc: jsPDF, data: ProposalPrintData, Y: number): number {
  const { hasRevenue } = getDerivedFlags(data);
  const hasPostPaid = data.postPaidTotal && data.postPaidTotal > 0;
  const hasRevenueItems = hasRevenue || hasPostPaid;

  if (!hasRevenueItems) return Y;

  if (needsNewPage(Y, 150)) Y = newPage(doc, data);
  Y = sectionTitle(doc, "Potencial de Receita Extra", Y);

  doc.setFontSize(8);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", "normal");
  doc.text("Com os add-ons contratados, você pode gerar receita adicional:", M, Y);
  Y += 16;

  // Parse post-paid breakdown
  let postPaidItems: Array<{ label: string; cost: number; detail: string }> = [];
  if (data.postPaidBreakdown) {
    try {
      const breakdown = JSON.parse(data.postPaidBreakdown);
      const groups = [breakdown.imobAddons, breakdown.locAddons, breakdown.sharedAddons].filter(Boolean);
      for (const group of groups) {
        if (group.items && Array.isArray(group.items)) {
          for (const item of group.items) {
            if (item.total > 0) {
              const detail = `Incluídos: ${item.included} | Adicionais: ${item.additional} × R$ ${item.perUnit.toFixed(2)}/${item.unitLabel}`;
              postPaidItems.push({ label: item.label, cost: item.total, detail });
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse postPaidBreakdown:", e);
    }
  }

  // Group 1: Mensalidades Pós-Pago
  if (postPaidItems.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "bold");
    doc.text("Mensalidades Pós-Pago", M + 14, Y);
    Y += 12;

    for (const item of postPaidItems) {
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text(item.label, M + 20, Y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...rgb("#B45309"));
      doc.text(`-${fmt(item.cost)}/mês`, M + CW - 14, Y, { align: "right" });
      Y += 10;

      if (item.detail) {
        doc.setFontSize(7);
        doc.setTextColor(...rgb(C.textMuted));
        doc.setFont("helvetica", "italic");
        doc.text(item.detail, M + 26, Y);
        Y += 9;
      }
    }
    Y += 4;
  }

  // Group 2: Revenue from Boletos/Split
  if (data.revenueFromBoletos && data.revenueFromBoletos > 0) {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text("Receita de Boletos/Split (Pay)", M + 14, Y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...rgb(C.green));
    doc.text(fmt(data.revenueFromBoletos) + "/mês", M + CW - 14, Y, { align: "right" });
    Y += 12;

    const contracts = data.contracts || 0;
    if (data.chargesBoletoToTenant && data.boletoAmount && data.boletoAmount > 0) {
      const boletoRevenue = contracts * data.boletoAmount;
      doc.setFontSize(7);
      doc.setTextColor(...rgb(C.textMuted));
      doc.setFont("helvetica", "italic");
      doc.text(`  Boleto: ${contracts} contratos × ${fmt(data.boletoAmount)} = ${fmt(boletoRevenue)}/mês`, M + 20, Y);
      Y += 10;
    }

    if (data.chargesSplitToOwner && data.splitAmount && data.splitAmount > 0) {
      const splitRevenue = contracts * data.splitAmount;
      doc.setFontSize(7);
      doc.setTextColor(...rgb(C.textMuted));
      doc.setFont("helvetica", "italic");
      doc.text(`  Split: ${contracts} contratos × ${fmt(data.splitAmount)} = ${fmt(splitRevenue)}/mês`, M + 20, Y);
      Y += 10;
    }
    Y += 4;
  }

  // Revenue from Insurance
  if (data.revenueFromInsurance && data.revenueFromInsurance > 0) {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text("Receita de Seguros", M + 14, Y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...rgb(C.green));
    doc.text(fmt(data.revenueFromInsurance) + "/mês", M + CW - 14, Y, { align: "right" });
    Y += 14;
  }

  divider(doc, Y);
  Y += 10;

  // Net revenue summary
  const totalRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
  const totalPostPaid = data.postPaidTotal || 0;
  const netRevenue = totalRevenue - totalPostPaid;

  doc.setFontSize(9);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(netRevenue >= 0 ? "Receita Líquida Mensal:" : "Custo Líquido Mensal:", M, Y);
  doc.setFontSize(11);
  doc.setTextColor(...rgb(netRevenue >= 0 ? C.green : "#B45309"));
  doc.text(fmt(Math.abs(netRevenue)), M + CW - 14, Y, { align: "right" });
  Y += 20;

  // ROI indicator
  const monthlyInvestment = data.totalAnnual / 12;
  const netGain = totalRevenue - monthlyInvestment - (data.postPaidTotal || 0);

  if (netGain > 0) {
    doc.setFillColor(...rgb(C.greenLight));
    doc.setDrawColor(...rgb(C.green));
    doc.setLineWidth(1);
    doc.roundedRect(M, Y, CW, 40, 4, 4, "FD");

    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text("Ganho Líquido Mensal Estimado", M + 14, Y + 16);

    doc.setFontSize(14);
    doc.setTextColor(...rgb(C.green));
    doc.setFont("helvetica", "bold");
    doc.text(fmt(netGain), M + 14, Y + 32);

    Y += 50;
  }

  return Y;
}

export function renderConclusion(doc: jsPDF, data: ProposalPrintData, Y: number): void {
  if (needsNewPage(Y, 120)) Y = newPage(doc, data);

  // Title OUTSIDE the box (above it)
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Próximos Passos", M, Y);
  Y += 14;

  // Box with steps only (no title inside)
  const boxH = 68;
  doc.setFillColor(...rgb(C.bgSoft));
  doc.roundedRect(M, Y, CW, boxH, 4, 4, "F");

  doc.setFontSize(8);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", "normal");
  const steps = [
    "1. Revisão e aprovação da proposta",
    "2. Assinatura do contrato",
    "3. Agendamento da implantação",
    "4. Treinamento da equipe",
  ];

  let stepY = Y + 16;
  steps.forEach((step) => {
    doc.text(step, M + 14, stepY);
    stepY += 13;
  });

  // Validity notice below the box
  const validityY = Y + boxH + 14;
  const days = data.validityDays || 30;
  doc.setFontSize(7);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "italic");
  doc.text(`Proposta válida por ${days} dias a partir da data de emissão.`, M, validityY);
}
