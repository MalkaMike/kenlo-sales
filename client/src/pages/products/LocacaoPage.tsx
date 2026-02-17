import { Button } from "@/components/ui/button";
import { Check, X, Calculator, ArrowRight, Home, FileText, CreditCard, RefreshCw, Shield, Banknote, Clock, TrendingUp, Lightbulb, BarChart3, Smartphone, Building2, Headphones, GraduationCap } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  LOC_PLANS,
  LOC_ADDITIONAL_CONTRACTS,
  PAY_BOLETOS,
  PAY_SPLITS,
  ADDONS,
  SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT,
  type PlanTier,
} from "@shared/pricing-config";
import { Link } from "wouter";

const PLAN_KEYS: PlanTier[] = ["prime", "k", "k2"];

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

export default function LocacaoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="container">
        <Breadcrumbs items={[{ label: "Produtos", href: "/" }, { label: "Kenlo Locação" }]} />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-pink-50 via-white to-purple-50/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F82E52]/10 text-[#F82E52] text-sm font-medium mb-6">
              <Home className="w-4 h-4" />
              Kenlo Locação
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              ERP Completo para{" "}
              <span className="text-[#F82E52]">Gestão de Locação</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Contratos, boletos, split, repasses e gestão financeira. Tudo integrado em uma plataforma única.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#F82E52] hover:bg-[#F82E52]/90 gap-2" asChild>
                <Link href="/calculadora">
                  <Calculator className="w-5 h-5" />
                  Simular Proposta
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                Falar com Especialista
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bloco 1: O PROBLEMA */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#242424]">
              Gestão de Locação é Complexa
            </h2>
            <p className="text-gray-600">
              12 desafios que imobiliárias de locação enfrentam todos os dias
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { icon: FileText, title: "Contratos manuais", text: "Criação, renovação e gestão de contratos ainda em papel ou planilhas?" },
              { icon: CreditCard, title: "Boletos dispersos", text: "Geração manual de boletos sem integração com o sistema de gestão?" },
              { icon: Banknote, title: "Repasses complexos", text: "Cálculo manual de repasses para proprietários com risco de erro?" },
              { icon: RefreshCw, title: "Reajustes trabalhosos", text: "Reajustes de contratos feitos um por um, sem automação?" },
              { icon: Shield, title: "Inadimplência sem controle", text: "Falta de visibilidade e ações automatizadas para cobranças?" },
              { icon: Clock, title: "Processos lentos", text: "Tempo excessivo em tarefas operacionais que poderiam ser automatizadas?" },
              { icon: BarChart3, title: "Sem visão financeira", text: "Não sabe quanto vai entrar e sair no próximo mês?" },
              { icon: TrendingUp, title: "Crescimento limitado", text: "Não consegue escalar operação sem contratar mais gente?" },
              { icon: Lightbulb, title: "Decisões no escuro", text: "Sem dados confiáveis para tomar decisões estratégicas?" },
              { icon: Smartphone, title: "Proprietários no WhatsApp", text: "Proprietários te cobrando extrato e repasse todo mês?" },
              { icon: Building2, title: "Múltiplos sistemas", text: "Usa um sistema para contrato, outro para boleto, outro para financeiro?" },
              { icon: Headphones, title: "Suporte genérico", text: "Suporte que não entende as especificidades da gestão de locação?" },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-lg bg-[#F2F2F2] border border-gray-200">
                <item.icon className="w-8 h-8 text-[#F82E52] mb-3" />
                <h3 className="font-bold text-[#242424] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg font-medium text-gray-700">
              O problema não é o corretor, nem o proprietário. São os processos e a ferramenta.
            </p>
          </div>
        </div>
      </section>

      {/* Bloco 2: A SOLUÇÃO */}
      <section className="py-16 bg-[#1A202C] text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ERP Completo para Locação
            </h2>
            <p className="text-white/80">
              Tudo integrado. Tudo rastreável. Tudo em um só lugar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {[
              { icon: FileText, title: "Contratos Digitais", desc: "Crie, renove e gerencie contratos com poucos cliques" },
              { icon: CreditCard, title: "Boletos Automáticos", desc: "Geração automática integrada ao sistema" },
              { icon: Banknote, title: "Repasses Precisos", desc: "Cálculo automático de repasses para proprietários" },
              { icon: RefreshCw, title: "Reajustes em Lote", desc: "Reajuste centenas de contratos de uma vez" },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-lg bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-lg bg-[#F82E52]/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[#F82E52]" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg bg-[#4ABD8D]/10 border border-[#4ABD8D]/30">
              <GraduationCap className="w-8 h-8 text-[#4ABD8D] mb-3" />
              <h3 className="font-bold text-white mb-2">K e K² ganham</h3>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Portal do Proprietário personalizado</li>
                <li>• Treinamentos 2x/ano (K²)</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg bg-[#4ABD8D]/10 border border-[#4ABD8D]/30">
              <Headphones className="w-8 h-8 text-[#4ABD8D] mb-3" />
              <h3 className="font-bold text-white mb-2">K² exclusivo</h3>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• API para integrações customizadas</li>
                <li>• CS Dedicado e Suporte VIP incluídos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bloco 3: POR QUE KENLO */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#242424]">
              Por que Kenlo Locação
            </h2>
            <p className="text-gray-600">
              4 razões. Sem enrolação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { num: "1", title: "Tudo integrado", desc: "Contratos + Boletos + Repasses + Financeiro. Um lugar. Um login. Dados sincronizados em tempo real." },
              { num: "2", title: "Automação real", desc: "Reajustes em lote, repasses automáticos, cobranças programadas. Economize horas toda semana." },
              { num: "3", title: "Portal do Proprietário", desc: "Proprietários consultam extratos e repasses sozinhos. Menos WhatsApp, mais tempo para crescer." },
              { num: "4", title: "Add-ons nativos", desc: "Assinaturas digitais, BI, Seguros, Cash. Tudo integrado nativamente. Sem gambiarras." },
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-lg bg-[#F2F2F2] border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-[#F82E52] text-white flex items-center justify-center font-bold mb-4">
                  {item.num}
                </div>
                <h3 className="font-bold text-[#242424] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bloco 4: NÚMEROS */}
      <section className="py-16 bg-[#F2F2F2]">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#242424]">
              Kenlo em números
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {[
              { value: "8.500+", label: "Imobiliárias" },
              { value: "40.000+", label: "Corretores ativos" },
              { value: "R$ 12B+", label: "Em aluguéis gerenciados" },
              { value: "950+", label: "Cidades" },
              { value: "+100", label: "Portais integrados" },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-lg bg-white border border-gray-200 text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#F82E52] mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bloco 5: PREÇOS */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#242424]">
                Planos Kenlo Locação
              </h2>
              <p className="text-gray-600">
                Escolha o plano ideal para o tamanho da sua operação
              </p>
            </div>

            {/* Pricing Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#F2F2F2]">
                    <th className="p-4 text-left text-sm font-bold text-[#242424] border border-gray-200">
                      Plano
                    </th>
                    {PLAN_KEYS.map((key) => (
                      <th key={key} className="p-4 text-center text-sm font-bold text-[#242424] border border-gray-200">
                        {LOC_PLANS[key].name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 text-sm font-medium text-gray-700 border border-gray-200">
                      Descrição
                    </td>
                    {PLAN_KEYS.map((key) => (
                      <td key={key} className="p-4 text-center text-sm text-gray-600 border border-gray-200">
                        {LOC_PLANS[key].description}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-[#F2F2F2]">
                    <td className="p-4 text-sm font-medium text-gray-700 border border-gray-200">
                      Preço Anual
                    </td>
                    {PLAN_KEYS.map((key) => (
                      <td key={key} className="p-4 text-center text-sm font-bold text-[#F82E52] border border-gray-200">
                        {formatCurrency(LOC_PLANS[key].annualPrice / 12)}/mês
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm font-medium text-gray-700 border border-gray-200">
                      Contratos Incluídos
                    </td>
                    {PLAN_KEYS.map((key) => (
                      <td key={key} className="p-4 text-center text-sm text-gray-600 border border-gray-200">
                        {LOC_PLANS[key].includedContracts}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-[#F2F2F2]">
                    <td className="p-4 text-sm font-medium text-gray-700 border border-gray-200">
                      CRM Completo
                    </td>
                    {PLAN_KEYS.map((key) => (
                      <td key={key} className="p-4 text-center border border-gray-200">
                        <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm font-medium text-gray-700 border border-gray-200">
                      Gestão de Contratos
                    </td>
                    {PLAN_KEYS.map((key) => (
                      <td key={key} className="p-4 text-center border border-gray-200">
                        <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-[#F2F2F2]">
                    <td className="p-4 text-sm font-medium text-gray-700 border border-gray-200">
                      Portal do Proprietário
                    </td>
                    {PLAN_KEYS.map((key) => (
                      <td key={key} className="p-4 text-center border border-gray-200">
                        {key === "prime" ? (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm font-medium text-gray-700 border border-gray-200">
                      Treinamentos 2x/ano
                    </td>
                    {PLAN_KEYS.map((key) => (
                      <td key={key} className="p-4 text-center border border-gray-200">
                        {key === "k2" ? (
                          <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-[#F2F2F2]">
                    <td className="p-4 text-sm font-medium text-gray-700 border border-gray-200">
                      API Customizada
                    </td>
                    {PLAN_KEYS.map((key) => (
                      <td key={key} className="p-4 text-center border border-gray-200">
                        {key === "k2" ? (
                          <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 text-sm font-medium text-gray-700 border border-gray-200">
                      Suporte VIP + CS Dedicado
                    </td>
                    {PLAN_KEYS.map((key) => (
                      <td key={key} className="p-4 text-center border border-gray-200">
                        {key === "k2" ? (
                          <Check className="w-5 h-5 text-[#4ABD8D] mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Contratos Adicionais */}
            <div className="mt-12 p-6 rounded-lg bg-[#F2F2F2]">
              <h3 className="text-xl font-bold mb-4 text-[#242424]">Contratos Adicionais</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {PLAN_KEYS.map((key) => (
                  <div key={key} className="p-4 rounded-lg bg-white border border-gray-200">
                    <div className="font-bold text-[#242424] mb-2">{LOC_PLANS[key].name}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {LOC_ADDITIONAL_CONTRACTS[key].map((tier, idx) => (
                        <div key={idx}>
                          {tier.to === Infinity ? `${tier.from}+` : `${tier.from}-${tier.to}`}: {formatCurrency(tier.price)}/contrato
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="mt-12 p-6 rounded-lg bg-[#F2F2F2]">
              <h3 className="text-xl font-bold mb-4 text-[#242424]">Add-ons Disponíveis</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <div className="font-bold text-[#242424] mb-2">Kenlo Inteligência</div>
                  <div className="text-sm text-gray-600 mb-2">BI powered by Google Looker Pro</div>
                  <div className="text-lg font-bold text-[#F82E52]">
                    {formatCurrency(ADDONS.inteligencia.annualPrice / 12)}/mês
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <div className="font-bold text-[#242424] mb-2">Kenlo Assinaturas</div>
                  <div className="text-sm text-gray-600 mb-2">15 assinaturas digitais incluídas</div>
                  <div className="text-lg font-bold text-[#F82E52]">
                    {formatCurrency(ADDONS.assinaturas.annualPrice / 12)}/mês
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <div className="font-bold text-[#242424] mb-2">Kenlo Pay</div>
                  <div className="text-sm text-gray-600 mb-2">Boleto + Split digital (pós-pago)</div>
                  <div className="text-lg font-bold text-[#F82E52]">
                    Sob demanda
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <div className="font-bold text-[#242424] mb-2">Kenlo Seguros</div>
                  <div className="text-sm text-gray-600 mb-2">Ganhe R$ {SEGUROS_ESTIMATED_REVENUE_PER_CONTRACT}/contrato/mês</div>
                  <div className="text-lg font-bold text-[#F82E52]">
                    Sem custo
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white border border-gray-200">
                  <div className="font-bold text-[#242424] mb-2">Kenlo Cash</div>
                  <div className="text-sm text-gray-600 mb-2">Antecipe até 24 meses de aluguel</div>
                  <div className="text-lg font-bold text-[#F82E52]">
                    Sob consulta
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bloco 6: OBJEÇÕES */}
      <section className="py-16 bg-[#F2F2F2]">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#242424]">
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Kenlo Locação funciona sem Kenlo IMOB?",
                  a: "Sim! Kenlo Locação é um produto independente. Você pode usar só Locação, só IMOB, ou ambos integrados (Kombo Core Gestão com desconto)."
                },
                {
                  q: "Como funciona o cálculo de repasses?",
                  a: "Automático. O sistema calcula repasses baseado nas regras do contrato (%, valor fixo, descontos). Você só precisa aprovar e gerar o pagamento."
                },
                {
                  q: "Kenlo Pay é obrigatório?",
                  a: "Não. Kenlo Pay (boletos e split) é um add-on opcional pós-pago. Você pode usar seu banco/gateway atual ou contratar Kenlo Pay para integração total."
                },
                {
                  q: "Posso importar contratos de outro sistema?",
                  a: "Sim. Nossa equipe de implantação ajuda na migração de contratos, proprietários e inquilinos do sistema anterior."
                },
                {
                  q: "O que acontece se eu ultrapassar o limite de contratos?",
                  a: "Você paga apenas pelos contratos adicionais (valores na tabela acima). Sem bloqueio, sem surpresas."
                },
                {
                  q: "Portal do Proprietário está incluído?",
                  a: "Sim nos planos K e K². Proprietários acessam extratos, repasses e documentos sem precisar te ligar."
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-6 rounded-lg bg-white border border-gray-200">
                  <h3 className="font-bold text-[#242424] mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#242424]">
              Pronto para automatizar sua gestão de locação?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#F82E52] hover:bg-[#F82E52]/90 gap-2" asChild>
                <Link href="/calculadora">
                  <Calculator className="w-5 h-5" />
                  Simular Proposta
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                Falar com Especialista
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
