import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Video, FileText, Rocket, Users, TrendingUp, Play } from "lucide-react";

export default function TreinamentosPage() {
  const trainingModules = [
    {
      title: "Onboarding para Novos Vendedores",
      description: "Programa completo de integração para novos membros do time comercial",
      icon: Rocket,
      duration: "4 horas",
      format: "Vídeos + Exercícios",
      topics: [
        "Visão geral do ecossistema Kenlo (IMOB, Locação, Add-ons)",
        "Entendendo o mercado imobiliário brasileiro",
        "Perfil de cliente ideal (ICP) e segmentação",
        "Estrutura de preços e combos",
        "Ferramentas de vendas (CRM, Cotação, Performance)"
      ]
    },
    {
      title: "Demonstração de Produto",
      description: "Como conduzir demos eficazes focadas em valor e ROI",
      icon: Video,
      duration: "2 horas",
      format: "Vídeos + Templates",
      topics: [
        "Estrutura de uma demo consultiva",
        "Personalização por segmento (pequena/média/grande imobiliária)",
        "Demonstração de funcionalidades-chave",
        "Como usar cases de sucesso durante a demo",
        "Técnicas de storytelling para vendas B2B"
      ]
    },
    {
      title: "Negociação e Fechamento",
      description: "Técnicas avançadas para conduzir negociações e fechar vendas",
      icon: TrendingUp,
      duration: "3 horas",
      format: "Vídeos + Role-play",
      topics: [
        "Psicologia da negociação B2B",
        "Técnicas de fechamento consultivo",
        "Negociação de condições comerciais",
        "Quando e como oferecer descontos",
        "Processo de transição para onboarding"
      ]
    },
    {
      title: "Conhecimento de Produto Avançado",
      description: "Deep dive técnico em todos os produtos e add-ons Kenlo",
      icon: GraduationCap,
      duration: "6 horas",
      format: "Vídeos + Certificação",
      topics: [
        "Kenlo IMOB: funcionalidades, diferenciais e casos de uso",
        "Kenlo Locação: funcionalidades, diferenciais e casos de uso",
        "Add-ons: Leads, Inteligência, Assinatura, Pay, Seguros, Cash",
        "Integrações e ecossistema de parceiros",
        "Roadmap de produto e novidades"
      ]
    },
    {
      title: "Vendas Consultivas B2B",
      description: "Metodologia de vendas consultivas aplicada ao mercado imobiliário",
      icon: Users,
      duration: "4 horas",
      format: "Vídeos + Workbook",
      topics: [
        "Diferença entre venda transacional e consultiva",
        "Framework SPIN Selling aplicado ao Kenlo",
        "Mapeamento de stakeholders e processo de decisão",
        "Construção de business case com o cliente",
        "Follow-up estratégico e nutrição de leads"
      ]
    }
  ];

  const resources = [
    {
      title: "Biblioteca de Vídeos",
      description: "Gravações de demos, apresentações e treinamentos anteriores",
      icon: Play,
      count: "24 vídeos"
    },
    {
      title: "Materiais de Apoio",
      description: "PDFs, templates e checklists para uso diário",
      icon: FileText,
      count: "15 documentos"
    },
    {
      title: "Certificações",
      description: "Programas de certificação para vendedores Kenlo",
      icon: GraduationCap,
      count: "3 certificações"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Breadcrumbs
          items={[
            { label: "Conteúdo", href: "/conteudo" },
            { label: "Treinamentos" }
          ]}
        />

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Treinamentos</h1>
          </div>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
            Programas de capacitação para desenvolver habilidades de vendas consultivas e 
            conhecimento profundo dos produtos Kenlo. Invista no seu desenvolvimento para 
            alcançar resultados extraordinários.
          </p>
        </div>

        {/* Training Modules */}
        <div className="grid gap-6 mt-12">
          <h2 className="text-2xl font-bold">Módulos de Treinamento</h2>
          {trainingModules.map((module, index) => (
            <Card key={index} className="kenlo-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-muted">
                      <module.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{module.title}</CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {module.description}
                      </CardDescription>
                      <div className="flex gap-4 mt-3">
                        <span className="text-sm text-muted-foreground">
                          ⏱️ {module.duration}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          📚 {module.format}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="default" size="sm" className="gap-2">
                    <Play className="w-4 h-4" />
                    Iniciar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-3">Conteúdo do Módulo:</h3>
                <ul className="grid gap-2">
                  {module.topics.map((topic, idx) => (
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

        {/* Resources Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Recursos Adicionais</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="kenlo-card">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-muted w-fit">
                    <resource.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <CardTitle className="text-xl mt-3">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-primary">{resource.count}</p>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <Card className="mt-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Trilha de Aprendizado Recomendada</CardTitle>
            <CardDescription className="text-base">
              Siga esta sequência para maximizar seu desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div>
                <h4 className="font-semibold mb-1">Semana 1-2: Onboarding</h4>
                <p className="text-muted-foreground">
                  Complete o módulo de Onboarding e familiarize-se com os Playbooks de Vendas.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div>
                <h4 className="font-semibold mb-1">Semana 3-4: Produto e Demo</h4>
                <p className="text-muted-foreground">
                  Aprofunde-se no Conhecimento de Produto e pratique Demonstrações com o time.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div>
                <h4 className="font-semibold mb-1">Semana 5-6: Vendas Consultivas</h4>
                <p className="text-muted-foreground">
                  Estude Vendas Consultivas B2B e pratique com Scripts de Objeções.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                4
              </span>
              <div>
                <h4 className="font-semibold mb-1">Semana 7-8: Negociação e Fechamento</h4>
                <p className="text-muted-foreground">
                  Complete o módulo de Negociação e comece a fechar suas primeiras vendas.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                5
              </span>
              <div>
                <h4 className="font-semibold mb-1">Ongoing: Aprendizado Contínuo</h4>
                <p className="text-muted-foreground">
                  Participe de role-plays semanais, revise materiais e compartilhe aprendizados com o time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
