/**
 * Section 4B: Comparativo de Cenários (selected columns from KomboComparisonTable)
 */

import type { jsPDF } from "jspdf";
import {
  type ProposalPrintData, M, CW,
  rgb, C, sectionTitle, divider, needsNewPage, newPage, fmtNum,
} from "./pdfHelpers";

// ── Column data interface ───────────────────────────────────────
interface SelectedColumn {
  id: string; name: string; shortName: string; discount: number;
  imobPrice: number | null; locPrice: number | null;
  leadsPrice: number | null; inteligenciaPrice: number | null;
  assinaturaPrice: number | null; whatsAppPrice: string | null;
  payPrice: string | null; segurosPrice: string | null; cashPrice: string | null;
  vipSupportPrice: number | string | null; dedicatedCSPrice: number | string | null;
  trainingPrice: number | string | null;
  subscriptionCount: number; totalMonthly: number;
  implementation: number; cycleTotalValue: number; cycleMonths: number;
  implBreakdown: Array<{ label: string; cost: number; free: boolean }>;
  overrides?: { frequency: string };
  postPaidUsers?: { cost: number; additional: number; included: number; perUnit: number } | null;
  postPaidContracts?: { cost: number; additional: number; included: number; perUnit: number } | null;
  postPaidWhatsApp?: { included: number; label: string } | null;
  postPaidAssinaturas?: { cost: number; additional: number; included: number; total: number; perUnit: number } | null;
  postPaidBoletos?: { cost: number; quantity: number; perUnit: number } | null;
  postPaidSplits?: { cost: number; quantity: number; perUnit: number } | null;
  postPaidTotal?: number;
  prePaidUsersActive?: boolean;
  prePaidContractsActive?: boolean;
}

const cycleLabels: Record<string, string> = {
  monthly: "Mensal", semestral: "Semestral", annual: "Anual", biennial: "Bienal"
};

// ── Row drawing helper ──────────────────────────────────────────
function drawRow(
  doc: jsPDF, label: string, values: string[], yPos: number, numCols: number,
  labelW: number, colW: number,
  opts?: { bold?: boolean; bg?: string; labelBold?: boolean; valueColor?: string }
): number {
  if (opts?.bg) {
    doc.setFillColor(...rgb(opts.bg));
    doc.rect(M, yPos - 8, CW, 14, "F");
  }
  doc.setFontSize(7);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", opts?.labelBold ? "bold" : "normal");
  doc.text(label, M + 4, yPos);
  for (let i = 0; i < numCols; i++) {
    const x = M + labelW + colW * i + colW / 2;
    doc.setFontSize(opts?.bold ? 8 : 7);
    doc.setTextColor(...rgb(opts?.valueColor || C.text));
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.text(values[i] || "—", x, yPos, { align: "center" });
  }
  return yPos + 14;
}

// ── Post-paid row with detail sub-line ──────────────────────────
function drawPostPaidRow(
  doc: jsPDF, data: ProposalPrintData, label: string,
  mainVals: string[], detailVals: string[], yPos: number,
  numCols: number, labelW: number, colW: number
): number {
  if (needsNewPage(yPos, 24)) yPos = newPage(doc, data);
  doc.setFontSize(7);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", "normal");
  doc.text(label, M + 4, yPos);
  for (let i = 0; i < numCols; i++) {
    const x = M + labelW + colW * i + colW / 2;
    const val = mainVals[i] || "—";
    if (val === "No Plano" || val === "Sem custos" || val.includes("Pré-pago")) {
      doc.setTextColor(...rgb(C.green));
      doc.setFont("helvetica", "bold");
    } else if (val.startsWith("R$")) {
      doc.setTextColor(...rgb("#B45309"));
      doc.setFont("helvetica", "bold");
    } else {
      doc.setTextColor(...rgb(C.textMuted));
      doc.setFont("helvetica", "normal");
    }
    doc.text(val, x, yPos, { align: "center" });
  }
  if (detailVals.some(v => v !== "")) {
    const detailY = yPos + 9;
    doc.setFontSize(5.5);
    doc.setTextColor(...rgb(C.textLight));
    doc.setFont("helvetica", "italic");
    for (let i = 0; i < numCols; i++) {
      const x = M + labelW + colW * i + colW / 2;
      if (detailVals[i]) doc.text(detailVals[i], x, detailY, { align: "center" });
    }
    return detailY + 9;
  }
  return yPos + 14;
}

