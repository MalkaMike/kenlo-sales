/**
 * Shared types, constants, and helper functions for PDF generation.
 */

import type { jsPDF } from "jspdf";
import { KENLO_LOGO_RED_BASE64 } from "../kenloLogoBase64";

// ── Data Interface ──────────────────────────────────────────────
export interface ProposalPrintData {
  vendorName: string;
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
  frequencyComparison?: string;
  /** Selected columns data from KomboComparisonTable (up to 3) */
  selectedColumnsJson?: string;
  /** Price breakdown: monthly price before any discounts (mensal reference) */
  monthlyBeforeDiscounts?: number;
  /** Price breakdown: kombo discount amount (negative) */
  komboDiscountAmount?: number;
  /** Price breakdown: cycle discount amount (negative) */
  cycleDiscountAmount?: number;
}

// ── Layout Constants ────────────────────────────────────────────
export const PW = 595.28;
export const PH = 841.89;
export const M = 40;
export const CW = PW - M * 2;
export const MAX_Y = PH - 58;

// ── Color Palette ───────────────────────────────────────────────
export const C = {
  primary: "#E11D48",
  primaryLight: "#FFF1F2",
  green: "#059669",
  greenLight: "#ECFDF5",
  dark: "#0F172A",
  text: "#334155",
  textMuted: "#64748B",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  bg: "#FFFFFF",
  bgSoft: "#F8FAFC",
} as const;

// ── Formatters (re-exported from shared) ────────────────────────
export { fmt, fmtNum } from "@shared/formatters";

// ── Display Maps ────────────────────────────────────────────────
export const cycleMap: Record<string, string> = {
  monthly: "Mensal",
  semestral: "Semestral",
  annual: "Anual",
  biennial: "Bienal",
};

export const businessTypeMap: Record<string, string> = {
  broker: "Corretora",
  rental_admin: "Administradora de Locação",
  both: "Corretora + Administradora",
};

export const addonNameMap: Record<string, string> = {
  leads: "Kenlo Leads",
  inteligencia: "Kenlo Inteligência",
  assinatura: "Kenlo Assinatura",
  pay: "Kenlo Pay",
  seguros: "Kenlo Seguros",
  cash: "Kenlo Cash",
};

export const allAddonKeys = ["leads", "inteligencia", "assinatura", "pay", "seguros", "cash"];

// ── Drawing Helpers ─────────────────────────────────────────────
export function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

export function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...rgb(C.primary));
  doc.rect(M, y, 3, 10, "F");
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(title, M + 10, y + 8);
  return y + 20;
}

export function divider(doc: jsPDF, y: number) {
  doc.setDrawColor(...rgb(C.border));
  doc.setLineWidth(0.3);
  doc.line(M, y, M + CW, y);
}

export function needsNewPage(y: number, needed: number): boolean {
  return y + needed > MAX_Y;
}

export function newPage(doc: jsPDF, data: ProposalPrintData): number {
  doc.addPage();
  // Top accent
  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, 0, PW, 2, "F");
  // Kenlo logo — top-left header
  const logoW = 60;
  const logoH = 18;
  doc.addImage(KENLO_LOGO_RED_BASE64, "PNG", M, 8, logoW, logoH);
  // Footer
  renderPageFooter(doc, data);
  return 38;
}

/** Shared footer renderer — vendor contact on the left, proposal label on the right, page number centered */
export function renderPageFooter(doc: jsPDF, data: ProposalPrintData): void {
  const footerY = PH - 28;

  // Thin divider line above footer
  doc.setDrawColor(...rgb(C.border));
  doc.setLineWidth(0.3);
  doc.line(M, footerY, M + CW, footerY);

  // Left side: vendor info
  const parts: string[] = [];
  if (data.vendorName) parts.push(data.vendorName);
  if (data.vendorEmail) parts.push(data.vendorEmail);
  if (data.vendorPhone) parts.push(data.vendorPhone);
  const sellerLine = parts.join("  \u00b7  ");

  doc.setFontSize(5.5);
  doc.setTextColor(...rgb(C.textLight));
  doc.setFont("helvetica", "normal");
  if (sellerLine) {
    doc.text(sellerLine, M, footerY + 10);
  }

  // Right side: proposal label
  const proposalLabel = `${data.agencyName || "Cliente"} \u2014 Proposta Comercial Kenlo`;
  doc.text(proposalLabel, M + CW, footerY + 10, { align: "right" });
}

/**
 * Add page numbers to all pages after the PDF is fully built.
 * Call this once at the end, after all sections are rendered.
 * Cover page (page 1) is excluded from numbering.
 */
export function addPageNumbers(doc: jsPDF): void {
  const totalPages = doc.getNumberOfPages();
  // Skip cover (page 1), number content pages starting from 1
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6);
    doc.setTextColor(...rgb(C.textLight));
    doc.setFont("helvetica", "normal");
    const label = `P\u00e1gina ${i - 1} de ${totalPages - 1}`;
    doc.text(label, PW / 2, PH - 18, { align: "center" });
  }
}

// ── Parse Helpers ───────────────────────────────────────────────
export function parseAddons(raw: string | string[]): string[] {
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

export function parseAddonPrices(raw?: string | Record<string, number>): Record<string, number> {
  if (!raw) return {};
  if (typeof raw === "object") return raw as Record<string, number>;
  try { return JSON.parse(raw); } catch { return {}; }
}

// ── Derived Flags Helper ────────────────────────────────────────
export function getDerivedFlags(data: ProposalPrintData) {
  const showImob = ["imob", "both", "imob_loc", "ambos"].includes(data.productType?.toLowerCase() || "");
  const showLoc = ["loc", "both", "imob_loc", "ambos", "locacao"].includes(data.productType?.toLowerCase() || "");
  const selAddons = parseAddons(data.selectedAddons);
  const addonPrices = parseAddonPrices(data.addonPrices);
  const imobPlanKey = (data.imobPlan || "k").toLowerCase();
  const locPlanKey = (data.locPlan || "k").toLowerCase();
  const cycleDisplay = cycleMap[data.paymentPlan] || "Anual";
  const businessTypeDisplay = businessTypeMap[data.businessType || "broker"] || "Corretora";
  const hasRevenue = (data.revenueFromBoletos || 0) > 0 || (data.revenueFromInsurance || 0) > 0;
  const notSelectedAddons = allAddonKeys.filter(k => !selAddons.includes(k));

  return {
    showImob, showLoc, selAddons, addonPrices,
    imobPlanKey, locPlanKey, cycleDisplay, businessTypeDisplay,
    hasRevenue, notSelectedAddons,
  };
}
