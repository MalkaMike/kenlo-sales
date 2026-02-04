import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, CreditCard, Split, Receipt, DollarSign, ArrowRight, Calculator, Zap, Info } from "lucide-react";
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
      title: "Boletos",
      rows: [
        {
          feature: "Boletos inclusos/mês",
          prime: "2",
          k: "5",
          k2: "10",
          tooltip: "Boletos inclusos na mensalidade do plano Locação",
        },
        {
          feature: "Preço por boleto adicional",
          prime: "R$ 4,00 fixo",
          k: "Por faixas",
          k2: "Por faixas",
          tooltip: "Custo por boleto emitido além dos inclusos",
        },
      ],
    },
    {
      title: "Split de Pagamento",
      rows: [
        {
          feature: "Splits inclusos/mês",
          prime: "2",
          k: "5",
          k2: "10",
          tooltip: "Splits inclusos na mensalidade do plano Locação",
        },
        {
          feature: "Preço por split adicional",
          prime: "R$ 4,00 fixo",
          k: "Por faixas",
          k2: "Por faixas",
          tooltip: "Custo por split realizado além dos inclusos",
        },
      ],
    },
    {
      title: "Funcionalidades",
      rows: [
        {
          feature: "Boleto com baixa automática",
          prime: true,
          k: true,
          k2: true,
        },
        {
          feature: "Split automático para proprietário",
          prime: true,
          k: true,
          k2: true,
        },
        {
          feature: "PIX integrado",
          prime: true,
          k: true,
          k2: true,
        },
        {
          feature: "Cobrança de taxa do inquilino",
          prime: true,
          k: true,
          k2: true,
          tooltip: "Cobre R$ 5,00 do inquilino e gere receita de R$ 1,00 a R$ 2,00 por boleto",
        },
        {
          feature: "Relatórios financeiros",
          prime: true,
          k: true,
          k2: true,
        },
        {
          feature: "Conciliação automática",
          prime: true,
          k: true,
          k2: true,
        },
      ],
    },
  ],
};

// Tier pricing details for K and K2
const tierPricing = {
  boleto: {
    k: [
      { range: "1º ao 250º", price: "R$ 4,00" },
      { range: "A partir do 251º", price: "R$ 3,50" },
    ],
    k2: [
      { range: "1º ao 250º", price: "R$ 4,00" },
      { range: "251º ao 500º", price: "R$ 3,50" },
      { range: "A partir do 501º", price: "R$ 3,00" },
    ],
  },
  split: {
    k: [
      { range: "1º ao 250º", price: "R$ 4,00" },
      { range: "A partir do 251º", price: "R$ 3,50" },
    ],
    k2: [
      { range: "1º ao 250º", price: "R$ 4,00" },
      { range: "251º ao 500º", price: "R$ 3,50" },
      { range: "A partir do 501º", price: "R$ 3,00" },
    ],
  },
};

const highlights = [
  {
    icon: Receipt,
    title: "Boleto Digital",
    description: "Emissão automática com baixa automática",
  },
  {
    icon: Split,
    title: "Split de Pagamento",
    description: "Divisão automática entre imobiliária e proprietário",
  },
  {
    icon: Zap,
    title: "PIX Integrado",
    description: "Recebimento instantâneo via PIX",
  },
  {
    icon: DollarSign,
    title: "Receita Extra",
    description: "Cobre taxa do inquilino e gere receita",
  },
];

