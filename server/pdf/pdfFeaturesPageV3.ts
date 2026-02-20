/**
 * PDF Features Page V3 - Apple-Style Feature Matrix
 * 
 * DESIGN PRINCIPLES:
 * - Show ONLY selected plan(s), never all plans
 * - Two-column table: | Funcionalidade | Plano Selecionado |
 * - Side-by-side layout for 2 products (4 columns total)
 * - Apple-style: minimal, clean, light background, soft shadows, generous white space
 * - Visual indicators: ✅ green (included), ❌ gray (not available), ➕ blue (add-on)
 * - Category sections with tinted background strips
 */

import PDFDocument from "pdfkit";
import { type DerivedData, type ProposalData } from "./pdfTypes";

const COLORS = {
  primary: "#E91E63",      // Kenlo pink
  success: "#10B981",      // Green for checkmarks
  unavailable: "#D1D5DB",  // Light gray for unavailable
  addon: "#3B82F6",        // Blue for add-ons
  textDark: "#1F2937",     // Dark text
  textMuted: "#6B7280",    // Muted text
  categoryBg: "#F9FAFB",   // Category background
  border: "#E5E7EB",       // Subtle border
  white: "#FFFFFF",
};

// Feature matrices from kenlo-referencia-completa-produtos.txt
const IMOB_FEATURES = [
  // 🎯 CRM Core & Pipeline de Vendas
  { category: "🎯 CRM Core & Pipeline de Vendas", name: "Gestão completa de leads", prime: true, k: true, k2: true },
  { category: "🎯 CRM Core & Pipeline de Vendas", name: "Funil de vendas visual", prime: true, k: true, k2: true },
  { category: "🎯 CRM Core & Pipeline de Vendas", name: "Gestão de propostas e negociações", prime: true, k: true, k2: true },
  { category: "🎯 CRM Core & Pipeline de Vendas", name: "Gestão de contratos", prime: true, k: true, k2: true },
  { category: "🎯 CRM Core & Pipeline de Vendas", name: "Cadastro ilimitado de imóveis", prime: true, k: true, k2: true },
  { category: "🎯 CRM Core & Pipeline de Vendas", name: "Cadastro de proprietários e clientes", prime: true, k: true, k2: true },
  { category: "🎯 CRM Core & Pipeline de Vendas", name: "Agenda de atendimentos e visitas", prime: true, k: true, k2: true },
  
  // 🌐 Site & Captação Digital
  { category: "🌐 Site & Captação Digital", name: "Site personalizável (CMS)", prime: true, k: true, k2: true },
  { category: "🌐 Site & Captação Digital", name: "SEO otimizado", prime: true, k: true, k2: true },
  { category: "🌐 Site & Captação Digital", name: "Responsivo (mobile-first)", prime: true, k: true, k2: true },
  { category: "🌐 Site & Captação Digital", name: "Formulários de captação", prime: true, k: true, k2: true },
  { category: "🌐 Site & Captação Digital", name: "Landing pages de conversão", prime: false, k: true, k2: true },
  { category: "🌐 Site & Captação Digital", name: "Blog integrado", prime: false, k: true, k2: true },
  
  // 🔗 Integrações & Automação
  { category: "🔗 Integrações & Automação", name: "Integração com 100+ portais", prime: true, k: true, k2: true },
  { category: "🔗 Integrações & Automação", name: "Sincronização automática de anúncios", prime: true, k: true, k2: true },
  { category: "🔗 Integrações & Automação", name: "Integração com redes sociais", prime: true, k: true, k2: true },
  { category: "🔗 Integrações & Automação", name: "Disparo automático de e-mails", prime: true, k: true, k2: true },
  { category: "🔗 Integrações & Automação", name: "Acesso ao Kenlo Open (Parceiros Homologados)", prime: true, k: true, k2: true },
  { category: "🔗 Integrações & Automação", name: "Acesso à Comunidade Kenlo", prime: true, k: true, k2: true },
  { category: "🔗 Integrações & Automação", name: "API aberta para integrações customizadas", prime: false, k: false, k2: true },
  
  // 📱 Mobile & Trabalho em Campo
  { category: "📱 Mobile & Trabalho em Campo", name: "App Corretor (iOS + Android)", prime: true, k: true, k2: true },
  { category: "📱 Mobile & Trabalho em Campo", name: "Pré-cadastro de imóveis via app", prime: true, k: true, k2: true },
  { category: "📱 Mobile & Trabalho em Campo", name: "Busca e filtros avançados no app", prime: true, k: true, k2: true },
  { category: "📱 Mobile & Trabalho em Campo", name: "Roteiro de visitas otimizado", prime: true, k: true, k2: true },
  { category: "📱 Mobile & Trabalho em Campo", name: "Notificações push em tempo real", prime: true, k: true, k2: true },
  
  // 📊 Relatórios & Inteligência
  { category: "📊 Relatórios & Inteligência", name: "Dashboard executivo", prime: true, k: true, k2: true },
  { category: "📊 Relatórios & Inteligência", name: "Relatórios de vendas e pipeline", prime: true, k: true, k2: true },
  { category: "📊 Relatórios & Inteligência", name: "Relatórios de performance por corretor", prime: true, k: true, k2: true },
  { category: "📊 Relatórios & Inteligência", name: "Extração e configuração de relatórios", prime: true, k: true, k2: true },
  
  // 💬 Comunicação & Atendimento
  { category: "💬 Comunicação & Atendimento", name: "Caixa de e-mail por usuário", prime: true, k: true, k2: true },
  { category: "💬 Comunicação & Atendimento", name: "E-mail integrado ao CRM", prime: true, k: true, k2: true },
  { category: "💬 Comunicação & Atendimento", name: "Histórico completo de interações", prime: true, k: true, k2: true },
  { category: "💬 Comunicação & Atendimento", name: "Templates de mensagens", prime: true, k: true, k2: true },
  
  // 🎓 Suporte & Treinamento
  { category: "🎓 Suporte & Treinamento", name: "Suporte padrão", prime: true, k: true, k2: true },
  { category: "🎓 Suporte & Treinamento", name: "Suporte VIP (resposta 15min)", prime: false, k: true, k2: true },
  { category: "🎓 Suporte & Treinamento", name: "Customer Success dedicado", prime: false, k: false, k2: true },
  { category: "🎓 Suporte & Treinamento", name: "Treinamento Online", prime: false, k: false, k2: true, note: "1 sessão" },
  { category: "🎓 Suporte & Treinamento", name: "Treinamento Presencial", prime: false, k: false, k2: true, note: "1 sessão" },
  
  // 👥 Usuários & Escalabilidade
  { category: "👥 Usuários & Escalabilidade", name: "Usuários incluídos", prime: "2", k: "7", k2: "15" },
  { category: "👥 Usuários & Escalabilidade", name: "Armazenamento", prime: "Ilimitado", k: "Ilimitado", k2: "Ilimitado" },
  
  // 🚀 Add-ons Disponíveis
  { category: "🚀 Add-ons Disponíveis", name: "Kenlo Leads", prime: "addon", k: "addon", k2: "addon" },
  { category: "🚀 Add-ons Disponíveis", name: "Kenlo Inteligência", prime: "addon", k: "addon", k2: "addon" },
  { category: "🚀 Add-ons Disponíveis", name: "Kenlo Assinaturas", prime: "addon", k: "addon", k2: "addon" },
  { category: "🚀 Add-ons Disponíveis", name: "Kenlo Omnichannel", prime: "addon", k: "addon", k2: "addon" },
];

