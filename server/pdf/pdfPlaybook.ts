/**
 * Playbook PDF Generator
 * Generates a comprehensive sales playbook PDF with all product and Kombo playbooks.
 * Uses the same PDFKit design system as the proposal PDF.
 */

import PDFDocument from "pdfkit";
import { ADDONS } from "@shared/pricing-config";
import { PW, PH, M, CW, C } from "./pdfTypes";

// ── Types ──────────────────────────────────────────────────────
interface PlaybookSection {
  title: string;
  items: string[];
}

interface PlaybookData {
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  keyData: string[];
  openingQuestions: string[];
  sellingPoints: string[];
  objectionHandlers: { objection: string; response: string }[];
  prepaidTip?: string;
  demoFlow?: string[];
}

interface KomboPlaybookData {
  title: string;
  subtitle: string;
  products: string[];
  savings: string;
  keyPoints: string[];
  prepaidTip?: string;
}

// ── Color palette ──────────────────────────────────────────────
const COLORS = {
  primary: "#E11D48",
  primaryLight: "#FFF1F2",
  dark: "#0F172A",
  text: "#334155",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#FFFFFF",
  bgSoft: "#F8FAFC",
  green: "#059669",
  greenLight: "#ECFDF5",
  blue: "#2563EB",
  blueLight: "#EFF6FF",
  amber: "#D97706",
  amberLight: "#FFFBEB",
  purple: "#7C3AED",
  purpleLight: "#F5F3FF",
};