export default function PayPage() {
  const renderValue = (value: string | boolean, tooltip?: string) => {
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
            <X className="w-5 h-5 text-red-500" />
          </div>
        </div>
      );
    }
    
    return <span className="font-medium text-sm">{value}</span>;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />
        
        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
              ADD-ON • EXCLUSIVO LOCAÇÃO
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Pay
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Boleto e Split digital embutido na plataforma. 
              Cobre do inquilino e repasse automático para o proprietário.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="text-sm py-1">
                <Receipt className="w-4 h-4 mr-1" />
                Boleto automático
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <Split className="w-4 h-4 mr-1" />
                Split de pagamento
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <Zap className="w-4 h-4 mr-1" />
                PIX integrado
              </Badge>
            </div>
            
            <div className="flex gap-4">
              <Link href="/calculadora">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
                  <Calculator className="w-5 h-5" />
                  Criar Cotação
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

      {/* Pricing Table */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Preços por Plano</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              O Kenlo Pay é incluído no Kenlo Locação. Os preços variam conforme o plano contratado.
            </p>
          </div>
          
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground min-w-[200px]">
                    Categoria / Recurso
                  </th>
                  {pricingData.plans.map((plan) => (
                    <th key={plan} className="text-center py-4 px-4 min-w-[150px]">
                      <div className="flex flex-col items-center">
                        <CreditCard className={`w-8 h-8 mb-2 ${
                          plan === "Prime" ? "text-muted-foreground" :
                          plan === "K" ? "text-primary" : "text-secondary"
                        }`} />
                        <span className={`font-bold text-lg ${
                          plan === "K" ? "text-primary" : 
                          plan === "K2" ? "text-secondary" : ""
                        }`}>{plan}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricingData.sections.map((section, sectionIndex) => (
                  <>
                    <tr key={`section-${sectionIndex}`} className="bg-muted/30">
                      <td
                        colSpan={4}
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
                            <span>{row.feature}</span>
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
                        <td className="py-4 px-4 text-center">
                          {renderValue(row.prime)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {renderValue(row.k)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {renderValue(row.k2)}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tier Pricing Details */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Detalhes de Preços por Faixas</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nos planos K e K2, os preços diminuem conforme o volume de transações aumenta.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Boleto Pricing */}
            <div className="bg-background rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Boletos Adicionais</h3>
              </div>
              
              <div className="space-y-6">
                {/* Prime */}
                <div>
                  <h4 className="font-semibold text-muted-foreground mb-2">Prime</h4>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <span className="font-medium">R$ 4,00 por boleto</span>
                    <span className="text-sm text-muted-foreground ml-2">(preço fixo)</span>
                  </div>
                </div>
                
                {/* K */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">Plano K</h4>
                  <div className="space-y-2">
                    {tierPricing.boleto.k.map((tier, index) => (
                      <div key={index} className="flex justify-between items-center bg-muted/30 rounded-lg p-3">
                        <span className="text-sm">{tier.range} boleto</span>
                        <span className="font-medium text-primary">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* K2 */}
                <div>
                  <h4 className="font-semibold text-secondary mb-2">Plano K2</h4>
                  <div className="space-y-2">
                    {tierPricing.boleto.k2.map((tier, index) => (
                      <div key={index} className="flex justify-between items-center bg-muted/30 rounded-lg p-3">
                        <span className="text-sm">{tier.range} boleto</span>
                        <span className="font-medium text-secondary">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Split Pricing */}
            <div className="bg-background rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <Split className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Splits Adicionais</h3>
              </div>
              
              <div className="space-y-6">
                {/* Prime */}
                <div>
                  <h4 className="font-semibold text-muted-foreground mb-2">Prime</h4>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <span className="font-medium">R$ 4,00 por split</span>
                    <span className="text-sm text-muted-foreground ml-2">(preço fixo)</span>
                  </div>
                </div>
                
                {/* K */}
                <div>
                  <h4 className="font-semibold text-primary mb-2">Plano K</h4>
                  <div className="space-y-2">
                    {tierPricing.split.k.map((tier, index) => (
                      <div key={index} className="flex justify-between items-center bg-muted/30 rounded-lg p-3">
                        <span className="text-sm">{tier.range} split</span>
                        <span className="font-medium text-primary">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* K2 */}
                <div>
                  <h4 className="font-semibold text-secondary mb-2">Plano K2</h4>
                  <div className="space-y-2">
                    {tierPricing.split.k2.map((tier, index) => (
                      <div key={index} className="flex justify-between items-center bg-muted/30 rounded-lg p-3">
                        <span className="text-sm">{tier.range} split</span>
                        <span className="font-medium text-secondary">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Example Calculation */}
          <div className="max-w-2xl mx-auto mt-12">
            <div className="bg-secondary/10 rounded-xl p-6 border border-secondary/20">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-secondary" />
                Exemplo de Cálculo (Plano K2)
              </h4>
              <p className="text-muted-foreground mb-4">
                Uma imobiliária com 600 boletos/mês no plano K2:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>10 boletos inclusos</span>
                  <span className="font-medium text-secondary">R$ 0,00</span>
                </div>
                <div className="flex justify-between">
                  <span>250 boletos × R$ 4,00</span>
                  <span>R$ 1.000,00</span>
                </div>
                <div className="flex justify-between">
                  <span>250 boletos × R$ 3,50</span>
                  <span>R$ 875,00</span>
                </div>
                <div className="flex justify-between">
                  <span>90 boletos × R$ 3,00</span>
                  <span>R$ 270,00</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-secondary/30 font-bold">
                  <span>Total (590 boletos adicionais)</span>
                  <span className="text-secondary">R$ 2.145,00</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Custo médio por boleto</span>
                  <span>R$ 3,64</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Generation */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <DollarSign className="w-16 h-16 text-secondary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Transforme Cobrança em Receita
            </h2>
            <p className="text-muted-foreground mb-6">
              Cobre R$ 5,00 do inquilino por boleto e gere receita de R$ 1,00 a R$ 2,00 por transação.
              Com 500 boletos/mês, são até R$ 1.000/mês de receita extra!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/produtos/locacao">
                <Button size="lg" variant="outline" className="gap-2">
                  Ver Kenlo Locação
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/calculadora">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
                  <Calculator className="w-5 h-5" />
                  Criar Cotação
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
