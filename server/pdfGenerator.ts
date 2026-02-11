/**
 * Server-side PDF generation — Redesign v2 (PDFKit)
 *
 * Structure (8 sections):
 *   1. Capa (cover — full page)
 *   2. Resumo da Configuração (single linear block, no cards)
 *   3. Detalhamento (products, addons, implantation, installments)
 *   4. Benefícios Inclusos (VIP, CS, Training)
 *   5. Variáveis pós-pago (only if relevant)
 *   6. (Removed — Kombos shown only in Resumo)
 *   7. Kenlo Receita Extra + ROI (no Cash)
 *   8. Conclusão
 *
 * Design: linear 1-column layout, full-width blocks, clean document (not dashboard),
 *         minimal text, no duplication, primary color for selection only.
 */

import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";
import { PREMIUM_SERVICES, TRAINING, SEGUROS_COMMISSION, getFeatures, getAllFeatures, type PlanTier } from "@shared/pricing-config";

// -- Data interfaces --
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
interface KomboComparisonData {
  name: string;
  discount: number;
  monthlyTotal: number;
  savings: number;
}

interface ProposalData {
  salesPersonName: string;
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
  komboComparison?: string;
}

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 48,
      autoFirstPage: true,
      bufferPages: true,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // -- Constants --
    const PW = 595.28;
    const PH = 841.89;
    const M = 48;
    const CW = PW - M * 2;
    const GAP = 12;
    const MAX_Y = PH - 50;

    // Design-system colors (matching client-side)
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
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(v);
    const fmtNum = (v: number) =>
      new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v);

    // -- Helpers --
    const card = (
      x: number, y: number, w: number, h: number,
      opts: { fill?: string; stroke?: string; lw?: number; r?: number; selected?: boolean } = {}
    ) => {
      const r = opts.r ?? 4;
      if (opts.selected) {
        doc.roundedRect(x, y, w, h, r).lineWidth(1).fillAndStroke(C.primaryLight, C.primary);
      } else {
        doc.roundedRect(x, y, w, h, r).lineWidth(opts.lw ?? 0.5).fillAndStroke(opts.fill ?? C.bg, opts.stroke ?? C.border);
      }
    };

    const sectionTitle = (title: string, y: number): number => {
      doc.rect(M, y, 3, 12).fill(C.primary);
      doc.fontSize(11).fillColor(C.dark).font("Helvetica-Bold").text(title, M + 10, y + 1, { lineBreak: false });
      return y + 22;
    };

    const lbl = (text: string, x: number, y: number, opts: { color?: string; size?: number; bold?: boolean } = {}) => {
      doc.fontSize(opts.size ?? 7).fillColor(opts.color ?? C.textMuted).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(text, x, y, { lineBreak: false });
    };

    const val = (text: string, x: number, y: number, opts: { color?: string; size?: number; align?: "left" | "right" | "center"; width?: number } = {}) => {
      doc.fontSize(opts.size ?? 9).fillColor(opts.color ?? C.dark).font("Helvetica-Bold");
      if (opts.align === "right" && opts.width) {
        doc.text(text, x, y, { width: opts.width, align: "right" });
      } else if (opts.align === "center" && opts.width) {
        doc.text(text, x, y, { width: opts.width, align: "center" });
      } else {
        doc.text(text, x, y, { lineBreak: false });
      }
    };

    const divider = (y: number, x1?: number, x2?: number) => {
      doc.moveTo(x1 ?? M, y).lineTo(x2 ?? (M + CW), y).lineWidth(0.3).strokeColor(C.border).stroke();
    };

    const tableRow = (label: string, value: string, y: number, opts: { valueColor?: string } = {}) => {
      doc.fontSize(7.5).fillColor(C.text).font("Helvetica").text(label, M + 14, y, { lineBreak: false });
      doc.fontSize(7.5).fillColor(opts.valueColor ?? C.text).font("Helvetica-Bold")
        .text(value, M + 14, y, { width: CW - 28, align: "right" });
    };

    const needsNewPage = (y: number, needed: number): boolean => y + needed > MAX_Y;

    const newPage = (): number => {
      doc.addPage();
      doc.rect(0, 0, PW, 3).fill(C.primary);
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
        .text(`${data.agencyName || "Imobiliaria"} — Proposta Comercial`, M, PH - 20, { lineBreak: false });
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
        .text(`Consultor: ${data.salesPersonName}`, M + CW - 150, PH - 20, { width: 150, align: "right" });
      return 30;
    };

    // -- Parse helpers --
    const parseAddons = (raw: string): string[] => {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map((a: string) => a.trim().toLowerCase());
        return raw.split(",").map((a) => a.trim().toLowerCase());
      } catch {
        return raw.split(",").map((a) => a.trim().toLowerCase());
      }
    };

    const parseAddonPrices = (raw?: string): Record<string, number> => {
      if (!raw) return {};
      try { return JSON.parse(raw); } catch { return {}; }
    };

    const parsePostPaid = (raw?: string): PostPaidBreakdown | null => {
      if (!raw) return null;
      try { return JSON.parse(raw); } catch { return null; }
    };

    const parseKomboComparison = (raw?: string): KomboComparisonData[] => {
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return parsed.map((k: any) => ({
          name: k.name || "",
          discount: k.discount || 0,
          monthlyTotal: k.monthlyTotal ?? k.totalMonthly ?? 0,
          savings: k.savings || 0,
        }));
      } catch { return []; }
    };

    // -- Derived data --
    const normalizedProductType = data.productType?.toLowerCase().trim() || "";
    const showImob = ["imob", "both", "imob_loc", "ambos"].includes(normalizedProductType);
    const showLoc = ["loc", "both", "imob_loc", "ambos"].includes(normalizedProductType);
    const selAddons = parseAddons(data.selectedAddons);
    const addonPrices = parseAddonPrices(data.addonPrices);
    const ppBreakdown = parsePostPaid(data.postPaidBreakdown);
    const komboComparison = parseKomboComparison(data.komboComparison);
    const monthlyRecurring = data.totalAnnual > 0 ? data.totalAnnual / 12 : (data.monthlyLicenseBase || data.totalMonthly || 0);
    const installments = data.installments || 1;
    const totalInvestment = data.totalAnnual + data.implantationFee;

    const imobIsK2 = showImob && data.imobPlan?.toLowerCase() === "k2";
    const locIsK2 = showLoc && data.locPlan?.toLowerCase() === "k2";
    const anyK2 = imobIsK2 || locIsK2;
    const bothK2 = imobIsK2 && locIsK2;
    const imobIsK = showImob && data.imobPlan?.toLowerCase() === "k";
    const locIsK = showLoc && data.locPlan?.toLowerCase() === "k";
    const anyK = imobIsK || locIsK || anyK2;

    const hasVip = data.vipIncluded || (data.vipPrice !== undefined && data.vipPrice > 0);
    const hasCS = data.csIncluded || (data.csPrice !== undefined && data.csPrice > 0);
    const hasRevenue = (data.revenueFromBoletos || 0) > 0 || (data.revenueFromInsurance || 0) > 0;
    const hasPostPaid = (data.postPaidTotal || 0) > 0;

    const komboDiscount = data.komboDiscount || 0;
    const rawKombo = data.komboName || "";
    const komboDisplayMap: Record<string, string> = {
      sem_kombo: "", imob_start: "Kombo Imob Start", imob_pro: "Kombo Imob Pro",
      locacao_pro: "Kombo Loc Pro", core_gestao: "Kombo Core Gestao", elite: "Kombo Elite",
    };
    const normalizedKombo = rawKombo.toLowerCase().replace(/^kombo\s+/i, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    const komboLabel = komboDisplayMap[normalizedKombo] || rawKombo;
    const isKombo = komboDiscount > 0 || (komboLabel !== "" && normalizedKombo !== "sem_kombo");

    const freqMap: Record<string, { label: string; adj: string }> = {
      monthly: { label: "Mensal", adj: "(referência)" },
      mensal: { label: "Mensal", adj: "(referência)" },
      semestral: { label: "Semestral", adj: "−10%" },
      annual: { label: "Anual", adj: "−20%" },
      anual: { label: "Anual", adj: "−20%" },
      bienal: { label: "Bienal", adj: "−28%" },
    };
    const selFreq = freqMap[data.paymentPlan?.toLowerCase()] || freqMap["annual"];

    const addonLabels = [
      { key: "leads", label: "Leads" },
      { key: "inteligencia", label: "Inteligencia" },
      { key: "assinatura", label: "Assinatura" },
      { key: "pay", label: "Pay" },
      { key: "seguros", label: "Seguros" },
    ];
    const activeAddons = addonLabels.filter(a => selAddons.includes(a.key));

    // Highest plan label for propagation rule
    const planRank: Record<string, number> = { prime: 1, k: 2, k2: 3 };
    const imobRank = showImob ? (planRank[(data.imobPlan || "").toLowerCase()] || 0) : 0;
    const locRank = showLoc ? (planRank[(data.locPlan || "").toLowerCase()] || 0) : 0;
    const highestRank = Math.max(imobRank, locRank);
    const highestPlanLabel = highestRank === 3 ? "K2" : highestRank === 2 ? "K" : "Prime";

    // ================================================================
    // PAGE 1 - COVER
    // ================================================================
    let Y = 0;
    const coverCenterX = PW / 2;

    // Top accent line
    doc.rect(0, 0, PW, 4).fill(C.primary);

    // Logo centered
    const logoPath = path.join(process.cwd(), "client/public/kenlo-logo-red.png");
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, coverCenterX - 55, 180, { height: 32 }); } catch (_) {}
    } else {
      doc.fontSize(28).fillColor(C.primary).font("Helvetica-Bold")
        .text("Kenlo", 0, 190, { width: PW, align: "center" });
    }

    // "Proposta Comercial"
    doc.fontSize(26).fillColor(C.dark).font("Helvetica-Bold")
      .text("Proposta Comercial", 0, 250, { width: PW, align: "center" });

    // Thin divider
    doc.moveTo(coverCenterX - 60, 280).lineTo(coverCenterX + 60, 280).lineWidth(0.5).strokeColor(C.border).stroke();

    // Agency name
    doc.fontSize(16).fillColor(C.text).font("Helvetica")
      .text(data.agencyName || data.clientName, 0, 300, { width: PW, align: "center" });

    // Contact name
    doc.fontSize(11).fillColor(C.textMuted).font("Helvetica")
      .text(data.clientName, 0, 325, { width: PW, align: "center" });

    // Date
    const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    doc.fontSize(10).fillColor(C.textLight).font("Helvetica")
      .text(dateStr, 0, 360, { width: PW, align: "center" });

    // Seller info at bottom
    doc.fontSize(8).fillColor(C.textMuted).font("Helvetica")
      .text("Consultor", 0, PH - 120, { width: PW, align: "center" });
    doc.fontSize(10).fillColor(C.text).font("Helvetica-Bold")
      .text(data.salesPersonName, 0, PH - 105, { width: PW, align: "center" });
    doc.fontSize(8).fillColor(C.textMuted).font("Helvetica");
    if (data.vendorEmail) doc.text(data.vendorEmail, 0, PH - 90, { width: PW, align: "center" });
    if (data.vendorPhone) doc.text(data.vendorPhone, 0, PH - 78, { width: PW, align: "center" });

    // Bottom accent line
    doc.rect(0, PH - 4, PW, 4).fill(C.primary);

    // ================================================================
    // SECTION 2 — RESUMO DA CONFIGURAÇÃO (single linear block)
    // ================================================================
    Y = newPage();
    Y = sectionTitle("Resumo da Configuracao", Y);

    // Background block
    const resumoStartY = Y;
    let rY = Y + 12;

    // Line 1: Produto(s) + Plano(s)
    const prodParts: string[] = [];
    if (showImob) prodParts.push(`IMOB ${(data.imobPlan || "").toUpperCase()}`);
    if (showLoc) prodParts.push(`LOC ${(data.locPlan || "").toUpperCase()}`);

    // Line 2: Kombo
    let komboH = 0;
    if (isKombo) komboH = 14;

    // Line 3: Add-ons
    let addonsH = 0;
    if (activeAddons.length > 0) addonsH = 12;

    // Calculate total height for background
    const resumoH = 12 + 18 + komboH + addonsH + 10 + 4;

    // Draw background
    doc.roundedRect(M, resumoStartY, CW, resumoH, 4).fill(C.primaryLight);
    doc.rect(M, resumoStartY, 3, resumoH).fill(C.primary);

    // Product line
    doc.fontSize(14).fillColor(C.dark).font("Helvetica-Bold")
      .text(prodParts.join("  +  "), M + 14, rY, { lineBreak: false });
    rY += 18;

    // Kombo badge
    if (isKombo) {
      const komboText = komboDiscount > 0 ? `${komboLabel} (–${komboDiscount}%)` : komboLabel;
      const bw = doc.widthOfString(komboText) + 16;
      doc.roundedRect(M + 14, rY - 8, bw, 14, 3).fill(C.primary);
      doc.fontSize(8).fillColor("#FFFFFF").font("Helvetica-Bold").text(komboText, M + 22, rY - 5, { lineBreak: false });
      rY += 14;
    }

    // Add-ons line
    if (activeAddons.length > 0) {
      const addonText = "Add-ons: " + activeAddons.map(a => a.label).join(" | ");
      lbl(addonText, M + 14, rY, { size: 7.5, color: C.text });
      rY += 12;
    }

    // Price + frequency (TOGETHER on same line)
    const priceText = fmt(monthlyRecurring) + " / mes";
    doc.fontSize(12).fillColor(C.primary).font("Helvetica-Bold")
      .text(priceText, M + 14, rY, { lineBreak: false });
    const priceWidth = doc.widthOfString(priceText);
    doc.fontSize(7.5).fillColor(C.textMuted).font("Helvetica")
      .text(`  ·  Contrato ${selFreq.label.toLowerCase()} (${selFreq.adj})`, M + 14 + priceWidth + 4, rY + 2, { lineBreak: false });

    Y = resumoStartY + resumoH + GAP;

    // ================================================================
    // SECTION 3 — DETALHAMENTO
    // ================================================================
    Y = sectionTitle("Detalhamento", Y);

    // CEO Verdict pricing transparency text
    lbl("O valor mensal é o preço de referência. Pagamentos semestrais e anuais oferecem descontos progressivos sobre esse valor.", M + 10, Y, { size: 6.5, color: C.text });
    Y += 10;
    lbl("Descontos: Semestral −10% | Anual −20% | Bienal −28%", M + 10, Y, { size: 6, color: C.textMuted });
    Y += 14;

    // Products
    if (showImob && data.imobPrice !== undefined) {
      tableRow(`Kenlo IMOB — Plano ${(data.imobPlan || "K").toUpperCase()}`, fmt(data.imobPrice) + "/mes", Y);
      Y += 14;
    }
    if (showLoc && data.locPrice !== undefined) {
      tableRow(`Kenlo Locacao — Plano ${(data.locPlan || "K").toUpperCase()}`, fmt(data.locPrice) + "/mes", Y);
      Y += 14;
    }

    // Add-ons with prices
    const addonNameMap: Record<string, string> = {
      leads: "Kenlo Leads", inteligencia: "Kenlo Inteligencia",
      assinatura: "Kenlo Assinatura", pay: "Kenlo Pay", seguros: "Kenlo Seguros",
    };
    const paidAddons = Object.entries(addonPrices).filter(([_, p]) => p > 0);
    for (const [key, price] of paidAddons) {
      tableRow(addonNameMap[key] || key, fmt(price) + "/mes", Y);
      Y += 14;
    }

    // VIP / CS (if applicable)
    if (hasVip) {
      const vipVal = data.vipIncluded ? "Incluido" : fmt(data.vipPrice || 97) + "/mes";
      tableRow("Suporte VIP", vipVal, Y, { valueColor: data.vipIncluded ? C.green : C.text });
      Y += 14;
    }
    if (hasCS) {
      const csVal = data.csIncluded ? "Incluido" : fmt(data.csPrice || PREMIUM_SERVICES.csDedicado.monthlyPrice) + "/mes";
      tableRow("CS Dedicado", csVal, Y, { valueColor: data.csIncluded ? C.green : C.text });
      Y += 14;
    }

    // K2 Training
    if (anyK2) {
      const trainText = bothK2
        ? "Treinamentos (4 Online ou 2 Presenciais)"
        : "Treinamentos (2 Online ou 1 Presencial)";
      tableRow(trainText, "Incluido", Y, { valueColor: C.green });
      Y += 14;
    }

    // Divider before totals
    Y += 2;
    divider(Y);
    Y += 10;

    // Total mensal
    doc.fontSize(9).fillColor(C.dark).font("Helvetica-Bold")
      .text("Total Mensal Equivalente", M + 14, Y, { lineBreak: false });
    doc.fontSize(9).fillColor(C.dark).font("Helvetica-Bold")
      .text(fmt(monthlyRecurring), M + 14, Y, { width: CW - 28, align: "right" });
    Y += 16;

    // Implantação - CEO Verdict: clearly labeled as "Pagamento único"
    Y += 4; // Extra spacing to visually separate from monthly fees
    doc.fontSize(7).fillColor(C.textMuted).font("Helvetica-Bold")
      .text("PAGAMENTO ÚNICO", M + 14, Y, { lineBreak: false });
    Y += 12;
    tableRow("Implantação", fmt(data.implantationFee), Y);
    Y += 10;
    lbl("Custo único, não recorrente — não entra no cálculo do ROI mensal.", M + 14, Y, { size: 5.5, color: C.textLight });
    Y += 14;

    // Payment condition with installment breakdown
    const normPlan = data.paymentPlan?.toLowerCase() || "annual";
    doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold")
      .text("Condicao de Pagamento", M + 14, Y, { lineBreak: false });
    Y += 12;

    if (normPlan === "monthly" || normPlan === "mensal") {
      lbl(`Cobrado mensalmente: ${fmt(data.totalMonthly || monthlyRecurring)}/mes`, M + 14, Y, { size: 7.5, color: C.text });
      Y += 14;
    } else if (normPlan === "semestral") {
      lbl(`Pago semestralmente: ${fmt((data.totalMonthly || 0) * 6)} a cada 6 meses`, M + 14, Y, { size: 7.5, color: C.text });
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
        doc.roundedRect(px, Y, PILL_W, PILL_H, 4).fill(isSel ? C.primary : C.bgSoft);
        if (isSel) {
          doc.roundedRect(px, Y, PILL_W, PILL_H, 4).strokeColor(C.primary).stroke();
        }
        const pillLabel = n === 1 ? "A vista" : `${n}x`;
        doc.fontSize(6.5).fillColor(isSel ? "#FFFFFF" : C.text)
          .font(isSel ? "Helvetica-Bold" : "Helvetica")
          .text(pillLabel, px, Y + 4, { width: PILL_W, align: "center" });
        const pillValue = fmt(totalInvestment / n);
        doc.fontSize(6).fillColor(isSel ? "#FFFFFF" : C.textMuted)
          .font("Helvetica")
          .text(pillValue, px, Y + 15, { width: PILL_W, align: "center" });
      }
      Y += PILL_H + 4;
      lbl(`Pagamento ${periodLabel} — Total: ${fmt(totalInvestment)}`, M + 14, Y, { size: 6, color: C.textMuted });
      Y += 14;
    }

    Y += GAP;

    // ================================================================
    // SECTION 4 — BENEFÍCIOS INCLUSOS
    // ================================================================
    if (anyK || hasVip || hasCS) {
      if (needsNewPage(Y, 120)) Y = newPage();
      Y = sectionTitle("Beneficios Inclusos", Y);

      // Propagation rule explanation
      if (showImob && showLoc) {
        lbl(`Nivel de beneficio: determinado pelo maior plano contratado (${highestPlanLabel}). Beneficios premium se propagam para todos os produtos.`, M + 10, Y, { size: 6.5, color: C.textMuted });
        Y += 12;
      }

      // VIP
      const vipStatus = hasVip ? (data.vipIncluded ? "Incluido no plano" : "Contratado") : "Nao contratado";
      const vipColor = hasVip ? (data.vipIncluded ? C.green : C.text) : C.textLight;
      doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold")
        .text("Suporte VIP", M + 14, Y, { lineBreak: false });
      doc.fontSize(7.5).fillColor(vipColor).font("Helvetica")
        .text(vipStatus, M + 14, Y, { width: CW - 28, align: "right" });
      Y += 10;
      lbl("Atendimento prioritario com SLA reduzido para chamados criticos.", M + 14, Y, { size: 6, color: C.textMuted });
      Y += 14;

      // CS Dedicado
      const csStatus = hasCS ? (data.csIncluded ? "Incluido no plano" : "Contratado") : "Nao contratado";
      const csColor = hasCS ? (data.csIncluded ? C.green : C.text) : C.textLight;
      doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold")
        .text("CS Dedicado", M + 14, Y, { lineBreak: false });
      doc.fontSize(7.5).fillColor(csColor).font("Helvetica")
        .text(csStatus, M + 14, Y, { width: CW - 28, align: "right" });
      Y += 10;
      lbl("Customer Success dedicado para acompanhamento estrategico da operacao.", M + 14, Y, { size: 6, color: C.textMuted });
      Y += 14;

      // Treinamentos — same pattern as VIP / CS Dedicado
      const trainingStatus = anyK2
        ? (bothK2 ? "Incluido (4x online ou 2 presencial)" : "Incluido (2x online ou 1 presencial)")
        : null;
      const trainingColor = anyK2 ? C.green : C.textLight;
      doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold")
        .text("Treinamentos", M + 14, Y, { lineBreak: false });
      doc.fontSize(7.5).fillColor(trainingColor).font("Helvetica")
        .text(trainingStatus || "—", M + 14, Y, { width: CW - 28, align: "right" });
      Y += 10;
      const trainingOnlinePrice = TRAINING.online;
      const trainingPresencialPrice = TRAINING.presencial;
      lbl(`Treinamentos online e presenciais inclusos no plano K2 (ref. ${fmt(trainingOnlinePrice)}/online, ${fmt(trainingPresencialPrice)}/presencial).`, M + 14, Y, { size: 6, color: C.textMuted });
      Y += 14;

      Y += GAP;
    }

    // ================================================================
    // SECTION 4.5 — FUNCIONALIDADES INCLUÍDAS
    // ================================================================
    if (showImob || showLoc) {
      if (needsNewPage(Y, 150)) Y = newPage();
      Y = sectionTitle("Funcionalidades Incluidas", Y);

      lbl("Recursos disponiveis em cada produto conforme plano contratado.", M + 10, Y, { size: 6.5, color: C.textMuted });
      Y += 14;

      // IMOB Features
      if (showImob && data.imobPlan) {
        const imobPlan = data.imobPlan.toLowerCase() as PlanTier;
        const imobFeatures = getFeatures("imob", imobPlan);
        const allImobFeatures = getAllFeatures("imob");

        doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold")
          .text(`Kenlo IMOB (${data.imobPlan.toUpperCase()})`, M + 14, Y, { lineBreak: false });
        Y += 14;

        for (const feature of allImobFeatures) {
          if (needsNewPage(Y, 20)) Y = newPage();
          const isIncluded = imobFeatures[feature.name];
          const icon = isIncluded ? "✓" : "—";
          const color = isIncluded ? C.green : C.textLight;

          doc.fontSize(7).fillColor(color).font("Helvetica-Bold")
            .text(icon, M + 20, Y, { lineBreak: false });
          doc.fontSize(7).fillColor(isIncluded ? C.text : C.textMuted).font("Helvetica")
            .text(feature.description, M + 32, Y, { lineBreak: false });
          Y += 11;
        }
        Y += 6;
      }

      // LOC Features
      if (showLoc && data.locPlan) {
        if (needsNewPage(Y, 150)) Y = newPage();
        const locPlan = data.locPlan.toLowerCase() as PlanTier;
        const locFeatures = getFeatures("locacao", locPlan);
        const allLocFeatures = getAllFeatures("locacao");

        doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold")
          .text(`Kenlo Locacao (${data.locPlan.toUpperCase()})`, M + 14, Y, { lineBreak: false });
        Y += 14;

        for (const feature of allLocFeatures) {
          if (needsNewPage(Y, 20)) Y = newPage();
          const isIncluded = locFeatures[feature.name];
          const icon = isIncluded ? "✓" : "—";
          const color = isIncluded ? C.green : C.textLight;

          doc.fontSize(7).fillColor(color).font("Helvetica-Bold")
            .text(icon, M + 20, Y, { lineBreak: false });
          doc.fontSize(7).fillColor(isIncluded ? C.text : C.textMuted).font("Helvetica")
            .text(feature.description, M + 32, Y, { lineBreak: false });
          Y += 11;
        }
        Y += 6;
      }

      Y += GAP;
    }

    // ================================================================
    // SECTION 5 — VARIÁVEIS (PÓS-PAGO) — only if relevant
    // ================================================================
    if (hasPostPaid && ppBreakdown) {
      if (needsNewPage(Y, 100)) Y = newPage();
      Y = sectionTitle("Custos Variaveis (Pos-pago)", Y);

      lbl("Cobrado apenas pelo uso excedente ao incluido no plano.", M + 10, Y, { size: 6.5, color: C.textMuted });
      Y += 12;

      const renderGroup = (group: PostPaidGroup) => {
        lbl(group.groupLabel, M + 14, Y, { size: 7, bold: true, color: C.dark });
        Y += 12;
        for (const item of group.items) {
          if (needsNewPage(Y, 30)) Y = newPage();
          doc.fontSize(7).fillColor(C.text).font("Helvetica")
            .text(`${item.label}: ${fmtNum(item.included)} incluidos, ${fmtNum(item.additional)} adicionais`, M + 20, Y, { lineBreak: false });
          doc.fontSize(7).fillColor(C.dark).font("Helvetica-Bold")
            .text(fmt(item.total) + "/mes", M + 14, Y, { width: CW - 28, align: "right" });
          Y += 11;
        }
        Y += 4;
      };

      if (ppBreakdown.imobAddons) renderGroup(ppBreakdown.imobAddons);
      if (ppBreakdown.locAddons) renderGroup(ppBreakdown.locAddons);
      if (ppBreakdown.sharedAddons) renderGroup(ppBreakdown.sharedAddons);

      // Total pós-pago
      divider(Y);
      Y += 10;
      doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold")
        .text("Total Variavel Estimado", M + 14, Y, { lineBreak: false });
      doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold")
        .text(fmt(data.postPaidTotal || 0) + "/mes", M + 14, Y, { width: CW - 28, align: "right" });
      Y += GAP + 6;
    }

    // SECTION 6 — REMOVED (Kombos comparison table eliminated to reduce redundancy)
    // Kombo info is shown only in Resumo da Configuração (Section 2)

    // ================================================================
    // SECTION 7 — KENLO RECEITA EXTRA + ROI (no Cash)
    // ================================================================
    if (hasRevenue) {
      if (needsNewPage(Y, 180)) Y = newPage();
      Y = sectionTitle("Kenlo Receita Extra", Y);

      lbl("Pay e Seguros ficam disponiveis por padrao. O uso e habilitado no onboarding.", M + 10, Y, { size: 6.5, color: C.textMuted });
      Y += 10;
      // Note: R$ 10 is the fixed revenue per contract for the real estate agency, not the commission rate
      lbl("Seguros: receita para a imobiliaria a partir de R$ 10 por contrato/mes.", M + 10, Y, { size: 6.5, color: C.textMuted });
      Y += 14;

      // Pay revenue
      if ((data.revenueFromBoletos || 0) > 0) {
        doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold")
          .text("Kenlo Pay", M + 14, Y, { lineBreak: false });
        doc.fontSize(7.5).fillColor(C.green).font("Helvetica-Bold")
          .text(`+ ${fmt(data.revenueFromBoletos || 0)}/mes`, M + 14, Y, { width: CW - 28, align: "right" });
        Y += 10;

        if (data.chargesBoletoToTenant && data.boletoAmount && data.boletoAmount > 0) {
          lbl(`Boleto: ${fmtNum(data.contracts || 0)} contratos x ${fmt(data.boletoAmount)} = ${fmt((data.contracts || 0) * data.boletoAmount)}`, M + 20, Y, { size: 6.5, color: C.textMuted });
          Y += 9;
        }
        if (data.chargesSplitToOwner && data.splitAmount && data.splitAmount > 0) {
          lbl(`Split: ${fmtNum(data.contracts || 0)} contratos x ${fmt(data.splitAmount)} = ${fmt((data.contracts || 0) * data.splitAmount)}`, M + 20, Y, { size: 6.5, color: C.textMuted });
          Y += 9;
        }
        Y += 4;
      }

      // Seguros revenue
      if ((data.revenueFromInsurance || 0) > 0) {
        doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold")
          .text("Kenlo Seguros", M + 14, Y, { lineBreak: false });
        doc.fontSize(7.5).fillColor(C.green).font("Helvetica-Bold")
          .text(`+ ${fmt(data.revenueFromInsurance || 0)}/mes`, M + 14, Y, { width: CW - 28, align: "right" });
        Y += 10;
        lbl(`${fmtNum(data.contracts || 0)} contratos x R$ 10,00 = ${fmt(data.revenueFromInsurance || 0)}`, M + 20, Y, { size: 6.5, color: C.textMuted });
        Y += 14;
      }

      // Net gain summary
      const totalRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
      const netGain = data.netGain || totalRevenue - monthlyRecurring - (data.postPaidTotal || 0);
      const isPositive = netGain > 0;

      divider(Y);
      Y += 12;

      // Net gain line
      doc.fontSize(10).fillColor(C.dark).font("Helvetica-Bold")
        .text("Ganho Liquido Mensal Estimado", M + 14, Y, { lineBreak: false });
      doc.fontSize(14).fillColor(isPositive ? C.green : "#EF4444").font("Helvetica-Bold")
        .text(fmt(netGain), M + 14, Y, { width: CW - 28, align: "right" });
      Y += 8;
      lbl(isPositive
        ? "Receita extra supera o investimento na plataforma"
        : "Investimento na plataforma supera receita extra",
        M + 14, Y, { size: 6, color: C.textMuted });
      Y += 16;

      // ROI indicators
      if (monthlyRecurring > 0) {
        const totalCost = monthlyRecurring + (data.postPaidTotal || 0);
        const IND_W = (CW - 16) / 3;
        const IND_H = 44;

        if (needsNewPage(Y, IND_H + 20)) Y = newPage();

        if (isPositive) {
          const roiPercent = ((totalRevenue / monthlyRecurring) * 100 - 100).toFixed(0);
          const paybackMonths = monthlyRecurring > 0 ? Math.ceil((data.implantationFee || 0) / netGain) : 0;
          const annualGain = netGain * 12;

          card(M, Y, IND_W, IND_H, { fill: C.bgSoft });
          doc.fontSize(16).fillColor(C.green).font("Helvetica-Bold")
            .text(`${roiPercent}%`, M, Y + 8, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("ROI (Receita vs Investimento)", M, Y + 30, { width: IND_W, align: "center" });

          const px = M + IND_W + 8;
          card(px, Y, IND_W, IND_H, { fill: C.bgSoft });
          doc.fontSize(14).fillColor(C.blue).font("Helvetica-Bold")
            .text(`${paybackMonths} ${paybackMonths === 1 ? "mes" : "meses"}`, px, Y + 10, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("Payback da Implantacao", px, Y + 30, { width: IND_W, align: "center" });

          const ax = M + (IND_W + 8) * 2;
          card(ax, Y, IND_W, IND_H, { fill: C.bgSoft });
          doc.fontSize(12).fillColor(C.green).font("Helvetica-Bold")
            .text(fmt(annualGain), ax, Y + 10, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("Ganho Anual Estimado", ax, Y + 30, { width: IND_W, align: "center" });
        } else {
          const coveragePercent = totalCost > 0 ? Math.round((totalRevenue / totalCost) * 100) : 0;
          const uncoveredCost = Math.abs(netGain);

          card(M, Y, IND_W, IND_H, { fill: C.greenLight, stroke: C.greenBorder });
          doc.fontSize(16).fillColor(C.green).font("Helvetica-Bold")
            .text(`${coveragePercent}%`, M, Y + 8, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("Efeito Kenlo (cobertura do custo)", M, Y + 30, { width: IND_W, align: "center" });

          const px = M + IND_W + 8;
          card(px, Y, IND_W, IND_H, { fill: C.greenLight, stroke: C.greenBorder });
          doc.fontSize(12).fillColor(C.green).font("Helvetica-Bold")
            .text(fmt(totalRevenue), px, Y + 10, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("Receita Mensal Gerada", px, Y + 30, { width: IND_W, align: "center" });

          const ax = M + (IND_W + 8) * 2;
          card(ax, Y, IND_W, IND_H, { fill: C.bgSoft });
          doc.fontSize(12).fillColor(C.text).font("Helvetica-Bold")
            .text(fmt(uncoveredCost), ax, Y + 10, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("Custo Liquido Descoberto/mes", ax, Y + 30, { width: IND_W, align: "center" });
        }

        Y += IND_H + 6;
        doc.fontSize(5).fillColor(C.textLight).font("Helvetica")
          .text("Estimativas baseadas nas informacoes declaradas. Resultados podem variar conforme uso efetivo.", M, Y + 3, { lineBreak: false });
        Y += 12;
      }
    }

    // ================================================================
    // SECTION 7.5 — PRÓXIMOS PASSOS (CEO Verdict Category 4)
    // ================================================================
    if (needsNewPage(Y, 120)) Y = newPage();
    
    Y = sectionTitle("Próximos passos", Y);
    
    const steps = [
      "Assinatura da proposta",
      "Onboarding e configuração",
      "Go-live",
      "Acompanhamento por CS"
    ];
    
    steps.forEach((step, idx) => {
      doc.fontSize(8).fillColor(C.text).font("Helvetica")
        .text(`${idx + 1}. ${step}`, M + 14, Y, { lineBreak: false });
      Y += 14;
    });
    
    Y += GAP;

    // ================================================================
    // SECTION 7.6 — COMMERCIAL RULES MICRO-BLOCK (CEO Verdict Category 4)
    // ================================================================
    if (needsNewPage(Y, 60)) Y = newPage();
    
    // Light gray box with commercial rules text
    const rulesH = 36;
    doc.roundedRect(M, Y, CW, rulesH, 4).fill("#F8FAFC");
    doc.fontSize(6.5).fillColor(C.text).font("Helvetica")
      .text(
        "Os valores consideram o volume informado no momento da cotação. Crescimentos futuros seguem a tabela vigente de excedentes ou upgrade de plano.",
        M + 10, Y + 10, { width: CW - 20, align: "left", lineGap: 2 }
      );
    Y += rulesH + GAP;

    // ================================================================
    // SECTION 8 — CONCLUSÃO
    // ================================================================
    if (needsNewPage(Y, 80)) Y = newPage();

    Y += 10;
    const CONC_H = 50;
    doc.roundedRect(M, Y, CW, CONC_H, 4).fill(C.dark);
    doc.fontSize(12).fillColor("#FFFFFF").font("Helvetica-Bold").text("Kenlo — Quem usa, lidera.", M, Y + 12, { width: CW, align: "center" });
    doc.fontSize(7).fillColor("#CBD5E1").font("Helvetica").text("A Kenlo e a unica plataforma que pode se pagar enquanto voce usa.", M, Y + 30, { width: CW, align: "center" });

    // Validity disclaimer
    Y += CONC_H + 12;
    const vDays = data.validityDays || 3;
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + vDays);
    const fmtDateStr = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    doc.fontSize(6.5).fillColor(C.textMuted).font("Helvetica")
      .text(
        `Proposta valida por ${vDays} dia${vDays > 1 ? "s" : ""} a partir da data de emissao (${fmtDateStr(today)}). Validade ate ${fmtDateStr(expiryDate)}.`,
        M, Y, { width: CW, align: "center" }
      );

    // \u2500\u2500 Page number footer on ALL pages────────────────────────
    const range = doc.bufferedPageRange();
    const totalPages = range.start + range.count;
    for (let i = range.start; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
        .text(`P\u00e1gina ${i + 1} de ${totalPages}`, 0, PH - 16, { width: PW, align: "center" });
    }

    doc.end();
  });
}
