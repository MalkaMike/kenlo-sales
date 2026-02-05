import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

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
  // Premium services
  hasPremiumServices?: boolean;
}

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: "A4", 
      margin: 40,
      autoFirstPage: true,
      bufferPages: true  // Enable buffer to control pages
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Colors - professional and subtle
    const kenloPink = "#F82E52";
    const kenloGreen = "#4ABD8D";
    const darkText = "#1a1a1a";
    const mediumText = "#333333";
    const lightText = "#666666";
    const veryLightGray = "#f8f8f8";
    const borderColor = "#e0e0e0";

    const pageWidth = 595.28;
    const pageHeight = 841.89;
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
          return { label: "Mensal", months: 1 };
        case "semestral":
          return { label: "Semestral", months: 6 };
        case "annual":
          return { label: "Anual", months: 12 };
        case "biennial":
          return { label: "Bienal", months: 24 };
        default:
          return { label: "Anual", months: 12 };
      }
    };

    const planInfo = getPaymentPlanInfo();
    const logoPath = path.join(process.cwd(), "client/public/KenloLogo.png");
    const today = new Date();
    const dateStr = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    // ============================================
    // HEADER - Logo + data/validade
    // ============================================
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, margin, 30, { width: 90 });
      } else {
        doc.font("Helvetica-Bold").fontSize(24).fillColor(kenloPink)
           .text("Kenlo", margin, 35);
      }
    } catch (e) {
      doc.font("Helvetica-Bold").fontSize(24).fillColor(kenloPink)
         .text("Kenlo", margin, 35);
    }
    
    // Date and validity on the right - "3 dias" as text
    doc.font("Helvetica").fontSize(9).fillColor(lightText)
       .text(`Data: ${dateStr}`, pageWidth - margin - 90, 35, { width: 90, align: "right" })
       .text("Validade: 3 dias", pageWidth - margin - 90, 47, { width: 90, align: "right" });

    // Thin line separator
    doc.strokeColor(borderColor).lineWidth(0.5)
       .moveTo(margin, 70).lineTo(pageWidth - margin, 70).stroke();

    let y = 82;

    // ============================================
    // CLIENT & VENDOR - Side by side (compact)
    // ============================================
    doc.font("Helvetica").fontSize(7).fillColor(lightText)
       .text("PARA", margin, y);
    doc.font("Helvetica-Bold").fontSize(12).fillColor(darkText)
       .text(data.clientName, margin, y + 9);

    doc.font("Helvetica").fontSize(7).fillColor(lightText)
       .text("VENDEDOR", pageWidth - margin - 140, y);
    doc.font("Helvetica").fontSize(9).fillColor(darkText)
       .text(data.salesPersonName, pageWidth - margin - 140, y + 9);
    
    if (data.vendorEmail) {
      doc.font("Helvetica").fontSize(7).fillColor(lightText)
         .text(data.vendorEmail, pageWidth - margin - 140, y + 20);
    }

    y += 40;

    // ============================================
    // METRICAS DO NEGOCIO - FIRST (logical order)
    // ============================================
    const hasMetrics = data.imobUsers || data.contracts;
    
    if (hasMetrics) {
      // Title in DARK (not red)
      doc.font("Helvetica-Bold").fontSize(9).fillColor(darkText)
         .text("METRICAS DO NEGOCIO", margin, y);
      y += 12;

      const metrics: string[] = [];
      if (data.imobUsers && data.imobUsers > 0) {
        metrics.push(`${data.imobUsers} usuarios`);
      }
      if (data.contracts && data.contracts > 0) {
        metrics.push(`${data.contracts} contratos`);
      }

      doc.font("Helvetica").fontSize(9).fillColor(mediumText)
         .text(metrics.join("  |  "), margin, y);
      y += 16;
    }

    // ============================================
    // SOLUCAO CONTRATADA - With Kombo and Premium Services
    // ============================================
    // Title in DARK (not red)
    doc.font("Helvetica-Bold").fontSize(9).fillColor(darkText)
       .text("SOLUCAO CONTRATADA", margin, y);
    y += 12;

    // Kombo name (if applicable)
    if (data.komboName && data.komboName !== "Sem Kombo") {
      doc.font("Helvetica-Bold").fontSize(11).fillColor(darkText)
         .text(data.komboName, margin, y, { continued: true });
      doc.font("Helvetica").fontSize(9).fillColor(kenloGreen)
         .text(`  (${data.komboDiscount}% OFF)`, { continued: false });
      y += 14;
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
    
    doc.font("Helvetica").fontSize(9).fillColor(mediumText)
       .text(productsText, margin, y);
    y += 12;

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
      
      doc.font("Helvetica").fontSize(8).fillColor(lightText)
         .text(`Add-ons: ${addonText}`, margin, y);
      y += 11;
    }

    // Premium Services included (if applicable)
    if (data.hasPremiumServices) {
      doc.font("Helvetica").fontSize(8).fillColor(kenloGreen)
         .text("Servico Premium: Suporte VIP e CS Dedicado incluido", margin, y);
      y += 11;
    }

    y += 8;

    // ============================================
    // INVESTIMENTO - Clean table
    // ============================================
    // Title in DARK (not red)
    doc.font("Helvetica-Bold").fontSize(9).fillColor(darkText)
       .text("INVESTIMENTO", margin, y);
    y += 12;

    // Calculate values
    const licenseTotal = data.totalMonthly * planInfo.months;
    const licenseMonthly = data.totalMonthly;
    
    // Table with 2 columns - NO "Item" word
    const col1Width = contentWidth * 0.65;
    const col2Width = contentWidth * 0.35;
    const rowHeight = 22;
    
    const col1X = margin;
    const col2X = margin + col1Width;
    
    // Header row - just frequency name
    doc.rect(margin, y, contentWidth, rowHeight).fill(kenloPink);
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#ffffff")
       .text("Descricao", col1X + 8, y + 6)
       .text(planInfo.label, col2X + 8, y + 6, { width: col2Width - 16, align: "right" });
    y += rowHeight;

    // Helper to draw a row
    const drawRow = (label: string, value: string, isTotal = false, isGray = false) => {
      const bgColor = isTotal ? "#fff0f3" : isGray ? veryLightGray : "#ffffff";
      doc.rect(margin, y, contentWidth, rowHeight).fill(bgColor);
      
      // Border
      doc.strokeColor(borderColor).lineWidth(0.5);
      doc.rect(margin, y, contentWidth, rowHeight).stroke();
      
      const fontStyle = isTotal ? "Helvetica-Bold" : "Helvetica";
      const textColor = isTotal ? kenloPink : darkText;
      
      doc.font(fontStyle).fontSize(8).fillColor(textColor)
         .text(label, col1X + 8, y + 6, { width: col1Width - 16 });
      
      doc.font(fontStyle).fontSize(8).fillColor(textColor)
         .text(value, col2X + 8, y + 6, { width: col2Width - 16, align: "right" });
      
      y += rowHeight;
    };

    // License row - "Licenca pre-paga"
    drawRow(`Licenca pre-paga (${planInfo.months} ${planInfo.months === 1 ? "mes" : "meses"})`, formatCurrency(licenseTotal), false, true);

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

    // Monthly equivalent - RIGHT BELOW total
    y += 3;
    doc.font("Helvetica").fontSize(7).fillColor(lightText)
       .text(`Equivalente mensal: ${formatCurrency(licenseMonthly)}/mes`, margin, y);
    y += 12;

    // Post-paid estimate (if applicable) - AFTER monthly equivalent
    if (data.postPaidTotal !== undefined && data.postPaidTotal > 0) {
      doc.rect(margin, y, contentWidth, rowHeight).fill(veryLightGray);
      doc.strokeColor(borderColor).lineWidth(0.5);
      doc.rect(margin, y, contentWidth, rowHeight).stroke();
      
      doc.font("Helvetica").fontSize(8).fillColor(lightText)
         .text("Estimativa pos-pago (uso excedente)", col1X + 8, y + 6, { width: col1Width - 16 });
      doc.font("Helvetica").fontSize(8).fillColor(lightText)
         .text(formatCurrency(data.postPaidTotal) + "/mes", col2X + 8, y + 6, { width: col2Width - 16, align: "right" });
      y += rowHeight;
    }

    y += 10;

    // ============================================
    // KENLO RECEITAS EXTRA (if applicable)
    // ============================================
    if (data.netGain !== undefined && (data.revenueFromBoletos || data.revenueFromInsurance)) {
      doc.rect(margin, y, contentWidth, 50).fill("#f0fdf4");
      doc.rect(margin, y, 3, 50).fill(kenloGreen);
      
      // Title in GREEN (this one can stay green as it's a positive highlight)
      doc.font("Helvetica-Bold").fontSize(9).fillColor(kenloGreen)
         .text("KENLO RECEITAS EXTRA", margin + 10, y + 6);
      
      let revenueItems: string[] = [];
      if (data.revenueFromBoletos && data.revenueFromBoletos > 0) {
        revenueItems.push(`Boletos/Split: ${formatCurrency(data.revenueFromBoletos)}/mes`);
      }
      if (data.revenueFromInsurance && data.revenueFromInsurance > 0) {
        revenueItems.push(`Seguros: ${formatCurrency(data.revenueFromInsurance)}/mes`);
      }
      
      doc.font("Helvetica").fontSize(8).fillColor(darkText)
         .text(revenueItems.join("  |  "), margin + 10, y + 18);
      
      doc.font("Helvetica-Bold").fontSize(9).fillColor(kenloGreen)
         .text(`Ganho liquido estimado: ${formatCurrency(data.netGain)}/mes`, margin + 10, y + 30);
      
      // Footnote about taxes
      doc.font("Helvetica").fontSize(6).fillColor(lightText)
         .text("* Valores estimados. Nao inclui impostos.", margin + 10, y + 42);
      
      y += 55;
    }

    // ============================================
    // FOOTER - FIXED AT ABSOLUTE BOTTOM OF PAGE 1
    // ============================================
    // Draw footer at fixed position at the bottom of the page
    const footerY = pageHeight - 50;
    
    // Thin line
    doc.strokeColor(borderColor).lineWidth(0.5)
       .moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).stroke();
    
    // Logo at footer - use image only, no text fallback to avoid page creation
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, margin, footerY + 10, { width: 50 });
      }
    } catch (e) {
      // Ignore logo errors
    }
    
    // Slogan - centered below logo
    doc.font("Helvetica").fontSize(8).fillColor(lightText);
    doc.text("Quem usa, lidera.", margin + 55, footerY + 15, { 
      lineBreak: false,
      continued: false
    });
    
    // Website - use absolute positioning to avoid page creation
    // Draw directly without text() to avoid any page flow issues
    doc.font("Helvetica").fontSize(7).fillColor(lightText);
    const websiteText = "www.kenlo.com.br";
    const websiteWidth = doc.widthOfString(websiteText);
    doc.text(websiteText, pageWidth - margin - websiteWidth, footerY + 15, { 
      lineBreak: false,
      continued: false
    });

    // End the document
    doc.end();
  });
}
