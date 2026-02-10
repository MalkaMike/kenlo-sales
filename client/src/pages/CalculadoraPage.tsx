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
import { downloadProposalPDF } from "@/utils/generateProposalPDF";
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
  Shuffle,
  Loader2,
  Check,
  FileText,
  ChevronUp,
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
    includesPremiumServices: true, // INCLUI VIP + CS Dedicado (V9 update)
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
    requiredAddons: ["leads", "inteligencia", "assinatura", "pay", "seguros"], // ALL add-ons (Cash removed)
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
  // null = not yet answered (user must explicitly select Sim or Não)
  const isBusinessNatureComplete = (): boolean => {
    // Website question is mandatory for Corretora or Ambos
    if (businessNature.businessType === "broker" || businessNature.businessType === "both") {
      if (businessNature.hasWebsite === null) return false;
      if (businessNature.hasWebsite && businessNature.websiteUrl === "") return false;
    }
    
    // CRM is mandatory for Corretora or Ambos
    if (businessNature.businessType === "broker" || businessNature.businessType === "both") {
      if (businessNature.hasCRM === null) return false;
      if (businessNature.hasCRM && businessNature.crmSystem === "") return false;
    }
    
    // ERP is mandatory for Administrador de Aluguel or Ambos
    if (businessNature.businessType === "rental_admin" || businessNature.businessType === "both") {
      if (businessNature.hasERP === null) return false;
      if (businessNature.hasERP && businessNature.erpSystem === "") return false;
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
    hasWebsite: null as boolean | null,
    websiteUrl: "",
    hasCRM: null as boolean | null,
    crmSystem: "" as CRMSystem | "",
    crmOther: "",
    hasERP: null as boolean | null,
    erpSystem: "" as ERPSystem | "",
    erpOther: "",
  });
  
  // Validation state - when true, shows red borders on empty required fields
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Step 1: Product selection - Default: IMOB only
  const [product, setProduct] = useState<ProductSelection>("imob");
  
  // Step 2: Add-ons (all 6 add-ons) - All DISABLED by default
  const [addons, setAddons] = useState({
    leads: true,
    inteligencia: true, // BI/Analytics
    assinatura: true, // Digital signature
    pay: true,
    seguros: true,
    cash: true,
  });

  // Helper: Convert empty string metrics to numbers for calculations (CEO Verdict Round 2)
  // Also handles arbitrary strings (e.g., currency-formatted "R$ 10,00" during typing)
  const toNum = (val: number | string): number => {
    if (typeof val === "number") return val;
    if (val === "" || val == null) return 0;
    // Try parsing as currency string first (handles "R$ 10,00" format)
    const cleaned = String(val).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Helper: Validate and parse integer-only input (strips non-numeric, rounds decimals)
  const parseIntegerInput = (value: string, min: number = 0): number | "" => {
    if (value === "") return "";
    // Strip all non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");
    if (cleaned === "") return "";
    // Parse and round to integer
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return "";
    return Math.max(min, Math.round(parsed));
  };

  // Helper: Parse currency string to number (e.g., "R$ 10,00" → 10, "1.234,50" → 1234.5)
  const parseCurrency = (value: string): number => {
    // Remove currency symbol, spaces, and convert comma to dot
    const cleaned = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Step 3: Metrics (conditional based on product) - Start empty (CEO Verdict Round 2)
  const [metrics, setMetrics] = useState({
    // Imob metrics - empty by default, user must enter values
    imobUsers: "" as number | "",
    closingsPerMonth: "" as number | "",
    leadsPerMonth: "" as number | "",  // Number of leads received per month for WhatsApp calculation
    usesExternalAI: false,
    wantsWhatsApp: false,  // WhatsApp disabled by default
    imobVipSupport: false,  // VIP Support for IMOB
    imobDedicatedCS: false, // Dedicated CS for IMOB
    
    // Loc metrics - empty by default, user must enter values
    contractsUnderManagement: "" as number | "",
    newContractsPerMonth: "" as number | "",
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
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);
  const prevProductRef = useRef<ProductSelection>(product);
  const configSectionRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  
  // tRPC mutations for PDF generation and proposal creation
  const generatePDF = trpc.proposals.generatePDF.useMutation();
  const createProposal = trpc.proposals.create.useMutation();

  // Recommended plans (user-selected, can be overridden)
  const [imobPlan, setImobPlan] = useState<PlanTier>("k");
  const [locPlan, setLocPlan] = useState<PlanTier>("k");
  // System-recommended plans (computed from metrics, used for badge display)
  const [recommendedImobPlan, setRecommendedImobPlan] = useState<PlanTier>("k");
  const [recommendedLocPlan, setRecommendedLocPlan] = useState<PlanTier>("k");

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
      hasWebsite: null,
      websiteUrl: "",
      hasCRM: null,
      crmSystem: "",
      crmOther: "",
      hasERP: null,
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
    setRecommendedImobPlan("k");
    setRecommendedLocPlan("k");
  }, []);

  // Generate 3 random example PDFs directly (bypasses UI state, calls API directly)
  const handleGenerate3Examples = useCallback(async () => {
    if (!canExportPDF) {
      toast.error("Faça login como vendedor autorizado para gerar exemplos.");
      return;
    }
    
    setIsGeneratingExamples(true);
    toast.loading("Gerando 3 exemplos aleatórios...");
    
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randBool = () => Math.random() > 0.5;
    
    const companyNames = [
      "Imobiliária Sol Nascente", "Rede Imóveis Premium", "Casa & Lar Imóveis",
      "Horizonte Imobiliária", "Ponto Certo Imóveis", "Alpha Gestão Imobiliária",
      "Morada Real Imóveis", "Viva Imóveis", "Central Imobiliária", "Top House Imóveis",
    ];
    const ownerNames = [
      "Carlos Mendes", "Ana Beatriz Costa", "Roberto Almeida",
      "Fernanda Oliveira", "Marcos Pereira", "Juliana Santos",
      "Pedro Henrique Lima", "Camila Rodrigues", "Lucas Ferreira",
    ];
    const frequencies: PaymentFrequency[] = ["monthly", "semestral", "annual", "biennial"];
    const businessTypes = ["broker", "rental_admin", "both"] as const;
    // Plan selection based on user/contract count
    const planForImobUsers = (users: number): PlanTier => {
      if (users <= 4) return "prime";
      if (users <= 15) return "k";
      return "k2";
    };
    const planForLocContracts = (contracts: number): PlanTier => {
      if (contracts <= 199) return "prime";
      if (contracts <= 499) return "k";
      return "k2";
    };
    
    // Define possible kombo configurations
    const komboConfigs = [
      { product: "imob" as ProductSelection, addons: ["leads", "assinatura"], komboId: "imob_start", komboName: "Kombo Imob Start", discount: 10 },
      { product: "imob" as ProductSelection, addons: ["leads", "inteligencia", "assinatura"], komboId: "imob_pro", komboName: "Kombo Imob Pro", discount: 15 },
      { product: "loc" as ProductSelection, addons: ["inteligencia", "assinatura"], komboId: "locacao_pro", komboName: "Kombo Locação Pro", discount: 10 },
      { product: "both" as ProductSelection, addons: [] as string[], komboId: "core_gestao", komboName: "Kombo Core Gestão", discount: 0 },
      { product: "both" as ProductSelection, addons: ["leads", "inteligencia", "assinatura", "pay", "seguros"], komboId: "elite", komboName: "Kombo Elite", discount: 20 },
      // No kombo scenarios
      { product: "imob" as ProductSelection, addons: ["leads"], komboId: null, komboName: undefined, discount: 0 },
      { product: "loc" as ProductSelection, addons: ["pay", "seguros"], komboId: null, komboName: undefined, discount: 0 },
      { product: "both" as ProductSelection, addons: ["leads", "assinatura", "pay"], komboId: null, komboName: undefined, discount: 0 },
    ];
    
    let successCount = 0;
    
    for (let i = 0; i < 3; i++) {
      try {
        const config = pick(komboConfigs);
        const freq = pick(frequencies);
        const company = pick(companyNames);
        const owner = pick(ownerNames);
        const bizType = pick([...businessTypes]);
        
        // Random metrics (must be before plan derivation)
        const imobUsers = randInt(2, 30);
        const closings = randInt(2, 20);
        const leadsMonth = randInt(50, 500);
        const contracts = randInt(50, 800);
        const newContracts = randInt(2, 25);
        
        // Derive plans from metrics (validated)
        const iplan = planForImobUsers(imobUsers);
        const lplan = planForLocContracts(contracts);
        const wantsWA = config.addons.includes("leads") ? randBool() : false;
        const chargesBoleto = config.addons.includes("pay") ? randBool() : false;
        const chargesSplit = config.addons.includes("pay") ? randBool() : false;
        const boletoAmt = chargesBoleto ? pick([5, 7.5, 8.5, 10, 12]) : 0;
        const splitAmt = chargesSplit ? pick([5, 8, 10, 12, 15]) : 0;
        
        // Calculate prices
        const freqMult = PAYMENT_FREQUENCY_MULTIPLIERS[freq];
        const discountMult = config.komboId ? (1 - config.discount / 100) : 1;
        
        let totalMonthly = 0;
        
        // IMOB plan price
        if (config.product === "imob" || config.product === "both") {
          const basePrice = PLAN_ANNUAL_PRICES[iplan];
          totalMonthly += roundToEndIn7(basePrice * freqMult * discountMult);
        }
        // LOC plan price
        if (config.product === "loc" || config.product === "both") {
          const basePrice = PLAN_ANNUAL_PRICES[lplan];
          totalMonthly += roundToEndIn7(basePrice * freqMult * discountMult);
        }
        // Add-on prices
        for (const addon of config.addons) {
          const addonPrice = ADDON_ANNUAL_PRICES[addon as keyof typeof ADDON_ANNUAL_PRICES] || 0;
          if (addonPrice > 0) {
            totalMonthly += roundToEndIn7(addonPrice * freqMult * discountMult);
          }
        }
        
        const totalAnnual = totalMonthly * 12;
        const implantationFee = config.komboId ? 1497 : (
          (config.product === "imob" || config.product === "both" ? 1497 : 0) +
          (config.product === "loc" || config.product === "both" ? 1497 : 0)
        );
        const firstYearTotal = totalAnnual + implantationFee;
        
        // Calculate individual line item prices for the Investimento table
        let imobPrice = 0;
        let locPrice = 0;
        const addonPricesObj: Record<string, number> = {};
        
        if (config.product === "imob" || config.product === "both") {
          imobPrice = roundToEndIn7(PLAN_ANNUAL_PRICES[iplan] * freqMult * discountMult);
        }
        if (config.product === "loc" || config.product === "both") {
          locPrice = roundToEndIn7(PLAN_ANNUAL_PRICES[lplan] * freqMult * discountMult);
        }
        for (const addon of config.addons) {
          const ap = ADDON_ANNUAL_PRICES[addon as keyof typeof ADDON_ANNUAL_PRICES] || 0;
          if (ap > 0) {
            addonPricesObj[addon] = roundToEndIn7(ap * freqMult * discountMult);
          }
        }

        // VIP/CS: included in all Kombos, otherwise random
        const vipIncluded = !!config.komboId;
        const csIncluded = !!config.komboId;
        const vipPrice = vipIncluded ? 0 : 0; // Only if user toggles VIP
        const csPrice = csIncluded ? 0 : 0;

        // Calculate realistic post-paid breakdown
        let postPaidTotal = 0;
        const ppBreakdown: {
          imobAddons?: { groupLabel: string; groupTotal: number; items: any[] };
          locAddons?: { groupLabel: string; groupTotal: number; items: any[] };
          sharedAddons?: { groupLabel: string; groupTotal: number; items: any[] };
          total: number;
        } = { total: 0 };

        // IMOB: Additional Users (V9)
        if (config.product === "imob" || config.product === "both") {
          const included = iplan === "prime" ? 2 : iplan === "k" ? 5 : 10;
          const additional = Math.max(0, imobUsers - included);
          if (additional > 0) {
            let userCost = 0;
            if (iplan === "prime") userCost = additional * 57;
            else if (iplan === "k") {
              const t1 = Math.min(additional, 5);
              const t2 = Math.max(0, additional - 5);
              userCost = t1 * 47 + t2 * 37;
            } else {
              const t1 = Math.min(additional, 10);
              const t2 = Math.min(Math.max(0, additional - 10), 90);
              const t3 = Math.max(0, additional - 100);
              userCost = t1 * 37 + t2 * 27 + t3 * 17;
            }
            postPaidTotal += userCost;
            if (!ppBreakdown.imobAddons) ppBreakdown.imobAddons = { groupLabel: "IMOB", groupTotal: 0, items: [] };
            ppBreakdown.imobAddons.items.push({
              label: "Usuários Adicionais",
              included,
              additional,
              total: userCost,
              perUnit: iplan === "prime" ? 57 : iplan === "k" ? 47 : 37,
              unitLabel: "usuário",
            });
            ppBreakdown.imobAddons.groupTotal += userCost;
          }
        }

        // LOC: Additional Contracts (V9: K included 150)
        if (config.product === "loc" || config.product === "both") {
          const included = lplan === "prime" ? 100 : lplan === "k" ? 150 : 500;
          const additional = Math.max(0, contracts - included);
          if (additional > 0) {
            let contractCost = 0;
            if (lplan === "prime") {
              contractCost = additional * 3;
            } else if (lplan === "k") {
              const t1 = Math.min(additional, 250);
              const t2 = Math.max(0, additional - 250);
              contractCost = t1 * 3 + t2 * 2.5;
            } else {
              const t1 = Math.min(additional, 250);
              const t2 = Math.min(Math.max(0, additional - 250), 250);
              const t3 = Math.max(0, additional - 500);
              contractCost = t1 * 3 + t2 * 2.5 + t3 * 2;
            }
            postPaidTotal += contractCost;
            if (!ppBreakdown.locAddons) ppBreakdown.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
            ppBreakdown.locAddons.items.push({
              label: "Contratos Adicionais",
              included,
              additional,
              total: contractCost,
              perUnit: 3,
              unitLabel: "contrato",
            });
            ppBreakdown.locAddons.groupTotal += contractCost;
          }

          // Boleto costs (V9: tiered by plan)
          if (chargesBoleto && config.addons.includes("pay")) {
            const inclBoletos = lplan === "prime" ? 2 : lplan === "k" ? 5 : 15;
            const addBoletos = Math.max(0, contracts - inclBoletos);
            if (addBoletos > 0) {
              let boletoCost = 0;
              if (lplan === "prime") {
                boletoCost = addBoletos * 4;
              } else if (lplan === "k") {
                const bt1 = Math.min(addBoletos, 250);
                const bt2 = Math.max(0, addBoletos - 250);
                boletoCost = bt1 * 4 + bt2 * 3.5;
              } else {
                const bt1 = Math.min(addBoletos, 250);
                const bt2 = Math.min(Math.max(0, addBoletos - 250), 250);
                const bt3 = Math.max(0, addBoletos - 500);
                boletoCost = bt1 * 4 + bt2 * 3.5 + bt3 * 3;
              }
              postPaidTotal += boletoCost;
              if (!ppBreakdown.locAddons) ppBreakdown.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
              ppBreakdown.locAddons.items.push({
                label: "Custo Boletos (Pay)",
                included: inclBoletos,
                additional: addBoletos,
                total: boletoCost,
                perUnit: 4,
                unitLabel: "boleto",
              });
              ppBreakdown.locAddons.groupTotal += boletoCost;
            }
          }

          // Split costs (V9: tiered by plan, same as boleto)
          if (chargesSplit && config.addons.includes("pay")) {
            const inclSplits = lplan === "prime" ? 2 : lplan === "k" ? 5 : 15;
            const addSplits = Math.max(0, contracts - inclSplits);
            if (addSplits > 0) {
              let splitCost = 0;
              if (lplan === "prime") {
                splitCost = addSplits * 4;
              } else if (lplan === "k") {
                const st1 = Math.min(addSplits, 250);
                const st2 = Math.max(0, addSplits - 250);
                splitCost = st1 * 4 + st2 * 3.5;
              } else {
                const st1 = Math.min(addSplits, 250);
                const st2 = Math.min(Math.max(0, addSplits - 250), 250);
                const st3 = Math.max(0, addSplits - 500);
                splitCost = st1 * 4 + st2 * 3.5 + st3 * 3;
              }
              postPaidTotal += splitCost;
              if (!ppBreakdown.locAddons) ppBreakdown.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
              ppBreakdown.locAddons.items.push({
                label: "Custo Split (Pay)",
                included: inclSplits,
                additional: addSplits,
                total: splitCost,
                perUnit: 4,
                unitLabel: "split",
              });
              ppBreakdown.locAddons.groupTotal += splitCost;
            }
          }
        }

        // Shared: Digital Signatures (V9: tiered pricing)
        if (config.addons.includes("assinatura")) {
          const included = 15;
          let totalSigs = 0;
          if (config.product === "imob" || config.product === "both") totalSigs += closings;
          if (config.product === "loc" || config.product === "both") totalSigs += newContracts;
          const additional = Math.max(0, totalSigs - included);
          if (additional > 0) {
            // V9: 1-20 = R$1.80, 21-40 = R$1.70, 41+ = R$1.50
            const st1 = Math.min(additional, 20);
            const st2 = Math.min(Math.max(0, additional - 20), 20);
            const st3 = Math.max(0, additional - 40);
            const sigCost = st1 * 1.8 + st2 * 1.7 + st3 * 1.5;
            postPaidTotal += sigCost;
            if (!ppBreakdown.sharedAddons) ppBreakdown.sharedAddons = { groupLabel: "Add-ons Compartilhados (IMOB + LOC)", groupTotal: 0, items: [] };
            ppBreakdown.sharedAddons.items.push({
              label: "Assinaturas Digitais (compartilhado)",
              included,
              additional,
              total: sigCost,
              perUnit: 1.8,
              unitLabel: "assinatura",
            });
            ppBreakdown.sharedAddons.groupTotal += sigCost;
          }
        }

        // WhatsApp Messages (V9: tiered pricing)
        if (config.addons.includes("leads") && wantsWA) {
          const included = 100;
          const additional = Math.max(0, leadsMonth - included);
          if (additional > 0) {
            // V9: 1-200 = R$2, 201-350 = R$1.80, 351-1000 = R$1.50, 1001+ = R$1.20
            const wt1 = Math.min(additional, 200);
            const wt2 = Math.min(Math.max(0, additional - 200), 150);
            const wt3 = Math.min(Math.max(0, additional - 350), 650);
            const wt4 = Math.max(0, additional - 1000);
            const waCost = wt1 * 2 + wt2 * 1.8 + wt3 * 1.5 + wt4 * 1.2;
            postPaidTotal += waCost;
            if (!ppBreakdown.sharedAddons) ppBreakdown.sharedAddons = { groupLabel: "Add-ons Compartilhados (IMOB + LOC)", groupTotal: 0, items: [] };
            ppBreakdown.sharedAddons.items.push({
              label: "Mensagens WhatsApp",
              included,
              additional,
              total: waCost,
              perUnit: 2,
              unitLabel: "msg",
            });
            ppBreakdown.sharedAddons.groupTotal += waCost;
          }
        }

        ppBreakdown.total = postPaidTotal;
        
        // Revenue
        const revenueFromBoletos = (chargesBoleto || chargesSplit) && (config.product === "loc" || config.product === "both")
          ? contracts * (boletoAmt + splitAmt)
          : 0;
        const revenueFromInsurance = config.addons.includes("seguros") && (config.product === "loc" || config.product === "both")
          ? contracts * 10
          : 0;
        const netGain = revenueFromBoletos + revenueFromInsurance - totalMonthly - postPaidTotal;
        
        const installments = pick([1, 2, 3]);
        
        const proposalData = {
          salesPersonName: "Vendedor Exemplo",
          vendorEmail: "vendedor@kenlo.com.br",
          vendorPhone: "(11) 99999-0000",
          vendorRole: "Executivo(a) de Vendas",
          clientName: owner,
          agencyName: company,
          productType: config.product,
          komboName: config.komboName,
          komboDiscount: config.discount > 0 ? config.discount : undefined,
          imobPlan: (config.product === "imob" || config.product === "both") ? iplan : undefined,
          locPlan: (config.product === "loc" || config.product === "both") ? lplan : undefined,
          imobUsers,
          closings,
          contracts,
          newContracts,
          leadsPerMonth: leadsMonth,
          usesExternalAI: false,
          wantsWhatsApp: wantsWA,
          chargesSplitToOwner: chargesSplit,
          chargesBoletoToTenant: chargesBoleto,
          boletoAmount: boletoAmt,
          splitAmount: splitAmt,
          monthlyLicenseBase: totalMonthly,
          selectedAddons: JSON.stringify(config.addons),
          paymentPlan: freq,
          totalMonthly,
          totalAnnual,
          implantationFee,
          firstYearTotal,
          postPaidTotal,
          revenueFromBoletos,
          revenueFromInsurance,
          netGain,
          prepayAdditionalUsers: false,
          prepayAdditionalContracts: false,
          prepaymentUsersAmount: 0,
          prepaymentContractsAmount: 0,
          prepaymentMonths: 0,
          hasPremiumServices: !!config.komboId,
          premiumServicesPrice: 0,
          installments,
          businessType: bizType,
          // New V8 fields
          imobPrice: imobPrice > 0 ? imobPrice : undefined,
          locPrice: locPrice > 0 ? locPrice : undefined,
          addonPrices: Object.keys(addonPricesObj).length > 0 ? JSON.stringify(addonPricesObj) : undefined,
          vipIncluded,
          csIncluded,
          vipPrice,
          csPrice,
          postPaidBreakdown: JSON.stringify(ppBreakdown),
        };
        
        const pdfResult = await generatePDF.mutateAsync(proposalData);
        
        if (pdfResult.success && pdfResult.pdf) {
          const pdfBlob = new Blob(
            [Uint8Array.from(atob(pdfResult.pdf), (c) => c.charCodeAt(0))],
            { type: "application/pdf" }
          );
          const url = URL.createObjectURL(pdfBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Exemplo_${i + 1}_${company.replace(/\s+/g, "_")}_${config.komboId || "sem_kombo"}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          successCount++;
        }
        
        // Small delay between downloads so browser doesn't block them
        if (i < 2) await new Promise(r => setTimeout(r, 1500));
        
      } catch (error) {
        console.error(`Erro ao gerar exemplo ${i + 1}:`, error);
      }
    }
    
    toast.dismiss();
    setIsGeneratingExamples(false);
    
    if (successCount === 3) {
      toast.success(`${successCount} PDFs de exemplo gerados com sucesso!`);
    } else if (successCount > 0) {
      toast.success(`${successCount} de 3 PDFs gerados. Alguns falharam.`);
    } else {
      toast.error("Falha ao gerar exemplos. Verifique o login.");
    }
  }, [canExportPDF, generatePDF]);

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
    params.set('ba', String(toNum(metrics.boletoChargeAmount)));
    params.set('sa', String(toNum(metrics.splitChargeAmount)));
    
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
    
    // Elite: IMOB + LOC + ALL required add-ons (leads, inteligencia, assinatura, pay, seguros)
    if (product === "both") {
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
    
    // Usuários incluídos por plano (V9)
    // Prime: 2 usuários, K: 5 usuários, K2: 10 usuários
    const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
    const additional = Math.max(0, users - included);
    
    // Custo de usuários adicionais (V9)
    // Prime: R$57 fixo por usuário
    // K: 1-5 = R$47, 6+ = R$37
    // K2: 1-10 = R$37, 11-100 = R$27, 101+ = R$17
    let additionalCost = 0;
    if (additional > 0) {
      if (plan === 'prime') {
        // Prime: R$57 fixo por usuário adicional
        additionalCost = additional * 57;
      } else if (plan === 'k') {
        // K: 1-5 = R$47, 6+ = R$37
        const tier1 = Math.min(additional, 5);
        const tier2 = Math.max(0, additional - 5);
        additionalCost = (tier1 * 47) + (tier2 * 37);
      } else {
        // K2: 1-10 = R$37, 11-100 = R$27, 101+ = R$17
        const tier1 = Math.min(additional, 10);
        const tier2 = Math.min(Math.max(0, additional - 10), 90); // 11-100 (90 usuários)
        const tier3 = Math.max(0, additional - 100);
        additionalCost = (tier1 * 37) + (tier2 * 27) + (tier3 * 17);
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
    
    // Contratos incluídos por plano (V9)
    // Prime: 100, K: 150, K2: 500
    const included = plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
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
  // This sets BOTH the user-selected plan AND the recommended plan tracker
  useEffect(() => {
    if (product === "imob" || product === "both") {
      const users = toNum(metrics.imobUsers);
      
      // IMOB: Baseado em número de usuários (V9)
      // Prime: 1-4 usuários
      // K: 5-15 usuários
      // K2: 16+ usuários
      let recommended: PlanTier = 'prime';
      
      if (users >= 16) {
        recommended = 'k2';
      } else if (users >= 5) {
        recommended = 'k';
      } else {
        recommended = 'prime';
      }
      
      setRecommendedImobPlan(recommended);
      setImobPlan(recommended);
    }

    if (product === "loc" || product === "both") {
      const contracts = toNum(metrics.contractsUnderManagement);
      
      // LOC: Baseado em número de contratos (V9)
      // Prime: 1-199 contratos
      // K: 200-499 contratos
      // K2: 500+ contratos
      let recommended: PlanTier = 'prime';
      
      if (contracts >= 500) {
        recommended = 'k2';
      } else if (contracts >= 200) {
        recommended = 'k';
      } else {
        recommended = 'prime';
      }
      
      setRecommendedLocPlan(recommended);
      setLocPlan(recommended);
    }
  }, [metrics.imobUsers, metrics.contractsUnderManagement, product]);

  // Auto-activate Suporte Premium and CS Dedicado based on HIGHEST plan across products (V9 rules)
  // HIGHEST-PLAN-WINS: Benefits are determined by the highest plan across IMOB and LOCAÇÃO.
  // Plan hierarchy: K2 > K > Prime
  // - Suporte VIP: Included (locked ON) for K and K2, Optional (paid R$97) for Prime
  // - CS Dedicado: Included (locked ON) for K2, NOT AVAILABLE for K, Optional (paid R$197) for Prime
  // - Benefits apply to the ENTIRE account, not per-product
  useEffect(() => {
    setMetrics(prev => {
      const newMetrics = { ...prev };
      
      // Determine the highest plan across all selected products
      const planRank = { prime: 0, k: 1, k2: 2 };
      let highestPlan: PlanTier = "prime";
      
      if (product === "imob" || product === "both") {
        if (planRank[imobPlan] > planRank[highestPlan]) highestPlan = imobPlan;
      }
      if (product === "loc" || product === "both") {
        if (planRank[locPlan] > planRank[highestPlan]) highestPlan = locPlan;
      }
      
      // Apply benefits based on highest plan (account-wide)
      const vipIncluded = highestPlan === "k" || highestPlan === "k2";
      const csIncluded = highestPlan === "k2";
      
      // Set both products to the same benefit state (account-wide)
      newMetrics.imobVipSupport = vipIncluded;
      newMetrics.locVipSupport = vipIncluded;
      newMetrics.imobDedicatedCS = csIncluded;
      newMetrics.locDedicatedCS = csIncluded;
      
      return newMetrics;
    });
  }, [imobPlan, locPlan, product]);

  // WhatsApp and IA SDR are mutually exclusive - cannot both be ON at the same time

  // Pre-select product based on businessType from §1
  // Corretora → imob, Administrador → loc, Ambos → both
  // User can always override this pre-selection in §2 (Solução e Plano Recomendados)
  useEffect(() => {
    const bt = businessNature.businessType;
    if (bt === "broker") {
      setProduct("imob");
    } else if (bt === "rental_admin") {
      setProduct("loc");
    } else if (bt === "both") {
      setProduct("both");
    }
  }, [businessNature.businessType]);

  // Scroll observer for sticky summary bar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when config section scrolls out of view
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    if (configSectionRef.current) {
      observer.observe(configSectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

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
      const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
      const additional = Math.max(0, toNum(metrics.imobUsers) - included);
      if (additional > 0) {
        let monthlyCost = 0;
        if (plan === 'prime') monthlyCost = additional * 57;
        else if (plan === 'k') {
          // K: 1-5 = R$47, 6+ = R$37
          const tier1 = Math.min(additional, 5);
          const tier2 = Math.max(0, additional - 5);
          monthlyCost = (tier1 * 47) + (tier2 * 37);
        } else {
          // K2: 1-10 = R$37, 11-100 = R$27, 101+ = R$17
          const tier1 = Math.min(additional, 10);
          const tier2 = Math.min(Math.max(0, additional - 10), 90);
          const tier3 = Math.max(0, additional - 100);
          monthlyCost = (tier1 * 37) + (tier2 * 27) + (tier3 * 17);
        }
        usersPrepayment = monthlyCost * months;
      }
    }

    // Calculate additional contracts cost (LOC)
    if ((product === 'loc' || product === 'both') && prepayAdditionalContracts) {
      const plan = locPlan;
      const included = plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
      const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
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
    const monthlyVolume = toNum(metrics.contractsUnderManagement) * avgRent;
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

  const formatCurrency = (value: number, decimals: number = 2) => {
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
    monthly: "+25%",
    semestral: "+11%",
    annual: "0% - Referência",
    biennial: "-10%",
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 sm:py-12 px-4 sm:px-6">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Cotação Kenlo
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Veja o investimento ideal para sua imobiliária — em tempo real
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resetar
            </Button>
          </div>

          {/* Main Calculator Card */}
          <Card className="shadow-xl">
            <CardContent className="p-4 sm:p-6">

              {/* Step 0: Business Nature */}
              <div id="business-nature-section" className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Natureza do Negócio</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-1.5 mb-4">
                      {([
                        { value: "broker", label: "Corretora" },
                        { value: "rental_admin", label: "Administradora" },
                        { value: "both", label: "Ambos" },
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setBusinessNature(prev => ({
                              ...prev,
                              businessType: opt.value as BusinessType,
                              // Reset questions to null when changing business type
                              hasWebsite: null,
                              websiteUrl: "",
                              hasCRM: null,
                              crmSystem: "" as CRMSystem | "",
                              crmOther: "",
                              hasERP: null,
                              erpSystem: "" as ERPSystem | "",
                              erpOther: "",
                            }));
                          }}
                          className={`px-4 py-2 text-sm rounded-lg transition-all border ${
                            businessNature.businessType === opt.value
                              ? "bg-primary text-white font-semibold border-primary shadow-sm"
                              : "bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Conditional questions based on business type */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Tem site? - Show for Corretora or Ambos */}
                      {(businessNature.businessType === "broker" || businessNature.businessType === "both") && (
                        <div>
                          <Label className={`text-sm font-medium mb-2 block ${showValidationErrors && businessNature.hasWebsite === null ? "text-red-600" : ""}`}>Tem site? *</Label>
                          <div className={`flex items-center gap-2 mb-2 ${showValidationErrors && businessNature.hasWebsite === null ? "ring-1 ring-red-500 rounded-md p-1" : ""}`}>
                            <button
                              onClick={() => setBusinessNature({ ...businessNature, hasWebsite: true })}
                              className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                businessNature.hasWebsite === true
                                  ? "bg-green-50 text-green-700 border-green-300 font-semibold"
                                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setBusinessNature({ ...businessNature, hasWebsite: false, websiteUrl: "" })}
                              className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                businessNature.hasWebsite === false
                                  ? "bg-red-50 text-red-700 border-red-300 font-semibold"
                                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              Não
                            </button>
                            {businessNature.hasWebsite === null && (
                              <span className="text-[10px] text-amber-600 italic">Selecione</span>
                            )}
                          </div>
                          {businessNature.hasWebsite === true && (
                            <Input
                              value={businessNature.websiteUrl}
                              onChange={(e) => setBusinessNature({ ...businessNature, websiteUrl: e.target.value })}
                              placeholder="https://www.imobiliaria.com.br"
                              className="text-sm"
                            />
                          )}
                        </div>
                      )}

                      {/* Tem CRM? - Show for Corretora or Ambos */}
                      {(businessNature.businessType === "broker" || businessNature.businessType === "both") && (
                        <div>
                          <Label className={`text-sm font-medium mb-2 block ${showValidationErrors && businessNature.hasCRM === null ? "text-red-600" : ""}`}>Já usa CRM? *</Label>
                          <div className={`flex items-center gap-2 mb-2 ${showValidationErrors && businessNature.hasCRM === null ? "ring-1 ring-red-500 rounded-md p-1" : ""}`}>
                            <button
                              onClick={() => setBusinessNature({ ...businessNature, hasCRM: true })}
                              className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                businessNature.hasCRM === true
                                  ? "bg-green-50 text-green-700 border-green-300 font-semibold"
                                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setBusinessNature({ ...businessNature, hasCRM: false, crmSystem: "" as CRMSystem | "", crmOther: "" })}
                              className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                businessNature.hasCRM === false
                                  ? "bg-red-50 text-red-700 border-red-300 font-semibold"
                                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              Não
                            </button>
                            {businessNature.hasCRM === null && (
                              <span className="text-[10px] text-amber-600 italic">Selecione</span>
                            )}
                          </div>
                          {businessNature.hasCRM === true && (
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

                      {/* Tem ERP? - Show for Administradora or Ambos */}
                      {(businessNature.businessType === "rental_admin" || businessNature.businessType === "both") && (
                        <div>
                          <Label className={`text-sm font-medium mb-2 block ${showValidationErrors && businessNature.hasERP === null ? "text-red-600" : ""}`}>Já usa ERP? *</Label>
                          <div className={`flex items-center gap-2 mb-2 ${showValidationErrors && businessNature.hasERP === null ? "ring-1 ring-red-500 rounded-md p-1" : ""}`}>
                            <button
                              onClick={() => setBusinessNature({ ...businessNature, hasERP: true })}
                              className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                businessNature.hasERP === true
                                  ? "bg-green-50 text-green-700 border-green-300 font-semibold"
                                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setBusinessNature({ ...businessNature, hasERP: false, erpSystem: "" as ERPSystem | "", erpOther: "" })}
                              className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                                businessNature.hasERP === false
                                  ? "bg-red-50 text-red-700 border-red-300 font-semibold"
                                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              Não
                            </button>
                            {businessNature.hasERP === null && (
                              <span className="text-[10px] text-amber-600 italic">Selecione</span>
                            )}
                          </div>
                          {businessNature.hasERP === true && (
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

                  {/* Company Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName" className={`text-sm font-semibold mb-2 block ${showValidationErrors && !businessNature.companyName.trim() ? "text-red-600" : ""}`}>Nome da Imobiliária *</Label>
                      <Input
                        id="companyName"
                        value={businessNature.companyName}
                        onChange={(e) => setBusinessNature({ ...businessNature, companyName: e.target.value })}
                        placeholder="Ex: Imobiliária XYZ"
                        className={showValidationErrors && !businessNature.companyName.trim() ? "border-red-500 ring-1 ring-red-500" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerName" className={`text-sm font-semibold mb-2 block ${showValidationErrors && !businessNature.ownerName.trim() ? "text-red-600" : ""}`}>Nome do Proprietário *</Label>
                      <Input
                        id="ownerName"
                        value={businessNature.ownerName}
                        onChange={(e) => setBusinessNature({ ...businessNature, ownerName: e.target.value })}
                        placeholder="Ex: João Silva"
                        className={showValidationErrors && !businessNature.ownerName.trim() ? "border-red-500 ring-1 ring-red-500" : ""}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="email" className={`text-sm font-semibold mb-2 block ${showValidationErrors && !businessNature.email.trim() ? "text-red-600" : ""}`}>Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={businessNature.email}
                        onChange={(e) => setBusinessNature({ ...businessNature, email: e.target.value })}
                        placeholder="contato@imobiliaria.com"
                        className={showValidationErrors && !businessNature.email.trim() ? "border-red-500 ring-1 ring-red-500" : ""}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cellphone" className={`text-sm font-semibold mb-2 block ${showValidationErrors && !businessNature.cellphone.trim() ? "text-red-600" : ""}`}>Celular *</Label>
                      <Input
                        id="cellphone"
                        value={businessNature.cellphone}
                        onChange={(e) => setBusinessNature({ ...businessNature, cellphone: e.target.value })}
                        placeholder="(11) 98765-4321"
                        className={showValidationErrors && !businessNature.cellphone.trim() ? "border-red-500 ring-1 ring-red-500" : ""}
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

                  </CardContent>
                </Card>
              </div>


              {/* §1+2: Configuração Compacta (Merged: Informações do Negócio + Nossa Recomendação + Product selection) */}
              <div className="mb-4" ref={configSectionRef}>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Configuração</h2>
                <Card>
                  <CardContent className="pt-4">
                
                {/* Product filter: left-aligned, directly above config cards (CEO Verdict Round 2) */}
                <div className="flex items-center gap-1.5 mb-3">
                  {["imob", "loc", "both"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setProduct(opt as ProductSelection)}
                      className={`px-4 py-2 text-sm rounded-lg transition-all border ${
                        product === opt
                          ? "bg-primary text-white font-semibold border-primary shadow-sm"
                          : "bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {opt === "imob" ? "Imob" : opt === "loc" ? "Locação" : "Ambos"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {/* Left: Metrics */}
                  {(product === "imob" || product === "both") && (
                    <Card className="bg-blue-50/20 border-blue-200/40">
                      <CardContent className="pt-3 pb-3 space-y-2">
                        <div className="flex items-center gap-1.5 mb-2">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-semibold text-xs text-gray-900">Kenlo IMOB</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <Label htmlFor="imobUsers" className="text-xs text-gray-600">Usuários</Label>
                            <div className="relative">
                              <Input
                                id="imobUsers"
                                type="number"
                                inputMode="numeric"
                                value={metrics.imobUsers}
                                onChange={(e) => {
                                  const parsed = parseIntegerInput(e.target.value, 1);
                                  setMetrics({ ...metrics, imobUsers: parsed });
                                }}
                                placeholder="Ex: 5 usuários"
                                min="1"
                                className="mt-0.5 h-8 text-xs pr-8"
                              />
                              {toNum(metrics.imobUsers) >= 1 && (
                                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="closings" className="text-xs text-gray-600">Fechamentos/mês</Label>
                            <div className="relative">
                              <Input
                                id="closings"
                                type="number"
                                inputMode="numeric"
                                value={metrics.closingsPerMonth}
                                onChange={(e) => {
                                  const parsed = parseIntegerInput(e.target.value, 0);
                                  setMetrics({ ...metrics, closingsPerMonth: parsed });
                                }}
                                placeholder="Ex: 10"
                                min="0"
                                className="mt-0.5 h-8 text-xs pr-8"
                              />
                              {toNum(metrics.closingsPerMonth) > 0 && (
                                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="leadsPerMonth" className="text-xs text-gray-600">Leads/mês</Label>
                            <div className="relative">
                              <Input
                                id="leadsPerMonth"
                                type="number"
                                inputMode="numeric"
                                value={metrics.leadsPerMonth}
                                onChange={(e) => {
                                  const parsed = parseIntegerInput(e.target.value, 0);
                                  setMetrics({ ...metrics, leadsPerMonth: parsed });
                                }}
                                placeholder="Ex: 500"
                                min="0"
                                className="mt-0.5 h-8 text-xs pr-8"
                              />
                              {toNum(metrics.leadsPerMonth) > 0 && (
                                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between p-1.5 bg-white rounded border border-blue-100">
                              <Label htmlFor="externalAI" className="text-[10px] text-gray-600">IA SDR</Label>
                              <Switch
                                id="externalAI"
                                checked={metrics.usesExternalAI}
                                onCheckedChange={(checked) => setMetrics({ ...metrics, usesExternalAI: checked, ...(checked ? { wantsWhatsApp: false } : {}) })}
                                className="scale-75"
                              />
                            </div>
                            <div className="flex items-center justify-between p-1.5 bg-white rounded border border-blue-100">
                              <Label htmlFor="whatsapp" className="text-[10px] text-gray-600">WhatsApp</Label>
                              <Switch
                                id="whatsapp"
                                checked={metrics.wantsWhatsApp}
                                onCheckedChange={(checked) => setMetrics({ ...metrics, wantsWhatsApp: checked, ...(checked ? { usesExternalAI: false } : {}) })}
                                className="scale-75"
                              />
                            </div>
                          </div>
                        </div>
                        {/* Plan selector inline */}
                        <div className="pt-2 border-t border-blue-200/40">
                          <div className="text-[10px] text-gray-500 mb-1.5">Plano</div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(["prime", "k", "k2"] as const).map((plan) => {
                              const isSelected = imobPlan === plan;
                              const isRecommended = recommendedImobPlan === plan;
                              return (
                                <button
                                  key={plan}
                                  onClick={() => setImobPlan(plan)}
                                  className={`p-2 rounded border transition-all text-center ${
                                    isSelected
                                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                      : "border-gray-200 hover:border-gray-300 bg-white"
                                  }`}
                                >
                                  <div className="font-bold text-xs">{plan === "prime" ? "Prime" : plan.toUpperCase()}</div>
                                </button>
                              );
                            })}
                          </div>
                          {/* Allowance + Overage (CEO Verdict Round 2) */}
                          <div className="mt-2 text-[10px] text-gray-600 leading-relaxed">
                            {imobPlan === "prime" && "Inclui até 2 usuários · Usuários adicionais cobrados conforme tabela"}
                            {imobPlan === "k" && "Inclui até 5 usuários · Usuários adicionais cobrados conforme tabela"}
                            {imobPlan === "k2" && "Inclui até 10 usuários · Usuários adicionais cobrados conforme tabela"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(product === "loc" || product === "both") && (
                    <Card className="bg-green-50/20 border-green-200/40">
                      <CardContent className="pt-3 pb-3 space-y-2">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Key className="w-3.5 h-3.5 text-green-600" />
                          <span className="font-semibold text-xs text-gray-900">Kenlo Locação</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <Label htmlFor="contracts" className="text-xs text-gray-600">Contratos</Label>
                            <div className="relative">
                              <Input
                                id="contracts"
                                type="number"
                                inputMode="numeric"
                                value={metrics.contractsUnderManagement}
                                onChange={(e) => {
                                  const parsed = parseIntegerInput(e.target.value, 1);
                                  setMetrics({ ...metrics, contractsUnderManagement: parsed });
                                }}
                                placeholder="Ex: 1200 contratos"
                                min="1"
                                className="mt-0.5 h-8 text-xs pr-8"
                              />
                              {toNum(metrics.contractsUnderManagement) >= 1 && (
                                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="newContracts" className="text-xs text-gray-600">Novos/mês</Label>
                            <div className="relative">
                              <Input
                                id="newContracts"
                                type="number"
                                inputMode="numeric"
                                value={metrics.newContractsPerMonth}
                                onChange={(e) => {
                                  const parsed = parseIntegerInput(e.target.value, 0);
                                  setMetrics({ ...metrics, newContractsPerMonth: parsed });
                                }}
                                placeholder="Ex: 50"
                                min="0"
                                className="mt-0.5 h-8 text-xs pr-8"
                              />
                              {toNum(metrics.newContractsPerMonth) > 0 && (
                                <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.25 w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Plan selector inline */}
                        <div className="pt-2 border-t border-green-200/40">
                          <div className="text-[10px] text-gray-500 mb-1.5">Plano</div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(["prime", "k", "k2"] as const).map((plan) => {
                              const isSelected = locPlan === plan;
                              const isRecommended = recommendedLocPlan === plan;
                              return (
                                <button
                                  key={plan}
                                  onClick={() => setLocPlan(plan)}
                                  className={`p-2 rounded border transition-all text-center ${
                                    isSelected
                                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                      : "border-gray-200 hover:border-gray-300 bg-white"
                                  }`}
                                >
                                  <div className="font-bold text-xs">{plan === "prime" ? "Prime" : plan.toUpperCase()}</div>
                                </button>
                              );
                            })}
                          </div>
                          {/* Allowance + Overage (CEO Verdict Round 2) */}
                          <div className="mt-2 text-[10px] text-gray-600 leading-relaxed">
                            {locPlan === "prime" && "Inclui até 100 contratos · Contratos adicionais cobrados conforme uso"}
                            {locPlan === "k" && "Inclui até 150 contratos · Contratos adicionais cobrados conforme uso"}
                            {locPlan === "k2" && "Inclui até 500 contratos · Contratos adicionais cobrados conforme uso"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                  </CardContent>
                </Card>
              </div>


              {/* §3: Benefícios Inclusos — HIGHEST-PLAN-WINS across products */}
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Benefícios Inclusos
                </h2>
                <Card>
                  <CardContent className="pt-4">
                
                {/* Compute highest plan once for the whole section */}
                {(() => {
                  const planRank = { prime: 0, k: 1, k2: 2 };
                  let highestPlan: PlanTier = "prime";
                  if (product === "imob" || product === "both") {
                    if (planRank[imobPlan] > planRank[highestPlan]) highestPlan = imobPlan;
                  }
                  if (product === "loc" || product === "both") {
                    if (planRank[locPlan] > planRank[highestPlan]) highestPlan = locPlan;
                  }
                  
                  const vipIncluded = highestPlan === "k" || highestPlan === "k2";
                  const csIncluded = highestPlan === "k2";
                  const isPrimeOnly = highestPlan === "prime";
                  
                  // K2 training: cumulative if K2 in both products
                  const imobK2 = (product === "imob" || product === "both") && imobPlan === "k2";
                  const locK2 = (product === "loc" || product === "both") && locPlan === "k2";
                  const bothK2 = imobK2 && locK2;
                  const anyK2 = imobK2 || locK2;
                  
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Suporte VIP */}
                      <Card className={`transition-all ${
                        vipIncluded
                          ? "border-green-200 bg-green-50/50" 
                          : isPrimeOnly
                          ? "border-yellow-200 bg-yellow-50/30"
                          : "border-gray-200 bg-gray-50/30 opacity-60"
                      }`}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">Suporte VIP</span>
                            {vipIncluded ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Incluído
                              </Badge>
                            ) : isPrimeOnly ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Opcional (R$97/mês)
                                </Badge>
                                <Switch
                                  checked={metrics.imobVipSupport}
                                  onCheckedChange={(checked) => setMetrics({ 
                                    ...metrics, 
                                    imobVipSupport: checked,
                                    locVipSupport: checked
                                  })}
                                />
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-400 border-gray-200">
                                Não aplicável
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Atendimento prioritário com SLA reduzido e canal exclusivo.
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 italic">Ref. R$ 97/mês</p>
                        </CardContent>
                      </Card>

                      {/* CS Dedicado */}
                      <Card className={`transition-all ${
                        csIncluded
                          ? "border-green-200 bg-green-50/50"
                          : isPrimeOnly
                          ? "border-yellow-200 bg-yellow-50/30"
                          : "border-gray-200 bg-gray-50/30 opacity-60"
                      }`}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">CS Dedicado</span>
                            {csIncluded ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Incluído
                              </Badge>
                            ) : isPrimeOnly ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Opcional (R$197/mês)
                                </Badge>
                                <Switch
                                  checked={metrics.imobDedicatedCS}
                                  onCheckedChange={(checked) => setMetrics({ 
                                    ...metrics, 
                                    imobDedicatedCS: checked,
                                    locDedicatedCS: checked
                                  })}
                                />
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-400 border-gray-200">
                                Não disponível neste plano
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Customer Success dedicado para acompanhamento estratégico.
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 italic">Ref. R$ 297/mês</p>
                        </CardContent>
                      </Card>

                      {/* Treinamentos — K2 benefit, cumulative if K2 in both products */}
                      <Card className={`transition-all ${
                        anyK2
                          ? "border-green-200 bg-green-50/50"
                          : "border-gray-200 bg-gray-50/30 opacity-60"
                      }`}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">Treinamentos</span>
                            {bothK2 ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                4 online ou 2 presencial
                              </Badge>
                            ) : anyK2 ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                2 online ou 1 presencial
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-400 border-gray-200">
                                Disponível no K2
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {bothK2 
                              ? "4 treinamentos online (ref. R$2.000/cada) ou 2 presenciais (ref. R$3.000/cada) por ano."
                              : anyK2
                              ? "2 treinamentos online (ref. R$2.000/cada) ou 1 presencial (ref. R$3.000) por ano."
                              : "Treinamentos exclusivos para sua equipe, online ou presencial."
                            }
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
                  </CardContent>
                </Card>
              </div>


              {/* §4: Add-ons Opcionais */}
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Add-ons Opcionais
                </h2>
                <Card>
                  <CardContent className="pt-4">
                  <div className="flex items-center gap-1.5 mb-4">
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
                      className="px-4 py-2 text-sm rounded-lg transition-all border bg-primary text-white font-semibold border-primary shadow-sm"
                    >
                      Selecionar
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
                      className="px-4 py-2 text-sm rounded-lg transition-all border bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                    >
                      Limpar
                    </button>
                  </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Row 1: Leads, Inteligência, Assinatura */}
                  <div className={`p-4 sm:p-3 rounded-lg border min-h-[70px] sm:min-h-0 ${!isAddonAvailable("leads") ? "opacity-50 bg-gray-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2 sm:mb-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="leads" className="font-semibold text-sm cursor-pointer">Leads</Label>
                      </div>
                      <Switch
                        id="leads"
                        checked={addons.leads}
                        onCheckedChange={(checked) => setAddons({ ...addons, leads: checked })}
                        disabled={!isAddonAvailable("leads")}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {!isAddonAvailable("leads") ? "Requer Kenlo Imob" : "Gestão automatizada de leads"}
                    </div>
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
                      <div className="flex items-center gap-2">
                        <Label htmlFor="pay" className="font-semibold text-sm cursor-pointer">Pay</Label>
                      </div>
                      <Switch
                        id="pay"
                        checked={addons.pay}
                        onCheckedChange={(checked) => setAddons({ ...addons, pay: checked })}
                        disabled={!isAddonAvailable("pay")}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {!isAddonAvailable("pay") ? "Requer Kenlo Locação" : "Boleto e Split digital embutido na plataforma"}
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border ${!isAddonAvailable("seguros") ? "opacity-50 bg-gray-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2 sm:mb-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="seguros" className="font-semibold text-sm cursor-pointer">Seguros</Label>
                      </div>
                      <Switch
                        id="seguros"
                        checked={addons.seguros}
                        onCheckedChange={(checked) => setAddons({ ...addons, seguros: checked })}
                        disabled={!isAddonAvailable("seguros")}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {!isAddonAvailable("seguros") ? "Requer Kenlo Locação" : "Seguros embutido no boleto e ganhe a partir de R$10 por contrato/mês"}
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border ${!isAddonAvailable("cash") ? "opacity-50 bg-gray-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2 sm:mb-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="cash" className="font-semibold text-sm cursor-pointer">Cash</Label>
                      </div>
                      <Switch
                        id="cash"
                        checked={addons.cash}
                        onCheckedChange={(checked) => setAddons({ ...addons, cash: checked })}
                        disabled={!isAddonAvailable("cash")}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {!isAddonAvailable("cash") ? "Requer Kenlo Locação" : "Financie seus proprietários até 24 meses"}
                    </div>
                  </div>
                </div>
                  </CardContent>
                </Card>
              </div>



              {/* Old §5 Benefícios removed — now at §3 above */}


              {/* §5: Sua Seleção vs Kombos */}
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
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">
                    Investimento pós-pago mensal (estimativo)
                  </h2>
                  
                  <Card>
                    <CardContent className="pt-4">
                    <div>
                      {/* IMOB ADD-ONS GROUP */}
                      {(product === 'imob' || product === 'both') && (() => {
                        // Calculate IMOB subtotal
                        let imobSubtotal = 0;
                        
                        // Additional Users (only if NOT prepaid)
                        const plan = imobPlan;
                        const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
                        const additional = Math.max(0, toNum(metrics.imobUsers) - included);
                        if (additional > 0 && !prepayAdditionalUsers) {
                          if (plan === 'prime') imobSubtotal += additional * 57;
                          else if (plan === 'k') {
                            // K: 1-5 = R$47, 6+ = R$37
                            const tier1 = Math.min(additional, 5);
                            const tier2 = Math.max(0, additional - 5);
                            imobSubtotal += (tier1 * 47) + (tier2 * 37);
                          } else {
                            // K2: 1-10 = R$37, 11-100 = R$27, 101+ = R$17
                            const tier1 = Math.min(additional, 10);
                            const tier2 = Math.min(Math.max(0, additional - 10), 90);
                            const tier3 = Math.max(0, additional - 100);
                            imobSubtotal += (tier1 * 37) + (tier2 * 27) + (tier3 * 17);
                          }
                        }
                        
                        // WhatsApp Messages
                        if (addons.leads && metrics.wantsWhatsApp) {
                          const included = 100;
                          const additional = Math.max(0, toNum(metrics.leadsPerMonth) - included);
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
                        // Usuários inclusos: Prime 2, K 5, K2 10
                        const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
                        const additional = Math.max(0, toNum(metrics.imobUsers) - included);
                        const totalCost = (() => {
                          // V9: Prime: R$57 fixo, K: 1-5=R$47/6+=R$37, K2: 1-10=R$37/11-100=R$27/101+=R$17
                          if (plan === 'prime') return additional * 57;
                          else if (plan === 'k') {
                            const tier1 = Math.min(additional, 5);
                            const tier2 = Math.max(0, additional - 5);
                            return (tier1 * 47) + (tier2 * 37);
                          } else {
                            const tier1 = Math.min(additional, 10);
                            const tier2 = Math.min(Math.max(0, additional - 10), 90);
                            const tier3 = Math.max(0, additional - 100);
                            return (tier1 * 37) + (tier2 * 27) + (tier3 * 17);
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
                        const totalLeads = toNum(metrics.leadsPerMonth);
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
                        const included = plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
                        const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
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
                          const additionalBoletos = Math.max(0, toNum(metrics.contractsUnderManagement) - includedBoletos);
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
                          const additionalSplits = Math.max(0, toNum(metrics.contractsUnderManagement) - includedSplits);
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
                        const included = plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
                        const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
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
                        const totalBoletos = toNum(metrics.contractsUnderManagement);
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
                        const totalSplits = toNum(metrics.contractsUnderManagement);
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
                          if (product === 'imob') totalSignatures = toNum(toNum(metrics.closingsPerMonth));
                          else if (product === 'loc') totalSignatures = toNum(toNum(metrics.newContractsPerMonth));
                          else totalSignatures = toNum(toNum(metrics.closingsPerMonth)) + toNum(toNum(metrics.newContractsPerMonth));
                          
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
                        if (product === 'imob') totalSignatures = toNum(toNum(metrics.closingsPerMonth));
                        else if (product === 'loc') totalSignatures = toNum(toNum(metrics.newContractsPerMonth));
                        else totalSignatures = toNum(toNum(metrics.closingsPerMonth)) + toNum(toNum(metrics.newContractsPerMonth));
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
                          // CS Dedicado: R$197/mês for Prime only (K=not available, K2=included)
                          if (metrics.imobDedicatedCS && imobPlan === 'prime') {
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
                          // CS Dedicado: R$197/mês for Prime only (K=not available, K2=included)
                          if (metrics.locDedicatedCS && locPlan === 'prime') {
                            locSupportCost += 197;
                          }
                        }
                        
                        const totalSupportCost = imobSupportCost + locSupportCost;
                        
                        if (totalSupportCost === 0) return null;
                        
                        const services = [];
                        if (metrics.imobVipSupport && imobPlan === 'prime') services.push('VIP Imob');
                        if (metrics.imobDedicatedCS && imobPlan === 'prime') services.push('CS Imob');
                        if (metrics.locVipSupport && locPlan === 'prime') services.push('VIP Loc');
                        if (metrics.locDedicatedCS && locPlan === 'prime') services.push('CS Loc');
                        
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
                          if (metrics.imobDedicatedCS && imobPlan === 'prime') totalPostPaid += 197;
                        }
                        if (product === 'loc' || product === 'both') {
                          if (metrics.locVipSupport && locPlan === 'prime') totalPostPaid += 97;
                          if (metrics.locDedicatedCS && locPlan === 'prime') totalPostPaid += 197;
                        }
                        
                        // Additional Users (Imob) - V9: Prime: R$57 fixo, K: 1-5=R$47/6+=R$37, K2: 1-10=R$37/11-100=R$27/101+=R$17
                        // Skip if prepaid
                        if ((product === 'imob' || product === 'both') && !prepayAdditionalUsers) {
                          const plan = imobPlan;
                          const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
                          const additional = Math.max(0, toNum(metrics.imobUsers) - included);
                          if (additional > 0) {
                            if (plan === 'prime') {
                              totalPostPaid += additional * 57;
                            } else if (plan === 'k') {
                              // K: 1-5 = R$47, 6+ = R$37
                              const tier1 = Math.min(additional, 5);
                              const tier2 = Math.max(0, additional - 5);
                              totalPostPaid += (tier1 * 47) + (tier2 * 37);
                            } else {
                              // K2: 1-10 = R$37, 11-100 = R$27, 101+ = R$17
                              const tier1 = Math.min(additional, 10);
                              const tier2 = Math.min(Math.max(0, additional - 10), 90);
                              const tier3 = Math.max(0, additional - 100);
                              totalPostPaid += (tier1 * 37) + (tier2 * 27) + (tier3 * 17);
                            }
                          }
                        }
                        
                        // Additional Contracts (Loc)
                        // Skip if prepaid
                        if ((product === 'loc' || product === 'both') && !prepayAdditionalContracts) {
                          const plan = locPlan;
                          const included = plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
                          const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
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
                          const additional = Math.max(0, toNum(metrics.leadsPerMonth) - included);
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
                          if (product === 'imob' || product === 'both') totalSignatures += toNum(metrics.closingsPerMonth);
                          if (product === 'loc' || product === 'both') totalSignatures += toNum(metrics.newContractsPerMonth);
                          const additional = Math.max(0, totalSignatures - included);
                          if (additional > 0) {
                            // V9: 1-20=R$1.80, 21-40=R$1.70, 41+=R$1.50
                            const tier1 = Math.min(additional, 20);
                            const tier2 = Math.min(Math.max(0, additional - 20), 20);
                            const tier3 = Math.max(0, additional - 40);
                            totalPostPaid += tier1 * 1.8 + tier2 * 1.7 + tier3 * 1.5;
                          }
                        }
                        
                        // Boleto costs (Pay)
                        if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
                          const plan = locPlan;
                          const includedBoletos = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                          const additionalBoletos = Math.max(0, toNum(metrics.contractsUnderManagement) - includedBoletos);
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
                          const additionalSplits = Math.max(0, toNum(metrics.contractsUnderManagement) - includedSplits);
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
                  <h2 className="text-sm font-semibold text-gray-700 mb-2">
                    Receita Extra
                  </h2>
                  
                  <Card>
                    <CardContent className="pt-4">
                      {/* Pay Questions — moved here per master prompt §6 */}
                      {addons.pay && (product === 'loc' || product === 'both') && (
                        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-yellow-800">Kenlo Pay — Boletos & Split</span>
                            <a href="/parecer-juridico" target="_blank" className="text-xs text-primary hover:underline">Saiba Mais</a>
                          </div>
                          <p className="text-xs text-gray-600 mb-3">Disponível por padrão para clientes de Locação. Ativação opcional no onboarding.</p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                              <Label htmlFor="chargesBoleto" className="text-sm">Você cobra o boleto do inquilino?</Label>
                              <Switch
                                id="chargesBoleto"
                                checked={metrics.chargesBoletoToTenant}
                                onCheckedChange={(checked) => setMetrics({ ...metrics, chargesBoletoToTenant: checked })}
                              />
                            </div>
                            {metrics.chargesBoletoToTenant && (
                              <div className="pl-2">
                                <Label htmlFor="boletoAmount" className="text-xs text-gray-600">Quanto você cobra por boleto? (R$)</Label>
                                <div className="relative">
                                  <Input
                                    id="boletoAmount"
                                     type="text"
                                     inputMode="decimal"
                                     value={typeof metrics.boletoChargeAmount === 'string' ? metrics.boletoChargeAmount : `R$ ${formatCurrency(metrics.boletoChargeAmount, 2)}`}
                                     onFocus={(e) => {
                                       // Auto-clear "R$ 0,00" on focus so user can type directly
                                       const val = toNum(metrics.boletoChargeAmount);
                                       if (val === 0) {
                                         setMetrics({ ...metrics, boletoChargeAmount: '' as any });
                                       } else {
                                         // Show raw number for editing
                                         setMetrics({ ...metrics, boletoChargeAmount: String(val).replace('.', ',') as any });
                                       }
                                       e.target.select();
                                     }}
                                     onChange={(e) => {
                                       // Allow typing with comma as decimal, filter non-numeric chars except comma
                                       const raw = e.target.value.replace(/[^0-9,]/g, '');
                                       setMetrics({ ...metrics, boletoChargeAmount: raw as any });
                                     }}
                                     onBlur={(e) => {
                                       // On blur, parse and format as currency with R$ prefix
                                       const parsed = parseCurrency(e.target.value);
                                       setMetrics({ ...metrics, boletoChargeAmount: Math.max(0, parsed) });
                                     }}
                                     placeholder="Ex: 10,00"
                                     className="mt-1 h-8 text-sm pr-8"
                                  />
                                  {(typeof metrics.boletoChargeAmount === 'number' && metrics.boletoChargeAmount > 0) && (
                                    <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 w-4 h-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                              <Label htmlFor="chargesSplit" className="text-sm">Você cobra o split do proprietário?</Label>
                              <Switch
                                id="chargesSplit"
                                checked={metrics.chargesSplitToOwner}
                                onCheckedChange={(checked) => setMetrics({ ...metrics, chargesSplitToOwner: checked })}
                              />
                            </div>
                            {metrics.chargesSplitToOwner && (
                              <div className="pl-2">
                                <Label htmlFor="splitAmount" className="text-xs text-gray-600">Quanto você cobra por split? (R$)</Label>
                                <div className="relative">
                                  <Input
                                    id="splitAmount"
                                     type="text"
                                     inputMode="decimal"
                                     value={typeof metrics.splitChargeAmount === 'string' ? metrics.splitChargeAmount : `R$ ${formatCurrency(metrics.splitChargeAmount, 2)}`}
                                     onFocus={(e) => {
                                       // Auto-clear "R$ 0,00" on focus so user can type directly
                                       const val = toNum(metrics.splitChargeAmount);
                                       if (val === 0) {
                                         setMetrics({ ...metrics, splitChargeAmount: '' as any });
                                       } else {
                                         // Show raw number for editing
                                         setMetrics({ ...metrics, splitChargeAmount: String(val).replace('.', ',') as any });
                                       }
                                       e.target.select();
                                     }}
                                     onChange={(e) => {
                                       // Allow typing with comma as decimal, filter non-numeric chars except comma
                                       const raw = e.target.value.replace(/[^0-9,]/g, '');
                                       setMetrics({ ...metrics, splitChargeAmount: raw as any });
                                     }}
                                     onBlur={(e) => {
                                       // On blur, parse and format as currency with R$ prefix
                                       const parsed = parseCurrency(e.target.value);
                                       setMetrics({ ...metrics, splitChargeAmount: Math.max(0, parsed) });
                                     }}
                                     placeholder="Ex: 5,00"
                                     className="mt-1 h-8 text-sm pr-8"
                                  />
                                  {(typeof metrics.splitChargeAmount === 'number' && metrics.splitChargeAmount > 0) && (
                                    <Check className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 w-4 h-4 text-green-600" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

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
                                ? `${metrics.contractsUnderManagement} boletos × R$ ${Number(toNum(metrics.boletoChargeAmount)).toFixed(2)} + ${metrics.contractsUnderManagement} splits × R$ ${Number(toNum(metrics.splitChargeAmount)).toFixed(2)}`
                                : metrics.chargesBoletoToTenant 
                                  ? `${metrics.contractsUnderManagement} boletos × R$ ${Number(toNum(metrics.boletoChargeAmount)).toFixed(2)}`
                                  : `${metrics.contractsUnderManagement} splits × R$ ${Number(toNum(metrics.splitChargeAmount)).toFixed(2)}`
                              }
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-green-600">
                              +{formatCurrency((() => {
                                let revenue = 0;
                                if (metrics.chargesBoletoToTenant) {
                                  revenue += toNum(metrics.contractsUnderManagement) * toNum(metrics.boletoChargeAmount);
                                }
                                if (metrics.chargesSplitToOwner) {
                                  revenue += toNum(metrics.contractsUnderManagement) * toNum(metrics.splitChargeAmount);
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
                              +{formatCurrency(toNum(metrics.contractsUnderManagement) * 10)}/mês
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
                                const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
                                const additional = Math.max(0, toNum(metrics.imobUsers) - included);
                                if (additional > 0) {
                                  if (plan === 'prime') totalPostPaid += additional * 57;
                                  else if (plan === 'k') {
                                    // K: 1-5 = R$47, 6+ = R$37
                                    const tier1 = Math.min(additional, 5);
                                    const tier2 = Math.max(0, additional - 5);
                                    totalPostPaid += (tier1 * 47) + (tier2 * 37);
                                  } else {
                                    // K2: 1-10 = R$37, 11-100 = R$27, 101+ = R$17
                                    const tier1 = Math.min(additional, 10);
                                    const tier2 = Math.min(Math.max(0, additional - 10), 90);
                                    const tier3 = Math.max(0, additional - 100);
                                    totalPostPaid += (tier1 * 37) + (tier2 * 27) + (tier3 * 17);
                                  }
                                }
                              }
                              // Skip if prepaid
                              if ((product === 'loc' || product === 'both') && !prepayAdditionalContracts) {
                                const plan = locPlan;
                                const included = plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
                                const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
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
                                const totalLeads = toNum(metrics.leadsPerMonth);
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
                                if (product === 'imob') totalSignatures = toNum(metrics.closingsPerMonth);
                                else if (product === 'loc') totalSignatures = toNum(metrics.newContractsPerMonth);
                                else totalSignatures = toNum(metrics.closingsPerMonth) + toNum(metrics.newContractsPerMonth);
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
                                const additionalBoletos = Math.max(0, toNum(metrics.contractsUnderManagement) - includedBoletos);
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
                                const additionalSplits = Math.max(0, toNum(metrics.contractsUnderManagement) - includedSplits);
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
                                if (metrics.imobDedicatedCS && imobPlan === 'prime') totalPostPaid += 197;
                              }
                              if (product === 'loc' || product === 'both') {
                                if (metrics.locVipSupport && locPlan === 'prime') totalPostPaid += 97;
                                if (metrics.locDedicatedCS && locPlan === 'prime') totalPostPaid += 197;
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
                          const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
                          const additional = Math.max(0, toNum(metrics.imobUsers) - included);
                          if (additional > 0) {
                            if (plan === 'prime') totalPostPaid += additional * 57;
                            else if (plan === 'k') {
                              // K: 1-5 = R$47, 6+ = R$37
                              const tier1 = Math.min(additional, 5);
                              const tier2 = Math.max(0, additional - 5);
                              totalPostPaid += (tier1 * 47) + (tier2 * 37);
                            } else {
                              // K2: 1-10 = R$37, 11-100 = R$27, 101+ = R$17
                              const tier1 = Math.min(additional, 10);
                              const tier2 = Math.min(Math.max(0, additional - 10), 90);
                              const tier3 = Math.max(0, additional - 100);
                              totalPostPaid += (tier1 * 37) + (tier2 * 27) + (tier3 * 17);
                            }
                          }
                        }
                        // Skip if prepaid
                        if ((product === 'loc' || product === 'both') && !prepayAdditionalContracts) {
                          const plan = locPlan;
                          const included = plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
                          const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
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
                          const totalBoletos = toNum(metrics.contractsUnderManagement);
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
                          const totalLeads = toNum(metrics.leadsPerMonth);
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
                          if (product === 'imob') totalSignatures = toNum(toNum(metrics.closingsPerMonth));
                          else if (product === 'loc') totalSignatures = toNum(toNum(metrics.newContractsPerMonth));
                          else totalSignatures = toNum(toNum(metrics.closingsPerMonth)) + toNum(toNum(metrics.newContractsPerMonth));
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
                          const additionalBoletos = Math.max(0, toNum(metrics.contractsUnderManagement) - includedBoletos);
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
                          const additionalSplits = Math.max(0, toNum(metrics.contractsUnderManagement) - includedSplits);
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
                          if (metrics.imobDedicatedCS && imobPlan === 'prime') totalPostPaid += 197;
                          if (metrics.locVipSupport && locPlan === 'prime') totalPostPaid += 97;
                          if (metrics.locDedicatedCS && locPlan === 'prime') totalPostPaid += 197;
                        }
                        let totalRevenue = 0;
                        if (addons.pay && (product === 'loc' || product === 'both')) {
                          if (metrics.chargesBoletoToTenant) {
                            totalRevenue += toNum(metrics.contractsUnderManagement) * toNum(metrics.boletoChargeAmount);
                          }
                          if (metrics.chargesSplitToOwner) {
                            totalRevenue += toNum(metrics.contractsUnderManagement) * toNum(metrics.splitChargeAmount);
                          }
                        }
                        if (addons.seguros && (product === 'loc' || product === 'both')) {
                          totalRevenue += toNum(metrics.contractsUnderManagement) * 10;
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
                                  Kenlo é a única plataforma que pode se pagar enquanto você usa.
                                </p>
                              ) : (
                                <p className="text-sm font-medium text-primary bg-primary/10 py-3 px-4 rounded-lg">
                                  Kenlo é a única plataforma que pode se pagar enquanto você usa.
                                </p>
                              )}
                            </div>
                            
                            {/* Footnote */}
                            <div className="mt-4 text-xs text-gray-500 italic">
                              Não inclui impostos.
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
                  );
                })()}



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
                      onClick={handleGenerate3Examples}
                      variant="outline"
                      disabled={isGeneratingExamples}
                    >
                      {isGeneratingExamples ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Shuffle className="w-4 h-4 mr-2" />
                      )}
                      {isGeneratingExamples ? "Gerando..." : "Gerar 3 Exemplos"}
                    </Button>
                    <Button 
                      className="flex-1 min-h-[50px]" 
                      size="lg" 
                      onClick={() => {
                        if (!canExportPDF) {
                          toast.error("Faça login como vendedor autorizado para exportar cotações.");
                          return;
                        }
                        const hasCompanyErrors = !businessNature.companyName.trim() || !businessNature.ownerName.trim() || !businessNature.email.trim() || !businessNature.cellphone.trim();
                        if (!isBusinessNatureComplete() || hasCompanyErrors) {
                          setShowValidationErrors(true);
                          toast.error("Preencha todos os campos obrigatórios marcados com * antes de exportar.");
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
                        setShowValidationErrors(false);
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
                
                // Get selected addons as array (exclude Cash from PDFs per business rule)
                const selectedAddons = Object.entries(addons)
                  .filter(([name, enabled]) => enabled && name !== 'cash')
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
                  if (metrics.imobDedicatedCS && imobPlan === 'prime') postPaidTotal += 197;
                }
                if (product === 'loc' || product === 'both') {
                  if (metrics.locVipSupport && locPlan === 'prime') postPaidTotal += 97;
                  if (metrics.locDedicatedCS && locPlan === 'prime') postPaidTotal += 197;
                }
                
                // Additional Users (Imob) - Skip if prepaid (V9)
                if ((product === 'imob' || product === 'both') && !prepayAdditionalUsers) {
                  const plan = imobPlan;
                  const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
                  const additional = Math.max(0, toNum(metrics.imobUsers) - included);
                  if (additional > 0) {
                    if (plan === 'prime') {
                      postPaidTotal += additional * 57;
                    } else if (plan === 'k') {
                      const tier1 = Math.min(additional, 5);
                      const tier2 = Math.max(0, additional - 5);
                      postPaidTotal += (tier1 * 47) + (tier2 * 37);
                    } else {
                      const tier1 = Math.min(additional, 10);
                      const tier2 = Math.min(Math.max(0, additional - 10), 90);
                      const tier3 = Math.max(0, additional - 100);
                      postPaidTotal += (tier1 * 37) + (tier2 * 27) + (tier3 * 17);
                    }
                  }
                }
                
                // Additional Contracts (Loc) - Skip if prepaid (V9: K=150)
                if ((product === 'loc' || product === 'both') && !prepayAdditionalContracts) {
                  const plan = locPlan;
                  const included = plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
                  const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
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
                  const additional = Math.max(0, toNum(metrics.leadsPerMonth) - included);
                  if (additional > 0) {
                    const tier1 = Math.min(additional, 200);
                    const tier2 = Math.min(Math.max(0, additional - 200), 150);
                    const tier3 = Math.min(Math.max(0, additional - 350), 650);
                    const tier4 = Math.max(0, additional - 1000);
                    postPaidTotal += tier1 * 2.0 + tier2 * 1.8 + tier3 * 1.5 + tier4 * 1.2;
                  }
                }
                
                // Digital Signatures (V9: 1-20=R$1.80, 21-40=R$1.70, 41+=R$1.50)
                if (addons.assinatura) {
                  const included = 15;
                  let totalSignatures = 0;
                  if (product === 'imob' || product === 'both') totalSignatures += toNum(metrics.closingsPerMonth);
                  if (product === 'loc' || product === 'both') totalSignatures += toNum(metrics.newContractsPerMonth);
                  const additional = Math.max(0, totalSignatures - included);
                  if (additional > 0) {
                    const tier1 = Math.min(additional, 20);
                    const tier2 = Math.min(Math.max(0, additional - 20), 20);
                    const tier3 = Math.max(0, additional - 40);
                    postPaidTotal += tier1 * 1.8 + tier2 * 1.7 + tier3 * 1.5;
                  }
                }
                
                // Boleto costs (Pay)
                if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
                  const plan = locPlan;
                  const includedBoletos = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                  const additionalBoletos = Math.max(0, toNum(metrics.contractsUnderManagement) - includedBoletos);
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
                  const additionalSplits = Math.max(0, toNum(metrics.contractsUnderManagement) - includedSplits);
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
                    revenueFromBoletos += toNum(metrics.contractsUnderManagement) * toNum(metrics.boletoChargeAmount);
                  }
                  if (metrics.chargesSplitToOwner) {
                    revenueFromBoletos += toNum(metrics.contractsUnderManagement) * toNum(metrics.splitChargeAmount);
                  }
                }
                
                const revenueFromInsurance = (addons.seguros && (product === 'loc' || product === 'both'))
                  ? toNum(metrics.contractsUnderManagement) * 10
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
                const locCompatible = ['pay', 'seguros', 'inteligencia', 'assinatura'];
                
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
                    // cash removed from PDFs
                  };
                  const incompatibleNames = incompatibleAddons.map(a => addonNames[a] || a).join(', ');
                  toast.error(
                    `Add-ons incompatíveis detectados: ${incompatibleNames}. ` +
                    `Estes add-ons não são compatíveis com o produto selecionado (${product.toUpperCase()}).`
                  );
                  return; // Stop PDF generation
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
                  imobUsers: typeof metrics.imobUsers === "number" ? metrics.imobUsers : 0,
                  closings: typeof metrics.closingsPerMonth === "number" ? metrics.closingsPerMonth : 0,
                  contracts: typeof metrics.contractsUnderManagement === "number" ? metrics.contractsUnderManagement : 0,
                  newContracts: typeof metrics.newContractsPerMonth === "number" ? metrics.newContractsPerMonth : 0,
                  leadsPerMonth: typeof metrics.leadsPerMonth === "number" ? metrics.leadsPerMonth : 0,
                  usesExternalAI: metrics.usesExternalAI,
                  wantsWhatsApp: metrics.wantsWhatsApp,
                  chargesSplitToOwner: metrics.chargesSplitToOwner,
                  chargesBoletoToTenant: metrics.chargesBoletoToTenant,
                  boletoAmount: toNum(metrics.boletoChargeAmount),
                  splitAmount: toNum(metrics.splitChargeAmount),
                  businessType: businessNature.businessType,
                  email: businessNature.email,
                  cellphone: businessNature.cellphone,
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
                  // Monthly license base for PDF display
                  monthlyLicenseBase: totalMonthly,
                  // Premium services - ALL Kombos include Premium Services for free
                  hasPremiumServices: hasPremiumIncluded || 
                    ((metrics.imobVipSupport || metrics.locVipSupport) && 
                    (metrics.imobDedicatedCS || metrics.locDedicatedCS)),
                  premiumServicesPrice: premiumServicesPrice,
                  // Installment options (from QuoteInfoDialog)
                  installments: quoteInfo.installments,
                  // Proposal validity (from QuoteInfoDialog)
                  validityDays: quoteInfo.validityDays,
                  // V8: Individual line item prices for Investimento table
                  imobPrice: (() => {
                    if (product !== 'imob' && product !== 'both') return undefined;
                    const items = getLineItems();
                    const imobItem = items.find(it => it.name.startsWith('Imob'));
                    return imobItem ? (activeKombo !== 'none' ? imobItem.priceComKombo : imobItem.priceSemKombo) : undefined;
                  })(),
                  locPrice: (() => {
                    if (product !== 'loc' && product !== 'both') return undefined;
                    const items = getLineItems();
                    const locItem = items.find(it => it.name.startsWith('Loc'));
                    return locItem ? (activeKombo !== 'none' ? locItem.priceComKombo : locItem.priceSemKombo) : undefined;
                  })(),
                  addonPrices: (() => {
                    const items = getLineItems();
                    const prices: Record<string, number> = {};
                    const addonKeys = ['Leads', 'Intelig\u00eancia', 'Assinatura'];
                    const keyMap: Record<string, string> = { 'Leads': 'leads', 'Intelig\u00eancia': 'inteligencia', 'Assinatura': 'assinatura' };
                    for (const item of items) {
                      if (addonKeys.includes(item.name)) {
                        const price = activeKombo !== 'none' ? item.priceComKombo : item.priceSemKombo;
                        if (price > 0) prices[keyMap[item.name]] = price;
                      }
                    }
                    return Object.keys(prices).length > 0 ? JSON.stringify(prices) : undefined;
                  })(),
                  vipIncluded: hasPremiumIncluded && (metrics.imobVipSupport || metrics.locVipSupport),
                  csIncluded: hasPremiumIncluded && (metrics.imobDedicatedCS || metrics.locDedicatedCS),
                  vipPrice: !hasPremiumIncluded && (metrics.imobVipSupport || metrics.locVipSupport) ? 97 : 0,
                  csPrice: !hasPremiumIncluded && (metrics.imobDedicatedCS || metrics.locDedicatedCS) ? 197 : 0,
                  // V8: P\u00f3s-pago breakdown
                  postPaidBreakdown: (() => {
                    const bd: any = { total: postPaidTotal };
                    // IMOB: Additional Users (V9)
                    if ((product === 'imob' || product === 'both') && !prepayAdditionalUsers) {
                      const plan = imobPlan;
                      const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
                      const additional = Math.max(0, toNum(metrics.imobUsers) - included);
                      if (additional > 0) {
                        let userCost = 0;
                        if (plan === 'prime') userCost = additional * 57;
                        else if (plan === 'k') {
                          const t1 = Math.min(additional, 5); const t2 = Math.max(0, additional - 5);
                          userCost = t1 * 47 + t2 * 37;
                        } else {
                          const t1 = Math.min(additional, 10); const t2 = Math.min(Math.max(0, additional - 10), 90); const t3 = Math.max(0, additional - 100);
                          userCost = t1 * 37 + t2 * 27 + t3 * 17;
                        }
                        if (!bd.imobAddons) bd.imobAddons = { groupLabel: 'IMOB', groupTotal: 0, items: [] };
                        bd.imobAddons.items.push({ label: 'Usuários Adicionais', included, additional, total: userCost, perUnit: plan === 'prime' ? 57 : plan === 'k' ? 47 : 37, unitLabel: 'usuário' });
                        bd.imobAddons.groupTotal += userCost;
                      }
                    }
                    // LOC: Additional Contracts (V9: K=150)
                    if ((product === 'loc' || product === 'both') && !prepayAdditionalContracts) {
                      const plan = locPlan;
                      const included = plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
                      const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
                      if (additional > 0) {
                        let cost = 0;
                        if (plan === 'prime') { cost = additional * 3; }
                        else if (plan === 'k') { const t1 = Math.min(additional, 250); const t2 = Math.max(0, additional - 250); cost = t1 * 3 + t2 * 2.5; }
                        else { const t1 = Math.min(additional, 250); const t2 = Math.min(Math.max(0, additional - 250), 250); const t3 = Math.max(0, additional - 500); cost = t1 * 3 + t2 * 2.5 + t3 * 2; }
                        if (!bd.locAddons) bd.locAddons = { groupLabel: 'LOCAÇÃO', groupTotal: 0, items: [] };
                        bd.locAddons.items.push({ label: 'Contratos Adicionais', included, additional, total: cost, perUnit: 3, unitLabel: 'contrato' });
                        bd.locAddons.groupTotal += cost;
                      }
                    }
                    // LOC: Boleto costs (V9: tiered by plan)
                    if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
                      const plan = locPlan;
                      const inclBoletos = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                      const addBoletos = Math.max(0, toNum(metrics.contractsUnderManagement) - inclBoletos);
                      if (addBoletos > 0) {
                        let cost = 0;
                        if (plan === 'prime') { cost = addBoletos * 4; }
                        else if (plan === 'k') { const bt1 = Math.min(addBoletos, 250); const bt2 = Math.max(0, addBoletos - 250); cost = bt1 * 4 + bt2 * 3.5; }
                        else { const bt1 = Math.min(addBoletos, 250); const bt2 = Math.min(Math.max(0, addBoletos - 250), 250); const bt3 = Math.max(0, addBoletos - 500); cost = bt1 * 4 + bt2 * 3.5 + bt3 * 3; }
                        if (!bd.locAddons) bd.locAddons = { groupLabel: 'LOCAÇÃO', groupTotal: 0, items: [] };
                        bd.locAddons.items.push({ label: 'Custo Boletos (Pay)', included: inclBoletos, additional: addBoletos, total: cost, perUnit: 4, unitLabel: 'boleto' });
                        bd.locAddons.groupTotal += cost;
                      }
                    }
                    // LOC: Split costs (V9: tiered by plan)
                    if (addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both')) {
                      const plan = locPlan;
                      const inclSplits = plan === 'prime' ? 2 : plan === 'k' ? 5 : 15;
                      const addSplits = Math.max(0, toNum(metrics.contractsUnderManagement) - inclSplits);
                      if (addSplits > 0) {
                        let cost = 0;
                        if (plan === 'prime') { cost = addSplits * 4; }
                        else if (plan === 'k') { const st1 = Math.min(addSplits, 250); const st2 = Math.max(0, addSplits - 250); cost = st1 * 4 + st2 * 3.5; }
                        else { const st1 = Math.min(addSplits, 250); const st2 = Math.min(Math.max(0, addSplits - 250), 250); const st3 = Math.max(0, addSplits - 500); cost = st1 * 4 + st2 * 3.5 + st3 * 3; }
                        if (!bd.locAddons) bd.locAddons = { groupLabel: 'LOCAÇÃO', groupTotal: 0, items: [] };
                        bd.locAddons.items.push({ label: 'Custo Split (Pay)', included: inclSplits, additional: addSplits, total: cost, perUnit: 4, unitLabel: 'split' });
                        bd.locAddons.groupTotal += cost;
                      }
                    }
                    // Shared: Digital Signatures (V9: tiered 1-20=R$1.80, 21-40=R$1.70, 41+=R$1.50)
                    if (addons.assinatura) {
                      const included = 15;
                      let totalSigs = 0;
                      if (product === 'imob' || product === 'both') totalSigs += toNum(metrics.closingsPerMonth);
                      if (product === 'loc' || product === 'both') totalSigs += toNum(metrics.newContractsPerMonth);
                      const additional = Math.max(0, totalSigs - included);
                      if (additional > 0) {
                        const st1 = Math.min(additional, 20); const st2 = Math.min(Math.max(0, additional - 20), 20); const st3 = Math.max(0, additional - 40);
                        const cost = st1 * 1.8 + st2 * 1.7 + st3 * 1.5;
                        if (!bd.sharedAddons) bd.sharedAddons = { groupLabel: 'Add-ons Compartilhados (IMOB + LOC)', groupTotal: 0, items: [] };
                        bd.sharedAddons.items.push({ label: 'Assinaturas Digitais (compartilhado)', included, additional, total: cost, perUnit: 1.8, unitLabel: 'assinatura' });
                        bd.sharedAddons.groupTotal += cost;
                      }
                    }
                    // Shared: WhatsApp Messages (V9: tiered 1-200=R$2, 201-350=R$1.80, 351-1000=R$1.50, 1001+=R$1.20)
                    if (addons.leads && metrics.wantsWhatsApp) {
                      const included = 100;
                      const additional = Math.max(0, toNum(metrics.leadsPerMonth) - included);
                      if (additional > 0) {
                        const wt1 = Math.min(additional, 200); const wt2 = Math.min(Math.max(0, additional - 200), 150); const wt3 = Math.min(Math.max(0, additional - 350), 650); const wt4 = Math.max(0, additional - 1000);
                        const cost = wt1 * 2 + wt2 * 1.8 + wt3 * 1.5 + wt4 * 1.2;
                        if (!bd.sharedAddons) bd.sharedAddons = { groupLabel: 'Add-ons Compartilhados (IMOB + LOC)', groupTotal: 0, items: [] };
                        bd.sharedAddons.items.push({ label: 'Mensagens WhatsApp', included, additional, total: cost, perUnit: 2, unitLabel: 'msg' });
                        bd.sharedAddons.groupTotal += cost;
                      }
                    }
                    return JSON.stringify(bd);
                  })(),
                  // Kombo comparison data for Section 6 table
                  komboComparison: (() => {
                    const comparison: Array<{ name: string; discount: number; totalMonthly: number; savings: number; isSelected: boolean; isAvailable: boolean }> = [];
                    // Calculate base total without any kombo
                    const lineItems = getLineItems();
                    const baseTotalNoKombo = lineItems.reduce((sum, item) => sum + item.priceSemKombo, 0);
                    
                    // "Sem Kombo" entry
                    comparison.push({
                      name: 'Sem Kombo',
                      discount: 0,
                      totalMonthly: baseTotalNoKombo,
                      savings: 0,
                      isSelected: activeKombo === 'none',
                      isAvailable: true,
                    });
                    
                    // Each Kombo
                    Object.entries(KOMBOS).forEach(([key, kombo]) => {
                      const isAvailable = kombo.requiredProducts.includes(product);
                      const discountFactor = 1 - kombo.discount;
                      const komboTotal = Math.round(baseTotalNoKombo * discountFactor);
                      comparison.push({
                        name: kombo.name,
                        discount: Math.round(kombo.discount * 100),
                        totalMonthly: komboTotal,
                        savings: baseTotalNoKombo - komboTotal,
                        isSelected: activeKombo === key,
                        isAvailable,
                      });
                    });
                    return JSON.stringify(comparison);
                  })(),
                  // Frequency comparison data for Section 5
                  frequencyComparison: (() => {
                    const lineItems = getLineItems();
                    const baseTotalNoKombo = lineItems.reduce((sum, item) => sum + item.priceSemKombo, 0);
                    const komboFactor = komboInfo ? (1 - komboInfo.discount) : 1;
                    const baseAnnual = Math.round(baseTotalNoKombo * komboFactor);
                    const freqs = [
                      { name: 'Mensal', key: 'monthly', multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.monthly },
                      { name: 'Semestral', key: 'semestral', multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.semestral },
                      { name: 'Anual', key: 'annual', multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.annual },
                      { name: 'Bienal', key: 'biennial', multiplier: PAYMENT_FREQUENCY_MULTIPLIERS.biennial },
                    ];
                    return JSON.stringify(freqs.map(f => ({
                      name: f.name,
                      monthlyEquivalent: roundToEndIn7(Math.round(baseAnnual * f.multiplier)),
                      isSelected: frequency === f.key,
                    })));
                  })(),
                };

                // Generate PDF using client-side html2pdf.js for pixel-perfect output
                await downloadProposalPDF(proposalData);
                  
                  toast.dismiss();
                  toast.success("PDF baixado com sucesso!");

                {

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
                      // Business nature
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

      {/* Sticky Summary Bar - White Frosted Glass */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="container max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Plan info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-500">
                        {product === 'imob' ? 'IMOB' : product === 'loc' ? 'LOC' : 'IMOB + LOC'}
                      </span>
                      <span className="text-xs text-gray-300">|</span>
                      <span className="text-xs font-medium text-gray-500">
                        {product === 'imob' || product === 'both' ? imobPlan.toUpperCase() : ''}
                        {product === 'both' ? ' + ' : ''}
                        {product === 'loc' || product === 'both' ? locPlan.toUpperCase() : ''}
                      </span>
                      {komboInfo && (
                        <>
                          <span className="text-xs text-gray-300">|</span>
                          <span className="text-xs font-semibold text-primary">{komboInfo.name}</span>
                        </>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {frequencyLabels[frequency]} {frequency !== 'annual' ? `(${frequencyBadges[frequency]})` : '(referência)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Total price */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Total Mensal</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatCurrency(calculateMonthlyRecurring(activeKombo !== 'none'))}
                </span>
                {activeKombo !== 'none' && (
                  <span className="text-[10px] text-green-600 font-medium">
                    {Math.round((komboInfo?.discount || 0) * 100)}% OFF com {komboInfo?.name}
                  </span>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5 hidden sm:flex"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  Topo
                </Button>
                <Button
                  size="sm"
                  className="text-xs gap-1.5 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    if (!canExportPDF) {
                      toast.error('Faça login como vendedor autorizado para exportar cotações.');
                      return;
                    }
                    const hasCompanyErrors = !businessNature.companyName.trim() || !businessNature.ownerName.trim() || !businessNature.email.trim() || !businessNature.cellphone.trim();
                    if (!isBusinessNatureComplete() || hasCompanyErrors) {
                      setShowValidationErrors(true);
                      toast.error('Preencha todos os campos obrigatórios marcados com * antes de exportar.');
                      const businessNatureSection = document.getElementById('business-nature-section');
                      if (businessNatureSection) {
                        businessNatureSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                      return;
                    }
                    if (!selectedPlan) {
                      toast.error('Selecione um plano ou Kombo antes de exportar.');
                      return;
                    }
                    setShowValidationErrors(false);
                    setShowQuoteInfoDialog(true);
                  }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
}
