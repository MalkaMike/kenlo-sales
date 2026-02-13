/**
 * Quotes router — save, list, stats, delete, performance.
 */

import { publicProcedure, router } from "../_core/trpc";
import { saveQuote, getQuotes, getQuoteStats, softDeleteQuote, softDeleteQuotesBatch, getPerformanceMetrics } from "../quotes";
import { getSalespersonFromContext } from "./salespersonAuth";
import { z } from "zod";

export const quotesRouter = router({
  save: publicProcedure
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
      salespersonId: z.number().optional(),
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
        salespersonId: input.salespersonId,
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
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await getSalespersonFromContext(ctx);
      if (!currentUser) {
        return { success: false, error: "Não autorizado" };
      }
      const result = await softDeleteQuote(input.id, currentUser.id, currentUser.isMaster);
      return result;
    }),

  deleteBatch: publicProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const currentUser = await getSalespersonFromContext(ctx);
      if (!currentUser) {
        return { success: false, deletedCount: 0, errors: ["Não autorizado"] };
      }
      const result = await softDeleteQuotesBatch(input.ids, currentUser.id, currentUser.isMaster);
      return result;
    }),

  performance: publicProcedure
    .input(z.object({
      salespersonId: z.number().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const filters = input ? {
        salespersonId: input.salespersonId,
        dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
        dateTo: input.dateTo ? new Date(input.dateTo) : undefined,
      } : undefined;
      return await getPerformanceMetrics(filters);
    }),
});
