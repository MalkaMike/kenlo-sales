import { Link } from "wouter";
import React, { useMemo } from "react";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Building2,
  Users,
  Globe,
  Smartphone,
  BarChart3,
  ArrowRight,
  Calculator,
  Info,
  Target,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Lightbulb,
  Mail,
  Layers,
  Search,
  Share2,
  Zap,
  BookOpen,
  Headphones,
  GraduationCap,
  HardDrive,
  Network,
  Star,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IMOB_PLANS,
  IMOB_IMPLEMENTATION,
  IMOB_ADDITIONAL_USERS,
  PREMIUM_SERVICES,
  ADDONS,
  PREPAID_PRICING,
  type PlanTier,
} from "@shared/pricing-config";

// ============================================================================
// DYNAMIC PRICING DATA BUILDER
// ============================================================================

type PricingRow = {
  feature: string;
  type: string;
  values: (string | boolean)[];
  highlight?: boolean;
  tooltip?: string;
};

type PricingSection = {
  title: string;
  icon?: string;
  rows: PricingRow[];
};

const PLAN_KEYS: PlanTier[] = ["prime", "k", "k2"];
const PLAN_NAMES = PLAN_KEYS.map((k) => IMOB_PLANS[k].name);

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

function formatTierLabel(tier: {
  from: number;
  to: number;
  price: number;
}): string {
  if (tier.to === Infinity)
    return `${tier.from}+: ${formatCurrency(tier.price)}`;
  return `${tier.from}-${tier.to}: ${formatCurrency(tier.price)}`;
}

