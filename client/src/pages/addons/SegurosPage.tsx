import { Link } from "wouter";
import React, { useMemo } from "react";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, DollarSign, Zap, FileText, TrendingUp, ArrowRight, Calculator, Receipt, Users, Handshake, Lightbulb, Target, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SEGUROS_COMMISSION, SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT } from "@shared/pricing-config";
import pricingValues from "@shared/pricing-values.json";

// ============================================================================
// DYNAMIC PRICING DATA BUILDER
// ============================================================================

const seguros = pricingValues.addons.seguros;

// Commission percentages per plan (already divided by 100 in pricing-config)
const commissionPct = {
  prime: `${(pricingValues.variableCosts.segurosCommission.tiers.prime[0].rate * 100).toFixed(0)}%`,
  k: `${(pricingValues.variableCosts.segurosCommission.tiers.k[0].rate * 100).toFixed(0)}%`,
  k2: `${(pricingValues.variableCosts.segurosCommission.tiers.k2[0].rate * 100).toFixed(0)}%`,
};

// Approximate revenue per contract from centralized config
const approxRevenuePerContract = SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT;

function buildPricingData() {
  return [
    {
      title: "Investimento",
      rows: [
        {
          feature: "Licença mensal",
          value: seguros.annualPrice === 0 ? "Sem custo" : `R$ ${seguros.annualPrice}`,
          highlight: true,
          tooltip: "Não há mensalidade para ativar o Kenlo Seguros",
        },
        {
          feature: "Implantação (única)",
          value: seguros.implementation === 0 ? "Sem custo" : `R$ ${seguros.implementation}`,
          tooltip: "Implantação gratuita para todos os clientes",
        },
        {
          feature: "Produtos atendidos",
          value: seguros.availability.map((p: string) => p.toUpperCase()).join(" e "),
          tooltip: "Funciona exclusivamente com Kenlo Locação",
        },
      ],
    },
    {
      title: "Comissão por Plano",
      rows: [
        {
          feature: "Comissão Prime",
          value: commissionPct.prime,
          tooltip: "Percentual de comissão sobre o prêmio do seguro vendido no plano Prime",
        },
        {
          feature: "Comissão K",
          value: commissionPct.k,
          tooltip: "Percentual de comissão sobre o prêmio do seguro vendido no plano K",
        },
        {
          feature: "Comissão K²",
          value: commissionPct.k2,
          tooltip: "Percentual de comissão sobre o prêmio do seguro vendido no plano K²",
        },
      ],
    },
    {
      title: "Receita para a Imobiliária",
      rows: [
        {
          feature: "Receita estimada por contrato/mês",
          value: `A partir de R$ ${approxRevenuePerContract}`,
          highlight: false,
          tooltip: "Estimativa baseada na comissão de 35% sobre o prêmio médio do seguro",
        },
        {
          feature: "Custo para a imobiliária",
          value: "R$ 0,00",
          highlight: false,
          tooltip: "Sem custo — o seguro é cobrado do inquilino via boleto",
        },
      ],
    },
    {
      title: "Funcionalidades Incluídas",
      rows: [
        {
          feature: "Seguro embutido no boleto",
          value: true as string | boolean,
          tooltip: "O valor do seguro é adicionado automaticamente ao boleto do inquilino",
        },
        {
          feature: "Ativação automática com contrato",
          value: true as string | boolean,
          tooltip: "Seguro ativado automaticamente quando o contrato de locação é criado",
        },
        {
          feature: "Cobertura completa",
          value: true as string | boolean,
          tooltip: "Cobertura contra incêndio, danos elétricos, vendaval e mais",
        },
        {
          feature: "Gestão centralizada no painel",
          value: true as string | boolean,
          tooltip: "Acompanhe todos os seguros ativos em um único painel",
        },
        {
          feature: "Relatórios de receita",
          value: true as string | boolean,
          tooltip: "Visualize a receita gerada por seguros mês a mês",
        },
      ],
    },
  ];
}

// ============================================================================
// STATIC DATA
// ============================================================================

