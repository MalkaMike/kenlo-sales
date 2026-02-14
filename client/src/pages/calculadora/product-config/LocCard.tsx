/**
 * LocCard - LOC product configuration card
 * Shows contracts, new contracts/month inputs and plan selector
 */

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, Key } from "lucide-react";
import { useCalc } from "../CalculadoraContext";
import { type PlanTier, toNum, parseIntegerInput } from "../types";
import { TierBreakdown } from "./TierBreakdown";

const LOC_ADDITIONAL_CONTRACTS: Record<PlanTier, Array<{ from: number; to: number; price: number }>> = {
  prime: [{ from: 1, to: Infinity, price: 3 }],
  k: [
    { from: 1, to: 250, price: 3 },
    { from: 251, to: Infinity, price: 2.5 },
  ],
  k2: [
    { from: 1, to: 250, price: 3 },
    { from: 251, to: 500, price: 2.5 },
    { from: 501, to: Infinity, price: 2 },
  ],
};

export function LocCard() {
  const { product, metrics, setMetrics, locPlan, setLocPlan } = useCalc();
  if (product !== "loc" && product !== "both") return null;

  const included = locPlan === 'prime' ? 100 : locPlan === 'k' ? 150 : 500;
  const totalContracts = toNum(metrics.contractsUnderManagement);
  const additional = Math.max(0, totalContracts - included);

  return (
    <Card className="bg-green-50/20 border-green-200/40 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-md hover:border-green-400">
      <CardContent className="pt-3 pb-3 space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Key className="w-3.5 h-3.5 text-green-600" />
          <span className="font-semibold text-xs text-gray-900">Kenlo Locação</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <Label htmlFor="contracts" className="text-xs text-gray-600">Contratos</Label>
            <div className="relative">
              <Input
                id="contracts"
                type="number"
                inputMode="numeric"
                value={metrics.contractsUnderManagement}
                onChange={(e) => {
                  const parsed = parseIntegerInput(e.target.value, 1);
                  setMetrics({ ...metrics, contractsUnderManagement: parsed });
                }}
                placeholder="Ex: 1200 contratos"
                min="1"
                className="mt-0.5 h-8 text-xs pr-8"
              />
              {toNum(metrics.contractsUnderManagement) >= 1 && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="newContracts" className="text-xs text-gray-600">Novos/mês</Label>
            <div className="relative">
              <Input
                id="newContracts"
                type="number"
                inputMode="numeric"
                value={metrics.newContractsPerMonth}
                onChange={(e) => {
                  const parsed = parseIntegerInput(e.target.value, 0);
                  setMetrics({ ...metrics, newContractsPerMonth: parsed });
                }}
                placeholder="Ex: 50"
                min="0"
                className="mt-0.5 h-8 text-xs pr-8"
              />
              {toNum(metrics.newContractsPerMonth) > 0 && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* Plan selector inline */}
        <div className="pt-2 border-t border-green-200/40">
          <div className="text-[10px] text-gray-500 mb-1.5">Plano</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(["prime", "k", "k2"] as const).map((plan) => {
              const isSelected = locPlan === plan;
              return (
                <button
                  key={plan}
                  onClick={() => setLocPlan(plan)}
                  className={`p-2 rounded border transition-all text-center ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="font-bold text-xs">{plan === "prime" ? "Prime" : plan.toUpperCase()}</div>
                </button>
              );
            })}
          </div>
          <TierBreakdown
            tiers={LOC_ADDITIONAL_CONTRACTS[locPlan]}
            additional={additional}
            included={included}
            unitLabel="contratos"
            kenloPhrase="você paga só o que usa. E mais você usa, menos você paga por contrato."
          />
        </div>
      </CardContent>
    </Card>
  );
}
