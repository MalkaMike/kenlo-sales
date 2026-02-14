/**
 * PDF Features Page V2 - Product-Specific Feature Comparison
 * 
 * Displays IMOB and Locação features separately with checkmarks
 * for each plan (Prime, K, K²). This replaces the generic features page.
 */

import PDFDocument from "pdfkit";
import { type DerivedData } from "./pdfTypes";

const COLORS = {
  primary: "#DC143C",
  secondary: "#4B0082",
  success: "#228B22",
  border: "#C8C8C8",
  headerBg: "#F5F5F5",
  textDark: "#141313",
  textMuted: "#646464",
};

const IMOB_FEATURES = [
  { name: "CRM Completo", prime: true, k: true, k2: true },
  { name: "Site Personalizado", prime: true, k: true, k2: true },
  { name: "App Mobile", prime: false, k: true, k2: true },
  { name: "Leads Automáticos", prime: false, k: false, k2: true },
  { name: "Inteligência de Dados", prime: false, k: false, k2: true },
  { name: "Omnichannel (WhatsApp)", prime: false, k: false, k2: true },
  { name: "Assinatura Digital", prime: true, k: true, k2: true },
  { name: "Comunidade Kenlo", prime: true, k: true, k2: true },
  { name: "Suporte Dedicado", prime: false, k: false, k2: true },
  { name: "CS Dedicado", prime: false, k: false, k2: true },
];

const LOCACAO_FEATURES = [
  { name: "Gestão de Contratos", prime: true, k: true, k2: true },
  { name: "Portal do Inquilino", prime: true, k: true, k2: true },
  { name: "Boleto Automático", prime: true, k: true, k2: true },
  { name: "Split de Pagamento", prime: false, k: true, k2: true },
  { name: "Kenlo Pay (Automático)", prime: false, k: true, k2: true },
  { name: "Conciliação Financeira", prime: false, k: true, k2: true },
  { name: "Assinatura Digital", prime: true, k: true, k2: true },
  { name: "Inteligência de Dados", prime: false, k: false, k2: true },
  { name: "Suporte Dedicado", prime: false, k: false, k2: true },
  { name: "CS Dedicado", prime: false, k: false, k2: true },
];

function renderCheckmark(doc: any, x: number, y: number, included: boolean) {
  if (included) {
    doc.fontSize(16).fillColor(COLORS.success).text("✓", x, y, { width: 30, align: "center" });
  } else {
    doc.fontSize(14).fillColor(COLORS.textMuted).text("—", x, y, { width: 30, align: "center" });
  }
}

function renderFeatureRow(
  doc: any,
  y: number,
  featureName: string,
  prime: boolean,
  k: boolean,
  k2: boolean,
  rowIndex: number
) {
  const rowHeight = 30;
  const bgColor = rowIndex % 2 === 0 ? "#FFFFFF" : "#F8F8F8";

  // Background
  doc.rect(50, y, 500, rowHeight).fill(bgColor);

  // Feature name
  doc.fontSize(11).fillColor(COLORS.textDark).text(featureName, 60, y + 8, { width: 200 });

  // Checkmarks for each plan
  renderCheckmark(doc, 270, y + 6, prime);
  renderCheckmark(doc, 330, y + 6, k);
  renderCheckmark(doc, 390, y + 6, k2);

  // Border
  doc.strokeColor(COLORS.border).lineWidth(0.5).rect(50, y, 500, rowHeight).stroke();
}