function buildPricingData(): { plans: string[]; sections: PricingSection[] } {
  const sections: PricingSection[] = [];

  // --- Investimento ---
  sections.push({
    title: "💰 Investimento",
    rows: [
      {
        feature: "Licença mensal (plano anual)",
        type: "price",
        values: PLAN_KEYS.map(
          (k) => `${formatCurrency(IMOB_PLANS[k].annualPrice)}/mês`
        ),
        highlight: true,
      },
      {
        feature: "Taxa de implantação (única)",
        type: "price",
        values: PLAN_KEYS.map(() => formatCurrency(IMOB_IMPLEMENTATION)),
      },
      {
        feature: "Usuários inclusos",
        type: "text",
        values: PLAN_KEYS.map((k) => String(IMOB_PLANS[k].includedUsers)),
      },
      {
        feature: "Armazenamento",
        type: "text",
        values: ["Ilimitado", "Ilimitado", "Ilimitado"],
      },
    ],
  });

  // --- 🎯 Core CRM & Sales Pipeline ---
  sections.push({
    title: "🎯 CRM & Pipeline de Vendas",
    rows: [
      {
        feature: "Gestão completa de leads",
        tooltip: "Capture, distribua e acompanhe cada lead",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Funil de vendas visual",
        tooltip: "Gestão drag-and-drop do pipeline",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Gestão de propostas e negociações",
        tooltip: "Acompanhe ofertas, contrapropostas e status",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Gestão de contratos",
        tooltip: "Ciclo completo do contrato",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Cadastro ilimitado de imóveis",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Cadastro de proprietários e clientes",
        tooltip: "Base de contatos centralizada",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Agenda de atendimentos e visitas",
        type: "check",
        values: [true, true, true],
      },
    ],
  });

  // --- 🌐 Site & Captação Digital ---
  sections.push({
    title: "🌐 Site & Captação Digital",
    rows: [
      {
        feature: "Site personalizável (CMS)",
        tooltip: "Website totalmente customizável para sua imobiliária",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "SEO otimizado (parceria Neil Patel)",
        tooltip: "Otimização de classe mundial para buscadores",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Responsivo (mobile-first)",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Formulários de captação",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Landing pages de conversão",
        tooltip: "Páginas de alta conversão para imóveis",
        type: "check",
        values: [false, true, true],
      },
      {
        feature: "Blog integrado",
        tooltip: "Plataforma de marketing de conteúdo",
        type: "check",
        values: [false, false, true],
      },
    ],
  });

  // --- 🔗 Integrações & Automação ---
  sections.push({
    title: "🔗 Integrações & Automação",
    rows: [
      {
        feature: "Integração com 100+ portais",
        tooltip: "VivaReal, ZAP, OLX e mais de 100 outros",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Sincronização automática de anúncios",
        tooltip: "Publique em todos os portais com 1 clique",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Integração com redes sociais",
        tooltip: "Facebook, Instagram auto-posting",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Disparo automático de e-mails",
        tooltip: "Alertas automáticos de imóveis para clientes",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Kenlo Open (Parceiros Homologados)",
        tooltip: "Integrações com parceiros homologados do marketplace",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Comunidade Kenlo",
        tooltip:
          "Rede de co-corretagem entre imobiliárias Kenlo. Algoritmo exclusivo conecta agências com compradores ↔ agências com vendedores. Disponível apenas em K e K².",
        type: "check",
        values: [false, true, true],
      },
      {
        feature: "API aberta para integrações customizadas",
        tooltip: "Disponível a partir de Março 2026",
        type: "check",
        values: [false, false, true],
      },
    ],
  });

  // --- 📱 Mobile & Trabalho em Campo ---
  sections.push({
    title: "📱 Mobile & Campo",
    rows: [
      {
        feature: "App Corretor (iOS + Android)",
        tooltip: "CRM completo no celular",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Pré-cadastro de imóveis via app",
        tooltip: "Cadastre imóveis em campo",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Busca e filtros avançados no app",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Roteiro de visitas otimizado",
        tooltip: "Rotas otimizadas por GPS",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Notificações push em tempo real",
        tooltip: "Nunca perca um lead quente",
        type: "check",
        values: [true, true, true],
      },
    ],
  });

  // --- 📊 Relatórios & Inteligência ---
  sections.push({
    title: "📊 Relatórios & Inteligência",
    rows: [
      {
        feature: "Dashboard executivo",
        tooltip: "Visão geral de performance em tempo real",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Relatórios de vendas e pipeline",
        tooltip: "Acompanhe taxas de conversão e velocidade",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Relatórios de performance por corretor",
        tooltip: "Analytics individual de cada corretor",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Extração e configuração de relatórios",
        tooltip: "Construtor de relatórios customizados",
        type: "check",
        values: [true, true, true],
      },
    ],
  });

  // --- 💬 Comunicação & Atendimento ---
  sections.push({
    title: "💬 Comunicação & Atendimento",
    rows: [
      {
        feature: "Caixa de e-mail por usuário",
        tooltip: "Cada usuário recebe sua própria caixa de e-mail",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "E-mail integrado ao CRM",
        tooltip: "Envie e receba direto do CRM",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Histórico completo de interações",
        tooltip: "Cada ligação, e-mail e mensagem registrada",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Templates de mensagens",
        tooltip: "Modelos pré-construídos de comunicação",
        type: "check",
        values: [true, true, true],
      },
    ],
  });

  // --- 🎓 Suporte & Treinamento ---
  sections.push({
    title: "🎓 Suporte & Treinamento",
    rows: [
      {
        feature: "Suporte padrão",
        tooltip: "Help desk e base de conhecimento",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: PREMIUM_SERVICES.vipSupport.name,
        tooltip: "Suporte prioritário com SLA de 15 minutos",
        type: "mixed",
        values: PLAN_KEYS.map((k) =>
          PREMIUM_SERVICES.vipSupport.includedIn[k] ? "Incluído" : "Opcional"
        ),
      },
      {
        feature: PREMIUM_SERVICES.csDedicado.name,
        tooltip: "Gerente de sucesso dedicado à sua conta",
        type: "mixed",
        values: PLAN_KEYS.map((k) =>
          PREMIUM_SERVICES.csDedicado.includedIn[k] ? "Incluído" : "Opcional"
        ),
      },
      {
        feature: "Treinamento Online ou Presencial",
        tooltip: `K² inclui 2 online OU 1 presencial (cliente paga viagem). Valor ref: ${formatCurrency(2000)}/sessão`,
        type: "text",
        values: ["—", "—", "2 online OU 1 presencial"],
      },
    ],
  });

  // --- Usuários Adicionais (pós-pago) ---
  sections.push({
    title: "👥 Usuários Adicionais (pós-pago)",
    rows: [
      {
        feature: "Custo por usuário adicional",
        type: "complex",
        values: PLAN_KEYS.map((k) => {
          const tiers = IMOB_ADDITIONAL_USERS[k];
          if (tiers.length === 1) {
            return `${formatCurrency(tiers[0].price)}/usuário fixo`;
          }
          return tiers
            .map((t: { from: number; to: number; price: number }) =>
              formatTierLabel(t)
            )
            .join("\n");
        }),
      },
      {
        feature: "Pré-pago (compromisso anual/bienal)",
        tooltip:
          `Preço fixo de R$ ${PREPAID_PRICING.additionalUsers.pricePerMonth}/usuário/mês para quem opta por pré-pagar`,
        type: "text",
        values: [`R$ ${PREPAID_PRICING.additionalUsers.pricePerMonth}/un`, `R$ ${PREPAID_PRICING.additionalUsers.pricePerMonth}/un`, `R$ ${PREPAID_PRICING.additionalUsers.pricePerMonth}/un`],
      },
    ],
  });

  // --- 🚀 Add-ons Disponíveis ---
  sections.push({
    title: "🚀 Add-ons Disponíveis",
    rows: [
      {
        feature: "Kenlo Leads",
        tooltip: `Distribuição automatizada + ${ADDONS.leads.includedWhatsAppLeads} leads WhatsApp/mês`,
        type: "text",
        values: ["➕ Disponível", "➕ Disponível", "➕ Disponível"],
      },
      {
        feature: "Kenlo Inteligência",
        tooltip: "Google Looker BI + analytics avançado",
        type: "text",
        values: ["➕ Disponível", "➕ Disponível", "➕ Disponível"],
      },
      {
        feature: "Kenlo Assinaturas",
        tooltip: "Assinatura digital (15/mês incluídas)",
        type: "text",
        values: ["➕ Disponível", "➕ Disponível", "➕ Disponível"],
      },
    ],
  });

  return { plans: PLAN_NAMES, sections };
}

