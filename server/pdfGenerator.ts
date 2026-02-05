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
  prepaymentMonths?: number; // 12 for annual, 24 for biennial
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
    const highlightCell = "#fff0f3"; // Light pink for selected column

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
    // NEW PRICING TABLE - Multi-column layout
    // ============================================
    doc.font("Helvetica-Bold").fontSize(10).fillColor(kenloPink)
       .text("INVESTIMENTO", margin, y);
    y += 18;

    // Table dimensions
    const labelColWidth = 180;
    const valueColWidth = (contentWidth - labelColWidth) / 3;
    const rowHeight = 22;
    
    // Determine which columns to show based on payment plan
    const isMonthly = data.paymentPlan === "monthly";
    const isSemestral = data.paymentPlan === "semestral";
    const isAnnual = data.paymentPlan === "annual";
    const isBiennial = data.paymentPlan === "biennial";
    
    // Column headers
    const col1Label = "Mensal";
    const col2Label = "Anual";
    const col3Label = isSemestral ? "Semestral (-15%)" : "Bienal (-25%)";
    
    // Determine which column is selected
    const selectedCol = isMonthly ? 1 : isAnnual ? 2 : 3;
    
    // Calculate values for each column
    // Monthly base (no discount)
    const monthlyBase = data.totalMonthly / (
      isMonthly ? 1 : 
      isSemestral ? 0.85 : 
      isAnnual ? 0.80 : 
      0.75
    );
    
    const monthlyValue = monthlyBase;
    const annualValue = monthlyBase * 0.80; // 20% discount
    const thirdColValue = isSemestral ? monthlyBase * 0.85 : monthlyBase * 0.75; // 15% or 25% discount
    
    // Draw table header
    doc.rect(margin, y, contentWidth, rowHeight).fill(highlightBg);
    
    // Header labels
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff")
       .text("", margin + 10, y + 7);
    
    const col1X = margin + labelColWidth;
    const col2X = col1X + valueColWidth;
    const col3X = col2X + valueColWidth;
    
    // Highlight selected column header
    if (selectedCol === 1) {
      doc.rect(col1X, y, valueColWidth, rowHeight).fill(kenloPink);
    } else if (selectedCol === 2) {
      doc.rect(col2X, y, valueColWidth, rowHeight).fill(kenloPink);
    } else {
      doc.rect(col3X, y, valueColWidth, rowHeight).fill(kenloPink);
    }
    
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff")
       .text(col1Label, col1X + 5, y + 7, { width: valueColWidth - 10, align: "center" })
       .text(col2Label, col2X + 5, y + 7, { width: valueColWidth - 10, align: "center" })
       .text(col3Label, col3X + 5, y + 7, { width: valueColWidth - 10, align: "center" });
    
    y += rowHeight;
    
    // Helper to draw a table row
    const drawRow = (label: string, val1: string, val2: string, val3: string, isTotalRow = false) => {
      const bgColor = isTotalRow ? lightGray : "#ffffff";
      doc.rect(margin, y, contentWidth, rowHeight).fill(bgColor);
      
      // Highlight selected column
      if (selectedCol === 1) {
        doc.rect(col1X, y, valueColWidth, rowHeight).fill(highlightCell);
      } else if (selectedCol === 2) {
        doc.rect(col2X, y, valueColWidth, rowHeight).fill(highlightCell);
      } else {
        doc.rect(col3X, y, valueColWidth, rowHeight).fill(highlightCell);
      }
      
      // Draw borders
      doc.strokeColor("#e0e0e0").lineWidth(0.5);
      doc.rect(margin, y, contentWidth, rowHeight).stroke();
      doc.moveTo(col1X, y).lineTo(col1X, y + rowHeight).stroke();
      doc.moveTo(col2X, y).lineTo(col2X, y + rowHeight).stroke();
      doc.moveTo(col3X, y).lineTo(col3X, y + rowHeight).stroke();
      
      // Draw text
      const fontStyle = isTotalRow ? "Helvetica-Bold" : "Helvetica";
      doc.font(fontStyle).fontSize(8).fillColor(darkText)
         .text(label, margin + 5, y + 7, { width: labelColWidth - 10 });
      
      doc.font(fontStyle).fontSize(8).fillColor(selectedCol === 1 ? kenloPink : darkText)
         .text(val1, col1X + 5, y + 7, { width: valueColWidth - 10, align: "center" });
      doc.font(fontStyle).fontSize(8).fillColor(selectedCol === 2 ? kenloPink : darkText)
         .text(val2, col2X + 5, y + 7, { width: valueColWidth - 10, align: "center" });
      doc.font(fontStyle).fontSize(8).fillColor(selectedCol === 3 ? kenloPink : darkText)
         .text(val3, col3X + 5, y + 7, { width: valueColWidth - 10, align: "center" });
      
      y += rowHeight;
    };
    
    // PRE-PAID SECTION
    doc.font("Helvetica-Bold").fontSize(8).fillColor(kenloPink)
       .text("LICENÇAS PRÉ-PAGAS", margin + 5, y + 7);
    y += 18;
    
    // Licenses pre-paid row
    const licensesMonthly = formatCurrency(monthlyValue * 12);
    const licensesAnnual = formatCurrency(annualValue * 12);
    const licensesThird = isSemestral 
      ? formatCurrency(thirdColValue * 6)
      : formatCurrency(thirdColValue * 24);
    
    drawRow("Licenças Pré-pagas", licensesMonthly, licensesAnnual, licensesThird);
    
    // Users pre-paid (if applicable)
    if (data.prepayAdditionalUsers && data.prepaymentUsersAmount && data.prepaymentUsersAmount > 0) {
      const usersValue = formatCurrency(data.prepaymentUsersAmount);
      drawRow("Usuários Pré-pagos", usersValue, usersValue, usersValue);
    }
    
    // Contracts pre-paid (if applicable)
    if (data.prepayAdditionalContracts && data.prepaymentContractsAmount && data.prepaymentContractsAmount > 0) {
      const contractsValue = formatCurrency(data.prepaymentContractsAmount);
      drawRow("Contratos Pré-pagos", contractsValue, contractsValue, contractsValue);
    }
    
    // Total Pre-Paid row
    let totalPrePaidMonthly = monthlyValue * 12;
    let totalPrePaidAnnual = annualValue * 12;
    let totalPrePaidThird = isSemestral ? thirdColValue * 6 : thirdColValue * 24;
    
    if (data.prepayAdditionalUsers && data.prepaymentUsersAmount) {
      totalPrePaidMonthly += data.prepaymentUsersAmount;
      totalPrePaidAnnual += data.prepaymentUsersAmount;
      totalPrePaidThird += data.prepaymentUsersAmount;
    }
    if (data.prepayAdditionalContracts && data.prepaymentContractsAmount) {
      totalPrePaidMonthly += data.prepaymentContractsAmount;
      totalPrePaidAnnual += data.prepaymentContractsAmount;
      totalPrePaidThird += data.prepaymentContractsAmount;
    }
    
    drawRow("Total Pré-Pago", 
      formatCurrency(totalPrePaidMonthly), 
      formatCurrency(totalPrePaidAnnual), 
      formatCurrency(totalPrePaidThird),
      true
    );
    
    y += 10;
    
    // IMPLANTATION ROW
    drawRow("Implantação (única vez)", 
      formatCurrency(data.implantationFee), 
      formatCurrency(data.implantationFee), 
      formatCurrency(data.implantationFee)
    );
    
    y += 10;
    
    // POST-PAID SECTION
    if (data.postPaidTotal !== undefined && data.postPaidTotal > 0) {
      doc.font("Helvetica-Bold").fontSize(8).fillColor(lightText)
         .text("ESTIMAÇÃO PÓS-PAGO (MENSAL)", margin + 5, y + 2);
      y += 14;
      
      drawRow("Custos Variáveis Estimados", 
        formatCurrency(data.postPaidTotal) + "/mês", 
        formatCurrency(data.postPaidTotal) + "/mês", 
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
