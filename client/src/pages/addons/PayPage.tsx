import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Split, Zap, Receipt, DollarSign, ArrowRight, Check } from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Boleto Digital",
    description: "Emissão automática de boletos com baixa automática",
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
    description: "Cobre taxa do inquilino e gere receita adicional",
  },
];

const benefits = [
  "Boleto com baixa automática",
  "Split automático para proprietário",
  "PIX integrado",
  "Cobrança de taxa do inquilino",
  "Relatórios financeiros",
  "Conciliação automática",
];

const pricing = {
  perBoleto: "3,00",
  perSplit: "3,00",
};

export default function PayPage() {
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
              Kenlo Pay
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Boleto e Split digital embutido na plataforma. 
              Cobre do inquilino e repasse automático para o proprietário.
            </p>
            
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-sm text-muted-foreground">A partir de</span>
              <span className="text-4xl font-bold text-secondary">R$ {pricing.perBoleto}</span>
              <span className="text-muted-foreground">/boleto</span>
            </div>
            
            <div className="flex gap-4">
              <Link href="/calculadora">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Criar Orçamento
                </Button>
              </Link>
              <Link href="/produtos/locacao">
                <Button size="lg" variant="outline">
                  Ver Kenlo Locação
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Automatize a cobrança e o repasse de aluguéis
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="kenlo-card">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-secondary/10 text-secondary w-fit mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Benefícios do Kenlo Pay
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="kenlo-card">
              <CardHeader>
                <CardTitle>Precificação</CardTitle>
                <CardDescription>Modelo por transação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Custo por boleto</span>
                  <span className="font-semibold">R$ {pricing.perBoleto}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Custo por split</span>
                  <span className="font-semibold">R$ {pricing.perSplit}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Mensalidade</span>
                  <span className="font-semibold text-secondary">Grátis</span>
                </div>
                <div className="p-4 bg-secondary/10 rounded-lg mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Dica:</strong> Cobre R$ 5,00 do inquilino por boleto e gere receita de R$ 2,00 por transação!
                  </p>
                </div>
                <Link href="/calculadora" className="block pt-4">
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Calcular meu investimento
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <CreditCard className="w-16 h-16 text-secondary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Automatize sua cobrança
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione Kenlo Pay e transforme cobrança em receita
            </p>
            <Link href="/calculadora">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
                Criar Orçamento
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
