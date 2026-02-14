/**
 * QuoteInfoHandler - QuoteInfoDialog with its PDF generation onSubmit handler
 * Refactored to use buildProposalData utility for data assembly.
 */

import { QuoteInfoDialog, type QuoteInfo } from "@/components/QuoteInfoDialog";
import { useNotification } from "@/hooks/useNotification";
import { downloadProposalPDF } from "@/utils/generateProposalPDF";
import { useCalc } from "./CalculadoraContext";
import { buildProposalData, buildQuoteSaveData } from "./quote/buildProposalData";

export function QuoteInfoHandler() {
  const notification = useNotification();
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
      notification.info("Gerando PDF", "Por favor aguarde...", 0);

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

      notification.success("PDF baixado", "Seu orcamento foi gerado com sucesso!");

      // Save to proposals database
      await createProposal.mutateAsync(proposalData as any);

      // Also save to quotes database for tracking
      try {
        const quoteSaveData = buildQuoteSaveData(input, proposalData);
        await saveQuoteMutation.mutateAsync(quoteSaveData as any);
      } catch (quoteError) {
        console.error("Failed to save quote:", quoteError);
      }

      notification.success("Proposta salva", "Sua proposta foi salva com sucesso!");
    } catch (error) {
      notification.error("Erro ao gerar proposta", "Tente novamente ou entre em contato com o suporte.");
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
