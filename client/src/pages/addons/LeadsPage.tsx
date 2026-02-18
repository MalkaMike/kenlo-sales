import { Link } from "wouter";
import React, { useMemo } from "react";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Zap, Clock, Target, MessageSquare, ArrowRight, Calculator, Bot, Globe, Repeat, BarChart3, Lightbulb, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ADDONS } from "@shared/pricing-config";

// ============================================================================
// DYNAMIC PRICING DATA BUILDER
// ============================================================================

const leads = ADDONS.leads;

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: value % 1 !== 0 ? 2 : 0 })}`;
}

function buildPricingData() {
  const sections = [];

  // --- Investimento ---
  sections.push({
    title: "Investimento",
    rows: [
      {
        feature: "Licença mensal (plano anual)",
        value: `${formatCurrency(leads.annualPrice)}/mês`,
        highlight: true,
        tooltip: undefined as string | undefined,
      },
      {
        feature: "Implantação/Treinamento (única)",
        value: formatCurrency(leads.implementation),
        tooltip: undefined as string | undefined,
      },
      {
        feature: "Produtos atendidos",
        value: leads.availableFor.map((p) => p.toUpperCase()).join(" + "),
        tooltip: `Funciona exclusivamente com Kenlo ${leads.availableFor.map((p) => p.toUpperCase()).join(" e ")}`,
      },
    ],
  });

  // --- Opções de Atendimento ---
  sections.push({
    title: "Opções de Atendimento",
    rows: [
      {
        feature: "Sem WhatsApp",
        value: "Leads distribuídos ilimitados",
        tooltip: "Distribuição automática de leads sem limite de quantidade",
      },
      {
        feature: "Com WhatsApp",
        value: `${leads.includedWhatsAppLeads} leads/mês via WhatsApp`,
        tooltip: "Pré-atendimento automatizado via WhatsApp incluído na carência",
      },
    ],
  });

  // --- Leads Adicionais via WhatsApp (pós-pago) ---
  const additionalRows = leads.additionalLeadsTiers.map(
    (tier: { from: number; to: number; price: number }) => {
      const rangeLabel =
        tier.to === Infinity
          ? `Acima de ${(tier.from - 1).toLocaleString("pt-BR")} leads`
          : `${tier.from} a ${tier.to.toLocaleString("pt-BR")} leads`;
      return {
        feature: rangeLabel,
        value: `${formatCurrency(tier.price)}/lead`,
        tooltip: undefined as string | undefined,
      };
    }
  );
  sections.push({
    title: "Leads Adicionais via WhatsApp (pós-pago)",
    rows: additionalRows,
  });

  // --- Pré-pagamento de Leads (planos anuais/bienais) ---
  sections.push({
    title: "Pré-pagamento de Leads (planos anuais/bienais)",
    rows: [
      {
        feature: "Preço fixo por lead/mês",
        value: "R$ 1,30/lead/mês",
        highlight: true,
        tooltip: "Preço fixo garantido para planos anuais e bienais",
      },
      {
        feature: "Disponibilidade",
        value: "Planos Anuais e Bienais",
        tooltip: "Opção de pré-pagamento disponível apenas para contratos anuais e bienais",
      },
      {
        feature: "Vantagens",
        value: "Preço fixo + Economia vs pós-pago",
        tooltip: "Garanta preço fixo e economize comparado ao modelo pós-pago por faixas",
      },
    ],
  });

  // --- Funcionalidades Incluídas ---
  sections.push({
    title: "Funcionalidades Incluídas",
    rows: [
      {
        feature: "Distribuição automática de leads",
        value: true as string | boolean,
        tooltip: "Leads distribuídos por região, especialidade ou rodízio",
      },
      {
        feature: "Redistribuição por tempo de resposta",
        value: true as string | boolean,
        tooltip: "Lead não atendido em 5 min é redistribuído automaticamente",
      },
      {
        feature: "Integração com portais imobiliários",
        value: true as string | boolean,
        tooltip: "Captação automática de leads dos principais portais",
      },
      {
        feature: "Integração com redes sociais",
        value: true as string | boolean,
        tooltip: "Leads vindos de Facebook, Instagram e Google Ads",
      },
      {
        feature: "Qualificação por score",
        value: true as string | boolean,
        tooltip: "Score baseado em comportamento e interesse do lead",
      },
      {
        feature: "Integração com IA externa",
        value: true as string | boolean,
        tooltip: "Parceiro homologado (Ex: Lais, Harry). Não requer WhatsApp.",
      },
    ],
  });

  return sections;
}

function buildExampleCalculation(): string {
  const tiers = leads.additionalLeadsTiers;
  if (tiers.length < 3) return "";

  // Build an example with 500 leads
  const total = 500;
  let remaining = total;
  let cost = 0;
  const parts: string[] = [];

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const tierSize =
      tier.to === Infinity ? remaining : Math.min(remaining, tier.to - tier.from + 1);
    cost += tierSize * tier.price;
    parts.push(`${tierSize} × ${formatCurrency(tier.price)}`);
    remaining -= tierSize;
  }

  return `Se a imobiliária tiver ${total} leads adicionais/mês via WhatsApp, paga ${parts.join(" + ")} = R$ ${cost.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mês em leads adicionais.`;
}

// ============================================================================
// STATIC DATA
// ============================================================================

const highlights = [
  {
    icon: Zap,
    title: "Distribuição Automática",
    description: "Leads distribuídos por região, especialidade ou rodízio — sem intervenção manual",
  },
  {
    icon: Clock,
    title: "Tempo de Resposta",
    description: "Lead não atendido em 5 min? Redistribuído automaticamente para o próximo corretor",
  },
  {
    icon: Target,
    title: "Qualificação Inteligente",
    description: "Score baseado em comportamento e interesse — priorize quem está pronto para comprar",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integrado",
    description: `Pré-atendimento automatizado via WhatsApp com ${leads.includedWhatsAppLeads} leads/mês incluídos`,
  },
];

const useCases = [
  {
    icon: Globe,
    title: "Captação Multi-canal",
    description: "Receba leads de portais, redes sociais, Google Ads e site próprio em um único lugar. Nunca mais perca um lead por falta de integração.",
  },
  {
    icon: Repeat,
    title: "Rodízio Inteligente",
    description: "Configure regras de distribuição por região, tipo de imóvel ou rodízio. Garanta que cada corretor receba leads qualificados para seu perfil.",
  },
  {
    icon: Bot,
    title: "IA + WhatsApp",
    description: "Combine pré-atendimento via WhatsApp ou IA parceira (Lais, Harry) para qualificar leads antes de chegar ao corretor. Mais conversão, menos esforço.",
  },
  {
    icon: BarChart3,
    title: "Métricas de Conversão",
    description: "Acompanhe taxa de conversão por corretor, canal e região. Identifique gargalos e otimize sua operação com dados reais.",
  },
];

const sellingQuestions = [
  {
    icon: Target,
    question: "Seus leads estão sendo atendidos pela PESSOA CERTA?",
    answer: "Não basta velocidade. O lead precisa ir para o especialista certo - por tipo de imóvel, faixa de preço, região. Kenlo Leads configura tudo isso automaticamente."
  },
  {
    icon: BarChart3,
    question: "Você tem visibilidade de quem atende mais rápido?",
    answer: "O sistema de transparência mostra ranking em tempo real: 1º, 2º, 3º lugar. Corretores são competitivos - a transparência é a melhor ferramenta de gestão."
  },
  {
    icon: AlertTriangle,
    question: "Quantos leads você perde por demora no atendimento?",
    answer: "Estudos mostram que responder em menos de 5 minutos aumenta 21x a chance de conversão. O AI SDR da Kenlo responde instantaneamente via WhatsApp."
  }
];

const bigNumbers = [
  {
    number: "21x",
    description: "mais chance de conversão respondendo em 5 min"
  },
  {
    number: "100",
    description: "leads WhatsApp/mês incluídos"
  },
  {
    number: "R$ 0",
    description: "custo de implantação"
  },
  {
    number: "24/7",
    description: "AI SDR responde automaticamente"
  }
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function LeadsPage() {
  const { theadRef } = useStickyHeader();
  const pricingData = useMemo(() => buildPricingData(), []);
  const exampleCalc = useMemo(() => buildExampleCalculation(), []);

  const renderValue = (row: { feature: string; value: string | boolean; highlight?: boolean; tooltip?: string }) => {
    if (typeof row.value === "boolean") {
      return row.value ? (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    }

    if (row.highlight) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="text-lg font-bold text-foreground">{row.value}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">investimento</span>
        </span>
      );
    }

    return <span className="font-medium">{row.value}</span>;
  };

  return (
    <div className="flex flex-col">
      {/* Breadcrumbs */}
      <div className="container pt-4">
        <Breadcrumbs items={[{ label: "Add-ons", href: "/" }, { label: "Kenlo Leads" }]} />
      </div>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              ADD-ON • {leads.availableFor.map((p) => p.toUpperCase()).join(" + ")}
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {leads.name}
            </h1>

            <p className="text-xl text-muted-foreground mb-4">
              Gestão automatizada de leads com distribuição inteligente.
              Atenda em segundos, nunca perca uma oportunidade — <span className="font-semibold text-foreground">zero leads perdidos, máxima conversão</span>.
            </p>
            <p className="text-sm text-muted-foreground mb-6 italic">
              "Não é só quantidade — é <strong className="text-primary">a pessoa certa</strong>. Transparência total: veja de onde vem cada lead, quanto custa, e qual converte. AI SDR qualifica antes de chegar ao corretor."
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="text-sm py-1">
                <Zap className="w-4 h-4 mr-1" />
                Distribuição automática
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <MessageSquare className="w-4 h-4 mr-1" />
                WhatsApp integrado
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <Bot className="w-4 h-4 mr-1" />
                Integração com IA
              </Badge>
            </div>

            <div className="flex gap-4">
              <Link href="/calculadora">
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                  <Calculator className="w-5 h-5" />
                  Monte seu Plano
                </Button>
              </Link>
              <Link href="/kombos">
                <Button size="lg" variant="outline" className="gap-2">
                  Ver Kombos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Selling Questions */}
      <section className="py-16 lg:py-24 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Perguntas que Vendem</h2>
            <p className="text-lg text-muted-foreground">
              Responda a estas perguntas e veja como a Kenlo pode transformar sua operação.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {sellingQuestions.map((item, index) => (
              <div key={index} className="bg-card border border-border/40 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.question}</h3>
                </div>
                <p className="text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big Numbers */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {bigNumbers.map((item, index) => (
              <div key={index} className="bg-card/30 p-6 rounded-lg">
                <p className="text-3xl font-black text-primary">{item.number}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Positioning Statement */}
      <section className="pb-16 lg:pb-24">
        <div className="container">
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-lg p-8 text-center">
            <blockquote className="text-xl italic text-foreground">
              "Todo mundo sabe que leads precisam ser respondidos rápido. Mas nós resolvemos o problema real: a <span className="font-semibold text-primary">PESSOA CERTA</span> respondendo. Nosso sistema de transparência mostra ranking em tempo real. Seus especialistas recebem os leads certos, seu time fecha mais, todos ganham."
            </blockquote>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Casos de Uso</h2>
            <p className="text-lg text-muted-foreground">
              Veja como imobiliárias de todos os portes usam o Kenlo Leads para escalar suas operações e vender mais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
            {useCases.map((item, index) => (
              <div key={index} className="flex gap-6">
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Planos e Preços</h2>
            <p className="text-lg text-muted-foreground">
              Preços transparentes e flexíveis para se adaptar ao tamanho da sua operação.
            </p>
          </div>

          <div className="overflow-x-auto max-w-5xl mx-auto">
            <table className="w-full text-sm">
              <thead ref={theadRef} className="sticky top-16 z-10 bg-card/80 backdrop-blur-sm">
                <tr className="border-b border-border/40">
                  <th className="p-4 text-left font-semibold">Funcionalidade</th>
                  <th className="p-4 text-center font-semibold whitespace-nowrap">Valor</th>
                </tr>
              </thead>
              <tbody>
                {pricingData.map((section, sectionIndex) => (
                  <React.Fragment key={sectionIndex}>
                    <tr>
                      <td colSpan={2} className="p-4 pt-8">
                        <h3 className="font-semibold text-primary">{section.title}</h3>
                      </td>
                    </tr>
                    {section.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border/40 last:border-none">
                        <td className="p-4 text-muted-foreground">
                          {row.tooltip ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="border-b border-dashed border-muted-foreground cursor-help">{row.feature}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{row.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            row.feature
                          )}
                        </td>
                        <td className="p-4 text-center">{renderValue(row)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {exampleCalc && (
            <div className="max-w-5xl mx-auto mt-6 text-center text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800/50 p-4 rounded-lg">
              <p><strong className="text-foreground">Exemplo de cálculo:</strong> {exampleCalc}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Pronto para escalar sua operação?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Deixe a Kenlo cuidar da gestão de leads e libere seu time para focar no que realmente importa: vender.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/calculadora">
                <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                  <Calculator className="w-5 h-5" />
                  Monte seu Plano
                </Button>
              </Link>
              <Link href="/contato">
                <Button size="lg" variant="outline" className="gap-2">
                  Fale com um Especialista
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
