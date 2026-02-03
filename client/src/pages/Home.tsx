import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Home as HomeIcon, 
  Users, 
  Brain, 
  FileSignature, 
  CreditCard, 
  Shield, 
  Banknote,
  Calculator,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap
} from "lucide-react";

const products = [
  {
    title: "Kenlo Imob",
    description: "CRM completo para vendas de imóveis com Site e App incluídos",
    icon: Building2,
    href: "/produtos/imob",
    badge: "VENDAS",
    color: "text-primary",
    plans: ["Prime", "K", "K2"],
  },
  {
    title: "Kenlo Locação",
    description: "ERP para gestão completa de contratos de locação",
    icon: HomeIcon,
    href: "/produtos/locacao",
    badge: "LOCAÇÃO",
    color: "text-secondary",
    plans: ["Prime", "K", "K2"],
  },
];

const addons = [
  {
    title: "Leads",
    description: "Gestão automatizada de leads com distribuição inteligente",
    icon: Users,
    href: "/addons/leads",
  },
  {
    title: "Inteligência",
    description: "BI de KPIs de performance e analytics avançado",
    icon: Brain,
    href: "/addons/inteligencia",
  },
  {
    title: "Assinatura",
    description: "Assinatura digital embutida na plataforma",
    icon: FileSignature,
    href: "/addons/assinatura",
  },
  {
    title: "Pay",
    description: "Boleto e Split digital embutido na plataforma",
    icon: CreditCard,
    href: "/addons/pay",
  },
  {
    title: "Seguros",
    description: "Seguros embutido no boleto - ganhe R$10/contrato/mês",
    icon: Shield,
    href: "/addons/seguros",
  },
  {
    title: "Cash",
    description: "Antecipe até 24 meses de aluguel para proprietários",
    icon: Banknote,
    href: "/addons/cash",
  },
];

const stats = [
  { value: "8.500+", label: "Imobiliárias" },
  { value: "40.000+", label: "Corretores ativos" },
  { value: "950+", label: "Cidades" },
  { value: "R$8B+", label: "Em vendas" },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-20" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Portal de Vendas Kenlo
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Configure a solução{" "}
              <span className="kenlo-gradient-text">ideal</span>{" "}
              para cada imobiliária
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Produtos, add-ons e Kombos personalizados. Simule propostas em tempo real 
              com nossa calculadora inteligente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculadora">
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                  <Calculator className="w-5 h-5" />
                  Abrir Calculadora
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

      {/* Stats Section */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Produtos Core</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Duas plataformas completas para vendas e locação, cada uma com 3 níveis de plano
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {products.map((product) => (
              <Link key={product.href} href={product.href}>
                <Card className="h-full kenlo-card group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl bg-muted ${product.color}`}>
                        <product.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                        {product.badge}
                      </span>
                    </div>
                    <CardTitle className="text-xl mt-4 group-hover:text-primary transition-colors">
                      {product.title}
                    </CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {product.plans.map((plan, idx) => (
                        <span
                          key={plan}
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            idx === 0
                              ? "bg-muted text-muted-foreground"
                              : idx === 1
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary/20 text-secondary"
                          }`}
                        >
                          {plan}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      Ver planos e preços
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Potencialize seus resultados
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Add-ons</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades extras que se integram nativamente aos produtos Kenlo
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addons.map((addon) => (
              <Link key={addon.href} href={addon.href}>
                <Card className="h-full kenlo-card group cursor-pointer">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-muted text-foreground w-fit">
                      <addon.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">
                      Kenlo {addon.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {addon.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      Saiba mais
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Kombos CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 kenlo-gradient opacity-90" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
            
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                Economize até 25%
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Kombos: Produtos + Add-ons com desconto
              </h2>
              
              <p className="text-white/80 max-w-2xl mx-auto mb-8">
                Combine Imob + Locação com add-ons e ganhe descontos progressivos. 
                Quanto mais você digitaliza, menor o custo por unidade.
              </p>
              
              <Link href="/kombos">
                <Button size="lg" variant="secondary" className="gap-2">
                  Explorar Kombos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator CTA */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Calculator className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Calculadora Inteligente
            </h2>
            <p className="text-muted-foreground mb-8">
              Configure produtos, add-ons e veja o investimento em tempo real. 
              Exporte propostas em PDF e compartilhe com clientes.
            </p>
            <Link href="/calculadora">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                <Calculator className="w-5 h-5" />
                Simular Proposta
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
