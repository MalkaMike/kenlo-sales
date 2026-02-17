import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Globe, Smartphone, Palette, Search, Mail, BarChart3, ArrowRight, Calculator, Zap, Shield, Clock, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IMOB_IMPLEMENTATION } from "@shared/pricing-config";

export default function SitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 text-primary border-primary">
              PRODUTO STANDALONE
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Kenlo <span className="kenlo-gradient-text">Site</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Site profissional para imobiliárias com design moderno, SEO otimizado e integração completa com portais.
              Pode ser adquirido separadamente ou <strong>incluído gratuitamente</strong> com qualquer plano Kenlo IMOB.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2" asChild>
                <Link href="/calculadora">
                  <Calculator className="w-5 h-5" />
                  Simular Proposta
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link href="/produtos/imob">
                  Ver Kenlo IMOB
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Investimento</h2>
              <p className="text-muted-foreground">
                Preço transparente para quem quer apenas o site, sem CRM
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Standalone Pricing */}
              <Card className="border-2 border-gray-200">
                <CardHeader className="text-center pb-2">
                  <Badge variant="outline" className="w-fit mx-auto mb-2">STANDALONE</Badge>
                  <CardTitle className="text-2xl">Site Kenlo Avulso</CardTitle>
                  <CardDescription>Para quem não usa CRM Kenlo</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900">
                      R$ 249<span className="text-lg font-normal text-muted-foreground">/mês</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {`+ R$ ${IMOB_IMPLEMENTATION.toLocaleString("pt-BR")} de implantação (única)`}
                    </div>
                  </div>
                  <ul className="space-y-3 text-left mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Site responsivo profissional</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Hospedagem ilimitada</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>SSL/HTTPS incluído</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>SEO otimizado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Integração com portais</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <X className="w-5 h-5 text-gray-400" />
                      <span className="text-muted-foreground">CRM não incluído</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/calculadora">Solicitar Proposta</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Included with IMOB */}
              <Card className="border-2 border-primary bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  RECOMENDADO
                </div>
                <CardHeader className="text-center pb-2">
                  <Badge className="w-fit mx-auto mb-2 bg-green-600">INCLUÍDO</Badge>
                  <CardTitle className="text-2xl">Site + Kenlo IMOB</CardTitle>
                  <CardDescription>Site incluído em qualquer plano IMOB</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-primary">
                      R$ 0<span className="text-lg font-normal text-muted-foreground">/mês</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium mt-2">
                      Economia de R$ 249/mês
                    </div>
                  </div>
                  <ul className="space-y-3 text-left mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Tudo do plano Standalone</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-medium">CRM completo incluído</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Integração automática</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Leads direto no CRM</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>App Corretor</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Suporte unificado</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                    <Link href="/produtos/imob">Ver Planos IMOB</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recursos do Site Kenlo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Um site completo para sua imobiliária, com tudo que você precisa para atrair e converter clientes
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="kenlo-card">
              <CardHeader>
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                  <Globe className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mt-3">Design Responsivo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Site otimizado para desktop, tablet e celular. Experiência perfeita em qualquer dispositivo.
                </p>
              </CardContent>
            </Card>

            <Card className="kenlo-card">
              <CardHeader>
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                  <Search className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mt-3">SEO Otimizado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Estrutura otimizada para mecanismos de busca. Apareça nas primeiras posições do Google.
                </p>
              </CardContent>
            </Card>

            <Card className="kenlo-card">
              <CardHeader>
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                  <Palette className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mt-3">Personalização</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Cores, logo e layout personalizados para a identidade visual da sua imobiliária.
                </p>
              </CardContent>
            </Card>

            <Card className="kenlo-card">
              <CardHeader>
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                  <Zap className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mt-3">Integração Portais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Sincronização automática com ZAP, Viva Real, OLX e outros portais imobiliários.
                </p>
              </CardContent>
            </Card>

            <Card className="kenlo-card">
              <CardHeader>
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                  <Shield className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mt-3">SSL/HTTPS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Certificado de segurança incluído. Site seguro e confiável para seus clientes.
                </p>
              </CardContent>
            </Card>

            <Card className="kenlo-card">
              <CardHeader>
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                  <Mail className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg mt-3">Formulários de Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Capture leads diretamente do site com formulários inteligentes e integrados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Economize R$ 2.988/ano
              </h2>
              <p className="text-muted-foreground mb-6">
                Ao contratar qualquer plano Kenlo IMOB, o Site Kenlo é incluído sem custo adicional.
                Aproveite o CRM completo + Site profissional em um único pacote.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2" asChild>
                  <Link href="/calculadora">
                    <Calculator className="w-5 h-5" />
                    Simular Proposta Completa
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
