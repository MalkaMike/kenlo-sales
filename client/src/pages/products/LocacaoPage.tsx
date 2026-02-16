import { Link } from "wouter";
import React, { useMemo } from "react";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Home, FileText, CreditCard, RefreshCw, ArrowRight, Calculator, Info, Shield, Banknote, DollarSign, Clock, TrendingUp, Lightbulb } from "lucide-react";
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
  rows: PricingRow[];
};

const PLAN_KEYS: PlanTier[] = ["prime", "k", "k2"];
const PLAN_NAMES = PLAN_KEYS.map((k) => LOC_PLANS[k].name);

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

function formatTierLabel(tier: { from: number; to: number; price: number }): string {
  if (tier.to === Infinity) return `${tier.from}+: ${formatCurrency(tier.price)}`;
  return `${tier.from}-${tier.to}: ${formatCurrency(tier.price)}`;
}

function formatTierCompact(tiers: readonly { from: number; to: number; price: number }[]): string {
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

  // --- Investimento ---
  sections.push({
    title: "Investimento",
    rows: [
      {
        feature: "Licença mensal (plano anual)",
        type: "price",
        values: PLAN_KEYS.map((k) => `${formatCurrency(LOC_PLANS[k].annualPrice)}/mês`),
        highlight: true,
      },
      {
        feature: "Implantação",
        type: "price",
        values: PLAN_KEYS.map(() => formatCurrency(LOC_IMPLEMENTATION)),
      },
      {
        feature: "Contratos inclusos",
        type: "text",
        values: PLAN_KEYS.map((k) => String(LOC_PLANS[k].includedContracts)),
      },
    ],
  });

  // --- Serviços Premium ---
  sections.push({
    title: "Serviços Premium",
    rows: [
      {
        feature: PREMIUM_SERVICES.vipSupport.name,
        type: "mixed",
        values: PLAN_KEYS.map((k) =>
          PREMIUM_SERVICES.vipSupport.includedIn[k] ? "Incluído" : "Opcional"
        ),
      },
      {
        feature: PREMIUM_SERVICES.csDedicado.name,
        type: "mixed",
        values: PLAN_KEYS.map((k) =>
          PREMIUM_SERVICES.csDedicado.includedIn[k] ? "Incluído" : "Opcional"
        ),
      },
    ],
  });

  // --- Funcionalidades Básicas ---
  const basicFeatures = [
    "Aditivo contratual", "Assinatura digital", "Cálculo caução / IR",
    "Central notificações", "Checklist pendências", "Conciliação bancária",
    "Controle inadimplência", "Dashboard completo", "Extrato DIMOB",
    "Gestão documentos", "Gestão imóveis próprios", "Gestão repasses",
    "Integração bancária", "Integração Imob/CRM", "Nota fiscal integrada",
    "Notificações contratos", "Régua de cobranças", "Relatórios gestão",
    "Repasse agrupado",
  ];
  sections.push({
    title: "Funcionalidades Básicas (todos os planos)",
    rows: basicFeatures.map((f) => ({
      feature: f,
      type: "check",
      values: [true, true, true] as boolean[],
    })),
  });

  // --- Funcionalidades Avançadas ---
  const advancedFeatures = [
    "Anexo comprovantes", "Área locatários", "Área proprietários",
    "CRM cobranças", "Gestão tickets", "Gestão carteira prop.",
    "Gestão vistorias", "Remessa despesas",
  ];
  sections.push({
    title: "Funcionalidades Avançadas",
    rows: advancedFeatures.map((f) => ({
      feature: f,
      type: "check",
      values: [false, true, true] as boolean[],
    })),
  });

  // --- Funcionalidades Exclusivas K² ---
  const k2Features = [
    "Cadastro filiais", "Gestão imóveis vagos", "Módulo vendas",
  ];
  sections.push({
    title: "Funcionalidades Exclusivas K\u00B2",
    rows: k2Features.map((f) => ({
      feature: f,
      type: "check",
      values: [false, false, true] as boolean[],
    })),
  });

  // --- Kenlo Seguros (comissão) ---
  sections.push({
    title: "Kenlo Seguros (comissão)",
    rows: [
      {
        feature: "Comissão sobre prêmio",
        type: "text",
        values: PLAN_KEYS.map((k) => {
          const rate = pricingValues.variableCosts.segurosCommission.tiers[k][0].rate;
          return `${Math.round(rate * 100)}%`;
        }),
      },
    ],
  });

  // --- Custos Pós-Pago ---
  sections.push({
    title: "Custos Pós-Pago",
    rows: [
      {
        feature: "Kenlo Pay - Boleto",
        type: "complex",
        values: PLAN_KEYS.map((k) => formatTierCompact(PAY_BOLETOS[k])),
      },
      {
        feature: "Kenlo Pay - Split",
        type: "complex",
        values: PLAN_KEYS.map((k) => formatTierCompact(PAY_SPLITS[k])),
      },
      {
        feature: "Contratos adicionais",
        type: "complex",
        values: PLAN_KEYS.map((k) => formatTierCompact(LOC_ADDITIONAL_CONTRACTS[k])),
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
  const contractK2LastTier = LOC_ADDITIONAL_CONTRACTS.k2[LOC_ADDITIONAL_CONTRACTS.k2.length - 1];
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
          const range = t.to === Infinity ? `${t.from}+` : `${t.from}-${t.to}`;
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
          const range = t.to === Infinity ? `${t.from}+` : `${t.from}-${t.to}`;
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
          const range = t.to === Infinity ? `${t.from}+` : `${t.from}-${t.to}`;
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
    description: "Controle completo do ciclo de vida dos contratos",
  },
  {
    icon: CreditCard,
    title: "Cobrança Automática",
    description: "Boletos, PIX e cartão com baixa automática",
  },
  {
    icon: RefreshCw,
    title: "Repasse Automático",
    description: "Transferência para proprietários sem esforço",
  },
  {
    icon: Home,
    title: "DIMOB Automático",
    description: "Declaração gerada automaticamente",
  },
];

const revenueOpportunities = [
  {
    icon: Shield,
    title: "Kenlo Seguros",
    stat: "35-45%",
    description: "Comissão por contrato/mês",
    detail: "Tokyo Marine embutido no boleto. R$ 50-150/contrato/ano. Receita passiva sem esforço.",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: CreditCard,
    title: "Kenlo Pay",
    stat: "90%",
    description: "das imobiliárias já cobram taxa",
    detail: "Boleto + Split automático. 15-20h/mês economizadas. A imobiliária ganha, não gasta.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Banknote,
    title: "Kenlo Cash",
    stat: "24 meses",
    description: "de antecipação de aluguel",
    detail: "Fidelize proprietários oferecendo antecipação. Sem capital próprio, ganhe comissão.",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: DollarSign,
    title: "ROI Comprovado",
    stat: "R$ 1.500+",
    description: "valor gerado/mês",
    detail: "Seguros + Pay + economia de tempo. Investimento de R$ 247/mês gera R$ 1.500+ em valor.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

const sellingQuestions = [
  {
    question: "Quanto tempo sua equipe gasta com cobrança manual?",
    insight: "Com Kenlo Pay, economize 15-20 horas/mês em trabalho manual de cobrança.",
  },
  {
    question: "Você já cobra taxa de boleto dos inquilinos?",
    insight: "90% das imobiliárias já cobram. Com Kenlo Pay, automatize e ganhe com isso.",
  },
  {
    question: "Quanto a imobiliária ganha com seguro por contrato?",
    insight: "Com Kenlo Seguros: 35-45% de comissão. 100 contratos = R$ 10.000+/ano.",
  },
  {
    question: "Como você fideliza proprietários hoje?",
    insight: "Kenlo Cash: ofereça antecipação de até 24 meses. Nenhum concorrente tem isso.",
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
        <span className="text-muted-foreground text-sm">Opcional: pagar à parte</span>
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
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />

        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
              ERP PARA LOCAÇÃO
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Locação
            </h1>

            <p className="text-xl text-muted-foreground mb-4">
              ERP completo para gestão de contratos de locação. Cobrança,
              repasse e DIMOB automatizados.
            </p>
            <p className="text-sm text-muted-foreground mb-6 italic">
              "Locação não é só gestão — é <strong className="text-secondary">geração de receita</strong>. Seguros, Pay e Cash transformam cada contrato em uma fonte de lucro."
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4 text-secondary" />
                <span>Gestão completa de locações</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-secondary" />
                <span>Cobrança automatizada</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-secondary" />
                <span>DIMOB automático</span>
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

      {/* Highlights */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Pricing Table Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos e Preços
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o volume de contratos da sua
              administradora. Todos os valores são para pagamento anual.
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
                em contratos adicionais.
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
              Comparação de Planos - Add-ons LOC
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
                          row.savings === "—"
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
                Cada contrato é uma oportunidade de receita. Veja como o ecossistema Kenlo transforma gestão em lucro.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {revenueOpportunities.map((item, index) => (
                <div key={index} className={`p-6 rounded-2xl ${item.bgColor} border`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-white/80 ${item.color} flex-shrink-0`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`text-3xl font-black ${item.color}`}>{item.stat}</span>
                        <span className="text-sm font-medium text-gray-700">{item.description}</span>
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
              <h3 className="text-xl font-bold mb-2">Exemplo: 100 contratos de locação</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="text-2xl font-black">R$ 10.000+</div>
                  <div className="text-xs text-green-200">Seguros/ano</div>
                </div>
                <div>
                  <div className="text-2xl font-black">15-20h</div>
                  <div className="text-xs text-green-200">Economizadas/mês</div>
                </div>
                <div>
                  <div className="text-2xl font-black">R$ 750+</div>
                  <div className="text-xs text-green-200">Economia mão-de-obra</div>
                </div>
                <div>
                  <div className="text-2xl font-black">10-15h</div>
                  <div className="text-xs text-green-200">Economizadas DIMOB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selling Questions */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold mb-4">
                <Lightbulb className="w-4 h-4" />
                Perguntas que Vendem
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Faça o cliente pensar
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sellingQuestions.map((item, index) => (
                <div key={index} className="p-6 rounded-2xl border-2 border-border hover:border-secondary/30 transition-all">
                  <h3 className="text-lg font-bold mb-2 text-foreground">"{item.question}"</h3>
                  <p className="text-sm text-muted-foreground">{item.insight}</p>
                </div>
              ))}
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
              Adicione Inteligência, Assinatura e Cash para maximizar receita.
              Combine em um Kombo e ganhe até 20% de desconto!
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
