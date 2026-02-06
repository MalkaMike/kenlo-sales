import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

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
    const M = 40; // margin
    const CW = PAGE_W - M * 2; // content width
    const COL3_W = (CW - 16) / 3; // 3-column width with 8px gaps
    const COL2_W = (CW - 8) / 2; // 2-column width with 8px gap

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

    // ============================================
    // HELPER: draw rounded rect (selected = pink highlight)
    // ============================================
    const box = (
      x: number,
      y: number,
      w: number,
      h: number,
      opts: { fill?: string; stroke?: string; lw?: number; r?: number; selected?: boolean } = {}
    ) => {
      const r = opts.r ?? 4;
      if (opts.selected) {
        doc.roundedRect(x, y, w, h, r).lineWidth(1.5).fillAndStroke(C.pinkLight, C.pink);
      } else {
        doc.roundedRect(x, y, w, h, r).lineWidth(opts.lw ?? 0.5).fillAndStroke(opts.fill ?? C.white, opts.stroke ?? C.border);
      }
    };

    // ============================================
    // HELPER: modern toggle/checkbox (filled circle with checkmark)
    // ============================================
    const modernCheck = (x: number, y: number, checked: boolean, label: string) => {
      const size = 10;
      const cx = x + size / 2;
      const cy = y + size / 2;
      if (checked) {
        // Filled pink circle with white checkmark
        doc.circle(cx, cy, size / 2).fill(C.pink);
        doc.save().lineWidth(1.2).strokeColor(C.white);
        doc.moveTo(cx - 2.5, cy).lineTo(cx - 0.5, cy + 2.5).lineTo(cx + 3, cy - 2).stroke();
        doc.restore();
      } else {
        // Empty circle border
        doc.circle(cx, cy, size / 2).lineWidth(0.8).stroke(C.border);
      }
      doc.fontSize(7).fillColor(checked ? C.pink : C.text).font(checked ? "Helvetica-Bold" : "Helvetica")
        .text(label, x + size + 5, y + 1);
    };

    // ============================================
    // HELPER: section title
    // ============================================
    const sectionTitle = (label: string, y: number) => {
      doc.fontSize(10).fillColor(C.dark).font("Helvetica-Bold").text(label, M, y);
      return y + 18;
    };

    // ============================================
    // HELPER: label-value row
    // ============================================
    const labelRow = (label: string, value: string, y: number, opts: { bold?: boolean; indent?: number; valueColor?: string } = {}) => {
      const indent = opts.indent ?? 10;
      doc.fontSize(7.5).fillColor(C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica").text(label, M + indent, y);
      doc.fontSize(7.5).fillColor(opts.valueColor ?? C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(value, M + CW - 90, y, { width: 90, align: "right" });
      return y + 13;
    };

    // ============================================
    // HELPER: metric stat (big number + small label, tightly coupled)
    // ============================================
    const metricStat = (x: number, y: number, value: string, label: string) => {
      doc.fontSize(14).fillColor(C.dark).font("Helvetica-Bold").text(value, x, y);
      const numW = doc.widthOfString(value);
      doc.fontSize(6.5).fillColor(C.textLight).font("Helvetica").text(label, x + numW + 4, y + 5);
    };

    // ============================================
    // PAGE 1
    // ============================================

    // --- HEADER (red band) ---
    const HDR_H = 72;
    doc.rect(0, 0, PAGE_W, HDR_H).fill(C.red);

    // Logo (left) - real Kenlo logo, white version
    const logoPath = path.join(process.cwd(), "client/public/kenlo-logo-white.png");
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, M, 12, { height: 24 }); } catch (_) {}
    }

    // Title (right of logo)
    doc.fontSize(14).fillColor(C.white).font("Helvetica-Bold")
      .text("Orçamento Comercial", M + 115, 16);

    // Date line (bottom of header)
    const issueDate = new Date().toLocaleDateString("pt-BR");
    doc.fontSize(6.5).fillColor("rgba(255,255,255,0.85)").font("Helvetica")
      .text(`Emissão: ${issueDate}  |  Validade: 30 dias`, M, HDR_H - 14);

    // Vendor info (right side)
    doc.fontSize(6.5).fillColor(C.white).font("Helvetica");
    const vX = PAGE_W - M - 170;
    doc.text(`Vendedor: ${data.salesPersonName}`, vX, 14, { width: 170, align: "right" });
    doc.text(`Email: ${data.vendorEmail || "vendas@kenlo.com.br"}`, vX, 25, { width: 170, align: "right" });
    doc.text(`Telefone: ${data.vendorPhone || "(11) 1234-5678"}`, vX, 36, { width: 170, align: "right" });

    // --- CLIENT BAR (Comment 1: more space, bigger font) ---
    let Y = HDR_H + 14;
    doc.fontSize(8).fillColor(C.red).font("Helvetica-Bold").text("CLIENTE:", M, Y);
    doc.fontSize(9).fillColor(C.dark).font("Helvetica-Bold")
      .text(`${data.agencyName || "Imobiliária"}  |  ${data.clientName}`, M + 55, Y);
    // Contact info on second line
    Y += 14;
    const contactParts = [data.email, data.cellphone].filter(Boolean).join("  |  ");
    if (contactParts) {
      doc.fontSize(7).fillColor(C.textLight).font("Helvetica").text(contactParts, M + 55, Y);
    }
    Y += 16;

    // --- 1. NATUREZA DO NEGÓCIO (Comment 1: highlight selected in pink) ---
    Y = sectionTitle("Natureza do negócio", Y);
    const bizTypes = [
      { key: "broker", label: "Corretora" },
      { key: "rental_admin", label: "Administrador de Aluguel" },
      { key: "both", label: "Ambos" },
    ];
    bizTypes.forEach((t, i) => {
      const x = M + i * (COL3_W + 8);
      const sel = data.businessType === t.key;
      box(x, Y, COL3_W, 24, { selected: sel });
      doc.fontSize(7.5).fillColor(sel ? C.pink : C.text).font(sel ? "Helvetica-Bold" : "Helvetica").text(t.label, x + 10, Y + 8);
    });
    Y += 34;

    // --- 2. MÉTRICAS DO NEGÓCIO (Comment 2: modern, numbers prominent, aligned) ---
    Y = sectionTitle("Métricas do Negócio", Y);
    const showImob = data.productType === "imob" || data.productType === "both";
    const showLoc = data.productType === "loc" || data.productType === "both";

    const CARD_H = 82;
    const cardW = showImob && showLoc ? COL2_W : CW;

    if (showImob) {
      const cx = M;
      // Card with subtle background
      box(cx, Y, cardW, CARD_H, { fill: C.bgLight, stroke: C.border });
      // Accent bar at top
      doc.roundedRect(cx, Y, cardW, 18, 4).fill(C.dark);
      doc.rect(cx, Y + 8, cardW, 10).fill(C.dark); // square off bottom corners
      doc.fontSize(8).fillColor(C.white).font("Helvetica-Bold").text("IMOB", cx + 12, Y + 5);

      // Row 1: Users + Closings (big numbers tight with labels)
      const r1 = Y + 26;
      metricStat(cx + 12, r1, `${data.imobUsers || 0}`, "Usuários");
      metricStat(cx + cardW / 2 + 5, r1, `${data.closings || 0}`, "Fechamentos / mês");

      // Row 2: Leads
      const r2 = r1 + 20;
      metricStat(cx + 12, r2, `${data.leadsPerMonth || 0}`, "Leads / mês");

      // Row 3: Modern toggles (not 80s checkboxes)
      const r3 = r2 + 20;
      modernCheck(cx + 12, r3, data.usesExternalAI || false, "IA SDR");
      modernCheck(cx + cardW / 2 + 5, r3, data.wantsWhatsApp || false, "WhatsApp");
    }

    if (showLoc) {
      const cx = showImob ? M + cardW + 8 : M;
      const locCardW = showImob ? cardW : CW;
      box(cx, Y, locCardW, CARD_H, { fill: C.bgLight, stroke: C.border });
      // Accent bar
      doc.roundedRect(cx, Y, locCardW, 18, 4).fill(C.dark);
      doc.rect(cx, Y + 8, locCardW, 10).fill(C.dark);
      doc.fontSize(8).fillColor(C.white).font("Helvetica-Bold").text("LOCAÇÃO", cx + 12, Y + 5);

      // Row 1: Contracts + New contracts
      const r1 = Y + 26;
      metricStat(cx + 12, r1, `${data.contracts || 0}`, "Contratos sob gestão");
      metricStat(cx + locCardW / 2 + 5, r1, `${data.newContracts || 0}`, "Novos contratos / mês");

      // Row 2-3: Modern toggles
      const r2 = r1 + 22;
      modernCheck(cx + 12, r2, false, "Cobra Inquilino (Boleto)");

      const r3 = r2 + 16;
      modernCheck(cx + 12, r3, data.chargesSplitToOwner || false, "Cobra Proprietário (Split)");
      if (data.chargesSplitToOwner) {
        doc.fontSize(7.5).fillColor(C.green).font("Helvetica-Bold").text("R$5,00", cx + locCardW - 55, r3 + 1);
      }
    }

    Y += CARD_H + 14;

    // --- 3. SOLUÇÃO EM ANÁLISE (Comment 3: REFERENCE style - perfect as is) ---
    Y = sectionTitle("Solução em análise de contratação", Y);
    const prods = [
      { key: "imob", label: "Imob só", desc: "CRM + Site para vendas" },
      { key: "loc", label: "Loc só", desc: "Gestão de locações" },
      { key: "both", label: "Imob + Loc", desc: "Solução completa" },
    ];
    prods.forEach((p, i) => {
      const x = M + i * (COL3_W + 8);
      const sel = data.productType === p.key;
      box(x, Y, COL3_W, 28, { selected: sel });
      doc.fontSize(7.5).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold").text(p.label, x + 10, Y + 5);
      doc.fontSize(6).fillColor(sel ? C.pink : C.textLight).font("Helvetica").text(p.desc, x + 10, Y + 16);
    });
    Y += 38;

    // --- 4. ADD-ONS (Comment 4: NO blue callout, highlight selected in pink) ---
    Y = sectionTitle("Add-ons Opcionais", Y);
    // NO blue callout box - removed per Comment 4

    const addons = [
      { key: "leads", label: "Leads", desc: "Gestão automatizada de leads" },
      { key: "inteligencia", label: "Inteligência", desc: "BI de KPIs de performance" },
      { key: "assinatura", label: "Assinatura", desc: "Assinatura digital embutida" },
      { key: "pay", label: "Pay", desc: "Boleto e Split digital embutido" },
      { key: "seguros", label: "Seguros", desc: "Seguros embutido no boleto" },
      { key: "cash", label: "Cash", desc: "Financie proprietários até 24 meses" },
    ];
    // Parse selectedAddons - handle both JSON array and comma-separated string
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
    const ADDON_H = 28;
    addons.forEach((a, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = M + col * (COL3_W + 8);
      const y = Y + row * (ADDON_H + 6);
      const sel = selAddons.includes(a.key);
      box(x, y, COL3_W, ADDON_H, { selected: sel });
      doc.fontSize(7).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold").text(a.label, x + 10, y + 5);
      doc.fontSize(5.5).fillColor(sel ? C.pink : C.textLight).font("Helvetica").text(a.desc, x + 10, y + 16);
    });
    Y += ADDON_H * 2 + 6 + 14;

    // --- 5. FREQUÊNCIA DE PAGAMENTO (Comment 5: perfect - maintain) ---
    Y = sectionTitle("Frequência de pagamento selecionada", Y);
    const freqs = [
      { key: "monthly", label: "Mensal", mod: "+25%" },
      { key: "semestral", label: "Semestral", mod: "+10%" },
      { key: "annual", label: "Anual", mod: "0% - Referência" },
      { key: "biannual", label: "Bienal", mod: "-10%" },
      { key: "biennial", label: "Bienal", mod: "-10%" }, // alias
    ];
    const FREQ_W = (CW - 24) / 4;
    // Filter out alias duplicates for display (only show 4 boxes)
    const freqsDisplay = freqs.filter(f => f.key !== "biennial");
    const FREQ_W_ACTUAL = (CW - 24) / freqsDisplay.length;
    freqsDisplay.forEach((f, i) => {
      const x = M + i * (FREQ_W_ACTUAL + 8);
      // Match both biannual and biennial
      const sel = data.paymentPlan === f.key || (f.key === "biannual" && data.paymentPlan === "biennial");
      box(x, Y, FREQ_W_ACTUAL, 26, { selected: sel });
      doc.fontSize(7).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold")
        .text(f.label, x, Y + 5, { width: FREQ_W_ACTUAL, align: "center" });
      doc.fontSize(6).fillColor(sel ? C.pink : C.textLight).font("Helvetica")
        .text(f.mod, x, Y + 15, { width: FREQ_W_ACTUAL, align: "center" });
    });
    Y += 38;

    // --- 6. PLANO SELECIONADO (Kombos) ---
    Y = sectionTitle("Plano Selecionado", Y);
    const kombos = [
      { key: "none", label: "Sem Kombo", disc: null },
      { key: "imob-start", label: "Imob Start", disc: "10% OFF" },
      { key: "imob-pro", label: "Imob Pro", disc: "15% OFF" },
      { key: "loc-pro", label: "Loc Pro", disc: "10% OFF" },
      { key: "core-gestao", label: "Core Gestão", disc: null },
      { key: "elite", label: "Elite", disc: "20% OFF" },
    ];
    const KOMBO_W = (CW - 40) / 6;
    kombos.forEach((k, i) => {
      const x = M + i * (KOMBO_W + 8);
      const sel =
        data.komboName?.toLowerCase().includes(k.key.split("-")[0]) ||
        (k.key === "none" && !data.komboName);
      box(x, Y, KOMBO_W, 34, { selected: sel });

      // Discount badge
      if (k.disc) {
        const badgePad = 4;
        doc.fontSize(6).font("Helvetica-Bold");
        const tw = doc.widthOfString(k.disc);
        const bw = tw + badgePad * 2;
        doc.roundedRect(x + (KOMBO_W - bw) / 2, Y + 3, bw, 12, 3).fill(sel ? C.pink : C.textLight);
        doc.fontSize(6).fillColor(C.white).font("Helvetica-Bold").text(k.disc, x + (KOMBO_W - bw) / 2 + badgePad, Y + 5);
      }

      doc.fontSize(6).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold")
        .text(k.label, x, Y + (k.disc ? 18 : 12), { width: KOMBO_W, align: "center" });
    });
    Y += 46;

    // --- 7. INVESTIMENTO ---
    Y = sectionTitle("Investimento", Y);

    const isAnnualOrBiennial = data.paymentPlan === "annual" || data.paymentPlan === "biennial" || data.paymentPlan === "biannual";
    const licensePrepaid = isAnnualOrBiennial ? (data.totalAnnual || 0) : 0;
    const additionalUsersPrepaid = data.prepaymentUsersAmount || 0;
    const additionalContractsPrepaid = data.prepaymentContractsAmount || 0;
    const implementation = data.implantationFee || 0;
    const totalInvestment = licensePrepaid + additionalUsersPrepaid + additionalContractsPrepaid + implementation;

    Y = labelRow("Licença pré-paga", fmt(licensePrepaid), Y);
    Y = labelRow("Usuários adicionais pré-pagos", fmt(additionalUsersPrepaid), Y);
    Y = labelRow("Contratos adicionais pré-pagos", fmt(additionalContractsPrepaid), Y);
    Y = labelRow("Implantação (única vez)", fmt(implementation), Y);

    Y += 4;

    // Total line
    doc.fontSize(9).fillColor(C.dark).font("Helvetica-Bold").text("Total", M + 10, Y);
    doc.fontSize(9).fillColor(C.dark).font("Helvetica-Bold").text(fmt(totalInvestment), M + CW - 90, Y, { width: 90, align: "right" });
    Y += 16;

    // Installment
    const installments = data.installments || 1;
    const installmentValue = totalInvestment / installments;
    Y = labelRow("Condições de Pagamento", `${installments}x ${fmt(installmentValue)}`, Y, { bold: true });

    // Monthly equivalent
    const monthlyEquivalent = totalInvestment / 12;
    Y = labelRow("Equivalente mensal", fmt(monthlyEquivalent), Y, { bold: true });

    Y += 6;

    // --- FREQUENCY COMPARISON (User request: compare apples to apples) ---
    // Calculate the BASE annual value (at annual/0% rate) from whatever frequency was selected
    // Then show what the user would pay as monthly equivalent under each frequency
    doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold")
      .text("Comparação: Equivalente Mensal por Frequência", M + 10, Y);
    Y += 14;

    // Derive the base annual value (at 0% / annual reference)
    // Frequency multipliers: monthly=1.25, semestral=1.10, annual=1.0, biannual=0.90
    let baseAnnualValue = data.totalAnnual || 0;
    if (data.paymentPlan === "monthly") baseAnnualValue = baseAnnualValue / 1.25;
    else if (data.paymentPlan === "semestral") baseAnnualValue = baseAnnualValue / 1.10;
    else if (data.paymentPlan === "biannual" || data.paymentPlan === "biennial") baseAnnualValue = baseAnnualValue / 0.90;
    // annual = base, no adjustment needed

    // Now calculate total annual cost for each frequency and show monthly equivalent
    const freqComps = [
      { label: "Mensal (+25%)", mult: 1.25 },
      { label: "Semestral (+10%)", mult: 1.10 },
      { label: "Anual (Referência)", mult: 1.0 },
      { label: "Bienal (-10%)", mult: 0.90 },
    ];
    freqComps.forEach((fc) => {
      const annualAtFreq = baseAnnualValue * fc.mult;
      const monthlyAtFreq = annualAtFreq / 12;
      // Show: "Frequency label" → "R$ X,XX / mês"
      const isCurrent = (
        (fc.mult === 1.25 && data.paymentPlan === "monthly") ||
        (fc.mult === 1.10 && data.paymentPlan === "semestral") ||
        (fc.mult === 1.0 && data.paymentPlan === "annual") ||
        (fc.mult === 0.90 && (data.paymentPlan === "biannual" || data.paymentPlan === "biennial"))
      );
      Y = labelRow(
        fc.label + (isCurrent ? "  ← selecionado" : ""),
        `${fmt(monthlyAtFreq)} / mês`,
        Y,
        { indent: 20, bold: isCurrent, valueColor: isCurrent ? C.pink : C.text }
      );
    });

    Y += 4;

    // Post-paid
    if (data.postPaidTotal && data.postPaidTotal > 0) {
      Y = labelRow("Estimativas Pós-pagos Mensal (Uso Excedente)", fmt(data.postPaidTotal), Y, { bold: true });
    }

    // ============================================
    // PAGE 2: RECEITA EXTRAS (only if revenue data exists)
    // ============================================
    const hasRevenue = (data.revenueFromBoletos && data.revenueFromBoletos > 0) ||
      (data.revenueFromInsurance && data.revenueFromInsurance > 0);

    if (hasRevenue) {
      doc.addPage();

      // --- PAGE 2 HEADER (matching Page 1 red band) ---
      doc.rect(0, 0, PAGE_W, HDR_H).fill(C.red);
      if (fs.existsSync(logoPath)) {
        try { doc.image(logoPath, M, 12, { height: 24 }); } catch (_) {}
      }
      doc.fontSize(14).fillColor(C.white).font("Helvetica-Bold")
        .text("Receita Extras", M + 115, 16);
      doc.fontSize(6.5).fillColor("rgba(255,255,255,0.85)").font("Helvetica")
        .text(`${data.agencyName || "Imobiliária"}  |  ${data.clientName}`, M, HDR_H - 14);
      // Vendor info right
      doc.fontSize(6.5).fillColor(C.white).font("Helvetica");
      doc.text(`Vendedor: ${data.salesPersonName}`, vX, 14, { width: 170, align: "right" });
      doc.text(`Email: ${data.vendorEmail || "vendas@kenlo.com.br"}`, vX, 25, { width: 170, align: "right" });

      Y = HDR_H + 20;

      // --- SUBTITLE ---
      doc.fontSize(9).fillColor(C.textLight).font("Helvetica")
        .text("Potencial de receita adicional com os serviços Kenlo contratados", M, Y, { width: CW });
      Y += 22;

      // --- REVENUE SOURCE CARDS ---
      Y = sectionTitle("Fontes de Receita", Y);

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
      const REV_CARD_H = 80;
      revSources.forEach((rs, i) => {
        const x = M + i * (REV_CARD_W + 8);
        box(x, Y, REV_CARD_W, REV_CARD_H, { selected: rs.active });

        // Icon area (small colored dot)
        const dotColor = rs.active ? C.pink : C.border;
        doc.circle(x + 16, Y + 16, 5).fill(dotColor);
        doc.fontSize(6).fillColor(C.white).font("Helvetica-Bold")
          .text(rs.active ? "✓" : "–", x + 13, Y + 13);

        // Title and description
        doc.fontSize(9).fillColor(rs.active ? C.pink : C.text).font("Helvetica-Bold")
          .text(rs.label, x + 28, Y + 10);
        doc.fontSize(6.5).fillColor(rs.active ? C.pink : C.textLight).font("Helvetica")
          .text(rs.desc, x + 28, Y + 22);

        // Divider line
        doc.moveTo(x + 12, Y + 36).lineTo(x + REV_CARD_W - 12, Y + 36)
          .lineWidth(0.3).strokeColor(rs.active ? C.pinkBorder : C.border).stroke();

        // Formula / detail
        doc.fontSize(6.5).fillColor(C.textLight).font("Helvetica")
          .text(rs.formula, x + 12, Y + 42);
        doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
          .text(rs.detail, x + 12, Y + 53);

        // Value (bottom right, prominent)
        doc.fontSize(12).fillColor(rs.active ? C.green : C.textLight).font("Helvetica-Bold")
          .text(fmt(rs.value), x + 12, Y + 62, { width: REV_CARD_W - 24, align: "right" });
        doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
          .text("/ mês", x + REV_CARD_W - 32, Y + 67);
      });
      Y += REV_CARD_H + 20;

      // --- TOTAL RECEITA MENSAL ---
      const totalRevenue = (data.revenueFromBoletos || 0) + (data.revenueFromInsurance || 0);
      Y = sectionTitle("Resumo Financeiro Mensal", Y);

      // Summary table with light background
      const TABLE_H = 110;
      box(M, Y, CW, TABLE_H, { fill: C.bgLight, stroke: C.border });

      let tY = Y + 12;
      // Revenue lines
      doc.fontSize(7.5).fillColor(C.text).font("Helvetica")
        .text("Receita Kenlo Pay", M + 16, tY);
      doc.fontSize(7.5).fillColor(C.green).font("Helvetica-Bold")
        .text(`+ ${fmt(data.revenueFromBoletos || 0)}`, M + CW - 106, tY, { width: 90, align: "right" });
      tY += 14;

      doc.fontSize(7.5).fillColor(C.text).font("Helvetica")
        .text("Receita Kenlo Seguros", M + 16, tY);
      doc.fontSize(7.5).fillColor(C.green).font("Helvetica-Bold")
        .text(`+ ${fmt(data.revenueFromInsurance || 0)}`, M + CW - 106, tY, { width: 90, align: "right" });
      tY += 14;

      // Divider
      doc.moveTo(M + 12, tY).lineTo(M + CW - 12, tY)
        .lineWidth(0.3).strokeColor(C.border).stroke();
      tY += 8;

      // Total revenue
      doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold")
        .text("Total Receita Mensal", M + 16, tY);
      doc.fontSize(8).fillColor(C.green).font("Helvetica-Bold")
        .text(fmt(totalRevenue), M + CW - 106, tY, { width: 90, align: "right" });
      tY += 16;

      // Cost line
      doc.fontSize(7.5).fillColor(C.text).font("Helvetica")
        .text("Custo Mensal Kenlo (Equivalente)", M + 16, tY);
      const monthlyCost = (data.totalAnnual || 0) / 12;
      doc.fontSize(7.5).fillColor(C.red).font("Helvetica-Bold")
        .text(`- ${fmt(monthlyCost)}`, M + CW - 106, tY, { width: 90, align: "right" });
      tY += 14;

      // Post-paid
      if (data.postPaidTotal && data.postPaidTotal > 0) {
        doc.fontSize(7.5).fillColor(C.text).font("Helvetica")
          .text("Estimativa Pós-pagos (Excedente)", M + 16, tY);
        doc.fontSize(7.5).fillColor(C.red).font("Helvetica-Bold")
          .text(`- ${fmt(data.postPaidTotal)}`, M + CW - 106, tY, { width: 90, align: "right" });
      }

      Y += TABLE_H + 16;

      // --- GANHO LÍQUIDO MENSAL ESTIMADO (big green card) ---
      const netGain = data.netGain || (totalRevenue - monthlyCost - (data.postPaidTotal || 0));
      const isPositive = netGain > 0;

      const NET_CARD_H = 80;
      const greenBg = isPositive ? "#ECFDF5" : "#FEF2F2";
      const greenBorder = isPositive ? "#6EE7B7" : "#FCA5A5";
      const greenText = isPositive ? C.green : C.red;

      box(M, Y, CW, NET_CARD_H, { fill: greenBg, stroke: greenBorder, lw: 1.5 });

      doc.fontSize(9).fillColor(C.dark).font("Helvetica-Bold")
        .text("Ganho Líquido Mensal Estimado", M, Y + 12, { width: CW, align: "center" });

      doc.fontSize(28).fillColor(greenText).font("Helvetica-Bold")
        .text(fmt(netGain), M, Y + 30, { width: CW, align: "center" });

      doc.fontSize(7).fillColor(C.textLight).font("Helvetica")
        .text(isPositive ? "Receita extras supera o custo da plataforma" : "Custo da plataforma supera receita extras", M, Y + 60, { width: CW, align: "center" });

      Y += NET_CARD_H + 20;

      // --- ROI HIGHLIGHT (if positive) ---
      if (isPositive && monthlyCost > 0) {
        const roiPercent = ((totalRevenue / monthlyCost) * 100 - 100).toFixed(0);
        const paybackMonths = monthlyCost > 0 ? Math.ceil((data.implantationFee || 0) / netGain) : 0;

        Y = sectionTitle("Indicadores de Retorno", Y);

        const INDICATOR_W = (CW - 16) / 3;
        const INDICATOR_H = 50;

        // ROI %
        box(M, Y, INDICATOR_W, INDICATOR_H, { fill: C.bgLight, stroke: C.border });
        doc.fontSize(18).fillColor(C.green).font("Helvetica-Bold")
          .text(`${roiPercent}%`, M, Y + 8, { width: INDICATOR_W, align: "center" });
        doc.fontSize(6.5).fillColor(C.textLight).font("Helvetica")
          .text("ROI Receita vs Custo", M, Y + 32, { width: INDICATOR_W, align: "center" });

        // Payback
        box(M + INDICATOR_W + 8, Y, INDICATOR_W, INDICATOR_H, { fill: C.bgLight, stroke: C.border });
        doc.fontSize(18).fillColor(C.blue).font("Helvetica-Bold")
          .text(`${paybackMonths}`, M + INDICATOR_W + 8, Y + 8, { width: INDICATOR_W, align: "center" });
        doc.fontSize(6.5).fillColor(C.textLight).font("Helvetica")
          .text("Meses para Payback", M + INDICATOR_W + 8, Y + 32, { width: INDICATOR_W, align: "center" });

        // Annual gain
        const annualGain = netGain * 12;
        box(M + (INDICATOR_W + 8) * 2, Y, INDICATOR_W, INDICATOR_H, { fill: C.bgLight, stroke: C.border });
        doc.fontSize(14).fillColor(C.green).font("Helvetica-Bold")
          .text(fmt(annualGain), M + (INDICATOR_W + 8) * 2, Y + 10, { width: INDICATOR_W, align: "center" });
        doc.fontSize(6.5).fillColor(C.textLight).font("Helvetica")
          .text("Ganho Anual Estimado", M + (INDICATOR_W + 8) * 2, Y + 32, { width: INDICATOR_W, align: "center" });

        Y += INDICATOR_H + 20;
      }

      // --- CTA SLOGAN BOX ---
      const CTA_H = 44;
      doc.roundedRect(M + 40, Y, CW - 80, CTA_H, 6).fill(C.red);
      doc.fontSize(12).fillColor(C.white).font("Helvetica-Bold")
        .text("Kenlo — Quem usa, lidera.", M + 50, Y + 10, { width: CW - 100, align: "center" });
      doc.fontSize(7).fillColor("rgba(255,255,255,0.8)").font("Helvetica")
        .text("Transforme sua imobiliária em uma máquina de resultados", M + 50, Y + 27, { width: CW - 100, align: "center" });
    }

    doc.end();
  });
}
