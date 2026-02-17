import { Link } from "wouter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import React, { useMemo } from "react";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Banknote, Clock, TrendingUp, Users, Wallet, ArrowRight, Calculator, Handshake, ShieldCheck, Landmark, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import pricingValues from "@shared/pricing-values.json";

// ============================================================================
// DYNAMIC PRICING DATA BUILDER
// ============================================================================

const cash = pricingValues.addons.cash;

function buildPricingData() {
  return [
    {
      title: "Investimento",
      rows: [
        {
          feature: "Licença mensal",
          value: cash.annualPrice === 0 ? "Sem custo" : `R$ ${cash.annualPrice}`,
          highlight: true,
          tooltip: "Não há mensalidade para ativar o Kenlo Cash",
        },
        {
          feature: "Implantação (única)",
          value: cash.implementation === 0 ? "Sem custo" : `R$ ${cash.implementation}`,
          tooltip: "Implantação gratuita para todos os clientes",
        },
        {
          feature: "Produtos atendidos",
          value: cash.availability.map((p: string) => p.toUpperCase()).join(" e "),
          tooltip: "Funciona exclusivamente com Kenlo Locação",
        },
      ],
    },
    {
      title: "Condições de Antecipação",
      rows: [
        {
          feature: "Meses antecipáveis",
          value: "Até 24 meses",
          tooltip: "O proprietário pode antecipar de 1 a 24 meses de aluguel",
        },
        {
          feature: "Prazo de aprovação",
          value: "Até 48 horas",
          tooltip: "Análise e liberação do crédito em até 2 dias úteis",
        },
        {
          feature: "Risco para a imobiliária",
          value: "Zero",
          tooltip: "A Kenlo assume 100% do risco da operação de antecipação",
        },
      ],
    },
    {
      title: "Benefícios para a Imobiliária",
      rows: [
        {
          feature: "Comissão por indicação",
          value: true as string | boolean,
          tooltip: "Ganhe comissão por cada antecipação realizada",
        },
        {
          feature: "Fidelização do proprietário",
          value: true as string | boolean,
          tooltip: "Proprietário fica vinculado à sua administradora durante o período",
        },
        {
          feature: "Processo 100% digital",
          value: true as string | boolean,
          tooltip: "Sem papelada — tudo feito pela plataforma",
        },
        {
          feature: "Painel de acompanhamento",
          value: true as string | boolean,
          tooltip: "Acompanhe todas as antecipações em um único painel",
        },
      ],
    },
  ];
}

// ============================================================================
// STATIC DATA
// ============================================================================

const highlights = [
  {
    icon: Banknote,
    title: "Antecipação de Aluguel",
    description: "Proprietário recebe até 24 meses de aluguel adiantado — na hora",
  },
  {
    icon: Clock,
    title: "Aprovação em 48h",
    description: "Análise e liberação do crédito em até 2 dias úteis",
  },
  {
    icon: Users,
    title: "Fidelização",
    description: "Proprietário fica vinculado à sua administradora durante o período",
  },
  {
    icon: Wallet,
    title: "Sem Risco",
    description: "A Kenlo assume 100% do risco da operação de antecipação",
  },
];

