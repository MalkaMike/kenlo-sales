/**
 * TierBreakdown - Reusable tier pricing breakdown with tooltip
 * Shows included units, additional units with per-unit cost, and tier breakdown tooltip
 */

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fmtNum, fmtPrice } from "../types";

interface TierBreakdownProps {
  tiers: Array<{ from: number; to: number; price: number }>;
  additional: number;
  included: number;
  unitLabel: string;
  kenloPhrase: string;
}

export function TierBreakdown({ tiers, additional, included, unitLabel, kenloPhrase }: TierBreakdownProps) {
  const totalCost = (() => {
    let cost = 0;
    let remaining = additional;
    for (const tier of tiers) {
      if (remaining <= 0) break;
      const tierSize = tier.to === Infinity ? remaining : (tier.to - tier.from + 1);
      const qty = Math.min(remaining, tierSize);
      cost += qty * tier.price;
      remaining -= qty;
    }
    return cost;
  })();
  const avgPrice = additional > 0 ? totalCost / additional : 0;
  const breakdownLines: string[] = [];
  if (additional > 0) {
    let remaining = additional;
    for (const tier of tiers) {
      if (remaining <= 0) break;
      const tierSize = tier.to === Infinity ? remaining : (tier.to - tier.from + 1);
      const qty = Math.min(remaining, tierSize);
      breakdownLines.push(`${fmtNum(qty)} × R$${fmtPrice(tier.price)}`);
      remaining -= qty;
    }
  }

  return (
    <div className="mt-2 text-xs text-gray-700 leading-relaxed">
      <span><span className="font-bold text-red-600">{fmtNum(included)}</span> {unitLabel} incluídos</span>
      {additional > 0 && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block mt-0.5 cursor-help underline decoration-dotted decoration-gray-400">
                {fmtNum(additional)} serão cobrados pós-pago (R${fmtPrice(avgPrice)}/{unitLabel.replace(/s$/, '')})
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-semibold mb-1">Detalhamento por faixa:</p>
              {breakdownLines.map((line, i) => (
                <p key={i} className="text-xs">{line}</p>
              ))}
              <p className="text-xs mt-1 font-semibold">Total: R${fmtPrice(totalCost)}/mês</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {additional > 0 && (
        <div className="mt-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/60">
          <p className="text-xs font-medium text-gray-700 leading-relaxed">
            Na <span className="font-bold text-red-600">Kenlo</span>, {kenloPhrase}
          </p>
        </div>
      )}
    </div>
  );
}
