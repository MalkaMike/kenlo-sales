/**
 * Client-side PDF generation — Executive Redesign v3
 *
 * MANDATORY 8-SECTION STRUCTURE (answers 4 key questions):
 *   1. Capa (cover)
 *   2. Perfil Operacional do Cliente (grid, not prose)
 *   3. Estrutura Contratada (cycle + products with "&" + add-ons as bullets)
 *   4. Investimento Contratual (REAL value charged in selected cycle — never monthly equivalent)
 *   5. Escopo Incluído na Contratação (explicit bullets)
 *   6. Serviços Premium Ativados (clear status: Incluído or —)
 *   7. Funcionalidades da Plataforma (table with ✔ and —, side-by-side if 2 products)
 *   8. Potencial de Receita Extra (only if applicable)
 *
 * ABSOLUTE RULES:
 * ❌ No blank pages
 * ❌ No repeating discount explanation
 * ❌ No mixing equivalent value with charged value
 * ❌ No didactic texts about cycle
 * ❌ No repeated "Incluído no plano"
 */

import { jsPDF } from "jspdf";
import { KENLO_LOGO_WHITE_BASE64, KENLO_LOGO_RED_BASE64 } from "./kenloLogoBase64";
import { getAllFeatures, type PlanTier } from "../../../shared/pricing-config";

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

// ── Constants ───────────────────────────────────────────────────
const PW = 595.28;
const PH = 841.89;
const M = 40;
const CW = PW - M * 2;
const MAX_Y = PH - 50;

const C = {
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

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(...rgb(C.primary));
  doc.rect(M, y, 3, 10, "F");
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(title, M + 10, y + 8);
  return y + 20;
}

function divider(doc: jsPDF, y: number) {
  doc.setDrawColor(...rgb(C.border));
  doc.setLineWidth(0.3);
  doc.line(M, y, M + CW, y);
}

function needsNewPage(y: number, needed: number): boolean {
  return y + needed > MAX_Y;
}

function newPage(doc: jsPDF, data: ProposalPrintData): number {
  doc.addPage();
  // Top accent
  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, 0, PW, 2, "F");
  // Footer
  doc.setFontSize(6);
  doc.setTextColor(...rgb(C.textLight));
  doc.setFont("helvetica", "normal");
  doc.text(`${data.agencyName || "Cliente"} — Proposta Comercial Kenlo`, M, PH - 20);
  // Consultant info removed from internal pages (only on cover)
  return 30;
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

