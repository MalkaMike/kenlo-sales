/**
 * ProductConfigSection - Product selection, IMOB/LOC metric cards, Benefits, and Add-ons
 * Extracted from CalculadoraPage.tsx (lines ~1785-2710)
 */

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, CheckCircle2, TrendingUp, Key } from "lucide-react";
import { useCalc } from "./CalculadoraContext";
import {
  type ProductSelection,
  type PlanTier,
  toNum,
  parseIntegerInput,
  parseCurrency,
  formatCurrency,
  fmtNum,
  fmtPrice,
  calculateAdditionalUsersCost,
} from "./types";
import * as Pricing from "@/utils/pricing";

// Tier definitions for IMOB additional users
const IMOB_ADDITIONAL_USERS: Record<PlanTier, Array<{ from: number; to: number; price: number }>> = {
  prime: [{ from: 1, to: Infinity, price: 57 }],
  k: [
    { from: 1, to: 5, price: 47 },
    { from: 6, to: Infinity, price: 37 },
  ],
  k2: [
    { from: 1, to: 10, price: 37 },
    { from: 11, to: 100, price: 27 },
    { from: 101, to: Infinity, price: 17 },
  ],
};

// Tier definitions for LOC additional contracts
const LOC_ADDITIONAL_CONTRACTS: Record<PlanTier, Array<{ from: number; to: number; price: number }>> = {
  prime: [{ from: 1, to: Infinity, price: 3 }],
  k: [
    { from: 1, to: 250, price: 3 },
    { from: 251, to: Infinity, price: 2.5 },
  ],
  k2: [
    { from: 1, to: 250, price: 3 },
    { from: 251, to: 500, price: 2.5 },
    { from: 501, to: Infinity, price: 2 },
  ],
};

