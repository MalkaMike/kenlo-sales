/**
 * Quotes router — save, list, stats, delete, performance.
 * All routes require authentication (protectedProcedure).
 */

import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { saveQuote, getQuotes, getQuoteStats, softDeleteQuote, softDeleteQuotesBatch, getPerformanceMetrics } from "../quotes";
import { upsertClientFromQuote } from "../clientRegistry";
import { z } from "zod";

export const quotesRouter = router({
  save: protectedProcedure
    .input(z.object({
      action: z.enum(["link_copied", "pdf_exported"]),
      product: z.string(),
      imobPlan: z.string().optional(),
      locPlan: z.string().optional(),
      frequency: z.string(),
      addons: z.string(),
      metrics: z.string(),
      totals: z.string(),
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
      businessType: z.string().optional(),
      email: z.string().optional(),
      hasCRM: z.number().optional(),
      crmSystem: z.string().optional(),
      crmOther: z.string().optional(),
      hasERP: z.number().optional(),
      erpSystem: z.string().optional(),
      erpOther: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Auto-populate userId from the authenticated OAuth session
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
        userId: ctx.user.id,
        agencyName: input.agencyName,
        cellPhone: input.cellPhone,
        landlinePhone: input.landlinePhone,
        websiteUrl: input.websiteUrl,
        businessType: input.businessType,
        email: input.email,
        hasCRM: input.hasCRM,
        crmSystem: input.crmSystem,
        crmOther: input.crmOther,
        hasERP: input.hasERP,
        erpSystem: input.erpSystem,
        erpOther: input.erpOther,
      });
      // Register client in the permanent registry (fire-and-forget, non-blocking)
      if (quoteId && input.clientName) {
        const plans: Record<string, string> = {};
        if (input.imobPlan) plans.imob = input.imobPlan;
        if (input.locPlan) plans.loc = input.locPlan;
        upsertClientFromQuote({
          clientName: input.clientName,
          email: input.email,
          agencyName: input.agencyName,
          cellPhone: input.cellPhone,
          landlinePhone: input.landlinePhone,
          websiteUrl: input.websiteUrl,
          businessType: input.businessType,
          quoteId,
          vendorName: input.vendorName,
          vendorUserId: ctx.user.id,
          product: input.product,
          plans: JSON.stringify(plans),
          komboName: input.komboName,
        }).catch((err) => console.error("[ClientRegistry] upsert failed:", err));
      }
      return { success: true, quoteId };
    }),
  
  list: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(100),
    }).optional())
    .query(async ({ input }) => {
      const quotes = await getQuotes(input?.limit ?? 100);
      return quotes;
    }),
  
  stats: protectedProcedure
    .query(async () => {
      return await getQuoteStats();
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Admin users can delete any quote; regular users can only delete their own
      const isAdmin = ctx.user.role === "admin";
      const result = await softDeleteQuote(input.id, ctx.user.id, isAdmin);
      return result;
    }),

  deleteBatch: protectedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.user.role === "admin";
      const result = await softDeleteQuotesBatch(input.ids, ctx.user.id, isAdmin);
      return result;
    }),

  performance: adminProcedure
    .input(z.object({
      userId: z.number().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const filters = input ? {
        userId: input.userId,
        dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
        dateTo: input.dateTo ? new Date(input.dateTo) : undefined,
      } : undefined;
      return await getPerformanceMetrics(filters);
    }),
});
