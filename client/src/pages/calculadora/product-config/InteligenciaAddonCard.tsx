/**
 * InteligenciaAddonCard - Inteligência add-on card
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCalc } from "../CalculadoraContext";

export function InteligenciaAddonCard() {
  const { addons, setAddons } = useCalc();

  return (
    <div className="p-4 sm:p-3 rounded-lg border min-h-[70px] sm:min-h-0 transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-md">
      <div className="flex items-center justify-between mb-2 sm:mb-1">
        <Label htmlFor="inteligencia" className="font-semibold text-sm cursor-pointer">Inteligência</Label>
        <Switch
          id="inteligencia"
          checked={addons.inteligencia}
          onCheckedChange={(checked) => setAddons({ ...addons, inteligencia: checked })}
        />
      </div>
      <div className="text-xs text-gray-500">
        <ul className="list-disc list-inside space-y-0.5 mt-0.5">
          <li>Usuários ilimitados no BI Google Looker Pro</li>
          <li>Dashboards de vendas, locação e performance</li>
          <li>Indispensável para gestão com dados reais</li>
        </ul>
      </div>
    </div>
  );
}
