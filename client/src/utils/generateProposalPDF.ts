/**
 * Client-side PDF generation — Redesign v2
 *
 * Structure (8 sections):
 *   1. Capa (cover — full page)
 *   2. Resumo da Configuração (single linear block, no cards)
 *   3. Detalhamento (products, addons, implantation, installments)
 *   4. Benefícios Inclusos (VIP, CS, Training)
 *   5. Variáveis pós-pago (only if relevant)
 *   6. Sua Seleção vs Kombos (frequency at top, then comparison table)
 *   7. Kenlo Receita Extra + ROI (no Cash)
 *   8. Conclusão
 *
 * Design: linear 1-column layout, full-width blocks, clean document (not dashboard),
 *         minimal text, no duplication, primary color for selection only.
 */

import { jsPDF } from "jspdf";
import { KENLO_LOGO_WHITE_BASE64, KENLO_LOGO_RED_BASE64 } from "./kenloLogoBase64";

// ── Data Interface ──────────────────────────────────────────────
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
  validityDays?: number;
  imobPrice?: number;
  locPrice?: number;
  addonPrices?: string;
  vipIncluded?: boolean;
  csIncluded?: boolean;
  vipPrice?: number;
  csPrice?: number;
  postPaidBreakdown?: string;
  komboComparison?: string;
}

interface KomboComparisonData {
  name: string;
  discount: number;
  monthlyTotal: number;
  savings: number;
}

// ── Post-paid types ─────────────────────────────────────────────
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

// ── Constants ───────────────────────────────────────────────────
const PW = 595.28;
const PH = 841.89;
const M = 48;
const CW = PW - M * 2;
const GAP = 12;
const MAX_Y = PH - 50;

const C = {
  primary: "#E11D48",
  primaryLight: "#FFF1F2",
  primaryMuted: "#FECDD3",
  green: "#059669",
  greenLight: "#ECFDF5",
  greenBorder: "#6EE7B7",
  dark: "#0F172A",
  text: "#334155",
  textMuted: "#64748B",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  bg: "#FFFFFF",
  bgSoft: "#F8FAFC",
  blue: "#2563EB",
  blueLight: "#EFF6FF",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(v);

const fmtNum = (v: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v);

// ── Helpers ─────────────────────────────────────────────────────
function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function card(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { fill?: string; stroke?: string; lw?: number; r?: number; selected?: boolean } = {}
) {
  const r = opts.r ?? 4;
  if (opts.selected) {
    doc.setFillColor(...rgb(C.primaryLight));
    doc.setDrawColor(...rgb(C.primary));
    doc.setLineWidth(1);
    doc.roundedRect(x, y, w, h, r, r, "FD");
  } else {
    doc.setFillColor(...rgb(opts.fill ?? C.bg));
    doc.setDrawColor(...rgb(opts.stroke ?? C.border));
    doc.setLineWidth(opts.lw ?? 0.5);
    doc.roundedRect(x, y, w, h, r, r, "FD");
  }
}

/** Section title with subtle left accent */
function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...rgb(C.primary));
  doc.rect(M, y, 3, 12, "F");
  doc.setFontSize(11);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(title, M + 10, y + 10);
  return y + 22;
}

function lbl(doc: jsPDF, text: string, x: number, y: number, opts: { color?: string; size?: number; bold?: boolean } = {}) {
  doc.setFontSize(opts.size ?? 7);
  doc.setTextColor(...rgb(opts.color ?? C.textMuted));
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.text(text, x, y);
}

