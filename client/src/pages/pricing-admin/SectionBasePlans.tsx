/**
 * Block B — Planos Base — Preço Anual de Fundação
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";
import {
  SectionHeader, NumberInput, HelperText, PricePreview, formatNumber,
  type SectionWithPreviewProps,
} from "./pricingAdminShared";

export function SectionBasePlans({
  formData, updateValue, collapsed, onToggle, getPreviewPrices,
}: SectionWithPreviewProps) {
  return (
    <div id="section-b" className="scroll-mt-24">
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="B"
            title="Planos Base — Preço Anual de Fundação"
            description="Nada de mensal aqui. Nada de desconto aqui. Este é o preço raiz."
            collapsed={collapsed}
            onToggle={onToggle}
          />
        </CardHeader>
        {!collapsed && (
          <CardContent className="space-y-6">
            {["imob", "locacao"].map((product) => (
              <div key={product} className="space-y-4">
                <h3 className="text-lg font-semibold capitalize border-b pb-2">
                  {product === "imob" ? "Kenlo IMOB" : "Kenlo Locação"}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {["prime", "k", "k2"].map((plan) => {
                    const planData = formData.basePlans?.[product]?.[plan];
                    if (!planData) return null;
                    const preview = getPreviewPrices(planData.annualPrice);

                    return (
                      <Card key={plan} className="border-l-4 border-l-secondary/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base uppercase">{plan}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs">Preço Anual Base (R$)</Label>
                            <NumberInput
                              value={planData.annualPrice}
                              onChange={(val: number) =>
                                updateValue(["basePlans", product, plan, "annualPrice"], val)
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-xs">
                              {planData.includedUnits?.type === "users"
                                ? "Usuários Inclusos"
                                : "Contratos Inclusos"}
                            </Label>
                            <NumberInput
                              value={planData.includedUnits?.quantity || 0}
                              onChange={(val: number) =>
                                updateValue(["basePlans", product, plan, "includedUnits", "quantity"], val)
                              }
                            />
                          </div>
                          {preview && (
                            <div className="pt-2 border-t border-dashed space-y-1">
                              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Preview calculado
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <PricePreview label="Mensal" value={`R$ ${formatNumber(preview.monthly)}`} />
                                <PricePreview label="Sem." value={`R$ ${formatNumber(preview.semestral)}`} />
                                <PricePreview label="Anual" value={`R$ ${formatNumber(preview.annual)}`} />
                                <PricePreview label="Bienal" value={`R$ ${formatNumber(preview.biennial)}`} />
                              </div>
                            </div>
                          )}
                          <HelperText>{planData.internalNote}</HelperText>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
