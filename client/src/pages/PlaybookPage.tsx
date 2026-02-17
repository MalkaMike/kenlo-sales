import { Link } from "wouter";
import { useState } from "react";
import { ADDONS } from "@shared/pricing-config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useNotification } from "@/hooks/useNotification";
import {
  Building2,
  Home,
  Users,
  Brain,
  FileSignature,
  CreditCard,
  Shield,
  Banknote,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Calculator,
  BookOpen,
  Star,
  Zap,
  Eye,
  Award,
  DollarSign,
  Clock,
  Download,
  Loader2,
} from "lucide-react";

// ============================================================================
// PLAYBOOK DATA
// ============================================================================

interface SellingQuestion {
  question: string;
  insight: string;
}

interface KillerStat {
  value: string;
  label: string;
  color: string;
}

interface Playbook {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
  badgeColor: string;
  heroQuote: string;
  killerStats: KillerStat[];
  sellingQuestions: SellingQuestion[];
  keyObjections: { objection: string; response: string }[];
  demoTip: string;
  prepaidTip: string;
  crossSell: string[];
}

const productPlaybooks: Playbook[] = [
  {
    id: "imob",
    title: "Kenlo IMOB",
    subtitle: "CRM + Site para Vendas",
    icon: Building2,
    badge: "VENDAS",
    badgeColor: "bg-blue-100 text-blue-800",
    heroQuote: "80% dos clientes não conhecem esses números. É aí que você impressiona.",
    killerStats: [
      { value: "8,7%", label: "Conv. Site (Vendas)", color: "text-blue-700" },
      { value: "1,8%", label: "Conv. Portais (Vendas)", color: "text-red-700" },
      { value: "60%", label: "Fechamentos Campeão (Site)", color: "text-green-700" },
      { value: "10%", label: "Fechamentos Comunidade", color: "text-purple-700" },
    ],
    sellingQuestions: [
      { question: "Você sabe quantos dos seus fechamentos vem do seu site?", insight: "Média Kenlo: 23%. Campeões: 60%. Escodelar: 60% dos fechamentos vem do site." },
      { question: "Qual é a sua taxa de conversão?", insight: "Média Kenlo: 4,5% em vendas. Campeões: 9%. Portais: apenas 1,8%." },
      { question: "Quanto dos seus leads vem de portais vs originação própria?", insight: "60-70% dos leads vem de portais, mas geram apenas 30% dos fechamentos." },
      { question: "Você já pensou em ganhar com co-corretagem?", insight: "Comunidade Kenlo (planos K e K²): 10% dos fechamentos via parcerias. Melhor 50% de algo que 100% de nada." },
    ],
    keyObjections: [
      { objection: "Já temos portais", response: "Portais convertem 1,8%. Seu site Kenlo converte 8,7%. Não é sobre abandonar portais — é sobre diversificar." },
      { objection: "Site não traz resultado", response: "Porque não é qualquer site. O site Kenlo foi otimizado por Neil Patel. A melhor ficha de imóvel do mercado." },
    ],
    demoTip: "Comece pelo DADO, não pela feature. Mostre o problema (dependência de portais) antes da solução.",
    prepaidTip: "Pré-pago de usuários: R$ 34/mês (fixo). Exemplo: 20 extras no K = R$ 680/mês vs R$ 840 pós-pago. Economia de R$ 1.920/ano.",
    crossSell: ["Leads", "Inteligência", "Assinatura"],
  },
  {
    id: "locacao",
    title: "Kenlo Locação",
    subtitle: "ERP para Locação",
    icon: Home,
    badge: "LOCAÇÃO",
    badgeColor: "bg-green-100 text-green-800",
    heroQuote: "Locação não é só gestão — é geração de receita. Seguros, Pay e Cash transformam cada contrato em lucro.",
    killerStats: [
      { value: "35-45%", label: "Comissão Seguros", color: "text-green-700" },
      { value: "15-20h", label: "Economizadas/mês (Pay)", color: "text-blue-700" },
      { value: "R$ 1.500+", label: "Valor gerado/mês", color: "text-amber-700" },
      { value: "24 meses", label: "Antecipação Cash", color: "text-purple-700" },
    ],
    sellingQuestions: [
      { question: "Quanto tempo sua equipe gasta com cobrança manual?", insight: "Com Kenlo Pay, economize 15-20 horas/mês em trabalho manual." },
      { question: "Você já cobra taxa de boleto dos inquilinos?", insight: "90% das imobiliárias já cobram. Com Pay, automatize e ganhe." },
      { question: "Quanto a imobiliária ganha com seguro por contrato?", insight: "35-45% de comissão. 100 contratos = R$ 10.000+/ano." },
      { question: "Como você fideliza proprietários hoje?", insight: "Kenlo Cash: antecipação de até 24 meses. Nenhum concorrente tem." },
    ],
    keyObjections: [
      { objection: "Planilha funciona bem", response: "Funciona, mas custa 15-20h/mês em trabalho manual. R$ 750-1.000/mês em custo de mão-de-obra." },
      { objection: "Muito caro", response: "Investimento de R$ 247/mês gera R$ 1.500+ em valor (Seguros + Pay + economia de tempo)." },
    ],
    demoTip: "Foque em RECEITA, não em gestão. Mostre Seguros (receita passiva), Pay (economia), Cash (fidelização).",
    prepaidTip: "Pré-pago de contratos: R$ 2,20/mês (fixo). Exemplo: 500 extras no K = R$ 1.100/mês vs R$ 1.450 pós-pago. Economia de R$ 4.200/ano.",
    crossSell: ["Pay", "Seguros", "Cash", "Inteligência"],
  },
];

