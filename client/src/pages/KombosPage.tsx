import { Link } from "wouter";
import { Fragment, useMemo } from "react";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, FileText, ArrowRight, Star, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KOMBOS as PRICING_KOMBOS, ELITE_FIRST_YEAR_SAVINGS } from "@shared/pricing-config";
import pricingValues from "@shared/pricing-values.json";

// ============================================================================
// TYPES
// ============================================================================

type KomboKey = keyof typeof PRICING_KOMBOS;

interface KomboMeta {
  id: string;
  configKey: KomboKey;
  shortDesc: string;
  badge: string | null;
  color: string;
  tooltip: string;
  idealFor: string;
}

// ============================================================================
// DISPLAY CONFIGURATION (only UI-specific metadata, no pricing data)
// ============================================================================

const KOMBO_ORDER: KomboMeta[] = [
  {
    id: "imob-start",
    configKey: "imob-start",
    shortDesc: "Vendas digitais",
    badge: null,
    color: "bg-blue-500",
    tooltip: "IMOB + Leads + VIP + CS. Ideal para imobiliárias focadas em vendas que querem captar e converter leads.",
    idealFor: "Ideal para quem está começando a transformação digital.",
  },
  {
    id: "imob-pro",
    configKey: "imob-pro",
    shortDesc: "Máxima performance",
    badge: "POPULAR",
    color: "bg-primary",
    tooltip: "IMOB + Leads + Inteligência + VIP + CS. Para quem quer maximizar conversão com dados.",
    idealFor: "Para quem quer maximizar conversão com dados. Inclui BI para decisões estratégicas e suporte premium para crescimento acelerado.",
  },
  {
    id: "locacao-pro",
    configKey: "loc-pro",
    shortDesc: "Gestão inteligente",
    badge: null,
    color: "bg-green-500",
    tooltip: "LOC + Inteligência + Assinatura + VIP + CS. Para administradoras e imobiliárias focadas em locação.",
    idealFor: "Administradoras e imobiliárias focadas em locação. Gestão inteligente de contratos com BI e assinatura digital.",
  },
  {
    id: "core-gestao",
    configKey: "core-gestao",
    shortDesc: "Vendas + Locação",
    badge: null,
    color: "bg-purple-500",
    tooltip: "IMOB + LOC sem add-ons, mas com VIP + CS incluídos. Para quem quer plataforma unificada.",
    idealFor: "Imobiliárias que atuam em vendas E locação. Plataforma unificada com suporte premium incluído. Adicione add-ons conforme necessidade.",
  },
  {
    id: "elite",
    configKey: "elite",
    shortDesc: "Solução completa",
    badge: "MELHOR",
    color: "bg-amber-500",
    tooltip: "IMOB + LOC + Todos os add-ons + VIP + CS. Máxima digitalização e vantagem competitiva.",
    idealFor: "Máxima digitalização e vantagem competitiva. Todos os produtos, todos os add-ons, suporte premium. Para quem quer liderar o mercado.",
  },
];

// ============================================================================
// HELPER: Map internal keys to display names
// ============================================================================

const DISPLAY_NAMES: Record<string, string> = {
  imob: "Kenlo IMOB (CRM + Site)",
  locacao: "Kenlo Locação (ERP)",
  leads: "Kenlo Leads",
  inteligencia: "Kenlo Inteligência",
  assinaturas: "Kenlo Assinatura",
  pay: "Kenlo Pay",
  seguros: "Kenlo Seguros",
  cash: "Kenlo Cash",
};

const IMPL_DISPLAY_NAMES: Record<string, string> = {
  leads: "Leads",
  inteligencia: "Inteligência",
  assinaturas: "Assinatura",
  pay: "Pay",
  imob: "IMOB",
  locacao: "Locação",
};

// ============================================================================
// DYNAMIC DATA BUILDERS
// ============================================================================

/** Check if a kombo includes a given product or addon */
function komboIncludes(configKey: KomboKey, item: string): boolean {
  const kombo = PRICING_KOMBOS[configKey];
  return kombo.structure.includes(item);
}

/** Format implementation price */
function formatImplementation(): string {
  return `R$ ${pricingValues._legacyFields.implantacaoBase.toLocaleString("pt-BR")}`;
}

