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

    // ============================================
    // DESIGN SYSTEM - Premium B2B
    // ============================================
    const colors = {
      primary: "#F82E52",      // Kenlo Pink
      secondary: "#4ABD8D",    // Kenlo Green
      dark: "#1a1a1a",         // Títulos principais
      medium: "#333333",       // Texto normal
      light: "#666666",        // Texto auxiliar
      veryLight: "#999999",    // Texto muito claro
      bgLight: "#f8f8f8",      // Fundo claro
      bgHighlight: "#fff0f3",  // Fundo destaque rosa
      bgSuccess: "#f0fdf4",    // Fundo destaque verde
      border: "#e0e0e0",       // Bordas
    };

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);

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

    const getPaymentPlanInfo = () => {
      switch (data.paymentPlan) {
        case "monthly": return { label: "Mensal", months: 1 };
        case "semestral": return { label: "Semestral", months: 6 };
        case "annual": return { label: "Anual", months: 12 };
        case "biennial": return { label: "Bienal", months: 24 };
        default: return { label: "Anual", months: 12 };
      }
    };

    const planInfo = getPaymentPlanInfo();
    const logoPath = path.join(process.cwd(), "client/public/KenloLogo.png");
    const today = new Date();
    const dateStr = today.toLocaleDateString("pt-BR");
    const validityDate = new Date(today);
    validityDate.setDate(validityDate.getDate() + 3);
    const validityStr = validityDate.toLocaleDateString("pt-BR");

    let y = margin;

    // ============================================
    // 1. CABEÇALHO - Logo, Cliente, Data, Validade, Vendedor
    // ============================================
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, margin, y, { width: 80 });
      } else {
        doc.font("Helvetica-Bold").fontSize(20).fillColor(colors.primary)
           .text("Kenlo", margin, y);
      }
    } catch (e) {
      doc.font("Helvetica-Bold").fontSize(20).fillColor(colors.primary)
         .text("Kenlo", margin, y);
    }

    // Cliente (destaque)
    doc.font("Helvetica-Bold").fontSize(16).fillColor(colors.dark)
       .text(data.agencyName || data.clientName, margin + 100, y);

    // Data e Validade (direita)
    doc.font("Helvetica").fontSize(9).fillColor(colors.light)
       .text(`Data: ${dateStr}`, pageWidth - margin - 100, y, { width: 100, align: "right" })
       .text(`Validade: ${validityStr}`, pageWidth - margin - 100, y + 12, { width: 100, align: "right" });

    // Vendedor (direita, abaixo)
    doc.font("Helvetica").fontSize(8).fillColor(colors.veryLight)
       .text("Vendedor", pageWidth - margin - 100, y + 28, { width: 100, align: "right" });
    doc.font("Helvetica").fontSize(9).fillColor(colors.medium)
       .text(data.salesPersonName, pageWidth - margin - 100, y + 38, { width: 100, align: "right" });

    y += 70;

    // Linha separadora
    doc.strokeColor(colors.border).lineWidth(1)
       .moveTo(margin, y).lineTo(pageWidth - margin, y).stroke();

    y += 30;

    // ============================================
    // 2. BUSINESS SNAPSHOT - Métricas do Negócio
    // ============================================
    const hasImob = data.productType === "imob" || data.productType === "both";
    const hasLoc = data.productType === "loc" || data.productType === "both";
    
    // Coletar métricas
    const metrics: Array<{label: string, value: string}> = [];
    
    // Métricas gerais
    if (hasImob && data.imobUsers) {
      metrics.push({ label: "Usuários", value: data.imobUsers.toString() });
    }
    if (hasImob && data.closings) {
      metrics.push({ label: "Fechamentos/mês", value: data.closings.toString() });
    }
    if (hasLoc && data.contracts) {
      metrics.push({ label: "Contratos ativos", value: data.contracts.toString() });
    }
    if (hasLoc && data.newContracts) {
      metrics.push({ label: "Novos contratos/mês", value: data.newContracts.toString() });
    }

    // Métricas específicas por produto
    const specificMetrics: Array<{label: string, value: string}> = [];
    
    if (hasImob) {
      if (data.leadsPerMonth) {
        specificMetrics.push({ label: "Leads recebidos/mês", value: data.leadsPerMonth.toString() });
      }
      if (data.usesExternalAI !== undefined) {
        specificMetrics.push({ label: "IA externa em uso", value: data.usesExternalAI ? "✓" : "✗" });
      }
      if (data.wantsWhatsApp !== undefined) {
        specificMetrics.push({ label: "WhatsApp integrado", value: data.wantsWhatsApp ? "✓" : "✗" });
      }
    }
    
    if (hasLoc) {
      if (data.contracts) {
        const avgRent = 2500;
        const boletosMes = data.contracts;
        specificMetrics.push({ label: "Boletos/mês", value: boletosMes.toString() });
      }
      if (data.chargesSplitToOwner !== undefined) {
        specificMetrics.push({ label: "Split proprietário ativo", value: data.chargesSplitToOwner ? "✓" : "✗" });
      }
    }

    // Só mostrar seção se houver métricas
    if (metrics.length > 0 || specificMetrics.length > 0) {
      doc.font("Helvetica-Bold").fontSize(11).fillColor(colors.dark)
         .text("Métricas do Negócio", margin, y);
      y += 18;

      // Cards horizontais com métricas gerais
      if (metrics.length > 0) {
        const cardWidth = (contentWidth - 20) / Math.min(metrics.length, 4);
        let xPos = margin;
        
        metrics.forEach((metric, index) => {
          if (index > 0 && index % 4 === 0) {
            xPos = margin;
            y += 50;
          }
          
          // Card
          doc.rect(xPos, y, cardWidth - 5, 45).fillAndStroke(colors.bgLight, colors.border);
          
          // Valor grande
          doc.font("Helvetica-Bold").fontSize(18).fillColor(colors.primary)
             .text(metric.value, xPos + 5, y + 8, { width: cardWidth - 15, align: "center" });
          
          // Label pequeno
          doc.font("Helvetica").fontSize(8).fillColor(colors.light)
             .text(metric.label, xPos + 5, y + 30, { width: cardWidth - 15, align: "center" });
          
          xPos += cardWidth;
        });
        
        y += 50;
      }

      // Métricas específicas (texto corrido)
      if (specificMetrics.length > 0) {
        y += 5;
        const metricsText = specificMetrics.map(m => `${m.label}: ${m.value}`).join("  •  ");
        doc.font("Helvetica").fontSize(9).fillColor(colors.medium)
           .text(metricsText, margin, y);
        y += 14;
      }

      y += 20;
    }

    // ============================================
    // 3. SOLUÇÃO CONTRATADA
    // ============================================
    doc.font("Helvetica-Bold").fontSize(14).fillColor(colors.dark)
       .text("Solução Contratada", margin, y);
    y += 22;

    // 3.1 Kombo (se aplicável)
    if (data.komboName && data.komboName !== "Sem Kombo") {
      doc.font("Helvetica-Bold").fontSize(12).fillColor(colors.dark)
         .text(data.komboName, margin, y, { continued: true });
      
      if (data.komboDiscount && data.komboDiscount > 0) {
        doc.font("Helvetica-Bold").fontSize(11).fillColor(colors.secondary)
           .text(`  ${data.komboDiscount}% OFF`, { continued: false });
      }
      y += 18;
    }

    // 3.2 Produtos incluídos
    doc.font("Helvetica").fontSize(10).fillColor(colors.medium)
       .text("Produtos:", margin, y);
    y += 14;

    if (hasImob) {
      doc.font("Helvetica").fontSize(10).fillColor(colors.dark)
         .text(`• Kenlo IMOB ${data.imobPlan?.toUpperCase() || ""}`, margin + 10, y);
      y += 14;
    }
    if (hasLoc) {
      doc.font("Helvetica").fontSize(10).fillColor(colors.dark)
         .text(`• Kenlo Locação ${data.locPlan?.toUpperCase() || ""}`, margin + 10, y);
      y += 14;
    }

    y += 6;

    // 3.3 Add-ons - TODOS os possíveis com ✓/✗
    doc.font("Helvetica").fontSize(10).fillColor(colors.medium)
       .text("Add-ons disponíveis:", margin, y);
    y += 14;

    const selectedAddons = JSON.parse(data.selectedAddons) as string[];
    
    // Definir todos os add-ons possíveis por produto
    const allAddons: Array<{id: string, name: string, products: string[]}> = [
      { id: "leads", name: "Kenlo Leads", products: ["imob"] },
      { id: "inteligencia", name: "Kenlo Inteligência (BI)", products: ["imob", "loc"] },
      { id: "assinatura", name: "Kenlo Assinatura", products: ["imob", "loc"] },
      { id: "pay", name: "Kenlo Pay", products: ["loc"] },
      { id: "seguros", name: "Kenlo Seguros", products: ["loc"] },
      { id: "cash", name: "Kenlo Cash", products: ["loc"] },
    ];

    // Filtrar add-ons compatíveis com os produtos selecionados
    const compatibleAddons = allAddons.filter(addon => {
      if (data.productType === "both") return true;
      return addon.products.includes(data.productType);
    });

    // Mostrar em 2 colunas
    const col1X = margin + 10;
    const col2X = margin + (contentWidth / 2);
    let currentCol = 1;
    let colY = y;

    compatibleAddons.forEach((addon, index) => {
      const isSelected = selectedAddons.includes(addon.id);
      const icon = isSelected ? "✓" : "✗";
      const iconColor = isSelected ? colors.secondary : colors.light;
      const textColor = isSelected ? colors.dark : colors.light;
      
      const xPos = currentCol === 1 ? col1X : col2X;
      
      // Ícone
      doc.font("Helvetica-Bold").fontSize(10).fillColor(iconColor)
         .text(icon, xPos, colY, { continued: true });
      
      // Nome do add-on
      doc.font("Helvetica").fontSize(9).fillColor(textColor)
         .text(`  ${addon.name}`, { continued: false });
      
      // Alternar coluna
      if (currentCol === 1) {
        currentCol = 2;
      } else {
        currentCol = 1;
        colY += 14;
      }
    });

    // Ajustar y para próxima seção
    y = colY + (currentCol === 2 ? 14 : 0) + 10;

    // ============================================
    // 4. SERVIÇOS PREMIUM (se incluído no Kombo)
    // ============================================
    if (data.hasPremiumServices && (!data.premiumServicesPrice || data.premiumServicesPrice === 0)) {
      // Box destacado
      doc.rect(margin, y, contentWidth, 50).fillAndStroke(colors.bgHighlight, colors.primary);
      
      doc.font("Helvetica-Bold").fontSize(11).fillColor(colors.primary)
         .text("✓ Serviços Premium Incluídos", margin + 15, y + 12);
      
      doc.font("Helvetica").fontSize(9).fillColor(colors.medium)
         .text("Suporte VIP e Customer Success Dedicado", margin + 15, y + 28);
      
      y += 60;
    }

    // ============================================
    // 5. INVESTIMENTO - Hero Number
    // ============================================
    doc.font("Helvetica-Bold").fontSize(14).fillColor(colors.dark)
       .text("Investimento", margin, y);
    y += 22;

    // Calcular total
    const licenseTotal = data.totalMonthly * planInfo.months;
    let totalPrePaid = licenseTotal;
    
    if (data.prepaymentUsersAmount) totalPrePaid += data.prepaymentUsersAmount;
    if (data.prepaymentContractsAmount) totalPrePaid += data.prepaymentContractsAmount;
    if (data.premiumServicesPrice) totalPrePaid += data.premiumServicesPrice;
    
    const totalNow = totalPrePaid + data.implantationFee;

    // Hero number - GRANDE E DESTACADO
    doc.rect(margin, y, contentWidth, 60).fillAndStroke(colors.bgHighlight, colors.primary);
    
    doc.font("Helvetica").fontSize(10).fillColor(colors.light)
       .text("Total a pagar agora", margin + 20, y + 12);
    
    doc.font("Helvetica-Bold").fontSize(28).fillColor(colors.primary)
       .text(formatCurrency(totalNow), margin + 20, y + 26);
    
    y += 70;

    // Composição do valor (fonte menor, itálico)
    doc.font("Helvetica-Oblique").fontSize(9).fillColor(colors.light)
       .text("Composição:", margin, y);
    y += 14;

    const composition: string[] = [];
    composition.push(`• Licença pré-paga (${planInfo.label}): ${formatCurrency(licenseTotal)}`);
    
    if (data.prepaymentUsersAmount && data.prepaymentUsersAmount > 0) {
      composition.push(`• Usuários adicionais pré-pagos: ${formatCurrency(data.prepaymentUsersAmount)}`);
    }
    if (data.prepaymentContractsAmount && data.prepaymentContractsAmount > 0) {
      composition.push(`• Contratos adicionais pré-pagos: ${formatCurrency(data.prepaymentContractsAmount)}`);
    }
    if (data.premiumServicesPrice && data.premiumServicesPrice > 0) {
      composition.push(`• Serviços Premium: ${formatCurrency(data.premiumServicesPrice)}`);
    }
    composition.push(`• Implantação (única vez): ${formatCurrency(data.implantationFee)}`);

    composition.forEach(line => {
      doc.font("Helvetica-Oblique").fontSize(8).fillColor(colors.light)
         .text(line, margin + 5, y);
      y += 12;
    });

    y += 10;

    // ============================================
    // 6. CONDIÇÕES DE PAGAMENTO
    // ============================================
    if (data.installments && data.installments > 1) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor(colors.dark)
         .text("Condições de Pagamento", margin, y);
      y += 14;

      const installmentValue = totalNow / data.installments;
      doc.font("Helvetica").fontSize(10).fillColor(colors.medium)
         .text(`${data.installments}x de ${formatCurrency(installmentValue)}`, margin, y);
      y += 14;

      doc.font("Helvetica-Oblique").fontSize(8).fillColor(colors.veryLight)
         .text("(Equivalente mensal para referência, não é cobrança mensal real)", margin, y);
      y += 20;
    } else {
      // Equivalente mensal
      doc.font("Helvetica-Oblique").fontSize(9).fillColor(colors.veryLight)
         .text(`Equivalente mensal: ${formatCurrency(data.totalMonthly)}/mês`, margin, y);
      y += 20;
    }

    // ============================================
    // 7. ESTIMATIVAS PÓS-PAGAS
    // ============================================
    if (data.postPaidTotal && data.postPaidTotal > 0) {
      // Seção separada visualmente
      doc.rect(margin, y, contentWidth, 60).fillAndStroke(colors.bgLight, colors.border);
      
      doc.font("Helvetica-Bold").fontSize(10).fillColor(colors.dark)
         .text("Estimativas Pós-pagas (Uso Excedente)", margin + 15, y + 12);
      
      doc.font("Helvetica-Oblique").fontSize(8).fillColor(colors.light)
         .text("Valores médios esperados com base no uso informado", margin + 15, y + 26);
      
      doc.font("Helvetica-Bold").fontSize(12).fillColor(colors.medium)
         .text(`~${formatCurrency(data.postPaidTotal)}/mês`, margin + 15, y + 40);
      
      y += 70;
    }

    // ============================================
    // 8. THE KENLO EFFECT - ROI Positivo
    // ============================================
    if (data.netGain && (data.revenueFromBoletos || data.revenueFromInsurance)) {
      // Box verde com destaque
      doc.rect(margin, y, contentWidth, 80).fillAndStroke(colors.bgSuccess, colors.secondary);
      
      doc.font("Helvetica-Bold").fontSize(12).fillColor(colors.secondary)
         .text("The Kenlo Effect", margin + 15, y + 12);
      
      doc.font("Helvetica").fontSize(9).fillColor(colors.medium)
         .text("Receitas extras estimadas com a plataforma Kenlo:", margin + 15, y + 28);
      
      const revenueItems: string[] = [];
      if (data.revenueFromBoletos && data.revenueFromBoletos > 0) {
        revenueItems.push(`• Boletos/Split: ${formatCurrency(data.revenueFromBoletos)}/mês`);
      }
      if (data.revenueFromInsurance && data.revenueFromInsurance > 0) {
        revenueItems.push(`• Seguros: ${formatCurrency(data.revenueFromInsurance)}/mês`);
      }
      
      let itemY = y + 42;
      revenueItems.forEach(item => {
        doc.font("Helvetica").fontSize(9).fillColor(colors.dark)
           .text(item, margin + 15, itemY);
        itemY += 12;
      });
      
      doc.font("Helvetica-Bold").fontSize(11).fillColor(colors.secondary)
         .text(`Ganho líquido estimado: ${formatCurrency(data.netGain)}/mês`, margin + 15, itemY + 4);
      
      // Disclaimer
      doc.font("Helvetica-Oblique").fontSize(7).fillColor(colors.veryLight)
         .text("* Valores estimados. Não incluem impostos.", margin + 15, itemY + 20);
      
      y += 90;
    }

    // ============================================
    // FOOTER
    // ============================================
    const footerY = pageHeight - 60;
    
    doc.strokeColor(colors.border).lineWidth(0.5)
       .moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).stroke();
    
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, margin, footerY + 15, { width: 60 });
      }
    } catch (e) {
      // Ignore
    }
    
    doc.font("Helvetica").fontSize(8).fillColor(colors.light)
       .text("Quem usa, lidera.", margin + 70, footerY + 22);
    
    doc.font("Helvetica").fontSize(8).fillColor(colors.light)
       .text("www.kenlo.com.br", pageWidth - margin - 80, footerY + 22);

    doc.end();
  });
}
