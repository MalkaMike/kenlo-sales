/**
 * Server-side PDF generation — Executive Clarity v2.0 (PDFKit)
 *
 * DESIGN PRINCIPLE:
 * Answer 4 key questions in order:
 * 1. Who is the client and what is the context?
 * 2. What did they contract?
 * 3. How much will they pay (clear and unequivocal)?
 * 4. What are they getting?
 *
 * STRUCTURE (8 MANDATORY SECTIONS):
 *   1. Cover (full page)
 *   2. Perfil Operacional do Cliente (clean grid format)
 *   3. Estrutura Contratada (cycle, products with "&", add-ons bullets)
 *   4. Investimento Contratual (ONLY real charged value according to cycle)
 *   5. Escopo Incluído na Contratação (explicit bullet list)
 *   6. Serviços Premium Ativados (clear status: Included or —)
 *   7. Funcionalidades da Plataforma (table with checkmarks/dashes)
 *   8. Potencial de Receita Extra com Kenlo (only if applicable)
 *
 * ABSOLUTE RULES:
 * ❌ No blank pages
 * ❌ No redundant discount explanations
 * ❌ No mixing "equivalent values" with "charged values"
 * ❌ No didactic texts about payment cycles
 * ❌ No "Incluído no plano" repetitions
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
}

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 48,
      autoFirstPage: true,
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
    const GAP = 16;
    const MAX_Y = PH - 50;

    // Design-system colors
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
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(v);
    const fmtNum = (v: number) =>
      new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v);

    // -- Helpers --
    const sectionTitle = (title: string, y: number, x: number = M): number => {
      doc.rect(x, y, 3, 12).fill(C.primary);
      doc.fontSize(11).fillColor(C.dark).font("Helvetica-Bold").text(title, x + 10, y + 1, { lineBreak: false });
      return y + 22;
    };

    const lbl = (text: string, x: number, y: number, opts: { color?: string; size?: number; bold?: boolean } = {}) => {
      doc.fontSize(opts.size ?? 7).fillColor(opts.color ?? C.textMuted).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(text, x, y, { lineBreak: false });
    };

    const val = (text: string, x: number, y: number, opts: { color?: string; size?: number; align?: "left" | "right"; width?: number } = {}) => {
      doc.fontSize(opts.size ?? 9).fillColor(opts.color ?? C.dark).font("Helvetica-Bold");
      if (opts.align === "right" && opts.width) {
        doc.text(text, x, y, { width: opts.width, align: "right" });
      } else {
        doc.text(text, x, y, { lineBreak: false });
      }
    };

    const divider = (y: number) => {
      doc.moveTo(M, y).lineTo(M + CW, y).lineWidth(0.3).strokeColor(C.border).stroke();
    };

    const gridRow = (label: string, value: string, x: number, y: number, w: number) => {
      lbl(label, x, y, { size: 6.5, color: C.textMuted });
      val(value, x, y + 10, { size: 9, color: C.dark });
    };

    const needsNewPage = (y: number, needed: number): boolean => y + needed > MAX_Y;

    const newPage = (): number => {
      doc.addPage();
      doc.rect(0, 0, PW, 3).fill(C.primary);
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
        .text(`${data.agencyName || data.clientName} — Proposta Comercial`, M, PH - 20, { lineBreak: false });
      // Consultant info removed from internal pages (only on cover)
      return 30;
    };

    const getAddonDescription = (addonLabel: string): string => {
      const descriptions: Record<string, string> = {
        "Leads": "Captação e gestão inteligente de leads com integração automática",
        "Inteligência": "BI de KPIs de performance e analytics avançado",
        "Assinatura": "Assinatura digital embutida na plataforma",
        "Pay": "Boleto e Split digital embutido na plataforma",
        "Seguros": "Seguros embutido no boleto - ganhe R$10/contrato/mês",
        "Cash": "Antecipe até 24 meses de aluguel para proprietários",
      };
      return descriptions[addonLabel] || "";
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

    // -- Derived data --
    const normalizedProductType = data.productType?.toLowerCase().trim() || "";
    const showImob = ["imob", "both", "imob_loc", "ambos"].includes(normalizedProductType);
    const showLoc = ["loc", "both", "imob_loc", "ambos"].includes(normalizedProductType);
    const selAddons = parseAddons(data.selectedAddons);
    const addonPrices = parseAddonPrices(data.addonPrices);
    const ppBreakdown = parsePostPaid(data.postPaidBreakdown);
    const monthlyRecurring = data.totalAnnual > 0 ? data.totalAnnual / 12 : (data.monthlyLicenseBase || data.totalMonthly || 0);
    const installments = data.installments || 1;

    const imobIsK2 = showImob && data.imobPlan?.toLowerCase() === "k2";
    const locIsK2 = showLoc && data.locPlan?.toLowerCase() === "k2";
    const anyK2 = imobIsK2 || locIsK2;
    const bothK2 = imobIsK2 && locIsK2;

    const hasVip = data.vipIncluded || (data.vipPrice !== undefined && data.vipPrice > 0);
    const hasCS = data.csIncluded || (data.csPrice !== undefined && data.csPrice > 0);
    const hasRevenue = (data.revenueFromBoletos || 0) > 0 || (data.revenueFromInsurance || 0) > 0;

    const komboDiscount = data.komboDiscount || 0;
    const rawKombo = data.komboName || "";
    const komboDisplayMap: Record<string, string> = {
      sem_kombo: "", imob_start: "Kombo Imob Start", imob_pro: "Kombo Imob Pro",
      locacao_pro: "Kombo Loc Pro", core_gestao: "Kombo Core Gestão", elite: "Kombo Elite",
    };
    const normalizedKombo = rawKombo.toLowerCase().replace(/^kombo\s+/i, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    const komboLabel = komboDisplayMap[normalizedKombo] || rawKombo;
    const isKombo = komboLabel !== "";

    const addonLabels = [
      { key: "leads", label: "Leads" },
      { key: "inteligencia", label: "Inteligência" },
      { key: "assinatura", label: "Assinatura" },
      { key: "pay", label: "Pay" },
      { key: "seguros", label: "Seguros" },
      { key: "cash", label: "Cash" },
    ];
    const activeAddons = addonLabels.filter(a => selAddons.includes(a.key));
    const allAddons = addonLabels.filter(a => !selAddons.includes(a.key));

    // ================================================================
    // SECTION 1 — COVER
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
    if (data.vendorEmail) doc.text(data.vendorEmail, 0, PH - 90, { width: PW, align: "center", lineBreak: false });
    if (data.vendorPhone) doc.text(data.vendorPhone, 0, PH - 78, { width: PW, align: "center", lineBreak: false });

    // Bottom accent line
    doc.rect(0, PH - 4, PW, 4).fill(C.primary);

    // ================================================================
    // PAGE 2 — TWO-COLUMN LAYOUT: PERFIL + ESTRUTURA
    // ================================================================
    Y = newPage();
    
    // Left column: Perfil Operacional
    const leftColX = M;
    const rightColX = M + (CW / 2) + 8;
    const colWidth = (CW / 2) - 8;
    
    // LEFT COLUMN - PERFIL OPERACIONAL DO CLIENTE
    let leftY = Y;
    leftY = sectionTitle("Perfil Operacional do Cliente", leftY);
    
    const gridItemW = colWidth - 10;
    
    // Fix "both" → "Ambos"
    let businessTypeText = data.businessType || "Imobiliária";
    const normalizedType = businessTypeText.toLowerCase();
    if (normalizedType === "both") {
      businessTypeText = "Ambos";
    }
    
    // Determine which columns to show
    const showCoretagem = normalizedType === "both" || normalizedType === "ambos" || normalizedType === "corretora";
    const showAdministracao = normalizedType === "both" || normalizedType === "ambos" || normalizedType === "administradora";
    const isSingleColumn = !showCoretagem || !showAdministracao;
    
    // If single column, use full width; if two columns, use half width
    const effectiveColWidth = isSingleColumn ? CW : colWidth;
    const effectiveLeftX = leftColX;
    const effectiveRightX = isSingleColumn ? leftColX : rightColX;
    
    gridRow("Natureza do Negócio", businessTypeText, effectiveLeftX, leftY, isSingleColumn ? CW - 10 : gridItemW);
    leftY += 32;
    
    // CORETAGEM section (left column or full width)
    if (showCoretagem) {
      lbl("CORETAGEM", effectiveLeftX, leftY, { size: 8, color: C.primary, bold: true });
      leftY += 16;
      gridRow("Número de usuários", fmtNum(data.imobUsers || 0), effectiveLeftX, leftY, isSingleColumn ? CW - 10 : gridItemW);
      leftY += 32;
      gridRow("Leads por mês", fmtNum(data.leadsPerMonth || 0), effectiveLeftX, leftY, isSingleColumn ? CW - 10 : gridItemW);
      leftY += 32;
      gridRow("Fechamentos por mês", fmtNum(data.closings || 0), effectiveLeftX, leftY, isSingleColumn ? CW - 10 : gridItemW);
      leftY += 32;
    }
    
    // ADMINISTRAÇÃO DE ALUGUEL section (right column or full width)
    let rightY = Y;
    if (showAdministracao) {
      // If single column, start after Coretagem; if two columns, align with first row
      if (isSingleColumn) {
        rightY = leftY;
      } else {
        rightY += 32; // align with first row after Natureza do Negócio
      }
      
      lbl("ADMINISTRAÇÃO DE ALUGUEL", effectiveRightX, rightY, { size: 8, color: C.primary, bold: true });
      rightY += 16;
      gridRow("Número de contratos sob gestão", fmtNum(data.contracts || 0), effectiveRightX, rightY, isSingleColumn ? CW - 10 : gridItemW);
      rightY += 32;
      gridRow("Novos contratos por mês", fmtNum(data.newContracts || 0), effectiveRightX, rightY, isSingleColumn ? CW - 10 : gridItemW);
      rightY += 32;
      
      const boletoText = data.chargesBoletoToTenant ? (data.boletoAmount ? `Sim (${fmt(data.boletoAmount)})` : "Sim") : "Não";
      gridRow("Inquilino paga boleto?", boletoText, effectiveRightX, rightY, isSingleColumn ? CW - 10 : gridItemW);
      rightY += 32;
      
      const splitText = data.chargesSplitToOwner ? (data.splitAmount ? `Sim (${data.splitAmount}%)` : "Sim") : "Não";
      gridRow("Proprietário paga split?", splitText, effectiveRightX, rightY, isSingleColumn ? CW - 10 : gridItemW);
      rightY += 32;
    }
    
    // Continue from whichever column is taller, then add Estrutura Contratada section
    Y = Math.max(leftY, rightY) + GAP;
    if (needsNewPage(Y, 200)) Y = newPage();
    Y = sectionTitle("Estrutura Contratada", Y);

    // Ciclo de pagamento
    const freqMap: Record<string, string> = {
      monthly: "Mensal", mensal: "Mensal",
      semestral: "Semestral",
      annual: "Anual", anual: "Anual",
      bienal: "Bienal",
    };
    const selFreq = freqMap[data.paymentPlan?.toLowerCase()] || "Anual";
    lbl("Ciclo de Pagamento", M, Y, { size: 6.5, color: C.textMuted });
    val(selFreq, M, Y + 10, { size: 10, color: C.primary });
    Y += 28;

    // Produtos e planos (use "&" between products)
    const prodParts: string[] = [];
    if (showImob) prodParts.push(`Kenlo Imob ${(data.imobPlan || "K").toUpperCase()}`);
    if (showLoc) prodParts.push(`Kenlo Locação ${(data.locPlan || "K").toUpperCase()}`);
    lbl("Produtos e Planos", M, Y, { size: 6.5, color: C.textMuted });
    val(prodParts.join(" & "), M, Y + 10, { size: 10, color: C.dark });
    Y += 28;

    // Kombo (if applicable)
    if (isKombo) {
      lbl("Kombo Ativado", M, Y, { size: 6.5, color: C.textMuted });
      val(komboLabel, M, Y + 10, { size: 10, color: C.green });
      Y += 28;
    }

    // Add-ons selecionados (boxed style with descriptions)
    if (activeAddons.length > 0) {
      lbl("Add-ons Selecionados", M, Y, { size: 7, color: C.textMuted, bold: true });
      Y += 12;
      for (const addon of activeAddons) {
        // Box style
        doc.rect(M, Y, CW, 24).fillAndStroke(C.greenLight, C.green);
        doc.fontSize(8).fillColor(C.green).font("Helvetica-Bold")
          .text(`Kenlo ${addon.label}`, M + 6, Y + 4, { lineBreak: false });
        // Add description (TODO: get from config)
        const desc = getAddonDescription(addon.label);
        doc.fontSize(6.5).fillColor(C.textMuted).font("Helvetica")
          .text(desc, M + 6, Y + 14, { lineBreak: false });
        Y += 28;
      }
      Y += 4;
    }

    // Add-ons não incluídos (grayed boxes)
    if (allAddons.length > 0) {
      lbl("Add-ons Não Incluídos", M, Y, { size: 7, color: C.textMuted, bold: true });
      Y += 12;
      for (const addon of allAddons) {
        // Grayed box
        doc.rect(M, Y, CW, 16).fillAndStroke("#F5F5F5", C.border);
        doc.fontSize(7).fillColor(C.textLight).font("Helvetica")
          .text(`Kenlo ${addon.label}`, M + 6, Y + 4, { lineBreak: false });
        Y += 20;
      }
      Y += 4;
    }

    // ================================================================
    // SECTION 4 — INVESTIMENTO CONTRATUAL
    // ================================================================
    if (needsNewPage(Y, 200)) Y = newPage();
    Y = sectionTitle("Investimento Contratual", Y);

    const normPlan = data.paymentPlan?.toLowerCase() || "annual";
    const totalAnnual = data.totalAnnual || 0;
    const totalImplantation = data.implantationFee || 0;
    const totalInvestment = totalAnnual + totalImplantation;

    // Display ONLY the real charged value according to cycle
    if (normPlan === "monthly" || normPlan === "mensal") {
      lbl("Contrato Mensal", M, Y, { size: 7, color: C.textMuted });
      Y += 12;
      const monthlyValue = data.totalMonthly || 0;
      doc.fontSize(18).fillColor(C.primary).font("Helvetica-Bold")
        .text(fmt(monthlyValue), M, Y, { lineBreak: false });
      doc.fontSize(10).fillColor(C.textMuted).font("Helvetica")
        .text(" / mês", M + doc.widthOfString(fmt(monthlyValue)) + 4, Y + 6, { lineBreak: false });
      Y += 28;
    } else if (normPlan === "semestral") {
      const semiannualTotal = (data.totalMonthly || 0) * 6;
      lbl("Contrato Semestral", M, Y, { size: 7, color: C.textMuted });
      Y += 12;
      doc.fontSize(18).fillColor(C.primary).font("Helvetica-Bold")
        .text(fmt(semiannualTotal), M, Y, { lineBreak: false });
      doc.fontSize(10).fillColor(C.textMuted).font("Helvetica")
        .text(" a cada 6 meses", M + doc.widthOfString(fmt(semiannualTotal)) + 4, Y + 6, { lineBreak: false });
      Y += 28;
    } else {
      // Annual or Bienal
      const periodLabel = normPlan === "bienal" ? "Bienal" : "Anual";
      lbl(`Contrato ${periodLabel}`, M, Y, { size: 7, color: C.textMuted });
      Y += 12;
      
      // Total investment
      lbl("Investimento Total:", M, Y, { size: 7, color: C.textMuted });
      Y += 10;
      doc.fontSize(18).fillColor(C.primary).font("Helvetica-Bold")
        .text(fmt(totalInvestment), M, Y, { lineBreak: false });
      Y += 24;

      // Installment breakdown - show ONLY selected option
      lbl(`Parcelado em ${installments}x de ${fmt(totalInvestment / installments)}`, M, Y, { size: 8, color: C.text });
      Y += 16;
    }

    Y += GAP;

    // ================================================================
    // PAGE 4 — TWO-COLUMN LAYOUT: ESCOPO + SERVIÇOS PREMIUM
    // ================================================================
    if (needsNewPage(Y, 200)) Y = newPage();
    
    // LEFT COLUMN - ESCOPO INCLUÍDO
    let leftY2 = Y;
    leftY2 = sectionTitle("Escopo Incluído na Contratação", leftY2);
    
    const scopeItems: string[] = [];
    
    // Users
    if (data.imobUsers && data.imobUsers > 0) {
      scopeItems.push(`${fmtNum(data.imobUsers)} usuários inclusos`);
    }
    
    // Contracts
    if (data.contracts && data.contracts > 0) {
      scopeItems.push(`${fmtNum(data.contracts)} contratos inclusos`);
    }
    
    // WhatsApp
    if (data.wantsWhatsApp) {
      scopeItems.push("WhatsApp integrado");
      scopeItems.push("100 conversas inclusas");
    }
    
    // Digital signatures (if Assinatura addon)
    if (selAddons.includes("assinatura")) {
      scopeItems.push("Assinaturas digitais ilimitadas");
    }
    
    // Explorer user (if Inteligência addon)
    if (selAddons.includes("inteligencia")) {
      scopeItems.push("1 usuário Explorer (BI)");
    }
    
    // Implementation
    scopeItems.push(`Implantação: ${fmt(totalImplantation)}`);
    
    // DO NOT include premium services here (avoid redundancy)
    
    for (const item of scopeItems) {
      doc.fontSize(8).fillColor(C.text).font("Helvetica")
        .text(`• ${item}`, leftColX + 10, leftY2, { lineBreak: false });
      leftY2 += 14;
    }
    
    // RIGHT COLUMN - SERVIÇOS PREMIUM ATIVADOS
    let rightY2 = Y;
    rightY2 = sectionTitle("Serviços Premium Ativados", rightY2, rightColX);
    
    // VIP Support (status only, no redundancy)
    const vipStatus = hasVip ? (data.vipIncluded ? "Incluído" : fmt(data.vipPrice || 97) + "/mês") : "—";
    const vipColor = hasVip ? (data.vipIncluded ? C.green : C.text) : C.textLight;
    doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold")
      .text("Suporte VIP", rightColX + 10, rightY2, { lineBreak: false });
    doc.fontSize(8).fillColor(vipColor).font("Helvetica")
      .text(vipStatus, rightColX + 10, rightY2, { width: colWidth - 20, align: "right" });
    rightY2 += 16;
    
    // CS Dedicado
    const csStatus = hasCS ? (data.csIncluded ? "Incluído" : fmt(data.csPrice || PREMIUM_SERVICES.csDedicado.monthlyPrice) + "/mês") : "—";
    const csColor = hasCS ? (data.csIncluded ? C.green : C.text) : C.textLight;
    doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold")
      .text("CS Dedicado", rightColX + 10, rightY2, { lineBreak: false });
    doc.fontSize(8).fillColor(csColor).font("Helvetica")
      .text(csStatus, rightColX + 10, rightY2, { width: colWidth - 20, align: "right" });
    rightY2 += 16;
    
    // Treinamentos
    const trainingStatus = anyK2
      ? (bothK2 ? "Incluído (4x online ou 2x presencial)" : "Incluído (2x online ou 1x presencial)")
      : "—";
    const trainingColor = anyK2 ? C.green : C.textLight;
    doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold")
      .text("Treinamentos", rightColX + 10, rightY2, { lineBreak: false });
    doc.fontSize(8).fillColor(trainingColor).font("Helvetica")
      .text(trainingStatus, rightColX + 10, rightY2, { width: colWidth - 20, align: "right" });
    rightY2 += 16;
    
    // Continue from whichever column is taller
    Y = Math.max(leftY2, rightY2) + GAP;

    // ================================================================
    // SECTION 7 — FUNCIONALIDADES DA PLATAFORMA
    // ================================================================
    if (needsNewPage(Y, 300)) Y = newPage();
    Y = sectionTitle("Funcionalidades da Plataforma", Y);

    // Get features for each product/plan
    const imobAllFeatures = showImob ? getAllFeatures("imob") : [];
    const locAllFeatures = showLoc ? getAllFeatures("locacao") : [];
    
    // Filter by selected plan
    const imobPlanKey = (data.imobPlan || "k").toLowerCase() as PlanTier;
    const locPlanKey = (data.locPlan || "k").toLowerCase() as PlanTier;
    
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
      const col1W = CW * 0.5;
      const col2W = CW * 0.25;
      const col3W = CW * 0.25;
      const rowHeight = 16;

      // Header background
      doc.rect(M, Y, CW, 18).fill(C.bgSoft);
      doc.fontSize(7).fillColor(C.textMuted).font("Helvetica-Bold")
        .text("Funcionalidade", M + 6, Y + 5, { lineBreak: false });
      doc.fontSize(7).fillColor(C.textMuted).font("Helvetica-Bold")
        .text("Imob", M + col1W, Y + 5, { width: col2W, align: "center" });
      doc.fontSize(7).fillColor(C.textMuted).font("Helvetica-Bold")
        .text("Loc", M + col1W + col2W, Y + 5, { width: col3W, align: "center" });
      Y += 22;

      // Combine all features
      const allFeatureNames = Array.from(new Set([
        ...imobFeatures.map(f => f.name),
        ...locFeatures.map(f => f.name)
      ]));

      let rowIndex = 0;
      for (const fname of allFeatureNames) {
        const imobHas = imobFeatures.some(f => f.name === fname && f.included);
        const locHas = locFeatures.some(f => f.name === fname && f.included);

        // Alternating row background
        if (rowIndex % 2 === 0) {
          doc.rect(M, Y, CW, rowHeight).fill("#FAFAFA");
        }

        doc.fontSize(7).fillColor(C.text).font("Helvetica")
          .text(fname, M + 6, Y + 4, { width: col1W - 10, lineBreak: false });
        
        // Checkmark with background circle
        if (imobHas) {
          doc.circle(M + col1W + col2W / 2, Y + 8, 6).fill(C.greenLight);
          doc.fontSize(8).fillColor(C.green).font("Helvetica-Bold")
            .text("✔", M + col1W, Y + 3, { width: col2W, align: "center" });
        } else {
          doc.fontSize(7).fillColor(C.textLight).font("Helvetica")
            .text("—", M + col1W, Y + 4, { width: col2W, align: "center" });
        }
        
        if (locHas) {
          doc.circle(M + col1W + col2W + col3W / 2, Y + 8, 6).fill(C.greenLight);
          doc.fontSize(8).fillColor(C.green).font("Helvetica-Bold")
            .text("✔", M + col1W + col2W, Y + 3, { width: col3W, align: "center" });
        } else {
          doc.fontSize(7).fillColor(C.textLight).font("Helvetica")
            .text("—", M + col1W + col2W, Y + 4, { width: col3W, align: "center" });
        }
        
        Y += rowHeight;
        rowIndex++;
      }
    } else {
      // Single product: table format with single column
      const features = showImob ? imobFeatures : locFeatures;
      const col1W = CW * 0.7;
      const col2W = CW * 0.3;
      const rowHeight = 16;
      
      // Header background
      doc.rect(M, Y, CW, 18).fill(C.bgSoft);
      doc.fontSize(7).fillColor(C.textMuted).font("Helvetica-Bold")
        .text("Funcionalidade", M + 6, Y + 5, { lineBreak: false });
      doc.fontSize(7).fillColor(C.textMuted).font("Helvetica-Bold")
        .text("Status", M + col1W, Y + 5, { width: col2W, align: "center" });
      Y += 22;
      
      let rowIndex = 0;
      for (const feat of features) {
        // Alternating row background
        if (rowIndex % 2 === 0) {
          doc.rect(M, Y, CW, rowHeight).fill("#FAFAFA");
        }
        
        doc.fontSize(7).fillColor(C.text).font("Helvetica")
          .text(feat.name, M + 6, Y + 4, { width: col1W - 10, lineBreak: false });
        
        // Checkmark with background circle
        if (feat.included) {
          doc.circle(M + col1W + col2W / 2, Y + 8, 6).fill(C.greenLight);
          doc.fontSize(8).fillColor(C.green).font("Helvetica-Bold")
            .text("✔", M + col1W, Y + 3, { width: col2W, align: "center" });
        } else {
          doc.fontSize(7).fillColor(C.textLight).font("Helvetica")
            .text("—", M + col1W, Y + 4, { width: col2W, align: "center" });
        }
        
        Y += rowHeight;
        rowIndex++;
      }
    }

    Y += GAP;

    // ================================================================
    // SECTION 8 — POTENCIAL DE RECEITA EXTRA COM KENLO
    // ================================================================
    if (hasRevenue) {
      if (needsNewPage(Y, 150)) Y = newPage();
      Y = sectionTitle("Potencial de Receita Extra com Kenlo", Y);

      // Revenue from Split
      if (data.revenueFromBoletos && data.revenueFromBoletos > 0) {
        lbl("Receita com Split", M + 10, Y, { size: 7, color: C.textMuted });
        val(fmt(data.revenueFromBoletos) + "/mês", M + 10, Y + 10, { size: 9, color: C.green });
        Y += 28;
      }

      // Revenue from Insurance
      if (data.revenueFromInsurance && data.revenueFromInsurance > 0) {
        lbl("Receita com Seguros", M + 10, Y, { size: 7, color: C.textMuted });
        val(fmt(data.revenueFromInsurance) + "/mês", M + 10, Y + 10, { size: 9, color: C.green });
        Y += 28;
      }

      Y += GAP;
    }

    // ================================================================
    // FINALIZE
    // ================================================================
    doc.end();
  });
}
