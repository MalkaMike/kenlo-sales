/**
 * Proposals router — create proposal and generate PDF.
 */

import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createProposal } from "../proposals";
import { generateProposalPDF } from "../pdfGenerator";
import { getSalespersonFromContext } from "./salespersonAuth";
import { z } from "zod";

export const proposalsRouter = router({
  create: protectedProcedure
    .input(z.object({
      salesPersonName: z.string(),
      clientName: z.string(),
      agencyName: z.string().optional(),
      productType: z.string(),
      imobPlan: z.string().optional(),
      locPlan: z.string().optional(),
      imobUsers: z.number().optional(),
      closings: z.number().optional(),
      leads: z.number().optional(),
      externalAI: z.number().optional(),
      whatsapp: z.number().optional(),
      imobVipSupport: z.number().optional(),
      imobDedicatedCS: z.number().optional(),
      contracts: z.number().optional(),
      newContracts: z.number().optional(),
      locVipSupport: z.number().optional(),
      locDedicatedCS: z.number().optional(),
      chargesBoleto: z.number().optional(),
      boletoAmount: z.number().optional(),
      chargesSplit: z.number().optional(),
      splitAmount: z.number().optional(),
      selectedAddons: z.string(),
      paymentPlan: z.string(),
      totalMonthly: z.number(),
      totalAnnual: z.number(),
      implantationFee: z.number(),
      firstYearTotal: z.number(),
      postPaidTotal: z.number().optional(),
      revenueFromBoletos: z.number().optional(),
      revenueFromInsurance: z.number().optional(),
      netGain: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const proposal = await createProposal({
        userId: ctx.user.id,
        ...input,
      });
      return { success: true, proposalId: proposal };
    }),
  
  generatePDF: publicProcedure
    .input(z.object({
      salesPersonName: z.string(),
      vendorEmail: z.string().optional(),
      vendorPhone: z.string().optional(),
      vendorRole: z.string().optional(),
      clientName: z.string(),
      agencyName: z.string().optional(),
      productType: z.string(),
      komboName: z.string().optional(),
      komboDiscount: z.number().optional(),
      imobPlan: z.string().optional(),
      locPlan: z.string().optional(),
      imobUsers: z.number().optional(),
      closings: z.number().optional(),
      contracts: z.number().optional(),
      newContracts: z.number().optional(),
      leadsPerMonth: z.number().optional(),
      usesExternalAI: z.boolean().optional(),
      wantsWhatsApp: z.boolean().optional(),
      chargesSplitToOwner: z.boolean().optional(),
      chargesBoletoToTenant: z.boolean().optional(),
      boletoAmount: z.number().optional(),
      splitAmount: z.number().optional(),
      email: z.string().optional(),
      cellphone: z.string().optional(),
      selectedAddons: z.string(),
      paymentPlan: z.string(),
      totalMonthly: z.number(),
      totalAnnual: z.number(),
      implantationFee: z.number(),
      firstYearTotal: z.number(),
      postPaidTotal: z.number().optional(),
      revenueFromBoletos: z.number().optional(),
      revenueFromInsurance: z.number().optional(),
      netGain: z.number().optional(),
      prepayAdditionalUsers: z.boolean().optional(),
      prepayAdditionalContracts: z.boolean().optional(),
      prepaymentUsersAmount: z.number().optional(),
      prepaymentContractsAmount: z.number().optional(),
      prepaymentMonths: z.number().optional(),
      hasPremiumServices: z.boolean().optional(),
      premiumServicesPrice: z.number().optional(),
      installments: z.number().optional(),
      validityDays: z.number().optional(),
      businessType: z.string().optional(),
      monthlyLicenseBase: z.number().optional(),
      imobPrice: z.number().optional(),
      locPrice: z.number().optional(),
      addonPrices: z.string().optional(),
      vipIncluded: z.boolean().optional(),
      csIncluded: z.boolean().optional(),
      vipPrice: z.number().optional(),
      csPrice: z.number().optional(),
      postPaidBreakdown: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const salesperson = await getSalespersonFromContext(ctx);
      const oauthUser = ctx.user;
      
      const isAuthorizedEmail = (email: string | null | undefined): boolean => {
        if (!email) return false;
        const authorizedDomains = ['@kenlo.com.br', '@i-value.com.br', '@laik.com.br'];
        return authorizedDomains.some(domain => email.toLowerCase().endsWith(domain));
      };
      
      const canExport = salesperson || isAuthorizedEmail(oauthUser?.email);
      
      if (!canExport) {
        throw new Error("Acesso negado: Apenas usuários Kenlo podem gerar orçamentos. Faça login com sua conta Google corporativa.");
      }
      const pdfBuffer = await generateProposalPDF(input);
      return {
        success: true,
        pdf: pdfBuffer.toString("base64"),
        filename: `Cotacao_Kenlo_${input.clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
      };
    }),
});
