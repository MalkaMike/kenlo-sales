/**
 * StickyBar - Sticky bottom bar with summary and quick actions
 * Shows only when minimum data is filled, displays value breakdown (pre-paid + post-paid = total)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, ChevronUp, Download, Loader2 } from "lucide-react";
import { useCalc } from "./CalculadoraContext";
import { formatCurrency, frequencyLabels, frequencyBadges, frequencyInstallments } from "./types";
import { calculatePostPaidData } from "@/components/kombo/komboColumnCalculators";
import { trpc } from "@/lib/trpc";

function PricingBibleButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const generatePDF = trpc.pricingAdmin.generateReferencePDF.useMutation();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const result = await generatePDF.mutateAsync();
      // Convert base64 to blob and trigger download
      const byteCharacters = atob(result.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Pricing Bible:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-xs gap-1.5 hidden lg:flex text-muted-foreground hover:text-primary"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      Pricing Bible
    </Button>
  );
}

export function StickyBar() {
  const {
    product,
    imobPlan,
    locPlan,
    frequency,
    activeKombo,
    komboInfo,
    showStickyBar,
    calculateMonthlyRecurring,
    calculateTotalImplementation,
    metrics,
    addons,
  } = useCalc();

  // Check if minimum data is filled to show banner
  const hasMinimumData = () => {
    // Must have at least one product selected and a plan chosen
    if (product === "imob" && !imobPlan) return false;
    if (product === "loc" && !locPlan) return false;
    if (product === "both" && (!imobPlan || !locPlan)) return false;
    
    return true;
  };

  // Calculate pre-paid and post-paid breakdown
  const getValueBreakdown = () => {
    const totalMonthly = calculateMonthlyRecurring(activeKombo !== "none");
    
    // Calculate post-paid using the same logic as KomboComparisonTable
    const postPaidData = calculatePostPaidData(
      {
        product,
        imobPlan,
        locPlan,
        frequency,
        addons,
        imobUsers: metrics.imobUsers || 0,
        closingsPerMonth: typeof metrics.closingsPerMonth === 'number' ? metrics.closingsPerMonth : 0,
        leadsPerMonth: metrics.leadsPerMonth || 0,
        contractsUnderManagement: metrics.contractsUnderManagement || 0,
        newContractsPerMonth: typeof metrics.newContractsPerMonth === 'number' ? metrics.newContractsPerMonth : 0,
        wantsWhatsApp: metrics.wantsWhatsApp || false,
        vipSupport: false,
        dedicatedCS: false,
      },
      imobPlan,
      locPlan,
      product === "imob" || product === "both",
      product === "loc" || product === "both",
      addons.leads || false,
      addons.assinatura || false,
      addons.pay || false
    );

    const postPaidTotal = postPaidData.postPaidTotal;
    const prePaidTotal = totalMonthly - postPaidTotal;
    
    return {
      prePaid: prePaidTotal,
      postPaid: postPaidTotal,
      total: totalMonthly,
      implementation: calculateTotalImplementation(activeKombo !== "none"),
    };
  };

  const shouldShow = showStickyBar && hasMinimumData();
  const breakdown = shouldShow ? getValueBreakdown() : null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        shouldShow ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Plan info */}
            <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
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

            {/* Center: Value breakdown */}
            {breakdown && (
              <div className="flex flex-col items-center flex-grow">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-0.5">
                  <span className="flex items-center gap-1">
                    <span className="text-[9px] text-primary/70 font-medium">Pré</span>
                    <span>{formatCurrency(breakdown.prePaid)}</span>
                  </span>
                  <span className="text-gray-300">+</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[9px] text-emerald-600/70 font-medium">Pós</span>
                    <span>{formatCurrency(breakdown.postPaid)}</span>
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    Total Mensal
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(breakdown.total)}
                  </span>
                </div>
                {activeKombo !== "none" && komboInfo && (
                  <span className="text-[10px] text-green-600 font-medium">
                    {Math.round((komboInfo.discount || 0) * 100)}% OFF com{" "}
                    {komboInfo.name}
                  </span>
                )}
              </div>
            )}

            {/* Right: Implementation fee + Actions */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {breakdown && breakdown.implementation > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider">
                    Implantação
                  </span>
                  <span className="text-sm font-semibold text-gray-600">
                    {formatCurrency(breakdown.implementation)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <PricingBibleButton />
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  Topo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