function val(doc: jsPDF, text: string, x: number, y: number, opts: { color?: string; size?: number; align?: "left" | "right" | "center" } = {}) {
  doc.setFontSize(opts.size ?? 9);
  doc.setTextColor(...rgb(opts.color ?? C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(text, x, y, { align: opts.align ?? "left" });
}

function divider(doc: jsPDF, y: number, x1?: number, x2?: number) {
  doc.setDrawColor(...rgb(C.border));
  doc.setLineWidth(0.3);
  doc.line(x1 ?? M, y, x2 ?? (M + CW), y);
}

function needsNewPage(y: number, needed: number): boolean {
  return y + needed > MAX_Y;
}

function newPage(doc: jsPDF, data: ProposalPrintData): number {
  doc.addPage();
  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, 0, PW, 3, "F");
  doc.setFontSize(6);
  doc.setTextColor(...rgb(C.textLight));
  doc.setFont("helvetica", "normal");
  doc.text(`${data.agencyName || "Imobiliária"} — Proposta Comercial`, M, PH - 20);
  doc.text(`Consultor: ${data.salesPersonName}`, PW - M, PH - 20, { align: "right" });
  return 30;
}

/** Draw a row in a table: label left, value right */
function tableRow(doc: jsPDF, label: string, value: string, y: number, opts: { labelColor?: string; valueColor?: string; bold?: boolean; size?: number } = {}) {
  const sz = opts.size ?? 7.5;
  doc.setFontSize(sz);
  doc.setTextColor(...rgb(opts.labelColor ?? C.text));
  doc.setFont("helvetica", "normal");
  doc.text(label, M + 14, y);
  doc.setTextColor(...rgb(opts.valueColor ?? C.dark));
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.text(value, M + CW - 14, y, { align: "right" });
}

// ── Parse helpers ───────────────────────────────────────────────
function parseAddons(raw: string | string[]): string[] {
  try {
    if (Array.isArray(raw)) return raw.map((a: string) => a.trim().toLowerCase());
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((a: string) => a.trim().toLowerCase());
    return raw.split(",").map((a) => a.trim().toLowerCase());
  } catch {
    if (typeof raw === "string") return raw.split(",").map((a) => a.trim().toLowerCase());
    return [];
  }
}

function parseAddonPrices(raw?: string | Record<string, number>): Record<string, number> {
  if (!raw) return {};
  if (typeof raw === "object") return raw as Record<string, number>;
  try { return JSON.parse(raw); } catch { return {}; }
}

function parsePostPaid(raw?: string | object): PostPaidBreakdown | null {
  if (!raw) return null;
  try {
    if (typeof raw === "string") return JSON.parse(raw);
    return raw as PostPaidBreakdown;
  } catch { return null; }
}

function parseKomboComparison(raw?: string): KomboComparisonData[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return parsed.map((k: any) => ({
      name: k.name || '',
      discount: k.discount || 0,
      monthlyTotal: k.monthlyTotal ?? k.totalMonthly ?? 0,
      savings: k.savings || 0,
    }));
  } catch { return []; }
}

