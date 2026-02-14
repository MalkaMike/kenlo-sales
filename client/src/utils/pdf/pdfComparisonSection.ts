/**
 * Section 4B: Detalhes do Plano Selecionado (single-column detail view)
 * Replaces the old multi-column comparison table since only 1 plan is selected.
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

// ── Detail row helper (label on left, value on right) ──────────
function detailRow(
  doc: jsPDF, label: string, value: string, yPos: number,
  opts?: { bold?: boolean; labelBold?: boolean; valueColor?: string; fontSize?: number }
): number {
  const fs = opts?.fontSize || 8;
  doc.setFontSize(fs);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", opts?.labelBold ? "bold" : "normal");
  doc.text(label, M + 8, yPos);

  doc.setFontSize(fs);
  doc.setTextColor(...rgb(opts?.valueColor || C.text));
  doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  doc.text(value, M + CW - 8, yPos, { align: "right" });
  return yPos + 14;
}

// ── Sub-detail row (smaller, indented, muted) ──────────────────
function subDetailRow(
  doc: jsPDF, text: string, yPos: number,
  opts?: { color?: string; align?: "left" | "right" }
): number {
  doc.setFontSize(6.5);
  doc.setTextColor(...rgb(opts?.color || C.textMuted));
  doc.setFont("helvetica", "italic");
  if (opts?.align === "right") {
    doc.text(text, M + CW - 8, yPos, { align: "right" });
  } else {
    doc.text(text, M + 16, yPos);
  }
  return yPos + 10;
}

// ── Section header bar ─────────────────────────────────────────
function sectionBar(doc: jsPDF, label: string, yPos: number): number {
  doc.setFillColor(...rgb(C.bgSoft));
  doc.rect(M, yPos - 6, CW, 14, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(label, M + 8, yPos + 3);
  return yPos + 16;
}

// ── Post-paid detail row with status coloring ──────────────────
function postPaidDetailRow(
  doc: jsPDF, data: ProposalPrintData, label: string,
  mainVal: string, detail: string, yPos: number
): number {
  if (needsNewPage(yPos, 24)) yPos = newPage(doc, data);

  doc.setFontSize(8);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", "normal");
  doc.text(label, M + 8, yPos);

  // Color the value based on status
  if (mainVal === "No Plano" || mainVal === "Sem custos" || mainVal.includes("Pré-pago")) {
    doc.setTextColor(...rgb(C.green));
    doc.setFont("helvetica", "bold");
  } else if (mainVal.startsWith("R$")) {
    doc.setTextColor(...rgb("#B45309"));
    doc.setFont("helvetica", "bold");
  } else {
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
  }
  doc.setFontSize(8);
  doc.text(mainVal, M + CW - 8, yPos, { align: "right" });

  if (detail) {
    yPos += 10;
    doc.setFontSize(6);
    doc.setTextColor(...rgb(C.textLight));
    doc.setFont("helvetica", "italic");
    doc.text(detail, M + CW - 8, yPos, { align: "right" });
    return yPos + 10;
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

  // Always use the first (and only) selected column
  const col = selectedCols[0];

  if (needsNewPage(Y, 200)) Y = newPage(doc, data);

  // ── Section title ──
  Y = sectionTitle(doc, "Detalhes do Plano Selecionado", Y);

  // ── Plan name header ──
  const discountText = col.discount > 0 ? ` (${Math.round(col.discount * 100)}% OFF)` : "";
  const cycle = cycleLabels[col.overrides?.frequency || "annual"] || "Anual";

  doc.setFillColor(...rgb(C.primary));
  doc.rect(M, Y - 4, CW, 20, "F");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(col.name + discountText, M + 10, Y + 8);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Ciclo: ${cycle}`, M + CW - 10, Y + 8, { align: "right" });
  Y += 24;

  // ── Produtos (Pré-Pago) ──
  Y = sectionBar(doc, "Produtos (Mensalidades Pré-Pago)", Y);

  if (col.imobPrice !== null) {
    Y = detailRow(doc, "Kenlo Imob", `R$ ${fmtNum(col.imobPrice)}/mês`, Y);
  }
  if (col.locPrice !== null) {
    Y = detailRow(doc, "Kenlo Locação", `R$ ${fmtNum(col.locPrice)}/mês`, Y);
  }

  // ── Add-ons ──
  const hasAddons = col.leadsPrice !== null || col.inteligenciaPrice !== null || col.assinaturaPrice !== null;
  if (hasAddons) {
    if (needsNewPage(Y, 60)) Y = newPage(doc, data);
    Y = sectionBar(doc, "Add-ons", Y);
    if (col.leadsPrice !== null) Y = detailRow(doc, "Kenlo Leads", `R$ ${fmtNum(col.leadsPrice)}/mês`, Y);
    if (col.inteligenciaPrice !== null) {
      Y = detailRow(doc, "Kenlo Inteligência", `R$ ${fmtNum(col.inteligenciaPrice)}/mês`, Y);
      Y = subDetailRow(doc, "Google Looker Pro — usuários ilimitados", Y, { color: C.green });
    }
    if (col.assinaturaPrice !== null) Y = detailRow(doc, "Kenlo Assinatura", `R$ ${fmtNum(col.assinaturaPrice)}/mês`, Y);
  }

  // ── Serviços Premium ──
  const hasVip = col.vipSupportPrice !== null && col.vipSupportPrice !== undefined;
  const hasCS = col.dedicatedCSPrice !== null && col.dedicatedCSPrice !== undefined;
  const hasTrain = col.trainingPrice !== null && col.trainingPrice !== undefined;
  if (hasVip || hasCS || hasTrain) {
    if (needsNewPage(Y, 60)) Y = newPage(doc, data);
    Y = sectionBar(doc, "Serviços Premium", Y);
    if (hasVip) {
      const vipVal = col.vipSupportPrice === "Incluído" ? "Incluído" :
        typeof col.vipSupportPrice === "number" ? `R$ ${fmtNum(col.vipSupportPrice)}/mês` : "—";
      Y = detailRow(doc, "Suporte VIP", vipVal, Y, {
        valueColor: vipVal === "Incluído" ? C.green : C.text,
        bold: vipVal === "Incluído"
      });
    }
    if (hasCS) {
      const csVal = col.dedicatedCSPrice === "Incluído" ? "Incluído" :
        typeof col.dedicatedCSPrice === "number" ? `R$ ${fmtNum(col.dedicatedCSPrice)}/mês` : "—";
      Y = detailRow(doc, "CS Dedicado", csVal, Y, {
        valueColor: csVal === "Incluído" ? C.green : C.text,
        bold: csVal === "Incluído"
      });
    }
    if (hasTrain) {
      const trainVal = col.trainingPrice === "Incluído" ? "Incluído" :
        typeof col.trainingPrice === "number" ? `R$ ${fmtNum(col.trainingPrice)}/mês` : "—";
      Y = detailRow(doc, "Treinamentos", trainVal, Y, {
        valueColor: trainVal === "Incluído" ? C.green : C.text,
        bold: trainVal === "Incluído"
      });
    }
  }

  // ── Total Mensalidades (Pré-Pago) ──
  if (needsNewPage(Y, 30)) Y = newPage(doc, data);
  divider(doc, Y - 4);
  Y = detailRow(doc, "Total Mensalidades (Pré-Pago)", `R$ ${fmtNum(col.totalMonthly)}/mês`, Y, {
    bold: true, labelBold: true, valueColor: C.dark, fontSize: 9
  });
  Y = subDetailRow(doc, `${col.subscriptionCount} assinatura${col.subscriptionCount !== 1 ? "s" : ""} no ciclo ${cycle.toLowerCase()}`, Y, { align: "right" });

  // ── Implantação ──
  if (needsNewPage(Y, 80)) Y = newPage(doc, data);
  Y = sectionBar(doc, "Implantação", Y);
  for (const item of col.implBreakdown) {
    if (needsNewPage(Y, 16)) Y = newPage(doc, data);
    const val = item.free ? "Ofertado" : `R$ ${fmtNum(item.cost)}`;
    Y = detailRow(doc, item.label, val, Y, {
      valueColor: item.free ? C.green : C.text,
      bold: item.free
    });
  }
  divider(doc, Y - 4);
  Y = detailRow(doc, "Total Implantação", `R$ ${fmtNum(col.implementation)}`, Y, {
    bold: true, labelBold: true, fontSize: 9
  });

  // ── Total 1º Ciclo ──
  if (needsNewPage(Y, 40)) Y = newPage(doc, data);
  doc.setFillColor(...rgb(C.dark));
  doc.rect(M, Y - 2, CW, 20, "F");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Investimento Total (1º Ciclo)", M + 10, Y + 10);
  doc.setFontSize(10);
  doc.text(`R$ ${fmtNum(col.cycleTotalValue)}`, M + CW - 10, Y + 10, { align: "right" });
  Y += 26;

  // ── Custos Variáveis (Pós-Pago) ──
  const hasPP = col.postPaidUsers || col.postPaidContracts || col.postPaidWhatsApp ||
    col.postPaidAssinaturas || col.postPaidBoletos || col.postPaidSplits;

  if (hasPP) {
    if (needsNewPage(Y, 100)) Y = newPage(doc, data);
    Y = sectionBar(doc, "Custos Variáveis (Pós-Pago)", Y);

    // Usuários adicionais
    if (col.postPaidUsers) {
      const pp = col.postPaidUsers;
      let mainVal: string;
      let detail = "";
      if (pp.cost === 0) {
        mainVal = "No Plano";
        detail = `${pp.included} incluídos`;
      } else if (col.prePaidUsersActive) {
        mainVal = "Pré-pago ✓";
        detail = `${pp.additional} adic. × R$ ${pp.perUnit.toFixed(2)}`;
      } else {
        mainVal = `R$ ${fmtNum(pp.cost)}`;
        detail = `${pp.additional} adic. × R$ ${pp.perUnit.toFixed(2)}`;
      }
      Y = postPaidDetailRow(doc, data, "Usuários adicionais", mainVal, detail, Y);
    }

    // Contratos adicionais
    if (col.postPaidContracts) {
      const pp = col.postPaidContracts;
      let mainVal: string;
      let detail = "";
      if (pp.cost === 0) {
        mainVal = "No Plano";
        detail = `${pp.included} incluídos`;
      } else if (col.prePaidContractsActive) {
        mainVal = "Pré-pago ✓";
        detail = `${pp.additional} adic. × R$ ${pp.perUnit.toFixed(2)}`;
      } else {
        mainVal = `R$ ${fmtNum(pp.cost)}`;
        detail = `${pp.additional} adic. × R$ ${pp.perUnit.toFixed(2)}`;
      }
      Y = postPaidDetailRow(doc, data, "Contratos adicionais", mainVal, detail, Y);
    }

    // WhatsApp Leads
    if (col.postPaidWhatsApp) {
      Y = postPaidDetailRow(doc, data, "WhatsApp Leads", "Pós-pago",
        `${col.postPaidWhatsApp.included} incl./mês`, Y);
    }

    // Assinaturas
    if (col.postPaidAssinaturas) {
      const pp = col.postPaidAssinaturas;
      let mainVal: string;
      let detail = "";
      if (pp.cost === 0) {
        mainVal = "No Plano";
        detail = `${pp.included} incl., ${pp.total} usadas`;
      } else {
        mainVal = `R$ ${pp.cost.toFixed(2).replace('.', ',')}`;
        detail = `${pp.additional} adic. × R$ ${pp.perUnit.toFixed(2)}`;
      }
      Y = postPaidDetailRow(doc, data, "Assinaturas", mainVal, detail, Y);
    }

    // Boletos
    if (col.postPaidBoletos) {
      const pp = col.postPaidBoletos;
      Y = postPaidDetailRow(doc, data, "Boletos",
        `R$ ${fmtNum(pp.cost)}`,
        `${pp.quantity.toLocaleString('pt-BR')} × R$ ${pp.perUnit.toFixed(2)}`, Y);
    }

    // Splits
    if (col.postPaidSplits) {
      const pp = col.postPaidSplits;
      Y = postPaidDetailRow(doc, data, "Splits",
        `R$ ${fmtNum(pp.cost)}`,
        `${pp.quantity.toLocaleString('pt-BR')} × R$ ${pp.perUnit.toFixed(2)}`, Y);
    }

    // Total Pós-Pago
    divider(doc, Y - 4);
    const ppTotal = col.postPaidTotal ?? 0;
    let ppTotalLabel: string;
    if (ppTotal === 0) {
      ppTotalLabel = hasPP ? "Sem custos" : "—";
    } else {
      ppTotalLabel = `R$ ${fmtNum(ppTotal)}/mês`;
    }
    Y = detailRow(doc, "Total Pós-Pago (est.)", ppTotalLabel, Y, {
      bold: true, labelBold: true, valueColor: ppTotal > 0 ? "#B45309" : C.green, fontSize: 9
    });
  }

  Y += 6;
  return Y;
}
