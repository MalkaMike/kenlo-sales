import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Proposals table - stores all generated proposals with configuration details
 */
export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  /** ID do usuário (vendedor) que criou a proposta */
  userId: int("userId").notNull(),
  /** Nome do vendedor */
  salesPersonName: varchar("salesPersonName", { length: 255 }).notNull(),
  /** Nome do cliente */
  clientName: varchar("clientName", { length: 255 }).notNull(),
  
  /** Configuração de produtos selecionados */
  productType: varchar("productType", { length: 50 }).notNull(), // "imob", "loc", "both"
  imobPlan: varchar("imobPlan", { length: 20 }), // "prime", "k", "k2"
  locPlan: varchar("locPlan", { length: 20 }), // "prime", "k", "k2"
  
  /** Informações do negócio - IMOB */
  imobUsers: int("imobUsers"),
  closings: int("closings"),
  leads: int("leads"),
  externalAI: int("externalAI").default(0), // 0 = false, 1 = true
  whatsapp: int("whatsapp").default(0),
  imobVipSupport: int("imobVipSupport").default(0),
  imobDedicatedCS: int("imobDedicatedCS").default(0),
  
  /** Informações do negócio - LOC */
  contracts: int("contracts"),
  newContracts: int("newContracts"),
  locVipSupport: int("locVipSupport").default(0),
  locDedicatedCS: int("locDedicatedCS").default(0),
  
  /** Kenlo Pay */
  chargesBoleto: int("chargesBoleto").default(0),
  boletoAmount: int("boletoAmount"),
  chargesSplit: int("chargesSplit").default(0),
  splitAmount: int("splitAmount"),
  
  /** Add-ons selecionados (JSON array de strings) */
  selectedAddons: text("selectedAddons"), // JSON: ["leads", "inteligencia", etc]
  
  /** Plano de pagamento */
  paymentPlan: varchar("paymentPlan", { length: 20 }).notNull(), // "monthly", "semestral", "anual", "bienal"
  
  /** Preços calculados */
  totalMonthly: int("totalMonthly").notNull(), // em centavos
  totalAnnual: int("totalAnnual").notNull(), // em centavos
  implantationFee: int("implantationFee").notNull(), // em centavos
  firstYearTotal: int("firstYearTotal").notNull(), // em centavos
  
  /** Custos pós-pago */
  postPaidTotal: int("postPaidTotal"), // em centavos
  
  /** The Kenlo Effect */
  revenueFromBoletos: int("revenueFromBoletos"), // em centavos
  revenueFromInsurance: int("revenueFromInsurance"), // em centavos
  netGain: int("netGain"), // em centavos
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;