/**
 * Client-side PDF generation using jsPDF direct drawing API
 *
 * Draws the proposal directly using jsPDF primitives (rect, text, line, etc.)
 * This bypasses html2canvas entirely, avoiding OKLCH color compatibility issues.
 *
 * Layout mirrors the server-side PDFKit generator for visual parity.
 */

import { jsPDF } from "jspdf";
import { KENLO_LOGO_WHITE_BASE64 } from "./kenloLogoBase64";

// Re-export the data interface for consumers
export interface ProposalPrintData {
  salesPersonName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorRole?: string;
  clientName: string;
  agencyName?: string;
  email?: string;
  cellphone?: string;
  businessType?: string;
  productType: string;
  imobPlan?: string;
  locPlan?: string;
  imobUsers?: number;
  closings?: number;
  contracts?: number;
  newContracts?: number;
  leadsPerMonth?: number;
  usesExternalAI?: boolean;
  wantsWhatsApp?: boolean;
  chargesBoletoToTenant?: boolean;
  chargesSplitToOwner?: boolean;
  boletoAmount?: number;
  splitAmount?: number;
  komboName?: string;
  komboDiscount?: number;
  selectedAddons: string;
  paymentPlan: string;
  totalMonthly: number;
  totalAnnual: number;
  implantationFee: number;
  firstYearTotal: number;
  postPaidTotal?: number;
  revenueFromBoletos?: number;
  revenueFromInsurance?: number;
  netGain?: number;
  prepayAdditionalUsers?: boolean;
  prepayAdditionalContracts?: boolean;
  prepaymentUsersAmount?: number;
  prepaymentContractsAmount?: number;
  prepaymentMonths?: number;
  monthlyLicenseBase?: number;
  hasPremiumServices?: boolean;
  premiumServicesPrice?: number;
  installments?: number;
  imobPrice?: number;
  locPrice?: number;
  addonPrices?: string;
  vipIncluded?: boolean;
  csIncluded?: boolean;
  vipPrice?: number;
  csPrice?: number;
  postPaidBreakdown?: string;
}

// ============================================
// CONSTANTS
// ============================================
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 40; // margin
const CW = PAGE_W - M * 2; // content width
const COL3_W = (CW - 16) / 3;
const COL2_W = (CW - 8) / 2;
const COL4_W = (CW - 24) / 4;
const GAP = 10;
const LINE_H = 12;
const ROW_H = 14;
const HDR_ROW_H = 15;
const MAX_Y = PAGE_H - M;

