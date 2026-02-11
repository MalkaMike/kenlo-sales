/**
 * Server-side PDF generation — MASTER REDESIGN v4 (PDFKit)
 *
 * STRUCTURE (4 PAGES MAX):
 *   1️⃣ Cover (simplified)
 *   2️⃣ Strategic Overview (3-column grid)
 *   3️⃣ Platform Functionalities (comparison matrix)
 *   4️⃣ Extra Revenue Kenlo (only if applicable)
 *
 * ABSOLUTE RULES:
 * ❌ No blank pages
 * ❌ No duplicated content
 * ❌ No alternative options shown (only what is selected)
 * ❌ No horizontal overflow
 * ❌ No inconsistent bullet styles
 * ❌ Maximum 4 pages
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
      margin: 40,
      autoFirstPage: true,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // -- Constants --
    const PW = 595.28;
    const PH = 841.89;
    const M = 40; // margin
    const CW = PW - M * 2; // content width
    const GAP = 10;
    const MAX_Y = PH - 40;

    // Design-system colors
    const C = {
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
    };

    const fmt = (v: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(v);
    const fmtNum = (v: number) =>
      new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v);

    // -- Typography helpers --
    const h1 = (text: string, x: number, y: number, maxW?: number): number => {
      doc.rect(x, y, 3, 13).fill(C.primary);
      doc.fontSize(10).fillColor(C.dark).font("Helvetica-Bold")
        .text(text, x + 8, y + 1, { width: maxW || CW, lineBreak: false });
      return y + 18;
    };

    const h2 = (text: string, x: number, y: number): number => {
      doc.fontSize(7.5).fillColor(C.textMuted).font("Helvetica-Bold")
        .text(text.toUpperCase(), x, y, { lineBreak: false });
      return y + 12;
    };

    const label = (text: string, x: number, y: number, opts: { color?: string; size?: number; bold?: boolean } = {}) => {
      doc.fontSize(opts.size ?? 6.5).fillColor(opts.color ?? C.textMuted).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(text, x, y, { lineBreak: false });
    };

    const value = (text: string, x: number, y: number, opts: { color?: string; size?: number } = {}) => {
      doc.fontSize(opts.size ?? 8.5).fillColor(opts.color ?? C.dark).font("Helvetica-Bold")
        .text(text, x, y, { lineBreak: false });
    };

    const labelValue = (lbl: string, val: string, x: number, y: number, w: number): number => {
      label(lbl, x, y);
      value(val, x, y + 9);
      return y + 24;
    };

    const divider = (x: number, y: number, w: number) => {
      doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.3).strokeColor(C.border).stroke();
    };

    const newPage = (): number => {
      doc.addPage();
      doc.rect(0, 0, PW, 3).fill(C.primary);
      const footerName = data.agencyName || data.clientName || "";
      doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
        .text(`${footerName} — Proposta Comercial`, M, PH - 18, { lineBreak: false });
      return 20;
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

    const getAddonDescription = (addonLabel: string): string => {
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

    // -- Derived data --
    const normalizedProductType = data.productType?.toLowerCase().trim() || "";
    const showImob = ["imob", "both", "imob_loc", "ambos"].includes(normalizedProductType);
    const showLoc = ["loc", "both", "imob_loc", "ambos"].includes(normalizedProductType);
    const selAddons = parseAddons(data.selectedAddons);
    const addonPrices = parseAddonPrices(data.addonPrices);
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
    const inactiveAddons = addonLabels.filter(a => !selAddons.includes(a.key));

    // Frequency map
    const freqMap: Record<string, { label: string; discount: string }> = {
      monthly: { label: "Mensal", discount: "" },
      mensal: { label: "Mensal", discount: "" },
      semestral: { label: "Semestral", discount: "–10%" },
      annual: { label: "Anual", discount: "–20%" },
      anual: { label: "Anual", discount: "–20%" },
      bienal: { label: "Bienal", discount: "–25%" },
    };
    const normPlan = data.paymentPlan?.toLowerCase() || "annual";
    const freqInfo = freqMap[normPlan] || { label: "Anual", discount: "–20%" };

    // Business type
    const normalizedBizType = (data.businessType || "").toLowerCase();
    const showCoretagem = normalizedBizType === "both" || normalizedBizType === "ambos" || normalizedBizType === "corretora";
    const showAdministracao = normalizedBizType === "both" || normalizedBizType === "ambos" || normalizedBizType === "administradora";

    // ================================================================
    // 1️⃣ PAGE 1 — COVER
    // ================================================================
    let Y = 0;
    const cx = PW / 2;

    // Top accent
    doc.rect(0, 0, PW, 4).fill(C.primary);

    // Logo
    const logoPath = path.join(process.cwd(), "client/public/kenlo-logo-red.png");
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, cx - 55, 200, { height: 32 }); } catch (_) {}
    } else {
      doc.fontSize(28).fillColor(C.primary).font("Helvetica-Bold")
        .text("Kenlo", 0, 210, { width: PW, align: "center" });
    }

    // Title
    doc.fontSize(24).fillColor(C.dark).font("Helvetica-Bold")
      .text("Proposta Comercial", 0, 260, { width: PW, align: "center" });

    // Thin divider
    doc.moveTo(cx - 50, 292).lineTo(cx + 50, 292).lineWidth(0.5).strokeColor(C.border).stroke();

    // Agency name
    const coverName = data.agencyName || data.clientName || "";
    if (coverName) {
      doc.fontSize(15).fillColor(C.text).font("Helvetica")
        .text(coverName, 0, 310, { width: PW, align: "center" });
    }

    // Products contracted
    const prodParts: string[] = [];
    if (showImob) prodParts.push(`Kenlo Imob ${(data.imobPlan || "K").toUpperCase()}`);
    if (showLoc) prodParts.push(`Kenlo Locação ${(data.locPlan || "K").toUpperCase()}`);
    doc.fontSize(11).fillColor(C.primary).font("Helvetica-Bold")
      .text(prodParts.join(" & "), 0, 340, { width: PW, align: "center" });

    // Cycle
    const cycleText = `Plano ${freqInfo.label}${freqInfo.discount ? ` (${freqInfo.discount})` : ""}`;
    doc.fontSize(9).fillColor(C.textMuted).font("Helvetica")
      .text(cycleText, 0, 360, { width: PW, align: "center" });

    // Date
    const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    doc.fontSize(9).fillColor(C.textLight).font("Helvetica")
      .text(dateStr, 0, 380, { width: PW, align: "center" });

    // Bottom accent
    doc.rect(0, PH - 4, PW, 4).fill(C.primary);

    // ================================================================
    // 2️⃣ PAGE 2 — STRATEGIC OVERVIEW (3-COLUMN GRID)
    // ================================================================
    Y = newPage();

    // 3-column grid constants
    const colGap = 14;
    const col3W = (CW - colGap * 2) / 3;
    const col1X = M;
    const col2X = M + col3W + colGap;
    const col3X = M + (col3W + colGap) * 2;

    // ──────────────────────────────────────────────
    // 🔵 COLUMN 1 — PERFIL OPERACIONAL DO CLIENTE
    // ──────────────────────────────────────────────
    let c1Y = h1("Perfil Operacional", col1X, Y, col3W);

    if (showCoretagem && showAdministracao) {
      // Both: show sub-blocks with divider
      c1Y = h2("Coretagem", col1X, c1Y);
      c1Y = labelValue("Nº de usuários", fmtNum(data.imobUsers || 0), col1X, c1Y, col3W);
      c1Y = labelValue("Leads / mês", fmtNum(data.leadsPerMonth || 0), col1X, c1Y, col3W);
      c1Y = labelValue("Fechamentos / mês", fmtNum(data.closings || 0), col1X, c1Y, col3W);

      divider(col1X, c1Y, col3W);
      c1Y += 8;

      c1Y = h2("Administração", col1X, c1Y);
      c1Y = labelValue("Nº de contratos", fmtNum(data.contracts || 0), col1X, c1Y, col3W);
      c1Y = labelValue("Novos contratos / mês", fmtNum(data.newContracts || 0), col1X, c1Y, col3W);
      const boletoText = data.chargesBoletoToTenant ? (data.boletoAmount ? `Sim (${fmt(data.boletoAmount)})` : "Sim") : "Não";
      c1Y = labelValue("Cobra boleto?", boletoText, col1X, c1Y, col3W);
      const splitText = data.chargesSplitToOwner ? (data.splitAmount ? `Sim (${data.splitAmount}%)` : "Sim") : "Não";
      c1Y = labelValue("Cobra split?", splitText, col1X, c1Y, col3W);
    } else if (showCoretagem) {
      c1Y = h2("Coretagem", col1X, c1Y);
      c1Y = labelValue("Nº de usuários", fmtNum(data.imobUsers || 0), col1X, c1Y, col3W);
      c1Y = labelValue("Leads / mês", fmtNum(data.leadsPerMonth || 0), col1X, c1Y, col3W);
      c1Y = labelValue("Fechamentos / mês", fmtNum(data.closings || 0), col1X, c1Y, col3W);
    } else if (showAdministracao) {
      c1Y = h2("Administração", col1X, c1Y);
      c1Y = labelValue("Nº de contratos", fmtNum(data.contracts || 0), col1X, c1Y, col3W);
      c1Y = labelValue("Novos contratos / mês", fmtNum(data.newContracts || 0), col1X, c1Y, col3W);
      const boletoText = data.chargesBoletoToTenant ? (data.boletoAmount ? `Sim (${fmt(data.boletoAmount)})` : "Sim") : "Não";
      c1Y = labelValue("Cobra boleto?", boletoText, col1X, c1Y, col3W);
      const splitText = data.chargesSplitToOwner ? (data.splitAmount ? `Sim (${data.splitAmount}%)` : "Sim") : "Não";
      c1Y = labelValue("Cobra split?", splitText, col1X, c1Y, col3W);
    }

    // ──────────────────────────────────────────────
    // 🔵 COLUMN 2 — ESTRUTURA CONTRATADA
    // ──────────────────────────────────────────────
    let c2Y = h1("Estrutura Contratada", col2X, Y, col3W);

    // Block 1: Ciclo selecionado (ONLY selected)
    c2Y = h2("Ciclo", col2X, c2Y);
    value(`Plano ${freqInfo.label}${freqInfo.discount ? ` (${freqInfo.discount})` : ""}`, col2X, c2Y, { color: C.primary, size: 9 });
    c2Y += 16;

    // Block 2: Produtos e Planos
    c2Y = h2("Produtos e Planos", col2X, c2Y);
    value(prodParts.join(" & "), col2X, c2Y, { size: 8.5 });
    c2Y += 14;
    if (isKombo) {
      label(komboLabel, col2X, c2Y, { color: C.green, size: 7, bold: true });
      c2Y += 12;
    }
    c2Y += 4;

    // Block 3: Add-ons Selecionados (bordered boxes)
    if (activeAddons.length > 0) {
      c2Y = h2("Add-ons Selecionados", col2X, c2Y);
      for (const addon of activeAddons) {
        // Soft bordered box
        doc.roundedRect(col2X, c2Y, col3W, 22, 3).fillAndStroke(C.greenLight, C.greenBorder);
        doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
          .text(`Kenlo ${addon.label}`, col2X + 5, c2Y + 3, { lineBreak: false });
        const desc = getAddonDescription(addon.label);
        if (desc) {
          doc.fontSize(5.5).fillColor(C.textMuted).font("Helvetica")
            .text(desc, col2X + 5, c2Y + 13, { width: col3W - 10, lineBreak: false });
        }
        c2Y += 26;
      }
      c2Y += 2;
    }

    // Block 4: Add-ons Não Incluídos (grey, comma separated)
    if (inactiveAddons.length > 0) {
      c2Y = h2("Não Incluídos", col2X, c2Y);
      const inactiveNames = inactiveAddons.map(a => a.label).join(", ");
      doc.fontSize(6.5).fillColor(C.textLight).font("Helvetica")
        .text(inactiveNames, col2X, c2Y, { width: col3W, lineBreak: true });
      c2Y += 14;
    }

    // ──────────────────────────────────────────────
    // 🔵 COLUMN 3 — INVESTIMENTO & ESCOPO
    // ──────────────────────────────────────────────
    let c3Y = h1("Investimento e Escopo", col3X, Y, col3W);

    // Block 1: Investimento Contratual
    c3Y = h2("Investimento Contratual", col3X, c3Y);

    const totalAnnual = data.totalAnnual || 0;
    const totalImplantation = data.implantationFee || 0;

    if (normPlan === "monthly" || normPlan === "mensal") {
      label("Contrato Mensal", col3X, c3Y, { size: 6 });
      c3Y += 9;
      doc.fontSize(16).fillColor(C.red).font("Helvetica-Bold")
        .text(fmt(data.totalMonthly || 0), col3X, c3Y, { lineBreak: false });
      doc.fontSize(7).fillColor(C.textMuted).font("Helvetica")
        .text(" / mês", col3X + doc.widthOfString(fmt(data.totalMonthly || 0)) + 2, c3Y + 7, { lineBreak: false });
      c3Y += 22;
    } else if (normPlan === "semestral") {
      const semiTotal = (data.totalMonthly || 0) * 6;
      label("Contrato Semestral", col3X, c3Y, { size: 6 });
      c3Y += 9;
      doc.fontSize(16).fillColor(C.red).font("Helvetica-Bold")
        .text(fmt(semiTotal), col3X, c3Y, { lineBreak: false });
      c3Y += 22;
      if (installments > 1) {
        label(`Parcelado em ${installments}x de ${fmt(semiTotal / installments)}`, col3X, c3Y, { size: 6.5, color: C.text });
        c3Y += 12;
      }
    } else {
      const periodLabel = normPlan === "bienal" ? "Bienal" : "Anual";
      const totalInvestment = totalAnnual + totalImplantation;
      label(`Contrato ${periodLabel}`, col3X, c3Y, { size: 6 });
      c3Y += 9;
      doc.fontSize(16).fillColor(C.red).font("Helvetica-Bold")
        .text(fmt(totalInvestment), col3X, c3Y, { lineBreak: false });
      c3Y += 22;
      if (installments > 1) {
        label(`Parcelado em ${installments}x de ${fmt(totalInvestment / installments)}`, col3X, c3Y, { size: 6.5, color: C.text });
        c3Y += 12;
      }
    }

    if (totalImplantation > 0) {
      label(`Inclui implantação: ${fmt(totalImplantation)}`, col3X, c3Y, { size: 6, color: C.textMuted });
      c3Y += 14;
    }

    divider(col3X, c3Y, col3W);
    c3Y += 8;

    // Block 2: Escopo Incluído
    c3Y = h2("Escopo Incluído", col3X, c3Y);

    const scopeItems: string[] = [];
    if (data.imobUsers && data.imobUsers > 0) scopeItems.push(`${fmtNum(data.imobUsers)} usuários inclusos`);
    if (data.contracts && data.contracts > 0) scopeItems.push(`${fmtNum(data.contracts)} contratos sob gestão`);
    if (selAddons.includes("assinatura")) scopeItems.push("15 assinaturas digitais");
    if (data.wantsWhatsApp) scopeItems.push("100 conversas WhatsApp/mês");
    if (selAddons.includes("inteligencia")) scopeItems.push("1 usuário Explorer");

    for (const item of scopeItems) {
      doc.fontSize(7).fillColor(C.text).font("Helvetica")
        .text(item, col3X, c3Y, { width: col3W, lineBreak: false });
      c3Y += 12;
    }

    if (scopeItems.length > 0) {
      divider(col3X, c3Y + 2, col3W);
      c3Y += 10;
    }

    // Block 3: Serviços Premium (mini-table)
    c3Y = h2("Serviços Premium", col3X, c3Y);

    // VIP
    const vipStatus = hasVip ? (data.vipIncluded ? "Ativado" : fmt(data.vipPrice || 97) + "/mês") : "Não incluído";
    const vipColor = hasVip ? C.green : C.textLight;
    doc.fontSize(6.5).fillColor(C.dark).font("Helvetica-Bold")
      .text("Suporte VIP", col3X, c3Y, { lineBreak: false });
    doc.fontSize(6.5).fillColor(vipColor).font("Helvetica")
      .text(vipStatus, col3X, c3Y, { width: col3W, align: "right" });
    c3Y += 12;

    // CS Dedicado
    const csStatus = hasCS ? (data.csIncluded ? "Ativado" : fmt(data.csPrice || PREMIUM_SERVICES.csDedicado.monthlyPrice) + "/mês") : "Não incluído";
    const csColor = hasCS ? C.green : C.textLight;
    doc.fontSize(6.5).fillColor(C.dark).font("Helvetica-Bold")
      .text("CS Dedicado", col3X, c3Y, { lineBreak: false });
    doc.fontSize(6.5).fillColor(csColor).font("Helvetica")
      .text(csStatus, col3X, c3Y, { width: col3W, align: "right" });
    c3Y += 12;

    // Treinamentos
    const trainingStatus = anyK2
      ? (bothK2 ? "4x online ou 2x presencial" : "2x online ou 1x presencial")
      : "Não incluído";
    const trainingColor = anyK2 ? C.green : C.textLight;
    doc.fontSize(6.5).fillColor(C.dark).font("Helvetica-Bold")
      .text("Treinamentos", col3X, c3Y, { lineBreak: false });
    doc.fontSize(6.5).fillColor(trainingColor).font("Helvetica")
      .text(trainingStatus, col3X, c3Y, { width: col3W, align: "right" });
    c3Y += 12;

    // ================================================================
    // 3️⃣ PAGE 3 — PLATFORM FUNCTIONALITIES
    // ================================================================
    Y = newPage();

    const imobAllFeatures = showImob ? getAllFeatures("imob") : [];
    const locAllFeatures = showLoc ? getAllFeatures("locacao") : [];

    const imobPlanKey = (data.imobPlan || "k").toLowerCase() as PlanTier;
    const locPlanKey = (data.locPlan || "k").toLowerCase() as PlanTier;

    const imobFeatures = imobAllFeatures.map(f => ({
      name: f.name,
      description: f.description || "",
      included: imobPlanKey === "prime" ? f.includedInPrime : imobPlanKey === "k" ? f.includedInK : f.includedInK2,
    }));

    const locFeatures = locAllFeatures.map(f => ({
      name: f.name,
      description: f.description || "",
      included: locPlanKey === "prime" ? f.includedInPrime : locPlanKey === "k" ? f.includedInK : f.includedInK2,
    }));

    if (showImob && showLoc) {
      // 2 products: split page vertically
      const halfW = (CW - colGap) / 2;
      const leftX = M;
      const rightX = M + halfW + colGap;

      // LEFT: Imob
      let lY = h1(`Kenlo Imob — Plano ${(data.imobPlan || "K").toUpperCase()}`, leftX, Y, halfW);

      // Highlight band for selected plan
      doc.rect(leftX, lY - 2, halfW, 14).fill(C.greenLight);
      doc.fontSize(6.5).fillColor(C.green).font("Helvetica-Bold")
        .text(`Plano ${(data.imobPlan || "K").toUpperCase()} selecionado`, leftX + 4, lY + 1, { lineBreak: false });
      lY += 16;

      for (const feat of imobFeatures) {
        if (feat.included) {
          doc.circle(leftX + 4, lY + 3.5, 3.5).fill(C.green);
          doc.fontSize(5).fillColor("#FFFFFF").font("Helvetica-Bold")
            .text("v", leftX + 1.8, lY + 0.8, { lineBreak: false });
        } else {
          doc.fontSize(7).fillColor(C.textLight).font("Helvetica")
            .text("\u2014", leftX + 1, lY, { lineBreak: false });
        }
        doc.fontSize(7).fillColor(feat.included ? C.text : C.textLight).font("Helvetica")
          .text(feat.name, leftX + 14, lY, { lineBreak: false });
        lY += 11;
        if (feat.description) {
          doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
            .text(feat.description, leftX + 14, lY, { width: halfW - 20, lineBreak: true });
          lY += 9;
        }
      }

      // RIGHT: Locação
      let rY = h1(`Kenlo Locação — Plano ${(data.locPlan || "K").toUpperCase()}`, rightX, Y, halfW);

      // Highlight band
      doc.rect(rightX, rY - 2, halfW, 14).fill(C.greenLight);
      doc.fontSize(6.5).fillColor(C.green).font("Helvetica-Bold")
        .text(`Plano ${(data.locPlan || "K").toUpperCase()} selecionado`, rightX + 4, rY + 1, { lineBreak: false });
      rY += 16;

      for (const feat of locFeatures) {
        if (feat.included) {
          doc.circle(rightX + 4, rY + 3.5, 3.5).fill(C.green);
          doc.fontSize(5).fillColor("#FFFFFF").font("Helvetica-Bold")
            .text("v", rightX + 1.8, rY + 0.8, { lineBreak: false });
        } else {
          doc.fontSize(7).fillColor(C.textLight).font("Helvetica")
            .text("\u2014", rightX + 1, rY, { lineBreak: false });
        }
        doc.fontSize(7).fillColor(feat.included ? C.text : C.textLight).font("Helvetica")
          .text(feat.name, rightX + 14, rY, { lineBreak: false });
        rY += 11;
        if (feat.description) {
          doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
            .text(feat.description, rightX + 14, rY, { width: halfW - 20, lineBreak: true });
          rY += 9;
        }
      }

      Y = Math.max(lY, rY);
    } else {
      // Single product
      const features = showImob ? imobFeatures : locFeatures;
      const productName = showImob
        ? `Kenlo Imob — Plano ${(data.imobPlan || "K").toUpperCase()}`
        : `Kenlo Locação — Plano ${(data.locPlan || "K").toUpperCase()}`;

      Y = h1(productName, M, Y);

      // Highlight band
      const planName = showImob ? (data.imobPlan || "K").toUpperCase() : (data.locPlan || "K").toUpperCase();
      doc.rect(M, Y - 2, CW, 14).fill(C.greenLight);
      doc.fontSize(6.5).fillColor(C.green).font("Helvetica-Bold")
        .text(`Plano ${planName} selecionado`, M + 4, Y + 1, { lineBreak: false });
      Y += 16;

      for (const feat of features) {
        if (feat.included) {
          doc.circle(M + 4, Y + 3.5, 3.5).fill(C.green);
          doc.fontSize(5).fillColor("#FFFFFF").font("Helvetica-Bold")
            .text("v", M + 1.8, Y + 0.8, { lineBreak: false });
        } else {
          doc.fontSize(7).fillColor(C.textLight).font("Helvetica")
            .text("\u2014", M + 1, Y, { lineBreak: false });
        }
        doc.fontSize(7).fillColor(feat.included ? C.text : C.textLight).font("Helvetica")
          .text(feat.name, M + 14, Y, { lineBreak: false });
        Y += 11;
        if (feat.description) {
          doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
            .text(feat.description, M + 14, Y, { width: CW - 20, lineBreak: true });
          Y += 9;
        }
      }
    }

    // ================================================================
    // 4️⃣ PAGE 4 — EXTRA REVENUE KENLO (ONLY IF APPLICABLE)
    // ================================================================
    // Determine which revenue cards to show
    const hasPay = selAddons.includes("pay");
    const hasSeguros = selAddons.includes("seguros");
    const hasCash = selAddons.includes("cash");
    const hasRevenueFromPay = hasPay && (data.revenueFromBoletos || 0) > 0;
    const hasRevenueFromSeguros = hasSeguros && (data.revenueFromInsurance || 0) > 0;
    const hasAnyRevenueStream = hasRevenueFromPay || hasRevenueFromSeguros || hasCash;

    if (hasAnyRevenueStream) {
      Y = newPage();

      // Extended color palette for revenue cards
      const RC = {
        payBg: "#F0FDF4",       // soft green
        payBorder: "#86EFAC",   // green border
        payAccent: "#059669",   // green accent
        payIcon: "#10B981",     // green icon
        segBg: "#EFF6FF",       // soft blue
        segBorder: "#93C5FD",   // blue border
        segAccent: "#2563EB",   // blue accent
        segIcon: "#3B82F6",     // blue icon
        cashBg: "#FAF5FF",      // soft purple
        cashBorder: "#C4B5FD",  // purple border
        cashAccent: "#7C3AED",  // purple accent
        cashIcon: "#8B5CF6",    // purple icon
        summaryBg: "#FFF7ED",   // soft amber
        summaryBorder: "#FED7AA", // amber border
        summaryAccent: "#EA580C", // amber accent
      };

      // Section header
      Y = h1("Potencial de Receita Extra com Kenlo", M, Y);
      Y += 2;
      doc.fontSize(7).fillColor(C.textMuted).font("Helvetica")
        .text("Além da mensalidade, a plataforma Kenlo gera receita adicional para sua imobiliária através dos módulos abaixo.", M + 11, Y, { width: CW - 11 });
      Y += 18;

      // Collect active cards for dynamic layout
      const revenueCards: Array<{
        type: "pay" | "seguros" | "cash";
        title: string;
        subtitle: string;
        description: string;
        metric: string;
        metricLabel: string;
        details: Array<{ label: string; value: string }>;
        bgColor: string;
        borderColor: string;
        accentColor: string;
        iconColor: string;
      }> = [];

      // Card 1: Split Automático (Kenlo Pay)
      if (hasRevenueFromPay) {
        const contracts = data.contracts || 0;
        const boletoAmt = data.boletoAmount || 0;
        const splitAmt = data.splitAmount || 0;
        const totalPerContract = boletoAmt + splitAmt;
        const monthlyRevenue = data.revenueFromBoletos || 0;

        const details: Array<{ label: string; value: string }> = [];
        if (data.chargesBoletoToTenant && boletoAmt > 0) {
          details.push({ label: "Boleto repassado ao inquilino", value: `${fmt(boletoAmt)}/boleto` });
        }
        if (data.chargesSplitToOwner && splitAmt > 0) {
          details.push({ label: "Split repassado ao proprietário", value: `${fmt(splitAmt)}/split` });
        }
        if (contracts > 0) {
          details.push({ label: "Contratos ativos", value: fmtNum(contracts) });
        }

        revenueCards.push({
          type: "pay",
          title: "Split Automático",
          subtitle: "Kenlo Pay",
          description: "Repasse automático de taxas de boleto e split digital para inquilinos e proprietários.",
          metric: fmt(monthlyRevenue),
          metricLabel: "receita estimada/mês",
          details,
          bgColor: RC.payBg,
          borderColor: RC.payBorder,
          accentColor: RC.payAccent,
          iconColor: RC.payIcon,
        });
      }

      // Card 2: Seguros Integrados (Kenlo Seguros)
      if (hasRevenueFromSeguros) {
        const contracts = data.contracts || 0;
        const monthlyInsurance = data.revenueFromInsurance || 0;
        const locPlanTier = (data.locPlan || "k").toLowerCase();
        const commissionRate = locPlanTier === "k2" ? "45%" : locPlanTier === "k" ? "40%" : "35%";

        revenueCards.push({
          type: "seguros",
          title: "Seguros Integrados",
          subtitle: "Kenlo Seguros",
          description: "Seguro embutido no boleto de aluguel. Comissão recorrente sobre cada contrato ativo.",
          metric: fmt(monthlyInsurance),
          metricLabel: "receita estimada/mês",
          details: [
            { label: "Comissão da imobiliária", value: commissionRate },
            { label: "Receita por contrato", value: "~R$ 10/mês" },
            { label: "Contratos ativos", value: fmtNum(contracts) },
          ],
          bgColor: RC.segBg,
          borderColor: RC.segBorder,
          accentColor: RC.segAccent,
          iconColor: RC.segIcon,
        });
      }

      // Card 3: Antecipação de Aluguel (Kenlo Cash)
      if (hasCash) {
        const contracts = data.contracts || 0;
        // Estimate: average rent R$1.500, anticipation fee ~2.5%, up to 24 months
        const avgRent = 1500;
        const anticipationFee = 0.025;
        const estimatedPortfolio = contracts * avgRent;
        const potentialRevenue = contracts * avgRent * anticipationFee;

        revenueCards.push({
          type: "cash",
          title: "Antecipação de Aluguel",
          subtitle: "Kenlo Cash",
          description: "Antecipe até 24 meses de aluguel para proprietários. Receita sobre taxa de antecipação.",
          metric: potentialRevenue > 0 ? fmt(potentialRevenue) : "Sob demanda",
          metricLabel: potentialRevenue > 0 ? "receita potencial/operação" : "",
          details: [
            { label: "Antecipação máxima", value: "até 24 meses" },
            { label: "Portfólio estimado", value: contracts > 0 ? fmt(estimatedPortfolio) : "—" },
            { label: "Contratos elegíveis", value: contracts > 0 ? fmtNum(contracts) : "—" },
          ],
          bgColor: RC.cashBg,
          borderColor: RC.cashBorder,
          accentColor: RC.cashAccent,
          iconColor: RC.cashIcon,
        });
      }

      // ── Render cards ──
      const cardCount = revenueCards.length;
      const cardGap = 12;

      // Draw icon circle helper
      const drawIconCircle = (cx: number, cy: number, color: string, type: "pay" | "seguros" | "cash") => {
        // Outer circle
        doc.circle(cx, cy, 12).fill(color);
        // Inner icon (simplified symbols)
        doc.fontSize(10).fillColor("#FFFFFF").font("Helvetica-Bold");
        if (type === "pay") {
          doc.text("$", cx - 4, cy - 5.5, { lineBreak: false });
        } else if (type === "seguros") {
          // Shield-like symbol
          doc.text("S", cx - 4, cy - 5.5, { lineBreak: false });
        } else {
          // Trending up arrow
          doc.text("↑", cx - 4, cy - 5.5, { lineBreak: false });
        }
      };

      // Render a single revenue card
      const renderCard = (card: typeof revenueCards[0], x: number, y: number, w: number): number => {
        const cardH = 140; // Fixed card height
        const innerPad = 14;

        // Card background with colored border
        doc.save();
        doc.roundedRect(x, y, w, cardH, 6).fill(card.bgColor);
        doc.roundedRect(x, y, w, cardH, 6).lineWidth(1).strokeColor(card.borderColor).stroke();

        // Left accent bar
        doc.rect(x, y + 6, 4, cardH - 12).fill(card.accentColor);

        // Icon circle
        drawIconCircle(x + innerPad + 12, y + innerPad + 10, card.accentColor, card.type);

        // Title and subtitle
        let ty = y + innerPad + 2;
        doc.fontSize(9).fillColor(card.accentColor).font("Helvetica-Bold")
          .text(card.title, x + innerPad + 28, ty, { lineBreak: false });
        ty += 12;
        doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
          .text(card.subtitle, x + innerPad + 28, ty, { lineBreak: false });
        ty += 14;

        // Description
        doc.fontSize(6.5).fillColor(C.text).font("Helvetica")
          .text(card.description, x + innerPad, ty, { width: w - innerPad * 2, lineBreak: true });
        ty += 20;

        // Divider
        doc.moveTo(x + innerPad, ty).lineTo(x + w - innerPad, ty)
          .lineWidth(0.3).strokeColor(card.borderColor).stroke();
        ty += 8;

        // Key metric (large number)
        doc.fontSize(16).fillColor(card.accentColor).font("Helvetica-Bold")
          .text(card.metric, x + innerPad, ty, { lineBreak: false });
        ty += 18;
        if (card.metricLabel) {
          doc.fontSize(5.5).fillColor(C.textMuted).font("Helvetica")
            .text(card.metricLabel, x + innerPad, ty, { lineBreak: false });
        }
        ty += 10;

        // Detail rows
        for (const detail of card.details) {
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text(detail.label, x + innerPad, ty, { lineBreak: false });
          doc.fontSize(6.5).fillColor(C.dark).font("Helvetica-Bold")
            .text(detail.value, x + innerPad, ty, { width: w - innerPad * 2, align: "right" });
          ty += 10;
        }

        doc.restore();
        return cardH;
      };

      if (cardCount === 1) {
        // Single card: centered, 60% width
        const singleW = CW * 0.6;
        const singleX = M + (CW - singleW) / 2;
        renderCard(revenueCards[0], singleX, Y, singleW);
        Y += 150;
      } else if (cardCount === 2) {
        // Two cards side by side
        const twoW = (CW - cardGap) / 2;
        renderCard(revenueCards[0], M, Y, twoW);
        renderCard(revenueCards[1], M + twoW + cardGap, Y, twoW);
        Y += 150;
      } else {
        // Three cards: 2 on top + 1 below (or 3 columns if they fit)
        const threeW = (CW - cardGap * 2) / 3;
        renderCard(revenueCards[0], M, Y, threeW);
        renderCard(revenueCards[1], M + threeW + cardGap, Y, threeW);
        renderCard(revenueCards[2], M + (threeW + cardGap) * 2, Y, threeW);
        Y += 150;
      }

      // ── Summary bar ──
      Y += 8;
      const totalExtraRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
      const netGainValue = data.netGain || 0;

      // Summary background
      doc.roundedRect(M, Y, CW, 56, 6).fill(RC.summaryBg);
      doc.roundedRect(M, Y, CW, 56, 6).lineWidth(1).strokeColor(RC.summaryBorder).stroke();

      // Summary content: 3 columns
      const sumColW = CW / 3;

      // Col 1: Total extra revenue
      doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
        .text("RECEITA EXTRA ESTIMADA", M + 14, Y + 10, { lineBreak: false });
      doc.fontSize(14).fillColor(C.green).font("Helvetica-Bold")
        .text(totalExtraRevenue > 0 ? `+ ${fmt(totalExtraRevenue)}/mês` : "Sob consulta", M + 14, Y + 24, { lineBreak: false });

      // Col 2: Net gain
      doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
        .text("GANHO LÍQUIDO ESTIMADO", M + sumColW + 14, Y + 10, { lineBreak: false });
      const netColor = netGainValue >= 0 ? C.green : C.red;
      doc.fontSize(14).fillColor(netColor).font("Helvetica-Bold")
        .text(netGainValue !== 0 ? fmt(netGainValue) + "/mês" : "—", M + sumColW + 14, Y + 24, { lineBreak: false });

      // Col 3: ROI payback
      doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
        .text("PAYBACK DA IMPLANTAÇÃO", M + sumColW * 2 + 14, Y + 10, { lineBreak: false });
      const paybackMonths = netGainValue > 0 ? Math.ceil((data.implantationFee || 0) / netGainValue) : 0;
      const paybackText = paybackMonths > 0 && paybackMonths <= 36 ? `~${paybackMonths} meses` : "—";
      doc.fontSize(14).fillColor(RC.summaryAccent).font("Helvetica-Bold")
        .text(paybackText, M + sumColW * 2 + 14, Y + 24, { lineBreak: false });

      Y += 66;

      // Annual projection
      if (totalExtraRevenue > 0) {
        doc.fontSize(6.5).fillColor(C.textMuted).font("Helvetica")
          .text(`Projeção anual de receita extra: ${fmt(totalExtraRevenue * 12)}`, M + 11, Y, { lineBreak: false });
        Y += 14;
      }

      // Disclaimer
      Y += 4;
      doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
        .text("* Valores estimados com base no perfil informado. Receitas reais dependem do volume de operações e adesão dos clientes.", M, Y, { width: CW });
    }

    // ================================================================
    // FINALIZE
    // ================================================================
    doc.end();
  });
}
