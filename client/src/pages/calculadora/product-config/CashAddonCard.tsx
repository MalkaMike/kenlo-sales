/**
 * CashAddonCard - Cash add-on card
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCalc } from "../CalculadoraContext";
import { useAddonPulse } from "./useAddonPulse";

export function CashAddonCard() {
  const { addons, setAddons, isAddonAvailable } = useCalc();
  const { cardRef, activeClass } = useAddonPulse(addons.cash);

  return (
    <div
      ref={cardRef}
      className={`p-3 rounded-lg border transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-md cursor-pointer ${!isAddonAvailable("cash") ? "opacity-50 bg-gray-50" : activeClass}`}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-1">
        <div className="flex items-center gap-2">
          <Label htmlFor="cash" className="font-semibold text-sm cursor-pointer">Cash</Label>
        </div>
        <Switch
          id="cash"
          checked={addons.cash}
          onCheckedChange={(checked) => setAddons({ ...addons, cash: checked })}
          disabled={!isAddonAvailable("cash")}
        />
      </div>
      <div className="text-xs text-gray-500">
        {!isAddonAvailable("cash") ? "Requer Kenlo Locação" : (
          <ul className="list-disc list-inside space-y-0.5 mt-0.5">
            <li>Antecipe até 24 meses de aluguel para proprietários</li>
            <li>Fidelize sua carteira com um diferencial único</li>
            <li>Destaque-se no mercado com serviço exclusivo</li>
          </ul>
        )}
      </div>
    </div>
  );
}
