/**
 * Page 4 — Extra Revenue Kenlo (only if applicable) for the server-side PDF.
 */

import { SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT } from "@shared/pricing-config";
import pricingValues from "@shared/pricing-values.json";
import {
  type ProposalData, type DerivedData,
  C, RC, M, CW, fmt, fmtNum,
  h1, newPage,
} from "./pdfTypes";

interface RevenueCard {
  type: "pay" | "seguros" | "cash";
  title: string;
  subtitle: string;
  description: string;
  metric: string;
  metricLabel: string;
  details: { label: string; value: string }[];
  bgColor: string;
  borderColor: string;
  accentColor: string;
  iconColor: string;
}

export function renderRevenuePage(
  doc: PDFKit.PDFDocument,
  data: ProposalData,
  derived: DerivedData,
): void {
  const { selAddons } = derived;

  const hasPay = selAddons.includes("pay");
  const hasSeguros = selAddons.includes("seguros");
  const hasCash = selAddons.includes("cash");
  const hasRevenueFromPay = hasPay && (data.revenueFromBoletos || 0) > 0;
  const hasRevenueFromSeguros = hasSeguros && (data.revenueFromInsurance || 0) > 0;
  const hasAnyRevenueStream = hasRevenueFromPay || hasRevenueFromSeguros || hasCash;

  if (!hasAnyRevenueStream) return;

  let Y = newPage(doc, data);

  // Section header
  Y = h1(doc, "Potencial de Receita Extra com Kenlo", M, Y);
  Y += 2;
  doc.fontSize(7).fillColor(C.textMuted).font("Helvetica")
    .text("Além da mensalidade, a plataforma Kenlo gera receita adicional para sua imobiliária através dos módulos abaixo.", M + 11, Y, { width: CW - 11 });
  Y += 18;

  // Build cards
  const revenueCards: RevenueCard[] = [];

  if (hasRevenueFromPay) {
    const contracts = data.contracts || 0;
    const boletoAmt = data.boletoAmount || 0;
    const splitAmt = data.splitAmount || 0;
    const monthlyRevenue = data.revenueFromBoletos || 0;

    const details: { label: string; value: string }[] = [];
    if (data.chargesBoletoToTenant && boletoAmt > 0) {
      details.push({ label: "Boleto repassado ao inquilino", value: `${fmt(boletoAmt)}/boleto` });
    }
    if (data.chargesSplitToOwner && splitAmt > 0) {
      details.push({ label: "Split repassado ao proprietário", value: `${fmt(splitAmt)}/split` });
    }
    if (contracts > 0) {
      details.push({ label: "Contratos ativos", value: fmtNum(contracts) });
    }

    revenueCards.push({
      type: "pay", title: "Split Automático", subtitle: "Kenlo Pay",
      description: "Repasse automático de taxas de boleto e split digital para inquilinos e proprietários.",
      metric: fmt(monthlyRevenue), metricLabel: "receita estimada/mês", details,
      bgColor: RC.payBg, borderColor: RC.payBorder, accentColor: RC.payAccent, iconColor: RC.payIcon,
    });
  }

  if (hasRevenueFromSeguros) {
    const contracts = data.contracts || 0;
    const monthlyInsurance = data.revenueFromInsurance || 0;
    const locPlanTier = (data.locPlan || "k").toLowerCase() as "prime" | "k" | "k2";
    const rawRate = pricingValues.variableCosts.segurosCommission.tiers[locPlanTier]?.[0]?.rate
      ?? pricingValues.variableCosts.segurosCommission.tiers.prime[0].rate;
    const commissionRate = `${(rawRate * 100).toFixed(0)}%`;

    revenueCards.push({
      type: "seguros", title: "Seguros Integrados", subtitle: "Kenlo Seguros",
      description: "Seguros embutido no boleto de locação. Comissão automática por contrato ativo.",
      metric: fmt(monthlyInsurance), metricLabel: "receita estimada/mês",
      details: [
        { label: "Comissão da imobiliária", value: commissionRate },
        { label: "Receita por contrato", value: `~R$ ${SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT}/mês` },
        { label: "Contratos ativos", value: fmtNum(contracts) },
      ],
      bgColor: RC.segBg, borderColor: RC.segBorder, accentColor: RC.segAccent, iconColor: RC.segIcon,
    });
  }

  if (hasCash) {
    const contracts = data.contracts || 0;
    const avgRent = 1500;
    const anticipationFee = 0.025;
    const estimatedPortfolio = contracts * avgRent;
    const potentialRevenue = contracts * avgRent * anticipationFee;

    revenueCards.push({
      type: "cash", title: "Antecipação de Aluguel", subtitle: "Kenlo Cash",
      description: "Antecipe até 24 meses de aluguel para proprietários. Receita sobre taxa de antecipação.",
      metric: potentialRevenue > 0 ? fmt(potentialRevenue) : "Sob demanda",
      metricLabel: potentialRevenue > 0 ? "receita potencial/operação" : "",
      details: [
        { label: "Antecipação máxima", value: "até 24 meses" },
        { label: "Portfólio estimado", value: contracts > 0 ? fmt(estimatedPortfolio) : "—" },
        { label: "Contratos elegíveis", value: contracts > 0 ? fmtNum(contracts) : "—" },
      ],
      bgColor: RC.cashBg, borderColor: RC.cashBorder, accentColor: RC.cashAccent, iconColor: RC.cashIcon,
    });
  }

  // ── Render cards ──
  const cardCount = revenueCards.length;
  const cardGap = 12;

  const drawIconCircle = (cx: number, cy: number, color: string, type: "pay" | "seguros" | "cash") => {
    doc.circle(cx, cy, 12).fill(color);
    doc.fontSize(10).fillColor("#FFFFFF").font("Helvetica-Bold");
    if (type === "pay") doc.text("$", cx - 4, cy - 5.5, { lineBreak: false });
    else if (type === "seguros") doc.text("S", cx - 4, cy - 5.5, { lineBreak: false });
    else doc.text("↑", cx - 4, cy - 5.5, { lineBreak: false });
  };

  const renderCard = (card: RevenueCard, x: number, y: number, w: number): number => {
    const cardH = 140;
    const innerPad = 14;

    doc.save();
    doc.roundedRect(x, y, w, cardH, 6).fill(card.bgColor);
    doc.roundedRect(x, y, w, cardH, 6).lineWidth(1).strokeColor(card.borderColor).stroke();
    doc.rect(x, y + 6, 4, cardH - 12).fill(card.accentColor);

    drawIconCircle(x + innerPad + 12, y + innerPad + 10, card.accentColor, card.type);

    let ty = y + innerPad + 2;
    doc.fontSize(9).fillColor(card.accentColor).font("Helvetica-Bold")
      .text(card.title, x + innerPad + 28, ty, { lineBreak: false });
    ty += 12;
    doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
      .text(card.subtitle, x + innerPad + 28, ty, { lineBreak: false });
    ty += 14;

    doc.fontSize(6.5).fillColor(C.text).font("Helvetica")
      .text(card.description, x + innerPad, ty, { width: w - innerPad * 2, lineBreak: true });
    ty += 20;

    doc.moveTo(x + innerPad, ty).lineTo(x + w - innerPad, ty)
      .lineWidth(0.3).strokeColor(card.borderColor).stroke();
    ty += 8;

    doc.fontSize(16).fillColor(card.accentColor).font("Helvetica-Bold")
      .text(card.metric, x + innerPad, ty, { lineBreak: false });
    ty += 18;
    if (card.metricLabel) {
      doc.fontSize(5.5).fillColor(C.textMuted).font("Helvetica")
        .text(card.metricLabel, x + innerPad, ty, { lineBreak: false });
    }
    ty += 10;

    for (const detail of card.details) {
      doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
        .text(detail.label, x + innerPad, ty, { lineBreak: false });
      doc.fontSize(6.5).fillColor(C.dark).font("Helvetica-Bold")
        .text(detail.value, x + innerPad, ty, { width: w - innerPad * 2, align: "right" });
      ty += 10;
    }

    doc.restore();
    return cardH;
  };

  if (cardCount === 1) {
    const singleW = CW * 0.6;
    const singleX = M + (CW - singleW) / 2;
    renderCard(revenueCards[0], singleX, Y, singleW);
    Y += 150;
  } else if (cardCount === 2) {
    const twoW = (CW - cardGap) / 2;
    renderCard(revenueCards[0], M, Y, twoW);
    renderCard(revenueCards[1], M + twoW + cardGap, Y, twoW);
    Y += 150;
  } else {
    const threeW = (CW - cardGap * 2) / 3;
    renderCard(revenueCards[0], M, Y, threeW);
    renderCard(revenueCards[1], M + threeW + cardGap, Y, threeW);
    renderCard(revenueCards[2], M + (threeW + cardGap) * 2, Y, threeW);
    Y += 150;
  }

  // ── Summary bar ──
  Y += 8;
  const totalExtraRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
  const netGainValue = data.netGain || 0;

  doc.roundedRect(M, Y, CW, 56, 6).fill(RC.summaryBg);
  doc.roundedRect(M, Y, CW, 56, 6).lineWidth(1).strokeColor(RC.summaryBorder).stroke();

  const sumColW = CW / 3;

  doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
    .text("RECEITA EXTRA ESTIMADA", M + 14, Y + 10, { lineBreak: false });
  doc.fontSize(14).fillColor(C.green).font("Helvetica-Bold")
    .text(totalExtraRevenue > 0 ? `+ ${fmt(totalExtraRevenue)}/mês` : "Sob consulta", M + 14, Y + 24, { lineBreak: false });

  doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
    .text("GANHO LÍQUIDO ESTIMADO", M + sumColW + 14, Y + 10, { lineBreak: false });
  const netColor = netGainValue >= 0 ? C.green : C.red;
  doc.fontSize(14).fillColor(netColor).font("Helvetica-Bold")
    .text(netGainValue !== 0 ? fmt(netGainValue) + "/mês" : "—", M + sumColW + 14, Y + 24, { lineBreak: false });

  doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
    .text("PAYBACK DA IMPLANTAÇÃO", M + sumColW * 2 + 14, Y + 10, { lineBreak: false });
  const paybackMonths = netGainValue > 0 ? Math.ceil((data.implantationFee || 0) / netGainValue) : 0;
  const paybackText = paybackMonths > 0 && paybackMonths <= 36 ? `~${paybackMonths} meses` : "—";
  doc.fontSize(14).fillColor(RC.summaryAccent).font("Helvetica-Bold")
    .text(paybackText, M + sumColW * 2 + 14, Y + 24, { lineBreak: false });

  Y += 66;

  if (totalExtraRevenue > 0) {
    doc.fontSize(6.5).fillColor(C.textMuted).font("Helvetica")
      .text(`Projeção anual de receita extra: ${fmt(totalExtraRevenue * 12)}`, M + 11, Y, { lineBreak: false });
    Y += 14;
  }

  Y += 4;
  doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
    .text("* Valores estimados com base no perfil informado. Receitas reais dependem do volume de operações e adesão dos clientes.", M, Y, { width: CW });
}
