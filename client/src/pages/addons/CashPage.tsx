import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, Clock, TrendingUp, Users, Wallet, ArrowRight, Check } from "lucide-react";

const features = [
  {
    icon: Banknote,
    title: "Antecipação de Aluguel",
    description: "Proprietário recebe até 24 meses de aluguel adiantado",
  },
  {
    icon: Clock,
    title: "Aprovação Rápida",
    description: "Análise e liberação em até 48 horas",
  },
  {
    icon: Users,
    title: "Fidelização",
    description: "Proprietário fica vinculado à sua administradora",
  },
  {
    icon: Wallet,
    title: "Sem Risco",
    description: "A Kenlo assume o risco da operação",
  },
];

const benefits = [
  "Antecipação de até 24 meses",
  "Aprovação em 48 horas",
  "Sem risco para a imobiliária",
  "Fidelização do proprietário",
  "Comissão por indicação",
  "Processo 100% digital",
];

export default function CashPage() {
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
              Fidelize clientes e ganhe comissão.
            </p>
            
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-sm text-muted-foreground">Antecipe até</span>
              <span className="text-4xl font-bold text-secondary">24 meses</span>
              <span className="text-muted-foreground">de aluguel</span>
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
              Ofereça antecipação de aluguel e fidelize proprietários
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
                Benefícios do Kenlo Cash
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
                <CardTitle>Como Funciona</CardTitle>
                <CardDescription>Processo simples e rápido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-start py-3 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Proprietário solicita</p>
                    <p className="text-sm text-muted-foreground">Via plataforma ou com você</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start py-3 border-b border-border">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Análise em 48h</p>
                    <p className="text-sm text-muted-foreground">Kenlo avalia e aprova</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start py-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Dinheiro na conta</p>
                    <p className="text-sm text-muted-foreground">Proprietário recebe o valor</p>
                  </div>
                </div>
                <Link href="/calculadora" className="block pt-4">
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Criar Orçamento
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
            <TrendingUp className="w-16 h-16 text-secondary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Fidelize proprietários com antecipação
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione Kenlo Cash e ofereça um diferencial competitivo
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
