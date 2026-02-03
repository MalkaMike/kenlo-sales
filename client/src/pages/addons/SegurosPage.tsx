import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, DollarSign, Zap, FileText, TrendingUp, ArrowRight, Check } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Seguro no Boleto",
    description: "Seguro embutido automaticamente no boleto do inquilino",
  },
  {
    icon: DollarSign,
    title: "Receita Passiva",
    description: "Ganhe R$10 por contrato/mês sem esforço adicional",
  },
  {
    icon: Zap,
    title: "Ativação Automática",
    description: "Seguro ativado automaticamente com o contrato",
  },
  {
    icon: FileText,
    title: "Gestão Simplificada",
    description: "Acompanhe todos os seguros em um único painel",
  },
];

const benefits = [
  "Seguro embutido no boleto",
  "R$10/contrato/mês de receita",
  "Ativação automática",
  "Sem burocracia",
  "Cobertura completa",
  "Gestão centralizada",
];

const pricing = {
  revenue: "10,00",
};

export default function SegurosPage() {
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
              Ganhe R$10 por contrato/mês sem esforço.
            </p>
            
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-sm text-muted-foreground">Ganhe</span>
              <span className="text-4xl font-bold text-secondary">R$ {pricing.revenue}</span>
              <span className="text-muted-foreground">/contrato/mês</span>
            </div>
            
            <div className="flex gap-4">
              <Link href="/calculadora">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  Simular Proposta
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
              Transforme seguros em receita passiva
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="kenlo-card p-6">
                <div className="p-3 rounded-xl bg-secondary/10 text-secondary w-fit mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
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
                Benefícios do Kenlo Seguros
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
            
            <div className="kenlo-card p-6">
              <h3 className="text-xl font-semibold mb-2">Simulação de Receita</h3>
              <p className="text-sm text-muted-foreground mb-6">Exemplo com 500 contratos</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Contratos ativos</span>
                  <span className="font-semibold">500</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Receita por contrato</span>
                  <span className="font-semibold">R$ {pricing.revenue}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Receita mensal</span>
                  <span className="font-semibold text-secondary">R$ 5.000</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Receita anual</span>
                  <span className="font-semibold text-secondary">R$ 60.000</span>
                </div>
                <Link href="/calculadora" className="block pt-4">
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Calcular minha receita
                  </Button>
                </Link>
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
              Gere receita passiva com seguros
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione Kenlo Seguros e ganhe R$10 por contrato/mês
            </p>
            <Link href="/calculadora">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
                Simular Proposta
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
