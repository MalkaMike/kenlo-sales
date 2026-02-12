import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, AlertCircle, Info, AlertTriangle, Check, X } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

// Section header component
const SectionHeader = ({ letter, title, description }: { letter: string; title: string; description: string }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-lg font-bold text-primary">{letter}</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

export default function PricingAdminPageV2() {
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
      setLastModified(config._lastModified || new Date().toISOString());
    }
  }, [config]);

  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!formData) return;

    try {
      // Update metadata
      const updatedData = {
        ...formData,
        _lastModified: new Date().toISOString(),
        _version: "2.0.0",
      };
      
      await saveConfigMutation.mutateAsync(updatedData);
      alert(`✅ Configuração salva com sucesso!\n\nMotivo: ${changeReason || "Não informado"}`);
      setHasChanges(false);
      setShowConfirmDialog(false);
      setChangeReason("");
      setLastModified(updatedData._lastModified);
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
    <div className="container max-w-7xl py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Configuração de Preços</h1>
            <p className="text-muted-foreground">
              Fonte Única de Verdade — Estrutura Determinística v2.0.0
            </p>
          </div>
          <Button
            onClick={handleSaveClick}
            disabled={!hasChanges || saveConfigMutation.isPending}
            size="lg"
            className="gap-2"
          >
            {saveConfigMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>

        <Alert className="bg-primary/5 border-primary/20">
          <Info className="w-4 h-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Essa configuração é a fonte única de verdade para Calculadora e PDF.</strong>
            {" "}Qualquer alteração aqui impacta imediatamente todas as cotações, páginas públicas e documentos gerados.
            {lastModified && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Última alteração em: {new Date(lastModified).toLocaleString('pt-BR')}
              </span>
            )}
          </AlertDescription>
        </Alert>
      </div>

      {/* BLOCO A — Ciclo de Pagamento (Fundação) */}
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="A"
            title="Ciclo de Pagamento (Fundação)"
            description="Multiplicadores e descontos por ciclo — aplicados ANTES de qualquer desconto de combo"
          />
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-900">
              <strong>Regra global:</strong> O desconto de ciclo é sempre aplicado antes de qualquer desconto de combo.
              Ordem: Preço Base → Ciclo → Combo.
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(formData.paymentCycles || {}).map(([cycleKey, cycleData]: [string, any]) => {
            if (cycleKey.startsWith('_')) return null; // Skip metadata fields
            
            return (
              <Card key={cycleKey} className="border-l-4 border-l-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize">{cycleKey === 'monthly' ? 'Mensal' : cycleKey === 'semiannual' ? 'Semestral' : cycleKey === 'annual' ? 'Anual' : 'Bienal'}</CardTitle>
                  <CardDescription className="text-xs">
                    Tipo: <strong>{cycleData.type}</strong> • {cycleData.displayLabel}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs">Multiplicador</Label>
                    <NumberInput
                      value={cycleData.multiplier}
                      onChange={(val: number) => updateValue(['paymentCycles', cycleKey, 'multiplier'], val)}
                    />
                    <HelperText>Fator aplicado ao preço anual</HelperText>
                  </div>
                  <div>
                    <Label className="text-xs">Desconto vs Mensal (%)</Label>
                    <NumberInput
                      value={cycleData.discountVsMonthly || 0}
                      onChange={(val: number) => updateValue(['paymentCycles', cycleKey, 'discountVsMonthly'], val)}
                    />
                    <HelperText>{cycleData.discountVsMonthly > 0 ? `${cycleData.discountVsMonthly}% OFF` : 'Referência'}</HelperText>
                  </div>
                  <div>
                    <Label className="text-xs">Máx. Parcelas</Label>
                    <NumberInput
                      value={cycleData.maxInstallments || 1}
                      onChange={(val: number) => updateValue(['paymentCycles', cycleKey, 'maxInstallments'], val)}
                    />
                    <HelperText>{cycleData.maxInstallments > 1 ? `Até ${cycleData.maxInstallments}x` : 'Pagamento único'}</HelperText>
                  </div>
                  <div>
                    <Label className="text-xs">Fórmula</Label>
                    <Input
                      value={cycleData.formula}
                      onChange={(e) => updateValue(['paymentCycles', cycleKey, 'formula'], e.target.value)}
                      className="h-7 text-sm font-mono"
                    />
                    <HelperText>Fórmula de cálculo explícita</HelperText>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* BLOCO B — Planos Base — Preço Anual de Fundação */}
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="B"
            title="Planos Base — Preço Anual de Fundação"
            description="Nada de mensal aqui. Nada de desconto aqui. Este é o preço raiz."
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {['imob', 'locacao'].map((product) => (
            <div key={product} className="space-y-4">
              <h3 className="text-lg font-semibold capitalize border-b pb-2">
                {product === 'imob' ? 'Kenlo IMOB' : 'Kenlo Locação'}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {['prime', 'k', 'k2'].map((plan) => {
                  const planData = formData.basePlans?.[product]?.[plan];
                  if (!planData) return null;
                  
                  return (
                    <Card key={plan} className="border-l-4 border-l-secondary/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base uppercase">{plan}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-xs">Preço Anual Base (R$)</Label>
                          <NumberInput
                            value={planData.annualPrice}
                            onChange={(val: number) => updateValue(['basePlans', product, plan, 'annualPrice'], val)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">
                            {planData.includedUnits?.type === 'users' ? 'Usuários Inclusos' : 'Contratos Inclusos'}
                          </Label>
                          <NumberInput
                            value={planData.includedUnits?.quantity || 0}
                            onChange={(val: number) => updateValue(['basePlans', product, plan, 'includedUnits', 'quantity'], val)}
                          />
                        </div>
                        <HelperText>{planData.internalNote}</HelperText>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* BLOCO C — Add-ons — Preços Base e Escopo */}
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="C"
            title="Add-ons — Preços Base e Escopo"
            description="Preços recorrentes, implementação e disponibilidade por produto"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(formData.addons || {}).map(([addonKey, addonData]: [string, any]) => {
            if (addonKey.startsWith('_')) return null;
            
            return (
              <Card key={addonKey} className="border-l-4 border-l-accent/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base capitalize">Kenlo {addonKey}</CardTitle>
                  <CardDescription className="text-xs">
                    Disponível em: <strong>{addonData.availability?.join(', ')}</strong>
                    {addonData.shareable && ' • Compartilhável entre produtos'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs">Preço Anual (R$)</Label>
                    <NumberInput
                      value={addonData.annualPrice}
                      onChange={(val: number) => updateValue(['addons', addonKey, 'annualPrice'], val)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Implementação (R$)</Label>
                    <NumberInput
                      value={addonData.implementation}
                      onChange={(val: number) => updateValue(['addons', addonKey, 'implementation'], val)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Unidades Inclusas</Label>
                    <NumberInput
                      value={addonData.includedUnits?.quantity || 0}
                      onChange={(val: number) => updateValue(['addons', addonKey, 'includedUnits', 'quantity'], val)}
                      disabled={!addonData.includedUnits}
                    />
                    {addonData.includedUnits && (
                      <HelperText>{addonData.includedUnits.type}</HelperText>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={addonData.shareable}
                      onCheckedChange={(checked) => updateValue(['addons', addonKey, 'shareable'], checked)}
                    />
                    <Label className="text-xs">Compartilhável</Label>
                  </div>
                </CardContent>
                {addonData._note && (
                  <CardContent className="pt-0">
                    <HelperText>{addonData._note}</HelperText>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Alterações</DialogTitle>
            <DialogDescription>
              Você está prestes a alterar a configuração de preços. Isso impactará:
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-900">
              <ul className="list-disc list-inside space-y-1">
                <li>Todas as novas cotações geradas pela calculadora</li>
                <li>PDFs gerados a partir de agora</li>
                <li>Páginas públicas de produtos</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Motivo da alteração (opcional)</Label>
            <Textarea
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Ex: Ajuste de preços para Q1 2026, correção de erro no plano K2, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSave} disabled={saveConfigMutation.isPending}>
              {saveConfigMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
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

      {/* BLOCO D — Serviços Premium (Recorrentes e Não Recorrentes) */}
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="D"
            title="Serviços Premium (Recorrentes e Não Recorrentes)"
            description="Serviços mensais recorrentes e serviços únicos com regras de herança e duplicação"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recurring Services */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Serviços Recorrentes Mensais</h3>
            <div className="space-y-4">
              {Object.entries(formData.premiumServices?.recurring || {}).map(([serviceKey, serviceData]: [string, any]) => (
                <Card key={serviceKey} className="border-l-4 border-l-purple-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {serviceKey === 'vipSupport' ? 'Suporte VIP' : 'CS Dedicado'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Herança: <strong>{serviceData.inheritanceRule}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Preço Mensal (R$)</Label>
                        <NumberInput
                          value={serviceData.monthlyPrice}
                          onChange={(val: number) => updateValue(['premiumServices', 'recurring', serviceKey, 'monthlyPrice'], val)}
                        />
                      </div>
                      <div className="col-span-3 space-y-2">
                        <Label className="text-xs">Habilitado por padrão em:</Label>
                        <div className="flex gap-4">
                          {['prime', 'k', 'k2'].map((plan) => (
                            <div key={plan} className="flex items-center gap-2">
                              <Checkbox
                                checked={serviceData.defaultByPlan?.[plan]}
                                onCheckedChange={(checked) => updateValue(['premiumServices', 'recurring', serviceKey, 'defaultByPlan', plan], checked)}
                              />
                              <Label className="text-xs uppercase">{plan}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {serviceData._inheritanceNote && (
                      <HelperText>{serviceData._inheritanceNote}</HelperText>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Non-Recurring Services */}
          <div>
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Serviços Não Recorrentes (Únicos)</h3>
            <div className="space-y-4">
              {Object.entries(formData.premiumServices?.nonRecurring || {}).map(([serviceKey, serviceData]: [string, any]) => (
                <Card key={serviceKey} className="border-l-4 border-l-indigo-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {serviceKey === 'treinamentoOnline' ? 'Treinamento Online' : 'Treinamento Presencial'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Duplicação: <strong>{serviceData.duplicationRule}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs">Preço Unitário (R$)</Label>
                        <NumberInput
                          value={serviceData.unitPrice}
                          onChange={(val: number) => updateValue(['premiumServices', 'nonRecurring', serviceKey, 'unitPrice'], val)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Quantidade Inclusa por Plano</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {['prime', 'k', 'k2'].map((plan) => (
                            <div key={plan}>
                              <Label className="text-[10px] uppercase text-muted-foreground">{plan}</Label>
                              <NumberInput
                                value={serviceData.includedQuantityByPlan?.[plan] || 0}
                                onChange={(val: number) => updateValue(['premiumServices', 'nonRecurring', serviceKey, 'includedQuantityByPlan', plan], val)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {serviceData._duplicationNote && (
                      <HelperText>{serviceData._duplicationNote}</HelperText>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BLOCO E — Kombos — Descontos Promocionais Cumulativos */}
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="E"
            title="Kombos — Descontos Promocionais Cumulativos"
            description="Descontos aplicados sobre o valor já ajustado pelo ciclo"
          />
          <Alert className="bg-green-50 border-green-200">
            <Info className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-xs text-green-900">
              <strong>Regra global:</strong> {formData.kombos?._globalRule || 'Desconto aplicado sobre o valor já ajustado pelo ciclo'}
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(formData.kombos || {}).map(([komboKey, komboData]: [string, any]) => {
            if (komboKey.startsWith('_')) return null;
            
            return (
              <Card key={komboKey} className="border-l-4 border-l-green-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{komboData.name}</CardTitle>
                  <CardDescription className="text-xs">
                    Produtos: <strong>{komboData.productsIncluded?.join(', ')}</strong>
                    {komboData.addonsIncluded?.length > 0 && (
                      <> • Add-ons: <strong>{komboData.addonsIncluded.join(', ')}</strong></>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Desconto (%)</Label>
                    <NumberInput
                      value={komboData.discount * 100}
                      onChange={(val: number) => updateValue(['kombos', komboKey, 'discount'], val / 100)}
                    />
                    <HelperText>Aplicado após desconto de ciclo</HelperText>
                  </div>
                  <div>
                    <Label className="text-xs">Implantações Gratuitas</Label>
                    <NumberInput
                      value={komboData.freeImplementations}
                      onChange={(val: number) => updateValue(['kombos', komboKey, 'freeImplementations'], val)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Ordem de Aplicação</Label>
                    <Input
                      value={komboData.discountOrder}
                      disabled
                      className="h-7 text-sm bg-muted"
                    />
                    <HelperText>Sempre após ciclo (ordem 2)</HelperText>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* BLOCO F — Custos Variáveis Pós-Pago (por Faixa de Uso) */}
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="F"
            title="Custos Variáveis Pós-Pago (por Faixa de Uso)"
            description="Preços por faixa de uso para usuários, contratos, leads, boletos, splits e seguros"
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(formData.variableCosts || {}).map(([costKey, costData]: [string, any]) => {
            if (costKey.startsWith('_')) return null;
            
            return (
              <Card key={costKey} className="border-l-4 border-l-orange-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base capitalize">
                    {costKey.replace(/([A-Z])/g, ' $1').trim()}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Produto: <strong>{costData.product}</strong> • Unidade: <strong>{costData.unit}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.entries(costData.tiers || {}).map(([planKey, tiers]: [string, any]) => (
                    <div key={planKey} className="mb-4">
                      <Label className="text-xs uppercase font-semibold mb-2 block">{planKey}</Label>
                      <div className="space-y-2">
                        {tiers.map((tier: any, idx: number) => (
                          <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                            <div>
                              <Label className="text-[10px]">De</Label>
                              <NumberInput
                                value={tier.from || 0}
                                onChange={(val: number) => updateValue(['variableCosts', costKey, 'tiers', planKey, String(idx), 'from'], val)}
                              />
                            </div>
                            <div>
                              <Label className="text-[10px]">Até</Label>
                              <NumberInput
                                value={tier.to || 0}
                                onChange={(val: number) => updateValue(['variableCosts', costKey, 'tiers', planKey, String(idx), 'to'], val)}
                              />
                            </div>
                            <div>
                              <Label className="text-[10px]">{tier.price !== undefined ? 'Preço' : 'Taxa (%)'}</Label>
                              <NumberInput
                                value={tier.price !== undefined ? (tier.price || 0) : ((tier.rate || 0) * 100)}
                                onChange={(val: number) => {
                                  if (tier.price !== undefined) {
                                    updateValue(['variableCosts', costKey, 'tiers', planKey, String(idx), 'price'], val);
                                  } else {
                                    updateValue(['variableCosts', costKey, 'tiers', planKey, String(idx), 'rate'], val / 100);
                                  }
                                }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tier.to === 999999 ? '∞' : `Faixa ${idx + 1}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {costData._note && (
                    <HelperText>{costData._note}</HelperText>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* BLOCO G — Matriz de Funcionalidades — Fonte Única de Verdade */}
      <Card className="mb-8">
        <CardHeader>
          <SectionHeader
            letter="G"
            title="Matriz de Funcionalidades — Fonte Única de Verdade"
            description="Define exatamente quais funcionalidades estão incluídas em cada plano"
          />
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-xs text-red-900">
              <strong>Atenção:</strong> {formData.featureMatrix?._warning || 'Qualquer alteração aqui impacta imediatamente calculadora, páginas públicas e PDFs'}
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent className="space-y-6">
          {['imob', 'locacao'].map((product) => (
            <div key={product}>
              <h3 className="text-lg font-semibold capitalize border-b pb-2 mb-4">
                Kenlo {product === 'imob' ? 'IMOB' : 'Locação'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-semibold">Funcionalidade</th>
                      <th className="text-center py-2 px-2 font-semibold uppercase">Prime</th>
                      <th className="text-center py-2 px-2 font-semibold uppercase">K</th>
                      <th className="text-center py-2 px-2 font-semibold uppercase">K2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Get all unique features across all plans */}
                    {(() => {
                      const allFeatures = new Map();
                      ['prime', 'k', 'k2'].forEach((plan) => {
                        formData.featureMatrix?.[product]?.[plan]?.forEach((feature: any) => {
                          if (!allFeatures.has(feature.name)) {
                            allFeatures.set(feature.name, feature);
                          }
                        });
                      });
                      
                      return Array.from(allFeatures.values()).map((feature: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2">
                            <div>
                              <div className="font-medium">{feature.name}</div>
                              <div className="text-xs text-muted-foreground">{feature.description}</div>
                              {(feature.linkedToAddon || feature.linkedToPremiumService) && (
                                <div className="text-[10px] text-blue-600 mt-1">
                                  → {feature.linkedToAddon ? `Add-on: ${feature.linkedToAddon}` : `Premium: ${feature.linkedToPremiumService}`}
                                </div>
                              )}
                            </div>
                          </td>
                          {['prime', 'k', 'k2'].map((plan) => {
                            const planFeatures = formData.featureMatrix?.[product]?.[plan] || [];
                            const planFeature = planFeatures.find((f: any) => f.name === feature.name);
                            const isIncluded = planFeature?.included || false;
                            
                            return (
                              <td key={plan} className="text-center py-2 px-2">
                                <button
                                  onClick={() => {
                                    const featureIdx = planFeatures.findIndex((f: any) => f.name === feature.name);
                                    if (featureIdx >= 0) {
                                      updateValue(['featureMatrix', product, plan, String(featureIdx), 'included'], !isIncluded);
                                    }
                                  }}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
                                >
                                  {isIncluded ? (
                                    <Check className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <X className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
