import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Home, FileText, CreditCard, RefreshCw, Shield, Banknote, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Prime",
    description: "Até 100 contratos sob gestão",
    price: "247",
    contracts: 100,
    implantacao: "1.497",
    badge: "kenlo-badge-prime",
    features: {
      erp: true,
      cobranca: true,
      repasse: true,
      relatorios: true,
      dimob: true,
      api: false,
      multiFilial: false,
      suporteVip: false,
    },
  },
  {
    name: "K",
    description: "Até 250 contratos sob gestão",
    price: "497",
    contracts: 250,
    implantacao: "1.497",
    badge: "kenlo-badge-k",
    popular: true,
    features: {
      erp: true,
      cobranca: true,
      repasse: true,
      relatorios: true,
      dimob: true,
      api: true,
      multiFilial: false,
      suporteVip: false,
    },
  },
  {
    name: "K2",
    description: "Até 500 contratos sob gestão",
    price: "1.247",
    contracts: 500,
    implantacao: "2.997",
    badge: "kenlo-badge-k2",
    features: {
      erp: true,
      cobranca: true,
      repasse: true,
      relatorios: true,
      dimob: true,
      api: true,
      multiFilial: true,
      suporteVip: true,
    },
  },
];

const featureLabels: Record<string, { label: string; description: string }> = {
  erp: { label: "ERP Completo", description: "Gestão de contratos" },
  cobranca: { label: "Cobrança Automática", description: "Boletos e PIX" },
  repasse: { label: "Repasse Automático", description: "Para proprietários" },
  relatorios: { label: "Relatórios Avançados", description: "Financeiros e operacionais" },
  dimob: { label: "DIMOB", description: "Declaração automática" },
  api: { label: "API Aberta", description: "Integrações customizadas" },
  multiFilial: { label: "Multi-filial", description: "Gestão de múltiplas unidades" },
  suporteVip: { label: "Suporte VIP", description: "Atendimento prioritário" },
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
    icon: Shield,
    title: "DIMOB Automático",
    description: "Declaração gerada automaticamente",
  },
];

export default function LocacaoPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-transparent" />
        
        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-secondary/10 text-secondary hover:bg-secondary/20">
              LOCAÇÃO
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
                <Banknote className="w-4 h-4 text-secondary" />
                <span>Repasse automático</span>
              </div>
            </div>
            
            <Link href="/calculadora">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
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

      {/* Plans Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos Kenlo Locação</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o volume de contratos da sua administradora
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative kenlo-card ${plan.popular ? 'border-secondary ring-2 ring-secondary/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-secondary text-secondary-foreground">
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
                      {plan.contracts} contratos
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
                      style={plan.popular ? { backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' } : {}}
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
              Adicione Pay, Seguros e Cash para maximizar receita
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/addons/pay">
                <Button variant="outline" className="gap-2">
                  Kenlo Pay
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/addons/seguros">
                <Button variant="outline" className="gap-2">
                  Kenlo Seguros
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
    </div>
  );
}
