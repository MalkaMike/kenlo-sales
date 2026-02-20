# Calculator Prepaid Test Results

## Configuration
- Product: IMOB only, Plan: K, Users: 10, Leads: 800, Fechamentos: 15

## After clicking "Pré-pagar" on Sua Seleção column:
- Button changed to "Voltar pós-pago" (correct toggle behavior)
- Pós-Pago row for Sua Seleção: "Sem custos" (users moved to prepaid)
- Pós-Pago row for Imob Start/Pro: R$ 141,00/mês (still post-paid)
- Total Mensalidade (Pré-Pago + Pós-Pago): R$ 1.454,90/mês for Sua Seleção
- Sticky bar shows: Pré R$ 986,00 | Pós R$ 141,00

## Key observations:
1. The "Pré-pagar" toggle works correctly
2. Shows "10% desc." label next to prepaid prices
3. Shows post-paid price crossed out with prepaid price next to it
4. "Voltar pós-pago" button appears to revert
5. Pós-Pago row correctly shows "Sem custos" when all items are prepaid

## Comparison Table Values (with prepaid active on Sua Seleção):
- Sua Seleção: Imob R$ 497 K, Leads R$ 497, Inteligência R$ 297, Assinatura R$ 37
- Mensalidade (antes) Pré-Pago: R$ 1.678
- Desconto Ciclo: -R$ 350
- Mensalidade (depois) Pré-Pago: highlighted in green
- Sticky bar: Pré R$ 986,00 | Pós R$ 141,00

## Next: Test PDF export to verify cycle-based pricing