const useCases = [
  {
    icon: Landmark,
    title: "Captação de Proprietários",
    description: "Ofereça antecipação de aluguel como diferencial competitivo na captação de novos proprietários. Um benefício que nenhum concorrente oferece — e que fideliza na hora.",
  },
  {
    icon: Handshake,
    title: "Fidelização de Carteira",
    description: "Proprietário que antecipa fica vinculado à sua administradora durante todo o período. Reduza churn e aumente a previsibilidade da sua carteira de locação.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Risco Operacional",
    description: "A Kenlo assume 100% do risco de crédito. Se o inquilino não pagar, o problema é nosso. Você oferece o benefício sem nenhuma exposição financeira.",
  },
  {
    icon: TrendingUp,
    title: "Receita por Indicação",
    description: "Ganhe comissão por cada antecipação realizada. Quanto mais proprietários indicar, mais receita extra para sua imobiliária — sem custo e sem esforço.",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function CashPage() {
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
      {/* Breadcrumbs */}
      <div className="container pt-4">
        <Breadcrumbs items={[{ label: "Add-ons", href: "/" }, { label: "Kenlo Cash" }]} />
      </div>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />

        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
              ADD-ON • {cash.availability.map((p: string) => p.toUpperCase()).join(" + ")}
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Cash
            </h1>

            <p className="text-xl text-muted-foreground mb-4">
              Antecipe até 24 meses de aluguel para seus proprietários.
              <span className="font-semibold text-foreground"> Fidelize clientes, ganhe comissão</span> — e a Kenlo assume o risco.
            </p>
            <p className="text-sm text-muted-foreground mb-6 italic">
              "Nenhum concorrente oferece antecipação de aluguel. <strong className="text-secondary">Vantagem competitiva absoluta</strong> para fidelizar proprietários. Sem capital próprio, sem risco, ganhe comissão."
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="text-sm py-1">
                <Banknote className="w-4 h-4 mr-1" />
                Até 24 meses
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <Clock className="w-4 h-4 mr-1" />
                Aprovação em 48h
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Zero risco
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

      {/* Big Numbers */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Grandes Números</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Resultados que falam por si e mostram o poder da antecipação de aluguel.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl border border-border text-center">
              <h3 className="text-3xl font-black text-primary mb-2">24 meses</h3>
              <p className="text-sm text-muted-foreground">de aluguel antecipados para o proprietário</p>
            </div>
            <div className="p-6 rounded-xl border border-border text-center">
              <h3 className="text-3xl font-black text-primary mb-2">R$ 0</h3>
              <p className="text-sm text-muted-foreground">capital necessário da imobiliária</p>
            </div>
            <div className="p-6 rounded-xl border border-border text-center">
              <h3 className="text-3xl font-black text-primary mb-2">Exclusivo</h3>
              <p className="text-sm text-muted-foreground">só na Kenlo - diferencial competitivo real</p>
            </div>
            <div className="p-6 rounded-xl border border-border text-center">
              <h3 className="text-3xl font-black text-primary mb-2">Comissão</h3>
              <p className="text-sm text-muted-foreground">a imobiliária ganha na operação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Positioning Statement */}
      <section className="py-20 bg-card/30">
          <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-transparent border border-secondary/30 mb-6 inline-block">
                      <Star className="w-8 h-8 text-secondary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Posicionamento Único</h2>
                  <blockquote className="text-lg md:text-xl italic text-muted-foreground border-l-4 border-secondary pl-6">
                  "Antecipe até 24 meses de aluguel para proprietários sem usar capital próprio. A Kenlo financia, você ganha comissão. Diferencial competitivo exclusivo que nenhum concorrente oferece."
                  </blockquote>
              </div>
          </div>
      </section>

      {/* Selling Questions */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Perguntas que Vendem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Use estas perguntas para apresentar o Kenlo Cash como diferencial competitivo.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Seus proprietários já pediram antecipação de aluguel?</h3>
                  <p className="text-muted-foreground">
                    É a demanda nº 1 de proprietários. Com Kenlo Cash, você antecipa até 24 meses sem usar capital próprio. A Kenlo financia, você ganha comissão. O proprietário fica, o concorrente perde.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Handshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Quantos proprietários você perdeu para concorrentes que oferecem antecipação?</h3>
                  <p className="text-muted-foreground">
                    Proprietários migram para quem oferece mais serviços. Com Kenlo Cash, você tem um argumento exclusivo de retenção: "Posso antecipar até 24 meses do seu aluguel". Nenhum concorrente sem Kenlo pode dizer isso.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Você gostaria de ganhar comissão sem investir nada?</h3>
                  <p className="text-muted-foreground">
                    Zero capital próprio necessário. A Kenlo financia a antecipação, você intermedia e ganha comissão. É receita extra pura — sem risco, sem investimento, sem complicação.
                  </p>
                </div>
              </div>
            </div>
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
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Casos de Uso</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja como o Kenlo Cash transforma a relação com proprietários e gera receita extra
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((item, index) => (
              <div key={index} className="p-6 rounded-xl border border-border hover:border-secondary/30 hover:shadow-md transition-all">
                <div className="p-3 rounded-xl bg-secondary/10 text-secondary w-fit mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Plano e Preços</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              <span className="font-semibold text-foreground">Sem custo para a imobiliária.</span> Ofereça antecipação e ganhe comissão por indicação.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full border-collapse min-w-[400px]">
                <thead ref={theadRef} className="pricing-sticky-header">
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                      Funcionalidade
                    </th>
                    <th className="text-center py-4 px-4 font-medium text-muted-foreground w-32">
                      Disponível
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricingData.map((section, sectionIndex) => (
                    <React.Fragment key={sectionIndex}>
                      <tr className="border-b border-border">
                        <td colSpan={2} className="py-3 px-4">
                          <h4 className="font-semibold text-lg">{section.title}</h4>
                        </td>
                      </tr>
                      {section.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-border/80 hover:bg-card transition-colors">
                          <td className="py-4 px-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-medium border-b border-dashed border-border cursor-help">{row.feature}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{row.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {renderValue(row)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
