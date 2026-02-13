/**
 * AddonsSection - Container for all add-on cards with select/clear buttons
 */

import { Card, CardContent } from "@/components/ui/card";
import { useCalc } from "../CalculadoraContext";
import { LeadsAddonCard } from "./LeadsAddonCard";
import { InteligenciaAddonCard } from "./InteligenciaAddonCard";
import { AssinaturaAddonCard } from "./AssinaturaAddonCard";
import { PayAddonCard } from "./PayAddonCard";
import { SegurosAddonCard } from "./SegurosAddonCard";
import { CashAddonCard } from "./CashAddonCard";

export function AddonsSection() {
  const { addons, setAddons, metrics, setMetrics } = useCalc();

  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Add-ons Opcionais</h2>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-1.5 mb-4">
            <button
              onClick={() => {
                setAddons({
                  leads: true,
                  inteligencia: true,
                  assinatura: true,
                  pay: true,
                  seguros: true,
                  cash: true,
                });
              }}
              className="px-4 py-2 text-sm rounded-lg transition-all border bg-primary text-white font-semibold border-primary shadow-sm"
            >
              Selecionar
            </button>
            <button
              onClick={() => {
                setAddons({
                  leads: false,
                  inteligencia: false,
                  assinatura: false,
                  pay: false,
                  seguros: false,
                  cash: false,
                });
                setMetrics(prev => ({ ...prev, wantsWhatsApp: false, usesExternalAI: false, externalAIName: "" }));
              }}
              className="px-4 py-2 text-sm rounded-lg transition-all border bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
            >
              Limpar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Leads */}
            <LeadsAddonCard />

            {/* Inteligência */}
            <InteligenciaAddonCard />

            {/* Assinatura */}
            <AssinaturaAddonCard />

            {/* Pay */}
            <PayAddonCard />

            {/* Seguros */}
            <SegurosAddonCard />

            {/* Cash */}
            <CashAddonCard />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
