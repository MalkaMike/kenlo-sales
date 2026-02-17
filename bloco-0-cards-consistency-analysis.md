# Bloco 0 Cards Consistency Analysis

## Current State

### Card 1: R$ 500k (Azul Marinho #1A202C)
- **Padding:** `p-4` ✓ COMPACT
- **Main number:** `text-4xl` 
- **Subtitle:** `text-xs`
- **"E você?":** `text-sm font-bold text-[#F82E52]`
- **Spacing:** `mb-1`, `mb-2`

### Card 2: 4,5% / 7,5% (White)
- **Padding:** `p-6` ❌ LARGER
- **Main numbers:** `text-4xl`
- **Labels:** `text-xs`
- **Description:** `text-sm font-semibold`
- **"E você?":** `text-base font-bold text-[#F82E52]` ❌ LARGER
- **Spacing:** `mb-3`, `mb-1`

### Card 3: 25% (White)
- **Padding:** `p-6` ❌ LARGER
- **Main number:** `text-4xl`
- **Description:** `text-sm font-semibold`
- **Label:** `text-xs`
- **"E você?":** `text-base font-bold text-[#F82E52]` ❌ LARGER
- **Spacing:** `mb-3`, `mb-1`

### Card 4: 60% + 10,5% (Vermelho #F82E52)
- **Padding:** `p-6` ❌ LARGER
- **Main numbers:** `text-4xl`, `text-3xl`
- **Descriptions:** `text-xs font-medium`
- **Italic text:** `text-xs italic`
- **"E você?":** `text-sm font-bold text-white` ✓ COMPACT
- **Spacing:** `mb-2`

---

## Inconsistencies Found

1. **Padding:** Card 1 uses `p-4` (compact), Cards 2-4 use `p-6` (larger)
2. **"E você?" font size:** Card 1 & 4 use `text-sm`, Cards 2-3 use `text-base`
3. **Spacing:** Card 1 uses `mb-1/mb-2`, Cards 2-4 use `mb-2/mb-3`

---

## Standardization Proposal

**Option A: All Compact (like Card 1)**
- All cards: `p-4`
- All "E você?": `text-sm font-bold`
- All spacing: `mb-1`, `mb-2`

**Option B: All Regular (like Cards 2-4)**
- All cards: `p-6`
- All "E você?": `text-base font-bold`
- All spacing: `mb-2`, `mb-3`

**Recommendation:** Option A (All Compact) - matches user's request for "bem menor" (much smaller) box