// ── Product Playbooks Data ─────────────────────────────────────
const productPlaybooks: PlaybookData[] = [
  {
    title: "Kenlo Imob",
    subtitle: "CRM completo para vendas de imóveis",
    badge: "VENDAS",
    badgeColor: COLORS.primary,
    keyData: [
      "8.500+ imobiliárias usam Kenlo",
      "40.000+ corretores ativos na plataforma",
      "3,5 milhões de imóveis sincronizados/noite",
      "Comunidade Kenlo: co-corretagem entre 8.500 imobiliárias",
      "Site próprio converte 8,7% vs 1,8% dos portais",
      "60-70% dos leads vêm de portais, mas só 30% dos fechamentos",
    ],
    openingQuestions: [
      "Quantos dos seus fechamentos vêm do seu site próprio?",
      "Qual é sua taxa de conversão atual?",
      "Você sabe quanto custa cada lead por canal?",
      "Quantos corretores ativos você tem hoje?",
    ],
    sellingPoints: [
      "Cadastro unificado: imóvel cadastrado 1x aparece em todos os portais + site",
      "Comunidade Kenlo: acesso a 3,5M imóveis para co-corretagem",
      "Site próprio otimizado para SEO com conversão 4,8x maior que portais",
      "App mobile para corretores com acesso offline",
      "Integração com 50+ portais imobiliários",
      "Feedback automático ao proprietário sobre visitas e propostas",
    ],
    objectionHandlers: [
      { objection: "Já uso portais e funciona", response: "Portais convertem 1,8% vs 8,7% do site próprio. 60-70% dos leads vêm de portais mas só 30% dos fechamentos. Diversificar é proteger seu negócio." },
      { objection: "Meu CRM atual atende", response: "Seu CRM integra com 50+ portais, sincroniza 3,5M imóveis/noite e dá acesso à Comunidade Kenlo com 8.500 imobiliárias?" },
      { objection: "É caro demais", response: "Com Comunidade Kenlo, um único fechamento por co-corretagem paga o investimento de meses. Escodelar faz 60% dos fechamentos pelo site." },
    ],
    prepaidTip: "Usuários adicionais: R$ 34/mês fixo (pré-pago). Anual = 12 meses, Bienal = 24 meses.",
    demoFlow: [
      "1. Mostre os DADOS primeiro (conversão, lead origin)",
      "2. Cadastro Unificado → cadastre 1x, publique em todos os portais",
      "3. Comunidade Kenlo → 3,5M imóveis, co-corretagem",
      "4. Site próprio → SEO otimizado, conversão 8,7%",
      "5. App Mobile → acesso offline para corretores",
      "6. Feedback ao proprietário → relatórios automáticos",
    ],
  },
  {
    title: "Kenlo Locação",
    subtitle: "ERP completo para gestão de locação",
    badge: "LOCAÇÃO",
    badgeColor: COLORS.blue,
    keyData: [
      "Gestão completa do ciclo de locação",
      "DIMOB automático: economize 10-15 horas na declaração fiscal",
      "Kenlo Pay: 90% das imobiliárias já cobram taxa de boleto",
      "Seguros: comissão de 35-45% com Tokyo Marine",
      "Cash: antecipe até 24 meses de aluguel",
      "ROI: R$ 1.500+/mês em valor vs R$ 247/mês de investimento",
    ],
    openingQuestions: [
      "Quantos contratos de locação você administra hoje?",
      "Quanto tempo sua equipe gasta com DIMOB?",
      "Você já cobra taxa de boleto dos inquilinos?",
      "Quanto você ganha com seguros por contrato?",
    ],
    sellingPoints: [
      "Gestão completa: contrato → cobrança → repasse → DIMOB",
      "Kenlo Pay: boleto + split digital embutido, ganhe dinheiro",
      "Seguros Tokyo Marine: 35-45% comissão, renda passiva",
      "Cash: antecipe até 24 meses, ganhe comissão",
      "DIMOB automático: economize 10-15 horas/ano",
      "Reajuste automático de contratos (IGP-M, IPCA)",
    ],
    objectionHandlers: [
      { objection: "Planilhas funcionam bem", response: "Planilhas custam 15-20 horas/mês em trabalho manual. Isso é R$ 750-1.000/mês em custo de mão de obra. Kenlo Locação custa R$ 247/mês." },
      { objection: "Muito caro", response: "Com Seguros (R$ 10/contrato/mês) + Pay (taxa de boleto), a plataforma se paga. 100 contratos com 50% adesão = R$ 500/mês só de seguros." },
      { objection: "Já tenho um sistema", response: "Seu sistema tem Pay, Seguros e Cash embutidos? Kenlo é a única plataforma que GERA receita enquanto você usa." },
    ],
    prepaidTip: "Contratos adicionais: R$ 2,20/mês fixo (pré-pago). Anual = 12 meses, Bienal = 24 meses.",
    demoFlow: [
      "1. Mostre o ciclo completo de locação",
      "2. Kenlo Pay: o game changer (5 min)",
      "3. Seguros + Cash: receita adicional (4 min)",
      "4. DIMOB automático: economia de tempo",
      "5. Feche com ROI: receita > investimento",
    ],
  },
  {
    title: "Kenlo Leads",
    subtitle: "Gestão automatizada de leads",
    badge: "ADD-ON",
    badgeColor: COLORS.green,
    keyData: [
      "Distribuição automática por roleta inteligente",
      "AI SDR: qualificação automática de leads",
      "Transparência total: saiba de onde vem cada lead",
      "Integração com portais, Google Ads, Facebook Ads",
      "Foco na PESSOA CERTA, não no volume",
    ],
    openingQuestions: [
      "Você sabe qual canal gera seus melhores leads?",
      "Quanto tempo seus corretores gastam qualificando leads?",
      "Você tem visibilidade de onde vem cada fechamento?",
    ],
    sellingPoints: [
      "Roleta inteligente: distribui leads por performance, região, especialidade",
      "AI SDR: qualifica leads automaticamente antes de chegar ao corretor",
      "Dashboard de origem: saiba exatamente qual canal converte mais",
      "Integração nativa com site Kenlo, portais e campanhas",
      "Foco na PESSOA CERTA: não é sobre volume, é sobre qualidade",
    ],
    objectionHandlers: [
      { objection: "Já tenho leads suficientes", response: "A questão não é quantidade, é qualidade. Você sabe qual % dos seus leads realmente fecha? Com Kenlo Leads, você vê a taxa de conversão por canal." },
      { objection: "Meus corretores já fazem isso", response: "AI SDR qualifica 24/7 sem custo adicional. Seus corretores focam em vender, não em filtrar." },
    ],
    prepaidTip: "Implementação R$ 0 quando contratado via Kombo Imob Start ou Imob Pro.",
  },
  {
    title: "Kenlo Inteligência",
    subtitle: "BI estratégico com Google Partnership",
    badge: "ADD-ON",
    badgeColor: COLORS.purple,
    keyData: [
      "Parceria exclusiva com Google (1 de 12 no Brasil)",
      "Relatório SAFRA: funil completo do mercado",
      "Performance vs Mercado: compare sua imobiliária",
      "Google Looker: dashboards profissionais",
      "Dados que 80% dos clientes NÃO conhecem",
    ],
    openingQuestions: [
      "Você sabe como sua imobiliária se compara ao mercado?",
      "Você conhece o funil SAFRA da sua região?",
      "Quantas decisões você toma baseado em dados vs intuição?",
    ],
    sellingPoints: [
      "Parceria Google: acesso a dados exclusivos do mercado imobiliário",
      "Relatório SAFRA: Estoque → Anúncios → Leads → Visitas → Propostas → Fechamentos",
      "Performance vs Mercado: veja onde você está acima ou abaixo da média",
      "Google Looker: dashboards interativos e profissionais",
      "Este é o add-on onde VOCÊ mais brilha como vendedor",
    ],
    objectionHandlers: [
      { objection: "Já tenho relatórios", response: "Seus relatórios comparam sua performance com o mercado? Mostram o funil SAFRA da sua região? Usam dados do Google?" },
      { objection: "Não preciso de BI", response: "80% dos seus concorrentes não conhecem esses números. Quem conhece, toma decisões melhores e fecha mais." },
    ],
    prepaidTip: "Implementação R$ 0 quando contratado via Kombo Imob Pro ou Elite.",
  },
  {
    title: "Kenlo Assinaturas",
    subtitle: "Assinatura digital com Cerisign",
    badge: "ADD-ON",
    badgeColor: COLORS.amber,
    keyData: [
      "Parceria Cerisign: certificação digital oficial",
      `${ADDONS.assinaturas.includedSignatures} assinaturas incluídas no plano`,
      "Implementação R$ 0",
      "Assinatura embutida no fluxo de trabalho",
      "Validade jurídica completa (ICP-Brasil)",
    ],
    openingQuestions: [
      "Quantos contratos você assina por mês?",
      "Quanto tempo leva para coletar todas as assinaturas?",
      "Você usa alguma plataforma externa de assinatura?",
    ],
    sellingPoints: [
      `${ADDONS.assinaturas.includedSignatures} assinaturas incluídas: cobre a maioria das imobiliárias`,
      "Cerisign: certificação oficial com validade jurídica",
      "Embutida no fluxo: não precisa sair da plataforma",
      "Implementação R$ 0: sem custo de setup",
      "Excedentes com preço acessível por assinatura",
    ],
    objectionHandlers: [
      { objection: "Já uso DocuSign/Clicksign", response: `Quanto você paga por mês? Com Kenlo, ${ADDONS.assinaturas.includedSignatures} assinaturas já estão incluídas e a implementação é R$ 0. Tudo embutido no CRM.` },
    ],
    prepaidTip: `${ADDONS.assinaturas.includedSignatures} assinaturas incluídas. Excedentes cobrados por uso.`,
  },
  {
    title: "Kenlo Pay",
    subtitle: "Boleto e Split digital embutido",
    badge: "ADD-ON",
    badgeColor: COLORS.green,
    keyData: [
      "90% das imobiliárias já cobram taxa de boleto",
      "Split digital: repasse automático ao proprietário",
      "15-20 horas/mês economizadas em conciliação",
      "Ganhe dinheiro: cobre taxa do inquilino + split do proprietário",
      "A ferramenta MAIS PODEROSA do ecossistema Kenlo",
    ],
    openingQuestions: [
      "Você já cobra taxa de boleto dos inquilinos?",
      "Quanto tempo sua equipe gasta com conciliação bancária?",
      "Como você faz o repasse aos proprietários hoje?",
    ],
    sellingPoints: [
      "Boleto embutido: emissão automática no vencimento",
      "Split digital: repasse automático sem intervenção manual",
      "Cobre taxa do inquilino: transforme custo em receita",
      "Cobre taxa do proprietário: receita no split",
      "15-20 horas/mês economizadas = R$ 750-1.000 em mão de obra",
      "A ferramenta que GANHA dinheiro em vez de GASTAR",
    ],
    objectionHandlers: [
      { objection: "Já tenho sistema de boletos", response: "Seu sistema faz split automático? Cobra taxa embutida? Economiza 15-20h/mês? Kenlo Pay faz tudo isso integrado ao ERP." },
      { objection: "Meus inquilinos não vão aceitar taxa", response: "90% das imobiliárias já cobram. É prática de mercado. O inquilino prefere a conveniência do boleto digital." },
    ],
    prepaidTip: "Custo por boleto/split varia por volume. Quanto mais contratos, menor o custo unitário.",
  },
  {
    title: "Kenlo Seguros",
    subtitle: "Seguros embutido com Tokyo Marine",
    badge: "ADD-ON",
    badgeColor: COLORS.blue,
    keyData: [
      "Parceria Tokyo Marine: seguradora de primeira linha",
      "Comissão de 35-45% para a imobiliária",
      "R$ 10/contrato/mês de receita estimada",
      "Seguro embutido no boleto: adesão automática",
      "Renda passiva: o segredo do sucesso em locação",
    ],
    openingQuestions: [
      "Quanto você ganha com seguros hoje?",
      "Qual sua taxa de adesão de seguros?",
      "Você sabe que pode ganhar 35-45% de comissão?",
    ],
    sellingPoints: [
      "Tokyo Marine: marca confiável, seguro de qualidade",
      "35-45% de comissão: a maior do mercado",
      "Embutido no boleto: adesão automática, sem fricção",
      "R$ 10/contrato/mês: 100 contratos = R$ 1.000/mês",
      "Renda passiva: ganha enquanto dorme",
      "O SEGREDO do sucesso das melhores imobiliárias de locação",
    ],
    objectionHandlers: [
      { objection: "Já trabalho com outra seguradora", response: "Qual sua comissão? Tokyo Marine paga 35-45%. E com Kenlo, o seguro vai embutido no boleto — adesão automática." },
      { objection: "Meus inquilinos não querem seguro", response: "Com seguro embutido no boleto, a adesão é automática. Sem fricção = mais adesão = mais receita." },
    ],
    prepaidTip: "Sem custo de implementação. Receita começa no primeiro mês.",
  },
  {
    title: "Kenlo Cash",
    subtitle: "Antecipação de até 24 meses de aluguel",
    badge: "ADD-ON",
    badgeColor: COLORS.purple,
    keyData: [
      "Antecipe até 24 meses de aluguel para proprietários",
      "Sem capital próprio necessário",
      "Ganhe comissão sobre cada antecipação",
      "Vantagem competitiva: poucos oferecem isso",
      "Exclusivo Kenlo: não existe em outras plataformas",
    ],
    openingQuestions: [
      "Seus proprietários já pediram antecipação de aluguel?",
      "Você sabe que pode ganhar comissão sobre antecipações?",
      "Quantos proprietários você tem que poderiam se beneficiar?",
    ],
    sellingPoints: [
      "Até 24 meses de antecipação: o proprietário recebe na hora",
      "Sem capital próprio: Kenlo financia, você ganha comissão",
      "Vantagem competitiva: use como argumento para captar proprietários",
      "Exclusivo Kenlo: diferencial que nenhum concorrente oferece",
      "Comissão sobre cada operação: mais uma fonte de receita",
    ],
    objectionHandlers: [
      { objection: "Meus proprietários não precisam", response: "Mesmo que não precisem agora, oferecer essa opção é um diferencial na captação. Proprietários escolhem quem oferece mais serviços." },
      { objection: "Parece arriscado", response: "Zero risco para a imobiliária. Kenlo assume o financiamento. Você só ganha comissão." },
    ],
    prepaidTip: "Sem custo de implementação. Comissão sobre cada operação realizada.",
  },
];

