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
      margin: 30,
      autoFirstPage: true,
      bufferPages: true
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ============================================
    // DESIGN SYSTEM - Matching Calculator Page
    // ============================================
    const colors = {
      primary: "#EC4899",      // Pink for selection
      primaryLight: "#FDF2F8", // Light pink background
      dark: "#1E293B",         // Dark blue for headers
      text: "#334155",         // Main text
      textLight: "#64748B",    // Light text
      border: "#E2E8F0",       // Borders
      white: "#FFFFFF",
      success: "#10B981",
    };

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 30;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    };

    const drawBox = (x: number, y: number, width: number, height: number, options: {
      fill?: string;
      stroke?: string;
      radius?: number;
      selected?: boolean;
    } = {}) => {
      const radius = options.radius || 8;
      const fill = options.fill || colors.white;
      const stroke = options.stroke || colors.border;
      
      if (options.selected) {
        // Pink background + pink border for selected items
        doc.roundedRect(x, y, width, height, radius)
           .lineWidth(2)
           .fillAndStroke(colors.primaryLight, colors.primary);
      } else {
        doc.roundedRect(x, y, width, height, radius)
           .lineWidth(1)
           .fillAndStroke(fill, stroke);
      }
    };

    const drawCheckbox = (x: number, y: number, checked: boolean) => {
      const size = 12;
      // Draw checkbox square
      doc.rect(x, y, size, size)
         .lineWidth(1)
         .stroke(colors.border);
      
      // Draw checkmark if checked
      if (checked) {
        doc.fontSize(10).fillColor(colors.primary).font("Helvetica-Bold")
           .text("✓", x + 1, y - 1); // Unicode checkmark
      }
    };

    const drawBadge = (x: number, y: number, text: string, bgColor: string = colors.primary) => {
      const padding = 6;
      const textWidth = doc.widthOfString(text);
      const badgeWidth = textWidth + (padding * 2);
      const badgeHeight = 16;
      
      // Draw badge background
      doc.roundedRect(x, y, badgeWidth, badgeHeight, 4)
         .fill(bgColor);
      
      // Draw badge text
      doc.fontSize(7).fillColor(colors.white).font("Helvetica-Bold")
         .text(text, x + padding, y + 4);
      
      return badgeWidth;
    };

    const drawSwitch = (x: number, y: number, isOn: boolean) => {
      const width = 28;
      const height = 16;
      const radius = height / 2;
      
      // Background
      doc.roundedRect(x, y, width, height, radius)
         .fill(isOn ? colors.primary : "#D1D5DB");
      
      // Circle
      const circleX = isOn ? x + width - radius - 1 : x + radius + 1;
      doc.circle(circleX, y + radius, radius - 2)
         .fill(colors.white);
    };

    // ============================================
    // HEADER
    // ============================================
    doc.fontSize(20).fillColor(colors.dark).font("Helvetica-Bold")
       .text("PROPOSTA COMERCIAL KENLO", margin, yPos);
    
    yPos += 25;
    
    // Proposal info line
    const proposalNumber = `#${Date.now().toString().slice(-8)}`;
    const issueDate = new Date().toLocaleDateString("pt-BR");
    const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR");
    
    doc.fontSize(8).fillColor(colors.textLight).font("Helvetica")
       .text(`Proposta: ${proposalNumber} | Emissão: ${issueDate} | Validade: ${validUntil}`, margin, yPos);
    
    yPos += 15;
    
    // Client info
    doc.fontSize(9).fillColor(colors.text)
       .text(`${data.agencyName || "Imobiliária"} | ${data.clientName} | ${data.email || ""} | ${data.cellphone || ""}`, margin, yPos);
    
    yPos += 20;

    // ============================================
    // 1. NATUREZA DO NEGÓCIO
    // ============================================
    doc.fontSize(10).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Natureza do negócio", margin, yPos);
    
    yPos += 12;
    
    const businessTypes = [
      { key: "broker", label: "Corretora" },
      { key: "rental_admin", label: "Administrador de Aluguel" },
      { key: "both", label: "Ambos" }
    ];
    
    const boxWidth = (contentWidth - 20) / 3;
    businessTypes.forEach((type, i) => {
      const x = margin + (i * (boxWidth + 10));
      const selected = data.businessType === type.key;
      drawBox(x, yPos, boxWidth, 25, { selected });
      doc.fontSize(8).fillColor(selected ? colors.primary : colors.text).font("Helvetica")
         .text(type.label, x + 8, yPos + 9, { width: boxWidth - 16, align: "left" });
    });
    
    yPos += 35;

    // ============================================
    // 2. MÉTRICAS DO NEGÓCIO
    // ============================================
    doc.fontSize(10).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Métricas do Negócio", margin, yPos);
    
    yPos += 12;
    
    const showImob = data.productType === "imob" || data.productType === "both";
    const showLoc = data.productType === "loc" || data.productType === "both";
    
    const metricsWidth = showImob && showLoc ? (contentWidth - 10) / 2 : contentWidth;
    let metricsX = margin;
    
    if (showImob) {
      // IMOB metrics
      doc.roundedRect(metricsX, yPos, metricsWidth, 12, 4)
         .fill(colors.dark);
      doc.fontSize(8).fillColor(colors.white).font("Helvetica-Bold")
         .text("IMOB", metricsX + 8, yPos + 3);
      
      yPos += 16;
      doc.fontSize(7).fillColor(colors.text).font("Helvetica")
         .text(`Usuários: ${data.imobUsers || 0}`, metricsX + 8, yPos)
         .text(`Fechamentos/mês: ${data.closings || 0}`, metricsX + 8, yPos + 10)
         .text(`Leads/mês: ${data.leadsPerMonth || 0}`, metricsX + 8, yPos + 20);
      
      drawSwitch(metricsX + 100, yPos, data.usesExternalAI || false);
      doc.text("IA SDR", metricsX + 135, yPos);
      
      drawSwitch(metricsX + 100, yPos + 10, data.wantsWhatsApp || false);
      doc.text("WhatsApp", metricsX + 135, yPos + 10);
      
      yPos += 30;
      metricsX += metricsWidth + 10;
    }
    
    if (showLoc) {
      if (!showImob) yPos -= 16; // Reset if only LOC
      
      // LOC metrics
      doc.roundedRect(showImob ? metricsX : margin, yPos - 16, metricsWidth, 12, 4)
         .fill(colors.dark);
      doc.fontSize(8).fillColor(colors.white).font("Helvetica-Bold")
         .text("LOCAÇÃO", (showImob ? metricsX : margin) + 8, yPos - 13);
      
      doc.fontSize(7).fillColor(colors.text).font("Helvetica")
         .text(`Contratos: ${data.contracts || 0}`, (showImob ? metricsX : margin) + 8, yPos)
         .text(`Novos/mês: ${data.newContracts || 0}`, (showImob ? metricsX : margin) + 8, yPos + 10);
      
      drawSwitch((showImob ? metricsX : margin) + 100, yPos, data.chargesSplitToOwner || false);
      doc.text("Split", (showImob ? metricsX : margin) + 135, yPos);
      
      yPos += 30;
    }
    
    if (!showImob && !showLoc) yPos += 30;

    // ============================================
    // 3. SOLUÇÃO EM ANÁLISE
    // ============================================
    doc.fontSize(10).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Solução em análise de contratação", margin, yPos);
    
    yPos += 12;
    
    const products = [
      { key: "imob", label: "Imob só", desc: "CRM + Site para vendas" },
      { key: "loc", label: "Loc só", desc: "Gestão de locações" },
      { key: "both", label: "Imob + Loc", desc: "Solução completa" }
    ];
    
    products.forEach((prod, i) => {
      const x = margin + (i * (boxWidth + 10));
      const selected = data.productType === prod.key;
      drawBox(x, yPos, boxWidth, 30, { selected });
      doc.fontSize(8).fillColor(selected ? colors.primary : colors.text).font("Helvetica-Bold")
         .text(prod.label, x + 8, yPos + 6, { width: boxWidth - 16 });
      doc.fontSize(6).fillColor(colors.textLight).font("Helvetica")
         .text(prod.desc, x + 8, yPos + 17, { width: boxWidth - 16 });
    });
    
    yPos += 40;

    // ============================================
    // 4. ADD-ONS OPCIONAIS
    // ============================================
    doc.fontSize(10).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Add-ons Opcionais", margin, yPos);
    
    yPos += 12;
    
    const addons = data.selectedAddons.split(",").map(a => a.trim()).filter(Boolean);
    const addonList = [
      { key: "leads", label: "Leads", desc: "Gestão automatizada de leads" },
      { key: "inteligencia", label: "Inteligência", desc: "BI de KPIs de performance" },
      { key: "assinatura", label: "Assinatura", desc: "Assinatura digital embutida" },
      { key: "pay", label: "Pay", desc: "Boleto e Split digital" },
      { key: "seguros", label: "Seguros", desc: "Seguros embutido no boleto" },
      { key: "cash", label: "Cash", desc: "Financie proprietários 24 meses" }
    ];
    
    const addonBoxWidth = (contentWidth - 20) / 3;
    addonList.forEach((addon, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = margin + (col * (addonBoxWidth + 10));
      const y = yPos + (row * 28);
      const selected = addons.includes(addon.key);
      
      drawBox(x, y, addonBoxWidth, 25, { 
        selected,
        fill: selected ? colors.primaryLight : colors.white 
      });
      
      doc.fontSize(7).fillColor(selected ? colors.primary : colors.text).font("Helvetica-Bold")
         .text(addon.label, x + 8, y + 5, { width: addonBoxWidth - 40 });
      doc.fontSize(6).fillColor(colors.textLight).font("Helvetica")
         .text(addon.desc, x + 8, y + 14, { width: addonBoxWidth - 40 });
      
      drawSwitch(x + addonBoxWidth - 35, y + 5, selected);
    });
    
    yPos += 65;

    // ============================================
    // 5. FREQUÊNCIA DE PAGAMENTO
    // ============================================
    doc.fontSize(10).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Frequência de pagamento selecionada", margin, yPos);
    
    yPos += 12;
    
    const frequencies = [
      { key: "monthly", label: "Mensal", discount: "+25%" },
      { key: "semiannual", label: "Semestral", discount: "+10%" },
      { key: "annual", label: "Anual", discount: "0% - Referência" },
      { key: "biennial", label: "Bienal", discount: "-10%" }
    ];
    
    const freqWidth = (contentWidth - 30) / 4;
    frequencies.forEach((freq, i) => {
      const x = margin + (i * (freqWidth + 10));
      const selected = data.paymentPlan === freq.key;
      drawBox(x, yPos, freqWidth, 25, { selected });
      doc.fontSize(7).fillColor(selected ? colors.primary : colors.text).font("Helvetica-Bold")
         .text(freq.label, x + 8, yPos + 6, { width: freqWidth - 16, align: "center" });
      doc.fontSize(6).fillColor(colors.textLight).font("Helvetica")
         .text(freq.discount, x + 8, yPos + 15, { width: freqWidth - 16, align: "center" });
    });
    
    yPos += 35;

    // ============================================
    // 6. PLANO SELECIONADO
    // ============================================
    doc.fontSize(10).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Plano Selecionado", margin, yPos);
    
    yPos += 12;
    
    const planName = data.komboName || data.imobPlan || data.locPlan || "Personalizado";
    const discount = data.komboDiscount || 0;
    
    drawBox(margin, yPos, contentWidth, 25, { selected: true, fill: colors.primaryLight });
    doc.fontSize(9).fillColor(colors.primary).font("Helvetica-Bold")
       .text(planName, margin + 15, yPos + 8);
    
    if (discount > 0) {
      doc.fontSize(7).fillColor(colors.white).font("Helvetica-Bold");
      doc.roundedRect(margin + contentWidth - 70, yPos + 5, 55, 15, 4)
         .fill(colors.primary);
      doc.text(`${discount}% OFF`, margin + contentWidth - 68, yPos + 9);
    }
    
    yPos += 35;

    // ============================================
    // 7. INVESTIMENTO
    // ============================================
    doc.fontSize(10).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Investimento", margin, yPos);
    
    yPos += 12;
    
    const investmentData = [
      { label: "Licença pré-paga", value: data.monthlyLicenseBase || 0 },
      { label: "Usuários adicionais pré-pagos", value: data.prepaymentUsersAmount || 0 },
      { label: "Contratos adicionais pré-pagos", value: data.prepaymentContractsAmount || 0 },
      { label: "Implantação (única vez)", value: data.implantationFee || 0 },
    ];
    
    doc.fontSize(7).fillColor(colors.text).font("Helvetica");
    investmentData.forEach((item, i) => {
      doc.text(item.label, margin + 10, yPos + (i * 10))
         .text(formatCurrency(item.value), margin + contentWidth - 80, yPos + (i * 10), { width: 70, align: "right" });
    });
    
    yPos += 45;
    
    // Total
    doc.fontSize(9).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Total", margin + 10, yPos)
       .text(formatCurrency(data.firstYearTotal), margin + contentWidth - 80, yPos, { width: 70, align: "right" });
    
    yPos += 15;
    
    // Payment conditions
    const installments = data.installments || 1;
    const installmentValue = data.firstYearTotal / installments;
    doc.fontSize(7).fillColor(colors.text).font("Helvetica")
       .text(`Condições de Pagamento: ${installments}x ${formatCurrency(installmentValue)}`, margin + 10, yPos);
    
    yPos += 10;
    doc.text(`Equivalente mensal: ${formatCurrency(data.totalMonthly)}`, margin + 10, yPos);
    
    yPos += 15;
    
    // Post-paid estimate
    if (data.postPaidTotal && data.postPaidTotal > 0) {
      doc.text(`Estimativas Pós-pagos Mensal (Uso Excedente): ${formatCurrency(data.postPaidTotal)}`, margin + 10, yPos);
      yPos += 15;
    }

    // ============================================
    // 8. KENLO RECEITA EXTRAS
    // ============================================
    if (data.netGain && data.netGain > 0) {
      doc.fontSize(10).fillColor(colors.dark).font("Helvetica-Bold")
         .text("Kenlo Receita Extras", margin, yPos);
      
      yPos += 12;
      
      doc.fontSize(18).fillColor(colors.success).font("Helvetica-Bold")
         .text(formatCurrency(data.netGain), margin, yPos);
      
      yPos += 20;
      
      doc.fontSize(8).fillColor(colors.textLight).font("Helvetica-Oblique")
         .text("Kenlo, Quem Usa, lidera e ganha dinheiro !", margin, yPos);
    }

    // ============================================
    // FOOTER
    // ============================================
    const footerY = pageHeight - 40;
    doc.fontSize(7).fillColor(colors.textLight).font("Helvetica")
       .text("Kenlo | www.kenlo.com.br | contato@kenlo.com.br | (11) 1234-5678", margin, footerY, {
         width: contentWidth,
         align: "center"
       });

    doc.end();
  });
}
