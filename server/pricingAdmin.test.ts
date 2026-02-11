import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";

describe("Pricing Admin - Deterministic Structure v2.0.0", () => {
  const testConfigPath = path.join(process.cwd(), "shared", "pricing-values.json");

  describe("JSON Config File", () => {
    it("should exist and be readable", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      expect(content).toBeTruthy();
      const config = JSON.parse(content);
      expect(config).toBeTruthy();
    });

    it("should have all required top-level blocks (A-G)", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      // BLOCO A — Payment Cycles
      expect(config).toHaveProperty("paymentCycles");
      
      // BLOCO B — Base Plans
      expect(config).toHaveProperty("basePlans");
      
      // BLOCO C — Add-ons
      expect(config).toHaveProperty("addons");
      
      // BLOCO D — Premium Services
      expect(config).toHaveProperty("premiumServices");
      
      // BLOCO E — Kombos
      expect(config).toHaveProperty("kombos");
      
      // BLOCO F — Variable Costs
      expect(config).toHaveProperty("variableCosts");
      
      // BLOCO G — Feature Matrix
      expect(config).toHaveProperty("featureMatrix");
    });

    it("should have metadata fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config).toHaveProperty("_version");
      expect(config._version).toBe("2.0.0");
    });
  });

  describe("BLOCO A — Payment Cycles", () => {
    it("should have all payment cycles with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["monthly", "semiannual", "annual", "biennial"].forEach((cycle) => {
        expect(config.paymentCycles[cycle]).toHaveProperty("type");
        expect(config.paymentCycles[cycle]).toHaveProperty("formula");
        expect(config.paymentCycles[cycle]).toHaveProperty("multiplier");
        expect(config.paymentCycles[cycle]).toHaveProperty("applyOrder");
        expect(config.paymentCycles[cycle]).toHaveProperty("displayLabel");
      });
    });

    it("should have correct multipliers", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.paymentCycles.monthly.multiplier).toBe(1.25);
      expect(config.paymentCycles.semiannual.multiplier).toBe(1.111);
      expect(config.paymentCycles.annual.multiplier).toBe(1.0);
      expect(config.paymentCycles.biennial.multiplier).toBe(0.75);
    });

    it("should have annual as reference type", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.paymentCycles.annual.type).toBe("referencia");
    });
  });

  describe("BLOCO B — Base Plans", () => {
    it("should have all IMOB plans with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["prime", "k", "k2"].forEach((plan) => {
        expect(config.basePlans.imob[plan]).toHaveProperty("annualPrice");
        expect(config.basePlans.imob[plan]).toHaveProperty("includedUnits");
        expect(config.basePlans.imob[plan]).toHaveProperty("internalNote");
        expect(typeof config.basePlans.imob[plan].annualPrice).toBe("number");
        expect(config.basePlans.imob[plan].includedUnits.type).toBe("users");
      });
    });

    it("should have all LOC plans with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["prime", "k", "k2"].forEach((plan) => {
        expect(config.basePlans.locacao[plan]).toHaveProperty("annualPrice");
        expect(config.basePlans.locacao[plan]).toHaveProperty("includedUnits");
        expect(config.basePlans.locacao[plan]).toHaveProperty("internalNote");
        expect(typeof config.basePlans.locacao[plan].annualPrice).toBe("number");
        expect(config.basePlans.locacao[plan].includedUnits.type).toBe("contracts");
      });
    });
  });

  describe("BLOCO C — Add-ons", () => {
    it("should have all add-ons with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["inteligencia", "leads", "assinaturas", "pay", "seguros", "cash"].forEach((addon) => {
        expect(config.addons[addon]).toHaveProperty("availability");
        expect(config.addons[addon]).toHaveProperty("shareable");
        expect(config.addons[addon]).toHaveProperty("annualPrice");
        expect(config.addons[addon]).toHaveProperty("implementation");
        expect(Array.isArray(config.addons[addon].availability)).toBe(true);
        expect(typeof config.addons[addon].shareable).toBe("boolean");
      });
    });

    it("should have Pay, Cash and Seguros as free add-ons", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.addons.pay.annualPrice).toBe(0);
      expect(config.addons.pay.implementation).toBe(0);
      expect(config.addons.cash.annualPrice).toBe(0);
      expect(config.addons.cash.implementation).toBe(0);
      expect(config.addons.seguros.annualPrice).toBe(0);
      expect(config.addons.seguros.implementation).toBe(0);
    });

    it("should have correct availability constraints", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      // Leads only for IMOB
      expect(config.addons.leads.availability).toContain("imob");
      expect(config.addons.leads.availability).not.toContain("locacao");
      
      // Pay, Cash, Seguros only for Locação
      expect(config.addons.pay.availability).toContain("locacao");
      expect(config.addons.cash.availability).toContain("locacao");
      expect(config.addons.seguros.availability).toContain("locacao");
    });
  });

  describe("BLOCO D — Premium Services", () => {
    it("should have recurring services with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["vipSupport", "csDedicado"].forEach((service) => {
        expect(config.premiumServices.recurring[service]).toHaveProperty("monthlyPrice");
        expect(config.premiumServices.recurring[service]).toHaveProperty("defaultByPlan");
        expect(config.premiumServices.recurring[service]).toHaveProperty("inheritanceRule");
        expect(typeof config.premiumServices.recurring[service].monthlyPrice).toBe("number");
      });
    });

    it("should have non-recurring services with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["treinamentoOnline", "treinamentoPresencial"].forEach((service) => {
        expect(config.premiumServices.nonRecurring[service]).toHaveProperty("unitPrice");
        expect(config.premiumServices.nonRecurring[service]).toHaveProperty("includedQuantityByPlan");
        expect(config.premiumServices.nonRecurring[service]).toHaveProperty("duplicationRule");
        expect(typeof config.premiumServices.nonRecurring[service].unitPrice).toBe("number");
      });
    });

    it("should have correct CS Dedicado price", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.premiumServices.recurring.csDedicado.monthlyPrice).toBe(297);
    });

    it("should have CS Dedicado enabled by default for K2", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.premiumServices.recurring.csDedicado.defaultByPlan.k2).toBe(true);
      expect(config.premiumServices.recurring.csDedicado.defaultByPlan.prime).toBe(false);
      expect(config.premiumServices.recurring.csDedicado.defaultByPlan.k).toBe(false);
    });
  });

  describe("BLOCO E — Kombos", () => {
    it("should have all kombos with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["imob_start", "imob_pro", "locacao_pro", "core_gestao", "elite"].forEach((kombo) => {
        expect(config.kombos[kombo]).toHaveProperty("name");
        expect(config.kombos[kombo]).toHaveProperty("productsIncluded");
        expect(config.kombos[kombo]).toHaveProperty("addonsIncluded");
        expect(config.kombos[kombo]).toHaveProperty("discount");
        expect(config.kombos[kombo]).toHaveProperty("discountOrder");
        expect(config.kombos[kombo]).toHaveProperty("freeImplementations");
        expect(config.kombos[kombo]).toHaveProperty("zeroedImplementationsList");
        expect(config.kombos[kombo]).toHaveProperty("premiumServicesIncluded");
        expect(typeof config.kombos[kombo].name).toBe("string");
        expect(typeof config.kombos[kombo].discount).toBe("number");
        expect(Array.isArray(config.kombos[kombo].productsIncluded)).toBe(true);
        expect(Array.isArray(config.kombos[kombo].addonsIncluded)).toBe(true);
      });
    });

    it("should have discount order always 2 (after payment cycle)", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["imob_start", "imob_pro", "locacao_pro", "core_gestao", "elite"].forEach((kombo) => {
        expect(config.kombos[kombo].discountOrder).toBe(2);
      });
    });
  });

  describe("BLOCO F — Variable Costs", () => {
    it("should have all variable costs with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["additionalUsers", "additionalContracts", "additionalLeads", "additionalSignatures", "boletos", "splits", "segurosCommission"].forEach((cost) => {
        expect(config.variableCosts[cost]).toHaveProperty("product");
        expect(config.variableCosts[cost]).toHaveProperty("unit");
        expect(config.variableCosts[cost]).toHaveProperty("readOrder");
        expect(config.variableCosts[cost]).toHaveProperty("tiers");
        expect(typeof config.variableCosts[cost].product).toBe("string");
        expect(typeof config.variableCosts[cost].unit).toBe("string");
      });
    });

    it("should have valid tiered pricing arrays", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      // Check tiered pricing is nested by plan
      expect(config.variableCosts.additionalUsers.tiers).toHaveProperty("prime");
      expect(config.variableCosts.additionalUsers.tiers).toHaveProperty("k");
      expect(config.variableCosts.additionalUsers.tiers).toHaveProperty("k2");
      expect(Array.isArray(config.variableCosts.additionalUsers.tiers.prime)).toBe(true);
      
      // Check each tier has required fields
      config.variableCosts.additionalUsers.tiers.prime.forEach((tier: any) => {
        expect(tier).toHaveProperty("from");
        expect(tier).toHaveProperty("to");
        expect(tier).toHaveProperty("price");
      });
    });

    it("should have Kenlo Pay pricing in variable costs", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      // Check tiered pricing per plan (no included amounts - all post-paid)
      expect(config.variableCosts.boletos.tiers).toHaveProperty("prime");
      expect(Array.isArray(config.variableCosts.boletos.tiers.prime)).toBe(true);
      expect(config.variableCosts.splits.tiers).toHaveProperty("prime");
      expect(Array.isArray(config.variableCosts.splits.tiers.prime)).toBe(true);
    });

    it("should have Kenlo Seguros commission rates", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      // Check commission rates per plan
      expect(config.variableCosts.segurosCommission.tiers).toHaveProperty("prime");
      expect(config.variableCosts.segurosCommission.tiers).toHaveProperty("k");
      expect(config.variableCosts.segurosCommission.tiers).toHaveProperty("k2");
      expect(typeof config.variableCosts.segurosCommission.tiers.prime[0].rate).toBe("number");
    });
  });

  describe("BLOCO G — Feature Matrix", () => {
    it("should have feature matrix for both products", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.featureMatrix).toHaveProperty("imob");
      expect(config.featureMatrix).toHaveProperty("locacao");
      
      ["prime", "k", "k2"].forEach((plan) => {
        expect(Array.isArray(config.featureMatrix.imob[plan])).toBe(true);
        expect(Array.isArray(config.featureMatrix.locacao[plan])).toBe(true);
      });
    });

    it("should have features with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      config.featureMatrix.imob.prime.forEach((feature: any) => {
        expect(feature).toHaveProperty("name");
        expect(feature).toHaveProperty("description");
        expect(feature).toHaveProperty("included");
        expect(feature).toHaveProperty("linkedToAddon");
        expect(feature).toHaveProperty("linkedToPremiumService");
        expect(typeof feature.included).toBe("boolean");
      });
    });
  });

  describe("Pricing Values Validation", () => {
    it("should have biennial discount of 25% (multiplier 0.75)", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.paymentCycles.biennial.multiplier).toBe(0.75);
    });

    it("should have CS Dedicado price of R$297", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.premiumServices.recurring.csDedicado.monthlyPrice).toBe(297);
    });

    it("should have all annual prices ending in 7", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      // Check IMOB plans
      Object.values(config.basePlans.imob).forEach((plan: any) => {
        expect(plan.annualPrice % 10).toBe(7);
      });
      
      // Check LOC plans
      Object.values(config.basePlans.locacao).forEach((plan: any) => {
        expect(plan.annualPrice % 10).toBe(7);
      });
      
      // Check add-ons (excluding free ones)
      expect(config.addons.inteligencia.annualPrice % 10).toBe(7);
      expect(config.addons.leads.annualPrice % 10).toBe(7);
      expect(config.addons.assinaturas.annualPrice % 10).toBe(7);
      
      // Check premium services
      expect(config.premiumServices.recurring.vipSupport.monthlyPrice % 10).toBe(7);
      expect(config.premiumServices.recurring.csDedicado.monthlyPrice % 10).toBe(7);
    });

    it("should have legacy implantacaoBase field", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config._legacyFields.implantacaoBase).toBe(1497);
    });
  });
});