const sellingQuestions = [
  {
    icon: Lightbulb,
    question: "Você ganha dinheiro com seguros hoje?",
    answer: "Com Kenlo Seguros, um clique e o inquilino tem seguro no boleto. Você não faz nada. Kenlo te paga 35-45% do prêmio. Receita passiva pura."
  },
  {
    icon: Target,
    question: "Quanto você ganharia com 100 contratos?",
    answer: "Com 50% de adesão e R$ 50-150/contrato/ano em comissão, são R$ 2.500-7.500/ano. Com 500 contratos: R$ 12.500-37.500/ano. Sem fazer NADA."
  },
  {
    icon: Handshake,
    question: "Você conhece a Tokyo Marine?",
    answer: "Uma das maiores seguradoras do Brasil. Parceria exclusiva com Kenlo. Credibilidade e segurança para seus clientes."
  }
];

const bigNumbers = [
    {
        number: "35-45%",
        label: "comissão sobre o prêmio do seguro"
    },
    {
        number: "R$ 0",
        label: "custo de implantação e operação"
    },
    {
        number: "Tokyo Marine",
        label: "uma das maiores seguradoras do Brasil"
    },
    {
        number: "1 clique",
        label: "para ativar seguro no boleto do inquilino"
    }
];

const highlights = [
  {
    icon: Shield,
    title: "Seguro no Boleto",
    description: "Seguro embutido automaticamente no boleto do inquilino — sem esforço",
  },
  {
    icon: DollarSign,
    title: "Receita Passiva",
    description: `Ganhe a partir de R$ ${approxRevenuePerContract} por contrato/mês sem nenhum custo ou trabalho adicional`,
  },
  {
    icon: Zap,
    title: "Ativação Automática",
    description: "Seguro ativado automaticamente com o contrato de locação",
  },
  {
    icon: FileText,
    title: "Gestão Simplificada",
    description: "Acompanhe todos os seguros e receita em um único painel",
  },
];

