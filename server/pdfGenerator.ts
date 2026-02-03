import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface ProposalData {
  salesPersonName: string;
  clientName: string;
  productType: string;
  imobPlan?: string;
  locPlan?: string;
  imobUsers?: number;
  contracts?: number;
  selectedAddons: string; // JSON string
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
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Kenlo brand colors
    const kenloPink = "#F82E52";
    const kenloGreen = "#4ABD8D";

    // Header with Kenlo branding
    doc.fontSize(28).fillColor(kenloPink).text("kenlo", { continued: true });
    doc.fontSize(28).fillColor("#000000").text(".");
    doc.moveDown(0.5);
    doc.fontSize(20).fillColor("#333333").text("Proposta Comercial");
    doc.moveDown(2);

    // Client and Sales Info
    doc.fontSize(12).fillColor("#666666").text("Proposta para:", { continued: false });
    doc.fontSize(16).fillColor("#000000").text(data.clientName);
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#666666").text(`Vendedor: ${data.salesPersonName}`);
    doc.fontSize(10).fillColor("#666666").text(`Data: ${new Date().toLocaleDateString("pt-BR")}`);
    doc.moveDown(2);

    // Products Section
    doc.fontSize(14).fillColor(kenloPink).text("Produtos Selecionados");
    doc.moveDown(0.5);
    
    if (data.productType === "imob" || data.productType === "both") {
      doc.fontSize(12).fillColor("#000000").text(`• Kenlo Imob - Plano ${data.imobPlan?.toUpperCase()}`);
      if (data.imobUsers) {
        doc.fontSize(10).fillColor("#666666").text(`  ${data.imobUsers} usuários`);
      }
    }
    
    if (data.productType === "loc" || data.productType === "both") {
      doc.fontSize(12).fillColor("#000000").text(`• Kenlo Locação - Plano ${data.locPlan?.toUpperCase()}`);
      if (data.contracts) {
        doc.fontSize(10).fillColor("#666666").text(`  ${data.contracts} contratos sob gestão`);
      }
    }
    doc.moveDown(1.5);

    // Add-ons Section
    const addons = JSON.parse(data.selectedAddons);
    if (addons.length > 0) {
      doc.fontSize(14).fillColor(kenloPink).text("Add-ons Incluídos");
      doc.moveDown(0.5);
      addons.forEach((addon: string) => {
        const addonNames: Record<string, string> = {
          leads: "Kenlo Leads",
          inteligencia: "Kenlo Inteligência",
          assinatura: "Kenlo Assinatura",
          pay: "Kenlo Pay",
          seguros: "Kenlo Seguros",
          cash: "Kenlo Cash",
        };
        doc.fontSize(12).fillColor("#000000").text(`• ${addonNames[addon] || addon}`);
      });
      doc.moveDown(1.5);
    }

    // Pricing Section
    doc.fontSize(14).fillColor(kenloPink).text("Investimento");
    doc.moveDown(0.5);

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    const paymentPlanLabels: Record<string, string> = {
      monthly: "Mensal",
      semestral: "Semestral (-15%)",
      annual: "Anual (-20%)",
      biennial: "Bienal (-25%)",
    };

    doc.fontSize(12).fillColor("#000000").text(`Plano de Pagamento: ${paymentPlanLabels[data.paymentPlan] || data.paymentPlan}`);
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#000000").text(`Mensalidade: ${formatCurrency(data.totalMonthly)}`);
    doc.fontSize(12).fillColor("#000000").text(`Total Anual: ${formatCurrency(data.totalAnnual)}`);
    doc.fontSize(12).fillColor("#000000").text(`Implantação (única vez): ${formatCurrency(data.implantationFee)}`);
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor(kenloGreen).text(`Total 1º Ano: ${formatCurrency(data.firstYearTotal)}`);
    doc.moveDown(1.5);

    // Post-paid costs
    if (data.postPaidTotal && data.postPaidTotal > 0) {
      doc.fontSize(14).fillColor(kenloPink).text("Custos Pós-pago (Variáveis)");
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor("#000000").text(`Total Pós-pago: ${formatCurrency(data.postPaidTotal)}`);
      doc.moveDown(1.5);
    }

    // The Kenlo Effect
    if (data.netGain !== undefined) {
      doc.fontSize(14).fillColor(kenloGreen).text("The Kenlo Effect");
      doc.moveDown(0.5);
      if (data.revenueFromBoletos) {
        doc.fontSize(12).fillColor("#000000").text(`Receita Boletos & Split: ${formatCurrency(data.revenueFromBoletos)}/mês`);
      }
      if (data.revenueFromInsurance) {
        doc.fontSize(12).fillColor("#000000").text(`Receita Seguros: ${formatCurrency(data.revenueFromInsurance)}/mês`);
      }
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor(kenloGreen).text(`Ganho Líquido: ${formatCurrency(data.netGain)}/mês`);
      doc.fontSize(10).fillColor("#666666").text("Kenlo, a única plataforma que te paga enquanto você usa.");
    }

    // Footer
    doc.moveDown(3);
    doc.fontSize(8).fillColor("#999999").text(
      "Esta proposta é válida por 30 dias. Entre em contato para mais informações.",
      { align: "center" }
    );

    doc.end();
  });
}
