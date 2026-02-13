/**
 * CashAddonCard - Cash add-on card
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCalc } from "../CalculadoraContext";

export function CashAddonCard() {
  const { addons, setAddons, isAddonAvailable } = useCalc();

  return (
    <div className={`p-3 rounded-lg border ${!isAddonAvailable("cash") ? "opacity-50 bg-gray-50" : ""}`}>
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
        {!isAddonAvailable("cash") ? "Requer Kenlo Locação" : "Financie seus proprietários até 24 meses"}
      </div>
    </div>
  );
}
