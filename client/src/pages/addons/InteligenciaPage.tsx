import { Link } from "wouter";
import React, { useMemo } from "react";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Brain, BarChart3, TrendingUp, PieChart, ArrowRight, Calculator, Lightbulb, Target, Award, Eye, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ADDONS } from "@shared/pricing-config";

// ============================================================================
// DYNAMIC PRICING DATA BUILDER
// ============================================================================

const intel = ADDONS.inteligencia;

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

function buildPricingData() {
  return [
    {
      title: "Investimento",
      rows: [
        {
          feature: "Licença mensal (plano anual)",
          value: `${formatCurrency(intel.annualPrice)}/mês`,
          highlight: true,
          tooltip: undefined as string | undefined,
        },
        {
          feature: "Implantação/Treinamento (única)",
          value: formatCurrency(intel.implementation),
          tooltip: undefined as string | undefined,
        },
        {
          feature: "Produtos atendidos",
          value: intel.availableFor.map((p) => p.toUpperCase()).join(" e "),
          tooltip: `Funciona com Kenlo ${intel.availableFor.map((p) => p.toUpperCase()).join(" e/ou Kenlo ")}`,
        },
      ],
    },
    {
      title: "Funcionalidades Incluídas",
      rows: [
        {
          feature: "Relatórios básicos de performance",
          value: true as string | boolean,
          tooltip: undefined as string | undefined,
        },
        {
          feature: "Preço por m² (IMOB)",
          value: true as string | boolean,
          tooltip: "Análise de preço por metro quadrado para vendas",
        },
        {
          feature: "Relatórios por safra (IMOB)",
          value: true as string | boolean,
          tooltip: "Análise de performance por período de captação",
        },
        {
          feature: "Comparação com o mercado (IMOB)",
          value: true as string | boolean,
          tooltip: "Benchmark com dados do mercado imobiliário",
        },
        {
          feature: "Explorer",
          value: true as string | boolean,
          tooltip: "Ferramenta de exploração de dados avançada",
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
    icon: BarChart3,
    title: "Google Looker Pro",
    description: "A mesma plataforma de BI usada por grandes empresas — agora na sua imobiliária",
  },
  {
    icon: TrendingUp,
    title: "Usuários Ilimitados",
    description: "Toda sua equipe com acesso — do corretor ao diretor, sem custo adicional por usuário",
  },
  {
    icon: PieChart,
    title: "Relatórios Próprios",
    description: "Crie e personalize seus próprios dashboards e relatórios com total liberdade",
  },
  {
    icon: Lightbulb,
    title: "Decisões com Dados",
    description: "Pare de adivinhar — tome decisões estratégicas baseadas em dados reais da sua operação",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function InteligenciaPage() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              ADD-ON • {intel.availableFor.map((p) => p.toUpperCase()).join(" + ")}
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {intel.name}
            </h1>

            <p className="text-xl text-muted-foreground mb-4">
              Powered by <span className="font-semibold text-foreground">Google Looker Pro</span> — usuários ilimitados para toda sua equipe.
              A ferramenta indispensável para quem quer fazer gestão com dados reais da sua imobiliária.
            </p>
            <p className="text-sm text-muted-foreground mb-6 italic">
              "Kenlo é <strong className="text-primary">1 de 12 empresas</strong> selecionadas pelo Google como parceira estratégica em real estate. É aqui que você mais brilha na demo."
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="text-sm py-1">
                <BarChart3 className="w-4 h-4 mr-1" />
                Google Looker Pro
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Usuários ilimitados
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <PieChart className="w-4 h-4 mr-1" />
                Crie seus próprios relatórios
              </Badge>
            </div>

            <div className="flex gap-4">
              <Link href="/calculadora">
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
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
              <div key={index} className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
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

      {/* Pricing Table */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Plano e Preços</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Valor único com <span className="font-semibold text-foreground">usuários ilimitados</span>. Funciona com Kenlo {intel.availableFor.map((p) => p.toUpperCase()).join(" e/ou Kenlo ")}.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full border-collapse min-w-[400px]">
                <thead ref={theadRef} className="pricing-sticky-header">
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                      Categoria / Recurso
                    </th>
                    <th className="text-center py-4 px-4 min-w-[200px]">
                      <div className="flex flex-col items-center">
                        <Brain className="w-8 h-8 text-primary mb-2" />
                        <span className="font-bold text-lg">{intel.name}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricingData.map((section, sectionIndex) => (
                    <React.Fragment key={`section-${sectionIndex}`}>
                      <tr className="bg-muted/30">
                        <td
                          colSpan={2}
                          className="py-3 px-4 font-semibold text-foreground"
                        >
                          {section.title}
                        </td>
                      </tr>
                      {section.rows.map((row, rowIndex) => (
                        <tr
                          key={`row-${sectionIndex}-${rowIndex}`}
                          className="border-b border-border/50 pricing-row"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span>{row.feature}</span>
                              {row.tooltip && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="text-muted-foreground hover:text-foreground cursor-help">
                                      ⓘ
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{row.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center pricing-table-text">
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

      {/* Key Reports Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-4">
                <Award className="w-4 h-4" />
                Relatórios Exclusivos
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                2 relatórios que mudam o jogo
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* SAFRA Report */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-600 text-white">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900">Relatório SAFRA</h3>
                </div>
                <p className="text-sm text-blue-800 mb-4">
                  Mostra o funil completo: quantos leads entraram, quantos viraram visitas, quantos viraram propostas, quantos fecharam.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Identifica onde está o gargalo da operação</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Compara performance por corretor</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Responde: "Preciso de mais leads ou melhor conversão?"</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-200/50 rounded-lg">
                  <p className="text-xs text-blue-900 font-medium">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Caso real: cliente descobriu que sua melhor campanha era completamente diferente do que pensava. Mudou a estratégia e aumentou fechamentos em 40%.
                  </p>
                </div>
              </div>

              {/* Performance vs Market Report */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-purple-600 text-white">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-900">Performance vs Mercado</h3>
                </div>
                <p className="text-sm text-purple-800 mb-4">
                  Compara a imobiliária com a média da Comunidade Kenlo. O "reality check" que todo gestor precisa.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span>Taxa de conversão vs média (4,5% vendas / 7,5% locação)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span>Tempo de fechamento vs benchmark</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Check className="w-4 h-4 text-purple-600" />
                    <span>Distribuição de leads por origem vs mercado</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-200/50 rounded-lg">
                  <p className="text-xs text-purple-900 font-medium">
                    <Lightbulb className="w-3 h-3 inline mr-1" />
                    Pergunta-chave: "Você sabe se está acima ou abaixo da média do mercado?" — 80% não sabem.
                  </p>
                </div>
              </div>
            </div>

            {/* Google Partnership Badge */}
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
              <div className="text-lg font-bold mb-2">Parceria Estratégica Google</div>
              <div className="text-4xl font-black mb-2">1 de 12 empresas</div>
              <p className="text-sm text-white/80">selecionadas pelo Google como parceira em real estate no Brasil. Google Looker Studio Pro integrado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kombos CTA */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Brain className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Economize com Kombos
            </h2>
            <p className="text-muted-foreground mb-6">
              Combine {intel.name} com outros produtos e ganhe até 20% de desconto.
              O Kombo Imob Pro inclui Inteligência + Leads + Assinatura!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/kombos">
                <Button size="lg" variant="outline" className="gap-2">
                  Explorar Kombos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/calculadora">
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                  <Calculator className="w-5 h-5" />
                  Simular Cotação
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
