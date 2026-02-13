/**
 * SegurosAddonCard - Seguros add-on card
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCalc } from "../CalculadoraContext";

export function SegurosAddonCard() {
  const { addons, setAddons, isAddonAvailable } = useCalc();

  return (
    <div className={`p-3 rounded-lg border ${!isAddonAvailable("seguros") ? "opacity-50 bg-gray-50" : ""}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-1">
        <div className="flex items-center gap-2">
          <Label htmlFor="seguros" className="font-semibold text-sm cursor-pointer">Seguros</Label>
        </div>
        <Switch
          id="seguros"
          checked={addons.seguros}
          onCheckedChange={(checked) => setAddons({ ...addons, seguros: checked })}
          disabled={!isAddonAvailable("seguros")}
        />
      </div>
      <div className="text-xs text-gray-500">
        {!isAddonAvailable("seguros") ? "Requer Kenlo Locação" : "Seguros embutido no boleto e ganhe a partir de R$10 por contrato/mês"}
      </div>
    </div>
  );
}
