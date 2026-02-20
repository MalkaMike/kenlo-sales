# Calculadora Kenlo - Documentação Técnica

Este documento descreve as regras de negócio, lógica de preços e comportamentos especiais da Calculadora de Preços Kenlo.

---

## Estrutura de Produtos

A Kenlo oferece dois produtos principais:

- **Kenlo IMOB**: CRM para vendas de imóveis
- **Kenlo Locação**: ERP para gestão de contratos de locação

Cada produto possui três planos (tiers):

- **Prime**: Plano básico
- **K**: Plano intermediário
- **K2**: Plano avançado

---

## Add-ons Disponíveis

Os add-ons são funcionalidades extras que podem ser adicionadas aos produtos principais. Cada add-on possui regras específicas de compatibilidade:

| Add-on | Compatível com IMOB | Compatível com LOC |
|--------|---------------------|---------------------|
| **Inteligência** (BI) | ✅ | ✅ |
| **Leads** | ✅ | ❌ |
| **Assinaturas** | ✅ | ✅ |
| **Pay** (Cobrança) | ❌ | ✅ |
| **Seguros** | ❌ | ✅ |
| **Cash** | ❌ | ✅ |

---

## Serviços Premium

Os Serviços Premium são serviços de suporte e atendimento diferenciados que podem ser incluídos ou adquiridos separadamente, dependendo do plano contratado.

### Suporte VIP

**Preço**: R$ 97/mês por produto

**Descrição**: Atendimento prioritário com SLA reduzido (resposta em até 15 minutos).

#### Regra de Inclusão (VIP Support)

O Suporte VIP segue uma **regra de herança independente por produto**:

- **Prime**: NÃO incluído (pode ser adquirido por R$ 97/mês)
- **K**: INCLUÍDO ✅
- **K2**: INCLUÍDO ✅

**Quando o cliente tem IMOB + LOC**:

Cada produto é avaliado separadamente. O cliente paga por Suporte VIP apenas para os produtos em plano Prime.

**Exemplos**:

| Cenário | IMOB | LOC | VIP IMOB | VIP LOC | Custo VIP Total |
|---------|------|-----|----------|---------|-----------------|
| 1 | Prime | Prime | ❌ Opcional | ❌ Opcional | R$ 194/mês (se contratar ambos) |
| 2 | Prime | K | ❌ Opcional | ✅ Incluído | R$ 97/mês (só IMOB) |
| 3 | K | Prime | ✅ Incluído | ❌ Opcional | R$ 97/mês (só LOC) |
| 4 | K | K | ✅ Incluído | ✅ Incluído | R$ 0 (ambos incluídos) |
| 5 | K2 | Prime | ✅ Incluído | ❌ Opcional | R$ 97/mês (só LOC) |
| 6 | K2 | K2 | ✅ Incluído | ✅ Incluído | R$ 0 (ambos incluídos) |

---

### CS Dedicado (Customer Success Dedicado)

**Preço**: R$ 297/mês (compartilhado entre IMOB e LOC)

**Descrição**: Customer Success exclusivo com WhatsApp dedicado, acompanhamento próximo, facilitação interna e geração de valor.

#### Regra de Inclusão (CS Dedicado) - BENEFÍCIO CRUZADO

O CS Dedicado segue uma **regra de herança compartilhada com benefício cruzado**:

- **Prime**: NÃO incluído (pode ser adquirido por R$ 297/mês)
- **K**: NÃO incluído (pode ser adquirido por R$ 297/mês)
- **K2**: INCLUÍDO ✅

**Quando o cliente tem IMOB + LOC**:

Se **pelo menos um** dos produtos for K2, o CS Dedicado é **incluído para ambos os produtos** (benefício cruzado). O cliente paga **apenas uma vez** (R$ 297/mês) ou não paga nada se algum produto for K2.

**Exemplos**:

