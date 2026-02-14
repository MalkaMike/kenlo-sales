/**
 * BenefitsSection - Premium Services (Suporte VIP, CS Dedicado, Treinamentos)
 * Shows included/optional benefits based on plan tier
 */

import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useCalc } from "../CalculadoraContext";
import { type PlanTier } from "../types";

export function BenefitsSection() {
  const { product, imobPlan, locPlan, metrics, setMetrics } = useCalc();

  const planRank = { prime: 0, k: 1, k2: 2 };
  let highestPlan: PlanTier = "prime";
  if (product === "imob" || product === "both") {
    if (planRank[imobPlan] > planRank[highestPlan]) highestPlan = imobPlan;
  }
  if (product === "loc" || product === "both") {
    if (planRank[locPlan] > planRank[highestPlan]) highestPlan = locPlan;
  }

  const vipIncluded = highestPlan === "k" || highestPlan === "k2";
  const csIncluded = highestPlan === "k2";
  const isPrimeOnly = highestPlan === "prime";

  const imobK2 = (product === "imob" || product === "both") && imobPlan === "k2";
  const locK2 = (product === "loc" || product === "both") && locPlan === "k2";
  const bothK2 = imobK2 && locK2;
  const anyK2 = imobK2 || locK2;

  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Benefícios Inclusos</h2>
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Suporte VIP */}
            <Card className={`transition-all ${
              vipIncluded
                ? "border-green-200 bg-green-50/50"
                : isPrimeOnly
                ? "border-yellow-200 bg-yellow-50/30"
                : "border-gray-200 bg-gray-50/30 opacity-60"
            }`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Suporte VIP</span>
                  {vipIncluded ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Incluído
                    </Badge>
                  ) : isPrimeOnly ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                        Opcional (R$97/mês)
                      </Badge>
                      <Switch
                        checked={metrics.imobVipSupport}
                        onCheckedChange={(checked) => setMetrics({
                          ...metrics,
                          imobVipSupport: checked,
                          locVipSupport: checked
                        })}
                      />
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-400 border-gray-200">
                      Não aplicável
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Atendimento prioritário com SLA reduzido e canal exclusivo.
                </p>
              </CardContent>
            </Card>

            {/* CS Dedicado */}
            <Card className={`transition-all ${
              csIncluded
                ? "border-green-200 bg-green-50/50"
                : isPrimeOnly
                ? "border-yellow-200 bg-yellow-50/30"
                : "border-gray-200 bg-gray-50/30 opacity-60"
            }`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">CS Dedicado</span>
                  {csIncluded ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Incluído
                    </Badge>
                  ) : isPrimeOnly ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                        Opcional (R$297/mês)
                      </Badge>
                      <Switch
                        checked={metrics.imobDedicatedCS}
                        onCheckedChange={(checked) => setMetrics({
                          ...metrics,
                          imobDedicatedCS: checked,
                          locDedicatedCS: checked
                        })}
                      />
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-400 border-gray-200">
                      Não disponível neste plano
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer Success dedicado para acompanhamento estratégico.
                </p>
              </CardContent>
            </Card>

            {/* Treinamentos */}
            <Card className={`transition-all ${
              anyK2
                ? "border-green-200 bg-green-50/50"
                : "border-gray-200 bg-gray-50/30 opacity-60"
            }`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Treinamentos</span>
                  {bothK2 ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      4 online ou 2 presencial
                    </Badge>
                  ) : anyK2 ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      2 online ou 1 presencial
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-400 border-gray-200">
                      Disponível no K²
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {bothK2
                    ? "4 treinamentos online (ref. R$2.000/cada) ou 2 presenciais (ref. R$3.000/cada) por ano."
                    : anyK2
                    ? "2 treinamentos online (ref. R$2.000/cada) ou 1 presencial (ref. R$3.000) por ano."
                    : "Treinamentos exclusivos para sua equipe, online ou presencial."
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
