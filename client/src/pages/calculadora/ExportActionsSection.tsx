/**
 * ExportActionsSection - Single centered "Exportar Cotação (PDF)" button
 * This is the final step of the calculator workflow.
 */

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCalc } from "./CalculadoraContext";

export function ExportActionsSection() {
  const {
    canExportPDF,
    selectedPlans,
    businessNature,
    isBusinessNatureComplete,
    setShowValidationErrors,
    setShowQuoteInfoDialog,
  } = useCalc();

  const handleExportClick = () => {
    console.log('[ExportActionsSection] canExportPDF:', canExportPDF);
    console.log('[ExportActionsSection] selectedPlans:', selectedPlans);
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
    <div className="flex flex-col items-center gap-4 mt-10 mb-24">
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Configuração concluída. Exporte o PDF da proposta.
      </p>
      <Button
        className="min-h-[56px] min-w-[280px] text-base font-semibold shadow-lg"
        size="lg"
        onClick={handleExportClick}
      >
        <Download className="w-5 h-5 mr-2" />
        Exportar Cotação (PDF)
      </Button>
    </div>
  );
}
