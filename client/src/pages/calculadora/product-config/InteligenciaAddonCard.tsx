/**
 * InteligenciaAddonCard - Inteligência add-on card
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCalc } from "../CalculadoraContext";

export function InteligenciaAddonCard() {
  const { addons, setAddons } = useCalc();

  return (
    <div className="p-4 sm:p-3 rounded-lg border min-h-[70px] sm:min-h-0">
      <div className="flex items-center justify-between mb-2 sm:mb-1">
        <Label htmlFor="inteligencia" className="font-semibold text-sm cursor-pointer">Inteligência</Label>
        <Switch
          id="inteligencia"
          checked={addons.inteligencia}
          onCheckedChange={(checked) => setAddons({ ...addons, inteligencia: checked })}
        />
      </div>
      <div className="text-xs text-gray-500">BI de KPIs de performance</div>
    </div>
  );
}
