/**
 * ExportActionsSection - Export buttons and validation messages
 * Extracted from CalculadoraPage.tsx (lines ~4058-4134)
 */

import { Button } from "@/components/ui/button";
import { CheckCircle2, Key, Zap, Download, Shuffle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCalc } from "./CalculadoraContext";

export function ExportActionsSection() {
  const {
    canExportPDF,
    selectedPlans,
    isGeneratingExamples,
    handleGenerate3Examples,
    businessNature,
    isBusinessNatureComplete,
    setShowValidationErrors,
    setShowQuoteInfoDialog,
  } = useCalc();

  const handleExportClick = () => {
    if (!canExportPDF) {
      toast.error("Faça login como vendedor autorizado para exportar cotações.");
      return;
    }
    const hasCompanyErrors =
      !businessNature.companyName.trim() ||
      !businessNature.ownerName.trim() ||
      !businessNature.email.trim() ||
      !businessNature.cellphone.trim();
    if (!isBusinessNatureComplete() || hasCompanyErrors) {
      setShowValidationErrors(true);
      toast.error(
        "Preencha todos os campos obrigatórios marcados com * antes de exportar."
      );
      const businessNatureSection = document.getElementById(
        "business-nature-section"
      );
      if (businessNatureSection) {
        businessNatureSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      return;
    }
    if (selectedPlans.length === 0) {
      toast.error(
        "Selecione um plano na tabela de comparação antes de exportar."
      );
      const komboSection = document.getElementById("kombo-comparison-section");
      if (komboSection) {
        komboSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    setShowValidationErrors(false);
    setShowQuoteInfoDialog(true);
  };

  return (
    <div className="flex flex-col gap-3 mt-6 mb-24">
      {selectedPlans.length > 0 && canExportPDF && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-900">
            Plano selecionado para a proposta. Clique em "Exportar Cotação" para gerar o PDF.
          </span>
        </div>
      )}
      {canExportPDF && selectedPlans.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Zap className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Selecione um plano na tabela acima para exportar na cotação.
          </span>
        </div>
      )}
      {!canExportPDF && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Key className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-medium text-amber-900">
            Para exportar cotações, faça login como vendedor autorizado.
          </span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          className="flex-1 min-h-[50px]"
          size="lg"
          onClick={handleGenerate3Examples}
          variant="outline"
          disabled={isGeneratingExamples}
        >
          {isGeneratingExamples ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Shuffle className="w-4 h-4 mr-2" />
          )}
          {isGeneratingExamples ? "Gerando..." : "Gerar 3 Exemplos"}
        </Button>
        <Button
          className="flex-1 min-h-[50px]"
          size="lg"
          onClick={handleExportClick}
          variant={
            selectedPlans.length > 0 && canExportPDF ? "default" : "outline"
          }
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Cotação (PDF)
        </Button>
      </div>
    </div>
  );
}