const LOCACAO_FEATURES = [
  // 📋 Gestão de Contratos
  { category: "📋 Gestão de Contratos", name: "Controle completo de contratos", prime: true, k: true, k2: true },
  { category: "📋 Gestão de Contratos", name: "Gestão de proprietários e inquilinos", prime: true, k: true, k2: true },
  { category: "📋 Gestão de Contratos", name: "Cobrança automática", prime: true, k: true, k2: true },
  { category: "📋 Gestão de Contratos", name: "Repasse automático", prime: true, k: true, k2: true },
  { category: "📋 Gestão de Contratos", name: "DIMOB automático", prime: true, k: true, k2: true },
  
  // 💰 Financeiro & Cobrança
  { category: "💰 Financeiro & Cobrança", name: "Gestão de receitas e despesas", prime: true, k: true, k2: true },
  { category: "💰 Financeiro & Cobrança", name: "Conciliação bancária", prime: true, k: true, k2: true },
  { category: "💰 Financeiro & Cobrança", name: "Emissão de boletos", prime: true, k: true, k2: true },
  { category: "💰 Financeiro & Cobrança", name: "Controle de inadimplência", prime: true, k: true, k2: true },
  
  // 📊 Relatórios & Inteligência
  { category: "📊 Relatórios & Inteligência", name: "Dashboard executivo", prime: true, k: true, k2: true },
  { category: "📊 Relatórios & Inteligência", name: "Relatórios financeiros", prime: true, k: true, k2: true },
  { category: "📊 Relatórios & Inteligência", name: "Relatórios de contratos", prime: true, k: true, k2: true },
  { category: "📊 Relatórios & Inteligência", name: "Extração e configuração de relatórios", prime: true, k: true, k2: true },
  
  // 🎓 Suporte & Treinamento
  { category: "🎓 Suporte & Treinamento", name: "Suporte padrão", prime: true, k: true, k2: true },
  { category: "🎓 Suporte & Treinamento", name: "Suporte VIP (resposta 15min)", prime: false, k: true, k2: true },
  { category: "🎓 Suporte & Treinamento", name: "Customer Success dedicado", prime: false, k: false, k2: true },
  { category: "🎓 Suporte & Treinamento", name: "Treinamento Online", prime: false, k: false, k2: true, note: "1 sessão" },
  { category: "🎓 Suporte & Treinamento", name: "Treinamento Presencial", prime: false, k: false, k2: true, note: "1 sessão" },
  
  // 📦 Capacidade & Escalabilidade
  { category: "📦 Capacidade & Escalabilidade", name: "Contratos incluídos", prime: "100", k: "175", k2: "400" },
  { category: "📦 Capacidade & Escalabilidade", name: "Armazenamento", prime: "Ilimitado", k: "Ilimitado", k2: "Ilimitado" },
  
  // 🚀 Add-ons Disponíveis
  { category: "🚀 Add-ons Disponíveis", name: "Kenlo Inteligência", prime: "addon", k: "addon", k2: "addon" },
  { category: "🚀 Add-ons Disponíveis", name: "Kenlo Assinaturas", prime: "addon", k: "addon", k2: "addon" },
  { category: "🚀 Add-ons Disponíveis", name: "Kenlo Pay", prime: "addon", k: "addon", k2: "addon" },
  { category: "🚀 Add-ons Disponíveis", name: "Kenlo Seguros", prime: "addon", k: "addon", k2: "addon" },
  { category: "🚀 Add-ons Disponíveis", name: "Kenlo Cash", prime: "addon", k: "addon", k2: "addon" },
];

