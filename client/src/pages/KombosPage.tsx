import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, FileText, ArrowRight, Star, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Kombo definitions with all details
const kombos = [
  {
    id: "imob-start",
    name: "Imob Start",
    shortDesc: "Vendas digitais",
    discount: 10,
    badge: null,
    color: "bg-blue-500",
    includesPremium: false,
    tooltip: "IMOB + Leads + Assinatura. Ideal para imobiliárias focadas em vendas que querem captar e converter leads.",
  },
  {
    id: "imob-pro",
    name: "Imob Pro",
    shortDesc: "Máxima performance",
    discount: 15,
    badge: "POPULAR",
    color: "bg-primary",
    includesPremium: true,
    tooltip: "IMOB + Leads + Inteligência + Assinatura + VIP + CS. Para quem quer maximizar conversão com dados.",
  },
  {
    id: "locacao-pro",
    name: "Locação Pro",
    shortDesc: "Gestão inteligente",
    discount: 10,
    badge: null,
    color: "bg-green-500",
    includesPremium: true,
    tooltip: "LOC + Inteligência + Assinatura + VIP + CS. Para administradoras e imobiliárias focadas em locação.",
  },
  {
    id: "core-gestao",
    name: "Core Gestão",
    shortDesc: "Vendas + Locação",
    discount: 0,
    badge: null,
    color: "bg-purple-500",
    includesPremium: true,
    tooltip: "IMOB + LOC sem add-ons, mas com VIP + CS incluídos. Para quem quer plataforma unificada.",
  },
  {
    id: "elite",
    name: "Elite",
    shortDesc: "Solução completa",
    discount: 20,
    badge: "MELHOR",
    color: "bg-amber-500",
    includesPremium: true,
    tooltip: "IMOB + LOC + Todos os add-ons + VIP + CS. Máxima digitalização e vantagem competitiva.",
  },
];

// Feature comparison data
const comparisonData = {
  sections: [
    {
      title: "Produtos Core",
      rows: [
        { feature: "Kenlo IMOB (CRM + Site)", values: [true, true, false, true, true], tooltip: "" },
        { feature: "Kenlo Locação (ERP)", values: [false, false, true, true, true], tooltip: "" },
      ],
    },
    {
      title: "Add-ons Incluídos",
      rows: [
        { feature: "Kenlo Leads", values: [true, true, false, false, true], tooltip: "" },
        { feature: "Kenlo Inteligência", values: [false, true, true, false, true], tooltip: "" },
        { feature: "Kenlo Assinatura", values: [true, true, true, false, true], tooltip: "" },
        { feature: "Kenlo Pay", values: [false, false, false, false, true], tooltip: "" },
        { feature: "Kenlo Seguros", values: [false, false, false, false, true], tooltip: "" },
        { feature: "Kenlo Cash", values: [false, false, false, false, true], tooltip: "" },
      ],
    },
    {
      title: "Serviços Premium",
      rows: [
        { feature: "Suporte VIP", values: [false, true, true, true, true], tooltip: "Atendimento prioritário com SLA reduzido" },
        { feature: "CS Dedicado", values: [false, true, true, true, true], tooltip: "Customer Success exclusivo para sua conta" },
      ],
    },
    {
      title: "Implantação",
      rows: [
        { feature: "Taxa única", values: ["R$ 1.497", "R$ 1.497", "R$ 1.497", "R$ 1.497", "R$ 1.497"], tooltip: "" },
        { feature: "Implantações ofertadas", values: ["Leads", "Leads + BI", "BI", "IMOB", "IMOB + Leads + BI"], tooltip: "Implantações que seriam cobradas à parte, mas estão inclusas no Kombo" },
      ],
    },
  ],
};

