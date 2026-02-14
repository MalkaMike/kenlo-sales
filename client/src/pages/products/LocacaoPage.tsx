import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Home, FileText, CreditCard, RefreshCw, ArrowRight, Calculator, Info } from "lucide-react";
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
          feature: "Implantação",
          type: "price",
          values: ["R$ 1.497", "R$ 1.497", "R$ 1.497"],
        },
        {
          feature: "Contratos inclusos",
          type: "text",
          values: ["100", "200", "500"],
        },
      ],
    },
    {
      title: "Kenlo Pay Incluído",
      rows: [
        {
          feature: "Boletos incluídos",
          type: "text",
          values: ["2", "5", "15"],
        },
        {
          feature: "Split incluídos",
          type: "text",
          values: ["2", "5", "15"],
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
      title: "Funcionalidades Básicas (todos os planos)",
      rows: [
        { feature: "Aditivo contratual", type: "check", values: [true, true, true] },
        { feature: "Assinatura digital", type: "check", values: [true, true, true] },
        { feature: "Cálculo caução / IR", type: "check", values: [true, true, true] },
        { feature: "Central notificações", type: "check", values: [true, true, true] },
        { feature: "Checklist pendências", type: "check", values: [true, true, true] },
        { feature: "Conciliação bancária", type: "check", values: [true, true, true] },
        { feature: "Controle inadimplência", type: "check", values: [true, true, true] },
        { feature: "Dashboard completo", type: "check", values: [true, true, true] },
        { feature: "Extrato DIMOB", type: "check", values: [true, true, true] },
        { feature: "Gestão documentos", type: "check", values: [true, true, true] },
        { feature: "Gestão imóveis próprios", type: "check", values: [true, true, true] },
        { feature: "Gestão repasses", type: "check", values: [true, true, true] },
        { feature: "Integração bancária", type: "check", values: [true, true, true] },
        { feature: "Integração Imob/CRM", type: "check", values: [true, true, true] },
        { feature: "Nota fiscal integrada", type: "check", values: [true, true, true] },
        { feature: "Notificações contratos", type: "check", values: [true, true, true] },
        { feature: "Régua de cobranças", type: "check", values: [true, true, true] },
        { feature: "Relatórios gestão", type: "check", values: [true, true, true] },
        { feature: "Repasse agrupado", type: "check", values: [true, true, true] },
      ],
    },
    {
      title: "Funcionalidades Avançadas",
      rows: [
        { feature: "Anexo comprovantes", type: "check", values: [false, true, true] },
        { feature: "Área locatários", type: "check", values: [false, true, true] },
        { feature: "Área proprietários", type: "check", values: [false, true, true] },
        { feature: "CRM cobranças", type: "check", values: [false, true, true] },
        { feature: "Gestão tickets", type: "check", values: [false, true, true] },
        { feature: "Gestão carteira prop.", type: "check", values: [false, true, true] },
        { feature: "Gestão vistorias", type: "check", values: [false, true, true] },
        { feature: "Remessa despesas", type: "check", values: [false, true, true] },
      ],
    },
    {
      title: "Funcionalidades Exclusivas K2",
      rows: [
        { feature: "Cadastro filiais", type: "check", values: [false, false, true] },
        { feature: "Gestão imóveis vagos", type: "check", values: [false, false, true] },
        { feature: "Módulo vendas", type: "check", values: [false, false, true] },
      ],
    },
    {
      title: "Kenlo Seguros (comissão)",
      rows: [
        {
          feature: "Comissão sobre prêmio",
          type: "text",
          values: ["35%", "40%", "45%"],
        },
      ],
    },
    {
      title: "Custos Pós-Pago",
      rows: [
        {
          feature: "Kenlo Pay - Boleto",
          type: "complex",
          values: [
            "R$ 4,00/boleto",
            "1-250: R$ 4,00\n251+: R$ 3,50",
            "1-250: R$ 4,00\n251-500: R$ 3,50\n501+: R$ 3,00",
          ],
        },
        {
          feature: "Kenlo Pay - Split",
          type: "complex",
          values: [
            "R$ 4,00/split",
            "1-250: R$ 4,00\n251+: R$ 3,50",
            "1-250: R$ 4,00\n251-500: R$ 3,50\n501+: R$ 3,00",
          ],
        },
        {
          feature: "Contratos adicionais",
          type: "complex",
          values: [
            "R$ 3,00/contrato",
            "1-250: R$ 3,00\n251+: R$ 2,50",
            "1-250: R$ 3,00\n251-500: R$ 2,50\n501+: R$ 2,00",
          ],
        },
      ],
    },
  ],
};

const highlights = [
  {
    icon: FileText,
    title: "Gestão de Contratos",
    description: "Controle completo do ciclo de vida dos contratos",
  },
  {
    icon: CreditCard,
    title: "Cobrança Automática",
    description: "Boletos, PIX e cartão com baixa automática",
  },
  {
    icon: RefreshCw,
    title: "Repasse Automático",
    description: "Transferência para proprietários sem esforço",
  },
  {
    icon: Home,
    title: "DIMOB Automático",
    description: "Declaração gerada automaticamente",
  },
];

