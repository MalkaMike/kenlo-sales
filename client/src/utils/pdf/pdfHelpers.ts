/**
 * Shared types, constants, and helper functions for PDF generation.
 */

import type { jsPDF } from "jspdf";

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
  frequencyComparison?: string;
  /** Selected columns data from KomboComparisonTable (up to 3) */
  selectedColumnsJson?: string;
}

// ── Layout Constants ────────────────────────────────────────────
export const PW = 595.28;
export const PH = 841.89;
export const M = 40;
export const CW = PW - M * 2;
export const MAX_Y = PH - 50;

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

// ── Formatters ──────────────────────────────────────────────────
export const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(v);

export const fmtNum = (v: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v);

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
  // Footer
  doc.setFontSize(6);
  doc.setTextColor(...rgb(C.textLight));
  doc.setFont("helvetica", "normal");
  doc.text(`${data.agencyName || "Cliente"} — Proposta Comercial Kenlo`, M, PH - 20);
  return 30;
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
