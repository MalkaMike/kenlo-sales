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
      <section className="py-32">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-24">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Imobiliárias que se destacam hoje
            </h1>
            <p className="text-xl text-gray-500">
              Dados da comunidade Kenlo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Card 1: R$ 500k */}
            <div className="text-center py-12">
              <div className="text-8xl font-bold text-[#F82E52] mb-6">
                R$ 500k
              </div>
              <p className="text-gray-600 text-lg mb-6">
                de comissão por corretor/ano
              </p>
              <p className="text-gray-500 mb-8">
                Nossos campeões têm corretores que originam R$ 500k de comissão por ano nos últimos 3 anos — só no usado.
              </p>
              <div className="text-2xl font-semibold text-[#F82E52]">
                E seus corretores?
              </div>
            </div>

            {/* Card 2: 4,5% e 7,5% */}
            <div className="text-center py-12">
              <div className="flex justify-center items-baseline gap-8 mb-6">
                <div>
                  <div className="text-8xl font-bold text-[#F82E52]">4,5%</div>
                  <p className="text-gray-600 mt-2">vendas</p>
                </div>
                <div className="text-6xl text-gray-300">|</div>
                <div>
                  <div className="text-8xl font-bold text-[#F82E52]">7,5%</div>
                  <p className="text-gray-600 mt-2">locação</p>
                </div>
              </div>
              <p className="text-gray-600 text-lg mb-8">
                Taxa de conversão média
              </p>
              <div className="text-2xl font-semibold text-[#F82E52]">
                E você?
              </div>
            </div>

            {/* Card 3: 25% */}
            <div className="text-center py-12">
              <div className="text-8xl font-bold text-[#F82E52] mb-6">
                25%
              </div>
              <p className="text-gray-600 text-lg mb-8">
                dos fechamentos vêm do site próprio
              </p>
              <div className="text-2xl font-semibold text-[#F82E52]">
                E você?
              </div>
            </div>

            {/* Card 4: 60% */}
            <div className="text-center py-12">
              <div className="text-8xl font-bold text-[#F82E52] mb-6">
                60%
              </div>
              <p className="text-gray-600 text-lg mb-6">
                das vendas (cliente campeão)
              </p>
              <p className="text-gray-500 mb-8">
                Conversão: <span className="font-bold text-[#F82E52]">10,5%</span>. Mesma ferramenta. Piloto certo.
              </p>
              <div className="text-2xl font-semibold text-[#F82E52]">
                E você?
              </div>
            </div>

            {/* Card 5: 40 imóveis */}
            <div className="md:col-span-2 text-center py-12">
              <div className="text-8xl font-bold text-[#F82E52] mb-6">
                40
              </div>
              <p className="text-gray-600 text-lg mb-6">
                imóveis máximo por corretor
              </p>
              <p className="text-gray-500 mb-8">
                Especialização = conversão
              </p>
              <div className="text-2xl font-semibold text-[#F82E52]">
                E você? 200? 300 imóveis por corretor?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 1: O PROBLEMA */}
      <section className="py-32 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold text-gray-900 mb-8">
              Você sabe onde está perdendo dinheiro?
            </h2>
            <div className="text-2xl font-semibold text-[#F82E52]">
              O corretor falha, o lead é ruim, ou são os processos da própria imobiliária?
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
            {[
              {
                title: "Canais de origem",
                text: "Você acompanha? Quem origina mais leads? Quem origina mais vendas?",
              },
              {
                title: "Leads dispersos",
                text: "10 lugares diferentes. Zero controle. Zero rastreabilidade.",
              },
              {
                title: "Corretor falha",
                text: "Mas você sabe quando? Redistribui em 5 min? Ou descobre semanas depois?",
              },
              {
                title: "Site bonito",
                text: "Gera venda ou só gasta dinheiro?",
              },
              {
                title: "Portais trazem leads",
                text: "Mas de que qualidade? Você mede?",
              },
              {
                title: "Tudo separado",
                text: "CRM, site, app, assinatura — nada conversa. Você perde leads no meio do caminho.",
              },
              {
                title: "Decisões no achismo",
                text: "Sem dados. Sem BI. Sem rastreabilidade.",
              },
              {
                title: "Metas",
                text: "Você coloca suas próprias metas? Ou tenta entender o que é possível?",
              },
              {
                title: "Funil",
                text: "Faz sentido? Leads de janeiro — quem fechou em novembro? Como foi sua campanha nesse momento?",
              },
              {
                title: "Proprietário",
                text: "80% vendem para comprar. Você cuida dele? Manda feedback provando seu trabalho?",
              },
              {
                title: "SEO e IA",
                text: "Seu site é otimizado para Google? E para IA (AEO)? Como você acompanha?",
              },
              {
                title: "Autoridade e marca",
                text: "Como você constrói? Como você mede?",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 text-xl mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCO 2: A SOLUÇÃO */}
      <section className="py-32">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              CRM + Site + App
            </h2>
            <p className="text-2xl text-gray-500">
              Tudo integrado. Tudo rastreável.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
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
              <div key={idx} className="bg-white p-10 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-700">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                K e K² ganham:
              </h3>
              <p className="text-gray-600">Blog + Landing Page</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                K² exclusivo:
              </h3>
              <p className="text-gray-600">API (Mar/2026) + 2 treinamentos/ano</p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 3: POR QUE KENLO */}
      <section className="py-32 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Por que Kenlo
            </h2>
            <p className="text-2xl text-gray-500">4 razões. Sem enrolação.</p>
          </div>

          <div className="space-y-16">
            {[
              {
                num: "1",
                title: "Tudo integrado",
                desc: "CRM + Site + App + Portais. 1 lugar. 1 login. Lead entra no site → cai no CRM → notifica app. Tempo real. Zero planilha.",
              },
              {
                num: "2",
                title: "Site incluso",
                desc: "Outros CRMs: R$ 200-500/mês extra. Kenlo: incluso. Todos os planos.",
              },
              {
                num: "3",
                title: "+100 portais. 1 clique.",
                desc: "Cadastra 1x. Publica 100x. Atualiza 1x. Sincroniza 100x. Economize horas por semana.",
              },
              {
                num: "4",
                title: "Add-ons nativos",
                desc: "Leads (R$ 497/mês) — Distribuição com IA. Inteligência (R$ 297/mês) — BI Google Looker. Assinatura (R$ 37/mês) — Digital, jurídica. Tudo integrado. Sem gambiarra.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 bg-[#F82E52] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {item.num}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
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
      <section className="py-32">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold text-gray-900">
              Kenlo em números
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              { num: "8.500+", label: "imobiliárias" },
              { num: "40.000+", label: "corretores" },
              { num: "R$ 8B+", label: "processados" },
              { num: "950+", label: "cidades" },
              { num: "+100", label: "portais integrados" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-8xl font-bold text-[#F82E52] mb-6">
                  {item.num}
                </div>
                <div className="text-xl text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOCO 5: PLANOS E PREÇOS */}
      <section className="py-32 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Prime, K ou K²
            </h2>
            <p className="text-2xl text-gray-500">Você escolhe.</p>
          </div>

          {/* Tabela de Preços */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-16">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-6 text-left text-gray-600 font-medium"></th>
                  {PLAN_KEYS.map((key) => (
                    <th key={key} className="p-6 text-center">
                      <div className="text-3xl font-bold text-[#F82E52] mb-2">
                        {formatCurrency(IMOB_PLANS[key].annualPrice)}
                      </div>
                      <div className="text-sm text-gray-600">{IMOB_PLANS[key].name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-6 text-gray-700">Implantação</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-6 text-center text-gray-600">
                      {formatCurrency(IMOB_IMPLEMENTATION)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-6 text-gray-700">Usuários</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-6 text-center text-gray-600">
                      {IMOB_PLANS[key].includedUsers}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-6 text-gray-700">CRM + Site + App + Portais</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-6 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-6 text-gray-700">Blog + Landing</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-6 text-center">
                      {key === "prime" ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-6 text-gray-700">API</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-6 text-center">
                      {key === "k2" ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-6 text-gray-700">Treinamentos</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-6 text-center text-gray-600">
                      {key === "k2" ? "2x/ano" : "—"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-6 text-gray-700">Suporte VIP</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-6 text-center">
                      {key === "prime" ? (
                        <span className="text-gray-600">Opcional</span>
                      ) : (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-6 text-gray-700">CS Dedicado</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-6 text-center">
                      {key === "k2" ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-600">Opcional</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Usuários Adicionais */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8">Usuários adicionais</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-left text-gray-600 font-medium">Faixa</th>
                  {PLAN_KEYS.map((key) => (
                    <th key={key} className="p-4 text-center text-gray-600 font-medium">
                      {IMOB_PLANS[key].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {IMOB_ADDITIONAL_USERS.prime.map((tier, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="p-4 text-gray-700">
                      {tier.to === Infinity ? `${tier.from}+` : `${tier.from}-${tier.to}`}
                    </td>
                    {PLAN_KEYS.map((key) => {
                      const planTier = IMOB_ADDITIONAL_USERS[key][idx];
                      return (
                        <td key={key} className="p-4 text-center text-gray-600">
                          {formatCurrency(planTier.price)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add-ons */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kenlo Leads</h3>
              <div className="text-3xl font-bold text-[#F82E52] mb-3">R$ 497/mês</div>
              <p className="text-gray-600">Distribuição com IA</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kenlo Inteligência</h3>
              <div className="text-3xl font-bold text-[#F82E52] mb-3">R$ 297/mês</div>
              <p className="text-gray-600">BI Google Looker</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kenlo Assinatura</h3>
              <div className="text-3xl font-bold text-[#F82E52] mb-3">R$ 37/mês</div>
              <p className="text-gray-600">Digital, jurídica</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculadora">
              <Button size="lg" className="bg-[#F82E52] hover:bg-[#d92847] text-white">
                Simular Proposta
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-[#F82E52] text-[#F82E52] hover:bg-red-50">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* BLOCO 6: OBJEÇÕES */}
      <section className="py-32">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Perguntas diretas. Respostas diretas.
            </h2>
            <p className="text-2xl text-gray-500">Sem enrolação.</p>
          </div>

          <div className="space-y-12">
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
              <div key={idx} className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  "{item.q}"
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
