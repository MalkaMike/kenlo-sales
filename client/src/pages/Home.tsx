import { Link } from "wouter";
import { ADDONS, SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT, KOMBO_MAX_DISCOUNT_PERCENT, KOMBO_IMPLEMENTATION_COST } from "@shared/pricing-config";
import { formatCurrency } from "@shared/formatters";
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
  Eye,
  BarChart3,
  AlertTriangle,
  Trophy,
  Clock
} from "lucide-react";

const products = [
  {
    title: "Kenlo Imob",
    description: "CRM completo para vendas de imóveis com Site e App incluídos",
    icon: Building2,
    href: "/produtos/imob",
    badge: "VENDAS",
    color: "text-primary",
    plans: ["Prime", "K", "K\u00B2"],
    features: ["CRM Completo", "Site Responsivo", "App Mobile", "Gestão de Leads"]
  },
  {
    title: "Kenlo Locação",
    description: "ERP para gestão completa de contratos de locação",
    icon: HomeIcon,
    href: "/produtos/locacao",
    badge: "LOCAÇÃO",
    color: "text-secondary",
    plans: ["Prime", "K", "K\u00B2"],
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
    description: "Captação e distribuição inteligente de leads — nunca mais perca uma oportunidade",
    icon: Users,
    href: "/addons/leads",
    highlight: `${ADDONS.leads.includedWhatsAppLeads} leads/mês inclusos`
  },
  {
    title: "Inteligência",
    description: "Usuários ilimitados no BI Google Looker Pro — indispensável para gestão com dados",
    icon: Brain,
    href: "/addons/inteligencia",
    highlight: "Dashboards personalizados"
  },
  {
    title: "Assinatura",
    description: "Feche contratos sem papel, sem cartório, sem atraso — válida juridicamente",
    icon: FileSignature,
    href: "/addons/assinatura",
    highlight: `${ADDONS.assinaturas.includedSignatures} assinaturas/mês inclusas`
  },
  {
    title: "Pay",
    description: "Boleto + Split automático — o inquilino paga e o dinheiro cai direto na conta certa",
    icon: CreditCard,
    href: "/addons/pay",
    highlight: "Zero trabalho manual"
  },
  {
    title: "Seguros",
    description: "Seguro embutido no boleto — receita recorrente garantida sem nenhum esforço",
    icon: Shield,
    href: "/addons/seguros",
    highlight: `A partir de R$${SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT}/contrato/mês`
  },
  {
    title: "Cash",
    description: "Antecipe até 24 meses de aluguel — fidelize proprietários e se diferencie no mercado",
    icon: Banknote,
    href: "/addons/cash",
    highlight: "Fidelização garantida"
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

const leadOriginData = [
  { origin: "Originação Própria Offline", salesLeads: "4%", salesClosings: "19%", salesConv: "16,4%", rentalLeads: "3%", rentalClosings: "18%", rentalConv: "35,3%", highlight: false },
  { origin: "Originação Própria - Site", salesLeads: "10%", salesClosings: "23%", salesConv: "8,7%", rentalLeads: "11%", rentalClosings: "23%", rentalConv: "13%", highlight: true },
  { origin: "Originação Própria - Placa", salesLeads: "6%", salesClosings: "10%", salesConv: "6,8%", rentalLeads: "5%", rentalClosings: "11%", rentalConv: "14,3%", highlight: true },
  { origin: "Originação Própria - Ads", salesLeads: "9%", salesClosings: "11%", salesConv: "4,4%", rentalLeads: "11%", rentalClosings: "11%", rentalConv: "6,3%", highlight: false },
  { origin: "Portais Regionais", salesLeads: "11%", salesClosings: "9%", salesConv: "3,2%", rentalLeads: "4%", rentalClosings: "8%", rentalConv: "12,2%", highlight: false },
  { origin: "Portais Nacionais", salesLeads: "60%", salesClosings: "28%", salesConv: "1,8%", rentalLeads: "67%", rentalClosings: "28%", rentalConv: "2,5%", highlight: false },
];

const keyInsights = [
  {
    icon: AlertTriangle,
    stat: "60-70%",
    label: "dos leads vem de portais",
    detail: "Mas geram apenas 30% dos fechamentos",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: Trophy,
    stat: "60-70%",
    label: "dos fechamentos vem de originação própria",
    detail: "Site, placa, offline e indicação de corretor",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: BarChart3,
    stat: "8,7%",
    label: "conversão do site (vendas)",
    detail: "vs 1,8% dos portais nacionais",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Target,
    stat: "4,5x",
    label: "mais conversão que portais",
    detail: "Site próprio converte 4,5x mais que portais nacionais",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
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
            <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-3xl mx-auto leading-relaxed">
              Plataforma integrada para <strong className="text-foreground">vendas e locação</strong> com <strong className="text-foreground">Site personalizável</strong>. 
              Tudo em um só lugar. Configure, simule e feche negócios mais rápido.
            </p>

            {/* Data-driven tagline */}
            <p className="text-base text-muted-foreground mb-12 max-w-2xl mx-auto italic">
              "80% dos clientes não conhecem esses números. É aí que você impressiona." — Não vendemos software, compartilhamos dados que fazem a diferença.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 gap-3 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild>
                <Link href="/calculadora">
                  <Rocket className="w-6 h-6" />
                  Simular Cotação
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
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

      {/* Kombos Section - Packages with Savings */}
      <section className="py-24 bg-kenlo-dark text-white">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-kenlo-pink/20 text-kenlo-pink text-sm font-semibold mb-4">
              <TrendingUp className="w-4 h-4" />
              Economize até {KOMBO_MAX_DISCOUNT_PERCENT}%
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Kombos: Produtos + Add-ons com{" "}
              <span className="text-kenlo-pink">desconto</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Combine Imob + Locação com add-ons e ganhe descontos progressivos. 
              Quanto mais você digitaliza, menor o custo por unidade.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Imob Start */}
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-white">Imob Start</CardTitle>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-kenlo-pink/20 text-kenlo-pink">{KOMBO_MAX_DISCOUNT_PERCENT}% OFF</span>
                </div>
                <CardDescription className="text-white/70 text-xs">
                  Kenlo Imob + Leads + Inteligência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>CRM Completo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Site + App</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Captação de Leads</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>BI Ilimitado</span>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="w-full" asChild>
                  <Link href="/calculadora">Simular</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Imob Pro */}
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-white">Imob Pro</CardTitle>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-kenlo-pink/20 text-kenlo-pink">{KOMBO_MAX_DISCOUNT_PERCENT}% OFF</span>
                </div>
                <CardDescription className="text-white/70 text-xs">
                  Imob Start + Assinatura + Pay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Tudo do Imob Start</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Assinatura Digital</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Boleto + Split</span>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="w-full" asChild>
                  <Link href="/calculadora">Simular</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Locação Pro */}
            <Card className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-white">Locação Pro</CardTitle>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-kenlo-pink/20 text-kenlo-pink">{KOMBO_MAX_DISCOUNT_PERCENT}% OFF</span>
                </div>
                <CardDescription className="text-white/70 text-xs">
                  Locação + Assinatura + Pay + Seguros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>ERP Completo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Assinatura Digital</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Boleto + Split</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Seguros Embutidos</span>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="w-full" asChild>
                  <Link href="/calculadora">Simular</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Elite */}
            <Card className="bg-gradient-to-br from-kenlo-pink/20 to-kenlo-pink/10 border-kenlo-pink/30 hover:border-kenlo-pink/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-kenlo-pink" />
                    Elite
                  </CardTitle>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-kenlo-pink text-white">{KOMBO_MAX_DISCOUNT_PERCENT}% OFF</span>
                </div>
                <CardDescription className="text-white/70 text-xs">
                  Tudo incluído: Imob + Locação + Todos os Add-ons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Imob + Locação</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Todos os 6 Add-ons</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-kenlo-green" />
                    <span>Máxima economia</span>
                  </div>
                </div>
                <Button variant="default" size="sm" className="w-full bg-kenlo-pink hover:bg-kenlo-pink/90" asChild>
                  <Link href="/calculadora">Simular</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-white/70 text-sm mb-4">
              Implantação: {formatCurrency(KOMBO_IMPLEMENTATION_COST, 0)} (única vez) • {KOMBO_MAX_DISCOUNT_PERCENT}% de desconto em todas as mensalidades
            </p>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <Link href="/kombos">
                Ver Todos os Kombos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* KEY INSIGHTS - Data that Sells */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-semibold mb-4">
              <BarChart3 className="w-4 h-4" />
              Dados que Convencem
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              A verdade sobre{" "}
              <span className="kenlo-gradient-text">originação de leads</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Dados reais da Comunidade Kenlo com 8.500+ imobiliárias. Estes números mudam a forma como você vende.
            </p>
          </div>

          {/* Key Insight Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
            {keyInsights.map((insight, index) => (
              <div key={index} className={`p-6 rounded-2xl ${insight.bgColor} border border-${insight.color.replace('text-', '')}/20`}>
                <insight.icon className={`w-8 h-8 ${insight.color} mb-3`} />
                <div className={`text-4xl font-black ${insight.color} mb-1`}>{insight.stat}</div>
                <div className="text-sm font-semibold text-gray-900 mb-1">{insight.label}</div>
                <div className="text-xs text-gray-600">{insight.detail}</div>
              </div>
            ))}
          </div>

          {/* Lead Origin Performance Table */}
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-6">Performance por Origem de Lead</h3>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full border-collapse text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Origem</th>
                    <th className="text-center py-3 px-2 font-semibold text-blue-700">Leads Vendas</th>
                    <th className="text-center py-3 px-2 font-semibold text-blue-700">Fechamentos Vendas</th>
                    <th className="text-center py-3 px-2 font-semibold text-blue-900 bg-blue-50">Conv% Vendas</th>
                    <th className="text-center py-3 px-2 font-semibold text-purple-700">Leads Locação</th>
                    <th className="text-center py-3 px-2 font-semibold text-purple-700">Fechamentos Locação</th>
                    <th className="text-center py-3 px-2 font-semibold text-purple-900 bg-purple-50">Conv% Locação</th>
                  </tr>
                </thead>
                <tbody>
                  {leadOriginData.map((row, index) => (
                    <tr key={index} className={`border-b border-gray-200 ${row.highlight ? 'bg-green-50/50 font-medium' : ''}`}>
                      <td className="py-3 px-4 font-medium text-gray-900">{row.origin}</td>
                      <td className="py-3 px-2 text-center">{row.salesLeads}</td>
                      <td className="py-3 px-2 text-center">{row.salesClosings}</td>
                      <td className={`py-3 px-2 text-center font-bold ${row.highlight ? 'text-green-700 bg-green-100/50' : 'bg-blue-50/30'}`}>{row.salesConv}</td>
                      <td className="py-3 px-2 text-center">{row.rentalLeads}</td>
                      <td className="py-3 px-2 text-center">{row.rentalClosings}</td>
                      <td className={`py-3 px-2 text-center font-bold ${row.highlight ? 'text-green-700 bg-green-100/50' : 'bg-purple-50/30'}`}>{row.rentalConv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Insight Crítico:</strong> 60-70% dos leads vem de portais nacionais, mas geram apenas <strong>30% dos fechamentos</strong>. 
                Os 60-70% dos fechamentos reais vem da <strong>originação própria</strong> (site, placa, offline, indicação). 
                Por isso a Kenlo investe em Site otimizado por <strong>Neil Patel</strong>, a melhor ficha de imóvel do mercado, e integração com <strong>Quieres</strong> (placa inteligente).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Performance */}
      <section className="py-20 bg-gradient-to-b from-background to-card/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Performance de{" "}
                <span className="kenlo-gradient-text">Conversão</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Números reais da Comunidade Kenlo — sua equipe sabe onde está?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Sales Performance */}
              <div className="p-8 rounded-2xl bg-blue-50 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Vendas
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-blue-700">Média Comunidade</span>
                    <span className="text-4xl font-black text-blue-900">4,5%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '45%' }} />
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-blue-700">Campeões</span>
                    <span className="text-4xl font-black text-blue-900">9%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '90%' }} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-blue-700">
                    <Clock className="w-4 h-4" />
                    Tempo médio de fechamento: <strong>295 dias</strong>
                  </div>
                </div>
              </div>

              {/* Rental Performance */}
              <div className="p-8 rounded-2xl bg-purple-50 border border-purple-200">
                <h3 className="text-lg font-bold text-purple-900 mb-6 flex items-center gap-2">
                  <HomeIcon className="w-5 h-5" />
                  Locação
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-purple-700">Média Comunidade</span>
                    <span className="text-4xl font-black text-purple-900">7,5%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-3">
                    <div className="bg-purple-600 h-3 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm text-purple-700">Campeões</span>
                    <span className="text-4xl font-black text-purple-900">10%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-purple-700">
                    <Clock className="w-4 h-4" />
                    Tempo médio de fechamento: <strong>160 dias</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg font-semibold text-muted-foreground">
                "Qual é a sua taxa de conversão?" — <span className="text-primary">Essa é a primeira pergunta que você deve fazer.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Partnerships */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Parcerias{" "}
              <span className="kenlo-gradient-text">Estratégicas</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Kenlo não trabalha sozinha. Parcerias exclusivas que nenhum concorrente oferece.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
              <div className="text-3xl font-black text-blue-600 mb-2">Google</div>
              <div className="text-sm font-semibold text-blue-800 mb-2">1 de 12 empresas selecionadas</div>
              <p className="text-sm text-muted-foreground">Parceiro estratégico em real estate. Google Studio Pro integrado ao BI Kenlo Inteligência.</p>
            </div>
            <div className="p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
              <div className="text-3xl font-black text-orange-600 mb-2">Neil Patel</div>
              <div className="text-sm font-semibold text-orange-800 mb-2">SEO de classe mundial</div>
              <p className="text-sm text-muted-foreground">Sites Kenlo otimizados pelo maior especialista em SEO do mundo. Taxas promocionais exclusivas.</p>
            </div>
            <div className="p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
              <div className="text-3xl font-black text-red-600 mb-2">Tokyo Marine</div>
              <div className="text-sm font-semibold text-red-800 mb-2">Seguros embutidos</div>
              <p className="text-sm text-muted-foreground">Seguro no boleto com 35-45% de comissão para a imobiliária. Receita passiva garantida.</p>
            </div>
            <div className="p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
              <div className="text-3xl font-black text-green-600 mb-2">Cerisign</div>
              <div className="text-sm font-semibold text-green-800 mb-2">Assinatura digital</div>
              <p className="text-sm text-muted-foreground">Uma das maiores empresas de assinatura digital do mundo. Contratos assinados dentro da plataforma.</p>
            </div>
            <div className="p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
              <div className="text-3xl font-black text-violet-600 mb-2">Quieres</div>
              <div className="text-sm font-semibold text-violet-800 mb-2">Placa inteligente</div>
              <p className="text-sm text-muted-foreground">Placa com QR code que rastreia leads. A mídia que mais converte no mercado imobiliário não é digital.</p>
            </div>
            <div className="p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
              <div className="text-3xl font-black text-pink-600 mb-2">Cupola</div>
              <div className="text-sm font-semibold text-pink-800 mb-2">Treinamento especializado</div>
              <p className="text-sm text-muted-foreground">Método testado e aprovado para gestão de locação. Três frentes, uma jornada estratégica.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Reliability */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4">Confiabilidade Comprovada</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="text-4xl font-black text-green-600 mb-1">99,98%</div>
                <div className="text-sm text-muted-foreground">Uptime CRM</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-black text-green-600 mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Uptime Site</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-black text-blue-600 mb-1">5 min</div>
                <div className="text-sm text-muted-foreground">Primeira resposta</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-black text-blue-600 mb-1">4h</div>
                <div className="text-sm text-muted-foreground">Tempo de resolução</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
                Economize até {KOMBO_MAX_DISCOUNT_PERCENT}% com Kombos
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

      {/* Success Stories */}
      <section className="py-24 bg-card/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Histórias de{" "}
              <span className="kenlo-gradient-text">Sucesso</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Resultados reais de imobiliárias que usam Kenlo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 border-2 hover:border-primary/30 transition-all">
              <div className="text-5xl font-black text-primary mb-3">60%</div>
              <h3 className="text-lg font-bold mb-2">Fechamentos via Site</h3>
              <p className="text-sm text-muted-foreground">
                Imobiliária campeã investe em Meta/Google e atinge 60% dos fechamentos pelo site próprio. A Kenlo deu a ferramenta, o cliente colocou a gasolina.
              </p>
            </Card>
            <Card className="p-8 border-2 hover:border-primary/30 transition-all">
              <div className="text-5xl font-black text-green-600 mb-3">10%</div>
              <h3 className="text-lg font-bold mb-2">Fechamentos via Comunidade</h3>
              <p className="text-sm text-muted-foreground">
                Clientes dos planos K e K² geram 10% dos seus fechamentos através de parcerias na Comunidade Kenlo. Melhor ganhar 50% de algo que 100% de nada.
              </p>
            </Card>
            <Card className="p-8 border-2 hover:border-primary/30 transition-all">
              <div className="text-5xl font-black text-blue-600 mb-3">40%</div>
              <h3 className="text-lg font-bold mb-2">Aumento com Inteligência</h3>
              <p className="text-sm text-muted-foreground">
                Cliente descobriu com o relatório Safra que sua melhor campanha era completamente diferente do que pensava. Mudou a estratégia e aumentou fechamentos em 40%.
              </p>
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
              Gerador de Cotações Inteligente
            </h2>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Configure produtos e add-ons, veja o investimento em tempo real com detecção automática 
              de Kombos, e exporte propostas profissionais em PDF ou link compartilhável.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 gap-3 shadow-lg shadow-primary/25" asChild>
              <Link href="/calculadora">
                <Rocket className="w-6 h-6" />
                Simular Cotação
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
