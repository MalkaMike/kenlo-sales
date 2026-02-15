import { Link } from "wouter";
import React, { useMemo } from "react";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Building2, Users, Globe, Smartphone, BarChart3, ArrowRight, Calculator, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IMOB_PLANS,
  IMOB_IMPLEMENTATION,
  IMOB_ADDITIONAL_USERS,
  PREMIUM_SERVICES,
  ADDONS,
  type PlanTier,
} from "@shared/pricing-config";

// ============================================================================
// DYNAMIC PRICING DATA BUILDER
// ============================================================================

type PricingRow = {
  feature: string;
  type: string;
  values: (string | boolean)[];
  highlight?: boolean;
  tooltip?: string;
};

type PricingSection = {
  title: string;
  rows: PricingRow[];
};

const PLAN_KEYS: PlanTier[] = ["prime", "k", "k2"];
const PLAN_NAMES = PLAN_KEYS.map((k) => IMOB_PLANS[k].name);

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

function formatTierLabel(tier: { from: number; to: number; price: number }): string {
  if (tier.to === Infinity) return `${tier.from}+: ${formatCurrency(tier.price)}`;
  return `${tier.from}-${tier.to}: ${formatCurrency(tier.price)}`;
}

function buildPricingData(): { plans: string[]; sections: PricingSection[] } {
  const sections: PricingSection[] = [];

  // --- Investimento ---
  sections.push({
    title: "Investimento",
    rows: [
      {
        feature: "Licença mensal (plano anual)",
        type: "price",
        values: PLAN_KEYS.map((k) => `${formatCurrency(IMOB_PLANS[k].annualPrice)}/mês`),
        highlight: true,
      },
      {
        feature: "Taxa de implantação (única)",
        type: "price",
        values: PLAN_KEYS.map(() => formatCurrency(IMOB_IMPLEMENTATION)),
      },
      {
        feature: "Usuários inclusos",
        type: "text",
        values: PLAN_KEYS.map((k) => String(IMOB_PLANS[k].includedUsers)),
      },
    ],
  });

  // --- Funcionalidades ---
  sections.push({
    title: "Funcionalidades",
    rows: [
      {
        feature: "Funcionalidades básicas de CRM",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "App Corretor",
        type: "check",
        values: [true, true, true],
      },
      {
        feature: "Landing Page",
        type: "check",
        values: [false, true, true],
      },
      {
        feature: "Blog",
        type: "check",
        values: [false, false, true],
      },
      {
        feature: "Treinamentos online",
        tooltip: `Valor de referência ${formatCurrency(2000)} por unidade`,
        type: "text",
        values: ["—", "—", "2x por ano"],
      },
      {
        feature: "Acesso à API Imob",
        tooltip: "Disponível a partir de Março 2026",
        type: "check",
        values: [false, false, true],
      },
    ],
  });

  // --- Serviços Premium ---
  sections.push({
    title: "Serviços Premium",
    rows: [
      {
        feature: PREMIUM_SERVICES.vipSupport.name,
        type: "mixed",
        values: PLAN_KEYS.map((k) =>
          PREMIUM_SERVICES.vipSupport.includedIn[k] ? "Incluído" : "Opcional"
        ),
      },
      {
        feature: PREMIUM_SERVICES.csDedicado.name,
        type: "mixed",
        values: PLAN_KEYS.map((k) =>
          PREMIUM_SERVICES.csDedicado.includedIn[k] ? "Incluído" : "Opcional"
        ),
      },
    ],
  });

  // --- Usuários Adicionais (pós-pago) ---
  sections.push({
    title: "Usuários Adicionais (pós-pago)",
    rows: [
      {
        feature: "Custo por usuário adicional",
        type: "complex",
        values: PLAN_KEYS.map((k) => {
          const tiers = IMOB_ADDITIONAL_USERS[k];
          if (tiers.length === 1) {
            return `${formatCurrency(tiers[0].price)}/usuário fixo`;
          }
          return tiers
            .map((t: { from: number; to: number; price: number }) => formatTierLabel(t))
            .join("\n");
        }),
      },
    ],
  });

  return { plans: PLAN_NAMES, sections };
}

