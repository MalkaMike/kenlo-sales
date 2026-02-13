/**
 * Block D — Serviços Premium (Recorrentes e Não Recorrentes)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionHeader, NumberInput, HelperText, type SectionProps } from "./pricingAdminShared";

export function SectionPremiumServices({ formData, updateValue, collapsed, onToggle }: SectionProps) {
  return (
    <div id="section-d" className="scroll-mt-24">
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="D"
            title="Serviços Premium (Recorrentes e Não Recorrentes)"
            description="Serviços mensais recorrentes e serviços únicos com regras de herança e duplicação"
            collapsed={collapsed}
            onToggle={onToggle}
          />
        </CardHeader>
        {!collapsed && (
          <CardContent className="space-y-6">
            {/* Recurring Services */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Serviços Recorrentes Mensais</h3>
              <div className="space-y-4">
                {Object.entries(formData.premiumServices?.recurring || {}).map(
                  ([serviceKey, serviceData]: [string, any]) => (
                    <Card key={serviceKey} className="border-l-4 border-l-purple-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          {serviceKey === "vipSupport" ? "Suporte VIP" : "CS Dedicado"}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Herança: <strong>{serviceData.inheritanceRule}</strong>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs">Preço Mensal (R$)</Label>
                            <NumberInput
                              value={serviceData.monthlyPrice}
                              onChange={(val: number) =>
                                updateValue(["premiumServices", "recurring", serviceKey, "monthlyPrice"], val)
                              }
                            />
                          </div>
                          <div className="col-span-3 space-y-2">
                            <Label className="text-xs">Habilitado por padrão em:</Label>
                            <div className="flex gap-4">
                              {["prime", "k", "k2"].map((plan) => (
                                <div key={plan} className="flex items-center gap-2">
                                  <Checkbox
                                    checked={serviceData.defaultByPlan?.[plan]}
                                    onCheckedChange={(checked) =>
                                      updateValue(
                                        ["premiumServices", "recurring", serviceKey, "defaultByPlan", plan],
                                        checked
                                      )
                                    }
                                  />
                                  <Label className="text-xs uppercase">{plan}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {serviceData._inheritanceNote && (
                          <HelperText>{serviceData._inheritanceNote}</HelperText>
                        )}
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>

            {/* Non-Recurring Services */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">Serviços Não Recorrentes (Únicos)</h3>
              <div className="space-y-4">
                {Object.entries(formData.premiumServices?.nonRecurring || {}).map(
                  ([serviceKey, serviceData]: [string, any]) => (
                    <Card key={serviceKey} className="border-l-4 border-l-indigo-300">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          {serviceKey === "treinamentoOnline" ? "Treinamento Online" : "Treinamento Presencial"}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Duplicação: <strong>{serviceData.duplicationRule}</strong>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label className="text-xs">Preço Unitário (R$)</Label>
                            <NumberInput
                              value={serviceData.unitPrice}
                              onChange={(val: number) =>
                                updateValue(["premiumServices", "nonRecurring", serviceKey, "unitPrice"], val)
                              }
                            />
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs">Quantidade Inclusa por Plano</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {["prime", "k", "k2"].map((plan) => (
                                <div key={plan}>
                                  <Label className="text-[10px] uppercase text-muted-foreground">{plan}</Label>
                                  <NumberInput
                                    value={serviceData.includedQuantityByPlan?.[plan] || 0}
                                    onChange={(val: number) =>
                                      updateValue(
                                        ["premiumServices", "nonRecurring", serviceKey, "includedQuantityByPlan", plan],
                                        val
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        {serviceData._duplicationNote && (
                          <HelperText>{serviceData._duplicationNote}</HelperText>
                        )}
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
