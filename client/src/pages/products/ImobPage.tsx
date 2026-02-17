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
  Target,
  BarChart3,
  Users,
  FileText,
  Zap,
  Shield,
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
      {/* BLOCO 0: E VOCÊ? - Kenlo Design System */}
      <section className="py-16 bg-[#F2F2F2]">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#242424] mb-3">
              Imobiliárias que se destacam hoje
            </h1>
            <p className="text-lg text-gray-600">
              Dados da comunidade Kenlo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card 1: R$ 500k - DESTAQU            {/* Card 1: R$ 500k - AZUL MARINHO COMPACT */}
            <div className="bg-[#1A202C] p-4 rounded-lg border border-[#1A202C] shadow-sm">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">
                  R$ 500k
                </div>
                <p className="text-white/90 text-xs mb-2">
                  de comissão por corretor/ano⁽¹⁾
                </p>
                <div className="text-sm font-bold text-[#F82E52] mb-2">
                  E seus corretores?
                </div>
                <p className="text-white/50 text-[9px]">
                  (1) Média Comissões de venda dos top Performers da Comunidade Kenlo 2025
                </p>
              </div>
            </div>

            {/* Card 2: 4,5% / 7,5% - MÉDIA KENLO */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div>
                    <div className="text-4xl font-bold text-[#F82E52]">
                      4,5%
                    </div>
                    <p className="text-gray-500 text-xs">vendas</p>
                  </div>
                  <div className="text-2xl text-gray-300">|</div>
                  <div>
                    <div className="text-4xl font-bold text-[#F82E52]">
                      7,5%
                    </div>
                    <p className="text-gray-500 text-xs">locação</p>
                  </div>
                </div>
                <p className="text-[#242424] text-sm mb-2 font-semibold">
                  Taxa de conversão média
                </p>
                <div className="text-sm font-bold text-[#F82E52]">
                  E você?
                </div>
              </div>
            </div>

            {/* Card 3: 25% - MÉDIA KENLO */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#F82E52] mb-1">
                  25%
                </div>
                <p className="text-[#242424] text-sm mb-2 font-semibold">
                  dos fechamentos na média vêm do site da imobiliária
                </p>
                <div className="text-4xl font-bold text-[#4ABD8D] mb-1">
                  9% <span className="text-gray-400">vs</span> <span className="text-gray-400">2%</span>
                </div>
                <p className="text-[#242424] text-xs mb-2">
                  Taxa de conversão dos leads que vêm do site vs Portais nacionais
                </p>
                <div className="text-sm font-bold text-[#F82E52]">
                  E você?
                </div>
              </div>
            </div>

            {/* Card 4: 60% + 10,5% - BEST PERFORMERS */}
            <div className="bg-[#F82E52] p-4 rounded-lg border border-[#F82E52] shadow-sm">
              <div className="text-center">
                <p className="text-white/90 text-xs mb-2 font-semibold">
                  Best Performers Comunidade Kenlo
                </p>
                <div className="text-4xl font-bold text-white mb-1">
                  60%
                </div>
                <p className="text-white/90 text-xs mb-2 font-medium">
                  dos fechamentos vêm do Site
                </p>
                <div className="text-3xl font-bold text-white mb-1">
                  10,5%
                </div>
                <p className="text-white/90 text-xs mb-2 font-medium">
                  taxa de conversão
                </p>
                <p className="text-white/70 text-xs italic mb-2">
                  Mesma ferramenta. Piloto e gasolina diferentes.
                </p>
                <div className="text-sm font-bold text-white">
                  E você?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 1: O PROBLEMA - Kenlo Design System */}
      <section className="py-14 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-[#242424] mb-3">
              Você sabe onde está perdendo dinheiro?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <TrendingUp className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Canais de origem
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Você acompanha? Quem origina mais leads? Quem origina mais vendas?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <AlertCircle className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Leads dispersos
                  </h3>
                  <p className="text-gray-600 text-sm">
                    10 lugares diferentes. Zero controle. Zero rastreabilidade.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <HelpCircle className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Corretor falha
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Mas você sabe quando? Redistribui em 5 min? Ou descobre semanas depois?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Globe className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Site bonito
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Gera venda ou só gasta dinheiro?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Network className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Portais trazem leads
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Mas de que qualidade? Você mede?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Layers className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Tudo separado
                  </h3>
                  <p className="text-gray-600 text-sm">
                    CRM, site, app, assinatura — nada conversa. Você perde leads no meio do caminho.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 7 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <BarChart3 className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Decisões no "achismo"
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Sem dados. Sem BI. Sem rastreabilidade.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 8 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Target className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Metas
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Você coloca suas próprias metas? Ou tenta entender o que é possível?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 9 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Zap className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Funil
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Faz sentido? Leads de janeiro — quem fechou em novembro? Como foi sua campanha nesse momento?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 10 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Users className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Proprietário
                  </h3>
                  <p className="text-gray-600 text-sm">
                    80% vendem para comprar. Você cuida dele? Manda feedback provando seu trabalho?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 11 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Globe className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    SEO e IA
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Seu site é otimizado para Google? E para IA (AEO)? Como você acompanha?
                  </p>
                </div>
              </div>
            </div>

            {/* Card 12 */}
            <div className="bg-[#F2F2F2] p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Shield className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Autoridade e marca
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Como você constrói? Como você mede?
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-lg text-[#242424] font-semibold">
              O corretor falha, o lead é ruim, ou são os processos da própria imobiliária?
            </p>
          </div>
        </div>
      </section>

      {/* BLOCO 2: A SOLUÇÃO - Kenlo Design System */}
      <section className="py-14 bg-[#1A202C]">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-3">
              CRM + Site + App
            </h2>
            <p className="text-white/70 text-lg">
              Tudo integrado. Tudo rastreável.
            </p>
            <p className="text-white/60 text-base mt-2">
              Plataforma completa para vendas. CRM, Site (SEO + AEO), App nativo, +100 portais. Um lugar. Um login.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Card 1: CRM */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F82E52] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#242424] mb-2">
                  CRM Completo
                </h3>
                <p className="text-gray-600 text-sm">
                  Lead → Pipeline → Fechamento. Rastreável.
                </p>
              </div>
            </div>

            {/* Card 2: Site */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F82E52] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#242424] mb-2">
                  Site Incluso
                </h3>
                <p className="text-gray-600 text-sm">
                  SEO + AEO. Google + IA. Responsivo. Integrado ao CRM.
                </p>
              </div>
            </div>

            {/* Card 3: App */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F82E52] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#242424] mb-2">
                  App Corretor
                </h3>
                <p className="text-gray-600 text-sm">
                  iOS + Android. Offline. Notificação em tempo real.
                </p>
              </div>
            </div>

            {/* Card 4: Portais */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#F82E52] rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-[#242424] mb-2">
                  +100 Portais
                </h3>
                <p className="text-gray-600 text-sm">
                  1 clique. 100 lugares. Sincronização automática.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Card 5: Gestão */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <HardDrive className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Gestão de Imóveis
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Cadastro. Fotos. Documentos. Histórico.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 6: Blog */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <BookOpen className="w-5 h-5 text-[#F82E52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    Blog/Landing Page
                  </h3>
                  <p className="text-gray-600 text-sm">
                    K e K² ganham. Conteúdo. SEO. Autoridade.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 7: K e K² */}
            <div className="bg-[#4ABD8D]/10 p-5 rounded-lg border border-[#4ABD8D]">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <GraduationCap className="w-5 h-5 text-[#4ABD8D]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    K e K² ganham
                  </h3>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• Blog e Landing Pages personalizáveis</li>
                    <li>• Treinamentos 2x/ano (K²)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Card 8: K² exclusivo */}
            <div className="bg-[#4ABD8D]/10 p-5 rounded-lg border border-[#4ABD8D]">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Headphones className="w-5 h-5 text-[#4ABD8D]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] mb-2">
                    K² exclusivo
                  </h3>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>• API para integrações customizadas</li>
                    <li>• CS Dedicado e Suporte VIP incluídos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 3: POR QUE KENLO - Kenlo Design System */}
      <section className="py-14 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-[#242424] mb-3">
              Por que Kenlo
            </h2>
            <p className="text-gray-600 text-lg">
              4 razões. Sem enrolação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Razão 1 */}
            <div className="bg-[#F2F2F2] p-6 rounded-lg border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#F82E52] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] text-lg mb-2">
                    Tudo integrado
                  </h3>
                  <p className="text-gray-600 text-sm">
                    CRM + Site + App + Portais. Um lugar. Um login. Lead entra no site, cai no CRM, corretor recebe no app. Tempo real.
                  </p>
                </div>
              </div>
            </div>

            {/* Razão 2 */}
            <div className="bg-[#F2F2F2] p-6 rounded-lg border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#F82E52] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] text-lg mb-2">
                    Site incluso
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Não paga separado. Site otimizado (SEO + AEO). Responsivo. Integrado ao CRM. Todos os planos.
                  </p>
                </div>
              </div>
            </div>

            {/* Razão 3 */}
            <div className="bg-[#F2F2F2] p-6 rounded-lg border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#F82E52] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] text-lg mb-2">
                    +100 portais
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Cadastra 1 vez. Publica em 100+ portais. 1 clique. Sincronização automática. Economize horas.
                  </p>
                </div>
              </div>
            </div>

            {/* Razão 4 */}
            <div className="bg-[#F2F2F2] p-6 rounded-lg border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#F82E52] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">4</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#242424] text-lg mb-2">
                    Add-ons nativos
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Leads, Inteligência, Assinatura. Integração nativa. Sem gambiarra. Sem API externa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 4: NÚMEROS - Kenlo Design System */}
      <section className="py-14 bg-[#F2F2F2]">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-[#242424] mb-3">
              Kenlo em números
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Stat 1 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-4xl font-bold text-[#F82E52] mb-2">
                8.500+
              </div>
              <p className="text-[#242424] text-sm font-semibold">
                Imobiliárias
              </p>
            </div>

            {/* Stat 2 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-4xl font-bold text-[#F82E52] mb-2">
                40.000+
              </div>
              <p className="text-[#242424] text-sm font-semibold">
                Corretores ativos
              </p>
            </div>

            {/* Stat 3 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-4xl font-bold text-[#F82E52] mb-2">
                R$ 8B+
              </div>
              <p className="text-[#242424] text-sm font-semibold">
                Em vendas
              </p>
            </div>

            {/* Stat 4 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-4xl font-bold text-[#F82E52] mb-2">
                950+
              </div>
              <p className="text-[#242424] text-sm font-semibold">
                Cidades
              </p>
            </div>

            {/* Stat 5 */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
              <div className="text-4xl font-bold text-[#F82E52] mb-2">
                +100
              </div>
              <p className="text-[#242424] text-sm font-semibold">
                Portais integrados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 5: PREÇOS - Kenlo Design System */}
      <section className="py-14 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-[#242424] mb-3">
              Planos e Preços
            </h2>
            <p className="text-gray-600 text-lg">
              Escolha o plano ideal para sua operação
            </p>
          </div>

          {/* Tabela de Planos */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F2F2F2]">
                    <th className="px-4 py-3 text-left text-sm font-bold text-[#242424]">
                      Plano
                    </th>
                    {PLAN_KEYS.map((planKey) => (
                      <th
                        key={planKey}
                        className="px-4 py-3 text-center text-sm font-bold text-[#242424]"
                      >
                        <div className="mb-1">
                          {planKey === "prime"
                            ? "Prime"
                            : planKey === "k"
                            ? "K"
                            : "K²"}
                        </div>
                        <div className="text-2xl font-bold text-[#F82E52]">
                          {formatCurrency(IMOB_PLANS[planKey].annualPrice / 12)}/mês
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Usuários inclusos */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Usuários inclusos
                    </td>
                    {PLAN_KEYS.map((planKey) => (
                      <td
                        key={planKey}
                        className="px-4 py-3 text-center text-sm font-semibold text-[#242424]"
                      >
                        {IMOB_PLANS[planKey].includedUsers}
                      </td>
                    ))}
                  </tr>

                  {/* CRM */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">CRM</td>
                    {PLAN_KEYS.map((planKey) => (
                      <td
                        key={planKey}
                        className="px-4 py-3 text-center"
                      >
                        <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                      </td>
                    ))}
                  </tr>

                  {/* Site Incluso */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Site Incluso
                    </td>
                    {PLAN_KEYS.map((planKey) => (
                      <td
                        key={planKey}
                        className="px-4 py-3 text-center"
                      >
                        <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                      </td>
                    ))}
                  </tr>

                  {/* App Corretor */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      App Corretor
                    </td>
                    {PLAN_KEYS.map((planKey) => (
                      <td
                        key={planKey}
                        className="px-4 py-3 text-center"
                      >
                        <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                      </td>
                    ))}
                  </tr>

                  {/* +100 Portais */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      +100 Portais
                    </td>
                    {PLAN_KEYS.map((planKey) => (
                      <td
                        key={planKey}
                        className="px-4 py-3 text-center"
                      >
                        <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                      </td>
                    ))}
                  </tr>

                  {/* Blog/Landing Page */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Blog/Landing Page
                    </td>
                    <td className="px-4 py-3 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                    </td>
                  </tr>

                  {/* Treinamentos */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Treinamentos
                    </td>
                    <td className="px-4 py-3 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-[#242424]">
                      2x/ano
                    </td>
                  </tr>

                  {/* Suporte VIP */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Suporte VIP
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      Opcional
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      Opcional
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                    </td>
                  </tr>

                  {/* CS Dedicado */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      CS Dedicado
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      Opcional
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      Opcional
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                    </td>
                  </tr>

                  {/* API */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">API</td>
                    <td className="px-4 py-3 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Usuários Adicionais */}
          <div className="bg-[#F2F2F2] p-6 rounded-lg border border-gray-200 mb-6">
            <h3 className="font-bold text-[#242424] text-lg mb-4">
              Usuários Adicionais
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Prime */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="font-bold text-[#242424] mb-2">Prime</div>
                <div className="text-sm text-gray-600">
                  <div>
                    1-∞
                    <span className="float-right font-semibold text-[#F82E52]">
                      {formatCurrency(IMOB_ADDITIONAL_USERS.prime[0].price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* K */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="font-bold text-[#242424] mb-2">K</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    1-5
                    <span className="float-right font-semibold text-[#F82E52]">
                      {formatCurrency(IMOB_ADDITIONAL_USERS.k[0].price)}
                    </span>
                  </div>
                  <div>
                    6-∞
                    <span className="float-right font-semibold text-[#F82E52]">
                      {formatCurrency(IMOB_ADDITIONAL_USERS.k[1].price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* K² */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="font-bold text-[#242424] mb-2">K²</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    1-10
                    <span className="float-right font-semibold text-[#F82E52]">
                      {formatCurrency(IMOB_ADDITIONAL_USERS.k2[0].price)}
                    </span>
                  </div>
                  <div>
                    11-100
                    <span className="float-right font-semibold text-[#F82E52]">
                      {formatCurrency(IMOB_ADDITIONAL_USERS.k2[1].price)}
                    </span>
                  </div>
                  <div>
                    101-∞
                    <span className="float-right font-semibold text-[#F82E52]">
                      {formatCurrency(IMOB_ADDITIONAL_USERS.k2[2].price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons Disponíveis */}
          <div className="bg-[#F2F2F2] p-6 rounded-lg border border-gray-200">
            <h3 className="font-bold text-[#242424] text-lg mb-4">
              Add-ons Disponíveis
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Kenlo Leads */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="font-bold text-[#242424] mb-1">
                  Kenlo Leads
                </div>
                <div className="text-2xl font-bold text-[#F82E52] mb-2">
                  {formatCurrency(ADDONS.leads.annualPrice)}/mês
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Distribuição automática, qualificação por score, WhatsApp integrado
                </p>
                <p className="text-xs text-gray-500">
                  Implantação: {formatCurrency(ADDONS.leads.implementation)}
                </p>
              </div>

              {/* Kenlo Inteligência */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="font-bold text-[#242424] mb-1">
                  Kenlo Inteligência
                </div>
                <div className="text-2xl font-bold text-[#F82E52] mb-2">
                  {formatCurrency(ADDONS.inteligencia.annualPrice)}/mês
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  BI powered by Google Looker Pro. Usuários ilimitados.
                </p>
                <p className="text-xs text-gray-500">
                  Implantação: {formatCurrency(ADDONS.inteligencia.implementation)}
                </p>
              </div>

              {/* Kenlo Assinatura */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="font-bold text-[#242424] mb-1">
                  Kenlo Assinaturas
                </div>
                <div className="text-2xl font-bold text-[#F82E52] mb-2">
                  {formatCurrency(ADDONS.assinaturas.annualPrice)}/mês
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Assinatura digital embutida. 15 assinaturas inclusas.
                </p>
                <p className="text-xs text-gray-500">
                  Implantação: {formatCurrency(ADDONS.assinaturas.implementation)}
                </p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cotacao">
              <Button
                size="lg"
                className="bg-[#F82E52] hover:bg-[#F82E52]/90 text-white"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Simular Proposta
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-[#242424] text-[#242424] hover:bg-gray-50"
            >
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* BLOCO 6: OBJEÇÕES - Kenlo Design System */}
      <section className="py-14 bg-[#F2F2F2]">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-[#242424] mb-3">
              Perguntas diretas. Respostas diretas.
            </h2>
            <p className="text-gray-600 text-lg">
              Sem enrolação.
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-[#242424] mb-2">
                "Já tenho CRM"
              </h3>
              <p className="text-gray-600 text-sm">
                Tem site incluso? App? +100 portais? Kenlo = CRM + Site + App + Portais. 1 lugar.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-[#242424] mb-2">
                "Meu site funciona"
              </h3>
              <p className="text-gray-600 text-sm">
                Integrado ao CRM? Lead cai no pipeline automaticamente? Kenlo: site → CRM → app. Tempo real. Zero planilha.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-[#242424] mb-2">
                "Quanto custa publicar em portais?"
              </h3>
              <p className="text-gray-600 text-sm">
                Integração inclusa. Todos os planos. 1 clique. 100 portais. Mensalidade dos portais você paga direto para eles.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-[#242424] mb-2">
                "Quero distribuir leads automaticamente"
              </h3>
              <p className="text-gray-600 text-sm">
                Add-on Leads (R$ 497/mês). Distribuição por região/especialidade. Score. WhatsApp. Não atendeu em 5 min? Redistribui.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-[#242424] mb-2">
                "Quero BI e relatórios"
              </h3>
              <p className="text-gray-600 text-sm">
                Add-on Inteligência (R$ 297/mês). Google Looker Pro. Usuários ilimitados. Dashboards personalizáveis. Toda a equipe.
              </p>
            </div>

            {/* FAQ 6 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-[#242424] mb-2">
                "Quanto tempo para implementar?"
              </h3>
              <p className="text-gray-600 text-sm">
                7-14 dias. Migração + treinamento + go-live. Equipe dedicada. {formatCurrency(IMOB_IMPLEMENTATION)} (única vez).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BLOCO 7: DICAS - Kenlo Design System */}
      <section className="py-14 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-[#242424] mb-3">
              Dicas dos Campeões
            </h2>
            <p className="text-gray-600 text-lg">
              O que os melhores fazem diferente
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {/* Card: 40 imóveis */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-5xl font-bold text-[#F82E52] mb-3">
                  40 imóveis
                </div>
                <p className="text-[#242424] text-base mb-2 font-semibold">
                  máximo por corretor
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  Especialização = conversão.
                </p>
                <div className="text-lg font-bold text-[#F82E52]">
                  E você? 200? 300 imóveis por corretor?
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
