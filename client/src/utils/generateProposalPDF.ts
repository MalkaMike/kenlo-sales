/**
 * Client-side PDF generation — Master Prompt v1
 *
 * Structure (9 sections):
 *   1. Capa (cover)
 *   2. Resumo da Configuração (mini-calculator)
 *   3. Produtos Contratados
 *   4. Add-ons Contratados
 *   5. Frequência de Pagamento
 *   6. Seleção vs Kombos (comparison)
 *   7. Kenlo Receita Extra (value proof)
 *   8. Investimento Total
 *   9. Conclusão
 *
 * Design: white bg, lots of whitespace, SaaS-modern, cards not heavy tables,
 *         primary color for selection only, green for gains, grey for neutral,
 *         NEVER red for prices.
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
  imobPrice?: number;
  locPrice?: number;
  addonPrices?: string;
  vipIncluded?: boolean;
  csIncluded?: boolean;
  vipPrice?: number;
  csPrice?: number;
  postPaidBreakdown?: string;
  // Kombo comparison data (all kombos for the comparison table)
  komboComparison?: string; // JSON: KomboComparisonData[]
}

interface KomboComparisonData {
  name: string;
  discount: number; // percentage e.g. 10
  monthlyTotal: number;
  savings: number; // monthly savings vs no-kombo
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
const PW = 595.28; // A4 width in pt
const PH = 841.89;
const M = 48; // generous margin
const CW = PW - M * 2; // content width
const GAP = 14;
const MAX_Y = PH - 50;

// Design-system colors — restrained palette
const C = {
  // Primary (Kenlo rose) — only for selection / contracted items
  primary: "#E11D48",
  primaryLight: "#FFF1F2",
  primaryMuted: "#FECDD3",
  // Greens — gains / economy
  green: "#059669",
  greenLight: "#ECFDF5",
  greenBorder: "#6EE7B7",
  // Neutrals
  dark: "#0F172A",
  text: "#334155",
  textMuted: "#64748B",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  bg: "#FFFFFF",
  bgSoft: "#F8FAFC",
  // Accent
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

/** Rounded rect with optional fill + stroke */
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

/** Section title — clean, with subtle left accent */
function section(doc: jsPDF, title: string, y: number): number {
  // Subtle left accent bar
  doc.setFillColor(...rgb(C.primary));
  doc.rect(M, y, 3, 12, "F");
  doc.setFontSize(11);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(title, M + 10, y + 10);
  return y + 22;
}

/** Small label text */
function label(doc: jsPDF, text: string, x: number, y: number, opts: { color?: string; size?: number; bold?: boolean } = {}) {
  doc.setFontSize(opts.size ?? 7);
  doc.setTextColor(...rgb(opts.color ?? C.textMuted));
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.text(text, x, y);
}

