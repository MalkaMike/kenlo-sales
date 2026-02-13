/**
 * useExampleGenerator - Generates 3 random example PDFs for demonstration.
 * Thin React hook that delegates all data generation to exampleConfigGenerator.
 */

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { buildExampleProposalData } from "./exampleConfigGenerator";

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseExampleGeneratorParams {
  canExportPDF: boolean;
  generatePDF: { mutateAsync: (data: any) => Promise<{ success: boolean; pdf?: string }> };
}

export function useExampleGenerator({ canExportPDF, generatePDF }: UseExampleGeneratorParams) {
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
        const { proposalData, company, komboId } = buildExampleProposalData();

        const pdfResult = await generatePDF.mutateAsync(proposalData);

        if (pdfResult.success && pdfResult.pdf) {
          const pdfBlob = new Blob(
            [Uint8Array.from(atob(pdfResult.pdf), (c) => c.charCodeAt(0))],
            { type: "application/pdf" }
          );
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Exemplo_${i + 1}_${company.replace(/\s+/g, "_")}_${komboId || "sem_kombo"}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          successCount++;
        }

        if (i < 2) await new Promise(r => setTimeout(r, 1500));
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
  }, [canExportPDF, generatePDF]);

  return {
    isGeneratingExamples,
    handleGenerate3Examples,
  };
}
