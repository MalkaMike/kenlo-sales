import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AnimatedStat } from "@/components/AnimatedStat";
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
  FileText,
  ArrowRight,
  TrendingUp,
  Zap,
  Check,
  Star,
  Target,
  Rocket,
  Globe,
  Eye
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
    features: ["CRM Completo", "Site Responsivo", "App Mobile", "Gestão de Leads"]
  },
  {
    title: "Kenlo Locação",
    description: "ERP para gestão completa de contratos de locação",
    icon: HomeIcon,
    href: "/produtos/locacao",
    badge: "LOCAÇÃO",
    color: "text-secondary",
    plans: ["Prime", "K", "K2"],
    features: ["Gestão de Contratos", "Boletos Automáticos", "Repasses", "Inadimplência"]
  },
  {
    title: "Site/CMS",
    description: "Landing page e site profissional com CMS integrado",
    icon: Globe,
    href: "#",
    badge: "DIGITAL",
    color: "text-blue-600",
    plans: ["Inclusos"],
    features: ["Landing Page", "Blog Integrado", "SEO Otimizado", "Responsivo"]
  },
];

const addons = [
  {
    title: "Leads",
    description: "Gestão automatizada de leads com distribuição inteligente via WhatsApp",
    icon: Users,
    href: "/addons/leads",
    highlight: "100 leads/mês inclusos"
  },
  {
    title: "Inteligência",
    description: "BI de KPIs de performance com Google Looker integrado",
    icon: Brain,
    href: "/addons/inteligencia",
    highlight: "Dashboards personalizados"
  },
  {
    title: "Assinatura",
    description: "Assinatura digital embutida na plataforma com validade jurídica",
    icon: FileSignature,
    href: "/addons/assinatura",
    highlight: "100% digital"
  },
  {
    title: "Pay",
    description: "Boleto e Split digital para cobrança automatizada",
    icon: CreditCard,
    href: "/addons/pay",
    highlight: "Split automático"
  },
  {
    title: "Seguros",
    description: "Seguros embutidos - ganhe receita extra por contrato",
    icon: Shield,
    href: "/addons/seguros",
    highlight: "R$10/contrato/mês"
  },
  {
    title: "Cash",
    description: "Antecipação de até 24 meses de aluguel para proprietários",
    icon: Banknote,
    href: "/addons/cash",
    highlight: "Liquidez imediata"
  },
];

const stats = [
  { value: "8.500+", numericValue: 8500, label: "Imobiliárias", icon: Building2, suffix: "+", color: "text-blue-600", bgColor: "bg-blue-600/10" },
  { value: "40.000+", numericValue: 40000, label: "Corretores ativos", icon: Users, suffix: "+", color: "text-purple-600", bgColor: "bg-purple-600/10" },
  { value: "R$40B+", numericValue: 40, label: "Em vendas", icon: TrendingUp, prefix: "R$", suffix: "B+", color: "text-green-600", bgColor: "bg-green-600/10" },
  { value: "10M+", numericValue: 10, label: "Visitantes únicos/mês", icon: Eye, suffix: "M+", color: "text-orange-600", bgColor: "bg-orange-600/10" },
  { value: "R$1,2B+", numericValue: 1.2, label: "Gestão de locação", icon: HomeIcon, prefix: "R$", suffix: "B+", color: "text-pink-600", bgColor: "bg-pink-600/10" },
];

const benefits = [
  "Plataforma completa para vendas e locação",
  "Integração nativa entre todos os módulos",
  "Suporte técnico especializado 24/7",
  "Atualizações constantes sem custo adicional",
  "Treinamento completo da equipe",
  "Migração de dados sem complicação"
];

