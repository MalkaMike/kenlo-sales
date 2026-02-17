import { ArrowRight, Check, FileSignature, Shield, Zap, Clock, DollarSign, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ADDONS } from "@shared/pricing-config";

export default function AssinaturasPage() {
  const addon = ADDONS.assinaturas;
  const monthlyPrice = Math.ceil(addon.annualPrice / 12);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#F2F2F2] via-white to-[#F2F2F2]">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F82E52]/10 text-[#F82E52] text-sm font-semibold mb-6">
              <FileSignature className="w-4 h-4" />
              ADD-ON IMOB + LOC
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-[#242424] mb-6">
              Kenlo Assinaturas
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Assinatura digital com Cerisign embutida no fluxo de trabalho. 
              Validade jurídica completa (ICP-Brasil). {addon.includedSignatures} assinaturas incluídas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#F82E52] hover:bg-[#F82E52]/90" asChild>
                <Link href="/calculadora">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Simular Cotação
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/kombos">
                  Ver Kombos com Desconto
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Perguntas que Vendem */}
      <section className="py-16 bg-[#F2F2F2]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#242424] mb-4">
              Perguntas que Vendem
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Use essas perguntas para identificar a dor do cliente e mostrar o valor da solução
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              "Quantos contratos você assina por mês?",
              "Quanto tempo leva para coletar todas as assinaturas?",
              "Você usa alguma plataforma externa de assinatura?",
            ].map((question, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-[#F82E52]/10 flex items-center justify-center mb-4">
                  <span className="text-[#F82E52] font-bold text-lg">{idx + 1}</span>
                </div>
                <p className="text-[#242424] font-medium">{question}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: addon.includedSignatures.toString(), label: "Assinaturas incluídas" },
              { value: "R$ 0", label: "Implementação" },
              { value: "ICP-Brasil", label: "Certificação oficial" },
              { value: "100%", label: "Validade jurídica" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-white rounded-lg border border-gray-200">
                <div className="text-3xl font-bold text-[#F82E52] mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-[#1A202C]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Por que Kenlo Assinaturas?
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Assinatura digital embutida no fluxo de trabalho com certificação oficial
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: Shield,
                title: "Certificação Cerisign Oficial",
                description: "Parceria com Cerisign garante validade jurídica completa (ICP-Brasil). Todas as assinaturas têm força legal.",
              },
              {
                icon: FileSignature,
                title: `${addon.includedSignatures} Assinaturas Incluídas`,
                description: `Plano já inclui ${addon.includedSignatures} assinaturas por mês. Cobre a maioria das imobiliárias sem custo adicional.`,
              },
              {
                icon: Zap,
                title: "Embutida no Fluxo",
                description: "Não precisa sair da plataforma Kenlo. Assinatura integrada no CRM e ERP, sem ferramentas externas.",
              },
              {
                icon: Clock,
                title: "Implementação R$ 0",
                description: "Sem custo de setup. Ative e comece a usar imediatamente. Excedentes com preço acessível por assinatura.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-[#4ABD8D]/10 p-6 rounded-lg border border-[#4ABD8D]/20">
                <div className="w-12 h-12 rounded-lg bg-[#F82E52] flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-[#F2F2F2]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#242424] mb-4">
              Preços
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Transparência total. Sem surpresas.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg border-2 border-[#F82E52]">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-[#F82E52] mb-2">
                  R$ {monthlyPrice}
                  <span className="text-xl text-gray-600">/mês</span>
                </div>
                <div className="text-gray-600">ou R$ {addon.annualPrice}/ano</div>
              </div>
              
              <div className="space-y-3 mb-6">
                {[
                  `${addon.includedSignatures} assinaturas incluídas por mês`,
                  "Certificação Cerisign (ICP-Brasil)",
                  "Validade jurídica completa",
                  "Embutida no CRM/ERP Kenlo",
                  "Implementação R$ 0",
                  "Excedentes: R$ 6/assinatura",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#4ABD8D] flex-shrink-0 mt-0.5" />
                    <span className="text-[#242424]">{item}</span>
                  </div>
                ))}
              </div>
              
              <Button size="lg" className="w-full bg-[#F82E52] hover:bg-[#F82E52]/90" asChild>
                <Link href="/calculadora">
                  Simular Cotação Completa
                </Link>
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-[#4ABD8D]/10 rounded-lg border border-[#4ABD8D]/20">
              <p className="text-sm text-[#242424] text-center">
                <strong className="text-[#4ABD8D]">Dica:</strong> Contrate via Kombo Imob Start, Imob Pro, Locação Pro ou Elite 
                para ganhar até 20% de desconto + implementação grátis de outros add-ons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Objeções */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#242424] mb-4">
              Objeções Comuns
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Respostas prontas para as principais dúvidas dos clientes
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                objection: "Já uso DocuSign/Clicksign",
                response: `Quanto você paga por mês? Com Kenlo, ${addon.includedSignatures} assinaturas já estão incluídas e a implementação é R$ 0. Tudo embutido no CRM.`,
              },
              {
                objection: "15 assinaturas não são suficientes",
                response: "Excedentes custam R$ 6 por assinatura. Mesmo assim, sai mais barato que plataformas externas. E você não precisa sair do Kenlo.",
              },
              {
                objection: "Não sei se tem validade jurídica",
                response: "Parceria oficial com Cerisign, certificação ICP-Brasil. Validade jurídica completa garantida. Mesma tecnologia usada por bancos e cartórios.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F82E52]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#F82E52] font-bold">{idx + 1}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#242424] mb-2">"{item.objection}"</p>
                    <p className="text-gray-600">{item.response}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-br from-[#F82E52] to-[#F82E52]/80">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Building2 className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para digitalizar suas assinaturas?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Monte a proposta perfeita com a calculadora Kenlo. 
              Detecção automática de Kombos e descontos.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/calculadora">
                <DollarSign className="w-5 h-5 mr-2" />
                Abrir Calculadora
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