// --- Add-on comparison table data ---
function buildAddonComparisonRows() {
  const rows: {
    name: string;
    values: string[];
    savings: string;
  }[] = [];

  // Additional Users
  const userTiers = IMOB_ADDITIONAL_USERS;
  const primeUserPrice = userTiers.prime[0].price;
  const k2LastTier = userTiers.k2[userTiers.k2.length - 1];
  const maxSavings = Math.round(
    ((primeUserPrice - k2LastTier.price) / primeUserPrice) * 100
  );

  rows.push({
    name: "Usuários Adicionais",
    values: PLAN_KEYS.map((k) => {
      const tiers = userTiers[k];
      if (tiers.length === 1) return `${formatCurrency(tiers[0].price)}/un`;
      return tiers
        .map(
          (t: { from: number; to: number; price: number }) =>
            `${formatCurrency(t.price)} (${t.from}-${t.to === Infinity ? "+" : t.to})`
        )
        .join("\n");
    }),
    savings: `${maxSavings}%`,
  });

  // Leads (WhatsApp) — same price for all plans
  const leadsTiers = ADDONS.leads.additionalLeadsTiers;
  const leadsBasePrice = `${formatCurrency(leadsTiers[0].price)}/msg`;
  rows.push({
    name: "Leads (WhatsApp)",
    values: [leadsBasePrice, leadsBasePrice, leadsBasePrice],
    savings: "—",
  });

  return rows;
}

// ============================================================================
// STATIC DATA
// ============================================================================

