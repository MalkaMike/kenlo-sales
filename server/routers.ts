import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createProposal } from "./proposals";
import { generateProposalPDF } from "./pdfGenerator";
import { saveQuote, getQuotes, getQuoteStats, softDeleteQuote, softDeleteQuotesBatch, getPerformanceMetrics, getQuotesByUser } from "./quotes";
import { getSalespersonByEmail, getSalespersonById, getAllSalespeople, updateUserProfile, getUserById } from "./db";
import { storagePut } from "./storage";
import { z } from "zod";
import * as jose from "jose";

// Fixed password for all salespeople
const SALESPERSON_PASSWORD = "KenloLobos2026!";
const SALESPERSON_COOKIE_NAME = "kenlo_salesperson_session";

// Master account credentials
const MASTER_EMAIL = "master@kenlo.com.br";
const MASTER_PASSWORD = "Oxygen1011!";

// JWT secret for salesperson sessions
const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || "kenlo-sales-secret-key");

// Calculate expiration time (end of current day)
function getEndOfDay(): Date {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

// Create JWT token for salesperson (with optional permanent session for master)
async function createSalespersonToken(salespersonId: number, isPermanent: boolean = false): Promise<string> {
  const jwtBuilder = new jose.SignJWT({ salespersonId, isMaster: isPermanent })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt();
  
  if (isPermanent) {
    // Master account: 1 year expiration
    jwtBuilder.setExpirationTime('1y');
  } else {
    // Regular salespeople: end of current day
    const endOfDay = getEndOfDay();
    jwtBuilder.setExpirationTime(endOfDay);
  }
  
  return jwtBuilder.sign(getJwtSecret());
}

// Verify JWT token and return payload
async function verifySalespersonToken(token: string): Promise<{ salespersonId: number; isMaster: boolean } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getJwtSecret());
    return {
      salespersonId: payload.salespersonId as number,
      isMaster: payload.isMaster as boolean || false,
    };
  } catch {
    return null;
  }
}