export default function Home() {

  return (
    <div className="flex flex-col">
      {/* Hero Section - Redesigned */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlMTFkNDgiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptLTYgNmgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Headline */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8 leading-tight">
              <span className="inline-flex items-center gap-2 md:gap-3 flex-wrap justify-center">
                <span className="inline-flex items-baseline gap-2">
                  <span className="inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-pink-600 to-pink-700 text-white text-xl md:text-2xl font-black shadow-lg">
                    3
                  </span>
                  <span>soluções.</span>
                </span>
                <span className="inline-flex items-baseline gap-2">
                  <span className="inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 text-white text-xl md:text-2xl font-black shadow-lg">
                    1
                  </span>
                  <span className="kenlo-gradient-text">plataforma única.</span>
                </span>
                <span className="text-foreground">Infinitas possibilidades.</span>
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Plataforma integrada para <strong className="text-foreground">vendas e locação</strong> com <strong className="text-foreground">Site personalizável</strong>. 
              Tudo em um só lugar. Configure, simule e feche negócios mais rápido.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 gap-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild>
                <Link href="/calculadora">
                  <Rocket className="w-6 h-6" />
                  Criar Cotação Agora
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 gap-3 border-2 hover:bg-accent" asChild>
                <Link href="/kombos">
                  Ver Kombos e Descontos
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </Button>
            </div>


          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced */}
      <section className="py-16 border-y border-border/40 bg-gradient-to-r from-card/50 to-card/30">
        <div className="container">
          <div className="grid grid-cols-5 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <AnimatedStat
                key={index}
                icon={stat.icon}
                numericValue={stat.numericValue}
                label={stat.label}
                prefix={stat.prefix}
                suffix={stat.suffix}
                color={stat.color}
                bgColor={stat.bgColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Products Section - Enhanced */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Star className="w-4 h-4" />
              Produtos Core
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              3 pilares.{" "}
              <span className="kenlo-gradient-text">1 plataforma integrada.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              CRM para vendas ou locação, Site/CMS profissional e App mobile. Tudo funcionando junto, sem integrações complexas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product) => (
              <Link key={product.href} href={product.href}>
                <Card className="h-full kenlo-card group cursor-pointer border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br from-muted to-muted/50 ${product.color} group-hover:scale-110 transition-transform`}>
                        <product.icon className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {product.badge}
                      </span>
                    </div>
                    <CardTitle className="text-2xl mt-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </CardTitle>
                    <CardDescription className="text-base">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Features List */}
                    <div className="space-y-2">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Plans */}
                    <div className="flex gap-2 pt-2">
                      {product.plans.map((plan, idx) => (
                        <span
                          key={plan}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
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

                    {/* CTA */}
                    <div className="flex items-center text-sm font-semibold text-primary group-hover:gap-3 transition-all pt-2">
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

      {/* Add-ons Section - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-card/30 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
              <Zap className="w-4 h-4" />
              Potencialize seus resultados
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Add-ons que fazem a{" "}
              <span className="kenlo-gradient-text">diferença</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Funcionalidades inteligentes que se integram perfeitamente aos produtos Kenlo 
              e automatizam processos críticos do seu negócio.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {addons.map((addon) => (
              <Link key={addon.href} href={addon.href}>
                <Card className="h-full kenlo-card group cursor-pointer hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-muted to-muted/50 text-foreground w-fit group-hover:scale-110 transition-transform">
                      <addon.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl mt-3 group-hover:text-primary transition-colors">
                      Kenlo {addon.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {addon.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Highlight Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold mb-3">
                      <Star className="w-3.5 h-3.5" />
                      {addon.highlight}
                    </div>

                    <div className="flex items-center text-sm font-semibold text-muted-foreground group-hover:text-primary group-hover:gap-2 transition-all">
                      Saiba mais
                      <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - NEW */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Por que escolher{" "}
                <span className="kenlo-gradient-text">Kenlo</span>?
              </h2>
              <p className="text-xl text-muted-foreground">
                Mais do que software, uma parceria para o crescimento do seu negócio
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 pt-1.5">
                    <p className="text-base font-medium">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Kombos CTA Section - Enhanced */}
      <section className="py-24">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 kenlo-gradient opacity-95" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
            
            <div className="relative px-8 py-20 md:px-16 md:py-24 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold mb-8">
                <TrendingUp className="w-5 h-5" />
                Economize até 25% com Kombos
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Kombos: Mais produtos,{" "}
                <br className="hidden md:block" />
                menor investimento
              </h2>
              
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                Combine Imob + Locação com add-ons e ganhe descontos progressivos. 
                Quanto mais você digitaliza, menor o custo por unidade.
              </p>
              
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 gap-3 shadow-xl hover:scale-105 transition-transform" asChild>
                <Link href="/kombos">
                  Explorar Kombos
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder - NEW */}
      <section className="py-24 bg-card/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Quem usa{" "}
              <span className="kenlo-gradient-text">Kenlo</span>{" "}
              recomenda
            </h2>
            <p className="text-xl text-muted-foreground">
              Depoimentos de imobiliárias que transformaram seus resultados
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-12 text-center border-2 border-dashed border-muted-foreground/30">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <Star className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-muted-foreground">
                  Depoimentos em breve
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Estamos coletando depoimentos em vídeo de nossos clientes. 
                  Em breve você verá aqui histórias reais de sucesso.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Calculator CTA - Enhanced */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-primary/10 text-primary mx-auto mb-8 group-hover:scale-110 transition-transform">
              <FileText className="w-12 h-12" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Gerador de Cotaçãos Inteligente
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Configure produtos e add-ons, veja o investimento em tempo real com detecção automática 
              de Kombos, e exporte propostas profissionais em PDF ou link compartilhável.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 gap-3 shadow-lg shadow-primary/25" asChild>
              <Link href="/calculadora">
                <Rocket className="w-6 h-6" />
                Criar Cotação Agora
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
