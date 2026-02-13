/**
 * Block A — Ciclo de Pagamento (Fundação)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { SectionHeader, NumberInput, HelperText, type SectionProps } from "./pricingAdminShared";

const CYCLE_LABELS: Record<string, string> = {
  monthly: "Mensal",
  semiannual: "Semestral",
  annual: "Anual",
  biennial: "Bienal",
};

export function SectionPaymentCycles({ formData, updateValue, collapsed, onToggle }: SectionProps) {
  return (
    <div id="section-a" className="scroll-mt-24">
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="A"
            title="Ciclo de Pagamento (Fundação)"
            description="Multiplicadores e descontos por ciclo — aplicados ANTES de qualquer desconto de combo"
            collapsed={collapsed}
            onToggle={onToggle}
          />
          {!collapsed && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-900">
                <strong>Regra global:</strong> O desconto de ciclo é sempre aplicado antes de qualquer desconto de combo.
                Ordem: Preço Base → Ciclo → Combo.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        {!collapsed && (
          <CardContent className="space-y-6">
            {Object.entries(formData.paymentCycles || {}).map(([cycleKey, cycleData]: [string, any]) => {
              if (cycleKey.startsWith("_")) return null;
              return (
                <Card key={cycleKey} className="border-l-4 border-l-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg capitalize">
                      {CYCLE_LABELS[cycleKey] || cycleKey}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tipo: <strong>{cycleData.type}</strong> • {cycleData.displayLabel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs">Multiplicador</Label>
                      <NumberInput
                        value={cycleData.multiplier}
                        onChange={(val: number) => updateValue(["paymentCycles", cycleKey, "multiplier"], val)}
                      />
                      <HelperText>Fator aplicado ao preço anual</HelperText>
                    </div>
                    <div>
                      <Label className="text-xs">Desconto vs Mensal (%)</Label>
                      <NumberInput
                        value={cycleData.discountVsMonthly || 0}
                        onChange={(val: number) => updateValue(["paymentCycles", cycleKey, "discountVsMonthly"], val)}
                      />
                      <HelperText>
                        {cycleData.discountVsMonthly > 0 ? `${cycleData.discountVsMonthly}% OFF` : "Referência"}
                      </HelperText>
                    </div>
                    <div>
                      <Label className="text-xs">Máx. Parcelas</Label>
                      <NumberInput
                        value={cycleData.maxInstallments || 1}
                        onChange={(val: number) => updateValue(["paymentCycles", cycleKey, "maxInstallments"], val)}
                      />
                      <HelperText>
                        {cycleData.maxInstallments > 1 ? `Até ${cycleData.maxInstallments}x` : "Pagamento único"}
                      </HelperText>
                    </div>
                    <div>
                      <Label className="text-xs">Fórmula</Label>
                      <Input
                        value={cycleData.formula}
                        onChange={(e) => updateValue(["paymentCycles", cycleKey, "formula"], e.target.value)}
                        className="h-7 text-sm font-mono"
                      />
                      <HelperText>Fórmula de cálculo explícita</HelperText>
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
