# Calculator Prepaid Test V2 - 2026-02-20

## Current State (Before Prepaid)
- Plan: K, IMOB only, 10 users, 15 closings, 800 leads
- Tem site: Não, Já usa CRM: Não
- Pós-Pago row shows: R$ 141,00/mês for all 3 columns (users additional)
- Total Mensalidade (Pré-Pago + Pós-Pago) row shows:
  - Sua Seleção: R$ 1.469,00/mês
  - Imob Start: R$ 1.068,00/mês
  - Imob Pro: R$ 1.268,00/mês
- Pré-pagar buttons visible for each column
- Sticky bar at bottom shows: Pré R$ 986,00 + Pós R$ 141,00 = R$ 1.127,00 (for Kombo Imob Pro)

## After Clicking Pré-pagar (Sua Seleção column)
- First column now shows "Voltar pós-pago" button (toggle works)
- Usuários adic. row: Shows "Pré-pago: R$__/usuário" with 10% OFF label and strikethrough pós-pago price
- Mensalidade (est.) Pós-Pago row: Sua Seleção shows "Sem custos" (because prepaid covers it)
- Total Mensalidade (Pré-Pago + Pós-Pago): R$ 1.454,90/mês (was R$ 1.469,00 - the prepaid discount is applied)
- Sticky bar: Pré R$ 986,00 + Pós R$ 141,00 = R$ 1.127,00 (for Kombo Imob Pro - unchanged since different column)

## Observations
- The prepaid toggle works correctly
- The 10% discount is being applied (R$ 1.469 → R$ 1.454,90 shows the users cost moved from pós to pré with discount)
- The "Sem custos" for pós-pago when prepaid is active is correct

## Next: Select Kombo Imob Pro and export PDF with prepaid