// ══════════════════════════════════════════════════════════════════
// MAIN PDF GENERATION
// ══════════════════════════════════════════════════════════════════
export async function generateProposalPDFClient(
  data: ProposalPrintData
): Promise<{ blob: Blob; filename: string }> {
  console.log('[PDF_GEN] Starting generateProposalPDFClient', { hasSelectedColumns: !!data.selectedColumnsJson });
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  // ── Derived flags ──────────────────────────────────────────────
  const showImob = ["imob", "both", "imob_loc", "ambos"].includes(data.productType?.toLowerCase() || "");
  const showLoc = ["loc", "both", "imob_loc", "ambos", "locacao"].includes(data.productType?.toLowerCase() || "");
  const selAddons = parseAddons(data.selectedAddons);
  const addonPrices = parseAddonPrices(data.addonPrices);
  
  const imobPlanKey = (data.imobPlan || "k").toLowerCase() as PlanTier;
  const locPlanKey = (data.locPlan || "k").toLowerCase() as PlanTier;

  const hasRevenue = (data.revenueFromBoletos || 0) > 0 || (data.revenueFromInsurance || 0) > 0;

  // Payment cycle display
  const cycleMap: Record<string, string> = {
    monthly: "Mensal",
    semestral: "Semestral",
    annual: "Anual",
    biennial: "Bienal",
  };
  const cycleDisplay = cycleMap[data.paymentPlan] || "Anual";

  // Business type
  const businessTypeMap: Record<string, string> = {
    broker: "Corretora",
    rental_admin: "Administradora de Locação",
    both: "Corretora + Administradora",
  };
  const businessTypeDisplay = businessTypeMap[data.businessType || "broker"] || "Corretora";

  // ══════════════════════════════════════════════════════════════════
  // SECTION 1: CAPA
  // ══════════════════════════════════════════════════════════════════
  doc.setFillColor(...rgb(C.primary));
  doc.rect(0, 0, PW, PH, "F");
  
  // Logo
  doc.addImage(KENLO_LOGO_WHITE_BASE64, "PNG", M, 60, 80, 24);
  
  // Title
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Proposta Comercial", M, 160);
  
  // Client info
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(data.agencyName || "Cliente", M, 200);
  doc.text(data.clientName || "", M, 220);
  
  // Footer info
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Consultor: ${data.salesPersonName}`, M, PH - 100);
  if (data.vendorEmail) doc.text(data.vendorEmail, M, PH - 85);
  if (data.vendorPhone) doc.text(data.vendorPhone, M, PH - 70);
  
  const today = new Date().toLocaleDateString("pt-BR");
  doc.text(`Data: ${today}`, M, PH - 50);
  if (data.validityDays) {
    doc.text(`Validade: ${data.validityDays} dias`, M, PH - 35);
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 2: PERFIL OPERACIONAL DO CLIENTE
  // ══════════════════════════════════════════════════════════════════
  let Y = newPage(doc, data);
  Y = sectionTitle(doc, "Perfil Operacional do Cliente", Y);

  const gridData: Array<{ label: string; value: string }> = [
    { label: "Razão Social", value: data.agencyName || "—" },
    { label: "Proprietário", value: data.clientName || "—" },
    { label: "Natureza do Negócio", value: businessTypeDisplay },
    { label: "Email", value: data.email || "—" },
    { label: "Celular", value: data.cellphone || "—" },
  ];

  if (showImob) {
    gridData.push({ label: "Usuários (Vendas)", value: data.imobUsers ? fmtNum(data.imobUsers) : "—" });
    gridData.push({ label: "Fechamentos/mês", value: data.closings ? fmtNum(data.closings) : "—" });
    gridData.push({ label: "Leads/mês", value: data.leadsPerMonth ? fmtNum(data.leadsPerMonth) : "—" });
  }
  if (showLoc) {
    gridData.push({ label: "Contratos sob gestão", value: data.contracts ? fmtNum(data.contracts) : "—" });
    gridData.push({ label: "Novos contratos/mês", value: data.newContracts ? fmtNum(data.newContracts) : "—" });
  }

  // Render as 2-column grid
  const colW = CW / 2 - 10;
  let row = 0;
  for (let i = 0; i < gridData.length; i++) {
    const col = i % 2;
    const x = M + col * (colW + 20);
    const y = Y + row * 18;
    
    doc.setFontSize(7);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
    doc.text(gridData[i].label, x, y);
    
    doc.setFontSize(9);
    doc.setTextColor(...rgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text(gridData[i].value, x, y + 10);
    
    if (col === 1) row++;
  }
  Y += Math.ceil(gridData.length / 2) * 18 + 10;

  // ══════════════════════════════════════════════════════════════════
  // SECTION 3: ESTRUTURA CONTRATADA
  // ══════════════════════════════════════════════════════════════════
  if (needsNewPage(Y, 120)) Y = newPage(doc, data);
  Y = sectionTitle(doc, "Estrutura Contratada", Y);

  // Cycle
  doc.setFontSize(8);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text("Ciclo de Pagamento", M, Y);
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.primary));
  doc.setFont("helvetica", "bold");
  doc.text(cycleDisplay, M, Y + 12);
  Y += 26;

  // Products
  doc.setFontSize(8);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text("Produtos", M, Y);
  
  let productsLine = "";
  if (showImob && showLoc) {
    productsLine = `Kenlo Imob (${(data.imobPlan || "K").toUpperCase()}) & Kenlo Locação (${(data.locPlan || "K").toUpperCase()})`;
  } else if (showImob) {
    productsLine = `Kenlo Imob (${(data.imobPlan || "K").toUpperCase()})`;
  } else if (showLoc) {
    productsLine = `Kenlo Locação (${(data.locPlan || "K").toUpperCase()})`;
  }
  
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text(productsLine, M, Y + 12);
  Y += 26;

  // Kombo (if any)
  if (data.komboName && data.komboName !== "Sem Kombo") {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
    doc.text("Kombo Ativo", M, Y);
    
    doc.setFontSize(10);
    doc.setTextColor(...rgb(C.primary));
    doc.setFont("helvetica", "bold");
    const komboText = data.komboDiscount 
      ? `${data.komboName} (${data.komboDiscount}% de desconto)`
      : data.komboName;
    doc.text(komboText, M, Y + 12);
    Y += 26;
  }

  // Add-ons (bullets)
  if (selAddons.length > 0) {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
    doc.text("Add-ons Contratados", M, Y);
    Y += 14;

    const addonNameMap: Record<string, string> = {
      leads: "Kenlo Leads",
      inteligencia: "Kenlo Inteligência",
      assinatura: "Kenlo Assinatura",
      pay: "Kenlo Pay",
      seguros: "Kenlo Seguros",
    };

    selAddons.forEach((addon) => {
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text("•", M + 5, Y);
      doc.text(addonNameMap[addon] || addon, M + 15, Y);
      Y += 12;
    });
    Y += 6;
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
    doc.text("Add-ons Contratados", M, Y);
    doc.setFontSize(9);
    doc.setTextColor(...rgb(C.text));
    doc.text("Nenhum add-on contratado", M, Y + 12);
    Y += 26;
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 4: INVESTIMENTO CONTRATUAL
  // ══════════════════════════════════════════════════════════════════
  if (needsNewPage(Y, 200)) Y = newPage(doc, data);
  Y = sectionTitle(doc, "Investimento Contratual", Y);

  // Calculate REAL charged value based on cycle
  let chargedValue = 0;
  const monthlyBase = data.totalAnnual / 12;
  
  if (data.paymentPlan === "monthly") {
    chargedValue = monthlyBase;
  } else if (data.paymentPlan === "semestral") {
    chargedValue = monthlyBase * 6;
  } else if (data.paymentPlan === "annual") {
    chargedValue = monthlyBase * 12;
  } else if (data.paymentPlan === "biennial") {
    chargedValue = monthlyBase * 24;
  }

  // Main investment card
  doc.setFillColor(...rgb(C.primaryLight));
  doc.setDrawColor(...rgb(C.primary));
  doc.setLineWidth(1);
  doc.roundedRect(M, Y, CW, 60, 4, 4, "FD");

  doc.setFontSize(8);
  doc.setTextColor(...rgb(C.textMuted));
  doc.setFont("helvetica", "normal");
  doc.text(`Valor ${cycleDisplay}`, M + 14, Y + 20);

  doc.setFontSize(20);
  doc.setTextColor(...rgb(C.primary));
  doc.setFont("helvetica", "bold");
  doc.text(fmt(chargedValue), M + 14, Y + 42);

  Y += 70;

  // Breakdown table
  divider(doc, Y);
  Y += 10;

  // Products
  if (showImob && data.imobPrice) {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text(`Kenlo Imob (${(data.imobPlan || "K").toUpperCase()})`, M + 14, Y);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(data.imobPrice), M + CW - 14, Y, { align: "right" });
    Y += 14;
  }

  if (showLoc && data.locPrice) {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text(`Kenlo Locação (${(data.locPlan || "K").toUpperCase()})`, M + 14, Y);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(data.locPrice), M + CW - 14, Y, { align: "right" });
    Y += 14;
  }

  // Add-ons
  selAddons.forEach((addon) => {
    const price = addonPrices[addon];
    if (price && price > 0) {
      const addonNameMap: Record<string, string> = {
        leads: "Kenlo Leads",
        inteligencia: "Kenlo Inteligência",
        assinatura: "Kenlo Assinatura",
        pay: "Kenlo Pay",
        seguros: "Kenlo Seguros",
      };
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text(addonNameMap[addon] || addon, M + 14, Y);
      doc.setFont("helvetica", "bold");
      doc.text(fmt(price), M + CW - 14, Y, { align: "right" });
      Y += 14;
    }
  });

  divider(doc, Y);
  Y += 10;

  // Implantation (if annual/biennial)
  if (data.implantationFee > 0 && (data.paymentPlan === "annual" || data.paymentPlan === "biennial")) {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text("Taxa de Implantação (única, 1º ano)", M + 14, Y);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(data.implantationFee), M + CW - 14, Y, { align: "right" });
    Y += 14;
    
    divider(doc, Y);
    Y += 10;
  }

  // Installments (if applicable)
  if (data.installments && data.installments > 1) {
    const totalWithImpl = chargedValue + (data.implantationFee || 0);
    const installmentValue = totalWithImpl / data.installments;
    
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text(`Parcelamento (${data.installments}x)`, M + 14, Y);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.installments}x de ${fmt(installmentValue)}`, M + CW - 14, Y, { align: "right" });
    Y += 20;
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 4B: COMPARATIVO DE CENÁRIOS (selected columns)
  // ══════════════════════════════════════════════════════════════════
  if (data.selectedColumnsJson) {
    try {
      console.log('[PDF DEBUG] selectedColumnsJson exists, length:', data.selectedColumnsJson.length);
      const selectedCols: Array<{
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
      }> = JSON.parse(data.selectedColumnsJson);

      console.log('[PDF DEBUG] parsed selectedCols:', selectedCols.length, 'columns');
      if (selectedCols.length > 0) {
        console.log('[PDF DEBUG] Starting comparison table rendering');
        if (needsNewPage(Y, 300)) Y = newPage(doc, data);
        Y = sectionTitle(doc, "Comparativo de Cenários", Y);

        const numCols = selectedCols.length;
        const labelW = 120;
        const colW2 = (CW - labelW) / numCols;

        const cycleLabels: Record<string, string> = {
          monthly: "Mensal", semestral: "Semestral", annual: "Anual", biennial: "Bienal"
        };

        // Helper to draw a row
        const drawRow = (label: string, values: string[], yPos: number, opts?: { bold?: boolean; bg?: string; labelBold?: boolean; valueColor?: string }) => {
          if (opts?.bg) {
            doc.setFillColor(...rgb(opts.bg));
            doc.rect(M, yPos - 8, CW, 14, "F");
          }
          doc.setFontSize(7);
          doc.setTextColor(...rgb(C.text));
          doc.setFont("helvetica", opts?.labelBold ? "bold" : "normal");
          doc.text(label, M + 4, yPos);
          for (let i = 0; i < numCols; i++) {
            const x = M + labelW + colW2 * i + colW2 / 2;
            doc.setFontSize(opts?.bold ? 8 : 7);
            doc.setTextColor(...rgb(opts?.valueColor || C.text));
            doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
            doc.text(values[i] || "—", x, yPos, { align: "center" });
          }
          return yPos + 14;
        };

        // Header row
        doc.setFillColor(...rgb(C.primary));
        doc.rect(M, Y - 4, CW, 16, "F");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Cenário", M + 4, Y + 6);
        for (let i = 0; i < numCols; i++) {
          const x = M + labelW + colW2 * i + colW2 / 2;
          const colName = selectedCols[i].name.length > 16 ? selectedCols[i].name.substring(0, 16) + "…" : selectedCols[i].name;
          const discountText = selectedCols[i].discount > 0 ? ` (${Math.round(selectedCols[i].discount * 100)}% OFF)` : "";
          doc.text(colName + discountText, x, Y + 6, { align: "center" });
        }
        Y += 18;

        // Section: Produtos
        Y = drawRow("Produtos", [], Y, { bg: C.bgSoft, labelBold: true });
        // Imob
        const imobVals = selectedCols.map(c => c.imobPrice !== null ? `R$ ${fmtNum(c.imobPrice)}` : "—");
        if (imobVals.some(v => v !== "—")) Y = drawRow("  Imob", imobVals, Y);
        // Loc
        const locVals = selectedCols.map(c => c.locPrice !== null ? `R$ ${fmtNum(c.locPrice)}` : "—");
        if (locVals.some(v => v !== "—")) Y = drawRow("  Locação", locVals, Y);

        // Section: Add-ons
        Y = drawRow("Add-ons", [], Y, { bg: C.bgSoft, labelBold: true });
        const leadsVals = selectedCols.map(c => c.leadsPrice !== null ? `R$ ${fmtNum(c.leadsPrice)}` : "—");
        if (leadsVals.some(v => v !== "—")) Y = drawRow("  Leads", leadsVals, Y);
        const intelVals = selectedCols.map(c => c.inteligenciaPrice !== null ? `R$ ${fmtNum(c.inteligenciaPrice)}` : "—");
        if (intelVals.some(v => v !== "—")) Y = drawRow("  Inteligência", intelVals, Y);
        const assVals = selectedCols.map(c => c.assinaturaPrice !== null ? `R$ ${fmtNum(c.assinaturaPrice)}` : "—");
        if (assVals.some(v => v !== "—")) Y = drawRow("  Assinatura", assVals, Y);

        // Serviços Premium
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
          Y = drawRow("Serviços Premium", [], Y, { bg: C.bgSoft, labelBold: true });
          if (vipVals.some(v => v !== "—")) Y = drawRow("  Suporte VIP", vipVals, Y);
          if (csVals.some(v => v !== "—")) Y = drawRow("  CS Dedicado", csVals, Y);
          if (trainVals.some(v => v !== "—")) Y = drawRow("  Treinamentos", trainVals, Y);
        }

        // Divider
        divider(doc, Y - 4);

        // Mensalidades
        const monthlyVals = selectedCols.map(c => `R$ ${fmtNum(c.totalMonthly)}`);
        const subVals = selectedCols.map(c => `${c.subscriptionCount} assinatura${c.subscriptionCount !== 1 ? "s" : ""}`);
        Y = drawRow("Mensalidades (Pré-Pago)", monthlyVals, Y, { bold: true });
        // Sub-row for subscription count
        doc.setFontSize(6);
        doc.setTextColor(...rgb(C.textMuted));
        for (let i = 0; i < numCols; i++) {
          const x = M + labelW + colW2 * i + colW2 / 2;
          doc.text(subVals[i], x, Y - 6, { align: "center" });
        }

        // Implantação
        Y = drawRow("Implantação", [], Y, { bg: C.bgSoft, labelBold: true });
        // Impl breakdown per item
        const implLabelsSet = new Set<string>();
        selectedCols.forEach(c => c.implBreakdown.forEach(b => implLabelsSet.add(b.label)));
        const implLabels = Array.from(implLabelsSet);
        for (let li = 0; li < implLabels.length; li++) {
          const label = implLabels[li];
          if (needsNewPage(Y, 20)) Y = newPage(doc, data);
          const vals = selectedCols.map(c => {
            const item = c.implBreakdown.find(b => b.label === label);
            if (!item) return "—";
            if (item.free) return "Ofertado";
            return `R$ ${fmtNum(item.cost)}`;
          });
          // Color "Ofertado" in green
          doc.setFontSize(7);
          doc.setTextColor(...rgb(C.text));
          doc.setFont("helvetica", "normal");
          doc.text(`  ${label}`, M + 4, Y);
          for (let i = 0; i < numCols; i++) {
            const x = M + labelW + colW2 * i + colW2 / 2;
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
        // Impl total
        const implTotalVals = selectedCols.map(c => `R$ ${fmtNum(c.implementation)}`);
        Y = drawRow("Total Implantação", implTotalVals, Y, { bold: true });

        // Total 1º Ano
        divider(doc, Y - 4);
        const totalVals = selectedCols.map(c => `R$ ${fmtNum(c.cycleTotalValue)}`);
        const totalCycleLabels = selectedCols.map(c => `(${cycleLabels[c.overrides?.frequency || "annual"] || "Anual"})`);
        Y = drawRow("Total 1º Ano", totalVals, Y, { bold: true, valueColor: C.dark });
        // Sub-row for cycle label
        doc.setFontSize(6);
        doc.setTextColor(...rgb(C.textMuted));
        for (let i = 0; i < numCols; i++) {
          const x = M + labelW + colW2 * i + colW2 / 2;
          doc.text(totalCycleLabels[i], x, Y - 6, { align: "center" });
        }

        // Ciclo
        const cycleVals = selectedCols.map(c => cycleLabels[c.overrides?.frequency || "annual"] || "Anual");
        Y = drawRow("Ciclo", cycleVals, Y);

        // Pós-Pago section with calculated values
        if (needsNewPage(Y, 140)) Y = newPage(doc, data);
        Y = drawRow("Custos Variáveis (Pós-Pago)", [], Y, { bg: C.bgSoft, labelBold: true });

        // Helper to draw a pós-pago row with value + sub-detail line
        const drawPostPaidRow = (label: string, mainVals: string[], detailVals: string[], yPos: number, opts?: { mainColor?: string }): number => {
          if (needsNewPage(yPos, 24)) yPos = newPage(doc, data);
          // Main value row
          doc.setFontSize(7);
          doc.setTextColor(...rgb(C.text));
          doc.setFont("helvetica", "normal");
          doc.text(label, M + 4, yPos);
          for (let i = 0; i < numCols; i++) {
            const x = M + labelW + colW2 * i + colW2 / 2;
            const val = mainVals[i] || "—";
            if (val === "No Plano" || val === "Sem custos" || val.includes("Pré-pago")) {
              doc.setTextColor(...rgb(C.green));
              doc.setFont("helvetica", "bold");
            } else if (val.startsWith("R$")) {
              doc.setTextColor(...rgb("#B45309")); // amber-700
              doc.setFont("helvetica", "bold");
            } else {
              doc.setTextColor(...rgb(C.textMuted));
              doc.setFont("helvetica", "normal");
            }
            doc.text(val, x, yPos, { align: "center" });
          }
          // Detail sub-row (smaller, italic)
          if (detailVals.some(v => v !== "")) {
            const detailY = yPos + 9;
            doc.setFontSize(5.5);
            doc.setTextColor(...rgb(C.textLight));
            doc.setFont("helvetica", "italic");
            for (let i = 0; i < numCols; i++) {
              const x = M + labelW + colW2 * i + colW2 / 2;
              if (detailVals[i]) doc.text(detailVals[i], x, detailY, { align: "center" });
            }
            return detailY + 9;
          }
          return yPos + 14;
        };

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
        if (ppUserMain.some(v => v !== "—")) Y = drawPostPaidRow("  Usuários adicionais", ppUserMain, ppUserDetail, Y);

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
        if (ppContMain.some(v => v !== "—")) Y = drawPostPaidRow("  Contratos adicionais", ppContMain, ppContDetail, Y);

        // WhatsApp Leads
        const ppWpMain = selectedCols.map(c => {
          const pp = c.postPaidWhatsApp;
          if (!pp) return "—";
          return "Pós-pago";
        });
        const ppWpDetail = selectedCols.map(c => {
          const pp = c.postPaidWhatsApp;
          if (!pp) return "";
          return `${pp.included} incl./mês`;
        });
        if (ppWpMain.some(v => v !== "—")) Y = drawPostPaidRow("  WhatsApp Leads", ppWpMain, ppWpDetail, Y);

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
        if (ppSigMain.some(v => v !== "—")) Y = drawPostPaidRow("  Assinaturas", ppSigMain, ppSigDetail, Y);

        // Boletos
        const ppBolMain = selectedCols.map(c => {
          const pp = c.postPaidBoletos;
          if (!pp) return "—";
          return `R$ ${fmtNum(pp.cost)}`;
        });
        const ppBolDetail = selectedCols.map(c => {
          const pp = c.postPaidBoletos;
          if (!pp) return "";
          return `${pp.quantity.toLocaleString('pt-BR')} × R$ ${pp.perUnit.toFixed(2)}`;
        });
        if (ppBolMain.some(v => v !== "—")) Y = drawPostPaidRow("  Boletos", ppBolMain, ppBolDetail, Y);

        // Splits
        const ppSplMain = selectedCols.map(c => {
          const pp = c.postPaidSplits;
          if (!pp) return "—";
          return `R$ ${fmtNum(pp.cost)}`;
        });
        const ppSplDetail = selectedCols.map(c => {
          const pp = c.postPaidSplits;
          if (!pp) return "";
          return `${pp.quantity.toLocaleString('pt-BR')} × R$ ${pp.perUnit.toFixed(2)}`;
        });
        if (ppSplMain.some(v => v !== "—")) Y = drawPostPaidRow("  Splits", ppSplMain, ppSplDetail, Y);

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
        Y = drawRow("Total Pós-Pago (est.)", ppTotalMain, Y, { bold: true, valueColor: "#B45309" });

        console.log('[PDF DEBUG] Comparison table rendering COMPLETE');
        Y += 10;
      }
    } catch (e) {
      console.error("Error parsing selectedColumnsJson:", e);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // SECTION 5: ESCOPO INCLUÍDO NA CONTRATAÇÃO
  // ══════════════════════════════════════════════════════════════════
  if (needsNewPage(Y, 150)) Y = newPage(doc, data);
  Y = sectionTitle(doc, "Escopo Incluído na Contratação", Y);

  const scopeItems: string[] = [];

  if (showImob) {
    scopeItems.push(`Plataforma Kenlo Imob (${(data.imobPlan || "K").toUpperCase()})`);
    const imobUsers = data.imobPlan?.toLowerCase() === "prime" ? 2 : data.imobPlan?.toLowerCase() === "k" ? 5 : 10;
    scopeItems.push(`Até ${imobUsers} usuários simultâneos (Vendas)`);
  }

  if (showLoc) {
    scopeItems.push(`Plataforma Kenlo Locação (${(data.locPlan || "K").toUpperCase()})`);
    const locContracts = data.locPlan?.toLowerCase() === "prime" ? 100 : data.locPlan?.toLowerCase() === "k" ? 150 : 500;
    scopeItems.push(`Até ${locContracts} contratos sob gestão`);
  }

  selAddons.forEach((addon) => {
    const addonNameMap: Record<string, string> = {
      leads: "Kenlo Leads — Gestão automatizada de leads",
      inteligencia: "Kenlo Inteligência — BI de KPIs de performance",
      assinatura: "Kenlo Assinatura — Assinatura digital embutida (15 assinaturas/mês incluídas)",
      pay: "Kenlo Pay — Boleto e Split digital embutido",
      seguros: "Kenlo Seguros — Seguros embutido no boleto",
    };
    scopeItems.push(addonNameMap[addon] || addon);
  });

  scopeItems.push("Suporte técnico padrão");
  scopeItems.push("Atualizações contínuas da plataforma");
  scopeItems.push("Infraestrutura cloud segura e escalável");

  scopeItems.forEach((item) => {
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text("✔", M + 5, Y);
    
    // Word wrap for long items
    const maxWidth = CW - 25;
    const lines = doc.splitTextToSize(item, maxWidth);
    doc.text(lines, M + 15, Y);
    Y += lines.length * 12;
  });

  Y += 10;

  // ══════════════════════════════════════════════════════════════════
  // SECTION 6: SERVIÇOS PREMIUM ATIVADOS
  // ══════════════════════════════════════════════════════════════════
  if (needsNewPage(Y, 120)) Y = newPage(doc, data);
  Y = sectionTitle(doc, "Serviços Premium Ativados", Y);

  const premiumServices = [
    {
      name: "Suporte VIP",
      desc: "Atendimento prioritário com SLA reduzido",
      included: data.vipIncluded || false,
      price: data.vipPrice || 0,
    },
    {
      name: "CS Dedicado",
      desc: "Customer Success dedicado para acompanhamento estratégico",
      included: data.csIncluded || false,
      price: data.csPrice || 0,
    },
    {
      name: "Treinamentos",
      desc: "Treinamentos exclusivos para sua equipe",
      included: (data.imobPlan?.toLowerCase() === "k2" || data.locPlan?.toLowerCase() === "k2"),
      price: 0,
    },
  ];

  premiumServices.forEach((service) => {
    doc.setFontSize(9);
    doc.setTextColor(...rgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text(service.name, M + 14, Y);

    if (service.included) {
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.green));
      doc.setFont("helvetica", "bold");
      doc.text("Incluído", M + CW - 14, Y, { align: "right" });
    } else if (service.price > 0) {
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text(fmt(service.price) + "/mês", M + CW - 14, Y, { align: "right" });
    } else {
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.textLight));
      doc.setFont("helvetica", "normal");
      doc.text("—", M + CW - 14, Y, { align: "right" });
    }

    doc.setFontSize(7);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "normal");
    doc.text(service.desc, M + 14, Y + 10);

    Y += 26;
  });

  // ══════════════════════════════════════════════════════════════════
  // SECTION 7: FUNCIONALIDADES DA PLATAFORMA
  // ══════════════════════════════════════════════════════════════════
  if (needsNewPage(Y, 300)) Y = newPage(doc, data);
  Y = sectionTitle(doc, "Funcionalidades da Plataforma", Y);

  // Get features for each product/plan
  const imobAllFeatures = showImob ? getAllFeatures("imob") : [];
  const locAllFeatures = showLoc ? getAllFeatures("locacao") : [];

  const imobFeatures = imobAllFeatures.map(f => ({
    name: f.name,
    included: imobPlanKey === "prime" ? f.includedInPrime : imobPlanKey === "k" ? f.includedInK : f.includedInK2
  }));

  const locFeatures = locAllFeatures.map(f => ({
    name: f.name,
    included: locPlanKey === "prime" ? f.includedInPrime : locPlanKey === "k" ? f.includedInK : f.includedInK2
  }));

  // If 2 products: side-by-side comparison
  if (showImob && showLoc) {
    // Header row
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.textMuted));
    doc.setFont("helvetica", "bold");
    doc.text("Funcionalidade", M + 14, Y);
    doc.text("IMOB", M + CW - 80, Y, { align: "center" });
    doc.text("LOC", M + CW - 20, Y, { align: "center" });
    Y += 12;
    divider(doc, Y);
    Y += 8;

    // Combine all features
    const allFeatureNames = Array.from(new Set([
      ...imobFeatures.map(f => f.name),
      ...locFeatures.map(f => f.name)
    ]));

    for (const fname of allFeatureNames) {
      if (needsNewPage(Y, 20)) Y = newPage(doc, data);
      
      const imobHas = imobFeatures.some(f => f.name === fname && f.included);
      const locHas = locFeatures.some(f => f.name === fname && f.included);

      doc.setFontSize(7);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text(fname, M + 14, Y);

      // IMOB column
      doc.setFontSize(8);
      doc.setTextColor(...rgb(imobHas ? C.green : C.textLight));
      doc.setFont("helvetica", "bold");
      doc.text(imobHas ? "✔" : "—", M + CW - 80, Y, { align: "center" });

      // LOC column
      doc.setTextColor(...rgb(locHas ? C.green : C.textLight));
      doc.text(locHas ? "✔" : "—", M + CW - 20, Y, { align: "center" });

      Y += 12;
    }
  } else {
    // Single product: just one column
    const features = showImob ? imobFeatures : locFeatures;
    for (const feat of features) {
      if (needsNewPage(Y, 20)) Y = newPage(doc, data);
      
      const symbol = feat.included ? "✔" : "—";
      const color = feat.included ? C.green : C.textLight;

      doc.setFontSize(7);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text(feat.name, M + 14, Y);

      doc.setFontSize(8);
      doc.setTextColor(...rgb(color));
      doc.setFont("helvetica", "bold");
      doc.text(symbol, M + CW - 14, Y, { align: "right" });

      Y += 12;
    }
  }

  Y += 10;

  // ══════════════════════════════════════════════════════════════════
  // SECTION 8: POTENCIAL DE RECEITA EXTRA (only if applicable)
  // ══════════════════════════════════════════════════════════════════
  if (hasRevenue) {
    if (needsNewPage(Y, 150)) Y = newPage(doc, data);
    Y = sectionTitle(doc, "Potencial de Receita Extra", Y);

    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.text));
    doc.setFont("helvetica", "normal");
    doc.text("Com os add-ons contratados, você pode gerar receita adicional:", M, Y);
    Y += 16;

    if (data.revenueFromBoletos && data.revenueFromBoletos > 0) {
      // Show combined total
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text("Receita de Boletos/Split (Pay)", M + 14, Y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...rgb(C.green));
      doc.text(fmt(data.revenueFromBoletos) + "/mês", M + CW - 14, Y, { align: "right" });
      Y += 12;

      // Show boleto breakdown detail
      const contracts = data.contracts || 0;
      if (data.chargesBoletoToTenant && data.boletoAmount && data.boletoAmount > 0) {
        const boletoRevenue = contracts * data.boletoAmount;
        doc.setFontSize(7);
        doc.setTextColor(...rgb(C.textMuted));
        doc.setFont("helvetica", "italic");
        doc.text(`  Boleto: ${contracts} contratos × ${fmt(data.boletoAmount)} = ${fmt(boletoRevenue)}/mês`, M + 20, Y);
        Y += 10;
      }

      // Show split breakdown detail
      if (data.chargesSplitToOwner && data.splitAmount && data.splitAmount > 0) {
        const splitRevenue = contracts * data.splitAmount;
        doc.setFontSize(7);
        doc.setTextColor(...rgb(C.textMuted));
        doc.setFont("helvetica", "italic");
        doc.text(`  Split: ${contracts} contratos × ${fmt(data.splitAmount)} = ${fmt(splitRevenue)}/mês`, M + 20, Y);
        Y += 10;
      }
      Y += 4;
    }

    if (data.revenueFromInsurance && data.revenueFromInsurance > 0) {
      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text("Receita de Seguros", M + 14, Y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...rgb(C.green));
      doc.text(fmt(data.revenueFromInsurance) + "/mês", M + CW - 14, Y, { align: "right" });
      Y += 14;
    }

    divider(doc, Y);
    Y += 10;

    const totalRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
    doc.setFontSize(9);
    doc.setTextColor(...rgb(C.dark));
    doc.setFont("helvetica", "bold");
    doc.text("Total de Receita Extra Mensal", M + 14, Y);
    doc.setFontSize(11);
    doc.setTextColor(...rgb(C.green));
    doc.text(fmt(totalRevenue), M + CW - 14, Y, { align: "right" });
    Y += 20;

    // ROI indicator
    const monthlyInvestment = data.totalAnnual / 12;
    const netGain = totalRevenue - monthlyInvestment - (data.postPaidTotal || 0);
    
    if (netGain > 0) {
      doc.setFillColor(...rgb(C.greenLight));
      doc.setDrawColor(...rgb(C.green));
      doc.setLineWidth(1);
      doc.roundedRect(M, Y, CW, 40, 4, 4, "FD");

      doc.setFontSize(8);
      doc.setTextColor(...rgb(C.text));
      doc.setFont("helvetica", "normal");
      doc.text("Ganho Líquido Mensal Estimado", M + 14, Y + 16);

      doc.setFontSize(14);
      doc.setTextColor(...rgb(C.green));
      doc.setFont("helvetica", "bold");
      doc.text(fmt(netGain), M + 14, Y + 32);

      Y += 50;
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // FINAL PAGE: CONCLUSION
  // ══════════════════════════════════════════════════════════════════
  if (needsNewPage(Y, 100)) Y = newPage(doc, data);
  
  doc.setFillColor(...rgb(C.bgSoft));
  doc.roundedRect(M, Y, CW, 80, 4, 4, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(...rgb(C.dark));
  doc.setFont("helvetica", "bold");
  doc.text("Próximos Passos", M + 14, Y + 20);
  
  doc.setFontSize(8);
  doc.setTextColor(...rgb(C.text));
  doc.setFont("helvetica", "normal");
  const steps = [
    "1. Revisão e aprovação da proposta",
    "2. Assinatura do contrato",
    "3. Agendamento da implantação",
    "4. Treinamento da equipe",
  ];
  
  let stepY = Y + 35;
  steps.forEach((step) => {
    doc.text(step, M + 14, stepY);
    stepY += 12;
  });

  // ══════════════════════════════════════════════════════════════════
  // GENERATE OUTPUT
  // ══════════════════════════════════════════════════════════════════
  const pdfBlob = doc.output("blob");
  const filename = `Proposta_Kenlo_${data.agencyName?.replace(/\s+/g, "_") || "Cliente"}_${new Date().toISOString().split("T")[0]}.pdf`;

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
