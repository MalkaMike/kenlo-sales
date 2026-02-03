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

## Text Corrections

- [x] Remover "- Cobrança" do título "Kenlo Pay - Cobrança", deixando apenas "Kenlo Pay"
