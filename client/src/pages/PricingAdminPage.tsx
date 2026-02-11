import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
const NumberInput = ({ value, onChange, step = "1", className = "", disabled = false }: any) => {
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
      disabled={disabled}
      className={`h-7 text-sm ${className}`}
    />
  );
};

// Helper text component
const HelperText = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] text-muted-foreground italic mt-1 flex items-start gap-1">
    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
    <span>{children}</span>
  </p>
);

export default function PricingAdminPage() {
  const { data: config, isLoading, refetch } = trpc.pricingAdmin.getConfig.useQuery();
  const saveConfigMutation = trpc.pricingAdmin.saveConfig.useMutation();

  const [formData, setFormData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [changeReason, setChangeReason] = useState("");
  const [lastModified, setLastModified] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setFormData(config);
      // In a real app, you'd fetch this from the backend
      setLastModified(new Date().toLocaleString('pt-BR'));
    }
  }, [config]);

  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!formData) return;

    try {
      await saveConfigMutation.mutateAsync(formData);
      alert(`✅ Configuração salva com sucesso!\n\nMotivo: ${changeReason || "Não informado"}`);
      setHasChanges(false);
      setShowConfirmDialog(false);
      setChangeReason("");
      setLastModified(new Date().toLocaleString('pt-BR'));
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">Motor de Precificação Kenlo</h1>
          <p className="text-sm text-muted-foreground mb-2">
            Fonte única de verdade para Calculadora, PDF e toda a plataforma de vendas
          </p>
          {lastModified && (
            <p className="text-xs text-muted-foreground">
              Última alteração em: {lastModified}
            </p>
          )}
        </div>

        {/* Unsaved changes alert */}
        {hasChanges && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-800">
              Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicar.
            </AlertDescription>
          </Alert>
        )}

        {/* Save button */}
        <div className="sticky top-4 z-10 mb-6">
          <Button
            onClick={handleSaveClick}
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

        <div className="space-y-6">
          {/* ========================================
              1️⃣ REGRAS GLOBAIS DE PRECIFICAÇÃO
          ======================================== */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">1. Regras Globais de Precificação</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Essas regras definem como todos os preços da plataforma são calculados
              </p>
            </div>

            <Card className="border-2 border-primary/20">
              <CardHeader className="py-4 bg-primary/5">
                <CardTitle className="text-lg">Ciclo de Pagamento e Descontos</CardTitle>
                <CardDescription className="text-xs">
                  Anual é a referência base. Outros ciclos aplicam descontos ou acréscimos sobre o valor anual.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Mensal</Label>
                      <span className="text-xs text-red-600 font-medium">sem desconto</span>
                    </div>
                    <NumberInput
                      value={formData.frequencyMultipliers.monthly}
                      onChange={(val: number) => updateValue(["frequencyMultipliers", "monthly"], val)}
                      step="0.01"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Anual ÷ {formData.frequencyMultipliers.monthly.toFixed(2)} = Mensal
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Semestral</Label>
                      <span className="text-xs text-green-600 font-medium">desconto aplicado</span>
                    </div>
                    <NumberInput
                      value={formData.frequencyMultipliers.semiannual}
                      onChange={(val: number) => updateValue(["frequencyMultipliers", "semiannual"], val)}
                      step="0.01"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Anual ÷ {formData.frequencyMultipliers.semiannual.toFixed(2)} = Semestral
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Anual</Label>
                      <span className="text-xs text-blue-600 font-medium">referência</span>
                    </div>
                    <Input
                      type="text"
                      value="1.00"
                      disabled
                      className="h-7 text-sm bg-gray-50"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Preço base (sem multiplicador)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Bienal</Label>
                      <span className="text-xs text-green-600 font-medium">desconto máximo</span>
                    </div>
                    <NumberInput
                      value={formData.frequencyMultipliers.biennial}
                      onChange={(val: number) => updateValue(["frequencyMultipliers", "biennial"], val)}
                      step="0.01"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Anual × {formData.frequencyMultipliers.biennial.toFixed(2)} = Bienal
                    </p>
                  </div>
                </div>
                <HelperText>
                  O desconto por ciclo é aplicado antes de qualquer desconto de combo.
                </HelperText>
              </CardContent>
            </Card>
          </div>

          {/* ========================================
              2️⃣ PREÇOS BASE DOS PLANOS (FUNDAÇÃO)
          ======================================== */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">2. Preços Base dos Planos (Fundação)</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Preços base anuais usados como fundação para todos os cálculos
              </p>
            </div>

            {/* IMOB Plans */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">2.1 Planos IMOB</CardTitle>
                <CardDescription className="text-xs">
                  Preço base anual (antes de descontos) e usuários inclusos
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {["prime", "k", "k2"].map((plan) => (
                    <div key={plan} className="space-y-3 p-3 border rounded-lg">
                      <h3 className="font-semibold text-base uppercase text-center">{plan === "k2" ? "K2" : plan}</h3>
                      <div className="space-y-1">
                        <Label className="text-xs uppercase text-muted-foreground">Preço Base Anual (R$)</Label>
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
                      <HelperText>
                        Este é o preço base usado no cálculo do Mensal, Anual e Kombos.
                      </HelperText>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* LOC Plans */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">2.2 Planos LOCAÇÃO</CardTitle>
                <CardDescription className="text-xs">
                  Preço base anual (antes de descontos) e contratos inclusos
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {["prime", "k", "k2"].map((plan) => (
                    <div key={plan} className="space-y-3 p-3 border rounded-lg">
                      <h3 className="font-semibold text-base uppercase text-center">{plan === "k2" ? "K2" : plan}</h3>
                      <div className="space-y-1">
                        <Label className="text-xs uppercase text-muted-foreground">Preço Base Anual (R$)</Label>
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
                      <HelperText>
                        Este é o preço base usado no cálculo do Mensal, Anual e Kombos.
                      </HelperText>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ========================================
              3️⃣ ADD-ONS — PREÇOS BASE E IMPLANTAÇÃO
          ======================================== */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">3. Add-ons — Preços Base e Implantação</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Funcionalidades extras com preços recorrentes e taxas de implantação
              </p>
            </div>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Add-ons Disponíveis</CardTitle>
                <CardDescription className="text-xs">
                  Preços anuais recorrentes e custos únicos de implantação
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {["inteligencia", "leads", "assinaturas"].map((addon) => (
                    <div key={addon} className="space-y-3 p-3 border rounded-lg">
                      <h3 className="font-semibold text-base capitalize">{addon}</h3>
                      <div className="space-y-1">
                        <Label className="text-xs uppercase text-muted-foreground">Preço Recorrente Anual (R$)</Label>
                        <NumberInput
                          value={formData.addons[addon].annualPrice}
                          onChange={(val: number) => updateValue(["addons", addon, "annualPrice"], val)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs uppercase text-muted-foreground">Taxa de Implantação (R$)</Label>
                        <NumberInput
                          value={formData.addons[addon].implementation}
                          onChange={(val: number) => updateValue(["addons", addon, "implementation"], val)}
                        />
                      </div>
                      {addon === "leads" && (
                        <div className="space-y-1">
                          <Label className="text-xs uppercase text-muted-foreground">Leads WhatsApp Inclusos</Label>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ========================================
              4️⃣ SERVIÇOS PREMIUM (RECORRENTES)
          ======================================== */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">4. Serviços Premium (Recorrentes)</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Serviços Premium impactam o valor mensal, mas não alteram o plano base
              </p>
            </div>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Serviços Mensais e Treinamentos</CardTitle>
                <CardDescription className="text-xs">
                  Valores mensais para serviços recorrentes e valores únicos para treinamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2 p-3 border rounded-lg">
                    <Label className="text-sm font-semibold">Suporte VIP (mensal)</Label>
                    <NumberInput
                      value={formData.premiumServices.vipSupport}
                      onChange={(val: number) => updateValue(["premiumServices", "vipSupport"], val)}
                    />
                    <p className="text-[10px] text-muted-foreground">Valor mensal recorrente</p>
                  </div>
                  <div className="space-y-2 p-3 border rounded-lg">
                    <Label className="text-sm font-semibold">CS Dedicado (mensal)</Label>
                    <NumberInput
                      value={formData.premiumServices.csDedicado}
                      onChange={(val: number) => updateValue(["premiumServices", "csDedicado"], val)}
                    />
                    <p className="text-[10px] text-muted-foreground">Valor mensal recorrente</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-3 border rounded-lg">
                    <Label className="text-sm font-semibold">Treinamento Online</Label>
                    <NumberInput
                      value={formData.premiumServices.treinamentoOnline}
                      onChange={(val: number) => updateValue(["premiumServices", "treinamentoOnline"], val)}
                    />
                    <p className="text-[10px] text-muted-foreground">Valor único (não recorrente)</p>
                  </div>
                  <div className="space-y-2 p-3 border rounded-lg">
                    <Label className="text-sm font-semibold">Treinamento Presencial</Label>
                    <NumberInput
                      value={formData.premiumServices.treinamentoPresencial}
                      onChange={(val: number) => updateValue(["premiumServices", "treinamentoPresencial"], val)}
                    />
                    <p className="text-[10px] text-muted-foreground">Valor único (não recorrente)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ========================================
              5️⃣ KOMBOS — DESCONTOS PROMOCIONAIS CUMULATIVOS
          ======================================== */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">5. Kombos — Descontos Promocionais Cumulativos</h2>
              <p className="text-sm text-muted-foreground mt-1">
                O desconto de combo é aplicado após o desconto do ciclo de pagamento
              </p>
            </div>

            <Card className="border-2 border-green-500/20">
              <CardHeader className="py-4 bg-green-50">
                <CardTitle className="text-lg">Descontos por Kombo</CardTitle>
                <CardDescription className="text-xs">
                  Descontos percentuais aplicados quando cliente contrata pacotes específicos
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-4">
                  {Object.entries(formData.kombos).map(([key, kombo]: [string, any]) => (
                    <div key={key} className="p-4 border rounded-lg bg-white">
                      <h3 className="font-semibold text-base mb-3">{kombo.name}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Desconto Promocional</Label>
                          <div className="flex items-center gap-2">
                            <NumberInput
                              value={kombo.discount * 100}
                              onChange={(val: number) => updateValue(["kombos", key, "discount"], val / 100)}
                              className="flex-1"
                            />
                            <span className="text-lg font-bold text-green-600">%</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Desconto aplicado sobre o valor após desconto de ciclo
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Implantações Ofertadas</Label>
                          <NumberInput
                            value={kombo.freeImplementations}
                            onChange={(val: number) => updateValue(["kombos", key, "freeImplementations"], Math.round(val))}
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Número de implantações gratuitas incluídas
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <HelperText>
                  Exemplo de cálculo: Preço Anual → aplica desconto de ciclo → aplica desconto de Kombo → resultado final
                </HelperText>
              </CardContent>
            </Card>
          </div>

          {/* ========================================
              6️⃣ CUSTOS VARIÁVEIS PÓS-PAGO (BASEADOS EM USO)
          ======================================== */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">6. Custos Variáveis Pós-Pago (baseados em uso)</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Preços por unidade adicional, organizados por faixas de volume
              </p>
            </div>

            {/* Additional Users */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Usuários Adicionais (IMOB)</CardTitle>
                <CardDescription className="text-xs">
                  Preço por usuário adicional, variando por plano e faixa de volume
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-4">
                  {["prime", "k", "k2"].map((plan) => (
                    <div key={plan} className="p-3 border rounded-lg">
                      <h3 className="font-semibold text-sm mb-3 uppercase">{plan === "k2" ? "K2" : plan}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {formData.additionalUsersTiers[plan].map((tier: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">
                              {tier.from === 1 ? "A partir de" : `${tier.from}-${tier.to === 999 ? "∞" : tier.to}`} usuários
                            </Label>
                            <NumberInput
                              value={tier.price}
                              onChange={(val: number) =>
                                updateValue(["additionalUsersTiers", plan, String(idx), "price"], val)
                              }
                            />
                            <p className="text-[9px] text-muted-foreground">R$ por usuário</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Contracts */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Contratos Adicionais (LOCAÇÃO)</CardTitle>
                <CardDescription className="text-xs">
                  Preço por contrato adicional, variando por plano e faixa de volume
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-4">
                  {["prime", "k", "k2"].map((plan) => (
                    <div key={plan} className="p-3 border rounded-lg">
                      <h3 className="font-semibold text-sm mb-3 uppercase">{plan === "k2" ? "K2" : plan}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {formData.additionalContractsTiers[plan].map((tier: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">
                              {tier.from === 1 ? "A partir de" : `${tier.from}-${tier.to === 999 ? "∞" : tier.to}`} contratos
                            </Label>
                            <NumberInput
                              value={tier.price}
                              onChange={(val: number) =>
                                updateValue(["additionalContractsTiers", plan, String(idx), "price"], val)
                              }
                            />
                            <p className="text-[9px] text-muted-foreground">R$ por contrato</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Leads */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Leads WhatsApp Adicionais</CardTitle>
                <CardDescription className="text-xs">
                  Preço por lead adicional, variando por faixa de volume mensal
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.additionalLeadsTiers.map((tier: any, idx: number) => (
                    <div key={idx} className="space-y-2 p-3 border rounded-lg">
                      <Label className="text-xs font-medium">
                        {tier.from === 1 ? "A partir de" : `${tier.from}-${tier.to === 99999 ? "∞" : tier.to}`} leads
                      </Label>
                      <NumberInput
                        value={tier.price}
                        onChange={(val: number) =>
                          updateValue(["additionalLeadsTiers", String(idx), "price"], val)
                        }
                      />
                      <p className="text-[9px] text-muted-foreground">R$ por lead</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Signatures */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Assinaturas Digitais Adicionais</CardTitle>
                <CardDescription className="text-xs">
                  Preço por assinatura adicional, variando por faixa de volume mensal
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.additionalSignaturesTiers.map((tier: any, idx: number) => (
                    <div key={idx} className="space-y-2 p-3 border rounded-lg">
                      <Label className="text-xs font-medium">
                        {tier.from === 1 ? "A partir de" : `${tier.from}-${tier.to === 99999 ? "∞" : tier.to}`} assinaturas
                      </Label>
                      <NumberInput
                        value={tier.price}
                        onChange={(val: number) =>
                          updateValue(["additionalSignaturesTiers", String(idx), "price"], val)
                        }
                      />
                      <p className="text-[9px] text-muted-foreground">R$ por assinatura</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Kenlo Pay - Boletos */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Kenlo Pay — Boletos</CardTitle>
                <CardDescription className="text-xs">
                  Boletos inclusos por plano e preço por boleto adicional
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-4">
                  {["prime", "k", "k2"].map((plan) => (
                    <div key={plan} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-semibold text-sm uppercase">{plan === "k2" ? "K2" : plan}</h3>
                        <div className="flex-1 space-y-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">Boletos Inclusos</Label>
                          <NumberInput
                            value={formData.kenloPay.boletosIncluded[plan]}
                            onChange={(val: number) =>
                              updateValue(["kenloPay", "boletosIncluded", plan], Math.round(val))
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {formData.kenloPay.boletosTiers[plan].map((tier: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">
                              {tier.from}-{tier.to === 99999 ? "∞" : tier.to}
                            </Label>
                            <NumberInput
                              value={tier.price}
                              onChange={(val: number) =>
                                updateValue(["kenloPay", "boletosTiers", plan, "tiers", String(idx), "price"], val)
                              }
                            />
                            <p className="text-[9px] text-muted-foreground">R$ por boleto</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Kenlo Pay - Splits */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Kenlo Pay — Splits</CardTitle>
                <CardDescription className="text-xs">
                  Splits inclusos por plano e preço por split adicional
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="space-y-4">
                  {["prime", "k", "k2"].map((plan) => (
                    <div key={plan} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-semibold text-sm uppercase">{plan === "k2" ? "K2" : plan}</h3>
                        <div className="flex-1 space-y-1">
                          <Label className="text-[10px] uppercase text-muted-foreground">Splits Inclusos</Label>
                          <NumberInput
                            value={formData.kenloPay.splitsIncluded[plan]}
                            onChange={(val: number) =>
                              updateValue(["kenloPay", "splitsIncluded", plan], Math.round(val))
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {formData.kenloPay.splitsTiers[plan].map((tier: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground">
                              {tier.from}-{tier.to === 99999 ? "∞" : tier.to}
                            </Label>
                            <NumberInput
                              value={tier.price}
                              onChange={(val: number) =>
                                updateValue(["kenloPay", "splitsTiers", plan, "tiers", String(idx), "price"], val)
                              }
                            />
                            <p className="text-[9px] text-muted-foreground">R$ por split</p>
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
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Kenlo Seguros — Comissões</CardTitle>
                <CardDescription className="text-xs">
                  Percentual de comissão sobre seguros por plano
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {["prime", "k", "k2"].map((plan) => (
                    <div key={plan} className="space-y-2 p-3 border rounded-lg">
                      <h3 className="font-semibold text-sm uppercase text-center">{plan === "k2" ? "K2" : plan}</h3>
                      <div className="flex items-center gap-2">
                        <NumberInput
                        value={formData.kenloSeguros.commissionRates[plan] * 100}
                        onChange={(val: number) =>
                          updateValue(["kenloSeguros", "commissionRates", plan], val / 100)
                          }
                          className="flex-1"
                        />
                        <span className="text-lg font-bold text-green-600">%</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground text-center">
                        Comissão sobre valor do seguro
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ========================================
              7️⃣ MATRIZ DE FUNCIONALIDADES
          ======================================== */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">7. Matriz de Funcionalidades por Produto e Plano</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Esta matriz define exatamente quais funcionalidades estão incluídas ou não em cada plano
              </p>
            </div>

            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-800">
                <strong>Atenção:</strong> Alterações nesta matriz impactam diretamente páginas públicas, calculadora e PDFs.
                Modifique com cuidado.
              </AlertDescription>
            </Alert>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                <strong>Fonte Única de Verdade:</strong> Todas as páginas públicas (site, calculadora e PDF) devem consumir esta configuração.
                Nunca codifique lógica de inclusão de features fora desta matriz.
              </AlertDescription>
            </Alert>

            {/* IMOB Features */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="py-4 bg-primary/5">
                <CardTitle className="text-lg">Kenlo IMOB — Funcionalidades por Plano</CardTitle>
                <CardDescription className="text-xs">
                  ✅ = Incluído | — = Não incluído
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-semibold">Funcionalidade</th>
                        <th className="text-center py-2 px-3 font-semibold bg-gray-50">Prime</th>
                        <th className="text-center py-2 px-3 font-semibold bg-gray-50">K</th>
                        <th className="text-center py-2 px-3 font-semibold bg-gray-50">K2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData?.featureMatrix?.imob?.prime?.map((feature: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3">
                            <div>
                              <div className="font-medium">{feature.name}</div>
                              {feature.description && (
                                <div className="text-xs text-muted-foreground">{feature.description}</div>
                              )}
                              {feature.linkedTo && (
                                <div className="text-xs text-blue-600 italic mt-1">
                                  → Vinculado a: {feature.linkedTo}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-2 px-3">
                            {formData.featureMatrix.imob.prime[idx]?.included ? (
                              <span className="text-green-600 font-bold text-lg">✅</span>
                            ) : (
                              <span className="text-gray-400 font-bold">—</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3">
                            {formData.featureMatrix.imob.k[idx]?.included ? (
                              <span className="text-green-600 font-bold text-lg">✅</span>
                            ) : (
                              <span className="text-gray-400 font-bold">—</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3">
                            {formData.featureMatrix.imob.k2[idx]?.included ? (
                              <span className="text-green-600 font-bold text-lg">✅</span>
                            ) : (
                              <span className="text-gray-400 font-bold">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Locação Features */}
            <Card className="border-2 border-secondary/20">
              <CardHeader className="py-4 bg-secondary/5">
                <CardTitle className="text-lg">Kenlo Locação — Funcionalidades por Plano</CardTitle>
                <CardDescription className="text-xs">
                  ✅ = Incluído | — = Não incluído
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-semibold">Funcionalidade</th>
                        <th className="text-center py-2 px-3 font-semibold bg-gray-50">Prime</th>
                        <th className="text-center py-2 px-3 font-semibold bg-gray-50">K</th>
                        <th className="text-center py-2 px-3 font-semibold bg-gray-50">K2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData?.featureMatrix?.locacao?.prime?.map((feature: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3">
                            <div>
                              <div className="font-medium">{feature.name}</div>
                              {feature.description && (
                                <div className="text-xs text-muted-foreground">{feature.description}</div>
                              )}
                              {feature.linkedTo && (
                                <div className="text-xs text-blue-600 italic mt-1">
                                  → Vinculado a: {feature.linkedTo}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-2 px-3">
                            {formData.featureMatrix.locacao.prime[idx]?.included ? (
                              <span className="text-green-600 font-bold text-lg">✅</span>
                            ) : (
                              <span className="text-gray-400 font-bold">—</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3">
                            {formData.featureMatrix.locacao.k[idx]?.included ? (
                              <span className="text-green-600 font-bold text-lg">✅</span>
                            ) : (
                              <span className="text-gray-400 font-bold">—</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3">
                            {formData.featureMatrix.locacao.k2[idx]?.included ? (
                              <span className="text-green-600 font-bold text-lg">✅</span>
                            ) : (
                              <span className="text-gray-400 font-bold">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <HelperText>
              <strong>Regra absoluta:</strong> A calculadora, páginas de produtos e PDF devem APENAS ler esta matriz.
              Nunca inferir, nunca codificar lógica de inclusão fora desta configuração.
            </HelperText>
          </div>

          {/* Bottom spacer */}
          <div className="h-8"></div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Confirmar Alterações de Preços
            </DialogTitle>
            <DialogDescription>
              Você está prestes a alterar a configuração de preços da plataforma.
              Essas mudanças afetarão:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-yellow-800">
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Novos contratos criados após esta alteração</li>
                  <li>Cálculos na Calculadora de Preços</li>
                  <li>PDFs de propostas exportados</li>
                </ul>
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Motivo da alteração (opcional)
              </Label>
              <Textarea
                id="reason"
                placeholder="Ex: Ajuste de preços para Q1 2026, correção de erro no plano K2, etc."
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSave}
              disabled={saveConfigMutation.isPending}
              className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {saveConfigMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Confirmar e Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
