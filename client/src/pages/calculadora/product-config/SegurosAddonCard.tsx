/**
 * SegurosAddonCard - Seguros add-on card
 */

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCalc } from "../CalculadoraContext";

export function SegurosAddonCard() {
  const { addons, setAddons, isAddonAvailable } = useCalc();

  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-md cursor-pointer ${!isAddonAvailable("seguros") ? "opacity-50 bg-gray-50" : ""}`}>
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
        {!isAddonAvailable("seguros") ? "Requer Kenlo Locação" : (
          <ul className="list-disc list-inside space-y-0.5 mt-0.5">
            <li>Seguro embutido no boleto do inquilino</li>
            <li>A partir de R$10/contrato/mês sem esforço</li>
            <li>Receita recorrente garantida para a imobiliária</li>
          </ul>
        )}
      </div>
    </div>
  );
}
