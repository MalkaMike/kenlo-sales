# Project TODO

## Completed Features
- [x] Portal structure with all main pages
- [x] Kenlo design system applied (Manrope font, colors #F82E52 pink, #4ABD8D green)
- [x] Calculator copied from kenloai project
- [x] Header and navigation implemented
- [x] Fixed nested anchor tag errors
- [x] Reorganized Kenlo Imob and Kenlo Locação into sub-boxes
- [x] Implemented Serviços Premium section with correct pricing logic
- [x] Fixed ortografia "Incluído" com acento

## New Features - PDF Export with Database
- [x] Criar schema do banco de dados para propostas (salvar vendedor, cliente, configurações, preços, data)
- [x] Implementar modal/formulário para capturar nome do vendedor e nome do cliente
- [x] Implementar geração de PDF com todos os detalhes da proposta
- [x] Implementar API tRPC para salvar propostas no banco de dados
- [x] Testar fluxo completo: preencher dados → gerar PDF → salvar no banco

## Mobile Optimization

- [x] Ajustar header e navegação para mobile
- [x] Otimizar seções de seleção de produtos para telas pequenas
- [x] Ajustar cards de add-ons para layout responsivo
- [x] Otimizar inputs e formulários para touch
- [x] Ajustar tabela de preços para mobile (scroll horizontal)
- [x] Otimizar seção "The Kenlo Effect" para mobile
- [x] Ajustar botões de ação para tamanho adequado em touch
- [x] Testar em viewport mobile (375px, 390px, 428px)

## UI Improvements

- [x] Mover barra de resumo de produtos (sticky bar) do topo para o rodapé da calculadora
- [x] Transformar barra em sticky bottom (fixed na parte inferior da tela)

## Sticky Bar Improvements

- [x] Reduzir tamanho da fonte da barra sticky bottom
- [x] Adicionar add-ons selecionados na barra
- [x] Adicionar frequência de pagamento escolhida na barra
- [x] Garantir que todas as escolhas do usuário estejam visíveis

## Kombo Naming System

- [x] Criar lógica de detecção automática de Kombos baseada em produtos/add-ons selecionados
- [x] Implementar descontos específicos por Kombo (10%, 15%, 20%)
- [x] Mostrar nome do Kombo na barra sticky bottom
- [x] Atualizar tabela de preços para indicar qual Kombo está ativo
- [x] Incluir nome do Kombo no PDF gerado
- [x] Salvar nome do Kombo no banco de dados junto com a proposta
- [x] Testar todos os 5 Kombos (Imob Start, Imob Pro, Locação Pro, Core Gestão, Elite)

## Kombo Core Gestão Fix

- [x] Corrigir lógica do Kombo Core Gestão: desconto APENAS na implantação (50% OFF = R$ 1.497 ao invés de R$ 2.994)
- [x] Mensalidades do Kombo Core Gestão devem usar preço normal da tabela (SEM desconto)
- [x] Atualizar descrição do Kombo Core Gestão na barra sticky e documentação

## Payment Frequency Buttons

- [x] Adicionar botão "Mensal (0% - Referência)" aos botões de frequência
- [x] Ajustar layout para 4 botões: Mensal, Semestral, Anual, Bienal
- [x] Atualizar tipo PaymentFrequency para incluir "monthly"
- [x] Testar seleção de frequência mensal

## Price Review and Corrections

- [x] Corrigir preço do K2: R$ 997 → R$ 1.197 (IMOB e LOC)
- [x] Revisar regras de frequência de pagamento (Mensal, Semestral, Anual, Bienal)
- [x] Verificar regra de arredondamento (sempre terminar em 7)
- [x] Revisar preços de add-ons (Inteligência, Leads, Assinatura)
- [x] Revisar custos pós-pago (usuários, contratos, WhatsApp, boletos, split)
- [x] Revisar descontos dos Kombos (10%, 15%, 20%)
- [x] Revisar implantação dos Kombos (R$ 1.497 fixo)
- [x] Testar todos os cálculos com K2 atualizado

## Vendor Dropdown with Autocomplete

- [x] Criar lista de 10 vendedores no código
- [x] Substituir Input de "Nome do Vendedor" por Combobox com autocomplete
- [x] Implementar busca fuzzy para encontrar nomes com erros de digitação
- [x] Testar seleção de vendedor e autocomplete

## Table Layout Fix

- [x] Corrigir layout da box "Sem Kombo" do lado direito para ocupar apenas as últimas 2 colunas
- [x] Garantir que a mensagem "Adicione mais add-ons" fique centralizada nas 2 colunas
- [x] REAL FIX: Mover box "Adicione mais add-ons" para cobrir colunas Mensal+Semestral da seção "Kombo Ativado" (lado direito) em vez de "Sem Kombo" (lado esquerdo)
- [x] REAL REAL FIX: Manter 5 colunas sempre, mas quando não há Kombo, as últimas 2 colunas mostram os mesmos preços "Sem Kombo" (visíveis) e a box overlay cobre essas 2 últimas colunas com a mensagem
- [x] FINAL FIX: Box overlay deve cobrir TODA a área das últimas 2 colunas desde o topo (top-0) incluindo headers "Sem Kombo", "Mensal" e "Anual" até a última linha
- [x] REAL FINAL FIX: Ajustar condição da box overlay de `activeKombo === 'none'` para `Object.values(addons).every(enabled => !enabled)` porque Core Gestão (IMOB+LOC sem add-ons) é um Kombo válido
- [x] CRITICAL FIX: Box overlay está cobrindo a 2ª coluna "Sem Kombo" (frequência escolhida). Deve cobrir APENAS as últimas 2 colunas (Kombo Ativado), deixando AMBAS colunas Sem Kombo visíveis (Mensal + Frequência) - Ajustado de w-[40%] para w-[35%]

## Text Corrections

- [x] Remover "- Cobrança" do título "Kenlo Pay - Cobrança", deixando apenas "Kenlo Pay"

## Dynamic Savings Badge

- [x] Adicionar badge dinâmico de economia no header "Kombo Ativado" mostrando porcentagem de desconto quando há Kombo ativo

## Navigation Menu Updates

- [x] Remover texto "SALES" do menu de navegação
- [x] Alinhar "Kombos" com os outros itens do menu (remover margem extra)
- [x] Remover bandeira "BR" (seletor de idioma)
- [x] Remover botão "Simular Proposta"
- [x] Substituir "Calculadora" por "Monte seu plano"

## Kombos Alignment Fix

- [x] Corrigir alinhamento vertical do item "Kombos" no menu - removido badge "NOVO" que causava desalinhamento

## Premium Services Bug Fix

- [x] BUG: Quando Suporte Premium e CS Dedicado são desativados nos "Planos Recomendados", o Suporte Premium ainda mostra "R$ 99" em vez de "Não Incluído" - corrigido adicionando verificação de isSelected (metrics.imobVipSupport e metrics.locVipSupport)

## Complete Rules Verification and Fixes

### Payment Frequency Rules (Lines 2-10)
- [ ] Mensal → Preço Anual ÷ (1 – 20%) = Preço Anual × 1.25
- [ ] Semestral → Preço Anual ÷ (1 – 10%) = Preço Anual × 1.111...
- [ ] Anual → Preço Anual (reference/default)
- [ ] Bienal → Preço Anual × (1 – 10%) = Preço Anual × 0.9

### Rounding Rule (Lines 18-19)
- [ ] All prices must round UP to next integer ending in 7 (applies to all products/add-ons, all frequencies, NOT for post-paid)

### Add-on Availability (Lines 11-17)
- [ ] Inteligência → available for IMOB and/or LOC
- [ ] Leads → available for IMOB ONLY
- [ ] Assinaturas → available for IMOB and/or LOC
- [ ] Pay → available for LOC ONLY
- [ ] Seguros → available for LOC ONLY
- [ ] Cash → available for LOC ONLY

### Kombo Discounts and Implementation (Lines 374-423)
- [ ] Kombo Imob Start (IMOB + Leads + Assinaturas) → 10% OFF all products/add-ons, R$ 1.497 implementation (Leads impl. free)
- [ ] Kombo Imob Pro (IMOB + Leads + Inteligência + Assinatura) → 15% OFF all, R$ 1.497 impl. (Leads + Inteligência impl. free)
- [ ] Kombo Locação Pro (LOC + Inteligência + Assinatura) → 10% OFF all, R$ 1.497 impl. (Inteligência impl. free)
- [ ] Kombo Core Gestão (IMOB + LOC without add-ons) → "Conforme tabela" discount, R$ 1.497 impl. (IMOB impl. free)
- [ ] Kombo Elite (IMOB + LOC + ALL add-ons) → 20% OFF all, R$ 1.497 impl. (IMOB + Leads + Inteligência impl. free)

### Current Implementation Issues to Fix
- [x] Verify current frequency multipliers match document (Mensal 1.25, Semestral 1.111, Anual 1.0, Bienal 0.9) - VERIFIED CORRECT
- [x] Verify rounding function rounds UP to next number ending in 7 - FIXED (was rounding to nearest, now always UP)
- [x] Verify add-on availability restrictions (Leads IMOB-only, Pay/Seguros/Cash LOC-only) - VERIFIED CORRECT
- [x] Verify Kombo discount percentages (Start 10%, Pro 15%, Locação Pro 10%, Elite 20%) - VERIFIED CORRECT
- [x] Verify "Core Gestão" discount logic ("conforme tabela" - needs clarification) - FIXED (0% discount on monthly, R$ 1.497 fixed impl.)
- [x] Verify implementation costs for all Kombos are R$ 1.497 - VERIFIED CORRECT

## Kombos Page

- [x] Criar página /kombos com galeria visual comparativa dos 5 Kombos
- [x] Implementar cards para cada Kombo mostrando: composição (produtos + add-ons), desconto percentual, implantação, casos de uso ideais
- [x] Adicionar seção hero explicando o conceito de Kombos e benefícios
- [x] Incluir CTA para "Monte seu plano" redirecionando para calculadora
- [x] Rota /kombos já existe no App.tsx

## Core Gestão Premium Services Rule

- [x] Implementar nova regra: Kombo Core Gestão (IMOB + LOC, qualquer plano) inclui automaticamente Serviços Premium (Suporte VIP + CS Dedicado) sem custo adicional
- [x] Atualizar lógica da calculadora para marcar Serviços Premium como "Incluído" quando Core Gestão está ativo
- [x] Atualizar descrição do Kombo Core Gestão na página /kombos para mencionar Serviços Premium incluídos
- [x] Testar cenários: Prime+Prime, K+K, K2+K2, Prime+K, etc. todos devem ter Serviços Premium incluídos - 12 testes passaram

## Correções de Valores dos Serviços Premium e Implantações dos Kombos

- [x] Corrigir valor do Suporte VIP de R$ 99 para R$ 97/mês
- [x] Corrigir valor do CS Dedicado de R$ 99 para R$ 197/mês
- [x] Atualizar descrição dos Kombos com informações corretas de implantação:
  - [x] Kombo Imob Start: Implantação de Leads ofertada (economia de R$ 497)
  - [x] Kombo Imob Pro: Implantação de Leads e Inteligência ofertadas (economia de R$ 994)
  - [x] Kombo Locação Pro: Implantação de Inteligência ofertada (economia de R$ 497)
  - [x] Kombo Core Gestão: Implantação de IMOB ofertada (economia de R$ 1.497)
  - [x] Kombo Elite: Implantação de Imob, Leads e Inteligência ofertadas (economia de R$ 2.491)
- [x] Validar todos os valores com testes automatizados - 28 testes passaram + validação visual completa

## Reorganização da Seção "Informações do Negócio" e Simplificação de Serviços Premium

### Kenlo IMOB - Criar boxes agrupadas:
- [x] Box "Leads" contendo:
  - [x] Leads recebidos por mês
  - [x] IA SDR Externa (Ex: Lais)
  - [x] WhatsApp Integrado
- [x] Box "Serviços Premium" contendo:
  - [x] Suporte VIP
  - [x] CS Dedicado

### Kenlo Locação - Criar boxes agrupadas:
- [x] Box "Kenlo Pay" (já existente, manter como está)
- [x] Box "Serviços Premium" contendo:
  - [x] Suporte VIP
  - [x] CS Dedicado

### Tabela "4. Planos Recomendados":
- [x] Simplificar seção "Serviços Premium" para ter apenas 2 linhas:
  - [x] Suporte VIP (sem -IMOB/-LOC)
  - [x] CS Dedicado (sem -IMOB/-LOC)
- [x] Atualizar lógica de exibição:
  - [x] Se cliente tem 1 produto: mostrar preço (R$ 97 ou R$ 197) ou "Incluído" conforme plano
  - [x] Se cliente tem 2 produtos (IMOB + LOC): mostrar "Incluído" (Kombo Core Gestão)

## Kombo Elite - Serviços Premium Incluídos

- [x] Implementar regra: Kombo Elite (IMOB + LOC + todos add-ons) inclui automaticamente Serviços Premium (Suporte VIP + CS Dedicado) sem custo adicional
- [x] Atualizar lógica da calculadora para marcar Serviços Premium como "Incluído" quando Kombo Elite está ativo
- [x] Atualizar descrição do Kombo Elite na página /kombos para mencionar Serviços Premium incluídos
- [x] Criar testes automatizados para validar Kombo Elite com Serviços Premium incluídos
- [x] Validar com testes e verificação visual - 42 testes passaram + validação visual completa

## Seção "4 bis. Preço Sem Kombo vs Kombo" - Tabela Comparativa

- [x] Projetar estrutura da tabela comparativa:
  - [x] Colunas: Sem Kombo, Imob Start, Imob Pro, Locação Pro, Core Gestão, Elite
  - [x] Linhas: Produtos (IMOB, LOC), Add-ons (Leads, Inteligência, Assinatura, Pay, Seguros, Cash), Serviços Premium (Suporte VIP, CS Dedicado), Total Mensal, Implantação, Anual Equivalente
  - [x] Toggle Mensal/Anual para alternar visualização
- [x] Implementar cálculo de preços para todos os Kombos baseado nas escolhas do usuário
- [x] Implementar lógica de highlight automático do Kombo recomendado
- [x] Implementar UI da tabela comparativa com design responsivo
- [x] Validar com testes e verificação visual - 67 testes passaram
- [ ] Apresentar ao usuário para aprovação (se aprovado, substituir seção 4 atual)

## Mostrar valores para todos os Kombos (mesmo não aplicáveis)
- [x] Remover lógica que esconde valores de Kombos não aplicáveis
- [x] Mostrar preços de todos os Kombos sempre, permitindo comparação hipotética
- [x] Manter highlight apenas no Kombo recomendado (Elite com badge "Recomendado" e 20% OFF)

## Atualizar seletor de frequência na seção 4 bis
- [x] Substituir toggle Mensal/Anual por 4 cards: Mensal (0% - Referência), Semestral (-15%), Anual (-20%), Bienal (-25%)
- [x] Centralizar cards acima da tabela
- [x] Usar visual de cards com borda arredondada, card selecionado com fundo rosa claro e borda rosa
- [x] Espalhar cards uniformemente na largura da tabela

## Mudança de conceito de frequência
- [x] Mudar Anual para ser a referência (0%), Mensal (+25%), Semestral (+10%), Bienal (-10%)

## Correção de Recomendação de Kombos
- [x] Corrigir lógica: IMOB + Leads + Assinatura deve recomendar "Imob Start" (não "Sem Kombo")
- [x] Verificar todas as combinações de Kombos estão sendo detectadas corretamente

## Seleção Automática do Melhor Plano
- [x] Implementar lógica para recomendar Prime/K/K2 baseado no número de usuários (IMOB)
- [x] Implementar lógica para recomendar Prime/K/K2 baseado no número de contratos (LOC)
- [x] Considerar custo total: mensalidade + usuários/contratos adicionais
- [x] Mostrar plano recomendado em vermelho/rosa (ex: "Imob - K")

## Atualização de Preços IMOB (Fev 2026)
- [x] Atualizar preços base: Prime R$247, K R$497, K2 R$1.197
- [x] Atualizar usuários inclusos: Prime 2, K 7, K2 15
- [x] Implementar cálculo de usuários adicionais por faixas:
  - Prime: R$57 fixo por usuário
  - K: 1-10 = R$47, 11+ = R$37
  - K2: 1-10 = R$47, 11-50 = R$37, 51+ = R$27
- [x] Atualizar lógica de seleção automática do melhor plano com novos preços

## Correção Regras dos Kombos (Fev 2026)
- [x] Imob Start: NÃO inclui VIP/CS Dedicado (cliente paga à parte)
- [x] Imob Pro: INCLUI VIP + CS Dedicado
- [x] Locação Pro: INCLUI VIP + CS Dedicado
- [x] Core Gestão: INCLUI VIP + CS Dedicado
- [x] Elite: INCLUI VIP + CS Dedicado
- [x] Triple check: revisar todos os cálculos e regras

## Kenlo Effect - Visibilidade Condicional
- [x] Esconder seção Kenlo Effect quando não houver receitas (Pay, Seguros, etc.)

## Tooltips nos Headers dos Kombos
- [x] Adicionar tooltips com informações detalhadas em cada header de Kombo
- [x] Incluir: produtos incluídos, desconto, serviços premium, implantação

## PDF Orçamento Profissional
- [x] Renomear PDF para "Orçamento"
- [x] Redesign completo com identidade visual Kenlo (rosa/magenta)
- [x] Layout limpo e profissional (1 página)
- [x] Incluir todas as informações da simulação organizadas
- [x] Adicionar logo Kenlo e cabeçalho elegante
- [x] Adicionar rodapé com informações de contato

## Redesenho Páginas de Produtos
### Kenlo IMOB
- [x] Criar tabela de preços detalhada com formato ✔/✘
- [x] Incluir: Preços mensais (Prime R$247, K R$497, K2 R$1.197)
- [x] Incluir: Taxa de implantação (R$1.497)
- [x] Incluir: Usuários inclusos (Prime 2, K 7, K2 15)
- [x] Incluir: Features (CRM, App Corretor, Landing Page, Blog, Treinamentos, API)
- [x] Incluir: Serviços Premium (Suporte VIP, CS Dedicado)
- [x] Incluir: Usuários adicionais por faixas

### Kenlo Locação
- [x] Criar tabela de preços detalhada com formato ✔/✘
- [x] Incluir: Preços mensais e features específicas de locação
- [x] Incluir: Contratos inclusos e adicionais por faixas
- [x] Incluir: Kenlo Pay (Boletos/Split inclusos e pós-pago)
- [x] Incluir: Kenlo Seguros (comissões 35%/40%/45%)
- [x] Incluir: Funcionalidades Básicas, Avançadas e Exclusivas K2

## Redesenho Páginas de Add-ons
### Kenlo Inteligência
- [x] Criar página com tabela de preços detalhada
- [x] Incluir: Licença R$297/mês, Implantação R$497
- [x] Incluir: Features (Relatórios, Preço m², Safra, Comparação mercado, Explorer)
- [x] Indicar compatibilidade com IMOB e LOC

### Kenlo Leads
- [x] Criar página com tabela de preços detalhada
- [x] Incluir: Licença R$497/mês, Implantação R$497
- [x] Incluir: Leads WhatsApp (150/mês inclusos)
- [x] Incluir: Leads adicionais por faixas (R$2,00 a R$1,20)
- [x] Indicar integração com IA (parceiro homologado)

### Kenlo Assinatura
- [x] Criar página com tabela de preços detalhada
- [x] Incluir: Licença R$37/mês, Implantação grátis
- [x] Incluir: 20 assinaturas inclusas/mês
- [x] Incluir: Assinaturas adicionais por faixas (R$1,80 a R$1,50)
- [x] Incluir: Validação biométrica facial R$7,00

## Redesenho Página de Kombos
- [x] Criar design visualmente impactante e não repetitivo
- [x] Usar formato de tabela comparativa com ✔/✘ como IMOB/Locação
- [x] Mostrar claramente o que cada Kombo inclui
- [x] Destacar descontos e economia de cada Kombo
- [x] Incluir serviços premium (VIP/CS) incluídos
- [x] Mostrar implantação única de R$1.497 para todos
- [x] Adicionar CTAs claros para calculadora

## Renomear para "Orçamento" e Corrigir Menu
- [x] Corrigir alinhamento do menu de navegação
- [x] Renomear "Monte seu plano" para "Orçamento" no menu
- [x] Renomear "Calculadora" para "Orçamento" em todo o site
- [x] Atualizar todos os CTAs e links que mencionam "calculadora" ou "monte seu plano"

## Página Kenlo Pay
- [x] Criar página com tabela de preços detalhada
- [x] Incluir: Preços por Boleto (Prime R$4, K faixas, K2 faixas)
- [x] Incluir: Preços por Split (Prime R$4, K faixas, K2 faixas)
- [x] Incluir: Exemplos de cálculo para cada plano
- [x] Indicar que é exclusivo para Kenlo Locação
- [x] Adicionar CTAs para Kombos e Orçamento

## URL Compartilhável para Propostas
- [x] Criar função para codificar todos os parâmetros da proposta em URL
- [x] Parâmetros a incluir: produto (imob/loc/both), planos (prime/k/k2), add-ons, frequência
- [x] Parâmetros numéricos: usuários, contratos, leads, fechamentos, novos contratos
- [x] Parâmetros de serviços premium: VIP, CS Dedicado
- [x] Parâmetros de Pay: boleto, split, valores de cobrança
- [x] Implementar leitura de parâmetros da URL ao carregar a página
- [x] Pré-preencher todos os campos com valores da URL
- [x] Adicionar botão "Copiar Link" ao lado do botão "Exportar PDF"
- [x] Mostrar toast de confirmação quando link for copiado
- [x] Testar fluxo completo: gerar link → abrir em nova aba → verificar valores

## Correção de Alinhamento do Menu
- [x] Corrigir alinhamento vertical do item "Orçamento" no menu de navegação

## Sistema de Histórico de Orçamentos
- [x] Criar tabela 'quotes' no banco de dados com campos:
  - id, createdAt, product, imobPlan, locPlan, frequency
  - addons (JSON), metrics (JSON), totals (JSON)
  - action (link_copied | pdf_exported), shareableUrl
- [x] Criar procedimento tRPC para salvar orçamento
- [x] Criar procedimento tRPC para listar orçamentos
- [x] Integrar salvamento automático ao copiar link
- [x] Integrar salvamento automático ao exportar PDF
- [x] Criar página /historico para consultar orçamentos salvos
- [x] Adicionar link para histórico no menu ou na calculadora
- [x] Testar fluxo completo de salvamento e consulta

## Esconder Histórico do Menu Público
- [x] Remover link "Histórico" do menu desktop
- [x] Remover link "Histórico" do menu mobile
- [x] Manter rota /historico funcionando (URL oculta para vendedores)

## Otimização Mobile-Friendly
- [ ] Homepage: Ajustar hero, stats, cards de produtos e add-ons para mobile
- [ ] Página Imob: Tabelas de preços responsivas, cards empilhados em mobile
- [ ] Página Locação: Tabelas de preços responsivas, cards empilhados em mobile
- [ ] Páginas Add-ons (6): Tabelas responsivas, layout adaptado para telas pequenas
- [ ] Página Kombos: Tabela comparativa com scroll horizontal ou cards em mobile
- [ ] Calculadora: Formulários e tabela de comparação adaptados para mobile
- [ ] Histórico: Tabela responsiva com scroll ou cards em mobile
- [ ] Testar todas as páginas em viewport 375px (iPhone SE)

## Correção de Preços do Kenlo Leads
- [x] Corrigir faixas de preços por lead adicional via WhatsApp:
  - 1-200 leads: R$2,00/lead
  - 201-350 leads: R$1,80/lead
  - 351-1000 leads: R$1,50/lead
  - Acima de 1000 leads: R$1,20/lead
- [x] Verificar página LeadsPage.tsx (já estava correto)
- [x] Verificar cálculos na CalculadoraPage.tsx (corrigido de 2.5/2.0 para 2.0/1.8)
- [x] Verificar componente KomboComparisonTable.tsx (não tem cálculo pós-pago)
- [x] Testar cálculos com diferentes quantidades de leads

## Melhorias na Seleção de Kombos e Formulário de Export
- [x] Mudar texto "Recomendado" para "Selected" na tabela de Kombos
- [x] Tornar todos os Kombos clicáveis para seleção manual
- [x] Criar formulário de informações obrigatórias com campos:
  - Nome do vendedor (obrigatório)
  - Nome da imobiliária (obrigatório)
  - Nome do proprietário (obrigatório)
  - Celular (obrigatório se telefone não preenchido)
  - Telefone fixo (obrigatório se celular não preenchido)
  - URL do site atual ou opção "Cliente não tem site ainda"
- [x] Integrar formulário antes de exportar PDF
- [x] Integrar formulário antes de copiar URL
- [x] Validar que pelo menos um telefone (celular ou fixo) está preenchido
- [x] Salvar informações do formulário no histórico de orçamentos
- [ ] Testar fluxo completo de export com validação

## Correções no Formulário de Informações
- [x] Corrigir validação: apenas um telefone (celular OU fixo) é obrigatório, não ambos
- [x] Transformar campo "Nome do vendedor" em dropdown com lista de vendedores
- [x] Lista de vendedores: AMANDA DE OLIVEIRA MATOS, BRUNO RIBEIRO DA SILVA, CASSIA MOREIRA BARBOSA, EMERSON DE MORAES, IVAN KERR CODO, JAQUELINE SILVA GRANELLI, LARISSA BRANDALISE FAVI, MARINA KIYOMI YOKOMUN, YR MADEIRAS DE GASPERIN, ROBERTA PACHECO DE AZEVEDO

## Melhorias na Página de Histórico
- [x] Adicionar colunas para exibir: vendedor, imobiliária, telefones, site
- [x] Implementar filtros por data (range de datas)
- [x] Implementar filtro por nome do cliente
- [x] Implementar filtro por nome do vendedor
- [x] Adicionar procedimento tRPC para deletar orçamento
- [x] Adicionar botão de deletar em cada linha da tabela
- [x] Implementar modal de confirmação antes de deletar
- [x] Atualizar lista após deletar sem recarregar a página

## Remover Diálogo Duplicado de Exportar PDF
- [x] Remover ProposalExportDialog da CalculadoraPage.tsx
- [x] Remover estado e funções relacionadas ao diálogo antigo
- [x] Manter apenas QuoteInfoDialog para todas as ações (PDF e link)

## Implementar Geração de PDF com QuoteInfoDialog
- [x] Adicionar lógica de geração de PDF no callback do QuoteInfoDialog quando actionType === "pdf"
- [x] Calcular todos os totais necessários (monthly, annual, implantation, postPaid)
- [x] Chamar generatePDF.mutateAsync com todos os dados do formulário
- [x] Salvar no banco de dados (quotes e proposals)
- [x] Fazer download automático do PDF gerado
- [x] Testar fluxo completo de exportar PDF

## Exportar Histórico para Excel
- [x] Adicionar botão "Exportar para Excel" na página de histórico
- [x] Implementar função para gerar planilha Excel com dados filtrados
- [x] Incluir todas as colunas: data, ação, produto, planos, Kombo, frequência, valores, vendedor, cliente, imobiliária, telefones, site
- [x] Usar biblioteca xlsx ou similar para geração do arquivo
- [x] Testar exportação com diferentes filtros aplicados

## Gráficos Analíticos no Histórico
- [x] Instalar biblioteca recharts para visualização de dados
- [x] Criar gráfico de barras: orçamentos por vendedor
- [x] Criar gráfico de pizza: distribuição por produto (Imob/Locação/Ambos)
- [x] Criar gráfico de linha: orçamentos ao longo do tempo (por dia/semana/mês)
- [x] Criar gráfico de barras: valor total de propostas por vendedor
- [x] Adicionar seção de analytics na página de histórico
- [x] Aplicar filtros aos gráficos (mesmos filtros da tabela)
- [x] Testar visualizações com diferentes conjuntos de dados

## Redesign Completo da Homepage
- [x] Criar hero section impactante com gradiente animado e call-to-action destacado
- [x] Adicionar seção de estatísticas (8.500+ imobiliárias, 40.000+ corretores, etc.)
- [x] Criar seção de produtos core (Imob e Locação) com cards visuais
- [x] Adicionar seção de add-ons em grid com ícones e descrições
- [x] Criar seção de Kombos com destaque visual
- [x] Adicionar seção de depoimentos/social proof (placeholder para vídeos futuros)
- [x] Implementar animações suaves e transições
- [x] Garantir responsividade perfeita em mobile
- [x] Adicionar CTAs estratégicos ao longo da página
- [x] Testar experiência visual completa

## Atualização de Título - Custos Pós-Pago
- [x] Atualizar título da seção "5. Custos Pós-pago (Variáveis)" para "Custos Pós-Pago - Sem surpresas, só o que você usar"

## Atualização de Estatísticas - Homepage
- [x] Atualizar "R$8B+ Em vendas" para "R$40B+ Em vendas"
- [x] Adicionar nova estatística "R$1,2B+ Gestão de locação"

## Remover Trust Indicators Falsos
- [x] Remover seção de trust indicators (Sem taxa de setup, Migração gratuita, Suporte 24/7) da hero section da homepage

## Atualização: 3 Soluções em 1 Plataforma
- [x] Atualizar headline principal para "3 soluções. 1 plataforma única. Infinitas possibilidades."
- [x] Adicionar Site/CMS como terceira solução na seção de produtos
- [x] Atualizar descrição geral para incluir CRM, Site/CMS e App como pilares
- [x] Reorganizar seção de produtos para mostrar as 3 soluções de forma clara

## Adicionar Estatística de Visitantes
- [x] Adicionar "10M+ Visitantes únicos por mês" com ícone Eye à seção de estatísticas

## Reorganizar Add-ons em Categorias
- [x] Separar add-ons em 2 grupos: IMOB Add-ons e LOC Add-ons
- [x] Adicionar subtotais para cada categoria de add-ons
- [x] Melhorar visualização da seção de custos pós-pago

## Comparação Visual de Planos
- [x] Criar componente de comparação lado a lado (Prime, K, K2)
- [x] Mostrar impacto de cada plano nos custos de add-ons
- [x] Integrar comparação na calculadora

## Mover Comparação de Planos para Páginas de Produtos
- [x] Remover comparação de planos da calculadora
- [x] Adicionar comparação na página Kenlo Imob (Usuários Adicionais, Assinatura, Leads)
- [x] Adicionar comparação na página Kenlo Locação (Contratos Adicionais, Assinatura, Boletos, Split)

## Corrigir Categorização de Add-ons e Condensar Tabela
- [x] Remover Assinatura da página Kenlo Imob (é add-on compartilhado)
- [x] Manter apenas Usuários Adicionais e Leads na comparação Imob
- [x] Remover Assinatura da página Kenlo Locação (é add-on compartilhado)
- [x] Manter apenas Contratos Adicionais, Boletos e Split na comparação Locação
- [x] Condensar visualmente a tabela de comparação (reduzir padding, fonte menor, layout mais compacto)

## Adicionar Seção de Add-ons Compartilhados
- [x] Adicionar seção "Add-ons Compartilhados (IMOB e LOC)" na calculadora
- [x] Incluir Assinatura Digital nesta seção
- [x] Posicionar entre IMOB Add-ons e LOC Add-ons

## Implementar Recomendação Automática de Plano
- [x] Criar função que calcula custo total (mensalidade + add-ons) para cada plano (Prime, K, K2)
- [x] Implementar lógica de seleção automática baseada em capacidade (não custo)
- [x] Aplicar para IMOB: Prime (até 7), K (8-15), K2 (16+)
- [x] Aplicar para LOC: Prime (até 200), K (201-500), K2 (501+)
- [x] Testar cenário: 20 usuários IMOB deve recomendar K2

## Indicador Visual de Plano Recomendado e Recomendação de Kombos
- [x] Adicionar badge "Plano Recomendado" no plano selecionado automaticamente
- [x] Mostrar explicação de por que o plano foi recomendado (ex: "Melhor para 20 usuários")
- [x] Implementar lógica de cálculo de custo total para cada Kombo disponível
- [x] Recomendar automaticamente o Kombo com melhor custo-benefício
- [x] Mostrar sugestão de Kombo na interface quando aplicável

## Reorganizar Seção de Custos Pós-Pago com Subtotais nos Headers
- [x] Mover subtotais de IMOB Add-ons para o header da seção
- [x] Mover subtotais de LOC Add-ons para o header da seção
- [x] Mover subtotais de Add-ons Compartilhados para o header da seção
- [x] Remover repetição de "(IMOB)" e "(LOC)" dos nomes dos add-ons (já está claro pela seção)
- [x] Manter Total Pós-pago no final

## Melhorar Contraste das Cores dos Headers de Subtotais
- [x] Aumentar intensidade da cor azul do header "IMOB Add-ons" para melhor visibilidade
- [x] Aumentar intensidade da cor rosa do header "LOC Add-ons" para melhor visibilidade
- [x] Aumentar intensidade da cor roxa do header "Add-ons Compartilhados" para melhor visibilidade
- [x] Validar visualmente que as cores têm contraste adequado com o fundo branco

## Correções e Redesign na Homepage
- [x] Remover badge "Portal de Vendas Kenlo" da seção hero (elemento inútil)
- [x] Redesenhar título hero para ficar em uma linha com melhor hierarquia visual
- [x] Adicionar background escuro/destaque nos números para melhor contraste
- [x] Adicionar ponto entre "única" e "Infinitas" no título hero

## Ajustar Layout de Estatísticas na Homepage
- [x] Modificar grid de estatísticas para exibir todos os 5 itens em uma única linha horizontal
- [x] Ajustar tamanho dos elementos para caber em uma linha sem quebra

## Animação de Contagem nas Estatísticas
- [x] Criar hook useCountUp para animar números de 0 até o valor final
- [x] Implementar Intersection Observer para detectar quando a seção entra na viewport
- [x] Integrar animação na seção de estatísticas da homepage
- [x] Testar animação em diferentes velocidades de scroll

## Micro-Interações nos Cards de Produtos e Add-ons
- [x] Adicionar efeito lift (elevação) nos cards ao hover com transform translateY
- [x] Adicionar efeito glow (brilho) nos cards ao hover com box-shadow colorido
- [x] Implementar transições suaves para os efeitos (duration 300-400ms)
- [x] Testar efeitos em todos os cards (produtos e add-ons)

## Ajustar Tamanho de Fonte e Cores das Estatísticas
- [x] Reduzir tamanho da fonte dos números (de text-4xl/5xl para text-3xl/4xl)
- [x] Adicionar cores diferentes para cada estatística (azul, roxo, verde, laranja, rosa)
- [x] Manter cores nos ícones correspondentes
- [x] Testar legibilidade e contraste visual

## Corrigir Erro de Inicialização na Calculadora
- [x] Investigar erro "Cannot access 'getLineItems' before initialization" no CalculadoraPage.tsx
- [x] Identificar referência circular ou ordem incorreta de declaração
- [x] Corrigir ordem de declaração das funções
- [x] Testar a calculadora para garantir que o erro foi resolvido

## Corrigir Erro de Dependências de Funções na Calculadora
- [x] Identificar todas as funções e suas dependências no CalculadoraPage.tsx
- [x] Reorganizar funções na ordem correta: utilitárias (calculateMonthlyReference, calculatePrice, roundToEndIn7) → dados (getLineItems, detectKombo) → lógica (recommendBestKombo, calculateTotalImplementation)
- [x] Testar calculadora para garantir que não há mais erros de inicialização

## Corrigir Lógica de WhatsApp, Renomear Coluna e Ajustar Recomendação
- [x] Desabilitar toggle de WhatsApp quando não há add-ons de Leads ou IA SDR Externa selecionados
- [x] Renomear coluna "Sem Kombo" para "Sua Seleção (Sem Kombo)" na tabela de preços
- [x] Implementar lógica: quando NÃO há Kombo aplicável, "Sua Seleção (Sem Kombo)" é o recomendado
- [x] Implementar lógica: quando HÁ Kombo aplicável, o Kombo detectado é o recomendado
- [x] Badge "Recomendado" deve aparecer apenas na coluna recomendada (Kombo OU Sua Seleção)
- [x] Sticky bar sempre mostra a opção recomendada (Kombo ou Sua Seleção)
- [x] Testar cenário: "Imob só" sem add-ons → WhatsApp desabilitado + "Sua Seleção" recomendada
- [x] Testar cenário: "Imob + Loc" + todos add-ons → "Elite" recomendado

## Corrigir Lógica de WhatsApp e Serviços Premium
- [ ] Corrigir lógica de WhatsApp: deve estar desabilitado quando IA SDR Externa está OFF, mesmo que Leads esteja preenchido
- [ ] Nova regra WhatsApp: habilitado apenas quando (Leads > 0 OU Leads preenchido) E (IA SDR Externa ON)
- [ ] Desabilitar Serviços Premium (Suporte VIP + CS Dedicado) quando configuração não justifica serviço premium
- [ ] Definir critérios para habilitar Serviços Premium (ex: múltiplos add-ons, planos específicos, ou configurações complexas)
- [ ] Testar cenário reportado: "Imob só" + 300 Leads + IA SDR OFF → WhatsApp deve estar desabilitado
- [ ] Testar cenário reportado: "Imob só" + 300 Leads + IA SDR OFF → Serviços Premium devem estar desabilitados

## Correção de Desconto de Kombo em Assinatura
- [x] Corrigir desconto de Kombo não sendo aplicado em Assinatura (e verificar todos os add-ons)
- [x] Verificar que TODOS os add-ons (Leads, Inteligência, Assinatura, Pay, Seguros, Cash) aplicam desconto corretamente
- [x] Testar todos os Kombos: Imob Start (10%), Imob Pro (15%), Locação Pro (10%), Elite (20%)
- [x] Validar valores esperados: Assinatura base R$37 → Imob Start R$33, Imob Pro R$31, etc.

## Badge Verde nos Serviços Premium
- [ ] Adicionar badge verde "Ofertado" ou "Incluído" ao lado do toggle de Suporte VIP quando incluído no plano (K ou K2)
- [ ] Adicionar badge verde "Ofertado" ou "Incluído" ao lado do toggle de CS Dedicado quando incluído no plano (K2)
- [ ] Badge deve aparecer apenas quando o serviço é incluído, não quando é opcional pago (Prime)
- [ ] Testar todos os cenários: Prime (sem badge), K (VIP com badge), K2 (VIP e CS com badge)

## Validação de Entrada em Campos Numéricos
- [x] Implementar validação para prevenir valores zero ou negativos em todos os campos numéricos
- [x] Campos validados: Número de usuários (min=1), Fechamentos (min=0), Leads por mês (min=0), Contratos (min=1), Novos contratos (min=0), Boleto (min=0), Split (min=0)
- [x] Valores mínimos definidos e aplicados via Math.max() e atributo HTML min
- [x] Corrigido conflito de id entre toggle e input de Leads (renomeado para leadsPerMonth)
- [x] Testado comportamento com valores zero e negativos - validação funciona corretamente

## UX de Seleção de Plano (Opção A)
- [x] Adicionar estado `selectedPlan` para armazenar qual coluna está selecionada (null | "sua-selecao" | "imob-start" | "imob-pro" | etc.)
- [x] Adicionar botão "Selecionar Este Plano" no rodapé de cada coluna da tabela de Kombos
- [x] Coluna "Sua Seleção": botão "Selecionar Personalizado"
- [x] Colunas dos Kombos: botão "Selecionar [Nome do Kombo]"
- [x] Adicionar destaque visual na coluna selecionada: borda verde grossa (4px) + sombra + background verde claro
- [x] Adicionar badge "✓ SELECIONADO" no topo da coluna ativa
- [x] Implementar botões "Exportar Proposta (PDF)" e "Copiar Link para Cliente" que aparecem apenas após seleção
- [x] Botões de ação aparecem após a seção "The Kenlo Effect" com mensagem de confirmação verde
- [x] Permitir trocar seleção clicando em outra coluna (remove destaque da anterior)
- [x] Testar fluxo completo: configurar → selecionar coluna → ver destaque + badge → botões aparecem → gerar PDF/URL

## Correção de Scroll Horizontal na Tabela de Kombos
- [x] Investigar por que a tabela está causando scroll horizontal (largura das colunas aumentada?)
- [x] Reverter para largura original que funcionava sem scroll
- [x] Reduzir largura da primeira coluna: 180px → 140px (-40px)
- [x] Reduzir largura das colunas de Kombos: 130px → 110px (-20px cada)
- [x] Reduzir padding horizontal: px-3 → px-2
- [x] Testar em tela padrão - tabela agora cabe perfeitamente sem scroll
- [x] Garantir que todas as 6 colunas cabem na tela sem scroll

## Eliminar Scroll Horizontal Persistente
- [x] Reduzir ainda mais a largura das colunas da tabela (primeira coluna 140px→12px, Kombos 110px→95px)
- [x] Reduzir padding horizontal (px-2→px-1)
- [x] Reduzir largura mínima da tabela (900px→750px)
- [x] Testar em resolução padrão - scroll horizontal completamente eliminado
- [x] Validar que todo o conteúdo ainda é legível após redução


## UX Improvements - Badges e Botões de Seleção
- [x] Separar badge "Recomendado" (fixo, baseado em lógica) do badge "Selecionado" (escolha do usuário)
- [x] Badge "Recomendado" deve permanecer fixo na coluna recomendada mesmo quando usuário seleciona outra
- [x] Mover botões de seleção para logo após a linha de cabeçalho com badges de desconto
- [x] Renomear texto dos botões de seleção para algo mais curto (ex: "Selecionar" em vez de "Selecionar Imob Start")


## Feedback Equipe (Fev 2026) - Valorização do Site e Benefícios

### Precificação Site Kenlo Standalone
- [ ] Criar precificação pública do Site Kenlo standalone: R$ 249/mês + R$ 1.497 implantação
- [ ] Site standalone pode ser vendido separadamente para clientes que não usam CRM Kenlo
- [ ] Quando cliente usa CRM, Site é "Incluído" (não "grátis") - mostrar valor agregado

### Seção "Benefícios Incluídos" na Calculadora
- [ ] Adicionar seção destacando todos os benefícios incluídos no pacote CRM
- [ ] Listar: Site (R$ 249/mês valor), Blog, Landing Page, Hospedagem
- [ ] Listar: Quantidade de e-mails inclusos, Radar de parcerias da comunidade, App Kenlo
- [ ] Usar termo "Incluído" em vez de "Grátis" para manter percepção de valor

### Proposta PDF - Dados do Vendedor
- [x] Incluir dados completos do vendedor na proposta PDF: e-mail, telefone, cargo
- [x] Adicionar campos no formulário de geração de proposta para capturar esses dados

### Modelo "Pague Só o Que Usa"
- [x] Destacar na calculadora o conceito "Na Kenlo, você paga só o que você usa"
- [x] Adicionar explicação clara sobre modelo de cobrança: mensalidade fixa + variável por uso
- [x] Garantir que usuários/contratos adicionais são sempre pós-pago (nunca incluídos no plano anual)


## Melhorias Adicionais (Fev 2026)

### Seção Benefícios Incluídos na Calculadora
- [x] Adicionar seção visual "Benefícios Incluídos" na interface da calculadora (não só no PDF)
- [x] Mostrar: Site (R$ 249/mês valor), Blog, Landing Page, Hospedagem
- [x] Mostrar: E-mails corporativos, Radar de parcerias, App Kenlo
- [x] Usar design destacado (verde) similar ao PDF

### Precificação Site Kenlo Standalone
- [x] Criar página/seção para Site Kenlo como produto standalone
- [x] Preço: R$ 249/mês + R$ 1.497 implantação
- [x] Pode ser vendido separadamente para clientes sem CRM
- [x] Quando cliente usa CRM, Site é "Incluído" (não "grátis")

### Correção Lógica WhatsApp
- [x] Corrigir lógica: WhatsApp desabilitado quando IA SDR Externa está OFF
- [x] Nova regra: WhatsApp habilitado apenas quando IA SDR Externa ON
- [x] Testar cenário: Leads preenchido + IA SDR OFF → WhatsApp desabilitado


## Bug Fix - Métricas Incorretas (Fev 2026)

### WhatsApp Leads
- [x] Corrigir: WhatsApp inclusos de 150 para **100** (conforme documento)
- [x] Verificar faixas de preço adicional WhatsApp: 1-200: R$2,00, 201-350: R$1,80, 351-1000: R$1,50, 1000+: R$1,20

### Assinaturas
- [x] Verificar: Assinaturas inclusas = 15/mês (conforme documento)
- [x] Verificar faixas: 1-20: R$1,80, 21-40: R$1,70, 41+: R$1,50

### Kenlo Pay - Boleto/Split
- [x] Verificar preços por faixa para cada plano (Prime fixo R$4, K/K2 por faixas)

### Contratos Adicionais
- [ ] Verificar preços por faixa para cada plano

### Usuários IMOB
- [x] Verificar: Prime=2, K=7, K2=14 (documento diz 14, não 15)


## Alterações Solicitadas (Fev 2026 - Batch 2)

### Remover Seção Benefícios Incluídos
- [x] Remover box verde "Benefícios Incluídos no Seu Plano" da calculadora

### Trocar Orçamento por Cotação
- [x] Substituir "Orçamento" por "Cotação" em todo o site
- [x] Substituir "Orçamento" por "Cotação" no PDF gerado
- [x] Atualizar botões, títulos, labels e textos

### Remover Menções de Parcelamentos
- [x] Remover todas as menções de parcelamentos do site (não havia nenhuma)
- [x] Remover lógica de parcelamento do código (não havia nenhuma)

### Remover Link de Copiar URL
- [x] Remover botão/funcionalidade de copiar URL para cliente
- [x] Limpar código relacionado a compartilhamento de URL

### Renomear Kenlo Effect
- [x] Renomear "The Kenlo Effect" para "Kenlo Receita Extra"
- [x] Atualizar em todas as ocorrências (calculadora, PDF, etc.)

### Corrigir Preço Boleto/Split Prime LOC
- [x] Verificar e corrigir: Prime LOC Boleto/Split já estava correto em R$4


## Bug Fix - Contratos Inclusos LOC (Fev 2026)
- [x] Corrigir contratos inclusos plano K: 250 → 200 (conforme documento oficial)


## Validação Completa de Métricas (Fev 2026)
- [x] Assinaturas tier1: R$1,90 → R$1,80 (6 ocorrências corrigidas)
- [x] LocacaoPage Boletos K2: 10 → 15
- [x] LocacaoPage Split K2: 10 → 15
- [x] AssinaturaPage assinaturas inclusas: 20 → 15


## Sistema de Autenticação para Vendedores (Fev 2026)

### Banco de Dados
- [x] Criar tabela de vendedores (salespeople) com nome, email, telefone
- [x] Normalizar telefones para formato brasileiro (XX) XXXXX-XXXX
- [x] Popular tabela com 11 vendedores da lista

### Autenticação
- [x] Login por email + senha fixa (KenloLobos2026!)
- [x] Sessão com localStorage que expira diariamente (meia-noite)
- [x] Redirecionar usuários não autenticados para página de login

### Proteção de Páginas
- [x] Página /calculadora (cotação) requer autenticação
- [x] Todas as outras páginas públicas (sem login)
- [x] Criar página de login com design consistente

### PDF com Dados do Vendedor
- [x] Remover campos manuais de nome/email/telefone do vendedor
- [x] Injetar automaticamente dados do vendedor logado no PDF
- [x] Exibir nome completo, email e telefone no PDF


## Login Master e Página Performance (Fev 2026)

### Login Master
- [x] Criar usuário master (master@kenlo.com.br / Oxygen1011!)
- [x] Sessão permanente para master (sem expiração de 24h)

### Página Performance
- [x] Criar página /performance (histórico de cotações)
- [x] Proteger página com autenticação (mesmo login/senha)
- [x] Mostrar performance do time inteiro por padrão
- [x] Filtro para ver performance individual por vendedor
- [x] Adicionar link "Performance" no rodapé do site


## Página Performance Avançada (Fev 2026)

### Métricas por Kombo
- [x] Mostrar volume e valor de vendas por Kombo (Imob Start, Imob Pro, Locação Pro, Core Gestão, Elite)
- [x] Agrupamento inteligente para clientes sem Kombo (por tipo de plano: IMOB Prime/K/K2, LOC Prime/K/K2)

### Métricas Financeiras
- [x] MRR sem pós-pago (mensalidade fixa apenas)
- [x] MRR com pós-pago (mensalidade + estimativa pós-pago)
- [x] Volume e valor de implantações
- [x] Todas métricas em volume (quantidade) e valor (R$)

### Funcionalidades
- [x] Vendedor pode apagar apenas suas próprias propostas (não de outros)
- [x] Filtros por vendedor, período, Kombo
- [x] Cards de resumo com métricas principais no topo

### Outras Métricas Relevantes
- [x] Ticket médio por vendedor
- [x] Conversão por frequência de pagamento (Mensal/Semestral/Anual/Bienal)
- [x] Top produtos/add-ons mais vendidos


## Gráfico de Tendência e Limpeza de Código (Fev 2026)

### Gráfico de Tendência
- [x] Adicionar gráfico de linha mostrando evolução do MRR ao longo do tempo
- [x] Agrupar dados por dia conforme período selecionado
- [x] Mostrar duas linhas: MRR sem pós-pago e MRR com pós-pago

### Limpeza de Código
- [x] Remover arquivos não utilizados (ComponentShowcase, AIChatBox, DashboardLayout, Map, server/index.ts)
- [x] Otimizar imports em PerformancePage (remover ícones não usados)
- [x] Otimizar imports em CalculadoraPage (remover Table não usado)
- [x] Remover import de useAuth não utilizado em Home.tsx
- [x] Todos os 88 testes passando
- [x] Código limpo e profissional


## Filtros Rápidos e Ranking por MRR Pré-Pago (Fev 2026)

### Filtros Rápidos de Período
- [x] Adicionar botões "Hoje", "Esta semana", "Este mês", "Todo período"
- [x] Aplicar filtro automaticamente ao clicar
- [x] Manter filtro de vendedor funcionando junto

### Ranking por MRR Pré-Pago
- [x] Ordenar ranking de vendedores por MRR sem pós-pago (pré-pago)
- [x] Manter visível: volume de propostas, MRR pré-pago, MRR total (pré+pós)
- [x] Destacar MRR pré-pago como métrica principal de ordenação


## Correção de Responsividade Mobile (Fev 2026)

### Home Page
- [x] Corrigir stats section - grid-cols-2 sm:grid-cols-3 lg:grid-cols-5
- [x] Ajustar AnimatedStat para mobile (tamanhos responsivos)
- [x] Cards de produtos já responsivos (grid sm:grid-cols-2 lg:grid-cols-3)

### Calculadora
- [x] Layout já responsivo (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)
- [x] Botões com min-h-[44px] para touch

### Performance
- [x] Filtros rápidos com flex-col sm:flex-row e overflow-x-auto
- [x] Cards de métricas com grid-cols-2 sm:grid-cols-3 lg:grid-cols-6
- [x] Tabelas com overflow-x-auto e min-w para scroll horizontal
- [x] Ranking de vendedores com scroll horizontal

### Geral
- [x] Todas as páginas testadas
- [x] 88 testes passando

### Bloqueio de Indexação
- [x] robots.txt criado com Disallow: /
- [x] meta noindex, nofollow adicionado em index.html
- [x] Site não será indexado por motores de busca


## Google SSO e Controle de Acesso (Fev 2026)

### Google OAuth
- [x] Usar Manus OAuth existente (suporta Google SSO nativamente)
- [x] Validar domínio de email (@kenlo.com.br e @i-value.com.br) no callback
- [x] Criar página /acesso-negado para domínios não autorizados
- [x] Qualquer pessoa desses domínios pode acessar o site

### Controle de Permissões
- [x] Apenas vendedores da lista podem gerar PDFs (verificação no endpoint generatePDF)
- [x] Lista de vendedores: 11 vendedores ativos no banco de dados
- [x] Master admin pode fazer tudo
- [x] 88 testes passando


## Pré-Pagamento de Usuários/Contratos Adicionais (Fev 2026)

### Funcionalidade
- [x] Mostrar checkbox de pré-pagamento nas linhas de usuários adicionais (IMOB) e contratos adicionais (LOC)
- [x] Checkbox só aparece quando plano é Anual ou Bienal
- [x] Calcular valor upfront: preço pós-pago × 12 (Anual) ou × 24 (Bienal)
- [x] Incluir valor no primeiro pagamento (implantação + pré-pagamento)
- [x] Remover itens pré-pagos do cálculo de pós-pago mensal

### PDF
- [x] Mostrar claramente que usuários/contratos foram pré-pagos (linhas destacadas em rosa)
- [x] Mostrar lógica de cálculo (preço mensal × número de meses)
- [x] Mostrar período coberto (12 ou 24 meses)
- [x] Mostrar valor total incluído no pagamento antecipado


## Correção de Acesso PDF para Manus OAuth (Fev 2026)
- [x] Atualizar endpoint generatePDF para aceitar usuários autenticados via Manus OAuth
- [x] Verificar domínio de email (@kenlo.com.br ou @i-value.com.br) para autorizar geração de PDF
- [x] Manter compatibilidade com login antigo de vendedores


## Correção Sincronização Frequência Bienal (Fev 2026)
- [x] Corrigir bug onde checkbox de pré-pagamento mostrava "12 meses" mesmo com Bienal selecionado
- [x] Sincronizar frequência entre KomboComparisonTable e CalculadoraPage via callback onFrequencyChange
- [x] Agora mostra corretamente "24 meses" quando Bienal é selecionado


## Dedução de Pós-Pago quando Pré-Pago (Fev 2026)
- [x] Quando usuários adicionais são pré-pagos, remover do total de pós-pago mensal
- [x] Quando contratos adicionais são pré-pagos, remover do total de pós-pago mensal
- [x] Mostrar claramente na página que itens pré-pagos não serão cobrados mensalmente
- [x] Atualizar PDF para refletir a dedução de pós-pago


## Dedução de Pós-Pago quando Pré-Pago (Fev 2026)

### Página Calculadora
- [x] Quando usuários adicionais são pré-pagos, não incluir no cálculo de pós-pago
- [x] Quando contratos adicionais são pré-pagos, não incluir no cálculo de pós-pago
- [x] Total de pós-pago reflete corretamente a dedução

### PDF
- [x] Mostrar nota quando itens foram pré-pagos
- [x] Indicar período coberto (12 ou 24 meses)
- [x] Pós-pago ajustado corretamente


## Logos Kenlo e Fonte Manrope (Fev 2026)

### Logos
- [x] Extrair cor exata do vermelho Kenlo (#F82E52)
- [x] Criar versão SVG vetorial do logo completo "Kenlo" (vermelho) - kenlo-logo-final.svg (letras vermelhas, fundo transparente)
- [x] Criar versão SVG vetorial do logo "K" (vermelho com fundo, e apenas K branco) - kenlo-k-icon.svg
- [x] Criar versões brancas dos logos para fundos escuros - kenlo-logo-white-traced.svg
- [x] Aplicar logos em: header, footer, login, favicon, PDF
- [x] Corrigir logo para usar letras vermelhas com fundo transparente (não inverso)

### Fonte Manrope
- [x] Verificar se Manrope está sendo usada em todo o site (Google Fonts CDN)
- [x] CSS usa Manrope como fonte principal (font-family: 'Manrope', sans-serif)
- [x] PDF usa Helvetica (padrão PDFKit, Manrope não disponível em PDF)


## Animação Hover nos Links de Navegação (Fev 2026)
- [x] Adicionar animação sutil de hover nos links do menu desktop (underline animado + cor)
- [x] Adicionar animação sutil de hover nos links do menu mobile (slide + background)
- [x] Adicionar animação sutil de hover nos links do footer (translateX + cor)


## Ícone K Quadrado (Fev 2026)
- [x] Criar versão SVG do ícone K vermelho (apenas a letra K) - kenlo-k-square.svg
- [x] Aplicar como favicon do site - favicon.svg (K vermelho centralizado)
- [x] Disponibilizar para uso em espaços compactos


## Remoção de Seção do PDF (Fev 2026)
- [x] Remover seção "Benefícios Incluídos no Seu Plano" do PDF gerado


## Refazer Tabela de Investimento do PDF (Fev 2026)
- [x] Criar layout com colunas: Mensal | Anual | Semestral/Bienal
- [x] Destacar a coluna da frequência selecionada pelo usuário (fundo rosa claro + texto vermelho)
- [x] Adicionar linhas de pré-pago: Licenças, Usuários, Contratos
- [x] Adicionar linha Total Pré-Pago com soma
- [x] Adicionar linha de Implantação
- [x] Adicionar linha de Estimação Pós-Pago mensal


## Validação e Ajustes do PDF (Fev 2026)
- [x] Gerar cotação de teste para validar visualmente a nova tabela
- [x] Ajustar larguras das colunas (proporções adequadas)
- [x] Adicionar nota explicativa com descontos de cada frequência (legenda centralizada abaixo da tabela)


## Correções na Página de Login (Fev 2026)
- [x] Adicionar menu de navegação (header) na página de login para permitir voltar ao site
- [x] Restaurar botão de login com Google (Manus OAuth) que estava funcionando antes


## Simplificação da Tabela de Investimento do PDF (Fev 2026)
- [x] Remover comparação de frequências (Mensal/Anual/Bienal lado a lado)
- [x] Mostrar apenas a frequência escolhida pelo usuário
- [x] Adicionar coluna de equivalente mensal para cada item
- [x] Manter estrutura: Licenças, Usuários pré-pagos, Contratos pré-pagos, Total Pré-Pago, Implantação, Pós-Pago


## Reformulação Completa do PDF de Orçamento (Fev 2026)
- [x] Design lean e moderno usando logos e cores Kenlo (#F82E52)
- [x] Validade de 3 dias (não 30)
- [x] Tabela de investimento redesenhada - mais bonita e sem repetições
- [x] Coluna com nome da frequência (ex: "Anual" em vez de "Valor Total")
- [x] Solução contratada com nome do Kombo + produtos e add-ons incluídos
- [x] Métricas essenciais (usuários, contratos) escritas de forma clara
- [x] Corrigir typo de caracteres especiais quebrados
- [x] Renomear "The Kenlo Effect" para "Kenlo Receitas Extra"
- [x] Footer com slogan oficial "Quem usa, lidera"
- [x] Header e footer modernos e lean
- [x] PDF agora tem apenas 1 página (antes tinha 4 páginas com conteúdo espalhado)


## Correções do PDF de Cotação - Feedback do Usuário (Fev 2026)
- [x] 1. Usar logo real da Kenlo (imagem PNG/SVG), não texto
- [x] 2. Títulos em preto/cinza escuro (não vermelho) - muito vermelho é feio
- [x] 3. Métricas do negócio ANTES da solução contratada (ordem lógica)
- [x] 4. Adicionar "Serviço Premium: Suporte VIP e CS Dedicado incluído" quando aplicável
- [x] 5. Validade como "3 dias" (texto), não data específica
- [x] 6. Remover palavra "Item" do header da tabela (agora é "Descrição")
- [x] 7. "Licença pré-paga" (não "Licenças")
- [x] 8. Equivalente mensal abaixo do "Total a pagar agora" (não abaixo do pós-pago)
- [x] 9. Footnote sobre impostos na seção de receitas extra
- [x] 10. Header no topo e footer no rodapé da página (posição fixa, não no meio)
- [x] PDF agora tem apenas 1 página (antes tinha 2-4)


## Controle de Acesso por Domínio de Email (Fev 2026)
- [x] Permitir login para qualquer email @kenlo.com.br, @i-value.com.br ou @laik.com.br
- [x] Permitir acesso à calculadora e página de performance para todos os emails Kenlo/i-value/Laik
- [x] Restringir geração de orçamento (PDF) apenas para Master e Vendedores cadastrados
- [x] Testar login com email @laik.com.br via Google OAuth (testado com mickael@laik.com.br)
- [x] Mensagem de restrição "Para exportar cotações, faça login como vendedor autorizado" aparece para usuários OAuth


## Atualização de Preços Kenlo IMOB (Fev 2026)
- [x] K2: Usuários inclusos já estava 14 (verificado)
- [x] Suporte VIP por plano:
  - [x] Prime: desabilitado por padrão (cliente paga R$ 97 se quiser)
  - [x] K: habilitado e INCLUÍDO no plano
  - [x] K2: habilitado e incluído no plano
- [x] CS Dedicado por plano:
  - [x] Prime: desabilitado por padrão (cliente paga R$ 197 se quiser)
  - [x] K: desabilitado por padrão (cliente paga R$ 197 se quiser)
  - [x] K2: habilitado e incluído no plano
- [x] Página de produtos Kenlo Imob já estava correta
- [x] Lógica da calculadora já estava correta
- [x] Todos os 88 testes passaram


## Seleção Múltipla e Deleção em Lote de Cotações (Fev 2026)
- [x] Adicionar coluna de checkbox na tabela de cotações
- [x] Implementar seleção "selecionar todos" no header
- [x] Criar endpoint de deleção em lote no backend (softDeleteQuotesBatch)
- [x] Adicionar botão "Apagar X selecionadas" que aparece quando há itens selecionados
- [x] Corrigir erro "Não autorizado" na deleção (era problema de cookie expirado)
- [x] Master Admin pode apagar qualquer cotação
- [x] Vendedores só podem apagar suas próprias cotações
- [x] Testado: seleção de todos os 46 itens funciona, botão aparece automaticamente


## Bug: Usuários OAuth não conseguem exportar PDF (Fev 2026)
- [x] Usuários com email @kenlo.com.br, @i-value.com.br ou @laik.com.br via Google OAuth podem exportar PDF
- [x] Atualizada lógica de permissão no frontend (CalculadoraPage.tsx) - canExportPDF verifica OAuth user
- [x] Atualizada lógica de permissão no backend (routers.ts - generatePDF) - aceita OAuth users
- [x] Atualizado QuoteInfoDialog para usar dados do usuário OAuth quando não há salesperson
- [x] Testado com usuário OAuth (mickael@laik.com.br) - PDF gerado com sucesso para Emerson Moraes
