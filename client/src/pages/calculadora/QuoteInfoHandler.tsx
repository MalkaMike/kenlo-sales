/**
 * QuoteInfoHandler - QuoteInfoDialog with its PDF generation onSubmit handler
 * Refactored to use buildProposalData utility for data assembly.
 */

import { QuoteInfoDialog, type QuoteInfo } from "@/components/QuoteInfoDialog";
import { toast } from "sonner";
import { downloadProposalPDF } from "@/utils/generateProposalPDF";
import { useCalc } from "./CalculadoraContext";
import { buildProposalData, buildQuoteSaveData } from "./quote/buildProposalData";

export function QuoteInfoHandler() {
  const {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    frequency,
    activeKombo,
    komboInfo,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
    businessNature,
    showQuoteInfoDialog,
    setShowQuoteInfoDialog,
    setPendingQuoteInfo,
    selectedColumnsData,
    getLineItems,
    calculateTotalImplementation,
    calculatePrepaymentAmount,
    createProposal,
    saveQuoteMutation,
  } = useCalc();

  const handleSubmit = async (quoteInfo: QuoteInfo) => {
    setPendingQuoteInfo(quoteInfo);
    setShowQuoteInfoDialog(false);

    try {
      const toastId = toast.loading("Gerando PDF...");

      // Build proposal data using the pure utility function
      const input = {
        quoteInfo,
        product,
        imobPlan,
        locPlan,
        addons,
        metrics,
        frequency,
        activeKombo,
        komboInfo,
        businessNature,
        prepayAdditionalUsers,
        prepayAdditionalContracts,
        selectedColumnsData,
        getLineItems,
        calculateTotalImplementation,
        calculatePrepaymentAmount,
      };

      const proposalData = buildProposalData(input);

      // Download the PDF
      await downloadProposalPDF(proposalData as any);

      toast.dismiss();
      toast.success("PDF baixado com sucesso!");

      // Save to proposals database
      await createProposal.mutateAsync(proposalData as any);

      // Also save to quotes database for tracking
      try {
        const quoteSaveData = buildQuoteSaveData(input, proposalData);
        await saveQuoteMutation.mutateAsync(quoteSaveData as any);
      } catch (quoteError) {
        console.error("Failed to save quote:", quoteError);
      }

      toast.dismiss();
      toast.success("Proposta gerada e salva com sucesso!");
    } catch (error) {
      toast.dismiss();
      toast.error("Erro ao gerar proposta. Tente novamente.");
      console.error("Error generating proposal:", error);
    }
  };

  return (
    <QuoteInfoDialog
      open={showQuoteInfoDialog}
      onOpenChange={setShowQuoteInfoDialog}
      paymentFrequency={frequency}
      onSubmit={handleSubmit}
    />
  );
}
