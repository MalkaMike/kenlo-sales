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
    // DESIGN SYSTEM - Book3.pdf Style
    // ============================================
    const colors = {
      primary: "#EC4899",      // Pink for selection
      primaryLight: "#FDF2F8", // Light pink background
      dark: "#1E293B",         // Dark blue for headers
      kenloRed: "#E11D48",     // Kenlo brand red for header
      headerBg: "#E5E7EB",     // Gray background for header (deprecated)
      text: "#1F2937",         // Main text
      textLight: "#6B7280",    // Light text
      border: "#D1D5DB",       // Borders
      white: "#FFFFFF",
      success: "#10B981",
      blue: "#3B82F6",
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
      strokeWidth?: number;
    } = {}) => {
      const radius = options.radius || 6;
      const fill = options.fill || colors.white;
      const stroke = options.stroke || colors.border;
      const strokeWidth = options.strokeWidth || 1;
      
      if (options.selected) {
        // Pink background + pink border for selected items
        doc.roundedRect(x, y, width, height, radius)
           .lineWidth(2)
           .fillAndStroke(colors.primaryLight, colors.primary);
      } else {
        doc.roundedRect(x, y, width, height, radius)
           .lineWidth(strokeWidth)
           .fillAndStroke(fill, stroke);
      }
    };

    const drawCheckbox = (x: number, y: number, checked: boolean) => {
      const size = 10;
      // Draw checkbox square
      doc.rect(x, y, size, size)
         .lineWidth(0.5)
         .stroke(colors.border);
      
      // Draw checkmark if checked
      if (checked) {
        // Draw an X using lines instead of Unicode
        doc.lineWidth(1.5)
           .strokeColor(colors.dark)
           .moveTo(x + 2, y + 2)
           .lineTo(x + size - 2, y + size - 2)
           .stroke()
           .moveTo(x + size - 2, y + 2)
           .lineTo(x + 2, y + size - 2)
           .stroke();
      }
    };

    const drawBadge = (x: number, y: number, text: string, bgColor: string = colors.primary) => {
      const padding = 5;
      doc.fontSize(7).font("Helvetica-Bold");
      const textWidth = doc.widthOfString(text);
      const badgeWidth = textWidth + (padding * 2);
      const badgeHeight = 14;
      
      // Draw badge background
      doc.roundedRect(x, y, badgeWidth, badgeHeight, 3)
         .fill(bgColor);
      
      // Draw badge text
      doc.fontSize(7).fillColor(colors.white).font("Helvetica-Bold")
         .text(text, x + padding, y + 3.5);
      
      return badgeWidth;
    };

    // ============================================
    // HEADER with Kenlo Red Background
    // ============================================
    const headerHeight = 75;
    doc.rect(0, 0, pageWidth, headerHeight)
       .fill(colors.kenloRed);
    
    // Add white Kenlo logo (top-left corner)
    // Use absolute path from project root
    const projectRoot = process.cwd();
    const logoPath = path.join(projectRoot, "client/public/kenlo-logo-white.png");
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, margin, margin - 15, { height: 35 });
      } catch (error) {
        console.error("Failed to load logo:", error);
      }
    }
    
    // Header title in white (moved to the right to avoid logo overlap)
    doc.fontSize(14).fillColor(colors.white).font("Helvetica-Bold")
       .text("PROPOSTA COMERCIAL KENLO", margin + 100, margin - 10);
    
    // Date information (left side, white text)
    const issueDate = new Date().toLocaleDateString("pt-BR");
    const validityDays = 30; // Validity in days
    
    doc.fontSize(7).fillColor(colors.white).font("Helvetica")
       .text(`Emissão: ${issueDate}`, margin, margin + 10)
       .text(`Validade: ${validityDays} dias`, margin, margin + 18);
    
    // Vendor information (right side, white text, right-aligned)
    const vendorX = pageWidth - margin - 180; // Right-align vendor info
    doc.fontSize(7).fillColor(colors.white).font("Helvetica")
       .text(`Vendedor: ${data.salesPersonName}`, vendorX, margin + 10, { width: 180, align: "right" })
       .text(`Email: ${data.vendorEmail || "vendas@kenlo.com.br"}`, vendorX, margin + 18, { width: 180, align: "right" })
       .text(`Telefone: ${data.vendorPhone || "(11) 1234-5678"}`, vendorX, margin + 26, { width: 180, align: "right" });
    
    // Client information (bottom of header, white text)
    doc.fontSize(7).fillColor(colors.white).font("Helvetica-Bold")
       .text("CLIENTE:", margin, margin + 40);
    doc.fontSize(7).fillColor(colors.white).font("Helvetica")
       .text(`${data.agencyName || "Imobiliária"} | ${data.clientName}`, margin + 40, margin + 40);
    doc.text(`${data.email || ""} | ${data.cellphone || ""}`, margin + 40, margin + 48);
    
    yPos = headerHeight + 12;

    // ============================================
    // 1. NATUREZA DO NEGÓCIO
    // ============================================
    doc.fontSize(9).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Natureza do negócio", margin, yPos);
    
    yPos += 10;
    
    const businessTypes = [
      { key: "broker", label: "Corretora", icon: "" },
      { key: "rental_admin", label: "Administrador de Aluguel", icon: "" },
      { key: "both", label: "Ambos", icon: "" }
    ];
    
    const boxWidth = (contentWidth - 20) / 3;
    businessTypes.forEach((type, i) => {
      const x = margin + (i * (boxWidth + 10));
      const selected = data.businessType === type.key;
      drawBox(x, yPos, boxWidth, 24, { selected });
      doc.fontSize(8).fillColor(selected ? colors.primary : colors.text).font("Helvetica")
         .text(`${type.icon} ${type.label}`, x + 8, yPos + 8, { width: boxWidth - 16, align: "left" });
    });
    
    yPos += 38;

    // ============================================
    // 2. MÉTRICAS DO NEGÓCIO
    // ============================================
    doc.fontSize(9).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Métricas do Negócio", margin, yPos);
    
    yPos += 18;
    
    const showImob = data.productType === "imob" || data.productType === "both";
    const showLoc = data.productType === "loc" || data.productType === "both";
    
    const metricsWidth = showImob && showLoc ? (contentWidth - 15) / 2 : contentWidth;
    let metricsX = margin;
    const metricsStartY = yPos;
    
    if (showImob) {
      // IMOB metrics card
      const cardHeight = 70;
      drawBox(metricsX, yPos, metricsWidth, cardHeight, { fill: colors.white, stroke: colors.border });
      
      // Dark header (darker blue-gray)
      doc.roundedRect(metricsX, yPos, metricsWidth, 18, 6)
         .fill("#1E293B"); // Slate-800 - darker than before
       doc.fontSize(8).fillColor(colors.white).font("Helvetica-Bold")
          .text("IMOB", metricsX + 8, yPos + 5);
      
      // Metrics content
      yPos += 16;
      doc.fontSize(7).fillColor(colors.text).font("Helvetica");
      
       // Users
       doc.font("Helvetica-Bold").text(`${data.imobUsers || 0}`, metricsX + 10, yPos);
       doc.font("Helvetica").text("Usuários", metricsX + 30, yPos);
      
       // Closures
       doc.font("Helvetica-Bold").text(`${data.closings || 0}`, metricsX + 100, yPos);
       doc.font("Helvetica").text("fechamentos /", metricsX + 120, yPos);
      
      yPos += 8;
      doc.text("mês", metricsX + 120, yPos);
      yPos -= 8;
      
      yPos += 12;
      
       // Leads
       doc.font("Helvetica-Bold").text(`${data.leadsPerMonth || 0}`, metricsX + 10, yPos);
       doc.font("Helvetica").text("Leads / mês", metricsX + 30, yPos);
      
      yPos += 10;
      
      // IA SDR checkbox
      drawCheckbox(metricsX + 10, yPos, data.usesExternalAI || false);
      doc.fontSize(7).fillColor(colors.text).font("Helvetica")
         .text("IA SDR", metricsX + 25, yPos);
      
      // WhatsApp checkbox
      drawCheckbox(metricsX + 80, yPos, data.wantsWhatsApp || false);
      doc.text("Whatsapp", metricsX + 95, yPos);
      
      yPos = metricsStartY + cardHeight + 10;
      metricsX += metricsWidth + 15;
    }
    
    if (showLoc) {
      // LOC metrics card
      yPos = metricsStartY;
      const cardHeight = 70;
      drawBox(showImob ? metricsX : margin, yPos, metricsWidth, cardHeight, { fill: colors.white, stroke: colors.border });
      
      // Dark header (darker blue-gray)
      doc.roundedRect(showImob ? metricsX : margin, yPos, metricsWidth, 18, 6)
         .fill("#1E293B"); // Slate-800 - darker than before
       doc.fontSize(8).fillColor(colors.white).font("Helvetica-Bold")
          .text("LOCAÇÃO", (showImob ? metricsX : margin) + 8, yPos + 5);
      
      // Metrics content
      yPos += 12;
      doc.fontSize(7).fillColor(colors.text).font("Helvetica");
      
       // Contracts
       doc.font("Helvetica-Bold").text(`${data.contracts || 0}`, (showImob ? metricsX : margin) + 10, yPos);
       doc.font("Helvetica").text("Contratos sob", (showImob ? metricsX : margin) + 30, yPos);
      
      yPos += 8;
      doc.text("gestão", (showImob ? metricsX : margin) + 40, yPos);
      yPos -= 8;
      
      // New contracts
      doc.font("Helvetica-Bold").text(`${data.newContracts || 0}`, (showImob ? metricsX : margin) + 120, yPos);
      doc.font("Helvetica").text("novos contratos", (showImob ? metricsX : margin) + 140, yPos);
      
      yPos += 8;
      doc.text("por mês", (showImob ? metricsX : margin) + 140, yPos);
      yPos -= 8;
      
      yPos += 10;
      
      // Checkboxes
      drawCheckbox((showImob ? metricsX : margin) + 10, yPos, false);
      doc.fontSize(7).fillColor(colors.text).font("Helvetica")
         .text("Cobra Inquilino (Boleto)", (showImob ? metricsX : margin) + 25, yPos);
      
      yPos += 10;
      drawCheckbox((showImob ? metricsX : margin) + 10, yPos, data.chargesSplitToOwner || false);
      doc.text("Cobra Proprietário (Split)", (showImob ? metricsX : margin) + 25, yPos);
      if (data.chargesSplitToOwner) {
        doc.fontSize(7).fillColor(colors.success).font("Helvetica-Bold")
           .text("R$5,00", (showImob ? metricsX : margin) + 140, yPos);
      }
      
      yPos = metricsStartY + cardHeight + 10;
    }
    
    if (!showImob && !showLoc) yPos += 10;

    // ============================================
    // 3. SOLUÇÃO EM ANÁLISE
    // ============================================
    doc.fontSize(9).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Solução em análise de contratação", margin, yPos);
    
    yPos += 10;
    
    const products = [
       { key: "imob", label: "Imob só", desc: "CRM + Site para vendas", icon: "" },
       { key: "loc", label: "Loc só", desc: "Gestão de locações", icon: "" },
       { key: "both", label: "Imob + Loc", desc: "Solução completa", icon: "" }
    ];
    
    products.forEach((prod, i) => {
      const x = margin + (i * (boxWidth + 10));
      const selected = data.productType === prod.key;
      drawBox(x, yPos, boxWidth, 32, { selected });
      doc.fontSize(8).fillColor(selected ? colors.primary : colors.text).font("Helvetica-Bold")
         .text(`${prod.icon} ${prod.label}`, x + 8, yPos + 6, { width: boxWidth - 16 });
      doc.fontSize(6).fillColor(colors.textLight).font("Helvetica")
         .text(prod.desc, x + 8, yPos + 18, { width: boxWidth - 16 });
    });
    
    yPos += 48;

    // ============================================
    // 4. ADD-ONS OPCIONAIS
    // ============================================
    doc.fontSize(9).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Add-ons Opcionais", margin, yPos);
    
    yPos += 10;
    
    // Blue callout box with proper Portuguese text
    const calloutWidth = contentWidth * 0.6;
    drawBox(margin, yPos, calloutWidth, 20, { fill: colors.blue, stroke: colors.blue });
    doc.fontSize(6).fillColor(colors.white).font("Helvetica")
       .text("Add-ons selecionados destacados em rosa. Combine produtos e add-ons para formar Kombos com desconto.", 
             margin + 8, yPos + 6, { width: calloutWidth - 16 });
    
    yPos += 30;
    
    // Add-ons grid (2 rows x 3 columns)
    const addons = [
      { key: "leads", label: "Leads", desc: "Gestão automatizada de leads" },
      { key: "inteligencia", label: "Inteligência", desc: "BI de KPIs de performance" },
      { key: "assinatura", label: "Assinatura", desc: "Assinatura digital embutida na plataforma" },
      { key: "pay", label: "Pay", desc: "Boleto e Split digital embutido na plataforma" },
      { key: "seguros", label: "Seguros", desc: "Seguros embutido no boleto e ganhe a partir de R$10 por" },
      { key: "cash", label: "Cash", desc: "Financie seus proprietários até 24 meses" }
    ];
    
    const addonBoxWidth = (contentWidth - 20) / 3;
    const addonBoxHeight = 32;
    const selectedAddonsArray = data.selectedAddons.split(",").map(a => a.trim().toLowerCase());
    
    addons.forEach((addon, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = margin + (col * (addonBoxWidth + 10));
      const y = yPos + (row * (addonBoxHeight + 8));
      const selected = selectedAddonsArray.includes(addon.key);
      
      drawBox(x, y, addonBoxWidth, addonBoxHeight, { selected });
      doc.fontSize(7).fillColor(selected ? colors.primary : colors.text).font("Helvetica-Bold")
         .text(addon.label, x + 8, y + 6, { width: addonBoxWidth - 16 });
      doc.fontSize(5.5).fillColor(colors.textLight).font("Helvetica")
         .text(addon.desc, x + 8, y + 16, { width: addonBoxWidth - 16 });
    });
    
    yPos += (addonBoxHeight * 2) + 18;

    // ============================================
    // 5. FREQUÊNCIA DE PAGAMENTO
    // ============================================
    doc.fontSize(9).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Frequência de pagamento selecionada", margin, yPos);
    
    yPos += 10;
    
    const frequencies = [
      { key: "monthly", label: "Mensal", modifier: "+25%" },
      { key: "semestral", label: "Semestral", modifier: "+10%" },
      { key: "annual", label: "Anual", modifier: "0% - Referência" },
      { key: "biannual", label: "Bienal", modifier: "-10%" }
    ];
    
    const freqBoxWidth = (contentWidth - 30) / 4;
    frequencies.forEach((freq, i) => {
      const x = margin + (i * (freqBoxWidth + 10));
      const selected = data.paymentPlan === freq.key;
      drawBox(x, yPos, freqBoxWidth, 28, { selected });
      doc.fontSize(7).fillColor(selected ? colors.primary : colors.text).font("Helvetica-Bold")
         .text(freq.label, x + 8, yPos + 6, { width: freqBoxWidth - 16, align: "center" });
      doc.fontSize(6).fillColor(colors.textLight).font("Helvetica")
         .text(freq.modifier, x + 8, yPos + 16, { width: freqBoxWidth - 16, align: "center" });
    });
    
    yPos += 48;

    // ============================================
    // 6. PLANO SELECIONADO
    // ============================================
    doc.fontSize(9).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Plano Selecionado", margin, yPos);
    
    yPos += 10;
    
    const kombos = [
      { key: "none", label: "Sem Kombo", discount: null },
      { key: "imob-start", label: "Imob Start", discount: "10% OFF" },
      { key: "imob-pro", label: "Imob Pro", discount: "15% OFF" },
      { key: "loc-pro", label: "Loc Pro", discount: "10% OFF" },
      { key: "core-gestao", label: "Core Gestão", discount: null },
      { key: "elite", label: "Elite", discount: "20% OFF" }
    ];
    
    const komboBoxWidth = (contentWidth - 50) / 6;
    kombos.forEach((kombo, i) => {
      const x = margin + (i * (komboBoxWidth + 10));
      const selected = data.komboName?.toLowerCase().includes(kombo.key.split("-")[0]) || 
                      (kombo.key === "none" && !data.komboName);
      
      drawBox(x, yPos, komboBoxWidth, 32, { selected });
      
      // Discount badge - SHOW ON ALL KOMBOS (not just selected)
      if (kombo.discount) {
        drawBadge(x + 4, yPos + 4, kombo.discount, selected ? colors.primary : colors.textLight);
      }
      
      doc.fontSize(6).fillColor(selected ? colors.primary : colors.text).font("Helvetica-Bold")
         .text(kombo.label, x + 6, yPos + (kombo.discount ? 20 : 12), { 
           width: komboBoxWidth - 12, 
           align: "center" 
         });
    });
    
    yPos += 52;

    // ============================================
    // 7. INVESTIMENTO (CRITICAL MATH SECTION)
    // ============================================
    doc.fontSize(9).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Investimento", margin, yPos);
    
    yPos += 10;
    
    // Calculate components
    // License prepaid: For annual/biennial, this is the total annual license cost
    // For monthly/semestral, license is paid monthly (not prepaid)
    const isAnnualOrBiennial = data.paymentPlan === 'annual' || data.paymentPlan === 'biennial';
    const licensePrepaid = isAnnualOrBiennial ? (data.totalAnnual || 0) : 0;
    const additionalUsersPrepaid = data.prepaymentUsersAmount || 0;
    const additionalContractsPrepaid = data.prepaymentContractsAmount || 0;
    const implementation = data.implantationFee || 0;
    
    // CRITICAL: Total = sum of all components
    const totalInvestment = licensePrepaid + additionalUsersPrepaid + additionalContractsPrepaid + implementation;
    
    // Investment breakdown table
    const investmentData = [
      { label: "Licença pré-paga", value: licensePrepaid },
      { label: "Usuários adicionais pré-pagos", value: additionalUsersPrepaid },
      { label: "Contratos adicionais pré-pagos", value: additionalContractsPrepaid },
      { label: "Implantação (única vez)", value: implementation },
    ];
    
    doc.fontSize(7).fillColor(colors.text).font("Helvetica");
    investmentData.forEach((item, i) => {
      doc.text(item.label, margin + 10, yPos + (i * 10))
         .text(formatCurrency(item.value), margin + contentWidth - 80, yPos + (i * 10), { 
           width: 70, 
           align: "right" 
         });
    });
    
    yPos += 16;
    
    // Total
    doc.fontSize(9).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Total", margin + 10, yPos)
       .text(formatCurrency(totalInvestment), margin + contentWidth - 80, yPos, { 
         width: 70, 
         align: "right" 
       });
    
    yPos += 15;
    
    // CRITICAL: Installment calculation
    const installments = data.installments || 1;
    const installmentValue = totalInvestment / installments;
    doc.fontSize(7).fillColor(colors.text).font("Helvetica-Bold")
       .text("Condições de Pagamento", margin + 10, yPos);
    doc.fontSize(7).fillColor(colors.text).font("Helvetica")
       .text(`${installments}x ${formatCurrency(installmentValue)}`, margin + contentWidth - 80, yPos, { 
         width: 70, 
         align: "right" 
       });
    
    yPos += 12;
    
    // CRITICAL: Monthly equivalent
    const monthlyEquivalent = totalInvestment / 12;
    doc.fontSize(7).fillColor(colors.text).font("Helvetica-Bold")
       .text("Equivalente mensal", margin + 10, yPos);
    doc.fontSize(7).fillColor(colors.text).font("Helvetica")
       .text(formatCurrency(monthlyEquivalent), margin + contentWidth - 80, yPos, { 
         width: 70, 
         align: "right" 
       });
    
    yPos += 14;
    
    // CRITICAL: Comparison table
    doc.fontSize(8).fillColor(colors.dark).font("Helvetica-Bold")
       .text("Comparação com outras Frequências de Pagamentos", margin + 10, yPos);
    
    yPos += 12;
    
    // Calculate comparison values based on current frequency
    const currentFrequency = data.paymentPlan;
    let baseAnnualValue = data.totalAnnual;
    
    // Adjust base value to annual reference
    if (currentFrequency === "monthly") {
      baseAnnualValue = baseAnnualValue / 1.25;
    } else if (currentFrequency === "semestral") {
      baseAnnualValue = baseAnnualValue / 1.111;
    } else if (currentFrequency === "biannual") {
      baseAnnualValue = baseAnnualValue / 0.9;
    }
    
    const comparisonData = [
      { label: "Mensal", value: baseAnnualValue * 1.25 },
      { label: "Semestral", value: baseAnnualValue * 1.111 },
      { label: "Bi-Annual", value: baseAnnualValue * 0.9 }
    ];
    
    doc.fontSize(7).fillColor(colors.text).font("Helvetica");
    comparisonData.forEach((item, i) => {
      doc.text(item.label, margin + 20, yPos + (i * 10))
         .text(formatCurrency(item.value), margin + contentWidth - 80, yPos + (i * 10), { 
           width: 70, 
           align: "right" 
         });
    });
    
    yPos += 12;
    
    // Post-paid estimates
    if (data.postPaidTotal && data.postPaidTotal > 0) {
      doc.fontSize(7).fillColor(colors.text).font("Helvetica-Bold")
         .text("Estimativas Pós-pagos Mensal (Uso Excedente)", margin + 10, yPos);
      doc.fontSize(7).fillColor(colors.text).font("Helvetica")
         .text(formatCurrency(data.postPaidTotal), margin + contentWidth - 80, yPos, { 
           width: 70, 
           align: "right" 
         });
      yPos += 15;
    }

    // ============================================
    // PAGE 2: KENLO RECEITA EXTRAS
    // ============================================
    if (data.netGain && data.netGain > 0) {
      doc.addPage();
      yPos = margin + 40;
      
      // Title
      doc.fontSize(16).fillColor(colors.dark).font("Helvetica-Bold")
         .text("Kenlo Receita Extras", margin, yPos, { align: "center", width: contentWidth });
      
      yPos += 12;
      
      // Subtitle
      doc.fontSize(9).fillColor(colors.textLight).font("Helvetica")
         .text("Potencial de receita adicional com serviços Kenlo", margin, yPos, { align: "center", width: contentWidth });
      
      yPos += 12;
      
      // Revenue breakdown
      const revenueItems = [];
      if (data.revenueFromBoletos && data.revenueFromBoletos > 0) {
        revenueItems.push({ label: "Receita de Boletos (Kenlo Pay)", value: data.revenueFromBoletos });
      }
      if (data.revenueFromInsurance && data.revenueFromInsurance > 0) {
        revenueItems.push({ label: "Receita de Seguros", value: data.revenueFromInsurance });
      }
      
      if (revenueItems.length > 0) {
        doc.fontSize(8).fillColor(colors.text).font("Helvetica");
        revenueItems.forEach((item, i) => {
          doc.text(item.label, margin + 40, yPos + (i * 14))
             .text(formatCurrency(item.value), margin + contentWidth - 120, yPos + (i * 14), { 
               width: 80, 
               align: "right" 
             });
        });
        yPos += (revenueItems.length * 14) + 20;
      }
      
      // Total net gain - Large prominent number
      doc.fontSize(10).fillColor(colors.dark).font("Helvetica-Bold")
         .text("Ganho Líquido Mensal Estimado", margin, yPos, { align: "center", width: contentWidth });
      
      yPos += 16;
      
      doc.fontSize(42).fillColor(colors.success).font("Helvetica-Bold")
         .text(formatCurrency(data.netGain), margin, yPos, { align: "center", width: contentWidth });
      
      yPos += 20;
      
      // Slogan box
      const sloganBoxHeight = 50;
      drawBox(margin + 50, yPos, contentWidth - 100, sloganBoxHeight, { fill: colors.primaryLight, stroke: colors.primary });
      doc.fontSize(12).fillColor(colors.primary).font("Helvetica-Bold")
         .text("Kenlo, Quem Usa, lidera e ganha dinheiro!", margin + 60, yPos + 18, { 
           align: "center", 
           width: contentWidth - 120 
         });
    }

    // Footer removed to reduce page count

    doc.end();
  });
}