const useCases = [
  {
    icon: Receipt,
    title: "Receita sem Esforço",
    description: `O seguro é cobrado automaticamente no boleto do inquilino. Você não precisa fazer nada — a receita de ~R$ ${approxRevenuePerContract}/contrato/mês cai na sua conta sem trabalho adicional.`,
  },
  {
    icon: Users,
    title: "Proteção para o Inquilino",
    description: "Ofereça seguro residencial completo para seus inquilinos. Cobertura contra incêndio, danos elétricos, vendaval e mais — tudo integrado ao contrato.",
  },
  {
    icon: Handshake,
    title: "Diferencial Competitivo",
    description: "Destaque-se no mercado oferecendo seguro integrado. Proprietários valorizam imobiliárias que protegem seu patrimônio com soluções modernas.",
  },
  {
    icon: TrendingUp,
    title: "Escala Linear",
    description: `Quanto mais contratos, mais receita. Com 500 contratos ativos, são ~R$ ${500 * approxRevenuePerContract}/mês de receita passiva. Com 1.000, ~R$ ${(1000 * approxRevenuePerContract).toLocaleString("pt-BR")}/mês. Sem teto.`,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function SegurosPage() {
  const { theadRef } = useStickyHeader();
  const pricingData = useMemo(() => buildPricingData(), []);

  const renderValue = (row: { feature: string; value: string | boolean; highlight?: boolean; tooltip?: string }) => {
    if (typeof row.value === "boolean") {
      return row.value ? (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    }

    if (row.highlight) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="text-lg font-bold text-foreground">{row.value}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">investimento</span>
        </span>
      );
    }

    return <span className="font-medium">{row.value}</span>;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />

        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
              ADD-ON • LOCAÇÃO
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Seguros
            </h1>

            <p className="text-xl text-muted-foreground mb-4">
              Seguros embutido no boleto do inquilino.
              Ganhe <span className="font-semibold text-foreground">a partir de R$ {approxRevenuePerContract} por contrato/mês</span> sem esforço — receita passiva garantida.
            </p>
            <p className="text-sm text-muted-foreground mb-6 italic">
              {`"Seguros é o segredo do sucesso da locação. Tokyo Marine embutido no boleto com 35-45% de comissão. R$ 0 de implantação. 100 contratos = R$ ${(approxRevenuePerContract * 100 * 12).toLocaleString('pt-BR')}+/ano."`}
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="text-sm py-1">
                <Shield className="w-4 h-4 mr-1" />
                Seguro no boleto
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <DollarSign className="w-4 h-4 mr-1" />
                Comissão {commissionPct.prime} a {commissionPct.k2}
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <Zap className="w-4 h-4 mr-1" />
                Ativação automática
              </Badge>
            </div>

            <div className="flex gap-4">
              <Link href="/calculadora">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
                  <Calculator className="w-5 h-5" />
                  Simular Cotação
                </Button>
              </Link>
              <Link href="/produtos/locacao">
                <Button size="lg" variant="outline" className="gap-2">
                  Ver Kenlo Locação
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Perguntas que Vendem */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Perguntas que Vendem</h2>
            <p className="mt-4 text-lg text-muted-foreground">Respostas que seus concorrentes não têm e que fecham mais negócios.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {sellingQuestions.map((item, index) => (
              <div key={index} className="p-6 bg-card border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg">{item.question}</h3>
                </div>
                <p className="mt-4 text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big Numbers */}
      <section className="py-12 bg-card/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {bigNumbers.map((item, index) => (
              <div key={index}>
                <p className="text-3xl font-black text-primary">{item.number}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Calculator & Positioning */}
      <section className="py-20">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">Calculadora de Receita Passiva</h3>
            </div>
            <p className="mt-4 text-green-700 dark:text-green-300">Veja um exemplo do potencial de ganho com zero esforço:</p>
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-md text-center font-mono tracking-tight">
                {`100 contratos × 50% adesão × R$ ${approxRevenuePerContract * 12}/ano = `}<span className="font-bold text-green-600">{`R$ ${(100 * 0.5 * approxRevenuePerContract * 12).toLocaleString('pt-BR')}/ano`}</span>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-md text-center font-mono tracking-tight">
                {`500 contratos × 50% adesão × R$ ${approxRevenuePerContract * 12}/ano = `}<span className="font-bold text-green-600">{`R$ ${(500 * 0.5 * approxRevenuePerContract * 12).toLocaleString('pt-BR')}/ano`}</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-center text-green-600 dark:text-green-400">Zero trabalho, zero custo.</p>
          </div>
          <div className="border-l-4 border-primary pl-6">
            <Star className="w-8 h-8 text-yellow-400 mb-4" />
            <blockquote className="text-xl italic text-muted-foreground">
              "Um clique. Inquilino tem seguro no boleto. Você não faz nada. Kenlo te paga 35-45% do prêmio. Zero custo, zero dor de cabeça, receita pura. Talvez seja a razão pela qual nossa plataforma é a mais bem-sucedida há muitos anos."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Como o Kenlo Seguros Transforma sua Operação</h2>
            <p className="mt-4 text-lg text-muted-foreground">Desde a geração de receita passiva até o fortalecimento da sua marca no mercado.</p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {useCases.map((item, index) => (
              <div key={index} className="flex items-start gap-6 p-6 bg-card border rounded-lg">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Investimento e Retorno</h2>
            <p className="mt-4 text-lg text-muted-foreground">Estrutura de preços transparente e focada em gerar receita para sua imobiliária, sem custos escondidos.</p>
          </div>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead ref={theadRef} className="bg-card border-b z-10">
                <tr>
                  {pricingData.map((col, colIndex) => (
                    <th key={colIndex} className="p-4 font-semibold text-left text-foreground">
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricingData[0].rows.map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-card/50">
                    {pricingData.map((col, colIndex) => {
                      const row = col.rows[rowIndex];
                      if (!row) return <td key={colIndex} className="p-4"></td>;

                      return (
                        <td key={colIndex} className="p-4 align-top">
                          {colIndex === 0 ? (
                            <Tooltip>
                              <TooltipTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors cursor-help flex items-center gap-1.5 w-full">
                                {row.feature}
                              </TooltipTrigger>
                              {row.tooltip && <TooltipContent>{row.tooltip}</TooltipContent>}
                            </Tooltip>
                          ) : (
                            <div className="flex justify-start">
                              {renderValue(row as { feature: string; value: string | boolean; highlight?: boolean; tooltip?: string })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
