/**
 * Block F — Custos Variáveis Pós-Pago (por Faixa de Uso)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SectionHeader, NumberInput, HelperText, type SectionProps } from "./pricingAdminShared";

interface VariableCostTier {
  from: number;
  to: number;
  price?: number;
  rate?: number;
}

interface VariableCostData {
  product: string;
  unit: string;
  tiers: Record<string, VariableCostTier[]>;
  _note?: string;
}

export function SectionVariableCosts({ formData, updateValue, collapsed, onToggle }: SectionProps) {
  return (
    <div id="section-f" className="scroll-mt-24">
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="F"
            title="Custos Variáveis Pós-Pago (por Faixa de Uso)"
            description="Preços por faixa de uso para usuários, contratos, leads, boletos, splits e seguros"
            collapsed={collapsed}
            onToggle={onToggle}
          />
        </CardHeader>
        {!collapsed && (
          <CardContent className="space-y-6">
            {(Object.entries(formData.variableCosts || {}) as [string, VariableCostData][]).map(([costKey, costData]) => {
              if (costKey.startsWith("_")) return null;
              return (
                <Card key={costKey} className="border-l-4 border-l-orange-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base capitalize">
                      {costKey.replace(/([A-Z])/g, " $1").trim()}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Produto: <strong>{costData.product}</strong> • Unidade:{" "}
                      <strong>{costData.unit}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(Object.entries(costData.tiers || {}) as [string, VariableCostTier[]][]).map(([planKey, tiers]) => (
                      <div key={planKey} className="mb-4">
                        <Label className="text-xs uppercase font-semibold mb-2 block">{planKey}</Label>
                        <div className="space-y-2">
                          {tiers.map((tier: VariableCostTier, idx: number) => (
                            <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                              <div>
                                <Label className="text-[10px]">De</Label>
                                <NumberInput
                                  value={tier.from || 0}
                                  onChange={(val: number) =>
                                    updateValue([
                                      "variableCosts", costKey, "tiers", planKey, String(idx), "from",
                                    ], val)
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-[10px]">Até</Label>
                                <NumberInput
                                  value={tier.to || 0}
                                  onChange={(val: number) =>
                                    updateValue([
                                      "variableCosts", costKey, "tiers", planKey, String(idx), "to",
                                    ], val)
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-[10px]">
                                  {tier.price !== undefined ? "Preço" : "Taxa (%)"}
                                </Label>
                                <NumberInput
                                  value={
                                    tier.price !== undefined
                                      ? tier.price || 0
                                      : (tier.rate || 0) * 100
                                  }
                                  onChange={(val: number) => {
                                    if (tier.price !== undefined) {
                                      updateValue([
                                        "variableCosts", costKey, "tiers", planKey, String(idx), "price",
                                      ], val);
                                    } else {
                                      updateValue([
                                        "variableCosts", costKey, "tiers", planKey, String(idx), "rate",
                                      ], val / 100);
                                    }
                                  }}
                                />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {tier.to === 999999 ? "\u221E" : `Faixa ${idx + 1}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {costData._note && <HelperText>{costData._note}</HelperText>}
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
