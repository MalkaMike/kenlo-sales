/**
 * Block E — Kombos — Descontos Promocionais Cumulativos
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { SectionHeader, NumberInput, HelperText, type SectionProps } from "./pricingAdminShared";

export function SectionKombos({ formData, updateValue, collapsed, onToggle }: SectionProps) {
  return (
    <div id="section-e" className="scroll-mt-24">
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="E"
            title="Kombos — Descontos Promocionais Cumulativos"
            description="Descontos aplicados sobre o valor já ajustado pelo ciclo"
            collapsed={collapsed}
            onToggle={onToggle}
          />
          {!collapsed && (
            <Alert className="bg-green-50 border-green-200">
              <Info className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-xs text-green-900">
                <strong>Regra global:</strong>{" "}
                {formData.kombos?._globalRule || "Desconto aplicado sobre o valor já ajustado pelo ciclo"}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        {!collapsed && (
          <CardContent className="space-y-4">
            {Object.entries(formData.kombos || {}).map(([komboKey, komboData]: [string, any]) => {
              if (komboKey.startsWith("_")) return null;
              return (
                <Card key={komboKey} className="border-l-4 border-l-green-400">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{komboData.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Produtos: <strong>{komboData.productsIncluded?.join(", ")}</strong>
                          {komboData.addonsIncluded?.length > 0 && (
                            <>
                              {" "}• Add-ons: <strong>{komboData.addonsIncluded.join(", ")}</strong>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <div className="px-3 py-1 bg-green-100 rounded-full text-green-700 text-sm font-bold">
                        {Math.round(komboData.discount)}% OFF
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs">Desconto (%)</Label>
                      <NumberInput
                        value={komboData.discount}
                        onChange={(val: number) => updateValue(["kombos", komboKey, "discount"], val)}
                      />
                      <HelperText>Aplicado após desconto de ciclo</HelperText>
                    </div>
                    <div>
                      <Label className="text-xs">Implantações Gratuitas</Label>
                      <NumberInput
                        value={komboData.freeImplementations}
                        onChange={(val: number) =>
                          updateValue(["kombos", komboKey, "freeImplementations"], val)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Ordem de Aplicação</Label>
                      <Input value={komboData.discountOrder} disabled className="h-7 text-sm bg-muted" />
                      <HelperText>Sempre após ciclo (ordem 2)</HelperText>
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
