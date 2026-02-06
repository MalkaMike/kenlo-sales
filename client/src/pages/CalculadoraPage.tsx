/**
 * Kenlo Intelligent Pricing Calculator - Single Page Version
 * Streamlined tool for sales team with smart filters and dynamic questions
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { useSalesperson } from "@/hooks/useSalesperson";
import { useAuth } from "@/_core/hooks/useAuth";
import { CRM_SYSTEMS, ERP_SYSTEMS, type CRMSystem, type ERPSystem } from "@/constants/systems";

import { KomboComparisonTable } from "@/components/KomboComparisonTable";
import { QuoteInfoDialog, type QuoteInfo } from "@/components/QuoteInfoDialog";
import { PreviewDataDialog } from "@/components/PreviewDataDialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Calculator,
  Download,
  TrendingUp,
  Key,
  CheckCircle2,
  Zap,
  RotateCcw,
  Eye,
} from "lucide-react";

// Types
type ProductSelection = "imob" | "loc" | "both";
type PlanTier = "prime" | "k" | "k2";
type PaymentFrequency = "monthly" | "semestral" | "annual" | "biennial";
type KomboType = "imob_start" | "imob_pro" | "locacao_pro" | "core_gestao" | "elite" | "none";
type BusinessType = "broker" | "rental_admin" | "both";

// Kombo definitions
/**
 * KOMBO DEFINITIONS
 * 
 * includesPremiumServices: true = VIP Support + CS Dedicado INCLUDED in Kombo price
 * - Imob Start: NÃO inclui (cliente paga à parte se quiser)
 * - Imob Pro, Locação Pro, Core Gestão, Elite: INCLUI VIP + CS Dedicado
 * 
 * freeImplementations: lista de implantações gratuitas no Kombo
 */
const KOMBOS = {
  imob_start: {
    name: "Kombo Imob Start",
    description: "IMOB + Leads + Assinaturas",
    discount: 0.10, // 10% OFF
    implantationDiscount: 0, // Implantação fixa R$ 1.497
    requiredProducts: ["imob"] as ProductSelection[],
    requiredAddons: ["leads", "assinatura"],
    forbiddenAddons: ["inteligencia"], // Must NOT have Inteligência
    includesPremiumServices: false, // NÃO inclui VIP/CS - cliente paga à parte
    freeImplementations: ["leads"], // Implantação de Leads ofertada
  },
  imob_pro: {
    name: "Kombo Imob Pro",
    description: "IMOB + Leads + Inteligência + Assinatura",
    discount: 0.15, // 15% OFF
    implantationDiscount: 0, // Implantação fixa R$ 1.497
    requiredProducts: ["imob"] as ProductSelection[],
    requiredAddons: ["leads", "inteligencia", "assinatura"],
    includesPremiumServices: true, // INCLUI VIP + CS Dedicado
    freeImplementations: ["leads", "inteligencia"], // Implantação de Leads e Inteligência ofertada
  },
  locacao_pro: {
    name: "Kombo Locação Pro",
    description: "LOC + Inteligência + Assinatura",
    discount: 0.10, // 10% OFF
    implantationDiscount: 0, // Implantação fixa R$ 1.497
    requiredProducts: ["loc"] as ProductSelection[],
    requiredAddons: ["inteligencia", "assinatura"],
    forbiddenAddons: ["leads"], // Must NOT have Leads
    includesPremiumServices: true, // INCLUI VIP + CS Dedicado
    freeImplementations: ["inteligencia"], // Implantação de Inteligência ofertada
  },
  core_gestao: {
    name: "Kombo Core Gestão",
    description: "IMOB + LOC sem add-ons",
    discount: 0, // SEM desconto nas mensalidades
    implantationDiscount: 0, // Implantação fixa R$ 1.497 (IMOB gratis)
    requiredProducts: ["both"] as ProductSelection[],
    requiredAddons: [], // No add-ons required
    maxAddons: 0, // Must have ZERO add-ons
    includesPremiumServices: true, // INCLUI VIP + CS Dedicado
    freeImplementations: ["imob"], // Implantação de IMOB ofertada
  },
  elite: {
    name: "Kombo Elite",
    description: "IMOB + LOC + Todos Add-ons",
    discount: 0.20, // 20% OFF
    implantationDiscount: 0, // Implantação fixa R$ 1.497
    requiredProducts: ["both"] as ProductSelection[],
    requiredAddons: ["leads", "inteligencia", "assinatura", "pay", "seguros", "cash"], // ALL add-ons
    includesPremiumServices: true, // INCLUI VIP + CS Dedicado
    freeImplementations: ["imob", "leads", "inteligencia"], // Implantação de IMOB, Leads e Inteligência ofertada
  },
};

/**
 * CRITICAL: All base prices are ANNUAL prices (when paying annually)
 * These are the "Licença mensal (plano anual)" prices from the pricing document
 */
const PLAN_ANNUAL_PRICES = {
  prime: 247,  // R$247/month when paying annually
  k: 497,      // R$497/month when paying annually
  k2: 1197,    // R$1197/month when paying annually
};

const ADDON_ANNUAL_PRICES = {
  leads: 497,        // R$497/month when paying annually
  inteligencia: 297, // R$297/month when paying annually (BI/Analytics) - CORRECTED from 247
  assinatura: 37,    // R$37/month when paying annually (Digital signature) - CORRECTED from 197
  pay: 0,            // Pós-pago (postpaid), usage-based - shown separately
  seguros: 0,        // Pós-pago (postpaid), percentage of premium - shown separately
  cash: 0,           // FREE add-on - no cost
};

// Product-specific implementation costs (one-time fees)
const IMPLEMENTATION_COSTS = {
  imob: 1497,
  loc: 1497,
  leads: 497,
  inteligencia: 497,  // BI/Analytics add-on
  assinatura: 0,      // Digital signature add-on - CORRECTED from 297 to 0 (sem custo)
  cash: 0,            // Cash management add-on - FREE (no implementation cost)
  combo: 1497,        // ANY combo has fixed implementation cost
};

/**
 * Payment frequency multipliers
 * Base price is ANNUAL. Other frequencies are calculated from annual:
 * - Monthly (mês a mês): Annual ÷ (1 - 20%) = Annual ÷ 0.80 = Annual × 1.25 (25% MORE expensive)
 * - Semestral: Annual ÷ (1 - 10%) = Annual ÷ 0.90 ≈ Annual × 1.111 (11% more expensive)
 * - Annual: Base price (reference, no change)
 * - Biennial: Annual × (1 - 10%) = Annual × 0.90 (10% discount)
 */
const PAYMENT_FREQUENCY_MULTIPLIERS = {
  monthly: 1.25,      // 25% MORE expensive than annual
  semestral: 1.1111,  // ~11% more expensive than annual (1 ÷ 0.90)
  annual: 1.0,        // Base price (reference)
  biennial: 0.90,     // 10% discount from annual
};

/**
 * Round price UP to next value ending in 7
 * Rule applies ONLY for prices above R$ 100
 * Prices below R$ 100 use normal rounding
 * Example: 37 → 37, 490 → 497, 495 → 497, 502 → 507, 507 → 507
 */
const roundToEndIn7 = (price: number): number => {
  // For prices below 100, use normal rounding
  if (price < 100) return Math.round(price);
  
  // For prices >= 100, round to end in 7
  const lastDigit = price % 10;
  if (lastDigit === 7) {
    return price; // Already ends in 7
  } else if (lastDigit < 7) {
    return price - lastDigit + 7; // Round up to 7 in current decade
  } else {
    return price - lastDigit + 17; // Round up to 7 in next decade
  }
};

