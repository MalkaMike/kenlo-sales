/**
 * ProductConfigSection - Composes ImobCard, LocCard, BenefitsSection, and AddonsSection
 * This is the main product configuration section that orchestrates all sub-components
 */

import { Card, CardContent } from "@/components/ui/card";
import { useCalc } from "./CalculadoraContext";
import { type ProductSelection } from "./types";
import { ImobCard } from "./product-config/ImobCard";
import { LocCard } from "./product-config/LocCard";
import { BenefitsSection } from "./product-config/BenefitsSection";
import { AddonsSection } from "./product-config/AddonsSection";

export function ProductConfigSection() {
  const { product, setProduct, configSectionRef, animateMetrics } = useCalc();

  return (
    <>
      {/* §1+2: Configuration */}
      <div className="mb-4" ref={configSectionRef}>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Configuração</h2>
        <Card>
          <CardContent className="pt-4">
            {/* Product filter */}
            <div className="flex items-center gap-1.5 mb-3">
              {["imob", "loc", "both"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setProduct(opt as ProductSelection)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all border ${
                    product === opt
                      ? "bg-primary text-white font-semibold border-primary shadow-sm"
                      : "bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {opt === "imob" ? "Imob" : opt === "loc" ? "Locação" : "Ambos"}
                </button>
              ))}
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 transition-all duration-500 ${animateMetrics ? 'ring-2 ring-primary/30 rounded-lg' : ''}`}>
              <ImobCard />
              <LocCard />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* §3: Benefits */}
      <BenefitsSection />

      {/* §4: Add-ons */}
      <AddonsSection />
    </>
  );
}
