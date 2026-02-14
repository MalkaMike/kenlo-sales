import { Link } from "wouter";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, FileSignature, Shield, Clock, Smartphone, ArrowRight, Calculator, ScanFace, FileCheck, Workflow, Lock } from "lucide-react";
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
          value: "R$ 37/mês",
          highlight: true,
          tooltip: undefined,
        },
        {
          feature: "Implantação (única)",
          value: "Sem custo",
          tooltip: "Implantação gratuita para todos os clientes",
        },
        {
          feature: "Assinaturas inclusas/mês",
          value: "15 assinaturas",
          tooltip: "Carência mensal de 15 assinaturas digitais incluídas",
        },
        {
          feature: "Produtos atendidos",
          value: "IMOB e LOC",
          tooltip: "Funciona com Kenlo IMOB e/ou Kenlo Locação",
        },
      ],
    },
    {
      title: "Assinaturas Adicionais (pós-pago)",
      rows: [
        {
          feature: "1 a 20 assinaturas",
          value: "R$ 1,80/assinatura",
          tooltip: undefined,
        },
        {
          feature: "21 a 40 assinaturas",
          value: "R$ 1,70/assinatura",
          tooltip: undefined,
        },
        {
          feature: "Acima de 41 assinaturas",
          value: "R$ 1,50/assinatura",
          tooltip: undefined,
        },
      ],
    },
    {
      title: "Funcionalidades Incluídas",
      rows: [
        {
          feature: "Assinatura digital com validade jurídica",
          value: true,
          tooltip: "Certificado digital reconhecido — substitui cartório",
        },
        {
          feature: "Envio por e-mail e WhatsApp",
          value: true,
          tooltip: "Cliente recebe o contrato e assina pelo celular",
        },
        {
          feature: "Validação biométrica facial",
          value: "R$ 7,00/validação",
          tooltip: "Validação de identidade por reconhecimento facial — opcional",
        },
        {
          feature: "Histórico e auditoria",
          value: true,
          tooltip: "Registro completo de todas as assinaturas com trilha de auditoria",
        },
        {
          feature: "Templates de contrato",
          value: true,
          tooltip: "Modelos pré-configurados para contratos de venda e locação",
        },
      ],
    },
  ],
};

const highlights = [
  {
    icon: FileSignature,
    title: "Assinatura Digital",
    description: "Contratos assinados digitalmente com validade jurídica — sem cartório, sem papel",
  },
  {
    icon: Shield,
    title: "Validade Jurídica",
    description: "Certificado digital reconhecido que substitui a necessidade de cartório",
  },
  {
    icon: Clock,
    title: "Fechamento em 5 Min",
    description: "Cliente assina pelo celular em minutos — sem deslocamento, sem atraso",
  },
  {
    icon: Smartphone,
    title: "100% Mobile",
    description: "Processo completo pelo smartphone do cliente — envio por e-mail ou WhatsApp",
  },
];

const useCases = [
  {
    icon: FileCheck,
    title: "Contratos de Venda",
    description: "Feche contratos de compra e venda em minutos. O comprador assina pelo celular, você acompanha em tempo real e o contrato fica armazenado com validade jurídica.",
  },
  {
    icon: Workflow,
    title: "Contratos de Locação",
    description: "Novos contratos de locação assinados digitalmente. Inquilino, proprietário e fiador assinam de qualquer lugar — sem burocracia.",
  },
  {
    icon: ScanFace,
    title: "Validação Biométrica",
    description: "Para contratos de alto valor, adicione validação biométrica facial por R$ 7,00/validação. Segurança extra com reconhecimento de identidade.",
  },
  {
    icon: Lock,
    title: "Auditoria e Compliance",
    description: "Histórico completo de todas as assinaturas com trilha de auditoria. Prove quem assinou, quando e de onde — tudo registrado.",
  },
];

export default function AssinaturaPage() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        
        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              ADD-ON • IMOB + LOCAÇÃO
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Assinatura
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Assinatura digital embutida na plataforma.
              Feche contratos em <span className="font-semibold text-foreground">5 minutos, sem cartório</span> — com validade jurídica completa.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="text-sm py-1">
                <FileSignature className="w-4 h-4 mr-1" />
                Validade jurídica
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <ScanFace className="w-4 h-4 mr-1" />
                Biometria facial
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <Smartphone className="w-4 h-4 mr-1" />
                100% mobile
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
              Veja como o Kenlo Assinatura elimina burocracia e acelera o fechamento de contratos
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
              O add-on mais acessível da Kenlo. <span className="font-semibold text-foreground">Implantação gratuita</span> e 15 assinaturas inclusas por mês.
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
                        <FileSignature className="w-8 h-8 text-primary mb-2" />
                        <span className="font-bold text-lg">Assinatura</span>
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
                <strong>Exemplo de cálculo:</strong> Se a imobiliária tiver 50 assinaturas adicionais/mês, 
                paga 20 × R$ 1,80 + 20 × R$ 1,70 + 10 × R$ 1,50 = <strong>R$ 85/mês</strong> em assinaturas adicionais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kombos CTA */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <FileSignature className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Economize com Kombos
            </h2>
            <p className="text-muted-foreground mb-6">
              Kenlo Assinatura está incluído em todos os Kombos!
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
