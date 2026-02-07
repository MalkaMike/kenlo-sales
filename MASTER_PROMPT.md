🔴 MASTER PROMPT — KENLO CALCULATOR & PRICING PAGE (FINAL)
CONTEXTO GERAL

Você é um Product + UX + Frontend Senior construindo uma página de calculadora de preços SaaS B2B para a plataforma Kenlo (CRM Imobiliário + Gestão de Locação).

Objetivo da página:

Reduzir fricção

Automatizar decisões

Mostrar valor antes do preço

Provar que Kenlo pode se pagar enquanto o cliente usa

⚠️ Regras importantes

As regras internas de planos NÃO devem aparecer explicitamente para o usuário

O sistema é inteligente, recomenda automaticamente, mas sempre permite escolha

Tudo deve parecer simples, óbvio e confiável

ESTRUTURA DA PÁGINA (ORDEM OBRIGATÓRIA)
1️⃣ Informações do Negócio (INPUTS ESSENCIAIS)

Antes de qualquer preço ou plano, coletar apenas dados operacionais básicos.

Todos os campos começam em 0 ou OFF.

Kenlo IMOB

Número de usuários (default: 0)

Número de fechamentos/mês (default: 0)

IA SDR (toggle OFF)

WhatsApp integrado (toggle OFF)

Kenlo LOCAÇÃO

Número de contratos sob gestão (default: 0)

Número de novos contratos/mês (default: 0)

📌 Não mostrar serviços premium aqui.
Eles entram automaticamente depois, via plano.

2️⃣ Solução Selecionada + Plano Recomendado (SEÇÃO UNIFICADA)

⚠️ IMPORTANTE:
As seções “Solução Selecionada” e “Plano Recomendado” devem ser fundidas em uma única área, para economizar espaço e reduzir ruído cognitivo.

Lógica de Seleção Automática (SILENCIOSA)

Se apenas IMOB for aplicável → IMOB aparece selecionado

Se apenas LOCAÇÃO for aplicável → LOCAÇÃO aparece selecionado

Se ambos forem aplicáveis → IMOB e LOCAÇÃO aparecem selecionados AO MESMO TEMPO

Não mostrar opção “Imob + Loc” como um terceiro botão

O usuário pode desmarcar qualquer um manualmente

Visual da Seção

Cards grandes e claros:

IMOB — CRM + Site para Vendas

LOCAÇÃO — Gestão de Locações

Cada card tem, logo abaixo:

Botões: Prime | K | K2

⚠️ As regras de enquadramento de plano NÃO aparecem

Apenas um selo discreto: “Recomendado”

Planos abaixo do recomendado ficam “apagados”

Planos acima continuam clicáveis

3️⃣ Benefícios Inclusos (NÃO FEATURES)

Esta seção explica o que o cliente GANHA, não o que o software faz.

Benefícios possíveis:

Suporte VIP

Customer Success dedicado

Treinamentos Kenlo

Regras importantes (implícitas, não técnicas):

Benefícios são concedidos por plano

Se o cliente tiver K ou K2 em QUALQUER produto (Imob ou Loc):

Ele ganha os benefícios para ambos

Se for K2, os treinamentos são:

2 treinamentos online por ano OU

1 treinamento presencial

Se o cliente tiver K2 em IMOB e LOCAÇÃO:

Ele ganha o dobro dos treinamentos

Informação de valor (mostrar discretamente):

Treinamento online avulso: R$ 2.000

Treinamento presencial avulso: R$ 3.000

4️⃣ Add-ons Opcionais

Mostrar apenas os add-ons compatíveis com a solução selecionada.

Leads → IMOB

Inteligência → IMOB e/ou LOCAÇÃO

Assinaturas → IMOB e/ou LOCAÇÃO

Pay → LOCAÇÃO

Seguros → LOCAÇÃO

📌 Add-ons não compatíveis devem ficar ocultos ou desabilitados.

5️⃣ Sua Seleção vs Kombos (COMPARAÇÃO DE VALOR)

Esta é a principal seção comercial da página.

🔹 PRIMEIRO: Ciclo de Pagamento (INPUT GLOBAL)

⚠️ O ciclo de pagamento DEVE FICAR NO TOPO DA SEÇÃO, antes da tabela.

Opções:

Mensal → +25%

Semestral → +11%

Anual → 0% (Referência, default)

Bienal → -10%

📌 Copy obrigatória:

“Valores exibidos em base mensal equivalente.
O plano anual é a referência. Pagamentos mais longos geram desconto.”

🔹 SEGUNDO: Tabela Comparativa

Colunas:

Sua Seleção

Kombos:

Imob Start (10% OFF)

Imob Pro (15% OFF)

Loc Pro (10% OFF)

Core Gestão

Elite (20% OFF)

Linhas:

Produtos incluídos

Add-ons incluídos

Benefícios

Valor Anual Equivalente

📌 A tabela deve:

Reagir imediatamente à mudança do ciclo de pagamento

Mostrar claramente o ganho ao escolher um Kombo

Destacar visualmente o Kombo Elite

6️⃣ Kenlo Receita Extra (VALUE PROOF)

⚠️ REMOVER Kenlo Cash COMPLETAMENTE

Objetivo:
Mostrar que Kenlo pode se pagar enquanto o cliente usa.

Fontes de Receita
🔹 Kenlo Pay (Boletos & Split)

Disponível por padrão para clientes de LOCAÇÃO

Ativação opcional no onboarding

Perguntar ao cliente:

Você cobra o boleto do inquilino?

Você cobra o split do proprietário?

Quanto você cobra por boleto?

Quanto você cobra por split?

Usar essas respostas para estimar receita mensal.

🔹 Kenlo Seguros

Disponível por padrão para LOCAÇÃO

Receita mínima estimada:

R$ 10 por contrato por mês

Resultado Final (VISUAL FORTE)

Receitas estimadas (+ verde)

Custos Kenlo (- neutro)

Ganho líquido estimado

Mensagem final obrigatória:

“Kenlo é a única plataforma que pode se pagar enquanto você usa.”

Nota legal discreta:

Não inclui impostos.

7️⃣ Finalização

CTA claro:

“Gerar Cotação”

A escolha de parcelamento (à vista, 2x, 3x, até 6x no bienal)

Só acontece DEPOIS, na etapa de orçamento

TOM, DESIGN E UX

Clean

Empresarial

Confiante

Sem jargão técnico

Sem explicar regras internas

Tudo deve parecer óbvio e justo

RESULTADO ESPERADO

Uma página que:

Educa sem cansar

Vende sem empurrar

Mostra valor antes de preço

Faz o cliente pensar:
“Não faz sentido não usar Kenlo.”