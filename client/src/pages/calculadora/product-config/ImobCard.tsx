/**
 * ImobCard - IMOB product configuration card
 * Shows user count, closings/month, leads/month inputs and plan selector
 */

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, TrendingUp } from "lucide-react";
import { useCalc } from "../CalculadoraContext";
import { type PlanTier, toNum, parseIntegerInput, fmtNum, fmtPrice } from "../types";
import { TierBreakdown } from "./TierBreakdown";

const IMOB_ADDITIONAL_USERS: Record<PlanTier, Array<{ from: number; to: number; price: number }>> = {
  prime: [{ from: 1, to: Infinity, price: 57 }],
  k: [
    { from: 1, to: 5, price: 47 },
    { from: 6, to: Infinity, price: 37 },
  ],
  k2: [
    { from: 1, to: 10, price: 37 },
    { from: 11, to: 100, price: 27 },
    { from: 101, to: Infinity, price: 17 },
  ],
};

export function ImobCard() {
  const { product, metrics, setMetrics, imobPlan, setImobPlan } = useCalc();
  if (product !== "imob" && product !== "both") return null;

  const included = imobPlan === 'prime' ? 2 : imobPlan === 'k' ? 7 : 15;
  const totalUsers = toNum(metrics.imobUsers);
  const additional = Math.max(0, totalUsers - included);

  return (
    <Card className="bg-blue-50/20 border-blue-200/40">
      <CardContent className="pt-3 pb-3 space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-xs text-gray-900">Kenlo IMOB</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <Label htmlFor="imobUsers" className="text-xs text-gray-600">Usuários</Label>
            <div className="relative">
              <Input
                id="imobUsers"
                type="number"
                inputMode="numeric"
                value={metrics.imobUsers}
                onChange={(e) => {
                  const parsed = parseIntegerInput(e.target.value, 1);
                  setMetrics({ ...metrics, imobUsers: parsed });
                }}
                placeholder="Ex: 5 usuários"
                min="1"
                className="mt-0.5 h-8 text-xs pr-8"
              />
              {toNum(metrics.imobUsers) >= 1 && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="closings" className="text-xs text-gray-600">Fechamentos/mês</Label>
            <div className="relative">
              <Input
                id="closings"
                type="number"
                inputMode="numeric"
                value={metrics.closingsPerMonth}
                onChange={(e) => {
                  const parsed = parseIntegerInput(e.target.value, 0);
                  setMetrics({ ...metrics, closingsPerMonth: parsed });
                }}
                placeholder="Ex: 10"
                min="0"
                className="mt-0.5 h-8 text-xs pr-8"
              />
              {toNum(metrics.closingsPerMonth) > 0 && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="leadsPerMonth" className="text-xs text-gray-600">Leads/mês</Label>
            <div className="relative">
              <Input
                id="leadsPerMonth"
                type="number"
                inputMode="numeric"
                value={metrics.leadsPerMonth}
                onChange={(e) => {
                  const parsed = parseIntegerInput(e.target.value, 0);
                  setMetrics({ ...metrics, leadsPerMonth: parsed });
                }}
                placeholder="Ex: 500"
                min="0"
                className="mt-0.5 h-8 text-xs pr-8"
              />
              {toNum(metrics.leadsPerMonth) > 0 && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* Plan selector inline */}
        <div className="pt-2 border-t border-blue-200/40">
          <div className="text-[10px] text-gray-500 mb-1.5">Plano</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(["prime", "k", "k2"] as const).map((plan) => {
              const isSelected = imobPlan === plan;
              return (
                <button
                  key={plan}
                  onClick={() => setImobPlan(plan)}
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
            tiers={IMOB_ADDITIONAL_USERS[imobPlan]}
            additional={additional}
            included={included}
            unitLabel="usuários"
            kenloPhrase="você paga só o que usa. E mais você usa, menos você paga por usuário."
          />
        </div>
      </CardContent>
    </Card>
  );
}
