# Calculator Test Findings - Feb 20, 2026

## Configuration
- Product: IMOB
- Plan: K
- Users: 10 (7 included, 3 additional @ R$47/user)
- Leads: 800
- Closings: 15
- Addons: Leads, Inteligência, Assinatura
- Frequency: Anual

## Key Observations
1. Pós-Pago users: 3 additional @ R$47/user = R$141/mês
2. Pre-pagar buttons visible for users
3. Kombo comparison table shows correctly
4. PDF export button clicked but no new PDF downloaded - may need to check if the button requires a "Selecionar" first

## Issue: PDF not downloading
- The Export button was clicked but no new PDF appeared
- The network logs show the last PDF generation was at 17:36 (earlier session)
- No errors in dev server log after 20:37
- Need to check if the export requires selecting a column first