/** Value text */
function value(doc: jsPDF, text: string, x: number, y: number, opts: { color?: string; size?: number; align?: "left" | "right" | "center" } = {}) {
  doc.setFontSize(opts.size ?? 9);
  doc.setTextColor(...rgb(opts.color ?? C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(text, x, y, { align: opts.align ?? "left" });
}

/** Thin horizontal divider */
function divider(doc: jsPDF, y: number, x1?: number, x2?: number) {
  doc.setDrawColor(...rgb(C.border));
  doc.setLineWidth(0.3);
  doc.line(x1 ?? M, y, x2 ?? (M + CW), y);
}

/** Check if we need a new page */
function needsNewPage(y: number, needed: number): boolean {
  return y + needed > MAX_Y;
}

/** Add a new page with consistent footer */
function newPage(doc: jsPDF, data: ProposalPrintData): number {
  doc.addPage();
  // Subtle top line
  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, 0, PW, 3, "F");
  // Footer info
  doc.setFontSize(6);
  doc.setTextColor(...rgb(C.textLight));
  doc.setFont("helvetica", "normal");
  doc.text(`${data.agencyName || "Imobiliária"} — Proposta Comercial`, M, PH - 20);
  doc.text(`Vendedor: ${data.salesPersonName}`, PW - M, PH - 20, { align: "right" });
  return 30; // starting Y
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
    // Normalize field names: CalculadoraPage sends "totalMonthly" but interface expects "monthlyTotal"
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

  // Derived flags
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
  const anyK2 = imobIsK2 || locIsK2;
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

  // Frequency
  const freqMap: Record<string, { label: string; adj: string }> = {
    monthly: { label: "Mensal", adj: "+25%" },
    mensal: { label: "Mensal", adj: "+25%" },
    semestral: { label: "Semestral", adj: "+11%" },
    annual: { label: "Anual", adj: "0% (referência)" },
    anual: { label: "Anual", adj: "0% (referência)" },
    bienal: { label: "Bienal", adj: "−10%" },
  };
  const selFreq = freqMap[data.paymentPlan?.toLowerCase()] || freqMap["annual"];

  // ════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ════════════════════════════════════════════════════════════════
  let Y = 0;

  // Full white page, centered content
  const coverCenterX = PW / 2;

  // Top accent line
  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, 0, PW, 4, "F");

  // Logo centered
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

  // "Proposta Comercial"
  doc.setFontSize(26);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Proposta Comercial", coverCenterX, 260, { align: "center" });

  // Thin divider
  doc.setDrawColor(...rgb(C.border));
  doc.setLineWidth(0.5);
  doc.line(coverCenterX - 60, 280, coverCenterX + 60, 280);

  // Agency name
  doc.setFontSize(16);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", "normal");
  doc.text(data.agencyName || data.clientName, coverCenterX, 310, { align: "center" });

  // Contact name
  doc.setFontSize(11);
  doc.setTextColor(...rgb(C.textMuted));
  doc.text(data.clientName, coverCenterX, 335, { align: "center" });

  // Date
  const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.textLight));
  doc.text(dateStr, coverCenterX, 370, { align: "center" });

  // Seller info at bottom
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

  // Bottom accent line
  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, PH - 4, PW, 4, "F");

  // ════════════════════════════════════════════════════════════════
  // PAGE 2 — RESUMO DA CONFIGURAÇÃO (mini-calculator)
  // ════════════════════════════════════════════════════════════════
  Y = newPage(doc, data);

  Y = section(doc, "Resumo da sua Configuração", Y);

  // Build summary cards row 1: Products + Plans
  const CARD_W = (CW - GAP) / 2;
  const CARD_H = 60;

  // Card: Produtos
  card(doc, M, Y, CARD_W, CARD_H, { selected: true });
  label(doc, "PRODUTOS CONTRATADOS", M + 14, Y + 16, { size: 6, bold: true, color: C.primary });
  const prodParts: string[] = [];
  if (showImob) prodParts.push(`IMOB ${(data.imobPlan || "").toUpperCase()}`);
  if (showLoc) prodParts.push(`LOC ${(data.locPlan || "").toUpperCase()}`);
  value(doc, prodParts.join("  +  "), M + 14, Y + 34, { size: 13, color: C.dark });
  if (isKombo) {
    const badgeText = komboDiscount > 0 ? `${komboLabel} (${komboDiscount}% OFF)` : komboLabel;
    const bw = doc.getTextWidth(badgeText) * 0.85 + 14;
    doc.setFillColor(...rgb(C.primary));
    doc.roundedRect(M + 14, Y + 40, bw, 13, 3, 3, "F");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(badgeText, M + 21, Y + 49);
  }

  // Card: Investimento
  const cx2 = M + CARD_W + GAP;
  card(doc, cx2, Y, CARD_W, CARD_H, { fill: C.bgSoft });
  label(doc, "INVESTIMENTO MENSAL EQUIVALENTE", cx2 + 14, Y + 16, { size: 6, bold: true, color: C.textMuted });
  value(doc, fmt(monthlyRecurring), cx2 + 14, Y + 36, { size: 16, color: C.dark });
  label(doc, `${selFreq.label} (${selFreq.adj})`, cx2 + 14, Y + 50, { size: 7, color: C.textMuted });

  Y += CARD_H + GAP;

  // Row 2: Add-ons summary + Frequency
  const CARD_H2 = 42;

  // Card: Add-ons ativos
  const addonLabels = [
    { key: "leads", label: "Leads" },
    { key: "inteligencia", label: "Inteligência" },
    { key: "assinatura", label: "Assinatura" },
    { key: "pay", label: "Pay" },
    { key: "seguros", label: "Seguros" },
  ];
  const activeAddons = addonLabels.filter(a => selAddons.includes(a.key));

  card(doc, M, Y, CARD_W, CARD_H2, { fill: C.bgSoft });
  label(doc, "ADD-ONS ATIVOS", M + 14, Y + 14, { size: 6, bold: true, color: C.textMuted });
  if (activeAddons.length > 0) {
    const addonText = activeAddons.map(a => a.label).join("  ·  ");
    value(doc, addonText, M + 14, Y + 30, { size: 8, color: C.text });
  } else {
    label(doc, "Nenhum add-on selecionado", M + 14, Y + 30, { size: 8, color: C.textLight });
  }

  // Card: Frequência
  card(doc, cx2, Y, CARD_W, CARD_H2, { fill: C.bgSoft });
  label(doc, "FREQUÊNCIA DE PAGAMENTO", cx2 + 14, Y + 14, { size: 6, bold: true, color: C.textMuted });
  value(doc, selFreq.label, cx2 + 14, Y + 30, { size: 10, color: C.dark });
  label(doc, selFreq.adj, cx2 + 80, Y + 30, { size: 8, color: C.primary, bold: true });

  Y += CARD_H2 + GAP + 4;

  // ════════════════════════════════════════════════════════════════
  // SECTION 3 — PRODUTOS CONTRATADOS
  // ════════════════════════════════════════════════════════════════
  Y = section(doc, "Produtos Contratados", Y);

  const PROD_CARD_H = 52;
  const prodCards: { name: string; plan: string; desc: string; price: number }[] = [];
  if (showImob) {
    prodCards.push({
      name: "Kenlo IMOB",
      plan: (data.imobPlan || "K").toUpperCase(),
      desc: "CRM + Site para vendas de imóveis",
      price: data.imobPrice || 0,
    });
  }
  if (showLoc) {
    prodCards.push({
      name: "Kenlo Locação",
      plan: (data.locPlan || "K").toUpperCase(),
      desc: "ERP para gestão de contratos de locação",
      price: data.locPrice || 0,
    });
  }

  const prodColW = prodCards.length === 1 ? CW : CARD_W;
  prodCards.forEach((p, i) => {
    const px = M + i * (prodColW + GAP);
    card(doc, px, Y, prodColW, PROD_CARD_H, { selected: true });
    value(doc, p.name, px + 14, Y + 18, { size: 10, color: C.dark });
    // Plan badge
    const planBadge = `Plano ${p.plan}`;
    const pbw = doc.getTextWidth(planBadge) + 12;
    const nameW = doc.getTextWidth(p.name);
    doc.setFillColor(...rgb(C.primary));
    doc.roundedRect(px + 18 + nameW, Y + 9, pbw, 14, 3, 3, "F");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(planBadge, px + 24 + nameW, Y + 19);
    // Description
    label(doc, p.desc, px + 14, Y + 32, { size: 7, color: C.textMuted });
    // Price
    value(doc, fmt(p.price) + "/mês", px + prodColW - 14, Y + 44, { size: 9, color: C.text, align: "right" });
  });

  Y += PROD_CARD_H + GAP;

  // Premium benefits note (when K2)
  if (anyK2 || hasVip || hasCS) {
    const PREM_H = bothK2 ? 50 : 38;
    card(doc, M, Y, CW, PREM_H, { fill: C.blueLight, stroke: C.border });
    label(doc, "BENEFÍCIOS PREMIUM", M + 14, Y + 14, { size: 6, bold: true, color: C.blue });
    label(doc, "Ao contratar plano K ou K2, os benefícios premium são estendidos a toda a operação.", M + 14, Y + 26, { size: 7, color: C.text });
    if (bothK2) {
      label(doc, "⚡ Treinamentos acumulados: benefícios de ambos os planos K2 são somados (4 online/ano ou 2 presenciais).", M + 14, Y + 38, { size: 7, color: C.blue, bold: true });
    }
    Y += PREM_H + GAP;
  }

  // ════════════════════════════════════════════════════════════════
  // SECTION 4 — ADD-ONS CONTRATADOS
  // ════════════════════════════════════════════════════════════════
  if (activeAddons.length > 0) {
    if (needsNewPage(Y, 120)) Y = newPage(doc, data);
    Y = section(doc, "Add-ons Contratados", Y);

    const ADDON_H = 40;
    const addonMeta: Record<string, { desc: string; pricing: string }> = {
      leads: { desc: "Gestão automatizada de leads", pricing: "Pré-pago mensal" },
      inteligencia: { desc: "BI de KPIs e analytics avançado", pricing: "Pré-pago mensal" },
      assinatura: { desc: "Assinatura digital embutida", pricing: "Pós-pago por uso" },
      pay: { desc: "Boleto e Split digital embutido", pricing: "Direito do plano" },
      seguros: { desc: "Seguros embutido no boleto", pricing: "Direito do plano" },
    };

    const cols = Math.min(activeAddons.length, 3);
    const addonColW = (CW - (cols - 1) * 8) / cols;

    activeAddons.forEach((a, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const ax = M + col * (addonColW + 8);
      const ay = Y + row * (ADDON_H + 6);
      const meta = addonMeta[a.key] || { desc: "", pricing: "" };
      const price = addonPrices[a.key] || 0;

      card(doc, ax, ay, addonColW, ADDON_H, { fill: C.bgSoft, stroke: C.border });
      // Checkmark dot
      doc.setFillColor(...rgb(C.green));
      doc.circle(ax + 14, ay + 14, 4, "F");
      doc.setFontSize(5);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("✓", ax + 12, ay + 16);

      value(doc, `Kenlo ${a.label}`, ax + 24, ay + 16, { size: 8, color: C.dark });
      label(doc, meta.desc, ax + 14, ay + 28, { size: 6, color: C.textMuted });
      if (price > 0) {
        value(doc, fmt(price) + "/mês", ax + addonColW - 10, ay + 16, { size: 7, color: C.text, align: "right" });
      } else {
        // Draw pricing label right-aligned (only once)
        doc.setFontSize(6);
        doc.setTextColor(...rgb(C.textLight));
        doc.setFont("helvetica", "normal");
        doc.text(meta.pricing, ax + addonColW - 10, ay + 16, { align: "right" });
      }
    });

    const addonRows = Math.ceil(activeAddons.length / 3);
    Y += addonRows * (ADDON_H + 6) + GAP;
  }

  // ════════════════════════════════════════════════════════════════
  // SECTION 5 — FREQUÊNCIA DE PAGAMENTO (once, before comparison)
  // ════════════════════════════════════════════════════════════════
  if (needsNewPage(Y, 100)) Y = newPage(doc, data);
  Y = section(doc, "Frequência de Pagamento", Y);

  const FREQ_OPTIONS = [
    { key: "monthly", label: "Mensal", adj: "+25%", color: C.textMuted },
    { key: "semestral", label: "Semestral", adj: "+11%", color: C.textMuted },
    { key: "annual", label: "Anual", adj: "0%", color: C.green },
    { key: "bienal", label: "Bienal", adj: "−10%", color: C.green },
  ];

  const FREQ_W = (CW - 3 * 8) / 4;
  const FREQ_H = 36;
  FREQ_OPTIONS.forEach((f, i) => {
    const fx = M + i * (FREQ_W + 8);
    const isSelected = f.key === data.paymentPlan?.toLowerCase() ||
      (f.key === "annual" && data.paymentPlan?.toLowerCase() === "anual") ||
      (f.key === "monthly" && data.paymentPlan?.toLowerCase() === "mensal");
    card(doc, fx, Y, FREQ_W, FREQ_H, { selected: isSelected, fill: isSelected ? undefined : C.bgSoft });
    value(doc, f.label, fx + FREQ_W / 2, Y + 16, { size: 9, color: isSelected ? C.primary : C.text, align: "center" });
    // Draw adj text centered (only once)
    doc.setFontSize(8);
    doc.setTextColor(...rgb(isSelected ? C.primary : f.color));
    doc.setFont("helvetica", "bold");
    doc.text(f.adj, fx + FREQ_W / 2, Y + 28, { align: "center" });
  });
  Y += FREQ_H + 6;

  label(doc, "Valores exibidos em base mensal equivalente. Planos mais longos geram economia.", M, Y + 4, { size: 6.5, color: C.textLight });
  Y += 16;

  // ════════════════════════════════════════════════════════════════
  // SECTION 6 — SELEÇÃO vs KOMBOS (comparison table)
  // ════════════════════════════════════════════════════════════════
  if (komboComparison.length > 0) {
    if (needsNewPage(Y, 140)) Y = newPage(doc, data);
    Y = section(doc, "Sua Seleção vs Kombos", Y);

    // Table header
    const TBL_W = CW;
    const COL_NAME_W = TBL_W * 0.35;
    const COL_DISC_W = TBL_W * 0.15;
    const COL_TOTAL_W = TBL_W * 0.25;
    const COL_SAVE_W = TBL_W * 0.25;
    const ROW_H = 22;

    // Header row
    doc.setFillColor(...rgb(C.dark));
    doc.roundedRect(M, Y, TBL_W, ROW_H, 3, 3, "F");
    doc.rect(M, Y + ROW_H / 2, TBL_W, ROW_H / 2, "F"); // square bottom
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Kombo", M + 10, Y + 14);
    doc.text("Desconto", M + COL_NAME_W + 10, Y + 14);
    doc.text("Mensal Equiv.", M + COL_NAME_W + COL_DISC_W + 10, Y + 14);
    doc.text("Economia/mês", M + COL_NAME_W + COL_DISC_W + COL_TOTAL_W + 10, Y + 14);
    Y += ROW_H;

    // "Sua seleção" row (current)
    doc.setFillColor(...rgb(C.primaryLight));
    doc.rect(M, Y, TBL_W, ROW_H, "F");
    divider(doc, Y + ROW_H);
    doc.setFontSize(7);
    doc.setTextColor(...rgb(C.primary));
    doc.setFont("helvetica", "bold");
    doc.text(isKombo ? `✓ ${komboLabel}` : "✓ Sua Seleção Atual", M + 10, Y + 14);
    doc.setTextColor(...rgb(C.dark));
    doc.text(komboDiscount > 0 ? `${komboDiscount}%` : "—", M + COL_NAME_W + 10, Y + 14);
    doc.text(fmt(monthlyRecurring), M + COL_NAME_W + COL_DISC_W + 10, Y + 14);
    doc.setTextColor(...rgb(C.green));
    doc.text("Selecionado", M + COL_NAME_W + COL_DISC_W + COL_TOTAL_W + 10, Y + 14);
    Y += ROW_H;

    // Other kombos
    komboComparison.forEach((k, i) => {
      const isCurrentKombo = k.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_") === normalizedKombo;
      if (isCurrentKombo) return; // skip current selection

      if (i % 2 === 0) {
        doc.setFillColor(...rgb(C.bgSoft));
        doc.rect(M, Y, TBL_W, ROW_H, "F");
      }
      divider(doc, Y + ROW_H);

      doc.setFontSize(7);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text(k.name, M + 10, Y + 14);
      doc.text(`${k.discount}%`, M + COL_NAME_W + 10, Y + 14);
      doc.text(fmt(k.monthlyTotal), M + COL_NAME_W + COL_DISC_W + 10, Y + 14);
      if (k.savings > 0) {
        doc.setTextColor(...rgb(C.green));
        doc.setFont("helvetica", "bold");
        doc.text(`${fmt(k.savings)}/mês`, M + COL_NAME_W + COL_DISC_W + COL_TOTAL_W + 10, Y + 14);
      } else {
        doc.setTextColor(...rgb(C.textLight));
        doc.text("—", M + COL_NAME_W + COL_DISC_W + COL_TOTAL_W + 10, Y + 14);
      }
      Y += ROW_H;
    });

    Y += GAP;
  }

  // ════════════════════════════════════════════════════════════════
  // SECTION 7 — KENLO RECEITA EXTRA (value proof)
  // ════════════════════════════════════════════════════════════════
  if (hasRevenue) {
    if (needsNewPage(Y, 180)) Y = newPage(doc, data);
    Y = section(doc, "Kenlo Receita Extra", Y);

    label(doc, "Pay e Seguros são direitos do plano. O uso é opcional e ativado durante o onboarding, conforme sua estratégia operacional.", M + 10, Y, { size: 6.5, color: C.textMuted });
    Y += 14;

    // Pay card
    const REV_W = CARD_W;
    const REV_H = 80;

    if ((data.revenueFromBoletos || 0) > 0) {
      card(doc, M, Y, REV_W, REV_H, { fill: C.greenLight, stroke: C.greenBorder });
      label(doc, "KENLO PAY", M + 14, Y + 16, { size: 7, bold: true, color: C.green });
      label(doc, "Receita de boletos e split digital", M + 14, Y + 26, { size: 6.5, color: C.textMuted });

      let detY = Y + 38;
      if (data.chargesBoletoToTenant && data.boletoAmount && data.boletoAmount > 0) {
        label(doc, `Boleto cobrado do inquilino: ${fmt(data.boletoAmount)}`, M + 14, detY, { size: 6.5, color: C.text });
        detY += 9;
        const boletoRev = (data.contracts || 0) * data.boletoAmount;
        label(doc, `${fmtNum(data.contracts || 0)} contratos × ${fmt(data.boletoAmount)} = ${fmt(boletoRev)}`, M + 14, detY, { size: 6, color: C.textMuted });
        detY += 9;
      }
      if (data.chargesSplitToOwner && data.splitAmount && data.splitAmount > 0) {
        label(doc, `Split cobrado do proprietário: ${fmt(data.splitAmount)}`, M + 14, detY, { size: 6.5, color: C.text });
        detY += 9;
        const splitRev = (data.contracts || 0) * data.splitAmount;
        label(doc, `${fmtNum(data.contracts || 0)} contratos × ${fmt(data.splitAmount)} = ${fmt(splitRev)}`, M + 14, detY, { size: 6, color: C.textMuted });
      }

      value(doc, `+ ${fmt(data.revenueFromBoletos || 0)}/mês`, M + REV_W - 14, Y + REV_H - 12, { size: 11, color: C.green, align: "right" });
    }

    // Seguros card
    if ((data.revenueFromInsurance || 0) > 0) {
      const sx = M + REV_W + GAP;
      card(doc, sx, Y, REV_W, REV_H, { fill: C.greenLight, stroke: C.greenBorder });
      label(doc, "KENLO SEGUROS", sx + 14, Y + 16, { size: 7, bold: true, color: C.green });
      label(doc, "Seguros embutido no boleto de locação", sx + 14, Y + 26, { size: 6.5, color: C.textMuted });
      label(doc, "Ganho mínimo: R$ 10,00 por contrato/mês", sx + 14, Y + 38, { size: 6.5, color: C.text });
      label(doc, `${fmtNum(data.contracts || 0)} contratos × R$ 10,00 = ${fmt(data.revenueFromInsurance || 0)}`, sx + 14, Y + 48, { size: 6, color: C.textMuted });
      value(doc, `+ ${fmt(data.revenueFromInsurance || 0)}/mês`, sx + REV_W - 14, Y + REV_H - 12, { size: 11, color: C.green, align: "right" });
    }

    Y += REV_H + GAP;
  }

  // ════════════════════════════════════════════════════════════════
  // SECTION 8 — INVESTIMENTO TOTAL
  // ════════════════════════════════════════════════════════════════
  if (needsNewPage(Y, 260)) Y = newPage(doc, data);
  Y = section(doc, "Investimento Total", Y);

  // Fixed costs card
  const INV_H = 160;
  card(doc, M, Y, CW, INV_H, { fill: C.bgSoft, stroke: C.border });

  let iY = Y + 14;

  // Sub-header: Custos Fixos (Pré-pago)
  label(doc, "CUSTOS FIXOS (PRÉ-PAGO)", M + 14, iY, { size: 7, bold: true, color: C.dark });
  iY += 14;

  // Product lines
  if (showImob && data.imobPrice !== undefined) {
    label(doc, `Kenlo IMOB – ${(data.imobPlan || "K").toUpperCase()}`, M + 14, iY, { size: 7, color: C.text });
    value(doc, fmt(data.imobPrice), M + CW - 14, iY, { size: 7, color: C.text, align: "right" });
    iY += 12;
  }
  if (showLoc && data.locPrice !== undefined) {
    label(doc, `Kenlo Locação – ${(data.locPlan || "K").toUpperCase()}`, M + 14, iY, { size: 7, color: C.text });
    value(doc, fmt(data.locPrice), M + CW - 14, iY, { size: 7, color: C.text, align: "right" });
    iY += 12;
  }

  // Add-on lines
  const paidAddons = Object.entries(addonPrices).filter(([_, p]) => p > 0);
  const addonNameMap: Record<string, string> = {
    leads: "Kenlo Leads", inteligencia: "Kenlo Inteligência",
    assinatura: "Kenlo Assinatura", pay: "Kenlo Pay", seguros: "Kenlo Seguros",
  };
  for (const [key, price] of paidAddons) {
    label(doc, addonNameMap[key] || key, M + 14, iY, { size: 7, color: C.text });
    value(doc, fmt(price), M + CW - 14, iY, { size: 7, color: C.text, align: "right" });
    iY += 12;
  }

  // VIP / CS
  if (hasVip) {
    const vipVal = data.vipIncluded ? "Incluído" : fmt(data.vipPrice || 97);
    label(doc, "Suporte VIP", M + 14, iY, { size: 7, color: C.text });
    value(doc, vipVal, M + CW - 14, iY, { size: 7, color: data.vipIncluded ? C.green : C.text, align: "right" });
    iY += 12;
  }
  if (hasCS) {
    const csVal = data.csIncluded ? "Incluído" : fmt(data.csPrice || 197);
    label(doc, "CS Dedicado", M + 14, iY, { size: 7, color: C.text });
    value(doc, csVal, M + CW - 14, iY, { size: 7, color: data.csIncluded ? C.green : C.text, align: "right" });
    iY += 12;
  }

  // K2 Training
  if (anyK2) {
    const trainText = bothK2
      ? "4 Treinamentos Online ou 2 Presenciais"
      : "2 Treinamentos Online ou 1 Presencial";
    label(doc, trainText, M + 14, iY, { size: 7, color: C.text });
    value(doc, "Incluído", M + CW - 14, iY, { size: 7, color: C.green, align: "right" });
    iY += 12;
  }

  // Divider before totals
  iY += 4;
  divider(doc, iY, M + 10, M + CW - 10);
  iY += 10;

  // Total mensal
  label(doc, "Total Mensal Equivalente", M + 14, iY, { size: 8, bold: true, color: C.dark });
  value(doc, fmt(monthlyRecurring), M + CW - 14, iY, { size: 10, color: C.dark, align: "right" });
  iY += 16;

  // Implantação
  label(doc, "Implantação (única vez)", M + 14, iY, { size: 7, color: C.text });
  value(doc, fmt(data.implantationFee), M + CW - 14, iY, { size: 7, color: C.text, align: "right" });
  iY += 14;

  // Payment condition
  let payCondition = `${installments}x ${fmt(installmentValue)}`;
  const normPlan = data.paymentPlan?.toLowerCase() || "annual";
  if (normPlan === "monthly" || normPlan === "mensal") {
    payCondition = `Cobrado mensalmente — ${fmt(data.totalMonthly || installmentValue)}/mês`;
  } else if (normPlan === "semestral") {
    payCondition = `Pago semestralmente — ${fmt((data.totalMonthly || 0) * 6)} a cada 6 meses`;
  } else if (normPlan === "annual" || normPlan === "anual") {
    payCondition = `${installments}x ${fmt(installmentValue)} (anual)`;
  } else if (normPlan === "bienal") {
    payCondition = `${installments}x ${fmt(installmentValue)} (bienal — 24 meses)`;
  }

  label(doc, "Condição de Pagamento", M + 14, iY, { size: 7, bold: true, color: C.dark });
  // Draw payment condition right-aligned (only once)
  doc.setFontSize(7);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", "normal");
  doc.text(payCondition, M + CW - 14, iY, { align: "right" });

  Y += INV_H + GAP;

  // Variable costs card (if post-paid exists)
  if (hasPostPaid) {
    const VAR_H = 50;
    card(doc, M, Y, CW, VAR_H, { fill: C.bgSoft, stroke: C.border });
    label(doc, "CUSTOS VARIÁVEIS (PÓS-PAGO ESTIMADO)", M + 14, Y + 14, { size: 7, bold: true, color: C.dark });
    label(doc, "Sem surpresas — só o que você usar além do incluído no plano.", M + 14, Y + 26, { size: 6.5, color: C.textMuted });
    value(doc, fmt(data.postPaidTotal || 0) + "/mês", M + CW - 14, Y + 38, { size: 9, color: C.text, align: "right" });
    Y += VAR_H + GAP;
  }

  // Net gain summary (if revenue exists)
  if (hasRevenue) {
    const totalRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
    const netGain = data.netGain || totalRevenue - monthlyRecurring - (data.postPaidTotal || 0);
    const isPositive = netGain > 0;

    if (needsNewPage(Y, 100)) Y = newPage(doc, data);

    const NET_H = 60;
    card(doc, M, Y, CW, NET_H, {
      fill: isPositive ? C.greenLight : "#FEF2F2",
      stroke: isPositive ? C.greenBorder : "#FCA5A5",
      lw: 1.5,
    });

    value(doc, "Ganho Líquido Mensal Estimado", M + CW / 2, Y + 18, { size: 9, color: C.dark, align: "center" });

    doc.setFontSize(22);
    doc.setTextColor(...rgb(isPositive ? C.green : "#EF4444"));
    doc.setFont("helvetica", "bold");
    doc.text(fmt(netGain), M + CW / 2, Y + 42, { align: "center" });

    // Draw subtitle centered (only once)
    const subtitleText = isPositive
      ? "Receita extra supera o investimento na plataforma"
      : "Investimento na plataforma supera receita extra";
    doc.setFontSize(6.5);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
    doc.text(subtitleText, M + CW / 2, Y + 54, { align: "center" });

    Y += NET_H + 6;

    // ROI indicators
    if (isPositive && monthlyRecurring > 0) {
      const roiPercent = ((totalRevenue / monthlyRecurring) * 100 - 100).toFixed(0);
      const paybackMonths = monthlyRecurring > 0 ? Math.ceil((data.implantationFee || 0) / netGain) : 0;
      const annualGain = netGain * 12;

      const IND_W = (CW - 16) / 3;
      const IND_H = 44;

      // ROI
      card(doc, M, Y, IND_W, IND_H, { fill: C.bgSoft });
      value(doc, `${roiPercent}%`, M + IND_W / 2, Y + 20, { size: 16, color: C.green, align: "center" });
      doc.setFontSize(6);
      doc.setTextColor(...rgb(C.textMuted));
      doc.setFont("helvetica", "normal");
      doc.text("ROI Receita vs Investimento", M + IND_W / 2, Y + 34, { align: "center" });

      // Payback
      const px = M + IND_W + 8;
      card(doc, px, Y, IND_W, IND_H, { fill: C.bgSoft });
      value(doc, `${paybackMonths} meses`, px + IND_W / 2, Y + 20, { size: 14, color: C.blue, align: "center" });
      doc.setFontSize(6);
      doc.setTextColor(...rgb(C.textMuted));
      doc.setFont("helvetica", "normal");
      doc.text("Payback da Implantação", px + IND_W / 2, Y + 34, { align: "center" });

      // Annual gain
      const ax = M + (IND_W + 8) * 2;
      card(doc, ax, Y, IND_W, IND_H, { fill: C.bgSoft });
      value(doc, fmt(annualGain), ax + IND_W / 2, Y + 20, { size: 12, color: C.green, align: "center" });
      doc.setFontSize(6);
      doc.setTextColor(...rgb(C.textMuted));
      doc.setFont("helvetica", "normal");
      doc.text("Ganho Anual Estimado", ax + IND_W / 2, Y + 34, { align: "center" });

      Y += IND_H + 6;

      // Disclaimer
      label(doc, "Estimativas baseadas nas informações declaradas pelo cliente. Os resultados podem variar conforme uso efetivo da plataforma.", M, Y + 3, { size: 5, color: C.textLight });
      Y += 12;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // SECTION 9 — CONCLUSÃO
  // ════════════════════════════════════════════════════════════════
  if (needsNewPage(Y, 80)) Y = newPage(doc, data);

  Y += 10;
  const CONC_H = 50;
  card(doc, M, Y, CW, CONC_H, { fill: C.dark, stroke: C.dark });
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Kenlo — Quem usa, lidera.", M + CW / 2, Y + 22, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(...rgb("#CBD5E1"));
  doc.setFont("helvetica", "normal");
  doc.text("A Kenlo é a única plataforma que pode se pagar enquanto você usa.", M + CW / 2, Y + 36, { align: "center" });

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
