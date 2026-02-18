import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, BookOpen, Target, Handshake, TrendingUp } from "lucide-react";

export default function PlaybooksPage() {
  const playbooks = [
    {
      title: "Playbook de Descoberta",
      description: "Guia completo para entender as necessidades do cliente e qualificar oportunidades",
      icon: Target,
      topics: [
        "Perguntas essenciais para descoberta",
        "Identificação de dores e necessidades",
        "Mapeamento do processo de decisão",
        "Qualificação BANT (Budget, Authority, Need, Timeline)"
      ],
      downloadUrl: "#"
    },
    {
      title: "Playbook de Qualificação",
      description: "Metodologia para identificar fit entre solução Kenlo e necessidades do cliente",
      icon: BookOpen,
      topics: [
        "Critérios de qualificação de leads",
        "Matriz de priorização de oportunidades",
        "Identificação de red flags",
        "Quando passar para próxima etapa"
      ],
      downloadUrl: "#"
    },
    {
      title: "Playbook de Apresentação",
      description: "Estrutura de apresentação consultiva focada em valor e ROI",
      icon: TrendingUp,
      topics: [
        "Estrutura de apresentação consultiva",
        "Como demonstrar ROI do Kenlo",
        "Personalização por segmento (pequena, média, grande imobiliária)",
        "Uso de cases de sucesso"
      ],
      downloadUrl: "#"
    },
    {
      title: "Playbook de Fechamento",
      description: "Técnicas e estratégias para conduzir negociações e fechar vendas",
      icon: Handshake,
      topics: [
        "Técnicas de fechamento consultivo",
        "Negociação de condições comerciais",
        "Tratamento de objeções finais",
        "Processo de onboarding pós-venda"
      ],
      downloadUrl: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Breadcrumbs
          items={[
            { label: "Conteúdo", href: "/conteudo" },
            { label: "Playbooks de Vendas" }
          ]}
        />

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Playbooks de Vendas</h1>
          </div>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
            Guias estruturados para cada etapa do processo de vendas Kenlo. Utilize estes playbooks 
            para conduzir conversas consultivas, identificar oportunidades qualificadas e fechar negócios 
            com maior previsibilidade.
          </p>
        </div>

        <div className="grid gap-6 mt-12">
          {playbooks.map((playbook, index) => (
            <Card key={index} className="kenlo-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-muted">
                      <playbook.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{playbook.title}</CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {playbook.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-3">Conteúdo do Playbook:</h3>
                <ul className="grid gap-2">
                  {playbook.topics.map((topic, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{topic}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Como usar os Playbooks</CardTitle>
            <CardDescription className="text-base">
              Dicas para aproveitar ao máximo os materiais de vendas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div>
                <h4 className="font-semibold mb-1">Estude antes da reunião</h4>
                <p className="text-muted-foreground">
                  Revise o playbook correspondente à etapa da venda antes de cada reunião com cliente.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div>
                <h4 className="font-semibold mb-1">Personalize para cada cliente</h4>
                <p className="text-muted-foreground">
                  Adapte as perguntas e abordagens de acordo com o perfil e segmento do cliente.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div>
                <h4 className="font-semibold mb-1">Compartilhe aprendizados</h4>
                <p className="text-muted-foreground">
                  Contribua com o time compartilhando insights e técnicas que funcionaram bem nas suas vendas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