// ── Kombo Playbooks Data ───────────────────────────────────────
const komboPlaybooks: KomboPlaybookData[] = [
  {
    title: "Kombo Imob Start",
    subtitle: "Entrada ideal para imobiliárias de vendas",
    products: ["Kenlo Imob (Prime)", "Kenlo Leads"],
    savings: "10% de desconto + Implementação Leads GRÁTIS",
    keyPoints: [
      "Entrada perfeita para quem quer profissionalizar vendas",
      "CRM + Leads integrados desde o dia 1",
      "Implementação do Leads é GRÁTIS (economia de R$ 997)",
      "NÃO inclui VIP/CS Dedicado (contrate à parte se necessário)",
      "Ideal para imobiliárias com 5-20 corretores",
    ],
    prepaidTip: "Usuários adicionais: R$ 34/mês fixo. Anual (12 meses) ou Bienal (24 meses).",
  },
  {
    title: "Kombo Imob Pro",
    subtitle: "Vendas data-driven com Google Partnership",
    products: ["Kenlo Imob (Prime)", "Kenlo Leads", "Kenlo Inteligência"],
    savings: "15% de desconto + Implementação Leads e Inteligência GRÁTIS",
    keyPoints: [
      "O pacote mais inteligente para vendas",
      "CRM + Leads + BI com Google Partnership",
      "15% de desconto sobre preços individuais",
      "Implementação Leads + Inteligência GRÁTIS (economia de R$ 1.994)",
      "Inclui VIP Support + CS Dedicado",
      "Relatório SAFRA + Performance vs Mercado incluídos",
    ],
    prepaidTip: "Usuários adicionais: R$ 34/mês fixo. Parcelas: Semestral 2x, Anual 3x, Bienal 6x.",
  },
  {
    title: "Kombo Locação Pro",
    subtitle: "Gestão de locação data-driven",
    products: ["Kenlo Locação (Prime)", "Kenlo Inteligência", "Kenlo Assinaturas"],
    savings: "10% de desconto",
    keyPoints: [
      "Pacote completo para gestão de locação inteligente",
      "ERP + BI + Assinatura Digital integrados",
      "10% de desconto sobre preços individuais",
      "Inclui VIP Support + CS Dedicado",
      "Adicione Pay e Seguros para maximizar receita",
      "Ideal para administradoras com 100+ contratos",
    ],
    prepaidTip: "Contratos adicionais: R$ 2,20/mês fixo. Parcelas: Semestral 2x, Anual 3x, Bienal 6x.",
  },
  {
    title: "Kombo Core Gestão",
    subtitle: "Vendas + Locação em uma só plataforma",
    products: ["Kenlo Imob (Prime)", "Kenlo Locação (Prime)"],
    savings: "50% de desconto na implementação (economia de R$ 1.497)",
    keyPoints: [
      "Para quem faz vendas E locação",
      "Cadastro unificado: imóvel vira locação sem recadastrar",
      "50% de desconto na implementação vs comprar separado",
      "Inclui VIP Support + CS Dedicado",
      "Base perfeita para adicionar add-ons depois",
      "Gateway para o Kombo Elite no futuro",
    ],
    prepaidTip: "Usuários: R$ 34/mês. Contratos: R$ 2,20/mês. Parcelas: Semestral 2x, Anual 3x, Bienal 6x.",
  },
  {
    title: "Kombo Elite",
    subtitle: "Ecossistema completo — tudo incluído",
    products: ["Kenlo Imob (K2)", "Kenlo Locação (K2)", "Kenlo Leads", "Kenlo Inteligência", "Kenlo Assinaturas"],
    savings: "20% de desconto + economia de R$ 5.087 no primeiro ano",
    keyPoints: [
      "O pacote MÁXIMO: tudo incluído com o maior desconto",
      "20% de desconto sobre preços individuais",
      "Implementação Leads + Inteligência GRÁTIS",
      "VIP Support + CS Dedicado incluídos",
      "Planos K2 com limites expandidos",
      "Economia de R$ 5.087 no primeiro ano vs comprar tudo separado",
      "Adicione Pay, Seguros e Cash para receita máxima",
    ],
    prepaidTip: "Usuários: R$ 34/mês. Contratos: R$ 2,20/mês. Parcelas: Semestral 2x, Anual 3x, Bienal 6x.",
  },
];

