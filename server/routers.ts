import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createProposal } from "./proposals";
import { generateProposalPDF } from "./pdfGenerator";
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
          filename: `proposta_${input.clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
