import PDFDocument from "pdfkit";

interface ProposalData {
  salesPersonName: string;
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
    
    doc.font("Helvetica-Bold").fontSize(28).fillColor("#ffffff")
       .text("kenlo.", margin, 30);
    
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
    // PRICING TABLE (compact)
    // ============================================
    doc.font("Helvetica-Bold").fontSize(10).fillColor(kenloPink)
       .text("INVESTIMENTO", margin, y);
    y += 18;

    const paymentLabels: Record<string, string> = {
      monthly: "Mensal (+25%)",
      semestral: "Semestral (+10%)",
      annual: "Anual (Referência)",
      biennial: "Bienal (-10%)",
    };

    // Table header
    doc.rect(margin, y, contentWidth, 22).fill(lightGray);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(lightText)
       .text("DESCRIÇÃO", margin + 10, y + 7)
       .text("VALOR", pageWidth - margin - 80, y + 7);
    y += 22;

    // Table rows
    const rows = [
      { label: `Mensalidade (${paymentLabels[data.paymentPlan] || data.paymentPlan})`, value: formatCurrency(data.totalMonthly) },
      { label: "Total Anual (12x mensalidade)", value: formatCurrency(data.totalAnnual) },
      { label: "Implantação (única vez)", value: formatCurrency(data.implantationFee) },
    ];

    rows.forEach((row, i) => {
      doc.font("Helvetica").fontSize(9).fillColor(darkText)
         .text(row.label, margin + 10, y + 6)
         .text(row.value, pageWidth - margin - 80, y + 6);
      y += 22;
      doc.strokeColor("#e0e0e0").lineWidth(0.5)
         .moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();
    });

    // Total 1º Ano - highlighted
    doc.rect(margin, y, contentWidth, 28).fill(kenloPink);
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#ffffff")
       .text("TOTAL 1º ANO", margin + 10, y + 9)
       .text(formatCurrency(data.firstYearTotal), pageWidth - margin - 100, y + 9);
    y += 38;

    // Post-paid costs (if any)
    if (data.postPaidTotal && data.postPaidTotal > 0) {
      doc.font("Helvetica").fontSize(8).fillColor(lightText)
         .text(`Custos variáveis estimados (pós-pago): ${formatCurrency(data.postPaidTotal)}/mês`, margin, y);
      y += 18;
    }

    // ============================================
    // KENLO EFFECT (if applicable)
    // ============================================
    if (data.netGain !== undefined && (data.revenueFromBoletos || data.revenueFromInsurance)) {
      y += 5;
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
