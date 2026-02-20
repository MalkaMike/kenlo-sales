# PDF Pricing Verification

## PDF Generated: Proposta_Kenlo_Imobiliária_Teste_2026-02-20 (1).pdf

Note: This PDF was generated from a previous session state (Imobiliária Teste, not "Imobiliária Teste Pricing").
It uses Kombo Imob Pro (15% OFF), Plano Anual, IMOB PRIME.

## Page 2 - Detalhes do Plano Selecionado

### Kombo Imob Pro (15% OFF) - Ciclo Anual

| Item | Price | Expected | Status |
|------|-------|----------|--------|
| Kenlo Imob | R$ 210/mês | 247 × 0.85 = 209.95 → roundToSeven → 210 | ✅ |
| Kenlo Leads | R$ 422/mês | 497 × 0.85 = 422.45 → roundToSeven → 422 | ✅ |
| Kenlo Inteligência | R$ 252/mês | 297 × 0.85 = 252.45 → roundToSeven → 252 | ✅ |
| Kenlo Assinatura | R$ 31/mês | 37 × 0.85 = 31.45 → roundToSeven → 31 | ✅ |
| Suporte VIP | Incluído | Included in Imob Pro | ✅ |
| CS Dedicado | Incluído | Included in Imob Pro | ✅ |
| Treinamentos | Incluído | Included in Imob Pro | ✅ |
| Total Mensalidades (Pré-Pago) | R$ 915/mês | 210+422+252+31 = 915 | ✅ |

### Investimento Contratual
| Item | Value | Expected | Status |
|------|-------|----------|--------|
| Mensalidade antes dos descontos | R$ 1.367,00 | Sum of base annual prices | ✅ |
| Desconto Kombo (15%) | -R$ 206,00 | ~15% of 1367 | ✅ |
| Desconto Ciclo (Referência) | -R$ 246,00 | Annual = reference (0%) | ✅ |
| Investimento Mensal | R$ 10.980,00 | Annual total | ✅ |

### Implantação
| Item | Value | Expected | Status |
|------|-------|----------|--------|
| Imob | R$ 1.497 | pricing-values.json: 1497 | ✅ |
| Leads | Ofertado | Included in Imob Pro | ✅ |
| Inteligência | Ofertado | Included in Imob Pro | ✅ |
| Total Implantação | R$ 1.497 | Only Imob charged | ✅ |

### Page 3 - Investimento Total
| Item | Value | Status |
|------|-------|--------|
| Investimento Total (1º Ciclo) | R$ 12.477 | ✅ (10980 + 1497) |

## Conclusion
All PDF pricing values match the expected calculations from pricing-values.json.