// ══════════════════════════════════════════════════════════════════
// MAIN PDF GENERATION
// ══════════════════════════════════════════════════════════════════
export async function generateProposalPDFClient(
  data: ProposalPrintData
): Promise<{ blob: Blob; filename: string }> {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  // ── Derived flags ──────────────────────────────────────────────
  const showImob = ["imob", "both", "imob_loc", "ambos"].includes(data.productType?.toLowerCase() || "");
  const showLoc = ["loc", "both", "imob_loc", "ambos"].includes(data.productType?.toLowerCase() || "");
  const selAddons = parseAddons(data.selectedAddons);
  const addonPrices = parseAddonPrices(data.addonPrices);
  const ppBreakdown = parsePostPaid(data.postPaidBreakdown);
  const komboComparison = parseKomboComparison(data.komboComparison);
  const monthlyRecurring = data.totalAnnual > 0 ? data.totalAnnual / 12 : (data.monthlyLicenseBase || data.totalMonthly || 0);
  const installments = data.installments || 1;
  const totalInvestment = data.totalAnnual + data.implantationFee;
  const installmentValue = totalInvestment / installments;

  const imobIsK2 = showImob && data.imobPlan?.toLowerCase() === "k2";
  const locIsK2 = showLoc && data.locPlan?.toLowerCase() === "k2";
  const imobIsK = showImob && data.imobPlan?.toLowerCase() === "k";
  const locIsK = showLoc && data.locPlan?.toLowerCase() === "k";
  const anyK2 = imobIsK2 || locIsK2;
  const anyK = imobIsK || locIsK || anyK2;
  const bothK2 = imobIsK2 && locIsK2;

  const hasVip = data.vipIncluded || (data.vipPrice !== undefined && data.vipPrice > 0);
  const hasCS = data.csIncluded || (data.csPrice !== undefined && data.csPrice > 0);
  const hasRevenue = (data.revenueFromBoletos || 0) > 0 || (data.revenueFromInsurance || 0) > 0;
  const hasPostPaid = (data.postPaidTotal || 0) > 0;

  const komboDiscount = data.komboDiscount || 0;
  const rawKombo = data.komboName || "";
  const komboDisplayMap: Record<string, string> = {
    sem_kombo: "", imob_start: "Kombo Imob Start", imob_pro: "Kombo Imob Pro",
    locacao_pro: "Kombo Loc Pro", core_gestao: "Kombo Core Gestão", elite: "Kombo Elite",
  };
  const normalizedKombo = rawKombo.toLowerCase().replace(/^kombo\s+/i, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
  const komboLabel = komboDisplayMap[normalizedKombo] || rawKombo;
  const isKombo = komboDiscount > 0 || (komboLabel !== "" && normalizedKombo !== "sem_kombo");

  const addonLabels = [
    { key: "leads", label: "Leads" },
    { key: "inteligencia", label: "Inteligência" },
    { key: "assinatura", label: "Assinatura" },
    { key: "pay", label: "Pay" },
    { key: "seguros", label: "Seguros" },
  ];
  const activeAddons = addonLabels.filter(a => selAddons.includes(a.key));

  // Frequency
  const freqMap: Record<string, { label: string; adj: string }> = {
    monthly: { label: "Mensal", adj: "+25%" },
    mensal: { label: "Mensal", adj: "+25%" },
    semestral: { label: "Semestral", adj: "+11%" },
    annual: { label: "Anual", adj: "referência" },
    anual: { label: "Anual", adj: "referência" },
    bienal: { label: "Bienal", adj: "-10%" },
  };
  const selFreq = freqMap[data.paymentPlan?.toLowerCase()] || freqMap["annual"];

  // Premium benefit level: highest plan between IMOB and LOC
  const planLevel = (plan?: string): number => {
    const p = plan?.toLowerCase();
    if (p === "k2") return 3;
    if (p === "k") return 2;
    if (p === "prime") return 1;
    return 0;
  };
  const highestPlan = Math.max(planLevel(data.imobPlan), planLevel(data.locPlan));
  const highestPlanLabel = highestPlan === 3 ? "K2" : highestPlan === 2 ? "K" : "Prime";

  // ════════════════════════════════════════════════════════════════
  // SECTION 1 — CAPA (full page, keep as-is)
  // ════════════════════════════════════════════════════════════════
  let Y = 0;
  const coverCenterX = PW / 2;

  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, 0, PW, 4, "F");

  const LOGO_H = 32;
  const LOGO_W = LOGO_H * 3.48;
  try {
    doc.addImage(KENLO_LOGO_RED_BASE64, "PNG", coverCenterX - LOGO_W / 2, 180, LOGO_W, LOGO_H);
  } catch {
    doc.setFontSize(28);
    doc.setTextColor(...rgb(C.primary));
    doc.setFont("helvetica", "bold");
    doc.text("Kenlo", coverCenterX, 200, { align: "center" });
  }

  doc.setFontSize(26);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Proposta Comercial", coverCenterX, 260, { align: "center" });

  doc.setDrawColor(...rgb(C.border));
  doc.setLineWidth(0.5);
  doc.line(coverCenterX - 60, 280, coverCenterX + 60, 280);

  doc.setFontSize(16);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", "normal");
  doc.text(data.agencyName || data.clientName, coverCenterX, 310, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(...rgb(C.textMuted));
  doc.text(data.clientName, coverCenterX, 335, { align: "center" });

  const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.textLight));
  doc.text(dateStr, coverCenterX, 370, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text("Consultor", coverCenterX, PH - 120, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", "bold");
  doc.text(data.salesPersonName, coverCenterX, PH - 105, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  if (data.vendorEmail) doc.text(data.vendorEmail, coverCenterX, PH - 90, { align: "center" });
  if (data.vendorPhone) doc.text(data.vendorPhone, coverCenterX, PH - 78, { align: "center" });

  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, PH - 4, PW, 4, "F");

  // ════════════════════════════════════════════════════════════════
  // SECTION 2 — RESUMO DA CONFIGURAÇÃO (single linear block)
  // ════════════════════════════════════════════════════════════════
  Y = newPage(doc, data);
  Y = sectionTitle(doc, "Resumo da Configuração", Y);

  // Background block
  const resumoStartY = Y;
  // We'll draw the background after calculating height
  let rY = Y + 12;

  // Line 1: Produto(s) + Plano(s)
  const prodParts: string[] = [];
  if (showImob) prodParts.push(`IMOB ${(data.imobPlan || "").toUpperCase()}`);
  if (showLoc) prodParts.push(`LOC ${(data.locPlan || "").toUpperCase()}`);
  val(doc, prodParts.join("  +  "), M + 14, rY, { size: 14, color: C.dark });
  rY += 18;

  // Line 2: Kombo (only if selected)
  if (isKombo) {
    const komboText = komboDiscount > 0 ? `${komboLabel} (–${komboDiscount}%)` : komboLabel;
    // Badge
    doc.setFontSize(8);
    const bw = doc.getTextWidth(komboText) + 16;
    doc.setFillColor(...rgb(C.primary));
    doc.roundedRect(M + 14, rY - 8, bw, 14, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(komboText, M + 22, rY, {});
    rY += 14;
  }

  // Line 3: Add-ons ativos
  if (activeAddons.length > 0) {
    const addonText = "Add-ons: " + activeAddons.map(a => a.label).join(" | ");
    lbl(doc, addonText, M + 14, rY, { size: 7.5, color: C.text });
    rY += 12;
  }

  // Line 4: Frequência + Investimento mensal equivalente (TOGETHER)
  val(doc, `${fmt(monthlyRecurring)} / mês`, M + 14, rY, { size: 12, color: C.primary });
  lbl(doc, `  ·  Contrato ${selFreq.label.toLowerCase()} (${selFreq.adj})`, M + 14 + doc.getTextWidth(fmt(monthlyRecurring) + " / mês") * 1.33 + 4, rY, { size: 7.5, color: C.textMuted });
  rY += 10;

  // Draw background behind the resumo block
  const resumoH = rY - resumoStartY + 4;
  // Draw it behind (we need to re-draw since jsPDF doesn't support z-order easily)
  // Instead, we'll draw a subtle left border
  doc.setFillColor(...rgb(C.primaryLight));
  doc.rect(M, resumoStartY, CW, resumoH, "F");
  doc.setFillColor(...rgb(C.primary));
  doc.rect(M, resumoStartY, 3, resumoH, "F");

  // Re-draw text on top of background
  rY = resumoStartY + 12;
  val(doc, prodParts.join("  +  "), M + 14, rY, { size: 14, color: C.dark });
  rY += 18;

  if (isKombo) {
    const komboText = komboDiscount > 0 ? `${komboLabel} (–${komboDiscount}%)` : komboLabel;
    doc.setFontSize(8);
    const bw = doc.getTextWidth(komboText) + 16;
    doc.setFillColor(...rgb(C.primary));
    doc.roundedRect(M + 14, rY - 8, bw, 14, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(komboText, M + 22, rY, {});
    rY += 14;
  }

  if (activeAddons.length > 0) {
    const addonText = "Add-ons: " + activeAddons.map(a => a.label).join(" | ");
    lbl(doc, addonText, M + 14, rY, { size: 7.5, color: C.text });
    rY += 12;
  }

  // Price + frequency line
  doc.setFontSize(12);
  doc.setTextColor(...rgb(C.primary));
  doc.setFont("helvetica", "bold");
  const priceText = `${fmt(monthlyRecurring)} / mês`;
  doc.text(priceText, M + 14, rY);
  const priceWidth = doc.getTextWidth(priceText);
  doc.setFontSize(7.5);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text(`  ·  Contrato ${selFreq.label.toLowerCase()} (${selFreq.adj})`, M + 14 + priceWidth + 4, rY);
  rY += 10;

  Y = rY + GAP;

  // ════════════════════════════════════════════════════════════════
  // SECTION 3 — DETALHAMENTO
  // ════════════════════════════════════════════════════════════════
  Y = sectionTitle(doc, "Detalhamento", Y);

  lbl(doc, "Valores em base mensal equivalente para a frequência escolhida.", M + 10, Y, { size: 6.5, color: C.textLight });
  Y += 12;

  // Products
  if (showImob && data.imobPrice !== undefined) {
    tableRow(doc, `Kenlo IMOB — Plano ${(data.imobPlan || "K").toUpperCase()}`, fmt(data.imobPrice) + "/mês", Y);
    Y += 14;
  }
  if (showLoc && data.locPrice !== undefined) {
    tableRow(doc, `Kenlo Locação — Plano ${(data.locPlan || "K").toUpperCase()}`, fmt(data.locPrice) + "/mês", Y);
    Y += 14;
  }

  // Add-ons with prices
  const addonNameMap: Record<string, string> = {
    leads: "Kenlo Leads", inteligencia: "Kenlo Inteligência",
    assinatura: "Kenlo Assinatura", pay: "Kenlo Pay", seguros: "Kenlo Seguros",
  };
  const paidAddons = Object.entries(addonPrices).filter(([_, p]) => p > 0);
  for (const [key, price] of paidAddons) {
    tableRow(doc, addonNameMap[key] || key, fmt(price) + "/mês", Y);
    Y += 14;
  }

  // VIP / CS (if applicable)
  if (hasVip) {
    const vipVal = data.vipIncluded ? "Incluído" : fmt(data.vipPrice || 97) + "/mês";
    tableRow(doc, "Suporte VIP", vipVal, Y, { valueColor: data.vipIncluded ? C.green : C.text });
    Y += 14;
  }
  if (hasCS) {
    const csVal = data.csIncluded ? "Incluído" : fmt(data.csPrice || 197) + "/mês";
    tableRow(doc, "CS Dedicado", csVal, Y, { valueColor: data.csIncluded ? C.green : C.text });
    Y += 14;
  }

  // K2 Training
  if (anyK2) {
    const trainText = bothK2
      ? "Treinamentos (4 Online ou 2 Presenciais)"
      : "Treinamentos (2 Online ou 1 Presencial)";
    tableRow(doc, trainText, "Incluído", Y, { valueColor: C.green });
    Y += 14;
  }

  // Divider before totals
  Y += 2;
  divider(doc, Y);
  Y += 10;

  // Total mensal
  doc.setFontSize(9);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Total Mensal Equivalente", M + 14, Y);
  doc.text(fmt(monthlyRecurring), M + CW - 14, Y, { align: "right" });
  Y += 16;

  // Implantação
  tableRow(doc, "Implantação (pagamento único)", fmt(data.implantationFee), Y);
  Y += 10;
  lbl(doc, "Custo único, não recorrente — não entra no cálculo do ROI mensal.", M + 14, Y, { size: 5.5, color: C.textLight });
  Y += 14;

  // Payment condition with installment breakdown
  const normPlan = data.paymentPlan?.toLowerCase() || "annual";
  doc.setFontSize(7.5);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Condição de Pagamento", M + 14, Y);
  Y += 12;

  if (normPlan === "monthly" || normPlan === "mensal") {
    lbl(doc, `Cobrado mensalmente: ${fmt(data.totalMonthly || installmentValue)}/mês`, M + 14, Y, { size: 7.5, color: C.text });
    Y += 14;
  } else if (normPlan === "semestral") {
    lbl(doc, `Pago semestralmente: ${fmt((data.totalMonthly || 0) * 6)} a cada 6 meses`, M + 14, Y, { size: 7.5, color: C.text });
    Y += 14;
  } else {
    // Annual or Bienal — show installment pills
    const periodLabel = normPlan === "bienal" ? "bienal (24 meses)" : "anual";
    const maxInstallments = normPlan === "bienal" ? 6 : 3;
    const PILL_W = (CW - 28 - (maxInstallments - 1) * 6) / maxInstallments;
    const PILL_H = 28;

    for (let n = 1; n <= maxInstallments; n++) {
      const px = M + 14 + (n - 1) * (PILL_W + 6);
      const isSel = n === installments;
      if (isSel) {
        doc.setFillColor(...rgb(C.primary));
      } else {
        doc.setFillColor(...rgb(C.bgSoft));
      }
      doc.roundedRect(px, Y, PILL_W, PILL_H, 4, 4, "F");
      if (isSel) {
        doc.setDrawColor(...rgb(C.primary));
        doc.roundedRect(px, Y, PILL_W, PILL_H, 4, 4, "S");
      }
      const pillLabel = n === 1 ? "À vista" : `${n}x`;
      doc.setFontSize(6.5);
      doc.setTextColor(...rgb(isSel ? "#FFFFFF" : C.text));
      doc.setFont("helvetica", isSel ? "bold" : "normal");
      doc.text(pillLabel, px + PILL_W / 2, Y + 10, { align: "center" });
      const pillValue = fmt(totalInvestment / n);
      doc.setFontSize(6);
      doc.setTextColor(...rgb(isSel ? "#FFFFFF" : C.textMuted));
      doc.setFont("helvetica", "normal");
      doc.text(pillValue, px + PILL_W / 2, Y + 20, { align: "center" });
    }
    Y += PILL_H + 4;
    lbl(doc, `Pagamento ${periodLabel} — Total: ${fmt(totalInvestment)}`, M + 14, Y, { size: 6, color: C.textMuted });
    Y += 14;
  }

  Y += GAP;

  // ════════════════════════════════════════════════════════════════
  // SECTION 4 — BENEFÍCIOS INCLUSOS
  // ════════════════════════════════════════════════════════════════
  if (anyK || hasVip || hasCS) {
    if (needsNewPage(Y, 120)) Y = newPage(doc, data);
    Y = sectionTitle(doc, "Benefícios Inclusos", Y);

    // Propagation rule explanation
    if (showImob && showLoc) {
      lbl(doc, `Nível de benefício: determinado pelo maior plano contratado (${highestPlanLabel}). Benefícios premium se propagam para todos os produtos.`, M + 10, Y, { size: 6.5, color: C.textMuted });
      Y += 12;
    }

    // VIP
    const vipStatus = hasVip ? (data.vipIncluded ? "Incluído no plano" : "Contratado") : "Não contratado";
    const vipColor = hasVip ? (data.vipIncluded ? C.green : C.text) : C.textLight;
    doc.setFontSize(7.5);
    doc.setTextColor(...rgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text("Suporte VIP", M + 14, Y);
    doc.setTextColor(...rgb(vipColor));
    doc.setFont("helvetica", "normal");
    doc.text(vipStatus, M + CW - 14, Y, { align: "right" });
    Y += 10;
    lbl(doc, "Atendimento prioritário com SLA reduzido para chamados críticos.", M + 14, Y, { size: 6, color: C.textMuted });
    Y += 14;

    // CS Dedicado
    const csStatus = hasCS ? (data.csIncluded ? "Incluído no plano" : "Contratado") : "Não contratado";
    const csColor = hasCS ? (data.csIncluded ? C.green : C.text) : C.textLight;
    doc.setFontSize(7.5);
    doc.setTextColor(...rgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text("CS Dedicado", M + 14, Y);
    doc.setTextColor(...rgb(csColor));
    doc.setFont("helvetica", "normal");
    doc.text(csStatus, M + CW - 14, Y, { align: "right" });
    Y += 10;
    lbl(doc, "Customer Success dedicado para acompanhamento estratégico da operação.", M + 14, Y, { size: 6, color: C.textMuted });
    Y += 14;

    // Treinamentos
    if (anyK2) {
      divider(doc, Y - 4);
      Y += 6;
      doc.setFontSize(7.5);
      doc.setTextColor(...rgb(C.dark));
      doc.setFont("helvetica", "bold");
      doc.text("Treinamentos Inclusos", M + 14, Y);
      Y += 12;

      if (bothK2) {
        // Both K2: accumulated
        tableRow(doc, "Treinamento Online (4 sessões)", "Ref: R$ 2.000 cada", Y, { valueColor: C.green });
        Y += 12;
        tableRow(doc, "Treinamento Presencial (2 sessões)", "Ref: R$ 3.000 cada", Y, { valueColor: C.green });
        Y += 10;
        lbl(doc, "Benefícios acumulados: IMOB K2 + LOC K2 somam treinamentos.", M + 14, Y, { size: 6, color: C.blue, bold: true });
        Y += 12;
      } else {
        // Single K2
        tableRow(doc, "Treinamento Online (2 sessões)", "Ref: R$ 2.000 cada", Y, { valueColor: C.green });
        Y += 12;
        tableRow(doc, "Treinamento Presencial (1 sessão)", "Ref: R$ 3.000", Y, { valueColor: C.green });
        Y += 12;
      }
    }

    Y += GAP;
  }

  // ════════════════════════════════════════════════════════════════
  // SECTION 5 — VARIÁVEIS (PÓS-PAGO) — only if relevant
  // ════════════════════════════════════════════════════════════════
  if (hasPostPaid && ppBreakdown) {
    if (needsNewPage(Y, 100)) Y = newPage(doc, data);
    Y = sectionTitle(doc, "Custos Variáveis (Pós-pago)", Y);

    lbl(doc, "Cobrado apenas pelo uso excedente ao incluído no plano.", M + 10, Y, { size: 6.5, color: C.textMuted });
    Y += 12;

    const renderGroup = (group: PostPaidGroup) => {
      // Group header
      lbl(doc, group.groupLabel, M + 14, Y, { size: 7, bold: true, color: C.dark });
      Y += 12;
      for (const item of group.items) {
        if (needsNewPage(Y, 30)) Y = newPage(doc, data);
        doc.setFontSize(7);
        doc.setTextColor(...rgb(C.text));
        doc.setFont("helvetica", "normal");
        doc.text(`${item.label}: ${fmtNum(item.included)} incluídos, ${fmtNum(item.additional)} adicionais`, M + 20, Y);
        doc.setTextColor(...rgb(C.dark));
        doc.setFont("helvetica", "bold");
        doc.text(fmt(item.total) + "/mês", M + CW - 14, Y, { align: "right" });
        Y += 11;
      }
      Y += 4;
    };

    if (ppBreakdown.imobAddons) renderGroup(ppBreakdown.imobAddons);
    if (ppBreakdown.locAddons) renderGroup(ppBreakdown.locAddons);
    if (ppBreakdown.sharedAddons) renderGroup(ppBreakdown.sharedAddons);

    // Total pós-pago
    divider(doc, Y);
    Y += 10;
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text("Total Variável Estimado", M + 14, Y);
    doc.text(fmt(data.postPaidTotal || 0) + "/mês", M + CW - 14, Y, { align: "right" });
    Y += GAP + 6;
  }

  // SECTION 6 — REMOVED (Kombos comparison table eliminated to reduce redundancy)
  // Kombo info is shown only in Resumo da Configuração (Section 2)

  // ════════════════════════════════════════════════════════════════
  // SECTION 7 — KENLO RECEITA EXTRA + ROI
  // ════════════════════════════════════════════════════════════════
  if (hasRevenue) {
    if (needsNewPage(Y, 180)) Y = newPage(doc, data);
    Y = sectionTitle(doc, "Kenlo Receita Extra", Y);

    lbl(doc, "Pay e Seguros ficam disponíveis por padrão. O uso é habilitado no onboarding.", M + 10, Y, { size: 6.5, color: C.textMuted });
    Y += 10;
    lbl(doc, "Seguros: receita para a imobiliária a partir de R$ 10 por contrato/mês.", M + 10, Y, { size: 6.5, color: C.textMuted });
    Y += 14;

    // Pay revenue
    if ((data.revenueFromBoletos || 0) > 0) {
      doc.setFontSize(7.5);
      doc.setTextColor(...rgb(C.dark));
      doc.setFont("helvetica", "bold");
      doc.text("Kenlo Pay", M + 14, Y);
      doc.setTextColor(...rgb(C.green));
      doc.text(`+ ${fmt(data.revenueFromBoletos || 0)}/mês`, M + CW - 14, Y, { align: "right" });
      Y += 10;

      if (data.chargesBoletoToTenant && data.boletoAmount && data.boletoAmount > 0) {
        lbl(doc, `Boleto: ${fmtNum(data.contracts || 0)} contratos × ${fmt(data.boletoAmount)} = ${fmt((data.contracts || 0) * data.boletoAmount)}`, M + 20, Y, { size: 6.5, color: C.textMuted });
        Y += 9;
      }
      if (data.chargesSplitToOwner && data.splitAmount && data.splitAmount > 0) {
        lbl(doc, `Split: ${fmtNum(data.contracts || 0)} contratos × ${fmt(data.splitAmount)} = ${fmt((data.contracts || 0) * data.splitAmount)}`, M + 20, Y, { size: 6.5, color: C.textMuted });
        Y += 9;
      }
      Y += 4;
    }

    // Seguros revenue
    if ((data.revenueFromInsurance || 0) > 0) {
      doc.setFontSize(7.5);
      doc.setTextColor(...rgb(C.dark));
      doc.setFont("helvetica", "bold");
      doc.text("Kenlo Seguros", M + 14, Y);
      doc.setTextColor(...rgb(C.green));
      doc.text(`+ ${fmt(data.revenueFromInsurance || 0)}/mês`, M + CW - 14, Y, { align: "right" });
      Y += 10;
      lbl(doc, `${fmtNum(data.contracts || 0)} contratos × R$ 10,00 = ${fmt(data.revenueFromInsurance || 0)}`, M + 20, Y, { size: 6.5, color: C.textMuted });
      Y += 14;
    }

    // Net gain summary
    const totalRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
    const netGain = data.netGain || totalRevenue - monthlyRecurring - (data.postPaidTotal || 0);
    const isPositive = netGain > 0;

    divider(doc, Y);
    Y += 12;

    // Net gain line
    doc.setFontSize(10);
    doc.setTextColor(...rgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text("Ganho Líquido Mensal Estimado", M + 14, Y);
    doc.setFontSize(14);
    doc.setTextColor(...rgb(isPositive ? C.green : "#EF4444"));
    doc.text(fmt(netGain), M + CW - 14, Y, { align: "right" });
    Y += 8;
    lbl(doc, isPositive
      ? "Receita extra supera o investimento na plataforma"
      : "Investimento na plataforma supera receita extra",
      M + 14, Y, { size: 6, color: C.textMuted });
    Y += 16;

    // ROI indicators
    if (monthlyRecurring > 0) {
      const totalCost = monthlyRecurring + (data.postPaidTotal || 0);
      const IND_W = (CW - 16) / 3;
      const IND_H = 44;

      if (needsNewPage(Y, IND_H + 20)) Y = newPage(doc, data);

      if (isPositive) {
        const roiPercent = ((totalRevenue / monthlyRecurring) * 100 - 100).toFixed(0);
        const paybackMonths = monthlyRecurring > 0 ? Math.ceil((data.implantationFee || 0) / netGain) : 0;
        const annualGain = netGain * 12;

        card(doc, M, Y, IND_W, IND_H, { fill: C.bgSoft });
        val(doc, `${roiPercent}%`, M + IND_W / 2, Y + 20, { size: 16, color: C.green, align: "center" });
        lbl(doc, "ROI (Receita vs Investimento)", M + IND_W / 2, Y + 34, { size: 6, color: C.textMuted });
        doc.text("", 0, 0); // reset

        const px = M + IND_W + 8;
        card(doc, px, Y, IND_W, IND_H, { fill: C.bgSoft });
        val(doc, `${paybackMonths} ${paybackMonths === 1 ? "mês" : "meses"}`, px + IND_W / 2, Y + 20, { size: 14, color: C.blue, align: "center" });
        lbl(doc, "Payback da Implantação", px + IND_W / 2, Y + 34, { size: 6, color: C.textMuted });

        const ax = M + (IND_W + 8) * 2;
        card(doc, ax, Y, IND_W, IND_H, { fill: C.bgSoft });
        val(doc, fmt(annualGain), ax + IND_W / 2, Y + 20, { size: 12, color: C.green, align: "center" });
        lbl(doc, "Ganho Anual Estimado", ax + IND_W / 2, Y + 34, { size: 6, color: C.textMuted });
      } else {
        const coveragePercent = totalCost > 0 ? Math.round((totalRevenue / totalCost) * 100) : 0;
        const uncoveredCost = Math.abs(netGain);

        card(doc, M, Y, IND_W, IND_H, { fill: C.greenLight, stroke: C.greenBorder });
        val(doc, `${coveragePercent}%`, M + IND_W / 2, Y + 20, { size: 16, color: C.green, align: "center" });
        lbl(doc, "Efeito Kenlo (cobertura do custo)", M + IND_W / 2, Y + 34, { size: 6, color: C.textMuted });

        const px = M + IND_W + 8;
        card(doc, px, Y, IND_W, IND_H, { fill: C.greenLight, stroke: C.greenBorder });
        val(doc, fmt(totalRevenue), px + IND_W / 2, Y + 20, { size: 12, color: C.green, align: "center" });
        lbl(doc, "Receita Mensal Gerada", px + IND_W / 2, Y + 34, { size: 6, color: C.textMuted });

        const ax = M + (IND_W + 8) * 2;
        card(doc, ax, Y, IND_W, IND_H, { fill: C.bgSoft });
        val(doc, fmt(uncoveredCost), ax + IND_W / 2, Y + 20, { size: 12, color: C.text, align: "center" });
        lbl(doc, "Custo Líquido Descoberto/mês", ax + IND_W / 2, Y + 34, { size: 6, color: C.textMuted });
      }

      Y += IND_H + 6;
      lbl(doc, "Estimativas baseadas nas informações declaradas. Resultados podem variar conforme uso efetivo.", M, Y + 3, { size: 5, color: C.textLight });
      Y += 12;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // SECTION 8 — CONCLUSÃO
  // ════════════════════════════════════════════════════════════════
  if (needsNewPage(Y, 80)) Y = newPage(doc, data);

  Y += 10;
  const CONC_H = 50;
  card(doc, M, Y, CW, CONC_H, { fill: C.dark, stroke: C.dark });
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Kenlo \u2014 Quem usa, lidera.", M + CW / 2, Y + 22, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(...rgb("#CBD5E1"));
  doc.setFont("helvetica", "normal");
  doc.text("A Kenlo \u00e9 a \u00fanica plataforma que pode se pagar enquanto voc\u00ea usa.", M + CW / 2, Y + 36, { align: "center" });

  // Validity disclaimer
  Y += CONC_H + 12;
  const vDays = data.validityDays || 3;
  const today = new Date();
  const expiryDate = new Date(today);
  expiryDate.setDate(today.getDate() + vDays);
  const fmtDate = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  doc.setFontSize(6.5);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text(
    `Proposta v\u00e1lida por ${vDays} dia${vDays > 1 ? "s" : ""} a partir da data de emiss\u00e3o (${fmtDate(today)}). Validade at\u00e9 ${fmtDate(expiryDate)}.`,
    M + CW / 2, Y, { align: "center" }
  );

  // \u2500\u2500 Page number footer on ALL pages──────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6);
    doc.setTextColor(...rgb(C.textLight));
    doc.setFont("helvetica", "normal");
    doc.text(`P\u00e1gina ${i} de ${totalPages}`, PW / 2, PH - 12, { align: "center" });
  }

  // ── Generate blob ─────────────────────────────────────────────
  const pdfBlob = doc.output("blob");
  const filename = `Cotacao_Kenlo_${data.clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  return { blob: pdfBlob, filename };
}

/**
 * Generate and download the PDF directly
 */
export async function downloadProposalPDF(data: ProposalPrintData): Promise<void> {
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
