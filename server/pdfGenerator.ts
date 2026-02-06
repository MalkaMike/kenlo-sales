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
      dark: "#1E293B",
      text: "#1F2937",
      textLight: "#6B7280",
      border: "#D1D5DB",
      white: "#FFFFFF",
      green: "#10B981",
      blue: "#3B82F6",
    };

    const fmt = (v: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
      }).format(v);

    // ============================================
    // HELPER: draw rounded rect
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
    // HELPER: draw checkbox
    // ============================================
    const checkbox = (x: number, y: number, checked: boolean) => {
      doc.rect(x, y, 9, 9).lineWidth(0.5).stroke(C.border);
      if (checked) {
        doc.save().lineWidth(1.5).strokeColor(C.dark);
        doc.moveTo(x + 2, y + 2).lineTo(x + 7, y + 7).stroke();
        doc.moveTo(x + 7, y + 2).lineTo(x + 2, y + 7).stroke();
        doc.restore();
      }
    };

    // ============================================
    // HELPER: section title
    // ============================================
    const sectionTitle = (label: string, y: number) => {
      doc.fontSize(10).fillColor(C.dark).font("Helvetica-Bold").text(label, M, y);
      return y + 16; // returns next yPos after title
    };

    // ============================================
    // HELPER: label-value row
    // ============================================
    const labelRow = (label: string, value: string, y: number, opts: { bold?: boolean; indent?: number; valueColor?: string } = {}) => {
      const indent = opts.indent ?? 10;
      doc.fontSize(7.5).fillColor(C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica").text(label, M + indent, y);
      doc.fontSize(7.5).fillColor(opts.valueColor ?? C.text).font(opts.bold ? "Helvetica-Bold" : "Helvetica")
        .text(value, M + CW - 90, y, { width: 90, align: "right" });
      return y + 13; // returns next yPos
    };

    // ============================================
    // PAGE 1
    // ============================================

    // --- HEADER (red band) ---
    const HDR_H = 70;
    doc.rect(0, 0, PAGE_W, HDR_H).fill(C.red);

    // Logo (left) - use smaller height to avoid overlap
    const logoPath = path.join(process.cwd(), "client/public/kenlo-logo-white.png");
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, M, 14, { height: 22 }); } catch (_) {}
    }

    // Title (right of logo, vertically centered in header)
    doc.fontSize(12).fillColor(C.white).font("Helvetica-Bold")
      .text("PROPOSTA COMERCIAL KENLO", M + 100, 18);

    // Date line (below title, left)
    const issueDate = new Date().toLocaleDateString("pt-BR");
    doc.fontSize(7).fillColor(C.white).font("Helvetica")
      .text(`Emissão: ${issueDate}  |  Validade: 30 dias`, M, HDR_H - 18);

    // Vendor info (right side)
    doc.fontSize(7).fillColor(C.white).font("Helvetica");
    const vX = PAGE_W - M - 170;
    doc.text(`Vendedor: ${data.salesPersonName}`, vX, 18, { width: 170, align: "right" });
    doc.text(`Email: ${data.vendorEmail || "vendas@kenlo.com.br"}`, vX, 28, { width: 170, align: "right" });
    doc.text(`Telefone: ${data.vendorPhone || "(11) 1234-5678"}`, vX, 38, { width: 170, align: "right" });

    // Client bar (just below header)
    let Y = HDR_H + 6;
    doc.fontSize(7.5).fillColor(C.red).font("Helvetica-Bold").text("CLIENTE:", M, Y);
    doc.fontSize(7.5).fillColor(C.text).font("Helvetica")
      .text(`${data.agencyName || "Imobiliária"} | ${data.clientName} | ${data.email || ""} | ${data.cellphone || ""}`, M + 50, Y);

    Y += 18;

    // --- 1. NATUREZA DO NEGÓCIO ---
    Y = sectionTitle("Natureza do negócio", Y);
    const bizTypes = [
      { key: "broker", label: "Corretora" },
      { key: "rental_admin", label: "Administrador de Aluguel" },
      { key: "both", label: "Ambos" },
    ];
    bizTypes.forEach((t, i) => {
      const x = M + i * (COL3_W + 8);
      const sel = data.businessType === t.key;
      box(x, Y, COL3_W, 22, { selected: sel });
      doc.fontSize(7.5).fillColor(sel ? C.pink : C.text).font("Helvetica").text(t.label, x + 8, Y + 7);
    });
    Y += 32;

    // --- 2. MÉTRICAS DO NEGÓCIO ---
    Y = sectionTitle("Métricas do Negócio", Y);
    const showImob = data.productType === "imob" || data.productType === "both";
    const showLoc = data.productType === "loc" || data.productType === "both";

    const CARD_H = 80;
    const cardW = showImob && showLoc ? COL2_W : CW;

    if (showImob) {
      const cx = M;
      // Card outline
      box(cx, Y, cardW, CARD_H);
      // Dark header bar
      doc.roundedRect(cx, Y, cardW, 18, 4).fill(C.dark);
      doc.fontSize(8).fillColor(C.white).font("Helvetica-Bold").text("IMOB", cx + 10, Y + 5);

      // Row 1: Users + Closings
      const r1 = Y + 24;
      doc.fontSize(8).fillColor(C.text).font("Helvetica-Bold").text(`${data.imobUsers || 0}`, cx + 10, r1);
      doc.fontSize(7).fillColor(C.textLight).font("Helvetica").text("Usuários", cx + 35, r1 + 1);
      doc.fontSize(8).fillColor(C.text).font("Helvetica-Bold").text(`${data.closings || 0}`, cx + cardW / 2, r1);
      doc.fontSize(7).fillColor(C.textLight).font("Helvetica").text("Fechamentos / mês", cx + cardW / 2 + 20, r1 + 1);

      // Row 2: Leads
      const r2 = r1 + 16;
      doc.fontSize(8).fillColor(C.text).font("Helvetica-Bold").text(`${data.leadsPerMonth || 0}`, cx + 10, r2);
      doc.fontSize(7).fillColor(C.textLight).font("Helvetica").text("Leads / mês", cx + 35, r2 + 1);

      // Row 3: Checkboxes
      const r3 = r2 + 16;
      checkbox(cx + 10, r3, data.usesExternalAI || false);
      doc.fontSize(7).fillColor(C.text).font("Helvetica").text("IA SDR", cx + 24, r3 + 1);
      checkbox(cx + cardW / 2, r3, data.wantsWhatsApp || false);
      doc.fontSize(7).fillColor(C.text).font("Helvetica").text("Whatsapp", cx + cardW / 2 + 14, r3 + 1);
    }

    if (showLoc) {
      const cx = showImob ? M + cardW + 8 : M;
      // Card outline
      box(cx, Y, cardW, CARD_H);
      // Dark header bar
      doc.roundedRect(cx, Y, cardW, 18, 4).fill(C.dark);
      doc.fontSize(8).fillColor(C.white).font("Helvetica-Bold").text("LOCAÇÃO", cx + 10, Y + 5);

      // Row 1: Contracts + New contracts
      const r1 = Y + 24;
      doc.fontSize(8).fillColor(C.text).font("Helvetica-Bold").text(`${data.contracts || 0}`, cx + 10, r1);
      doc.fontSize(7).fillColor(C.textLight).font("Helvetica").text("Contratos sob gestão", cx + 35, r1 + 1);
      doc.fontSize(8).fillColor(C.text).font("Helvetica-Bold").text(`${data.newContracts || 0}`, cx + cardW / 2, r1);
      doc.fontSize(7).fillColor(C.textLight).font("Helvetica").text("Novos contratos / mês", cx + cardW / 2 + 20, r1 + 1);

      // Row 2: Boleto checkbox
      const r2 = r1 + 18;
      checkbox(cx + 10, r2, false);
      doc.fontSize(7).fillColor(C.text).font("Helvetica").text("Cobra Inquilino (Boleto)", cx + 24, r2 + 1);

      // Row 3: Split checkbox
      const r3 = r2 + 14;
      checkbox(cx + 10, r3, data.chargesSplitToOwner || false);
      doc.fontSize(7).fillColor(C.text).font("Helvetica").text("Cobra Proprietário (Split)", cx + 24, r3 + 1);
      if (data.chargesSplitToOwner) {
        doc.fontSize(7).fillColor(C.green).font("Helvetica-Bold").text("R$5,00", cx + cardW - 50, r3 + 1);
      }
    }

    Y += CARD_H + 12; // ALWAYS advance past the cards

    // --- 3. SOLUÇÃO EM ANÁLISE ---
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
      doc.fontSize(7.5).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold").text(p.label, x + 8, Y + 5);
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica").text(p.desc, x + 8, Y + 16);
    });
    Y += 38;

    // --- 4. ADD-ONS ---
    Y = sectionTitle("Add-ons Opcionais", Y);

    // Blue callout
    const callW = CW * 0.65;
    box(M, Y, callW, 16, { fill: C.blue, stroke: C.blue });
    doc.fontSize(5.5).fillColor(C.white).font("Helvetica")
      .text("Add-ons selecionados destacados em rosa. Combine produtos e add-ons para formar Kombos com desconto.", M + 6, Y + 4, { width: callW - 12 });
    Y += 22;

    const addons = [
      { key: "leads", label: "Leads", desc: "Gestão automatizada de leads" },
      { key: "inteligencia", label: "Inteligência", desc: "BI de KPIs de performance" },
      { key: "assinatura", label: "Assinatura", desc: "Assinatura digital embutida" },
      { key: "pay", label: "Pay", desc: "Boleto e Split digital embutido" },
      { key: "seguros", label: "Seguros", desc: "Seguros embutido no boleto" },
      { key: "cash", label: "Cash", desc: "Financie proprietários até 24 meses" },
    ];
    const selAddons = data.selectedAddons.split(",").map((a) => a.trim().toLowerCase());
    const ADDON_H = 28;
    addons.forEach((a, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = M + col * (COL3_W + 8);
      const y = Y + row * (ADDON_H + 6);
      const sel = selAddons.includes(a.key);
      box(x, y, COL3_W, ADDON_H, { selected: sel });
      doc.fontSize(7).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold").text(a.label, x + 8, y + 5);
      doc.fontSize(5.5).fillColor(C.textLight).font("Helvetica").text(a.desc, x + 8, y + 15);
    });
    Y += ADDON_H * 2 + 6 + 12; // 2 rows + gap + spacing

    // --- 5. FREQUÊNCIA DE PAGAMENTO ---
    Y = sectionTitle("Frequência de pagamento selecionada", Y);
    const freqs = [
      { key: "monthly", label: "Mensal", mod: "+25%" },
      { key: "semestral", label: "Semestral", mod: "+10%" },
      { key: "annual", label: "Anual", mod: "0% - Referência" },
      { key: "biannual", label: "Bienal", mod: "-10%" },
    ];
    const FREQ_W = (CW - 24) / 4;
    freqs.forEach((f, i) => {
      const x = M + i * (FREQ_W + 8);
      const sel = data.paymentPlan === f.key;
      box(x, Y, FREQ_W, 26, { selected: sel });
      doc.fontSize(7).fillColor(sel ? C.pink : C.text).font("Helvetica-Bold")
        .text(f.label, x, Y + 5, { width: FREQ_W, align: "center" });
      doc.fontSize(6).fillColor(C.textLight).font("Helvetica")
        .text(f.mod, x, Y + 15, { width: FREQ_W, align: "center" });
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

    const isAnnualOrBiennial = data.paymentPlan === "annual" || data.paymentPlan === "biennial";
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

    Y += 4;

    // Comparison table
    doc.fontSize(8).fillColor(C.dark).font("Helvetica-Bold").text("Comparação com outras Frequências de Pagamentos", M + 10, Y);
    Y += 14;

    let baseAnnualValue = data.totalAnnual;
    if (data.paymentPlan === "monthly") baseAnnualValue = baseAnnualValue / 1.25;
    else if (data.paymentPlan === "semestral") baseAnnualValue = baseAnnualValue / 1.111;
    else if (data.paymentPlan === "biannual") baseAnnualValue = baseAnnualValue / 0.9;

    Y = labelRow("Mensal", fmt(baseAnnualValue * 1.25), Y, { indent: 20 });
    Y = labelRow("Semestral", fmt(baseAnnualValue * 1.111), Y, { indent: 20 });
    Y = labelRow("Bi-Annual", fmt(baseAnnualValue * 0.9), Y, { indent: 20 });

    Y += 4;

    // Post-paid
    if (data.postPaidTotal && data.postPaidTotal > 0) {
      Y = labelRow("Estimativas Pós-pagos Mensal (Uso Excedente)", fmt(data.postPaidTotal), Y, { bold: true });
    }

    // ============================================
    // PAGE 2: RECEITA EXTRAS (only if revenue exists)
    // ============================================
    if (data.netGain && data.netGain > 0) {
      doc.addPage();
      Y = M + 30;

      doc.fontSize(16).fillColor(C.dark).font("Helvetica-Bold")
        .text("Kenlo Receita Extras", M, Y, { align: "center", width: CW });
      Y += 20;

      doc.fontSize(9).fillColor(C.textLight).font("Helvetica")
        .text("Potencial de receita adicional com serviços Kenlo", M, Y, { align: "center", width: CW });
      Y += 20;

      if (data.revenueFromBoletos && data.revenueFromBoletos > 0) {
        Y = labelRow("Receita de Boletos (Kenlo Pay)", fmt(data.revenueFromBoletos), Y, { indent: 30 });
      }
      if (data.revenueFromInsurance && data.revenueFromInsurance > 0) {
        Y = labelRow("Receita de Seguros", fmt(data.revenueFromInsurance), Y, { indent: 30 });
      }

      Y += 20;

      doc.fontSize(10).fillColor(C.dark).font("Helvetica-Bold")
        .text("Ganho Líquido Mensal Estimado", M, Y, { align: "center", width: CW });
      Y += 20;

      doc.fontSize(36).fillColor(C.green).font("Helvetica-Bold")
        .text(fmt(data.netGain), M, Y, { align: "center", width: CW });
      Y += 50;

      // Slogan box
      box(M + 60, Y, CW - 120, 40, { fill: C.pinkLight, stroke: C.pink });
      doc.fontSize(11).fillColor(C.pink).font("Helvetica-Bold")
        .text("Kenlo, Quem Usa, lidera e ganha dinheiro!", M + 70, Y + 13, { align: "center", width: CW - 140 });
    }

    doc.end();
  });
}