/** Build the free implementations label for a kombo */
function buildFreeImplLabel(configKey: KomboKey): string {
  const kombo = PRICING_KOMBOS[configKey];
  const freeImpls = kombo.freeImplementations as readonly string[];
  if (!freeImpls || freeImpls.length === 0) {
    // For core-gestao: no add-on impls, but IMOB impl is zeroed
    const structure = kombo.structure as readonly string[];
    const products = structure.filter((s) => s === "imob" || s === "locacao");
    if (products.length === 2) return "IMOB";
    return "—";
  }
  return freeImpls
    .map((key) => IMPL_DISPLAY_NAMES[key] || key)
    .join(" + ");
}

/** Build comparison data dynamically from pricing config */
function buildComparisonData() {
  const allProducts = ["imob", "locacao"];
  const allAddons = ["leads", "inteligencia", "assinaturas", "pay", "seguros", "cash"];

  const sections = [
    {
      title: "Produtos Core",
      rows: allProducts.map((product) => ({
        feature: DISPLAY_NAMES[product],
        values: KOMBO_ORDER.map((k) => komboIncludes(k.configKey, product)),
        tooltip: "",
      })),
    },
    {
      title: "Add-ons Incluídos",
      rows: allAddons.map((addon) => ({
        feature: DISPLAY_NAMES[addon],
        values: KOMBO_ORDER.map((k) => komboIncludes(k.configKey, addon)),
        tooltip: "",
      })),
    },
    {
      title: "Serviços Premium",
      rows: [
        {
          feature: "Suporte VIP",
          values: KOMBO_ORDER.map((k) => PRICING_KOMBOS[k.configKey].premiumServicesIncluded),
          tooltip: "Atendimento prioritário com SLA reduzido. ⚠️ NOVO: Incluído em TODOS os Kombos",
        },
        {
          feature: "CS Dedicado",
          values: KOMBO_ORDER.map((k) => PRICING_KOMBOS[k.configKey].premiumServicesIncluded),
          tooltip: "Customer Success exclusivo para sua conta. ⚠️ NOVO: Incluído em TODOS os Kombos",
        },
      ],
    },
    {
      title: "Implantação",
      rows: [
        {
          feature: "Taxa única",
          values: KOMBO_ORDER.map(() => formatImplementation()) as (string | boolean)[],
          tooltip: "",
        },
        {
          feature: "Implantações ofertadas",
          values: KOMBO_ORDER.map((k) => buildFreeImplLabel(k.configKey)) as (string | boolean)[],
          tooltip: "Implantações que seriam cobradas à parte, mas estão inclusas no Kombo",
        },
      ],
    },
  ];

  return { sections };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function KombosPage() {
  const { theadRef } = useStickyHeader();

  // Build comparison data from pricing config (memoized)
  const comparisonData = useMemo(() => buildComparisonData(), []);

  // Build kombo display data by merging config + meta
  const kombos = useMemo(
    () =>
      KOMBO_ORDER.map((meta) => {
        const config = PRICING_KOMBOS[meta.configKey];
        return {
          ...meta,
          name: config.name.replace("Kombo ", ""),
          discount: Math.round(config.monthlyDiscount * 100),
          includesPremium: config.premiumServicesIncluded,
        };
      }),
    []
  );

  const renderValue = (value: boolean | string, _komboIndex: number) => {
    if (typeof value === "boolean") {
      return value ? (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-5 h-5 text-red-400" />
          </div>
        </div>
      );
    }
    return <span className="font-medium text-sm">{value}</span>;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
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
            
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Kombos são pacotes inteligentes que combinam produtos e add-ons com descontos de até{" "}
              {Math.max(...kombos.map((k) => k.discount))}%. 
              Compare e escolha o ideal para cada imobiliária.
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-2xl mx-auto italic">
              {`Todos os Kombos incluem `}<strong className="text-primary">VIP + CS Dedicado</strong>{`. O Elite economiza até R$ ${ELITE_FIRST_YEAR_SAVINGS.toLocaleString("pt-BR")} no primeiro ano. Quanto mais digitaliza, menor o custo por unidade.`}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2" asChild>
                <Link href="/calculadora">
                  <FileText className="w-5 h-5" />
                  Simular Cotação
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Comparison Cards */}
      <section className="py-12 border-b border-border/40">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {kombos.map((kombo) => (
              <div
                key={kombo.id}
                className="relative p-4 rounded-xl border-2 border-border/50 hover:border-primary/50 transition-colors bg-card"
              >
                {kombo.badge && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2">
                    {kombo.badge}
                  </Badge>
                )}
                <div className={`w-10 h-10 rounded-lg ${kombo.color} flex items-center justify-center mb-3 mx-auto`}>
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-center text-sm mb-1">{kombo.name}</h3>
                <p className="text-xs text-muted-foreground text-center mb-2">{kombo.shortDesc}</p>
                <div className="text-center">
                  {kombo.discount > 0 ? (
                    <span className="text-lg font-bold text-green-700">{kombo.discount}% OFF</span>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">Tabela</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comparativo Completo</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja exatamente o que cada Kombo inclui. Todos têm implantação única de {formatImplementation()}.
            </p>
          </div>
          
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <table className="w-full border-collapse min-w-[800px]">
              <thead ref={theadRef} className="pricing-sticky-header">
                <tr className="border-b-2 border-border">
                  <th className="text-left py-4 px-4 font-medium text-muted-foreground w-[200px]">
                    Recurso
                  </th>
                  {kombos.map((kombo) => (
                    <th key={kombo.id} className="py-4 px-2 min-w-[140px]">
                      <div className="flex flex-col items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`w-10 h-10 rounded-lg ${kombo.color} flex items-center justify-center mb-2 cursor-help`}>
                              <Star className="w-5 h-5 text-white" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p>{kombo.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                        <span className="font-bold text-sm">{kombo.name}</span>
                        {kombo.badge && (
                          <Badge className="mt-1 bg-primary/10 text-primary text-[10px] px-2">
                            {kombo.badge}
                          </Badge>
                        )}
                        <div className="mt-2">
                          {kombo.discount > 0 ? (
                            <span className="text-lg font-bold text-green-700">{kombo.discount}% OFF</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Preço tabela</span>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData.sections.map((section, sectionIndex) => (
                  <Fragment key={`section-${sectionIndex}`}>
                    <tr className="bg-muted/30">
                      <td
                        colSpan={6}
                        className="py-3 px-4 font-semibold text-foreground"
                      >
                        {section.title}
                      </td>
                    </tr>
                    {section.rows.map((row, rowIndex) => (
                      <tr
                        key={`row-${sectionIndex}-${rowIndex}`}
                        className="border-b border-border/50 pricing-row"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{row.feature}</span>
                            {row.tooltip && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{row.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        {row.values.map((value, valueIndex) => (
                          <td key={valueIndex} className="py-4 px-2 text-center">
                            {renderValue(value, valueIndex)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Ideal For Section */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Qual Kombo é Ideal?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada Kombo foi pensado para um perfil específico de imobiliária
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {kombos.map((kombo) => {
              const isPopular = kombo.badge === "POPULAR";
              const isBest = kombo.badge === "MELHOR";
              const hasBorder = isPopular || isBest;
              const borderColor = isPopular
                ? "border-2 border-green-500/50"
                : isBest
                ? "border-2 border-amber-500/50"
                : "border border-border/50";
              const isLastAndOdd =
                kombos.indexOf(kombo) === kombos.length - 1 && kombos.length % 3 !== 0;

              return (
                <div
                  key={kombo.id}
                  className={`p-6 rounded-xl bg-card ${borderColor} relative ${
                    isLastAndOdd ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  {kombo.badge && (
                    <Badge
                      className={`absolute -top-2 right-4 text-white ${
                        isPopular ? "bg-green-600" : "bg-amber-500"
                      }`}
                    >
                      {kombo.badge}
                    </Badge>
                  )}
                  <div
                    className={`w-12 h-12 rounded-lg ${kombo.color} flex items-center justify-center mb-4`}
                  >
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{kombo.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{kombo.idealFor}</p>
                  <div
                    className={
                      kombo.discount > 0
                        ? "text-green-700 font-bold"
                        : "text-muted-foreground font-medium"
                    }
                  >
                    {kombo.discount > 0
                      ? `${kombo.discount}% OFF + VIP + CS`
                      : "Preço tabela + VIP + CS"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para montar a proposta ideal?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Use nosso gerador de cotações para simular diferentes Kombos e ver os preços em tempo real
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 gap-2" asChild>
              <Link href="/calculadora">
                <FileText className="w-5 h-5" />
                Simular Cotação
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
