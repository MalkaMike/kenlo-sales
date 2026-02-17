import { Link } from "wouter";
import React, { useMemo } from "react";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Home,
  FileText,
  CreditCard,
  RefreshCw,
  ArrowRight,
  Calculator,
  Info,
  Shield,
  Banknote,
  DollarSign,
  Clock,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Smartphone,
  Building2,
  Headphones,
  GraduationCap,
  Zap,
  AlertTriangle,
  Target,
  Layers,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LOC_PLANS,
  LOC_IMPLEMENTATION,
  LOC_ADDITIONAL_CONTRACTS,
  PAY_BOLETOS,
  PAY_SPLITS,
  PREMIUM_SERVICES,
  ADDONS,
  PREPAID_PRICING,
  SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT,
  type PlanTier,
} from "@shared/pricing-config";
import pricingValues from "@shared/pricing-values.json";

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
const PLAN_NAMES = PLAN_KEYS.map((k) => LOC_PLANS[k].name);

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

function formatTierCompact(
  tiers: readonly { from: number; to: number; price: number }[]
): string {
  if (tiers.length === 1) {
    return `${formatCurrency(tiers[0].price)}/un`;
  }
  return tiers
    .map((t) => {
      const range = t.to === Infinity ? `${t.from}+` : `${t.from}-${t.to}`;
      return `${range}: ${formatCurrency(t.price)}`;
    })
    .join("\n");
}

