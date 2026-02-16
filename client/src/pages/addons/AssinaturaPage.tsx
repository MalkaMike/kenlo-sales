import { Link } from "wouter";
import React, { useMemo } from "react";
import { useStickyHeader } from "@/hooks/useStickyHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, FileSignature, Shield, Clock, Smartphone, ArrowRight, Calculator, ScanFace, FileCheck, Workflow, Lock, Zap, Star } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ADDONS } from "@shared/pricing-config";

// ============================================================================
// DYNAMIC PRICING DATA BUILDER
// ============================================================================

const assin = ADDONS.assinaturas;

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
        value: `${formatCurrency(assin.annualPrice)}/mês`,
        highlight: true,
        tooltip: undefined as string | undefined,
      },
      {
        feature: "Implantação (única)",
        value: assin.implementation === 0 ? "Sem custo" : formatCurrency(assin.implementation),
        tooltip: assin.implementation === 0 ? "Implantação gratuita para todos os clientes" : undefined,
      },
      {
        feature: "Assinaturas inclusas/mês",
        value: `${assin.includedSignatures} assinaturas`,
        tooltip: `Carência mensal de ${assin.includedSignatures} assinaturas digitais incluídas`,
      },
      {
        feature: "Produtos atendidos",
        value: assin.availableFor.map((p) => p.toUpperCase()).join(" e "),
        tooltip: `Funciona com Kenlo ${assin.availableFor.map((p) => p.toUpperCase()).join(" e/ou Kenlo ")}`,
      },
    ],
  });

  // --- Assinaturas Adicionais (pós-pago) ---
  const additionalRows = assin.additionalSignaturesTiers.map(
    (tier: { from: number; to: number; price: number }) => {
      const rangeLabel =
        tier.to === Infinity
          ? `Acima de ${tier.from} assinaturas`
          : `${tier.from} a ${tier.to} assinaturas`;
      return {
        feature: rangeLabel,
        value: `${formatCurrency(tier.price)}/assinatura`,
        tooltip: undefined as string | undefined,
      };
    }
  );
  sections.push({
    title: "Assinaturas Adicionais (pós-pago)",
    rows: additionalRows,
  });

  // --- Funcionalidades Incluídas ---
  sections.push({
    title: "Funcionalidades Incluídas",
    rows: [
      {
        feature: "Assinatura digital com validade jurídica",
        value: true as string | boolean,
        tooltip: "Certificado digital reconhecido — substitui cartório",
      },
      {
        feature: "Envio por e-mail e WhatsApp",
        value: true as string | boolean,
        tooltip: "Cliente recebe o contrato e assina pelo celular",
      },
      {
        feature: "Validação biométrica facial",
        value: `${formatCurrency(assin.biometricValidation)}/validação` as string | boolean,
        tooltip: "Validação de identidade por reconhecimento facial — opcional",
      },
      {
        feature: "Histórico e auditoria",
        value: true as string | boolean,
        tooltip: "Registro completo de todas as assinaturas com trilha de auditoria",
      },
      {
        feature: "Templates de contrato",
        value: true as string | boolean,
        tooltip: "Modelos pré-configurados para contratos de venda e locação",
      },
    ],
  });

  return sections;
}

// ============================================================================
// STATIC DATA
// ============================================================================

const highlights = [
  {
    icon: FileSignature,
    title: "Assinatura Digital",
    description: "Contratos assinados digitalmente com validade jurídica — sem cartório, sem papel",
  },
  {
    icon: Shield,
    title: "Validade Jurídica",
    description: "Certificado digital reconhecido que substitui a necessidade de cartório",
  },
  {
    icon: Clock,
    title: "Fechamento em 5 Min",
    description: "Cliente assina pelo celular em minutos — sem deslocamento, sem atraso",
  },
  {
    icon: Smartphone,
    title: "100% Mobile",
    description: "Processo completo pelo smartphone do cliente — envio por e-mail ou WhatsApp",
  },
];

