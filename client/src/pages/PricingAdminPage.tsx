import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
      <div className="container max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Configuração de Preços</h1>
          <p className="text-muted-foreground">
            Gerencie todos os preços, descontos e regras de negócio da plataforma Kenlo
          </p>
        </div>

        {hasChanges && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar.
            </AlertDescription>
          </Alert>
        )}

        <div className="sticky top-4 z-10 mb-6">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveConfigMutation.isPending}
            size="lg"
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

        <div className="space-y-6">
          {/* Frequency Multipliers */}
          <Card>
            <CardHeader>
              <CardTitle>Multiplicadores de Frequência</CardTitle>
              <CardDescription>
                Multiplicadores aplicados aos preços anuais para calcular outros ciclos
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Mensal (1/x do anual)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.frequencyMultipliers.monthly}
                  onChange={(e) =>
                    updateValue(["frequencyMultipliers", "monthly"], parseFloat(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Anual ÷ {formData.frequencyMultipliers.monthly} = Mensal
                </p>
              </div>
              <div>
                <Label>Semestral (desconto 10%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.frequencyMultipliers.semiannual}
                  onChange={(e) =>
                    updateValue(["frequencyMultipliers", "semiannual"], parseFloat(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Anual ÷ {formData.frequencyMultipliers.semiannual} = Semestral
                </p>
              </div>
              <div>
                <Label>Bienal (desconto 25%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.frequencyMultipliers.biennial}
                  onChange={(e) =>
                    updateValue(["frequencyMultipliers", "biennial"], parseFloat(e.target.value))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Anual × {formData.frequencyMultipliers.biennial} = Bienal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* IMOB Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Planos IMOB</CardTitle>
              <CardDescription>Preços anuais e usuários inclusos</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="space-y-4">
                  <h3 className="font-semibold text-lg capitalize">{plan === "k2" ? "K2" : plan}</h3>
                  <div>
                    <Label>Preço Anual (R$)</Label>
                    <Input
                      type="number"
                      value={formData.imobPlans[plan].annualPrice}
                      onChange={(e) =>
                        updateValue(["imobPlans", plan, "annualPrice"], parseFloat(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label>Usuários Inclusos</Label>
                    <Input
                      type="number"
                      value={formData.imobPlans[plan].includedUsers}
                      onChange={(e) =>
                        updateValue(["imobPlans", plan, "includedUsers"], parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* LOC Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Planos LOC</CardTitle>
              <CardDescription>Preços anuais e contratos inclusos</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="space-y-4">
                  <h3 className="font-semibold text-lg capitalize">{plan === "k2" ? "K2" : plan}</h3>
                  <div>
                    <Label>Preço Anual (R$)</Label>
                    <Input
                      type="number"
                      value={formData.locPlans[plan].annualPrice}
                      onChange={(e) =>
                        updateValue(["locPlans", plan, "annualPrice"], parseFloat(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label>Contratos Inclusos</Label>
                    <Input
                      type="number"
                      value={formData.locPlans[plan].includedContracts}
                      onChange={(e) =>
                        updateValue(["locPlans", plan, "includedContracts"], parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Add-ons */}
          <Card>
            <CardHeader>
              <CardTitle>Add-ons</CardTitle>
              <CardDescription>Preços anuais e custos de implantação</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              {Object.entries(formData.addons).map(([key, addon]: [string, any]) => (
                <div key={key} className="space-y-4">
                  <h3 className="font-semibold text-lg capitalize">{key}</h3>
                  <div>
                    <Label>Preço Anual (R$)</Label>
                    <Input
                      type="number"
                      value={addon.annualPrice}
                      onChange={(e) =>
                        updateValue(["addons", key, "annualPrice"], parseFloat(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label>Implantação (R$)</Label>
                    <Input
                      type="number"
                      value={addon.implementation}
                      onChange={(e) =>
                        updateValue(["addons", key, "implementation"], parseFloat(e.target.value))
                      }
                    />
                  </div>
                  {addon.includedLeads !== undefined && (
                    <div>
                      <Label>Leads Inclusos</Label>
                      <Input
                        type="number"
                        value={addon.includedLeads}
                        onChange={(e) =>
                          updateValue(["addons", key, "includedLeads"], parseInt(e.target.value))
                        }
                      />
                    </div>
                  )}
                  {addon.includedSignatures !== undefined && (
                    <div>
                      <Label>Assinaturas Inclusas</Label>
                      <Input
                        type="number"
                        value={addon.includedSignatures}
                        onChange={(e) =>
                          updateValue(["addons", key, "includedSignatures"], parseInt(e.target.value))
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Premium Services */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços Premium</CardTitle>
              <CardDescription>Preços mensais dos serviços premium</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div>
                <Label>VIP Support (R$/mês)</Label>
                <Input
                  type="number"
                  value={formData.premiumServices.vipSupport}
                  onChange={(e) =>
                    updateValue(["premiumServices", "vipSupport"], parseFloat(e.target.value))
                  }
                />
              </div>
              <div>
                <Label>CS Dedicado (R$/mês)</Label>
                <Input
                  type="number"
                  value={formData.premiumServices.csDedicado}
                  onChange={(e) =>
                    updateValue(["premiumServices", "csDedicado"], parseFloat(e.target.value))
                  }
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Treinamento</h3>
                <div>
                  <Label>Online (R$)</Label>
                  <Input
                    type="number"
                    value={formData.premiumServices.treinamento.online}
                    onChange={(e) =>
                      updateValue(["premiumServices", "treinamento", "online"], parseFloat(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label>Presencial (R$)</Label>
                  <Input
                    type="number"
                    value={formData.premiumServices.treinamento.presencial}
                    onChange={(e) =>
                      updateValue(["premiumServices", "treinamento", "presencial"], parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kombos */}
          <Card>
            <CardHeader>
              <CardTitle>Kombos</CardTitle>
              <CardDescription>Descontos, implantação e serviços inclusos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(formData.kombos).map(([key, kombo]: [string, any]) => (
                <div key={key} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-semibold text-lg mb-4 capitalize">
                    {key.replace("_", " ")}
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Desconto (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={kombo.discount * 100}
                        onChange={(e) =>
                          updateValue(["kombos", key, "discount"], parseFloat(e.target.value) / 100)
                        }
                      />
                    </div>
                    <div>
                      <Label>Implantação (R$)</Label>
                      <Input
                        type="number"
                        value={kombo.implementation}
                        onChange={(e) =>
                          updateValue(["kombos", key, "implementation"], parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${key}-premium`}
                        checked={kombo.includesPremium}
                        onChange={(e) =>
                          updateValue(["kombos", key, "includesPremium"], e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor={`${key}-premium`}>Inclui Premium Services</Label>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Users Tiers */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários Adicionais (Pós-pago)</CardTitle>
              <CardDescription>Preços por faixa de usuários adicionais por plano</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-semibold text-lg mb-4 capitalize">
                    {plan === "k2" ? "K2" : plan}
                  </h3>
                  <div className="space-y-3">
                    {formData.additionalUsersTiers[plan].map((tier: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>De</Label>
                          <Input
                            type="number"
                            value={tier.from}
                            onChange={(e) => {
                              const newTiers = [...formData.additionalUsersTiers[plan]];
                              newTiers[idx].from = parseInt(e.target.value);
                              updateValue(["additionalUsersTiers", plan], newTiers);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Até</Label>
                          <Input
                            type="number"
                            value={tier.to}
                            onChange={(e) => {
                              const newTiers = [...formData.additionalUsersTiers[plan]];
                              newTiers[idx].to = parseInt(e.target.value);
                              updateValue(["additionalUsersTiers", plan], newTiers);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Preço (R$/mês)</Label>
                          <Input
                            type="number"
                            value={tier.price}
                            onChange={(e) => {
                              const newTiers = [...formData.additionalUsersTiers[plan]];
                              newTiers[idx].price = parseFloat(e.target.value);
                              updateValue(["additionalUsersTiers", plan], newTiers);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Contracts Tiers */}
          <Card>
            <CardHeader>
              <CardTitle>Contratos Adicionais (Pós-pago)</CardTitle>
              <CardDescription>Preços por faixa de contratos adicionais por plano</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-semibold text-lg mb-4 capitalize">
                    {plan === "k2" ? "K2" : plan}
                  </h3>
                  <div className="space-y-3">
                    {formData.additionalContractsTiers[plan].map((tier: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>De</Label>
                          <Input
                            type="number"
                            value={tier.from}
                            onChange={(e) => {
                              const newTiers = [...formData.additionalContractsTiers[plan]];
                              newTiers[idx].from = parseInt(e.target.value);
                              updateValue(["additionalContractsTiers", plan], newTiers);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Até</Label>
                          <Input
                            type="number"
                            value={tier.to}
                            onChange={(e) => {
                              const newTiers = [...formData.additionalContractsTiers[plan]];
                              newTiers[idx].to = parseInt(e.target.value);
                              updateValue(["additionalContractsTiers", plan], newTiers);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Preço (R$/mês)</Label>
                          <Input
                            type="number"
                            value={tier.price}
                            onChange={(e) => {
                              const newTiers = [...formData.additionalContractsTiers[plan]];
                              newTiers[idx].price = parseFloat(e.target.value);
                              updateValue(["additionalContractsTiers", plan], newTiers);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Leads Tiers */}
          <Card>
            <CardHeader>
              <CardTitle>Leads WhatsApp Adicionais (Pós-pago)</CardTitle>
              <CardDescription>Preços por faixa de leads adicionais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.additionalLeadsTiers.map((tier: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>De</Label>
                      <Input
                        type="number"
                        value={tier.from}
                        onChange={(e) => {
                          const newTiers = [...formData.additionalLeadsTiers];
                          newTiers[idx].from = parseInt(e.target.value);
                          updateValue(["additionalLeadsTiers"], newTiers);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Até</Label>
                      <Input
                        type="number"
                        value={tier.to}
                        onChange={(e) => {
                          const newTiers = [...formData.additionalLeadsTiers];
                          newTiers[idx].to = parseInt(e.target.value);
                          updateValue(["additionalLeadsTiers"], newTiers);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Preço (R$/lead)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tier.price}
                        onChange={(e) => {
                          const newTiers = [...formData.additionalLeadsTiers];
                          newTiers[idx].price = parseFloat(e.target.value);
                          updateValue(["additionalLeadsTiers"], newTiers);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Signatures Tiers */}
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas Adicionais (Pós-pago)</CardTitle>
              <CardDescription>Preços por faixa de assinaturas adicionais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.additionalSignaturesTiers.map((tier: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>De</Label>
                      <Input
                        type="number"
                        value={tier.from}
                        onChange={(e) => {
                          const newTiers = [...formData.additionalSignaturesTiers];
                          newTiers[idx].from = parseInt(e.target.value);
                          updateValue(["additionalSignaturesTiers"], newTiers);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Até</Label>
                      <Input
                        type="number"
                        value={tier.to}
                        onChange={(e) => {
                          const newTiers = [...formData.additionalSignaturesTiers];
                          newTiers[idx].to = parseInt(e.target.value);
                          updateValue(["additionalSignaturesTiers"], newTiers);
                        }}
                      />
                    </div>
                    <div>
                      <Label>Preço (R$/assinatura)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tier.price}
                        onChange={(e) => {
                          const newTiers = [...formData.additionalSignaturesTiers];
                          newTiers[idx].price = parseFloat(e.target.value);
                          updateValue(["additionalSignaturesTiers"], newTiers);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Kenlo Pay */}
          <Card>
            <CardHeader>
              <CardTitle>Kenlo Pay (Pós-pago)</CardTitle>
              <CardDescription>Boletos e Splits inclusos e preços por faixa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Boletos Inclusos</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {["prime", "k", "k2"].map((plan) => (
                    <div key={plan}>
                      <Label className="capitalize">{plan === "k2" ? "K2" : plan}</Label>
                      <Input
                        type="number"
                        value={formData.kenloPay.boletosIncluded[plan]}
                        onChange={(e) =>
                          updateValue(["kenloPay", "boletosIncluded", plan], parseInt(e.target.value))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Splits Inclusos</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {["prime", "k", "k2"].map((plan) => (
                    <div key={plan}>
                      <Label className="capitalize">{plan === "k2" ? "K2" : plan}</Label>
                      <Input
                        type="number"
                        value={formData.kenloPay.splitsIncluded[plan]}
                        onChange={(e) =>
                          updateValue(["kenloPay", "splitsIncluded", plan], parseInt(e.target.value))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Faixas de Preço - Boletos</h3>
                {["prime", "k", "k2"].map((plan) => (
                  <div key={plan} className="mb-6">
                    <h4 className="font-medium mb-3 capitalize">{plan === "k2" ? "K2" : plan}</h4>
                    <div className="space-y-3">
                      {formData.kenloPay.boletosTiers[plan].map((tier: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>De</Label>
                            <Input
                              type="number"
                              value={tier.from}
                              onChange={(e) => {
                                const newTiers = [...formData.kenloPay.boletosTiers[plan]];
                                newTiers[idx].from = parseInt(e.target.value);
                                updateValue(["kenloPay", "boletosTiers", plan], newTiers);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Até</Label>
                            <Input
                              type="number"
                              value={tier.to}
                              onChange={(e) => {
                                const newTiers = [...formData.kenloPay.boletosTiers[plan]];
                                newTiers[idx].to = parseInt(e.target.value);
                                updateValue(["kenloPay", "boletosTiers", plan], newTiers);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Preço (R$/boleto)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={tier.price}
                              onChange={(e) => {
                                const newTiers = [...formData.kenloPay.boletosTiers[plan]];
                                newTiers[idx].price = parseFloat(e.target.value);
                                updateValue(["kenloPay", "boletosTiers", plan], newTiers);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Faixas de Preço - Splits</h3>
                {["prime", "k", "k2"].map((plan) => (
                  <div key={plan} className="mb-6">
                    <h4 className="font-medium mb-3 capitalize">{plan === "k2" ? "K2" : plan}</h4>
                    <div className="space-y-3">
                      {formData.kenloPay.splitsTiers[plan].map((tier: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>De</Label>
                            <Input
                              type="number"
                              value={tier.from}
                              onChange={(e) => {
                                const newTiers = [...formData.kenloPay.splitsTiers[plan]];
                                newTiers[idx].from = parseInt(e.target.value);
                                updateValue(["kenloPay", "splitsTiers", plan], newTiers);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Até</Label>
                            <Input
                              type="number"
                              value={tier.to}
                              onChange={(e) => {
                                const newTiers = [...formData.kenloPay.splitsTiers[plan]];
                                newTiers[idx].to = parseInt(e.target.value);
                                updateValue(["kenloPay", "splitsTiers", plan], newTiers);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Preço (R$/split)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={tier.price}
                              onChange={(e) => {
                                const newTiers = [...formData.kenloPay.splitsTiers[plan]];
                                newTiers[idx].price = parseFloat(e.target.value);
                                updateValue(["kenloPay", "splitsTiers", plan], newTiers);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Kenlo Seguros */}
          <Card>
            <CardHeader>
              <CardTitle>Kenlo Seguros (Pós-pago)</CardTitle>
              <CardDescription>Taxas de comissão por plano</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {["prime", "k", "k2"].map((plan) => (
                  <div key={plan}>
                    <Label className="capitalize">{plan === "k2" ? "K2" : plan} (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.kenloSeguros.commissionRates[plan] * 100}
                      onChange={(e) =>
                        updateValue(
                          ["kenloSeguros", "commissionRates", plan],
                          parseFloat(e.target.value) / 100
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Implantação Base */}
          <Card>
            <CardHeader>
              <CardTitle>Implantação Base</CardTitle>
              <CardDescription>Custo padrão de implantação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  value={formData.implantacaoBase}
                  onChange={(e) => updateValue(["implantacaoBase"], parseFloat(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saveConfigMutation.isPending}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
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
      </div>
    </div>
  );
}