function getPlanKey(plan: string): "prime" | "k" | "k2" {
  const normalized = plan.toLowerCase().trim();
  if (normalized === "prime") return "prime";
  if (normalized === "k2" || normalized === "k²") return "k2";
  if (normalized === "k") return "k";
  // Default fallback
  return "prime";
}

function renderFeatureIcon(doc: any, x: number, y: number, value: any) {
  const iconSize = 12;
  const iconY = y + 3;
  
  if (value === true) {
    // ✅ Green checkmark
    doc.fontSize(iconSize).fillColor(COLORS.success).text("✓", x, iconY);
  } else if (value === false) {
    // ❌ Gray cross
    doc.fontSize(iconSize).fillColor(COLORS.unavailable).text("✗", x, iconY);
  } else if (value === "addon") {
    // ➕ Blue add-on indicator
    doc.fontSize(9).fillColor(COLORS.addon).text("+ Add-on", x, iconY + 1);
  } else {
    // Numeric value (e.g., "2 usuários", "100 contratos")
    doc.fontSize(10).fillColor(COLORS.textDark).font("Helvetica-Bold").text(value, x, iconY);
  }
}

function renderSingleProductTable(
  doc: any,
  productName: string,
  planName: string,
  features: any[],
  startX: number,
  startY: number,
  tableWidth: number
): number {
  const colWidths = {
    feature: tableWidth * 0.65,
    plan: tableWidth * 0.35,
  };
  
  const rowHeight = 28;
  const categoryHeight = 32;
  let currentY = startY;
  
  const planKey = getPlanKey(planName);
  
  // Product header
  doc.fontSize(18).fillColor(COLORS.primary).font("Helvetica-Bold")
    .text(productName, startX, currentY);
  currentY += 25;
  
  // Plan name
  doc.fontSize(13).fillColor(COLORS.textMuted).font("Helvetica")
    .text(`Plano ${planName}`, startX, currentY);
  currentY += 30;
  
  // Table header
  doc.roundedRect(startX, currentY, tableWidth, 35, 8).fillAndStroke(COLORS.categoryBg, COLORS.border);
  doc.fontSize(11).fillColor(COLORS.textDark).font("Helvetica-Bold");
  doc.text("Funcionalidade", startX + 15, currentY + 11, { width: colWidths.feature - 20 });
  doc.text(planName, startX + colWidths.feature + 10, currentY + 11, { width: colWidths.plan - 20, align: "center" });
  currentY += 40;
  
  // Group features by category
  const categories = Array.from(new Set(features.map(f => f.category)));
  
  categories.forEach((category, catIndex) => {
    // Category header
    if (catIndex > 0) currentY += 10; // Spacing between categories
    
    doc.roundedRect(startX, currentY, tableWidth, categoryHeight, 6)
      .fillAndStroke(COLORS.categoryBg, COLORS.border);
    doc.fontSize(11).fillColor(COLORS.textDark).font("Helvetica-Bold")
      .text(category, startX + 15, currentY + 9, { width: tableWidth - 30 });
    currentY += categoryHeight + 5;
    
    // Features in this category
    const categoryFeatures = features.filter(f => f.category === category);
    categoryFeatures.forEach((feature, idx) => {
      const bgColor = idx % 2 === 0 ? COLORS.white : "#FAFAFA";
      
      // Row background
      doc.roundedRect(startX, currentY, tableWidth, rowHeight, 4)
        .fillAndStroke(bgColor, COLORS.border);
      
      // Feature name
      const featureValue = feature[planKey];
      const textColor = featureValue === false ? COLORS.textMuted : COLORS.textDark;
      doc.fontSize(10).fillColor(textColor).font("Helvetica")
        .text(feature.name, startX + 15, currentY + 8, { width: colWidths.feature - 20 });
      
      // Feature icon/value
      renderFeatureIcon(doc, startX + colWidths.feature + 10, currentY + 8, featureValue);
      
      currentY += rowHeight + 2;
    });
  });
  
  // Legend
  currentY += 15;
  doc.fontSize(9).fillColor(COLORS.textMuted).font("Helvetica");
  doc.text("✓ Incluído no plano", startX, currentY);
  doc.text("✗ Não disponível", startX + 120, currentY);
  doc.text("+ Add-on disponível", startX + 240, currentY);
  
  return currentY + 25;
}

