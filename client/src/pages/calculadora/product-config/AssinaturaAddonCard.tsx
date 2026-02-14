/**
 * AssinaturaAddonCard - Assinatura digital add-on card
 * Shows signature count breakdown with tier pricing
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCalc } from "../CalculadoraContext";
import { toNum, fmtNum, fmtPrice } from "../types";

export function AssinaturaAddonCard() {
  const { product, addons, setAddons, metrics } = useCalc();

  const included = 15;
  let totalSignatures = 0;
  if (product === 'imob') totalSignatures = toNum(metrics.closingsPerMonth);
  else if (product === 'loc') totalSignatures = toNum(metrics.newContractsPerMonth);
  else totalSignatures = toNum(metrics.closingsPerMonth) + toNum(metrics.newContractsPerMonth);
  const additional = Math.max(0, totalSignatures - included);
  const sigTiers = [
    { from: 1, to: 20, price: 1.8 },
    { from: 21, to: 40, price: 1.7 },
    { from: 41, to: Infinity, price: 1.5 },
  ];
  const totalCost = (() => {
    const t1 = Math.min(additional, 20);
    const t2 = Math.min(Math.max(0, additional - 20), 20);
    const t3 = Math.max(0, additional - 40);
    return t1 * 1.8 + t2 * 1.7 + t3 * 1.5;
  })();
  const avgPrice = additional > 0 ? totalCost / additional : 0;
  const breakdownLines: string[] = [];
  if (additional > 0) {
    let remaining = additional;
    for (const tier of sigTiers) {
      if (remaining <= 0) break;
      const tierSize = tier.to === Infinity ? remaining : (tier.to - tier.from + 1);
      const qty = Math.min(remaining, tierSize);
      breakdownLines.push(`${fmtNum(qty)} × R$${fmtPrice(tier.price)}`);
      remaining -= qty;
    }
  }

  return (
    <div className="p-4 sm:p-3 rounded-lg border min-h-[70px] sm:min-h-0 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-md">
      <div className="flex items-center justify-between mb-2 sm:mb-1">
        <Label htmlFor="assinatura" className="font-semibold text-sm cursor-pointer">Assinatura</Label>
        <Switch
          id="assinatura"
          checked={addons.assinatura}
          onCheckedChange={(checked) => setAddons({ ...addons, assinatura: checked })}
        />
      </div>
      <div className="text-xs text-gray-500">
        <ul className="list-disc list-inside space-y-0.5 mt-0.5">
          <li>Assinatura digital integrada — válida juridicamente</li>
          <li>Sem papel, sem cartório, sem atraso</li>
          <li>15 assinaturas/mês incluídas na carência</li>
        </ul>
      </div>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: addons.assinatura ? '400px' : '0px',
          opacity: addons.assinatura ? 1 : 0,
        }}
      >
        <div className="mt-2 text-xs text-gray-700 leading-relaxed">
          {totalSignatures <= included ? (
            <span><span className="font-bold text-red-600">{fmtNum(totalSignatures || included)}</span> assinaturas incluídas na carência</span>
          ) : (
            <>
              <span><span className="font-bold text-red-600">{fmtNum(included)}</span> assinaturas incluídas</span>
              {additional > 0 && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block mt-0.5 cursor-help underline decoration-dotted decoration-gray-400">
                        {fmtNum(additional)} serão cobradas pós-pago (R${fmtPrice(avgPrice)}/assinatura)
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
            </>
          )}
          <div className="mt-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/60">
            <p className="text-xs font-medium text-gray-700 leading-relaxed">
              Na <span className="font-bold text-red-600">Kenlo</span>, você paga só o que usa. E mais você usa, menos você paga por assinatura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
