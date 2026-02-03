# Kenlo Sales Portal - Design Ideas

## Contexto
Portal interno de vendas para equipe comercial da Kenlo, com páginas de produtos (Imob e Locação em 3 níveis: Prime, K, K2), 6 add-ons individuais, página de Kombos e calculadora inteligente de preços.

---

<response>
<text>
## Idea 1: Corporate Tech Brutalism

### Design Movement
Inspirado no Neo-Brutalism digital com toques de design corporativo tech - interfaces com blocos sólidos, contrastes fortes e hierarquia visual clara.

### Core Principles
1. **Blocos de cor sólida** com bordas definidas e sombras hard-edge
2. **Tipografia bold e impactante** para headlines, com corpo limpo
3. **Grid assimétrico** que quebra a monotonia de layouts centralizados
4. **Micro-interações com feedback tátil** - elementos que respondem ao hover

### Color Philosophy
- **Primary**: Magenta vibrante (#FF0066) - energia e urgência de vendas
- **Secondary**: Verde teal (#00D4AA) - sucesso e crescimento
- **Background**: Slate escuro (#0F172A) - profissionalismo e foco
- **Accent**: Amarelo (#FACC15) - destaques e CTAs secundários
- **Neutral**: Cinzas frios para hierarquia de texto

### Layout Paradigm
Sidebar fixa à esquerda para navegação entre produtos, área principal com cards em grid assimétrico. Hero sections com split diagonal entre imagem e conteúdo.

### Signature Elements
1. **Badges de plano** com cantos cortados (clip-path) estilo tech
2. **Progress bars animadas** mostrando comparativo entre planos
3. **Cards com borda gradiente** que pulsa sutilmente no hover

### Interaction Philosophy
Transições rápidas (150-200ms), feedback imediato. Elementos expandem ligeiramente no hover. Scrolls suaves com parallax sutil em backgrounds.

### Animation
- Entrada de cards com stagger (delay sequencial)
- Números da calculadora com animação de contagem
- Transições de página com fade e slide lateral
- Hover states com scale(1.02) e shadow elevation

### Typography System
- **Display**: Space Grotesk Bold para headlines
- **Body**: Inter Regular/Medium para texto
- **Mono**: JetBrains Mono para valores e preços
</text>
<probability>0.08</probability>
</response>

---

<response>
<text>
## Idea 2: Premium SaaS Dashboard

### Design Movement
Inspirado em dashboards SaaS premium como Linear, Vercel e Stripe - minimalismo sofisticado com profundidade através de glassmorphism e gradientes sutis.

### Core Principles
1. **Glassmorphism refinado** com blur e transparência
2. **Gradientes sutis** que criam profundidade sem distrair
3. **Espaçamento generoso** que respira e organiza
4. **Dark mode nativo** com acentos de cor vibrantes

### Color Philosophy
- **Primary**: Rosa/Coral Kenlo (#FF4B5C) - identidade da marca
- **Secondary**: Teal (#00D4AA) - ações positivas e sucesso
- **Background**: Gradiente de #0A0A0F para #1A1A2E - profundidade
- **Surface**: Cards com rgba(255,255,255,0.05) - camadas
- **Glow**: Halos de cor nas interações importantes

### Layout Paradigm
Navegação top horizontal com mega-menu para produtos. Páginas de produto com hero full-width, seguido de seções em container com max-width. Sidebar contextual para filtros na calculadora.

### Signature Elements
1. **Glow effects** em botões e cards importantes
2. **Linhas de conexão animadas** entre produtos relacionados
3. **Badges com gradiente** indicando popularidade ou recomendação

### Interaction Philosophy
Transições fluidas e orgânicas. Estados de hover com glow sutil. Feedback visual rico mas não intrusivo. Animações que guiam o olhar.

### Animation
- Page transitions com crossfade suave
- Cards entram com fade-up e blur
- Números animam com easing spring
- Hover cria halo de luz ao redor do elemento
- Scroll-triggered animations para seções

### Typography System
- **Display**: Plus Jakarta Sans Bold/ExtraBold
- **Body**: Plus Jakarta Sans Regular/Medium
- **Numbers**: Tabular figures para alinhamento em tabelas
</text>
<probability>0.07</probability>
</response>

---

<response>
<text>
## Idea 3: Kenlo Brand Extension

### Design Movement
Extensão direta da identidade visual do site kenloai existente - mantendo consistência total com o ecossistema Kenlo, adaptado para contexto de vendas internas.

### Core Principles
1. **Fidelidade à marca** - mesmas cores, fontes e elementos do kenloai
2. **Hierarquia clara de produtos** - Imob, Locação e Add-ons bem definidos
3. **Foco em conversão** - CTAs claros e jornada de vendas otimizada
4. **Dados em destaque** - preços e comparativos visualmente claros

### Color Philosophy
- **Primary**: Magenta/Rosa (#FF4B5C) - cor principal Kenlo
- **Secondary**: Verde (#00D4AA) - sucesso e ações positivas
- **Background Dark**: #0F172A - profissionalismo
- **Background Light**: #F8FAFC - áreas de conteúdo
- **Accent Yellow**: #FACC15 - destaques especiais

### Layout Paradigm
Header fixo com navegação por produtos (dropdown). Páginas de produto com estrutura: Hero > Features > Planos > Add-ons > CTA. Calculadora como página dedicada com layout de formulário à esquerda e resultado à direita.

### Signature Elements
1. **Logo "kenlo." com ponto verde** - identidade consistente
2. **Cards de produto com ícone e badge de nível** (Prime/K/K2)
3. **Tabela de comparação estilo Kommo** para planos

### Interaction Philosophy
Consistente com o site principal - transições suaves, hover states claros, feedback imediato. Switches e toggles com animação fluida.

### Animation
- Transições de 200-300ms com ease-out
- Cards com hover lift (translateY + shadow)
- Números da calculadora com animação de contagem
- Accordion/collapse com height animation
- Page scroll com reveal animations

### Typography System
- **Display**: Sans-serif bold (Inter ou Plus Jakarta Sans)
- **Body**: Inter Regular/Medium
- **Prices**: Tabular lining figures, bold para destaque
</text>
<probability>0.09</probability>
</response>

---

## Decisão de Design

**Escolha: Idea 3 - Kenlo Brand Extension**

Esta abordagem foi selecionada porque:
1. Mantém consistência com o ecossistema Kenlo existente
2. Facilita reconhecimento da marca pela equipe de vendas
3. Reutiliza padrões visuais já validados
4. Foco em funcionalidade e conversão para contexto de vendas

### Implementação
- Theme: Dark mode como padrão
- Cores: Magenta (#FF4B5C), Verde (#00D4AA), Background (#0F172A)
- Tipografia: Inter para corpo, Plus Jakarta Sans para headlines
- Componentes: Cards, tabelas comparativas, switches, badges de plano