export default function CalculadoraPage() {
  // Authentication hooks
  const { salesperson, isAuthenticated: isSalespersonAuth } = useSalesperson();
  const { user: oauthUser } = useAuth();
  
  // Helper function to check if email is from authorized domain
  const isAuthorizedEmail = (email: string | null | undefined): boolean => {
    if (!email) return false;
    const authorizedDomains = ['@kenlo.com.br', '@i-value.com.br', '@laik.com.br'];
    return authorizedDomains.some(domain => email.toLowerCase().endsWith(domain));
  };
  
  // Check if user can export PDF
  // Both salesperson login (Master/Vendor) AND OAuth users with authorized domains can export
  const canExportPDF = isSalespersonAuth || isAuthorizedEmail(oauthUser?.email)
  
  // Validate that all mandatory business nature questions are answered
  const isBusinessNatureComplete = (): boolean => {
    // Website is always mandatory
    if (!businessNature.hasWebsite && businessNature.websiteUrl === "") {
      return false;
    }
    
    // CRM is mandatory for Corretora or Ambos
    if (businessNature.businessType === "broker" || businessNature.businessType === "both") {
      if (!businessNature.hasCRM && businessNature.crmSystem === "") {
        return false;
      }
    }
    
    // ERP is mandatory for Administrador de Aluguel or Ambos
    if (businessNature.businessType === "rental_admin" || businessNature.businessType === "both") {
      if (!businessNature.hasERP && businessNature.erpSystem === "") {
        return false;
      }
    }
    
    return true;
  }
  
  // Step 0: Business Nature (NEW SECTION)
  const [businessNature, setBusinessNature] = useState({
    businessType: "broker" as BusinessType,
    companyName: "",
    ownerName: "",
    email: "",
    cellphone: "",
    landline: "",
    hasWebsite: false,
    websiteUrl: "",
    hasCRM: false,
    crmSystem: "" as CRMSystem | "",
    crmOther: "",
    hasERP: false,
    erpSystem: "" as ERPSystem | "",
    erpOther: "",
  });
  
  // Step 1: Product selection - Default: IMOB only
  const [product, setProduct] = useState<ProductSelection>("imob");
  
  // Step 2: Add-ons (all 6 add-ons) - All DISABLED by default
  const [addons, setAddons] = useState({
    leads: false,
    inteligencia: false, // BI/Analytics
    assinatura: false, // Digital signature
    pay: false,
    seguros: false,
    cash: false,
  });

  // Step 3: Metrics (conditional based on product) - Minimal defaults
  const [metrics, setMetrics] = useState({
    // Imob metrics - defaults: 1 user, 1 closing, 0 leads
    imobUsers: 1,
    closingsPerMonth: 1,
    leadsPerMonth: 0,  // Number of leads received per month for WhatsApp calculation
    usesExternalAI: false,
    wantsWhatsApp: false,  // WhatsApp disabled by default
    imobVipSupport: false,  // VIP Support for IMOB
    imobDedicatedCS: false, // Dedicated CS for IMOB
    
    // Loc metrics - defaults: 1 contract, 1 new contract
    contractsUnderManagement: 1,
    newContractsPerMonth: 1,
    locVipSupport: false,   // VIP Support for LOC
    locDedicatedCS: false,  // Dedicated CS for LOC
    
    // Kenlo Pay billing - defaults: disabled, R$0
    chargesBoletoToTenant: false,
    boletoChargeAmount: 0,  // Amount charged to tenant for boleto
    chargesSplitToOwner: false,
    splitChargeAmount: 0,   // Amount charged to owner for split
  });

  // Step 4: Payment frequency (default: annual)
  const [frequency, setFrequency] = useState<PaymentFrequency>("annual");

  // Step 5: Pre-payment options for additional users/contracts (only for Annual/Biennial)
  const [prepayAdditionalUsers, setPrepayAdditionalUsers] = useState(false);
  const [prepayAdditionalContracts, setPrepayAdditionalContracts] = useState(false);
  
  // Quote info dialog state
  const [showQuoteInfoDialog, setShowQuoteInfoDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [pendingQuoteInfo, setPendingQuoteInfo] = useState<QuoteInfo | null>(null);
  const [animateMetrics, setAnimateMetrics] = useState(false);
  const prevProductRef = useRef<ProductSelection>(product);
  
  // tRPC mutations for PDF generation and proposal creation
  const generatePDF = trpc.proposals.generatePDF.useMutation();
  const createProposal = trpc.proposals.create.useMutation();

  // Recommended plans
  const [imobPlan, setImobPlan] = useState<PlanTier>("k");
  const [locPlan, setLocPlan] = useState<PlanTier>("k");

  // Reset all fields to default values
  const handleReset = useCallback(() => {
    // Reset business nature
    setBusinessNature({
      businessType: "broker",
      companyName: "",
      ownerName: "",
      email: "",
      cellphone: "",
      landline: "",
      hasWebsite: false,
      websiteUrl: "",
      hasCRM: false,
      crmSystem: "",
      crmOther: "",
      hasERP: false,
      erpSystem: "",
      erpOther: "",
    });
    
    // Reset product selection
    setProduct("imob");
    
    // Reset all add-ons to disabled
    setAddons({
      leads: false,
      inteligencia: false,
      assinatura: false,
      pay: false,
      seguros: false,
      cash: false,
    });
    
    // Reset metrics to minimal defaults
    setMetrics({
      imobUsers: 1,
      closingsPerMonth: 1,
      leadsPerMonth: 0,
      usesExternalAI: false,
      wantsWhatsApp: false,
      imobVipSupport: false,
      imobDedicatedCS: false,
      contractsUnderManagement: 1,
      newContractsPerMonth: 1,
      locVipSupport: false,
      locDedicatedCS: false,
      chargesBoletoToTenant: false,
      boletoChargeAmount: 0,
      chargesSplitToOwner: false,
      splitChargeAmount: 0,
    });
    
    // Reset frequency to annual
    setFrequency("annual");
    
    // Reset pre-payment options
    setPrepayAdditionalUsers(false);
    setPrepayAdditionalContracts(false);
    
    // Reset selected plan
    setSelectedPlan(null);
    
    // Reset recommended plans
    setImobPlan("k");
    setLocPlan("k");
  }, []);

  // URL search params for shareable links
  const searchString = useSearch();

  /**
   * Generate shareable URL with all current configuration
   */
  const generateShareableURL = useCallback((): string => {
    const params = new URLSearchParams();
    
    // Product selection
    params.set('p', product);
    
    // Plans
    params.set('ip', imobPlan);
    params.set('lp', locPlan);
    
    // Frequency
    params.set('f', frequency);
    
    // Add-ons (compact format: 1 for enabled, 0 for disabled)
    params.set('a', [
      addons.leads ? '1' : '0',
      addons.inteligencia ? '1' : '0',
      addons.assinatura ? '1' : '0',
      addons.pay ? '1' : '0',
      addons.seguros ? '1' : '0',
      addons.cash ? '1' : '0',
    ].join(''));
    
    // Metrics (numeric values)
    params.set('iu', metrics.imobUsers.toString());
    params.set('cm', metrics.closingsPerMonth.toString());
    params.set('lm', metrics.leadsPerMonth.toString());
    params.set('cu', metrics.contractsUnderManagement.toString());
    params.set('nc', metrics.newContractsPerMonth.toString());
    
    // Boolean metrics (compact)
    params.set('b', [
      metrics.usesExternalAI ? '1' : '0',
      metrics.wantsWhatsApp ? '1' : '0',
      metrics.imobVipSupport ? '1' : '0',
      metrics.imobDedicatedCS ? '1' : '0',
      metrics.locVipSupport ? '1' : '0',
      metrics.locDedicatedCS ? '1' : '0',
      metrics.chargesBoletoToTenant ? '1' : '0',
      metrics.chargesSplitToOwner ? '1' : '0',
    ].join(''));
    
    // Pay charge amounts
    params.set('ba', metrics.boletoChargeAmount.toString());
    params.set('sa', metrics.splitChargeAmount.toString());
    
    const baseUrl = window.location.origin + '/cotacao';
    return `${baseUrl}?${params.toString()}`;
  }, [product, imobPlan, locPlan, frequency, addons, metrics]);

  // Mutation to save quote to database
  const saveQuoteMutation = trpc.quotes.save.useMutation();

  /**
   * Load configuration from URL parameters on mount
   */
  useEffect(() => {
    if (!searchString) return;
    
    const params = new URLSearchParams(searchString);
    
    // Product selection
    const p = params.get('p');
    if (p && ['imob', 'loc', 'both'].includes(p)) {
      setProduct(p as ProductSelection);
    }
    
    // Plans
    const ip = params.get('ip');
    if (ip && ['prime', 'k', 'k2'].includes(ip)) {
      setImobPlan(ip as PlanTier);
    }
    const lp = params.get('lp');
    if (lp && ['prime', 'k', 'k2'].includes(lp)) {
      setLocPlan(lp as PlanTier);
    }
    
    // Frequency
    const f = params.get('f');
    if (f && ['monthly', 'semestral', 'annual', 'biennial'].includes(f)) {
      setFrequency(f as PaymentFrequency);
    }
    
    // Add-ons
    const a = params.get('a');
    if (a && a.length === 6) {
      setAddons({
        leads: a[0] === '1',
        inteligencia: a[1] === '1',
        assinatura: a[2] === '1',
        pay: a[3] === '1',
        seguros: a[4] === '1',
        cash: a[5] === '1',
      });
    }
    
    // Numeric metrics
    const iu = params.get('iu');
    const cm = params.get('cm');
    const lm = params.get('lm');
    const cu = params.get('cu');
    const nc = params.get('nc');
    const ba = params.get('ba');
    const sa = params.get('sa');
    
    // Boolean metrics
    const b = params.get('b');
    
    setMetrics(prev => ({
      ...prev,
      imobUsers: iu ? parseInt(iu, 10) : prev.imobUsers,
      closingsPerMonth: cm ? parseInt(cm, 10) : prev.closingsPerMonth,
      leadsPerMonth: lm ? parseInt(lm, 10) : prev.leadsPerMonth,
      contractsUnderManagement: cu ? parseInt(cu, 10) : prev.contractsUnderManagement,
      newContractsPerMonth: nc ? parseInt(nc, 10) : prev.newContractsPerMonth,
      boletoChargeAmount: ba ? parseFloat(ba) : prev.boletoChargeAmount,
      splitChargeAmount: sa ? parseFloat(sa) : prev.splitChargeAmount,
      ...(b && b.length === 8 ? {
        usesExternalAI: b[0] === '1',
        wantsWhatsApp: b[1] === '1',
        imobVipSupport: b[2] === '1',
        imobDedicatedCS: b[3] === '1',
        locVipSupport: b[4] === '1',
        locDedicatedCS: b[5] === '1',
        chargesBoletoToTenant: b[6] === '1',
        chargesSplitToOwner: b[7] === '1',
      } : {}),
    }));
  }, [searchString]);

  // Detect active Kombo
  const detectKombo = (): KomboType => {
    const activeAddons = Object.entries(addons)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name);

    // Check each Kombo in priority order (most specific first)
    
    // Elite: IMOB + LOC + ALL add-ons
    if (product === "both" && activeAddons.length === 6) {
      const allAddonsPresent = KOMBOS.elite.requiredAddons.every(addon => activeAddons.includes(addon));
      if (allAddonsPresent) return "elite";
    }

    // Core Gestão: IMOB + LOC + NO add-ons
    if (product === "both" && activeAddons.length === 0) {
      return "core_gestao";
    }

    // Imob Pro: IMOB + Leads + Inteligência + Assinatura
    if (product === "imob") {
      const hasRequired = KOMBOS.imob_pro.requiredAddons.every(addon => activeAddons.includes(addon));
      if (hasRequired) return "imob_pro";
    }

    // Imob Start: IMOB + Leads + Assinatura (NO Inteligência)
    if (product === "imob") {
      const hasRequired = KOMBOS.imob_start.requiredAddons.every(addon => activeAddons.includes(addon));
      const hasForbidden = activeAddons.includes("inteligencia");
      if (hasRequired && !hasForbidden) return "imob_start";
    }

    // Locação Pro: LOC + Inteligência + Assinatura (NO Leads)
    if (product === "loc") {
      const hasRequired = KOMBOS.locacao_pro.requiredAddons.every(addon => activeAddons.includes(addon));
      const hasForbidden = activeAddons.includes("leads");
      if (hasRequired && !hasForbidden) return "locacao_pro";
    }

    return "none";
  };

  const activeKombo: KomboType = detectKombo();
  const komboInfo = activeKombo !== "none" ? KOMBOS[activeKombo] : null;

  /**
   * Calculate monthly reference price (month-to-month payment)
   * Monthly is 25% MORE expensive than annual: Annual × 1.25
   * This is shown in the "Mensal" column as the most expensive option
   */
  const calculateMonthlyReference = (annualPrice: number): number => {
    const monthlyPrice = annualPrice * PAYMENT_FREQUENCY_MULTIPLIERS.monthly;
    return roundToEndIn7(Math.round(monthlyPrice));
  };

  /**
   * Calculate price based on payment frequency
   * @param annualPrice - The base annual price (when paying annually)
   * @param freq - Payment frequency (semestral, annual, biennial)
   * @returns Monthly equivalent price for the selected frequency
   */
  const calculatePrice = (annualPrice: number, freq: PaymentFrequency): number => {
    const multiplier = PAYMENT_FREQUENCY_MULTIPLIERS[freq];
    const price = annualPrice * multiplier;
    return roundToEndIn7(Math.round(price));
  };

  // Check if add-on is available based on product selection
  const isAddonAvailable = (addon: keyof typeof addons) => {
    if (addon === "leads") return product === "imob" || product === "both";
    if (addon === "inteligencia") return true; // Available for both
    if (addon === "assinatura") return true; // Available for both
    if (addon === "pay") return product === "loc" || product === "both";
    if (addon === "seguros") return product === "loc" || product === "both";
    if (addon === "cash") return product === "loc" || product === "both";
    return false;
  };

  // Get line items for pricing table
  const getLineItems = () => {
    const komboDiscount = komboInfo ? (1 - komboInfo.discount) : 1;
    const items: Array<{ 
      name: string; 
      monthlyRefSemKombo: number; 
      monthlyRefComKombo: number;
      priceSemKombo: number;
      priceComKombo: number;
      implantation?: number 
    }> = [];

    if (product === "imob" || product === "both") {
      const baseMonthlyRef = calculateMonthlyReference(PLAN_ANNUAL_PRICES[imobPlan]);
      const basePrice = calculatePrice(PLAN_ANNUAL_PRICES[imobPlan], frequency);
      items.push({
        name: `Imob - ${imobPlan.toUpperCase()}`,
        monthlyRefSemKombo: baseMonthlyRef,
        monthlyRefComKombo: Math.round(baseMonthlyRef * komboDiscount),
        priceSemKombo: basePrice,
        priceComKombo: Math.round(basePrice * komboDiscount),
        implantation: IMPLEMENTATION_COSTS.imob,
      });
    }

    if (product === "loc" || product === "both") {
      const baseMonthlyRef = calculateMonthlyReference(PLAN_ANNUAL_PRICES[locPlan]);
      const basePrice = calculatePrice(PLAN_ANNUAL_PRICES[locPlan], frequency);
      items.push({
        name: `Loc - ${locPlan.toUpperCase()}`,
        monthlyRefSemKombo: baseMonthlyRef,
        monthlyRefComKombo: Math.round(baseMonthlyRef * komboDiscount),
        priceSemKombo: basePrice,
        priceComKombo: Math.round(basePrice * komboDiscount),
        implantation: IMPLEMENTATION_COSTS.loc,
      });
    }

    // Add-ons
    if (addons.leads && isAddonAvailable("leads")) {
      const baseMonthlyRef = calculateMonthlyReference(ADDON_ANNUAL_PRICES.leads);
      const basePrice = calculatePrice(ADDON_ANNUAL_PRICES.leads, frequency);
      items.push({
        name: "Leads",
        monthlyRefSemKombo: baseMonthlyRef,
        monthlyRefComKombo: Math.round(baseMonthlyRef * komboDiscount),
        priceSemKombo: basePrice,
        priceComKombo: Math.round(basePrice * komboDiscount),
        implantation: IMPLEMENTATION_COSTS.leads,
      });
    }

    if (addons.inteligencia) {
      const baseMonthlyRef = calculateMonthlyReference(ADDON_ANNUAL_PRICES.inteligencia);
      const basePrice = calculatePrice(ADDON_ANNUAL_PRICES.inteligencia, frequency);
      items.push({
        name: "Inteligência",
        monthlyRefSemKombo: baseMonthlyRef,
        monthlyRefComKombo: Math.round(baseMonthlyRef * komboDiscount),
        priceSemKombo: basePrice,
        priceComKombo: Math.round(basePrice * komboDiscount),
        implantation: IMPLEMENTATION_COSTS.inteligencia,
      });
    }

    if (addons.assinatura) {
      const baseMonthlyRef = calculateMonthlyReference(ADDON_ANNUAL_PRICES.assinatura);
      const basePrice = calculatePrice(ADDON_ANNUAL_PRICES.assinatura, frequency);
      items.push({
        name: "Assinatura",
        monthlyRefSemKombo: baseMonthlyRef,
        monthlyRefComKombo: Math.round(baseMonthlyRef * komboDiscount),
        priceSemKombo: basePrice,
        priceComKombo: Math.round(basePrice * komboDiscount),
        implantation: IMPLEMENTATION_COSTS.assinatura,
      });
    }

    // Pay and Seguros are NOT included in pré-pago line items
    // Pay is shown in Section 2 (Pós-pago)
    // Seguros is shown in Section 3 (Receitas Potenciais)

    // Cash is FREE - not included in pricing table

    return items;
  };

  /**
   * Recommend best Kombo based on cost-benefit analysis
   * Returns the Kombo that offers the best savings compared to no Kombo
   */
  const recommendBestKombo = (): { kombo: KomboType; savings: number; message: string } | null => {
    // If already in a Kombo, no recommendation needed
    if (activeKombo !== "none") return null;

    const currentActiveAddons = Object.entries(addons)
      .filter(([_, enabled]) => enabled)
      .map(([name, _]) => name as keyof typeof addons);

    // Calculate current cost without Kombo
    const currentCost = getLineItems().reduce((sum, item) => sum + item.priceSemKombo, 0);

    let bestKombo: KomboType | null = null;
    let bestSavings = 0;
    let bestMessage = "";

    // Check each Kombo for potential savings
    Object.entries(KOMBOS).forEach(([komboKey, kombo]) => {
      const komboType = komboKey as KomboType;
      
      // Skip if product doesn't match
      if (!kombo.requiredProducts.includes(product)) return;

      // Calculate missing add-ons
      const missingAddons = kombo.requiredAddons.filter(
        addon => !currentActiveAddons.includes(addon as keyof typeof addons)
      );

      // Skip if has forbidden add-ons
      if ('forbiddenAddons' in kombo && kombo.forbiddenAddons?.some((addon: string) => currentActiveAddons.includes(addon as keyof typeof addons))) return;

      // Calculate cost with this Kombo (including missing add-ons)
      const komboDiscount = 1 - kombo.discount;
      let projectedCost = currentCost * komboDiscount;

      // Add cost of missing add-ons (with Kombo discount)
      missingAddons.forEach(addon => {
        if (addon === "leads") projectedCost += 97 * komboDiscount;
        if (addon === "inteligencia") projectedCost += 197 * komboDiscount;
        if (addon === "assinatura") projectedCost += 0; // Pos-pago
        if (addon === "pay") projectedCost += 0; // Pos-pago
      });

      const savings = currentCost - projectedCost;

      // Only recommend if savings > R$50/month
      if (savings > 50 && savings > bestSavings) {
        bestKombo = komboType;
        bestSavings = savings;
        
        if (missingAddons.length === 0) {
          bestMessage = `Ative o ${kombo.name} e economize R$${Math.round(bestSavings)}/mês!`;
        } else {
          const addonNames = missingAddons.map(a => {
            if (a === "leads") return "Leads";
            if (a === "inteligencia") return "Inteligência";
            if (a === "assinatura") return "Assinatura";
            if (a === "pay") return "Pay";
            return a;
          }).join(", ");
          bestMessage = `Adicione ${addonNames} e ative o ${kombo.name} para economizar R$${Math.round(bestSavings)}/mês!`;
        }
      }
    });

    return bestKombo ? { kombo: bestKombo, savings: bestSavings, message: bestMessage } : null;
  };

  const komboRecommendation = recommendBestKombo();

  /**
   * Calculate total monthly cost for IMOB plan (mensalidade + usuários adicionais)
   * Returns the cheapest plan considering the number of users
   */
  const calculateImobPlanCost = (plan: PlanTier, users: number): number => {
    // Mensalidade base (anual)
    const baseCost = PLAN_ANNUAL_PRICES[plan];
    
    // Usuários incluídos por plano (atualizado Fev 2026)
    // Prime: 2 usuários, K: 7 usuários, K2: 14 usuários
    const included = plan === 'prime' ? 2 : plan === 'k' ? 7 : 14;
    const additional = Math.max(0, users - included);
    
    // Custo de usuários adicionais (atualizado Fev 2026)
    // Prime: R$57 fixo por usuário
    // K: 1-10 = R$47, 11+ = R$37
    // K2: 1-10 = R$47, 11-50 = R$37, 51+ = R$27
    let additionalCost = 0;
    if (additional > 0) {
      if (plan === 'prime') {
        // Prime: R$57 fixo por usuário adicional
        additionalCost = additional * 57;
      } else if (plan === 'k') {
        // K: 1-10 = R$47, 11+ = R$37
        const tier1 = Math.min(additional, 10);
        const tier2 = Math.max(0, additional - 10);
        additionalCost = (tier1 * 47) + (tier2 * 37);
      } else {
        // K2: 1-10 = R$47, 11-50 = R$37, 51+ = R$27
        const tier1 = Math.min(additional, 10);
        const tier2 = Math.min(Math.max(0, additional - 10), 40); // 11-50 (40 usuários)
        const tier3 = Math.max(0, additional - 50);
        additionalCost = (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
      }
    }
    
    return baseCost + additionalCost;
  };

  /**
   * Calculate total monthly cost for LOC plan (mensalidade + contratos adicionais)
   * Returns the cheapest plan considering the number of contracts
   */
  const calculateLocPlanCost = (plan: PlanTier, contracts: number): number => {
    // Mensalidade base (anual)
    const baseCost = PLAN_ANNUAL_PRICES[plan];
    
    // Contratos incluídos por plano
    const included = plan === 'prime' ? 100 : plan === 'k' ? 200 : 500;
    const additional = Math.max(0, contracts - included);
    
    // Custo de contratos adicionais
    let additionalCost = 0;
    if (additional > 0) {
      if (plan === 'prime') {
        additionalCost = additional * 3;
      } else if (plan === 'k') {
        const tier1 = Math.min(additional, 250);
        const tier2 = Math.max(0, additional - 250);
        additionalCost = (tier1 * 3) + (tier2 * 2.5);
      } else {
        const tier1 = Math.min(additional, 250);
        const tier2 = Math.min(Math.max(0, additional - 250), 250);
        const tier3 = Math.max(0, additional - 500);
        additionalCost = (tier1 * 3) + (tier2 * 2.5) + (tier3 * 2);
      }
    }
    
    return baseCost + additionalCost;
  };

  // Auto-recommend plans based on CAPACITY (número de usuários/contratos)
  // Regra: Número de usuários ou contratos define o nível mínimo do plano
  useEffect(() => {
    if (product === "imob" || product === "both") {
      const users = metrics.imobUsers;
      
      // IMOB: Baseado em número de usuários
      // Prime: 1-6 usuários
      // K: 7-13 usuários
      // K2: 14+ usuários
      let recommendedPlan: PlanTier = 'prime';
      
      if (users >= 14) {
        recommendedPlan = 'k2';
      } else if (users >= 7) {
        recommendedPlan = 'k';
      } else {
        recommendedPlan = 'prime';
      }
      
      setImobPlan(recommendedPlan);
    }

    if (product === "loc" || product === "both") {
      const contracts = metrics.contractsUnderManagement;
      
      // LOC: Baseado em número de contratos
      // Prime: 1-100 contratos
      // K: 101-200 contratos
      // K2: 201+ contratos
      let recommendedPlan: PlanTier = 'prime';
      
      if (contracts >= 201) {
        recommendedPlan = 'k2';
      } else if (contracts >= 101) {
        recommendedPlan = 'k';
      } else {
        recommendedPlan = 'prime';
      }
      
      setLocPlan(recommendedPlan);
    }
  }, [metrics.imobUsers, metrics.contractsUnderManagement, product]);

  // Auto-activate Suporte Premium and CS Dedicado based on selected plans
  // Rules:
  // - Suporte VIP: Default ON for K and K2 (included), Default OFF for Prime (optional paid)
  // - CS Dedicado: Default ON for K2 (included), Default OFF for Prime and K (optional paid)
  useEffect(() => {
    setMetrics(prev => {
      const newMetrics = { ...prev };
      
      // IMOB: Set default values based on plan, user can manually override later
      if (product === "imob" || product === "both") {
        // Suporte VIP: Included in K and K2, optional for Prime
        const shouldEnableImobVip = imobPlan === "k" || imobPlan === "k2";
        newMetrics.imobVipSupport = shouldEnableImobVip;
        
        // CS Dedicado: Included only in K2, optional for Prime and K
        const shouldEnableImobCS = imobPlan === "k2";
        newMetrics.imobDedicatedCS = shouldEnableImobCS;
      } else {
        // If IMOB is not selected, reset to false
        newMetrics.imobVipSupport = false;
        newMetrics.imobDedicatedCS = false;
      }
      
      // LOC: Same logic as IMOB
      if (product === "loc" || product === "both") {
        const shouldEnableLocVip = locPlan === "k" || locPlan === "k2";
        newMetrics.locVipSupport = shouldEnableLocVip;
        
        const shouldEnableLocCS = locPlan === "k2";
        newMetrics.locDedicatedCS = shouldEnableLocCS;
      } else {
        // If LOC is not selected, reset to false
        newMetrics.locVipSupport = false;
        newMetrics.locDedicatedCS = false;
      }
      
      return newMetrics;
    });
  }, [imobPlan, locPlan, product]);

  // Auto-disable WhatsApp when both Leads and IA SDR Externa are OFF
  useEffect(() => {
    const shouldDisableWhatsApp = !addons.leads && !metrics.usesExternalAI;
    if (shouldDisableWhatsApp && metrics.wantsWhatsApp) {
      setMetrics({ ...metrics, wantsWhatsApp: false });
    }
  }, [addons.leads, metrics.usesExternalAI]);

  // Detect which Kombo is active and return discount percentage
  // Old detectKombo function removed - now using new Kombo system above

  // Calculate total implementation cost
  const calculateTotalImplementation = (withKombo: boolean = false) => {
    
    // If any Kombo is active
    if (withKombo && komboInfo) {
      // TODOS os Kombos (incluindo Core Gestão): implantação fixa R$1.497
      return 1497;
    }
    
    // Without Kombo, sum individual implementation costs
    const items = getLineItems();
    return items.reduce((sum, item) => sum + (item.implantation || 0), 0);
  };

  // Calculate kombo discount on monthly recurring
  const calculateKomboDiscount = () => {
    if (!komboInfo) return 0;
    
    // Apply discount percentage to ALL products and add-ons
    const lineItems = getLineItems();
    const subtotal = lineItems.reduce((sum, item) => sum + item.priceSemKombo, 0);
    return Math.round(subtotal * komboInfo.discount);
  };

  /**
   * Calculate monthly reference total (no frequency discount)
   * This is the sum of all monthly reference prices
   */
  const calculateMonthlyReferenceTotal = (withKombo: boolean = false): number => {
    const lineItems = getLineItems();
    return lineItems.reduce((sum, item) => 
      sum + (withKombo ? item.monthlyRefComKombo : item.monthlyRefSemKombo), 0
    );
  };

  /**
   * Calculate monthly recurring total with frequency discount applied
   * This is the actual monthly cost based on selected payment frequency
   */
  const calculateMonthlyRecurring = (withKombo: boolean = false): number => {
    const lineItems = getLineItems();
    const subtotal = lineItems.reduce((sum, item) => sum + (withKombo ? item.priceComKombo : item.priceSemKombo), 0);
    return subtotal;
  };

  /**
   * Calculate prepayment amount for additional users (IMOB) and contracts (LOC)
   * Only applies to Annual (12 months) and Biennial (24 months) plans
   */
  const calculatePrepaymentAmount = (): { users: number; contracts: number; total: number } => {
    const months = frequency === 'annual' ? 12 : frequency === 'biennial' ? 24 : 0;
    if (months === 0) return { users: 0, contracts: 0, total: 0 };

    let usersPrepayment = 0;
    let contractsPrepayment = 0;

    // Calculate additional users cost (IMOB)
    if ((product === 'imob' || product === 'both') && prepayAdditionalUsers) {
      const plan = imobPlan;
      const included = plan === 'prime' ? 2 : plan === 'k' ? 7 : 14;
      const additional = Math.max(0, metrics.imobUsers - included);
      if (additional > 0) {
        let monthlyCost = 0;
        if (plan === 'prime') monthlyCost = additional * 57;
        else if (plan === 'k') {
          const tier1 = Math.min(additional, 10);
          const tier2 = Math.max(0, additional - 10);
          monthlyCost = (tier1 * 47) + (tier2 * 37);
        } else {
          const tier1 = Math.min(additional, 10);
          const tier2 = Math.min(Math.max(0, additional - 10), 40);
          const tier3 = Math.max(0, additional - 50);
          monthlyCost = (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
        }
        usersPrepayment = monthlyCost * months;
      }
    }

    // Calculate additional contracts cost (LOC)
    if ((product === 'loc' || product === 'both') && prepayAdditionalContracts) {
      const plan = locPlan;
      const included = plan === 'prime' ? 100 : plan === 'k' ? 200 : 500;
      const additional = Math.max(0, metrics.contractsUnderManagement - included);
      if (additional > 0) {
        let monthlyCost = 0;
        if (plan === 'prime') monthlyCost = additional * 3;
        else if (plan === 'k') {
          const tier1 = Math.min(additional, 250);
          const tier2 = Math.max(0, additional - 250);
          monthlyCost = (tier1 * 3) + (tier2 * 2.5);
        } else {
          const tier1 = Math.min(additional, 250);
          const tier2 = Math.min(Math.max(0, additional - 250), 250);
          const tier3 = Math.max(0, additional - 500);
          monthlyCost = (tier1 * 3) + (tier2 * 2.5) + (tier3 * 2);
        }
        contractsPrepayment = monthlyCost * months;
      }
    }

    return {
      users: usersPrepayment,
      contracts: contractsPrepayment,
      total: usersPrepayment + contractsPrepayment
    };
  };

  // Calculate first year total (recurring * 12 + implementation + prepayment)
  const calculateFirstYearTotal = (withKombo: boolean = false) => {
    const monthlyRecurring = calculateMonthlyRecurring(withKombo);
    const implementation = calculateTotalImplementation(withKombo);
    const prepayment = calculatePrepaymentAmount();
    return (monthlyRecurring * 12) + implementation + prepayment.total;
  };

  // Calculate post-pago for Pay
  const calculatePayPostPago = () => {
    if (!addons.pay || !(product === "loc" || product === "both")) return 0;
    const avgRent = 2000;
    const monthlyVolume = metrics.contractsUnderManagement * avgRent;
    return Math.round(monthlyVolume * 0.015); // 1.5%
  };

  // Helper: Highlight plan names (K, K2, Prima) in red
  const highlightPlanName = (name: string) => {
    // Match pattern like "Imob - K" or "Loc - PRIME"
    const parts = name.split(' - ');
    if (parts.length === 2) {
      return (
        <>
          {parts[0]} - <span className="text-primary font-bold">{parts[1]}</span>
        </>
      );
    }
    return name;
  };

  const formatCurrency = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const frequencyLabels = {
    monthly: "Mensal",
    semestral: "Semestral",
    annual: "Anual",
    biennial: "Bienal",
  };
  const frequencyBadges = {
    monthly: "0% - Refer\u00eancia",
    semestral: "-15%",
    annual: "-20%",
    biennial: "-25%",
  };;

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 sm:py-12 px-4 sm:px-6">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 px-4">
              Cotação Kenlo
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Configure a solução ideal para sua imobiliária e veja o investimento em tempo real
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="mt-4 gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </Button>
          </div>

          {/* Main Calculator Card */}
          <Card className="shadow-xl">
            <CardContent className="p-4 sm:p-6">
              {/* Step 0: Business Nature */}
              <div id="business-nature-section" className="mb-6 sm:mb-8">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  1. Natureza do Negócio
                </h2>
                <div className="space-y-4">
                  {/* Business Type */}
                  <div>
                    <Label className="text-sm font-semibold mb-4 block">Tipo de Negócio *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl">
                      {/* Corretora Box */}
                      <button
                        type="button"
                        onClick={() => setBusinessNature({ ...businessNature, businessType: "broker" })}
                        className={`relative p-4 sm:p-3 rounded-lg border-2 transition-all min-h-[60px] sm:min-h-0 ${
                          businessNature.businessType === "broker"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 hover:border-gray-300 active:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`w-5 h-5 sm:w-4 sm:h-4 ${
                            businessNature.businessType === "broker" ? "text-primary" : "text-gray-400"
                          }`} />
                          <div className="font-semibold text-sm sm:text-xs">Corretora</div>
                        </div>
                      </button>

                      {/* Administrador de Aluguel Box */}
                      <button
                        type="button"
                        onClick={() => setBusinessNature({ ...businessNature, businessType: "rental_admin" })}
                        className={`relative p-4 sm:p-3 rounded-lg border-2 transition-all min-h-[60px] sm:min-h-0 ${
                          businessNature.businessType === "rental_admin"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 hover:border-gray-300 active:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Key className={`w-5 h-5 sm:w-4 sm:h-4 ${
                            businessNature.businessType === "rental_admin" ? "text-primary" : "text-gray-400"
                          }`} />
                          <div className="font-semibold text-sm sm:text-xs">Administrador de Aluguel</div>
                        </div>
                      </button>

                      {/* Ambos Box */}
                      <button
                        type="button"
                        onClick={() => setBusinessNature({ ...businessNature, businessType: "both" })}
                        className={`relative p-4 sm:p-3 rounded-lg border-2 transition-all min-h-[60px] sm:min-h-0 ${
                          businessNature.businessType === "both"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 hover:border-gray-300 active:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Zap className={`w-5 h-5 sm:w-4 sm:h-4 ${
                            businessNature.businessType === "both" ? "text-primary" : "text-gray-400"
                          }`} />
                          <div className="font-semibold text-sm sm:text-xs">Ambos</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName" className="text-sm font-semibold mb-2 block">Nome da Imobiliária *</Label>
                      <Input
                        id="companyName"
                        value={businessNature.companyName}
                        onChange={(e) => setBusinessNature({ ...businessNature, companyName: e.target.value })}
                        placeholder="Ex: Imobiliária XYZ"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerName" className="text-sm font-semibold mb-2 block">Nome do Proprietário *</Label>
                      <Input
                        id="ownerName"
                        value={businessNature.ownerName}
                        onChange={(e) => setBusinessNature({ ...businessNature, ownerName: e.target.value })}
                        placeholder="Ex: João Silva"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold mb-2 block">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={businessNature.email}
                        onChange={(e) => setBusinessNature({ ...businessNature, email: e.target.value })}
                        placeholder="contato@imobiliaria.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cellphone" className="text-sm font-semibold mb-2 block">Celular *</Label>
                      <Input
                        id="cellphone"
                        value={businessNature.cellphone}
                        onChange={(e) => setBusinessNature({ ...businessNature, cellphone: e.target.value })}
                        placeholder="(11) 98765-4321"
                      />
                    </div>
                    <div>
                      <Label htmlFor="landline" className="text-sm font-semibold mb-2 block">Telefone Fixo</Label>
                      <Input
                        id="landline"
                        value={businessNature.landline}
                        onChange={(e) => setBusinessNature({ ...businessNature, landline: e.target.value })}
                        placeholder="(11) 3456-7890"
                      />
                    </div>
                  </div>

                  {/* Website / CRM / ERP - 3 Column Layout with Switches */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Website - Always visible */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label htmlFor="hasWebsite" className="text-sm font-medium">Tem site? *</Label>
                        <Switch
                          id="hasWebsite"
                          checked={businessNature.hasWebsite}
                          onCheckedChange={(checked) => setBusinessNature({ ...businessNature, hasWebsite: checked, websiteUrl: checked ? businessNature.websiteUrl : "" })}
                        />
                      </div>
                      {businessNature.hasWebsite && (
                        <Input
                          value={businessNature.websiteUrl}
                          onChange={(e) => setBusinessNature({ ...businessNature, websiteUrl: e.target.value })}
                          placeholder="https://www.imobiliaria.com.br"
                          className="text-sm"
                        />
                      )}
                    </div>

                    {/* Column 2: CRM - Only show for Corretora or Ambos */}
                    {(businessNature.businessType === "broker" || businessNature.businessType === "both") && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label htmlFor="hasCRM" className="text-sm font-medium">Já usa CRM? *</Label>
                          <Switch
                            id="hasCRM"
                            checked={businessNature.hasCRM}
                            onCheckedChange={(checked) => setBusinessNature({ ...businessNature, hasCRM: checked, crmSystem: checked ? businessNature.crmSystem : "", crmOther: checked ? businessNature.crmOther : "" })}
                          />
                        </div>
                        {businessNature.hasCRM && (
                          <div className="space-y-2">
                            <Select
                              value={businessNature.crmSystem}
                              onValueChange={(value) => setBusinessNature({ ...businessNature, crmSystem: value as CRMSystem, crmOther: value !== "Outro" ? "" : businessNature.crmOther })}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Selecione o CRM" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {CRM_SYSTEMS.map((crm) => (
                                  <SelectItem key={crm} value={crm}>{crm}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {businessNature.crmSystem === "Outro" && (
                              <Input
                                value={businessNature.crmOther}
                                onChange={(e) => setBusinessNature({ ...businessNature, crmOther: e.target.value })}
                                placeholder="Digite o nome do CRM"
                                className="text-sm"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Column 3: ERP - Only show for Administrador de Aluguel or Ambos */}
                    {(businessNature.businessType === "rental_admin" || businessNature.businessType === "both") && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label htmlFor="hasERP" className="text-sm font-medium">Já usa ERP? *</Label>
                          <Switch
                            id="hasERP"
                            checked={businessNature.hasERP}
                            onCheckedChange={(checked) => setBusinessNature({ ...businessNature, hasERP: checked, erpSystem: checked ? businessNature.erpSystem : "", erpOther: checked ? businessNature.erpOther : "" })}
                          />
                        </div>
                        {businessNature.hasERP && (
                          <div className="space-y-2">
                            <Select
                              value={businessNature.erpSystem}
                              onValueChange={(value) => setBusinessNature({ ...businessNature, erpSystem: value as ERPSystem, erpOther: value !== "Outro" ? "" : businessNature.erpOther })}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Selecione o ERP" />
                              </SelectTrigger>
                              <SelectContent>
                                {ERP_SYSTEMS.map((erp) => (
                                  <SelectItem key={erp} value={erp}>{erp}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {businessNature.erpSystem === "Outro" && (
                              <Input
                                value={businessNature.erpOther}
                                onChange={(e) => setBusinessNature({ ...businessNature, erpOther: e.target.value })}
                                placeholder="Digite o nome do ERP"
                                className="text-sm"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 1: Product Selection */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  2. Escolha o Produto
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl">
                  {[
                    { value: "imob", label: "Imob só", icon: TrendingUp, desc: "CRM + Site para vendas" },
                    { value: "loc", label: "Loc só", icon: Key, desc: "Gestão de locações" },
                    { value: "both", label: "Imob + Loc", icon: Zap, desc: "Solução completa" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setProduct(opt.value as ProductSelection)}
                      className={`relative p-4 sm:p-3 rounded-lg border-2 transition-all min-h-[60px] sm:min-h-0 ${
                        product === opt.value
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-gray-200 hover:border-gray-300 active:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <opt.icon className={`w-5 h-5 sm:w-4 sm:h-4 ${product === opt.value ? "text-primary" : "text-gray-400"}`} />
                        <div className="font-semibold text-sm sm:text-xs">{opt.label}</div>
                      </div>
                      <div className="text-xs sm:text-[11px] text-gray-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Add-ons */}
              <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    3. Add-ons Opcionais
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAddons({
                          leads: isAddonAvailable("leads"),
                          inteligencia: true,
                          assinatura: true,
                          pay: isAddonAvailable("pay"),
                          seguros: isAddonAvailable("seguros"),
                          cash: isAddonAvailable("cash"),
                        });
                      }}
                      className="px-3 py-2 text-xs sm:text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white active:bg-primary active:text-white transition-colors min-h-[44px] sm:min-h-0 flex-1 sm:flex-none"
                    >
                      Selecionar Todos
                    </button>
                    <button
                      onClick={() => {
                        setAddons({
                          leads: false,
                          inteligencia: false,
                          assinatura: false,
                          pay: false,
                          seguros: false,
                          cash: false,
                        });
                      }}
                      className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px] sm:min-h-0 flex-1 sm:flex-none"
                    >
                      Deselecionar Todos
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Row 1: Leads, Inteligência, Assinatura */}
                  <div className={`p-4 sm:p-3 rounded-lg border min-h-[70px] sm:min-h-0 ${!isAddonAvailable("leads") ? "opacity-50 bg-gray-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2 sm:mb-1">
                      <Label htmlFor="leads" className="font-semibold text-sm cursor-pointer">Leads</Label>
                      <Switch
                        id="leads"
                        checked={addons.leads}
                        onCheckedChange={(checked) => setAddons({ ...addons, leads: checked })}
                        disabled={!isAddonAvailable("leads")}
                      />
                    </div>
                    <div className="text-xs text-gray-500">Gestão automatizada de leads</div>
                  </div>

                  <div className="p-4 sm:p-3 rounded-lg border min-h-[70px] sm:min-h-0">
                    <div className="flex items-center justify-between mb-2 sm:mb-1">
                      <Label htmlFor="inteligencia" className="font-semibold text-sm cursor-pointer">Inteligência</Label>
                      <Switch
                        id="inteligencia"
                        checked={addons.inteligencia}
                        onCheckedChange={(checked) => setAddons({ ...addons, inteligencia: checked })}
                      />
                    </div>
                    <div className="text-xs text-gray-500">BI de KPIs de performance</div>
                  </div>

                  <div className="p-4 sm:p-3 rounded-lg border min-h-[70px] sm:min-h-0">
                    <div className="flex items-center justify-between mb-2 sm:mb-1">
                      <Label htmlFor="assinatura" className="font-semibold text-sm cursor-pointer">Assinatura</Label>
                      <Switch
                        id="assinatura"
                        checked={addons.assinatura}
                        onCheckedChange={(checked) => setAddons({ ...addons, assinatura: checked })}
                      />
                    </div>
                    <div className="text-xs text-gray-500">Assinatura digital embutida na plataforma</div>
                  </div>

                  {/* Row 2: Pay, Seguros, Cash */}
                  <div className={`p-3 rounded-lg border ${!isAddonAvailable("pay") ? "opacity-50 bg-gray-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2 sm:mb-1">
                      <Label htmlFor="pay" className="font-semibold text-sm cursor-pointer">Pay</Label>
                      <Switch
                        id="pay"
                        checked={addons.pay}
                        onCheckedChange={(checked) => setAddons({ ...addons, pay: checked })}
                        disabled={!isAddonAvailable("pay")}
                      />
                    </div>
                    <div className="text-xs text-gray-500">Boleto e Split digital embutido na plataforma</div>
                  </div>

                  <div className={`p-3 rounded-lg border ${!isAddonAvailable("seguros") ? "opacity-50 bg-gray-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2 sm:mb-1">
                      <Label htmlFor="seguros" className="font-semibold text-sm cursor-pointer">Seguros</Label>
                      <Switch
                        id="seguros"
                        checked={addons.seguros}
                        onCheckedChange={(checked) => setAddons({ ...addons, seguros: checked })}
                        disabled={!isAddonAvailable("seguros")}
                      />
                    </div>
                    <div className="text-xs text-gray-500">Seguros embutido no boleto e ganhe a partir de R$10 por contrato/mês</div>
                  </div>

                  <div className={`p-3 rounded-lg border ${!isAddonAvailable("cash") ? "opacity-50 bg-gray-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2 sm:mb-1">
                      <Label htmlFor="cash" className="font-semibold text-sm cursor-pointer">Cash</Label>
                      <Switch
                        id="cash"
                        checked={addons.cash}
                        onCheckedChange={(checked) => setAddons({ ...addons, cash: checked })}
                        disabled={!isAddonAvailable("cash")}
                      />
                    </div>
                    <div className="text-xs text-gray-500">Financie seus proprietários até 24 meses</div>
                  </div>
                </div>
              </div>

                      {/* Step 3: Business Info */}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  4. Informações do Negócio
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Imob Questions - Always visible */}
                  <Card className={`bg-blue-50/30 transition-opacity ${
                    product === "imob" || product === "both" ? "opacity-100" : "opacity-40"
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Kenlo IMOB
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="imobUsers" className="text-sm">Número de usuários</Label>
                          <Input
                            id="imobUsers"
                            type="number" inputMode="numeric"
                            value={metrics.imobUsers}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setMetrics({ ...metrics, imobUsers: Math.max(1, value) });
                            }}
                            min="1"
                            disabled={product !== "imob" && product !== "both"}
                            className={`mt-1 ${animateMetrics && (product === "imob" || product === "both") ? "metric-field-animated" : ""}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor="closings" className="text-sm">Fechamentos por mês</Label>
                          <Input
                            id="closings"
                            type="number" inputMode="numeric"
                            value={metrics.closingsPerMonth}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setMetrics({ ...metrics, closingsPerMonth: Math.max(0, value) });
                            }}
                            min="0"
                            disabled={product !== "imob" && product !== "both"}
                            className={`mt-1 ${animateMetrics && (product === "imob" || product === "both") ? "metric-field-animated" : ""}`}
                          />
                        </div>
                      </div>

                      {/* Box: Leads */}
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-800">Leads</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="leadsPerMonth" className="text-sm">Leads recebidos por mês</Label>
                            <Input
                              id="leadsPerMonth"
                              type="number" inputMode="numeric"
                              value={metrics.leadsPerMonth}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                setMetrics({ ...metrics, leadsPerMonth: Math.max(0, value) });
                              }}
                              min="0"
                              disabled={product !== "imob" && product !== "both"}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <Label htmlFor="externalAI" className="text-sm">IA SDR Externa (Ex: Lais)</Label>
                            <Switch
                              id="externalAI"
                              checked={metrics.usesExternalAI}
                              onCheckedChange={(checked) => setMetrics({ ...metrics, usesExternalAI: checked })}
                              disabled={product !== "imob" && product !== "both"}
                            />
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="whatsapp" className="text-sm">WhatsApp Integrado</Label>
                              {!metrics.usesExternalAI && (
                                <span className="text-xs text-muted-foreground">(Requer IA SDR)</span>
                              )}
                            </div>
                            <Switch
                              id="whatsapp"
                              checked={metrics.wantsWhatsApp && metrics.usesExternalAI}
                              onCheckedChange={(checked) => setMetrics({ ...metrics, wantsWhatsApp: checked })}
                              disabled={(product !== "imob" && product !== "both") || !metrics.usesExternalAI}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Box: Serviços Premium */}
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-800">Serviços Premium</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="imobVipSupport" className="text-sm">Suporte VIP</Label>
                              {(imobPlan === "k" || imobPlan === "k2") && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Incluído
                                </Badge>
                              )}
                            </div>
                            <Switch
                              id="imobVipSupport"
                              checked={metrics.imobVipSupport}
                              onCheckedChange={(checked) => setMetrics({ ...metrics, imobVipSupport: checked })}
                              disabled={product !== "imob" && product !== "both"}
                            />
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="imobDedicatedCS" className="text-sm">CS Dedicado</Label>
                              {imobPlan === "k2" && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Incluído
                                </Badge>
                              )}
                            </div>
                            <Switch
                              id="imobDedicatedCS"
                              checked={metrics.imobDedicatedCS}
                              onCheckedChange={(checked) => setMetrics({ ...metrics, imobDedicatedCS: checked })}
                              disabled={product !== "imob" && product !== "both"}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Loc Questions - Always visible */}
                  <Card className={`bg-green-50/30 transition-opacity ${
                    product === "loc" || product === "both" ? "opacity-100" : "opacity-40"
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Kenlo Locação
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="contracts" className="text-sm">Contratos sob gestão</Label>
                          <Input
                            id="contracts"
                            type="number" inputMode="numeric"
                            value={metrics.contractsUnderManagement}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setMetrics({ ...metrics, contractsUnderManagement: Math.max(1, value) });
                            }}
                            min="1"
                            disabled={product !== "loc" && product !== "both"}
                            className={`mt-1 ${animateMetrics && (product === "loc" || product === "both") ? "metric-field-animated" : ""}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor="newContracts" className="text-sm">Novos contratos por mês</Label>
                          <Input
                            id="newContracts"
                            type="number" inputMode="numeric"
                            value={metrics.newContractsPerMonth}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setMetrics({ ...metrics, newContractsPerMonth: Math.max(0, value) });
                            }}
                            min="0"
                            disabled={product !== "loc" && product !== "both"}
                            className={`mt-1 ${animateMetrics && (product === "loc" || product === "both") ? "metric-field-animated" : ""}`}
                          />
                        </div>
                      </div>

                      {/* Box: Kenlo Pay - Only shown when Pay add-on is enabled */}
                      {addons.pay && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-yellow-800">Kenlo Pay</span>
                            <a href="/parecer-juridico" target="_blank" className="text-xs text-primary hover:underline">Saiba Mais</a>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                              <Label htmlFor="chargesBoleto" className="text-sm">Cobra boleto do inquilino?</Label>
                              <Switch
                                id="chargesBoleto"
                                checked={metrics.chargesBoletoToTenant}
                                onCheckedChange={(checked) => setMetrics({ ...metrics, chargesBoletoToTenant: checked })}
                              />
                            </div>
                            {metrics.chargesBoletoToTenant && (
                              <div className="pl-2">
                                <Label htmlFor="boletoAmount" className="text-xs text-gray-600">Quanto cobra? (R$)</Label>
                                <Input
                                  id="boletoAmount"
                                  type="number" inputMode="numeric"
                                  value={metrics.boletoChargeAmount}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    setMetrics({ ...metrics, boletoChargeAmount: Math.max(0, value) });
                                  }}
                                  className="mt-1 h-8 text-sm"
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                            )}
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                              <Label htmlFor="chargesSplit" className="text-sm">Cobra split do proprietário?</Label>
                              <Switch
                                id="chargesSplit"
                                checked={metrics.chargesSplitToOwner}
                                onCheckedChange={(checked) => setMetrics({ ...metrics, chargesSplitToOwner: checked })}
                              />
                            </div>
                            {metrics.chargesSplitToOwner && (
                              <div className="pl-2">
                                <Label htmlFor="splitAmount" className="text-xs text-gray-600">Quanto cobra? (R$)</Label>
                                <Input
                                  id="splitAmount"
                                  type="number" inputMode="numeric"
                                  value={metrics.splitChargeAmount}
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    setMetrics({ ...metrics, splitChargeAmount: Math.max(0, value) });
                                  }}
                                  className="mt-1 h-8 text-sm"
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Box: Serviços Premium */}
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-800">Serviços Premium</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="locVipSupport" className="text-sm">Suporte VIP</Label>
                              {(locPlan === "k" || locPlan === "k2") && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Incluído
                                </Badge>
                              )}
                            </div>
                            <Switch
                              id="locVipSupport"
                              checked={metrics.locVipSupport}
                              onCheckedChange={(checked) => setMetrics({ ...metrics, locVipSupport: checked })}
                              disabled={product !== "loc" && product !== "both"}
                            />
                          </div>
                          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <Label htmlFor="locDedicatedCS" className="text-sm">CS Dedicado</Label>
                              {locPlan === "k2" && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                  Incluído
                                </Badge>
                              )}
                            </div>
                            <Switch
                              id="locDedicatedCS"
                              checked={metrics.locDedicatedCS}
                              onCheckedChange={(checked) => setMetrics({ ...metrics, locDedicatedCS: checked })}
                              disabled={product !== "loc" && product !== "both"}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                
                </div>
              </div>

              {/* Section 4 bis: Kombo Comparison Table */}
              <div id="kombo-comparison-section">
              <KomboComparisonTable
                product={product}
                imobPlan={imobPlan}
                locPlan={locPlan}
                addons={addons}
                frequency={frequency}
                vipSupport={metrics.imobVipSupport || metrics.locVipSupport}
                dedicatedCS={metrics.imobDedicatedCS || metrics.locDedicatedCS}
                onPlanSelected={(planId) => {
                  setSelectedPlan(planId);
                  // Auto-adjust product selection AND add-ons based on Kombo
                  if (planId && planId !== 'none') {
                    const kombo = KOMBOS[planId as keyof typeof KOMBOS];
                    if (kombo) {
                      // Set product based on Kombo requirements
                      const newProduct: ProductSelection = 
                        (planId === 'imob_start' || planId === 'imob_pro') ? 'imob' :
                        (planId === 'locacao_pro') ? 'loc' :
                        'both';
                      
                      // Trigger animation if product changed
                      if (newProduct !== prevProductRef.current) {
                        setAnimateMetrics(true);
                        setTimeout(() => setAnimateMetrics(false), 1200);
                      }
                      
                      prevProductRef.current = newProduct;
                      setProduct(newProduct);
                      
                      // AUTO-ACTIVATE required add-ons for this Kombo
                      const requiredAddons = (kombo.requiredAddons || []) as string[];
                      const forbiddenAddons = ((kombo as any).forbiddenAddons || []) as string[];
                      const maxAddons = (kombo as any).maxAddons;
                      
                      // Build new addons state
                      const newAddons = {
                        leads: requiredAddons.includes('leads') && !forbiddenAddons.includes('leads'),
                        inteligencia: requiredAddons.includes('inteligencia') && !forbiddenAddons.includes('inteligencia'),
                        assinatura: requiredAddons.includes('assinatura') && !forbiddenAddons.includes('assinatura'),
                        pay: requiredAddons.includes('pay') && !forbiddenAddons.includes('pay'),
                        seguros: requiredAddons.includes('seguros') && !forbiddenAddons.includes('seguros'),
                        cash: requiredAddons.includes('cash') && !forbiddenAddons.includes('cash'),
                      };
                      
                      // For Core Gestão (maxAddons = 0), disable all add-ons
                      if (maxAddons === 0) {
                        setAddons({
                          leads: false,
                          inteligencia: false,
                          assinatura: false,
                          pay: false,
                          seguros: false,
                          cash: false,
                        });
                      } else {
                        setAddons(newAddons);
                      }
                      
                      console.log('[Kombo Selection] Selected:', planId);
                      console.log('[Kombo Selection] Required add-ons:', requiredAddons);
                      console.log('[Kombo Selection] New add-ons state:', maxAddons === 0 ? 'all disabled' : newAddons);
                    }
                  }
                }}
                onFrequencyChange={setFrequency}
              />
              </div>


                {/* SECTION 2: CUSTOS PÓS-PAGO (VARIÁVEIS) */}
                <div className="mt-6 mb-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    5. Custos Pós-Pago - Sem surpresas, só o que você usar
                  </h2>
                  
                  <Card>
                    <CardContent className="pt-6">
                    <div>
                      {/* IMOB ADD-ONS GROUP */}
                      {(product === 'imob' || product === 'both') && (() => {
                        // Calculate IMOB subtotal
                        let imobSubtotal = 0;
                        
                        // Additional Users (only if NOT prepaid)
                        const plan = imobPlan;
                        const included = plan === 'prime' ? 2 : plan === 'k' ? 7 : 14;
                        const additional = Math.max(0, metrics.imobUsers - included);
                        if (additional > 0 && !prepayAdditionalUsers) {
                          if (plan === 'prime') imobSubtotal += additional * 57;
                          else if (plan === 'k') {
                            const tier1 = Math.min(additional, 10);
                            const tier2 = Math.max(0, additional - 10);
                            imobSubtotal += (tier1 * 47) + (tier2 * 37);
                          } else {
                            const tier1 = Math.min(additional, 10);
                            const tier2 = Math.min(Math.max(0, additional - 10), 40);
                            const tier3 = Math.max(0, additional - 50);
                            imobSubtotal += (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
                          }
                        }
                        
                        // WhatsApp Messages
                        if (addons.leads && metrics.wantsWhatsApp) {
                          const included = 100;
                          const additional = Math.max(0, metrics.leadsPerMonth - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 200);
                            const tier2 = Math.min(Math.max(0, additional - 200), 150);
                            const tier3 = Math.min(Math.max(0, additional - 350), 650);
                            const tier4 = Math.max(0, additional - 1000);
                            imobSubtotal += tier1 * 2.0 + tier2 * 1.8 + tier3 * 1.5 + tier4 * 1.2;
                          }
                        }
                        
                        if (imobSubtotal === 0) return null;
                        
                        return (
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-blue-600/30">
                              <h3 className="text-sm font-semibold text-blue-700">IMOB Add-ons</h3>
                              <span className="text-sm font-bold text-blue-700">{formatCurrency(imobSubtotal)}</span>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* IMOB Additional Users */}
                      {(product === 'imob' || product === 'both') && (() => {
                        const plan = imobPlan;
                        // Usuários inclusos: Prime 2, K 7, K2 14
                        const included = plan === 'prime' ? 2 : plan === 'k' ? 7 : 14;
                        const additional = Math.max(0, metrics.imobUsers - included);
                        const totalCost = (() => {
                          // Prime: R$57 fixo, K: 1-10=R$47/11+=R$37, K2: 1-10=R$47/11-50=R$37/51+=R$27
                          if (plan === 'prime') return additional * 57;
                          else if (plan === 'k') {
                            const tier1 = Math.min(additional, 10);
                            const tier2 = Math.max(0, additional - 10);
                            return (tier1 * 47) + (tier2 * 37);
                          } else {
                            const tier1 = Math.min(additional, 10);
                            const tier2 = Math.min(Math.max(0, additional - 10), 40);
                            const tier3 = Math.max(0, additional - 50);
                            return (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
                          }
                        })();
                        const pricePerUnit = additional > 0 ? totalCost / additional : 0;

                        // Calculate prepayment amount if applicable
                        const months = frequency === 'annual' ? 12 : frequency === 'biennial' ? 24 : 0;
                        const prepaymentAmount = prepayAdditionalUsers && months > 0 ? totalCost * months : 0;
                        const showPrepayOption = (frequency === 'annual' || frequency === 'biennial') && additional > 0;

                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Usuários Adicionais</span>
                              <span className="text-xs text-gray-500 italic">
                                Incluídos: {included} | Adicionais: {additional}
                              </span>
                              {showPrepayOption && (
                                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={prepayAdditionalUsers}
                                    onChange={(e) => setPrepayAdditionalUsers(e.target.checked)}
                                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                  />
                                  <span className="text-xs text-pink-600 font-medium">
                                    Pré-pagar {months} meses ({formatCurrency(prepaymentAmount)})
                                  </span>
                                </label>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={additional > 0 ? "text-sm font-semibold text-gray-900" : "text-sm text-green-600"}>
                                {additional > 0 ? (prepayAdditionalUsers && months > 0 ? 'Pré-pago' : formatCurrency(totalCost)) : 'Incluído no plano'}
                              </span>
                              {additional > 0 && !prepayAdditionalUsers && (
                                <span className="text-xs text-gray-500 italic">
                                  {formatCurrency(pricePerUnit, 2)}/usuário
                                </span>
                              )}
                              {prepayAdditionalUsers && months > 0 && additional > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  {formatCurrency(prepaymentAmount)} antecipado
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Leads WhatsApp */}
                      {addons.leads && metrics.wantsWhatsApp && (() => {
                        const included = 100;
                        const totalLeads = metrics.leadsPerMonth;
                        const additional = Math.max(0, totalLeads - included);
                        const totalCost = (() => {
                          const tier1 = Math.min(additional, 200);
                          const tier2 = Math.min(Math.max(0, additional - 200), 150);
                          const tier3 = Math.min(Math.max(0, additional - 350), 650);
                          const tier4 = Math.max(0, additional - 1000);
                          return (tier1 * 2.0) + (tier2 * 1.8) + (tier3 * 1.5) + (tier4 * 1.2);
                        })();
                        const pricePerUnit = additional > 0 ? totalCost / additional : 0;

                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Mensagens WhatsApp (Leads)</span>
                              <span className="text-xs text-gray-500 italic">
                                Incluídas: {included} | Adicionais: {additional}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={additional > 0 ? "text-sm font-semibold text-gray-900" : "text-sm text-green-600"}>
                                {additional > 0 ? formatCurrency(totalCost) : 'Incluído no plano'}
                              </span>
                              {additional > 0 && (
                                <span className="text-xs text-gray-500 italic">
                                  {formatCurrency(pricePerUnit, 2)}/mensagem
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* LOC ADD-ONS GROUP */}
                      {(product === 'loc' || product === 'both') && (() => {
                        // Calculate LOC subtotal
                        let locSubtotal = 0;
                        
                        // Additional Contracts (only if NOT prepaid)
                        const plan = locPlan;
                        const included = plan === 'prime' ? 100 : plan === 'k' ? 200 : 500;
                        const additional = Math.max(0, metrics.contractsUnderManagement - included);
                        if (additional > 0 && !prepayAdditionalContracts) {
                          if (plan === 'prime') locSubtotal += additional * 3;
                          else if (plan === 'k') {
                            const tier1 = Math.min(additional, 250);
                            const tier2 = Math.max(0, additional - 250);
                            locSubtotal += (tier1 * 3) + (tier2 * 2.5);
                          } else {
                            const tier1 = Math.min(additional, 250);
                            const tier2 = Math.min(Math.max(0, additional - 250), 500);
                            const tier3 = Math.max(0, additional - 750);
                            locSubtotal += (tier1 * 3) + (tier2 * 2.5) + (tier3 * 2);
                          }
                        }
                        
                        // Boletos
                        if (addons.pay && metrics.chargesBoletoToTenant) {
                          const plan = locPlan;
                          const includedBoletos = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                          const additionalBoletos = Math.max(0, metrics.contractsUnderManagement - includedBoletos);
                          if (additionalBoletos > 0) {
                            if (plan === 'prime') locSubtotal += additionalBoletos * 4;
                            else if (plan === 'k') {
                              const tier1 = Math.min(additionalBoletos, 250);
                              const tier2 = Math.max(0, additionalBoletos - 250);
                              locSubtotal += (tier1 * 4) + (tier2 * 3.5);
                            } else {
                              const tier1 = Math.min(additionalBoletos, 250);
                              const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
                              const tier3 = Math.max(0, additionalBoletos - 500);
                              locSubtotal += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                            }
                          }
                        }
                        
                        // Split
                        if (addons.pay && metrics.chargesSplitToOwner) {
                          const plan = locPlan;
                          const includedSplits = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                          const additionalSplits = Math.max(0, metrics.contractsUnderManagement - includedSplits);
                          if (additionalSplits > 0) {
                            if (plan === 'prime') locSubtotal += additionalSplits * 4;
                            else if (plan === 'k') {
                              const tier1 = Math.min(additionalSplits, 250);
                              const tier2 = Math.max(0, additionalSplits - 250);
                              locSubtotal += (tier1 * 4) + (tier2 * 3.5);
                            } else {
                              const tier1 = Math.min(additionalSplits, 250);
                              const tier2 = Math.min(Math.max(0, additionalSplits - 250), 250);
                              const tier3 = Math.max(0, additionalSplits - 500);
                              locSubtotal += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                            }
                          }
                        }
                        
                        if (locSubtotal === 0) return null;
                        
                        return (
                          <div className="mb-4 mt-6">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-pink-600/30">
                              <h3 className="text-sm font-semibold text-pink-700">LOC Add-ons</h3>
                              <span className="text-sm font-bold text-pink-700">{formatCurrency(locSubtotal)}</span>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* LOC Additional Contracts */}
                      {(product === 'loc' || product === 'both') && (() => {
                        const plan = locPlan;
                        const included = plan === 'prime' ? 100 : plan === 'k' ? 200 : 500;
                        const additional = Math.max(0, metrics.contractsUnderManagement - included);
                        const totalCost = (() => {
                          if (plan === 'prime') return additional * 3;
                          else if (plan === 'k') {
                            const tier1 = Math.min(additional, 250);
                            const tier2 = Math.max(0, additional - 250);
                            return (tier1 * 3) + (tier2 * 2.5);
                          } else {
                            const tier1 = Math.min(additional, 250);
                            const tier2 = Math.min(Math.max(0, additional - 250), 250);
                            const tier3 = Math.max(0, additional - 500);
                            return (tier1 * 3) + (tier2 * 2.5) + (tier3 * 2);
                          }
                        })();
                        const pricePerUnit = additional > 0 ? totalCost / additional : 0;

                        // Calculate prepayment amount if applicable
                        const months = frequency === 'annual' ? 12 : frequency === 'biennial' ? 24 : 0;
                        const prepaymentAmount = prepayAdditionalContracts && months > 0 ? totalCost * months : 0;
                        const showPrepayOption = (frequency === 'annual' || frequency === 'biennial') && additional > 0;

                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Contratos Adicionais</span>
                              <span className="text-xs text-gray-500 italic">
                                Incluídos: {included} | Adicionais: {additional}
                              </span>
                              {showPrepayOption && (
                                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={prepayAdditionalContracts}
                                    onChange={(e) => setPrepayAdditionalContracts(e.target.checked)}
                                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                  />
                                  <span className="text-xs text-pink-600 font-medium">
                                    Pré-pagar {months} meses ({formatCurrency(prepaymentAmount)})
                                  </span>
                                </label>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={additional > 0 ? "text-sm font-semibold text-gray-900" : "text-sm text-green-600"}>
                                {additional > 0 ? (prepayAdditionalContracts && months > 0 ? 'Pré-pago' : formatCurrency(totalCost)) : 'Incluído no plano'}
                              </span>
                              {additional > 0 && !prepayAdditionalContracts && (
                                <span className="text-xs text-gray-500 italic">
                                  {formatCurrency(pricePerUnit, 2)}/contrato
                                </span>
                              )}
                              {prepayAdditionalContracts && months > 0 && additional > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  {formatCurrency(prepaymentAmount)} antecipado
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}


                      {/* Custo Boletos (Pay) */}
                      {addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both') && (() => {
                        const plan = locPlan;
                        const includedBoletos = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                        const totalBoletos = metrics.contractsUnderManagement;
                        const additionalBoletos = Math.max(0, totalBoletos - includedBoletos);
                        
                        const totalCost = (() => {
                          if (additionalBoletos === 0) return 0;
                          if (plan === 'prime') return additionalBoletos * 4;
                          else if (plan === 'k') {
                            const tier1 = Math.min(additionalBoletos, 250);
                            const tier2 = Math.max(0, additionalBoletos - 250);
                            return (tier1 * 4) + (tier2 * 3.5);
                          } else {
                            const tier1 = Math.min(additionalBoletos, 250);
                            const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
                            const tier3 = Math.max(0, additionalBoletos - 500);
                            return (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                          }
                        })();
                        const pricePerUnit = additionalBoletos > 0 ? totalCost / additionalBoletos : 0;

                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Custo Boletos (Pay)</span>
                              <span className="text-xs text-gray-500 italic">
                                Incluídos: {includedBoletos} | Adicionais: {additionalBoletos}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={additionalBoletos > 0 ? "text-sm font-semibold text-gray-900" : "text-sm text-green-600"}>
                                {additionalBoletos > 0 ? formatCurrency(totalCost) : 'Incluído no plano'}
                              </span>
                              {additionalBoletos > 0 && (
                                <span className="text-xs text-gray-500 italic">
                                  {formatCurrency(pricePerUnit, 2)}/boleto
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Custo Split (Pay) */}
                      {addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both') && (() => {
                        const plan = locPlan;
                        const includedSplits = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                        const totalSplits = metrics.contractsUnderManagement;
                        const additionalSplits = Math.max(0, totalSplits - includedSplits);
                        
                        const totalCost = (() => {
                          if (additionalSplits === 0) return 0;
                          if (plan === 'prime') return additionalSplits * 4;
                          else if (plan === 'k') {
                            const tier1 = Math.min(additionalSplits, 250);
                            const tier2 = Math.max(0, additionalSplits - 250);
                            return (tier1 * 4) + (tier2 * 3.5);
                          } else {
                            const tier1 = Math.min(additionalSplits, 250);
                            const tier2 = Math.min(Math.max(0, additionalSplits - 250), 250);
                            const tier3 = Math.max(0, additionalSplits - 500);
                            return (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                          }
                        })();
                        const pricePerUnit = additionalSplits > 0 ? totalCost / additionalSplits : 0;

                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Custo Split (Pay)</span>
                              <span className="text-xs text-gray-500 italic">
                                Incluídos: {includedSplits} | Adicionais: {additionalSplits}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={additionalSplits > 0 ? "text-sm font-semibold text-gray-900" : "text-sm text-green-600"}>
                                {additionalSplits > 0 ? formatCurrency(totalCost) : 'Incluído no plano'}
                              </span>
                              {additionalSplits > 0 && (
                                <span className="text-xs text-gray-500 italic">
                                  {formatCurrency(pricePerUnit, 2)}/split
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}



                      {/* SHARED ADD-ONS GROUP */}
                      {(() => {
                        // Calculate Shared subtotal
                        let sharedSubtotal = 0;
                        
                        // Assinaturas
                        if (addons.assinatura) {
                          const included = 15;
                          let totalSignatures = 0;
                          if (product === 'imob') totalSignatures = metrics.closingsPerMonth;
                          else if (product === 'loc') totalSignatures = metrics.newContractsPerMonth;
                          else totalSignatures = metrics.closingsPerMonth + metrics.newContractsPerMonth;
                          
                          const additional = Math.max(0, totalSignatures - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 20);
                            const tier2 = Math.min(Math.max(0, additional - 20), 20);
                            const tier3 = Math.max(0, additional - 40);
                            sharedSubtotal += (tier1 * 1.8) + (tier2 * 1.7) + (tier3 * 1.5);
                          }
                        }
                        
                        if (!addons.assinatura) return null;
                        
                        return (
                          <div className="mb-4 mt-6">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-purple-600/30">
                              <h3 className="text-sm font-semibold text-purple-700">Add-ons Compartilhados (IMOB e LOC)</h3>
                              <span className="text-sm font-bold text-purple-700">{formatCurrency(sharedSubtotal)}</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Assinaturas */}
                      {addons.assinatura && (() => {
                        const included = 15;
                        let totalSignatures = 0;
                        if (product === 'imob') totalSignatures = metrics.closingsPerMonth;
                        else if (product === 'loc') totalSignatures = metrics.newContractsPerMonth;
                        else totalSignatures = metrics.closingsPerMonth + metrics.newContractsPerMonth;
                        const additional = Math.max(0, totalSignatures - included);
                        const totalCost = (() => {
                          const tier1 = Math.min(additional, 20);
                          const tier2 = Math.min(Math.max(0, additional - 20), 20);
                          const tier3 = Math.max(0, additional - 40);
                          return (tier1 * 1.8) + (tier2 * 1.7) + (tier3 * 1.5);
                        })();
                        const pricePerUnit = additional > 0 ? totalCost / additional : 0;

                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Assinaturas Digitais</span>
                              <span className="text-xs text-gray-500 italic">
                                Incluídas: {included} | Adicionais: {additional}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={additional > 0 ? "text-sm font-semibold text-gray-900" : "text-sm text-green-600"}>
                                {additional > 0 ? formatCurrency(totalCost) : 'Incluído no plano'}
                              </span>
                              {additional > 0 && (
                                <span className="text-xs text-gray-500 italic">
                                  {formatCurrency(pricePerUnit, 2)}/assinatura
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Support Services Costs */}
                      {(() => {
                        // Calculate support costs for IMOB
                        let imobSupportCost = 0;
                        if (product === 'imob' || product === 'both') {
                          // VIP Support: R$97/mês for Prime, free for K and K2
                          if (metrics.imobVipSupport && imobPlan === 'prime') {
                            imobSupportCost += 97;
                          }
                          // CS Dedicado: R$197/mês for Prime and K, free for K2
                          if (metrics.imobDedicatedCS && imobPlan !== 'k2') {
                            imobSupportCost += 197;
                          }
                        }
                        
                        // Calculate support costs for LOC
                        let locSupportCost = 0;
                        if (product === 'loc' || product === 'both') {
                          // VIP Support: R$97/mês for Prime, free for K and K2
                          if (metrics.locVipSupport && locPlan === 'prime') {
                            locSupportCost += 97;
                          }
                          // CS Dedicado: R$197/mês for Prime and K, free for K2
                          if (metrics.locDedicatedCS && locPlan !== 'k2') {
                            locSupportCost += 197;
                          }
                        }
                        
                        const totalSupportCost = imobSupportCost + locSupportCost;
                        
                        if (totalSupportCost === 0) return null;
                        
                        const services = [];
                        if (metrics.imobVipSupport && imobPlan === 'prime') services.push('VIP Imob');
                        if (metrics.imobDedicatedCS && imobPlan !== 'k2') services.push('CS Imob');
                        if (metrics.locVipSupport && locPlan === 'prime') services.push('VIP Loc');
                        if (metrics.locDedicatedCS && locPlan !== 'k2') services.push('CS Loc');
                        
                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Serviços de Atendimento</span>
                              <span className="text-xs text-gray-500 italic">
                                {services.join(' + ')}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(totalSupportCost)}
                              </span>
                              <span className="text-xs text-gray-500 italic">
                                VIP R$97 | CS R$197
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Total Pós-pago */}
                      {(() => {
                        let totalPostPaid = 0;
                        
                        // Support Services
                        if (product === 'imob' || product === 'both') {
                          if (metrics.imobVipSupport && imobPlan === 'prime') totalPostPaid += 97;
                          if (metrics.imobDedicatedCS && imobPlan !== 'k2') totalPostPaid += 197;
                        }
                        if (product === 'loc' || product === 'both') {
                          if (metrics.locVipSupport && locPlan === 'prime') totalPostPaid += 97;
                          if (metrics.locDedicatedCS && locPlan !== 'k2') totalPostPaid += 197;
                        }
                        
                        // Additional Users (Imob) - Prime: R$57 fixo, K: 1-10=R$47/11+=R$37, K2: 1-10=R$47/11-50=R$37/51+=R$27
                        // Skip if prepaid
                        if ((product === 'imob' || product === 'both') && !prepayAdditionalUsers) {
                          const plan = imobPlan;
                          const included = plan === 'prime' ? 2 : plan === 'k' ? 7 : 14;
                          const additional = Math.max(0, metrics.imobUsers - included);
                          if (additional > 0) {
                            if (plan === 'prime') {
                              totalPostPaid += additional * 57;
                            } else if (plan === 'k') {
                              const tier1 = Math.min(additional, 10);
                              const tier2 = Math.max(0, additional - 10);
                              totalPostPaid += (tier1 * 47) + (tier2 * 37);
                            } else {
                              const tier1 = Math.min(additional, 10);
                              const tier2 = Math.min(Math.max(0, additional - 10), 40);
                              const tier3 = Math.max(0, additional - 50);
                              totalPostPaid += (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
                            }
                          }
                        }
                        
                        // Additional Contracts (Loc)
                        // Skip if prepaid
                        if ((product === 'loc' || product === 'both') && !prepayAdditionalContracts) {
                          const plan = locPlan;
                          const included = plan === 'prime' ? 100 : plan === 'k' ? 200 : 500;
                          const additional = Math.max(0, metrics.contractsUnderManagement - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 250);
                            const tier2 = Math.min(Math.max(0, additional - 250), 500);
                            const tier3 = Math.max(0, additional - 750);
                            totalPostPaid += tier1 * 3 + tier2 * 2.5 + tier3 * 2;
                          }
                        }
                        
                        // WhatsApp Messages (Leads)
                        if (addons.leads && metrics.wantsWhatsApp) {
                          const included = 100;
                          const additional = Math.max(0, metrics.leadsPerMonth - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 200);
                            const tier2 = Math.min(Math.max(0, additional - 200), 150);
                            const tier3 = Math.min(Math.max(0, additional - 350), 650);
                            const tier4 = Math.max(0, additional - 1000);
                            totalPostPaid += tier1 * 2.0 + tier2 * 1.8 + tier3 * 1.5 + tier4 * 1.2;
                          }
                        }
                        
                        // Digital Signatures
                        if (addons.assinatura) {
                          const included = 15;
                          let totalSignatures = 0;
                          if (product === 'imob' || product === 'both') totalSignatures += metrics.closingsPerMonth;
                          if (product === 'loc' || product === 'both') totalSignatures += metrics.newContractsPerMonth;
                          const additional = Math.max(0, totalSignatures - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 30);
                            const tier2 = Math.min(Math.max(0, additional - 30), 50);
                            const tier3 = Math.max(0, additional - 80);
                            totalPostPaid += tier1 * 1.8 + tier2 * 1.5 + tier3 * 1.2;
                          }
                        }
                        
                        // Boleto costs (Pay)
                        if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
                          const plan = locPlan;
                          const includedBoletos = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                          const additionalBoletos = Math.max(0, metrics.contractsUnderManagement - includedBoletos);
                          if (additionalBoletos > 0) {
                            if (plan === 'prime') totalPostPaid += additionalBoletos * 4;
                            else if (plan === 'k') {
                              const tier1 = Math.min(additionalBoletos, 250);
                              const tier2 = Math.max(0, additionalBoletos - 250);
                              totalPostPaid += (tier1 * 4) + (tier2 * 3.5);
                            } else {
                              const tier1 = Math.min(additionalBoletos, 250);
                              const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
                              const tier3 = Math.max(0, additionalBoletos - 500);
                              totalPostPaid += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                            }
                          }
                        }
                        
                        // Split costs (Pay)
                        if (addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both')) {
                          const plan = locPlan;
                          const includedSplits = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                          const additionalSplits = Math.max(0, metrics.contractsUnderManagement - includedSplits);
                          if (additionalSplits > 0) {
                            if (plan === 'prime') totalPostPaid += additionalSplits * 4;
                            else if (plan === 'k') {
                              const tier1 = Math.min(additionalSplits, 250);
                              const tier2 = Math.max(0, additionalSplits - 250);
                              totalPostPaid += (tier1 * 4) + (tier2 * 3.5);
                            } else {
                              const tier1 = Math.min(additionalSplits, 250);
                              const tier2 = Math.min(Math.max(0, additionalSplits - 250), 250);
                              const tier3 = Math.max(0, additionalSplits - 500);
                              totalPostPaid += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                            }
                          }
                        }
                        
                        return (
                          <div className="flex justify-between items-center py-4 bg-blue-50 px-4 -mx-4 mt-2 rounded">
                            <span className="text-gray-900 font-semibold">Total Pós-pago</span>
                            <span className="text-gray-900 font-semibold">
                              {totalPostPaid > 0 ? formatCurrency(totalPostPaid) : 'R$ 0'}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Empty state if no post-paid items */}
                      {product !== 'imob' && product !== 'loc' && product !== 'both' && !addons.leads && !addons.assinatura && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Nenhum custo pós-pago aplicável com a configuração atual</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </div>



                {/* SECTION 6: KENLO RECEITA EXTRA - Only show when there are revenues */}
                {(() => {
                  // Calculate if there are any revenues
                  // Use local variable to avoid TypeScript narrowing issues
                  const currentProduct = product;
                  const hasPayRevenue = addons.pay && (metrics.chargesBoletoToTenant || metrics.chargesSplitToOwner) && (currentProduct === 'loc' || currentProduct === 'both');
                  const hasSegurosRevenue = addons.seguros && (currentProduct === 'loc' || currentProduct === 'both');
                  const hasAnyRevenue = hasPayRevenue || hasSegurosRevenue;
                  
                  if (!hasAnyRevenue) return null;
                  
                  return (
                <div className="mt-6 mb-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    6. Kenlo Receita Extra
                  </h2>
                  
                  <Card>
                    <CardContent className="pt-6">
                      {/* Receitas Category Header */}
                      {((addons.pay && (metrics.chargesBoletoToTenant || metrics.chargesSplitToOwner) && (product === 'loc' || product === 'both')) || 
                        (addons.seguros && (product === 'loc' || product === 'both'))) && (
                        <div className="py-3 bg-slate-50 -mx-6 px-6 mb-2">
                          <h3 className="text-base font-bold text-gray-900">Receitas</h3>
                        </div>
                      )}

                      {/* Boletos & Split */}
                      {addons.pay && (metrics.chargesBoletoToTenant || metrics.chargesSplitToOwner) && (product === 'loc' || product === 'both') && (
                        <div className="flex justify-between items-start py-4 border-b border-gray-200">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">Boletos & Split</span>
                            <span className="text-xs text-gray-500 italic">
                              {metrics.chargesBoletoToTenant && metrics.chargesSplitToOwner 
                                ? `${metrics.contractsUnderManagement} boletos × R$ ${metrics.boletoChargeAmount.toFixed(2)} + ${metrics.contractsUnderManagement} splits × R$ ${metrics.splitChargeAmount.toFixed(2)}`
                                : metrics.chargesBoletoToTenant 
                                  ? `${metrics.contractsUnderManagement} boletos × R$ ${metrics.boletoChargeAmount.toFixed(2)}`
                                  : `${metrics.contractsUnderManagement} splits × R$ ${metrics.splitChargeAmount.toFixed(2)}`
                              }
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-green-600">
                              +{formatCurrency((() => {
                                let revenue = 0;
                                if (metrics.chargesBoletoToTenant) {
                                  revenue += metrics.contractsUnderManagement * metrics.boletoChargeAmount;
                                }
                                if (metrics.chargesSplitToOwner) {
                                  revenue += metrics.contractsUnderManagement * metrics.splitChargeAmount;
                                }
                                return revenue;
                              })())}/mês
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Line 2: Receitas - Seguros */}
                      {addons.seguros && (product === 'loc' || product === 'both') && (
                        <div className="flex justify-between items-start py-4 border-b border-gray-200">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">Seguros</span>
                            <span className="text-xs text-gray-500 italic">R$10 por contrato/mês</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-green-600">
                              +{formatCurrency(metrics.contractsUnderManagement * 10)}/mês
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Investimentos Category Header */}
                      <div className="py-3 bg-slate-50 -mx-6 px-6 mb-2 mt-4">
                        <h3 className="text-base font-bold text-gray-900">Investimentos</h3>
                      </div>

                      {/* Mensalidade (pré-pago) */}
                      <div className="flex justify-between items-start py-4 border-b border-gray-200">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">Mensalidade (pré-pago)</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-red-600">
                            -{formatCurrency(calculateMonthlyRecurring(true))}/mês
                          </span>
                        </div>
                      </div>

                      {/* Line 4: Variável sob uso (pós-pago) */}
                      <div className="flex justify-between items-start py-4 border-b border-gray-200">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">Variável sob uso (pós-pago)</span>
                          <span className="text-xs text-gray-500 italic">Custos variáveis baseados em uso</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-red-600">-
                            {formatCurrency((() => {
                              let totalPostPaid = 0;
                              // Skip if prepaid
                              if ((product === 'imob' || product === 'both') && !prepayAdditionalUsers) {
                                const plan = imobPlan;
                                const included = plan === 'prime' ? 2 : plan === 'k' ? 7 : 14;
                                const additional = Math.max(0, metrics.imobUsers - included);
                                if (additional > 0) {
                                  if (plan === 'prime') totalPostPaid += additional * 57;
                                  else if (plan === 'k') {
                                    const tier1 = Math.min(additional, 10);
                                    const tier2 = Math.max(0, additional - 10);
                                    totalPostPaid += (tier1 * 47) + (tier2 * 37);
                                  } else {
                                    const tier1 = Math.min(additional, 10);
                                    const tier2 = Math.min(Math.max(0, additional - 10), 40);
                                    const tier3 = Math.max(0, additional - 50);
                                    totalPostPaid += (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
                                  }
                                }
                              }
                              // Skip if prepaid
                              if ((product === 'loc' || product === 'both') && !prepayAdditionalContracts) {
                                const plan = locPlan;
                                const included = plan === 'prime' ? 100 : plan === 'k' ? 200 : 500;
                                const additional = Math.max(0, metrics.contractsUnderManagement - included);
                                if (additional > 0) {
                                  if (plan === 'prime') totalPostPaid += additional * 3;
                                  else if (plan === 'k') {
                                    const tier1 = Math.min(additional, 250);
                                    const tier2 = Math.max(0, additional - 250);
                                    totalPostPaid += (tier1 * 3) + (tier2 * 2.5);
                                  } else {
                                    const tier1 = Math.min(additional, 250);
                                    const tier2 = Math.min(Math.max(0, additional - 250), 250);
                                    const tier3 = Math.max(0, additional - 500);
                                    totalPostPaid += (tier1 * 3) + (tier2 * 2.5) + (tier3 * 2);
                                  }
                              }
                            }
                            if (addons.leads && metrics.wantsWhatsApp) {
                                const included = 100;
                                const totalLeads = metrics.leadsPerMonth;
                                const additional = Math.max(0, totalLeads - included);
                                if (additional > 0) {
                                  const tier1 = Math.min(additional, 200);
                                  const tier2 = Math.min(Math.max(0, additional - 200), 150);
                                  const tier3 = Math.min(Math.max(0, additional - 350), 650);
                                  const tier4 = Math.max(0, additional - 1000);
                                  totalPostPaid += (tier1 * 2.0) + (tier2 * 1.8) + (tier3 * 1.5) + (tier4 * 1.2);
                                }
                              }
                              if (addons.assinatura) {
                                const included = 15;
                                let totalSignatures = 0;
                                if (product === 'imob') totalSignatures = metrics.closingsPerMonth;
                                else if (product === 'loc') totalSignatures = metrics.newContractsPerMonth;
                                else totalSignatures = metrics.closingsPerMonth + metrics.newContractsPerMonth;
                                const additional = Math.max(0, totalSignatures - included);
                                if (additional > 0) {
                                  const tier1 = Math.min(additional, 20);
                                  const tier2 = Math.min(Math.max(0, additional - 20), 20);
                                  const tier3 = Math.max(0, additional - 40);
                                  totalPostPaid += (tier1 * 1.8) + (tier2 * 1.7) + (tier3 * 1.5);
                                }
                              }
                              if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
                                const plan = locPlan;
                                const includedBoletos = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                                const additionalBoletos = Math.max(0, metrics.contractsUnderManagement - includedBoletos);
                                if (additionalBoletos > 0) {
                                  if (plan === 'prime') totalPostPaid += additionalBoletos * 4;
                                  else if (plan === 'k') {
                                    const tier1 = Math.min(additionalBoletos, 250);
                                    const tier2 = Math.max(0, additionalBoletos - 250);
                                    totalPostPaid += (tier1 * 4) + (tier2 * 3.5);
                                  } else {
                                    const tier1 = Math.min(additionalBoletos, 250);
                                    const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
                                    const tier3 = Math.max(0, additionalBoletos - 500);
                                    totalPostPaid += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                                  }
                                }
                              }
                              if (addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both')) {
                                const plan = locPlan;
                                const includedSplits = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                                const additionalSplits = Math.max(0, metrics.contractsUnderManagement - includedSplits);
                                if (additionalSplits > 0) {
                                  if (plan === 'prime') totalPostPaid += additionalSplits * 4;
                                  else if (plan === 'k') {
                                    const tier1 = Math.min(additionalSplits, 250);
                                    const tier2 = Math.max(0, additionalSplits - 250);
                                    totalPostPaid += (tier1 * 4) + (tier2 * 3.5);
                                  } else {
                                    const tier1 = Math.min(additionalSplits, 250);
                                    const tier2 = Math.min(Math.max(0, additionalSplits - 250), 250);
                                    const tier3 = Math.max(0, additionalSplits - 500);
                                    totalPostPaid += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                                  }
                                }
                              }
                              // Support Services
                              if (product === 'imob' || product === 'both') {
                                if (metrics.imobVipSupport && imobPlan === 'prime') totalPostPaid += 97;
                                if (metrics.imobDedicatedCS && imobPlan !== 'k2') totalPostPaid += 197;
                              }
                              if (product === 'loc' || product === 'both') {
                                if (metrics.locVipSupport && locPlan === 'prime') totalPostPaid += 97;
                                if (metrics.locDedicatedCS && locPlan !== 'k2') totalPostPaid += 197;
                              }
                              return totalPostPaid;
                            })())}/mês
                          </span>
                        </div>
                      </div>

                      {/* Line 5: TOTAL */}
                      {(() => {
                        const recurring = calculateMonthlyRecurring(true);
                        let totalPostPaid = 0;
                        // Skip if prepaid
                        if ((product === 'imob' || product === 'both') && !prepayAdditionalUsers) {
                          const plan = imobPlan;
                          const included = plan === 'prime' ? 2 : plan === 'k' ? 7 : 14;
                          const additional = Math.max(0, metrics.imobUsers - included);
                          if (additional > 0) {
                            if (plan === 'prime') totalPostPaid += additional * 57;
                            else if (plan === 'k') {
                              const tier1 = Math.min(additional, 10);
                              const tier2 = Math.max(0, additional - 10);
                              totalPostPaid += (tier1 * 47) + (tier2 * 37);
                            } else {
                              const tier1 = Math.min(additional, 10);
                              const tier2 = Math.min(Math.max(0, additional - 10), 40);
                              const tier3 = Math.max(0, additional - 50);
                              totalPostPaid += (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
                            }
                          }
                        }
                        // Skip if prepaid
                        if ((product === 'loc' || product === 'both') && !prepayAdditionalContracts) {
                          const plan = locPlan;
                          const included = plan === 'prime' ? 100 : plan === 'k' ? 200 : 500;
                          const additional = Math.max(0, metrics.contractsUnderManagement - included);
                          if (additional > 0) {
                            if (plan === 'prime') totalPostPaid += additional * 3;
                            else if (plan === 'k') {
                              const tier1 = Math.min(additional, 250);
                              const tier2 = Math.max(0, additional - 250);
                              totalPostPaid += (tier1 * 3) + (tier2 * 2.5);
                            } else {
                              const tier1 = Math.min(additional, 250);
                              const tier2 = Math.min(Math.max(0, additional - 250), 250);
                              const tier3 = Math.max(0, additional - 500);
                              totalPostPaid += (tier1 * 3) + (tier2 * 2.5) + (tier3 * 2);
                            }
                          }
                        }
                        if (addons.pay && (product === 'loc' || product === 'both')) {
                          const plan = locPlan;
                          const includedBoletos = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                          const totalBoletos = metrics.contractsUnderManagement;
                          const additionalBoletos = Math.max(0, totalBoletos - includedBoletos);
                          if (additionalBoletos > 0) {
                            if (plan === 'prime') totalPostPaid += additionalBoletos * 4;
                            else if (plan === 'k') {
                              const tier1 = Math.min(additionalBoletos, 250);
                              const tier2 = Math.max(0, additionalBoletos - 250);
                              totalPostPaid += (tier1 * 4) + (tier2 * 3.5);
                            } else {
                              const tier1 = Math.min(additionalBoletos, 250);
                              const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
                              const tier3 = Math.max(0, additionalBoletos - 500);
                              totalPostPaid += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                            }
                          }
                        }
                        if (addons.leads && metrics.wantsWhatsApp) {
                          const included = 100;
                          const totalLeads = metrics.leadsPerMonth;
                          const additional = Math.max(0, totalLeads - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 200);
                            const tier2 = Math.min(Math.max(0, additional - 200), 150);
                            const tier3 = Math.min(Math.max(0, additional - 350), 650);
                            const tier4 = Math.max(0, additional - 1000);
                            totalPostPaid += (tier1 * 2.0) + (tier2 * 1.8) + (tier3 * 1.5) + (tier4 * 1.2);
                          }
                        }
                        if (addons.assinatura) {
                          const included = 15;
                          let totalSignatures = 0;
                          if (product === 'imob') totalSignatures = metrics.closingsPerMonth;
                          else if (product === 'loc') totalSignatures = metrics.newContractsPerMonth;
                          else totalSignatures = metrics.closingsPerMonth + metrics.newContractsPerMonth;
                          const additional = Math.max(0, totalSignatures - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 20);
                            const tier2 = Math.min(Math.max(0, additional - 20), 20);
                            const tier3 = Math.max(0, additional - 40);
                            totalPostPaid += (tier1 * 1.8) + (tier2 * 1.7) + (tier3 * 1.5);
                          }
                        }
                        if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
                          const plan = locPlan;
                          const includedBoletos = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                          const additionalBoletos = Math.max(0, metrics.contractsUnderManagement - includedBoletos);
                          if (additionalBoletos > 0) {
                            if (plan === 'prime') totalPostPaid += additionalBoletos * 4;
                            else if (plan === 'k') {
                              const tier1 = Math.min(additionalBoletos, 250);
                              const tier2 = Math.max(0, additionalBoletos - 250);
                              totalPostPaid += (tier1 * 4) + (tier2 * 3.5);
                            } else {
                              const tier1 = Math.min(additionalBoletos, 250);
                              const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
                              const tier3 = Math.max(0, additionalBoletos - 500);
                              totalPostPaid += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                            }
                          }
                        }
                        if (addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both')) {
                          const plan = locPlan;
                          const includedSplits = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                          const additionalSplits = Math.max(0, metrics.contractsUnderManagement - includedSplits);
                          if (additionalSplits > 0) {
                            if (plan === 'prime') totalPostPaid += additionalSplits * 4;
                            else if (plan === 'k') {
                              const tier1 = Math.min(additionalSplits, 250);
                              const tier2 = Math.max(0, additionalSplits - 250);
                              totalPostPaid += (tier1 * 4) + (tier2 * 3.5);
                            } else {
                              const tier1 = Math.min(additionalSplits, 250);
                              const tier2 = Math.min(Math.max(0, additionalSplits - 250), 250);
                              const tier3 = Math.max(0, additionalSplits - 500);
                              totalPostPaid += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                            }
                          }
                        }
                        // Support Services
                        if (product === 'imob' || product === 'both') {
                          if (metrics.imobVipSupport && imobPlan === 'prime') totalPostPaid += 97;
                          if (metrics.imobDedicatedCS && imobPlan !== 'k2') totalPostPaid += 197;
                        }
                        if (product === 'loc' || product === 'both') {
                          if (metrics.locVipSupport && locPlan === 'prime') totalPostPaid += 97;
                          if (metrics.locDedicatedCS && locPlan !== 'k2') totalPostPaid += 197;
                        }
                        let totalRevenue = 0;
                        if (addons.pay && (product === 'loc' || product === 'both')) {
                          if (metrics.chargesBoletoToTenant) {
                            totalRevenue += metrics.contractsUnderManagement * metrics.boletoChargeAmount;
                          }
                          if (metrics.chargesSplitToOwner) {
                            totalRevenue += metrics.contractsUnderManagement * metrics.splitChargeAmount;
                          }
                        }
                        if (addons.seguros && (product === 'loc' || product === 'both')) {
                          totalRevenue += metrics.contractsUnderManagement * 10;
                        }
                        const total = totalRevenue - recurring - totalPostPaid;
                        const isProfit = total > 0;
                        
                        return (
                          <>
                            <div className="flex justify-between items-center py-4 mt-2 bg-primary/5 rounded-lg px-4">
                              <span className="text-base font-bold text-gray-900">{isProfit ? 'Ganho' : 'Investimento'}</span>
                              <span className={`text-xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(Math.abs(total))}/mês
                              </span>
                            </div>
                            
                            {/* Killer phrase */}
                            <div className="mt-4 text-center">
                              {isProfit ? (
                                <p className="text-sm font-medium text-green-700 bg-green-100 py-3 px-4 rounded-lg">
                                  Kenlo, a única plataforma que te paga enquanto você usa.
                                </p>
                              ) : (
                                <p className="text-sm font-medium text-primary bg-primary/10 py-3 px-4 rounded-lg">
                                  Kenlo, a plataforma com menor custo considerando que também te ajuda a ganhar dinheiro sem esforço.
                                </p>
                              )}
                            </div>
                            
                            {/* Footnote */}
                            <div className="mt-4 text-xs text-gray-500 italic">
                              (1) Não inclui custos de impostos.
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
                  );
                })()}

                {/* Sticky Bottom Summary Bar - Kenlo Brand Colors */}
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-t border-gray-700">
                  <div className="container py-2 sm:py-3">
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                      {/* Kombo Badge - Highlighted when active */}
          {komboInfo ? (
            <div className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1.5 rounded-full font-bold shadow-lg animate-pulse">
              {activeKombo === "core_gestao" ? (
                <>✨ {komboInfo.name} (Implantação IMOB Gratis)</>
              ) : (
                <>✨ {komboInfo.name} (-{Math.round(komboInfo.discount * 100)}%)</>
              )}
            </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="bg-primary text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
                            {product === "imob" && `Imob-${imobPlan.toUpperCase()}`}
                            {product === "loc" && `Loc-${locPlan.toUpperCase()}`}
                            {product === "both" && `Imob-${imobPlan.toUpperCase()} + Loc-${locPlan.toUpperCase()}`}
                          </div>
                          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            ✓ Recomendado
                            {product === "imob" && metrics.imobUsers > 0 && (
                              <span className="ml-1">para {metrics.imobUsers} usuários</span>
                            )}
                            {product === "loc" && metrics.contractsUnderManagement > 0 && (
                              <span className="ml-1">para {metrics.contractsUnderManagement} contratos</span>
                            )}
                            {product === "both" && (
                              <span className="ml-1">para seu volume</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Kombo Recommendation Banner */}
                      {komboRecommendation && (
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
                          💡 {komboRecommendation.message}
                        </div>
                      )}

                      {/* Add-ons Badge */}
                      {(() => {
                        const selectedAddons = [];
                        if (addons.leads) selectedAddons.push('Leads');
                        if (addons.inteligencia) selectedAddons.push('BI');
                        if (addons.assinatura) selectedAddons.push('Assinatura');
                        if (addons.pay) selectedAddons.push('Pay');
                        if (addons.seguros) selectedAddons.push('Seguros');
                        if (addons.cash) selectedAddons.push('Cash');
                        return selectedAddons.length > 0 && (
                          <div className="bg-secondary/80 text-white px-3 py-1.5 rounded-full font-medium">
                            Add-ons: {selectedAddons.join(', ')}
                          </div>
                        );
                      })()}

                      {/* Frequency Badge */}
                      <div className="bg-gray-700/60 text-gray-100 px-3 py-1.5 rounded-full font-medium border border-gray-600/50">
                        {frequency === 'monthly' && 'Mensal (0%)'}
                        {frequency === 'semestral' && 'Semestral (-15%)'}
                        {frequency === 'annual' && 'Anual (-20%)'}
                        {frequency === 'biennial' && 'Bienal (-25%)'}
                      </div>

                      {/* IMOB Metrics Badge */}
                      {(product === "imob" || product === "both") && (
                        <div className="bg-gray-700/60 text-gray-100 px-3 py-1.5 rounded-full font-medium border border-gray-600/50">
                          IMOB: {metrics.imobUsers}u, {metrics.closingsPerMonth}f/m
                        </div>
                      )}

                      {/* LOC Metrics Badge */}
                      {(product === "loc" || product === "both") && (
                        <div className="bg-gray-700/60 text-gray-100 px-3 py-1.5 rounded-full font-medium border border-gray-600/50">
                          LOC: {metrics.contractsUnderManagement}c, {metrics.newContractsPerMonth}n/m
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions - Always visible with validation feedback */}
                <div className="flex flex-col gap-3 mt-6 mb-24">
                  {selectedPlan && canExportPDF && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Plano selecionado! Agora você pode exportar a proposta.
                      </span>
                    </div>
                  )}
                  {canExportPDF && !selectedPlan && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Selecione um plano ou Kombo na tabela acima para exportar a cotação.
                      </span>
                    </div>
                  )}
                  {!canExportPDF && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <Key className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">
                        Para exportar cotações, faça login como vendedor autorizado.
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      className="flex-1 min-h-[50px]" 
                      size="lg" 
                      onClick={() => {
                        if (!canExportPDF) {
                          toast.error("Faça login como vendedor autorizado para pré-visualizar.");
                          return;
                        }
                        if (!selectedPlan) {
                          toast.error("Selecione um plano ou Kombo antes de pré-visualizar.");
                          const komboSection = document.getElementById('kombo-comparison-section');
                          if (komboSection) {
                            komboSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                          return;
                        }
                        setShowPreviewDialog(true);
                      }}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Pré-visualizar Dados
                    </Button>
                    <Button 
                      className="flex-1 min-h-[50px]" 
                      size="lg" 
                      onClick={() => {
                        if (!canExportPDF) {
                          toast.error("Faça login como vendedor autorizado para exportar cotações.");
                          return;
                        }
                        if (!isBusinessNatureComplete()) {
                          toast.error("Por favor, responda todas as perguntas obrigatórias sobre a natureza do negócio (Tem site? Já usa CRM? Já usa ERP?).");
                          const businessNatureSection = document.getElementById('business-nature-section');
                          if (businessNatureSection) {
                            businessNatureSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                          return;
                        }
                        if (!selectedPlan) {
                          toast.error("Selecione um plano ou Kombo antes de exportar a cotação.");
                          const komboSection = document.getElementById('kombo-comparison-section');
                          if (komboSection) {
                            komboSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                          return;
                        }
                        setShowQuoteInfoDialog(true);
                      }}
                      variant={selectedPlan && canExportPDF ? "default" : "outline"}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Cotação (PDF)
                    </Button>
                  </div>
                </div>

            </CardContent>
          </Card>
        </div>


        
        {/* Preview Data Dialog */}
        <PreviewDataDialog
          open={showPreviewDialog}
          onOpenChange={setShowPreviewDialog}
          data={{
            businessNature,
            product,
            imobPlan,
            locPlan,
            komboName: activeKombo !== "none" ? KOMBOS[activeKombo].name : undefined,
            komboDiscount: activeKombo !== "none" ? KOMBOS[activeKombo].discount : undefined,
            frequency,
            addons,
            totals: {
              monthly: calculateMonthlyRecurring(activeKombo !== "none"),
              annual: calculateMonthlyRecurring(activeKombo !== "none") * 12,
              implantation: calculateTotalImplementation(activeKombo !== "none"),
              postPaid: calculatePayPostPago(),
              firstYear: calculateFirstYearTotal(activeKombo !== "none"),
            },
          }}
          onConfirm={() => {
            setShowPreviewDialog(false);
            setShowQuoteInfoDialog(true);
          }}
        />

        {/* Quote Info Dialog */}
        <QuoteInfoDialog
          open={showQuoteInfoDialog}
          onOpenChange={setShowQuoteInfoDialog}
          paymentFrequency={frequency}
          onSubmit={async (quoteInfo) => {
            setPendingQuoteInfo(quoteInfo);
            setShowQuoteInfoDialog(false);
            
            // Generate PDF with all quote info
            {
              // Generate PDF with all quote info
              try {
                toast.loading("Gerando PDF...");
                
                // Get selected addons as array
                const selectedAddons = Object.entries(addons)
                  .filter(([_, enabled]) => enabled)
                  .map(([name, _]) => name);

                // Calculate totals
                const items = getLineItems();
                const totalMonthly = items.reduce((sum: number, item: any) => sum + (activeKombo !== "none" ? item.priceComKombo : item.priceSemKombo), 0);
                const totalAnnual = totalMonthly * 12;
                const implantationFee = calculateTotalImplementation(activeKombo !== "none");
                const firstYearTotal = totalAnnual + implantationFee;
                
                // Calculate post-paid total (same logic as before)
                let postPaidTotal = 0;
                
                // Support Services
                if (product === 'imob' || product === 'both') {
                  if (metrics.imobVipSupport && imobPlan === 'prime') postPaidTotal += 97;
                  if (metrics.imobDedicatedCS && imobPlan !== 'k2') postPaidTotal += 197;
                }
                if (product === 'loc' || product === 'both') {
                  if (metrics.locVipSupport && locPlan === 'prime') postPaidTotal += 97;
                  if (metrics.locDedicatedCS && locPlan !== 'k2') postPaidTotal += 197;
                }
                
                // Additional Users (Imob) - Skip if prepaid
                if ((product === 'imob' || product === 'both') && !prepayAdditionalUsers) {
                  const plan = imobPlan;
                  const included = plan === 'prime' ? 2 : plan === 'k' ? 7 : 14;
                  const additional = Math.max(0, metrics.imobUsers - included);
                  if (additional > 0) {
                    if (plan === 'prime') {
                      postPaidTotal += additional * 57;
                    } else if (plan === 'k') {
                      const tier1 = Math.min(additional, 10);
                      const tier2 = Math.max(0, additional - 10);
                      postPaidTotal += (tier1 * 47) + (tier2 * 37);
                    } else {
                      const tier1 = Math.min(additional, 10);
                      const tier2 = Math.min(Math.max(0, additional - 10), 40);
                      const tier3 = Math.max(0, additional - 50);
                      postPaidTotal += (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
                    }
                  }
                }
                
                // Additional Contracts (Loc) - Skip if prepaid
                if ((product === 'loc' || product === 'both') && !prepayAdditionalContracts) {
                  const plan = locPlan;
                  const included = plan === 'prime' ? 100 : plan === 'k' ? 200 : 500;
                  const additional = Math.max(0, metrics.contractsUnderManagement - included);
                  if (additional > 0) {
                    const tier1 = Math.min(additional, 250);
                    const tier2 = Math.min(Math.max(0, additional - 250), 500);
                    const tier3 = Math.max(0, additional - 750);
                    postPaidTotal += tier1 * 3 + tier2 * 2.5 + tier3 * 2;
                  }
                }
                
                // WhatsApp Messages (Leads)
                if (addons.leads && metrics.wantsWhatsApp) {
                  const included = 100;
                  const additional = Math.max(0, metrics.leadsPerMonth - included);
                  if (additional > 0) {
                    const tier1 = Math.min(additional, 200);
                    const tier2 = Math.min(Math.max(0, additional - 200), 150);
                    const tier3 = Math.min(Math.max(0, additional - 350), 650);
                    const tier4 = Math.max(0, additional - 1000);
                    postPaidTotal += tier1 * 2.0 + tier2 * 1.8 + tier3 * 1.5 + tier4 * 1.2;
                  }
                }
                
                // Digital Signatures
                if (addons.assinatura) {
                  const included = 15;
                  let totalSignatures = 0;
                  if (product === 'imob' || product === 'both') totalSignatures += metrics.closingsPerMonth;
                  if (product === 'loc' || product === 'both') totalSignatures += metrics.newContractsPerMonth;
                  const additional = Math.max(0, totalSignatures - included);
                  if (additional > 0) {
                    const tier1 = Math.min(additional, 30);
                    const tier2 = Math.min(Math.max(0, additional - 30), 50);
                    const tier3 = Math.max(0, additional - 80);
                    postPaidTotal += tier1 * 1.8 + tier2 * 1.5 + tier3 * 1.2;
                  }
                }
                
                // Boleto costs (Pay)
                if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
                  const plan = locPlan;
                  const includedBoletos = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                  const additionalBoletos = Math.max(0, metrics.contractsUnderManagement - includedBoletos);
                  if (additionalBoletos > 0) {
                    if (plan === 'prime') postPaidTotal += additionalBoletos * 4;
                    else if (plan === 'k') {
                      const tier1 = Math.min(additionalBoletos, 250);
                      const tier2 = Math.max(0, additionalBoletos - 250);
                      postPaidTotal += (tier1 * 4) + (tier2 * 3.5);
                    } else {
                      const tier1 = Math.min(additionalBoletos, 250);
                      const tier2 = Math.min(Math.max(0, additionalBoletos - 250), 250);
                      const tier3 = Math.max(0, additionalBoletos - 500);
                      postPaidTotal += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                    }
                  }
                }
                
                // Split costs (Pay)
                if (addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both')) {
                  const plan = locPlan;
                  const includedSplits = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                  const additionalSplits = Math.max(0, metrics.contractsUnderManagement - includedSplits);
                  if (additionalSplits > 0) {
                    if (plan === 'prime') postPaidTotal += additionalSplits * 4;
                    else if (plan === 'k') {
                      const tier1 = Math.min(additionalSplits, 250);
                      const tier2 = Math.max(0, additionalSplits - 250);
                      postPaidTotal += (tier1 * 4) + (tier2 * 3.5);
                    } else {
                      const tier1 = Math.min(additionalSplits, 250);
                      const tier2 = Math.min(Math.max(0, additionalSplits - 250), 250);
                      const tier3 = Math.max(0, additionalSplits - 500);
                      postPaidTotal += (tier1 * 4) + (tier2 * 3.5) + (tier3 * 3);
                    }
                  }
                }
                
                // Kenlo Receita Extra
                let revenueFromBoletos = 0;
                if (addons.pay && (product === 'loc' || product === 'both')) {
                  if (metrics.chargesBoletoToTenant) {
                    revenueFromBoletos += metrics.contractsUnderManagement * metrics.boletoChargeAmount;
                  }
                  if (metrics.chargesSplitToOwner) {
                    revenueFromBoletos += metrics.contractsUnderManagement * metrics.splitChargeAmount;
                  }
                }
                
                const revenueFromInsurance = (addons.seguros && (product === 'loc' || product === 'both'))
                  ? metrics.contractsUnderManagement * 10
                  : 0;
                const netGain = revenueFromBoletos + revenueFromInsurance - totalMonthly - (postPaidTotal || 0);

                // Calculate prepayment amounts
                const prepayment = calculatePrepaymentAmount();
                const prepaymentMonths = frequency === 'annual' ? 12 : frequency === 'biennial' ? 24 : 0;

                // ============================================
                // VALIDATION: Verify add-ons compatibility
                // ============================================
                const compatibleAddons: string[] = [];
                const incompatibleAddons: string[] = [];
                
                // Define which add-ons are compatible with each product
                const imobCompatible = ['leads', 'inteligencia', 'assinatura'];
                const locCompatible = ['pay', 'seguros', 'cash', 'inteligencia', 'assinatura'];
                
                selectedAddons.forEach((addon: string) => {
                  let isCompatible = false;
                  
                  if (product === 'imob') {
                    isCompatible = imobCompatible.includes(addon);
                  } else if (product === 'loc') {
                    isCompatible = locCompatible.includes(addon);
                  } else if (product === 'both') {
                    isCompatible = true; // All add-ons compatible with both products
                  }
                  
                  if (isCompatible) {
                    compatibleAddons.push(addon);
                  } else {
                    incompatibleAddons.push(addon);
                  }
                });
                
                // Log validation results
                console.log('[PDF Validation] Product:', product);
                console.log('[PDF Validation] Selected add-ons:', selectedAddons);
                console.log('[PDF Validation] Compatible add-ons:', compatibleAddons);
                console.log('[PDF Validation] Incompatible add-ons:', incompatibleAddons);
                
                // Alert user if there are incompatible add-ons
                if (incompatibleAddons.length > 0) {
                  const addonNames: Record<string, string> = {
                    leads: 'Leads',
                    inteligencia: 'Inteligência',
                    assinatura: 'Assinatura',
                    pay: 'Pay',
                    seguros: 'Seguros',
                    cash: 'Cash',
                  };
                  const incompatibleNames = incompatibleAddons.map(a => addonNames[a] || a).join(', ');
                  toast.error(
                    `Add-ons incompatíveis detectados: ${incompatibleNames}. ` +
                    `Estes add-ons não são compatíveis com o produto selecionado (${product.toUpperCase()}).`
                  );
                  return; // Stop PDF generation
                }
                
                // Validate WhatsApp dependency
                if (metrics.wantsWhatsApp && !addons.leads && !metrics.usesExternalAI) {
                  toast.error('WhatsApp Integrado requer Leads ou IA SDR Externa ativa.');
                  return;
                }
                
                // Validate Premium Services logic
                // ALL Kombos include Premium Services (VIP + CS Dedicado) for free
                const hasPremiumIncluded = 
                  (komboInfo?.name === 'Kombo Imob Start' ||
                   komboInfo?.name === 'Kombo Core Gestão' || 
                   komboInfo?.name === 'Kombo Elite' ||
                   komboInfo?.name === 'Kombo Imob Pro' ||
                   komboInfo?.name === 'Kombo Locação Pro');
                
                const premiumServicesPrice = hasPremiumIncluded ? 0 : 
                  ((metrics.imobVipSupport || metrics.locVipSupport) ? 97 : 0) +
                  ((metrics.imobDedicatedCS || metrics.locDedicatedCS) ? 197 : 0);

                const proposalData = {
                  salesPersonName: quoteInfo.vendorName,
                  vendorEmail: quoteInfo.vendorEmail,
                  vendorPhone: quoteInfo.vendorPhone,
                  vendorRole: quoteInfo.vendorRole,
                  clientName: businessNature.ownerName,
                  agencyName: businessNature.companyName,
                  productType: product,
                  komboName: komboInfo?.name,
                  komboDiscount: komboInfo ? Math.round(komboInfo.discount * 100) : undefined,
                  imobPlan: (product === "imob" || product === "both") ? imobPlan : undefined,
                  locPlan: (product === "loc" || product === "both") ? locPlan : undefined,
                  imobUsers: metrics.imobUsers,
                  closings: metrics.closingsPerMonth,
                  contracts: metrics.contractsUnderManagement,
                  newContracts: metrics.newContractsPerMonth,
                  leadsPerMonth: metrics.leadsPerMonth,
                  usesExternalAI: metrics.usesExternalAI,
                  wantsWhatsApp: metrics.wantsWhatsApp,
                  chargesSplitToOwner: metrics.chargesSplitToOwner,
                  selectedAddons: JSON.stringify(compatibleAddons), // Use validated compatible add-ons only
                  paymentPlan: frequency,
                  totalMonthly,
                  totalAnnual,
                  implantationFee,
                  firstYearTotal,
                  postPaidTotal,
                  revenueFromBoletos,
                  revenueFromInsurance,
                  netGain,
                  // Pre-payment fields
                  prepayAdditionalUsers: prepayAdditionalUsers,
                  prepayAdditionalContracts: prepayAdditionalContracts,
                  prepaymentUsersAmount: prepayment.users,
                  prepaymentContractsAmount: prepayment.contracts,
                  prepaymentMonths: prepaymentMonths,
                  // Premium services - ALL Kombos include Premium Services for free
                  hasPremiumServices: hasPremiumIncluded || 
                    ((metrics.imobVipSupport || metrics.locVipSupport) && 
                    (metrics.imobDedicatedCS || metrics.locDedicatedCS)),
                  premiumServicesPrice: premiumServicesPrice,
                  // Installment options (from QuoteInfoDialog)
                  installments: quoteInfo.installments,
                };

                // Generate PDF
                const pdfResult = await generatePDF.mutateAsync(proposalData);
                
                if (pdfResult.success && pdfResult.pdf) {
                  // Download PDF
                  const pdfBlob = new Blob(
                    [Uint8Array.from(atob(pdfResult.pdf), c => c.charCodeAt(0))],
                    { type: "application/pdf" }
                  );
                  const url = URL.createObjectURL(pdfBlob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = pdfResult.filename;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);

                  // Save to proposals database
                  await createProposal.mutateAsync(proposalData);
                  
                  // Also save to quotes database for tracking
                  try {
                    await saveQuoteMutation.mutateAsync({
                      action: "pdf_exported",
                      product: product,
                      imobPlan: product !== "loc" ? imobPlan : undefined,
                      locPlan: product !== "imob" ? locPlan : undefined,
                      frequency: frequency,
                      addons: JSON.stringify(addons),
                      metrics: JSON.stringify(metrics),
                      totals: JSON.stringify({
                        monthly: totalMonthly,
                        annual: totalAnnual,
                        implantation: implantationFee,
                        postPaid: postPaidTotal,
                        firstYear: firstYearTotal,
                      }),
                      komboId: activeKombo !== "none" ? activeKombo : undefined,
                      komboName: activeKombo !== "none" ? KOMBOS[activeKombo]?.name : undefined,
                      komboDiscount: activeKombo !== "none" ? Math.round((KOMBOS[activeKombo]?.discount || 0) * 100) : undefined,
                      clientName: businessNature.ownerName,
                      vendorName: quoteInfo.vendorName,
                      salespersonId: quoteInfo.salespersonId,
                      agencyName: businessNature.companyName,
                      cellPhone: businessNature.cellphone,
                      landlinePhone: businessNature.landline,
                      websiteUrl: businessNature.hasWebsite ? businessNature.websiteUrl : "Cliente não tem site ainda",
                      // Business Nature fields
                      businessType: businessNature.businessType,
                      email: businessNature.email,
                      hasCRM: businessNature.hasCRM ? 1 : 0,
                      crmSystem: businessNature.hasCRM ? businessNature.crmSystem : undefined,
                      crmOther: businessNature.hasCRM && businessNature.crmSystem === "Outro" ? businessNature.crmOther : undefined,
                      hasERP: businessNature.hasERP ? 1 : 0,
                      erpSystem: businessNature.hasERP ? businessNature.erpSystem : undefined,
                      erpOther: businessNature.hasERP && businessNature.erpSystem === "Outro" ? businessNature.erpOther : undefined,
                    });
                  } catch (quoteError) {
                    console.error('Failed to save quote:', quoteError);
                  }
                  
                  toast.dismiss();
                  toast.success("Proposta gerada e salva com sucesso!");
                }
              } catch (error) {
                toast.dismiss();
                toast.error("Erro ao gerar proposta. Tente novamente.");
                console.error("Error generating proposal:", error);
              }
            }
          }}
        />
      </div>
  );
}