export default function LocacaoPage() {
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
      return <span className="font-bold text-secondary">{value}</span>;
    }
    
    return <span className={row.type === "price" ? "font-medium" : ""}>{value}</span>;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />
        
        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
              ERP PARA LOCAÇÃO
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Locação
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              ERP completo para gestão de contratos de locação. 
              Cobrança, repasse e DIMOB automatizados.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Home className="w-4 h-4 text-secondary" />
                <span>Gestão completa de locações</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-secondary" />
                <span>Cobrança automatizada</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-secondary" />
                <span>DIMOB automático</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/calculadora">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
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
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary h-fit">
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
              Escolha o plano ideal para o volume de contratos da sua administradora. Todos os valores são para pagamento anual.
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
                            <Badge className="bg-secondary text-secondary-foreground text-[10px]">
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
                          className="p-3 bg-secondary/5 font-semibold text-secondary border-t border-border/40"
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
                          className="border-b border-border/20 pricing-row"
                        >
                          <td className="p-4 text-sm">
                            <div className="flex items-center gap-2">
                              {typedRow.feature}
                              {typedRow.tooltip && (
                                <Tooltip>
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
                <strong>Exemplo de cálculo (Plano K):</strong> Se a administradora tiver 300 contratos adicionais, 
                paga 200 × R$ 3,00 + 100 × R$ 2,50 = <strong>R$ 850/mês</strong> em contratos adicionais.
              </p>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/calculadora">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
                <Calculator className="w-5 h-5" />
                Simular Cotação
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Plan Comparison - Add-on Impact */}
      <section className="py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Comparação de Planos - Add-ons LOC</h2>
            <p className="text-sm text-muted-foreground">
              Veja como cada plano impacta o custo dos add-ons específicos do Kenlo Locação
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-2 px-3 font-semibold">Add-on</th>
                    <th className="text-center py-2 px-3 font-semibold text-secondary">Prime</th>
                    <th className="text-center py-2 px-3 font-semibold text-blue-600">K</th>
                    <th className="text-center py-2 px-3 font-semibold text-purple-600">K2</th>
                    <th className="text-center py-2 px-3 font-semibold text-green-600">Economia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/40">
                    <td className="py-2 px-3 font-medium">Contratos Adicionais</td>
                    <td className="py-2 px-3 text-center text-xs">R$ 3,00/un</td>
                    <td className="py-2 px-3 text-center text-xs">R$ 3,00 (1-250)<br/>R$ 2,50 (251+)</td>
                    <td className="py-2 px-3 text-center text-xs font-semibold">R$ 3,00 (1-250)<br/>R$ 2,50 (251-500)<br/>R$ 2,00 (501+)</td>
                    <td className="py-2 px-3 text-center text-green-600 font-semibold">33%</td>
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="py-2 px-3 font-medium">Boletos (Pay)</td>
                    <td className="py-2 px-3 text-center text-xs">R$ 4,00/un</td>
                    <td className="py-2 px-3 text-center text-xs">R$ 4,00 (1-250)<br/>R$ 3,50 (251+)</td>
                    <td className="py-2 px-3 text-center text-xs font-semibold">R$ 4,00 (1-250)<br/>R$ 3,50 (251-500)<br/>R$ 3,00 (501+)</td>
                    <td className="py-2 px-3 text-center text-green-600 font-semibold">25%</td>
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="py-2 px-3 font-medium">Split (Pay)</td>
                    <td className="py-2 px-3 text-center text-xs">R$ 4,00/un</td>
                    <td className="py-2 px-3 text-center text-xs">R$ 4,00 (1-250)<br/>R$ 3,50 (251+)</td>
                    <td className="py-2 px-3 text-center text-xs font-semibold">R$ 4,00 (1-250)<br/>R$ 3,50 (251-500)<br/>R$ 3,00 (501+)</td>
                    <td className="py-2 px-3 text-center text-green-600 font-semibold">25%</td>
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
              Adicione Inteligência, Assinatura e Cash para maximizar receita. 
              Combine em um Kombo e ganhe até 20% de desconto!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
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
              <Link href="/addons/cash">
                <Button variant="outline" className="gap-2">
                  Kenlo Cash
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
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/80 opacity-90" />
            
            <div className="relative px-8 py-12 md:px-16 md:py-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Economize com Kombos
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-6">
                Combine Kenlo Locação com add-ons e ganhe até 20% de desconto. 
                O Kombo Elite inclui todos os produtos e serviços premium!
              </p>
              <Link href="/kombos">
                <Button size="lg" variant="secondary" className="gap-2 bg-white text-secondary hover:bg-white/90">
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
