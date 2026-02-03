import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp, Calculator, ArrowRight, Percent } from "lucide-react";

const kombos = [
  {
    name: "Kombo Vendas",
    description: "Imob + Add-ons essenciais para vendas",
    discount: "20%",
    products: ["Kenlo Imob (K)"],
    addons: ["Leads", "Inteligência", "Assinatura"],
    priceFrom: "1.548",
    priceTo: "1.238",
    popular: false,
  },
  {
    name: "Kombo Locação",
    description: "Locação + Add-ons para gestão completa",
    discount: "20%",
    products: ["Kenlo Locação (K)"],
    addons: ["Pay", "Seguros", "Assinatura"],
    priceFrom: "544",
    priceTo: "435",
    popular: false,
  },
  {
    name: "Kombo Completo",
    description: "Imob + Locação + Todos os add-ons",
    discount: "25%",
    products: ["Kenlo Imob (K)", "Kenlo Locação (K)"],
    addons: ["Leads", "Inteligência", "Assinatura", "Pay", "Seguros", "Cash"],
    priceFrom: "2.792",
    priceTo: "2.094",
    popular: true,
  },
];

const benefits = [
  {
    icon: Percent,
    title: "Descontos Progressivos",
    description: "Quanto mais produtos e add-ons, maior o desconto",
  },
  {
    icon: Sparkles,
    title: "Implantação Reduzida",
    description: "Taxa única de implantação para todo o Kombo",
  },
  {
    icon: TrendingUp,
    title: "ROI Maximizado",
    description: "Soluções integradas que potencializam resultados",
  },
];

const discountTable = [
  { combo: "Produto + 1 Add-on", discount: "10%" },
  { combo: "Produto + 2 Add-ons", discount: "15%" },
  { combo: "Produto + 3+ Add-ons", discount: "20%" },
  { combo: "Imob + Loc + Add-ons", discount: "25%" },
];

export default function KombosPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 kenlo-gradient opacity-10" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-secondary/20 text-secondary hover:bg-secondary/30">
              NOVO
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kombos Kenlo
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Combine produtos e add-ons com descontos progressivos. 
              Quanto mais você digitaliza, menor o custo por unidade.
            </p>
            
            <div className="flex justify-center gap-4">
              <Link href="/calculadora">
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                  <Calculator className="w-5 h-5" />
                  Simular Kombo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <benefit.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kombos Grid */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kombos Disponíveis</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pacotes pré-configurados com os melhores descontos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {kombos.map((kombo) => (
              <Card 
                key={kombo.name} 
                className={`relative kenlo-card ${kombo.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}
              >
                {kombo.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center justify-center gap-1 mb-2">
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                      -{kombo.discount}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{kombo.name}</CardTitle>
                  <CardDescription>{kombo.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-lg text-muted-foreground line-through">R$ {kombo.priceFrom}</span>
                      <span className="text-3xl font-bold text-primary">R$ {kombo.priceTo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">/mês</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Produtos
                      </p>
                      {kombo.products.map((product, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1">
                          <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                          <span className="text-sm">{product}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Add-ons inclusos
                      </p>
                      {kombo.addons.map((addon, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1">
                          <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                          <span className="text-sm">Kenlo {addon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Link href="/calculadora" className="block">
                    <Button 
                      className="w-full" 
                      variant={kombo.popular ? "default" : "outline"}
                    >
                      Simular este Kombo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Discount Table */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tabela de Descontos</h2>
              <p className="text-muted-foreground">
                Quanto mais você combina, mais você economiza
              </p>
            </div>
            
            <Card className="kenlo-card">
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold">Combinação</th>
                      <th className="text-right p-4 font-semibold">Desconto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discountTable.map((row, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="p-4">{row.combo}</td>
                        <td className="p-4 text-right">
                          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
                            {row.discount}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
            
            <p className="text-center text-sm text-muted-foreground mt-6">
              * Descontos aplicados sobre o valor mensal. Implantação com desconto especial para Kombos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Calculator className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Monte seu Kombo personalizado
            </h2>
            <p className="text-muted-foreground mb-6">
              Use a calculadora para criar a combinação ideal para cada cliente
            </p>
            <Link href="/calculadora">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                Abrir Calculadora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