const highlights = [
  {
    icon: Building2,
    title: "CRM Completo",
    description: "Gestão de leads, funil de vendas e relatórios avançados",
  },
  {
    icon: Globe,
    title: "Site Incluso",
    description: "Website profissional otimizado para Google",
  },
  {
    icon: Smartphone,
    title: "App Corretor",
    description: "Cadastre imóveis e receba leads no celular",
  },
  {
    icon: BarChart3,
    title: "+50 Portais",
    description: "Publicação automática em todos os portais",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function ImobPage() {
  const { theadRef } = useStickyHeader();
  const pricingData = useMemo(() => buildPricingData(), []);
  const addonRows = useMemo(() => buildAddonComparisonRows(), []);

  const renderValue = (row: PricingRow, planIndex: number) => {
    const value = row.values[planIndex];

    if (row.type === "check") {
      return value ? (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mx-auto">
          <Check className="w-5 h-5 text-green-600" />
        </div>
      ) : (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 mx-auto">
          <X className="w-5 h-5 text-red-400" />
        </div>
      );
    }

    if (row.type === "mixed") {
      if (value === "Incluído") {
        return <span className="text-secondary font-medium">Incluído</span>;
      }
      return (
        <span className="text-muted-foreground text-sm">Opcional: pagar à parte</span>
      );
    }

    if (row.type === "complex") {
      const lines = (value as string).split("\n");
      return (
        <div className="text-xs space-y-0.5">
          {lines.map((line, i) => (
            <div
              key={i}
              className={i === 0 ? "font-medium" : "text-muted-foreground"}
            >
              {line}
            </div>
          ))}
        </div>
      );
    }

    if (row.type === "price" && row.highlight) {
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-bold text-foreground">{value}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
            investimento
          </span>
        </span>
      );
    }

    return (
      <span className={row.type === "price" ? "font-medium" : ""}>{value}</span>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              CRM + SITE PARA VENDAS
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Kenlo Imob
            </h1>

            <p className="text-xl text-muted-foreground mb-6">
              CRM completo para imobiliárias com Site e App incluídos. Todos os
              seus leads em um só lugar.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>8.500+ imobiliárias</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-primary" />
                <span>+50 portais integrados</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span>3.5M imóveis na plataforma</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/calculadora">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
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

      {/* Highlights */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary h-fit">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos e Preços
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o tamanho da sua imobiliária. Todos os
              valores são para pagamento anual.
            </p>
          </div>

          {/* Pricing Table */}
          <div className="max-w-5xl mx-auto">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <table className="w-full border-collapse min-w-[600px]">
                {/* Header */}
                <thead ref={theadRef} className="pricing-sticky-header">
                  <tr>
                    <th className="text-left p-4 bg-muted/30 rounded-tl-lg w-[40%]">
                      <span className="text-sm font-medium text-muted-foreground">
                        Categoria / Recurso
                      </span>
                    </th>
                    {pricingData.plans.map((plan, index) => (
                      <th
                        key={plan}
                        className={`p-4 text-center bg-muted/30 ${
                          index === pricingData.plans.length - 1
                            ? "rounded-tr-lg"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`kenlo-badge ${
                              plan === "Prime"
                                ? "kenlo-badge-prime"
                                : plan === "K"
                                ? "kenlo-badge-k"
                                : "kenlo-badge-k2"
                            }`}
                          >
                            {plan}
                          </span>
                          {plan === "K" && (
                            <Badge className="bg-primary text-primary-foreground text-[10px]">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {pricingData.sections.map((section, sectionIndex) => (
                    <React.Fragment key={`section-${sectionIndex}`}>
                      {/* Section Header */}
                      <tr>
                        <td
                          colSpan={4}
                          className="p-3 bg-primary/5 font-semibold pricing-table-text border-t border-border/40"
                        >
                          {section.title}
                        </td>
                      </tr>

                      {/* Section Rows */}
                      {section.rows.map((row, rowIndex) => {
                        const typedRow = row as PricingRow;
                        return (
                          <tr
                            key={`row-${sectionIndex}-${rowIndex}`}
                            className="border-b border-border/20 pricing-row"
                          >
                            <td className="p-4 text-sm pricing-table-text">
                              <div className="flex items-center gap-2">
                                {typedRow.feature}
                                {typedRow.tooltip && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="w-4 h-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs max-w-[200px]">
                                        {typedRow.tooltip}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </td>
                            {pricingData.plans.map((_, planIndex) => (
                              <td
                                key={planIndex}
                                className="p-4 text-center text-sm pricing-table-text"
                              >
                                {renderValue(typedRow, planIndex)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Example calculation */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Exemplo de cálculo (Plano K):</strong> Se a imobiliária
                tiver 20 usuários adicionais, paga{" "}
                {IMOB_ADDITIONAL_USERS.k.length > 1
                  ? `${IMOB_ADDITIONAL_USERS.k[0].to} × ${formatCurrency(
                      IMOB_ADDITIONAL_USERS.k[0].price
                    )} + ${20 - IMOB_ADDITIONAL_USERS.k[0].to} × ${formatCurrency(
                      IMOB_ADDITIONAL_USERS.k[1].price
                    )}`
                  : `20 × ${formatCurrency(IMOB_ADDITIONAL_USERS.k[0].price)}`}
                {" = "}
                <strong>
                  {formatCurrency(
                    Math.min(20, IMOB_ADDITIONAL_USERS.k[0].to) *
                      IMOB_ADDITIONAL_USERS.k[0].price +
                      Math.max(0, 20 - IMOB_ADDITIONAL_USERS.k[0].to) *
                        (IMOB_ADDITIONAL_USERS.k[1]?.price ?? 0)
                  )}
                  /mês
                </strong>{" "}
                em usuários adicionais.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/calculadora">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <Calculator className="w-5 h-5" />
                Simular Cotação
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Plan Comparison - Add-on Impact */}
      <section className="py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Comparação de Planos - Add-ons IMOB
            </h2>
            <p className="text-sm text-muted-foreground">
              Veja como cada plano impacta o custo dos add-ons específicos do
              Kenlo Imob
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-2 px-3 font-semibold">
                      Add-on
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-primary">
                      Prime
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-blue-600">
                      K
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-purple-600">
                      K²
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-green-600">
                      Economia
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {addonRows.map((row, idx) => (
                    <tr key={idx} className="border-b border-border/40">
                      <td className="py-2 px-3 font-medium pricing-table-text">
                        {row.name}
                      </td>
                      {row.values.map((val, vi) => (
                        <td
                          key={vi}
                          className={`py-2 px-3 text-center text-xs pricing-table-text ${
                            vi === 2 ? "font-semibold" : ""
                          }`}
                        >
                          {val.split("\n").map((line, li) => (
                            <React.Fragment key={li}>
                              {li > 0 && <br />}
                              {line}
                            </React.Fragment>
                          ))}
                        </td>
                      ))}
                      <td
                        className={`py-2 px-3 text-center font-semibold ${
                          row.savings === "—"
                            ? "text-gray-400"
                            : "text-green-600"
                        }`}
                      >
                        {row.savings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-900">
                <strong>Insight:</strong> Planos superiores (K ou K²) reduzem
                significativamente o custo por unidade. Quanto mais você
                digitaliza, menor o impacto dos add-ons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Add-ons CTA */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Potencialize com Add-ons
            </h2>
            <p className="text-muted-foreground mb-6">
              Adicione Leads, Inteligência e Assinatura para maximizar
              resultados. Combine em um Kombo e ganhe até 20% de desconto!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/addons/leads">
                <Button variant="outline" className="gap-2">
                  Kenlo Leads
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/addons/inteligencia">
                <Button variant="outline" className="gap-2">
                  Kenlo Inteligência
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/addons/assinatura">
                <Button variant="outline" className="gap-2">
                  Kenlo Assinatura
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Kombos CTA */}
      <section className="py-16">
        <div className="container">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 kenlo-gradient opacity-90" />

            <div className="relative px-8 py-12 md:px-16 md:py-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Economize com Kombos
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-6">
                Combine Kenlo Imob com add-ons e ganhe até 20% de desconto. O
                Kombo Elite inclui todos os produtos e serviços premium!
              </p>
              <Link href="/kombos">
                <Button size="lg" variant="secondary" className="gap-2">
                  Explorar Kombos
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
