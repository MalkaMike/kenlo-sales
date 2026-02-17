/**
 * CalculadoraPage - Refactored main component
 * Composes all sub-components through CalculadoraContext
 * 
 * Original: 4,741 lines in a single file
 * Refactored into:
 *   - types.tsx           (~318 lines) - Types, constants, utilities
 *   - useCalculadora.ts   (~992 lines) - All state and business logic
 *   - CalculadoraContext.tsx (~25 lines) - React Context provider
 *   - BusinessNatureSection.tsx (~279 lines) - Business nature form
 *   - ProductConfigSection.tsx (~1,012 lines) - Product config, benefits, add-ons
 *   - KomboComparisonSection.tsx (~115 lines) - Kombo comparison table wrapper
 *   - ReceitaExtraSection.tsx (~994 lines) - Revenue extra section
 *   - ExportActionsSection.tsx (~124 lines) - Export buttons and validation
 *   - QuoteInfoHandler.tsx (~799 lines) - QuoteInfoDialog with PDF generation
 *   - StickyBar.tsx (~172 lines) - Sticky bottom bar
 *   - index.tsx (this file) - Main composition
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, RotateCcw } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";

import { CalculadoraProvider, useCalc } from "./CalculadoraContext";
import { BusinessNatureSection } from "./BusinessNatureSection";
import { ProductConfigSection } from "./ProductConfigSection";
import { KomboComparisonSection } from "./KomboComparisonSection";
import { ReceitaExtraSection } from "./ReceitaExtraSection";
import { ExportActionsSection } from "./ExportActionsSection";
import { QuoteInfoHandler } from "./QuoteInfoHandler";
import { StickyBar } from "./StickyBar";

/**
 * Inner component that uses the context
 */
function CalculadoraContent() {
  const { handleReset } = useCalc();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 sm:py-12 px-4 sm:px-6">
      <div className="container max-w-6xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Cotação" }]} />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Cotação Kenlo
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Veja o investimento ideal para sua imobiliária — em tempo real
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetar
          </Button>
        </div>

        {/* Main Calculator Card */}
        <Card className="shadow-xl">
          <CardContent className="p-4 sm:p-6">
            {/* Step 0: Business Nature */}
            <BusinessNatureSection />

            {/* §1+2: Product Configuration + §3: Benefits + §4: Add-ons */}
            <ProductConfigSection />

            {/* §5: Kombo Comparison Table */}
            <KomboComparisonSection />

            {/* §6: Receita Extra */}
            <ReceitaExtraSection />

            {/* Export Actions */}
            <ExportActionsSection />
          </CardContent>
        </Card>
      </div>

      {/* Quote Info Dialog */}
      <QuoteInfoHandler />

      {/* Sticky Summary Bar */}
      <StickyBar />
    </div>
  );
}

/**
 * Main exported component - wraps content with CalculadoraProvider
 */
export default function CalculadoraPage() {
  return (
    <CalculadoraProvider>
      <CalculadoraContent />
    </CalculadoraProvider>
  );
}
