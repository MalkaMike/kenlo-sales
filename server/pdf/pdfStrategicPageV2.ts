/**
 * Page 2 — Strategic Overview (REFACTORED) for the server-side PDF.
 * 
 * CRITICAL CHANGES:
 * ✅ IMOB and Locação are now COMPLETELY SEPARATED
 * ✅ Each product gets its own dedicated section with clear header
 * ✅ Pricing tables show ONLY the selected product's data
 * ✅ Add-ons are clearly associated with their parent product
 * ✅ No mixing of product contexts
 */

import { PREMIUM_SERVICES, IMOB_IMPLEMENTATION, LOC_IMPLEMENTATION, PREPAID_DISCOUNT_PERCENTAGE } from "@shared/pricing-config";
import {
  type ProposalData, type DerivedData,
  C, M, CW, GAP, fmt, fmtNum,
  h1, h2, label, value, labelValue, divider, newPage, getAddonDescription,
  FREQ_MAP,
} from "./pdfTypes";

export function renderStrategicPageV2(
  doc: PDFKit.PDFDocument,
  data: ProposalData,
  derived: DerivedData,
): void {
  let Y = newPage(doc, data);

  const {
    showImob, showLoc,
    selAddons, activeAddons, freqInfo,
    isKombo, komboLabel,
  } = derived;

  // ════════════════════════════════════════════════════════════════
  // SECTION 1: IMOB (if selected)
  // ════════════════════════════════════════════════════════════════
  if (showImob) {
    Y = renderImobSection(doc, data, derived, Y);
    Y += 12; // spacing between sections
  }

  // ════════════════════════════════════════════════════════════════
  // SECTION 2: LOCAÇÃO (if selected)
  // ════════════════════════════════════════════════════════════════
  if (showLoc) {
    Y = renderLocacaoSection(doc, data, derived, Y);
    Y += 12;
  }

  // ════════════════════════════════════════════════════════════════
  // SECTION 3: COMBO INFO (if applicable)
  // ════════════════════════════════════════════════════════════════
  if (isKombo && showImob && showLoc) {
    Y = h1(doc, "Combo Selecionado", M, Y);
    doc.roundedRect(M, Y, CW, 20, 3).fillAndStroke(C.greenLight, C.greenBorder);
    doc.fontSize(8).fillColor(C.green).font("Helvetica-Bold")
      .text(komboLabel, M + 5, Y + 5, { lineBreak: false });
    doc.fontSize(7).fillColor(C.textMuted).font("Helvetica")
      .text("Desconto de 25% aplicado em todos os produtos e add-ons", M + 5, Y + 15, { lineBreak: false });
    Y += 28;
  }
}

// ════════════════════════════════════════════════════════════════
// IMOB SECTION
// ════════════════════════════════════════════════════════════════
function renderImobSection(
  doc: PDFKit.PDFDocument,
  data: ProposalData,
  derived: DerivedData,
  startY: number,
): number {
  let Y = startY;

  // Header
  Y = h1(doc, "📊 Kenlo IMOB", M, Y);

  // 2-column layout for IMOB details
  const colGap = 14;
  const colW = (CW - colGap) / 2;
  const col1X = M;
  const col2X = M + colW + colGap;

  // LEFT COLUMN: Operacional
  let lY = h2(doc, "Perfil Operacional", col1X, Y);
  lY = labelValue(doc, "Plano", (data.imobPlan || "K").toUpperCase().replace(/K2/gi, "K²"), col1X, lY, colW);
  lY = labelValue(doc, "Nº de usuários", fmtNum(data.imobUsers || 0), col1X, lY, colW);
  lY = labelValue(doc, "Leads / mês", fmtNum(data.leadsPerMonth || 0), col1X, lY, colW);
  lY = labelValue(doc, "Fechamentos / mês", fmtNum(data.closings || 0), col1X, lY, colW);

  // RIGHT COLUMN: Investimento
  const normPlan = data.paymentPlan?.toLowerCase() || "annual";
  const freqLabel = FREQ_MAP[normPlan]?.label || "Anual";
  const freqDiscount = FREQ_MAP[normPlan]?.discount || "";
  let rY = h2(doc, `Investimento (${freqLabel}${freqDiscount ? " " + freqDiscount : ""})`, col2X, Y);
  const imobMonthly = data.imobPrice || 0;
  const imobSetup = IMOB_IMPLEMENTATION;
  rY = labelValue(doc, `Licença ${freqLabel}`, fmt(imobMonthly) + "/mês", col2X, rY, colW);
  rY = labelValue(doc, "Implantação (única)", fmt(imobSetup), col2X, rY, colW);

  // Show prepaid info if applicable
  if (data.prepayAdditionalUsers && data.prepaymentUsersAmount && data.prepaymentUsersAmount > 0) {
    const months = data.prepaymentMonths || 12;
    rY = labelValue(doc, `Pré-pago Usuários (${months}m, ${PREPAID_DISCOUNT_PERCENTAGE}% OFF)`, fmt(data.prepaymentUsersAmount), col2X, rY, colW);
  }

  Y = Math.max(lY, rY) + 8;

  // Add-ons específicos do IMOB
  const imobAddons = derived.activeAddons.filter(a => 
    ["Leads", "Inteligência", "Assinatura", "Omnichannel"].includes(a.label)
  );

  if (imobAddons.length > 0) {
    Y = h2(doc, "Add-ons Inclusos", M, Y);
    for (const addon of imobAddons) {
      doc.roundedRect(M, Y, CW, 18, 3).fillAndStroke(C.greenLight, C.greenBorder);
      doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
        .text(`✓ Kenlo ${addon.label}`, M + 5, Y + 3, { lineBreak: false });
      const desc = getAddonDescription(addon.label);
      if (desc) {
        doc.fontSize(5.5).fillColor(C.textMuted).font("Helvetica")
          .text(desc, M + 5, Y + 11, { width: CW - 10, lineBreak: false });
      }
      Y += 22;
    }
  }

  return Y;
}

