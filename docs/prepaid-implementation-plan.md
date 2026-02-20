# Pre-Payment 10% Discount Implementation Plan

## Current State Analysis

### How prepaid currently works:
1. **Fixed prices** in `pricing-values.json` (BLOCO F-PRE):
   - Users: R$ 37/user/month (flat)
   - Contracts: R$ 2.50/contract/month (flat)
   - Leads: R$ 1.30/lead/month (flat)

2. **Post-paid prices** are tiered by plan (BLOCO F):
   - Users: R$ 57 (Prime), R$ 47/37 (K), R$ 37/27/17 (K²)
   - Contracts: R$ 3.00 (Prime), R$ 3.00/2.50 (K), R$ 3.00/2.50/2.00 (K²)
   - Leads: R$ 1.50/1.30/1.10/0.90 (all plans, tiered by volume)

### New Business Rule:
- Pre-paid price = Post-paid price × (1 - 10%) = Post-paid price × 0.90
- This means the pre-paid price is DYNAMIC (depends on plan tier and volume)
- NOT a fixed price anymore

## Files to Modify:

### 1. pricing-values.json
- Update BLOCO F-PRE to reflect the 10% discount rule instead of fixed prices
- Add `discountPercentage: 10` field

### 2. shared/pricing-config.ts
- Update PREPAID_PRICING to calculate from post-paid tiers with 10% discount
- Add helper: `calculatePrepaidPrice(postPaidPrice) => postPaidPrice * 0.90`

### 3. KomboCellRenderers.tsx
- Show BOTH prices when user clicks "Pré-pagar":
  - Pós-pago: R$ X/unit (original)
  - Pré-pago: R$ X×0.90/unit (with 10% OFF badge)
- Show the savings amount

### 4. KomboComparisonTable.tsx (prepaid transformation)
- Update the prepaid calculation to use 10% discount on post-paid cost
- Auto-update totals for pre+pos combinations

### 5. usePricing.ts
- Update calculatePrepaymentAmount to use post-paid price × 0.90

### 6. recalculateColumns.ts
- Update prepaid recalculation for PDF

### 7. PDF generation (server-side)
- Show price based on chosen ciclo
- Show pre-pago vs pos-pago comparison

### 8. StickyBar.tsx
- Ensure pre/post/total breakdown is correct

### 9. Admin pricing page
- Ensure tranche rules are visible
- Source of truth for all metrics

### 10. Auto-refresh banner
- Detect pricing changes and show banner to reload