export function renderFeaturesPageV2(doc: any, data: DerivedData): void {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;

  // PAGE BREAK & HEADER
  doc.addPage();

  // Title
  doc.fontSize(24).fillColor(COLORS.primary).font("Helvetica-Bold").text("Comparação de Recursos", margin, 40);

  // Subtitle
  doc.fontSize(12).fillColor(COLORS.textMuted).font("Helvetica").text("Veja quais funcionalidades estão incluídas em cada plano", margin, 70);

  let currentY = 110;

  // IMOB FEATURES SECTION (if applicable)
  if (data.showImob) {
    // Section header
    doc.fontSize(16).fillColor(COLORS.primary).font("Helvetica-Bold").text("📊 Kenlo IMOB", margin, currentY);
    currentY += 30;

    // Table header
    const headerY = currentY;
    doc.rect(50, headerY, 500, 30).fill(COLORS.headerBg);
    doc.fontSize(11).fillColor(COLORS.textDark).font("Helvetica-Bold");
    doc.text("Funcionalidade", 60, headerY + 8, { width: 200 });
    doc.text("Prime", 270, headerY + 8, { width: 50, align: "center" });
    doc.text("K", 330, headerY + 8, { width: 50, align: "center" });
    doc.text("K²", 390, headerY + 8, { width: 50, align: "center" });

    currentY += 35;

    // Feature rows
    IMOB_FEATURES.forEach((feature, index) => {
      renderFeatureRow(doc, currentY, feature.name, feature.prime, feature.k, feature.k2, index);
      currentY += 30;
    });

    currentY += 20;
  }

  // PAGE BREAK if needed
  if (currentY > pageHeight - 150) {
    doc.addPage();
    currentY = 50;
  }

  // LOCAÇÃO FEATURES SECTION (if applicable)
  if (data.showLoc) {
    // Section header
    doc.fontSize(16).fillColor(COLORS.primary).font("Helvetica-Bold").text("🏢 Kenlo Locação", margin, currentY);
    currentY += 30;

    // Table header
    const headerY = currentY;
    doc.rect(50, headerY, 500, 30).fill(COLORS.headerBg);
    doc.fontSize(11).fillColor(COLORS.textDark).font("Helvetica-Bold");
    doc.text("Funcionalidade", 60, headerY + 8, { width: 200 });
    doc.text("Prime", 270, headerY + 8, { width: 50, align: "center" });
    doc.text("K", 330, headerY + 8, { width: 50, align: "center" });
    doc.text("K²", 390, headerY + 8, { width: 50, align: "center" });

    currentY += 35;

    // Feature rows
    LOCACAO_FEATURES.forEach((feature, index) => {
      renderFeatureRow(doc, currentY, feature.name, feature.prime, feature.k, feature.k2, index);
      currentY += 30;
    });

    currentY += 20;
  }

  // PAGE BREAK if needed
  if (currentY > pageHeight - 100) {
    doc.addPage();
    currentY = 50;
  }

  // LEGEND / EXPLANATION
  doc.fontSize(10).fillColor(COLORS.textMuted).font("Helvetica");
  doc.text("✓ = Incluído no plano", margin, currentY);
  doc.text("— = Não incluído (disponível como add-on)", margin, currentY + 15);

  currentY += 40;

  // ADD-ONS SECTION
  doc.fontSize(14).fillColor(COLORS.primary).font("Helvetica-Bold").text("Add-ons Disponíveis", margin, currentY);
  currentY += 20;

  const addonsText = `
Além dos recursos incluídos em cada plano, você pode adicionar:

📌 Para IMOB:
  • Leads: Geração automática de leads qualificados
  • Inteligência: Analytics e BI com Google Looker
  • Assinatura: Assinatura digital integrada

📌 Para Locação:
  • Pay: Automação de pagamentos e split financeiro
  • Assinatura: Assinatura digital integrada
  • Inteligência: Analytics e BI com Google Looker

📌 Para Ambos:
  • Omnichannel: WhatsApp integrado ao CRM
  • Seguros: Seguros embutidos (Locação)
  • Cash: Antecipação de aluguel (Locação)
  `;

  doc.fontSize(10).fillColor(COLORS.textDark).font("Helvetica").text(addonsText, margin, currentY, {
    width: pageWidth - 2 * margin,
    align: "left",
  });
}
