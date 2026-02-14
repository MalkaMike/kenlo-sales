import { Link } from "wouter";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Zap, Clock, Target, MessageSquare, ArrowRight, Calculator, Bot, Globe, Repeat, BarChart3 } from "lucide-react";
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
          value: "R$ 497/mês",
          highlight: true,
          tooltip: undefined,
        },
        {
          feature: "Implantação/Treinamento (única)",
          value: "R$ 497",
          tooltip: undefined,
        },
        {
          feature: "Produtos atendidos",
          value: "IMOB",
          tooltip: "Funciona exclusivamente com Kenlo IMOB",
        },
      ],
    },
    {
      title: "Opções de Atendimento",
      rows: [
        {
          feature: "Sem WhatsApp",
          value: "Leads distribuídos ilimitados",
          tooltip: "Distribuição automática de leads sem limite de quantidade",
        },
        {
          feature: "Com WhatsApp",
          value: "100 leads/mês via WhatsApp",
          tooltip: "Pré-atendimento automatizado via WhatsApp incluído na carência",
        },
      ],
    },
    {
      title: "Leads Adicionais via WhatsApp (pós-pago)",
      rows: [
        {
          feature: "1 a 200 leads",
          value: "R$ 2,00/lead",
          tooltip: undefined,
        },
        {
          feature: "201 a 350 leads",
          value: "R$ 1,80/lead",
          tooltip: undefined,
        },
        {
          feature: "351 a 1.000 leads",
          value: "R$ 1,50/lead",
          tooltip: undefined,
        },
        {
          feature: "Acima de 1.000 leads",
          value: "R$ 1,20/lead",
          tooltip: undefined,
        },
      ],
    },
    {
      title: "Funcionalidades Incluídas",
      rows: [
        {
          feature: "Distribuição automática de leads",
          value: true,
          tooltip: "Leads distribuídos por região, especialidade ou rodízio",
        },
        {
          feature: "Redistribuição por tempo de resposta",
          value: true,
          tooltip: "Lead não atendido em 5 min é redistribuído automaticamente",
        },
        {
          feature: "Integração com portais imobiliários",
          value: true,
          tooltip: "Captação automática de leads dos principais portais",
        },
        {
          feature: "Integração com redes sociais",
          value: true,
          tooltip: "Leads vindos de Facebook, Instagram e Google Ads",
        },
        {
          feature: "Qualificação por score",
          value: true,
          tooltip: "Score baseado em comportamento e interesse do lead",
        },
        {
          feature: "Integração com IA externa",
          value: true,
          tooltip: "Parceiro homologado (Ex: Lais, Harry). Não requer WhatsApp.",
        },
      ],
    },
  ],
};

const highlights = [
  {
    icon: Zap,
    title: "Distribuição Automática",
    description: "Leads distribuídos por região, especialidade ou rodízio — sem intervenção manual",
  },
  {
    icon: Clock,
    title: "Tempo de Resposta",
    description: "Lead não atendido em 5 min? Redistribuído automaticamente para o próximo corretor",
  },
  {
    icon: Target,
    title: "Qualificação Inteligente",
    description: "Score baseado em comportamento e interesse — priorize quem está pronto para comprar",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integrado",
    description: "Pré-atendimento automatizado via WhatsApp com 100 leads/mês incluídos",
  },
];

const useCases = [
  {
    icon: Globe,
    title: "Captação Multi-canal",
    description: "Receba leads de portais, redes sociais, Google Ads e site próprio em um único lugar. Nunca mais perca um lead por falta de integração.",
  },
  {
    icon: Repeat,
    title: "Rodízio Inteligente",
    description: "Configure regras de distribuição por região, tipo de imóvel ou rodízio. Garanta que cada corretor receba leads qualificados para seu perfil.",
  },
  {
    icon: Bot,
    title: "IA + WhatsApp",
    description: "Combine pré-atendimento via WhatsApp ou IA parceira (Lais, Harry) para qualificar leads antes de chegar ao corretor. Mais conversão, menos esforço.",
  },
  {
    icon: BarChart3,
    title: "Métricas de Conversão",
    description: "Acompanhe taxa de conversão por corretor, canal e região. Identifique gargalos e otimize sua operação com dados reais.",
  },
];

export default function LeadsPage() {
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
              ADD-ON • IMOB
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Leads
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Gestão automatizada de leads com distribuição inteligente.
              Atenda em segundos, nunca perca uma oportunidade — <span className="font-semibold text-foreground">zero leads perdidos, máxima conversão</span>.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="text-sm py-1">
                <Zap className="w-4 h-4 mr-1" />
                Distribuição automática
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <MessageSquare className="w-4 h-4 mr-1" />
                WhatsApp integrado
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <Bot className="w-4 h-4 mr-1" />
                Integração com IA
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

      {/* Use Cases */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Casos de Uso</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja como o Kenlo Leads transforma a captação e conversão da sua imobiliária
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((item, index) => (
              <div key={index} className="p-6 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
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
              Modelo transparente com preços por faixas. <span className="font-semibold text-foreground">Quanto mais leads, menor o custo por unidade.</span>
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
                        <Users className="w-8 h-8 text-primary mb-2" />
                        <span className="font-bold text-lg">Leads</span>
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
            
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Exemplo de cálculo:</strong> Se a imobiliária tiver 500 leads adicionais/mês via WhatsApp, 
                paga 200 × R$ 2,00 + 150 × R$ 1,80 + 150 × R$ 1,50 = <strong>R$ 895/mês</strong> em leads adicionais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kombos CTA */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Users className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Economize com Kombos
            </h2>
            <p className="text-muted-foreground mb-6">
              Combine Kenlo Leads com outros produtos e ganhe até 20% de desconto.
              O Kombo Imob Start inclui IMOB + Leads + Assinatura com 10% OFF!
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
