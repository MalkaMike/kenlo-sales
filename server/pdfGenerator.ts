/**
 * Server-side PDF generation — Master Prompt v1 (PDFKit)
 *
 * Structure (9 sections):
 *   1. Capa (cover)
 *   2. Resumo da Configuracao (mini-calculator)
 *   3. Produtos Contratados
 *   4. Add-ons Contratados
 *   5. Frequencia de Pagamento
 *   6. Selecao vs Kombos (comparison)
 *   7. Kenlo Receita Extra (value proof)
 *   8. Investimento Total
 *   9. Conclusao
 *
 * Design: white bg, lots of whitespace, SaaS-modern, cards not heavy tables,
 *         primary color for selection only, green for gains, grey for neutral,
 *         NEVER red for prices.
 */

import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

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
    const GAP = 14;
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

    const needsNewPage = (y: number, needed: number): boolean => y + needed > MAX_Y;

    const newPage = (): number => {
      doc.addPage();
      doc.rect(0, 0, PW, 3).fill(C.primary);
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
        .text(`${data.agencyName || "Imobiliaria"} - Proposta Comercial`, M, PH - 20, { lineBreak: false });
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
        .text(`Vendedor: ${data.salesPersonName}`, M + CW - 150, PH - 20, { width: 150, align: "right" });
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
      locacao_pro: "Kombo Loc Pro", core_gestao: "Kombo Core Gestao", elite: "Kombo Elite",
    };
    const normalizedKombo = rawKombo.toLowerCase().replace(/^kombo\s+/i, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    const komboLabel = komboDisplayMap[normalizedKombo] || rawKombo;
    const isKombo = komboDiscount > 0 || (komboLabel !== "" && normalizedKombo !== "sem_kombo");

    const freqMap: Record<string, { label: string; adj: string }> = {
      monthly: { label: "Mensal", adj: "+25%" },
      mensal: { label: "Mensal", adj: "+25%" },
      semestral: { label: "Semestral", adj: "+11%" },
      annual: { label: "Anual", adj: "0% (referencia)" },
      anual: { label: "Anual", adj: "0% (referencia)" },
      bienal: { label: "Bienal", adj: "-10%" },
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

    const CARD_W = (CW - GAP) / 2;

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
    // PAGE 2 - RESUMO DA CONFIGURACAO
    // ================================================================
    Y = newPage();

    Y = sectionTitle("Resumo da sua Configuracao", Y);

    // Card: Produtos Contratados
    const CARD_H = 60;
    card(M, Y, CARD_W, CARD_H, { selected: true });
    lbl("PRODUTOS CONTRATADOS", M + 14, Y + 6, { size: 6, bold: true, color: C.primary });
    const prodParts: string[] = [];
    if (showImob) prodParts.push(`IMOB ${(data.imobPlan || "").toUpperCase()}`);
    if (showLoc) prodParts.push(`LOC ${(data.locPlan || "").toUpperCase()}`);
    val(prodParts.join("  +  "), M + 14, Y + 22, { size: 13, color: C.dark });
    if (isKombo) {
      const badgeText = komboDiscount > 0 ? `${komboLabel} (${komboDiscount}% OFF)` : komboLabel;
      const bw = doc.widthOfString(badgeText) + 14;
      doc.roundedRect(M + 14, Y + 40, bw, 13, 3).fill(C.primary);
      doc.fontSize(7).fillColor("#FFFFFF").font("Helvetica-Bold").text(badgeText, M + 21, Y + 42, { lineBreak: false });
    }

    // Card: Investimento
    const cx2 = M + CARD_W + GAP;
    card(cx2, Y, CARD_W, CARD_H, { fill: C.bgSoft });
    lbl("INVESTIMENTO MENSAL EQUIVALENTE", cx2 + 14, Y + 6, { size: 6, bold: true, color: C.textMuted });
    val(fmt(monthlyRecurring), cx2 + 14, Y + 24, { size: 16, color: C.dark });
    lbl(`${selFreq.label} (${selFreq.adj})`, cx2 + 14, Y + 46, { size: 7, color: C.textMuted });

    Y += CARD_H + GAP;

    // Row 2: Add-ons summary + Frequency
    const CARD_H2 = 42;

    card(M, Y, CARD_W, CARD_H2, { fill: C.bgSoft });
    lbl("ADD-ONS ATIVOS", M + 14, Y + 6, { size: 6, bold: true, color: C.textMuted });
    if (activeAddons.length > 0) {
      const addonText = activeAddons.map(a => a.label).join("  |  ");
      val(addonText, M + 14, Y + 22, { size: 8, color: C.text });
    } else {
      lbl("Nenhum add-on selecionado", M + 14, Y + 22, { size: 8, color: C.textLight });
    }

    // Card: Frequencia (simple reference — detailed breakdown in Section 5)
    card(cx2, Y, CARD_W, CARD_H2, { fill: C.bgSoft });
    lbl("FREQUENCIA DE PAGAMENTO", cx2 + 14, Y + 6, { size: 6, bold: true, color: C.textMuted });
    val(selFreq.label, cx2 + 14, Y + 22, { size: 10, color: C.dark });

    Y += CARD_H2 + GAP + 4;

    // ================================================================
    // SECTION 3 - PRODUTOS CONTRATADOS
    // ================================================================
    Y = sectionTitle("Produtos Contratados", Y);

    const PROD_CARD_H = 52;
    const prodCards: { name: string; plan: string; desc: string; price: number }[] = [];
    if (showImob) {
      prodCards.push({
        name: "Kenlo IMOB",
        plan: (data.imobPlan || "K").toUpperCase(),
        desc: "CRM + Site para vendas de imoveis",
        price: data.imobPrice || 0,
      });
    }
    if (showLoc) {
      prodCards.push({
        name: "Kenlo Locacao",
        plan: (data.locPlan || "K").toUpperCase(),
        desc: "ERP para gestao de contratos de locacao",
        price: data.locPrice || 0,
      });
    }

    const prodColW = prodCards.length === 1 ? CW : CARD_W;
    prodCards.forEach((p, i) => {
      const px = M + i * (prodColW + GAP);
      card(px, Y, prodColW, PROD_CARD_H, { selected: true });
      val(p.name, px + 14, Y + 10, { size: 10, color: C.dark });
      // Plan badge
      const planBadge = `Plano ${p.plan}`;
      const nameW = doc.widthOfString(p.name);
      const pbw = doc.widthOfString(planBadge) + 12;
      doc.roundedRect(px + 18 + nameW, Y + 7, pbw, 14, 3).fill(C.primary);
      doc.fontSize(7).fillColor("#FFFFFF").font("Helvetica-Bold").text(planBadge, px + 24 + nameW, Y + 11, { lineBreak: false });
      // Description
      lbl(p.desc, px + 14, Y + 28, { size: 7, color: C.textMuted });
      // Price
      doc.fontSize(9).fillColor(C.text).font("Helvetica-Bold")
        .text(fmt(p.price) + "/mes", px + 14, Y + 40, { width: prodColW - 28, align: "right" });
    });

    Y += PROD_CARD_H + GAP;

    // Premium benefits note (when K2)
    if (anyK2 || hasVip || hasCS) {
      const PREM_H = bothK2 ? 50 : 38;
      card(M, Y, CW, PREM_H, { fill: C.blueLight, stroke: C.border });
      lbl("BENEFICIOS PREMIUM", M + 14, Y + 6, { size: 6, bold: true, color: C.blue });
      lbl("Ao contratar plano K ou K2 em qualquer produto, os beneficios premium sao automaticamente estendidos a toda a operacao (IMOB e LOCACAO).", M + 14, Y + 20, { size: 7, color: C.text });
      if (bothK2) {
        lbl(">> Treinamentos acumulados: beneficios de ambos os planos K2 sao somados (4 online/ano ou 2 presenciais).", M + 14, Y + 34, { size: 7, color: C.blue, bold: true });
      }
      Y += PREM_H + GAP;
    }

    // ================================================================
    // SECTION 4 - ADD-ONS CONTRATADOS
    // ================================================================
    if (activeAddons.length > 0) {
      if (needsNewPage(Y, 120)) Y = newPage();
      Y = sectionTitle("Add-ons Contratados", Y);

      const ADDON_H = 40;
      const addonMeta: Record<string, { desc: string; pricing: string }> = {
        leads: { desc: "Automacao de leads ativa independentemente do uso de WhatsApp", pricing: "Pre-pago mensal" },
        inteligencia: { desc: "BI de KPIs e analytics avancado", pricing: "Pre-pago mensal" },
        assinatura: { desc: "Assinatura digital embutida", pricing: "Pos-pago por uso" },
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

        card(ax, ay, addonColW, ADDON_H, { fill: C.bgSoft, stroke: C.border });
        // Green checkmark circle
        doc.circle(ax + 14, ay + 14, 4).fill(C.green);
        doc.fontSize(5).fillColor("#FFFFFF").font("Helvetica-Bold").text("v", ax + 12, ay + 11.5, { lineBreak: false });

        val(`Kenlo ${a.label}`, ax + 24, ay + 10, { size: 8, color: C.dark });
        lbl(meta.desc, ax + 14, ay + 26, { size: 6, color: C.textMuted });
        if (price > 0) {
          doc.fontSize(7).fillColor(C.text).font("Helvetica-Bold")
            .text(fmt(price) + "/mes", ax + 14, ay + 10, { width: addonColW - 28, align: "right" });
        } else {
          doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
            .text(meta.pricing, ax + 14, ay + 10, { width: addonColW - 28, align: "right" });
        }
      });

      const addonRows = Math.ceil(activeAddons.length / 3);
      Y += addonRows * (ADDON_H + 6) + GAP;
    }

    // ================================================================
    // SECTION 5 - FREQUENCIA DE PAGAMENTO
    // ================================================================
    if (needsNewPage(Y, 100)) Y = newPage();
    Y = sectionTitle("Frequencia de Pagamento", Y);

    const FREQ_OPTIONS = [
      { key: "monthly", label: "Mensal", adj: "+25%", color: C.textMuted },
      { key: "semestral", label: "Semestral", adj: "+11%", color: C.textMuted },
      { key: "annual", label: "Anual", adj: "0%", color: C.green },
      { key: "bienal", label: "Bienal", adj: "-10%", color: C.green },
    ];

    const FREQ_W = (CW - 3 * 8) / 4;
    const FREQ_H = 36;
    FREQ_OPTIONS.forEach((f, i) => {
      const fx = M + i * (FREQ_W + 8);
      const isSelected = f.key === data.paymentPlan?.toLowerCase() ||
        (f.key === "annual" && data.paymentPlan?.toLowerCase() === "anual") ||
        (f.key === "monthly" && data.paymentPlan?.toLowerCase() === "mensal");
      card(fx, Y, FREQ_W, FREQ_H, { selected: isSelected, fill: isSelected ? undefined : C.bgSoft });
      doc.fontSize(9).fillColor(isSelected ? C.primary : C.text).font("Helvetica-Bold")
        .text(f.label, fx, Y + 8, { width: FREQ_W, align: "center" });
      doc.fontSize(8).fillColor(isSelected ? C.primary : f.color).font("Helvetica-Bold")
        .text(f.adj, fx, Y + 22, { width: FREQ_W, align: "center" });
    });
    Y += FREQ_H + 6;

    lbl("Valores exibidos em base mensal equivalente. Planos mais longos geram economia.", M, Y + 4, { size: 6.5, color: C.textLight });
    Y += 16;

    // ================================================================
    // SECTION 6 - SELECAO vs KOMBOS
    // ================================================================
    if (komboComparison.length > 0) {
      // Estimate table height: header + current row + all kombo rows
      const estRows = 2 + komboComparison.length;
      const estHeight = estRows * 22 + 30;
      if (needsNewPage(Y, estHeight)) Y = newPage();
      Y = sectionTitle("Sua Selecao vs Kombos", Y);

      const TBL_W = CW;
      const COL_NAME_W = TBL_W * 0.35;
      const COL_DISC_W = TBL_W * 0.15;
      const COL_TOTAL_W = TBL_W * 0.25;
      const COL_SAVE_W = TBL_W * 0.25;
      const ROW_H = 22;

      // Helper to draw table header row
      const drawTableHeader = () => {
        doc.roundedRect(M, Y, TBL_W, ROW_H, 3).fill(C.dark);
        doc.rect(M, Y + ROW_H / 2, TBL_W, ROW_H / 2).fill(C.dark);
        doc.fontSize(7).fillColor("#FFFFFF").font("Helvetica-Bold");
        doc.text("Kombo", M + 10, Y + 7, { lineBreak: false });
        doc.text("Desconto", M + COL_NAME_W + 10, Y + 7, { lineBreak: false });
        doc.text("Mensal Equiv.", M + COL_NAME_W + COL_DISC_W + 10, Y + 7, { lineBreak: false });
        doc.text("Economia/mes", M + COL_NAME_W + COL_DISC_W + COL_TOTAL_W + 10, Y + 7, { lineBreak: false });
        Y += ROW_H;
      };

      // Draw initial header
      drawTableHeader();

      // "Sua selecao" row (current)
      doc.rect(M, Y, TBL_W, ROW_H).fill(C.primaryLight);
      divider(Y + ROW_H);
      doc.fontSize(7).fillColor(C.primary).font("Helvetica-Bold")
        .text(isKombo ? `> ${komboLabel}` : "> Sua Selecao Atual", M + 10, Y + 7, { lineBreak: false });
      doc.fontSize(7).fillColor(C.dark).font("Helvetica-Bold")
        .text(komboDiscount > 0 ? `${komboDiscount}%` : "-", M + COL_NAME_W + 10, Y + 7, { lineBreak: false });
      doc.text(fmt(monthlyRecurring), M + COL_NAME_W + COL_DISC_W + 10, Y + 7, { lineBreak: false });
      doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
        .text("Selecionado", M + COL_NAME_W + COL_DISC_W + COL_TOTAL_W + 10, Y + 7, { lineBreak: false });
      Y += ROW_H;

      // Other kombos (skip current selection AND "Sem Kombo" when no kombo is selected)
      let renderedIdx = 0;
      komboComparison.forEach((k) => {
        const kNorm = k.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
        // Skip the current kombo selection
        if (kNorm === normalizedKombo) return;
        // Skip "Sem Kombo" when user selected "Sua Selecao" (no kombo) to avoid redundancy
        if (!isKombo && kNorm === "sem_kombo") return;

        // Page break check per row - re-draw header on new page
        if (needsNewPage(Y, ROW_H + 4)) {
          Y = newPage();
          drawTableHeader();
        }

        if (renderedIdx % 2 === 0) {
          doc.rect(M, Y, TBL_W, ROW_H).fill(C.bgSoft);
        }
        divider(Y + ROW_H);

        doc.fontSize(7).fillColor(C.text).font("Helvetica")
          .text(k.name, M + 10, Y + 7, { lineBreak: false });
        doc.text(`${k.discount}%`, M + COL_NAME_W + 10, Y + 7, { lineBreak: false });
        doc.text(fmt(k.monthlyTotal), M + COL_NAME_W + COL_DISC_W + 10, Y + 7, { lineBreak: false });
        if (k.savings > 0) {
          doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
            .text(`${fmt(k.savings)}/mes`, M + COL_NAME_W + COL_DISC_W + COL_TOTAL_W + 10, Y + 7, { lineBreak: false });
        } else {
          doc.fontSize(7).fillColor(C.textLight).font("Helvetica")
            .text("-", M + COL_NAME_W + COL_DISC_W + COL_TOTAL_W + 10, Y + 7, { lineBreak: false });
        }
        Y += ROW_H;
        renderedIdx++;
      });

      Y += GAP;
    }

    // ================================================================
    // SECTION 7 - KENLO RECEITA EXTRA
    // ================================================================
    if (hasRevenue) {
      if (needsNewPage(Y, 180)) Y = newPage();
      Y = sectionTitle("Kenlo Receita Extra", Y);

      lbl("Pay e Seguros sao direitos do plano. O uso e opcional e ativado durante o onboarding, conforme sua estrategia operacional.", M + 10, Y, { size: 6.5, color: C.textMuted });
      Y += 10;
      lbl("Os valores abaixo consideram o modelo informado pelo cliente durante a simulacao (quem paga boleto, split e respectivos valores).", M + 10, Y, { size: 6, color: C.textLight });
      Y += 14;

      const REV_W = CARD_W;
      const REV_H = 80;

      if ((data.revenueFromBoletos || 0) > 0) {
        card(M, Y, REV_W, REV_H, { fill: C.greenLight, stroke: C.greenBorder });
        lbl("KENLO PAY", M + 14, Y + 8, { size: 7, bold: true, color: C.green });
        lbl("Receita de boletos e split digital", M + 14, Y + 20, { size: 6.5, color: C.textMuted });

        let detY = Y + 34;
        if (data.chargesBoletoToTenant && data.boletoAmount && data.boletoAmount > 0) {
          lbl(`Boleto cobrado do inquilino: ${fmt(data.boletoAmount)}`, M + 14, detY, { size: 6.5, color: C.text });
          detY += 9;
          const boletoRev = (data.contracts || 0) * data.boletoAmount;
          lbl(`${fmtNum(data.contracts || 0)} contratos x ${fmt(data.boletoAmount)} = ${fmt(boletoRev)}`, M + 14, detY, { size: 6, color: C.textMuted });
          detY += 9;
        }
        if (data.chargesSplitToOwner && data.splitAmount && data.splitAmount > 0) {
          lbl(`Split cobrado do proprietario: ${fmt(data.splitAmount)}`, M + 14, detY, { size: 6.5, color: C.text });
          detY += 9;
          const splitRev = (data.contracts || 0) * data.splitAmount;
          lbl(`${fmtNum(data.contracts || 0)} contratos x ${fmt(data.splitAmount)} = ${fmt(splitRev)}`, M + 14, detY, { size: 6, color: C.textMuted });
        }

        doc.fontSize(11).fillColor(C.green).font("Helvetica-Bold")
          .text(`+ ${fmt(data.revenueFromBoletos || 0)}/mes`, M + 14, Y + REV_H - 16, { width: REV_W - 28, align: "right" });
      }

      // Seguros card
      if ((data.revenueFromInsurance || 0) > 0) {
        const sx = M + REV_W + GAP;
        card(sx, Y, REV_W, REV_H, { fill: C.greenLight, stroke: C.greenBorder });
        lbl("KENLO SEGUROS", sx + 14, Y + 8, { size: 7, bold: true, color: C.green });
        lbl("Seguros embutido no boleto de locacao", sx + 14, Y + 20, { size: 6.5, color: C.textMuted });
        lbl("Ganho minimo: R$ 10,00 por contrato/mes", sx + 14, Y + 34, { size: 6.5, color: C.text });
        lbl(`${fmtNum(data.contracts || 0)} contratos x R$ 10,00 = ${fmt(data.revenueFromInsurance || 0)}`, sx + 14, Y + 44, { size: 6, color: C.textMuted });
        doc.fontSize(11).fillColor(C.green).font("Helvetica-Bold")
          .text(`+ ${fmt(data.revenueFromInsurance || 0)}/mes`, sx + 14, Y + REV_H - 16, { width: REV_W - 28, align: "right" });
      }

      Y += REV_H + GAP;
    }

    // ================================================================
    // SECTION 8 - INVESTIMENTO TOTAL
    // ================================================================
    if (needsNewPage(Y, 260)) Y = newPage();
    Y = sectionTitle("Investimento Total", Y);

    // Fixed costs card — calculate dynamic height
    let dynH = 14 + 14 + 14 + 16 + 20 + 12 + 14;
    if (showImob && data.imobPrice !== undefined) dynH += 12;
    if (showLoc && data.locPrice !== undefined) dynH += 12;
    const paidAddonsCount = Object.entries(addonPrices).filter(([_, p]) => p > 0).length;
    dynH += paidAddonsCount * 12;
    if (hasVip) dynH += 12;
    if (hasCS) dynH += 12;
    if (anyK2) dynH += 12;
    const normPlanEst = data.paymentPlan?.toLowerCase() || "annual";
    if (normPlanEst === "monthly" || normPlanEst === "mensal" || normPlanEst === "semestral") {
      dynH += 12;
    } else {
      dynH += 28 + 4 + 10;
    }
    const INV_H = Math.max(dynH, 140);
    card(M, Y, CW, INV_H, { fill: C.bgSoft, stroke: C.border });

    let iY = Y + 14;

    lbl("CUSTOS FIXOS (PRE-PAGO)", M + 14, iY, { size: 7, bold: true, color: C.dark });
    iY += 14;

    // Product lines
    if (showImob && data.imobPrice !== undefined) {
      lbl(`Kenlo IMOB - ${(data.imobPlan || "K").toUpperCase()}`, M + 14, iY, { size: 7, color: C.text });
      doc.fontSize(7).fillColor(C.text).font("Helvetica-Bold")
        .text(fmt(data.imobPrice), M + 14, iY, { width: CW - 28, align: "right" });
      iY += 12;
    }
    if (showLoc && data.locPrice !== undefined) {
      lbl(`Kenlo Locacao - ${(data.locPlan || "K").toUpperCase()}`, M + 14, iY, { size: 7, color: C.text });
      doc.fontSize(7).fillColor(C.text).font("Helvetica-Bold")
        .text(fmt(data.locPrice), M + 14, iY, { width: CW - 28, align: "right" });
      iY += 12;
    }

    // Add-on lines
    const paidAddons = Object.entries(addonPrices).filter(([_, p]) => p > 0);
    const addonNameMap: Record<string, string> = {
      leads: "Kenlo Leads", inteligencia: "Kenlo Inteligencia",
      assinatura: "Kenlo Assinatura", pay: "Kenlo Pay", seguros: "Kenlo Seguros",
    };
    for (const [key, price] of paidAddons) {
      lbl(addonNameMap[key] || key, M + 14, iY, { size: 7, color: C.text });
      doc.fontSize(7).fillColor(C.text).font("Helvetica-Bold")
        .text(fmt(price), M + 14, iY, { width: CW - 28, align: "right" });
      iY += 12;
    }

    // VIP / CS
    if (hasVip) {
      const vipVal = data.vipIncluded ? "Incluido" : fmt(data.vipPrice || 97);
      lbl("Suporte VIP", M + 14, iY, { size: 7, color: C.text });
      doc.fontSize(7).fillColor(data.vipIncluded ? C.green : C.text).font("Helvetica-Bold")
        .text(vipVal, M + 14, iY, { width: CW - 28, align: "right" });
      iY += 12;
    }
    if (hasCS) {
      const csVal = data.csIncluded ? "Incluido" : fmt(data.csPrice || 197);
      lbl("CS Dedicado", M + 14, iY, { size: 7, color: C.text });
      doc.fontSize(7).fillColor(data.csIncluded ? C.green : C.text).font("Helvetica-Bold")
        .text(csVal, M + 14, iY, { width: CW - 28, align: "right" });
      iY += 12;
    }

    // K2 Training
    if (anyK2) {
      const trainText = bothK2
        ? "4 Treinamentos Online ou 2 Presenciais"
        : "2 Treinamentos Online ou 1 Presencial";
      lbl(trainText, M + 14, iY, { size: 7, color: C.text });
      doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
        .text("Incluido", M + 14, iY, { width: CW - 28, align: "right" });
      iY += 12;
    }

    // Divider before totals
    iY += 4;
    divider(iY, M + 10, M + CW - 10);
    iY += 10;

    // Total mensal
    lbl("Total Mensal Equivalente", M + 14, iY, { size: 8, bold: true, color: C.dark });
    doc.fontSize(10).fillColor(C.dark).font("Helvetica-Bold")
      .text(fmt(monthlyRecurring), M + 14, iY, { width: CW - 28, align: "right" });
    iY += 16;

    // Implantacao
    lbl("Implantacao (unica vez)", M + 14, iY, { size: 7, color: C.text });
    doc.fontSize(7).fillColor(C.text).font("Helvetica-Bold")
      .text(fmt(data.implantationFee), M + 14, iY, { width: CW - 28, align: "right" });
    iY += 10;
    lbl("A implantacao e um custo unico e nao recorrente, por isso nao entra no calculo do ROI mensal.", M + 14, iY, { size: 5.5, color: C.textLight });
    iY += 10;

    // Payment condition with installment breakdown
    const normPlan = data.paymentPlan?.toLowerCase() || "annual";
    lbl("Condicao de Pagamento", M + 14, iY, { size: 7, bold: true, color: C.dark });
    iY += 12;

    if (normPlan === "monthly" || normPlan === "mensal") {
      lbl(`Cobrado mensalmente: ${fmt(data.totalMonthly || installmentValue)}/mes`, M + 14, iY, { size: 7, color: C.text });
    } else if (normPlan === "semestral") {
      lbl(`Pago semestralmente: ${fmt((data.totalMonthly || 0) * 6)} a cada 6 meses`, M + 14, iY, { size: 7, color: C.text });
    } else {
      // Annual or Bienal — show installment breakdown pills
      const periodLabel = normPlan === "bienal" ? "bienal (24 meses)" : "anual";
      const maxInst = normPlan === "bienal" ? 6 : 3;
      const PILL_W = (CW - 28 - (maxInst - 1) * 6) / maxInst;
      const PILL_H = 28;

      for (let n = 1; n <= maxInst; n++) {
        const px = M + 14 + (n - 1) * (PILL_W + 6);
        const isSel = n === installments;
        // Pill background
        doc.roundedRect(px, iY, PILL_W, PILL_H, 4)
          .fill(isSel ? C.primary : C.bgSoft);
        if (isSel) {
          doc.roundedRect(px, iY, PILL_W, PILL_H, 4)
            .strokeColor(C.primary).stroke();
        }
        // Label
        const pillLabel = n === 1 ? "A vista" : `${n}x`;
        doc.fontSize(6.5).fillColor(isSel ? "#FFFFFF" : C.text)
          .font(isSel ? "Helvetica-Bold" : "Helvetica")
          .text(pillLabel, px, iY + 4, { width: PILL_W, align: "center" });
        // Value
        const pillValue = fmt(totalInvestment / n);
        doc.fontSize(6).fillColor(isSel ? "#FFFFFF" : C.textMuted)
          .font("Helvetica")
          .text(pillValue, px, iY + 15, { width: PILL_W, align: "center" });
      }
      iY += PILL_H + 4;
      lbl(`Pagamento ${periodLabel} - Total: ${fmt(totalInvestment)}`, M + 14, iY, { size: 6, color: C.textMuted });
    }

    Y += INV_H + GAP;

    // Variable costs card (if post-paid exists)
    if (hasPostPaid) {
      const VAR_H = 50;
      card(M, Y, CW, VAR_H, { fill: C.bgSoft, stroke: C.border });
      lbl("CUSTOS VARIAVEIS (POS-PAGO ESTIMADO)", M + 14, Y + 8, { size: 7, bold: true, color: C.dark });
      lbl("Sem surpresas - so o que voce usar alem do incluido no plano.", M + 14, Y + 22, { size: 6.5, color: C.textMuted });
      doc.fontSize(9).fillColor(C.text).font("Helvetica-Bold")
        .text(fmt(data.postPaidTotal || 0) + "/mes", M + 14, Y + 34, { width: CW - 28, align: "right" });
      Y += VAR_H + GAP;
    }

    // Net gain summary (if revenue exists)
    if (hasRevenue) {
      const totalRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
      const netGain = data.netGain || totalRevenue - monthlyRecurring - (data.postPaidTotal || 0);
      const isPositive = netGain > 0;

      if (needsNewPage(Y, 100)) Y = newPage();

      const NET_H = 60;
      card(M, Y, CW, NET_H, {
        fill: isPositive ? C.greenLight : "#FEF2F2",
        stroke: isPositive ? C.greenBorder : "#FCA5A5",
        lw: 1.5,
      });

      doc.fontSize(9).fillColor(C.dark).font("Helvetica-Bold")
        .text("Ganho Liquido Mensal Estimado", M, Y + 10, { width: CW, align: "center" });

      doc.fontSize(22).fillColor(isPositive ? C.green : "#EF4444").font("Helvetica-Bold")
        .text(fmt(netGain), M, Y + 26, { width: CW, align: "center" });

      const subtitleText = isPositive
        ? "Receita extra supera o investimento na plataforma"
        : "Investimento na plataforma supera receita extra";
      doc.fontSize(6.5).fillColor(C.textMuted).font("Helvetica")
        .text(subtitleText, M, Y + 48, { width: CW, align: "center" });

      Y += NET_H + 6;

      // ROI indicators - always shown when revenue exists (positive or negative)
      if (monthlyRecurring > 0) {
        const totalCost = monthlyRecurring + (data.postPaidTotal || 0);
        const IND_W = (CW - 16) / 3;
        const IND_H = 44;

        if (isPositive) {
          // POSITIVE: show ROI %, Payback, Annual Gain
          const roiPercent = ((totalRevenue / monthlyRecurring) * 100 - 100).toFixed(0);
          const paybackMonths = monthlyRecurring > 0 ? Math.ceil((data.implantationFee || 0) / netGain) : 0;
          const annualGain = netGain * 12;

          // ROI
          card(M, Y, IND_W, IND_H, { fill: C.bgSoft });
          doc.fontSize(16).fillColor(C.green).font("Helvetica-Bold")
            .text(`${roiPercent}%`, M, Y + 8, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("ROI (Receita vs Investimento)", M, Y + 30, { width: IND_W, align: "center" });

          // Payback
          const px = M + IND_W + 8;
          card(px, Y, IND_W, IND_H, { fill: C.bgSoft });
          doc.fontSize(14).fillColor(C.blue).font("Helvetica-Bold")
            .text(`${paybackMonths} ${paybackMonths === 1 ? "mes" : "meses"}`, px, Y + 10, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("Payback da Implantacao", px, Y + 30, { width: IND_W, align: "center" });

          // Annual gain
          const ax = M + (IND_W + 8) * 2;
          card(ax, Y, IND_W, IND_H, { fill: C.bgSoft });
          doc.fontSize(12).fillColor(C.green).font("Helvetica-Bold")
            .text(fmt(annualGain), ax, Y + 10, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("Ganho Anual Estimado", ax, Y + 30, { width: IND_W, align: "center" });
        } else {
          // NEGATIVE: show Efeito Kenlo (coverage %), Receita Mensal, Custo Descoberto
          const coveragePercent = totalCost > 0 ? Math.round((totalRevenue / totalCost) * 100) : 0;
          const uncoveredCost = Math.abs(netGain);

          // Efeito Kenlo - coverage percentage
          card(M, Y, IND_W, IND_H, { fill: C.greenLight, stroke: C.greenBorder });
          doc.fontSize(16).fillColor(C.green).font("Helvetica-Bold")
            .text(`${coveragePercent}%`, M, Y + 8, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("Efeito Kenlo (cobertura do custo)", M, Y + 30, { width: IND_W, align: "center" });

          // Receita Mensal Gerada
          const px = M + IND_W + 8;
          card(px, Y, IND_W, IND_H, { fill: C.greenLight, stroke: C.greenBorder });
          doc.fontSize(12).fillColor(C.green).font("Helvetica-Bold")
            .text(fmt(totalRevenue), px, Y + 10, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("Receita Mensal Gerada", px, Y + 30, { width: IND_W, align: "center" });

          // Custo Liquido Descoberto
          const ax = M + (IND_W + 8) * 2;
          card(ax, Y, IND_W, IND_H, { fill: C.bgSoft });
          doc.fontSize(12).fillColor(C.text).font("Helvetica-Bold")
            .text(fmt(uncoveredCost), ax, Y + 10, { width: IND_W, align: "center" });
          doc.fontSize(6).fillColor(C.textMuted).font("Helvetica")
            .text("Custo Liquido Descoberto/mes", ax, Y + 30, { width: IND_W, align: "center" });
        }

        Y += IND_H + 6;

        // Disclaimer - always shown
        doc.fontSize(5).fillColor(C.textLight).font("Helvetica")
          .text("Estimativas baseadas nas informacoes declaradas pelo cliente. Os resultados podem variar conforme uso efetivo da plataforma.", M, Y + 3, { lineBreak: false });
        Y += 12;
      }
    }

    // ================================================================
    // SECTION 9 - CONCLUSAO
    // ================================================================
    if (needsNewPage(Y, 80)) Y = newPage();

    Y += 10;
    const CONC_H = 50;
    doc.roundedRect(M, Y, CW, CONC_H, 4).fill(C.dark);
    doc.fontSize(12).fillColor("#FFFFFF").font("Helvetica-Bold")
      .text("Kenlo - Quem usa, lidera.", M, Y + 12, { width: CW, align: "center" });
    doc.fontSize(7).fillColor("#CBD5E1").font("Helvetica")
      .text("A Kenlo e a unica plataforma que pode se pagar enquanto voce usa.", M, Y + 30, { width: CW, align: "center" });

    doc.end();
  });
}
