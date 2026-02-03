import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, BarChart3, TrendingUp, Users, PieChart, ArrowRight, Check } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Dashboard Executivo",
    description: "Visão completa do desempenho da imobiliária em tempo real",
  },
  {
    icon: TrendingUp,
    title: "Análise de Conversão",
    description: "Métricas de funil por corretor, fonte e região",
  },
  {
    icon: Users,
    title: "Performance de Equipe",
    description: "Ranking de corretores e análise comparativa",
  },
  {
    icon: PieChart,
    title: "Relatórios Customizados",
    description: "Crie relatórios personalizados para sua operação",
  },
];

const benefits = [
  "Dashboard em tempo real",
  "KPIs de performance por corretor",
  "Análise de conversão por fonte",
  "Comparativo mensal e anual",
  "Exportação de relatórios",
  "Alertas automáticos",
];

const pricing = {
  base: "377",
};

export default function InteligenciaPage() {
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
              Kenlo Inteligência
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              BI de KPIs de performance para líderes de mercado. 
              Dados que viram decisões.
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Recursos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Transforme dados em insights acionáveis
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
                Benefícios do Kenlo Inteligência
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
                <CardDescription>Valor fixo mensal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Mensalidade</span>
                  <span className="font-semibold">R$ {pricing.base}/mês</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border">
                  <span className="text-muted-foreground">Usuários</span>
                  <span className="font-semibold">Ilimitados</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Relatórios</span>
                  <span className="font-semibold">Ilimitados</span>
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
            <Brain className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tome decisões baseadas em dados
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione Kenlo Inteligência e tenha visibilidade total da sua operação
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