// ── PDF Generation ─────────────────────────────────────────────

function addPageNumber(doc: PDFKit.PDFDocument, pageNum: number) {
  doc.fontSize(7).fillColor(COLORS.textMuted).font("Helvetica")
    .text(`${pageNum}`, PW - M - 20, PH - 25, { width: 20, align: "right" });
}

function addHeader(doc: PDFKit.PDFDocument) {
  doc.rect(0, 0, PW, 3).fill(COLORS.primary);
  doc.fontSize(6).fillColor(COLORS.textMuted).font("Helvetica")
    .text("Kenlo Sales Playbook — Confidencial", M, 8);
}

export function generatePlaybookPDF(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: M, bottom: M, left: M, right: M },
      info: {
        Title: "Kenlo Sales Playbook",
        Author: "Kenlo",
        Subject: "Guia completo de vendas para equipe comercial",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let pageNum = 1;
    let y = M;

    // ── Cover Page ───────────────────────────────────────────
    doc.rect(0, 0, PW, PH).fill(COLORS.dark);
    doc.rect(0, 0, PW, 6).fill(COLORS.primary);
    doc.rect(0, PH - 6, PW, 6).fill(COLORS.primary);

    // Title
    doc.fontSize(36).fillColor("#FFFFFF").font("Helvetica-Bold")
      .text("SALES", M + 20, PH / 2 - 80, { width: CW - 40 });
    doc.fontSize(36).fillColor(COLORS.primary).font("Helvetica-Bold")
      .text("PLAYBOOK", M + 20, PH / 2 - 40, { width: CW - 40 });

    // Subtitle
    doc.fontSize(12).fillColor("#94A3B8").font("Helvetica")
      .text("Guia Completo de Vendas — Kenlo", M + 20, PH / 2 + 20, { width: CW - 40 });

    // Stats bar
    const statsY = PH / 2 + 60;
    const stats = [
      { value: "8.500+", label: "Imobiliárias" },
      { value: "40.000+", label: "Corretores" },
      { value: "950+", label: "Cidades" },
      { value: "R$8B+", label: "Em Vendas" },
    ];
    const statW = (CW - 40) / 4;
    stats.forEach((stat, i) => {
      const sx = M + 20 + i * statW;
      doc.fontSize(16).fillColor(COLORS.primary).font("Helvetica-Bold")
        .text(stat.value, sx, statsY, { width: statW, align: "center" });
      doc.fontSize(7).fillColor("#94A3B8").font("Helvetica")
        .text(stat.label, sx, statsY + 20, { width: statW, align: "center" });
    });

    // Date
    const now = new Date();
    const dateStr = `${now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`;
    doc.fontSize(8).fillColor("#64748B").font("Helvetica")
      .text(`Atualizado em ${dateStr}`, M + 20, PH - 50, { width: CW - 40 });

    doc.fontSize(7).fillColor("#475569").font("Helvetica")
      .text("Documento confidencial — Uso exclusivo da equipe comercial Kenlo", M + 20, PH - 35, { width: CW - 40 });

    // ── Table of Contents ────────────────────────────────────
    doc.addPage();
    pageNum++;
    addHeader(doc);
    y = 25;

    doc.rect(M, y, 4, 18).fill(COLORS.primary);
    doc.fontSize(16).fillColor(COLORS.dark).font("Helvetica-Bold")
      .text("Índice", M + 12, y + 1);
    y += 35;

    doc.fontSize(9).fillColor(COLORS.textMuted).font("Helvetica-Bold")
      .text("PRODUTOS CORE", M, y);
    y += 16;

    productPlaybooks.forEach((pb, i) => {
      doc.fontSize(8).fillColor(COLORS.text).font("Helvetica")
        .text(`${i + 1}. ${pb.title}`, M + 10, y);
      doc.fontSize(7).fillColor(COLORS.textMuted).font("Helvetica")
        .text(pb.subtitle, M + 30 + 120, y + 1);
      y += 14;
    });

    y += 10;
    doc.fontSize(9).fillColor(COLORS.textMuted).font("Helvetica-Bold")
      .text("KOMBOS", M, y);
    y += 16;

    komboPlaybooks.forEach((kb, i) => {
      doc.fontSize(8).fillColor(COLORS.text).font("Helvetica")
        .text(`${productPlaybooks.length + i + 1}. ${kb.title}`, M + 10, y);
      doc.fontSize(7).fillColor(COLORS.textMuted).font("Helvetica")
        .text(kb.subtitle, M + 30 + 120, y + 1);
      y += 14;
    });

    y += 20;
    // Payment rules summary
    doc.rect(M, y, CW, 0.5).fill(COLORS.border);
    y += 10;
    doc.fontSize(9).fillColor(COLORS.dark).font("Helvetica-Bold")
      .text("Regras de Pagamento", M, y);
    y += 16;

    const paymentRules = [
      ["Semestral", "Até 2 parcelas", "10% desconto"],
      ["Anual", "Até 3 parcelas", "20% desconto"],
      ["Bienal", "Até 6 parcelas", "25% desconto"],
    ];

    // Table header
    doc.fontSize(7).fillColor(COLORS.textMuted).font("Helvetica-Bold");
    doc.text("Frequência", M + 10, y, { width: 100 });
    doc.text("Parcelas", M + 130, y, { width: 100 });
    doc.text("Desconto", M + 260, y, { width: 100 });
    y += 12;

    paymentRules.forEach(([freq, parcelas, desc]) => {
      doc.fontSize(8).fillColor(COLORS.text).font("Helvetica");
      doc.text(freq, M + 10, y, { width: 100 });
      doc.text(parcelas, M + 130, y, { width: 100 });
      doc.text(desc, M + 260, y, { width: 100 });
      y += 12;
    });

    y += 10;
    doc.fontSize(9).fillColor(COLORS.dark).font("Helvetica-Bold")
      .text("Pré-Pago (Anual/Bienal)", M, y);
    y += 14;
    doc.fontSize(8).fillColor(COLORS.text).font("Helvetica");
    doc.text("• Usuários adicionais: R$ 34/usuário/mês (fixo, qualquer plano/volume)", M + 10, y);
    y += 12;
    doc.text("• Contratos adicionais: R$ 2,20/contrato/mês (fixo, qualquer plano/volume)", M + 10, y);
    y += 12;
    doc.text("• Anual = 12 meses pré-pagos | Bienal = 24 meses pré-pagos", M + 10, y);

    addPageNumber(doc, pageNum);

    // ── Product Playbook Pages ───────────────────────────────
    for (const pb of productPlaybooks) {
      doc.addPage();
      pageNum++;
      addHeader(doc);
      y = 25;

      // Badge
      const badgeW = doc.widthOfString(pb.badge) + 16;
      doc.roundedRect(M, y, badgeW, 16, 3).fill(pb.badgeColor);
      doc.fontSize(7).fillColor("#FFFFFF").font("Helvetica-Bold")
        .text(pb.badge, M + 8, y + 4);
      y += 24;

      // Title
      doc.fontSize(18).fillColor(COLORS.dark).font("Helvetica-Bold")
        .text(pb.title, M, y);
      y += 22;
      doc.fontSize(9).fillColor(COLORS.textMuted).font("Helvetica")
        .text(pb.subtitle, M, y);
      y += 20;

      // Key Data section
      doc.rect(M, y, CW, 0.5).fill(COLORS.primary);
      y += 8;
      doc.fontSize(9).fillColor(COLORS.primary).font("Helvetica-Bold")
        .text("DADOS QUE CONVENCEM", M, y);
      y += 14;

      pb.keyData.forEach((item) => {
        doc.fontSize(8).fillColor(COLORS.dark).font("Helvetica-Bold")
          .text("▸ ", M + 4, y, { continued: true })
          .font("Helvetica").fillColor(COLORS.text)
          .text(item);
        y += 12;
      });
      y += 6;

      // Opening Questions
      doc.rect(M, y, CW, 0.5).fill(COLORS.blue);
      y += 8;
      doc.fontSize(9).fillColor(COLORS.blue).font("Helvetica-Bold")
        .text("PERGUNTAS DE ABERTURA", M, y);
      y += 14;

      pb.openingQuestions.forEach((q) => {
        doc.fontSize(8).fillColor(COLORS.text).font("Helvetica-Oblique")
          .text(`"${q}"`, M + 8, y, { width: CW - 16 });
        y += 13;
      });
      y += 6;

      // Selling Points
      doc.rect(M, y, CW, 0.5).fill(COLORS.green);
      y += 8;
      doc.fontSize(9).fillColor(COLORS.green).font("Helvetica-Bold")
        .text("ARGUMENTOS DE VENDA", M, y);
      y += 14;

      pb.sellingPoints.forEach((sp) => {
        doc.fontSize(7.5).fillColor(COLORS.text).font("Helvetica")
          .text(`✓ ${sp}`, M + 4, y, { width: CW - 8 });
        y += 11;
      });
      y += 6;

      // Objection Handlers
      if (y + 80 > PH - M) {
        addPageNumber(doc, pageNum);
        doc.addPage();
        pageNum++;
        addHeader(doc);
        y = 25;
      }

      doc.rect(M, y, CW, 0.5).fill(COLORS.amber);
      y += 8;
      doc.fontSize(9).fillColor(COLORS.amber).font("Helvetica-Bold")
        .text("OBJEÇÕES E RESPOSTAS", M, y);
      y += 14;

      pb.objectionHandlers.forEach((oh) => {
        if (y + 35 > PH - M) {
          addPageNumber(doc, pageNum);
          doc.addPage();
          pageNum++;
          addHeader(doc);
          y = 25;
        }

        // Objection box
        doc.roundedRect(M + 4, y, CW - 8, 14, 2).fill(COLORS.amberLight);
        doc.fontSize(7).fillColor(COLORS.amber).font("Helvetica-Bold")
          .text(`"${oh.objection}"`, M + 10, y + 4, { width: CW - 20 });
        y += 18;

        // Response
        doc.fontSize(7.5).fillColor(COLORS.text).font("Helvetica")
          .text(`→ ${oh.response}`, M + 10, y, { width: CW - 20 });
        const responseHeight = doc.heightOfString(`→ ${oh.response}`, { width: CW - 20 });
        y += Math.max(responseHeight, 10) + 8;
      });

      // Prepaid Tip
      if (pb.prepaidTip) {
        if (y + 30 > PH - M) {
          addPageNumber(doc, pageNum);
          doc.addPage();
          pageNum++;
          addHeader(doc);
          y = 25;
        }
        y += 4;
        doc.roundedRect(M, y, CW, 22, 3).fill(COLORS.purpleLight);
        doc.fontSize(7).fillColor(COLORS.purple).font("Helvetica-Bold")
          .text("💰 PRÉ-PAGO: ", M + 8, y + 4, { continued: true, width: CW - 16 })
          .font("Helvetica").fillColor(COLORS.text)
          .text(pb.prepaidTip, { width: CW - 80 });
        y += 28;
      }

      // Demo Flow
      if (pb.demoFlow && pb.demoFlow.length > 0) {
        if (y + 60 > PH - M) {
          addPageNumber(doc, pageNum);
          doc.addPage();
          pageNum++;
          addHeader(doc);
          y = 25;
        }

        doc.rect(M, y, CW, 0.5).fill(COLORS.textMuted);
        y += 8;
        doc.fontSize(9).fillColor(COLORS.dark).font("Helvetica-Bold")
          .text("FLUXO DE DEMO", M, y);
        y += 14;

        pb.demoFlow.forEach((step) => {
          doc.fontSize(7.5).fillColor(COLORS.text).font("Helvetica")
            .text(step, M + 8, y, { width: CW - 16 });
          y += 11;
        });
      }

      addPageNumber(doc, pageNum);
    }

    // ── Kombo Playbook Pages ─────────────────────────────────
    for (const kb of komboPlaybooks) {
      doc.addPage();
      pageNum++;
      addHeader(doc);
      y = 25;

      // Badge
      const kbBadgeW = doc.widthOfString("KOMBO") + 16;
      doc.roundedRect(M, y, kbBadgeW, 16, 3).fill(COLORS.primary);
      doc.fontSize(7).fillColor("#FFFFFF").font("Helvetica-Bold")
        .text("KOMBO", M + 8, y + 4);
      y += 24;

      // Title
      doc.fontSize(18).fillColor(COLORS.dark).font("Helvetica-Bold")
        .text(kb.title, M, y);
      y += 22;
      doc.fontSize(9).fillColor(COLORS.textMuted).font("Helvetica")
        .text(kb.subtitle, M, y);
      y += 20;

      // Products included
      doc.rect(M, y, CW, 0.5).fill(COLORS.primary);
      y += 8;
      doc.fontSize(9).fillColor(COLORS.primary).font("Helvetica-Bold")
        .text("PRODUTOS INCLUÍDOS", M, y);
      y += 14;

      kb.products.forEach((prod) => {
        doc.fontSize(8).fillColor(COLORS.text).font("Helvetica")
          .text(`✓ ${prod}`, M + 8, y);
        y += 12;
      });
      y += 6;

      // Savings
      doc.roundedRect(M, y, CW, 24, 3).fill(COLORS.greenLight);
      doc.fontSize(8).fillColor(COLORS.green).font("Helvetica-Bold")
        .text(`💰 ${kb.savings}`, M + 10, y + 7, { width: CW - 20 });
      y += 32;

      // Key Points
      doc.rect(M, y, CW, 0.5).fill(COLORS.green);
      y += 8;
      doc.fontSize(9).fillColor(COLORS.green).font("Helvetica-Bold")
        .text("ARGUMENTOS CHAVE", M, y);
      y += 14;

      kb.keyPoints.forEach((kp) => {
        doc.fontSize(8).fillColor(COLORS.text).font("Helvetica")
          .text(`▸ ${kp}`, M + 4, y, { width: CW - 8 });
        y += 13;
      });
      y += 6;

      // Prepaid Tip
      if (kb.prepaidTip) {
        doc.roundedRect(M, y, CW, 22, 3).fill(COLORS.purpleLight);
        doc.fontSize(7).fillColor(COLORS.purple).font("Helvetica-Bold")
          .text("💰 PRÉ-PAGO: ", M + 8, y + 4, { continued: true, width: CW - 16 })
          .font("Helvetica").fillColor(COLORS.text)
          .text(kb.prepaidTip, { width: CW - 80 });
        y += 28;
      }

      addPageNumber(doc, pageNum);
    }

    // ── Quick Reference Page ─────────────────────────────────
    doc.addPage();
    pageNum++;
    addHeader(doc);
    y = 25;

    doc.rect(M, y, 4, 18).fill(COLORS.primary);
    doc.fontSize(14).fillColor(COLORS.dark).font("Helvetica-Bold")
      .text("Referência Rápida — Números para Memorizar", M + 12, y + 2);
    y += 35;

    const quickRef = [
      ["8.500+", "Imobiliárias usando Kenlo"],
      ["40.000+", "Corretores ativos na plataforma"],
      ["3,5M", "Imóveis sincronizados por noite"],
      ["950+", "Cidades com presença Kenlo"],
      ["R$ 8B+", "Em volume de vendas processado"],
      ["8,7%", "Taxa de conversão do site próprio"],
      ["1,8%", "Taxa de conversão dos portais"],
      ["60-70%", "Leads vêm de portais, mas só 30% dos fechamentos"],
      ["35-45%", "Comissão de seguros (Tokyo Marine)"],
      ["R$ 34", "Preço fixo por usuário adicional pré-pago/mês"],
      ["R$ 2,20", "Preço fixo por contrato adicional pré-pago/mês"],
      ["15-20h", "Economia mensal com Kenlo Pay"],
      ["R$ 0", "Implementação de Leads, Inteligência, Assinaturas (via Kombo)"],
      ["1 de 12", "Parceria exclusiva Google no Brasil"],
      ["99,98%", "Uptime do CRM Kenlo"],
      ["90%", "Imobiliárias já cobram taxa de boleto"],
    ];

    const colW = CW / 2;
    quickRef.forEach((item, i) => {
      const col = i % 2;
      const x = M + col * colW;
      if (col === 0 && i > 0) y += 0;

      doc.roundedRect(x + 2, y, colW - 4, 28, 2).fill(i % 4 < 2 ? COLORS.bgSoft : "#FFFFFF");

      doc.fontSize(12).fillColor(COLORS.primary).font("Helvetica-Bold")
        .text(item[0], x + 8, y + 4, { width: 70 });
      doc.fontSize(7).fillColor(COLORS.text).font("Helvetica")
        .text(item[1], x + 82, y + 8, { width: colW - 92 });

      if (col === 1) y += 30;
    });

    addPageNumber(doc, pageNum);

    doc.end();
  });
}
