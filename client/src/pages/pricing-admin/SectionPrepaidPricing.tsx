/**
 * Block H — Pré-Pagamento (Desconto sobre Pós-Pago)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SectionHeader, NumberInput, HelperText, type SectionProps } from "./pricingAdminShared";

export function SectionPrepaidPricing({ formData, updateValue, collapsed, onToggle }: SectionProps) {
  const prepaid = formData.prepaidPricing;
  if (!prepaid) return null;

  const discountPct = prepaid.discountPercentage ?? 10;
  const multiplier = (100 - discountPct) / 100;

  // Helper to get example post-paid price from variable costs
  const getExampleTierPrice = (costKey: string, plan: string): number | null => {
    const vc = formData.variableCosts?.[costKey];
    if (!vc?.tiers?.[plan]?.[0]) return null;
    return vc.tiers[plan][0].price ?? null;
  };

  const items = [
    { key: "additionalUsers", label: "Usuários Adicionais", costKey: "additionalUsers", unit: "usuário" },
    { key: "additionalContracts", label: "Contratos Adicionais", costKey: "additionalContracts", unit: "contrato" },
    { key: "additionalLeads", label: "Leads Adicionais", costKey: "additionalLeads", unit: "lead" },
  ];

  return (
    <div id="section-h" className="scroll-mt-24">
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="H"
            title="Pré-Pagamento"
            description="Desconto sobre preço pós-pago para pagamento antecipado (Anual/Bienal)"
            collapsed={collapsed}
            onToggle={onToggle}
          />
        </CardHeader>
        {!collapsed && (
          <CardContent className="space-y-6">
            {/* Global discount percentage */}
            <Card className="border-l-4 border-l-green-400">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Desconto Global Pré-Pagamento
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    {discountPct}% OFF
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Percentual de desconto aplicado sobre o preço pós-pago quando o cliente opta por pré-pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <Label className="text-xs">Desconto (%)</Label>
                    <NumberInput
                      value={discountPct}
                      onChange={(val: number) => {
                        updateValue(["prepaidPricing", "discountPercentage"], val);
                        // Also update individual items
                        items.forEach(item => {
                          updateValue(["prepaidPricing", item.key, "discountPercentage"], val);
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Multiplicador</Label>
                    <div className="h-7 flex items-center text-sm font-mono text-muted-foreground">
                      × {multiplier.toFixed(2)}
                    </div>
                  </div>
                </div>
                <HelperText>
                  Preço pré-pago = preço pós-pago × {multiplier.toFixed(2)} (desconto de {discountPct}%).
                  Disponível apenas para ciclos Anual (12 meses) e Bienal (24 meses).
                </HelperText>
              </CardContent>
            </Card>

            {/* Per-item preview */}
            {items.map(({ key, label, costKey, unit }) => {
              const itemData = prepaid[key];
              if (!itemData) return null;

              return (
                <Card key={key} className="border-l-4 border-l-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {label}
                      <Badge variant="outline" className="text-[10px]">
                        {itemData.product}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        Método: <strong>{itemData.pricingMethod === "discount_on_postpaid" ? "Desconto sobre pós-pago" : itemData.pricingMethod}</strong>
                      </div>

                      {/* Preview table for each plan */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="text-left p-2 font-medium">Plano</th>
                              <th className="text-right p-2 font-medium">Pós-pago/{unit}</th>
                              <th className="text-right p-2 font-medium">Pré-pago/{unit}</th>
                              <th className="text-right p-2 font-medium">Economia</th>
                            </tr>
                          </thead>
                          <tbody>
                            {["prime", "k", "k2"].map(plan => {
                              const postPaidPrice = getExampleTierPrice(costKey, plan);
                              if (postPaidPrice === null) return null;
                              const prePaidPrice = postPaidPrice * multiplier;
                              const savings = postPaidPrice - prePaidPrice;
                              return (
                                <tr key={plan} className="border-t border-border/50">
                                  <td className="p-2 font-medium uppercase">{plan === "k2" ? "K²" : plan}</td>
                                  <td className="p-2 text-right text-muted-foreground line-through">
                                    R$ {postPaidPrice.toFixed(2).replace(".", ",")}
                                  </td>
                                  <td className="p-2 text-right font-semibold text-green-600">
                                    R$ {prePaidPrice.toFixed(2).replace(".", ",")}
                                  </td>
                                  <td className="p-2 text-right text-green-600">
                                    -R$ {savings.toFixed(2).replace(".", ",")}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <HelperText>
                        {itemData._note || `Preço pré-pago = preço pós-pago × ${multiplier.toFixed(2)}`}
                      </HelperText>
                    </div>
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
