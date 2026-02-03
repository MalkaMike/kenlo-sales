import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Zap, Clock, Target, BarChart3, ArrowRight, Check } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Distribuição Automática",
    description: "Leads distribuídos automaticamente por região, especialidade ou rodízio",
  },
  {
    icon: Clock,
    title: "Tempo de Resposta",
    description: "Lead não atendido em 5 minutos? Vai para o próximo corretor",
  },
  {
    icon: Target,
    title: "Qualificação Inteligente",
    description: "Score de qualificação baseado em comportamento e interesse",
  },
  {
    icon: BarChart3,
    title: "Analytics Avançado",
    description: "Métricas de conversão por corretor, fonte e região",
  },
];

const benefits = [
  "Zero leads perdidos",
  "Distribuição por região ou especialidade",
  "Rodízio automático entre corretores",
  "Tempo máximo de resposta configurável",
  "Relatórios de performance por corretor",
  "Integração com WhatsApp",
];

const pricing = {
  base: "627",
  perLead: "2,50",
  included: 150,
};

export default function LeadsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        
        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              ADD-ON • IMOB
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Leads
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Gestão automatizada de leads com distribuição inteligente. 
              Zero leads perdidos, máxima conversão.
            </p>
            
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-sm text-muted-foreground">A partir de</span>
              <span className="text-4xl font-bold text-primary">R$ {pricing.base}</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            
            <div className="flex gap-4">
              <Link href="/calculadora">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Simular Proposta
                </Button>
              </Link>
              <Link href="/produtos/imob">
                <Button size="lg" variant="outline">
                  Ver Kenlo Imob
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
              Automatize a distribuição de leads e aumente a conversão da sua equipe
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="kenlo-card">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
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
                Benefícios do Kenlo Leads
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
                <CardDescription>Modelo transparente e previsível</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Mensalidade base</span>
                  <span className="font-semibold">R$ {pricing.base}/mês</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Mensagens incluídas</span>
                  <span className="font-semibold">{pricing.included} mensagens</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Mensagem adicional</span>
                  <span className="font-semibold">R$ {pricing.perLead}</span>
                </div>
                <Link href="/calculadora" className="block pt-4">
                  <Button className="w-full bg-primary hover:bg-primary/90">
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
            <Users className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Pronto para não perder mais leads?
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione Kenlo Leads ao seu Imob e veja a conversão aumentar
            </p>
            <Link href="/calculadora">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
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
