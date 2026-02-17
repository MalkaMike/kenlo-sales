import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink, Clock, Eye, Users, TrendingUp, Search, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const videos = [
  {
    id: "Q0ZjRo0xoCs",
    title: "Especialização, dados e IA: os novos pilares das imobiliárias de sucesso",
    series: "Kenlo Masters",
    date: "Dez 2025",
    duration: "1h13min",
    guests: "Mickael Malka (CEO Kenlo), Dan Shigenawa (CFO), Nicolas Andrade (Head de Marketing)",
    icon: TrendingUp,
    badgeColor: "bg-primary/10 text-primary",
    badgeText: "ESTRATÉGIA",
    description: "Episódio completo sobre como especialização, dados e IA estão transformando as imobiliárias de sucesso.",
    whyShare: "Ideal para mostrar ao cliente que a Kenlo é liderada por profissionais do mercado financeiro e tecnologia, com visão clara de futuro.",
    keyPoints: [
      "Trajetória do CEO: do banco de investimento ao comando da maior proptech do Brasil",
      "Por que limitar a carteira de imóveis por corretor aumenta eficiência e credibilidade",
      "Taxas de conversão por canal: portais (1,8%) vs site próprio (8,7%) vs placas (melhor conversão)",
      "Site Kenlo otimizado com Neil Patel — SEO que gera leads orgânicos",
      "Data Lake Kenlo + Kenlo Inteligência: BI que analisa performance em tempo real",
      "IA que indica o público ideal para cada imóvel — corretor vira consultor",
      "Distribuição otimizada de leads (Kenlo Leads) aumenta conversão",
    ],
  },
  {
    id: "BKt6JENE9Zo",
    title: "SEO, IA e marca: o novo jogo para ser encontrado e escolhido no mercado imobiliário",
    series: "Kenlo Masters",
    date: "Jan 2026",
    duration: "1h11min",
    guests: "Mickael Malka (CEO Kenlo) + Diego Ivo (CEO Conversion — maior agência de SEO do Brasil)",
    icon: Search,
    badgeColor: "bg-blue-500/10 text-blue-600",
    badgeText: "SEO & MARCA",
    description: "Conversa prática sobre o que muda para quem depende de busca, site e conteúdo com a chegada da IA generativa.",
    whyShare: "Perfeito para clientes que querem entender por que ter site próprio é mais importante do que nunca — e como a Kenlo resolve isso.",
    keyPoints: [
      "Ponto de inflexão: IA e ChatGPT estão mudando como as pessoas buscam imóveis",
      "\"Clique\" deixa de ser a métrica principal — marca é o que converte",
      "Site próprio converte muito melhor que portais (dados reais)",
      "SEO local e long tail: como competir mesmo sendo pequeno",
      "Como se diferenciar quando \"todo mundo anuncia o mesmo imóvel\"",
      "Autoridade de nicho: requisito para aparecer no Google e nas IAs",
      "IA na descrição de imóveis: personalização com toque humano",
    ],
  },
  {
    id: "nG3DHjICVxI",
    title: "A mídia que mais converte no mercado imobiliário não é digital",
    series: "Kenlo Partners",
    date: "Jan 2026",
    duration: "53min",
    guests: "Mickael Malka (CEO Kenlo) + Natã Popping (CEO & Co-Founder Quires)",
    icon: Megaphone,
    badgeColor: "bg-green-500/10 text-green-600",
    badgeText: "CONVERSÃO",
    description: "Primeiro episódio do Kenlo Partners: como a placa imobiliária com QR code inteligente gera leads qualificados direto no CRM.",
    whyShare: "Excelente para clientes que investem em placas — mostra como a Kenlo integra o mundo físico com o digital para máxima conversão.",
    keyPoints: [
      "Dados revelam: a placa imobiliária tem a melhor taxa de conversão entre todas as mídias",
      "Problema: maioria dos leads vem de portais, mas fechamentos vêm de fontes proprietárias",
      "Solução Quires: QR code inteligente na placa → lead qualificado direto no CRM Kenlo",
      "Custo por lead com placa inteligente é menor que portais",
      "QR code único e reutilizável: geolocalização mostra o imóvel correto automaticamente",
      "Métricas em tempo real: quantas pessoas escanearam, de onde, quando",
      "Integração CRM + placa = rastreabilidade completa do lead até o fechamento",
    ],
  },
];

export default function ConteudoPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              Conteúdo para Vendas
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Vídeos que vendem por você
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Assista, aprenda os argumentos-chave e compartilhe com seus clientes. 
              Cada vídeo é uma aula sobre por que a Kenlo é a escolha certa.
            </p>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section className="py-12 pb-20">
        <div className="container">
          <div className="space-y-8 max-w-5xl mx-auto">
            {videos.map((video, index) => (
              <Card key={video.id} className="overflow-hidden border-border/60 hover:border-primary/30 transition-colors">
                <div className="grid lg:grid-cols-5 gap-0">
                  {/* Video Thumbnail */}
                  <div className="lg:col-span-2 relative group cursor-pointer"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover min-h-[200px] lg:min-h-[300px]"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-white fill-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                  </div>

                  {/* Video Details */}
                  <div className="lg:col-span-3">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={video.badgeColor}>
                          {video.badgeText}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{video.series} · {video.date}</span>
                      </div>
                      <CardTitle className="text-lg leading-snug">{video.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        <Users className="w-3 h-3 inline mr-1" />
                        {video.guests}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <p className="text-sm text-muted-foreground">{video.description}</p>
                      
                      {/* Why share */}
                      <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                        <p className="text-xs font-semibold text-primary mb-1">💡 Por que compartilhar com o cliente:</p>
                        <p className="text-xs text-muted-foreground">{video.whyShare}</p>
                      </div>

                      {/* Key Points */}
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2">Pontos-chave do vídeo:</p>
                        <ul className="space-y-1">
                          {video.keyPoints.map((point, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-primary font-bold mt-0.5">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Assistir no YouTube
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