// Helper to get salesperson from request context
async function getSalespersonFromContext(ctx: any): Promise<{ id: number; isMaster: boolean } | null> {
  let token = ctx.req.cookies?.[SALESPERSON_COOKIE_NAME];
  const authHeader = ctx.req.headers.authorization;
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }
  if (!token) return null;
  
  const payload = await verifySalespersonToken(token);
  if (!payload) return null;
  
  return { id: payload.salespersonId, isMaster: payload.isMaster };
}

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

  // Salesperson authentication (separate from Manus OAuth)
  salesperson: router({
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if master account
        const isMaster = input.email.toLowerCase() === MASTER_EMAIL.toLowerCase();
        
        // Verify password based on account type
        if (isMaster) {
          if (input.password !== MASTER_PASSWORD) {
            return { success: false, error: "Senha incorreta" };
          }
          // Master account - create virtual salesperson data
          const token = await createSalespersonToken(-1, true); // -1 for master
          return {
            success: true,
            token,
            isMaster: true,
            salesperson: {
              id: -1,
              name: "Master Admin",
              email: MASTER_EMAIL,
              phone: "",
            },
          };
        }
        
        // Regular salesperson login
        if (input.password !== SALESPERSON_PASSWORD) {
          return { success: false, error: "Senha incorreta" };
        }

        // Find salesperson by email
        const salesperson = await getSalespersonByEmail(input.email);
        if (!salesperson) {
          return { success: false, error: "E-mail não encontrado" };
        }

        if (!salesperson.isActive) {
          return { success: false, error: "Usuário inativo" };
        }

        // Create JWT token (expires at end of day)
        const token = await createSalespersonToken(salesperson.id, false);
        const endOfDay = getEndOfDay();

        // Set cookie using same options as auth cookies
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(SALESPERSON_COOKIE_NAME, token, {
          ...cookieOptions,
          expires: endOfDay,
        });

        return {
          success: true,
          token, // Return token for client-side storage
          salesperson: {
            id: salesperson.id,
            name: salesperson.name,
            email: salesperson.email,
            phone: salesperson.phone,
          },
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(SALESPERSON_COOKIE_NAME, {
        ...cookieOptions,
        maxAge: -1,
      });
      return { success: true };
    }),

    me: publicProcedure.query(async ({ ctx }) => {
      // Try to get token from cookie first, then from Authorization header
      let token = ctx.req.cookies?.[SALESPERSON_COOKIE_NAME];
      
      // Also check Authorization header (for localStorage-based auth)
      const authHeader = ctx.req.headers.authorization;
      if (!token && authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
      
      if (!token) {
        return null;
      }

      const payload = await verifySalespersonToken(token);
      if (payload === null) {
        return null;
      }

      // Check if master account (id = -1)
      if (payload.salespersonId === -1) {
        return {
          id: -1,
          name: "Master Admin",
          email: MASTER_EMAIL,
          phone: "",
          isMaster: true,
        };
      }

      const salesperson = await getSalespersonById(payload.salespersonId);
      if (!salesperson || !salesperson.isActive) {
        return null;
      }

      return {
        id: salesperson.id,
        name: salesperson.name,
        email: salesperson.email,
        phone: salesperson.phone,
        isMaster: false,
      };
    }),

    list: publicProcedure.query(async () => {
      const salespeople = await getAllSalespeople();
      return salespeople.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
      }));
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
        salespersonId: z.number().optional(),
        agencyName: z.string().optional(),
        cellPhone: z.string().optional(),
        landlinePhone: z.string().optional(),
        websiteUrl: z.string().optional(),
        // Business Nature fields
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
          // Business Nature fields
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
    
    // Soft delete with ownership check
    delete: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get current salesperson from context
        const currentUser = await getSalespersonFromContext(ctx);
        if (!currentUser) {
          return { success: false, error: "Não autorizado" };
        }
        
        // Soft delete with ownership check
        const result = await softDeleteQuote(input.id, currentUser.id, currentUser.isMaster);
        return result;
      }),

    // Batch delete with ownership check
    deleteBatch: publicProcedure
      .input(z.object({
        ids: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get current salesperson from context
        const currentUser = await getSalespersonFromContext(ctx);
        if (!currentUser) {
          return { success: false, deletedCount: 0, errors: ["Não autorizado"] };
        }
        
        // Batch soft delete with ownership check
        const result = await softDeleteQuotesBatch(input.ids, currentUser.id, currentUser.isMaster);
        return result;
      }),

    // Performance metrics endpoint
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
  }),

  proposals: router({
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
        // Pre-payment fields
        prepayAdditionalUsers: z.boolean().optional(),
        prepayAdditionalContracts: z.boolean().optional(),
        prepaymentUsersAmount: z.number().optional(),
        prepaymentContractsAmount: z.number().optional(),
        prepaymentMonths: z.number().optional(),
        // Premium services
        hasPremiumServices: z.boolean().optional(),
        premiumServicesPrice: z.number().optional(),
        // Installment options
        installments: z.number().optional(),
        // Proposal validity
        validityDays: z.number().optional(),
        // Business nature
        businessType: z.string().optional(),
        monthlyLicenseBase: z.number().optional(),
        // Individual line item prices for Investimento table
        imobPrice: z.number().optional(),
        locPrice: z.number().optional(),
        addonPrices: z.string().optional(), // JSON: {leads: 557, inteligencia: 337, ...}
        vipIncluded: z.boolean().optional(),
        csIncluded: z.boolean().optional(),
        vipPrice: z.number().optional(),
        csPrice: z.number().optional(),
        // Pós-pago breakdown details
        postPaidBreakdown: z.string().optional(), // JSON with detailed breakdown
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user is authorized via salesperson login OR OAuth with authorized domain
        const salesperson = await getSalespersonFromContext(ctx);
        const oauthUser = ctx.user; // OAuth user from Manus auth
        
        // Helper function to check if email is from authorized domain
        const isAuthorizedEmail = (email: string | null | undefined): boolean => {
          if (!email) return false;
          const authorizedDomains = ['@kenlo.com.br', '@i-value.com.br', '@laik.com.br'];
          return authorizedDomains.some(domain => email.toLowerCase().endsWith(domain));
        };
        
        // Allow PDF generation for:
        // 1. Logged-in salespeople (Master or registered Vendors)
        // 2. OAuth users with authorized email domains (@kenlo.com.br, @i-value.com.br, @laik.com.br)
        const canExport = salesperson || isAuthorizedEmail(oauthUser?.email);
        
        if (!canExport) {
          throw new Error("Acesso negado: Apenas usuários Kenlo podem gerar orçamentos. Faça login com sua conta Google corporativa.");
        }
        const pdfBuffer = await generateProposalPDF(input);
        // Return PDF as base64 so it can be downloaded in the browser
        return {
          success: true,
          pdf: pdfBuffer.toString("base64"),
          filename: `Cotacao_Kenlo_${input.clientName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
        };
      }),
  }),

  // Profile management
  profile: router({
    // Get current user's profile
    me: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) {
        throw new Error("User not authenticated");
      }
      const user = await getUserById(ctx.user.id);
      return user;
    }),

    // Update profile
    update: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        bio: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) {
          throw new Error("User not authenticated");
        }
        const updatedUser = await updateUserProfile(ctx.user.id, input);
        return updatedUser;
      }),

    // Upload avatar
    uploadAvatar: protectedProcedure
      .input(z.object({
        fileData: z.string(), // base64 encoded image
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user?.id) {
          throw new Error("User not authenticated");
        }

        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `avatars/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Update user profile with avatar URL
        const updatedUser = await updateUserProfile(ctx.user.id, { avatarUrl: url });
        return { avatarUrl: url, user: updatedUser };
      }),

    // Get user's proposal history
    getProposalHistory: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Get salesperson context if exists
        const salesperson = await getSalespersonFromContext(ctx);
        
        // Get quotes by either salesperson ID or OAuth user name
        const quotes = await getQuotesByUser({
          salespersonId: salesperson?.id,
          userName: ctx.user?.name || undefined,
          limit: input.limit || 100,
        });

        return quotes;
      }),
  }),
});

export type AppRouter = typeof appRouter;