// Colors
const C = {
  red: "#E11D48",
  pink: "#EC4899",
  pinkLight: "#FDF2F8",
  pinkBorder: "#F9A8D4",
  dark: "#1E293B",
  text: "#1F2937",
  textLight: "#6B7280",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  white: "#FFFFFF",
  green: "#10B981",
  blue: "#3B82F6",
  bgLight: "#F9FAFB",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(v);

const fmtNum = (v: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(v);

// ============================================
// jsPDF HELPERS
// ============================================

/** Convert hex color to RGB array */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/** Draw a rounded rectangle (filled + stroked) */
function box(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: {
    fill?: string;
    stroke?: string;
    lw?: number;
    r?: number;
    selected?: boolean;
  } = {}
) {
  const r = opts.r ?? 3;
  if (opts.selected) {
    doc.setFillColor(...hexToRgb(C.pinkLight));
    doc.setDrawColor(...hexToRgb(C.pink));
    doc.setLineWidth(1.5);
    doc.roundedRect(x, y, w, h, r, r, "FD");
  } else {
    doc.setFillColor(...hexToRgb(opts.fill ?? C.white));
    doc.setDrawColor(...hexToRgb(opts.stroke ?? C.border));
    doc.setLineWidth(opts.lw ?? 0.5);
    doc.roundedRect(x, y, w, h, r, r, "FD");
  }
}

/** Draw a modern checkbox with label */
function modernCheck(
  doc: jsPDF,
  x: number,
  y: number,
  checked: boolean,
  label: string
) {
  const sz = 9;
  const cx = x + sz / 2;
  const cy = y + sz / 2;
  if (checked) {
    doc.setFillColor(...hexToRgb(C.pink));
    doc.circle(cx, cy, sz / 2, "F");
    // Checkmark
    doc.setDrawColor(...hexToRgb(C.white));
    doc.setLineWidth(1);
    doc.line(cx - 2.5, cy, cx - 0.5, cy + 2.5);
    doc.line(cx - 0.5, cy + 2.5, cx + 3, cy - 2);
  } else {
    doc.setDrawColor(...hexToRgb(C.border));
    doc.setLineWidth(0.7);
    doc.circle(cx, cy, sz / 2, "S");
  }
  doc.setFontSize(6.5);
  doc.setTextColor(...hexToRgb(checked ? C.pink : C.text));
  doc.setFont("helvetica", checked ? "bold" : "normal");
  doc.text(label, x + sz + 4, y + 6);
}

/** Section title */
function secTitle(doc: jsPDF, label: string, y: number): number {
  doc.setFontSize(8.5);
  doc.setTextColor(...hexToRgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(label, M, y + 6);
  return y + 13;
}

/** Label-value row */
function labelRow(
  doc: jsPDF,
  label: string,
  value: string,
  y: number,
  opts: { bold?: boolean; indent?: number; valueColor?: string } = {}
): number {
  const indent = opts.indent ?? 10;
  doc.setFontSize(6.5);
  doc.setTextColor(...hexToRgb(C.text));
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.text(label, M + indent, y + 5);
  doc.setTextColor(...hexToRgb(opts.valueColor ?? C.text));
  doc.text(value, M + CW, y + 5, { align: "right" });
  return y + LINE_H;
}

/** Metric stat display */
function metricStat(
  doc: jsPDF,
  x: number,
  y: number,
  value: string,
  label: string
) {
  doc.setFontSize(12);
  doc.setTextColor(...hexToRgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(value, x, y + 8);
  const numW = doc.getTextWidth(value);
  doc.setFontSize(5.5);
  doc.setTextColor(...hexToRgb(C.textLight));
  doc.setFont("helvetica", "normal");
  doc.text(label, x + numW + 3, y + 8);
}

/** Table section header */
function tableSectionHeader(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  label: string
): number {
  doc.setFillColor(...hexToRgb(C.bgLight));
  doc.rect(x, y, w, HDR_ROW_H, "F");
  doc.setDrawColor(...hexToRgb(C.border));
  doc.setLineWidth(0.3);
  doc.line(x, y + HDR_ROW_H, x + w, y + HDR_ROW_H);
  doc.setFontSize(7);
  doc.setTextColor(...hexToRgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(label, x + 8, y + 10);
  return y + HDR_ROW_H;
}

/** Table data row */
function tableRow(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  opts: {
    bold?: boolean;
    labelColor?: string;
    valueColor?: string;
    bgColor?: string;
    fontSize?: number;
  } = {}
): number {
  const fs = opts.fontSize ?? 6.5;
  if (opts.bgColor) {
    doc.setFillColor(...hexToRgb(opts.bgColor));
    doc.rect(x, y, w, ROW_H, "F");
  }
  doc.setDrawColor(...hexToRgb(C.border));
  doc.setLineWidth(0.3);
  doc.line(x, y + ROW_H, x + w, y + ROW_H);
  doc.setFontSize(fs);
  doc.setTextColor(...hexToRgb(opts.labelColor ?? C.text));
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.text(label, x + 8, y + 9);
  doc.setTextColor(...hexToRgb(opts.valueColor ?? C.text));
  doc.text(value, x + w - 8, y + 9, { align: "right" });
  return y + ROW_H;
}

/** Render plan header bar */
function renderPlanHeader(
  doc: jsPDF,
  cx: number,
  y: number,
  w: number,
  productLabel: string,
  plan?: string
) {
  doc.setFillColor(...hexToRgb(C.dark));
  doc.roundedRect(cx, y, w, 14, 3, 3, "F");
  // Bottom fill to square off bottom corners
  doc.rect(cx, y + 6, w, 8, "F");
  doc.setFontSize(7);
  doc.setTextColor(...hexToRgb(C.white));
  doc.setFont("helvetica", "bold");
  doc.text(productLabel, cx + 10, y + 9);
  if (plan) {
    const labelW = doc.getTextWidth(productLabel);
    doc.setFont("helvetica", "normal");
    doc.text(" - ", cx + 10 + labelW, y + 9);
    const dashW = doc.getTextWidth(" - ");
    doc.setTextColor(...hexToRgb(C.red));
    doc.setFont("helvetica", "bold");
    doc.text(plan.toUpperCase(), cx + 10 + labelW + dashW, y + 9);
  }
}

// ============================================
// POST-PAID TYPES
// ============================================
interface PostPaidItem {
  label: string;
  included: number;
  additional: number;
  total: number;
  perUnit: number;
  unitLabel: string;
}

interface PostPaidGroup {
  groupLabel: string;
  groupTotal: number;
  items: PostPaidItem[];
}

interface PostPaidBreakdown {
  imobAddons?: PostPaidGroup;
  locAddons?: PostPaidGroup;
  sharedAddons?: PostPaidGroup;
  total: number;
}

// ============================================
// MAIN PDF GENERATION
// ============================================
export async function generateProposalPDFClient(
  data: ProposalPrintData
): Promise<{ blob: Blob; filename: string }> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  // Normalize productType
  const showImob =
    data.productType === "imob" ||
    data.productType === "both" ||
    data.productType === "imob_loc";
  const showLoc =
    data.productType === "loc" ||
    data.productType === "both" ||
    data.productType === "imob_loc";

  // ============================================
  // PAGE 1 — HEADER
  // ============================================
  const HDR_H = 55;
  doc.setFillColor(...hexToRgb(C.red));
  doc.rect(0, 0, PAGE_W, HDR_H, "F");

  // Kenlo logo image (white PNG on red header)
  const LOGO_H = 20;
  const LOGO_W = LOGO_H * 3.48; // aspect ratio 209:60
  try {
    doc.addImage(KENLO_LOGO_WHITE_BASE64, "PNG", M, 8, LOGO_W, LOGO_H);
  } catch (_) {
    // Fallback to text if image fails
    doc.setFontSize(16);
    doc.setTextColor(...hexToRgb(C.white));
    doc.setFont("helvetica", "bold");
    doc.text("Kenlo", M, 25);
  }

  doc.setFontSize(12);
  doc.setTextColor(...hexToRgb(C.white));
  doc.setFont("helvetica", "bold");
  doc.text("Orçamento Comercial", M + LOGO_W + 12, 25);

  const issueDate = new Date().toLocaleDateString("pt-BR");
  doc.setFontSize(5.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text(`Emissão: ${issueDate}  |  Validade: 30 dias`, M, HDR_H - 8);

  const vX = PAGE_W - M;
  doc.setFontSize(5.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `Vendedor: ${data.salesPersonName}`,
    vX,
    12,
    { align: "right" }
  );
  doc.text(
    `Email: ${data.vendorEmail || "vendas@kenlo.com.br"}`,
    vX,
    21,
    { align: "right" }
  );
  doc.text(
    `Telefone: ${data.vendorPhone || "(11) 1234-5678"}`,
    vX,
    30,
    { align: "right" }
  );

  // --- CLIENT BAR ---
  let Y = HDR_H + 10;
  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(C.red));
  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE:", M, Y + 6);
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(C.dark));
  doc.text(
    `${data.agencyName || "Imobiliária"}  |  ${data.clientName}`,
    M + 55,
    Y + 6
  );
  Y += 12;
  const contactParts = [data.email, data.cellphone].filter(Boolean).join("  |  ");
  if (contactParts) {
    doc.setFontSize(6);
    doc.setTextColor(...hexToRgb(C.textLight));
    doc.setFont("helvetica", "normal");
    doc.text(contactParts, M + 45, Y + 5);
  }
  Y += 12;

  // --- 1. NATUREZA DO NEGÓCIO ---
  Y = secTitle(doc, "Natureza do negócio", Y);
  const BIZ_H = 20;
  const bizTypes = [
    { key: "broker", label: "Corretora" },
    { key: "rental_admin", label: "Administrador de Aluguel" },
    { key: "both", label: "Ambos" },
  ];
  bizTypes.forEach((t, i) => {
    const x = M + i * (COL3_W + 8);
    const sel = data.businessType === t.key;
    box(doc, x, Y, COL3_W, BIZ_H, { selected: sel });
    doc.setFontSize(6.5);
    doc.setTextColor(...hexToRgb(sel ? C.pink : C.text));
    doc.setFont("helvetica", sel ? "bold" : "normal");
    doc.text(t.label, x + 8, Y + 12);
  });
  Y += BIZ_H + GAP;

  // --- 2. MÉTRICAS DO NEGÓCIO ---
  Y = secTitle(doc, "Métricas do Negócio", Y);
  const CARD_H = 66;
  const cardW = COL2_W;
  const metricsStartY = Y;

  if (showImob) {
    const cx = M;
    box(doc, cx, metricsStartY, cardW, CARD_H, {
      fill: C.bgLight,
      stroke: C.border,
    });
    renderPlanHeader(doc, cx, metricsStartY, cardW, "IMOB", data.imobPlan);
    const r1 = metricsStartY + 20;
    metricStat(doc, cx + 10, r1, `${data.imobUsers || 0}`, "Usuários");
    metricStat(
      doc,
      cx + cardW / 2 + 5,
      r1,
      `${data.closings || 0}`,
      "Fechamentos / mês"
    );
    const r2 = r1 + 16;
    metricStat(doc, cx + 10, r2, `${data.leadsPerMonth || 0}`, "Leads / mês");
    const r3 = r2 + 16;
    modernCheck(doc, cx + 10, r3, data.usesExternalAI || false, "IA SDR");
    modernCheck(
      doc,
      cx + cardW / 2 + 5,
      r3,
      data.wantsWhatsApp || false,
      "WhatsApp"
    );
  }

  if (showLoc) {
    const cx = showImob ? M + cardW + 8 : M;
    box(doc, cx, metricsStartY, cardW, CARD_H, {
      fill: C.bgLight,
      stroke: C.border,
    });
    renderPlanHeader(doc, cx, metricsStartY, cardW, "LOCAÇÃO", data.locPlan);
    const r1 = metricsStartY + 20;
    metricStat(
      doc,
      cx + 10,
      r1,
      `${data.contracts || 0}`,
      "Contratos sob gestão"
    );
    metricStat(
      doc,
      cx + cardW / 2 + 5,
      r1,
      `${data.newContracts || 0}`,
      "Novos / mês"
    );
    const r2 = r1 + 18;
    const hasBoleto = data.chargesBoletoToTenant || false;
    modernCheck(doc, cx + 10, r2, hasBoleto, "Cobra Inquilino (Boleto)");
    if (hasBoleto && data.boletoAmount) {
      doc.setFontSize(6.5);
      doc.setTextColor(...hexToRgb(C.green));
      doc.setFont("helvetica", "bold");
      doc.text(fmt(data.boletoAmount), cx + 145, r2 + 6);
    }
    const r3 = r2 + 14;
    modernCheck(
      doc,
      cx + 10,
      r3,
      data.chargesSplitToOwner || false,
      "Cobra Proprietário (Split)"
    );
    if (data.chargesSplitToOwner && data.splitAmount) {
      doc.setFontSize(6.5);
      doc.setTextColor(...hexToRgb(C.green));
      doc.setFont("helvetica", "bold");
      doc.text(fmt(data.splitAmount), cx + 145, r3 + 6);
    }
  }
  Y = metricsStartY + CARD_H + GAP;

  // --- 3. SOLUÇÃO EM ANÁLISE ---
  Y = secTitle(doc, "Solução em análise de contratação", Y);
  const SOL_H = 22;
  const prods = [
    { key: "imob", label: "Imob só", desc: "CRM + Site para vendas" },
    { key: "loc", label: "Loc só", desc: "Gestão de locações" },
    { key: "both", label: "Imob + Loc", desc: "Solução completa" },
  ];
  prods.forEach((p, i) => {
    const x = M + i * (COL3_W + 8);
    const sel =
      data.productType === p.key ||
      (p.key === "both" && data.productType === "imob_loc");
    box(doc, x, Y, COL3_W, SOL_H, { selected: sel });
    doc.setFontSize(6.5);
    doc.setTextColor(...hexToRgb(sel ? C.pink : C.text));
    doc.setFont("helvetica", "bold");
    doc.text(p.label, x + 8, Y + 10);
    doc.setFontSize(5);
    doc.setTextColor(...hexToRgb(sel ? C.pink : C.textLight));
    doc.setFont("helvetica", "normal");
    doc.text(p.desc, x + 8, Y + 18);
  });
  Y += SOL_H + GAP;

  // --- 4. ADD-ONS ---
  Y = secTitle(doc, "Add-ons Opcionais", Y);
  const addons = [
    { key: "leads", label: "Leads", desc: "Gestão automatizada de leads" },
    {
      key: "inteligencia",
      label: "Inteligência",
      desc: "BI de KPIs de performance",
    },
    {
      key: "assinatura",
      label: "Assinatura",
      desc: "Assinatura digital embutida",
    },
    { key: "pay", label: "Pay", desc: "Boleto e Split digital embutido" },
    { key: "seguros", label: "Seguros", desc: "Seguros embutido no boleto" },
    {
      key: "cash",
      label: "Cash",
      desc: "Financie proprietários até 24 meses",
    },
  ];
  let selAddons: string[] = [];
  try {
    // Handle both array and string inputs
    if (Array.isArray(data.selectedAddons)) {
      selAddons = (data.selectedAddons as unknown as string[]).map((a: string) => a.trim().toLowerCase());
    } else if (typeof data.selectedAddons === 'string') {
      try {
        const parsed = JSON.parse(data.selectedAddons);
        if (Array.isArray(parsed))
          selAddons = parsed.map((a: string) => a.trim().toLowerCase());
        else
          selAddons = data.selectedAddons
            .split(",")
            .map((a) => a.trim().toLowerCase());
      } catch {
        selAddons = data.selectedAddons
          .split(",")
          .map((a) => a.trim().toLowerCase());
      }
    }
  } catch {
    selAddons = [];
  }

  const ADDON_H = 22;
  addons.forEach((a, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = M + col * (COL3_W + 8);
    const y = Y + row * (ADDON_H + 4);
    const sel = selAddons.includes(a.key);
    box(doc, x, y, COL3_W, ADDON_H, { selected: sel });
    doc.setFontSize(6);
    doc.setTextColor(...hexToRgb(sel ? C.pink : C.text));
    doc.setFont("helvetica", "bold");
    doc.text(a.label, x + 8, y + 10);
    doc.setFontSize(4.5);
    doc.setTextColor(...hexToRgb(sel ? C.pink : C.textLight));
    doc.setFont("helvetica", "normal");
    doc.text(a.desc, x + 8, y + 18);
  });
  Y += ADDON_H * 2 + 4 + GAP;

  // --- 5. FREQUÊNCIA ---
  Y = secTitle(doc, "Frequência de pagamento selecionada", Y);
  const FREQ_H = 22;
  const freqs = [
    { key: "monthly", label: "Mensal", desc: "+25%" },
    { key: "semestral", label: "Semestral", desc: "+11%" },
    { key: "annual", label: "Anual", desc: "0% - Referência" },
    { key: "bienal", label: "Bienal", desc: "-10%" },
  ];
  freqs.forEach((f, i) => {
    const x = M + i * (COL4_W + 8);
    const sel = data.paymentPlan === f.key;
    box(doc, x, Y, COL4_W, FREQ_H, { selected: sel });
    doc.setFontSize(6.5);
    doc.setTextColor(...hexToRgb(sel ? C.pink : C.text));
    doc.setFont("helvetica", "bold");
    // Center text
    const tw = doc.getTextWidth(f.label);
    doc.text(f.label, x + (COL4_W - tw) / 2, Y + 10);
    doc.setFontSize(5);
    doc.setTextColor(...hexToRgb(sel ? C.pink : C.textLight));
    doc.setFont("helvetica", "normal");
    const dw = doc.getTextWidth(f.desc);
    doc.text(f.desc, x + (COL4_W - dw) / 2, Y + 18);
  });
  Y += FREQ_H + GAP;

  // --- 6. PLANO SELECIONADO (Kombos) ---
  Y = secTitle(doc, "Plano Selecionado", Y);
  const KOMBO_H = 32;
  const kombos = [
    { id: "sem_kombo", label: "Sem Kombo", discount: 0 },
    { id: "imob_start", label: "Imob Start", discount: 10 },
    { id: "imob_pro", label: "Imob Pro", discount: 15 },
    { id: "locacao_pro", label: "Loc Pro", discount: 10 },
    { id: "core_gestao", label: "Core Gestão", discount: 15 },
    { id: "elite", label: "Elite", discount: 20 },
  ];
  const KOMBO_W = (CW - 5 * 6) / 6;
  const rawKombo = data.komboName || "sem_kombo";
  const normalizedKombo = rawKombo
    .toLowerCase()
    .replace(/^kombo\s+/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

  kombos.forEach((k, i) => {
    const x = M + i * (KOMBO_W + 6);
    const sel =
      normalizedKombo === k.id ||
      normalizedKombo === k.label.toLowerCase().replace(/\s+/g, "_");
    box(doc, x, Y, KOMBO_W, KOMBO_H, { selected: sel });
    if (k.discount > 0) {
      const badgeW = 34;
      const badgeH = 11;
      const bx = x + (KOMBO_W - badgeW) / 2;
      doc.setFillColor(...hexToRgb(sel ? C.pink : C.dark));
      doc.roundedRect(bx, Y + 3, badgeW, badgeH, 3, 3, "F");
      doc.setFontSize(5.5);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      const discText = `${k.discount}% OFF`;
      const dtw = doc.getTextWidth(discText);
      doc.text(discText, bx + (badgeW - dtw) / 2, Y + 10);
    }
    doc.setFontSize(5.5);
    doc.setTextColor(...hexToRgb(sel ? C.pink : C.text));
    doc.setFont("helvetica", "bold");
    const lw = doc.getTextWidth(k.label);
    doc.text(
      k.label,
      x + (KOMBO_W - lw) / 2,
      Y + (k.discount > 0 ? 26 : 18)
    );
  });
  Y += KOMBO_H;

  // Plan tier row below kombos
  const planParts: string[] = [];
  if (showImob && data.imobPlan)
    planParts.push(`IMOB: ${data.imobPlan.toUpperCase()}`);
  if (showLoc && data.locPlan)
    planParts.push(`LOC: ${data.locPlan.toUpperCase()}`);
  if (planParts.length > 0) {
    Y += 4;
    doc.setFontSize(6);
    doc.setTextColor(...hexToRgb(C.textLight));
    doc.setFont("helvetica", "normal");
    doc.text("Plano: ", M, Y + 5);
    const prefW = doc.getTextWidth("Plano: ");
    doc.setTextColor(...hexToRgb(C.red));
    doc.setFont("helvetica", "bold");
    doc.text(planParts.join("  |  "), M + prefW, Y + 5);
    Y += 10;
  }
  Y += GAP;

  // ============================================
  // --- 7. INVESTIMENTO TABLE ---
  // ============================================
  Y = secTitle(doc, "Investimento", Y);
  const TABLE_X = M;
  const TABLE_W = CW * 0.55;

  let addonPricesMap: Record<string, number> = {};
  try {
    if (data.addonPrices) {
      if (typeof data.addonPrices === 'string') {
        addonPricesMap = JSON.parse(data.addonPrices);
      } else if (typeof data.addonPrices === 'object') {
        addonPricesMap = data.addonPrices as unknown as Record<string, number>;
      }
    }
  } catch {}

  // Produtos
  Y = tableSectionHeader(doc, TABLE_X, Y, TABLE_W, "Produtos");
  if (showImob && data.imobPrice !== undefined) {
    Y = tableRow(
      doc,
      TABLE_X,
      Y,
      TABLE_W,
      `Imob - ${(data.imobPlan || "K").toUpperCase()}`,
      fmt(data.imobPrice)
    );
    // Highlight plan name in red
    if (data.imobPlan) {
      const prefix = "Imob - ";
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      const prefixW = doc.getTextWidth(prefix);
      doc.setTextColor(...hexToRgb(C.red));
      doc.setFont("helvetica", "bold");
      doc.text(
        data.imobPlan.toUpperCase(),
        TABLE_X + 8 + prefixW,
        Y - ROW_H + 9
      );
    }
  }
  if (showLoc && data.locPrice !== undefined) {
    Y = tableRow(
      doc,
      TABLE_X,
      Y,
      TABLE_W,
      `Loc - ${(data.locPlan || "K").toUpperCase()}`,
      fmt(data.locPrice)
    );
    if (data.locPlan) {
      const prefix = "Loc - ";
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      const prefixW = doc.getTextWidth(prefix);
      doc.setTextColor(...hexToRgb(C.red));
      doc.setFont("helvetica", "bold");
      doc.text(
        data.locPlan.toUpperCase(),
        TABLE_X + 8 + prefixW,
        Y - ROW_H + 9
      );
    }
  }

  // Add-ons
  const paidAddons = Object.entries(addonPricesMap).filter(
    ([_, price]) => price > 0
  );
  if (paidAddons.length > 0) {
    Y = tableSectionHeader(doc, TABLE_X, Y, TABLE_W, "Add-ons");
    const addonNameMap: Record<string, string> = {
      leads: "Leads",
      inteligencia: "Inteligência",
      assinatura: "Assinatura",
      pay: "Pay",
      seguros: "Seguros",
      cash: "Cash",
    };
    for (const [key, price] of paidAddons) {
      Y = tableRow(
        doc,
        TABLE_X,
        Y,
        TABLE_W,
        addonNameMap[key] || key,
        fmt(price)
      );
    }
  }

  // Serviços Premium
  const hasVip =
    data.vipIncluded || (data.vipPrice !== undefined && data.vipPrice > 0);
  const hasCS =
    data.csIncluded || (data.csPrice !== undefined && data.csPrice > 0);
  if (hasVip || hasCS) {
    Y = tableSectionHeader(doc, TABLE_X, Y, TABLE_W, "Serviços Premium");
    if (hasVip) {
      const vipValue = data.vipIncluded
        ? "Incluído"
        : fmt(data.vipPrice || 97);
      Y = tableRow(doc, TABLE_X, Y, TABLE_W, "Suporte VIP", vipValue, {
        valueColor: data.vipIncluded ? C.red : C.text,
        bold: data.vipIncluded,
      });
    }
    if (hasCS) {
      const csValue = data.csIncluded
        ? "Incluído"
        : fmt(data.csPrice || 197);
      Y = tableRow(doc, TABLE_X, Y, TABLE_W, "CS Dedicado", csValue, {
        valueColor: data.csIncluded ? C.red : C.text,
        bold: data.csIncluded,
      });
    }
  }

  // K2 Training (derived from plan data)
  const imobIsK2 = showImob && data.imobPlan?.toLowerCase() === "k2";
  const locIsK2 = showLoc && data.locPlan?.toLowerCase() === "k2";
  const anyK2 = imobIsK2 || locIsK2;
  const bothK2 = imobIsK2 && locIsK2;
  if (anyK2) {
    Y = tableSectionHeader(doc, TABLE_X, Y, TABLE_W, "Treinamentos K2 (Incluído no plano)");
    if (bothK2) {
      Y = tableRow(doc, TABLE_X, Y, TABLE_W, "4 Treinamentos Online (ref. R$ 2.000/cada)", "Incluído", {
        valueColor: C.red, bold: true,
      });
      Y = tableRow(doc, TABLE_X, Y, TABLE_W, "ou 2 Treinamentos Presenciais (ref. R$ 3.000/cada)", "Incluído", {
        valueColor: C.red, bold: true,
      });
    } else {
      Y = tableRow(doc, TABLE_X, Y, TABLE_W, "2 Treinamentos Online (ref. R$ 2.000/cada)", "Incluído", {
        valueColor: C.red, bold: true,
      });
      Y = tableRow(doc, TABLE_X, Y, TABLE_W, "ou 1 Treinamento Presencial (ref. R$ 3.000)", "Incluído", {
        valueColor: C.red, bold: true,
      });
    }
  }

  // Summary rows
  Y = tableRow(
    doc,
    TABLE_X,
    Y,
    TABLE_W,
    "Total Mensal",
    fmt(data.totalMonthly),
    { bold: true, bgColor: C.bgLight, fontSize: 7 }
  );
  Y = tableRow(
    doc,
    TABLE_X,
    Y,
    TABLE_W,
    "Implantação",
    fmt(data.implantationFee)
  );
  const annualEquivalent = data.totalMonthly * 12 + data.implantationFee;
  Y = tableRow(
    doc,
    TABLE_X,
    Y,
    TABLE_W,
    "Anual Equivalente",
    fmt(annualEquivalent),
    { bold: true, bgColor: C.bgLight, fontSize: 7 }
  );

  Y += GAP;

  // ============================================
  // --- TOTAL INVESTIMENTO ---
  // ============================================
  const totalInvestment = data.totalAnnual + data.implantationFee;
  const installments = data.installments || 1;
  const installmentValue = totalInvestment / installments;
  const monthlyLicense = data.monthlyLicenseBase || data.totalMonthly || 0;

  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Total Investimento", M + 8, Y + 6);
  doc.text(fmt(totalInvestment), M + CW, Y + 6, { align: "right" });
  Y += 13;

  // Payment condition label varies by frequency
  let paymentConditionLabel = "Condições de Pagamento";
  let paymentConditionValue = `${installments}x ${fmt(installmentValue)}`;
  if (data.paymentPlan === "monthly") {
    paymentConditionLabel = "Condição de Pagamento";
    paymentConditionValue = `Cobrado mensalmente — ${fmt(data.totalMonthly || installmentValue)}/mês`;
  } else if (data.paymentPlan === "semestral") {
    paymentConditionLabel = "Condição de Pagamento";
    paymentConditionValue = `Pago à vista (semestral) — ${fmt(installmentValue)}`;
  }

  Y = labelRow(
    doc,
    paymentConditionLabel,
    paymentConditionValue,
    Y,
    { bold: true }
  );

  const recurringTotal = data.totalAnnual || 0;
  const monthlyRecurring =
    recurringTotal > 0 ? recurringTotal / 12 : monthlyLicense;
  doc.setFontSize(7);
  doc.setTextColor(...hexToRgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(
    "Investimento Mensal Recorrente (Excl. implantação)",
    M + 10,
    Y + 5
  );
  doc.text(fmt(monthlyRecurring), M + CW, Y + 5, { align: "right" });
  Y += 13;

  // ============================================
  // Determine if page 2 has content
  // ============================================
  let ppBreakdownPre: PostPaidBreakdown | null = null;
  try {
    if (data.postPaidBreakdown) {
      if (typeof data.postPaidBreakdown === 'string') {
        ppBreakdownPre = JSON.parse(data.postPaidBreakdown);
      } else if (typeof data.postPaidBreakdown === 'object') {
        ppBreakdownPre = data.postPaidBreakdown as unknown as PostPaidBreakdown;
      }
    }
  } catch {}
  const hasPostPaidPre = data.postPaidTotal && data.postPaidTotal > 0;
  const hasRevenuePre =
    (data.revenueFromBoletos && data.revenueFromBoletos > 0) ||
    (data.revenueFromInsurance && data.revenueFromInsurance > 0);
  const needsPage2 = hasPostPaidPre || hasRevenuePre;

  // CTA on page 1 if no page 2
  if (!needsPage2) {
    Y += 8;
    const CTA1_H = 36;
    if (Y + CTA1_H < MAX_Y) {
      doc.setFillColor(...hexToRgb(C.red));
      doc.roundedRect(M + 40, Y, CW - 80, CTA1_H, 5, 5, "F");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      const ct1 = "Kenlo \u2014 Quem usa, lidera.";
      const ct1w = doc.getTextWidth(ct1);
      doc.text(ct1, M + 40 + (CW - 80 - ct1w) / 2, Y + 14);
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      const cd1 = "Transforme sua imobili\u00e1ria em uma m\u00e1quina de resultados";
      const cd1w = doc.getTextWidth(cd1);
      doc.text(cd1, M + 40 + (CW - 80 - cd1w) / 2, Y + 26);
    }
  }

  // ============================================
  // PAGE 2: PÓS-PAGO + RECEITA (only if needed)
  // ============================================
  if (needsPage2) {
  doc.addPage();

  // Page 2 header
  doc.setFillColor(...hexToRgb(C.red));
  doc.rect(0, 0, PAGE_W, HDR_H, "F");

  // Kenlo logo image (white PNG on red header)
  try {
    doc.addImage(KENLO_LOGO_WHITE_BASE64, "PNG", M, 8, LOGO_W, LOGO_H);
  } catch (_) {
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Kenlo", M, 25);
  }
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Detalhamento Financeiro", M + LOGO_W + 12, 25);

  doc.setFontSize(5.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${data.agencyName || "Imobiliária"}  |  ${data.clientName}`,
    M,
    HDR_H - 8
  );
  doc.text(`Vendedor: ${data.salesPersonName}`, vX, 12, { align: "right" });
  doc.text(`Email: ${data.vendorEmail || "vendas@kenlo.com.br"}`, vX, 21, {
    align: "right",
  });

  Y = HDR_H + 16;

  // ============================================
  // --- PÓS-PAGO BREAKDOWN ---
  // ============================================
  const ppBreakdown = ppBreakdownPre;
  const hasPostPaid = hasPostPaidPre;

  if (hasPostPaid && ppBreakdown) {
    Y = secTitle(
      doc,
      "Custos Pós-Pago - Sem surpresas, só o que você usar",
      Y
    );
    const PP_W = CW;

    const renderGroup = (group: PostPaidGroup) => {
      doc.setDrawColor(...hexToRgb(C.pink));
      doc.setLineWidth(1);
      doc.line(M, Y, M + PP_W, Y);
      Y += 3;
      doc.setFontSize(7);
      doc.setTextColor(...hexToRgb(C.pink));
      doc.setFont("helvetica", "bold");
      doc.text(group.groupLabel, M, Y + 6);
      doc.setTextColor(...hexToRgb(C.dark));
      doc.text(fmt(group.groupTotal), M + PP_W, Y + 6, { align: "right" });
      Y += 14;
      for (const item of group.items) {
        doc.setFontSize(6.5);
        doc.setTextColor(...hexToRgb(C.dark));
        doc.setFont("helvetica", "bold");
        doc.text(item.label, M + 8, Y + 5);
        doc.text(fmt(item.total), M + PP_W, Y + 5, { align: "right" });
        Y += 10;
        doc.setFontSize(5.5);
        doc.setTextColor(...hexToRgb(C.textLight));
        doc.setFont("helvetica", "normal");
        doc.text(
          `Incluídos: ${fmtNum(item.included)} / Adicionais: ${fmtNum(item.additional)}`,
          M + 8,
          Y + 4
        );
        doc.text(`${fmt(item.perUnit)}/${item.unitLabel}`, M + PP_W, Y + 4, {
          align: "right",
        });
        Y += 12;
      }
      Y += 3;
    };

    if (ppBreakdown.imobAddons?.items.length)
      renderGroup(ppBreakdown.imobAddons);
    if (ppBreakdown.locAddons?.items.length)
      renderGroup(ppBreakdown.locAddons);
    if (ppBreakdown.sharedAddons?.items.length)
      renderGroup(ppBreakdown.sharedAddons);

    Y += 3;
    doc.setDrawColor(...hexToRgb(C.dark));
    doc.setLineWidth(1);
    doc.line(M, Y, M + PP_W, Y);
    Y += 5;
    doc.setFontSize(7.5);
    doc.setTextColor(...hexToRgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text("Total Pós-pago", M + 8, Y + 5);
    doc.setTextColor(...hexToRgb(C.red));
    doc.text(fmt(ppBreakdown.total), M + PP_W, Y + 5, { align: "right" });
    Y += 18;
  } else if (hasPostPaid) {
    Y = secTitle(
      doc,
      "Estimativa Pós-pagos Mensal (Uso Excedente)",
      Y
    );
    Y = labelRow(
      doc,
      "Total Estimado Pós-pagos",
      fmt(data.postPaidTotal || 0),
      Y,
      { bold: true, valueColor: C.red }
    );
    Y += GAP;
  }

  // ============================================
  // --- REVENUE SECTION ---
  // ============================================
  const hasRevenue = hasRevenuePre;

  if (hasRevenue) {
    Y += 4;
    Y = secTitle(doc, "Fonte de Receita Mensal", Y);

    const revSources = [
      {
        key: "pay",
        label: "Kenlo Pay",
        desc: "Receita de boletos e split digital",
        detail: data.chargesSplitToOwner
          ? "Cobra Proprietário (Split) ativo"
          : "Cobrança de boletos ativa",
        value: data.revenueFromBoletos || 0,
        active: (data.revenueFromBoletos || 0) > 0,
        formula: `${data.contracts || 0} contratos × valor por contrato`,
      },
      {
        key: "seguros",
        label: "Kenlo Seguros",
        desc: "Seguros embutido no boleto de locação",
        detail: "R$10,00 por contrato/mês",
        value: data.revenueFromInsurance || 0,
        active: (data.revenueFromInsurance || 0) > 0,
        formula: `${data.contracts || 0} contratos × R$10,00`,
      },
    ];

    const REV_CARD_W = COL2_W;
    const REV_CARD_H = 65;
    revSources.forEach((rs, i) => {
      const x = M + i * (REV_CARD_W + 8);
      box(doc, x, Y, REV_CARD_W, REV_CARD_H, { selected: rs.active });

      // Status dot
      doc.setFillColor(
        ...hexToRgb(rs.active ? C.pink : C.border)
      );
      doc.circle(x + 14, Y + 12, 4.5, "F");
      doc.setFontSize(5);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      const sym = rs.active ? "✓" : "–";
      doc.text(sym, x + 12, Y + 14);

      doc.setFontSize(8);
      doc.setTextColor(...hexToRgb(rs.active ? C.pink : C.text));
      doc.setFont("helvetica", "bold");
      doc.text(rs.label, x + 24, Y + 14);

      doc.setFontSize(5.5);
      doc.setTextColor(
        ...hexToRgb(rs.active ? C.pink : C.textLight)
      );
      doc.setFont("helvetica", "normal");
      doc.text(rs.desc, x + 24, Y + 22);

      // Divider line
      doc.setDrawColor(
        ...hexToRgb(rs.active ? C.pinkBorder : C.border)
      );
      doc.setLineWidth(0.3);
      doc.line(x + 10, Y + 30, x + REV_CARD_W - 10, Y + 30);

      doc.setFontSize(5.5);
      doc.setTextColor(...hexToRgb(C.textLight));
      doc.text(rs.formula, x + 10, Y + 38);
      doc.setFontSize(5);
      doc.text(rs.detail, x + 10, Y + 46);

      doc.setFontSize(10);
      doc.setTextColor(
        ...hexToRgb(rs.active ? C.green : C.textLight)
      );
      doc.setFont("helvetica", "bold");
      doc.text(fmt(rs.value), x + REV_CARD_W - 10, Y + 56, {
        align: "right",
      });
    });
    Y += REV_CARD_H + GAP;

    // --- RESUMO FINANCEIRO MENSAL ---
    const totalRevenue =
      (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
    Y = secTitle(doc, "Resumo Financeiro Mensal", Y);

    const SUMMARY_H = 100;
    box(doc, M, Y, CW, SUMMARY_H, { fill: C.bgLight, stroke: C.border });

    let tY = Y + 8;
    doc.setFontSize(6.5);
    doc.setTextColor(...hexToRgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text("Receita Kenlo Pay", M + 14, tY + 6);
    doc.setTextColor(...hexToRgb(C.green));
    doc.setFont("helvetica", "bold");
    doc.text(`+ ${fmt(data.revenueFromBoletos || 0)}`, M + CW - 14, tY + 6, {
      align: "right",
    });
    tY += LINE_H;

    doc.setTextColor(...hexToRgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text("Receita Kenlo Seguros", M + 14, tY + 6);
    doc.setTextColor(...hexToRgb(C.green));
    doc.setFont("helvetica", "bold");
    doc.text(
      `+ ${fmt(data.revenueFromInsurance || 0)}`,
      M + CW - 14,
      tY + 6,
      { align: "right" }
    );
    tY += LINE_H;

    doc.setDrawColor(...hexToRgb(C.border));
    doc.setLineWidth(0.3);
    doc.line(M + 10, tY, M + CW - 10, tY);
    tY += 6;

    doc.setFontSize(7);
    doc.setTextColor(...hexToRgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text("Total Receita Mensal", M + 14, tY + 5);
    doc.setTextColor(...hexToRgb(C.green));
    doc.text(fmt(totalRevenue), M + CW - 14, tY + 5, { align: "right" });
    tY += 14;

    doc.setFontSize(6.5);
    doc.setTextColor(...hexToRgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text(
      "Investimento Mensal Kenlo (Equivalente)",
      M + 14,
      tY + 5
    );
    doc.setTextColor(...hexToRgb(C.red));
    doc.setFont("helvetica", "bold");
    doc.text(`- ${fmt(monthlyRecurring)}`, M + CW - 14, tY + 5, {
      align: "right",
    });
    tY += LINE_H;

    if (data.postPaidTotal && data.postPaidTotal > 0) {
      doc.setFontSize(6.5);
      doc.setTextColor(...hexToRgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text("Estimativa Pós-pagos (Excedente)", M + 14, tY + 5);
      doc.setTextColor(...hexToRgb(C.red));
      doc.setFont("helvetica", "bold");
      doc.text(`- ${fmt(data.postPaidTotal)}`, M + CW - 14, tY + 5, {
        align: "right",
      });
      tY += LINE_H;
    }

    Y += SUMMARY_H + GAP;

    // --- GANHO LÍQUIDO MENSAL ---
    const netGain =
      data.netGain ||
      totalRevenue - monthlyRecurring - (data.postPaidTotal || 0);
    const isPositive = netGain > 0;
    const NET_H = 65;
    const greenBg = isPositive ? "#ECFDF5" : "#FEF2F2";
    const greenBorder = isPositive ? "#6EE7B7" : "#FCA5A5";
    const greenText = isPositive ? C.green : C.red;

    box(doc, M, Y, CW, NET_H, {
      fill: greenBg,
      stroke: greenBorder,
      lw: 1.5,
    });
    doc.setFontSize(8);
    doc.setTextColor(...hexToRgb(C.dark));
    doc.setFont("helvetica", "bold");
    const netTitle = "Ganho Líquido Mensal Estimado";
    const ntw = doc.getTextWidth(netTitle);
    doc.text(netTitle, M + (CW - ntw) / 2, Y + 14);

    doc.setFontSize(22);
    doc.setTextColor(...hexToRgb(greenText));
    const netVal = fmt(netGain);
    const nvw = doc.getTextWidth(netVal);
    doc.text(netVal, M + (CW - nvw) / 2, Y + 36);

    doc.setFontSize(6);
    doc.setTextColor(...hexToRgb(C.textLight));
    doc.setFont("helvetica", "normal");
    const netDesc = isPositive
      ? "Receita extras supera o investimento na plataforma"
      : "Investimento na plataforma supera receita extras";
    const ndw = doc.getTextWidth(netDesc);
    doc.text(netDesc, M + (CW - ndw) / 2, Y + 52);
    Y += NET_H + GAP;

    // --- ROI INDICATORS ---
    if (isPositive && monthlyRecurring > 0) {
      const roiPercent = (
        (totalRevenue / monthlyRecurring) * 100 -
        100
      ).toFixed(0);
      const paybackMonths =
        monthlyRecurring > 0
          ? Math.ceil((data.implantationFee || 0) / netGain)
          : 0;

      Y = secTitle(doc, "Indicadores de Retorno", Y);
      const IND_W = (CW - 16) / 3;
      const IND_H = 42;

      // ROI
      box(doc, M, Y, IND_W, IND_H, { fill: C.bgLight, stroke: C.border });
      doc.setFontSize(14);
      doc.setTextColor(...hexToRgb(C.green));
      doc.setFont("helvetica", "bold");
      const roiText = `${roiPercent}%`;
      const rtw = doc.getTextWidth(roiText);
      doc.text(roiText, M + (IND_W - rtw) / 2, Y + 18);
      doc.setFontSize(5.5);
      doc.setTextColor(...hexToRgb(C.textLight));
      doc.setFont("helvetica", "normal");
      const roiLabel = "ROI Receita vs Investimento";
      const rlw = doc.getTextWidth(roiLabel);
      doc.text(roiLabel, M + (IND_W - rlw) / 2, Y + 32);

      // Payback
      const px = M + IND_W + 8;
      box(doc, px, Y, IND_W, IND_H, { fill: C.bgLight, stroke: C.border });
      doc.setFontSize(14);
      doc.setTextColor(...hexToRgb(C.blue));
      doc.setFont("helvetica", "bold");
      const pbText = `${paybackMonths}`;
      const pbtw = doc.getTextWidth(pbText);
      doc.text(pbText, px + (IND_W - pbtw) / 2, Y + 18);
      doc.setFontSize(5.5);
      doc.setTextColor(...hexToRgb(C.textLight));
      doc.setFont("helvetica", "normal");
      const pbLabel = "Meses para Payback";
      const pblw = doc.getTextWidth(pbLabel);
      doc.text(pbLabel, px + (IND_W - pblw) / 2, Y + 32);

      // Annual gain
      const annualGain = netGain * 12;
      const ax = M + (IND_W + 8) * 2;
      box(doc, ax, Y, IND_W, IND_H, { fill: C.bgLight, stroke: C.border });
      doc.setFontSize(11);
      doc.setTextColor(...hexToRgb(C.green));
      doc.setFont("helvetica", "bold");
      const agText = fmt(annualGain);
      const agtw = doc.getTextWidth(agText);
      doc.text(agText, ax + (IND_W - agtw) / 2, Y + 18);
      doc.setFontSize(5.5);
      doc.setTextColor(...hexToRgb(C.textLight));
      doc.setFont("helvetica", "normal");
      const agLabel = "Ganho Anual Estimado";
      const aglw = doc.getTextWidth(agLabel);
      doc.text(agLabel, ax + (IND_W - aglw) / 2, Y + 32);

      Y += IND_H + GAP;
    }
  }

  // --- CTA SLOGAN ---
  if (Y + 40 < MAX_Y) {
    const CTA_H = 36;
    doc.setFillColor(...hexToRgb(C.red));
    doc.roundedRect(M + 40, Y, CW - 80, CTA_H, 5, 5, "F");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    const ctaText = "Kenlo \u2014 Quem usa, lidera.";
    const ctw = doc.getTextWidth(ctaText);
    doc.text(ctaText, M + 40 + (CW - 80 - ctw) / 2, Y + 14);
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    const ctaDesc =
      "Transforme sua imobili\u00e1ria em uma m\u00e1quina de resultados";
    const cdw = doc.getTextWidth(ctaDesc);
    doc.text(ctaDesc, M + 40 + (CW - 80 - cdw) / 2, Y + 26);
  }

  } // end if (needsPage2)

  // Generate blob
  const pdfBlob = doc.output("blob");
  const filename = `Cotacao_Kenlo_${data.clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

  return { blob: pdfBlob, filename };
}

/**
 * Generate and download the PDF directly
 */
export async function downloadProposalPDF(
  data: ProposalPrintData
): Promise<void> {
  const { blob, filename } = await generateProposalPDFClient(data);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
