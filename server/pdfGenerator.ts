import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

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
  // Business metrics
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
  // Add-ons and pricing
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
  // Pre-payment fields
  prepayAdditionalUsers?: boolean;
  prepayAdditionalContracts?: boolean;
  prepaymentUsersAmount?: number;
  prepaymentContractsAmount?: number;
  prepaymentMonths?: number;
  monthlyLicenseBase?: number;
  // Premium services
  hasPremiumServices?: boolean;
  premiumServicesPrice?: number;
  // Installment options
  installments?: number;
  // Business nature
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
  // Individual line item prices for Investimento table
  imobPrice?: number;
  locPrice?: number;
  addonPrices?: string; // JSON: {leads: 557, inteligencia: 337, ...}
  vipIncluded?: boolean;
  csIncluded?: boolean;
  vipPrice?: number;
  csPrice?: number;
  // Pós-pago breakdown details
  postPaidBreakdown?: string; // JSON with detailed breakdown
}

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      autoFirstPage: true,
      bufferPages: true,
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ============================================
    // CONSTANTS
    // ============================================
    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const M = 40; // margin
    const CW = PAGE_W - M * 2; // content width
    const COL3_W = (CW - 16) / 3;
    const COL2_W = (CW - 8) / 2;
    const SECTION_GAP = 16;
    const LINE_H = 13;
    const MAX_Y = PAGE_H - M;

    const C = {
      red: "#E11D48",
      pink: "#EC4899",
      pinkLight: "#FDF2F8",
      pinkBorder: "#F9A8D4",
      dark: "#1E293B",
      text: "#1F2937",
      textLight: "#6B7280",
      border: "#E5E7EB",
      borderLight: "#F3F4F6",
      white: "#FFFFFF",
      green: "#10B981",
      blue: "#3B82F6",
      bgLight: "#F9FAFB",
    };

    const fmt = (v: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      }).format(v);

    const fmtNum = (v: number) =>
      new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(v);

    // ============================================
    // HELPERS
    // ============================================
    const box = (
      x: number, y: number, w: number, h: number,
      opts: { fill?: string; stroke?: string; lw?: number; r?: number; selected?: boolean } = {}
    ) => {
      const r = opts.r ?? 4;
      if (opts.selected) {
        doc.roundedRect(x, y, w, h, r).lineWidth(1.5).fillAndStroke(C.pinkLight, C.pink);
      } else {
        doc.roundedRect(x, y, w, h, r).lineWidth(opts.lw ?? 0.5).fillAndStroke(opts.fill ?? C.white, opts.stroke ?? C.border);
      }
    };

    const modernCheck = (x: number, y: number, checked: boolean, label: string) => {
      const size = 10;
      const cx = x + size / 2;
      const cy = y + size / 2;
      if (checked) {
        doc.circle(cx, cy, size / 2).fill(C.pink);
        doc.save().lineWidth(1.2).strokeColor(C.white);
        doc.moveTo(cx - 2.5, cy).lineTo(cx - 0.5, cy + 2.5).lineTo(cx + 3, cy - 2).stroke();
        doc.restore();
      } else {
        doc.circle(cx, cy, size / 2).lineWidth(0.8).stroke(C.border);
      }
      doc.fontSize(7).fillColor(checked ? C.pink : C.text).font(checked ? "Helvetica-Bold" : "Helvetica")
        .text(label, x + size + 5, y + 1);
    };

    const sectionTitle = (label: string, y: number) => {
      doc.fontSize(9.5).fillColor(C.dark).font("Helvetica-Bold").text(label, M, y);
      return y + 16;
    };

    const labelRow = (label: string, value: string, y: number, opts: { bold?: boolean; indent?: number; valueColor?: string } = {}) => {
      const indent = opts.indent ?? 10;
      doc.fontSize(7).fillColor(C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica").text(label, M + indent, y);
      doc.fontSize(7).fillColor(opts.valueColor ?? C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(value, M + CW - 120, y, { width: 120, align: "right" });
      return y + LINE_H;
    };

    const metricStat = (x: number, y: number, value: string, label: string) => {
      doc.fontSize(13).fillColor(C.dark).font("Helvetica-Bold").text(value, x, y);
      const numW = doc.widthOfString(value);
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica").text(label, x + numW + 4, y + 4);
    };

    // Helper: Draw a table row with label and value
    const tableRow = (
      x: number, y: number, w: number, label: string, value: string,
      opts: { bold?: boolean; labelColor?: string; valueColor?: string; bgColor?: string; indent?: number; fontSize?: number } = {}
    ) => {
      const rowH = 16;
      const fs = opts.fontSize ?? 7;
      const indent = opts.indent ?? 10;
      if (opts.bgColor) {
        doc.rect(x, y, w, rowH).fill(opts.bgColor);
      }
      // Separator line
      doc.moveTo(x, y + rowH).lineTo(x + w, y + rowH).lineWidth(0.3).strokeColor(C.border).stroke();
      doc.fontSize(fs).fillColor(opts.labelColor ?? C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(label, x + indent, y + 4);
      doc.fontSize(fs).fillColor(opts.valueColor ?? C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(value, x + w - 100 - indent, y + 4, { width: 100, align: "right" });
      return y + rowH;
    };

    // Helper: Draw table section header
    const tableSectionHeader = (x: number, y: number, w: number, label: string) => {
      const rowH = 18;
      doc.rect(x, y, w, rowH).fill(C.bgLight);
      doc.moveTo(x, y + rowH).lineTo(x + w, y + rowH).lineWidth(0.3).strokeColor(C.border).stroke();
      doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold").text(label, x + 10, y + 5);
      return y + rowH;
    };

    // ============================================
    // PAGE 1
    // ============================================

    // --- HEADER (red band) ---
    const HDR_H = 68;
    doc.rect(0, 0, PAGE_W, HDR_H).fill(C.red);

    const logoPath = path.join(process.cwd(), "client/public/kenlo-logo-white.png");
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, M, 10, { height: 22 }); } catch (_) {}
    }

    doc.fontSize(13).fillColor(C.white).font("Helvetica-Bold")
      .text("Orçamento Comercial", M + 110, 14);

    const issueDate = new Date().toLocaleDateString("pt-BR");
    doc.fontSize(6).fillColor("rgba(255,255,255,0.85)").font("Helvetica")
      .text(`Emissão: ${issueDate}  |  Validade: 30 dias`, M, HDR_H - 13);

    doc.fontSize(6).fillColor(C.white).font("Helvetica");
    const vX = PAGE_W - M - 170;
    doc.text(`Vendedor: ${data.salesPersonName}`, vX, 12, { width: 170, align: "right" });
    doc.text(`Email: ${data.vendorEmail || "vendas@kenlo.com.br"}`, vX, 22, { width: 170, align: "right" });
    doc.text(`Telefone: ${data.vendorPhone || "(11) 1234-5678"}`, vX, 32, { width: 170, align: "right" });

    // --- CLIENT BAR ---
    let Y = HDR_H + 14;
    doc.fontSize(9).fillColor(C.red).font("Helvetica-Bold").text("CLIENTE:", M, Y);
    doc.fontSize(11).fillColor(C.dark).font("Helvetica-Bold")
      .text(`${data.agencyName || "Imobiliária"}  |  ${data.clientName}`, M + 60, Y - 1);
    Y += 13;
    const contactParts = [data.email, data.cellphone].filter(Boolean).join("  |  ");
    if (contactParts) {
      doc.fontSize(6.5).fillColor(C.textLight).font("Helvetica").text(contactParts, M + 50, Y);
    }
    Y += 14;

    // --- 1. NATUREZA DO NEGÓCIO ---
    Y = sectionTitle("Natureza do negócio", Y);
    const BIZ_H = 22;
    const bizTypes = [
      { key: "broker", label: "Corretora" },
      { key: "rental_admin", label: "Administrador de Aluguel" },
      { key: "both", label: "Ambos" },
    ];
    bizTypes.forEach((t, i) => {
      const x = M + i * (COL3_W + 8);
      const sel = data.businessType === t.key;
      box(x, Y, COL3_W, BIZ_H, { selected: sel });
      doc.fontSize(7).fillColor(sel ? C.pink : C.text).font(sel ? "Helvetica-Bold" : "Helvetica").text(t.label, x + 10, Y + 7);
    });
    Y += BIZ_H + SECTION_GAP;

    // --- 2. MÉTRICAS DO NEGÓCIO ---
    Y = sectionTitle("Métricas do Negócio", Y);
    const showImob = data.productType === "imob" || data.productType === "both";
    const showLoc = data.productType === "loc" || data.productType === "both";

    const CARD_H = 74;
    const cardW = COL2_W;
    const metricsStartY = Y;

    // Helper: render plan label as "IMOB - K2" with tier in RED
    const renderPlanHeader = (cx: number, y: number, w: number, productLabel: string, plan?: string) => {
      doc.roundedRect(cx, y, w, 16, 4).fill(C.dark);
      doc.rect(cx, y + 7, w, 9).fill(C.dark);
      doc.fontSize(7.5).fillColor(C.white).font("Helvetica-Bold").text(productLabel, cx + 12, y + 4);
      if (plan) {
        const labelW = doc.widthOfString(productLabel);
        doc.fontSize(7.5).fillColor(C.white).font("Helvetica").text(" - ", cx + 12 + labelW, y + 4);
        const dashW = doc.widthOfString(" - ");
        doc.fontSize(7.5).fillColor(C.red).font("Helvetica-Bold").text(plan.toUpperCase(), cx + 12 + labelW + dashW, y + 4);
      }
    };

    if (showImob) {
      const cx = M;
      box(cx, metricsStartY, cardW, CARD_H, { fill: C.bgLight, stroke: C.border });
      renderPlanHeader(cx, metricsStartY, cardW, "IMOB", data.imobPlan);

      const r1 = metricsStartY + 22;
      metricStat(cx + 12, r1, `${data.imobUsers || 0}`, "Usuários");
      metricStat(cx + cardW / 2 + 5, r1, `${data.closings || 0}`, "Fechamentos / mês");

      const r2 = r1 + 18;
      metricStat(cx + 12, r2, `${data.leadsPerMonth || 0}`, "Leads / mês");

      const r3 = r2 + 18;
      modernCheck(cx + 12, r3, data.usesExternalAI || false, "IA SDR");
      modernCheck(cx + cardW / 2 + 5, r3, data.wantsWhatsApp || false, "WhatsApp");
    }

    if (showLoc) {
      const cx = showImob ? M + cardW + 8 : M;
      box(cx, metricsStartY, cardW, CARD_H, { fill: C.bgLight, stroke: C.border });
      renderPlanHeader(cx, metricsStartY, cardW, "LOCAÇÃO", data.locPlan);

      const r1 = metricsStartY + 22;
      metricStat(cx + 12, r1, `${data.contracts || 0}`, "Contratos sob gestão");
      metricStat(cx + cardW / 2 + 5, r1, `${data.newContracts || 0}`, "Novos / mês");

      const r2 = r1 + 20;
      const hasBoleto = data.chargesBoletoToTenant || false;
      modernCheck(cx + 12, r2, hasBoleto, "Cobra Inquilino (Boleto)");
      if (hasBoleto && data.boletoAmount) {
        doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
          .text(fmt(data.boletoAmount), cx + 155, r2 + 1);
      }

      const r3 = r2 + 15;
      modernCheck(cx + 12, r3, data.chargesSplitToOwner || false, "Cobra Proprietário (Split)");
      if (data.chargesSplitToOwner && data.splitAmount) {
        doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
          .text(fmt(data.splitAmount), cx + 155, r3 + 1);
      }
    }

    Y = metricsStartY + CARD_H + SECTION_GAP;

    // --- 3. SOLUÇÃO EM ANÁLISE ---
    Y = sectionTitle("Solução em análise de contratação", Y);
    const SOL_H = 26;
    const prods = [
      { key: "imob", label: "Imob só", desc: "CRM + Site para vendas" },
      { key: "loc", label: "Loc só", desc: "Gestão de locações" },
      { key: "both", label: "Imob + Loc", desc: "Solução completa" },
    ];
    prods.forEach((p, i) => {
      const x = M + i * (COL3_W + 8);
      const sel = data.productType === p.key;
      box(x, Y, COL3_W, SOL_H, { selected: sel });
      doc.fontSize(7).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold").text(p.label, x + 10, Y + 4);
      doc.fontSize(5.5).fillColor(sel ? C.pink : C.textLight).font("Helvetica").text(p.desc, x + 10, Y + 15);
    });
    Y += SOL_H + SECTION_GAP;

    // --- 4. ADD-ONS ---
    Y = sectionTitle("Add-ons Opcionais", Y);
    const addons = [
      { key: "leads", label: "Leads", desc: "Gestão automatizada de leads" },
      { key: "inteligencia", label: "Inteligência", desc: "BI de KPIs de performance" },
      { key: "assinatura", label: "Assinatura", desc: "Assinatura digital embutida" },
      { key: "pay", label: "Pay", desc: "Boleto e Split digital embutido" },
      { key: "seguros", label: "Seguros", desc: "Seguros embutido no boleto" },
      { key: "cash", label: "Cash", desc: "Financie proprietários até 24 meses" },
    ];
    let selAddons: string[] = [];
    try {
      const parsed = JSON.parse(data.selectedAddons);
      if (Array.isArray(parsed)) {
        selAddons = parsed.map((a: string) => a.trim().toLowerCase());
      } else {
        selAddons = data.selectedAddons.split(",").map((a) => a.trim().toLowerCase());
      }
    } catch {
      selAddons = data.selectedAddons.split(",").map((a) => a.trim().toLowerCase());
    }
    const ADDON_H = 26;
    addons.forEach((a, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = M + col * (COL3_W + 8);
      const y = Y + row * (ADDON_H + 5);
      const sel = selAddons.includes(a.key);
      box(x, y, COL3_W, ADDON_H, { selected: sel });
      doc.fontSize(6.5).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold").text(a.label, x + 10, y + 4);
      doc.fontSize(5).fillColor(sel ? C.pink : C.textLight).font("Helvetica").text(a.desc, x + 10, y + 15);
    });
    Y += ADDON_H * 2 + 5 + SECTION_GAP;

    // --- 5. FREQUÊNCIA DE PAGAMENTO ---
    Y = sectionTitle("Frequência de pagamento selecionada", Y);
    const FREQ_H = 24;
    const freqsDisplay = [
      { key: "monthly", label: "Mensal", mod: "+25%" },
      { key: "semestral", label: "Semestral", mod: "+10%" },
      { key: "annual", label: "Anual", mod: "0% - Referência" },
      { key: "biannual", label: "Bienal", mod: "-10%" },
    ];
    const FREQ_W = (CW - 24) / freqsDisplay.length;
    freqsDisplay.forEach((f, i) => {
      const x = M + i * (FREQ_W + 8);
      const sel = data.paymentPlan === f.key || (f.key === "biannual" && data.paymentPlan === "biennial");
      box(x, Y, FREQ_W, FREQ_H, { selected: sel });
      doc.fontSize(6.5).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold")
        .text(f.label, x, Y + 4, { width: FREQ_W, align: "center" });
      doc.fontSize(5.5).fillColor(sel ? C.pink : C.textLight).font("Helvetica")
        .text(f.mod, x, Y + 14, { width: FREQ_W, align: "center" });
    });
    Y += FREQ_H + SECTION_GAP;

    // --- 6. PLANO SELECIONADO (Kombos) ---
    Y = sectionTitle("Plano Selecionado", Y);
    const KOMBO_H = 30;
    const kombos = [
      { key: "none", label: "Sem Kombo", disc: null },
      { key: "imob-start", label: "Imob Start", disc: "10% OFF" },
      { key: "imob-pro", label: "Imob Pro", disc: "15% OFF" },
      { key: "loc-pro", label: "Loc Pro", disc: "10% OFF" },
      { key: "core-gestao", label: "Core Gestão", disc: null },
      { key: "elite", label: "Elite", disc: "20% OFF" },
    ];
    const KOMBO_W = (CW - 40) / 6;
    const rawKombo = (data.komboName || "").toLowerCase()
      .replace(/^kombo\s+/, "")
      .replace(/locação/g, "loc")
      .replace(/gestão/g, "gestao")
      .replace(/[\s_]+/g, "-")
      .replace(/-pro$/, "-pro")
      .replace(/-start$/, "-start");

    kombos.forEach((k, i) => {
      const x = M + i * (KOMBO_W + 8);
      const sel =
        rawKombo === k.key ||
        (k.key === "none" && (!data.komboName || rawKombo === "none" || rawKombo === "sem-kombo" || rawKombo === ""));
      box(x, Y, KOMBO_W, KOMBO_H, { selected: sel });

      if (k.disc) {
        const badgePad = 3;
        doc.fontSize(5.5).font("Helvetica-Bold");
        const tw = doc.widthOfString(k.disc);
        const bw = tw + badgePad * 2;
        doc.roundedRect(x + (KOMBO_W - bw) / 2, Y + 3, bw, 10, 3).fill(sel ? C.pink : C.textLight);
        doc.fontSize(5.5).fillColor(C.white).font("Helvetica-Bold").text(k.disc, x + (KOMBO_W - bw) / 2 + badgePad, Y + 4.5);
      }

      doc.fontSize(5.5).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold")
        .text(k.label, x, Y + (k.disc ? 16 : 11), { width: KOMBO_W, align: "center" });
    });
    Y += KOMBO_H + SECTION_GAP;

    // ============================================
    // --- 7. INVESTIMENTO TABLE (matching calculadora design) ---
    // ============================================
    Y = sectionTitle("Investimento", Y);

    const TABLE_X = M;
    const TABLE_W = CW * 0.55; // Half-width table like the user's mockup

    // Parse addon prices
    let addonPricesMap: Record<string, number> = {};
    try {
      if (data.addonPrices) addonPricesMap = JSON.parse(data.addonPrices);
    } catch {}

    // --- Produtos section ---
    Y = tableSectionHeader(TABLE_X, Y, TABLE_W, "Produtos");

    if (showImob && data.imobPrice !== undefined) {
      // "Imob - K2" with K2 in red
      const imobLabel = `Imob - ${(data.imobPlan || "K").toUpperCase()}`;
      Y = tableRow(TABLE_X, Y, TABLE_W, imobLabel, fmt(data.imobPrice), {
        labelColor: C.text,
        valueColor: C.text,
      });
      // Render plan tier in red (overwrite the plan part)
      if (data.imobPlan) {
        const prefix = "Imob - ";
        doc.fontSize(7).font("Helvetica");
        const prefixW = doc.widthOfString(prefix);
        doc.fontSize(7).fillColor(C.red).font("Helvetica-Bold")
          .text(data.imobPlan.toUpperCase(), TABLE_X + 10 + prefixW, Y - 16 + 4);
      }
    }

    if (showLoc && data.locPrice !== undefined) {
      const locLabel = `Loc - ${(data.locPlan || "K").toUpperCase()}`;
      Y = tableRow(TABLE_X, Y, TABLE_W, locLabel, fmt(data.locPrice), {
        labelColor: C.text,
        valueColor: C.text,
      });
      if (data.locPlan) {
        const prefix = "Loc - ";
        doc.fontSize(7).font("Helvetica");
        const prefixW = doc.widthOfString(prefix);
        doc.fontSize(7).fillColor(C.red).font("Helvetica-Bold")
          .text(data.locPlan.toUpperCase(), TABLE_X + 10 + prefixW, Y - 16 + 4);
      }
    }

    // --- Add-ons section ---
    const paidAddons = Object.entries(addonPricesMap).filter(([_, price]) => price > 0);
    if (paidAddons.length > 0) {
      Y = tableSectionHeader(TABLE_X, Y, TABLE_W, "Add-ons");
      const addonNameMap: Record<string, string> = {
        leads: "Leads",
        inteligencia: "Inteligência",
        assinatura: "Assinatura",
        pay: "Pay",
        seguros: "Seguros",
        cash: "Cash",
      };
      for (const [key, price] of paidAddons) {
        Y = tableRow(TABLE_X, Y, TABLE_W, addonNameMap[key] || key, fmt(price));
      }
    }

    // --- Serviços Premium section ---
    const hasVip = data.vipIncluded || (data.vipPrice !== undefined && data.vipPrice > 0);
    const hasCS = data.csIncluded || (data.csPrice !== undefined && data.csPrice > 0);
    if (hasVip || hasCS) {
      Y = tableSectionHeader(TABLE_X, Y, TABLE_W, "Serviços Premium");
      if (hasVip) {
        const vipValue = data.vipIncluded ? "Incluído" : fmt(data.vipPrice || 97);
        Y = tableRow(TABLE_X, Y, TABLE_W, "Suporte VIP", vipValue, {
          valueColor: data.vipIncluded ? C.red : C.text,
          bold: data.vipIncluded,
        });
      }
      if (hasCS) {
        const csValue = data.csIncluded ? "Incluído" : fmt(data.csPrice || 197);
        Y = tableRow(TABLE_X, Y, TABLE_W, "CS Dedicado", csValue, {
          valueColor: data.csIncluded ? C.red : C.text,
          bold: data.csIncluded,
        });
      }
    }

    // --- Total Mensal row ---
    Y = tableRow(TABLE_X, Y, TABLE_W, "Total Mensal", fmt(data.totalMonthly), {
      bold: true, bgColor: C.bgLight, fontSize: 7.5,
    });

    // --- Implantação row ---
    Y = tableRow(TABLE_X, Y, TABLE_W, "Implantação", fmt(data.implantationFee), {
      bold: false,
    });

    // --- Anual Equivalente row ---
    const annualEquivalent = data.totalMonthly * 12 + data.implantationFee;
    Y = tableRow(TABLE_X, Y, TABLE_W, "Anual Equivalente", fmt(annualEquivalent), {
      bold: true, bgColor: C.bgLight, fontSize: 7.5,
    });

    Y += SECTION_GAP;

    // ============================================
    // --- TOTAL INVESTIMENTO (highlighted, full width) ---
    // ============================================
    const totalInvestment = data.totalAnnual + data.implantationFee;
    const installments = data.installments || 1;
    const installmentValue = totalInvestment / installments;
    const monthlyLicense = data.monthlyLicenseBase || data.totalMonthly || 0;

    doc.fontSize(8.5).fillColor(C.dark).font("Helvetica-Bold").text("Total Investimento", M + 10, Y);
    doc.fontSize(8.5).fillColor(C.dark).font("Helvetica-Bold").text(fmt(totalInvestment), M + CW - 120, Y, { width: 120, align: "right" });
    Y += 15;

    Y = labelRow("Condições de Pagamento", `${installments}x ${fmt(installmentValue)}`, Y, { bold: true });

    // Investimento Mensal Recorrente
    const recurringTotal = data.totalAnnual || 0;
    const monthlyRecurring = recurringTotal > 0 ? recurringTotal / 12 : monthlyLicense;
    doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold")
      .text("Investimento Mensal Recorrente (Excl. implantação)", M + 10, Y);
    doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold")
      .text(fmt(monthlyRecurring), M + CW - 120, Y, { width: 120, align: "right" });
    Y += 15;

    // ============================================
    // PAGE 2: PÓS-PAGO + RECEITA (always on page 2)
    // ============================================
    doc.addPage();

    // --- PAGE 2 HEADER ---
    doc.rect(0, 0, PAGE_W, HDR_H).fill(C.red);
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, M, 10, { height: 22 }); } catch (_) {}
    }
    doc.fontSize(13).fillColor(C.white).font("Helvetica-Bold")
      .text("Detalhamento Financeiro", M + 110, 14);
    doc.fontSize(6).fillColor("rgba(255,255,255,0.85)").font("Helvetica")
      .text(`${data.agencyName || "Imobiliária"}  |  ${data.clientName}`, M, HDR_H - 13);
    doc.fontSize(6).fillColor(C.white).font("Helvetica");
    doc.text(`Vendedor: ${data.salesPersonName}`, vX, 12, { width: 170, align: "right" });
    doc.text(`Email: ${data.vendorEmail || "vendas@kenlo.com.br"}`, vX, 22, { width: 170, align: "right" });

    Y = HDR_H + 18;

    // ============================================
    // --- PÓS-PAGO BREAKDOWN ---
    // ============================================
    let ppBreakdown: PostPaidBreakdown | null = null;
    try {
      if (data.postPaidBreakdown) ppBreakdown = JSON.parse(data.postPaidBreakdown);
    } catch {}

    const hasPostPaid = data.postPaidTotal && data.postPaidTotal > 0;

    if (hasPostPaid && ppBreakdown) {
      Y = sectionTitle("Custos Pós-Pago - Sem surpresas, só o que você usar", Y);

      const PP_TABLE_W = CW;

      // Render each group
      const renderGroup = (group: PostPaidGroup) => {
        // Group header with subtotal
        doc.moveTo(M, Y).lineTo(M + PP_TABLE_W, Y).lineWidth(1).strokeColor(C.pink).stroke();
        Y += 4;
        doc.fontSize(7.5).fillColor(C.pink).font("Helvetica-Bold").text(group.groupLabel, M, Y);
        doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold")
          .text(fmt(group.groupTotal), M + PP_TABLE_W - 120, Y, { width: 120, align: "right" });
        Y += 16;

        // Items
        for (const item of group.items) {
          // Item label + total
          doc.fontSize(7).fillColor(C.dark).font("Helvetica-Bold").text(item.label, M + 10, Y);
          doc.fontSize(7).fillColor(C.dark).font("Helvetica-Bold")
            .text(fmt(item.total), M + PP_TABLE_W - 120, Y, { width: 120, align: "right" });
          Y += 11;

          // Included / Additional + per unit
          doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
            .text(`Incluídos: ${fmtNum(item.included)} / Adicionais: ${fmtNum(item.additional)}`, M + 10, Y);
          doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
            .text(`${fmt(item.perUnit)}/${item.unitLabel}`, M + PP_TABLE_W - 120, Y, { width: 120, align: "right" });
          Y += 14;
        }
        Y += 4;
      };

      if (ppBreakdown.imobAddons && ppBreakdown.imobAddons.items.length > 0) {
        renderGroup(ppBreakdown.imobAddons);
      }
      if (ppBreakdown.locAddons && ppBreakdown.locAddons.items.length > 0) {
        renderGroup(ppBreakdown.locAddons);
      }
      if (ppBreakdown.sharedAddons && ppBreakdown.sharedAddons.items.length > 0) {
        renderGroup(ppBreakdown.sharedAddons);
      }

      // Total Pós-pago
      Y += 4;
      doc.moveTo(M, Y).lineTo(M + PP_TABLE_W, Y).lineWidth(1).strokeColor(C.dark).stroke();
      Y += 6;
      doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold").text("Total Pós-pago", M + 10, Y);
      doc.fontSize(8).fillColor(C.red).font("Helvetica-Bold")
        .text(fmt(ppBreakdown.total), M + PP_TABLE_W - 120, Y, { width: 120, align: "right" });
      Y += 20;
    } else if (hasPostPaid) {
      // Fallback: simple total
      Y = sectionTitle("Estimativa Pós-pagos Mensal (Uso Excedente)", Y);
      Y = labelRow("Total Estimado Pós-pagos", fmt(data.postPaidTotal || 0), Y, { bold: true, valueColor: C.red });
      Y += SECTION_GAP;
    }

    // ============================================
    // --- REVENUE SECTION ---
    // ============================================
    const hasRevenue = (data.revenueFromBoletos && data.revenueFromBoletos > 0) ||
      (data.revenueFromInsurance && data.revenueFromInsurance > 0);

    if (hasRevenue) {
      Y += 6;
      Y = sectionTitle("Fonte de Receita Mensal", Y);

      const revSources = [
        {
          key: "pay",
          label: "Kenlo Pay",
          desc: "Receita de boletos e split digital",
          detail: data.chargesSplitToOwner ? "Cobra Proprietário (Split) ativo" : "Cobrança de boletos ativa",
          value: data.revenueFromBoletos || 0,
          active: (data.revenueFromBoletos || 0) > 0,
          formula: `${data.contracts || 0} contratos × valor por contrato`,
        },
        {
          key: "seguros",
          label: "Kenlo Seguros",
          desc: "Seguros embutido no boleto de locação",
          detail: "R$10,00 por contrato/mês",
          value: data.revenueFromInsurance || 0,
          active: (data.revenueFromInsurance || 0) > 0,
          formula: `${data.contracts || 0} contratos × R$10,00`,
        },
      ];

      const REV_CARD_W = COL2_W;
      const REV_CARD_H = 70;
      revSources.forEach((rs, i) => {
        const x = M + i * (REV_CARD_W + 8);
        box(x, Y, REV_CARD_W, REV_CARD_H, { selected: rs.active });

        const dotColor = rs.active ? C.pink : C.border;
        doc.circle(x + 16, Y + 14, 5).fill(dotColor);
        doc.fontSize(5.5).fillColor(C.white).font("Helvetica-Bold")
          .text(rs.active ? "✓" : "–", x + 13.5, Y + 12);

        doc.fontSize(8.5).fillColor(rs.active ? C.pink : C.text).font("Helvetica-Bold")
          .text(rs.label, x + 28, Y + 9);
        doc.fontSize(6).fillColor(rs.active ? C.pink : C.textLight).font("Helvetica")
          .text(rs.desc, x + 28, Y + 20);

        doc.moveTo(x + 12, Y + 34).lineTo(x + REV_CARD_W - 12, Y + 34)
          .lineWidth(0.3).strokeColor(rs.active ? C.pinkBorder : C.border).stroke();

        doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
          .text(rs.formula, x + 12, Y + 40);
        doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
          .text(rs.detail, x + 12, Y + 50);

        doc.fontSize(11).fillColor(rs.active ? C.green : C.textLight).font("Helvetica-Bold")
          .text(fmt(rs.value), x + 12, Y + 53, { width: REV_CARD_W - 24, align: "right" });
      });
      Y += REV_CARD_H + SECTION_GAP;

      // --- RESUMO FINANCEIRO MENSAL ---
      const totalRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
      Y = sectionTitle("Resumo Financeiro Mensal", Y);

      const SUMMARY_H = 110;
      box(M, Y, CW, SUMMARY_H, { fill: C.bgLight, stroke: C.border });

      let tY = Y + 10;
      doc.fontSize(7).fillColor(C.text).font("Helvetica")
        .text("Receita Kenlo Pay", M + 16, tY);
      doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
        .text(`+ ${fmt(data.revenueFromBoletos || 0)}`, M + CW - 136, tY, { width: 120, align: "right" });
      tY += LINE_H;

      doc.fontSize(7).fillColor(C.text).font("Helvetica")
        .text("Receita Kenlo Seguros", M + 16, tY);
      doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
        .text(`+ ${fmt(data.revenueFromInsurance || 0)}`, M + CW - 136, tY, { width: 120, align: "right" });
      tY += LINE_H;

      doc.moveTo(M + 12, tY).lineTo(M + CW - 12, tY)
        .lineWidth(0.3).strokeColor(C.border).stroke();
      tY += 7;

      doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold")
        .text("Total Receita Mensal", M + 16, tY);
      doc.fontSize(7.5).fillColor(C.green).font("Helvetica-Bold")
        .text(fmt(totalRevenue), M + CW - 136, tY, { width: 120, align: "right" });
      tY += 15;

      doc.fontSize(7).fillColor(C.text).font("Helvetica")
        .text("Investimento Mensal Kenlo (Equivalente)", M + 16, tY);
      doc.fontSize(7).fillColor(C.red).font("Helvetica-Bold")
        .text(`- ${fmt(monthlyRecurring)}`, M + CW - 136, tY, { width: 120, align: "right" });
      tY += LINE_H;

      if (data.postPaidTotal && data.postPaidTotal > 0) {
        doc.fontSize(7).fillColor(C.text).font("Helvetica")
          .text("Estimativa Pós-pagos (Excedente)", M + 16, tY);
        doc.fontSize(7).fillColor(C.red).font("Helvetica-Bold")
          .text(`- ${fmt(data.postPaidTotal)}`, M + CW - 136, tY, { width: 120, align: "right" });
        tY += LINE_H;
      }

      Y += SUMMARY_H + SECTION_GAP;

      // --- GANHO LÍQUIDO MENSAL ESTIMADO ---
      const netGain = data.netGain || (totalRevenue - monthlyRecurring - (data.postPaidTotal || 0));
      const isPositive = netGain > 0;

      const NET_CARD_H = 72;
      const greenBg = isPositive ? "#ECFDF5" : "#FEF2F2";
      const greenBorder = isPositive ? "#6EE7B7" : "#FCA5A5";
      const greenText = isPositive ? C.green : C.red;

      box(M, Y, CW, NET_CARD_H, { fill: greenBg, stroke: greenBorder, lw: 1.5 });

      doc.fontSize(8.5).fillColor(C.dark).font("Helvetica-Bold")
        .text("Ganho Líquido Mensal Estimado", M, Y + 10, { width: CW, align: "center" });

      doc.fontSize(26).fillColor(greenText).font("Helvetica-Bold")
        .text(fmt(netGain), M, Y + 26, { width: CW, align: "center" });

      doc.fontSize(6.5).fillColor(C.textLight).font("Helvetica")
        .text(isPositive ? "Receita extras supera o investimento na plataforma" : "Investimento na plataforma supera receita extras", M, Y + 55, { width: CW, align: "center" });

      Y += NET_CARD_H + SECTION_GAP;

      // --- ROI INDICATORS ---
      if (isPositive && monthlyRecurring > 0) {
        const roiPercent = ((totalRevenue / monthlyRecurring) * 100 - 100).toFixed(0);
        const paybackMonths = monthlyRecurring > 0 ? Math.ceil((data.implantationFee || 0) / netGain) : 0;

        Y = sectionTitle("Indicadores de Retorno", Y);

        const INDICATOR_W = (CW - 16) / 3;
        const INDICATOR_H = 46;

        box(M, Y, INDICATOR_W, INDICATOR_H, { fill: C.bgLight, stroke: C.border });
        doc.fontSize(16).fillColor(C.green).font("Helvetica-Bold")
          .text(`${roiPercent}%`, M, Y + 7, { width: INDICATOR_W, align: "center" });
        doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
          .text("ROI Receita vs Investimento", M, Y + 29, { width: INDICATOR_W, align: "center" });

        box(M + INDICATOR_W + 8, Y, INDICATOR_W, INDICATOR_H, { fill: C.bgLight, stroke: C.border });
        doc.fontSize(16).fillColor(C.blue).font("Helvetica-Bold")
          .text(`${paybackMonths}`, M + INDICATOR_W + 8, Y + 7, { width: INDICATOR_W, align: "center" });
        doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
          .text("Meses para Payback", M + INDICATOR_W + 8, Y + 29, { width: INDICATOR_W, align: "center" });

        const annualGain = netGain * 12;
        box(M + (INDICATOR_W + 8) * 2, Y, INDICATOR_W, INDICATOR_H, { fill: C.bgLight, stroke: C.border });
        doc.fontSize(13).fillColor(C.green).font("Helvetica-Bold")
          .text(fmt(annualGain), M + (INDICATOR_W + 8) * 2, Y + 9, { width: INDICATOR_W, align: "center" });
        doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
          .text("Ganho Anual Estimado", M + (INDICATOR_W + 8) * 2, Y + 29, { width: INDICATOR_W, align: "center" });

        Y += INDICATOR_H + SECTION_GAP;
      }
    }

    // --- CTA SLOGAN BOX ---
    if (Y + 50 < MAX_Y) {
      const CTA_H = 40;
      doc.roundedRect(M + 40, Y, CW - 80, CTA_H, 6).fill(C.red);
      doc.fontSize(11).fillColor(C.white).font("Helvetica-Bold")
        .text("Kenlo — Quem usa, lidera.", M + 50, Y + 8, { width: CW - 100, align: "center" });
      doc.fontSize(6.5).fillColor("rgba(255,255,255,0.8)").font("Helvetica")
        .text("Transforme sua imobiliária em uma máquina de resultados", M + 50, Y + 24, { width: CW - 100, align: "center" });
    }

    doc.end();
  });
}
