import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createProposal } from "./proposals";
import { generateProposalPDF } from "./pdfGenerator";
import { saveQuote, getQuotes, getQuoteStats, deleteQuote } from "./quotes";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  quotes: router({
    save: publicProcedure
      .input(z.object({
        action: z.enum(["link_copied", "pdf_exported"]),
        product: z.string(),
        imobPlan: z.string().optional(),
        locPlan: z.string().optional(),
        frequency: z.string(),
        addons: z.string(), // JSON string
        metrics: z.string(), // JSON string
        totals: z.string(), // JSON string
        komboId: z.string().optional(),
        komboName: z.string().optional(),
        komboDiscount: z.number().optional(),
        shareableUrl: z.string().optional(),
        clientName: z.string().optional(),
        vendorName: z.string().optional(),
        agencyName: z.string().optional(),
        cellPhone: z.string().optional(),
        landlinePhone: z.string().optional(),
        websiteUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const quoteId = await saveQuote({
          action: input.action,
          product: input.product,
          imobPlan: input.imobPlan,
          locPlan: input.locPlan,
          frequency: input.frequency,
          addons: input.addons,
          metrics: input.metrics,
          totals: input.totals,
          komboId: input.komboId,
          komboName: input.komboName,
          komboDiscount: input.komboDiscount,
          shareableUrl: input.shareableUrl,
          clientName: input.clientName,
          vendorName: input.vendorName,
          agencyName: input.agencyName,
          cellPhone: input.cellPhone,
          landlinePhone: input.landlinePhone,
          websiteUrl: input.websiteUrl,
        });
        return { success: true, quoteId };
      }),
    
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(100),
      }).optional())
      .query(async ({ input }) => {
        const quotes = await getQuotes(input?.limit ?? 100);
        return quotes;
      }),
    
    stats: publicProcedure
      .query(async () => {
        return await getQuoteStats();
      }),
    
    delete: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        const success = await deleteQuote(input.id);
        return { success };
      }),
  }),

  proposals: router({
    create: protectedProcedure
      .input(z.object({
        salesPersonName: z.string(),
        clientName: z.string(),
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
    
    generatePDF: protectedProcedure
      .input(z.object({
        salesPersonName: z.string(),
        clientName: z.string(),
        productType: z.string(),
        komboName: z.string().optional(),
        komboDiscount: z.number().optional(),
        imobPlan: z.string().optional(),
        locPlan: z.string().optional(),
        imobUsers: z.number().optional(),
        contracts: z.number().optional(),
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
      .mutation(async ({ input }) => {
        const pdfBuffer = await generateProposalPDF(input);
        // Return PDF as base64 so it can be downloaded in the browser
        return {
          success: true,
          pdf: pdfBuffer.toString("base64"),
          filename: `Orcamento_Kenlo_${input.clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