export function renderFeaturesPageV3(doc: any, proposalData: ProposalData, data: DerivedData): void {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 40;
  const usableWidth = pageWidth - 2 * margin;
  
  // Add new page
  doc.addPage();
  
  // Page title
  doc.fontSize(24).fillColor(COLORS.primary).font("Helvetica-Bold")
    .text("Funcionalidades da Plataforma", margin, margin);
  
  doc.fontSize(12).fillColor(COLORS.textMuted).font("Helvetica")
    .text("Recursos incluídos no(s) plano(s) selecionado(s)", margin, margin + 30);
  
  let currentY = margin + 70;
  
  // Determine layout: 1 product or 2 products side-by-side
  const showImob = data.showImob;
  const showLoc = data.showLoc;
  
  if (showImob && showLoc) {
    // SIDE-BY-SIDE LAYOUT (2 products)
    const tableWidth = (usableWidth - 20) / 2; // 20px gap between tables
    const leftX = margin;
    const rightX = margin + tableWidth + 20;
    
    // Render IMOB on left
    const imobPlan = proposalData.imobPlan || "Prime";
    renderSingleProductTable(doc, "KENLO IMOB", imobPlan, IMOB_FEATURES, leftX, currentY, tableWidth);
    
    // Render LOCAÇÃO on right (same Y position)
    const locPlan = proposalData.locPlan || "Prime";
    renderSingleProductTable(doc, "KENLO LOCAÇÃO", locPlan, LOCACAO_FEATURES, rightX, currentY, tableWidth);
    
  } else if (showImob) {
    // SINGLE PRODUCT: IMOB only
    const imobPlan = proposalData.imobPlan || "Prime";
    currentY = renderSingleProductTable(doc, "KENLO IMOB", imobPlan, IMOB_FEATURES, margin, currentY, usableWidth);
    
  } else if (showLoc) {
    // SINGLE PRODUCT: LOCAÇÃO only
    const locPlan = proposalData.locPlan || "Prime";
    currentY = renderSingleProductTable(doc, "KENLO LOCAÇÃO", locPlan, LOCACAO_FEATURES, margin, currentY, usableWidth);
  }
}