const addonPlaybooks: Playbook[] = [
  {
    id: "leads",
    title: "Kenlo Leads",
    subtitle: "Gestão Inteligente de Leads",
    icon: Users,
    badge: "ADD-ON",
    badgeColor: "bg-orange-100 text-orange-800",
    heroQuote: "Não é só quantidade — é a PESSOA CERTA. Transparência total: veja de onde vem, quanto custa, qual converte.",
    killerStats: [
      { value: "5 min", label: "Redistribuição automática", color: "text-blue-700" },
      { value: "100%", label: "Transparência de origem", color: "text-green-700" },
      { value: "AI SDR", label: "Qualificação inteligente", color: "text-purple-700" },
      { value: "R$ 0", label: "Implantação", color: "text-amber-700" },
    ],
    sellingQuestions: [
      { question: "Você sabe de onde vem cada lead e quanto custa?", insight: "Kenlo Leads mostra origem, custo e taxa de conversão por canal." },
      { question: "Quanto tempo leva para atender um lead novo?", insight: "Lead não atendido em 5 min é redistribuído automaticamente." },
    ],
    keyObjections: [
      { objection: "Já temos gestão de leads", response: "Mas tem transparência de origem e custo por canal? AI SDR qualificando antes do corretor?" },
    ],
    demoTip: "Mostre a transparência: de onde vem, quanto custa, qual converte. Depois mostre a redistribuição automática.",
    prepaidTip: "Combine com pré-pago de usuários (R$ 34/mês) para reduzir o TCO total da operação de vendas.",
    crossSell: ["IMOB", "Inteligência"],
  },
  {
    id: "inteligencia",
    title: "Kenlo Inteligência",
    subtitle: "BI com Google Looker Pro",
    icon: Brain,
    badge: "ONDE VOCÊ BRILHA",
    badgeColor: "bg-purple-100 text-purple-800",
    heroQuote: "Kenlo é 1 de 12 empresas selecionadas pelo Google como parceira em real estate. É aqui que você mais brilha na demo.",
    killerStats: [
      { value: "1 de 12", label: "Parceria Google", color: "text-blue-700" },
      { value: "SAFRA", label: "Funil completo", color: "text-green-700" },
      { value: "4,5%", label: "Conv. média vendas", color: "text-amber-700" },
      { value: "7,5%", label: "Conv. média locação", color: "text-purple-700" },
    ],
    sellingQuestions: [
      { question: "Você sabe se está acima ou abaixo da média do mercado?", insight: "80% não sabem. O relatório Performance vs Mercado mostra." },
      { question: "Onde está o gargalo da sua operação?", insight: "Relatório SAFRA: funil completo de leads → visitas → propostas → fechamentos." },
    ],
    keyObjections: [
      { objection: "Já temos relatórios", response: "Mas tem parceria Google? Relatório SAFRA? Comparação vs mercado? Usuários ilimitados?" },
    ],
    demoTip: "Mostre os 2 relatórios exclusivos: SAFRA (funil) e Performance vs Mercado (reality check). Cliente fica impressionado.",
    prepaidTip: "Inteligência + pré-pago de usuários/contratos = máxima economia. Mostre o TCO total com desconto de Kombo.",
    crossSell: ["IMOB", "Locação", "Leads"],
  },
  {
    id: "assinatura",
    title: "Kenlo Assinatura",
    subtitle: "Assinatura Digital Cerisign",
    icon: FileSignature,
    badge: "ADD-ON",
    badgeColor: "bg-indigo-100 text-indigo-800",
    heroQuote: `Parceria Cerisign — líder em certificação digital. R$ 0 de implantação, ${ADDONS.assinaturas.includedSignatures} assinaturas incluídas/mês.`,
    killerStats: [
      { value: "5 min", label: "Contrato assinado", color: "text-blue-700" },
      { value: `${ADDONS.assinaturas.includedSignatures}`, label: "Assinaturas incluídas/mês", color: "text-green-700" },
      { value: "R$ 0", label: "Implantação", color: "text-amber-700" },
      { value: "100%", label: "Validade jurídica", color: "text-purple-700" },
    ],
    sellingQuestions: [
      { question: "Quanto tempo e dinheiro gasta com cartório?", insight: "Com assinatura digital, feche contratos em 5 minutos, sem sair do escritório." },
    ],
    keyObjections: [
      { objection: "Já usamos DocuSign", response: "DocuSign não é integrado ao CRM. Kenlo Assinatura é embutida — sem copiar/colar dados." },
    ],
    demoTip: "Mostre a velocidade: 5 minutos para assinar um contrato completo. Biometria facial para alto valor.",
    prepaidTip: "Assinatura R$ 37/mês com 15 inclusas. Combine com pré-pago de contratos (R$ 2,20) para máxima economia em locação.",
    crossSell: ["IMOB", "Locação"],
  },
  {
    id: "pay",
    title: "Kenlo Pay",
    subtitle: "Boleto + Split Digital",
    icon: CreditCard,
    badge: "MAIS PODEROSO",
    badgeColor: "bg-blue-100 text-blue-800",
    heroQuote: "A ferramenta mais poderosa da locação. 90% das imobiliárias já cobram taxa. Com Pay, a imobiliária GANHA dinheiro.",
    killerStats: [
      { value: "90%", label: "Já cobram taxa de boleto", color: "text-blue-700" },
      { value: "15-20h", label: "Economizadas/mês", color: "text-green-700" },
      { value: "R$ 750+", label: "Economia mão-de-obra", color: "text-amber-700" },
      { value: "R$ 0", label: "Implantação", color: "text-purple-700" },
    ],
    sellingQuestions: [
      { question: "Você cobra taxa de boleto dos inquilinos?", insight: "90% já cobram. Com Pay, automatize e transforme em receita." },
      { question: "Quanto tempo gasta com conciliação bancária?", insight: "Pay faz conciliação automática. Split direto na conta certa." },
    ],
    keyObjections: [
      { objection: "Já temos sistema de cobrança", response: "Mas tem split automático? Conciliação automática? Integrado ao ERP? Economiza 15-20h/mês?" },
    ],
    demoTip: "Foque no SPLIT: inquilino paga, dinheiro cai automaticamente na conta do proprietário, comissão na da imobiliária.",
    prepaidTip: "Pay + pré-pago de contratos (R$ 2,20/contrato) = operação de locação com custo mínimo e receita máxima.",
    crossSell: ["Locação", "Seguros", "Cash"],
  },
  {
    id: "seguros",
    title: "Kenlo Seguros",
    subtitle: "Tokyo Marine no Boleto",
    icon: Shield,
    badge: "SEGREDO DO SUCESSO",
    badgeColor: "bg-green-100 text-green-800",
    heroQuote: "O segredo do sucesso da locação. Tokyo Marine embutido no boleto. 35-45% de comissão. R$ 0 de implantação.",
    killerStats: [
      { value: "35-45%", label: "Comissão por contrato", color: "text-green-700" },
      { value: "R$ 10.000+", label: "Receita/ano (100 contratos)", color: "text-amber-700" },
      { value: "R$ 0", label: "Implantação e custo", color: "text-blue-700" },
      { value: "Tokyo Marine", label: "Parceira de confiança", color: "text-purple-700" },
    ],
    sellingQuestions: [
      { question: "Quanto a imobiliária ganha com seguro hoje?", insight: "Com Kenlo Seguros: 35-45% de comissão. Receita passiva sem esforço." },
      { question: "O inquilino já paga seguro no boleto?", insight: "Com Kenlo, o seguro é embutido automaticamente. Sem trabalho adicional." },
    ],
    keyObjections: [
      { objection: "Já temos parceria com seguradora", response: "Mas é embutido no boleto? Automático? 35-45% de comissão? R$ 0 de implantação?" },
    ],
    demoTip: "Calcule na hora: 100 contratos × R$ 100/ano = R$ 10.000+/ano de receita passiva. Sem fazer nada.",
    prepaidTip: "Seguros gera receita passiva. Combine com pré-pago de contratos (R$ 2,20) para maximizar margem por contrato.",
    crossSell: ["Locação", "Pay", "Cash"],
  },
  {
    id: "cash",
    title: "Kenlo Cash",
    subtitle: "Antecipação de Aluguel",
    icon: Banknote,
    badge: "EXCLUSIVO",
    badgeColor: "bg-amber-100 text-amber-800",
    heroQuote: "Nenhum concorrente oferece antecipação de aluguel. Vantagem competitiva absoluta para fidelizar proprietários.",
    killerStats: [
      { value: "24 meses", label: "Antecipação máxima", color: "text-purple-700" },
      { value: "R$ 0", label: "Capital próprio necessário", color: "text-green-700" },
      { value: "0%", label: "Risco para imobiliária", color: "text-blue-700" },
      { value: "Comissão", label: "Ganhe por indicação", color: "text-amber-700" },
    ],
    sellingQuestions: [
      { question: "Como você fideliza proprietários hoje?", insight: "Ofereça antecipação de até 24 meses. Nenhum concorrente tem isso." },
      { question: "Já perdeu proprietário para outra imobiliária?", insight: "Com Cash, você tem uma arma que ninguém mais oferece." },
    ],
    keyObjections: [
      { objection: "Proprietário não vai querer", response: "Proprietário que precisa de liquidez adora. Reforma, investimento, emergência — Cash resolve." },
    ],
    demoTip: "Cenário: proprietário quer reformar o imóvel. Ofereça antecipação de 12 meses. Ele fica, você ganha comissão.",
    prepaidTip: "Cash + pré-pago de contratos (R$ 2,20) = fidelização + economia. Ofereça no plano bienal para máximo desconto.",
    crossSell: ["Locação", "Pay", "Seguros"],
  },
];

