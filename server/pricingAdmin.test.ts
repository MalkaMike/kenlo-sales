import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";

describe("Pricing Admin", () => {
  const testConfigPath = path.join(process.cwd(), "shared", "pricing-values.json");

  describe("JSON Config File", () => {
    it("should exist and be readable", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      expect(content).toBeTruthy();
      const config = JSON.parse(content);
      expect(config).toBeTruthy();
    });

    it("should have all required top-level keys", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config).toHaveProperty("frequencyMultipliers");
      expect(config).toHaveProperty("imobPlans");
      expect(config).toHaveProperty("locPlans");
      expect(config).toHaveProperty("addons");
      expect(config).toHaveProperty("premiumServices");
      expect(config).toHaveProperty("kombos");
      expect(config).toHaveProperty("additionalUsersTiers");
      expect(config).toHaveProperty("additionalContractsTiers");
      expect(config).toHaveProperty("kenloPay");
      expect(config).toHaveProperty("kenloSeguros");
      expect(config).toHaveProperty("implantacaoBase");
    });

    it("should have correct frequency multipliers", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.frequencyMultipliers.monthly).toBe(1.25);
      expect(config.frequencyMultipliers.semiannual).toBe(1.1);
      expect(config.frequencyMultipliers.biennial).toBe(0.75);
    });

    it("should have all IMOB plans with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["prime", "k", "k2"].forEach((plan) => {
        expect(config.imobPlans[plan]).toHaveProperty("annualPrice");
        expect(config.imobPlans[plan]).toHaveProperty("includedUsers");
        expect(typeof config.imobPlans[plan].annualPrice).toBe("number");
        expect(typeof config.imobPlans[plan].includedUsers).toBe("number");
      });
    });

    it("should have all LOC plans with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["prime", "k", "k2"].forEach((plan) => {
        expect(config.locPlans[plan]).toHaveProperty("annualPrice");
        expect(config.locPlans[plan]).toHaveProperty("includedContracts");
        expect(typeof config.locPlans[plan].annualPrice).toBe("number");
        expect(typeof config.locPlans[plan].includedContracts).toBe("number");
      });
    });

    it("should have all add-ons with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["inteligencia", "leads", "assinaturas"].forEach((addon) => {
        expect(config.addons[addon]).toHaveProperty("annualPrice");
        expect(config.addons[addon]).toHaveProperty("implementation");
        expect(typeof config.addons[addon].annualPrice).toBe("number");
        expect(typeof config.addons[addon].implementation).toBe("number");
      });
    });

    it("should have premium services with correct prices", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.premiumServices.vipSupport).toBe(97);
      expect(config.premiumServices.csDedicado).toBe(297);
    });

    it("should have all kombos with required fields", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["imob_start", "imob_pro", "locacao_pro", "core_gestao", "elite"].forEach((kombo) => {
        expect(config.kombos[kombo]).toHaveProperty("name");
        expect(config.kombos[kombo]).toHaveProperty("discount");
        expect(config.kombos[kombo]).toHaveProperty("freeImplementations");
        expect(config.kombos[kombo]).toHaveProperty("includesPremium");
        expect(typeof config.kombos[kombo].name).toBe("string");
        expect(typeof config.kombos[kombo].discount).toBe("number");
        expect(typeof config.kombos[kombo].freeImplementations).toBe("number");
        expect(typeof config.kombos[kombo].includesPremium).toBe("boolean");
      });
    });

    it("should have all kombos include premium services", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      ["imob_start", "imob_pro", "locacao_pro", "core_gestao", "elite"].forEach((kombo) => {
        expect(config.kombos[kombo].includesPremium).toBe(true);
      });
    });

    it("should have valid tiered pricing arrays", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      // Check tiered pricing is nested by plan
      expect(config.additionalUsersTiers).toHaveProperty("prime");
      expect(config.additionalUsersTiers).toHaveProperty("k");
      expect(config.additionalUsersTiers).toHaveProperty("k2");
      expect(Array.isArray(config.additionalUsersTiers.prime)).toBe(true);
      
      expect(config.additionalContractsTiers).toHaveProperty("prime");
      expect(Array.isArray(config.additionalContractsTiers.prime)).toBe(true);
      
      expect(Array.isArray(config.additionalLeadsTiers)).toBe(true);
      expect(Array.isArray(config.additionalSignaturesTiers)).toBe(true);
      
      // Check each tier has required fields
      config.additionalUsersTiers.prime.forEach((tier: any) => {
        expect(tier).toHaveProperty("from");
        expect(tier).toHaveProperty("to");
        expect(tier).toHaveProperty("price");
      });
    });

    it("should have Kenlo Pay pricing", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      // Check tiered pricing per plan (no included amounts - all post-paid)
      expect(config.kenloPay.boletosTiers).toHaveProperty("prime");
      expect(Array.isArray(config.kenloPay.boletosTiers.prime)).toBe(true);
      expect(config.kenloPay.splitsTiers).toHaveProperty("prime");
      expect(Array.isArray(config.kenloPay.splitsTiers.prime)).toBe(true);
    });

    it("should have Kenlo Seguros pricing", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      // Check commission rates per plan
      expect(config.kenloSeguros.commissionRates).toHaveProperty("prime");
      expect(config.kenloSeguros.commissionRates).toHaveProperty("k");
      expect(config.kenloSeguros.commissionRates).toHaveProperty("k2");
      expect(typeof config.kenloSeguros.commissionRates.prime).toBe("number");
    });

    it("should have base implementation cost", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.implantacaoBase).toBe(1497);
    });
  });

  describe("Pricing Values Validation", () => {
    it("should have biennial discount of 25% (multiplier 0.75)", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.frequencyMultipliers.biennial).toBe(0.75);
    });

    it("should have CS Dedicado price of R$297", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      expect(config.premiumServices.csDedicado).toBe(297);
    });

    it("should have all annual prices ending in 7", async () => {
      const content = await fs.readFile(testConfigPath, "utf-8");
      const config = JSON.parse(content);
      
      // Check IMOB plans
      Object.values(config.imobPlans).forEach((plan: any) => {
        expect(plan.annualPrice % 10).toBe(7);
      });
      
      // Check LOC plans
      Object.values(config.locPlans).forEach((plan: any) => {
        expect(plan.annualPrice % 10).toBe(7);
      });
      
      // Check add-ons
      Object.values(config.addons).forEach((addon: any) => {
        expect(addon.annualPrice % 10).toBe(7);
      });
      
      // Check premium services
      expect(config.premiumServices.vipSupport % 10).toBe(7);
      expect(config.premiumServices.csDedicado % 10).toBe(7);
    });
  });
});