| Cenário | IMOB | LOC | CS Dedicado | Custo CS | Explicação |
|---------|------|-----|-------------|----------|------------|
| 1 | Prime | Prime | ❌ Opcional | R$ 297/mês | Nenhum produto é K2 |
| 2 | Prime | K | ❌ Opcional | R$ 297/mês | Nenhum produto é K2 |
| 3 | K | K | ❌ Opcional | R$ 297/mês | Nenhum produto é K2 |
| 4 | **Prime** | **K2** | ✅ **Incluído** | **R$ 0** | LOC é K2 → CS incluído para AMBOS (benefício cruzado) |
| 5 | **K** | **K2** | ✅ **Incluído** | **R$ 0** | LOC é K2 → CS incluído para AMBOS (benefício cruzado) |
| 6 | **K2** | **Prime** | ✅ **Incluído** | **R$ 0** | IMOB é K2 → CS incluído para AMBOS (benefício cruzado) |
| 7 | **K2** | **K** | ✅ **Incluído** | **R$ 0** | IMOB é K2 → CS incluído para AMBOS (benefício cruzado) |
| 8 | K2 | K2 | ✅ Incluído | R$ 0 | Ambos são K2 → CS incluído |

**Regra resumida**: `if (imobPlan === "k2" OR locPlan === "k2") → CS Dedicado incluído para ambos`

---

## Kombos (Pacotes com Desconto)

Kombos são combinações pré-definidas de produtos e add-ons que oferecem descontos progressivos e implantações gratuitas.

### Kombos Disponíveis

| Kombo | Composição | Desconto Mensal | Implantação | Serviços Premium Incluídos |
|-------|------------|-----------------|-------------|----------------------------|
| **Imob Start** | IMOB + Leads + Assinaturas | 10% | R$ 1.497 (Leads grátis) | ❌ Não |
| **Imob Pro** | IMOB + Leads + Inteligência + Assinaturas | 15% | R$ 1.497 (Leads + Inteligência grátis) | ✅ VIP + CS |
| **Locação Pro** | LOC + Inteligência + Assinaturas | 10% | R$ 1.497 (Inteligência grátis) | ✅ VIP + CS |
| **Core Gestão** | IMOB + LOC (sem add-ons) | 0% | R$ 1.497 (IMOB grátis) | ✅ VIP + CS |
| **Elite** | IMOB + LOC + TODOS os add-ons | 20% | R$ 1.497 (IMOB + Leads + Inteligência grátis) | ✅ VIP + CS |

### Regras de Serviços Premium nos Kombos

**Exceção importante**: O Kombo **Imob Start** NÃO inclui Serviços Premium. Todos os outros Kombos (Imob Pro, Locação Pro, Core Gestão, Elite) incluem automaticamente **Suporte VIP + CS Dedicado**, independentemente do plano contratado.

**Exemplo**:

- Cliente contrata **Kombo Imob Pro** com plano **Prime** → Suporte VIP + CS Dedicado são **incluídos** (mesmo Prime não incluindo normalmente)
- Cliente contrata **Kombo Imob Start** com plano **Prime** → Suporte VIP e CS Dedicado **NÃO incluídos** (pode comprar separadamente)

---

## Frequências de Pagamento

A calculadora oferece 4 frequências de pagamento, com a frequência **Anual** sendo a referência (0%):

| Frequência | Ajuste sobre Anual | Multiplicador | Exemplo (R$ 1.000 anual) |
|------------|-------------------|---------------|--------------------------|
| **Mensal** | +25% | 1.25 | R$ 1.250/mês |
| **Semestral** | +12,5% | 1.125 | R$ 1.125/mês |
| **Anual** | 0% (referência) | 1.0 | R$ 1.000/mês |
| **Bienal** | -12,5% | 0.875 | R$ 875/mês |

---

## Regra de Arredondamento

Todos os preços de licenças (produtos e add-ons) devem ser arredondados para **sempre terminar em 7**.

