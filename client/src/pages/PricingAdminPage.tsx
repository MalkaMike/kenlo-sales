import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Format number with thousand separator
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

// Parse formatted number back to float
const parseFormattedNumber = (str: string): number => {
  return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
};

// Compact number input with thousand separator
const NumberInput = ({ value, onChange, step = "1", className = "" }: any) => {
  const [displayValue, setDisplayValue] = useState(formatNumber(value));

  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const parsed = parseFormattedNumber(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setDisplayValue(formatNumber(parseFormattedNumber(displayValue)));
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={`h-7 text-sm ${className}`}
    />
  );
};

export default function PricingAdminPage() {
  const { data: config, isLoading, refetch } = trpc.pricingAdmin.getConfig.useQuery();
  const saveConfigMutation = trpc.pricingAdmin.saveConfig.useMutation();

  const [formData, setFormData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSave = async () => {
    if (!formData) return;

    try {
      await saveConfigMutation.mutateAsync(formData);
      alert("✅ Configuração de preços salva com sucesso!");
      setHasChanges(false);
      refetch();
    } catch (error: any) {
      alert(`❌ Erro: ${error.message || "Erro ao salvar configuração"}`);
    }
  };

  const updateValue = (path: string[], value: any) => {
    setFormData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      setHasChanges(true);
      return newData;
    });
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-8">
      <div className="container max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Configuração de Preços</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todos os preços, descontos e regras de negócio da plataforma Kenlo
          </p>
        </div>

        {hasChanges && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-800">
              Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar.
            </AlertDescription>
          </Alert>
        )}

        <div className="sticky top-4 z-10 mb-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveConfigMutation.isPending}
            size="sm"
            className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {saveConfigMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Frequency Multipliers */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Multiplicadores de Frequência</CardTitle>
              <CardDescription className="text-xs">
                Multiplicadores aplicados aos preços anuais para calcular outros ciclos
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3 py-4">
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground">Mensal (1/x do anual)</Label>
                <NumberInput
                  value={formData.frequencyMultipliers.monthly}
                  onChange={(val: number) => updateValue(["frequencyMultipliers", "monthly"], val)}
                  step="0.01"
                />
                <p className="text-[10px] text-muted-foreground">
                  Anual ÷ {formData.frequencyMultipliers.monthly} = Mensal
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground">Semestral (desconto 10%)</Label>
                <NumberInput
                  value={formData.frequencyMultipliers.semiannual}
                  onChange={(val: number) => updateValue(["frequencyMultipliers", "semiannual"], val)}
                  step="0.01"
                />
                <p className="text-[10px] text-muted-foreground">
                  Anual ÷ {formData.frequencyMultipliers.semiannual} = Semestral
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground">Bienal (desconto 25%)</Label>
                <NumberInput
                  value={formData.frequencyMultipliers.biennial}
                  onChange={(val: number) => updateValue(["frequencyMultipliers", "biennial"], val)}
                  step="0.01"
                />
                <p className="text-[10px] text-muted-foreground">
                  Anual × {formData.frequencyMultipliers.biennial} = Bienal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* IMOB Plans */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Planos IMOB</CardTitle>
              <CardDescription className="text-xs">Preços anuais e usuários inclusos</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 py-4">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="space-y-2">
                  <h3 className="font-semibold text-sm uppercase">{plan === "k2" ? "K2" : plan}</h3>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Preço Anual (R$)</Label>
                    <NumberInput
                      value={formData.imobPlans[plan].annualPrice}
                      onChange={(val: number) => updateValue(["imobPlans", plan, "annualPrice"], val)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Usuários Inclusos</Label>
                    <NumberInput
                      value={formData.imobPlans[plan].includedUsers}
                      onChange={(val: number) => updateValue(["imobPlans", plan, "includedUsers"], Math.round(val))}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* LOC Plans */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Planos LOC</CardTitle>
              <CardDescription className="text-xs">Preços anuais e contratos inclusos</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 py-4">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="space-y-2">
                  <h3 className="font-semibold text-sm uppercase">{plan === "k2" ? "K2" : plan}</h3>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Preço Anual (R$)</Label>
                    <NumberInput
                      value={formData.locPlans[plan].annualPrice}
                      onChange={(val: number) => updateValue(["locPlans", plan, "annualPrice"], val)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Contratos Inclusos</Label>
                    <NumberInput
                      value={formData.locPlans[plan].includedContracts}
                      onChange={(val: number) => updateValue(["locPlans", plan, "includedContracts"], Math.round(val))}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add-ons */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Add-ons</CardTitle>
              <CardDescription className="text-xs">Preços anuais e custos de implantação</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 py-4">
              {["inteligencia", "leads", "assinaturas"].map((addon) => (
                <div key={addon} className="space-y-2">
                  <h3 className="font-semibold text-sm capitalize">{addon}</h3>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Preço Anual (R$)</Label>
                    <NumberInput
                      value={formData.addons[addon].annualPrice}
                      onChange={(val: number) => updateValue(["addons", addon, "annualPrice"], val)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Implantação (R$)</Label>
                    <NumberInput
                      value={formData.addons[addon].implementation}
                      onChange={(val: number) => updateValue(["addons", addon, "implementation"], val)}
                    />
                  </div>
                  {addon === "leads" && (
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">Leads Inclusos</Label>
                      <NumberInput
                        value={formData.addons[addon].includedLeads}
                        onChange={(val: number) => updateValue(["addons", addon, "includedLeads"], Math.round(val))}
                      />
                    </div>
                  )}
                  {addon === "assinaturas" && (
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">Assinaturas Inclusas</Label>
                      <NumberInput
                        value={formData.addons[addon].includedSignatures}
                        onChange={(val: number) => updateValue(["addons", addon, "includedSignatures"], Math.round(val))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Premium Services */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Serviços Premium</CardTitle>
              <CardDescription className="text-xs">Preços mensais e custos de treinamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">VIP Support (R$/mês)</Label>
                  <NumberInput
                    value={formData.premiumServices.vipSupport}
                    onChange={(val: number) => updateValue(["premiumServices", "vipSupport"], val)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">CS Dedicado (R$/mês)</Label>
                  <NumberInput
                    value={formData.premiumServices.csDedicado}
                    onChange={(val: number) => updateValue(["premiumServices", "csDedicado"], val)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Treinamento Online (R$)</Label>
                  <NumberInput
                    value={formData.premiumServices.treinamentoOnline}
                    onChange={(val: number) => updateValue(["premiumServices", "treinamentoOnline"], val)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Treinamento Presencial (R$)</Label>
                  <NumberInput
                    value={formData.premiumServices.treinamentoPresencial}
                    onChange={(val: number) => updateValue(["premiumServices", "treinamentoPresencial"], val)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kombos */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Kombos</CardTitle>
              <CardDescription className="text-xs">Descontos e implantações gratuitas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              {Object.entries(formData.kombos).map(([key, kombo]: [string, any]) => (
                <div key={key} className="border-b pb-3 last:border-0">
                  <h3 className="font-semibold text-sm mb-2 capitalize">{kombo.name}</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">Desconto (%)</Label>
                      <NumberInput
                        value={kombo.discount * 100}
                        onChange={(val: number) => updateValue(["kombos", key, "discount"], val / 100)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground">Implantações Grátis</Label>
                      <NumberInput
                        value={kombo.freeImplementations}
                        onChange={(val: number) => updateValue(["kombos", key, "freeImplementations"], Math.round(val))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tiered Pricing - Additional Users */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Usuários Adicionais (IMOB)</CardTitle>
              <CardDescription className="text-xs">Preços por faixa e por plano</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="border-b pb-3 last:border-0">
                  <h3 className="font-semibold text-sm mb-2 uppercase">{plan === "k2" ? "K2" : plan}</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {formData.additionalUsersTiers[plan].map((tier: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">
                          {tier.from}-{tier.to === 999 ? "∞" : tier.to}
                        </Label>
                        <NumberInput
                          value={tier.price}
                          onChange={(val: number) =>
                            updateValue(["additionalUsersTiers", plan, String(idx), "price"], val)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tiered Pricing - Additional Contracts */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Contratos Adicionais (LOC)</CardTitle>
              <CardDescription className="text-xs">Preços por faixa e por plano</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="border-b pb-3 last:border-0">
                  <h3 className="font-semibold text-sm mb-2 uppercase">{plan === "k2" ? "K2" : plan}</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {formData.additionalContractsTiers[plan].map((tier: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">
                          {tier.from}-{tier.to === 999 ? "∞" : tier.to}
                        </Label>
                        <NumberInput
                          value={tier.price}
                          onChange={(val: number) =>
                            updateValue(["additionalContractsTiers", plan, String(idx), "price"], val)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tiered Pricing - Additional Leads */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Leads WhatsApp Adicionais</CardTitle>
              <CardDescription className="text-xs">Preços por faixa de volume</CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <div className="grid grid-cols-4 gap-2">
                {formData.additionalLeadsTiers.map((tier: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      {tier.from}-{tier.to === 99999 ? "∞" : tier.to}
                    </Label>
                    <NumberInput
                      value={tier.price}
                      onChange={(val: number) =>
                        updateValue(["additionalLeadsTiers", String(idx), "price"], val)
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tiered Pricing - Additional Signatures */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Assinaturas Adicionais</CardTitle>
              <CardDescription className="text-xs">Preços por faixa de volume</CardDescription>
            </CardHeader>
            <CardContent className="py-4">
              <div className="grid grid-cols-4 gap-2">
                {formData.additionalSignaturesTiers.map((tier: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      {tier.from}-{tier.to === 99999 ? "∞" : tier.to}
                    </Label>
                    <NumberInput
                      value={tier.price}
                      onChange={(val: number) =>
                        updateValue(["additionalSignaturesTiers", String(idx), "price"], val)
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Kenlo Pay - Boletos */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Kenlo Pay - Boletos</CardTitle>
              <CardDescription className="text-xs">Boletos inclusos e preços por faixa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-sm uppercase">{plan === "k2" ? "K2" : plan}</h3>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">Inclusos</Label>
                      <NumberInput
                        value={formData.kenloPay.boletosIncluded[plan]}
                        onChange={(val: number) =>
                          updateValue(["kenloPay", "boletosIncluded", plan], Math.round(val))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.kenloPay.boletosTiers[plan].map((tier: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">
                          {tier.from}-{tier.to === 99999 ? "∞" : tier.to}
                        </Label>
                        <NumberInput
                          value={tier.price}
                          onChange={(val: number) =>
                            updateValue(["kenloPay", "boletosTiers", plan, String(idx), "price"], val)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Kenlo Pay - Splits */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Kenlo Pay - Splits</CardTitle>
              <CardDescription className="text-xs">Splits inclusos e preços por faixa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 py-4">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-sm uppercase">{plan === "k2" ? "K2" : plan}</h3>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">Inclusos</Label>
                      <NumberInput
                        value={formData.kenloPay.splitsIncluded[plan]}
                        onChange={(val: number) =>
                          updateValue(["kenloPay", "splitsIncluded", plan], Math.round(val))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.kenloPay.splitsTiers[plan].map((tier: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">
                          {tier.from}-{tier.to === 99999 ? "∞" : tier.to}
                        </Label>
                        <NumberInput
                          value={tier.price}
                          onChange={(val: number) =>
                            updateValue(["kenloPay", "splitsTiers", plan, String(idx), "price"], val)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Kenlo Seguros */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Kenlo Seguros</CardTitle>
              <CardDescription className="text-xs">Comissões por plano</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-3 py-4">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">{plan === "k2" ? "K2" : plan} (R$/contrato/mês)</Label>
                  <NumberInput
                    value={formData.kenloSeguros[plan]}
                    onChange={(val: number) => updateValue(["kenloSeguros", plan], val)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