// ── Main render function ────────────────────────────────────────
export function renderComparison(doc: jsPDF, data: ProposalPrintData, Y: number): number {
  if (!data.selectedColumnsJson) return Y;

  let selectedCols: SelectedColumn[];
  try {
    selectedCols = JSON.parse(data.selectedColumnsJson);
  } catch (e) {
    console.error("Error parsing selectedColumnsJson:", e);
    return Y;
  }

  if (selectedCols.length === 0) return Y;

  if (needsNewPage(Y, 300)) Y = newPage(doc, data);
  Y = sectionTitle(doc, "Comparativo de Cenários", Y);

  const numCols = selectedCols.length;
  const labelW = 120;
  const colW = (CW - labelW) / numCols;

  // ── Header row ──
  doc.setFillColor(...rgb(C.primary));
  doc.rect(M, Y - 4, CW, 16, "F");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Cenário", M + 4, Y + 6);
  for (let i = 0; i < numCols; i++) {
    const x = M + labelW + colW * i + colW / 2;
    const colName = selectedCols[i].name.length > 16
      ? selectedCols[i].name.substring(0, 16) + "…"
      : selectedCols[i].name;
    const discountText = selectedCols[i].discount > 0
      ? ` (${Math.round(selectedCols[i].discount * 100)}% OFF)`
      : "";
    doc.text(colName + discountText, x, Y + 6, { align: "center" });
  }
  Y += 18;

  // ── Produtos ──
  Y = drawRow(doc, "Produtos", [], Y, numCols, labelW, colW, { bg: C.bgSoft, labelBold: true });
  const imobVals = selectedCols.map(c => c.imobPrice !== null ? `R$ ${fmtNum(c.imobPrice)}` : "—");
  if (imobVals.some(v => v !== "—")) Y = drawRow(doc, "  Imob", imobVals, Y, numCols, labelW, colW);
  const locVals = selectedCols.map(c => c.locPrice !== null ? `R$ ${fmtNum(c.locPrice)}` : "—");
  if (locVals.some(v => v !== "—")) Y = drawRow(doc, "  Locação", locVals, Y, numCols, labelW, colW);

  // ── Add-ons ──
  Y = drawRow(doc, "Add-ons", [], Y, numCols, labelW, colW, { bg: C.bgSoft, labelBold: true });
  const leadsVals = selectedCols.map(c => c.leadsPrice !== null ? `R$ ${fmtNum(c.leadsPrice)}` : "—");
  if (leadsVals.some(v => v !== "—")) Y = drawRow(doc, "  Leads", leadsVals, Y, numCols, labelW, colW);
  const intelVals = selectedCols.map(c => c.inteligenciaPrice !== null ? `R$ ${fmtNum(c.inteligenciaPrice)}` : "—");
  if (intelVals.some(v => v !== "—")) Y = drawRow(doc, "  Inteligência", intelVals, Y, numCols, labelW, colW);
  const assVals = selectedCols.map(c => c.assinaturaPrice !== null ? `R$ ${fmtNum(c.assinaturaPrice)}` : "—");
  if (assVals.some(v => v !== "—")) Y = drawRow(doc, "  Assinatura", assVals, Y, numCols, labelW, colW);

  // ── Serviços Premium ──
  const vipVals = selectedCols.map(c => {
    if (c.vipSupportPrice === "Incluído") return "Incluído";
    if (typeof c.vipSupportPrice === "number") return `R$ ${fmtNum(c.vipSupportPrice)}`;
    return "—";
  });
  const csVals = selectedCols.map(c => {
    if (c.dedicatedCSPrice === "Incluído") return "Incluído";
    if (typeof c.dedicatedCSPrice === "number") return `R$ ${fmtNum(c.dedicatedCSPrice)}`;
    return "—";
  });
  const trainVals = selectedCols.map(c => {
    if (c.trainingPrice === "Incluído") return "Incluído";
    if (typeof c.trainingPrice === "number") return `R$ ${fmtNum(c.trainingPrice)}`;
    return "—";
  });
  if (vipVals.some(v => v !== "—") || csVals.some(v => v !== "—") || trainVals.some(v => v !== "—")) {
    Y = drawRow(doc, "Serviços Premium", [], Y, numCols, labelW, colW, { bg: C.bgSoft, labelBold: true });
    if (vipVals.some(v => v !== "—")) Y = drawRow(doc, "  Suporte VIP", vipVals, Y, numCols, labelW, colW);
    if (csVals.some(v => v !== "—")) Y = drawRow(doc, "  CS Dedicado", csVals, Y, numCols, labelW, colW);
    if (trainVals.some(v => v !== "—")) Y = drawRow(doc, "  Treinamentos", trainVals, Y, numCols, labelW, colW);
  }

  // ── Mensalidades ──
  divider(doc, Y - 4);
  const monthlyVals = selectedCols.map(c => `R$ ${fmtNum(c.totalMonthly)}`);
  const subVals = selectedCols.map(c => `${c.subscriptionCount} assinatura${c.subscriptionCount !== 1 ? "s" : ""}`);
  Y = drawRow(doc, "Mensalidades (Pré-Pago)", monthlyVals, Y, numCols, labelW, colW, { bold: true });
  doc.setFontSize(6);
  doc.setTextColor(...rgb(C.textMuted));
  for (let i = 0; i < numCols; i++) {
    const x = M + labelW + colW * i + colW / 2;
    doc.text(subVals[i], x, Y - 6, { align: "center" });
  }
  Y += 4; // Extra spacing to prevent sub-line clipping into next row

  // ── Implantação ──
  Y = drawRow(doc, "Implantação", [], Y, numCols, labelW, colW, { bg: C.bgSoft, labelBold: true });
  const implLabelsSet = new Set<string>();
  selectedCols.forEach(c => c.implBreakdown.forEach(b => implLabelsSet.add(b.label)));
  const implLabels = Array.from(implLabelsSet);
  for (const label of implLabels) {
    if (needsNewPage(Y, 20)) Y = newPage(doc, data);
    const vals = selectedCols.map(c => {
      const item = c.implBreakdown.find(b => b.label === label);
      if (!item) return "—";
      if (item.free) return "Ofertado";
      return `R$ ${fmtNum(item.cost)}`;
    });
    doc.setFontSize(7);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text(`  ${label}`, M + 4, Y);
    for (let i = 0; i < numCols; i++) {
      const x = M + labelW + colW * i + colW / 2;
      if (vals[i] === "Ofertado") {
        doc.setTextColor(...rgb(C.green));
        doc.setFont("helvetica", "bold");
      } else {
        doc.setTextColor(...rgb(C.text));
        doc.setFont("helvetica", "normal");
      }
      doc.text(vals[i], x, Y, { align: "center" });
    }
    Y += 14;
  }
  const implTotalVals = selectedCols.map(c => `R$ ${fmtNum(c.implementation)}`);
  Y = drawRow(doc, "Total Implantação", implTotalVals, Y, numCols, labelW, colW, { bold: true });

  // ── Total 1º Ano ──
  divider(doc, Y - 4);
  const totalVals = selectedCols.map(c => `R$ ${fmtNum(c.cycleTotalValue)}`);
  const totalCycleLabels = selectedCols.map(c => `(${cycleLabels[c.overrides?.frequency || "annual"] || "Anual"})`);
  Y = drawRow(doc, "Total 1º Ano", totalVals, Y, numCols, labelW, colW, { bold: true, valueColor: C.dark });
  doc.setFontSize(6);
  doc.setTextColor(...rgb(C.textMuted));
  for (let i = 0; i < numCols; i++) {
    const x = M + labelW + colW * i + colW / 2;
    doc.text(totalCycleLabels[i], x, Y - 6, { align: "center" });
  }

  // Ciclo
  const cycleVals = selectedCols.map(c => cycleLabels[c.overrides?.frequency || "annual"] || "Anual");
  Y = drawRow(doc, "Ciclo", cycleVals, Y, numCols, labelW, colW);

  // ── Pós-Pago section ──
  if (needsNewPage(Y, 140)) Y = newPage(doc, data);
  Y = drawRow(doc, "Custos Variáveis (Pós-Pago)", [], Y, numCols, labelW, colW, { bg: C.bgSoft, labelBold: true });

  // Usuários adicionais
  const ppUserMain = selectedCols.map(c => {
    const pp = c.postPaidUsers;
    if (!pp) return "—";
    if (pp.cost === 0) return "No Plano";
    if (c.prePaidUsersActive) return "Pré-pago ✓";
    return `R$ ${fmtNum(pp.cost)}`;
  });
  const ppUserDetail = selectedCols.map(c => {
    const pp = c.postPaidUsers;
    if (!pp || pp.cost === 0) return pp ? `${pp.included} incluídos` : "";
    return `${pp.additional} adic. × R$ ${pp.perUnit.toFixed(2)}`;
  });
  if (ppUserMain.some(v => v !== "—"))
    Y = drawPostPaidRow(doc, data, "  Usuários adicionais", ppUserMain, ppUserDetail, Y, numCols, labelW, colW);

  // Contratos adicionais
  const ppContMain = selectedCols.map(c => {
    const pp = c.postPaidContracts;
    if (!pp) return "—";
    if (pp.cost === 0) return "No Plano";
    if (c.prePaidContractsActive) return "Pré-pago ✓";
    return `R$ ${fmtNum(pp.cost)}`;
  });
  const ppContDetail = selectedCols.map(c => {
    const pp = c.postPaidContracts;
    if (!pp || pp.cost === 0) return pp ? `${pp.included} incluídos` : "";
    return `${pp.additional} adic. × R$ ${pp.perUnit.toFixed(2)}`;
  });
  if (ppContMain.some(v => v !== "—"))
    Y = drawPostPaidRow(doc, data, "  Contratos adicionais", ppContMain, ppContDetail, Y, numCols, labelW, colW);

  // WhatsApp Leads
  const ppWpMain = selectedCols.map(c => c.postPaidWhatsApp ? "Pós-pago" : "—");
  const ppWpDetail = selectedCols.map(c => c.postPaidWhatsApp ? `${c.postPaidWhatsApp.included} incl./mês` : "");
  if (ppWpMain.some(v => v !== "—"))
    Y = drawPostPaidRow(doc, data, "  WhatsApp Leads", ppWpMain, ppWpDetail, Y, numCols, labelW, colW);

  // Assinaturas
  const ppSigMain = selectedCols.map(c => {
    const pp = c.postPaidAssinaturas;
    if (!pp) return "—";
    if (pp.cost === 0) return "No Plano";
    return `R$ ${pp.cost.toFixed(2).replace('.', ',')}`;
  });
  const ppSigDetail = selectedCols.map(c => {
    const pp = c.postPaidAssinaturas;
    if (!pp) return "";
    if (pp.cost === 0) return `${pp.included} incl., ${pp.total} usadas`;
    return `${pp.additional} adic. × R$ ${pp.perUnit.toFixed(2)}`;
  });
  if (ppSigMain.some(v => v !== "—"))
    Y = drawPostPaidRow(doc, data, "  Assinaturas", ppSigMain, ppSigDetail, Y, numCols, labelW, colW);

  // Boletos
  const ppBolMain = selectedCols.map(c => c.postPaidBoletos ? `R$ ${fmtNum(c.postPaidBoletos.cost)}` : "—");
  const ppBolDetail = selectedCols.map(c => {
    const pp = c.postPaidBoletos;
    if (!pp) return "";
    return `${pp.quantity.toLocaleString('pt-BR')} × R$ ${pp.perUnit.toFixed(2)}`;
  });
  if (ppBolMain.some(v => v !== "—"))
    Y = drawPostPaidRow(doc, data, "  Boletos", ppBolMain, ppBolDetail, Y, numCols, labelW, colW);

  // Splits
  const ppSplMain = selectedCols.map(c => c.postPaidSplits ? `R$ ${fmtNum(c.postPaidSplits.cost)}` : "—");
  const ppSplDetail = selectedCols.map(c => {
    const pp = c.postPaidSplits;
    if (!pp) return "";
    return `${pp.quantity.toLocaleString('pt-BR')} × R$ ${pp.perUnit.toFixed(2)}`;
  });
  if (ppSplMain.some(v => v !== "—"))
    Y = drawPostPaidRow(doc, data, "  Splits", ppSplMain, ppSplDetail, Y, numCols, labelW, colW);

  // Total Pós-Pago
  divider(doc, Y - 4);
  const ppTotalMain = selectedCols.map(c => {
    const total = c.postPaidTotal ?? 0;
    if (total === 0) {
      const hasAny = c.postPaidUsers || c.postPaidContracts || c.postPaidWhatsApp || c.postPaidAssinaturas || c.postPaidBoletos || c.postPaidSplits;
      if (!hasAny) return "—";
      return "Sem custos";
    }
    return `R$ ${fmtNum(total)}/mês`;
  });
  Y = drawRow(doc, "Total Pós-Pago (est.)", ppTotalMain, Y, numCols, labelW, colW, { bold: true, valueColor: "#B45309" });

  Y += 10;
  return Y;
}
