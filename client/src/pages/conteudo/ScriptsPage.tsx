import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, DollarSign, Clock, Shield, Users, Zap } from "lucide-react";

export default function ScriptsPage() {
  const scriptCategories = [
    {
      title: "Objeções de Preço",
      description: "Como lidar com resistência ao investimento e demonstrar ROI",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      scripts: [
        {
          objection: "\"Está muito caro\"",
          response: "Entendo sua preocupação com o investimento. Vamos olhar juntos: quanto sua imobiliária perde mensalmente por falta de organização, leads não atendidos e processos manuais? Nossos clientes economizam em média 40 horas/mês em processos administrativos. Se considerarmos o custo-hora da sua equipe, o Kenlo se paga rapidamente. Posso mostrar um cálculo de ROI específico para o seu caso?"
        },
        {
          objection: "\"Não tenho budget agora\"",
          response: "Compreendo perfeitamente. O interessante é que o Kenlo pode justamente ajudar a gerar o budget necessário. Temos casos de clientes que aumentaram em 30% a conversão de leads em vendas no primeiro trimestre. Que tal começarmos com o plano Prime, que tem o menor investimento inicial, e você pode escalar conforme os resultados aparecem?"
        },
        {
          objection: "\"O concorrente é mais barato\"",
          response: "Ótimo que você está comparando! A diferença está no que você recebe: Site personalizado incluído, suporte dedicado, integrações nativas com portais, e nossa IA LYA que qualifica leads automaticamente. Quando você soma tudo isso, o Kenlo oferece 3x mais valor pelo investimento. Posso mostrar uma comparação detalhada?"
        }
      ]
    },
    {
      title: "Objeções de Timing",
      description: "Respostas para \"não é o momento certo\" e urgência",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      scripts: [
        {
          objection: "\"Vou pensar e te retorno\"",
          response: "Claro, é uma decisão importante! Para facilitar sua análise, que tal eu preparar um resumo personalizado com os pontos que mais fazem sentido para sua imobiliária? Assim você tem tudo organizado para avaliar. Podemos agendar 15 minutos na próxima semana para eu tirar qualquer dúvida que surgir?"
        },
        {
          objection: "\"Vou implementar no próximo ano\"",
          response: "Entendo o planejamento anual. Mas deixa eu compartilhar algo: cada mês sem o Kenlo representa leads perdidos e processos ineficientes. Se começarmos agora, você fecha o ano com 6 meses de dados e processos otimizados, chegando em 2027 muito mais preparado. Além disso, temos condições especiais para quem inicia ainda este semestre."
        },
        {
          objection: "\"Estou muito ocupado agora\"",
          response: "Justamente por estar ocupado que o Kenlo faz sentido! A implementação é feita pela nossa equipe, você só precisa de 2-3 horas no total. Depois disso, você vai economizar 40+ horas por mês em processos manuais. É um investimento de tempo que se paga na primeira semana."
        }
      ]
    },
    {
      title: "Objeções de Confiança",
      description: "Construindo credibilidade e reduzindo risco percebido",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      scripts: [
        {
          objection: "\"Nunca ouvi falar da Kenlo\"",
          response: "Ótima observação! A Kenlo está há 8 anos no mercado, atendendo mais de 8.500 imobiliárias em 950+ cidades. Somos líderes em tecnologia para o setor imobiliário no Brasil. Posso conectar você com clientes da sua região para você ouvir a experiência deles diretamente?"
        },
        {
          objection: "\"E se não funcionar para mim?\"",
          response: "Entendo a preocupação. Por isso oferecemos implementação guiada e suporte dedicado nos primeiros 90 dias. Além disso, 95% dos nossos clientes renovam anualmente - isso mostra que funciona. Que tal começarmos com um piloto focado na sua maior dor? Se resolver, expandimos. Se não, ajustamos a estratégia."
        },
        {
          objection: "\"Preciso de referências\"",
          response: "Com certeza! Temos cases de sucesso em diversos perfis: imobiliárias pequenas, médias e grandes. Posso compartilhar 3 cases do seu segmento e conectar você com clientes para uma conversa direta. Qual perfil de imobiliária você gostaria de conhecer?"
        }
      ]
    },
    {
      title: "Objeções de Necessidade",
      description: "Demonstrando valor e criando senso de urgência",
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      scripts: [
        {
          objection: "\"Já tenho um sistema\"",
          response: "Ótimo que você já usa tecnologia! Deixa eu perguntar: seu sistema atual tem Site integrado, IA para qualificar leads, assinatura digital e split de pagamento nativos? O Kenlo é uma plataforma completa que elimina a necessidade de 5-6 ferramentas separadas. Posso mostrar uma comparação lado a lado?"
        },
        {
          objection: "\"Minha equipe não vai usar\"",
          response: "Essa é uma preocupação válida. Por isso o Kenlo foi desenhado para ser intuitivo - 80% dos corretores começam a usar sem treinamento. Além disso, oferecemos onboarding completo para a equipe. E aqui está o segredo: quando a ferramenta facilita o trabalho deles (menos planilhas, menos WhatsApp), a adoção é natural."
        },
        {
          objection: "\"Não preciso de tudo isso\"",
          response: "Perfeito! Você não precisa usar tudo de uma vez. Começamos pelo que resolve sua maior dor hoje. Por exemplo, se é organização de leads, focamos nisso. O legal é que conforme sua operação cresce, você já tem as ferramentas prontas para escalar. É como ter um canivete suíço: você usa o que precisa, quando precisa."
        }
      ]
    },
    {
      title: "Objeções de Decisão",
      description: "Navegando processos de decisão e múltiplos stakeholders",
      icon: Users,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      scripts: [
        {
          objection: "\"Preciso falar com meu sócio\"",
          response: "Claro, é uma decisão em conjunto! Que tal eu preparar uma apresentação executiva que você pode compartilhar com ele? Ou melhor ainda: podemos agendar uma call rápida de 20 minutos com vocês dois? Assim eu tiro todas as dúvidas de uma vez e vocês decidem juntos."
        },
        {
          objection: "\"Meu gerente precisa aprovar\"",
          response: "Entendo perfeitamente. Para facilitar a aprovação, posso preparar um business case mostrando ROI, comparação com concorrentes e cases de sucesso? Além disso, se quiser, posso participar da reunião com seu gerente para apresentar e responder perguntas técnicas."
        },
        {
          objection: "\"Vou avaliar outras opções\"",
          response: "Excelente! Avaliar opções é fundamental. Para sua comparação ser completa, preparei um checklist com os 10 critérios essenciais que você deve avaliar em qualquer CRM imobiliário. Assim você compara maçã com maçã. Posso enviar para você?"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Breadcrumbs
          items={[
            { label: "Conteúdo", href: "/conteudo" },
            { label: "Scripts de Objeções" }
          ]}
        />

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Scripts de Objeções</h1>
          </div>
          <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
            Respostas estruturadas para as objeções mais comuns em vendas Kenlo. Use estes scripts 
            como base e personalize de acordo com o contexto de cada cliente.
          </p>
        </div>

        <div className="grid gap-8 mt-12">
          {scriptCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="kenlo-card">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${category.bgColor}`}>
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{category.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.scripts.map((script, scriptIndex) => (
                  <div key={scriptIndex} className="border-l-4 border-primary/30 pl-4 py-2">
                    <h4 className="font-semibold text-lg mb-3 text-foreground">
                      {script.objection}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {script.response}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Dicas para usar os Scripts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                1
              </span>
              <div>
                <h4 className="font-semibold mb-1">Não decore, internalize</h4>
                <p className="text-muted-foreground">
                  Use os scripts como guia, mas adapte ao seu estilo de comunicação e ao contexto do cliente.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </span>
              <div>
                <h4 className="font-semibold mb-1">Escute antes de responder</h4>
                <p className="text-muted-foreground">
                  Entenda a objeção real por trás da frase. Às vezes "está caro" significa "não vi o valor ainda".
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                3
              </span>
              <div>
                <h4 className="font-semibold mb-1">Use dados e cases reais</h4>
                <p className="text-muted-foreground">
                  Sempre que possível, reforce suas respostas com números concretos e exemplos de clientes reais.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                4
              </span>
              <div>
                <h4 className="font-semibold mb-1">Pratique com o time</h4>
                <p className="text-muted-foreground">
                  Role-play com colegas ajuda a internalizar os scripts e descobrir variações que funcionam melhor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