function buildPricingData(): { plans: string[]; sections: PricingSection[] } {
  const sections: PricingSection[] = [];

  // --- 💰 Investimento ---
  sections.push({
    title: "💰 Investimento",
    rows: [
      {
        feature: "Licença mensal (plano anual)",
        type: "price",
        values: PLAN_KEYS.map(
          (k) => `${formatCurrency(LOC_PLANS[k].annualPrice)}/mês`
        ),
        highlight: true,
      },
      {
        feature: "Taxa de implantação (única)",
        type: "price",
        values: PLAN_KEYS.map(() => formatCurrency(LOC_IMPLEMENTATION)),
      },
      {
        feature: "Contratos inclusos",
        type: "text",
        values: PLAN_KEYS.map((k) => String(LOC_PLANS[k].includedContracts)),
      },
      {
        feature: "Armazenamento",
        type: "text",
        values: ["Ilimitado", "Ilimitado", "Ilimitado"],
      },
    ],
  });

  // --- 🏢 Gestão de Contratos & Locação (12 features - ALL plans) ---
  sections.push({
    title: "🏢 Gestão de Contratos & Locação",
    rows: [
      {
        feature: "Aditivo contratual",
        tooltip: "Gerencie aditivos e alterações contratuais",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Assinatura digital integrada",
        tooltip: "Assinatura eletrônica embutida no fluxo contratual",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Cálculo de caução e IR",
        tooltip: "Cálculos automáticos de caução e imposto de renda",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Central de notificações",
        tooltip: "Hub centralizado de alertas e notificações",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Checklist de pendências",
        tooltip: "Acompanhe tarefas pendentes por contrato",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Controle de inadimplência",
        tooltip: "Monitore e gerencie pagamentos em atraso",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Dashboard completo",
        tooltip: "Visão geral de todos os contratos e indicadores",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Gestão de documentos",
        tooltip: "Pastas dedicadas por contrato com gestão documental",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Gestão de imóveis próprios",
        tooltip: "Gerencie imóveis de propriedade da imobiliária",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Notificações de contratos",
        tooltip: "Alertas automáticos de vencimento, reajuste e renovação",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Régua de cobranças",
        tooltip: "Workflow automatizado de cobrança com escalonamento",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Relatórios de gestão",
        tooltip: "Relatórios completos de performance da carteira",
        type: "check",
        values: [true, true, true],
      },
    ],
  });

  // --- 💰 Gestão Financeira (7 features - ALL plans) ---
  sections.push({
    title: "💰 Gestão Financeira",
    rows: [
      {
        feature: "Conciliação bancária",
        tooltip: "Concilie pagamentos automaticamente com extratos bancários",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Extrato DIMOB automático",
        tooltip:
          "Declaração DIMOB gerada automaticamente — economize 10-15h na temporada fiscal",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Gestão de repasses",
        tooltip:
          "Transferências automáticas para proprietários com relatório detalhado",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Integração bancária",
        tooltip: "Conexão direta com bancos para baixa automática",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Nota fiscal integrada",
        tooltip: "Emissão automática de NFs vinculada aos contratos",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Repasse agrupado",
        tooltip:
          "Agrupe múltiplos repasses em uma única transferência por proprietário",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Gestão de receitas e despesas",
        tooltip:
          "Controle completo de receitas e despesas por contrato e imóvel",
        type: "check",
        values: [true, true, true],
      },
    ],
  });

  // --- 🔗 Integrações (3 features - mixed) ---
  sections.push({
    title: "🔗 Integrações",
    rows: [
      {
        feature: "Integração Imob/CRM",
        tooltip:
          "Integração nativa com Kenlo Imob para gestão unificada de vendas e locação",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Kenlo Open (Parceiros Homologados)",
        tooltip:
          "Marketplace de integrações com parceiros homologados Kenlo",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "API aberta para integrações customizadas",
        tooltip: "Disponível a partir de Março 2026",
        type: "check",
        values: [false, false, true],
      },
    ],
  });

  // --- 📱 Mobile & Portais (4 features - K/K² only) ---
  sections.push({
    title: "📱 Mobile & Portais",
    rows: [
      {
        feature: "Anexo de comprovantes",
        tooltip: "Locatários enviam comprovantes de pagamento pelo portal",
        type: "check",
        values: [false, true, true],
      },
      {
        feature: "Área de locatários",
        tooltip:
          "Portal self-service para locatários: 2ª via de boleto, contratos, comunicação",
        type: "check",
        values: [false, true, true],
      },
      {
        feature: "Área de proprietários",
        tooltip:
          "Portal para proprietários: extratos, relatórios de repasse, documentos",
        type: "check",
        values: [false, true, true],
      },
      {
        feature: "App Manutenções de imóveis",
        tooltip:
          "Aplicativo para gestão de manutenções, vistorias e chamados técnicos",
        type: "check",
        values: [false, true, true],
      },
    ],
  });

  // --- 🎯 Gestão Avançada & CRM (5 features - K/K² only) ---
  sections.push({
    title: "🎯 Gestão Avançada & CRM",
    rows: [
      {
        feature: "CRM de cobranças",
        tooltip:
          "CRM dedicado para gestão de cobranças com histórico e follow-up",
        type: "check",
        values: [false, true, true],
      },
      {
        feature: "Gestão de tickets",
        tooltip:
          "Sistema de tickets para solicitações de locatários e proprietários",
        type: "check",
        values: [false, true, true],
      },
      {
        feature: "Gestão de carteira de proprietários",
        tooltip:
          "CRM dedicado para relacionamento e retenção de proprietários",
        type: "check",
        values: [false, true, true],
      },
      {
        feature: "Gestão de vistorias",
        tooltip:
          "Controle completo de vistorias de entrada, saída e periódicas",
        type: "check",
        values: [false, true, true],
      },
      {
        feature: "Remessa de despesas",
        tooltip: "Envio automatizado de despesas para proprietários",
        type: "check",
        values: [false, true, true],
      },
    ],
  });

  // --- 🏢 Recursos Empresariais (3 features - K² ONLY) ---
  sections.push({
    title: "🏢 Recursos Empresariais",
    rows: [
      {
        feature: "Cadastro de filiais",
        tooltip: "Gerencie múltiplas filiais em uma única plataforma",
        type: "check",
        values: [false, false, true],
      },
      {
        feature: "Gestão de imóveis vagos",
        tooltip:
          "Controle de imóveis desocupados com pipeline de captação",
        type: "check",
        values: [false, false, true],
      },
      {
        feature: "Módulo de vendas",
        tooltip:
          "Módulo integrado para venda de imóveis dentro do ERP de locação",
        type: "check",
        values: [false, false, true],
      },
    ],
  });

  // --- 🎓 Suporte & Treinamento ---
  sections.push({
    title: "🎓 Suporte & Treinamento",
    rows: [
      {
        feature: "Suporte padrão",
        tooltip:
          "Help desk e base de conhecimento. Tempo de resposta: 5 min. Resolução: 4h.",
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
        values: ["\u2014", "\u2014", "2 online OU 1 presencial"],
      },
    ],
  });

  // --- 👥 Contratos Adicionais (pós-pago) ---
  sections.push({
    title: "👥 Contratos Adicionais (pós-pago)",
    rows: [
      {
        feature: "Custo por contrato adicional",
        type: "complex",
        values: PLAN_KEYS.map((k) => {
          const tiers = LOC_ADDITIONAL_CONTRACTS[k];
          if (tiers.length === 1) {
            return `${formatCurrency(tiers[0].price)}/contrato fixo`;
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
          `Preço fixo de R$ ${PREPAID_PRICING.additionalContracts.pricePerMonth.toFixed(2).replace(".", ",")}/contrato/mês para quem opta por pré-pagar`,
        type: "text",
        values: [
          `R$ ${PREPAID_PRICING.additionalContracts.pricePerMonth.toFixed(2).replace(".", ",")}/un`,
          `R$ ${PREPAID_PRICING.additionalContracts.pricePerMonth.toFixed(2).replace(".", ",")}/un`,
          `R$ ${PREPAID_PRICING.additionalContracts.pricePerMonth.toFixed(2).replace(".", ",")}/un`,
        ],
      },
    ],
  });

  // --- 🚀 Add-ons Disponíveis ---
  sections.push({
    title: "🚀 Add-ons Disponíveis",
    rows: [
      {
        feature: "Kenlo Inteligência",
        tooltip: "Google Looker BI + analytics avançado",
        type: "text",
        values: ["➕ Disponível", "➕ Disponível", "➕ Disponível"],
      },
      {
        feature: "Kenlo Assinaturas",
        tooltip: "Assinatura digital Cerisign (15/mês incluídas)",
        type: "text",
        values: ["➕ Disponível", "➕ Disponível", "➕ Disponível"],
      },
      {
        feature: "Kenlo Pay",
        tooltip: "Boleto + Split automático — a imobiliária ganha, não gasta",
        type: "text",
        values: ["➕ Disponível", "➕ Disponível", "➕ Disponível"],
      },
      {
        feature: "Kenlo Seguros",
        tooltip:
          "Seguro residencial Tokyo Marine — 35-45% de comissão passiva",
        type: "text",
        values: ["➕ Disponível", "➕ Disponível", "➕ Disponível"],
      },
      {
        feature: "Kenlo Cash",
        tooltip: "Antecipação de até 24 meses de aluguel para proprietários",
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

  // Contracts
  const contractPrimePrice = LOC_ADDITIONAL_CONTRACTS.prime[0].price;
  const contractK2LastTier =
    LOC_ADDITIONAL_CONTRACTS.k2[LOC_ADDITIONAL_CONTRACTS.k2.length - 1];
  const contractSavings = Math.round(
    ((contractPrimePrice - contractK2LastTier.price) / contractPrimePrice) * 100
  );
  rows.push({
    name: "Contratos Adicionais",
    values: PLAN_KEYS.map((k) => {
      const tiers = LOC_ADDITIONAL_CONTRACTS[k];
      if (tiers.length === 1) return `${formatCurrency(tiers[0].price)}/un`;
      return tiers
        .map((t: { from: number; to: number; price: number }) => {
          const range =
            t.to === Infinity ? `${t.from}+` : `${t.from}-${t.to}`;
          return `${formatCurrency(t.price)} (${range})`;
        })
        .join("\n");
    }),
    savings: `${contractSavings}%`,
  });

  // Boletos
  const boletoPrimePrice = PAY_BOLETOS.prime[0].price;
  const boletoK2LastTier = PAY_BOLETOS.k2[PAY_BOLETOS.k2.length - 1];
  const boletoSavings = Math.round(
    ((boletoPrimePrice - boletoK2LastTier.price) / boletoPrimePrice) * 100
  );
  rows.push({
    name: "Boletos (Pay)",
    values: PLAN_KEYS.map((k) => {
      const tiers = PAY_BOLETOS[k];
      if (tiers.length === 1) return `${formatCurrency(tiers[0].price)}/un`;
      return tiers
        .map((t: { from: number; to: number; price: number }) => {
          const range =
            t.to === Infinity ? `${t.from}+` : `${t.from}-${t.to}`;
          return `${formatCurrency(t.price)} (${range})`;
        })
        .join("\n");
    }),
    savings: `${boletoSavings}%`,
  });

  // Splits
  const splitPrimePrice = PAY_SPLITS.prime[0].price;
  const splitK2LastTier = PAY_SPLITS.k2[PAY_SPLITS.k2.length - 1];
  const splitSavings = Math.round(
    ((splitPrimePrice - splitK2LastTier.price) / splitPrimePrice) * 100
  );
  rows.push({
    name: "Split (Pay)",
    values: PLAN_KEYS.map((k) => {
      const tiers = PAY_SPLITS[k];
      if (tiers.length === 1) return `${formatCurrency(tiers[0].price)}/un`;
      return tiers
        .map((t: { from: number; to: number; price: number }) => {
          const range =
            t.to === Infinity ? `${t.from}+` : `${t.from}-${t.to}`;
          return `${formatCurrency(t.price)} (${range})`;
        })
        .join("\n");
    }),
    savings: `${splitSavings}%`,
  });

  return rows;
}

// ============================================================================
// STATIC DATA
// ============================================================================

const highlights = [
  {
    icon: FileText,
    title: "Gestão de Contratos",
    description:
      "Controle completo do ciclo de vida: criação, assinatura, pagamento, renovação",
  },
  {
    icon: CreditCard,
    title: "Cobrança Automática",
    description:
      "Boletos, PIX e cartão com baixa automática. 15-20h/mês economizadas",
  },
  {
    icon: RefreshCw,
    title: "Repasse Automático",
    description:
      "Split automático: inquilino paga → dinheiro vai para a pessoa certa em 1-2 dias",
  },
  {
    icon: Home,
    title: "DIMOB Automático",
    description:
      "Declaração gerada em 1 clique. Economize 10-15h na temporada fiscal",
  },
  {
    icon: Shield,
    title: "Seguros Tokyo Marine",
    description:
      "35-45% de comissão passiva. 1 clique e o inquilino tem seguro no boleto",
  },
  {
    icon: Banknote,
    title: "Antecipação de Aluguel",
    description:
      "Kenlo Cash: antecipe até 24 meses para proprietários e ganhe comissão",
  },
];

const revenueOpportunities = [
  {
    icon: Shield,
    title: "Kenlo Seguros",
    stat: "35-45%",
    description: "Comissão por contrato/mês",
    detail:
      "Tokyo Marine embutido no boleto. R$ 50-150/contrato/ano. Receita passiva sem esforço.",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: CreditCard,
    title: "Kenlo Pay",
    stat: "90%",
    description: "das imobiliárias já cobram taxa",
    detail:
      "Boleto + Split automático. 15-20h/mês economizadas. A imobiliária ganha, não gasta.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Banknote,
    title: "Kenlo Cash",
    stat: "24 meses",
    description: "de antecipação de aluguel",
    detail:
      "Fidelize proprietários oferecendo antecipação. Sem capital próprio, ganhe comissão.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: DollarSign,
    title: "ROI Comprovado",
    stat: "R$ 1.500+",
    description: "valor gerado/mês",
    detail:
      "Seguros + Pay + economia de tempo. Investimento de R$ 247/mês gera R$ 1.500+ em valor.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

const sellingQuestions = [
  {
    icon: Clock,
    question: "Quanto tempo sua equipe gasta com cobrança manual?",
    insight:
      "Com Kenlo Pay, economize 15-20 horas/mês em trabalho manual de cobrança. Isso equivale a R$ 750-1.000/mês em mão-de-obra.",
  },
  {
    icon: Target,
    question: "Você já cobra taxa de boleto dos inquilinos?",
    insight:
      "90% das imobiliárias já cobram. Com Kenlo Pay, automatize e ganhe com isso — o preço cobrado é SEMPRE maior que o custo Kenlo.",
  },
  {
    icon: Shield,
    question: "Quanto a imobiliária ganha com seguro por contrato?",
    insight:
      `Com Kenlo Seguros: 35-45% de comissão. 200 contratos com 50% de adesão = R$ ${(200 * 0.5 * SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT * 12).toLocaleString('pt-BR')}+/ano de receita passiva.`,
  },
  {
    icon: Banknote,
    question: "Como você fideliza proprietários hoje?",
    insight:
      "Kenlo Cash: ofereça antecipação de até 24 meses de aluguel. Nenhum concorrente tem isso. Proprietários que recebem antecipação não trocam de imobiliária.",
  },
  {
    icon: AlertTriangle,
    question: "Qual é a sua taxa de conversão em locação?",
    insight:
      "Média Kenlo: 7,5%. Campeões: 10%. Se não sabe, precisa de Kenlo Inteligência. Se sabe e está abaixo, mostramos como chegar lá.",
  },
  {
    icon: Layers,
    question: "Quanto tempo você gasta com DIMOB todo ano?",
    insight:
      "Média: 10-15 horas de trabalho manual. Com Kenlo Locação: 1 clique. Todos os dados já estão preenchidos automaticamente.",
  },
];

// Lead Origin Performance Data (Locação-specific)
const leadOriginData = [
  {
    source: "Offline (Indicação)",
    convLocacao: "35,3%",
    shareLeads: "3%",
    shareClosings: "18%",
    color: "text-green-700",
    bg: "bg-green-50",
    bar: 100,
  },
  {
    source: "Placa",
    convLocacao: "14,3%",
    shareLeads: "5%",
    shareClosings: "11%",
    color: "text-blue-700",
    bg: "bg-blue-50",
    bar: 41,
  },
  {
    source: "Site Próprio",
    convLocacao: "13,0%",
    shareLeads: "11%",
    shareClosings: "23%",
    color: "text-purple-700",
    bg: "bg-purple-50",
    bar: 37,
  },
  {
    source: "Portais Regionais",
    convLocacao: "3,0%",
    shareLeads: "14%",
    shareClosings: "7%",
    color: "text-orange-700",
    bg: "bg-orange-50",
    bar: 9,
  },
  {
    source: "Portais Nacionais",
    convLocacao: "2,5%",
    shareLeads: "67%",
    shareClosings: "28%",
    color: "text-red-700",
    bg: "bg-red-50",
    bar: 7,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function LocacaoPage() {
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
      <span className={row.type === "price" ? "font-medium" : ""}>
        {value}
      </span>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />

        <div className="container relative">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
              ERP PARA LOCAÇÃO
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Locação
            </h1>

            <p className="text-xl text-muted-foreground mb-3">
              ERP completo para gestão de contratos de locação. Cobrança,
              repasse e DIMOB automatizados.
            </p>

            <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20 mb-6">
              <p className="text-sm text-foreground italic">
                "Locação não é só gestão — é{" "}
                <strong className="text-secondary text-lg">
                  geração de receita
                </strong>
                . Seguros, Pay e Cash transformam cada contrato em uma fonte de
                lucro. Isso não é software que custa dinheiro — é software que{" "}
                <strong>FAZ dinheiro</strong>."
              </p>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-3 rounded-xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-black text-secondary">
                  15-20h
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Economizadas/mês com Pay
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-black text-secondary">
                  35-45%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Comissão Seguros
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-black text-secondary">
                  24 meses
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Antecipação Cash
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-card border border-border/50">
                <div className="text-2xl md:text-3xl font-black text-secondary">
                  R$ 0
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Implantação Pay/Seguros/Cash
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/calculadora">
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
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
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary h-fit">
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
                Dados Reais de Performance — Locação
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                De onde vêm os fechamentos de locação?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                67% dos leads vêm de portais, mas portais geram apenas 28% dos
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
                      Conv. Locação
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">
                      % dos Leads
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">
                      % dos Fechamentos
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm w-[20%]">
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
                        {row.convLocacao}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                        {row.shareLeads}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium">
                        {row.shareClosings}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              row.bar >= 60
                                ? "bg-green-500"
                                : row.bar >= 30
                                  ? "bg-blue-500"
                                  : row.bar >= 10
                                    ? "bg-orange-400"
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

            {/* Key Insight Boxes */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="text-2xl font-black text-green-700 mb-1">
                  35,3%
                </div>
                <p className="text-sm text-green-800">
                  <strong>Indicação é o rei da conversão</strong> em locação.
                  Invista em relacionamento e rede de contatos para maximizar
                  fechamentos.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="text-2xl font-black text-red-700 mb-1">
                  67% → 28%
                </div>
                <p className="text-sm text-red-800">
                  <strong>Portais geram volume, não conversão.</strong> 67% dos
                  leads vêm de portais, mas apenas 28% dos fechamentos. Diversifique
                  suas fontes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Opportunities */}
      <section className="py-20 bg-gradient-to-b from-background to-card/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold mb-4">
                <TrendingUp className="w-4 h-4" />
                Gere Receita com Cada Contrato
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Locação que dá lucro
              </h2>
              <p className="text-muted-foreground">
                Cada contrato é uma oportunidade de receita. Veja como o
                ecossistema Kenlo transforma gestão em lucro.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {revenueOpportunities.map((item, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl ${item.bgColor} border`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl bg-white/80 ${item.color} flex-shrink-0`}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-3xl font-black ${item.color}`}>
                          {item.stat}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {item.description}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ROI Calculator Teaser */}
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white text-center">
              <h3 className="text-xl font-bold mb-2">
                Exemplo: 200 contratos de locação
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="text-2xl font-black">{`R$ ${(200 * 0.5 * SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT * 12).toLocaleString('pt-BR')}+`}</div>
                  <div className="text-xs text-green-200">Seguros/ano</div>
                </div>
                <div>
                  <div className="text-2xl font-black">15-20h</div>
                  <div className="text-xs text-green-200">
                    Economizadas/mês
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black">R$ 750+</div>
                  <div className="text-xs text-green-200">
                    Economia mão-de-obra
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black">10-15h</div>
                  <div className="text-xs text-green-200">
                    Economizadas DIMOB
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
                            <Badge className="bg-secondary text-secondary-foreground text-[10px]">
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
                          className="p-3 bg-secondary/5 font-semibold text-secondary border-t border-border/40"
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
                <strong>Exemplo de cálculo (Plano K):</strong> Se a
                administradora tiver 300 contratos adicionais, paga{" "}
                {LOC_ADDITIONAL_CONTRACTS.k.length > 1
                  ? `${LOC_ADDITIONAL_CONTRACTS.k[0].to} × ${formatCurrency(
                      LOC_ADDITIONAL_CONTRACTS.k[0].price
                    )} + ${300 - LOC_ADDITIONAL_CONTRACTS.k[0].to} × ${formatCurrency(
                      LOC_ADDITIONAL_CONTRACTS.k[1].price
                    )}`
                  : `300 × ${formatCurrency(LOC_ADDITIONAL_CONTRACTS.k[0].price)}`}
                {" = "}
                <strong>
                  {formatCurrency(
                    Math.min(300, LOC_ADDITIONAL_CONTRACTS.k[0].to) *
                      LOC_ADDITIONAL_CONTRACTS.k[0].price +
                      Math.max(0, 300 - LOC_ADDITIONAL_CONTRACTS.k[0].to) *
                        (LOC_ADDITIONAL_CONTRACTS.k[1]?.price ?? 0)
                  )}
                  /mês
                </strong>{" "}
                em contratos adicionais. Ou pré-pague a R$ {PREPAID_PRICING.additionalContracts.pricePerMonth.toFixed(2).replace(".", ",")}/un/mês com
                compromisso anual/bienal.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/calculadora">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
              >
                <Calculator className="w-5 h-5" />
                Simular Cotação
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Plan Comparison - Add-on Impact */}
      <section className="py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Comparação de Planos — Custos Variáveis
            </h2>
            <p className="text-sm text-muted-foreground">
              Veja como cada plano impacta o custo dos add-ons específicos do
              Kenlo Locação
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-2 px-3 font-semibold">
                      Add-on
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-secondary">
                      Prime
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-blue-600">
                      K
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-purple-600">
                      K²
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-green-600">
                      Economia
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {addonRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/40">
                      <td className="py-2 px-3 font-medium pricing-table-text">
                        {row.name}
                      </td>
                      {row.values.map((val, vi) => (
                        <td
                          key={vi}
                          className={`py-2 px-3 text-center text-xs pricing-table-text ${
                            vi === 2 ? "font-semibold" : ""
                          }`}
                        >
                          {val.split("\n").map((line, li) => (
                            <React.Fragment key={li}>
                              {li > 0 && <br />}
                              {line}
                            </React.Fragment>
                          ))}
                        </td>
                      ))}
                      <td
                        className={`py-2 px-3 text-center font-semibold ${
                          row.savings === "\u2014"
                            ? "text-gray-400"
                            : "text-green-600"
                        }`}
                      >
                        {row.savings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-900">
                <strong>Insight:</strong> Planos superiores (K ou K²) reduzem
                significativamente o custo por unidade. Quanto mais você
                digitaliza, menor o impacto dos add-ons.
              </p>
            </div>
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
                que Kenlo Locação não é custo — é investimento que gera receita.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sellingQuestions.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl border-2 border-border hover:border-secondary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-secondary/10 text-secondary flex-shrink-0">
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
              <div className="text-center p-4 rounded-xl bg-green-50">
                <div className="text-3xl font-black text-green-700">7,5%</div>
                <div className="text-xs text-green-600 mt-1">
                  Conv. Média (Locação)
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-blue-50">
                <div className="text-3xl font-black text-blue-700">10%</div>
                <div className="text-xs text-blue-600 mt-1">
                  Conv. Campeões (Locação)
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-purple-50">
                <div className="text-3xl font-black text-purple-700">90%</div>
                <div className="text-xs text-purple-600 mt-1">
                  Imobiliárias cobram taxa
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-50">
                <div className="text-3xl font-black text-amber-700">
                  R$ 0
                </div>
                <div className="text-xs text-amber-600 mt-1">
                  Implantação Pay/Seguros/Cash
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
                  title: "Contexto com Dados",
                  desc: "Mostre a tabela de performance por origem. 67% dos leads vêm de portais, mas geram apenas 28% dos fechamentos.",
                  time: "3 min",
                },
                {
                  step: "2",
                  title: "Kenlo Pay — O Closer",
                  desc: "Demonstre o split automático: inquilino paga → dinheiro vai para a pessoa certa em 1-2 dias. Zero trabalho manual.",
                  time: "5 min",
                },
                {
                  step: "3",
                  title: "Rent+: Seguros + Cash",
                  desc: "Mostre a receita passiva: 35-45% comissão Seguros + antecipação de 24 meses Cash. Software que FAZ dinheiro.",
                  time: "4 min",
                },
                {
                  step: "4",
                  title: "Feche com ROI",
                  desc: "Recapitule: R$ 1.500+/mês em valor vs R$ 247/mês de investimento. Net benefit: R$ 1.250+/mês.",
                  time: "3 min",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-5 rounded-xl border border-border/50 bg-card hover:border-secondary/30 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold mb-3">
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
                    {`Imobiliária com 200 contratos: R$ ${(200 * 0.5 * SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT * 12).toLocaleString('pt-BR')}/ano em receita passiva`}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Uma administradora com 200 contratos implementou Kenlo
                    Seguros (R$ 0 de implantação). Com 50% de adesão dos
                    {`inquilinos, passou a receber R$ ${(200 * 0.5 * SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT * 12).toLocaleString('pt-BR')}/ano em comissões`}
                    passivas de seguro — sem nenhum trabalho adicional. Além
                    disso, com Kenlo Pay, economizou 15-20h/mês em cobranças
                    manuais e passou a lucrar com as taxas de boleto.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-700">
                        {`R$ ${(200 * 0.5 * SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT * 12 / 1000).toLocaleString('pt-BR')}k`}
                      </div>
                      <div className="text-xs text-green-600">
                        receita passiva/ano
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-700">
                        0h
                      </div>
                      <div className="text-xs text-green-600">
                        trabalho adicional
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-green-700">
                        R$ 0
                      </div>
                      <div className="text-xs text-green-600">
                        implantação
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Success Story */}
            <div className="mt-6 p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-700 flex-shrink-0">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    CASO DE SUCESSO
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">
                    Administradora economiza 15h/mês com Kenlo Pay
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Uma administradora com 150 contratos gastava 15-20h/mês em
                    cobranças manuais, repasses e conciliação bancária. Após
                    implementar Kenlo Pay (R$ 0 de implantação), reduziu para 0
                    horas — tudo automático. O custo Kenlo é menor que o valor
                    cobrado dos inquilinos, gerando lucro mensal.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-700">
                        15h
                      </div>
                      <div className="text-xs text-blue-600">
                        economizadas/mês
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-700">
                        R$ 750
                      </div>
                      <div className="text-xs text-blue-600">
                        economia mão-de-obra
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-700">
                        1-2 dias
                      </div>
                      <div className="text-xs text-blue-600">
                        repasse automático
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
              Adicione Inteligência, Assinatura, Pay, Seguros e Cash para
              maximizar receita. Combine em um Kombo e ganhe até 20% de
              desconto!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
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
              <Link href="/addons/pay">
                <Button variant="outline" className="gap-2">
                  Kenlo Pay
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/addons/seguros">
                <Button variant="outline" className="gap-2">
                  Kenlo Seguros
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/addons/cash">
                <Button variant="outline" className="gap-2">
                  Kenlo Cash
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
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/80 opacity-90" />

            <div className="relative px-8 py-12 md:px-16 md:py-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Economize com Kombos
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-6">
                Combine Kenlo Locação com add-ons e ganhe até 20% de desconto. O
                Kombo Elite inclui todos os produtos e serviços premium!
              </p>
              <Link href="/kombos">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 bg-white text-secondary hover:bg-white/90"
                >
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
