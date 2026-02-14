/**
 * LeadsAddonCard - Leads add-on with Pré-atendimento via IA & Pré-atendimento via WhatsApp sub-options
 * Includes WhatsApp leads postpaid breakdown with tier pricing
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCalc } from "../CalculadoraContext";
import { toNum, fmtNum, fmtPrice } from "../types";

export function LeadsAddonCard() {
  const { addons, setAddons, metrics, setMetrics, isAddonAvailable } = useCalc();

  const waTiers = [
    { from: 1, to: 200, price: 2.0 },
    { from: 201, to: 350, price: 1.8 },
    { from: 351, to: 1000, price: 1.5 },
    { from: 1001, to: Infinity, price: 1.2 },
  ];

  const included = 100;
  const totalLeads = toNum(metrics.leadsPerMonth);
  const additional = Math.max(0, totalLeads - included);
  const totalCost = (() => {
    const t1 = Math.min(additional, 200);
    const t2 = Math.min(Math.max(0, additional - 200), 150);
    const t3 = Math.min(Math.max(0, additional - 350), 650);
    const t4 = Math.max(0, additional - 1000);
    return t1 * 2.0 + t2 * 1.8 + t3 * 1.5 + t4 * 1.2;
  })();
  const avgPrice = additional > 0 ? totalCost / additional : 0;
  const breakdownLines: string[] = [];
  if (additional > 0) {
    let remaining = additional;
    for (const tier of waTiers) {
      if (remaining <= 0) break;
      const tierSize = tier.to === Infinity ? remaining : (tier.to - tier.from + 1);
      const qty = Math.min(remaining, tierSize);
      breakdownLines.push(`${fmtNum(qty)} × R$${fmtPrice(tier.price)}`);
      remaining -= qty;
    }
  }

  return (
    <div className={`p-4 sm:p-3 rounded-lg border min-h-[70px] sm:min-h-0 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-md ${!isAddonAvailable("leads") ? "opacity-50 bg-gray-50" : ""}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-1">
        <div className="flex items-center gap-2">
          <Label htmlFor="leads" className="font-semibold text-sm cursor-pointer">Leads</Label>
        </div>
        <Switch
          id="leads"
          checked={addons.leads}
          onCheckedChange={(checked) => {
            setAddons({ ...addons, leads: checked });
            if (!checked) {
              setMetrics(prev => ({ ...prev, wantsWhatsApp: false, usesExternalAI: false, externalAIName: "" }));
            }
          }}
          disabled={!isAddonAvailable("leads")}
        />
      </div>
      <div className="text-xs text-gray-500">
        {!isAddonAvailable("leads") ? "Requer Kenlo Imob" : (
          <ul className="list-disc list-inside space-y-0.5 mt-0.5">
            <li>Captação e distribuição inteligente de leads</li>
            <li>Atendimento em segundos — nunca perca uma oportunidade</li>
            <li>Integração com portais e redes sociais</li>
          </ul>
        )}
      </div>
      {/* Pré-atendimento via IA & Pré-atendimento via WhatsApp — inside Leads add-on card */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: addons.leads && isAddonAvailable("leads") ? '600px' : '0px',
          opacity: addons.leads && isAddonAvailable("leads") ? 1 : 0,
        }}
      >
        <div className="mt-3 pt-2 border-t border-gray-200/60">
          <div className="flex flex-col gap-1.5">
            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${
                metrics.wantsWhatsApp
                  ? 'bg-gray-100 border-gray-300 opacity-60'
                  : 'bg-gray-50 border-gray-200'
              }`}
              title={metrics.wantsWhatsApp
                ? "Pré-atendimento via IA e via WhatsApp são mutuamente exclusivos. Desative WhatsApp para usar IA."
                : "Use pré-atendimento via IA de parceiro externo (ex: Lais, Harry). Sem pós-pago — você paga ao fornecedor de IA."
              }
            >
              <Label htmlFor="externalAI" className={`text-xs cursor-pointer ${
                metrics.wantsWhatsApp ? 'text-gray-400' : 'text-gray-600'
              }`}>Pré-atendimento via IA</Label>
              <Switch
                id="externalAI"
                checked={metrics.usesExternalAI}
                disabled={metrics.wantsWhatsApp}
                onCheckedChange={(checked) => setMetrics({ ...metrics, usesExternalAI: checked, ...(checked ? { wantsWhatsApp: false } : {}), ...(!checked ? { externalAIName: "" } : {}) })}
              />
            </div>
            <div
              className="overflow-hidden transition-all duration-200 ease-in-out"
              style={{
                maxHeight: metrics.usesExternalAI ? '80px' : '0px',
                opacity: metrics.usesExternalAI ? 1 : 0,
              }}
            >
              <div className="px-2">
                <Label htmlFor="aiName" className="text-[10px] text-gray-500">Qual IA você usa?</Label>
                <Input
                  id="aiName"
                  type="text"
                  value={metrics.externalAIName}
                  onChange={(e) => setMetrics({ ...metrics, externalAIName: e.target.value })}
                  placeholder="Ex: Lais, Harry, Lia..."
                  className="mt-0.5 h-7 text-xs"
                />
              </div>
            </div>
            <div
              className={`flex items-center justify-between p-2 rounded-lg border ${
                metrics.usesExternalAI
                  ? 'bg-gray-100 border-gray-300 opacity-60'
                  : 'bg-gray-50 border-gray-200'
              }`}
              title={metrics.usesExternalAI
                ? "Pré-atendimento via WhatsApp e via IA são mutuamente exclusivos. Desative IA para usar WhatsApp."
                : "Leads via WhatsApp com carência de 100/mês. Excedente cobrado no pós-pago (R$1,50 a R$1,10/lead)."
              }
            >
              <Label htmlFor="whatsapp" className={`text-xs cursor-pointer ${
                metrics.usesExternalAI ? 'text-gray-400' : 'text-gray-600'
              }`}>Pré-atendimento via WhatsApp</Label>
              <Switch
                id="whatsapp"
                checked={metrics.wantsWhatsApp}
                disabled={metrics.usesExternalAI}
                onCheckedChange={(checked) => setMetrics({ ...metrics, wantsWhatsApp: checked, ...(checked ? { usesExternalAI: false, externalAIName: "" } : {}) })}
              />
            </div>
            {/* WhatsApp leads postpaid breakdown */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: metrics.wantsWhatsApp ? '400px' : '0px',
                opacity: metrics.wantsWhatsApp ? 1 : 0,
              }}
            >
              <div className="mt-2 text-xs text-gray-700 leading-relaxed">
                {additional <= 0 ? (
                  <span><span className="font-bold text-red-600">{fmtNum(totalLeads || included)}</span> leads incluídos na carência</span>
                ) : (
                  <>
                    <span><span className="font-bold text-red-600">{fmtNum(included)}</span> leads incluídos</span>
                    {additional > 0 && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block mt-0.5 cursor-help underline decoration-dotted decoration-gray-400">
                              {fmtNum(additional)} serão cobrados pós-pago (R${fmtPrice(avgPrice)}/lead)
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
                    Na <span className="font-bold text-red-600">Kenlo</span>, você paga só o que usa. E mais você usa, menos você paga por lead.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