const komboPlaybooks = [
  {
    id: "imob-start",
    name: "Imob Start",
    products: "IMOB + Leads + Assinatura",
    discount: "10%",
    idealFor: "Imobiliárias focadas em vendas que querem captar leads",
    keyMessage: "Entrada no digital com captação de leads. FREE impl. Leads. VIP/CS não incluído (pago à parte).",
    prepaidTip: "Pré-pago usuários R$ 34/mês + 10% Kombo = máxima economia na entrada.",
    color: "bg-blue-500",
  },
  {
    id: "imob-pro",
    name: "Imob Pro",
    products: "IMOB + Leads + Inteligência + Assinatura",
    discount: "15%",
    idealFor: "Quem quer maximizar conversão com dados (Google partnership)",
    keyMessage: "Vendas data-driven. Parceria Google. SAFRA + Performance vs Mercado. VIP + CS incluídos.",
    prepaidTip: "15% OFF + pré-pago usuários R$ 34/mês = economia combinada significativa.",
    color: "bg-primary",
  },
  {
    id: "locacao-pro",
    name: "Locação Pro",
    products: "LOC + Inteligência + Assinatura",
    discount: "10%",
    idealFor: "Administradoras focadas em locação inteligente",
    keyMessage: "Gestão inteligente com BI + assinatura digital. VIP + CS incluídos.",
    prepaidTip: "Pré-pago contratos R$ 2,20/mês + 10% Kombo = custo mínimo por contrato.",
    color: "bg-green-500",
  },
  {
    id: "core-gestao",
    name: "Core Gestão",
    products: "IMOB + LOC",
    discount: "0%",
    idealFor: "Imobiliárias que fazem vendas E locação",
    keyMessage: "Plataforma unificada. Economize R$ 1.497 em impl. VIP + CS incluídos.",
    prepaidTip: "Pré-pago usuários R$ 34 + contratos R$ 2,20 = economia dupla.",
    color: "bg-purple-500",
  },
  {
    id: "elite",
    name: "Elite",
    products: "IMOB + LOC + Todos Add-ons",
    discount: "20%",
    idealFor: "Quem quer liderar o mercado com digitalização total",
    keyMessage: "Tudo incluído. 20% OFF + VIP + CS. Economize R$ 5.087 no primeiro ano.",
    prepaidTip: "20% Kombo + pré-pago usuários R$ 34 + contratos R$ 2,20 = economia máxima absoluta.",
    color: "bg-amber-500",
  },
];

