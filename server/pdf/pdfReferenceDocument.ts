/**
 * Kenlo Pricing Bible — PDF Generator (jsPDF version)
 *
 * Generates a comprehensive PDF containing ALL pricing logic, business rules,
 * features, Kombos, and operational guidelines.
 *
 * Source of truth: shared/pricing-values.json (loaded at generation time)
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import pricingValues from "../../shared/pricing-values.json";
import { KENLO_LOGO_WHITE_BASE64 } from "../../shared/kenloLogos";
import {
  roundToSeven,
  FREQUENCY_MULTIPLIERS,
  PREPAID_DISCOUNT_PERCENTAGE,
  PREPAID_DISCOUNT_MULTIPLIER,
} from "../../shared/pricing-config";

// ============================================================================
// COLORS & CONSTANTS
// ============================================================================
const KENLO_PINK: [number, number, number] = [248, 46, 82];
const KENLO_GREEN: [number, number, number] = [74, 189, 141];
const DARK_TEXT: [number, number, number] = [26, 26, 46];
const MEDIUM_TEXT: [number, number, number] = [74, 74, 106];
const LIGHT_TEXT: [number, number, number] = [107, 114, 128];
const WHITE: [number, number, number] = [255, 255, 255];
const HEADER_BG: [number, number, number] = [248, 249, 250];
const HIGHLIGHT_BG: [number, number, number] = [254, 242, 242];

const PAGE_MARGIN = 20;
const CONTENT_WIDTH = 170; // A4 width (210) - 2 * margin
const PAGE_HEIGHT = 297;
const PAGE_BOTTOM = 280;

function fmt(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ============================================================================
// HELPER: Ensure space, add page if needed
// ============================================================================
function ensureSpace(doc: jsPDF, needed: number): void {
  if (getY(doc) + needed > PAGE_BOTTOM) {
    doc.addPage();
    addFooter(doc);
    setY(doc, PAGE_MARGIN + 5);
  }
}

// Track Y position manually since jsPDF doesn't have a built-in cursor
let currentY = PAGE_MARGIN;
function getY(_doc: jsPDF): number { return currentY; }
function setY(_doc: jsPDF, y: number): void { currentY = y; }
function moveDown(_doc: jsPDF, lines: number = 1): void { currentY += lines * 5; }

function addFooter(doc: jsPDF) {
  const pageNum = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(7);
  doc.setTextColor(...LIGHT_TEXT);
  doc.setFont("helvetica", "normal");
  doc.text(`Kenlo Pricing Bible | Página ${pageNum}`, 105, 290, { align: "center" });
}

// ============================================================================
// SECTION HELPERS
// ============================================================================
function sectionTitle(doc: jsPDF, letter: string, title: string) {
  doc.addPage();
  addFooter(doc);
  setY(doc, PAGE_MARGIN + 5);

  const y = getY(doc);

  // Pink accent line
  doc.setDrawColor(...KENLO_PINK);
  doc.setLineWidth(0.7);
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y);

  // Letter badge (circle)
  const badgeY = y + 6;
  doc.setFillColor(...KENLO_PINK);
  doc.circle(PAGE_MARGIN + 5, badgeY, 4, "F");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.text(letter, PAGE_MARGIN + 5, badgeY + 1.5, { align: "center" });

  // Title text
  doc.setFontSize(13);
  doc.setTextColor(...DARK_TEXT);
  doc.setFont("helvetica", "bold");
  doc.text(title, PAGE_MARGIN + 13, badgeY + 2);

  setY(doc, badgeY + 8);
}

function subTitle(doc: jsPDF, text: string) {
  ensureSpace(doc, 12);
  moveDown(doc, 1);
  doc.setFontSize(10);
  doc.setTextColor(...KENLO_PINK);
  doc.setFont("helvetica", "bold");
  doc.text(text, PAGE_MARGIN, getY(doc));
  moveDown(doc, 1.5);
}

function bodyText(doc: jsPDF, text: string) {
  ensureSpace(doc, 8);
  doc.setFontSize(8);
  doc.setTextColor(...MEDIUM_TEXT);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  doc.text(lines, PAGE_MARGIN, getY(doc));
  setY(doc, getY(doc) + lines.length * 3.5 + 1);
}

function bulletPoint(doc: jsPDF, text: string, indent: number = 0) {
  ensureSpace(doc, 6);
  doc.setFontSize(8);
  doc.setTextColor(...MEDIUM_TEXT);
  doc.setFont("helvetica", "normal");
  const x = PAGE_MARGIN + 3 + indent;
  const lines = doc.splitTextToSize(`• ${text}`, CONTENT_WIDTH - 3 - indent);
  doc.text(lines, x, getY(doc));
  setY(doc, getY(doc) + lines.length * 3.5 + 0.5);
}

function importantNote(doc: jsPDF, text: string) {
  ensureSpace(doc, 14);
  const y = getY(doc);
  const noteLines = doc.splitTextToSize(text, CONTENT_WIDTH - 10);
  const boxHeight = Math.max(10, noteLines.length * 3.5 + 5);

  // Background
  doc.setFillColor(...HIGHLIGHT_BG);
  doc.roundedRect(PAGE_MARGIN, y - 2, CONTENT_WIDTH, boxHeight, 1.5, 1.5, "F");

  // Left accent bar
  doc.setFillColor(...KENLO_PINK);
  doc.rect(PAGE_MARGIN, y - 2, 1.2, boxHeight, "F");

  // Text
  doc.setFontSize(7.5);
  doc.setTextColor(...KENLO_PINK);
  doc.setFont("helvetica", "bold");
  doc.text(noteLines, PAGE_MARGIN + 5, y + 2);

  setY(doc, y + boxHeight + 2);
}

function simpleTable(
  doc: jsPDF,
  headers: string[],
  rows: string[][],
  colWidths?: number[]
) {
  ensureSpace(doc, 15);

  const startY = getY(doc);

  autoTable(doc, {
    startY,
    head: [headers],
    body: rows,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      textColor: DARK_TEXT,
      lineColor: [229, 231, 235],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: KENLO_PINK,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: HEADER_BG,
    },
    columnStyles: colWidths
      ? Object.fromEntries(colWidths.map((w, i) => [i, { cellWidth: w }]))
      : undefined,
    didDrawPage: () => {
      addFooter(doc);
    },
  });

  // Update Y position after table
  const finalY = (doc as any).lastAutoTable?.finalY || startY + 20;
  setY(doc, finalY + 3);
}

// ============================================================================
// COVER PAGE
// ============================================================================
function renderCover(doc: jsPDF) {
  // Pink header block
  doc.setFillColor(...KENLO_PINK);
  doc.rect(0, 0, 210, 80, "F");

  // Kenlo logo (white on pink background)
  try {
    doc.addImage(KENLO_LOGO_WHITE_BASE64, "PNG", PAGE_MARGIN, 14, 50, 14.4);
  } catch {
    // Fallback to text if image fails
    doc.setFontSize(30);
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.text("KENLO", PAGE_MARGIN, 28);
  }

  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.text("Pricing Bible", PAGE_MARGIN, 40);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Documento de Referência Completa de Produtos", PAGE_MARGIN, 52);

  doc.setFontSize(8);
  doc.text(
    "Fonte Única de Verdade — Todas as Regras de Negócio, Preços e Features",
    PAGE_MARGIN, 60
  );

  doc.setFontSize(7);
  doc.text(
    `Versão: 3.1.0 | Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    PAGE_MARGIN, 72
  );

  // Table of contents
  doc.setFontSize(12);
  doc.setTextColor(...DARK_TEXT);
  doc.setFont("helvetica", "bold");
  doc.text("Índice", PAGE_MARGIN, 95);

  const sections = [
    { letter: "A", title: "Ciclo de Pagamento (Fundação)" },
    { letter: "B", title: "Planos Base — Preço Anual de Fundação" },
    { letter: "C", title: "Add-ons — Preços Base e Escopo" },
    { letter: "D", title: "Serviços Premium" },
    { letter: "E", title: "Kombos — Descontos Promocionais" },
    { letter: "F", title: "Custos Variáveis Pós-Pago (Faixas de Uso)" },
    { letter: "G", title: "Matriz de Funcionalidades" },
    { letter: "H", title: "Pré-Pagamento" },
    { letter: "I", title: "Regras de Arredondamento" },
    { letter: "J", title: "Regras de Negócio Gerais" },
  ];

  let tocY = 105;
  sections.forEach((s) => {
    // Letter badge
    doc.setFillColor(...KENLO_PINK);
    doc.circle(PAGE_MARGIN + 3, tocY - 1, 3, "F");
    doc.setFontSize(6);
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.text(s.letter, PAGE_MARGIN + 3, tocY, { align: "center" });

    // Title
    doc.setFontSize(9);
    doc.setTextColor(...MEDIUM_TEXT);
    doc.setFont("helvetica", "normal");
    doc.text(s.title, PAGE_MARGIN + 10, tocY);
    tocY += 8;
  });

  addFooter(doc);
}

// ============================================================================
// SECTION A: Payment Cycles
// ============================================================================
function renderSectionA(doc: jsPDF) {
  sectionTitle(doc, "A", "Ciclo de Pagamento (Fundação)");

  bodyText(doc, "O preço ANUAL é a referência (0%). Todos os outros ciclos são derivados dele com multiplicadores fixos.");

  importantNote(doc, "REGRA: O arredondamento para terminar em 7 aplica-se SOMENTE a licenças de produtos e add-ons >= R$100. NÃO se aplica a pós-pago, pré-pago, taxas de implementação nem comissões.");

  const cycles = pricingValues.paymentCycles;
  simpleTable(doc,
    ["Ciclo", "Tipo", "Fórmula", "Multiplicador", "Label"],
    [
      ["Mensal", cycles.monthly.type, cycles.monthly.formula, cycles.monthly.multiplier.toString(), cycles.monthly.displayLabel],
      ["Semestral", cycles.semiannual.type, cycles.semiannual.formula, cycles.semiannual.multiplier.toString(), cycles.semiannual.displayLabel],
      ["Anual", cycles.annual.type, cycles.annual.formula, cycles.annual.multiplier.toString(), cycles.annual.displayLabel],
      ["Bienal", cycles.biennial.type, cycles.biennial.formula, cycles.biennial.multiplier.toString(), cycles.biennial.displayLabel],
    ]
  );

  bodyText(doc, `Regra: ${cycles._rule || "Anual é a referência (0%). Mensal = +25%, Semestral = +12.5%, Bienal = -12.5%"}`);

  // Calculation example
  moveDown(doc, 1);
  subTitle(doc, "Exemplo Prático");
  const exAnnual = pricingValues.basePlans.imob.k.annualPrice;
  bodyText(doc, `Produto: IMOB K (Preço Anual Base: ${fmt(exAnnual)})`);
  simpleTable(doc,
    ["Ciclo", "Cálculo", "Resultado Bruto", "Arredondado (p/ 7)"],
    [
      ["Mensal", `${fmt(exAnnual)} x ${FREQUENCY_MULTIPLIERS.monthly}`, fmt(exAnnual * FREQUENCY_MULTIPLIERS.monthly), fmt(roundToSeven(exAnnual * FREQUENCY_MULTIPLIERS.monthly))],
      ["Semestral", `${fmt(exAnnual)} x ${FREQUENCY_MULTIPLIERS.semiannual}`, fmt(exAnnual * FREQUENCY_MULTIPLIERS.semiannual), fmt(roundToSeven(exAnnual * FREQUENCY_MULTIPLIERS.semiannual))],
      ["Anual", `${fmt(exAnnual)} x 1.0`, fmt(exAnnual), fmt(roundToSeven(exAnnual))],
      ["Bienal", `${fmt(exAnnual)} x ${FREQUENCY_MULTIPLIERS.biennial}`, fmt(exAnnual * FREQUENCY_MULTIPLIERS.biennial), fmt(roundToSeven(exAnnual * FREQUENCY_MULTIPLIERS.biennial))],
    ]
  );
}

// ============================================================================
// SECTION B: Base Plans
// ============================================================================
function renderSectionB(doc: jsPDF) {
  sectionTitle(doc, "B", "Planos Base — Preço Anual de Fundação");

  bodyText(doc, "Cada produto (IMOB e Locação) tem 3 planos: Prime, K e K2. O preço anual é a base para todos os cálculos.");

  // IMOB Plans
  subTitle(doc, "Kenlo IMOB");
  const imob = pricingValues.basePlans.imob;
  simpleTable(doc,
    ["Plano", "Preço Anual", "Mensal", "Semestral", "Bienal", "Usuários Inclusos"],
    ["prime", "k", "k2"].map(plan => {
      const p = (imob as any)[plan];
      const annual = p.annualPrice;
      return [
        plan.toUpperCase(),
        fmt(annual),
        fmt(roundToSeven(annual * FREQUENCY_MULTIPLIERS.monthly)),
        fmt(roundToSeven(annual * FREQUENCY_MULTIPLIERS.semiannual)),
        fmt(roundToSeven(annual * FREQUENCY_MULTIPLIERS.biennial)),
        `${p.includedUnits.quantity} ${p.includedUnits.type}`,
      ];
    })
  );

  // LOC Plans
  subTitle(doc, "Kenlo Locação");
  const loc = pricingValues.basePlans.locacao;
  simpleTable(doc,
    ["Plano", "Preço Anual", "Mensal", "Semestral", "Bienal", "Contratos Inclusos"],
    ["prime", "k", "k2"].map(plan => {
      const p = (loc as any)[plan];
      const annual = p.annualPrice;
      return [
        plan.toUpperCase(),
        fmt(annual),
        fmt(roundToSeven(annual * FREQUENCY_MULTIPLIERS.monthly)),
        fmt(roundToSeven(annual * FREQUENCY_MULTIPLIERS.semiannual)),
        fmt(roundToSeven(annual * FREQUENCY_MULTIPLIERS.biennial)),
        `${p.includedUnits.quantity} ${p.includedUnits.type}`,
      ];
    })
  );

  bodyText(doc, `Implantação base: ${fmt(pricingValues._legacyFields?.implantacaoBase || 1497)}`);

  // Calculation example
  moveDown(doc, 1);
  subTitle(doc, "Exemplo: Proposta IMOB K2 Semestral");
  const k2Annual = pricingValues.basePlans.imob.k2.annualPrice;
  const k2Semestral = roundToSeven(k2Annual * FREQUENCY_MULTIPLIERS.semiannual);
  bodyText(doc, `Preço anual: ${fmt(k2Annual)} --> Semestral: ${fmt(k2Annual)} x ${FREQUENCY_MULTIPLIERS.semiannual} = ${fmt(k2Annual * FREQUENCY_MULTIPLIERS.semiannual)} --> Arredondado: ${fmt(k2Semestral)}`);
  bodyText(doc, `Usuários inclusos: ${pricingValues.basePlans.imob.k2.includedUnits.quantity} ${pricingValues.basePlans.imob.k2.includedUnits.type}`);
}

// ============================================================================
// SECTION C: Add-ons
// ============================================================================
function renderSectionC(doc: jsPDF) {
  sectionTitle(doc, "C", "Add-ons — Preços Base e Escopo");

  bodyText(doc, "Add-ons são funcionalidades extras que se integram nativamente aos produtos Kenlo.");

  const addons = pricingValues.addons;
  const addonList = [
    { key: "inteligencia", name: "Inteligência" },
    { key: "leads", name: "Leads" },
    { key: "assinaturas", name: "Assinatura" },
    { key: "pay", name: "Pay" },
    { key: "seguros", name: "Seguros" },
    { key: "cash", name: "Cash" },
  ];

  simpleTable(doc,
    ["Add-on", "Disponível", "Preço Anual", "Mensal", "Implantação", "Compartilhável"],
    addonList.map(({ key, name }) => {
      const a = (addons as any)[key];
      const annual = a.annualPrice;
      const monthly = annual > 0 ? fmt(roundToSeven(annual * FREQUENCY_MULTIPLIERS.monthly)) : "N/A";
      return [
        name,
        a.availability.join(", "),
        annual > 0 ? fmt(annual) : "N/A",
        monthly,
        a.implementation > 0 ? fmt(a.implementation) : "Grátis",
        a.shareable ? "Sim" : "Não",
      ];
    })
  );

  moveDown(doc, 1);
  bulletPoint(doc, "Inteligência: BI de KPIs de performance e analytics avançado. IMOB e LOC.");
  bulletPoint(doc, "Leads: Gestão automatizada de leads com distribuição inteligente. APENAS IMOB.");
  bulletPoint(doc, "Assinatura: Assinatura digital embutida na plataforma. IMOB e LOC.");
  bulletPoint(doc, "Pay: Boleto e Split digital embutido. APENAS LOC.");
  bulletPoint(doc, "Seguros: Seguros embutido no boleto. APENAS LOC.");
  bulletPoint(doc, "Cash: Antecipação de até 24 meses de aluguel. APENAS LOC.");

  // Calculation example
  moveDown(doc, 1);
  subTitle(doc, "Exemplo: Add-on Inteligência (Mensal)");
  const intelAnnual = pricingValues.addons.inteligencia.annualPrice;
  const intelMonthly = roundToSeven(intelAnnual * FREQUENCY_MULTIPLIERS.monthly);
  bodyText(doc, `Preço anual: ${fmt(intelAnnual)} --> Mensal: ${fmt(intelAnnual)} x ${FREQUENCY_MULTIPLIERS.monthly} = ${fmt(intelAnnual * FREQUENCY_MULTIPLIERS.monthly)} --> Arredondado: ${fmt(intelMonthly)}`);
  bodyText(doc, `Implantação: ${pricingValues.addons.inteligencia.implementation > 0 ? fmt(pricingValues.addons.inteligencia.implementation) : "Grátis"}`);
}

// ============================================================================
// SECTION D: Premium Services
// ============================================================================
function renderSectionD(doc: jsPDF) {
  sectionTitle(doc, "D", "Serviços Premium");

  subTitle(doc, "Serviços Recorrentes");
  const recurring = pricingValues.premiumServices.recurring;
  simpleTable(doc,
    ["Serviço", "Preço/mês", "Prime", "K", "K2", "Herança"],
    [
      [
        "Suporte VIP",
        fmt(recurring.vipSupport.monthlyPrice),
        recurring.vipSupport.defaultByPlan.prime ? "Sim" : "Não",
        recurring.vipSupport.defaultByPlan.k ? "Sim" : "Não",
        recurring.vipSupport.defaultByPlan.k2 ? "Incluído" : "Não",
        recurring.vipSupport.inheritanceRule,
      ],
      [
        "CS Dedicado",
        fmt(recurring.csDedicado.monthlyPrice),
        recurring.csDedicado.defaultByPlan.prime ? "Sim" : "Não",
        recurring.csDedicado.defaultByPlan.k ? "Sim" : "Não",
        recurring.csDedicado.defaultByPlan.k2 ? "Incluído" : "Não",
        recurring.csDedicado.inheritanceRule,
      ],
    ]
  );

  subTitle(doc, "Serviços Não Recorrentes (Treinamento)");
  const nonRecurring = pricingValues.premiumServices.nonRecurring;
  simpleTable(doc,
    ["Serviço", "Preço/un.", "Prime", "K", "K2", "Duplicação"],
    [
      [
        "Treinamento Online",
        fmt(nonRecurring.treinamentoOnline.unitPrice),
        nonRecurring.treinamentoOnline.includedQuantityByPlan.prime.toString(),
        nonRecurring.treinamentoOnline.includedQuantityByPlan.k.toString(),
        nonRecurring.treinamentoOnline.includedQuantityByPlan.k2.toString(),
        nonRecurring.treinamentoOnline.duplicationRule,
      ],
      [
        "Treinamento Presencial",
        fmt(nonRecurring.treinamentoPresencial.unitPrice),
        nonRecurring.treinamentoPresencial.includedQuantityByPlan.prime.toString(),
        nonRecurring.treinamentoPresencial.includedQuantityByPlan.k.toString(),
        nonRecurring.treinamentoPresencial.includedQuantityByPlan.k2.toString(),
        nonRecurring.treinamentoPresencial.duplicationRule,
      ],
    ]
  );
}

// ============================================================================
// SECTION E: Kombos
// ============================================================================
function renderSectionE(doc: jsPDF) {
  sectionTitle(doc, "E", "Kombos — Descontos Promocionais");

  bodyText(doc, "Kombos são combinações de produtos + add-ons com descontos progressivos. O desconto é aplicado APÓS o cálculo do ciclo.");

  const kombos = pricingValues.kombos;
  const komboList = [
    { key: "imob_start", data: kombos.imob_start },
    { key: "imob_pro", data: kombos.imob_pro },
    { key: "locacao_pro", data: kombos.locacao_pro },
    { key: "core_gestao", data: kombos.core_gestao },
    { key: "elite", data: kombos.elite },
  ];

  simpleTable(doc,
    ["Kombo", "Desconto", "Produtos", "Add-ons", "Serv. Premium", "Impl. Grátis"],
    komboList.map(({ data }) => [
      data.name,
      `${data.discount}%`,
      data.productsIncluded.join(", "),
      data.addonsIncluded.length > 0 ? data.addonsIncluded.join(", ") : "—",
      data.premiumServicesIncluded.length > 0 ? "Incluído" : "Não",
      data.zeroedImplementationsList.length > 0 ? data.zeroedImplementationsList.join(", ") : "—",
    ])
  );

  importantNote(doc, `Implantação fixa para todos os Kombos: ${fmt(pricingValues._legacyFields?.implantacaoBase || 1497)}`);

  // Kombo details
  moveDown(doc, 1);
  komboList.forEach(({ data }) => {
    ensureSpace(doc, 25);
    subTitle(doc, data.name);
    bulletPoint(doc, `Composição: ${data.productsIncluded.concat(data.addonsIncluded).join(" + ")}`);
    bulletPoint(doc, `Desconto: ${data.discount}% OFF em todas as mensalidades`);
    if (data.premiumServicesIncluded.length > 0) {
      bulletPoint(doc, `Serviços Premium: ${data.premiumServicesIncluded.join(", ")} — INCLUÍDOS`);
    } else {
      bulletPoint(doc, "Serviços Premium: NÃO incluídos (paga à parte)");
    }
    if (data.zeroedImplementationsList.length > 0) {
      bulletPoint(doc, `Implantações gratuitas: ${data.zeroedImplementationsList.join(", ")}`);
    }
    moveDown(doc, 0.5);
  });

  // Full Kombo calculation example
  moveDown(doc, 1);
  subTitle(doc, "Exemplo Completo: Kombo Elite (Anual)");
  const eliteDiscount = pricingValues.kombos.elite.discount;
  const discountMult = 1 - eliteDiscount / 100;
  const imobKAnnual = pricingValues.basePlans.imob.k.annualPrice;
  const locKAnnual = pricingValues.basePlans.locacao.k.annualPrice;
  const intelAnnualK = pricingValues.addons.inteligencia.annualPrice;
  const leadsAnnual = pricingValues.addons.leads.annualPrice;
  const assAnnual = pricingValues.addons.assinaturas.annualPrice;
  const payAnnual = pricingValues.addons.pay.annualPrice;
  const segurosAnnual = pricingValues.addons.seguros.annualPrice;
  const cashAnnual = pricingValues.addons.cash.annualPrice;

  const totalBeforeDiscount = imobKAnnual + locKAnnual + intelAnnualK + leadsAnnual + assAnnual + payAnnual + segurosAnnual + cashAnnual;
  const totalAfterDiscount = Math.round(totalBeforeDiscount * discountMult);

  simpleTable(doc,
    ["Item", "Preço Anual", "Com Desconto"],
    [
      ["IMOB K", fmt(imobKAnnual), fmt(Math.round(imobKAnnual * discountMult))],
      ["Locação K", fmt(locKAnnual), fmt(Math.round(locKAnnual * discountMult))],
      ["Inteligência", fmt(intelAnnualK), fmt(Math.round(intelAnnualK * discountMult))],
      ["Leads", fmt(leadsAnnual), fmt(Math.round(leadsAnnual * discountMult))],
      ["Assinatura", fmt(assAnnual), fmt(Math.round(assAnnual * discountMult))],
      ["Pay", fmt(payAnnual), fmt(Math.round(payAnnual * discountMult))],
      ["Seguros", fmt(segurosAnnual), fmt(Math.round(segurosAnnual * discountMult))],
      ["Cash", fmt(cashAnnual), fmt(Math.round(cashAnnual * discountMult))],
      ["TOTAL", fmt(totalBeforeDiscount), fmt(totalAfterDiscount)],
    ]
  );
  bodyText(doc, `Desconto: ${eliteDiscount}% OFF --> Economia: ${fmt(totalBeforeDiscount - totalAfterDiscount)}/mês`);
}

// ============================================================================
// SECTION F: Variable Costs
// ============================================================================
function renderSectionF(doc: jsPDF) {
  sectionTitle(doc, "F", "Custos Variáveis Pós-Pago (Faixas de Uso)");

  bodyText(doc, "Preços pós-pago são cobrados por unidade adicional além do incluído no plano. NÃO sofrem arredondamento para 7.");

  const vc = pricingValues.variableCosts;
  const plans = ["prime", "k", "k2"] as const;

  // Additional Users
  subTitle(doc, "Usuários Adicionais (IMOB)");
  plans.forEach(plan => {
    const tiers = (vc.additionalUsers.tiers as any)[plan];
    if (!tiers) return;
    ensureSpace(doc, 10 + tiers.length * 7);
    doc.setFontSize(8);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont("helvetica", "bold");
    doc.text(`Plano ${plan.toUpperCase()}:`, PAGE_MARGIN + 3, getY(doc));
    moveDown(doc, 1);
    simpleTable(doc,
      ["Faixa (de)", "Faixa (até)", "Preço/unidade"],
      tiers.map((t: any) => [
        t.from.toString(),
        t.to === 999999 ? "∞" : t.to.toString(),
        fmt(t.price),
      ])
    );
  });

  // Additional Contracts
  subTitle(doc, "Contratos Adicionais (LOC)");
  plans.forEach(plan => {
    const tiers = (vc.additionalContracts.tiers as any)[plan];
    if (!tiers) return;
    ensureSpace(doc, 10 + tiers.length * 7);
    doc.setFontSize(8);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont("helvetica", "bold");
    doc.text(`Plano ${plan.toUpperCase()}:`, PAGE_MARGIN + 3, getY(doc));
    moveDown(doc, 1);
    simpleTable(doc,
      ["Faixa (de)", "Faixa (até)", "Preço/contrato"],
      tiers.map((t: any) => [
        t.from.toString(),
        t.to === 999999 ? "∞" : t.to.toString(),
        fmt(t.price),
      ])
    );
  });

  // Additional Leads
  ensureSpace(doc, 20);
  subTitle(doc, "Leads Adicionais (IMOB)");
  const leadTiers = vc.additionalLeads.tiers.all_plans;
  simpleTable(doc,
    ["Faixa (de)", "Faixa (até)", "Preço/lead"],
    leadTiers.map((t: any) => [
      t.from.toString(),
      t.to === 999999 ? "∞" : t.to.toString(),
      fmt(t.price),
    ])
  );

  // Boletos
  ensureSpace(doc, 20);
  subTitle(doc, "Boletos (LOC — Kenlo Pay)");
  plans.forEach(plan => {
    const tiers = (vc.boletos.tiers as any)[plan];
    if (!tiers) return;
    ensureSpace(doc, 10 + tiers.length * 7);
    doc.setFontSize(8);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont("helvetica", "bold");
    doc.text(`Plano ${plan.toUpperCase()}:`, PAGE_MARGIN + 3, getY(doc));
    moveDown(doc, 1);
    simpleTable(doc,
      ["Faixa (de)", "Faixa (até)", "Preço/boleto"],
      tiers.map((t: any) => [
        t.from.toString(),
        t.to === 999999 ? "∞" : t.to.toString(),
        fmt(t.price),
      ])
    );
  });

  // Splits
  ensureSpace(doc, 20);
  subTitle(doc, "Splits (LOC — Kenlo Pay)");
  plans.forEach(plan => {
    const tiers = (vc.splits.tiers as any)[plan];
    if (!tiers) return;
    ensureSpace(doc, 10 + tiers.length * 7);
    doc.setFontSize(8);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont("helvetica", "bold");
    doc.text(`Plano ${plan.toUpperCase()}:`, PAGE_MARGIN + 3, getY(doc));
    moveDown(doc, 1);
    simpleTable(doc,
      ["Faixa (de)", "Faixa (até)", "Preço/split"],
      tiers.map((t: any) => [
        t.from.toString(),
        t.to === 999999 ? "∞" : t.to.toString(),
        fmt(t.price),
      ])
    );
  });

  // Variable costs calculation example
  moveDown(doc, 1);
  subTitle(doc, "Exemplo: 15 Usuários no Plano K (10 inclusos)");
  const kUserTiers = pricingValues.variableCosts.additionalUsers.tiers.k;
  const includedUsers = pricingValues.basePlans.imob.k.includedUnits.quantity;
  const extraUsers = 15 - includedUsers;
  const tier1Price = kUserTiers[0]?.price || 47;
  const totalPosPago = extraUsers * tier1Price;
  bodyText(doc, `Inclusos no plano: ${includedUsers} | Total desejado: 15 | Adicionais: ${extraUsers}`);
  bodyText(doc, `Custo pós-pago: ${extraUsers} x ${fmt(tier1Price)} = ${fmt(totalPosPago)}/mês`);
  bodyText(doc, `Custo pré-pago (${PREPAID_DISCOUNT_PERCENTAGE}% OFF): ${extraUsers} x ${fmt(tier1Price * PREPAID_DISCOUNT_MULTIPLIER)} = ${fmt(extraUsers * tier1Price * PREPAID_DISCOUNT_MULTIPLIER)}/mês`);

  // Seguros Commission
  ensureSpace(doc, 20);
  subTitle(doc, "Comissão de Seguros (LOC)");
  plans.forEach(plan => {
    const tiers = (vc.segurosCommission.tiers as any)[plan];
    if (!tiers) return;
    ensureSpace(doc, 10 + tiers.length * 7);
    doc.setFontSize(8);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont("helvetica", "bold");
    doc.text(`Plano ${plan.toUpperCase()}:`, PAGE_MARGIN + 3, getY(doc));
    moveDown(doc, 1);
    simpleTable(doc,
      ["Faixa (de)", "Faixa (até)", "Taxa"],
      tiers.map((t: any) => [
        t.from.toString(),
        t.to === 999999 ? "∞" : t.to.toString(),
        t.rate ? `${(t.rate * 100).toFixed(0)}%` : (t.price ? fmt(t.price) : "N/A"),
      ])
    );
  });
}

// ============================================================================
// SECTION G: Feature Matrix
// ============================================================================
function renderSectionG(doc: jsPDF) {
  sectionTitle(doc, "G", "Matriz de Funcionalidades");

  bodyText(doc, "Funcionalidades disponíveis por produto e plano.");

  const fm = pricingValues.featureMatrix;

  // IMOB Features
  subTitle(doc, "Kenlo IMOB — Features");
  const imobFeatures = fm.imob.prime || [];
  if (imobFeatures.length > 0) {
    simpleTable(doc,
      ["Feature", "Prime", "K", "K2", "Add-on Vinculado"],
      imobFeatures.map((f: any, idx: number) => {
        const kFeature = fm.imob.k?.[idx];
        const k2Feature = fm.imob.k2?.[idx];
        return [
          f.name,
          f.included ? "Sim" : "Nao",
          kFeature?.included ? "Sim" : "Nao",
          k2Feature?.included ? "Sim" : "Nao",
          f.linkedToAddon || "-",
        ];
      })
    );
  }

  // LOC Features
  subTitle(doc, "Kenlo Locação — Features");
  const locFeatures = fm.locacao.prime || [];
  if (locFeatures.length > 0) {
    simpleTable(doc,
      ["Feature", "Prime", "K", "K2", "Add-on Vinculado"],
      locFeatures.map((f: any, idx: number) => {
        const kFeature = fm.locacao.k?.[idx];
        const k2Feature = fm.locacao.k2?.[idx];
        return [
          f.name,
          f.included ? "Sim" : "Nao",
          kFeature?.included ? "Sim" : "Nao",
          k2Feature?.included ? "Sim" : "Nao",
          f.linkedToAddon || "-",
        ];
      })
    );
  }
}

// ============================================================================
// SECTION H: Pre-Payment
// ============================================================================
function renderSectionH(doc: jsPDF) {
  sectionTitle(doc, "H", "Pré-Pagamento");

  bodyText(doc, `O pré-pagamento permite que o cliente pague antecipadamente por Usuários, Contratos e/ou Leads com um desconto de ${PREPAID_DISCOUNT_PERCENTAGE}% sobre o preço pós-pago.`);

  importantNote(doc, `Desconto de pré-pagamento: ${PREPAID_DISCOUNT_PERCENTAGE}% OFF sobre o preço pós-pago (multiplicador: ${PREPAID_DISCOUNT_MULTIPLIER})`);

  subTitle(doc, "Regras do Pré-Pagamento");
  bulletPoint(doc, `Desconto: ${PREPAID_DISCOUNT_PERCENTAGE}% sobre o preço pós-pago por unidade`);
  bulletPoint(doc, "Aplica-se a: Usuários adicionais, Contratos adicionais, Leads adicionais");
  bulletPoint(doc, "NÃO aplica arredondamento para terminar em 7 — resultado exato da multiplicação");
  bulletPoint(doc, "O cliente pode pré-pagar apenas algumas categorias (ex: pré-pagar usuários, pós-pagar contratos)");
  bulletPoint(doc, "O desconto é calculado sobre o preço por faixa (tiered pricing)");

  moveDown(doc, 1);
  subTitle(doc, "Exemplo de Cálculo");

  const kTiers = pricingValues.variableCosts.additionalUsers.tiers.k;
  const firstTierPrice = kTiers[0]?.price || 47;
  const prepaidPrice = firstTierPrice * PREPAID_DISCOUNT_MULTIPLIER;

  simpleTable(doc,
    ["Item", "Pós-Pago", `Pré-Pago (−${PREPAID_DISCOUNT_PERCENTAGE}%)`, "Economia"],
    [
      [
        `1 usuário adicional (K, 1ª faixa)`,
        fmt(firstTierPrice),
        `R$ ${prepaidPrice.toFixed(2)}`,
        `R$ ${(firstTierPrice - prepaidPrice).toFixed(2)}`,
      ],
    ]
  );

  bodyText(doc, `Fórmula: Preço Pré-Pago = Preço Pós-Pago × ${PREPAID_DISCOUNT_MULTIPLIER}`);
}

// ============================================================================
// SECTION I: Rounding Rules
// ============================================================================
function renderSectionI(doc: jsPDF) {
  sectionTitle(doc, "I", "Regras de Arredondamento");

  importantNote(doc, "REGRA CRÍTICA: Arredondamento para 7 aplica-se SOMENTE a licenças de produtos e add-ons. NÃO se aplica a pós-pago, pré-pago, implementação nem comissões.");

  subTitle(doc, "Onde SE APLICA (terminar em 7)");
  bulletPoint(doc, "Mensalidades de produtos (IMOB Prime, K, K2; LOC Prime, K, K2)");
  bulletPoint(doc, "Mensalidades de add-ons (Inteligência, Leads, Assinatura)");
  bulletPoint(doc, "Somente quando o valor calculado é >= R$ 100");
  bulletPoint(doc, "Valores < R$ 100: aplica-se apenas Math.ceil (arredondamento para cima)");

  moveDown(doc, 0.5);
  subTitle(doc, "Onde NÃO se aplica");
  bulletPoint(doc, "Preços pós-pago (usuários, contratos, leads adicionais)");
  bulletPoint(doc, "Preços pré-pago (são exatamente pós-pago × 0.90)");
  bulletPoint(doc, "Taxas de boleto e split (Kenlo Pay)");
  bulletPoint(doc, "Comissões de seguros");
  bulletPoint(doc, "Taxas de implementação (valores fixos)");
  bulletPoint(doc, "Preços de treinamento e serviços premium (valores fixos)");

  moveDown(doc, 0.5);
  subTitle(doc, "Algoritmo roundToSeven(x)");
  bodyText(doc, "1. Se x < 100: retorna Math.ceil(x)");
  bodyText(doc, "2. Se x >= 100: calcula ceil(x), depois encontra o próximo inteiro que termina em 7 (>= ceil(x))");

  // Practical rounding examples table
  moveDown(doc, 0.5);
  subTitle(doc, "Exemplos de Arredondamento");
  const roundingExamples = [
    ["85.50", "86", "< 100, apenas Math.ceil"],
    ["100.00", "107", ">= 100, próximo terminando em 7"],
    ["247.00", "247", "Já termina em 7"],
    ["248.00", "257", "Próximo inteiro com final 7"],
    ["277.88", "287", "ceil(277.88)=278, próximo 7 = 287"],
    ["500.00", "507", "ceil(500)=500, próximo 7 = 507"],
  ];
  simpleTable(doc,
    ["Valor Calculado", "Resultado roundToSeven", "Explicação"],
    roundingExamples
  );
}

// ============================================================================
// SECTION J: General Business Rules
// ============================================================================
function renderSectionJ(doc: jsPDF) {
  sectionTitle(doc, "J", "Regras de Negócio Gerais");

  subTitle(doc, "Ordem de Cálculo");
  bulletPoint(doc, "1. Preço base anual (fonte: pricing-values.json)");
  bulletPoint(doc, "2. Aplicar multiplicador do ciclo (Mensal ×1.25, Semestral ×1.125, Anual ×1.0, Bienal ×0.875)");
  bulletPoint(doc, "3. Aplicar arredondamento para 7 (APENAS licenças >= R$100)");
  bulletPoint(doc, "4. Aplicar desconto do Kombo (se aplicável)");
  bulletPoint(doc, "5. Somar custos variáveis pós-pago (sem arredondamento para 7)");
  bulletPoint(doc, "6. Aplicar desconto de pré-pagamento (10% OFF) se o cliente optar");

  moveDown(doc, 0.5);
  subTitle(doc, "Regras de Disponibilidade de Add-ons");
  bulletPoint(doc, "Inteligência: IMOB e/ou LOC (compartilhável)");
  bulletPoint(doc, "Leads: APENAS IMOB");
  bulletPoint(doc, "Assinatura: IMOB e/ou LOC (compartilhável)");
  bulletPoint(doc, "Pay: APENAS LOC");
  bulletPoint(doc, "Seguros: APENAS LOC");
  bulletPoint(doc, "Cash: APENAS LOC");

  moveDown(doc, 0.5);
  subTitle(doc, "Regras de Serviços Premium");
  bulletPoint(doc, "Suporte VIP e CS Dedicado incluídos gratuitamente nos planos K2");
  bulletPoint(doc, "Kombos Imob Pro, Locação Pro, Core Gestão e Elite incluem ambos");
  bulletPoint(doc, "Kombo Imob Start NÃO inclui serviços premium");
  bulletPoint(doc, "Herança: se qualquer produto tem K2, serviços incluídos para todos");

  moveDown(doc, 0.5);
  subTitle(doc, "Regras de Implantação");
  bulletPoint(doc, `Implantação base: ${fmt(pricingValues._legacyFields?.implantacaoBase || 1497)}`);
  bulletPoint(doc, "Cada Kombo tem implantações específicas zeradas (ver Seção E)");
  bulletPoint(doc, "A implantação é cobrada uma única vez no início do contrato");

  moveDown(doc, 0.5);
  subTitle(doc, "Seleção Automática de Plano");
  bulletPoint(doc, "IMOB: Baseado no número de usuários — calcula custo total para cada plano e recomenda o mais econômico");
  bulletPoint(doc, "LOC: Baseado no número de contratos — mesma lógica de custo total");

  moveDown(doc, 0.5);
  subTitle(doc, "Fonte Única de Verdade");
  bodyText(doc, "Todos os preços, regras e features são definidos em shared/pricing-values.json. A página /admin/pricing é a interface para editar esses valores. Qualquer alteração impacta imediatamente a calculadora, PDFs e páginas públicas.");

  // Full end-to-end example
  moveDown(doc, 1);
  subTitle(doc, "Exemplo Completo: Proposta IMOB K + LOC K + Kombo Elite (Mensal)");
  const imobK = pricingValues.basePlans.imob.k.annualPrice;
  const locK = pricingValues.basePlans.locacao.k.annualPrice;
  const imobKMonthly = roundToSeven(imobK * FREQUENCY_MULTIPLIERS.monthly);
  const locKMonthly = roundToSeven(locK * FREQUENCY_MULTIPLIERS.monthly);
  const eliteDiscountJ = pricingValues.kombos.elite.discount;
  const discountMultJ = 1 - eliteDiscountJ / 100;

  bodyText(doc, "Passo 1: Preço base anual");
  bodyText(doc, `  IMOB K: ${fmt(imobK)} | LOC K: ${fmt(locK)}`);
  bodyText(doc, "Passo 2: Aplicar multiplicador mensal (x" + FREQUENCY_MULTIPLIERS.monthly + ")");
  bodyText(doc, `  IMOB K: ${fmt(imobKMonthly)} | LOC K: ${fmt(locKMonthly)}`);
  bodyText(doc, `Passo 3: Aplicar desconto Kombo Elite (${eliteDiscountJ}% OFF)`);
  bodyText(doc, `  IMOB K: ${fmt(Math.round(imobKMonthly * discountMultJ))} | LOC K: ${fmt(Math.round(locKMonthly * discountMultJ))}`);
  bodyText(doc, `  Total mensal pré-pago (só produtos): ${fmt(Math.round((imobKMonthly + locKMonthly) * discountMultJ))}`);
  bodyText(doc, "Passo 4: Somar custos variáveis pós-pago (sem arredondamento para 7)");
  bodyText(doc, "Passo 5: Aplicar desconto pré-pagamento se aplicável (10% OFF sobre pós-pago)");
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export async function generateReferenceDocumentPDF(): Promise<Buffer> {
  currentY = PAGE_MARGIN;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set document properties
  doc.setProperties({
    title: "Kenlo Pricing Bible",
    author: "Kenlo Sales Portal",
    subject: "Pricing Rules, Business Logic, Features — v3.1.0",
  });

  // Render all sections
  renderCover(doc);
  renderSectionA(doc);
  renderSectionB(doc);
  renderSectionC(doc);
  renderSectionD(doc);
  renderSectionE(doc);
  renderSectionF(doc);
  renderSectionG(doc);
  renderSectionH(doc);
  renderSectionI(doc);
  renderSectionJ(doc);

  // Get the PDF as ArrayBuffer and convert to Buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
