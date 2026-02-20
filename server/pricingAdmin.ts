import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as fs from "fs/promises";
import * as path from "path";

// DETERMINISTIC PRICING CONFIG SCHEMA - VERSION 2.0.0
// Follows 7-block structure (A-G) with zero interpretation

// BLOCO A — Payment Cycles
const PaymentCycleSchema = z.object({
  type: z.enum(["referencia", "desconto", "acrescimo"]),
  formula: z.string(),
  multiplier: z.number(),
  applyOrder: z.number(),
  displayLabel: z.string(),
});

// BLOCO B — Base Plans
const BasePlanSchema = z.object({
  annualPrice: z.number(),
  includedUnits: z.object({
    type: z.string(),
    quantity: z.number(),
  }),
  internalNote: z.string(),
});

// BLOCO C — Add-ons
const AddonSchema = z.object({
  availability: z.array(z.string()),
  shareable: z.boolean(),
  annualPrice: z.number(),
  implementation: z.number(),
  includedUnits: z.object({
    type: z.string(),
    quantity: z.number(),
  }).nullable(),
  _note: z.string().optional(),
});

// BLOCO D — Premium Services
const RecurringServiceSchema = z.object({
  monthlyPrice: z.number(),
  defaultByPlan: z.object({
    prime: z.boolean(),
    k: z.boolean(),
    k2: z.boolean(),
  }),
  inheritanceRule: z.string(),
  _inheritanceNote: z.string().optional(),
});

const NonRecurringServiceSchema = z.object({
  unitPrice: z.number(),
  includedQuantityByPlan: z.object({
    prime: z.number(),
    k: z.number(),
    k2: z.number(),
  }),
  duplicationRule: z.string(),
  _duplicationNote: z.string().optional(),
});

// BLOCO E — Kombos
const KomboSchema = z.object({
  name: z.string(),
  productsIncluded: z.array(z.string()),
  addonsIncluded: z.array(z.string()),
  discount: z.number(),
  discountOrder: z.number(),
  freeImplementations: z.number(),
  zeroedImplementationsList: z.array(z.string()),
  premiumServicesIncluded: z.array(z.string()),
});

// BLOCO F — Variable Costs
const TierSchema = z.object({
  from: z.number(),
  to: z.number(),
  price: z.number().optional(),
  rate: z.number().optional(),
});

const VariableCostSchema = z.object({
  product: z.string(),
  unit: z.string(),
  readOrder: z.number(),
  tiers: z.record(z.string(), z.array(TierSchema)),
  _note: z.string().optional(),
});

// BLOCO G — Feature Matrix
const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.enum(["core", "avancado", "addons", "servicos_premium"]).optional(),
  included: z.boolean(),
  linkedToAddon: z.string().nullable(),
  linkedToPremiumService: z.string().nullable(),
});

// Full pricing config schema
const PricingValuesSchema = z.object({
  _comment: z.string().optional(),
  _lastModified: z.string().optional(),
  _version: z.string().optional(),
  
  // BLOCO A — Ciclo de Pagamento (Fundação)
  paymentCycles: z.object({
    _description: z.string().optional(),
    _rule: z.string().optional(),
    monthly: PaymentCycleSchema,
    semiannual: PaymentCycleSchema,
    annual: PaymentCycleSchema,
    biennial: PaymentCycleSchema,
  }),
  
  // BLOCO B — Planos Base — Preço Anual de Fundação
  basePlans: z.object({
    _description: z.string().optional(),
    _note: z.string().optional(),
    imob: z.object({
      prime: BasePlanSchema,
      k: BasePlanSchema,
      k2: BasePlanSchema,
    }),
    locacao: z.object({
      prime: BasePlanSchema,
      k: BasePlanSchema,
      k2: BasePlanSchema,
    }),
  }),
  
  // BLOCO C — Add-ons — Preços Base e Escopo
  addons: z.object({
    _description: z.string().optional(),
    inteligencia: AddonSchema,
    leads: AddonSchema,
    assinaturas: AddonSchema,
    pay: AddonSchema,
    seguros: AddonSchema,
    cash: AddonSchema,
  }),
  
  // BLOCO D — Serviços Premium (Recorrentes e Não Recorrentes)
  premiumServices: z.object({
    _description: z.string().optional(),
    recurring: z.object({
      vipSupport: RecurringServiceSchema,
      csDedicado: RecurringServiceSchema,
    }),
    nonRecurring: z.object({
      treinamentoOnline: NonRecurringServiceSchema,
      treinamentoPresencial: NonRecurringServiceSchema,
    }),
  }),
  
  // BLOCO E — Kombos — Descontos Promocionais Cumulativos
  kombos: z.object({
    _description: z.string().optional(),
    _globalRule: z.string().optional(),
    imob_start: KomboSchema,
    imob_pro: KomboSchema,
    locacao_pro: KomboSchema,
    core_gestao: KomboSchema,
    elite: KomboSchema,
  }),
  
  // BLOCO F — Custos Variáveis Pós-Pago (por Faixa de Uso)
  variableCosts: z.object({
    _description: z.string().optional(),
    additionalUsers: VariableCostSchema,
    additionalContracts: VariableCostSchema,
    additionalLeads: VariableCostSchema,
    additionalSignatures: VariableCostSchema,
    boletos: VariableCostSchema,
    splits: VariableCostSchema,
    segurosCommission: VariableCostSchema,
  }),
  
  // BLOCO G — Matriz de Funcionalidades — Fonte Única de Verdade
  featureMatrix: z.object({
    _description: z.string().optional(),
    _warning: z.string().optional(),
    imob: z.object({
      prime: z.array(FeatureSchema),
      k: z.array(FeatureSchema),
      k2: z.array(FeatureSchema),
    }),
    locacao: z.object({
      prime: z.array(FeatureSchema),
      k: z.array(FeatureSchema),
      k2: z.array(FeatureSchema),
    }),
  }),
  
  // Legacy fields for backward compatibility
  _legacyFields: z.object({
    _note: z.string().optional(),
    implantacaoBase: z.number().optional(),
  }).optional(),
});

export const pricingAdminRouter = router({
  // Get current pricing config
  getConfig: protectedProcedure.query(async () => {
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

  // Save pricing config (admin only)
  saveConfig: adminProcedure
    .input(PricingValuesSchema)
    .mutation(async ({ input }) => {
      try {
        const configPath = path.join(process.cwd(), "shared", "pricing-values.json");
        
        // Write to JSON file with pretty formatting
        const updatedConfig = {
          ...input,
          _lastModified: new Date().toISOString(),
          _version: `${Date.now()}`, // Timestamp-based version for cache busting
        };
        
        await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2), "utf-8");
        
        console.log("[PricingAdmin] Pricing config saved with version:", updatedConfig._version);
        
        return { 
          success: true, 
          message: "Configuração salva com sucesso! Recarregue a página da calculadora para ver as alterações.",
          version: updatedConfig._version,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao salvar configuração",
        });
      }
    }),
});