export default function KombosPage() {
  const renderValue = (value: boolean | string, komboIndex: number) => {
    if (typeof value === "boolean") {
      return value ? (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-5 h-5 text-red-400" />
          </div>
        </div>
      );
    }
    return <span className="font-medium text-sm">{value}</span>;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Kombos Kenlo
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Quanto mais você digitaliza,{" "}
              <span className="kenlo-gradient-text">menor o custo</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Kombos são pacotes inteligentes que combinam produtos e add-ons com descontos de até 20%. 
              Compare e escolha o ideal para cada imobiliária.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2" asChild>
                <Link href="/calculadora">
                  <FileText className="w-5 h-5" />
                  Criar Cotação
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Comparison Cards */}
      <section className="py-12 border-b border-border/40">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {kombos.map((kombo) => (
              <div
                key={kombo.id}
                className="relative p-4 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-colors bg-card"
              >
                {kombo.badge && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2">
                    {kombo.badge}
                  </Badge>
                )}
                <div className={`w-10 h-10 rounded-lg ${kombo.color} flex items-center justify-center mb-3 mx-auto`}>
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-center text-sm mb-1">{kombo.name}</h3>
                <p className="text-xs text-muted-foreground text-center mb-2">{kombo.shortDesc}</p>
                <div className="text-center">
                  {kombo.discount > 0 ? (
                    <span className="text-lg font-bold text-primary">{kombo.discount}% OFF</span>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">Tabela</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comparativo Completo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja exatamente o que cada Kombo inclui. Todos têm implantação única de R$ 1.497.
            </p>
          </div>
          
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground w-[200px]">
                    Recurso
                  </th>
                  {kombos.map((kombo) => (
                    <th key={kombo.id} className="py-4 px-2 min-w-[140px]">
                      <div className="flex flex-col items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`w-10 h-10 rounded-lg ${kombo.color} flex items-center justify-center mb-2 cursor-help`}>
                              <Star className="w-5 h-5 text-white" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>{kombo.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="font-bold text-sm">{kombo.name}</span>
                        {kombo.badge && (
                          <Badge className="mt-1 bg-primary/10 text-primary text-[10px] px-2">
                            {kombo.badge}
                          </Badge>
                        )}
                        <div className="mt-2">
                          {kombo.discount > 0 ? (
                            <span className="text-lg font-bold text-primary">{kombo.discount}% OFF</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Preço tabela</span>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.sections.map((section, sectionIndex) => (
                  <>
                    <tr key={`section-${sectionIndex}`} className="bg-muted/30">
                      <td
                        colSpan={6}
                        className="py-3 px-4 font-semibold text-foreground"
                      >
                        {section.title}
                      </td>
                    </tr>
                    {section.rows.map((row, rowIndex) => (
                      <tr
                        key={`row-${sectionIndex}-${rowIndex}`}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{row.feature}</span>
                            {row.tooltip && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{row.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        {row.values.map((value, valueIndex) => (
                          <td key={valueIndex} className="py-4 px-2 text-center">
                            {renderValue(value, valueIndex)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Ideal For Section */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Qual Kombo é Ideal?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada Kombo foi pensado para um perfil específico de imobiliária
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl bg-card border border-border/50">
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Imob Start</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Imobiliárias focadas em vendas que precisam captar leads e digitalizar contratos. 
                Ideal para quem está começando a transformação digital.
              </p>
              <div className="text-primary font-bold">10% OFF</div>
            </div>
            
            <div className="p-6 rounded-xl bg-card border-2 border-primary/50 relative">
              <Badge className="absolute -top-2 right-4 bg-primary text-white">POPULAR</Badge>
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Imob Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para quem quer maximizar conversão com dados. Inclui BI para decisões estratégicas 
                e suporte premium para crescimento acelerado.
              </p>
              <div className="text-primary font-bold">15% OFF + VIP + CS</div>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border/50">
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Locação Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Administradoras e imobiliárias focadas em locação. Gestão inteligente de contratos 
                com BI e assinatura digital.
              </p>
              <div className="text-primary font-bold">10% OFF + VIP + CS</div>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border/50">
              <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Core Gestão</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Imobiliárias que atuam em vendas E locação. Plataforma unificada com suporte premium 
                incluído. Adicione add-ons conforme necessidade.
              </p>
              <div className="text-muted-foreground font-medium">Preço tabela + VIP + CS</div>
            </div>
            
            <div className="p-6 rounded-xl bg-card border-2 border-amber-500/50 relative md:col-span-2 lg:col-span-1">
              <Badge className="absolute -top-2 right-4 bg-amber-500 text-white">MELHOR</Badge>
              <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Elite</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Máxima digitalização e vantagem competitiva. Todos os produtos, todos os add-ons, 
                suporte premium. Para quem quer liderar o mercado.
              </p>
              <div className="text-primary font-bold">20% OFF + VIP + CS</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para montar a proposta ideal?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Use nosso gerador de cotaçãos para simular diferentes Kombos e ver os preços em tempo real
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 gap-2" asChild>
              <Link href="/calculadora">
                <FileText className="w-5 h-5" />
                Criar Cotação
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
