import PDFDocument from "pdfkit";

interface ProposalData {
  salesPersonName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorRole?: string;
  clientName: string;
  productType: string;
  komboName?: string;
  komboDiscount?: number;
  imobPlan?: string;
  locPlan?: string;
  imobUsers?: number;
  contracts?: number;
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
  prepaymentMonths?: number; // 6 for semestral, 12 for annual, 24 for biennial
  // Monthly base values for table calculations
  monthlyLicenseBase?: number; // Monthly license cost at selected plan
}

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 40,
      autoFirstPage: true
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Kenlo brand colors
    const kenloPink = "#F82E52";
    const kenloGreen = "#4ABD8D";
    const darkText = "#1a1a1a";
    const lightText = "#666666";
    const lightGray = "#f8f8f8";
    const highlightBg = "#1e3a5f"; // Dark blue for header

    const pageWidth = 595.28;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    // Helper functions
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    // Get payment plan label and period
    const getPaymentPlanInfo = () => {
      switch (data.paymentPlan) {
        case "monthly":
          return { label: "Mensal", months: 1, discount: "+25%" };
        case "semestral":
          return { label: "Semestral", months: 6, discount: "-15%" };
        case "annual":
          return { label: "Anual", months: 12, discount: "0% (Referência)" };
        case "biennial":
          return { label: "Bienal", months: 24, discount: "-25%" };
        default:
          return { label: "Anual", months: 12, discount: "0% (Referência)" };
      }
    };

    const planInfo = getPaymentPlanInfo();

    // ============================================
    // HEADER - Pink banner
    // ============================================
    doc.rect(0, 0, pageWidth, 100).fill(kenloPink);
    
    // Logo text with Kenlo branding
    doc.font("Helvetica-Bold").fontSize(28).fillColor("#ffffff")
       .text("Kenlo", margin, 30);
    
    doc.font("Helvetica").fontSize(12).fillColor("#ffffff")
       .text("ORÇAMENTO COMERCIAL", margin, 65);
    
    const today = new Date().toLocaleDateString("pt-BR", { 
      day: "2-digit", month: "long", year: "numeric" 
    });
    const proposalNumber = `ORÇ-${Date.now().toString().slice(-8)}`;
    
    doc.fontSize(9).fillColor("#ffffff")
       .text(`${today}  |  Nº ${proposalNumber}`, pageWidth - margin - 200, 40, { width: 200, align: "right" });

    // ============================================
    // CLIENT INFO
    // ============================================
    let y = 120;
    
    doc.rect(margin, y, contentWidth, 50).fill(lightGray);
    
    doc.font("Helvetica").fontSize(8).fillColor(lightText)
       .text("PROPOSTA PARA", margin + 15, y + 10);
    doc.font("Helvetica-Bold").fontSize(14).fillColor(darkText)
       .text(data.clientName, margin + 15, y + 22);
    
    doc.font("Helvetica").fontSize(8).fillColor(lightText)
       .text("VENDEDOR", pageWidth - margin - 150, y + 10);
    doc.font("Helvetica").fontSize(10).fillColor(darkText)
       .text(data.salesPersonName, pageWidth - margin - 150, y + 22);
    
    doc.font("Helvetica").fontSize(8).fillColor(lightText)
       .text("VALIDADE: 30 dias", pageWidth - margin - 150, y + 36);

    y += 65;

    // ============================================
    // VENDOR CONTACT INFO (new section)
    // ============================================
    if (data.vendorEmail || data.vendorPhone || data.vendorRole) {
      doc.rect(margin, y, contentWidth, 35).fill("#f0f4ff");
      doc.rect(margin, y, 4, 35).fill("#3b82f6");
      
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#3b82f6")
         .text("CONTATO DO VENDEDOR", margin + 15, y + 6);
      
      let contactInfo = [];
      if (data.vendorRole) contactInfo.push(data.vendorRole);
      if (data.vendorEmail) contactInfo.push(data.vendorEmail);
      if (data.vendorPhone) contactInfo.push(data.vendorPhone);
      
      doc.font("Helvetica").fontSize(9).fillColor(darkText)
         .text(contactInfo.join("  |  "), margin + 15, y + 20);
      
      y += 45;
    }

    // ============================================
    // KOMBO HIGHLIGHT (if applicable)
    // ============================================
    if (data.komboName) {
      doc.rect(margin, y, contentWidth, 35).fill("#fff0f3");
      doc.rect(margin, y, 4, 35).fill(kenloPink);
      
      doc.font("Helvetica-Bold").fontSize(12).fillColor(kenloPink)
         .text(`${data.komboName}`, margin + 15, y + 8);
      doc.font("Helvetica").fontSize(9).fillColor(lightText)
         .text(`Desconto de ${data.komboDiscount}% em todos os produtos e add-ons`, margin + 15, y + 22);
      
      y += 45;
    }

    // ============================================
    // PRODUCTS & ADD-ONS (compact layout)
    // ============================================
    doc.font("Helvetica-Bold").fontSize(10).fillColor(kenloPink)
       .text("SOLUÇÃO CONTRATADA", margin, y);
    y += 18;

    // Products in a single line
    let productText = "";
    if (data.productType === "imob" || data.productType === "both") {
      productText += `Kenlo Imob ${data.imobPlan?.toUpperCase()} (${data.imobUsers}u)`;
    }
    if (data.productType === "both") {
      productText += "  +  ";
    }
    if (data.productType === "loc" || data.productType === "both") {
      productText += `Kenlo Locação ${data.locPlan?.toUpperCase()} (${data.contracts}c)`;
    }
    
    doc.font("Helvetica-Bold").fontSize(11).fillColor(darkText)
       .text(productText, margin, y);
    y += 18;

    // Add-ons in a single line
    const addons = JSON.parse(data.selectedAddons);
    if (addons.length > 0) {
      const addonLabels: Record<string, string> = {
        leads: "Leads",
        inteligencia: "Inteligência",
        assinatura: "Assinatura",
        pay: "Pay",
        seguros: "Seguros",
        cash: "Cash",
      };
      const addonText = addons.map((a: string) => addonLabels[a] || a).join(" • ");
      
      doc.font("Helvetica").fontSize(9).fillColor(lightText)
         .text(`Add-ons: ${addonText}`, margin, y);
      y += 18;
    }

    y += 10;

    // ============================================
    // SIMPLIFIED PRICING TABLE - Only selected frequency
    // ============================================
    doc.font("Helvetica-Bold").fontSize(10).fillColor(kenloPink)
       .text("INVESTIMENTO", margin, y);
    y += 5;
    
    // Payment plan badge
    doc.font("Helvetica").fontSize(9).fillColor(lightText)
       .text(`Pagamento: ${planInfo.label} (${planInfo.discount})`, margin, y + 12);
    y += 28;

    // Table dimensions - 3 columns: Description, Total, Equiv. Mensal
    const col1Width = 240; // Description
    const col2Width = 135; // Total
    const col3Width = 140; // Equiv. Mensal
    const rowHeight = 24;
    
    const col1X = margin;
    const col2X = margin + col1Width;
    const col3X = col2X + col2Width;
    
    // Draw table header
    doc.rect(margin, y, contentWidth, rowHeight).fill(highlightBg);
    
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff")
       .text("Descrição", col1X + 10, y + 7)
       .text("Valor Total", col2X + 10, y + 7, { width: col2Width - 20, align: "center" })
       .text("Equiv. Mensal", col3X + 10, y + 7, { width: col3Width - 20, align: "center" });
    
    y += rowHeight;
    
    // Helper to draw a table row
    const drawRow = (label: string, total: string, monthly: string, isTotalRow = false, isSection = false) => {
      const bgColor = isTotalRow ? "#fff0f3" : isSection ? lightGray : "#ffffff";
      doc.rect(margin, y, contentWidth, rowHeight).fill(bgColor);
      
      // Draw borders
      doc.strokeColor("#e0e0e0").lineWidth(0.5);
      doc.rect(margin, y, contentWidth, rowHeight).stroke();
      doc.moveTo(col2X, y).lineTo(col2X, y + rowHeight).stroke();
      doc.moveTo(col3X, y).lineTo(col3X, y + rowHeight).stroke();
      
      // Draw text
      const fontStyle = isTotalRow || isSection ? "Helvetica-Bold" : "Helvetica";
      const textColor = isTotalRow ? kenloPink : darkText;
      
      doc.font(fontStyle).fontSize(9).fillColor(textColor)
         .text(label, col1X + 10, y + 7, { width: col1Width - 20 });
      
      doc.font(fontStyle).fontSize(9).fillColor(textColor)
         .text(total, col2X + 10, y + 7, { width: col2Width - 20, align: "center" });
      
      doc.font(fontStyle).fontSize(9).fillColor(textColor)
         .text(monthly, col3X + 10, y + 7, { width: col3Width - 20, align: "center" });
      
      y += rowHeight;
    };
    
    // Calculate values based on selected payment plan
    const licenseTotal = data.totalMonthly * planInfo.months;
    const licenseMonthly = data.totalMonthly;
    
    // PRE-PAID SECTION
    drawRow("PRÉ-PAGO", "", "", false, true);
    
    // Licenses pre-paid row
    drawRow(
      `Licenças (${planInfo.months} meses)`,
      formatCurrency(licenseTotal),
      formatCurrency(licenseMonthly) + "/mês"
    );
    
    // Users pre-paid (if applicable)
    let totalPrePaid = licenseTotal;
    let totalMonthlyEquiv = licenseMonthly;
    
    if (data.prepayAdditionalUsers && data.prepaymentUsersAmount && data.prepaymentUsersAmount > 0) {
      const usersMonthly = data.prepaymentUsersAmount / (data.prepaymentMonths || planInfo.months);
      totalPrePaid += data.prepaymentUsersAmount;
      totalMonthlyEquiv += usersMonthly;
      drawRow(
        `Usuários Adicionais Pré-pagos (${data.prepaymentMonths || planInfo.months} meses)`,
        formatCurrency(data.prepaymentUsersAmount),
        formatCurrency(usersMonthly) + "/mês"
      );
    }
    
    // Contracts pre-paid (if applicable)
    if (data.prepayAdditionalContracts && data.prepaymentContractsAmount && data.prepaymentContractsAmount > 0) {
      const contractsMonthly = data.prepaymentContractsAmount / (data.prepaymentMonths || planInfo.months);
      totalPrePaid += data.prepaymentContractsAmount;
      totalMonthlyEquiv += contractsMonthly;
      drawRow(
        `Contratos Adicionais Pré-pagos (${data.prepaymentMonths || planInfo.months} meses)`,
        formatCurrency(data.prepaymentContractsAmount),
        formatCurrency(contractsMonthly) + "/mês"
      );
    }
    
    // Total Pre-Paid row
    drawRow(
      "TOTAL PRÉ-PAGO",
      formatCurrency(totalPrePaid),
      formatCurrency(totalMonthlyEquiv) + "/mês",
      true
    );
    
    y += 5;
    
    // IMPLANTATION ROW
    drawRow("IMPLANTAÇÃO (única vez)", formatCurrency(data.implantationFee), "-");
    
    y += 5;
    
    // POST-PAID SECTION
    if (data.postPaidTotal !== undefined && data.postPaidTotal > 0) {
      drawRow("PÓS-PAGO (estimado)", "", "", false, true);
      drawRow(
        "Custos Variáveis (uso excedente)",
        "-",
        formatCurrency(data.postPaidTotal) + "/mês"
      );
    }

    y += 15;

    // ============================================
    // "PAGUE SÓ O QUE VOCÊ USA" highlight
    // ============================================
    doc.rect(margin, y, contentWidth, 25).fill("#fef3c7");
    doc.rect(margin, y, 4, 25).fill("#f59e0b");
    
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#92400e")
       .text("💡 NA KENLO, VOCÊ PAGA SÓ O QUE VOCÊ USA", margin + 15, y + 8);
    
    y += 35;

    // ============================================
    // KENLO EFFECT (if applicable)
    // ============================================
    if (data.netGain !== undefined && (data.revenueFromBoletos || data.revenueFromInsurance)) {
      doc.rect(margin, y, contentWidth, 60).fill("#f0fdf4");
      doc.rect(margin, y, 4, 60).fill(kenloGreen);
      
      doc.font("Helvetica-Bold").fontSize(10).fillColor(kenloGreen)
         .text("THE KENLO EFFECT", margin + 15, y + 8);
      
      let effectText = "Receitas: ";
      if (data.revenueFromBoletos) {
        effectText += `Boletos/Split ${formatCurrency(data.revenueFromBoletos)}/mês`;
      }
      if (data.revenueFromBoletos && data.revenueFromInsurance) {
        effectText += " + ";
      }
      if (data.revenueFromInsurance) {
        effectText += `Seguros ${formatCurrency(data.revenueFromInsurance)}/mês`;
      }
      
      doc.font("Helvetica").fontSize(9).fillColor(darkText)
         .text(effectText, margin + 15, y + 24);
      
      doc.font("Helvetica-Bold").fontSize(11).fillColor(kenloGreen)
         .text(`Ganho Líquido: ${formatCurrency(data.netGain)}/mês`, margin + 15, y + 42);
      
      y += 70;
    }

    // ============================================
    // FOOTER - positioned at the bottom of page 1
    // ============================================
    const footerY = 770;
    
    doc.strokeColor("#e0e0e0").lineWidth(0.5)
       .moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).stroke();
    
    doc.font("Helvetica").fontSize(8).fillColor(lightText)
       .text("Esta proposta é válida por 30 dias a partir da data de emissão. | Kenlo - A plataforma completa para imobiliárias", margin, footerY + 8, { width: contentWidth, align: "center" });
    
    doc.font("Helvetica").fontSize(8).fillColor(kenloPink)
       .text("www.kenlo.com.br | contato@kenlo.com.br", margin, footerY + 20, { width: contentWidth, align: "center" });

    doc.end();
  });
}