// ════════════════════════════════════════════════════════════════
// LOCAÇÃO SECTION
// ════════════════════════════════════════════════════════════════
function renderLocacaoSection(
  doc: PDFKit.PDFDocument,
  data: ProposalData,
  derived: DerivedData,
  startY: number,
): number {
  let Y = startY;

  // Header
  Y = h1(doc, "🏢 Kenlo Locação", M, Y);

  // 2-column layout for Locação details
  const colGap = 14;
  const colW = (CW - colGap) / 2;
  const col1X = M;
  const col2X = M + colW + colGap;

  // LEFT COLUMN: Operacional
  let lY = h2(doc, "Perfil Operacional", col1X, Y);
  lY = labelValue(doc, "Plano", (data.locPlan || "K").toUpperCase().replace(/K2/gi, "K²"), col1X, lY, colW);
  lY = labelValue(doc, "Nº de contratos", fmtNum(data.contracts || 0), col1X, lY, colW);
  lY = labelValue(doc, "Novos contratos / mês", fmtNum(data.newContracts || 0), col1X, lY, colW);
  const boletoText = data.chargesBoletoToTenant ? (data.boletoAmount ? `Sim (${fmt(data.boletoAmount)})` : "Sim") : "Não";
  lY = labelValue(doc, "Cobra boleto?", boletoText, col1X, lY, colW);
  const splitText = data.chargesSplitToOwner ? (data.splitAmount ? `Sim (${data.splitAmount}%)` : "Sim") : "Não";
  lY = labelValue(doc, "Cobra split?", splitText, col1X, lY, colW);

  // RIGHT COLUMN: Investimento
  const normPlan = data.paymentPlan?.toLowerCase() || "annual";
  const freqLabel = FREQ_MAP[normPlan]?.label || "Anual";
  const freqDiscount = FREQ_MAP[normPlan]?.discount || "";
  let rY = h2(doc, `Investimento (${freqLabel}${freqDiscount ? " " + freqDiscount : ""})`, col2X, Y);
  const locMonthly = data.locPrice || 0;
  const locSetup = LOC_IMPLEMENTATION;
  rY = labelValue(doc, `Licença ${freqLabel}`, fmt(locMonthly) + "/mês", col2X, rY, colW);
  rY = labelValue(doc, "Implantação (única)", fmt(locSetup), col2X, rY, colW);

  // Show prepaid info if applicable
  if (data.prepayAdditionalContracts && data.prepaymentContractsAmount && data.prepaymentContractsAmount > 0) {
    const months = data.prepaymentMonths || 12;
    rY = labelValue(doc, `Pré-pago Contratos (${months}m, ${PREPAID_DISCOUNT_PERCENTAGE}% OFF)`, fmt(data.prepaymentContractsAmount), col2X, rY, colW);
  }

  Y = Math.max(lY, rY) + 8;

  // Add-ons específicos da Locação
  const locAddons = derived.activeAddons.filter(a => 
    ["Pay", "Assinatura"].includes(a.label)
  );

  if (locAddons.length > 0) {
    Y = h2(doc, "Add-ons Inclusos", M, Y);
    for (const addon of locAddons) {
      doc.roundedRect(M, Y, CW, 18, 3).fillAndStroke(C.greenLight, C.greenBorder);
      doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
        .text(`✓ Kenlo ${addon.label}`, M + 5, Y + 3, { lineBreak: false });
      const desc = getAddonDescription(addon.label);
      if (desc) {
        doc.fontSize(5.5).fillColor(C.textMuted).font("Helvetica")
          .text(desc, M + 5, Y + 11, { width: CW - 10, lineBreak: false });
      }
      Y += 22;
    }
  }

  return Y;
}
