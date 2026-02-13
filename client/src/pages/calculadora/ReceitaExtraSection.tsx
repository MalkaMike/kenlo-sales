/**
 * ReceitaExtraSection - Revenue extra section showing revenues vs investments
 * Composes sub-components from receita-extra/ directory
 */

import { Card, CardContent } from "@/components/ui/card";
import { useCalc } from "./CalculadoraContext";
import { toNum } from "./types";

import { BoletosSplitRevenueRow, SegurosRevenueRow } from "./receita-extra/RevenueRows";
import { MensalidadeRow } from "./receita-extra/MensalidadeRow";
import { AdditionalUsersRow } from "./receita-extra/AdditionalUsersRow";
import { AdditionalContractsRow } from "./receita-extra/AdditionalContractsRow";
import { WhatsAppRow } from "./receita-extra/WhatsAppRow";
import { AssinaturasRow } from "./receita-extra/AssinaturasRow";
import { BoletoCostRow } from "./receita-extra/BoletoCostRow";
import { SplitCostRow } from "./receita-extra/SplitCostRow";
import { SupportServicesRow } from "./receita-extra/SupportServicesRow";
import { PostPaidTotalRow } from "./receita-extra/PostPaidTotalRow";
import { GrandTotalRow } from "./receita-extra/GrandTotalRow";

export function ReceitaExtraSection() {
  const { product, addons, metrics } = useCalc();

  // Calculate if there are any revenues to show this section
  const hasPayRevenue =
    addons.pay &&
    (metrics.chargesBoletoToTenant || metrics.chargesSplitToOwner) &&
    (product === "loc" || product === "both");
  const hasSegurosRevenue =
    addons.seguros && (product === "loc" || product === "both");
  const hasAnyRevenue = hasPayRevenue || hasSegurosRevenue;

  if (!hasAnyRevenue) return null;

  return (
    <div className="mt-6 mb-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">
        Receita Extra
      </h2>

      <Card>
        <CardContent className="pt-4">
          {/* Receitas Category Header */}
          {hasAnyRevenue && (
            <div className="py-3 bg-slate-50 -mx-6 px-6 mb-2">
              <h3 className="text-base font-bold text-gray-900">Receitas</h3>
            </div>
          )}

          {/* Revenue Rows */}
          <BoletosSplitRevenueRow />
          <SegurosRevenueRow />

          {/* Investimentos Category Header */}
          <div className="py-3 bg-slate-50 -mx-6 px-6 mb-2 mt-4">
            <h3 className="text-base font-bold text-gray-900">Investimentos</h3>
          </div>

          {/* Investment Rows */}
          <MensalidadeRow />
          <AdditionalUsersRow />
          <AdditionalContractsRow />
          <WhatsAppRow />
          <AssinaturasRow />
          <BoletoCostRow />
          <SplitCostRow />
          <SupportServicesRow />

          {/* Totals */}
          <PostPaidTotalRow />
          <GrandTotalRow />
        </CardContent>
      </Card>
    </div>
  );
}
