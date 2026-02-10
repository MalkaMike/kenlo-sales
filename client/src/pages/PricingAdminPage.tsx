import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function PricingAdminPage() {
  const { data: config, isLoading, refetch } = trpc.pricingAdmin.getConfig.useQuery();
  const saveMutation = trpc.pricingAdmin.saveConfig.useMutation({
    onSuccess: () => {
      refetch();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [editedConfig, setEditedConfig] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize edited config when data loads
  useEffect(() => {
    if (config && !editedConfig) {
      setEditedConfig(JSON.parse(JSON.stringify(config)));
    }
  }, [config, editedConfig]);

  const handleSave = () => {
    if (editedConfig) {
      saveMutation.mutate(editedConfig);
    }
  };

  const updateValue = (path: string[], value: any) => {
    setEditedConfig((prev: any) => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      let current = newConfig;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newConfig;
    });
  };

  if (isLoading || !editedConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando configuração...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/calculadora">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Calculadora
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Configuração de Preços</h1>
          <p className="text-muted-foreground">
            Edite todos os valores de preços, descontos e regras. Todos os preços de produtos/add-ons são <strong>anuais</strong>.
          </p>
        </div>

        {/* Success/Error Messages */}
        {showSuccess && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Configuração salva com sucesso!
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* Save Button (Sticky) */}
        <div className="sticky top-4 z-10 mb-6 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Frequency Multipliers */}
          <Card>
            <CardHeader>
              <CardTitle>Multiplicadores de Frequência de Pagamento</CardTitle>
              <CardDescription>
                Ajuste os multiplicadores para calcular preços de diferentes ciclos a partir do preço anual (referência = 1.0)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Mensal</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedConfig.frequencyMultipliers.monthly}
                  onChange={(e) => updateValue(["frequencyMultipliers", "monthly"], parseFloat(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Atual: {editedConfig.frequencyMultipliers.monthly}x (Anual × {editedConfig.frequencyMultipliers.monthly})
                </p>
              </div>
              <div>
                <Label>Semestral</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedConfig.frequencyMultipliers.semiannual}
                  onChange={(e) => updateValue(["frequencyMultipliers", "semiannual"], parseFloat(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Atual: {editedConfig.frequencyMultipliers.semiannual}x (Anual × {editedConfig.frequencyMultipliers.semiannual})
                </p>
              </div>
              <div>
                <Label>Bienal</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedConfig.frequencyMultipliers.biennial}
                  onChange={(e) => updateValue(["frequencyMultipliers", "biennial"], parseFloat(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Atual: {editedConfig.frequencyMultipliers.biennial}x (Anual × {editedConfig.frequencyMultipliers.biennial})
                </p>
              </div>
            </CardContent>
          </Card>

          {/* IMOB Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Planos IMOB</CardTitle>
              <CardDescription>Preços anuais e usuários inclusos para cada plano</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold capitalize">{plan.toUpperCase()}</h4>
                  <div>
                    <Label>Preço Anual (R$)</Label>
                    <Input
                      type="number"
                      value={editedConfig.imobPlans[plan].annualPrice}
                      onChange={(e) => updateValue(["imobPlans", plan, "annualPrice"], parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Usuários Inclusos</Label>
                    <Input
                      type="number"
                      value={editedConfig.imobPlans[plan].includedUsers}
                      onChange={(e) => updateValue(["imobPlans", plan, "includedUsers"], parseInt(e.target.value))}
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
              <CardDescription>Preços anuais e contratos inclusos para cada plano</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              {["prime", "k", "k2"].map((plan) => (
                <div key={plan} className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold capitalize">{plan.toUpperCase()}</h4>
                  <div>
                    <Label>Preço Anual (R$)</Label>
                    <Input
                      type="number"
                      value={editedConfig.locPlans[plan].annualPrice}
                      onChange={(e) => updateValue(["locPlans", plan, "annualPrice"], parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Contratos Inclusos</Label>
                    <Input
                      type="number"
                      value={editedConfig.locPlans[plan].includedContracts}
                      onChange={(e) => updateValue(["locPlans", plan, "includedContracts"], parseInt(e.target.value))}
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
            <CardContent className="grid md:grid-cols-3 gap-4">
              {Object.keys(editedConfig.addons).map((addon) => (
                <div key={addon} className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold capitalize">{addon}</h4>
                  <div>
                    <Label>Preço Anual (R$)</Label>
                    <Input
                      type="number"
                      value={editedConfig.addons[addon].annualPrice}
                      onChange={(e) => updateValue(["addons", addon, "annualPrice"], parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Implantação (R$)</Label>
                    <Input
                      type="number"
                      value={editedConfig.addons[addon].implementation}
                      onChange={(e) => updateValue(["addons", addon, "implementation"], parseInt(e.target.value))}
                    />
                  </div>
                  {editedConfig.addons[addon].includedLeads !== undefined && (
                    <div>
                      <Label>Leads Inclusos</Label>
                      <Input
                        type="number"
                        value={editedConfig.addons[addon].includedLeads}
                        onChange={(e) => updateValue(["addons", addon, "includedLeads"], parseInt(e.target.value))}
                      />
                    </div>
                  )}
                  {editedConfig.addons[addon].includedSignatures !== undefined && (
                    <div>
                      <Label>Assinaturas Inclusas</Label>
                      <Input
                        type="number"
                        value={editedConfig.addons[addon].includedSignatures}
                        onChange={(e) => updateValue(["addons", addon, "includedSignatures"], parseInt(e.target.value))}
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
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>VIP Support (R$/mês)</Label>
                <Input
                  type="number"
                  value={editedConfig.premiumServices.vipSupport}
                  onChange={(e) => updateValue(["premiumServices", "vipSupport"], parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>CS Dedicado (R$/mês)</Label>
                <Input
                  type="number"
                  value={editedConfig.premiumServices.csDedicado}
                  onChange={(e) => updateValue(["premiumServices", "csDedicado"], parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Kombos */}
          <Card>
            <CardHeader>
              <CardTitle>Kombos</CardTitle>
              <CardDescription>Descontos, implantação e inclusão de premium services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(editedConfig.kombos).map((kombo) => (
                <div key={kombo} className="grid md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="md:col-span-4">
                    <h4 className="font-semibold capitalize">{kombo.replace(/_/g, " ")}</h4>
                  </div>
                  <div>
                    <Label>Desconto (%)</Label>
                    <Input
                      type="number"
                      value={editedConfig.kombos[kombo].discount}
                      onChange={(e) => updateValue(["kombos", kombo, "discount"], parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Implantação (R$)</Label>
                    <Input
                      type="number"
                      value={editedConfig.kombos[kombo].implementation}
                      onChange={(e) => updateValue(["kombos", kombo, "implementation"], parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      checked={editedConfig.kombos[kombo].includesPremium}
                      onCheckedChange={(checked) => updateValue(["kombos", kombo, "includesPremium"], checked)}
                    />
                    <Label>Inclui Premium Services</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Additional Costs - Simplified version */}
          <Card>
            <CardHeader>
              <CardTitle>Outros Custos</CardTitle>
              <CardDescription>Kenlo Pay, Seguros e Implantação Base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Kenlo Pay - Boletos por Contrato (R$)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editedConfig.kenloPay.boletosPerContract}
                    onChange={(e) => updateValue(["kenloPay", "boletosPerContract"], parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Kenlo Pay - Splits por Contrato (R$)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editedConfig.kenloPay.splitsPerContract}
                    onChange={(e) => updateValue(["kenloPay", "splitsPerContract"], parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Kenlo Seguros - Preço por Contrato (R$)</Label>
                  <Input
                    type="number"
                    value={editedConfig.kenloSeguros.pricePerContract}
                    onChange={(e) => updateValue(["kenloSeguros", "pricePerContract"], parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Implantação Base (R$)</Label>
                  <Input
                    type="number"
                    value={editedConfig.implantacaoBase}
                    onChange={(e) => updateValue(["implantacaoBase"], parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
