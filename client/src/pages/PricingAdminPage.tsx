/**
 * PricingAdminPage — Thin orchestrator.
 * All section UI lives in ./pricing-admin/ sub-components.
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Info, AlertTriangle, FileText, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  SECTIONS, roundToSeven,
  SectionPaymentCycles,
  SectionBasePlans,
  SectionAddons,
  SectionPremiumServices,
  SectionKombos,
  SectionVariableCosts,
  SectionFeatureMatrix,
  SectionPrepaidPricing,
} from "./pricing-admin";

export default function PricingAdminPageV2() {
  const { data: config, isLoading, refetch } = trpc.pricingAdmin.getConfig.useQuery();
  const saveConfigMutation = trpc.pricingAdmin.saveConfig.useMutation();
  const generateReferencePDFMutation = trpc.pricingAdmin.generateReferencePDF.useMutation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pricing config is deeply nested JSON
  const [formData, setFormData] = useState<Record<string, any> | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [changeReason, setChangeReason] = useState("");
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("section-a");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) =>
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));

  useEffect(() => {
    if (config) {
      setFormData(config);
      setLastModified(config._lastModified || new Date().toISOString());
    }
  }, [config]);

  // Intersection observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [formData]);

  const handleSaveClick = () => setShowConfirmDialog(true);

  const handleConfirmSave = async () => {
    if (!formData) return;
    try {
      const updatedData = { ...formData, _lastModified: new Date().toISOString(), _version: "2.0.0" };
      await saveConfigMutation.mutateAsync(updatedData as Parameters<typeof saveConfigMutation.mutateAsync>[0]);
      alert(`\u2705 Configuração salva com sucesso!\n\nMotivo: ${changeReason || "Não informado"}`);
      setHasChanges(false);
      setShowConfirmDialog(false);
      setChangeReason("");
      setLastModified(updatedData._lastModified);
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar configuração";
      alert(`\u274C Erro: ${message}`);
    }
  };

  const handleExportReferencePDF = async () => {
    try {
      const result = await generateReferencePDFMutation.mutateAsync();
      // Convert base64 to blob and download
      const byteCharacters = atob(result.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      alert(`\u274C Erro ao gerar PDF: ${message}`);
    }
  };

  const updateValue = (path: string[], value: unknown) => {
    setFormData((prev: Record<string, any> | null) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) current = current[path[i]];
      current[path[path.length - 1]] = value;
      setHasChanges(true);
      return newData;
    });
  };

  const getPreviewPrices = (annualPrice: number) => {
    if (!formData?.paymentCycles) return null;
    return {
      monthly: roundToSeven(annualPrice * (formData.paymentCycles.monthly?.multiplier || 1.25)),
      semestral: roundToSeven(annualPrice * (formData.paymentCycles.semiannual?.multiplier || 1.125)),
      annual: roundToSeven(annualPrice * (formData.paymentCycles.annual?.multiplier || 1)),
      biennial: roundToSeven(annualPrice * (formData.paymentCycles.biennial?.multiplier || 0.875)),
    };
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sticky Sidebar TOC */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Navegação
          </div>
          {SECTIONS.map(({ id, letter, title }) => (
            <button
              key={id}
              onClick={() => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                if (collapsedSections[id]) setCollapsedSections((p) => ({ ...p, [id]: false }));
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                activeSection === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  activeSection === id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {letter}
              </span>
              <span className="truncate">{title}</span>
            </button>
          ))}
          <div className="pt-4 border-t mt-4 space-y-2">
            <Button onClick={handleSaveClick} disabled={!hasChanges || saveConfigMutation.isPending} size="sm" className="w-full gap-2">
              {saveConfigMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </Button>
            <Button
              onClick={handleExportReferencePDF}
              disabled={generateReferencePDFMutation.isPending}
              size="sm"
              variant="outline"
              className="w-full gap-2"
            >
              {generateReferencePDFMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Pricing Bible
            </Button>
            {hasChanges && <p className="text-[10px] text-amber-600 text-center mt-1">Alterações não salvas</p>}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Configuração de Preços</h1>
              <p className="text-muted-foreground">Fonte Única de Verdade — Estrutura Determinística v2.0.0</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportReferencePDF}
                disabled={generateReferencePDFMutation.isPending}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                {generateReferencePDFMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Gerando...</>
                ) : (
                  <><Download className="w-5 h-5" /> Pricing Bible (PDF)</>
                )}
              </Button>
              <Button onClick={handleSaveClick} disabled={!hasChanges || saveConfigMutation.isPending} size="lg" className="gap-2 lg:hidden">
                {saveConfigMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
                ) : (
                  <><Save className="w-5 h-5" /> Salvar Alterações</>
                )}
              </Button>
            </div>
          </div>
          <Alert className="bg-primary/5 border-primary/20">
            <Info className="w-4 h-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Essa configuração é a fonte única de verdade para Calculadora e PDF.</strong>{" "}
              Qualquer alteração aqui impacta imediatamente todas as cotações, páginas públicas e documentos gerados.
              {lastModified && (
                <span className="block mt-1 text-xs text-muted-foreground">
                  Última alteração em: {new Date(lastModified).toLocaleString("pt-BR")}
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>

        {/* Sections */}
        <SectionPaymentCycles formData={formData} updateValue={updateValue} collapsed={!!collapsedSections["section-a"]} onToggle={() => toggleSection("section-a")} />
        <SectionBasePlans formData={formData} updateValue={updateValue} collapsed={!!collapsedSections["section-b"]} onToggle={() => toggleSection("section-b")} getPreviewPrices={getPreviewPrices} />
        <SectionAddons formData={formData} updateValue={updateValue} collapsed={!!collapsedSections["section-c"]} onToggle={() => toggleSection("section-c")} getPreviewPrices={getPreviewPrices} />

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Alterações</DialogTitle>
              <DialogDescription>Você está prestes a alterar a configuração de preços. Isso impactará:</DialogDescription>
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
              <Textarea value={changeReason} onChange={(e) => setChangeReason(e.target.value)} placeholder="Ex: Ajuste de preços para Q1 2026, correção de erro no plano K², etc." rows={3} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancelar</Button>
              <Button onClick={handleConfirmSave} disabled={saveConfigMutation.isPending}>
                {saveConfigMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Confirmar e Salvar</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <SectionPremiumServices formData={formData} updateValue={updateValue} collapsed={!!collapsedSections["section-d"]} onToggle={() => toggleSection("section-d")} />
        <SectionKombos formData={formData} updateValue={updateValue} collapsed={!!collapsedSections["section-e"]} onToggle={() => toggleSection("section-e")} />
        <SectionVariableCosts formData={formData} updateValue={updateValue} collapsed={!!collapsedSections["section-f"]} onToggle={() => toggleSection("section-f")} />
        <SectionFeatureMatrix formData={formData} updateValue={updateValue} collapsed={!!collapsedSections["section-g"]} onToggle={() => toggleSection("section-g")} />
        <SectionPrepaidPricing formData={formData} updateValue={updateValue} collapsed={!!collapsedSections["section-h"]} onToggle={() => toggleSection("section-h")} />
      </div>
    </div>
  );
}