// --- Add-on comparison table data ---
function buildAddonComparisonRows() {
  const rows: {
    name: string;
    values: string[];
    savings: string;
  }[] = [];

  const userTiers = IMOB_ADDITIONAL_USERS;
  const primeUserPrice = userTiers.prime[0].price;
  const k2LastTier = userTiers.k2[userTiers.k2.length - 1];
  const maxSavings = Math.round(
    ((primeUserPrice - k2LastTier.price) / primeUserPrice) * 100
  );

  rows.push({
    name: "Usuários Adicionais",
    values: PLAN_KEYS.map((k) => {
      const tiers = userTiers[k];
      if (tiers.length === 1) return `${formatCurrency(tiers[0].price)}/un`;
      return tiers
        .map(
          (t: { from: number; to: number; price: number }) =>
            `${formatCurrency(t.price)} (${t.from}-${t.to === Infinity ? "+" : t.to})`
        )
        .join("\n");
    }),
    savings: `${maxSavings}%`,
  });

  const leadsTiers = ADDONS.leads.additionalLeadsTiers;
  const leadsBasePrice = `${formatCurrency(leadsTiers[0].price)}/msg`;
  rows.push({
    name: "Leads (WhatsApp)",
    values: [leadsBasePrice, leadsBasePrice, leadsBasePrice],
    savings: "—",
  });

  return rows;
}

// ============================================================================
// STATIC DATA
// ============================================================================

const highlights = [
  {
    icon: Building2,
    title: "CRM Completo",
    description:
      "Gestão de leads, funil de vendas, propostas, contratos e relatórios",
  },
  {
    icon: Globe,
    title: "Site Otimizado por Neil Patel",
    description:
      "A melhor ficha de imóvel do mercado. SEO de classe mundial. Converte 4,5x mais que portais.",
  },
  {
    icon: Smartphone,
    title: "App Corretor",
    description:
      "Cadastre imóveis, receba leads e gerencie visitas direto do celular",
  },
  {
    icon: Layers,
    title: "100+ Portais Integrados",
    description:
      "3.5 milhões de imóveis sincronizados toda noite em 100+ portais",
  },
  {
    icon: Network,
    title: "Comunidade Kenlo",
    description:
      "Co-corretagem inteligente: 10% dos fechamentos via parcerias entre imobiliárias (K/K²)",
  },
  {
    icon: Mail,
    title: "E-mail por Usuário",
    description:
      "Cada corretor tem sua própria caixa de e-mail integrada ao CRM",
  },
];

