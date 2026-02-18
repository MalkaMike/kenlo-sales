/**
 * Page 2 — Strategic Overview (3-column grid) for the server-side PDF.
 */

import { PREMIUM_SERVICES, ADDONS } from "@shared/pricing-config";
import {
  type ProposalData, type DerivedData,
  C, M, CW, GAP, fmt, fmtNum,
  h1, h2, label, value, labelValue, divider, newPage, getAddonDescription,
} from "./pdfTypes";

export function renderStrategicPage(
  doc: PDFKit.PDFDocument,
  data: ProposalData,
  derived: DerivedData,
): void {
  let Y = newPage(doc, data);

  const {
    showImob, showLoc, showCoretagem, showAdministracao,
    selAddons, activeAddons, inactiveAddons, freqInfo,
    isKombo, komboLabel, anyK2, bothK2, hasVip, hasCS,
  } = derived;

  const normPlan = data.paymentPlan?.toLowerCase() || "annual";
  const installments = derived.installments;

  // 3-column grid constants
  const colGap = 14;
  const col3W = (CW - colGap * 2) / 3;
  const col1X = M;
  const col2X = M + col3W + colGap;
  const col3X = M + (col3W + colGap) * 2;

  // Product parts for display
  const prodParts: string[] = [];
  if (showImob) prodParts.push(`Kenlo Imob ${(data.imobPlan || "K").toUpperCase().replace(/K2/gi, "K\u00B2")}`);
  if (showLoc) prodParts.push(`Kenlo Loca\u00e7\u00e3o ${(data.locPlan || "K").toUpperCase().replace(/K2/gi, "K\u00B2")}`);

  // ── COLUMN 1 — PERFIL OPERACIONAL DO CLIENTE ──
  let c1Y = h1(doc, "Perfil Operacional", col1X, Y, col3W);

  if (showCoretagem && showAdministracao) {
    c1Y = h2(doc, "Coretagem", col1X, c1Y);
    c1Y = labelValue(doc, "Nº de usuários", fmtNum(data.imobUsers || 0), col1X, c1Y, col3W);
    c1Y = labelValue(doc, "Leads / mês", fmtNum(data.leadsPerMonth || 0), col1X, c1Y, col3W);
    c1Y = labelValue(doc, "Fechamentos / mês", fmtNum(data.closings || 0), col1X, c1Y, col3W);
    divider(doc, col1X, c1Y, col3W);
    c1Y += 8;
    c1Y = h2(doc, "Administração", col1X, c1Y);
    c1Y = labelValue(doc, "Nº de contratos", fmtNum(data.contracts || 0), col1X, c1Y, col3W);
    c1Y = labelValue(doc, "Novos contratos / mês", fmtNum(data.newContracts || 0), col1X, c1Y, col3W);
    const boletoText = data.chargesBoletoToTenant ? (data.boletoAmount ? `Sim (${fmt(data.boletoAmount)})` : "Sim") : "Não";
    c1Y = labelValue(doc, "Cobra boleto?", boletoText, col1X, c1Y, col3W);
    const splitText = data.chargesSplitToOwner ? (data.splitAmount ? `Sim (${data.splitAmount}%)` : "Sim") : "Não";
    c1Y = labelValue(doc, "Cobra split?", splitText, col1X, c1Y, col3W);
  } else if (showCoretagem) {
    c1Y = h2(doc, "Coretagem", col1X, c1Y);
    c1Y = labelValue(doc, "Nº de usuários", fmtNum(data.imobUsers || 0), col1X, c1Y, col3W);
    c1Y = labelValue(doc, "Leads / mês", fmtNum(data.leadsPerMonth || 0), col1X, c1Y, col3W);
    c1Y = labelValue(doc, "Fechamentos / mês", fmtNum(data.closings || 0), col1X, c1Y, col3W);
  } else if (showAdministracao) {
    c1Y = h2(doc, "Administração", col1X, c1Y);
    c1Y = labelValue(doc, "Nº de contratos", fmtNum(data.contracts || 0), col1X, c1Y, col3W);
    c1Y = labelValue(doc, "Novos contratos / mês", fmtNum(data.newContracts || 0), col1X, c1Y, col3W);
    const boletoText = data.chargesBoletoToTenant ? (data.boletoAmount ? `Sim (${fmt(data.boletoAmount)})` : "Sim") : "Não";
    c1Y = labelValue(doc, "Cobra boleto?", boletoText, col1X, c1Y, col3W);
    const splitText = data.chargesSplitToOwner ? (data.splitAmount ? `Sim (${data.splitAmount}%)` : "Sim") : "Não";
    c1Y = labelValue(doc, "Cobra split?", splitText, col1X, c1Y, col3W);
  }

  // ── COLUMN 2 — ESTRUTURA CONTRATADA ──
  let c2Y = h1(doc, "Estrutura Contratada", col2X, Y, col3W);

  // Block 1: Ciclo
  c2Y = h2(doc, "Ciclo", col2X, c2Y);
  value(doc, `Plano ${freqInfo.label}${freqInfo.discount ? ` (${freqInfo.discount})` : ""}`, col2X, c2Y, { color: C.primary, size: 9 });
  c2Y += 16;

  // Block 2: Produtos e Planos
  c2Y = h2(doc, "Produtos e Planos", col2X, c2Y);
  value(doc, prodParts.join(" & "), col2X, c2Y, { size: 8.5 });
  c2Y += 14;
  if (isKombo) {
    label(doc, komboLabel, col2X, c2Y, { color: C.green, size: 7, bold: true });
    c2Y += 12;
  }
  c2Y += 4;

  // Block 3: Add-ons Selecionados
  if (activeAddons.length > 0) {
    c2Y = h2(doc, "Add-ons Selecionados", col2X, c2Y);
    for (const addon of activeAddons) {
      doc.roundedRect(col2X, c2Y, col3W, 22, 3).fillAndStroke(C.greenLight, C.greenBorder);
      doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
        .text(`Kenlo ${addon.label}`, col2X + 5, c2Y + 3, { lineBreak: false });
      const desc = getAddonDescription(addon.label);
      if (desc) {
        doc.fontSize(5.5).fillColor(C.textMuted).font("Helvetica")
          .text(desc, col2X + 5, c2Y + 13, { width: col3W - 10, lineBreak: false });
      }
      c2Y += 26;
    }
    c2Y += 2;
  }

  // Block 4: Add-ons Não Incluídos
  if (inactiveAddons.length > 0) {
    c2Y = h2(doc, "Não Incluídos", col2X, c2Y);
    const inactiveNames = inactiveAddons.map(a => a.label).join(", ");
    doc.fontSize(6.5).fillColor(C.textLight).font("Helvetica")
      .text(inactiveNames, col2X, c2Y, { width: col3W, lineBreak: true });
    c2Y += 14;
  }

  // ── COLUMN 3 — INVESTIMENTO & ESCOPO ──
  let c3Y = h1(doc, "Investimento e Escopo", col3X, Y, col3W);

  // Block 1: Investimento Contratual
  c3Y = h2(doc, "Investimento Contratual", col3X, c3Y);

  const totalAnnual = data.totalAnnual || 0;
  const totalImplantation = data.implantationFee || 0;

  if (normPlan === "monthly" || normPlan === "mensal") {
    label(doc, "Contrato Mensal", col3X, c3Y, { size: 6 });
    c3Y += 9;
    doc.fontSize(16).fillColor(C.red).font("Helvetica-Bold")
      .text(fmt(data.totalMonthly || 0), col3X, c3Y, { lineBreak: false });
    doc.fontSize(7).fillColor(C.textMuted).font("Helvetica")
      .text(" / mês", col3X + doc.widthOfString(fmt(data.totalMonthly || 0)) + 2, c3Y + 7, { lineBreak: false });
    c3Y += 22;
  } else if (normPlan === "semestral") {
    const semiTotal = (data.totalMonthly || 0) * 6;
    label(doc, "Contrato Semestral", col3X, c3Y, { size: 6 });
    c3Y += 9;
    doc.fontSize(16).fillColor(C.red).font("Helvetica-Bold")
      .text(fmt(semiTotal), col3X, c3Y, { lineBreak: false });
    c3Y += 22;
    if (installments > 1) {
      label(doc, `Parcelado em ${installments}x de ${fmt(semiTotal / installments)}`, col3X, c3Y, { size: 6.5, color: C.text });
      c3Y += 12;
    }
  } else {
    const periodLabel = normPlan === "bienal" ? "Bienal" : "Anual";
    const totalInvestment = totalAnnual + totalImplantation;
    label(doc, `Contrato ${periodLabel}`, col3X, c3Y, { size: 6 });
    c3Y += 9;
    doc.fontSize(16).fillColor(C.red).font("Helvetica-Bold")
      .text(fmt(totalInvestment), col3X, c3Y, { lineBreak: false });
    c3Y += 22;
    if (installments > 1) {
      label(doc, `Parcelado em ${installments}x de ${fmt(totalInvestment / installments)}`, col3X, c3Y, { size: 6.5, color: C.text });
      c3Y += 12;
    }
  }

  if (totalImplantation > 0) {
    label(doc, `Inclui implantação: ${fmt(totalImplantation)}`, col3X, c3Y, { size: 6, color: C.textMuted });
    c3Y += 14;
  }

  divider(doc, col3X, c3Y, col3W);
  c3Y += 8;

  // Block 2: Escopo Incluído
  c3Y = h2(doc, "Escopo Incluído", col3X, c3Y);

  const scopeItems: string[] = [];
  // Bug fix: Show included users per plan, not total users entered
  const includedImobUsers = data.imobPlan?.toLowerCase() === "prime" ? 2 : data.imobPlan?.toLowerCase() === "k" ? 7 : 15;
  if (data.imobUsers && data.imobUsers > 0) scopeItems.push(`${fmtNum(includedImobUsers)} usuários inclusos`);
  if (data.contracts && data.contracts > 0) scopeItems.push(`${fmtNum(data.contracts)} contratos sob gestão`);
  if (selAddons.includes("assinatura")) scopeItems.push(`${ADDONS.assinaturas.includedSignatures} assinaturas digitais`);
  if (data.wantsWhatsApp) scopeItems.push(`${ADDONS.leads.includedWhatsAppLeads} conversas WhatsApp/mês`);
  if (selAddons.includes("inteligencia")) scopeItems.push("1 usuário Explorer");

  for (const item of scopeItems) {
    doc.fontSize(7).fillColor(C.text).font("Helvetica")
      .text(item, col3X, c3Y, { width: col3W, lineBreak: false });
    c3Y += 12;
  }

  if (scopeItems.length > 0) {
    divider(doc, col3X, c3Y + 2, col3W);
    c3Y += 10;
  }

  // Block 3: Serviços Premium
  c3Y = h2(doc, "Serviços Premium", col3X, c3Y);

  // VIP
  const vipStatus = hasVip ? (data.vipIncluded ? "Ativado" : fmt(data.vipPrice || 97) + "/mês") : "Não incluído";
  const vipColor = hasVip ? C.green : C.textLight;
  doc.fontSize(6.5).fillColor(C.dark).font("Helvetica-Bold")
    .text("Suporte VIP", col3X, c3Y, { lineBreak: false });
  doc.fontSize(6.5).fillColor(vipColor).font("Helvetica")
    .text(vipStatus, col3X, c3Y, { width: col3W, align: "right" });
  c3Y += 12;

  // CS Dedicado
  const csStatus = hasCS ? (data.csIncluded ? "Ativado" : fmt(data.csPrice || PREMIUM_SERVICES.csDedicado.monthlyPrice) + "/mês") : "Não incluído";
  const csColor = hasCS ? C.green : C.textLight;
  doc.fontSize(6.5).fillColor(C.dark).font("Helvetica-Bold")
    .text("CS Dedicado", col3X, c3Y, { lineBreak: false });
  doc.fontSize(6.5).fillColor(csColor).font("Helvetica")
    .text(csStatus, col3X, c3Y, { width: col3W, align: "right" });
  c3Y += 12;

  // Treinamentos
  const trainingStatus = anyK2
    ? (bothK2 ? "4x online ou 2x presencial" : "2x online ou 1x presencial")
    : "Não incluído";
  const trainingColor = anyK2 ? C.green : C.textLight;
  doc.fontSize(6.5).fillColor(C.dark).font("Helvetica-Bold")
    .text("Treinamentos", col3X, c3Y, { lineBreak: false });
  doc.fontSize(6.5).fillColor(trainingColor).font("Helvetica")
    .text(trainingStatus, col3X, c3Y, { width: col3W, align: "right" });
  c3Y += 12;
}
