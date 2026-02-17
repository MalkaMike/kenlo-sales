# Kombos Page Review - Kenlo Design System Compliance

## Test Date
2026-02-17 16:32 UTC

## Test URL
http://localhost:3000/kombos

## Overall Assessment
⚠️ **PARTIALLY COMPLIANT** - Needs redesign to match Kenlo Design System

## Current Design Analysis

### ✅ What's Working

#### Colors (Partially)
- Green checkmarks appear to use #4ABD8D (Kenlo green) ✓
- Red "X" marks use appropriate red/pink tones ✓
- Some badges use correct colors

#### Content Structure
- 5 kombos displayed: Imob Start, Imob Pro, Locação Pro, Core Gestão, Elite ✓
- Comparison table with checkmarks/X marks ✓
- "Qual Kombo é Ideal?" section with descriptions ✓
- CTA buttons present ✓

### ❌ What Needs Fixing

#### 1. Hero Section
- **Current:** White/light background
- **Should be:** Could use azul marinho #1A202C background like Home page Kombos section for consistency
- **Current:** Generic layout
- **Should be:** More impactful, premium style matching product pages

#### 2. Kombo Cards (First Section)
- **Current:** Cards use colored icons (blue, pink/red, green, purple, orange)
- **Should be:** Consistent with Kenlo Design System - use white boxes with borders, strategic use of #F82E52 for highlights
- **Current:** "POPULAR" and "MELHOR" badges in various colors
- **Should be:** Consistent badge style with #F82E52 background

#### 3. Comparison Table
- **Current:** Appears functional but generic styling
- **Should be:** Match IMOB+Site pricing table style (clean, #F2F2F2 headers, proper spacing)
- **Current:** Green checkmarks and red X marks (good)
- **Keep:** This is working well

#### 4. "Qual Kombo é Ideal?" Section
- **Current:** Cards with colored backgrounds/borders
- **Should be:** White boxes with border-gray-200, shadow-sm, rounded-lg (Kenlo style)
- **Current:** Various badge colors
- **Should be:** Consistent #F82E52 for discount badges

#### 5. Typography
- **Status:** Appears to use Manrope (inherited globally) ✓
- **Keep:** This is working

#### 6. Overall Style
- **Current:** More colorful/playful with multiple colors (blue, pink, green, purple, orange)
- **Should be:** Informative premium style with strategic use of only Kenlo colors (#F82E52, #4ABD8D, #1A202C, white, #F2F2F2)

## Specific Issues Found

1. **Inconsistent color palette:** Using blue, purple, orange icons instead of sticking to Kenlo colors
2. **Card backgrounds:** Not using clean white boxes with subtle borders like other pages
3. **Hero section:** Lacks impact compared to product pages
4. **Badge inconsistency:** "POPULAR" and "MELHOR" badges don't match Kenlo Design System

## Recommended Changes

### Priority 1: Color Consistency
- Replace all blue/purple/orange elements with Kenlo colors only
- Imob Start icon: Use #F82E52 or keep neutral
- Imob Pro icon: Use #F82E52 (it's already pink/red, close)
- Locação Pro icon: Use #4ABD8D or #F82E52
- Core Gestão icon: Use neutral or #1A202C
- Elite icon: Use #F82E52 (it's already orange, change to red)

### Priority 2: Card Redesign
- Change all kombo cards to white bg with border-gray-200
- Use #F82E52 only for discount badges and highlights
- Remove colored backgrounds from cards

### Priority 3: Hero Section
- Consider azul marinho #1A202C background for consistency with Home page
- Or keep white but make more impactful with better typography hierarchy

### Priority 4: Comparison Table
- Match IMOB+Site pricing table styling
- Use #F2F2F2 for header backgrounds
- Keep green checkmarks (#4ABD8D) and red X marks

## Comparison with Other Pages

### IMOB+Site Page (Reference)
- Clean white boxes with border-gray-200 ✓
- Strategic use of #F82E52 for highlights ✓
- #1A202C for contrast sections ✓
- #F2F2F2 for neutral backgrounds ✓
- Informative premium style ✓

### Kombos Page (Current)
- Multiple colors (blue, purple, orange) ✗
- Colored card backgrounds ✗
- Less premium feel ✗
- Needs alignment with Kenlo Design System ✗

## Conclusion
Kombos page needs redesign to match Kenlo Design System used in IMOB+Site, Locação, and all add-on pages. Focus on color consistency (#F82E52, #4ABD8D, #1A202C only), clean white boxes, and informative premium style.
