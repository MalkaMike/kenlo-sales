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
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Imobiliárias que se destacam hoje
            </h1>
            <p className="text-lg text-gray-500">
              Dados da comunidade Kenlo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Card 1: R$ 500k */}
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-[#F82E52] mb-4">
                R$ 500k
              </div>
              <p className="text-gray-600 text-base mb-4">
                de comissão por corretor/ano
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Nossos campeões têm corretores que originam R$ 500k de comissão por ano nos últimos 3 anos — só no usado.
              </p>
              <div className="text-xl font-semibold text-[#F82E52]">
                E seus corretores?
              </div>
            </div>

            {/* Card 2: 4,5% e 7,5% */}
            <div className="text-center py-8">
              <div className="flex justify-center items-baseline gap-6 mb-4">
                <div>
                  <div className="text-5xl font-bold text-[#F82E52]">4,5%</div>
                  <p className="text-gray-600 text-sm mt-1">vendas</p>
                </div>
                <div className="text-5xl text-gray-300">|</div>
                <div>
                  <div className="text-5xl font-bold text-[#F82E52]">7,5%</div>
                  <p className="text-gray-600 text-sm mt-1">locação</p>
                </div>
              </div>
              <p className="text-gray-600 text-base mb-6">
                Taxa de conversão média
              </p>
              <div className="text-xl font-semibold text-[#F82E52]">
                E você?
              </div>
            </div>

            {/* Card 3: 25% */}
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-[#F82E52] mb-4">
                25%
              </div>
              <p className="text-gray-600 text-base mb-6">
                dos fechamentos vêm do site próprio
              </p>
              <div className="text-xl font-semibold text-[#F82E52]">
                E você?
              </div>
            </div>

            {/* Card 4: 60% */}
            <div className="text-center py-8">
              <div className="text-5xl font-bold text-[#F82E52] mb-4">
                60%
              </div>
              <p className="text-gray-600 text-base mb-4">
                das vendas (cliente campeão)
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Conversão: 10,5%. Mesma ferramenta. Piloto certo.
              </p>
              <div className="text-xl font-semibold text-[#F82E52]">
                E você?
              </div>
            </div>

            {/* Card 5: 40 imóveis */}
            <div className="text-center py-8 md:col-span-2">
              <div className="text-5xl font-bold text-[#F82E52] mb-4">
                40 imóveis
              </div>
              <p className="text-gray-600 text-base mb-6">
                máximo por corretor
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Especialização = conversão.
              </p>
              <div className="text-xl font-semibold text-[#F82E52]">
                E você? 200? 300 imóveis por corretor?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 1: O PROBLEMA */}
      <section className="py-12 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Você sabe onde está perdendo dinheiro?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Canais de origem
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Você acompanha? Quem origina mais leads? Quem origina mais vendas?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Leads dispersos
                  </h3>
                  <p className="text-gray-600 text-sm">
                    10 lugares diferentes. Zero controle. Zero rastreabilidade.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Corretor falha
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Mas você sabe quando? Redistribui em 5 min? Ou descobre semanas depois?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Site bonito
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Gera venda ou só gasta dinheiro?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Network className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Portais trazem leads
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Mas de que qualidade? Você mede?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Layers className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Tudo separado
                  </h3>
                  <p className="text-gray-600 text-sm">
                    CRM, site, app, assinatura — nada conversa. Você perde leads no meio do caminho.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 7 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Decisões no "achismo"
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Sem dados. Sem BI. Sem rastreabilidade.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 8 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Metas
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Você coloca suas próprias metas? Ou tenta entender o que é possível?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 9 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <HardDrive className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Funil
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Faz sentido? Leads de janeiro — quem fechou em novembro? Como foi sua campanha nesse momento?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 10 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Proprietário
                  </h3>
                  <p className="text-gray-600 text-sm">
                    80% vendem para comprar. Você cuida dele? Manda feedback provando seu trabalho?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 11 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Globe className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    SEO e IA
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Seu site é otimizado para Google? E para IA (AEO)? Como você acompanha?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 12 */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Autoridade e marca
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Como você constrói? Como você mede?
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-2xl font-bold text-gray-900">
              O corretor falha, o lead é ruim, ou são os{" "}
              <span className="text-[#F82E52]">processos da própria imobiliária</span>?
            </p>
          </div>
        </div>
      </section>

      {/* BLOCO 2: A SOLUÇÃO */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              CRM + Site + App
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              Tudo integrado. Tudo rastreável.
            </p>
            <p className="text-base text-gray-500 max-w-3xl mx-auto">
              Plataforma completa para vendas. CRM, Site (SEO + AEO), App nativo, +100 portais. Um lugar. Um login.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* CRM Completo */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">CRM Completo</h3>
              <p className="text-gray-600 text-sm">
                Lead → Pipeline → Fechamento. Rastreável.
              </p>
            </div>

            {/* Site Incluso */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Site Incluso</h3>
              <p className="text-gray-600 text-sm">
                SEO + AEO. Google + IA. Responsivo. Integrado ao CRM.
              </p>
            </div>

            {/* App Corretor */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">App Corretor</h3>
              <p className="text-gray-600 text-sm">
                iOS + Android. Offline. Notificação em tempo real.
              </p>
            </div>

            {/* +100 Portais */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Network className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">+100 Portais</h3>
              <p className="text-gray-600 text-sm">
                1 clique. 100 lugares. Sincronização automática.
              </p>
            </div>

            {/* Gestão de Imóveis */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <HardDrive className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gestão de Imóveis</h3>
              <p className="text-gray-600 text-sm">
                Cadastro. Fotos. Documentos. Histórico.
              </p>
            </div>

            {/* Blog/Landing Page */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Blog/Landing Page</h3>
              <p className="text-gray-600 text-sm">
                K e K² ganham. Conteúdo. SEO. Autoridade.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* K e K² ganham */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                K e K² ganham
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F82E52] flex-shrink-0 mt-0.5" />
                  <span>Blog e Landing Pages personalizáveis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F82E52] flex-shrink-0 mt-0.5" />
                  <span>Treinamentos 2x/ano (K²)</span>
                </li>
              </ul>
            </div>

            {/* K² exclusivo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                K² exclusivo
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F82E52] flex-shrink-0 mt-0.5" />
                  <span>API para integrações customizadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#F82E52] flex-shrink-0 mt-0.5" />
                  <span>CS Dedicado e Suporte VIP incluídos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 3: POR QUE KENLO */}
      <section className="py-12 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Por que Kenlo
            </h2>
            <p className="text-lg text-gray-500">
              4 razões. Sem enrolação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Razão 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#F82E52] text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Tudo integrado
                </h3>
                <p className="text-gray-600 text-sm">
                  CRM + Site + App + Portais. Um lugar. Um login. Lead entra no site, cai no CRM, corretor recebe no app. Tempo real.
                </p>
              </div>
            </div>

            {/* Razão 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#F82E52] text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Site incluso
                </h3>
                <p className="text-gray-600 text-sm">
                  Não paga separado. Site otimizado (SEO + AEO). Responsivo. Integrado ao CRM. Todos os planos.
                </p>
              </div>
            </div>

            {/* Razão 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#F82E52] text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  +100 portais
                </h3>
                <p className="text-gray-600 text-sm">
                  Cadastra 1 vez. Publica em 100+ portais. 1 clique. Sincronização automática. Economize horas.
                </p>
              </div>
            </div>

            {/* Razão 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#F82E52] text-white flex items-center justify-center font-bold text-lg">
                  4
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Add-ons nativos
                </h3>
                <p className="text-gray-600 text-sm">
                  Leads, Inteligência, Assinatura. Integração nativa. Sem gambiarra. Sem API externa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 4: KENLO EM NÚMEROS */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Kenlo em números
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Stat 1 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-[#F82E52] mb-3">
                8.500+
              </div>
              <p className="text-lg text-gray-600">
                Imobiliárias
              </p>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-[#F82E52] mb-3">
                40.000+
              </div>
              <p className="text-lg text-gray-600">
                Corretores ativos
              </p>
            </div>

            {/* Stat 3 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-[#F82E52] mb-3">
                R$ 8B+
              </div>
              <p className="text-lg text-gray-600">
                Em vendas
              </p>
            </div>

            {/* Stat 4 */}
            <div className="text-center">
              <div className="text-5xl font-bold text-[#F82E52] mb-3">
                950+
              </div>
              <p className="text-lg text-gray-600">
                Cidades
              </p>
            </div>

            {/* Stat 5 */}
            <div className="text-center md:col-span-2">
              <div className="text-5xl font-bold text-[#F82E52] mb-3">
                +100
              </div>
              <p className="text-lg text-gray-600">
                Portais integrados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 5: PLANOS E PREÇOS */}
      <section className="py-12 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Planos e Preços
            </h2>
            <p className="text-lg text-gray-500">
              Escolha o plano ideal para sua operação
            </p>
          </div>

          {/* Pricing Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-900">
                    Plano
                  </th>
                  {PLAN_KEYS.map((key) => (
                    <th key={key} className="text-center p-4">
                      <div className="font-semibold text-gray-900 capitalize mb-1">
                        {key === "k2" ? "K²" : key.charAt(0).toUpperCase() + key.slice(1)}
                      </div>
                      <div className="text-2xl font-bold text-[#F82E52]">
                        {formatCurrency(Math.round(IMOB_PLANS[key].annualPrice / 12))}/mês
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-600 text-sm">Usuários inclusos</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center text-gray-900 font-medium">
                      {IMOB_PLANS[key].includedUsers}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-600 text-sm">CRM</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center">
                      <Check className="w-5 h-5 text-[#F82E52] mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-600 text-sm">Site Incluso</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center">
                      <Check className="w-5 h-5 text-[#F82E52] mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-600 text-sm">App Corretor</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center">
                      <Check className="w-5 h-5 text-[#F82E52] mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-600 text-sm">+100 Portais</td>
                  {PLAN_KEYS.map((key) => (
                    <td key={key} className="p-4 text-center">
                      <Check className="w-5 h-5 text-[#F82E52] mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-600 text-sm">Blog/Landing Page</td>
                  <td className="p-4 text-center">
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-[#F82E52] mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-[#F82E52] mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-600 text-sm">Treinamentos</td>
                  <td className="p-4 text-center">
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="p-4 text-center text-gray-900 text-sm">
                    2x/ano
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-600 text-sm">Suporte VIP</td>
                  <td className="p-4 text-center text-gray-900 text-sm">
                    Opcional
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-[#F82E52] mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-[#F82E52] mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-600 text-sm">CS Dedicado</td>
                  <td className="p-4 text-center text-gray-900 text-sm">
                    Opcional
                  </td>
                  <td className="p-4 text-center text-gray-900 text-sm">
                    Opcional
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-[#F82E52] mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-4 text-gray-600 text-sm">API</td>
                  <td className="p-4 text-center">
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <X className="w-5 h-5 text-gray-300 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-[#F82E52] mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Usuários Adicionais */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-12">
            <h3 className="font-semibold text-gray-900 mb-4">
              Usuários Adicionais
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {PLAN_KEYS.map((key) => (
                <div key={key}>
                  <div className="font-semibold text-gray-900 capitalize mb-3">
                    {key === "k2" ? "K²" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div className="space-y-2 text-sm">
                    {IMOB_ADDITIONAL_USERS[key].map((tier, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-600">{tier.from}-{tier.to === 999 ? '100+' : tier.to}</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(tier.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="mb-12">
            <h3 className="font-semibold text-gray-900 mb-6 text-center">
              Add-ons Disponíveis
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Leads */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Kenlo Leads
                </h4>
                <div className="text-2xl font-bold text-[#F82E52] mb-3">
                  {formatCurrency(Math.round(ADDONS.leads.annualPrice / 12))}/mês
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Distribuição automática, qualificação por score, WhatsApp integrado
                </p>
                <p className="text-gray-500 text-xs">
                  Implantação: {formatCurrency(ADDONS.leads.implementation)}
                </p>
              </div>

              {/* Inteligência */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Kenlo Inteligência
                </h4>
                <div className="text-2xl font-bold text-[#F82E52] mb-3">
                  {formatCurrency(Math.round(ADDONS.inteligencia.annualPrice / 12))}/mês
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  BI powered by Google Looker Pro. Usuários ilimitados.
                </p>
                <p className="text-gray-500 text-xs">
                  Implantação: {formatCurrency(ADDONS.inteligencia.implementation)}
                </p>
              </div>

              {/* Assinatura */}
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Kenlo Assinatura
                </h4>
                <div className="text-2xl font-bold text-[#F82E52] mb-3">
                  {formatCurrency(Math.round(ADDONS.assinaturas.annualPrice / 12))}/mês
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Assinatura digital embutida. 15 assinaturas inclusas.
                </p>
                <p className="text-gray-500 text-xs">
                  Implantação: {formatCurrency(ADDONS.assinaturas.implementation)}
                </p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cotacao">
              <Button size="lg" className="bg-[#F82E52] hover:bg-[#F82E52]/90 text-white">
                <Calculator className="w-5 h-5 mr-2" />
                Simular Proposta
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Falar com Especialista
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* BLOCO 6: OBJEÇÕES */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Perguntas diretas. Respostas diretas.
            </h2>
            <p className="text-lg text-gray-500">
              Sem enrolação.
            </p>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Pergunta 1 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                "Já tenho CRM"
              </h3>
              <p className="text-gray-600 text-sm">
                Tem site incluso? App? +100 portais? Kenlo = CRM + Site + App + Portais. 1 lugar.
              </p>
            </div>

            {/* Pergunta 2 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                "Meu site funciona"
              </h3>
              <p className="text-gray-600 text-sm">
                Integrado ao CRM? Lead cai no pipeline automaticamente? Kenlo: site → CRM → app. Tempo real. Zero planilha.
              </p>
            </div>

            {/* Pergunta 3 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                "Quanto custa publicar em portais?"
              </h3>
              <p className="text-gray-600 text-sm">
                Integração inclusa. Todos os planos. 1 clique. 100 portais. Mensalidade dos portais você paga direto para eles.
              </p>
            </div>

            {/* Pergunta 4 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                "Quero distribuir leads automaticamente"
              </h3>
              <p className="text-gray-600 text-sm">
                Add-on Leads (R$ 497/mês). Distribuição por região/especialidade. Score. WhatsApp. Não atendeu em 5 min? Redistribui.
              </p>
            </div>

            {/* Pergunta 5 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                "Quero BI e relatórios"
              </h3>
              <p className="text-gray-600 text-sm">
                Add-on Inteligência (R$ 297/mês). Google Looker Pro. Usuários ilimitados. Dashboards personalizáveis. Toda a equipe.
              </p>
            </div>

            {/* Pergunta 6 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                "Quanto tempo para implementar?"
              </h3>
              <p className="text-gray-600 text-sm">
                7-14 dias. Migração + treinamento + go-live. Equipe dedicada. R$ 1.497 (única vez).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