function TierBreakdown({ tiers, additional, included, unitLabel, kenloPhrase }: {
  tiers: Array<{ from: number; to: number; price: number }>;
  additional: number;
  included: number;
  unitLabel: string;
  kenloPhrase: string;
}) {
  const totalCost = (() => {
    let cost = 0;
    let remaining = additional;
    for (const tier of tiers) {
      if (remaining <= 0) break;
      const tierSize = tier.to === Infinity ? remaining : (tier.to - tier.from + 1);
      const qty = Math.min(remaining, tierSize);
      cost += qty * tier.price;
      remaining -= qty;
    }
    return cost;
  })();
  const avgPrice = additional > 0 ? totalCost / additional : 0;
  const breakdownLines: string[] = [];
  if (additional > 0) {
    let remaining = additional;
    for (const tier of tiers) {
      if (remaining <= 0) break;
      const tierSize = tier.to === Infinity ? remaining : (tier.to - tier.from + 1);
      const qty = Math.min(remaining, tierSize);
      breakdownLines.push(`${fmtNum(qty)} × R$${fmtPrice(tier.price)}`);
      remaining -= qty;
    }
  }

  return (
    <div className="mt-2 text-xs text-gray-700 leading-relaxed">
      <span><span className="font-bold text-red-600">{fmtNum(included)}</span> {unitLabel} incluídos</span>
      {additional > 0 && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block mt-0.5 cursor-help underline decoration-dotted decoration-gray-400">
                {fmtNum(additional)} serão cobrados pós-pago (R${fmtPrice(avgPrice)}/{unitLabel.replace(/s$/, '')})
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="font-semibold mb-1">Detalhamento por faixa:</p>
              {breakdownLines.map((line, i) => (
                <p key={i} className="text-xs">{line}</p>
              ))}
              <p className="text-xs mt-1 font-semibold">Total: R${fmtPrice(totalCost)}/mês</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {additional > 0 && (
        <div className="mt-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/60">
          <p className="text-xs font-medium text-gray-700 leading-relaxed">
            Na <span className="font-bold text-red-600">Kenlo</span>, {kenloPhrase}
          </p>
        </div>
      )}
    </div>
  );
}

function ImobCard() {
  const { product, metrics, setMetrics, imobPlan, setImobPlan, recommendedImobPlan } = useCalc();
  if (product !== "imob" && product !== "both") return null;

  const included = imobPlan === 'prime' ? 2 : imobPlan === 'k' ? 7 : 15;
  const totalUsers = toNum(metrics.imobUsers);
  const additional = Math.max(0, totalUsers - included);

  return (
    <Card className="bg-blue-50/20 border-blue-200/40">
      <CardContent className="pt-3 pb-3 space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-xs text-gray-900">Kenlo IMOB</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <Label htmlFor="imobUsers" className="text-xs text-gray-600">Usuários</Label>
            <div className="relative">
              <Input
                id="imobUsers"
                type="number"
                inputMode="numeric"
                value={metrics.imobUsers}
                onChange={(e) => {
                  const parsed = parseIntegerInput(e.target.value, 1);
                  setMetrics({ ...metrics, imobUsers: parsed });
                }}
                placeholder="Ex: 5 usuários"
                min="1"
                className="mt-0.5 h-8 text-xs pr-8"
              />
              {toNum(metrics.imobUsers) >= 1 && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="closings" className="text-xs text-gray-600">Fechamentos/mês</Label>
            <div className="relative">
              <Input
                id="closings"
                type="number"
                inputMode="numeric"
                value={metrics.closingsPerMonth}
                onChange={(e) => {
                  const parsed = parseIntegerInput(e.target.value, 0);
                  setMetrics({ ...metrics, closingsPerMonth: parsed });
                }}
                placeholder="Ex: 10"
                min="0"
                className="mt-0.5 h-8 text-xs pr-8"
              />
              {toNum(metrics.closingsPerMonth) > 0 && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="leadsPerMonth" className="text-xs text-gray-600">Leads/mês</Label>
            <div className="relative">
              <Input
                id="leadsPerMonth"
                type="number"
                inputMode="numeric"
                value={metrics.leadsPerMonth}
                onChange={(e) => {
                  const parsed = parseIntegerInput(e.target.value, 0);
                  setMetrics({ ...metrics, leadsPerMonth: parsed });
                }}
                placeholder="Ex: 500"
                min="0"
                className="mt-0.5 h-8 text-xs pr-8"
              />
              {toNum(metrics.leadsPerMonth) > 0 && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* Plan selector inline */}
        <div className="pt-2 border-t border-blue-200/40">
          <div className="text-[10px] text-gray-500 mb-1.5">Plano</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(["prime", "k", "k2"] as const).map((plan) => {
              const isSelected = imobPlan === plan;
              return (
                <button
                  key={plan}
                  onClick={() => setImobPlan(plan)}
                  className={`p-2 rounded border transition-all text-center ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="font-bold text-xs">{plan === "prime" ? "Prime" : plan.toUpperCase()}</div>
                </button>
              );
            })}
          </div>
          <TierBreakdown
            tiers={IMOB_ADDITIONAL_USERS[imobPlan]}
            additional={additional}
            included={included}
            unitLabel="usuários"
            kenloPhrase="você paga só o que usa. E mais você usa, menos você paga por usuário."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function LocCard() {
  const { product, metrics, setMetrics, locPlan, setLocPlan, recommendedLocPlan } = useCalc();
  if (product !== "loc" && product !== "both") return null;

  const included = locPlan === 'prime' ? 100 : locPlan === 'k' ? 150 : 500;
  const totalContracts = toNum(metrics.contractsUnderManagement);
  const additional = Math.max(0, totalContracts - included);

  return (
    <Card className="bg-green-50/20 border-green-200/40">
      <CardContent className="pt-3 pb-3 space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Key className="w-3.5 h-3.5 text-green-600" />
          <span className="font-semibold text-xs text-gray-900">Kenlo Locação</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <Label htmlFor="contracts" className="text-xs text-gray-600">Contratos</Label>
            <div className="relative">
              <Input
                id="contracts"
                type="number"
                inputMode="numeric"
                value={metrics.contractsUnderManagement}
                onChange={(e) => {
                  const parsed = parseIntegerInput(e.target.value, 1);
                  setMetrics({ ...metrics, contractsUnderManagement: parsed });
                }}
                placeholder="Ex: 1200 contratos"
                min="1"
                className="mt-0.5 h-8 text-xs pr-8"
              />
              {toNum(metrics.contractsUnderManagement) >= 1 && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="newContracts" className="text-xs text-gray-600">Novos/mês</Label>
            <div className="relative">
              <Input
                id="newContracts"
                type="number"
                inputMode="numeric"
                value={metrics.newContractsPerMonth}
                onChange={(e) => {
                  const parsed = parseIntegerInput(e.target.value, 0);
                  setMetrics({ ...metrics, newContractsPerMonth: parsed });
                }}
                placeholder="Ex: 50"
                min="0"
                className="mt-0.5 h-8 text-xs pr-8"
              />
              {toNum(metrics.newContractsPerMonth) > 0 && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* Plan selector inline */}
        <div className="pt-2 border-t border-green-200/40">
          <div className="text-[10px] text-gray-500 mb-1.5">Plano</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(["prime", "k", "k2"] as const).map((plan) => {
              const isSelected = locPlan === plan;
              return (
                <button
                  key={plan}
                  onClick={() => setLocPlan(plan)}
                  className={`p-2 rounded border transition-all text-center ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="font-bold text-xs">{plan === "prime" ? "Prime" : plan.toUpperCase()}</div>
                </button>
              );
            })}
          </div>
          <TierBreakdown
            tiers={LOC_ADDITIONAL_CONTRACTS[locPlan]}
            additional={additional}
            included={included}
            unitLabel="contratos"
            kenloPhrase="você paga só o que usa. E mais você usa, menos você paga por contrato."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function BenefitsSection() {
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
                      Disponível no K2
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

function AddonsSection() {
  const { product, addons, setAddons, metrics, setMetrics, isAddonAvailable, locPlan } = useCalc();

  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Add-ons Opcionais</h2>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-1.5 mb-4">
            <button
              onClick={() => {
                setAddons({
                  leads: isAddonAvailable("leads"),
                  inteligencia: true,
                  assinatura: true,
                  pay: isAddonAvailable("pay"),
                  seguros: isAddonAvailable("seguros"),
                  cash: isAddonAvailable("cash"),
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

            {/* Assinatura */}
            <AssinaturaAddonCard />

            {/* Pay */}
            <PayAddonCard />

            {/* Seguros */}
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

            {/* Cash */}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LeadsAddonCard() {
  const { addons, setAddons, metrics, setMetrics, isAddonAvailable } = useCalc();

  const waTiers = [
    { from: 1, to: 200, price: 2.0 },
    { from: 201, to: 350, price: 1.8 },
    { from: 351, to: 1000, price: 1.5 },
    { from: 1001, to: Infinity, price: 1.2 },
  ];

  const included = 100;
  const totalLeads = toNum(metrics.leadsPerMonth);
  const additional = Math.max(0, totalLeads - included);
  const totalCost = (() => {
    const t1 = Math.min(additional, 200);
    const t2 = Math.min(Math.max(0, additional - 200), 150);
    const t3 = Math.min(Math.max(0, additional - 350), 650);
    const t4 = Math.max(0, additional - 1000);
    return t1 * 2.0 + t2 * 1.8 + t3 * 1.5 + t4 * 1.2;
  })();
  const avgPrice = additional > 0 ? totalCost / additional : 0;
  const breakdownLines: string[] = [];
  if (additional > 0) {
    let remaining = additional;
    for (const tier of waTiers) {
      if (remaining <= 0) break;
      const tierSize = tier.to === Infinity ? remaining : (tier.to - tier.from + 1);
      const qty = Math.min(remaining, tierSize);
      breakdownLines.push(`${fmtNum(qty)} × R$${fmtPrice(tier.price)}`);
      remaining -= qty;
    }
  }

  return (
    <div className={`p-4 sm:p-3 rounded-lg border min-h-[70px] sm:min-h-0 ${!isAddonAvailable("leads") ? "opacity-50 bg-gray-50" : ""}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-1">
        <div className="flex items-center gap-2">
          <Label htmlFor="leads" className="font-semibold text-sm cursor-pointer">Leads</Label>
        </div>
        <Switch
          id="leads"
          checked={addons.leads}
          onCheckedChange={(checked) => {
            setAddons({ ...addons, leads: checked });
            if (!checked) {
              setMetrics(prev => ({ ...prev, wantsWhatsApp: false, usesExternalAI: false, externalAIName: "" }));
            }
          }}
          disabled={!isAddonAvailable("leads")}
        />
      </div>
      <div className="text-xs text-gray-500">
        {!isAddonAvailable("leads") ? "Requer Kenlo Imob" : "Gestão automatizada de leads"}
      </div>
      {/* IA SDR & WhatsApp — inside Leads add-on card */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: addons.leads && isAddonAvailable("leads") ? '600px' : '0px',
          opacity: addons.leads && isAddonAvailable("leads") ? 1 : 0,
        }}
      >
        <div className="mt-3 pt-2 border-t border-gray-200/60">
          <div className="flex flex-col gap-1.5">
            <div 
              className={`flex items-center justify-between p-2 rounded-lg border ${
                metrics.wantsWhatsApp 
                  ? 'bg-gray-100 border-gray-300 opacity-60' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              title={metrics.wantsWhatsApp 
                ? "IA SDR e WhatsApp são mutuamente exclusivos. Desative WhatsApp para usar IA SDR." 
                : "Use IA SDR de parceiro externo (ex: Lais, Harry). Sem pós-pago — você paga ao fornecedor de IA."
              }
            >
              <Label htmlFor="externalAI" className={`text-xs cursor-pointer ${
                metrics.wantsWhatsApp ? 'text-gray-400' : 'text-gray-600'
              }`}>IA SDR</Label>
              <Switch
                id="externalAI"
                checked={metrics.usesExternalAI}
                disabled={metrics.wantsWhatsApp}
                onCheckedChange={(checked) => setMetrics({ ...metrics, usesExternalAI: checked, ...(checked ? { wantsWhatsApp: false } : {}), ...(!checked ? { externalAIName: "" } : {}) })}
              />
            </div>
            <div
              className="overflow-hidden transition-all duration-200 ease-in-out"
              style={{
                maxHeight: metrics.usesExternalAI ? '80px' : '0px',
                opacity: metrics.usesExternalAI ? 1 : 0,
              }}
            >
              <div className="px-2">
                <Label htmlFor="aiName" className="text-[10px] text-gray-500">Qual IA você usa?</Label>
                <Input
                  id="aiName"
                  type="text"
                  value={metrics.externalAIName}
                  onChange={(e) => setMetrics({ ...metrics, externalAIName: e.target.value })}
                  placeholder="Ex: Lais, Harry, Lia..."
                  className="mt-0.5 h-7 text-xs"
                />
              </div>
            </div>
            <div 
              className={`flex items-center justify-between p-2 rounded-lg border ${
                metrics.usesExternalAI 
                  ? 'bg-gray-100 border-gray-300 opacity-60' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              title={metrics.usesExternalAI 
                ? "WhatsApp e IA SDR são mutuamente exclusivos. Desative IA SDR para usar WhatsApp." 
                : "Leads via WhatsApp com carência de 100/mês. Excedente cobrado no pós-pago (R$1,50 a R$1,10/lead)."
              }
            >
              <Label htmlFor="whatsapp" className={`text-xs cursor-pointer ${
                metrics.usesExternalAI ? 'text-gray-400' : 'text-gray-600'
              }`}>WhatsApp</Label>
              <Switch
                id="whatsapp"
                checked={metrics.wantsWhatsApp}
                disabled={metrics.usesExternalAI}
                onCheckedChange={(checked) => setMetrics({ ...metrics, wantsWhatsApp: checked, ...(checked ? { usesExternalAI: false, externalAIName: "" } : {}) })}
              />
            </div>
            {/* WhatsApp leads postpaid breakdown */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: metrics.wantsWhatsApp ? '400px' : '0px',
                opacity: metrics.wantsWhatsApp ? 1 : 0,
              }}
            >
              <div className="mt-2 text-xs text-gray-700 leading-relaxed">
                {additional <= 0 ? (
                  <span><span className="font-bold text-red-600">{fmtNum(totalLeads || included)}</span> leads incluídos na carência</span>
                ) : (
                  <>
                    <span><span className="font-bold text-red-600">{fmtNum(included)}</span> leads incluídos</span>
                    {additional > 0 && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block mt-0.5 cursor-help underline decoration-dotted decoration-gray-400">
                              {fmtNum(additional)} serão cobrados pós-pago (R${fmtPrice(avgPrice)}/lead)
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="font-semibold mb-1">Detalhamento por faixa:</p>
                            {breakdownLines.map((line, i) => (
                              <p key={i} className="text-xs">{line}</p>
                            ))}
                            <p className="text-xs mt-1 font-semibold">Total: R${fmtPrice(totalCost)}/mês</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </>
                )}
                <div className="mt-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/60">
                  <p className="text-xs font-medium text-gray-700 leading-relaxed">
                    Na <span className="font-bold text-red-600">Kenlo</span>, você paga só o que usa. E mais você usa, menos você paga por lead.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssinaturaAddonCard() {
  const { product, addons, setAddons, metrics } = useCalc();

  const included = 15;
  let totalSignatures = 0;
  if (product === 'imob') totalSignatures = toNum(metrics.closingsPerMonth);
  else if (product === 'loc') totalSignatures = toNum(metrics.newContractsPerMonth);
  else totalSignatures = toNum(metrics.closingsPerMonth) + toNum(metrics.newContractsPerMonth);
  const additional = Math.max(0, totalSignatures - included);
  const sigTiers = [
    { from: 1, to: 20, price: 1.8 },
    { from: 21, to: 40, price: 1.7 },
    { from: 41, to: Infinity, price: 1.5 },
  ];
  const totalCost = (() => {
    const t1 = Math.min(additional, 20);
    const t2 = Math.min(Math.max(0, additional - 20), 20);
    const t3 = Math.max(0, additional - 40);
    return t1 * 1.8 + t2 * 1.7 + t3 * 1.5;
  })();
  const avgPrice = additional > 0 ? totalCost / additional : 0;
  const breakdownLines: string[] = [];
  if (additional > 0) {
    let remaining = additional;
    for (const tier of sigTiers) {
      if (remaining <= 0) break;
      const tierSize = tier.to === Infinity ? remaining : (tier.to - tier.from + 1);
      const qty = Math.min(remaining, tierSize);
      breakdownLines.push(`${fmtNum(qty)} × R$${fmtPrice(tier.price)}`);
      remaining -= qty;
    }
  }

  return (
    <div className="p-4 sm:p-3 rounded-lg border min-h-[70px] sm:min-h-0">
      <div className="flex items-center justify-between mb-2 sm:mb-1">
        <Label htmlFor="assinatura" className="font-semibold text-sm cursor-pointer">Assinatura</Label>
        <Switch
          id="assinatura"
          checked={addons.assinatura}
          onCheckedChange={(checked) => setAddons({ ...addons, assinatura: checked })}
        />
      </div>
      <div className="text-xs text-gray-500">Assinatura digital embutida na plataforma</div>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: addons.assinatura ? '400px' : '0px',
          opacity: addons.assinatura ? 1 : 0,
        }}
      >
        <div className="mt-2 text-xs text-gray-700 leading-relaxed">
          {totalSignatures <= included ? (
            <span><span className="font-bold text-red-600">{fmtNum(totalSignatures || included)}</span> assinaturas incluídas na carência</span>
          ) : (
            <>
              <span><span className="font-bold text-red-600">{fmtNum(included)}</span> assinaturas incluídas</span>
              {additional > 0 && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block mt-0.5 cursor-help underline decoration-dotted decoration-gray-400">
                        {fmtNum(additional)} serão cobradas pós-pago (R${fmtPrice(avgPrice)}/assinatura)
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="font-semibold mb-1">Detalhamento por faixa:</p>
                      {breakdownLines.map((line, i) => (
                        <p key={i} className="text-xs">{line}</p>
                      ))}
                      <p className="text-xs mt-1 font-semibold">Total: R${fmtPrice(totalCost)}/mês</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}
          <div className="mt-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/60">
            <p className="text-xs font-medium text-gray-700 leading-relaxed">
              Na <span className="font-bold text-red-600">Kenlo</span>, você paga só o que usa. E mais você usa, menos você paga por assinatura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayAddonCard() {
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
        {!isAddonAvailable("pay") ? "Requer Kenlo Locação" : "Boleto e Split digital embutido na plataforma"}
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

export function ProductConfigSection() {
  const { product, setProduct, configSectionRef, animateMetrics } = useCalc();

  return (
    <>
      {/* §1+2: Configuration */}
      <div className="mb-4" ref={configSectionRef}>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Configuração</h2>
        <Card>
          <CardContent className="pt-4">
            {/* Product filter */}
            <div className="flex items-center gap-1.5 mb-3">
              {["imob", "loc", "both"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setProduct(opt as ProductSelection)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all border ${
                    product === opt
                      ? "bg-primary text-white font-semibold border-primary shadow-sm"
                      : "bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {opt === "imob" ? "Imob" : opt === "loc" ? "Locação" : "Ambos"}
                </button>
              ))}
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 transition-all duration-500 ${animateMetrics ? 'ring-2 ring-primary/30 rounded-lg' : ''}`}>
              <ImobCard />
              <LocCard />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* §3: Benefits */}
      <BenefitsSection />

      {/* §4: Add-ons */}
      <AddonsSection />
    </>
  );
}
