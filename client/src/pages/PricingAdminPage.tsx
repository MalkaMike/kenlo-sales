import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * Pricing Admin Page
 * 
 * Visual interface to edit all pricing configuration
 * Matches calculator design language (Kenlo pink/green)
 */

export default function PricingAdminPage() {
  const [hasChanges] = useState(false);

  // Payment Frequency Multipliers
  const [frequencyMultipliers, setFrequencyMultipliers] = useState({
    monthly: 1.25,
    semiannual: 1.111,
    annual: 1.0,
    biennial: 0.75,
  });

  // IMOB Plans
  const [imobPlans, setImobPlans] = useState({
    prime: { annualPrice: 247, includedUsers: 2 },
    k: { annualPrice: 497, includedUsers: 7 },
    k2: { annualPrice: 1197, includedUsers: 15 },
  });

  // LOC Plans
  const [locPlans, setLocPlans] = useState({
    prime: { annualPrice: 247, includedContracts: 100 },
    k: { annualPrice: 497, includedContracts: 150 },
    k2: { annualPrice: 1197, includedContracts: 500 },
  });

  // Add-ons
  const [addons, setAddons] = useState({
    inteligencia: { annualPrice: 297, implementation: 497 },
    leads: { annualPrice: 497, implementation: 497, includedLeads: 100 },
    assinaturas: { annualPrice: 37, implementation: 0, includedSignatures: 15 },
  });

  // Premium Services
  const [premiumServices, setPremiumServices] = useState({
    vipSupport: 97,
    csDedicado: 297,
  });

  // Kombos
  const [kombos, setKombos] = useState({
    imobStart: { discount: 10, implementation: 1497, includesPremium: true },
    imobPro: { discount: 15, implementation: 1497, includesPremium: true },
    locacaoPro: { discount: 10, implementation: 1497, includesPremium: true },
    coreGestao: { discount: 0, implementation: 1497, includesPremium: true },
    elite: { discount: 20, implementation: 1497, includesPremium: true },
  });

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save changes to pricing-config.ts
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  const handleReset = () => {
    // Reset to original values (would reload from API)
    toast.info("Configurações resetadas");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Configuração de Preços</h1>
                <p className="text-sm text-muted-foreground">
                  Fonte única de verdade para todos os preços do site
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Alterações não salvas
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  window.open(
                    'https://github.com/YOUR_USERNAME/YOUR_REPO/edit/main/shared/pricing-config.ts',
                    '_blank'
                  );
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Editar no GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 space-y-6">
        {/* Payment Frequency Multipliers */}
        <Card>
          <CardHeader>
            <CardTitle>Multiplicadores de Frequência de Pagamento</CardTitle>
            <CardDescription>
              Anual é a referência (1.0). Outros são calculados a partir dele.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="freq-monthly">Mensal</Label>
                <Input
                  id="freq-monthly"
                  type="number"
                  step="0.001"
                  value={frequencyMultipliers.monthly}
                  onChange={(e) => {
                    // Read-only
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Atual: +{((frequencyMultipliers.monthly - 1) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <Label htmlFor="freq-semiannual">Semestral</Label>
                <Input
                  id="freq-semiannual"
                  type="number"
                  step="0.001"
                  value={frequencyMultipliers.semiannual}
                  onChange={(e) => {
                    // Read-only
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Atual: +{((frequencyMultipliers.semiannual - 1) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <Label htmlFor="freq-annual">Anual (Referência)</Label>
                <Input
                  id="freq-annual"
                  type="number"
                  value={frequencyMultipliers.annual}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Base: 0%</p>
              </div>
              <div>
                <Label htmlFor="freq-biennial">Bienal</Label>
                <Input
                  id="freq-biennial"
                  type="number"
                  step="0.001"
                  value={frequencyMultipliers.biennial}
                  onChange={(e) => {
                    // Read-only
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Atual: {((frequencyMultipliers.biennial - 1) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IMOB Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Kenlo IMOB - Planos</CardTitle>
            <CardDescription>
              Preços anuais (devem terminar em 7) e usuários inclusos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(imobPlans).map(([key, plan]) => (
                <div key={key} className="space-y-3 p-4 rounded-lg border">
                  <h4 className="font-semibold capitalize">{key}</h4>
                  <div>
                    <Label htmlFor={`imob-${key}-price`}>Preço Anual</Label>
                    <Input
                      id={`imob-${key}-price`}
                      type="number"
                      value={plan.annualPrice}
                      onChange={(e) => {
                        // Read-only
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`imob-${key}-users`}>Usuários Inclusos</Label>
                    <Input
                      id={`imob-${key}-users`}
                      type="number"
                      value={plan.includedUsers}
                      onChange={(e) => {
                        // Read-only
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LOC Plans */}
        <Card>
          <CardHeader>
            <CardTitle>Kenlo Locação - Planos</CardTitle>
            <CardDescription>
              Preços anuais (devem terminar em 7) e contratos inclusos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(locPlans).map(([key, plan]) => (
                <div key={key} className="space-y-3 p-4 rounded-lg border">
                  <h4 className="font-semibold capitalize">{key}</h4>
                  <div>
                    <Label htmlFor={`loc-${key}-price`}>Preço Anual</Label>
                    <Input
                      id={`loc-${key}-price`}
                      type="number"
                      value={plan.annualPrice}
                      onChange={(e) => {
                        // Read-only
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`loc-${key}-contracts`}>Contratos Inclusos</Label>
                    <Input
                      id={`loc-${key}-contracts`}
                      type="number"
                      value={plan.includedContracts}
                      onChange={(e) => {
                        // Read-only
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add-ons */}
        <Card>
          <CardHeader>
            <CardTitle>Add-ons</CardTitle>
            <CardDescription>
              Preços anuais e implantação (devem terminar em 7)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(addons).map(([key, addon]) => (
                <div key={key} className="space-y-3 p-4 rounded-lg border">
                  <h4 className="font-semibold capitalize">{key}</h4>
                  <div>
                    <Label htmlFor={`addon-${key}-price`}>Preço Anual</Label>
                    <Input
                      id={`addon-${key}-price`}
                      type="number"
                      value={addon.annualPrice}
                      onChange={(e) => {
                        // Read-only
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`addon-${key}-impl`}>Implantação</Label>
                    <Input
                      id={`addon-${key}-impl`}
                      type="number"
                      value={addon.implementation}
                      onChange={(e) => {
                        // Read-only
                      }}
                    />
                  </div>
                  {"includedLeads" in addon && (
                    <div>
                      <Label htmlFor={`addon-${key}-leads`}>Leads Inclusos</Label>
                      <Input
                        id={`addon-${key}-leads`}
                        type="number"
                        value={addon.includedLeads}
                        onChange={(e) => {
                          // Read-only
                        }}
                      />
                    </div>
                  )}
                  {"includedSignatures" in addon && (
                    <div>
                      <Label htmlFor={`addon-${key}-sigs`}>Assinaturas Inclusas</Label>
                      <Input
                        id={`addon-${key}-sigs`}
                        type="number"
                        value={addon.includedSignatures}
                        onChange={(e) => {
                          // Read-only
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Premium Services */}
        <Card>
          <CardHeader>
            <CardTitle>Serviços Premium</CardTitle>
            <CardDescription>
              Preços mensais (devem terminar em 7)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vip-price">Suporte VIP (mensal)</Label>
                <Input
                  id="vip-price"
                  type="number"
                  value={premiumServices.vipSupport}
                  onChange={(e) => {
                    // Read-only
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Incluído em: K e K2
                </p>
              </div>
              <div>
                <Label htmlFor="cs-price">CS Dedicado (mensal)</Label>
                <Input
                  id="cs-price"
                  type="number"
                  value={premiumServices.csDedicado}
                  onChange={(e) => {
                    // Read-only
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Incluído em: K2
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kombos */}
        <Card>
          <CardHeader>
            <CardTitle>Kombos</CardTitle>
            <CardDescription>
              Descontos (%) e implantação fixa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(kombos).map(([key, kombo]) => (
                <div key={key} className="space-y-3 p-4 rounded-lg border">
                  <h4 className="font-semibold text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <div>
                    <Label htmlFor={`kombo-${key}-discount`}>Desconto (%)</Label>
                    <Input
                      id={`kombo-${key}-discount`}
                      type="number"
                      value={kombo.discount}
                      onChange={(e) => {
                        // Read-only
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`kombo-${key}-impl`}>Implantação</Label>
                    <Input
                      id={`kombo-${key}-impl`}
                      type="number"
                      value={kombo.implementation}
                      onChange={(e) => {
                        // Read-only
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`kombo-${key}-premium`}
                      checked={kombo.includesPremium}
                      onChange={(e) => {
                        // Read-only
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`kombo-${key}-premium`} className="text-xs">
                      Inclui Premium
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Importante
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              • Todos os preços de licença devem terminar em 7 (regra de arredondamento)
            </p>
            <p>
              • Anual é sempre a referência (1.0) para multiplicadores de frequência
            </p>
            <p>
              • Alterações aqui afetam: Calculadora, Páginas de Produtos, PDF de Proposta
            </p>
            <p className="text-primary font-medium">
              • Sempre teste a calculadora após salvar mudanças!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
