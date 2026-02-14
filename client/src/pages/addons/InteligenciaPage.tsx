import { Link } from "wouter";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Brain, BarChart3, TrendingUp, PieChart, ArrowRight, Calculator, Lightbulb } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Pricing data based on the official table
const pricingData = {
  sections: [
    {
      title: "Investimento",
      rows: [
        {
          feature: "Licença mensal (plano anual)",
          value: "R$ 297/mês",
          highlight: true,
        },
        {
          feature: "Implantação/Treinamento (única)",
          value: "R$ 497",
        },
        {
          feature: "Produtos atendidos",
          value: "IMOB e LOC",
          tooltip: "Funciona com Kenlo IMOB e/ou Kenlo Locação",
        },
      ],
    },
    {
      title: "Funcionalidades Incluídas",
      rows: [
        {
          feature: "Relatórios básicos de performance",
          value: true,
        },
        {
          feature: "Preço por m² (IMOB)",
          value: true,
          tooltip: "Análise de preço por metro quadrado para vendas",
        },
        {
          feature: "Relatórios por safra (IMOB)",
          value: true,
          tooltip: "Análise de performance por período de captação",
        },
        {
          feature: "Comparação com o mercado (IMOB)",
          value: true,
          tooltip: "Benchmark com dados do mercado imobiliário",
        },
        {
          feature: "Explorer",
          value: true,
          tooltip: "Ferramenta de exploração de dados avançada",
        },
      ],
    },
  ],
};

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

export default function InteligenciaPage() {
  const { theadRef } = useStickyHeader();
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
      return <span className="text-lg font-bold text-secondary">{row.value}</span>;
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
              ADD-ON • IMOB + LOCAÇÃO
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Inteligência
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Powered by <span className="font-semibold text-foreground">Google Looker Pro</span> — usuários ilimitados para toda sua equipe.
              A ferramenta indispensável para quem quer fazer gestão com dados reais da sua imobiliária.
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
              Valor único com <span className="font-semibold text-foreground">usuários ilimitados</span>. Funciona com Kenlo IMOB e/ou Kenlo Locação.
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
                        <span className="font-bold text-lg">Inteligência</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricingData.sections.map((section, sectionIndex) => (
                    <>
                      <tr key={`section-${sectionIndex}`} className="bg-muted/30">
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
                          <td className="py-4 px-4 text-center">
                            {renderValue(row)}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
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
              Combine Kenlo Inteligência com outros produtos e ganhe até 20% de desconto.
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
