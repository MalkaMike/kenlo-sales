/**
 * Shared types, constants, and helpers for server-side PDF generation.
 */

import PDFDocument from "pdfkit";

// ── Data interfaces ─────────────────────────────────────────────
export interface PostPaidItem {
  label: string;
  included: number;
  additional: number;
  total: number;
  perUnit: number;
  unitLabel: string;
}

export interface PostPaidGroup {
  groupLabel: string;
  groupTotal: number;
  items: PostPaidItem[];
}

export interface PostPaidBreakdown {
  imobAddons?: PostPaidGroup;
  locAddons?: PostPaidGroup;
  sharedAddons?: PostPaidGroup;
  total: number;
}

export interface ProposalData {
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorRole?: string;
  clientName: string;
  agencyName?: string;
  productType: string;
  komboName?: string;
  komboDiscount?: number;
  imobPlan?: string;
  locPlan?: string;
  imobUsers?: number;
  closings?: number;
  contracts?: number;
  newContracts?: number;
  leadsPerMonth?: number;
  usesExternalAI?: boolean;
  wantsWhatsApp?: boolean;
  chargesSplitToOwner?: boolean;
  chargesBoletoToTenant?: boolean;
  boletoAmount?: number;
  splitAmount?: number;
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
  businessType?: string;
  hasWebsite?: boolean;
  websiteUrl?: string;
  hasCRM?: boolean;
  crmSystem?: string;
  hasERP?: boolean;
  erpSystem?: string;
  email?: string;
  cellphone?: string;
  landline?: string;
  imobPrice?: number;
  locPrice?: number;
  addonPrices?: string;
  vipIncluded?: boolean;
  csIncluded?: boolean;
  vipPrice?: number;
  csPrice?: number;
  postPaidBreakdown?: string;
}

// ── Design-system colors ────────────────────────────────────────
export const C = {
  primary: "#E11D48",
  primaryLight: "#FFF1F2",
  green: "#059669",
  greenLight: "#ECFDF5",
  greenBorder: "#A7F3D0",
  dark: "#0F172A",
  text: "#334155",
  textMuted: "#64748B",
  textLight: "#94A3B8",
  border: "#E2E8F0",
  bg: "#FFFFFF",
  bgSoft: "#F8FAFC",
  red: "#DC2626",
} as const;

// Revenue card colors
export const RC = {
  payBg: "#F0FDF4",
  payBorder: "#86EFAC",
  payAccent: "#059669",
  payIcon: "#10B981",
  segBg: "#EFF6FF",
  segBorder: "#93C5FD",
  segAccent: "#2563EB",
  segIcon: "#3B82F6",
  cashBg: "#FAF5FF",
  cashBorder: "#C4B5FD",
  cashAccent: "#7C3AED",
  cashIcon: "#8B5CF6",
  summaryBg: "#FFF7ED",
  summaryBorder: "#FED7AA",
  summaryAccent: "#EA580C",
} as const;

// ── Page constants ──────────────────────────────────────────────
export const PW = 595.28;
export const PH = 841.89;
export const M = 40;
export const CW = PW - M * 2;
export const GAP = 10;
export const MAX_Y = PH - 40;

// ── Formatters (re-exported from shared) ────────────────────────
export { fmt, fmtNum } from "@shared/formatters";

// ── Typography helpers ──────────────────────────────────────────
export const h1 = (doc: PDFKit.PDFDocument, text: string, x: number, y: number, maxW?: number): number => {
  doc.rect(x, y, 3, 13).fill(C.primary);
  doc.fontSize(10).fillColor(C.dark).font("Helvetica-Bold")
    .text(text, x + 8, y + 1, { width: maxW || CW, lineBreak: false });
  return y + 18;
};

export const h2 = (doc: PDFKit.PDFDocument, text: string, x: number, y: number): number => {
  doc.fontSize(7.5).fillColor(C.textMuted).font("Helvetica-Bold")
    .text(text.toUpperCase(), x, y, { lineBreak: false });
  return y + 12;
};

export const label = (doc: PDFKit.PDFDocument, text: string, x: number, y: number, opts: { color?: string; size?: number; bold?: boolean } = {}) => {
  doc.fontSize(opts.size ?? 6.5).fillColor(opts.color ?? C.textMuted).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
    .text(text, x, y, { lineBreak: false });
};

export const value = (doc: PDFKit.PDFDocument, text: string, x: number, y: number, opts: { color?: string; size?: number } = {}) => {
  doc.fontSize(opts.size ?? 8.5).fillColor(opts.color ?? C.dark).font("Helvetica-Bold")
    .text(text, x, y, { lineBreak: false });
};

export const labelValue = (doc: PDFKit.PDFDocument, lbl: string, val: string, x: number, y: number, _w: number): number => {
  label(doc, lbl, x, y);
  value(doc, val, x, y + 9);
  return y + 24;
};

export const divider = (doc: PDFKit.PDFDocument, x: number, y: number, w: number) => {
  doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.3).strokeColor(C.border).stroke();
};

export const newPage = (doc: PDFKit.PDFDocument, data: ProposalData): number => {
  doc.addPage();
  doc.rect(0, 0, PW, 3).fill(C.primary);
  const footerName = data.agencyName || data.clientName || "";
  doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
    .text(`${footerName} — Proposta Comercial`, M, PH - 18, { lineBreak: false });
  return 20;
};

