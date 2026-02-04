import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Building2, Users, Globe, Smartphone, BarChart3, ArrowRight, Calculator, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Pricing data based on the official table
const pricingData = {
  plans: ["Prime", "K", "K2"],
  sections: [
    {
      title: "Investimento",
      rows: [
        {
          feature: "Licença mensal (plano anual)",
          type: "price",
          values: ["R$ 247/mês", "R$ 497/mês", "R$ 1.197/mês"],
          highlight: true,
        },
        {
          feature: "Taxa de implantação (única)",
          type: "price",
          values: ["R$ 1.497", "R$ 1.497", "R$ 1.497"],
        },
        {
          feature: "Usuários inclusos",
          type: "text",
          values: ["2", "7", "14"],
        },
      ],
    },
    {
      title: "Funcionalidades",
      rows: [
        {
          feature: "Funcionalidades básicas de CRM",
          type: "check",
          values: [true, true, true],
        },
        {
          feature: "App Corretor",
          type: "check",
          values: [true, true, true],
        },
        {
          feature: "Landing Page",
          type: "check",
          values: [false, true, true],
        },
        {
          feature: "Blog",
          type: "check",
          values: [false, false, true],
        },
        {
          feature: "Treinamentos online",
          tooltip: "Valor de referência R$ 2.000 por unidade",
          type: "text",
          values: ["—", "—", "2x por ano"],
        },
        {
          feature: "Acesso à API Imob",
          tooltip: "Disponível a partir de Março 2026",
          type: "check",
          values: [false, false, true],
        },
      ],
    },
    {
      title: "Serviços Premium",
      rows: [
        {
          feature: "Suporte VIP",
          type: "mixed",
          values: ["Opcional", "Incluído", "Incluído"],
        },
        {
          feature: "Customer Success dedicado",
          type: "mixed",
          values: ["Opcional", "Opcional", "Incluído"],
        },
      ],
    },
    {
      title: "Usuários Adicionais (pós-pago)",
      rows: [
        {
          feature: "Custo por usuário adicional",
          type: "complex",
          values: [
            "R$ 57/usuário fixo",
            "1-10: R$ 47\n11+: R$ 37",
            "1-10: R$ 47\n11-50: R$ 37\n51+: R$ 27",
          ],
        },
      ],
    },
  ],
};

const highlights = [
  {
    icon: Building2,
    title: "CRM Completo",
    description: "Gestão de leads, funil de vendas e relatórios avançados",
  },
  {
    icon: Globe,
    title: "Site Incluso",
    description: "Website profissional otimizado para Google",
  },
  {
    icon: Smartphone,
    title: "App Corretor",
    description: "Cadastre imóveis e receba leads no celular",
  },
  {
    icon: BarChart3,
    title: "+50 Portais",
    description: "Publicação automática em todos os portais",
  },
];

