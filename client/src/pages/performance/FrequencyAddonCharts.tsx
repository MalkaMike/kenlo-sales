/**
 * FrequencyAddonCharts — Frequency distribution and Add-on popularity bar charts.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Zap } from "lucide-react";
import type { FrequencyBreakdownItem, AddonPopularityItem } from "./performanceCalculators";

interface FrequencyAddonChartsProps {
  frequencyBreakdown: FrequencyBreakdownItem[];
  addonPopularity: AddonPopularityItem[];
}

export function FrequencyAddonCharts({
  frequencyBreakdown,
  addonPopularity,
}: FrequencyAddonChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Frequência de Pagamento
          </CardTitle>
          <CardDescription>Distribuição por tipo de pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          {frequencyBreakdown.length > 0 ? (
            <div className="space-y-3">
              {frequencyBreakdown.map((freq) => (
                <div key={freq.frequency} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{freq.name}</div>
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${freq.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm">
                    <span className="font-medium">{freq.count}</span>
                    <span className="text-muted-foreground ml-1">
                      ({freq.percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma cotação encontrada
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add-ons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Add-ons Mais Populares
          </CardTitle>
          <CardDescription>Frequência de uso de cada add-on</CardDescription>
        </CardHeader>
        <CardContent>
          {addonPopularity.length > 0 ? (
            <div className="space-y-3">
              {addonPopularity.map((addon) => (
                <div key={addon.addon} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">{addon.name}</div>
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full transition-all"
                        style={{ width: `${addon.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm">
                    <span className="font-medium">{addon.count}</span>
                    <span className="text-muted-foreground ml-1">
                      ({addon.percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum add-on encontrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
