import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { quotes, Quote } from "../../drizzle/schema";
import { and, eq, gte, isNull, sql } from "drizzle-orm";

/**
 * Analytics router for conversion tracking and sales metrics
 */
export const analyticsRouter = router({
  /**
   * Get conversion dashboard data with metrics by date range
   */
  getConversionDashboard: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(["7d", "30d", "90d", "all"]),
      })
    )
    .query(async ({ input }) => {
      const { dateRange } = input;

      // Calculate date filter
      let dateFilter;
      if (dateRange !== "all") {
        const days = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        dateFilter = gte(quotes.createdAt, startDate);
      }

      // Build where clause
      const whereClause = dateFilter
        ? and(isNull(quotes.deletedAt), dateFilter)
        : isNull(quotes.deletedAt);

      // Get all quotes in date range
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const allQuotes = await db
        .select()
        .from(quotes)
        .where(whereClause);

      // Calculate overview metrics
      const totalQuotes = allQuotes.length;
      const wonQuotes = allQuotes.filter((q: Quote) => q.status === "won").length;
      const lostQuotes = allQuotes.filter((q: Quote) => q.status === "lost").length;
      const conversionRate = totalQuotes > 0 ? (wonQuotes / totalQuotes) * 100 : 0;

      // Calculate average ticket (annual value) from won quotes
      const wonQuotesWithTotals = allQuotes
        .filter((q: Quote) => q.status === "won")
        .map((q: Quote) => {
          try {
            const totals = JSON.parse(q.totals);
            return totals.annual || 0;
          } catch {
            return 0;
          }
        });

      const avgTicket =
        wonQuotesWithTotals.length > 0
          ? wonQuotesWithTotals.reduce((sum: number, val: number) => sum + val, 0) / wonQuotesWithTotals.length
          : 0;

      // Calculate metrics by salesperson
      const salespeople = allQuotes.reduce<Record<string, any>>((acc: any, quote: Quote) => {
        const vendor = quote.vendorName || "Não identificado";
        if (!acc[vendor]) {
          acc[vendor] = {
            vendorName: vendor,
            totalQuotes: 0,
            wonQuotes: 0,
            lostQuotes: 0,
            conversionRate: 0,
            avgTicket: 0,
            totalRevenue: 0,
          };
        }

        acc[vendor].totalQuotes++;
        if (quote.status === "won") {
          acc[vendor].wonQuotes++;
          try {
            const totals = JSON.parse(quote.totals);
            acc[vendor].totalRevenue += totals.annual || 0;
          } catch {
            // ignore parsing errors
          }
        } else if (quote.status === "lost") {
          acc[vendor].lostQuotes++;
        }

        return acc;
      }, {} as Record<string, any>);

      // Calculate conversion rate and avg ticket for each salesperson
      const salespeopleArray = Object.values(salespeople).map((person: any) => ({
        ...person,
        conversionRate:
          person.totalQuotes > 0 ? (person.wonQuotes / person.totalQuotes) * 100 : 0,
        avgTicket: person.wonQuotes > 0 ? person.totalRevenue / person.wonQuotes : 0,
      }));

      // Sort by conversion rate descending
      salespeopleArray.sort((a, b) => b.conversionRate - a.conversionRate);

      // Calculate top products
      const productCounts: Record<string, number> = {};
      allQuotes
        .filter((q: Quote) => q.status === "won")
        .forEach((quote: Quote) => {
          // Count IMOB plans
          if (quote.imobPlan) {
            const planName = `Kenlo Imob ${quote.imobPlan.toUpperCase()}`;
            productCounts[planName] = (productCounts[planName] || 0) + 1;
          }
          // Count LOC plans
          if (quote.locPlan) {
            const planName = `Kenlo Locação ${quote.locPlan.toUpperCase()}`;
            productCounts[planName] = (productCounts[planName] || 0) + 1;
          }
        });

      const topProducts = Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate top add-ons
      const addonCounts: Record<string, number> = {};
      const addonNameMap: Record<string, string> = {
        leads: "Kenlo Leads",
        inteligencia: "Kenlo Inteligência",
        assinatura: "Kenlo Assinatura",
        pay: "Kenlo Pay",
        seguros: "Kenlo Seguros",
        cash: "Kenlo Cash",
      };

      allQuotes
        .filter((q: Quote) => q.status === "won")
        .forEach((quote: Quote) => {
          try {
            const addons = JSON.parse(quote.addons);
            Object.entries(addons).forEach(([key, enabled]) => {
              if (enabled && addonNameMap[key]) {
                const addonName = addonNameMap[key];
                addonCounts[addonName] = (addonCounts[addonName] || 0) + 1;
              }
            });
          } catch {
            // ignore parsing errors
          }
        });

      const topAddons = Object.entries(addonCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        overview: {
          totalQuotes,
          wonQuotes,
          lostQuotes,
          conversionRate,
          avgTicket,
        },
        salespeople: salespeopleArray,
        topProducts,
        topAddons,
      };
    }),
});