const useCases = [
  {
    icon: FileCheck,
    title: "Contratos de Venda",
    description: "Feche contratos de compra e venda em minutos. O comprador assina pelo celular, você acompanha em tempo real e o contrato fica armazenado com validade jurídica.",
  },
  {
    icon: Workflow,
    title: "Contratos de Locação",
    description: "Novos contratos de locação assinados digitalmente. Inquilino, proprietário e fiador assinam de qualquer lugar — sem burocracia.",
  },
  {
    icon: ScanFace,
    title: "Validação Biométrica",
    description: `Para contratos de alto valor, adicione validação biométrica facial por ${formatCurrency(assin.biometricValidation)}/validação. Segurança extra com reconhecimento de identidade.`,
  },
  {
    icon: Lock,
    title: "Auditoria e Compliance",
    description: "Histórico completo de todas as assinaturas com trilha de auditoria. Prove quem assinou, quando e de onde — tudo registrado.",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

function formatCurrency2(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: value % 1 !== 0 ? 2 : 0 })}`;
}

export default function AssinaturaPage() {
  const { theadRef } = useStickyHeader();
  const pricingData = useMemo(() => buildPricingData(), []);

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
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

        <div className="container relative">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              ADD-ON • {assin.availableFor.map((p) => p.toUpperCase()).join(" + ")}
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {assin.name}
            </h1>

            <p className="text-xl text-muted-foreground mb-4">
              Assinatura digital embutida na plataforma.
              Feche contratos em <span className="font-semibold text-foreground">5 minutos, sem cartório</span> — com validade jurídica completa.
            </p>
            <p className="text-sm text-muted-foreground mb-6 italic">
              {`Parceria `}<strong className="text-primary">Cerisign</strong>{` — líder em certificação digital no Brasil. R$ 0 de implantação, ${assin.includedSignatures} assinaturas incluídas/mês. Elimine cartório e burocracia.`}
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="text-sm py-1">
                <FileSignature className="w-4 h-4 mr-1" />
                Validade jurídica
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <ScanFace className="w-4 h-4 mr-1" />
                Biometria facial
              </Badge>
              <Badge variant="outline" className="text-sm py-1">
                <Smartphone className="w-4 h-4 mr-1" />
                100% mobile
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

      {/* Big Numbers */}
      <section className="py-12 bg-gray-50 border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <p className="text-3xl font-black text-primary">{assin.includedSignatures}</p>
              <p className="text-sm text-muted-foreground mt-1">assinaturas/mês incluídas no plano</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl font-black text-primary">R$ 0</p>
              <p className="text-sm text-muted-foreground mt-1">custo de implantação</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl font-black text-primary">Cerisign</p>
              <p className="text-sm text-muted-foreground mt-1">parceria com uma das maiores do mundo</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-3xl font-black text-primary">100%</p>
              <p className="text-sm text-muted-foreground mt-1">embutido na plataforma</p>
            </div>
          </div>
        </div>
      </section>

      {/* Positioning Statement */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-6 rounded-xl bg-gray-50 border">
              <p className="text-lg italic text-gray-700">
                "Parceria com a <strong className="text-primary">Cerisign</strong>, uma das maiores empresas de assinatura digital do mundo. Todos os contratos assinados diretamente na plataforma. Facilita o dia a dia e elimina papel."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Selling Questions */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Perguntas que Vendem</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Use estas perguntas para mostrar o valor real da assinatura digital.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Quanto tempo seu time gasta indo ao cartório?</h3>
                  <p className="text-muted-foreground">
                    Cada ida ao cartório = 2-3 horas perdidas. Com 10 contratos/mês, são 20-30 horas que poderiam ser usadas para vender. Com Kenlo Assinaturas, o contrato é assinado em 5 minutos pelo celular.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Você sabia que assinatura digital tem a mesma validade jurídica que cartório?</h3>
                  <p className="text-muted-foreground">
                    Parceria com a Cerisign — uma das maiores certificadoras do mundo. Validade jurídica completa, com trilha de auditoria e biometria facial opcional. Mais seguro que papel.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Quantos negócios você perde porque o cliente demora para assinar?</h3>
                  <p className="text-muted-foreground">
                    O cliente recebe o contrato no WhatsApp, assina na hora pelo celular. Sem deslocamento, sem agendar horário. R$ 0 de implantação e {assin.includedSignatures} assinaturas/mês já incluídas no plano.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <item.icon className="w-5 h-5" />
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
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Casos de Uso</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Veja como o {assin.name} elimina burocracia e acelera o fechamento de contratos
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((item, index) => (
              <div key={index} className="p-6 rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 border-t">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Investimento e Funcionalidades</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Preços transparentes e funcionalidades completas para digitalizar seus contratos
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead ref={theadRef} className="bg-card border-b sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-sm w-2/3">Funcionalidade</th>
                    <th className="px-6 py-4 text-center font-semibold text-sm w-1/3">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingData.map((section, sectionIndex) => (
                    <React.Fragment key={sectionIndex}>
                      <tr className="bg-gray-50 border-b">
                        <td colSpan={2} className="px-6 py-3 font-semibold text-primary">{section.title}</td>
                      </tr>
                      {section.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b last:border-b-0">
                          <td className="px-6 py-4 text-sm text-muted-foreground flex items-center gap-2">
                            {row.tooltip ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="border-b border-dashed border-muted-foreground cursor-help">{row.feature}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{row.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              row.feature
                            )}
                          </td>
                          <td className="px-6 py-4 text-center text-sm">{renderValue(row)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
