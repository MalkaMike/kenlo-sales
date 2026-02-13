/**
 * Block C — Add-ons — Preços Base e Escopo
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye } from "lucide-react";
import {
  SectionHeader, NumberInput, HelperText, formatNumber,
  type SectionWithPreviewProps,
} from "./pricingAdminShared";

export function SectionAddons({
  formData, updateValue, collapsed, onToggle, getPreviewPrices,
}: SectionWithPreviewProps) {
  return (
    <div id="section-c" className="scroll-mt-24">
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="C"
            title="Add-ons — Preços Base e Escopo"
            description="Preços recorrentes, implementação e disponibilidade por produto"
            collapsed={collapsed}
            onToggle={onToggle}
          />
        </CardHeader>
        {!collapsed && (
          <CardContent className="space-y-4">
            {Object.entries(formData.addons || {}).map(([addonKey, addonData]: [string, any]) => {
              if (addonKey.startsWith("_")) return null;
              const preview = getPreviewPrices(addonData.annualPrice);

              return (
                <Card key={addonKey} className="border-l-4 border-l-accent/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base capitalize">Kenlo {addonKey}</CardTitle>
                        <CardDescription className="text-xs">
                          Disponível em: <strong>{addonData.availability?.join(", ")}</strong>
                          {addonData.shareable && " • Compartilhável entre produtos"}
                        </CardDescription>
                      </div>
                      {preview && addonData.annualPrice > 0 && (
                        <div className="hidden md:flex items-center gap-1 text-[10px]">
                          <Eye className="w-3 h-3 text-primary" />
                          <span className="text-muted-foreground">M:</span>
                          <span className="font-semibold text-primary">R$ {formatNumber(preview.monthly)}</span>
                          <span className="text-muted-foreground ml-1">A:</span>
                          <span className="font-semibold text-primary">R$ {formatNumber(preview.annual)}</span>
                          <span className="text-muted-foreground ml-1">B:</span>
                          <span className="font-semibold text-primary">R$ {formatNumber(preview.biennial)}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs">Preço Anual (R$)</Label>
                      <NumberInput
                        value={addonData.annualPrice}
                        onChange={(val: number) => updateValue(["addons", addonKey, "annualPrice"], val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Implementação (R$)</Label>
                      <NumberInput
                        value={addonData.implementation}
                        onChange={(val: number) => updateValue(["addons", addonKey, "implementation"], val)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unidades Inclusas</Label>
                      <NumberInput
                        value={addonData.includedUnits?.quantity || 0}
                        onChange={(val: number) =>
                          updateValue(["addons", addonKey, "includedUnits", "quantity"], val)
                        }
                        disabled={!addonData.includedUnits}
                      />
                      {addonData.includedUnits && <HelperText>{addonData.includedUnits.type}</HelperText>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={addonData.shareable}
                        onCheckedChange={(checked) =>
                          updateValue(["addons", addonKey, "shareable"], checked)
                        }
                      />
                      <Label className="text-xs">Compartilhável</Label>
                    </div>
                  </CardContent>
                  {addonData._note && (
                    <CardContent className="pt-0">
                      <HelperText>{addonData._note}</HelperText>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