**Regra**:
- Preços >= R$ 100: arredondar **para cima** até o próximo número terminado em 7
- Preços < R$ 100: apenas `Math.ceil()` (arredondar para cima)
- **Exceção**: Custos pós-pagos (usuários adicionais, contratos, boletos, etc.) NÃO seguem esta regra

**Exemplos**:

| Preço calculado | Preço final |
|-----------------|-------------|
| R$ 243,50 | R$ 247 |
| R$ 495,20 | R$ 497 |
| R$ 1.192,00 | R$ 1.197 |
| R$ 96,50 | R$ 97 |

---

## Custos Pós-Pago

Alguns recursos possuem custos variáveis baseados em volume de uso:

### IMOB - Usuários Adicionais

Cada plano inclui um número de usuários. Usuários adicionais são cobrados por faixas:

| Plano | Usuários Inclusos | Faixa 1-10 | Faixa 11-50 | Faixa 51+ |
|-------|-------------------|------------|-------------|-----------|
| Prime | 2 | R$ 57/usuário | R$ 57/usuário | R$ 57/usuário |
| K | 7 | R$ 47/usuário | R$ 37/usuário | R$ 37/usuário |
| K2 | 15 | R$ 47/usuário | R$ 37/usuário | R$ 27/usuário |

### LOC - Contratos Adicionais

Cada plano inclui um número de contratos. Contratos adicionais são cobrados por faixas:

| Plano | Contratos Inclusos | Faixa 1-100 | Faixa 101-500 | Faixa 501+ |
|-------|-------------------|-------------|---------------|------------|
| Prime | 50 | R$ 7/contrato | R$ 7/contrato | R$ 7/contrato |
| K | 200 | R$ 5/contrato | R$ 3/contrato | R$ 3/contrato |
| K2 | 500 | R$ 5/contrato | R$ 3/contrato | R$ 2/contrato |

---

## Implementação Técnica

### Arquivos Principais

- **`shared/pricing-values.json`**: Configuração centralizada de todos os preços, regras e valores
- **`shared/pricing-config.ts`**: Funções de cálculo e lógica de negócio
- **`client/src/utils/pricing.ts`**: Wrapper para uso no frontend
- **`client/src/pages/calculadora/CalculadoraContext.tsx`**: Context React com estado da calculadora

### Funções Importantes

#### `shouldIncludePremiumService(service, imobPlan, locPlan, activeKombo)`

Determina se um serviço premium (VIP ou CS) deve ser incluído baseado nos planos e Kombo ativo.

**Lógica**:
1. Se há um Kombo ativo que inclui serviços premium → retorna `true`
2. Para VIP Support: verifica se IMOB ou LOC é K/K2 (regra independente)
3. Para CS Dedicado: verifica se IMOB ou LOC é K2 (regra de benefício cruzado)

#### `isVipSupportIncludedInPlan(tier)`

Verifica se Suporte VIP é incluído em um plano específico.

**Retorna**: `true` se tier === "k" ou tier === "k2"

#### `isDedicatedCSIncludedInPlan(tier)`

Verifica se CS Dedicado é incluído em um plano específico.

**Retorna**: `true` se tier === "k2"

---

## Testes

Todos os comportamentos descritos neste documento são cobertos por testes automatizados em:

- `server/business-rules-verification.test.ts`: 89 testes de regras de negócio
- `server/core-gestao-premium.test.ts`: 12 testes do Kombo Core Gestão
- `server/elite-premium.test.ts`: 14 testes do Kombo Elite
- `server/pricing-config.test.ts`: 34 testes de configuração de preços

**Total**: 1.124 testes passando

---

## Manutenção e Modificações

Para modificar preços ou regras de negócio:

1. **Edite `shared/pricing-values.json`** para alterar valores numéricos
2. **Edite `shared/pricing-config.ts`** para alterar lógica de cálculo
3. **Execute `pnpm test`** para garantir que nenhuma regra foi quebrada
4. **Atualize este README** se a mudança afetar regras documentadas

---

**Última atualização**: Fevereiro 2026  
**Autor**: Equipe Kenlo
