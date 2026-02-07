# MASTER PROMPT — KENLO SMART PRICING & CONFIGURATOR PAGE

## CORE PHILOSOPHY
- User feels: Guided, not boxed / Free, not constrained / Understood, not judged
- Internal plan rules must NEVER appear in the UI
- System makes smart decisions silently
- UI explains what user gets, not why they qualify

## PAGE STRUCTURE (10 SECTIONS IN ORDER)

### 1. IDENTIFICATION — Natureza do Negócio
- Tipo de operação: Corretora / Administradora de Aluguel / Ambos
- Nome da empresa, Nome do responsável, Email, Telefone, WhatsApp
- Smart: If "Ambos" → preselect Imob + Loc later

### 2. INFORMAÇÕES DO NEGÓCIO (Smart Inputs)
- Kenlo Imob: Número de usuários (default: 0), Fechamentos/mês (default: 0), IA SDR (OFF), WhatsApp integrado (OFF)
- Kenlo Locação: Contratos sob gestão (default: 0), Novos contratos/mês (default: 0)
- ❗ Serviços Premium must NOT appear here

### 3. ESCOLHA DO PRODUTO (System-Driven)
- Title: "Solução Selecionada"
- Auto: Imob inputs > 0 → Imob selected, Loc inputs > 0 → Loc selected, both > 0 → both
- Selected products highlighted, others visible but require manual click
- ❌ Never ask "Which product do you want?" — system infers it

### 4. PLAN SELECTION (Recommendation, Not Rules)
- Title: "Plano Recomendado"
- ⚠️ Plan thresholds are INTERNAL ONLY — NEVER shown
- One plan highlighted as "Recomendado"
- Copy: "Com base no tamanho da sua operação, este é o plano recomendado. Você pode alterar o plano a qualquer momento."
- Lower plans → disabled/de-emphasized with tooltip: "Este plano pode não atender totalmente à sua operação atual."
- Higher plans → fully selectable
- Independent logic for Imob and Locação

### 5. ADD-ONS OPCIONAIS
- Leads (Imob only), Inteligência (both), Assinaturas (both), Pay (Loc), Seguros (Loc), Cash (Loc)
- Pay, Seguros, Cash available in ALL plans and Kombos
- Enabled by default, activated during onboarding
- Copy: "Estes serviços ficam disponíveis por padrão e podem ser ativados durante o onboarding."

### 6. BENEFÍCIOS INCLUSOS (NEW SECTION)
- Shows benefits, not features
- Benefits come from ANY plan (Imob or Loc) and are shared across products
- If client qualifies via Imob OR Loc → benefits apply to BOTH
- Possible benefits: Suporte VIP, CS Dedicado, Treinamentos
- K2 gives: 2 online trainings/year OR 1 in-person; both K2 = stack (2x)
- ❌ Never explain why ✅ Just show what is included

### 7. KOMBOS (Always Visible)
- Title: "Compare com nossos Kombos"
- ALL Kombos always shown (Imob Start, Imob Pro, Loc Pro, Core Gestão, Elite)
- Compatible → selectable; Not compatible → greyed with copy: "Este Kombo inclui recursos que não fazem parte da sua configuração atual."
- ❌ Never mention eligibility rules or user/contract counts

### 8. FREQUÊNCIA DE PAGAMENTO
- All prices = monthly equivalent
- Mensal (+25%), Semestral (+11%), Anual (0% referência), Bienal (-10%)
- Footnote: "Todos os valores exibidos são mensais equivalentes, independentemente da forma de pagamento escolhida."

### 9. KENLO RECEITA EXTRA
- Kenlo Pay: Ask about boleto/split charges, calculate revenues
- Kenlo Seguros: "Ganhe a partir de R$10 por contrato/mês"
- Cash: "Antecipe repasses e gere fluxo de caixa sem impacto operacional"
- Summary: Receitas, Investimentos, Ganho líquido mensal estimado
- Copy: "Kenlo é a única plataforma que pode se pagar enquanto você usa."

### 10. EXPORTAÇÃO & FINALIZAÇÃO
- CTA: Gerar exemplos, Exportar cotação (PDF)
- Parcelamento options after export

## ABSOLUTE CONSTRAINTS
- ❌ Never show plan thresholds
- ❌ Never show internal qualification logic
- ❌ Never block user actions with rules
- ❌ Never shame or "disqualify" the client
- ✅ Always recommend
- ✅ Always explain benefits
- ✅ Always show Kombos
- ✅ Always be transparent with money, never with rules
