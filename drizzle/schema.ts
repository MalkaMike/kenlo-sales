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
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
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
  
  /** Kombo information */
  komboName: varchar("komboName", { length: 100 }), // "Kombo Elite", "Kombo Imob Pro", etc
  komboDiscount: int("komboDiscount"), // Desconto em porcentagem (ex: 20 para 20%)
  
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

/**
 * Quotes table - tracks when proposals are shared (link copied) or exported (PDF)
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Action that triggered the save */
  action: mysqlEnum("action", ["link_copied", "pdf_exported"]).notNull(),
  
  /** Product selection */
  product: varchar("product", { length: 20 }).notNull(), // "imob", "loc", "both"
  imobPlan: varchar("imobPlan", { length: 20 }), // "prime", "k", "k2"
  locPlan: varchar("locPlan", { length: 20 }), // "prime", "k", "k2"
  
  /** Payment frequency */
  frequency: varchar("frequency", { length: 20 }).notNull(), // "monthly", "semestral", "annual", "biennial"
  
  /** Add-ons as JSON string */
  addons: text("addons").notNull(), // JSON: {leads: true, inteligencia: false, ...}
  
  /** Business metrics as JSON string */
  metrics: text("metrics").notNull(), // JSON with all metrics
  
  /** Calculated totals as JSON string */
  totals: text("totals").notNull(), // JSON: {monthly, annual, implantation, postPaid, kenloEffect}
  
  /** Kombo information */
  komboId: varchar("komboId", { length: 50 }), // "elite", "imob_start", etc
  komboName: varchar("komboName", { length: 100 }),
  komboDiscount: int("komboDiscount"), // percentage
  
  /** Shareable URL for link_copied actions */
  shareableUrl: text("shareableUrl"),
  
  /** Client and vendor information */
  clientName: varchar("clientName", { length: 255 }),
  vendorName: varchar("vendorName", { length: 255 }),
  /** User ID for ownership tracking (references users.id) */
  userId: int("userId"),
  agencyName: varchar("agencyName", { length: 255 }),
  cellPhone: varchar("cellPhone", { length: 50 }),
  landlinePhone: varchar("landlinePhone", { length: 50 }),
  websiteUrl: text("websiteUrl"),
  
  /** Business Nature Information */
  businessType: varchar("businessType", { length: 50 }), // "broker", "rental_admin", "both"
  email: varchar("email", { length: 320 }),
  hasCRM: int("hasCRM").default(0), // 0 = false, 1 = true
  crmSystem: varchar("crmSystem", { length: 255 }),
  crmOther: varchar("crmOther", { length: 255 }),
  hasERP: int("hasERP").default(0), // 0 = false, 1 = true
  erpSystem: varchar("erpSystem", { length: 255 }),
  erpOther: varchar("erpOther", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Soft delete timestamp - null means active, set means deleted */
  deletedAt: timestamp("deletedAt"),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;
