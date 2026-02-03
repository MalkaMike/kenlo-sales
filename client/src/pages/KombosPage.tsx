import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp, Zap, Building2, Home, Layers } from "lucide-react";

interface KomboCardProps {
  name: string;
  description: string;
  discount: number;
  implementation: string;
  products: string[];
  addons: string[];
  idealFor: string[];
  badge?: string;
  icon: React.ElementType;
  gradient: string;
}

const KomboCard = ({ name, description, discount, implementation, products, addons, idealFor, badge, icon: Icon, gradient }: KomboCardProps) => {
  return (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50">
      {/* Background Gradient */}
      <div className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
      
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-primary to-secondary text-white font-bold px-3 py-1">
            {badge}
          </Badge>
        </div>
      )}

      <CardHeader className="relative">
        <div className={`w-16 h-16 rounded-2xl ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <CardTitle className="text-2xl font-bold mb-2">{name}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
        
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
          <div>
            <div className="text-3xl font-bold text-primary">
              {discount > 0 ? `-${discount}%` : "Tabela"}
            </div>
            <div className="text-xs text-muted-foreground">Desconto</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <div className="text-lg font-semibold">{implementation}</div>
            <div className="text-xs text-muted-foreground">Implantação</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Products */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">Produtos Incluídos</h4>
          <div className="space-y-2">
            {products.map((product, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium">{product}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">Add-ons Incluídos</h4>
          {addons.length > 0 ? (
            <div className="space-y-2">
              {addons.map((addon, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-secondary" />
                  </div>
                  <span className="text-sm font-medium">{addon}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nenhum add-on incluído</p>
          )}
        </div>

        {/* Ideal For */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">Ideal Para</h4>
          <div className="space-y-2">
            {idealFor.map((use, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{use}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button 
          className="w-full mt-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity" 
          size="lg"
          asChild
        >
          <Link href="/calculadora">
            Montar Proposta
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default function KombosPage() {
  const kombos: KomboCardProps[] = [
    {
      name: "Kombo Imob Start",
      description: "Solução completa para iniciar vendas digitais",
      discount: 10,
      implementation: "R$ 1.497",
      products: ["Kenlo Imob (CRM + Site)"],
      addons: ["Kenlo Leads", "Kenlo Assinatura"],
      idealFor: [
        "Imobiliárias focadas em vendas",
        "Equipes que precisam captar e converter leads",
        "Negócios que querem digitalizar contratos"
      ],
      icon: Sparkles,
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      name: "Kombo Imob Pro",
      description: "Máxima performance em vendas com inteligência",
      discount: 15,
      implementation: "R$ 1.497",
      products: ["Kenlo Imob (CRM + Site)"],
      addons: ["Kenlo Leads", "Kenlo Inteligência", "Kenlo Assinatura"],
      idealFor: [
        "Imobiliárias que querem maximizar conversão",
        "Equipes que tomam decisões baseadas em dados",
        "Negócios em crescimento acelerado"
      ],
      badge: "MAIS POPULAR",
      icon: TrendingUp,
      gradient: "bg-gradient-to-br from-primary to-pink-500",
    },
    {
      name: "Kombo Locação Pro",
      description: "Gestão inteligente de contratos de locação",
      discount: 10,
      implementation: "R$ 1.497",
      products: ["Kenlo Locação (ERP)"],
      addons: ["Kenlo Inteligência", "Kenlo Assinatura"],
      idealFor: [
        "Imobiliárias focadas em locação",
        "Administradoras de imóveis",
        "Negócios que precisam de BI e assinaturas digitais"
      ],
      icon: Home,
      gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
    },
    {
      name: "Kombo Core Gestão",
      description: "Gestão completa de vendas e locação",
      discount: 0,
      implementation: "R$ 1.497",
      products: ["Kenlo Imob (CRM + Site)", "Kenlo Locação (ERP)"],
      addons: [],
      idealFor: [
        "Imobiliárias que atuam em vendas E locação",
        "Negócios que querem plataforma unificada",
        "Empresas que preferem adicionar add-ons depois"
      ],
      icon: Building2,
      gradient: "bg-gradient-to-br from-purple-500 to-indigo-500",
    },
    {
      name: "Kombo Elite",
      description: "Solução completa com todos os recursos",
      discount: 20,
      implementation: "R$ 1.497",
      products: ["Kenlo Imob (CRM + Site)", "Kenlo Locação (ERP)"],
      addons: ["Kenlo Leads", "Kenlo Inteligência", "Kenlo Assinatura", "Kenlo Pay", "Kenlo Seguros", "Kenlo Cash"],
      idealFor: [
        "Imobiliárias que querem máxima digitalização",
        "Negócios que buscam vantagem competitiva total",
        "Empresas em expansão que precisam de todos os recursos"
      ],
      badge: "MELHOR CUSTO-BENEFÍCIO",
      icon: Layers,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmODJlNTIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptLTYgNmgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Kombos Kenlo
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Quanto mais você digitaliza,{" "}
              <span className="kenlo-gradient-text">menor o custo</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Kombos são pacotes inteligentes que combinam produtos e add-ons com descontos progressivos. 
              Escolha o Kombo ideal para o perfil da imobiliária e economize até 20%.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/calculadora">
                  Simular Proposta
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/">
                  Voltar ao Início
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Kombos Grid */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {kombos.map((kombo, idx) => (
              <KomboCard key={idx} {...kombo} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Por que escolher um Kombo?</h2>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Economia Garantida</h3>
                <p className="text-muted-foreground text-sm">
                  Descontos de 10% até 20% em todos os produtos e add-ons incluídos no Kombo
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Implantação Única</h3>
                <p className="text-muted-foreground text-sm">
                  Todos os Kombos têm implantação fixa de R$ 1.497, independente da quantidade de produtos
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Solução Completa</h3>
                <p className="text-muted-foreground text-sm">
                  Pacotes pensados para atender diferentes perfis de imobiliárias com tudo que precisam
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para montar a proposta ideal?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Use nossa calculadora inteligente para simular diferentes Kombos e ver os preços em tempo real
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link href="/calculadora">
                Abrir Calculadora
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