const sellingQuestions = [
  {
    icon: Target,
    question: "Você sabe quantos dos seus fechamentos vem do seu site?",
    insight:
      "Média Kenlo: 23% dos fechamentos vem do site próprio. Campeões: 60%. Escodelar: 60% dos fechamentos via site.",
  },
  {
    icon: AlertTriangle,
    question: "Qual é a sua taxa de conversão?",
    insight:
      "Média Kenlo: 4,5% em vendas. Campeões: 9%. Portais: apenas 1,8%. Seu site converte 4,5x mais.",
  },
  {
    icon: TrendingUp,
    question:
      "Você sabe quanto dos seus leads vem de portais vs originação própria?",
    insight:
      "60-70% dos leads vem de portais, mas geram apenas 30% dos fechamentos. A originação própria é o caminho.",
  },
  {
    icon: MessageSquare,
    question: "Você já pensou em ganhar com co-corretagem?",
    insight:
      "Comunidade Kenlo: 10% dos fechamentos via parcerias. Melhor 50% de algo que 100% de nada. Pioneiros há 12 anos.",
  },
  {
    icon: Search,
    question: "Você sabe qual mídia mais converte no mercado imobiliário?",
    insight:
      "Placa: 6,8% de conversão em vendas. Site: 8,7%. Portais: apenas 1,8%. A mídia que mais converte NÃO é digital.",
  },
  {
    icon: Star,
    question: "Você dá feedback ao proprietário sobre o imóvel dele?",
    insight:
      "Proprietários que recebem relatórios de visitas e interesse renovam exclusividade. É fidelização na prática.",
  },
];

