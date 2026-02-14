import { Link } from "wouter";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, DollarSign, Zap, FileText, TrendingUp, ArrowRight, Calculator, Receipt, Users, Handshake } from "lucide-react";
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
          tooltip: "Não há mensalidade para ativar o Kenlo Seguros",
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
      title: "Receita para a Imobiliária",
      rows: [
        {
          feature: "Receita por contrato/mês",
          value: "R$ 10,00",
          highlight: false,
          tooltip: "Receita fixa por contrato ativo com seguro",
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
          value: true,
          tooltip: "O valor do seguro é adicionado automaticamente ao boleto do inquilino",
        },
        {
          feature: "Ativação automática com contrato",
          value: true,
          tooltip: "Seguro ativado automaticamente quando o contrato de locação é criado",
        },
        {
          feature: "Cobertura completa",
          value: true,
          tooltip: "Cobertura contra incêndio, danos elétricos, vendaval e mais",
        },
        {
          feature: "Gestão centralizada no painel",
          value: true,
          tooltip: "Acompanhe todos os seguros ativos em um único painel",
        },
        {
          feature: "Relatórios de receita",
          value: true,
          tooltip: "Visualize a receita gerada por seguros mês a mês",
        },
      ],
    },
  ],
};

const highlights = [
  {
    icon: Shield,
    title: "Seguro no Boleto",
    description: "Seguro embutido automaticamente no boleto do inquilino — sem esforço",
  },
  {
    icon: DollarSign,
    title: "Receita Passiva",
    description: "Ganhe R$ 10 por contrato/mês sem nenhum custo ou trabalho adicional",
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
    description: "O seguro é cobrado automaticamente no boleto do inquilino. Você não precisa fazer nada — a receita de R$ 10/contrato/mês cai na sua conta sem trabalho adicional.",
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
    description: "Quanto mais contratos, mais receita. Com 500 contratos ativos, são R$ 5.000/mês de receita passiva. Com 1.000, R$ 10.000/mês. Sem teto.",
  },
];

export default function SegurosPage() {
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
            
            <p className="text-xl text-muted-foreground mb-6">
              Seguros embutido no boleto do inquilino.
              Ganhe <span className="font-semibold text-foreground">R$ 10 por contrato/mês</span> sem esforço — receita passiva garantida.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="text-sm py-1">
                <Shield className="w-4 h-4 mr-1" />
                Seguro no boleto
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <DollarSign className="w-4 h-4 mr-1" />
                R$ 10/contrato/mês
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
              Veja como o Kenlo Seguros gera receita passiva e protege sua carteira
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
              <span className="font-semibold text-foreground">Sem custo para a imobiliária.</span> O seguro é cobrado do inquilino e você ganha R$ 10/contrato/mês.
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
                        <Shield className="w-8 h-8 text-secondary mb-2" />
                        <span className="font-bold text-lg">Seguros</span>
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
                          <td className="py-4 px-4 text-center pricing-table-text">
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

          {/* Revenue Simulation */}
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-secondary/10 rounded-xl p-6 border border-green-200">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-secondary" />
                Simulação de Receita
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-muted-foreground">100 contratos ativos</span>
                  <span className="font-semibold text-green-700">R$ 1.000/mês</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-muted-foreground">300 contratos ativos</span>
                  <span className="font-semibold text-green-700">R$ 3.000/mês</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="text-muted-foreground">500 contratos ativos</span>
                  <span className="font-semibold text-green-700">R$ 5.000/mês</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">1.000 contratos ativos</span>
                  <span className="font-bold text-lg text-green-700">R$ 10.000/mês</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Receita anual com 500 contratos: <strong>R$ 60.000</strong> — sem custo, sem esforço.
              </p>
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
              Gere receita passiva com seguros
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione Kenlo Seguros e ganhe R$ 10 por contrato/mês.
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