// ============================================================================
// PLAYBOOK CARD COMPONENT
// ============================================================================

function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-2 border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-card/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary flex-shrink-0">
              <playbook.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold">{playbook.title}</h3>
                <Badge className={playbook.badgeColor}>{playbook.badge}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{playbook.subtitle}</p>
              <p className="text-sm text-muted-foreground mt-2 italic">"{playbook.heroQuote}"</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>

        {/* Killer Stats - Always visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {playbook.killerStats.map((stat, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-muted/50">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border p-6 space-y-6 bg-card/30">
          {/* Selling Questions */}
          <div>
            <h4 className="text-sm font-bold uppercase text-primary mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Perguntas que Vendem
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              {playbook.sellingQuestions.map((q, i) => (
                <div key={i} className="p-4 rounded-xl border border-border">
                  <p className="font-semibold text-sm mb-1">"{q.question}"</p>
                  <p className="text-xs text-muted-foreground">{q.insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Objection Handlers */}
          <div>
            <h4 className="text-sm font-bold uppercase text-red-600 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Objeções e Respostas
            </h4>
            <div className="space-y-3">
              {playbook.keyObjections.map((obj, i) => (
                <div key={i} className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                  <p className="font-semibold text-sm text-red-800 mb-1">❌ "{obj.objection}"</p>
                  <p className="text-xs text-green-800">✅ {obj.response}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Tip */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <h4 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Dica de Demo
            </h4>
            <p className="text-xs text-blue-700">{playbook.demoTip}</p>
          </div>

          {/* Prepaid Tip */}
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <h4 className="text-sm font-bold text-green-800 mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pré-Pago: Argumento de Economia
            </h4>
            <p className="text-xs text-green-700">{playbook.prepaidTip}</p>
            <p className="text-xs text-green-600 mt-1 italic">Parcelas: Semestral (2x) | Anual (3x) | Bienal (6x)</p>
          </div>

          {/* Cross-sell */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground">CROSS-SELL:</span>
            {playbook.crossSell.map((item, i) => (
              <Badge key={i} variant="outline" className="text-xs">{item}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PlaybookPage() {
  const [activeTab, setActiveTab] = useState<"products" | "addons" | "kombos">("products");
  const { success: notifySuccess, error: notifyError } = useNotification();
  const generatePDF = trpc.playbook.generatePDF.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notifySuccess("PDF gerado!", "O download do Sales Playbook começou.");
    },
    onError: (error) => {
      notifyError("Erro", error.message || "Não foi possível gerar o PDF.");
    },
  });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5" />
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <BookOpen className="w-4 h-4" />
              Sales Playbook
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Argumentos que{" "}
              <span className="kenlo-gradient-text">fecham negócios</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Dados, perguntas-chave, objeções e dicas de demo para cada produto e Kombo.
              Tudo que sua equipe precisa para vender com confiança.
            </p>
            <p className="text-sm text-muted-foreground italic max-w-2xl mx-auto mb-6">
              "80% dos clientes não conhecem esses números. É aí que você impressiona. Não vendemos vento — vendemos dados."
            </p>

            {/* Download PDF Button */}
            <div className="mb-8">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={() => generatePDF.mutate()}
                disabled={generatePDF.isPending}
              >
                {generatePDF.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Gerando PDF...</>
                ) : (
                  <><Download className="w-5 h-5" /> Baixar Playbook Completo (PDF)</>
                )}
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-2xl font-black text-blue-700">8.500+</div>
                <div className="text-xs text-blue-600">Imobiliárias</div>
              </div>
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="text-2xl font-black text-green-700">3,5M</div>
                <div className="text-xs text-green-600">Imóveis/noite</div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <div className="text-2xl font-black text-purple-700">40.000+</div>
                <div className="text-xs text-purple-600">Corretores</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-2xl font-black text-amber-700">R$ 8B+</div>
                <div className="text-xs text-amber-600">Em vendas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Origin Performance Table */}
      <section className="py-12 border-y border-border/40 bg-card/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">
              Performance por Origem de Lead
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-3 px-4 font-bold">Canal</th>
                    <th className="text-center py-3 px-4 font-bold">Volume</th>
                    <th className="text-center py-3 px-4 font-bold">Conv. Vendas</th>
                    <th className="text-center py-3 px-4 font-bold">Conv. Locação</th>
                    <th className="text-center py-3 px-4 font-bold">Custo/Lead</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Portais Nacionais</td>
                    <td className="py-3 px-4 text-center"><span className="text-2xl font-black text-blue-700">60-70%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-red-600 font-bold">1,8%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-red-600 font-bold">3,2%</span></td>
                    <td className="py-3 px-4 text-center">R$ 3-8</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50 bg-green-50/50">
                    <td className="py-3 px-4 font-medium">Site Próprio (Kenlo)</td>
                    <td className="py-3 px-4 text-center"><span className="font-bold">15-25%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-green-600 font-black text-xl">8,7%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-green-600 font-black text-xl">12,3%</span></td>
                    <td className="py-3 px-4 text-center">R$ 15-30</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Indicação/Placa</td>
                    <td className="py-3 px-4 text-center"><span className="font-bold">5-15%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-green-600 font-bold">12-15%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-green-600 font-bold">15-20%</span></td>
                    <td className="py-3 px-4 text-center">R$ 0</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Google Ads</td>
                    <td className="py-3 px-4 text-center"><span className="font-bold">5-10%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-blue-600 font-bold">5-8%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-blue-600 font-bold">7-10%</span></td>
                    <td className="py-3 px-4 text-center">R$ 20-50</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Redes Sociais</td>
                    <td className="py-3 px-4 text-center"><span className="font-bold">5-10%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-amber-600 font-bold">2-4%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-amber-600 font-bold">3-5%</span></td>
                    <td className="py-3 px-4 text-center">R$ 5-15</td>
                  </tr>
                  <tr className="hover:bg-muted/50 bg-purple-50/50">
                    <td className="py-3 px-4 font-medium">Comunidade Kenlo</td>
                    <td className="py-3 px-4 text-center"><span className="font-bold">~10%</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-purple-600 font-bold">Alto</span></td>
                    <td className="py-3 px-4 text-center"><span className="text-purple-600 font-bold">Alto</span></td>
                    <td className="py-3 px-4 text-center">R$ 0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3 italic">
              Dados baseados na Comunidade Kenlo (8.500+ imobiliárias). Use esses números para mostrar ao cliente a realidade do mercado.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="container">
          <div className="flex gap-2 justify-center">
            <Button
              variant={activeTab === "products" ? "default" : "outline"}
              onClick={() => setActiveTab("products")}
              className="gap-2"
            >
              <Building2 className="w-4 h-4" />
              Produtos Core ({productPlaybooks.length})
            </Button>
            <Button
              variant={activeTab === "addons" ? "default" : "outline"}
              onClick={() => setActiveTab("addons")}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Add-ons ({addonPlaybooks.length})
            </Button>
            <Button
              variant={activeTab === "kombos" ? "default" : "outline"}
              onClick={() => setActiveTab("kombos")}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Kombos ({komboPlaybooks.length})
            </Button>
          </div>
        </div>
      </section>

      {/* Playbook Cards */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-6">
            {activeTab === "products" && productPlaybooks.map((pb) => (
              <PlaybookCard key={pb.id} playbook={pb} />
            ))}
            {activeTab === "addons" && addonPlaybooks.map((pb) => (
              <PlaybookCard key={pb.id} playbook={pb} />
            ))}
            {activeTab === "kombos" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Kombos: Argumentos Rápidos</h2>
                  <p className="text-muted-foreground">Todos incluem VIP + CS Dedicado. Quanto mais digitaliza, menor o custo.</p>
                </div>
                {komboPlaybooks.map((kombo) => (
                  <div key={kombo.id} className="border-2 border-border rounded-2xl p-6 hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${kombo.color} flex items-center justify-center flex-shrink-0`}>
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">Kombo {kombo.name}</h3>
                          <Badge className="bg-green-100 text-green-800">{kombo.discount} OFF</Badge>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{kombo.products}</p>
                        <p className="text-sm text-muted-foreground mb-3">{kombo.idealFor}</p>
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <p className="text-sm font-medium text-primary">💡 {kombo.keyMessage}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-50 border border-green-200 mt-2">
                          <p className="text-sm font-medium text-green-700">💰 {kombo.prepaidTip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-8">
                  <Link href="/kombos">
                    <Button size="lg" className="gap-2">
                      Ver Comparação Completa de Kombos
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Calculator className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Pronto para fechar?
            </h2>
            <p className="text-muted-foreground mb-8">
              Use a calculadora para montar a proposta perfeita com detecção automática de Kombos.
            </p>
            <Link href="/calculadora">
              <Button size="lg" className="bg-primary hover:bg-primary/90 gap-2">
                <Calculator className="w-5 h-5" />
                Abrir Calculadora
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
