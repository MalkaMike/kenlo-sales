/**
 * Block G — Matriz de Funcionalidades — Fonte Única de Verdade
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check, X } from "lucide-react";
import { SectionHeader, type SectionProps } from "./pricingAdminShared";

interface FeatureEntry {
  name: string;
  description?: string;
  included: boolean;
  linkedToAddon?: string;
  linkedToPremiumService?: string;
}

export function SectionFeatureMatrix({ formData, updateValue, collapsed, onToggle }: SectionProps) {
  return (
    <div id="section-g" className="scroll-mt-24">
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="G"
            title="Matriz de Funcionalidades — Fonte Única de Verdade"
            description="Define exatamente quais funcionalidades estão incluídas em cada plano"
            collapsed={collapsed}
            onToggle={onToggle}
          />
          {!collapsed && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-xs text-red-900">
                <strong>Atenção:</strong>{" "}
                {formData.featureMatrix?._warning ||
                  "Qualquer alteração aqui impacta imediatamente calculadora, páginas públicas e PDFs"}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        {!collapsed && (
          <CardContent className="space-y-6">
            {["imob", "locacao"].map((product) => (
              <div key={product}>
                <h3 className="text-lg font-semibold capitalize border-b pb-2 mb-4">
                  Kenlo {product === "imob" ? "IMOB" : "Locação"}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-semibold">Funcionalidade</th>
                        <th className="text-center py-2 px-2 font-semibold uppercase">Prime</th>
                        <th className="text-center py-2 px-2 font-semibold uppercase">K</th>
                        <th className="text-center py-2 px-2 font-semibold uppercase">K²</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const allFeatures = new Map();
                        ["prime", "k", "k2"].forEach((plan) => {
                          formData.featureMatrix?.[product]?.[plan]?.forEach((feature: FeatureEntry) => {
                            if (!allFeatures.has(feature.name)) {
                              allFeatures.set(feature.name, feature);
                            }
                          });
                        });

                        return Array.from(allFeatures.values()).map((feature: FeatureEntry, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2">
                              <div>
                                <div className="font-medium">{feature.name}</div>
                                <div className="text-xs text-muted-foreground">{feature.description}</div>
                                {(feature.linkedToAddon || feature.linkedToPremiumService) && (
                                  <div className="text-[10px] text-blue-600 mt-1">
                                    →{" "}
                                    {feature.linkedToAddon
                                      ? `Add-on: ${feature.linkedToAddon}`
                                      : `Premium: ${feature.linkedToPremiumService}`}
                                  </div>
                                )}
                              </div>
                            </td>
                            {["prime", "k", "k2"].map((plan) => {
                              const planFeatures = formData.featureMatrix?.[product]?.[plan] || [];
                              const planFeature = planFeatures.find((f: FeatureEntry) => f.name === feature.name);
                              const isIncluded = planFeature?.included || false;

                              return (
                                <td key={plan} className="text-center py-2 px-2">
                                  <button
                                    onClick={() => {
                                      const featureIdx = planFeatures.findIndex(
                                        (f: FeatureEntry) => f.name === feature.name
                                      );
                                      if (featureIdx >= 0) {
                                        updateValue(
                                          ["featureMatrix", product, plan, String(featureIdx), "included"],
                                          !isIncluded
                                        );
                                      }
                                    }}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
                                  >
                                    {isIncluded ? (
                                      <Check className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <X className="w-5 h-5 text-muted-foreground" />
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
