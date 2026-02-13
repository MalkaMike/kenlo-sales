/**
 * useExampleGenerator - Generates 3 random example PDFs for demonstration.
 * Uses the same client-side PDF generator (jsPDF) as "Gerar Cotação".
 */

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { buildExampleProposalData } from "./exampleConfigGenerator";
import { downloadProposalPDF } from "@/utils/generateProposalPDF";
import type { ProposalPrintData } from "@/utils/pdf/pdfHelpers";

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseExampleGeneratorParams {
  canExportPDF: boolean;
}

export function useExampleGenerator({ canExportPDF }: UseExampleGeneratorParams) {
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);

  const handleGenerate3Examples = useCallback(async () => {
    if (!canExportPDF) {
      toast.error("Faça login como vendedor autorizado para gerar exemplos.");
      return;
    }
    setIsGeneratingExamples(true);
    toast.loading("Gerando 3 exemplos aleatórios...");

    let successCount = 0;

    for (let i = 0; i < 3; i++) {
      try {
        const { proposalData } = buildExampleProposalData();

        // Use the same client-side PDF generator as "Gerar Cotação"
        await downloadProposalPDF(proposalData as ProposalPrintData);

        successCount++;

        // Small delay between downloads to avoid browser throttling
        if (i < 2) await new Promise(r => setTimeout(r, 800));
      } catch (error) {
        console.error(`Erro ao gerar exemplo ${i + 1}:`, error);
      }
    }

    toast.dismiss();
    setIsGeneratingExamples(false);

    if (successCount === 3) {
      toast.success(`${successCount} PDFs de exemplo gerados com sucesso!`);
    } else if (successCount > 0) {
      toast.success(`${successCount} de 3 PDFs gerados. Alguns falharam.`);
    } else {
      toast.error("Falha ao gerar exemplos. Verifique o login.");
    }
  }, [canExportPDF]);

  return {
    isGeneratingExamples,
    handleGenerate3Examples,
  };
}
