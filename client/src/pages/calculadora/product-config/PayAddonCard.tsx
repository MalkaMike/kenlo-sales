/**
 * PayAddonCard - Pay add-on card with boleto/split toggles and value inputs
 */

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { useCalc } from "../CalculadoraContext";
import { toNum, formatCurrency, parseCurrency } from "../types";

export function PayAddonCard() {
  const { addons, setAddons, metrics, setMetrics, isAddonAvailable } = useCalc();

  return (
    <div className={`p-3 rounded-lg border ${!isAddonAvailable("pay") ? "opacity-50 bg-gray-50" : ""}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-1">
        <div className="flex items-center gap-2">
          <Label htmlFor="pay" className="font-semibold text-sm cursor-pointer">Pay</Label>
        </div>
        <Switch
          id="pay"
          checked={addons.pay}
          onCheckedChange={(checked) => setAddons({ ...addons, pay: checked })}
          disabled={!isAddonAvailable("pay")}
        />
      </div>
      <div className="text-xs text-gray-500">
        {!isAddonAvailable("pay") ? "Requer Kenlo Locação" : (
          <ul className="list-disc list-inside space-y-0.5 mt-0.5">
            <li>Boleto + Split automático integrado</li>
            <li>Inquilino paga, dinheiro cai na conta certa</li>
            <li>Zero trabalho manual — conciliação automática</li>
          </ul>
        )}
      </div>
      {/* Boleto & Split toggles + value inputs inside Pay card */}
      {addons.pay && isAddonAvailable("pay") && (
        <div className="mt-2 space-y-1 border-t border-gray-200 pt-2">
          <div className="flex items-center justify-between py-1.5 px-2 bg-yellow-50/60 rounded">
            <Label htmlFor="chargesBoleto-card" className="text-sm text-gray-800 cursor-pointer font-normal">Você cobra o boleto do inquilino?</Label>
            <Switch
              id="chargesBoleto-card"
              checked={metrics.chargesBoletoToTenant}
              onCheckedChange={(checked) => setMetrics({ ...metrics, chargesBoletoToTenant: checked })}
            />
          </div>
          {metrics.chargesBoletoToTenant && (
            <div className="pl-2 pb-1">
              <Label htmlFor="boletoAmount-card" className="text-xs text-gray-600">Quanto você cobra por boleto? (R$)</Label>
              <div className="relative">
                <Input
                  id="boletoAmount-card"
                  type="text"
                  inputMode="decimal"
                  value={typeof metrics.boletoChargeAmount === 'string' ? metrics.boletoChargeAmount : formatCurrency(metrics.boletoChargeAmount, 2)}
                  onFocus={(e) => {
                    const val = toNum(metrics.boletoChargeAmount);
                    if (val === 0) {
                      setMetrics({ ...metrics, boletoChargeAmount: '' as any });
                    } else {
                      setMetrics({ ...metrics, boletoChargeAmount: String(val).replace('.', ',') as any });
                    }
                    e.target.select();
                  }}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9,]/g, '');
                    setMetrics({ ...metrics, boletoChargeAmount: raw as any });
                  }}
                  onBlur={(e) => {
                    const parsed = parseCurrency(e.target.value);
                    const rounded = Math.round(Math.max(0, parsed) * 100) / 100;
                    setMetrics({ ...metrics, boletoChargeAmount: rounded });
                  }}
                  placeholder="Ex: 10,00"
                  className={`mt-1 h-8 text-sm pr-8 ${typeof metrics.boletoChargeAmount === 'number' && metrics.boletoChargeAmount === 0 ? 'border-amber-400 focus:ring-amber-400' : ''}`}
                />
                {(typeof metrics.boletoChargeAmount === 'number' && metrics.boletoChargeAmount > 0) && (
                  <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 w-4 h-4 text-green-600" />
                )}
              </div>
              {typeof metrics.boletoChargeAmount === 'number' && metrics.boletoChargeAmount === 0 && (
                <p className="text-xs text-amber-600 mt-0.5">Informe um valor maior que R$ 0,00 para impactar o cálculo</p>
              )}
            </div>
          )}
          <div className="flex items-center justify-between py-1.5 px-2 bg-yellow-50/60 rounded">
            <Label htmlFor="chargesSplit-card" className="text-sm text-gray-800 cursor-pointer font-normal">Você cobra o split do proprietário?</Label>
            <Switch
              id="chargesSplit-card"
              checked={metrics.chargesSplitToOwner}
              onCheckedChange={(checked) => setMetrics({ ...metrics, chargesSplitToOwner: checked })}
            />
          </div>
          {metrics.chargesSplitToOwner && (
            <div className="pl-2 pb-1">
              <Label htmlFor="splitAmount-card" className="text-xs text-gray-600">Quanto você cobra por split? (R$)</Label>
              <div className="relative">
                <Input
                  id="splitAmount-card"
                  type="text"
                  inputMode="decimal"
                  value={typeof metrics.splitChargeAmount === 'string' ? metrics.splitChargeAmount : formatCurrency(metrics.splitChargeAmount, 2)}
                  onFocus={(e) => {
                    const val = toNum(metrics.splitChargeAmount);
                    if (val === 0) {
                      setMetrics({ ...metrics, splitChargeAmount: '' as any });
                    } else {
                      setMetrics({ ...metrics, splitChargeAmount: String(val).replace('.', ',') as any });
                    }
                    e.target.select();
                  }}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9,]/g, '');
                    setMetrics({ ...metrics, splitChargeAmount: raw as any });
                  }}
                  onBlur={(e) => {
                    const parsed = parseCurrency(e.target.value);
                    const rounded = Math.round(Math.max(0, parsed) * 100) / 100;
                    setMetrics({ ...metrics, splitChargeAmount: rounded });
                  }}
                  placeholder="Ex: 5,00"
                  className={`mt-1 h-8 text-sm pr-8 ${typeof metrics.splitChargeAmount === 'number' && metrics.splitChargeAmount === 0 ? 'border-amber-400 focus:ring-amber-400' : ''}`}
                />
                {(typeof metrics.splitChargeAmount === 'number' && metrics.splitChargeAmount > 0) && (
                  <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 w-4 h-4 text-green-600" />
                )}
              </div>
              {typeof metrics.splitChargeAmount === 'number' && metrics.splitChargeAmount === 0 && (
                <p className="text-xs text-amber-600 mt-0.5">Informe um valor maior que R$ 0,00 para impactar o cálculo</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
