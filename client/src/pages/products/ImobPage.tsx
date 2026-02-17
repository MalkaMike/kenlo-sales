import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Building2,
  Globe,
  Smartphone,
  Network,
  Layers,
  BookOpen,
  HardDrive,
  GraduationCap,
  Headphones,
  ArrowRight,
  Calculator,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  IMOB_PLANS,
  IMOB_IMPLEMENTATION,
  IMOB_ADDITIONAL_USERS,
  PREMIUM_SERVICES,
  ADDONS,
  type PlanTier,
} from "@shared/pricing-config";

const PLAN_KEYS: PlanTier[] = ["prime", "k", "k2"];

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

export default function ImobPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* BLOCO 0: E VOCÊ? */}
      <section className="relative py-20 bg-gradient-to-br from-pink-50 via-white to-pink-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGODJFNTIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aDJ2NGgtMnptMC02di00aDJ2NGgtMnptLTYgNnYtNGgydjRoLTJ6bTAtNnYtNGgydjRoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        
        <div className="container relative max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Imobiliárias que se destacam hoje
            </h1>
            <p className="text-xl text-gray-600">
              Compare seus resultados com os líderes do mercado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1: R$ 500k */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-pink-100 hover:border-pink-500 transition-all">
              <div className="text-6xl font-bold text-[#F82E52] mb-4">
                R$ 500k
              </div>
              <p className="text-gray-700 mb-4">
                de comissão por corretor/ano
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Nossos campeões têm corretores que originam R$ 500k de comissão por ano nos últimos 3 anos — só no usado.
              </p>
              <div className="text-2xl font-bold text-[#F82E52]">
                E seus corretores?
              </div>
            </div>

            {/* Card 2: 4,5% e 7,5% */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-pink-100 hover:border-pink-500 transition-all">
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-6xl font-bold text-[#F82E52]">4,5%</span>
                <span className="text-2xl text-gray-600">vendas</span>
              </div>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-6xl font-bold text-[#F82E52]">7,5%</span>
                <span className="text-2xl text-gray-600">locação</span>
              </div>
              <p className="text-gray-700 mb-6">
                Taxa de conversão média da comunidade Kenlo
              </p>
              <div className="text-2xl font-bold text-[#F82E52]">
                E você?
              </div>
            </div>

            {/* Card 3: 25% */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-pink-100 hover:border-pink-500 transition-all">
              <div className="text-6xl font-bold text-[#F82E52] mb-4">
                25%
              </div>
              <p className="text-gray-700 mb-6">
                dos fechamentos vêm do site próprio
              </p>
              <div className="text-2xl font-bold text-[#F82E52]">
                E você?
              </div>
            </div>

            {/* Card 4: 60% */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-pink-100 hover:border-pink-500 transition-all">
              <div className="text-6xl font-bold text-[#F82E52] mb-4">
                60%
              </div>
              <p className="text-gray-700 mb-4">
                das vendas (cliente campeão)
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Conversão: <span className="font-bold text-[#F82E52]">10,5%</span>. Mesma ferramenta. Piloto certo.
              </p>
              <div className="text-2xl font-bold text-[#F82E52]">
                E você?
              </div>
            </div>

            {/* Card 5: 40 imóveis */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-pink-100 hover:border-pink-500 transition-all">
              <div className="text-6xl font-bold text-[#F82E52] mb-4">
                40
              </div>
              <p className="text-gray-700 mb-4">
                imóveis máximo por corretor
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Especialização = conversão
              </p>
              <div className="text-2xl font-bold text-[#F82E52]">
                E você? 200? 300 imóveis por corretor?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 1: O PROBLEMA */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Você sabe onde está perdendo dinheiro?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Canais de origem",
                text: "Você acompanha? Quem origina mais leads? Quem origina mais vendas?",
              },
              {
                icon: <AlertCircle className="w-6 h-6" />,
                title: "Leads dispersos",
                text: "10 lugares diferentes. Zero controle. Zero rastreabilidade.",
              },
              {
                icon: <HelpCircle className="w-6 h-6" />,
                title: "Corretor falha",
                text: "Mas você sabe quando? Redistribui em 5 min? Ou descobre semanas depois?",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Site bonito",
                text: "Gera venda ou só gasta dinheiro?",
              },
              {
                icon: <Network className="w-6 h-6" />,
                title: "Portais trazem leads",
                text: "Mas de que qualidade? Você mede?",
              },
              {
                icon: <Layers className="w-6 h-6" />,
                title: "Tudo separado",
                text: "CRM, site, app, assinatura — nada conversa. Você perde leads no meio do caminho.",
              },
              {
                icon: <AlertCircle className="w-6 h-6" />,
                title: "Decisões no achismo",
                text: "Sem dados. Sem BI. Sem rastreabilidade.",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Metas",
                text: "Você coloca suas próprias metas? Ou tenta entender o que é possível?",
              },
              {
                icon: <Layers className="w-6 h-6" />,
                title: "Funil",
                text: "Faz sentido? Leads de janeiro — quem fechou em novembro? Como foi sua campanha nesse momento?",
              },
              {
                icon: <Building2 className="w-6 h-6" />,
                title: "Proprietário",
                text: "80% vendem para comprar. Você cuida dele? Manda feedback provando seu trabalho?",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "SEO e IA",
                text: "Seu site é otimizado para Google? E para IA (AEO)? Como você acompanha?",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Autoridade e marca",
                text: "Como você constrói? Como você mede?",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-6 rounded-xl border border-gray-200 hover:border-pink-500 hover:shadow-lg transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-pink-100 text-[#F82E52] flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#F82E52] text-white rounded-2xl p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              O corretor falha, o lead é ruim, ou são os processos da própria imobiliária?
            </h3>
          </div>
        </div>
      </section>

      {/* BLOCO 2: A SOLUÇÃO */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              CRM + Site + App
            </h2>
            <p className="text-2xl text-gray-600">
              Tudo integrado. Tudo rastreável.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 mb-12 shadow-lg">
            <p className="text-xl text-gray-700 mb-4">
              Plataforma completa para vendas. CRM, Site (SEO + AEO), App nativo, +100 portais.
            </p>
            <p className="text-xl font-bold text-[#F82E52]">
              Um lugar. Um login.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <Building2 className="w-8 h-8" />,
                title: "CRM Completo",
                desc: "Lead → Pipeline → Fechamento. Rastreável.",
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Site Incluso",
                desc: "SEO + AEO. Google + IA. Responsivo. Integrado ao CRM.",
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "App Corretor",
                desc: "iOS + Android. Offline. Notificação em tempo real.",
              },
              {
                icon: <Network className="w-8 h-8" />,
                title: "+100 Portais",
                desc: "1 clique. 100 lugares. Sincronização automática.",
              },
              {
                icon: <Layers className="w-8 h-8" />,
                title: "Gestão de Imóveis",
                desc: "Fotos, vídeos, plantas. Histórico completo.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-pink-500"
              >
                <div className="w-16 h-16 rounded-lg bg-pink-100 text-[#F82E52] flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border-2 border-green-500">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                K e K² ganham:
              </h3>
              <p className="text-gray-600">Blog + Landing Page</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-pink-500">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                K² exclusivo:
              </h3>
              <p className="text-gray-600">API (Mar/2026) + 2 treinamentos/ano</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 3: POR QUE KENLO */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Por que Kenlo
            </h2>
            <p className="text-2xl text-gray-600">4 razões. Sem enrolação.</p>
          </div>

          <div className="space-y-6">
            {[
              {
                num: "1",
                title: "Tudo integrado",
                desc: "CRM + Site + App + Portais. Lead entra → CRM → App. 1 login. 0 planilhas.",
              },
              {
                num: "2",
                title: "Site incluso",
                desc: "Outros CRMs: R$ 200-500/mês extra. Kenlo: incluso. Todos os planos.",
              },
              {
                num: "3",
                title: "+100 portais. 1 clique.",
                desc: "Cadastra 1x. Publica 100x. Atualiza 1x. Sincroniza 100x.",
              },
              {
                num: "4",
                title: "Add-ons nativos",
                desc: "Leads (R$ 497/mês) — Distribuição com IA. Inteligência (R$ 297/mês) — BI Google Looker. Assinatura (R$ 37/mês) — Digital, jurídica. Tudo integrado. Sem gambiarra.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex gap-6 p-8 rounded-2xl bg-gray-50 hover:bg-pink-50 transition-all border-2 border-transparent hover:border-pink-500"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#F82E52] text-white flex items-center justify-center text-3xl font-bold">
                  {item.num}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCO 4: KENLO EM NÚMEROS */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-white to-pink-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kenlo em números
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { num: "8.500+", label: "imobiliárias" },
              { num: "40.000+", label: "corretores" },
              { num: "R$ 8 bilhões+", label: "processados" },
              { num: "950+", label: "cidades" },
              { num: "+100", label: "portais integrados" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-all"
              >
                <div className="text-6xl font-bold text-[#F82E52] mb-4">
                  {item.num}
                </div>
                <div className="text-xl text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCO 5: PLANOS E PREÇOS */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Prime, K ou K²
            </h2>
            <p className="text-2xl text-gray-600">Você escolhe.</p>
          </div>

          {/* Tabela de Preços */}
          <div className="overflow-x-auto mb-12">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-left font-bold text-gray-900"></th>
                  {PLAN_KEYS.map((key) => (
                    <th key={key} className="p-4 text-center font-bold text-gray-900">
                      {IMOB_PLANS[key].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Preço/mês</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center text-2xl font-bold text-[#F82E52]">
                      {formatCurrency(IMOB_PLANS[key].annualPrice)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">Implantação</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center text-gray-700">
                      {formatCurrency(IMOB_IMPLEMENTATION)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Usuários</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center text-gray-700">
                      {IMOB_PLANS[key].includedUsers}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">CRM + Site + App + Portais</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center">
                      <Check className="w-6 h-6 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Blog + Landing</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center">
                      {key === "prime" ? (
                        <X className="w-6 h-6 text-red-500 mx-auto" />
                      ) : (
                        <Check className="w-6 h-6 text-green-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">API</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center">
                      {key === "k2" ? (
                        <Check className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">Treinamentos</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center text-gray-700">
                      {key === "k2" ? "2x/ano" : "—"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className="p-4 font-semibold text-gray-900">Suporte VIP</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center text-gray-700">
                      {key === "prime" ? "Opcional" : <Check className="w-6 h-6 text-green-500 mx-auto" />}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 font-semibold text-gray-900">CS Dedicado</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center text-gray-700">
                      {key === "k2" ? <Check className="w-6 h-6 text-green-500 mx-auto" /> : "Opcional"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Usuários Adicionais */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Usuários adicionais:</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="p-3 text-left font-semibold text-gray-900">Faixa</th>
                    {PLAN_KEYS.map((key) => (
                      <th key={key} className="p-3 text-center font-semibold text-gray-900">
                        {IMOB_PLANS[key].name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {IMOB_ADDITIONAL_USERS.prime.map((tier, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="p-3 text-gray-700">
                        {tier.to === Infinity ? `${tier.from}+` : `${tier.from}-${tier.to}`}
                      </td>
                      {PLAN_KEYS.map((key) => {
                        const planTier = IMOB_ADDITIONAL_USERS[key][idx];
                        return (
                          <td key={key} className="p-3 text-center text-gray-700">
                            {formatCurrency(planTier.price)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add-ons */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-pink-500">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kenlo Leads</h3>
              <p className="text-2xl font-bold text-[#F82E52] mb-2">R$ 497/mês</p>
              <p className="text-gray-600">Distribuição com IA</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-green-500">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kenlo Inteligência</h3>
              <p className="text-2xl font-bold text-[#4ABD8D] mb-2">R$ 297/mês</p>
              <p className="text-gray-600">BI Google Looker</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-blue-500">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Kenlo Assinatura</h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">R$ 37/mês</p>
              <p className="text-gray-600">Digital, jurídica</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculadora">
              <Button size="lg" className="bg-[#F82E52] hover:bg-[#d91d3f] text-white">
                <Calculator className="w-5 h-5 mr-2" />
                Simular Proposta
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-[#F82E52] text-[#F82E52] hover:bg-pink-50">
              Falar com Especialista
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* BLOCO 6: OBJEÇÕES */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Perguntas diretas. Respostas diretas.
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Já tenho CRM",
                a: "Tem site incluso? App? +100 portais? Kenlo = CRM + Site + App + Portais. 1 lugar.",
              },
              {
                q: "Meu site funciona",
                a: "Integrado ao CRM? Lead cai no pipeline automaticamente? Kenlo: site → CRM → app. Tempo real. Zero planilha.",
              },
              {
                q: "Quanto custa publicar em portais?",
                a: "Integração inclusa. Todos os planos. 1 clique. 100 portais. Mensalidade dos portais você paga direto para eles.",
              },
              {
                q: "Quero distribuir leads automaticamente",
                a: "Add-on Leads (R$ 497/mês). Distribuição por região/especialidade. Score. WhatsApp. Não atendeu em 5 min? Redistribui.",
              },
              {
                q: "Quero BI e relatórios",
                a: "Add-on Inteligência (R$ 297/mês). Google Looker Pro. Usuários ilimitados. Dashboards personalizáveis. Toda a equipe.",
              },
              {
                q: "Quanto tempo para implementar?",
                a: "7-14 dias. Migração + treinamento + go-live. Equipe dedicada. R$ 1.497 (única vez).",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  "{item.q}"
                </h3>
                <p className="text-gray-700 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
