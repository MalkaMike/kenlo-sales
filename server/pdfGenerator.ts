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
    // CONSTANTS — tighter spacing to fit page 1
    // ============================================
    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const M = 40;
    const CW = PAGE_W - M * 2;
    const COL3_W = (CW - 16) / 3;
    const COL2_W = (CW - 8) / 2;
    const COL4_W = (CW - 24) / 4;
    const GAP = 10;
    const LINE_H = 12;
    const MAX_Y = PAGE_H - M;

    const C = {
      red: "#E11D48", pink: "#EC4899", pinkLight: "#FDF2F8", pinkBorder: "#F9A8D4",
      dark: "#1E293B", text: "#1F2937", textLight: "#6B7280",
      border: "#E5E7EB", borderLight: "#F3F4F6", white: "#FFFFFF",
      green: "#10B981", blue: "#3B82F6", bgLight: "#F9FAFB",
    };

    const fmt = (v: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(v);
    const fmtNum = (v: number) =>
      new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(v);

    // ============================================
    // HELPERS
    // ============================================
    const box = (
      x: number, y: number, w: number, h: number,
      opts: { fill?: string; stroke?: string; lw?: number; r?: number; selected?: boolean } = {}
    ) => {
      const r = opts.r ?? 3;
      if (opts.selected) {
        doc.roundedRect(x, y, w, h, r).lineWidth(1.5).fillAndStroke(C.pinkLight, C.pink);
      } else {
        doc.roundedRect(x, y, w, h, r).lineWidth(opts.lw ?? 0.5).fillAndStroke(opts.fill ?? C.white, opts.stroke ?? C.border);
      }
    };

    const modernCheck = (x: number, y: number, checked: boolean, label: string) => {
      const sz = 9;
      const cx = x + sz / 2, cy = y + sz / 2;
      if (checked) {
        doc.circle(cx, cy, sz / 2).fill(C.pink);
        doc.save().lineWidth(1).strokeColor(C.white);
        doc.moveTo(cx - 2.5, cy).lineTo(cx - 0.5, cy + 2.5).lineTo(cx + 3, cy - 2).stroke();
        doc.restore();
      } else {
        doc.circle(cx, cy, sz / 2).lineWidth(0.7).stroke(C.border);
      }
      doc.fontSize(6.5).fillColor(checked ? C.pink : C.text).font(checked ? "Helvetica-Bold" : "Helvetica")
        .text(label, x + sz + 4, y + 1);
    };

    const secTitle = (label: string, y: number) => {
      doc.fontSize(8.5).fillColor(C.dark).font("Helvetica-Bold").text(label, M, y);
      return y + 13;
    };

    const labelRow = (label: string, value: string, y: number, opts: { bold?: boolean; indent?: number; valueColor?: string } = {}) => {
      const indent = opts.indent ?? 10;
      doc.fontSize(6.5).fillColor(C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica").text(label, M + indent, y);
      doc.fontSize(6.5).fillColor(opts.valueColor ?? C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(value, M + CW - 120, y, { width: 120, align: "right" });
      return y + LINE_H;
    };

    const metricStat = (x: number, y: number, value: string, label: string) => {
      doc.fontSize(12).fillColor(C.dark).font("Helvetica-Bold").text(value, x, y);
      const numW = doc.widthOfString(value);
      doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica").text(label, x + numW + 3, y + 4);
    };

    // Table helpers
    const ROW_H = 14;
    const HDR_ROW_H = 15;

    const tableRow = (
      x: number, y: number, w: number, label: string, value: string,
      opts: { bold?: boolean; labelColor?: string; valueColor?: string; bgColor?: string; fontSize?: number } = {}
    ) => {
      const fs = opts.fontSize ?? 6.5;
      if (opts.bgColor) doc.rect(x, y, w, ROW_H).fill(opts.bgColor);
      doc.moveTo(x, y + ROW_H).lineTo(x + w, y + ROW_H).lineWidth(0.3).strokeColor(C.border).stroke();
      doc.fontSize(fs).fillColor(opts.labelColor ?? C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(label, x + 8, y + 3);
      doc.fontSize(fs).fillColor(opts.valueColor ?? C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(value, x + w - 108, y + 3, { width: 100, align: "right" });
      return y + ROW_H;
    };

    const tableSectionHeader = (x: number, y: number, w: number, label: string) => {
      doc.rect(x, y, w, HDR_ROW_H).fill(C.bgLight);
      doc.moveTo(x, y + HDR_ROW_H).lineTo(x + w, y + HDR_ROW_H).lineWidth(0.3).strokeColor(C.border).stroke();
      doc.fontSize(7).fillColor(C.dark).font("Helvetica-Bold").text(label, x + 8, y + 4);
      return y + HDR_ROW_H;
    };

    // Normalize productType
    const showImob = data.productType === "imob" || data.productType === "both" || data.productType === "imob_loc";
    const showLoc = data.productType === "loc" || data.productType === "both" || data.productType === "imob_loc";

    // ============================================
    // PAGE 1 — HEADER (compact)
    // ============================================
    const HDR_H = 55;
    doc.rect(0, 0, PAGE_W, HDR_H).fill(C.red);

    const logoPath = path.join(process.cwd(), "client/public/kenlo-logo-white.png");
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, M, 8, { height: 20 }); } catch (_) {}
    }
    doc.fontSize(12).fillColor(C.white).font("Helvetica-Bold").text("Orçamento Comercial", M + 100, 12);

    const issueDate = new Date().toLocaleDateString("pt-BR");
    doc.fontSize(5.5).fillColor("rgba(255,255,255,0.85)").font("Helvetica")
      .text(`Emissão: ${issueDate}  |  Validade: 30 dias`, M, HDR_H - 11);

    const vX = PAGE_W - M - 170;
    doc.fontSize(5.5).fillColor(C.white).font("Helvetica");
    doc.text(`Vendedor: ${data.salesPersonName}`, vX, 10, { width: 170, align: "right" });
    doc.text(`Email: ${data.vendorEmail || "vendas@kenlo.com.br"}`, vX, 19, { width: 170, align: "right" });
    doc.text(`Telefone: ${data.vendorPhone || "(11) 1234-5678"}`, vX, 28, { width: 170, align: "right" });

    // --- CLIENT BAR ---
    let Y = HDR_H + 10;
    doc.fontSize(8).fillColor(C.red).font("Helvetica-Bold").text("CLIENTE:", M, Y);
    doc.fontSize(10).fillColor(C.dark).font("Helvetica-Bold")
      .text(`${data.agencyName || "Imobiliária"}  |  ${data.clientName}`, M + 55, Y - 1);
    Y += 12;
    const contactParts = [data.email, data.cellphone].filter(Boolean).join("  |  ");
    if (contactParts) {
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica").text(contactParts, M + 45, Y);
    }
    Y += 12;

    // --- 1. NATUREZA DO NEGÓCIO ---
    Y = secTitle("Natureza do negócio", Y);
    const BIZ_H = 20;
    const bizTypes = [
      { key: "broker", label: "Corretora" },
      { key: "rental_admin", label: "Administrador de Aluguel" },
      { key: "both", label: "Ambos" },
    ];
    bizTypes.forEach((t, i) => {
      const x = M + i * (COL3_W + 8);
      const sel = data.businessType === t.key;
      box(x, Y, COL3_W, BIZ_H, { selected: sel });
      doc.fontSize(6.5).fillColor(sel ? C.pink : C.text).font(sel ? "Helvetica-Bold" : "Helvetica").text(t.label, x + 8, Y + 6);
    });
    Y += BIZ_H + GAP;

    // --- 2. MÉTRICAS DO NEGÓCIO ---
    Y = secTitle("Métricas do Negócio", Y);
    const CARD_H = 66;
    const cardW = COL2_W;
    const metricsStartY = Y;

    const renderPlanHeader = (cx: number, y: number, w: number, productLabel: string, plan?: string) => {
      doc.roundedRect(cx, y, w, 14, 3).fill(C.dark);
      doc.rect(cx, y + 6, w, 8).fill(C.dark);
      doc.fontSize(7).fillColor(C.white).font("Helvetica-Bold").text(productLabel, cx + 10, y + 3);
      if (plan) {
        const labelW = doc.widthOfString(productLabel);
        doc.fontSize(7).fillColor(C.white).font("Helvetica").text(" - ", cx + 10 + labelW, y + 3);
        const dashW = doc.widthOfString(" - ");
        doc.fontSize(7).fillColor(C.red).font("Helvetica-Bold").text(plan.toUpperCase(), cx + 10 + labelW + dashW, y + 3);
      }
    };

    if (showImob) {
      const cx = M;
      box(cx, metricsStartY, cardW, CARD_H, { fill: C.bgLight, stroke: C.border });
      renderPlanHeader(cx, metricsStartY, cardW, "IMOB", data.imobPlan);
      const r1 = metricsStartY + 20;
      metricStat(cx + 10, r1, `${data.imobUsers || 0}`, "Usuários");
      metricStat(cx + cardW / 2 + 5, r1, `${data.closings || 0}`, "Fechamentos / mês");
      const r2 = r1 + 16;
      metricStat(cx + 10, r2, `${data.leadsPerMonth || 0}`, "Leads / mês");
      const r3 = r2 + 16;
      modernCheck(cx + 10, r3, data.usesExternalAI || false, "IA SDR");
      modernCheck(cx + cardW / 2 + 5, r3, data.wantsWhatsApp || false, "WhatsApp");
    }

    if (showLoc) {
      const cx = showImob ? M + cardW + 8 : M;
      box(cx, metricsStartY, cardW, CARD_H, { fill: C.bgLight, stroke: C.border });
      renderPlanHeader(cx, metricsStartY, cardW, "LOCAÇÃO", data.locPlan);
      const r1 = metricsStartY + 20;
      metricStat(cx + 10, r1, `${data.contracts || 0}`, "Contratos sob gestão");
      metricStat(cx + cardW / 2 + 5, r1, `${data.newContracts || 0}`, "Novos / mês");
      const r2 = r1 + 18;
      const hasBoleto = data.chargesBoletoToTenant || false;
      modernCheck(cx + 10, r2, hasBoleto, "Cobra Inquilino (Boleto)");
      if (hasBoleto && data.boletoAmount) {
        doc.fontSize(6.5).fillColor(C.green).font("Helvetica-Bold").text(fmt(data.boletoAmount), cx + 145, r2 + 1);
      }
      const r3 = r2 + 14;
      modernCheck(cx + 10, r3, data.chargesSplitToOwner || false, "Cobra Proprietário (Split)");
      if (data.chargesSplitToOwner && data.splitAmount) {
        doc.fontSize(6.5).fillColor(C.green).font("Helvetica-Bold").text(fmt(data.splitAmount), cx + 145, r3 + 1);
      }
    }
    Y = metricsStartY + CARD_H + GAP;

    // --- 3. SOLUÇÃO EM ANÁLISE ---
    Y = secTitle("Solução em análise de contratação", Y);
    const SOL_H = 22;
    const prods = [
      { key: "imob", label: "Imob só", desc: "CRM + Site para vendas" },
      { key: "loc", label: "Loc só", desc: "Gestão de locações" },
      { key: "both", label: "Imob + Loc", desc: "Solução completa" },
    ];
    prods.forEach((p, i) => {
      const x = M + i * (COL3_W + 8);
      const sel = data.productType === p.key || (p.key === "both" && data.productType === "imob_loc");
      box(x, Y, COL3_W, SOL_H, { selected: sel });
      doc.fontSize(6.5).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold").text(p.label, x + 8, Y + 3);
      doc.fontSize(5).fillColor(sel ? C.pink : C.textLight).font("Helvetica").text(p.desc, x + 8, Y + 13);
    });
    Y += SOL_H + GAP;

    // --- 4. ADD-ONS ---
    Y = secTitle("Add-ons Opcionais", Y);
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
      if (Array.isArray(parsed)) selAddons = parsed.map((a: string) => a.trim().toLowerCase());
      else selAddons = data.selectedAddons.split(",").map((a) => a.trim().toLowerCase());
    } catch { selAddons = data.selectedAddons.split(",").map((a) => a.trim().toLowerCase()); }

    const ADDON_H = 22;
    addons.forEach((a, i) => {
      const row = Math.floor(i / 3), col = i % 3;
      const x = M + col * (COL3_W + 8);
      const y = Y + row * (ADDON_H + 4);
      const sel = selAddons.includes(a.key);
      box(x, y, COL3_W, ADDON_H, { selected: sel });
      doc.fontSize(6).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold").text(a.label, x + 8, y + 3);
      doc.fontSize(4.5).fillColor(sel ? C.pink : C.textLight).font("Helvetica").text(a.desc, x + 8, y + 13);
    });
    Y += ADDON_H * 2 + 4 + GAP;

    // --- 5. FREQUÊNCIA ---
    Y = secTitle("Frequência de pagamento selecionada", Y);
    const FREQ_H = 22;
    const freqs = [
      { key: "monthly", label: "Mensal", desc: "+25%" },
      { key: "semestral", label: "Semestral", desc: "+10%" },
      { key: "annual", label: "Anual", desc: "0% - Referência" },
      { key: "bienal", label: "Bienal", desc: "-10%" },
    ];
    freqs.forEach((f, i) => {
      const x = M + i * (COL4_W + 8);
      const sel = data.paymentPlan === f.key;
      box(x, Y, COL4_W, FREQ_H, { selected: sel });
      doc.fontSize(6.5).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold")
        .text(f.label, x, Y + 3, { width: COL4_W, align: "center" });
      doc.fontSize(5).fillColor(sel ? C.pink : C.textLight).font("Helvetica")
        .text(f.desc, x, Y + 14, { width: COL4_W, align: "center" });
    });
    Y += FREQ_H + GAP;

    // --- 6. PLANO SELECIONADO (Kombos) ---
    Y = secTitle("Plano Selecionado", Y);
    const KOMBO_H = 32;
    const kombos = [
      { id: "sem_kombo", label: "Sem Kombo", discount: 0 },
      { id: "imob_start", label: "Imob Start", discount: 10 },
      { id: "imob_pro", label: "Imob Pro", discount: 15 },
      { id: "locacao_pro", label: "Loc Pro", discount: 10 },
      { id: "core_gestao", label: "Core Gestão", discount: 15 },
      { id: "elite", label: "Elite", discount: 20 },
    ];
    const KOMBO_W = (CW - 5 * 6) / 6;
    const rawKombo = data.komboName || "sem_kombo";
    const normalizedKombo = rawKombo.toLowerCase()
      .replace(/^kombo\s+/i, "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

    kombos.forEach((k, i) => {
      const x = M + i * (KOMBO_W + 6);
      const sel = normalizedKombo === k.id || normalizedKombo === k.label.toLowerCase().replace(/\s+/g, "_");
      box(x, Y, KOMBO_W, KOMBO_H, { selected: sel });
      if (k.discount > 0) {
        const badgeW = 34, badgeH = 11;
        const bx = x + (KOMBO_W - badgeW) / 2;
        doc.roundedRect(bx, Y + 3, badgeW, badgeH, 3).fill(sel ? C.pink : C.dark);
        doc.fontSize(5.5).fillColor(C.white).font("Helvetica-Bold")
          .text(`${k.discount}% OFF`, bx, Y + 5, { width: badgeW, align: "center" });
      }
      doc.fontSize(5.5).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold")
        .text(k.label, x, Y + (k.discount > 0 ? 18 : 10), { width: KOMBO_W, align: "center" });
    });
    Y += KOMBO_H;

    // Plan tier row below kombos
    const planParts: string[] = [];
    if (showImob && data.imobPlan) planParts.push(`IMOB: ${data.imobPlan.toUpperCase()}`);
    if (showLoc && data.locPlan) planParts.push(`LOC: ${data.locPlan.toUpperCase()}`);
    if (planParts.length > 0) {
      Y += 4;
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica").text("Plano: ", M, Y);
      const prefW = doc.widthOfString("Plano: ");
      doc.fontSize(6).fillColor(C.red).font("Helvetica-Bold").text(planParts.join("  |  "), M + prefW, Y);
      Y += 10;
    }
    Y += GAP;

    // ============================================
    // --- 7. INVESTIMENTO TABLE ---
    // ============================================
    Y = secTitle("Investimento", Y);
    const TABLE_X = M;
    const TABLE_W = CW * 0.55;

    let addonPricesMap: Record<string, number> = {};
    try { if (data.addonPrices) addonPricesMap = JSON.parse(data.addonPrices); } catch {}

    // Produtos
    Y = tableSectionHeader(TABLE_X, Y, TABLE_W, "Produtos");
    if (showImob && data.imobPrice !== undefined) {
      Y = tableRow(TABLE_X, Y, TABLE_W, `Imob - ${(data.imobPlan || "K").toUpperCase()}`, fmt(data.imobPrice));
      if (data.imobPlan) {
        const prefix = "Imob - ";
        doc.fontSize(6.5).font("Helvetica");
        const prefixW = doc.widthOfString(prefix);
        doc.fontSize(6.5).fillColor(C.red).font("Helvetica-Bold")
          .text(data.imobPlan.toUpperCase(), TABLE_X + 8 + prefixW, Y - ROW_H + 3);
      }
    }
    if (showLoc && data.locPrice !== undefined) {
      Y = tableRow(TABLE_X, Y, TABLE_W, `Loc - ${(data.locPlan || "K").toUpperCase()}`, fmt(data.locPrice));
      if (data.locPlan) {
        const prefix = "Loc - ";
        doc.fontSize(6.5).font("Helvetica");
        const prefixW = doc.widthOfString(prefix);
        doc.fontSize(6.5).fillColor(C.red).font("Helvetica-Bold")
          .text(data.locPlan.toUpperCase(), TABLE_X + 8 + prefixW, Y - ROW_H + 3);
      }
    }

    // Add-ons
    const paidAddons = Object.entries(addonPricesMap).filter(([_, price]) => price > 0);
    if (paidAddons.length > 0) {
      Y = tableSectionHeader(TABLE_X, Y, TABLE_W, "Add-ons");
      const addonNameMap: Record<string, string> = {
        leads: "Leads", inteligencia: "Inteligência", assinatura: "Assinatura",
        pay: "Pay", seguros: "Seguros", cash: "Cash",
      };
      for (const [key, price] of paidAddons) {
        Y = tableRow(TABLE_X, Y, TABLE_W, addonNameMap[key] || key, fmt(price));
      }
    }

    // Serviços Premium
    const hasVip = data.vipIncluded || (data.vipPrice !== undefined && data.vipPrice > 0);
    const hasCS = data.csIncluded || (data.csPrice !== undefined && data.csPrice > 0);
    if (hasVip || hasCS) {
      Y = tableSectionHeader(TABLE_X, Y, TABLE_W, "Serviços Premium");
      if (hasVip) {
        const vipValue = data.vipIncluded ? "Incluído" : fmt(data.vipPrice || 97);
        Y = tableRow(TABLE_X, Y, TABLE_W, "Suporte VIP", vipValue, {
          valueColor: data.vipIncluded ? C.red : C.text, bold: data.vipIncluded,
        });
      }
      if (hasCS) {
        const csValue = data.csIncluded ? "Incluído" : fmt(data.csPrice || 197);
        Y = tableRow(TABLE_X, Y, TABLE_W, "CS Dedicado", csValue, {
          valueColor: data.csIncluded ? C.red : C.text, bold: data.csIncluded,
        });
      }
    }

    // Summary rows
    Y = tableRow(TABLE_X, Y, TABLE_W, "Total Mensal", fmt(data.totalMonthly), { bold: true, bgColor: C.bgLight, fontSize: 7 });
    Y = tableRow(TABLE_X, Y, TABLE_W, "Implantação", fmt(data.implantationFee));
    const annualEquivalent = data.totalMonthly * 12 + data.implantationFee;
    Y = tableRow(TABLE_X, Y, TABLE_W, "Anual Equivalente", fmt(annualEquivalent), { bold: true, bgColor: C.bgLight, fontSize: 7 });

    Y += GAP;

    // ============================================
    // --- TOTAL INVESTIMENTO ---
    // ============================================
    const totalInvestment = data.totalAnnual + data.implantationFee;
    const installments = data.installments || 1;
    const installmentValue = totalInvestment / installments;
    const monthlyLicense = data.monthlyLicenseBase || data.totalMonthly || 0;

    doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold").text("Total Investimento", M + 8, Y);
    doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold").text(fmt(totalInvestment), M + CW - 120, Y, { width: 120, align: "right" });
    Y += 13;

    Y = labelRow("Condições de Pagamento", `${installments}x ${fmt(installmentValue)}`, Y, { bold: true });

    const recurringTotal = data.totalAnnual || 0;
    const monthlyRecurring = recurringTotal > 0 ? recurringTotal / 12 : monthlyLicense;
    doc.fontSize(7).fillColor(C.dark).font("Helvetica-Bold")
      .text("Investimento Mensal Recorrente (Excl. implantação)", M + 10, Y);
    doc.fontSize(7).fillColor(C.dark).font("Helvetica-Bold")
      .text(fmt(monthlyRecurring), M + CW - 120, Y, { width: 120, align: "right" });
    Y += 13;

    // ============================================
    // PAGE 2: PÓS-PAGO + RECEITA
    // ============================================
    doc.addPage();

    // Page 2 header
    doc.rect(0, 0, PAGE_W, HDR_H).fill(C.red);
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, M, 8, { height: 20 }); } catch (_) {}
    }
    doc.fontSize(12).fillColor(C.white).font("Helvetica-Bold").text("Detalhamento Financeiro", M + 100, 12);
    doc.fontSize(5.5).fillColor("rgba(255,255,255,0.85)").font("Helvetica")
      .text(`${data.agencyName || "Imobiliária"}  |  ${data.clientName}`, M, HDR_H - 11);
    doc.fontSize(5.5).fillColor(C.white).font("Helvetica");
    doc.text(`Vendedor: ${data.salesPersonName}`, vX, 10, { width: 170, align: "right" });
    doc.text(`Email: ${data.vendorEmail || "vendas@kenlo.com.br"}`, vX, 19, { width: 170, align: "right" });

    Y = HDR_H + 16;

    // ============================================
    // --- PÓS-PAGO BREAKDOWN ---
    // ============================================
    let ppBreakdown: PostPaidBreakdown | null = null;
    try { if (data.postPaidBreakdown) ppBreakdown = JSON.parse(data.postPaidBreakdown); } catch {}

    const hasPostPaid = data.postPaidTotal && data.postPaidTotal > 0;

    if (hasPostPaid && ppBreakdown) {
      Y = secTitle("Custos Pós-Pago - Sem surpresas, só o que você usar", Y);
      const PP_W = CW;

      const renderGroup = (group: PostPaidGroup) => {
        doc.moveTo(M, Y).lineTo(M + PP_W, Y).lineWidth(1).strokeColor(C.pink).stroke();
        Y += 3;
        doc.fontSize(7).fillColor(C.pink).font("Helvetica-Bold").text(group.groupLabel, M, Y);
        doc.fontSize(7).fillColor(C.dark).font("Helvetica-Bold")
          .text(fmt(group.groupTotal), M + PP_W - 120, Y, { width: 120, align: "right" });
        Y += 14;
        for (const item of group.items) {
          doc.fontSize(6.5).fillColor(C.dark).font("Helvetica-Bold").text(item.label, M + 8, Y);
          doc.fontSize(6.5).fillColor(C.dark).font("Helvetica-Bold")
            .text(fmt(item.total), M + PP_W - 120, Y, { width: 120, align: "right" });
          Y += 10;
          doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
            .text(`Incluídos: ${fmtNum(item.included)} / Adicionais: ${fmtNum(item.additional)}`, M + 8, Y);
          doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
            .text(`${fmt(item.perUnit)}/${item.unitLabel}`, M + PP_W - 120, Y, { width: 120, align: "right" });
          Y += 12;
        }
        Y += 3;
      };

      if (ppBreakdown.imobAddons?.items.length) renderGroup(ppBreakdown.imobAddons);
      if (ppBreakdown.locAddons?.items.length) renderGroup(ppBreakdown.locAddons);
      if (ppBreakdown.sharedAddons?.items.length) renderGroup(ppBreakdown.sharedAddons);

      Y += 3;
      doc.moveTo(M, Y).lineTo(M + PP_W, Y).lineWidth(1).strokeColor(C.dark).stroke();
      Y += 5;
      doc.fontSize(7.5).fillColor(C.dark).font("Helvetica-Bold").text("Total Pós-pago", M + 8, Y);
      doc.fontSize(7.5).fillColor(C.red).font("Helvetica-Bold")
        .text(fmt(ppBreakdown.total), M + PP_W - 120, Y, { width: 120, align: "right" });
      Y += 18;
    } else if (hasPostPaid) {
      Y = secTitle("Estimativa Pós-pagos Mensal (Uso Excedente)", Y);
      Y = labelRow("Total Estimado Pós-pagos", fmt(data.postPaidTotal || 0), Y, { bold: true, valueColor: C.red });
      Y += GAP;
    }

    // ============================================
    // --- REVENUE SECTION ---
    // ============================================
    const hasRevenue = (data.revenueFromBoletos && data.revenueFromBoletos > 0) ||
      (data.revenueFromInsurance && data.revenueFromInsurance > 0);

    if (hasRevenue) {
      Y += 4;
      Y = secTitle("Fonte de Receita Mensal", Y);

      const revSources = [
        {
          key: "pay", label: "Kenlo Pay", desc: "Receita de boletos e split digital",
          detail: data.chargesSplitToOwner ? "Cobra Proprietário (Split) ativo" : "Cobrança de boletos ativa",
          value: data.revenueFromBoletos || 0, active: (data.revenueFromBoletos || 0) > 0,
          formula: `${data.contracts || 0} contratos × valor por contrato`,
        },
        {
          key: "seguros", label: "Kenlo Seguros", desc: "Seguros embutido no boleto de locação",
          detail: "R$10,00 por contrato/mês", value: data.revenueFromInsurance || 0,
          active: (data.revenueFromInsurance || 0) > 0,
          formula: `${data.contracts || 0} contratos × R$10,00`,
        },
      ];

      const REV_CARD_W = COL2_W;
      const REV_CARD_H = 65;
      revSources.forEach((rs, i) => {
        const x = M + i * (REV_CARD_W + 8);
        box(x, Y, REV_CARD_W, REV_CARD_H, { selected: rs.active });
        const dotColor = rs.active ? C.pink : C.border;
        doc.circle(x + 14, Y + 12, 4.5).fill(dotColor);
        doc.fontSize(5).fillColor(C.white).font("Helvetica-Bold").text(rs.active ? "✓" : "–", x + 11.5, Y + 10);
        doc.fontSize(8).fillColor(rs.active ? C.pink : C.text).font("Helvetica-Bold").text(rs.label, x + 24, Y + 8);
        doc.fontSize(5.5).fillColor(rs.active ? C.pink : C.textLight).font("Helvetica").text(rs.desc, x + 24, Y + 18);
        doc.moveTo(x + 10, Y + 30).lineTo(x + REV_CARD_W - 10, Y + 30).lineWidth(0.3).strokeColor(rs.active ? C.pinkBorder : C.border).stroke();
        doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica").text(rs.formula, x + 10, Y + 35);
        doc.fontSize(5).fillColor(C.textLight).font("Helvetica").text(rs.detail, x + 10, Y + 44);
        doc.fontSize(10).fillColor(rs.active ? C.green : C.textLight).font("Helvetica-Bold")
          .text(fmt(rs.value), x + 10, Y + 48, { width: REV_CARD_W - 20, align: "right" });
      });
      Y += REV_CARD_H + GAP;

      // --- RESUMO FINANCEIRO MENSAL ---
      const totalRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
      Y = secTitle("Resumo Financeiro Mensal", Y);

      const SUMMARY_H = 100;
      box(M, Y, CW, SUMMARY_H, { fill: C.bgLight, stroke: C.border });

      let tY = Y + 8;
      doc.fontSize(6.5).fillColor(C.text).font("Helvetica").text("Receita Kenlo Pay", M + 14, tY);
      doc.fontSize(6.5).fillColor(C.green).font("Helvetica-Bold")
        .text(`+ ${fmt(data.revenueFromBoletos || 0)}`, M + CW - 134, tY, { width: 120, align: "right" });
      tY += LINE_H;

      doc.fontSize(6.5).fillColor(C.text).font("Helvetica").text("Receita Kenlo Seguros", M + 14, tY);
      doc.fontSize(6.5).fillColor(C.green).font("Helvetica-Bold")
        .text(`+ ${fmt(data.revenueFromInsurance || 0)}`, M + CW - 134, tY, { width: 120, align: "right" });
      tY += LINE_H;

      doc.moveTo(M + 10, tY).lineTo(M + CW - 10, tY).lineWidth(0.3).strokeColor(C.border).stroke();
      tY += 6;

      doc.fontSize(7).fillColor(C.dark).font("Helvetica-Bold").text("Total Receita Mensal", M + 14, tY);
      doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold")
        .text(fmt(totalRevenue), M + CW - 134, tY, { width: 120, align: "right" });
      tY += 14;

      doc.fontSize(6.5).fillColor(C.text).font("Helvetica").text("Investimento Mensal Kenlo (Equivalente)", M + 14, tY);
      doc.fontSize(6.5).fillColor(C.red).font("Helvetica-Bold")
        .text(`- ${fmt(monthlyRecurring)}`, M + CW - 134, tY, { width: 120, align: "right" });
      tY += LINE_H;

      if (data.postPaidTotal && data.postPaidTotal > 0) {
        doc.fontSize(6.5).fillColor(C.text).font("Helvetica").text("Estimativa Pós-pagos (Excedente)", M + 14, tY);
        doc.fontSize(6.5).fillColor(C.red).font("Helvetica-Bold")
          .text(`- ${fmt(data.postPaidTotal)}`, M + CW - 134, tY, { width: 120, align: "right" });
        tY += LINE_H;
      }

      Y += SUMMARY_H + GAP;

      // --- GANHO LÍQUIDO MENSAL ---
      const netGain = data.netGain || (totalRevenue - monthlyRecurring - (data.postPaidTotal || 0));
      const isPositive = netGain > 0;
      const NET_H = 65;
      const greenBg = isPositive ? "#ECFDF5" : "#FEF2F2";
      const greenBorder = isPositive ? "#6EE7B7" : "#FCA5A5";
      const greenText = isPositive ? C.green : C.red;

      box(M, Y, CW, NET_H, { fill: greenBg, stroke: greenBorder, lw: 1.5 });
      doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold")
        .text("Ganho Líquido Mensal Estimado", M, Y + 8, { width: CW, align: "center" });
      doc.fontSize(22).fillColor(greenText).font("Helvetica-Bold")
        .text(fmt(netGain), M, Y + 22, { width: CW, align: "center" });
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
        .text(isPositive ? "Receita extras supera o investimento na plataforma" : "Investimento na plataforma supera receita extras", M, Y + 48, { width: CW, align: "center" });
      Y += NET_H + GAP;

      // --- ROI INDICATORS ---
      if (isPositive && monthlyRecurring > 0) {
        const roiPercent = ((totalRevenue / monthlyRecurring) * 100 - 100).toFixed(0);
        const paybackMonths = monthlyRecurring > 0 ? Math.ceil((data.implantationFee || 0) / netGain) : 0;

        Y = secTitle("Indicadores de Retorno", Y);
        const IND_W = (CW - 16) / 3;
        const IND_H = 42;

        box(M, Y, IND_W, IND_H, { fill: C.bgLight, stroke: C.border });
        doc.fontSize(14).fillColor(C.green).font("Helvetica-Bold")
          .text(`${roiPercent}%`, M, Y + 6, { width: IND_W, align: "center" });
        doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
          .text("ROI Receita vs Investimento", M, Y + 26, { width: IND_W, align: "center" });

        box(M + IND_W + 8, Y, IND_W, IND_H, { fill: C.bgLight, stroke: C.border });
        doc.fontSize(14).fillColor(C.blue).font("Helvetica-Bold")
          .text(`${paybackMonths}`, M + IND_W + 8, Y + 6, { width: IND_W, align: "center" });
        doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
          .text("Meses para Payback", M + IND_W + 8, Y + 26, { width: IND_W, align: "center" });

        const annualGain = netGain * 12;
        box(M + (IND_W + 8) * 2, Y, IND_W, IND_H, { fill: C.bgLight, stroke: C.border });
        doc.fontSize(11).fillColor(C.green).font("Helvetica-Bold")
          .text(fmt(annualGain), M + (IND_W + 8) * 2, Y + 8, { width: IND_W, align: "center" });
        doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica")
          .text("Ganho Anual Estimado", M + (IND_W + 8) * 2, Y + 26, { width: IND_W, align: "center" });

        Y += IND_H + GAP;
      }
    }

    // --- CTA SLOGAN ---
    if (Y + 40 < MAX_Y) {
      const CTA_H = 36;
      doc.roundedRect(M + 40, Y, CW - 80, CTA_H, 5).fill(C.red);
      doc.fontSize(10).fillColor(C.white).font("Helvetica-Bold")
        .text("Kenlo — Quem usa, lidera.", M + 50, Y + 6, { width: CW - 100, align: "center" });
      doc.fontSize(6).fillColor("rgba(255,255,255,0.8)").font("Helvetica")
        .text("Transforme sua imobiliária em uma máquina de resultados", M + 50, Y + 21, { width: CW - 100, align: "center" });
    }

    doc.end();
  });
}
