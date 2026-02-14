/**
 * StickyBar - Sticky bottom bar with summary and quick actions
 * Extracted from CalculadoraPage.tsx (lines ~4627-4738)
 */

import { Button } from "@/components/ui/button";
import { Calculator, ChevronUp, FileText, Settings } from "lucide-react";
import { toast } from "sonner";
import { useCalc } from "./CalculadoraContext";
import { formatCurrency, frequencyLabels, frequencyBadges, frequencyInstallments } from "./types";

export function StickyBar() {
  const {
    product,
    imobPlan,
    locPlan,
    frequency,
    activeKombo,
    komboInfo,
    showStickyBar,
    canExportPDF,
    selectedPlans,
    businessNature,
    isBusinessNatureComplete,
    setShowValidationErrors,
    setShowQuoteInfoDialog,
    calculateMonthlyRecurring,
  } = useCalc();

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Plan info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-500">
                      {product === "imob"
                        ? "IMOB"
                        : product === "loc"
                          ? "LOC"
                          : "IMOB + LOC"}
                    </span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs font-medium text-gray-500">
                      {product === "imob" || product === "both"
                        ? (imobPlan === "k2" ? <>K<sup className="text-[0.7em]">2</sup></> : imobPlan.toUpperCase())
                        : ""}
                      {product === "both" ? " + " : ""}
                      {product === "loc" || product === "both"
                        ? (locPlan === "k2" ? <>K<sup className="text-[0.7em]">2</sup></> : locPlan.toUpperCase())
                        : ""}
                    </span>
                    {komboInfo && (
                      <>
                        <span className="text-xs text-gray-300">|</span>
                        <span className="text-xs font-semibold text-primary">
                          {komboInfo.name}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {frequencyLabels[frequency]} ({frequencyBadges[frequency]})
                    {frequencyInstallments[frequency] &&
                      ` • ${frequencyInstallments[frequency]}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Total price */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                Total Mensal
              </span>
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                {formatCurrency(calculateMonthlyRecurring(activeKombo !== "none"))}
              </span>
              {activeKombo !== "none" && (
                <span className="text-[10px] text-green-600 font-medium">
                  {Math.round((komboInfo?.discount || 0) * 100)}% OFF com{" "}
                  {komboInfo?.name}
                </span>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs gap-1.5 hidden lg:flex text-muted-foreground hover:text-primary"
                onClick={() => {
                  window.location.href = "/admin/pricing";
                }}
              >
                <Settings className="w-3.5 h-3.5" />
                Configurar Preços
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5 hidden sm:flex"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <ChevronUp className="w-3.5 h-3.5" />
                Topo
              </Button>
              <Button
                size="sm"
                className="text-xs gap-1.5 bg-primary hover:bg-primary/90"
                onClick={() => {
                  if (!canExportPDF) {
                    toast.error(
                      "Faça login como vendedor autorizado para exportar cotações."
                    );
                    return;
                  }
                  const hasCompanyErrors =
                    !businessNature.companyName.trim() ||
                    !businessNature.ownerName.trim() ||
                    !businessNature.email.trim() ||
                    !businessNature.cellphone.trim();
                  if (!isBusinessNatureComplete() || hasCompanyErrors) {
                    setShowValidationErrors(true);
                    toast.error(
                      "Preencha todos os campos obrigatórios marcados com * antes de exportar."
                    );
                    const businessNatureSection = document.getElementById(
                      "business-nature-section"
                    );
                    if (businessNatureSection) {
                      businessNatureSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                    return;
                  }
                  if (selectedPlans.length === 0) {
                    toast.error(
                      "Selecione pelo menos 1 coluna na tabela antes de exportar."
                    );
                    return;
                  }
                  setShowValidationErrors(false);
                  setShowQuoteInfoDialog(true);
                }}
              >
                <FileText className="w-3.5 h-3.5" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
