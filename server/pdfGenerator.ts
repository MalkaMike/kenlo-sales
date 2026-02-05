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
  leadsPerMonth?: number;
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
}

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 50,
      autoFirstPage: true,
      bufferPages: true
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
    const veryLightGray = "#fafafa";

    const pageWidth = 595.28;
    const margin = 50;
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
          return { label: "Anual", months: 12, discount: "Referencia" };
        case "biennial":
          return { label: "Bienal", months: 24, discount: "-25%" };
        default:
          return { label: "Anual", months: 12, discount: "Referencia" };
      }
    };

    const planInfo = getPaymentPlanInfo();

    // ============================================
    // HEADER - Clean and minimal
    // ============================================
    // Logo "Kenlo" in pink
    doc.font("Helvetica-Bold").fontSize(32).fillColor(kenloPink)
       .text("Kenlo", margin, 40);
    
    // Proposal info on the right
    const today = new Date();
    const validUntil = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
    const dateStr = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const validStr = validUntil.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    
    doc.font("Helvetica").fontSize(9).fillColor(lightText)
       .text(`Data: ${dateStr}`, pageWidth - margin - 120, 40, { width: 120, align: "right" })
       .text(`Validade: ${validStr}`, pageWidth - margin - 120, 52, { width: 120, align: "right" });

    // Thin line separator
    doc.strokeColor("#e5e5e5").lineWidth(1)
       .moveTo(margin, 85).lineTo(pageWidth - margin, 85).stroke();

    let y = 100;

    // ============================================
    // CLIENT & VENDOR - Side by side, clean
    // ============================================
    doc.font("Helvetica").fontSize(8).fillColor(lightText)
       .text("PARA", margin, y);
    doc.font("Helvetica-Bold").fontSize(16).fillColor(darkText)
       .text(data.clientName, margin, y + 12);

    doc.font("Helvetica").fontSize(8).fillColor(lightText)
       .text("VENDEDOR", pageWidth - margin - 180, y);
    doc.font("Helvetica").fontSize(11).fillColor(darkText)
       .text(data.salesPersonName, pageWidth - margin - 180, y + 12);
    
    if (data.vendorEmail) {
      doc.font("Helvetica").fontSize(9).fillColor(lightText)
         .text(data.vendorEmail, pageWidth - margin - 180, y + 26);
    }
    if (data.vendorPhone) {
      doc.font("Helvetica").fontSize(9).fillColor(lightText)
         .text(data.vendorPhone, pageWidth - margin - 180, y + 38);
    }

    y += 65;

    // ============================================
    // SOLUCAO CONTRATADA - With Kombo name if applicable
    // ============================================
    doc.font("Helvetica-Bold").fontSize(11).fillColor(kenloPink)
       .text("SOLUCAO CONTRATADA", margin, y);
    y += 18;

    // Kombo name (if applicable)
    if (data.komboName && data.komboName !== "Sem Kombo") {
      const komboWidth = 150; // Approximate width
      doc.font("Helvetica-Bold").fontSize(14).fillColor(darkText)
         .text(data.komboName, margin, y);
      doc.font("Helvetica").fontSize(10).fillColor(kenloGreen)
         .text(` (${data.komboDiscount}% OFF)`, margin + komboWidth, y + 2);
      y += 22;
    }

    // Products included
    let productsText = "";
    if (data.productType === "imob" || data.productType === "both") {
      productsText += `Kenlo Imob ${data.imobPlan?.toUpperCase() || ""}`;
    }
    if (data.productType === "both") {
      productsText += " + ";
    }
    if (data.productType === "loc" || data.productType === "both") {
      productsText += `Kenlo Locacao ${data.locPlan?.toUpperCase() || ""}`;
    }
    
    doc.font("Helvetica").fontSize(11).fillColor(darkText)
       .text(productsText, margin, y);
    y += 16;

    // Add-ons included
    const addons = JSON.parse(data.selectedAddons);
    if (addons.length > 0) {
      const addonLabels: Record<string, string> = {
        leads: "Leads",
        inteligencia: "Inteligencia",
        assinatura: "Assinatura",
        pay: "Pay",
        seguros: "Seguros",
        cash: "Cash",
      };
      const addonText = addons.map((a: string) => addonLabels[a] || a).join(", ");
      
      doc.font("Helvetica").fontSize(10).fillColor(lightText)
         .text(`Add-ons: ${addonText}`, margin, y);
      y += 16;
    }

    y += 10;

    // ============================================
    // METRICAS ESSENCIAIS - Clean list
    // ============================================
    const hasMetrics = data.imobUsers || data.contracts || data.leadsPerMonth;
    
    if (hasMetrics) {
      doc.font("Helvetica-Bold").fontSize(11).fillColor(kenloPink)
         .text("METRICAS DO NEGOCIO", margin, y);
      y += 18;

      const metrics: string[] = [];
      if (data.imobUsers && data.imobUsers > 0) {
        metrics.push(`${data.imobUsers} usuarios`);
      }
      if (data.contracts && data.contracts > 0) {
        metrics.push(`${data.contracts} contratos`);
      }
      if (data.leadsPerMonth && data.leadsPerMonth > 0) {
        metrics.push(`${data.leadsPerMonth} leads/mes`);
      }

      doc.font("Helvetica").fontSize(10).fillColor(darkText)
         .text(metrics.join("  |  "), margin, y);
      y += 25;
    }

    // ============================================
    // INVESTIMENTO - Clean table
    // ============================================
    doc.font("Helvetica-Bold").fontSize(11).fillColor(kenloPink)
       .text("INVESTIMENTO", margin, y);
    y += 20;

    // Calculate values
    const licenseTotal = data.totalMonthly * planInfo.months;
    const licenseMonthly = data.totalMonthly;
    
    // Table with 2 columns: Item | Value
    const col1Width = contentWidth * 0.65;
    const col2Width = contentWidth * 0.35;
    const rowHeight = 28;
    
    const col1X = margin;
    const col2X = margin + col1Width;
    
    // Header row with frequency name
    doc.rect(margin, y, contentWidth, rowHeight).fill(kenloPink);
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#ffffff")
       .text("Item", col1X + 12, y + 9)
       .text(planInfo.label, col2X + 12, y + 9, { width: col2Width - 24, align: "right" });
    y += rowHeight;

    // Helper to draw a row
    const drawRow = (label: string, value: string, isTotal = false, isGray = false) => {
      const bgColor = isTotal ? "#fff0f3" : isGray ? veryLightGray : "#ffffff";
      doc.rect(margin, y, contentWidth, rowHeight).fill(bgColor);
      
      // Border
      doc.strokeColor("#e5e5e5").lineWidth(0.5);
      doc.rect(margin, y, contentWidth, rowHeight).stroke();
      
      const fontStyle = isTotal ? "Helvetica-Bold" : "Helvetica";
      const textColor = isTotal ? kenloPink : darkText;
      
      doc.font(fontStyle).fontSize(10).fillColor(textColor)
         .text(label, col1X + 12, y + 9, { width: col1Width - 24 });
      
      doc.font(fontStyle).fontSize(10).fillColor(textColor)
         .text(value, col2X + 12, y + 9, { width: col2Width - 24, align: "right" });
      
      y += rowHeight;
    };

    // License row
    drawRow(`Licencas (${planInfo.months} ${planInfo.months === 1 ? "mes" : "meses"})`, formatCurrency(licenseTotal), false, true);

    // Users pre-paid (if applicable)
    let totalPrePaid = licenseTotal;
    
    if (data.prepayAdditionalUsers && data.prepaymentUsersAmount && data.prepaymentUsersAmount > 0) {
      totalPrePaid += data.prepaymentUsersAmount;
      drawRow(`Usuarios adicionais pre-pagos`, formatCurrency(data.prepaymentUsersAmount));
    }
    
    // Contracts pre-paid (if applicable)
    if (data.prepayAdditionalContracts && data.prepaymentContractsAmount && data.prepaymentContractsAmount > 0) {
      totalPrePaid += data.prepaymentContractsAmount;
      drawRow(`Contratos adicionais pre-pagos`, formatCurrency(data.prepaymentContractsAmount));
    }

    // Implantation
    drawRow("Implantacao (unica vez)", formatCurrency(data.implantationFee), false, true);
    
    // Total to pay now
    const totalNow = totalPrePaid + data.implantationFee;
    drawRow("TOTAL A PAGAR AGORA", formatCurrency(totalNow), true);

    y += 8;

    // Post-paid estimate (if applicable)
    if (data.postPaidTotal !== undefined && data.postPaidTotal > 0) {
      doc.rect(margin, y, contentWidth, rowHeight).fill(veryLightGray);
      doc.strokeColor("#e5e5e5").lineWidth(0.5);
      doc.rect(margin, y, contentWidth, rowHeight).stroke();
      
      doc.font("Helvetica").fontSize(10).fillColor(lightText)
         .text("Estimativa pos-pago (uso excedente)", col1X + 12, y + 9, { width: col1Width - 24 });
      doc.font("Helvetica").fontSize(10).fillColor(lightText)
         .text(formatCurrency(data.postPaidTotal) + "/mes", col2X + 12, y + 9, { width: col2Width - 24, align: "right" });
      y += rowHeight;
    }

    // Monthly equivalent
    y += 8;
    doc.font("Helvetica").fontSize(9).fillColor(lightText)
       .text(`Equivalente mensal: ${formatCurrency(licenseMonthly)}/mes`, margin, y);
    y += 25;

    // ============================================
    // KENLO RECEITAS EXTRA (if applicable)
    // ============================================
    if (data.netGain !== undefined && (data.revenueFromBoletos || data.revenueFromInsurance)) {
      doc.rect(margin, y, contentWidth, 55).fill("#f0fdf4");
      doc.rect(margin, y, 4, 55).fill(kenloGreen);
      
      doc.font("Helvetica-Bold").fontSize(11).fillColor(kenloGreen)
         .text("KENLO RECEITAS EXTRA", margin + 15, y + 10);
      
      let revenueItems: string[] = [];
      if (data.revenueFromBoletos && data.revenueFromBoletos > 0) {
        revenueItems.push(`Boletos/Split: ${formatCurrency(data.revenueFromBoletos)}/mes`);
      }
      if (data.revenueFromInsurance && data.revenueFromInsurance > 0) {
        revenueItems.push(`Seguros: ${formatCurrency(data.revenueFromInsurance)}/mes`);
      }
      
      doc.font("Helvetica").fontSize(9).fillColor(darkText)
         .text(revenueItems.join("  |  "), margin + 15, y + 26);
      
      doc.font("Helvetica-Bold").fontSize(12).fillColor(kenloGreen)
         .text(`Ganho liquido estimado: ${formatCurrency(data.netGain)}/mes`, margin + 15, y + 40);
      
      y += 65;
    }

    // ============================================
    // FOOTER - At bottom of content
    // ============================================
    y += 30;
    
    // Thin line
    doc.strokeColor("#e5e5e5").lineWidth(1)
       .moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();
    
    // Logo and slogan
    doc.font("Helvetica-Bold").fontSize(14).fillColor(kenloPink)
       .text("Kenlo", margin, y + 12);
    
    doc.font("Helvetica").fontSize(9).fillColor(lightText)
       .text("Quem usa, lidera.", margin + 55, y + 15);
    
    // Contact info on right
    doc.font("Helvetica").fontSize(8).fillColor(lightText)
       .text("www.kenlo.com.br", pageWidth - margin - 100, y + 12, { width: 100, align: "right" });

    // Flush only the first page
    const range = doc.bufferedPageRange();
    if (range.count > 1) {
      // Remove extra pages by ending early
    }

    doc.end();
  });
}
