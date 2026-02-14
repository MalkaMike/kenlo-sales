import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Banknote, Clock, TrendingUp, Users, Wallet, ArrowRight, Calculator, Handshake, ShieldCheck, Landmark } from "lucide-react";
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
          feature: "Licença mensal",
          value: "Sem custo",
          highlight: true,
          tooltip: "Não há mensalidade para ativar o Kenlo Cash",
        },
        {
          feature: "Implantação (única)",
          value: "Sem custo",
          tooltip: "Implantação gratuita para todos os clientes",
        },
        {
          feature: "Produtos atendidos",
          value: "LOCAÇÃO",
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
          value: true,
          tooltip: "Ganhe comissão por cada antecipação realizada",
        },
        {
          feature: "Fidelização do proprietário",
          value: true,
          tooltip: "Proprietário fica vinculado à sua administradora durante o período",
        },
        {
          feature: "Processo 100% digital",
          value: true,
          tooltip: "Sem papelada — tudo feito pela plataforma",
        },
        {
          feature: "Painel de acompanhamento",
          value: true,
          tooltip: "Acompanhe todas as antecipações em um único painel",
        },
      ],
    },
  ],
};

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

export default function CashPage() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />
        
        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
              ADD-ON • LOCAÇÃO
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Cash
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Antecipe até 24 meses de aluguel para seus proprietários.
              <span className="font-semibold text-foreground"> Fidelize clientes, ganhe comissão</span> — e a Kenlo assume o risco.
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
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">
                      Categoria / Recurso
                    </th>
                    <th className="text-center py-4 px-4 min-w-[200px]">
                      <div className="flex flex-col items-center">
                        <Banknote className="w-8 h-8 text-secondary mb-2" />
                        <span className="font-bold text-lg">Cash</span>
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

          {/* How it Works */}
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-secondary/10 rounded-xl p-6 border border-secondary/20">
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-secondary" />
                Como Funciona
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Proprietário solicita</p>
                    <p className="text-sm text-muted-foreground">Via plataforma ou diretamente com a imobiliária</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Análise em 48h</p>
                    <p className="text-sm text-muted-foreground">Kenlo avalia o crédito e aprova a antecipação</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Dinheiro na conta</p>
                    <p className="text-sm text-muted-foreground">Proprietário recebe o valor antecipado e fica fidelizado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <TrendingUp className="w-16 h-16 text-secondary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Fidelize proprietários com antecipação
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione Kenlo Cash e ofereça um diferencial competitivo.
              Combine com outros add-ons nos Kombos e economize ainda mais.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/kombos">
                <Button size="lg" variant="outline" className="gap-2">
                  Explorar Kombos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/calculadora">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
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
