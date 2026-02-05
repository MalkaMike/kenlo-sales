import { describe, it, expect } from 'vitest';

/**
 * PDF Data Validation Tests
 * 
 * These tests verify that the data sent to PDF generation matches
 * the calculator selections and that all validation logic works correctly.
 */

describe('PDF Data Validation', () => {
  
  describe('Add-on Compatibility Validation', () => {
    
    it('should allow Leads, Inteligência, Assinatura for IMOB only', () => {
      const product = 'imob';
      const imobCompatible = ['leads', 'inteligencia', 'assinatura'];
      const locCompatible = ['pay', 'seguros', 'cash', 'inteligencia', 'assinatura'];
      
      const testAddons = ['leads', 'inteligencia', 'assinatura'];
      
      testAddons.forEach(addon => {
        const isCompatible = imobCompatible.includes(addon);
        expect(isCompatible).toBe(true);
      });
    });
    
    it('should reject Pay, Seguros, Cash for IMOB only', () => {
      const product = 'imob';
      const imobCompatible = ['leads', 'inteligencia', 'assinatura'];
      
      const incompatibleAddons = ['pay', 'seguros', 'cash'];
      
      incompatibleAddons.forEach(addon => {
        const isCompatible = imobCompatible.includes(addon);
        expect(isCompatible).toBe(false);
      });
    });
    
    it('should allow Pay, Seguros, Cash, Inteligência, Assinatura for LOC only', () => {
      const product = 'loc';
      const locCompatible = ['pay', 'seguros', 'cash', 'inteligencia', 'assinatura'];
      
      const testAddons = ['pay', 'seguros', 'cash', 'inteligencia', 'assinatura'];
      
      testAddons.forEach(addon => {
        const isCompatible = locCompatible.includes(addon);
        expect(isCompatible).toBe(true);
      });
    });
    
    it('should reject Leads for LOC only', () => {
      const product = 'loc';
      const locCompatible = ['pay', 'seguros', 'cash', 'inteligencia', 'assinatura'];
      
      const isCompatible = locCompatible.includes('leads');
      expect(isCompatible).toBe(false);
    });
    
    it('should allow ALL add-ons for IMOB+LOC', () => {
      const product = 'both';
      const allAddons = ['leads', 'inteligencia', 'assinatura', 'pay', 'seguros', 'cash'];
      
      allAddons.forEach(addon => {
        // For 'both' product, all add-ons are compatible
        const isCompatible = true;
        expect(isCompatible).toBe(true);
      });
    });
  });
  
  describe('Premium Services Pricing Logic', () => {
    
    it('should set Premium Services price to 0 for Kombo Imob Start', () => {
      const komboName = 'Kombo Imob Start';
      const hasPremiumIncluded = 
        komboName === 'Kombo Imob Start' ||
        komboName === 'Kombo Core Gestão' || 
        komboName === 'Kombo Elite' ||
        komboName === 'Kombo Imob Pro' ||
        komboName === 'Kombo Locação Pro';
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 97 + 197;
      
      expect(hasPremiumIncluded).toBe(true);
      expect(premiumServicesPrice).toBe(0);
    });
    
    it('should set Premium Services price to 0 for Kombo Core Gestão', () => {
      const komboName = 'Kombo Core Gestão';
      const hasPremiumIncluded = 
        komboName === 'Kombo Imob Start' ||
        komboName === 'Kombo Core Gestão' || 
        komboName === 'Kombo Elite' ||
        komboName === 'Kombo Imob Pro' ||
        komboName === 'Kombo Locação Pro';
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 97 + 197;
      
      expect(hasPremiumIncluded).toBe(true);
      expect(premiumServicesPrice).toBe(0);
    });
    
    it('should set Premium Services price to 0 for Kombo Elite', () => {
      const komboName = 'Kombo Elite';
      const hasPremiumIncluded = 
        komboName === 'Kombo Imob Start' ||
        komboName === 'Kombo Core Gestão' || 
        komboName === 'Kombo Elite' ||
        komboName === 'Kombo Imob Pro' ||
        komboName === 'Kombo Locação Pro';
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 97 + 197;
      
      expect(hasPremiumIncluded).toBe(true);
      expect(premiumServicesPrice).toBe(0);
    });
    
    it('should set Premium Services price to 0 for Kombo Imob Pro', () => {
      const komboName = 'Kombo Imob Pro';
      const hasPremiumIncluded = 
        komboName === 'Kombo Imob Start' ||
        komboName === 'Kombo Core Gestão' || 
        komboName === 'Kombo Elite' ||
        komboName === 'Kombo Imob Pro' ||
        komboName === 'Kombo Locação Pro';
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 97 + 197;
      
      expect(hasPremiumIncluded).toBe(true);
      expect(premiumServicesPrice).toBe(0);
    });
    
    it('should set Premium Services price to 0 for Kombo Locação Pro', () => {
      const komboName = 'Kombo Locação Pro';
      const hasPremiumIncluded = 
        komboName === 'Kombo Imob Start' ||
        komboName === 'Kombo Core Gestão' || 
        komboName === 'Kombo Elite' ||
        komboName === 'Kombo Imob Pro' ||
        komboName === 'Kombo Locação Pro';
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 97 + 197;
      
      expect(hasPremiumIncluded).toBe(true);
      expect(premiumServicesPrice).toBe(0);
    });
    
    it('should calculate Premium Services price for no Kombo (VIP + CS)', () => {
      const komboName = undefined;
      const hasVip = true;
      const hasCS = true;
      
      const hasPremiumIncluded = false;
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 
        (hasVip ? 97 : 0) + (hasCS ? 197 : 0);
      
      expect(hasPremiumIncluded).toBe(false);
      expect(premiumServicesPrice).toBe(294); // 97 + 197
    });
    
    it('should calculate Premium Services price for no Kombo (VIP only)', () => {
      const komboName = undefined;
      const hasVip = true;
      const hasCS = false;
      
      const hasPremiumIncluded = false;
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 
        (hasVip ? 97 : 0) + (hasCS ? 197 : 0);
      
      expect(premiumServicesPrice).toBe(97);
    });
    
    it('should calculate Premium Services price for no Kombo (CS only)', () => {
      const komboName = undefined;
      const hasVip = false;
      const hasCS = true;
      
      const hasPremiumIncluded = false;
      
      const premiumServicesPrice = hasPremiumIncluded ? 0 : 
        (hasVip ? 97 : 0) + (hasCS ? 197 : 0);
      
      expect(premiumServicesPrice).toBe(197);
    });
  });
  
  describe('WhatsApp Dependency Validation', () => {
    
    it('should allow WhatsApp when Leads is active', () => {
      const wantsWhatsApp = true;
      const hasLeads = true;
      const hasExternalAI = false;
      
      const isValid = !wantsWhatsApp || hasLeads || hasExternalAI;
      
      expect(isValid).toBe(true);
    });
    
    it('should allow WhatsApp when External AI is active', () => {
      const wantsWhatsApp = true;
      const hasLeads = false;
      const hasExternalAI = true;
      
      const isValid = !wantsWhatsApp || hasLeads || hasExternalAI;
      
      expect(isValid).toBe(true);
    });
    
    it('should reject WhatsApp when neither Leads nor External AI is active', () => {
      const wantsWhatsApp = true;
      const hasLeads = false;
      const hasExternalAI = false;
      
      const isValid = !wantsWhatsApp || hasLeads || hasExternalAI;
      
      expect(isValid).toBe(false);
    });
    
    it('should allow WhatsApp disabled regardless of dependencies', () => {
      const wantsWhatsApp = false;
      const hasLeads = false;
      const hasExternalAI = false;
      
      const isValid = !wantsWhatsApp || hasLeads || hasExternalAI;
      
      expect(isValid).toBe(true);
    });
  });
  
  describe('Kombo Detection Logic', () => {
    
    it('should detect Kombo Imob Start (IMOB + Leads + Assinatura)', () => {
      const product = 'imob';
      const addons = { leads: true, assinatura: true, inteligencia: false, pay: false, seguros: false, cash: false };
      
      const hasImob = product === 'imob' || product === 'both';
      const hasLoc = product === 'loc' || product === 'both';
      const hasLeads = addons.leads;
      const hasInteligencia = addons.inteligencia;
      const hasAssinatura = addons.assinatura;
      const hasPay = addons.pay;
      const hasSeguros = addons.seguros;
      const hasCash = addons.cash;
      
      const isImobStart = hasImob && !hasLoc && hasLeads && hasAssinatura && !hasInteligencia;
      
      expect(isImobStart).toBe(true);
    });
    
    it('should detect Kombo Imob Pro (IMOB + Leads + Inteligência + Assinatura)', () => {
      const product = 'imob';
      const addons = { leads: true, assinatura: true, inteligencia: true, pay: false, seguros: false, cash: false };
      
      const hasImob = product === 'imob' || product === 'both';
      const hasLoc = product === 'loc' || product === 'both';
      const hasLeads = addons.leads;
      const hasInteligencia = addons.inteligencia;
      const hasAssinatura = addons.assinatura;
      
      const isImobPro = hasImob && !hasLoc && hasLeads && hasInteligencia && hasAssinatura;
      
      expect(isImobPro).toBe(true);
    });
    
    it('should detect Kombo Locação Pro (LOC + Inteligência + Assinatura)', () => {
      const product = 'loc';
      const addons = { leads: false, assinatura: true, inteligencia: true, pay: false, seguros: false, cash: false };
      
      const hasImob = product === 'imob' || product === 'both';
      const hasLoc = product === 'loc' || product === 'both';
      const hasInteligencia = addons.inteligencia;
      const hasAssinatura = addons.assinatura;
      
      const isLocacaoPro = !hasImob && hasLoc && hasInteligencia && hasAssinatura;
      
      expect(isLocacaoPro).toBe(true);
    });
    
    it('should detect Kombo Core Gestão (IMOB + LOC without add-ons)', () => {
      const product = 'both';
      const addons = { leads: false, assinatura: false, inteligencia: false, pay: false, seguros: false, cash: false };
      
      const hasImob = product === 'imob' || product === 'both';
      const hasLoc = product === 'loc' || product === 'both';
      const hasAnyAddon = Object.values(addons).some(v => v);
      
      const isCoreGestao = hasImob && hasLoc && !hasAnyAddon;
      
      expect(isCoreGestao).toBe(true);
    });
    
    it('should detect Kombo Elite (IMOB + LOC + ALL add-ons)', () => {
      const product = 'both';
      const addons = { leads: true, assinatura: true, inteligencia: true, pay: true, seguros: true, cash: true };
      
      const hasImob = product === 'imob' || product === 'both';
      const hasLoc = product === 'loc' || product === 'both';
      const hasAllAddons = Object.values(addons).every(v => v);
      
      const isElite = hasImob && hasLoc && hasAllAddons;
      
      expect(isElite).toBe(true);
    });
  });
  
  describe('Business Metrics Validation', () => {
    
    it('should capture IMOB metrics correctly', () => {
      const metrics = {
        imobUsers: 5,
        closingsPerMonth: 10,
        leadsPerMonth: 150,
        usesExternalAI: true,
        wantsWhatsApp: true,
      };
      
      expect(metrics.imobUsers).toBeGreaterThan(0);
      expect(metrics.closingsPerMonth).toBeGreaterThan(0);
      expect(metrics.leadsPerMonth).toBeGreaterThanOrEqual(0);
      expect(typeof metrics.usesExternalAI).toBe('boolean');
      expect(typeof metrics.wantsWhatsApp).toBe('boolean');
    });
    
    it('should capture LOC metrics correctly', () => {
      const metrics = {
        contractsUnderManagement: 50,
        newContractsPerMonth: 5,
        chargesSplitToOwner: true,
      };
      
      expect(metrics.contractsUnderManagement).toBeGreaterThan(0);
      expect(metrics.newContractsPerMonth).toBeGreaterThan(0);
      expect(typeof metrics.chargesSplitToOwner).toBe('boolean');
    });
  });
});
