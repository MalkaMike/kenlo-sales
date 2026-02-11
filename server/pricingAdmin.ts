import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as fs from "fs/promises";
import * as path from "path";

// Helper to get salesperson from context
async function getSalespersonFromContext(ctx: any): Promise<{ id: number; isMaster: boolean } | null> {
  const SALESPERSON_COOKIE_NAME = "kenlo_salesperson_session";
  let token = ctx.req.cookies?.[SALESPERSON_COOKIE_NAME];
  const authHeader = ctx.req.headers.authorization;
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }
  if (!token) return null;
  
  // Verify token (simplified - should use actual JWT verification from routers.ts)
  try {
    const jose = await import("jose");
    const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || "kenlo-sales-secret-key");
    const { payload } = await jose.jwtVerify(token, getJwtSecret());
    return {
      id: payload.salespersonId as number,
      isMaster: (payload.isMaster as boolean) || false,
    };
  } catch {
    return null;
  }
}

// Full pricing config schema
const PricingValuesSchema = z.object({
  frequencyMultipliers: z.object({
    monthly: z.number(),
    semiannual: z.number(),
    biennial: z.number(),
  }),
  imobPlans: z.object({
    prime: z.object({ annualPrice: z.number(), includedUsers: z.number() }),
    k: z.object({ annualPrice: z.number(), includedUsers: z.number() }),
    k2: z.object({ annualPrice: z.number(), includedUsers: z.number() }),
  }),
  locPlans: z.object({
    prime: z.object({ annualPrice: z.number(), includedContracts: z.number() }),
    k: z.object({ annualPrice: z.number(), includedContracts: z.number() }),
    k2: z.object({ annualPrice: z.number(), includedContracts: z.number() }),
  }),
  addons: z.object({
    inteligencia: z.object({ annualPrice: z.number(), implementation: z.number() }),
    leads: z.object({ annualPrice: z.number(), implementation: z.number(), includedLeads: z.number() }),
    assinaturas: z.object({ annualPrice: z.number(), implementation: z.number(), includedSignatures: z.number() }),
  }),
  premiumServices: z.object({
    vipSupport: z.number(),
    csDedicado: z.number(),
    treinamentoOnline: z.number(),
    treinamentoPresencial: z.number(),
  }),
  kombos: z.object({
    imob_start: z.object({ name: z.string(), discount: z.number(), freeImplementations: z.number(), includesPremium: z.boolean() }),
    imob_pro: z.object({ name: z.string(), discount: z.number(), freeImplementations: z.number(), includesPremium: z.boolean() }),
    locacao_pro: z.object({ name: z.string(), discount: z.number(), freeImplementations: z.number(), includesPremium: z.boolean() }),
    core_gestao: z.object({ name: z.string(), discount: z.number(), freeImplementations: z.number(), includesPremium: z.boolean() }),
    elite: z.object({ name: z.string(), discount: z.number(), freeImplementations: z.number(), includesPremium: z.boolean() }),
  }),
  additionalUsersTiers: z.object({
    prime: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
    k: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
    k2: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
  }),
  additionalContractsTiers: z.object({
    prime: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
    k: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
    k2: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
  }),
  additionalLeadsTiers: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
  additionalSignaturesTiers: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
  kenloPay: z.object({
    boletosIncluded: z.object({
      prime: z.number(),
      k: z.number(),
      k2: z.number(),
    }),
    splitsIncluded: z.object({
      prime: z.number(),
      k: z.number(),
      k2: z.number(),
    }),
    boletosTiers: z.object({
      prime: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
      k: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
      k2: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
    }),
    splitsTiers: z.object({
      prime: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
      k: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
      k2: z.array(z.object({ from: z.number(), to: z.number(), price: z.number() })),
    }),
  }),
  kenloSeguros: z.object({
    commissionRates: z.object({
      prime: z.number(),
      k: z.number(),
      k2: z.number(),
    }),
  }),
  implantacaoBase: z.number(),
});

export const pricingAdminRouter = router({
  // Get current pricing config
  getConfig: publicProcedure.query(async () => {
    try {
      const configPath = path.join(process.cwd(), "shared", "pricing-values.json");
      const content = await fs.readFile(configPath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to read pricing config",
      });
    }
  }),

  // Save pricing config (master user only)
  saveConfig: publicProcedure
    .input(PricingValuesSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user is master
      const salesperson = await getSalespersonFromContext(ctx);
      if (!salesperson?.isMaster) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas o usuário master pode editar a configuração de preços",
        });
      }

      try {
        const configPath = path.join(process.cwd(), "shared", "pricing-values.json");
        
        // Write to JSON file with pretty formatting
        await fs.writeFile(configPath, JSON.stringify(input, null, 2), "utf-8");
        
        return { success: true, message: "Configuração salva com sucesso!" };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao salvar configuração",
        });
      }
    }),
});
