/**
 * KomboComparisonSection - Wraps KomboComparisonTable with its complex onPlanSelected handler
 * Extracted from CalculadoraPage.tsx (lines ~2715-2789)
 */

import { KomboComparisonTable } from "@/components/KomboComparisonTable";
import { useCalc } from "./CalculadoraContext";
import { type ProductSelection, KOMBOS, toNum } from "./types";

export function KomboComparisonSection() {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    frequency,
    setProduct,
    setAddons,
    setSelectedPlan,
    setSelectedPlans,
    setSelectedColumnsData,
    setFrequency,
    setAnimateMetrics,
    prevProductRef,
  } = useCalc();

  return (
    <div id="kombo-comparison-section">
      <KomboComparisonTable
        product={product}
        imobPlan={imobPlan}
        locPlan={locPlan}
        addons={addons}
        frequency={frequency}
        wantsWhatsApp={metrics.wantsWhatsApp}
        imobUsers={toNum(metrics.imobUsers)}
        closingsPerMonth={toNum(metrics.closingsPerMonth)}
        leadsPerMonth={toNum(metrics.leadsPerMonth)}
        contractsUnderManagement={toNum(metrics.contractsUnderManagement)}
        newContractsPerMonth={toNum(metrics.newContractsPerMonth)}
        vipSupport={metrics.imobVipSupport || metrics.locVipSupport}
        dedicatedCS={metrics.imobDedicatedCS || metrics.locDedicatedCS}
        onPlanSelected={(planId) => {
          setSelectedPlan(planId);
          // Auto-adjust product selection AND add-ons based on Kombo
          if (planId && planId !== "none") {
            const kombo = KOMBOS[planId as keyof typeof KOMBOS];
            if (kombo) {
              // Set product based on Kombo requirements
              const newProduct: ProductSelection =
                planId === "imob_start" || planId === "imob_pro"
                  ? "imob"
                  : planId === "locacao_pro"
                    ? "loc"
                    : "both";

              // Trigger animation if product changed
              if (newProduct !== prevProductRef.current) {
                setAnimateMetrics(true);
                setTimeout(() => setAnimateMetrics(false), 1200);
              }

              prevProductRef.current = newProduct;
              setProduct(newProduct);

              // AUTO-ACTIVATE required add-ons for this Kombo
              const requiredAddons = (kombo.requiredAddons || []) as string[];
              const forbiddenAddons = (
                (kombo as any).forbiddenAddons || []
              ) as string[];
              const maxAddons = (kombo as any).maxAddons;

              // Build new addons state
              const newAddons = {
                leads:
                  requiredAddons.includes("leads") &&
                  !forbiddenAddons.includes("leads"),
                inteligencia:
                  requiredAddons.includes("inteligencia") &&
                  !forbiddenAddons.includes("inteligencia"),
                assinatura:
                  requiredAddons.includes("assinatura") &&
                  !forbiddenAddons.includes("assinatura"),
                pay:
                  requiredAddons.includes("pay") &&
                  !forbiddenAddons.includes("pay"),
                seguros:
                  requiredAddons.includes("seguros") &&
                  !forbiddenAddons.includes("seguros"),
                cash:
                  requiredAddons.includes("cash") &&
                  !forbiddenAddons.includes("cash"),
              };

              // For Core Gestão (maxAddons = 0), disable all add-ons
              if (maxAddons === 0) {
                setAddons({
                  leads: false,
                  inteligencia: false,
                  assinatura: false,
                  pay: false,
                  seguros: false,
                  cash: false,
                });
              } else {
                setAddons(newAddons);
              }
            }
          }
        }}
        onPlansSelected={(planIds) => setSelectedPlans(planIds)}
        onSelectedColumnsData={(cols) => setSelectedColumnsData(cols)}
        onFrequencyChange={setFrequency}
      />
    </div>
  );
}
