import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Building2, Users, Globe, Smartphone, MessageSquare, BarChart3, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Prime",
    description: "Corretor independente ou pequena equipe",
    price: "247",
    users: 2,
    implantacao: "1.497",
    badge: "kenlo-badge-prime",
    features: {
      crm: true,
      app: true,
      site: true,
      portais: true,
      lya: false,
      blog: false,
      treinamento: false,
      suporteVip: false,
    },
  },
  {
    name: "K",
    description: "Imobiliária em crescimento",
    price: "497",
    users: 5,
    implantacao: "1.497",
    badge: "kenlo-badge-k",
    popular: true,
    features: {
      crm: true,
      app: true,
      site: true,
      portais: true,
      lya: true,
      blog: true,
      treinamento: true,
      suporteVip: false,
    },
  },
  {
    name: "K2",
    description: "Rede ou franquia",
    price: "1.247",
    users: 12,
    implantacao: "2.997",
    badge: "kenlo-badge-k2",
    features: {
      crm: true,
      app: true,
      site: true,
      portais: true,
      lya: true,
      blog: true,
      treinamento: true,
      suporteVip: true,
    },
  },
];

const featureLabels: Record<string, { label: string; description: string }> = {
  crm: { label: "CRM Completo", description: "Funil, pipeline, relatórios" },
  app: { label: "App Corretor", description: "iOS e Android" },
  site: { label: "Site Incluso", description: "Website profissional" },
  portais: { label: "Publicação Portais", description: "+50 portais integrados" },
  lya: { label: "LYA (IA)", description: "Assistente de IA 24/7" },
  blog: { label: "Blog Completo", description: "SEO otimizado" },
  treinamento: { label: "Treinamento Equipe", description: "Onboarding dedicado" },
  suporteVip: { label: "Suporte VIP", description: "Atendimento prioritário" },
};

const highlights = [
  {
    icon: Building2,
    title: "CRM Completo",
    description: "Gestão de leads, funil de vendas e relatórios avançados",
  },
  {
    icon: Globe,
    title: "Site Incluso",
    description: "Website profissional otimizado para Google",
  },
  {
    icon: Smartphone,
    title: "App Corretor",
    description: "Cadastre imóveis e receba leads no celular",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integrado",
    description: "Atendimento via WhatsApp com LYA (IA)",
  },
];

export default function ImobPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        
        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              VENDAS
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Imob
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              CRM completo para imobiliárias com Site e App incluídos. 
              Todos os seus leads em um só lugar.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>8.500+ imobiliárias</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-primary" />
                <span>+50 portais integrados</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span>3.5M imóveis na plataforma</span>
              </div>
            </div>
            
            <Link href="/calculadora">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Simular Proposta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit">
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

      {/* Plans Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos Kenlo Imob</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o tamanho da sua imobiliária
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative kenlo-card ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mb-2">
                    <span className={`kenlo-badge ${plan.badge}`}>{plan.name}</span>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.users} usuários
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Implantação: R$ {plan.implantacao}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(plan.features).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        {value ? (
                          <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        <span className={value ? '' : 'text-muted-foreground/50'}>
                          {featureLabels[key].label}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/calculadora" className="block">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Selecionar {plan.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
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
              Adicione Leads, Inteligência e Assinatura para maximizar resultados
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/addons/leads">
                <Button variant="outline" className="gap-2">
                  Kenlo Leads
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