// Lead Origin Performance Data
const leadOriginData = [
  {
    source: "Site Próprio",
    convVendas: "8,7%",
    convLocacao: "13,0%",
    color: "text-green-700",
    bg: "bg-green-50",
    bar: 87,
  },
  {
    source: "Placa",
    convVendas: "6,8%",
    convLocacao: "14,3%",
    color: "text-blue-700",
    bg: "bg-blue-50",
    bar: 68,
  },
  {
    source: "Indicação",
    convVendas: "5,2%",
    convLocacao: "8,1%",
    color: "text-purple-700",
    bg: "bg-purple-50",
    bar: 52,
  },
  {
    source: "Redes Sociais",
    convVendas: "3,5%",
    convLocacao: "5,2%",
    color: "text-orange-700",
    bg: "bg-orange-50",
    bar: 35,
  },
  {
    source: "Portais Nacionais",
    convVendas: "1,8%",
    convLocacao: "2,5%",
    color: "text-red-700",
    bg: "bg-red-50",
    bar: 18,
  },
  {
    source: "Portais Regionais",
    convVendas: "2,1%",
    convLocacao: "3,0%",
    color: "text-amber-700",
    bg: "bg-amber-50",
    bar: 21,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function ImobPage() {
  const { theadRef } = useStickyHeader();
  const pricingData = useMemo(() => buildPricingData(), []);
  const addonRows = useMemo(() => buildAddonComparisonRows(), []);

  const renderValue = (row: PricingRow, planIndex: number) => {
    const value = row.values[planIndex];

    if (row.type === "check") {
      return value ? (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mx-auto">
          <Check className="w-5 h-5 text-green-600" />
        </div>
      ) : (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 mx-auto">
          <X className="w-5 h-5 text-red-400" />
        </div>
      );
    }

    if (row.type === "mixed") {
      if (value === "Incluído") {
        return <span className="text-secondary font-medium">Incluído</span>;
      }
      return (
        <span className="text-muted-foreground text-sm">
          Opcional: pagar à parte
        </span>
      );
    }

    if (row.type === "complex") {
      const lines = (value as string).split("\n");
      return (
        <div className="text-xs space-y-0.5">
          {lines.map((line, i) => (
            <div
              key={i}
              className={i === 0 ? "font-medium" : "text-muted-foreground"}
            >
              {line}
            </div>
          ))}
        </div>
      );
    }

    if (row.type === "price" && row.highlight) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-bold text-foreground">{value}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
            investimento
          </span>
        </span>
      );
    }

    return (
      <span className={row.type === "price" ? "font-medium" : ""}>{value}</span>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

        <div className="container relative">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              CRM + SITE PARA VENDAS
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Imob
            </h1>

            <p className="text-xl text-muted-foreground mb-3">
              CRM completo para imobiliárias com Site e App incluídos. Todos os
              seus leads em um só lugar.
            </p>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
              <p className="text-sm text-foreground italic">
                "O site próprio converte{" "}
                <strong className="text-primary text-lg">4,5x mais</strong> que
                portais nacionais. É por isso que investimos em Neil Patel e na
                melhor ficha de imóvel do mercado. Não vendemos software —
                compartilhamos as melhores práticas que fazem a diferença."
              </p>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-3 rounded-xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-black text-primary">
                  8.500+
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Imobiliárias
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-black text-primary">
                  3.5M
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Imóveis/noite sincronizados
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-black text-primary">
                  100+
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Portais integrados
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-black text-primary">
                  40.000+
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Corretores ativos
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/calculadora">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  Monte seu Plano
                </Button>
              </Link>
              <Link href="/kombos">
                <Button size="lg" variant="outline" className="gap-2">
                  Ver Kombos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights - 6 cards */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead Origin Performance Table */}
      <section className="py-16 bg-gradient-to-b from-background to-card/20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-4">
                <BarChart3 className="w-4 h-4" />
                Dados Reais de Performance
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                De onde vêm os fechamentos?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                60-70% dos leads vêm de portais, mas geram apenas 30% dos
                fechamentos. A originação própria é o caminho para crescer.
              </p>
            </div>

            {/* Performance Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Origem do Lead
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">
                      Conv. Vendas
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">
                      Conv. Locação
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm w-[30%]">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leadOriginData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-border/30 ${row.bg}`}
                    >
                      <td className={`py-3 px-4 font-semibold ${row.color}`}>
                        {row.source}
                      </td>
                      <td
                        className={`py-3 px-4 text-center font-bold text-lg ${row.color}`}
                      >
                        {row.convVendas}
                      </td>
                      <td
                        className={`py-3 px-4 text-center font-bold text-lg ${row.color}`}
                      >
                        {row.convLocacao}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              row.bar >= 60
                                ? "bg-green-500"
                                : row.bar >= 30
                                  ? "bg-blue-500"
                                  : "bg-red-400"
                            }`}
                            style={{ width: `${row.bar}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Key Insight Box */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="text-2xl font-black text-green-700 mb-1">
                  4,5x
                </div>
                <p className="text-sm text-green-800">
                  <strong>Site próprio converte mais</strong> que portais
                  nacionais. Investir no seu site é investir no seu futuro.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-2xl font-black text-amber-700 mb-1">
                  6,8%
                </div>
                <p className="text-sm text-amber-800">
                  <strong>Placa: a mídia que mais converte</strong> no mercado
                  imobiliário NÃO é digital. Combine offline + online para
                  máxima performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comunidade Kenlo Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-12">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                    EXCLUSIVO K / K²
                  </Badge>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Comunidade Kenlo
                  </h2>
                  <p className="text-white/90 mb-4">
                    Rede pioneira de co-corretagem entre imobiliárias Kenlo.
                    Algoritmo exclusivo conecta agências com compradores ↔
                    agências com vendedores. <strong>Pioneiros há 12 anos.</strong>
                  </p>
                  <p className="text-white/80 text-sm italic">
                    "Melhor 50% de algo que 100% de nada. A Comunidade gera 10%
                    dos fechamentos das imobiliárias participantes."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
                    <div className="text-3xl font-black text-white">10%</div>
                    <div className="text-xs text-white/80 mt-1">
                      dos fechamentos via parcerias
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
                    <div className="text-3xl font-black text-white">12</div>
                    <div className="text-xs text-white/80 mt-1">
                      anos de pioneirismo
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
                    <div className="text-3xl font-black text-white">8.500+</div>
                    <div className="text-xs text-white/80 mt-1">
                      imobiliárias na rede
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur">
                    <div className="text-3xl font-black text-white">950+</div>
                    <div className="text-xs text-white/80 mt-1">
                      cidades cobertas
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Matrix / Pricing Table Section */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos, Funcionalidades e Preços
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Matriz completa de funcionalidades por plano. Todos os valores são
              para pagamento anual. Use a calculadora para simular seu cenário
              exato.
            </p>
          </div>

          {/* Pricing Table */}
          <div className="max-w-5xl mx-auto">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full border-collapse min-w-[600px]">
                {/* Header */}
                <thead ref={theadRef} className="pricing-sticky-header">
                  <tr>
                    <th className="text-left p-4 bg-muted/30 rounded-tl-lg w-[40%]">
                      <span className="text-sm font-medium text-muted-foreground">
                        Categoria / Recurso
                      </span>
                    </th>
                    {pricingData.plans.map((plan, index) => (
                      <th
                        key={plan}
                        className={`p-4 text-center bg-muted/30 ${
                          index === pricingData.plans.length - 1
                            ? "rounded-tr-lg"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`kenlo-badge ${
                              plan === "Prime"
                                ? "kenlo-badge-prime"
                                : plan === "K"
                                  ? "kenlo-badge-k"
                                  : "kenlo-badge-k2"
                            }`}
                          >
                            {plan}
                          </span>
                          {plan === "K" && (
                            <Badge className="bg-primary text-primary-foreground text-[10px]">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {pricingData.sections.map((section, sectionIndex) => (
                    <React.Fragment key={`section-${sectionIndex}`}>
                      {/* Section Header */}
                      <tr>
                        <td
                          colSpan={4}
                          className="p-3 bg-primary/5 font-semibold pricing-table-text border-t border-border/40"
                        >
                          {section.title}
                        </td>
                      </tr>

                      {/* Section Rows */}
                      {section.rows.map((row, rowIndex) => {
                        const typedRow = row as PricingRow;
                        return (
                          <tr
                            key={`row-${sectionIndex}-${rowIndex}`}
                            className="border-b border-border/20 pricing-row"
                          >
                            <td className="p-4 text-sm pricing-table-text">
                              <div className="flex items-center gap-2">
                                {typedRow.feature}
                                {typedRow.tooltip && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="w-4 h-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs max-w-[200px]">
                                        {typedRow.tooltip}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </td>
                            {pricingData.plans.map((_, planIndex) => (
                              <td
                                key={planIndex}
                                className="p-4 text-center text-sm pricing-table-text"
                              >
                                {renderValue(typedRow, planIndex)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Example calculation */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Exemplo de cálculo (Plano K):</strong> Se a imobiliária
                tiver 20 usuários adicionais, paga{" "}
                {IMOB_ADDITIONAL_USERS.k.length > 1
                  ? `${IMOB_ADDITIONAL_USERS.k[0].to} × ${formatCurrency(
                      IMOB_ADDITIONAL_USERS.k[0].price
                    )} + ${20 - IMOB_ADDITIONAL_USERS.k[0].to} × ${formatCurrency(
                      IMOB_ADDITIONAL_USERS.k[1].price
                    )}`
                  : `20 × ${formatCurrency(IMOB_ADDITIONAL_USERS.k[0].price)}`}
                {" = "}
                <strong>
                  {formatCurrency(
                    Math.min(20, IMOB_ADDITIONAL_USERS.k[0].to) *
                      IMOB_ADDITIONAL_USERS.k[0].price +
                      Math.max(0, 20 - IMOB_ADDITIONAL_USERS.k[0].to) *
                        (IMOB_ADDITIONAL_USERS.k[1]?.price ?? 0)
                  )}
                  /mês
                </strong>{" "}
                em usuários adicionais. Ou pré-pague a R$ {PREPAID_PRICING.additionalUsers.pricePerMonth}/un/mês com
                compromisso anual/bienal.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/calculadora">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <Calculator className="w-5 h-5" />
                Simular Cotação
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sales Intelligence - Questions to Ask */}
      <section className="py-20 bg-gradient-to-b from-background to-card/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold mb-4">
                <Lightbulb className="w-4 h-4" />
                Perguntas que Vendem
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Dados que impressionam o cliente
              </h2>
              <p className="text-muted-foreground">
                80% dos clientes não conhecem esses números. Use-os para mostrar
                o valor real do Kenlo Imob.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sellingQuestions.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl border-2 border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-foreground">
                        "{item.question}"
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.insight}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Key Conversion Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl bg-blue-50">
                <div className="text-3xl font-black text-blue-700">8,7%</div>
                <div className="text-xs text-blue-600 mt-1">
                  Conv. Site (Vendas)
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-50">
                <div className="text-3xl font-black text-red-700">1,8%</div>
                <div className="text-xs text-red-600 mt-1">
                  Conv. Portais (Vendas)
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-50">
                <div className="text-3xl font-black text-green-700">60%</div>
                <div className="text-xs text-green-600 mt-1">
                  Fechamentos Campeão (Site)
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-purple-50">
                <div className="text-3xl font-black text-purple-700">10%</div>
                <div className="text-xs text-purple-600 mt-1">
                  Fechamentos Comunidade
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Flow - What to Show */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Fluxo de Demo Recomendado
              </h2>
              <p className="text-sm text-muted-foreground">
                Siga esta sequência para maximizar o impacto da demonstração
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  step: "1",
                  title: "Cadastro Unificado",
                  desc: "Mostre como um imóvel cadastrado aparece em 100+ portais automaticamente",
                  time: "5 min",
                },
                {
                  step: "2",
                  title: "Poder de Integração",
                  desc: "Demonstre a sincronização com portais, redes sociais e parceiros do Kenlo Open",
                  time: "5 min",
                },
                {
                  step: "3",
                  title: "Feedback ao Proprietário",
                  desc: "Mostre relatórios de visitas e interesse - fideliza proprietários e renova exclusividade",
                  time: "3 min",
                },
                {
                  step: "4",
                  title: "Comunidade Kenlo",
                  desc: "Apresente a co-corretagem: 10% dos fechamentos via parcerias (K/K² only)",
                  time: "5 min",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-5 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.desc}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {item.time}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Success Story */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-100 text-green-700 flex-shrink-0">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <Badge className="mb-2 bg-green-100 text-green-800 hover:bg-green-200">
                    CASO DE SUCESSO
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">
                    Escodelar: 60% dos fechamentos via site próprio
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    A Escodelar alcançou 60% dos seus fechamentos através do site
                    próprio Kenlo, contra a média de mercado de 23%. Com SEO
                    otimizado por Neil Patel e a melhor ficha de imóvel do
                    mercado, o site se tornou o principal canal de vendas.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-700">
                        60%
                      </div>
                      <div className="text-xs text-green-600">
                        fechamentos via site
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-700">
                        2,6x
                      </div>
                      <div className="text-xs text-green-600">
                        acima da média
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-700">
                        #1
                      </div>
                      <div className="text-xs text-green-600">
                        canal de vendas
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add-ons CTA */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Potencialize com Add-ons
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione Leads, Inteligência e Assinatura para maximizar
              resultados. Combine em um Kombo e ganhe até 20% de desconto!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/addons/leads">
                <Button variant="outline" className="gap-2">
                  Kenlo Leads
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/addons/inteligencia">
                <Button variant="outline" className="gap-2">
                  Kenlo Inteligência
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/addons/assinatura">
                <Button variant="outline" className="gap-2">
                  Kenlo Assinatura
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Kombos CTA */}
      <section className="py-16">
        <div className="container">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 kenlo-gradient opacity-90" />

            <div className="relative px-8 py-12 md:px-16 md:py-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Economize com Kombos
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-6">
                Combine Kenlo Imob com add-ons e ganhe até 20% de desconto. O
                Kombo Elite inclui todos os produtos e serviços premium!
              </p>
              <Link href="/kombos">
                <Button size="lg" variant="secondary" className="gap-2">
                  Explorar Kombos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