export default function ImobPage() {
  type PricingRow = {
    feature: string;
    type: string;
    values: (string | boolean)[];
    highlight?: boolean;
    tooltip?: string;
  };

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
      return <span className="text-muted-foreground text-sm">Opcional: pagar à parte</span>;
    }
    
    if (row.type === "complex") {
      const lines = (value as string).split("\n");
      return (
        <div className="text-xs space-y-0.5">
          {lines.map((line, i) => (
            <div key={i} className={i === 0 ? "font-medium" : "text-muted-foreground"}>
              {line}
            </div>
          ))}
        </div>
      );
    }
    
    if (row.type === "price" && row.highlight) {
      return <span className="font-bold text-primary">{value}</span>;
    }
    
    return <span className={row.type === "price" ? "font-medium" : ""}>{value}</span>;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        
        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              CRM + SITE PARA VENDAS
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Imob
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              CRM completo para imobiliárias com Site e App incluídos. 
              Todos os seus leads em um só lugar.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>8.500+ imobiliárias</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-primary" />
                <span>+50 portais integrados</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span>3.5M imóveis na plataforma</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
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
              <div key={index} className="flex gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit">
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

      {/* Pricing Table Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos e Preços</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o tamanho da sua imobiliária. Todos os valores são para pagamento anual.
            </p>
          </div>
          
          {/* Pricing Table */}
          <div className="max-w-5xl mx-auto">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full border-collapse min-w-[600px]">
                {/* Header */}
                <thead>
                  <tr>
                    <th className="text-left p-4 bg-muted/30 rounded-tl-lg w-[40%]">
                      <span className="text-sm font-medium text-muted-foreground">Categoria / Recurso</span>
                    </th>
                    {pricingData.plans.map((plan, index) => (
                      <th 
                        key={plan} 
                        className={`p-4 text-center bg-muted/30 ${index === pricingData.plans.length - 1 ? 'rounded-tr-lg' : ''}`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span className={`kenlo-badge ${
                            plan === "Prime" ? "kenlo-badge-prime" : 
                            plan === "K" ? "kenlo-badge-k" : "kenlo-badge-k2"
                          }`}>
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
                    <>
                      {/* Section Header */}
                      <tr key={`section-${sectionIndex}`}>
                        <td 
                          colSpan={4} 
                          className="p-3 bg-primary/5 font-semibold text-primary border-t border-border/40"
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
                          className="border-b border-border/20 hover:bg-muted/10 transition-colors"
                        >
                          <td className="p-4 text-sm">
                            <div className="flex items-center gap-2">
                              {typedRow.feature}
                              {typedRow.tooltip && (                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs max-w-[200px]">{typedRow.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                          {pricingData.plans.map((_, planIndex) => (
                            <td 
                              key={planIndex} 
                              className="p-4 text-center text-sm"
                            >
                              {renderValue(typedRow, planIndex)}
                            </td>
                          ))}
                        </tr>
                      );})}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Example calculation */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Exemplo de cálculo (Plano K):</strong> Se a imobiliária tiver 20 usuários adicionais, 
                paga 10 × R$ 47 + 10 × R$ 37 = <strong>R$ 840/mês</strong> em usuários adicionais.
              </p>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/calculadora">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                <Calculator className="w-5 h-5" />
                Criar Orçamento Personalizada
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Plan Comparison - Add-on Impact */}
      <section className="py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Comparação de Planos - Add-ons IMOB</h2>
            <p className="text-sm text-muted-foreground">
              Veja como cada plano impacta o custo dos add-ons específicos do Kenlo Imob
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-2 px-3 font-semibold">Add-on</th>
                    <th className="text-center py-2 px-3 font-semibold text-primary">Prime</th>
                    <th className="text-center py-2 px-3 font-semibold text-blue-600">K</th>
                    <th className="text-center py-2 px-3 font-semibold text-purple-600">K2</th>
                    <th className="text-center py-2 px-3 font-semibold text-green-600">Economia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/40">
                    <td className="py-2 px-3 font-medium">Usuários Adicionais</td>
                    <td className="py-2 px-3 text-center text-xs">R$ 57/un</td>
                    <td className="py-2 px-3 text-center text-xs">R$ 47 (1-10)<br/>R$ 37 (11+)</td>
                    <td className="py-2 px-3 text-center text-xs font-semibold">R$ 47 (1-10)<br/>R$ 37 (11-50)<br/>R$ 27 (51+)</td>
                    <td className="py-2 px-3 text-center text-green-600 font-semibold">53%</td>
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="py-2 px-3 font-medium">Leads (WhatsApp)</td>
                    <td className="py-2 px-3 text-center text-xs">R$ 2,00/msg</td>
                    <td className="py-2 px-3 text-center text-xs">R$ 2,00/msg</td>
                    <td className="py-2 px-3 text-center text-xs font-semibold">R$ 2,00/msg</td>
                    <td className="py-2 px-3 text-center text-gray-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-900">
                <strong>Insight:</strong> Planos superiores (K ou K2) reduzem significativamente o custo por unidade. Quanto mais você digitaliza, menor o impacto dos add-ons.
              </p>
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
              Adicione Leads, Inteligência e Assinatura para maximizar resultados. 
              Combine em um Kombo e ganhe até 20% de desconto!
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
                Combine Kenlo Imob com add-ons e ganhe até 20% de desconto. 
                O Kombo Elite inclui todos os produtos e serviços premium!
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