// ── Parse helpers ───────────────────────────────────────────────
export const parseAddons = (raw: string): string[] => {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((a: string) => a.trim().toLowerCase());
    return raw.split(",").map((a) => a.trim().toLowerCase());
  } catch {
    return raw.split(",").map((a) => a.trim().toLowerCase());
  }
};

export const parseAddonPrices = (raw?: string): Record<string, number> => {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
};

export const parsePostPaid = (raw?: string): PostPaidBreakdown | null => {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

export const getAddonDescription = (addonLabel: string): string => {
  const descriptions: Record<string, string> = {
    "Leads": "Distribuição automática e gestão inteligente de leads.",
    "Inteligência": "Dashboards estratégicos com Google Looker.",
    "Assinatura": "Assinatura digital embutida na plataforma.",
    "Pay": "Boleto e Split digital embutido na plataforma.",
    "Seguros": "Seguros embutido no boleto — ganhe R$10/contrato/mês.",
    "Cash": "Antecipe até 24 meses de aluguel para proprietários.",
  };
  return descriptions[addonLabel] || "";
};

// ── Addon label map ─────────────────────────────────────────────
export const ADDON_LABELS = [
  { key: "leads", label: "Leads" },
  { key: "inteligencia", label: "Inteligência" },
  { key: "assinatura", label: "Assinatura" },
  { key: "pay", label: "Pay" },
  { key: "seguros", label: "Seguros" },
  { key: "cash", label: "Cash" },
];

// ── Frequency map ───────────────────────────────────────────────
export const FREQ_MAP: Record<string, { label: string; discount: string }> = {
  monthly: { label: "Mensal", discount: "" },
  mensal: { label: "Mensal", discount: "" },
  semestral: { label: "Semestral", discount: "–10%" },
  annual: { label: "Anual", discount: "–20%" },
  anual: { label: "Anual", discount: "–20%" },
  bienal: { label: "Bienal", discount: "–25%" },
};

// ── Kombo display map ───────────────────────────────────────────
export const KOMBO_DISPLAY_MAP: Record<string, string> = {
  sem_kombo: "", imob_start: "Kombo Imob Start", imob_pro: "Kombo Imob Pro",
  locacao_pro: "Kombo Loc Pro", core_gestao: "Kombo Core Gestão", elite: "Kombo Elite",
};

// ── Derived data builder ────────────────────────────────────────
export interface DerivedData {
  showImob: boolean;
  showLoc: boolean;
  selAddons: string[];
  addonPrices: Record<string, number>;
  ppBreakdown: PostPaidBreakdown | null;
  installments: number;
  imobIsK2: boolean;
  locIsK2: boolean;
  anyK2: boolean;
  bothK2: boolean;
  hasVip: boolean;
  hasCS: boolean;
  hasRevenue: boolean;
  komboLabel: string;
  isKombo: boolean;
  activeAddons: { key: string; label: string }[];
  inactiveAddons: { key: string; label: string }[];
  freqInfo: { label: string; discount: string };
  showCoretagem: boolean;
  showAdministracao: boolean;
}

export function buildDerivedData(data: ProposalData): DerivedData {
  const normalizedProductType = data.productType?.toLowerCase().trim() || "";
  const showImob = ["imob", "both", "imob_loc", "ambos"].includes(normalizedProductType);
  const showLoc = ["loc", "both", "imob_loc", "ambos"].includes(normalizedProductType);
  const selAddons = parseAddons(data.selectedAddons);
  const addonPricesMap = parseAddonPrices(data.addonPrices);
  const ppBreakdown = parsePostPaid(data.postPaidBreakdown);
  const installments = data.installments || 1;

  const imobIsK2 = showImob && data.imobPlan?.toLowerCase() === "k2";
  const locIsK2 = showLoc && data.locPlan?.toLowerCase() === "k2";
  const anyK2 = imobIsK2 || locIsK2;
  const bothK2 = imobIsK2 && locIsK2;

  const hasVip = data.vipIncluded || (data.vipPrice !== undefined && data.vipPrice > 0);
  const hasCS = data.csIncluded || (data.csPrice !== undefined && data.csPrice > 0);
  const hasRevenue = (data.revenueFromBoletos || 0) > 0 || (data.revenueFromInsurance || 0) > 0;

  const rawKombo = data.komboName || "";
  const normalizedKombo = rawKombo.toLowerCase().replace(/^kombo\s+/i, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
  const komboLabel = KOMBO_DISPLAY_MAP[normalizedKombo] || rawKombo;
  const isKombo = komboLabel !== "";

  const activeAddons = ADDON_LABELS.filter(a => selAddons.includes(a.key));
  const inactiveAddons = ADDON_LABELS.filter(a => !selAddons.includes(a.key));

  const normPlan = data.paymentPlan?.toLowerCase() || "annual";
  const freqInfo = FREQ_MAP[normPlan] || { label: "Anual", discount: "–20%" };

  const normalizedBizType = (data.businessType || "").toLowerCase();
  const showCoretagem = normalizedBizType === "both" || normalizedBizType === "ambos" || normalizedBizType === "corretora";
  const showAdministracao = normalizedBizType === "both" || normalizedBizType === "ambos" || normalizedBizType === "administradora";

  return {
    showImob, showLoc, selAddons, addonPrices: addonPricesMap, ppBreakdown, installments,
    imobIsK2, locIsK2, anyK2, bothK2, hasVip, hasCS, hasRevenue,
    komboLabel, isKombo, activeAddons, inactiveAddons, freqInfo,
    showCoretagem, showAdministracao,
  };
}
