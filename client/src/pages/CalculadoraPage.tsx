/**
 * Kenlo Intelligent Pricing Calculator - Single Page Version
 * Streamlined tool for sales team with smart filters and dynamic questions
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProposalExportDialog } from "@/components/ProposalExportDialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Check,
  X,
  Calculator,
  Download,

  TrendingUp,
  Key,
  Zap,
} from "lucide-react";

// Types
type ProductSelection = "imob" | "loc" | "both";
type PlanTier = "prime" | "k" | "k2";
type PaymentFrequency = "semestral" | "annual" | "biennial";

/**
 * CRITICAL: All base prices are ANNUAL prices (when paying annually)
 * These are the "Licença mensal (plano anual)" prices from the pricing document
 */
const PLAN_ANNUAL_PRICES = {
  prime: 247,  // R$247/month when paying annually
  k: 497,      // R$497/month when paying annually
  k2: 997,     // R$997/month when paying annually
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
 * Round price to nearest value ending in 7
 * Example: 495 → 497, 502 → 507, 490 → 487
 */
const roundToEndIn7 = (price: number): number => {
  const lastDigit = price % 10;
  if (lastDigit <= 7) {
    return price - lastDigit + 7;
  } else {
    return price - lastDigit + 17;
  }
};

export default function CalculadoraPage() {
  // Step 1: Product selection
  const [product, setProduct] = useState<ProductSelection>("both");
  
  // Step 2: Add-ons (all 6 add-ons) - All enabled by default
  const [addons, setAddons] = useState({
    leads: true,
    inteligencia: true, // BI/Analytics
    assinatura: true, // Digital signature
    pay: true,
    seguros: true,
    cash: true,
  });

  // Step 3: Metrics (conditional based on product) - Updated defaults per user request
  const [metrics, setMetrics] = useState({
    // Imob metrics - defaults: 18 users, 300 leads, 3 closings, WhatsApp enabled
    imobUsers: 18,
    closingsPerMonth: 3,
    leadsPerMonth: 300,  // Number of leads received per month for WhatsApp calculation
    usesExternalAI: false,
    wantsWhatsApp: true,  // WhatsApp enabled by default
    imobVipSupport: false,  // VIP Support for IMOB
    imobDedicatedCS: false, // Dedicated CS for IMOB
    
    // Loc metrics - defaults: 550 contracts, 15 new contracts
    contractsUnderManagement: 550,
    newContractsPerMonth: 15,
    locVipSupport: false,   // VIP Support for LOC
    locDedicatedCS: false,  // Dedicated CS for LOC
    
    // Kenlo Pay billing - defaults: R$5 boleto, R$5 split, both enabled
    chargesBoletoToTenant: true,
    boletoChargeAmount: 5,  // Amount charged to tenant for boleto
    chargesSplitToOwner: true,
    splitChargeAmount: 5,   // Amount charged to owner for split
  });

  // Step 4: Payment frequency (default: annual)
  const [frequency, setFrequency] = useState<PaymentFrequency>("annual");

  // Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // tRPC mutations for PDF generation and proposal creation
  const generatePDF = trpc.proposals.generatePDF.useMutation();
  const createProposal = trpc.proposals.create.useMutation();

  // Recommended plans
  const [imobPlan, setImobPlan] = useState<PlanTier>("k");
  const [locPlan, setLocPlan] = useState<PlanTier>("k");

  // Auto-recommend plans based on metrics
  // VIP Support requires minimum K plan, VIP Support + Dedicated CS requires minimum K2 plan
  useEffect(() => {
    if (product === "imob" || product === "both") {
      let recommendedPlan: PlanTier = "prime";
      
      // Base recommendation from volume
      if (metrics.imobUsers <= 3 && metrics.closingsPerMonth <= 10) {
        recommendedPlan = "prime";
      } else if (metrics.imobUsers <= 10 && metrics.closingsPerMonth <= 30) {
        recommendedPlan = "k";
      } else {
        recommendedPlan = "k2";
      }
      
      // Note: VIP Support and CS Dedicado are now optional paid services
      // Prime: Both are paid @ R$99/mês each
      // K: VIP Support is free, CS Dedicado is paid @ R$99/mês
      // K2: Both are free (included)
      // No longer force plan upgrade - user can pay for services on lower plans
      
      setImobPlan(recommendedPlan);
    }

    if (product === "loc" || product === "both") {
      let recommendedPlan: PlanTier = "prime";
      
      // Base recommendation from volume
      if (metrics.contractsUnderManagement <= 100) {
        recommendedPlan = "prime";
      } else if (metrics.contractsUnderManagement <= 500) {
        recommendedPlan = "k";
      } else {
        recommendedPlan = "k2";
      }
      
      // Note: VIP Support and CS Dedicado are now optional paid services
      // Prime: Both are paid @ R$99/mês each
      // K: VIP Support is free, CS Dedicado is paid @ R$99/mês
      // K2: Both are free (included)
      // No longer force plan upgrade - user can pay for services on lower plans
      
      setLocPlan(recommendedPlan);
    }
  }, [metrics, product]);

  // Auto-activate Suporte Premium and CS Dedicado based on selected plans
  useEffect(() => {
    const newMetrics = { ...metrics };
    
    // IMOB: Suporte Premium included in K and K2, CS Dedicado included in K2
    if (product === "imob" || product === "both") {
      newMetrics.imobVipSupport = imobPlan === "k" || imobPlan === "k2";
      newMetrics.imobDedicatedCS = imobPlan === "k2";
    }
    
    // LOC: Suporte Premium included in K and K2, CS Dedicado included in K2
    if (product === "loc" || product === "both") {
      newMetrics.locVipSupport = locPlan === "k" || locPlan === "k2";
      newMetrics.locDedicatedCS = locPlan === "k2";
    }
    
    setMetrics(newMetrics);
  }, [imobPlan, locPlan, product]);

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

  // Get line items for pricing table
  const getLineItems = () => {
    const kombo = detectKombo();
    const komboDiscount = kombo ? (1 - kombo.discount) : 1;
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

  // Detect which Kombo is active and return discount percentage
  const detectKombo = (): { type: string; discount: number; name: string } | null => {
    const hasImob = product === "imob" || product === "both";
    const hasLoc = product === "loc" || product === "both";
    const hasLeads = addons.leads;
    const hasInteligencia = addons.inteligencia;
    const hasAssinatura = addons.assinatura;
    
    // Combo COMPLETO: Imob + Loc + All Add-ons (Leads, Inteligência, Assinatura)
    if (hasImob && hasLoc && hasLeads && hasInteligencia && hasAssinatura) {
      return { type: "completo", discount: 0.20, name: "Combo COMPLETO" };
    }
    
    // Combo IMOB Full: Imob + Leads + Inteligência + Assinatura
    if (hasImob && !hasLoc && hasLeads && hasInteligencia && hasAssinatura) {
      return { type: "imob_full", discount: 0.15, name: "Combo IMOB (Completo)" };
    }
    
    // Combo IMOB: Imob + Leads + Assinatura
    if (hasImob && !hasLoc && hasLeads && hasAssinatura) {
      return { type: "imob", discount: 0.10, name: "Combo IMOB" };
    }
    
    // Combo LOCAÇÃO: Loc + Inteligência + Assinatura
    if (hasLoc && !hasImob && hasInteligencia && hasAssinatura) {
      return { type: "locacao", discount: 0.10, name: "Combo LOCAÇÃO" };
    }
    
    // Combo IMOB + LOCAÇÃO (sem add-ons): Only products, no add-ons
    if (hasImob && hasLoc && !hasLeads && !hasInteligencia && !hasAssinatura) {
      return { type: "imob_loc", discount: 0, name: "Combo IMOB + LOCAÇÃO" };
    }
    
    return null;
  };

  // Calculate total implementation cost
  const calculateTotalImplementation = (withKombo: boolean = false) => {
    const kombo = detectKombo();
    
    // If any Kombo is active, implementation is fixed R$1.497
    if (withKombo && kombo) {
      return 1497;
    }
    
    // Without Kombo, sum individual implementation costs
    const items = getLineItems();
    return items.reduce((sum, item) => sum + (item.implantation || 0), 0);
  };

  // Calculate kombo discount on monthly recurring
  const calculateKomboDiscount = () => {
    const kombo = detectKombo();
    if (!kombo) return 0;
    
    // Apply discount percentage to ALL products and add-ons
    const lineItems = getLineItems();
    const subtotal = lineItems.reduce((sum, item) => sum + item.priceSemKombo, 0);
    return Math.round(subtotal * kombo.discount);
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

  // Calculate first year total (recurring * 12 + implementation)
  const calculateFirstYearTotal = (withKombo: boolean = false) => {
    const monthlyRecurring = calculateMonthlyRecurring(withKombo);
    const implementation = calculateTotalImplementation(withKombo);
    return (monthlyRecurring * 12) + implementation;
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
    semestral: "Semestral",
    annual: "Anual",
    biennial: "Bienal",
  };

  const frequencyBadges = {
    semestral: "-15%",
    annual: "-20%",
    biennial: "-25%",
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 sm:py-12 px-4 sm:px-6">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-3">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 px-4">
              Calculadora Inteligente Kenlo
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Configure a solução ideal para sua imobiliária e veja o investimento em tempo real
            </p>
          </div>

          {/* Main Calculator Card */}
          <Card className="shadow-xl">
            <CardContent className="p-4 sm:p-6">
              {/* Step 1: Product Selection */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  1. Escolha o Produto
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
                    2. Add-ons Opcionais
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
                  3. Informações do Negócio
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
                            onChange={(e) => setMetrics({ ...metrics, imobUsers: parseInt(e.target.value) || 0 })}
                            disabled={product !== "imob" && product !== "both"}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="closings" className="text-sm">Fechamentos por mês</Label>
                          <Input
                            id="closings"
                            type="number" inputMode="numeric"
                            value={metrics.closingsPerMonth}
                            onChange={(e) => setMetrics({ ...metrics, closingsPerMonth: parseInt(e.target.value) || 0 })}
                            disabled={product !== "imob" && product !== "both"}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="leads" className="text-sm">Leads recebidos por mês</Label>
                          <Input
                            id="leads"
                            type="number" inputMode="numeric"
                            value={metrics.leadsPerMonth}
                            onChange={(e) => setMetrics({ ...metrics, leadsPerMonth: parseInt(e.target.value) || 0 })}
                            disabled={product !== "imob" && product !== "both"}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <Label htmlFor="externalAI" className="text-sm">Usa IA externa para SDR (ex: Lais)?</Label>
                        <Switch
                          id="externalAI"
                          checked={metrics.usesExternalAI}
                          onCheckedChange={(checked) => setMetrics({ ...metrics, usesExternalAI: checked })}
                          disabled={product !== "imob" && product !== "both"}
                        />
                      </div>
                      {!metrics.usesExternalAI && (
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <Label htmlFor="whatsapp" className="text-sm">Quer WhatsApp integrado?</Label>
                          <Switch
                            id="whatsapp"
                            checked={metrics.wantsWhatsApp}
                            onCheckedChange={(checked) => setMetrics({ ...metrics, wantsWhatsApp: checked })}
                            disabled={product !== "imob" && product !== "both"}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <Label htmlFor="imobVipSupport" className="text-sm">Quer Suporte VIP?</Label>
                        <Switch
                          id="imobVipSupport"
                          checked={metrics.imobVipSupport}
                          onCheckedChange={(checked) => setMetrics({ ...metrics, imobVipSupport: checked })}
                          disabled={product !== "imob" && product !== "both"}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <Label htmlFor="imobDedicatedCS" className="text-sm">Quer CS Dedicado?</Label>
                        <Switch
                          id="imobDedicatedCS"
                          checked={metrics.imobDedicatedCS}
                          onCheckedChange={(checked) => setMetrics({ ...metrics, imobDedicatedCS: checked })}
                          disabled={product !== "imob" && product !== "both"}
                        />
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
                            onChange={(e) => setMetrics({ ...metrics, contractsUnderManagement: parseInt(e.target.value) || 0 })}
                            disabled={product !== "loc" && product !== "both"}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newContracts" className="text-sm">Novos contratos por mês</Label>
                          <Input
                            id="newContracts"
                            type="number" inputMode="numeric"
                            value={metrics.newContractsPerMonth}
                            onChange={(e) => setMetrics({ ...metrics, newContractsPerMonth: parseInt(e.target.value) || 0 })}
                            disabled={product !== "loc" && product !== "both"}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <Label htmlFor="locVipSupport" className="text-sm">Quer Suporte VIP?</Label>
                        <Switch
                          id="locVipSupport"
                          checked={metrics.locVipSupport}
                          onCheckedChange={(checked) => setMetrics({ ...metrics, locVipSupport: checked })}
                          disabled={product !== "loc" && product !== "both"}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <Label htmlFor="locDedicatedCS" className="text-sm">Quer CS Dedicado?</Label>
                        <Switch
                          id="locDedicatedCS"
                          checked={metrics.locDedicatedCS}
                          onCheckedChange={(checked) => setMetrics({ ...metrics, locDedicatedCS: checked })}
                          disabled={product !== "loc" && product !== "both"}
                        />
                      </div>
                      
                      {/* Kenlo Pay Billing Questions - Only shown when Pay add-on is enabled */}
                      {addons.pay && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-yellow-800">Kenlo Pay - Cobrança</span>
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
                                  onChange={(e) => setMetrics({ ...metrics, boletoChargeAmount: parseFloat(e.target.value) || 0 })}
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
                                  onChange={(e) => setMetrics({ ...metrics, splitChargeAmount: parseFloat(e.target.value) || 0 })}
                                  className="mt-1 h-8 text-sm"
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                
                </div>
              </div>

              {/* Results Section */}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  4. Planos Recomendados
                </h2>
                
                <Card className="mb-6">
                  <CardContent className="p-3 sm:p-6">
                    {/* Custom table header with Planos Recomendados as row label */}
                    <div className="mb-4">
                      {/* Frequency buttons row - aligned with columns */}
                      <div className="flex flex-col sm:flex-row sm:items-center mb-2 gap-2">
                        <div className="hidden sm:block sm:w-[30%]"></div>
                        <div className="flex-1 flex justify-center gap-2">
                          {(["semestral", "annual", "biennial"] as PaymentFrequency[]).map((freq) => (
                            <button
                              key={freq}
                              onClick={() => setFrequency(freq)}
                              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all text-center min-h-[60px] sm:min-h-0 ${
                                frequency === freq
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300 bg-white active:border-primary/50"
                              }`}
                            >
                              <div className={`font-semibold ${frequency === freq ? "text-primary" : "text-gray-900"}`}>
                                {frequencyLabels[freq]}
                              </div>
                              <Badge variant="secondary" className="text-[10px] mt-1">
                                {frequencyBadges[freq]}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Wrapper div with relative positioning for absolute overlay */}
                    <div className="relative overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                      <Table>
                      <TableHeader>
                        {/* Column headers with Planos Recomendados as row label */}
                        <TableRow>
                          <TableHead className="w-[30%] font-bold text-gray-900"></TableHead>
                          <TableHead colSpan={2} className="text-center border-r-2 bg-gray-50">Sem Kombo</TableHead>
                          <TableHead colSpan={2} className={`text-center ${detectKombo() ? 'bg-green-50' : 'bg-gray-100'}`}>
                            {detectKombo() ? 'Kombo Ativado' : 'Kombo Desativado'}
                          </TableHead>
                        </TableRow>
                        <TableRow>
                          <TableHead></TableHead>
                          <TableHead className="text-right text-xs">Mensal</TableHead>
                          <TableHead className="text-right text-xs border-r-2">{frequencyLabels[frequency]}</TableHead>
                          <TableHead className="text-right text-xs">Mensal</TableHead>
                          <TableHead className="text-right text-xs">{frequencyLabels[frequency]}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Category: Produtos */}
                        {(() => {
                          const lineItems = getLineItems();
                          const productItems = lineItems.filter(item => 
                            item.name.startsWith('Imob') || item.name.startsWith('Loc')
                          );
                          const addonItems = lineItems.filter(item => 
                            !item.name.startsWith('Imob') && !item.name.startsWith('Loc')
                          );
                          
                          return (
                            <>
                              {/* Produtos Section */}
                              {productItems.length > 0 && (
                                <>
                                  <TableRow className="bg-slate-100">
                                    <TableCell colSpan={5} className="font-bold text-sm text-slate-700">
                                      Produtos
                                    </TableCell>
                                  </TableRow>
                                  {productItems.map((item, index) => (
                                    <TableRow key={`product-${index}`}>
                                      <TableCell className="font-medium pl-6">{highlightPlanName(item.name)}</TableCell>
                                      {/* Sem Kombo */}
                                      <TableCell className="text-right text-gray-500 text-sm">
                                        {formatCurrency(item.monthlyRefSemKombo)}
                                      </TableCell>
                                      <TableCell className="text-right font-semibold border-r-2">
                                        {formatCurrency(item.priceSemKombo)}
                                      </TableCell>
                                      {/* Com Kombo / Kombo Desativado */}
                                      {detectKombo() ? (
                                        <>
                                          <TableCell className="text-right text-gray-500 text-sm">
                                            {formatCurrency(item.monthlyRefComKombo)}
                                          </TableCell>
                                          <TableCell className="text-right font-semibold">
                                            {formatCurrency(item.priceComKombo)}
                                          </TableCell>
                                        </>
                                      ) : (
                                        <>
                                          <TableCell className="text-right text-gray-500 text-sm opacity-0">
                                            -
                                          </TableCell>
                                          <TableCell className="text-right font-semibold opacity-0">
                                            -
                                          </TableCell>
                                        </>
                                      )}
                                    </TableRow>
                                  ))}
                                </>
                              )}
                              
                              {/* Add-ons Section */}
                              {addonItems.length > 0 && (
                                <>
                                  <TableRow className="bg-slate-100">
                                    <TableCell colSpan={5} className="font-bold text-sm text-slate-700">
                                      Add-ons
                                    </TableCell>
                                  </TableRow>
                                  {addonItems.map((item, index) => (
                                    <TableRow key={`addon-${index}`}>
                                      <TableCell className="font-medium pl-6">{item.name}</TableCell>
                                      {/* Sem Kombo */}
                                      <TableCell className="text-right text-gray-500 text-sm">
                                        {formatCurrency(item.monthlyRefSemKombo)}
                                      </TableCell>
                                      <TableCell className="text-right font-semibold border-r-2">
                                        {formatCurrency(item.priceSemKombo)}
                                      </TableCell>
                                      {/* Com Kombo / Kombo Desativado */}
                                      {detectKombo() ? (
                                        <>
                                          <TableCell className="text-right text-gray-500 text-sm">
                                            {formatCurrency(item.monthlyRefComKombo)}
                                          </TableCell>
                                          <TableCell className="text-right font-semibold">
                                            {formatCurrency(item.priceComKombo)}
                                          </TableCell>
                                        </>
                                      ) : (
                                        <>
                                          <TableCell className="text-right text-gray-500 text-sm opacity-0">
                                            -
                                          </TableCell>
                                          <TableCell className="text-right font-semibold opacity-0">
                                            -
                                          </TableCell>
                                        </>
                                      )}
                                    </TableRow>
                                  ))}
                                </>
                              )}
                              
                              {/* Serviços Premium Section */}
                              {(() => {
                                const premiumServices = [];
                                
                                // Suporte Premium IMOB
                                if (product === 'imob' || product === 'both') {
                                  const isIncluded = imobPlan === 'k' || imobPlan === 'k2';
                                  premiumServices.push({
                                    name: 'Suporte Premium - IMOB',
                                    isIncluded: isIncluded,
                                    priceSemKombo: isIncluded ? null : 99,
                                    priceComKombo: isIncluded ? null : 75,
                                  });
                                }
                                
                                // CS Dedicado IMOB
                                if (product === 'imob' || product === 'both') {
                                  const isIncluded = imobPlan === 'k2';
                                  const isSelected = metrics.imobDedicatedCS;
                                  premiumServices.push({
                                    name: 'CS Dedicado - IMOB',
                                    isIncluded: isIncluded,
                                    isSelected: isSelected,
                                    priceSemKombo: isIncluded ? null : (isSelected ? 199 : null),
                                    priceComKombo: isIncluded ? null : (isSelected ? 149 : null),
                                  });
                                }
                                
                                // Suporte Premium LOC
                                if (product === 'loc' || product === 'both') {
                                  const isIncluded = locPlan === 'k' || locPlan === 'k2';
                                  premiumServices.push({
                                    name: 'Suporte Premium - LOC',
                                    isIncluded: isIncluded,
                                    priceSemKombo: isIncluded ? null : 99,
                                    priceComKombo: isIncluded ? null : 75,
                                  });
                                }
                                
                                // CS Dedicado LOC
                                if (product === 'loc' || product === 'both') {
                                  const isIncluded = locPlan === 'k2';
                                  const isSelected = metrics.locDedicatedCS;
                                  premiumServices.push({
                                    name: 'CS Dedicado - LOC',
                                    isIncluded: isIncluded,
                                    isSelected: isSelected,
                                    priceSemKombo: isIncluded ? null : (isSelected ? 199 : null),
                                    priceComKombo: isIncluded ? null : (isSelected ? 149 : null),
                                  });
                                }
                                
                                if (premiumServices.length > 0) {
                                  return (
                                    <>
                                      <TableRow className="bg-slate-100">
                                        <TableCell colSpan={5} className="font-bold text-sm text-slate-700">
                                          Serviços Premium
                                        </TableCell>
                                      </TableRow>
                                      {premiumServices.map((item, index) => (
                                        <TableRow key={`premium-${index}`}>
                                          <TableCell className="font-medium pl-6">{item.name}</TableCell>
                                          <TableCell className="text-right text-gray-500 text-sm">
                                            {item.isIncluded ? 'Incluído' : (item.priceSemKombo !== null ? formatCurrency(item.priceSemKombo) : 'Não Incluído')}
                                          </TableCell>
                                          <TableCell className="text-right font-semibold border-r-2">
                                            {item.isIncluded ? 'Incluído' : (item.priceSemKombo !== null ? formatCurrency(item.priceSemKombo) : 'Não Incluído')}
                                          </TableCell>
                                          {detectKombo() ? (
                                            <>
                                              <TableCell className="text-right text-gray-500 text-sm">
                                                {item.isIncluded ? 'Incluído' : (item.priceComKombo !== null ? formatCurrency(item.priceComKombo) : 'Não Incluído')}
                                              </TableCell>
                                              <TableCell className="text-right font-semibold">
                                                {item.isIncluded ? 'Incluído' : (item.priceComKombo !== null ? formatCurrency(item.priceComKombo) : 'Não Incluído')}
                                              </TableCell>
                                            </>
                                          ) : (
                                            <>
                                              <TableCell className="text-right text-gray-500 text-sm opacity-0">
                                                -
                                              </TableCell>
                                              <TableCell className="text-right font-semibold opacity-0">
                                                -
                                              </TableCell>
                                            </>
                                          )}
                                        </TableRow>
                                      ))}
                                    </>
                                  );
                                }
                                return null;
                              })()}
                            </>
                          );
                        })()}
                        
                        {/* Total Monthly Recurring */}
                        <TableRow className="border-t-2 bg-blue-50">
                          <TableCell className="font-bold text-lg py-4">Total Mensal</TableCell>
                          <TableCell className="text-right text-gray-500 text-sm py-4">
                            {formatCurrency(calculateMonthlyReferenceTotal(false))}
                          </TableCell>
                          <TableCell className="text-right font-bold text-gray-900 text-lg border-r-2 py-4">
                            {formatCurrency(calculateMonthlyRecurring(false))}
                          </TableCell>
                          {detectKombo() ? (
                            <>
                              <TableCell className="text-right text-gray-500 text-sm py-4">
                                {formatCurrency(calculateMonthlyReferenceTotal(true))}
                              </TableCell>
                              <TableCell className="text-right font-bold text-primary text-xl py-4">
                                {formatCurrency(calculateMonthlyRecurring(true))}
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="text-right text-gray-500 text-sm py-4 opacity-0">
                                -
                              </TableCell>
                              <TableCell className="text-right font-bold text-primary text-xl py-4 opacity-0">
                                -
                              </TableCell>
                            </>
                          )}
                        </TableRow>

                        {/* Implementation Cost - Gray background like category headers */}
                        <TableRow className="bg-slate-100 border-t-2 border-b-2 border-slate-300">
                          <TableCell className="font-medium">Implantação (única vez)</TableCell>
                          <TableCell className="text-right text-gray-500 text-sm">
                            {formatCurrency(calculateTotalImplementation(false))}
                          </TableCell>
                          <TableCell className="text-right font-semibold border-r-2">
                            {formatCurrency(calculateTotalImplementation(false))}
                          </TableCell>
                          {detectKombo() ? (
                            <>
                              <TableCell className="text-right text-gray-500 text-sm">
                                {formatCurrency(calculateTotalImplementation(true))}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(calculateTotalImplementation(true))}
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="text-right text-gray-500 text-sm opacity-0">
                                -
                              </TableCell>
                              <TableCell className="text-right font-semibold opacity-0">
                                -
                              </TableCell>
                            </>
                          )}
                        </TableRow>

                        {/* First Year Equivalent */}
                        <TableRow className="bg-blue-50 border-t">
                          <TableCell className="font-bold text-base py-4">
                            Anual Equivalente (1º ano)
                            <div className="text-xs font-normal text-gray-600 mt-1">
                              Inclui 12 meses + implantação
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-gray-500 text-sm py-4">
                            {formatCurrency(
                              (calculateMonthlyReferenceTotal(false) * 12) + 
                              calculateTotalImplementation(false)
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold text-gray-900 border-r-2 py-4">
                            {formatCurrency(calculateFirstYearTotal(false))}
                          </TableCell>
                          {detectKombo() ? (
                            <>
                              <TableCell className="text-right text-gray-500 text-sm py-4">
                                {formatCurrency(
                                  (calculateMonthlyReferenceTotal(true) * 12) + 
                                  calculateTotalImplementation(true)
                                )}
                              </TableCell>
                              <TableCell className="text-right font-bold text-primary text-lg py-4">
                                {formatCurrency(calculateFirstYearTotal(true))}
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="text-right text-gray-500 text-sm py-4 opacity-0">
                                -
                              </TableCell>
                              <TableCell className="text-right font-bold text-primary text-lg py-4 opacity-0">
                                -
                              </TableCell>
                            </>
                          )}
                        </TableRow>

                        {/* Savings row - Prominent highlight */}
                        {detectKombo() && (() => {
                          const lineItems = getLineItems();
                          // Monthly Sem Kombo (most expensive): monthly reference (+25%) * 12 + implementation without Kombo
                          const monthlySemKomboTotal = lineItems.reduce((sum, item) => sum + item.monthlyRefSemKombo, 0);
                          const firstYearMonthlySemKombo = (monthlySemKomboTotal * 12) + calculateTotalImplementation(false);
                          
                          // Selected Frequency Com Kombo (best price): frequency price with Kombo * 12 + implementation with Kombo
                          const firstYearFrequencyComKombo = calculateFirstYearTotal(true);
                          
                          const savings = firstYearMonthlySemKombo - firstYearFrequencyComKombo;
                          
                          return (
                            <TableRow className="bg-gradient-to-r from-green-500 to-emerald-600">
                              <TableCell colSpan={5} className="text-center py-6">
                                <div className="flex items-center justify-center gap-3">
                                  <span className="text-4xl">💰</span>
                                  <span className="text-white font-bold text-2xl">
                                    Economize até {formatCurrency(savings)} no 1º ano!
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })()}
                      </TableBody>
                      </Table>
                      
                      {/* Overlay message when Kombo is not active */}
                      {!detectKombo() && (
                        <div className="absolute top-[80px] right-0 w-[40%] bottom-[60px] flex items-center justify-center bg-gray-100/95 border-l-2 border-gray-300">
                          <div className="text-center px-6">
                            <p className="text-gray-600 text-lg font-medium italic">
                              Adicione mais add-ons
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              </div>

                {/* SECTION 2: CUSTOS PÓS-PAGO (VARIÁVEIS) */}
                <div className="mt-6 mb-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    5. Custos Pós-pago (Variáveis)
                  </h2>
                  
                  <Card>
                    <CardContent className="pt-6">
                    <div>
                      {/* IMOB Additional Users */}
                      {(product === 'imob' || product === 'both') && (() => {
                        const plan = imobPlan;
                        const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 12;
                        const additional = Math.max(0, metrics.imobUsers - included);
                        const totalCost = (() => {
                          if (plan === 'prime') return additional * 57;
                          else if (plan === 'k') {
                            const tier1 = Math.min(additional, 15);
                            const tier2 = Math.max(0, additional - 15);
                            return (tier1 * 47) + (tier2 * 37);
                          } else {
                            const tier1 = Math.min(additional, 15);
                            const tier2 = Math.min(Math.max(0, additional - 15), 35);
                            const tier3 = Math.max(0, additional - 50);
                            return (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
                          }
                        })();
                        const pricePerUnit = additional > 0 ? totalCost / additional : 0;

                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Usuários Adicionais (IMOB)</span>
                              <span className="text-xs text-gray-500 italic">
                                Incluídos: {included} | Adicionais: {additional}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={additional > 0 ? "text-sm font-semibold text-gray-900" : "text-sm text-green-600"}>
                                {additional > 0 ? formatCurrency(totalCost) : 'Incluído no plano'}
                              </span>
                              {additional > 0 && (
                                <span className="text-xs text-gray-500 italic">
                                  {formatCurrency(pricePerUnit, 2)}/usuário
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* LOC Additional Contracts */}
                      {(product === 'loc' || product === 'both') && (() => {
                        const plan = locPlan;
                        const included = plan === 'prime' ? 100 : plan === 'k' ? 250 : 500;
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

                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Contratos Adicionais (LOC)</span>
                              <span className="text-xs text-gray-500 italic">
                                Incluídos: {included} | Adicionais: {additional}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={additional > 0 ? "text-sm font-semibold text-gray-900" : "text-sm text-green-600"}>
                                {additional > 0 ? formatCurrency(totalCost) : 'Incluído no plano'}
                              </span>
                              {additional > 0 && (
                                <span className="text-xs text-gray-500 italic">
                                  {formatCurrency(pricePerUnit, 2)}/contrato
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Leads WhatsApp */}
                      {addons.leads && metrics.wantsWhatsApp && (() => {
                        const included = 150;
                        const totalLeads = metrics.leadsPerMonth;
                        const additional = Math.max(0, totalLeads - included);
                        const totalCost = (() => {
                          const tier1 = Math.min(additional, 200);
                          const tier2 = Math.min(Math.max(0, additional - 200), 150);
                          const tier3 = Math.min(Math.max(0, additional - 350), 650);
                          const tier4 = Math.max(0, additional - 1000);
                          return (tier1 * 2.5) + (tier2 * 2) + (tier3 * 1.5) + (tier4 * 1.2);
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

                      {/* Assinaturas */}
                      {addons.assinatura && (() => {
                        const included = 20;
                        let totalSignatures = 0;
                        if (product === 'imob') totalSignatures = metrics.closingsPerMonth;
                        else if (product === 'loc') totalSignatures = metrics.newContractsPerMonth;
                        else totalSignatures = metrics.closingsPerMonth + metrics.newContractsPerMonth;
                        const additional = Math.max(0, totalSignatures - included);
                        const totalCost = (() => {
                          const tier1 = Math.min(additional, 20);
                          const tier2 = Math.min(Math.max(0, additional - 20), 20);
                          const tier3 = Math.max(0, additional - 40);
                          return (tier1 * 1.9) + (tier2 * 1.7) + (tier3 * 1.5);
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

                      {/* Custo Boletos (Pay) */}
                      {addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both') && (() => {
                        const contracts = metrics.contractsUnderManagement;
                        const costPerBoleto = 3.00; // Kenlo's cost per boleto
                        const totalCost = contracts * costPerBoleto;

                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Custo Boletos (Pay)</span>
                              <span className="text-xs text-gray-500 italic">
                                {contracts} boletos × R$ 3,00
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(totalCost)}
                              </span>
                              <span className="text-xs text-gray-500 italic">
                                R$ 3,00/boleto
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Custo Split (Pay) */}
                      {addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both') && (() => {
                        const contracts = metrics.contractsUnderManagement;
                        const costPerSplit = 3.00; // Kenlo's cost per split
                        const totalCost = contracts * costPerSplit;

                        return (
                          <div className="flex justify-between items-start py-4 border-b border-gray-200">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-900">Custo Split (Pay)</span>
                              <span className="text-xs text-gray-500 italic">
                                {contracts} splits × R$ 3,00
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(totalCost)}
                              </span>
                              <span className="text-xs text-gray-500 italic">
                                R$ 3,00/split
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Support Services Costs */}
                      {(() => {
                        // Calculate support costs for IMOB
                        let imobSupportCost = 0;
                        if (product === 'imob' || product === 'both') {
                          // VIP Support: R$99/mês for Prime, free for K and K2
                          if (metrics.imobVipSupport && imobPlan === 'prime') {
                            imobSupportCost += 99;
                          }
                          // CS Dedicado: R$99/mês for Prime and K, free for K2
                          if (metrics.imobDedicatedCS && imobPlan !== 'k2') {
                            imobSupportCost += 99;
                          }
                        }
                        
                        // Calculate support costs for LOC
                        let locSupportCost = 0;
                        if (product === 'loc' || product === 'both') {
                          // VIP Support: R$99/mês for Prime, free for K and K2
                          if (metrics.locVipSupport && locPlan === 'prime') {
                            locSupportCost += 99;
                          }
                          // CS Dedicado: R$99/mês for Prime and K, free for K2
                          if (metrics.locDedicatedCS && locPlan !== 'k2') {
                            locSupportCost += 99;
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
                                {services.join(' + ')} @ R$ 99/mês cada
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(totalSupportCost)}
                              </span>
                              <span className="text-xs text-gray-500 italic">
                                R$ 99,00/serviço
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
                          if (metrics.imobVipSupport && imobPlan === 'prime') totalPostPaid += 99;
                          if (metrics.imobDedicatedCS && imobPlan !== 'k2') totalPostPaid += 99;
                        }
                        if (product === 'loc' || product === 'both') {
                          if (metrics.locVipSupport && locPlan === 'prime') totalPostPaid += 99;
                          if (metrics.locDedicatedCS && locPlan !== 'k2') totalPostPaid += 99;
                        }
                        
                        // Additional Users (Imob)
                        if (product === 'imob' || product === 'both') {
                          const plan = imobPlan;
                          const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 12;
                          const additional = Math.max(0, metrics.imobUsers - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 15);
                            const tier2 = Math.min(Math.max(0, additional - 15), 35);
                            const tier3 = Math.max(0, additional - 50);
                            totalPostPaid += tier1 * 47 + tier2 * 37 + tier3 * 27;
                          }
                        }
                        
                        // Additional Contracts (Loc)
                        if (product === 'loc' || product === 'both') {
                          const plan = locPlan;
                          const included = plan === 'prime' ? 100 : plan === 'k' ? 250 : 500;
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
                          const included = 150;
                          const additional = Math.max(0, metrics.leadsPerMonth - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 200);
                            const tier2 = Math.min(Math.max(0, additional - 200), 150);
                            const tier3 = Math.min(Math.max(0, additional - 350), 650);
                            const tier4 = Math.max(0, additional - 1000);
                            totalPostPaid += tier1 * 2.5 + tier2 * 2 + tier3 * 1.5 + tier4 * 1.2;
                          }
                        }
                        
                        // Digital Signatures
                        if (addons.assinatura) {
                          const included = 20;
                          let totalSignatures = 0;
                          if (product === 'imob' || product === 'both') totalSignatures += metrics.closingsPerMonth;
                          if (product === 'loc' || product === 'both') totalSignatures += metrics.newContractsPerMonth;
                          const additional = Math.max(0, totalSignatures - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 30);
                            const tier2 = Math.min(Math.max(0, additional - 30), 50);
                            const tier3 = Math.max(0, additional - 80);
                            totalPostPaid += tier1 * 1.9 + tier2 * 1.5 + tier3 * 1.2;
                          }
                        }
                        
                        // Boleto costs (Pay)
                        if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
                          totalPostPaid += metrics.contractsUnderManagement * 3.00;
                        }
                        
                        // Split costs (Pay)
                        if (addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both')) {
                          totalPostPaid += metrics.contractsUnderManagement * 3.00;
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

                {/* SECTION 6: THE KENLO EFFECT */}
                <div className="mt-6 mb-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">
                    6. The Kenlo Effect
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
                              if (product === 'imob' || product === 'both') {
                                const plan = imobPlan;
                                const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 12;
                                const additional = Math.max(0, metrics.imobUsers - included);
                                if (additional > 0) {
                                  if (plan === 'prime') totalPostPaid += additional * 57;
                                  else if (plan === 'k') {
                                    const tier1 = Math.min(additional, 15);
                                    const tier2 = Math.max(0, additional - 15);
                                    totalPostPaid += (tier1 * 47) + (tier2 * 37);
                                  } else {
                                    const tier1 = Math.min(additional, 15);
                                    const tier2 = Math.min(Math.max(0, additional - 15), 35);
                                    const tier3 = Math.max(0, additional - 50);
                                    totalPostPaid += (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
                                  }
                                }
                              }
                              if (product === 'loc' || product === 'both') {
                                const plan = locPlan;
                                const included = plan === 'prime' ? 100 : plan === 'k' ? 250 : 500;
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
                                const included = 150;
                                const totalLeads = metrics.leadsPerMonth;
                                const additional = Math.max(0, totalLeads - included);
                                if (additional > 0) {
                                  const tier1 = Math.min(additional, 200);
                                  const tier2 = Math.min(Math.max(0, additional - 200), 150);
                                  const tier3 = Math.min(Math.max(0, additional - 350), 650);
                                  const tier4 = Math.max(0, additional - 1000);
                                  totalPostPaid += (tier1 * 2.5) + (tier2 * 2) + (tier3 * 1.5) + (tier4 * 1.2);
                                }
                              }
                              if (addons.assinatura) {
                                const included = 20;
                                let totalSignatures = 0;
                                if (product === 'imob') totalSignatures = metrics.closingsPerMonth;
                                else if (product === 'loc') totalSignatures = metrics.newContractsPerMonth;
                                else totalSignatures = metrics.closingsPerMonth + metrics.newContractsPerMonth;
                                const additional = Math.max(0, totalSignatures - included);
                                if (additional > 0) {
                                  const tier1 = Math.min(additional, 20);
                                  const tier2 = Math.min(Math.max(0, additional - 20), 20);
                                  const tier3 = Math.max(0, additional - 40);
                                  totalPostPaid += (tier1 * 1.9) + (tier2 * 1.7) + (tier3 * 1.5);
                                }
                              }
                              if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
                                totalPostPaid += metrics.contractsUnderManagement * 3.00;
                              }
                              if (addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both')) {
                                totalPostPaid += metrics.contractsUnderManagement * 3.00;
                              }
                              // Support Services
                              if (product === 'imob' || product === 'both') {
                                if (metrics.imobVipSupport && imobPlan === 'prime') totalPostPaid += 99;
                                if (metrics.imobDedicatedCS && imobPlan !== 'k2') totalPostPaid += 99;
                              }
                              if (product === 'loc' || product === 'both') {
                                if (metrics.locVipSupport && locPlan === 'prime') totalPostPaid += 99;
                                if (metrics.locDedicatedCS && locPlan !== 'k2') totalPostPaid += 99;
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
                        if (product === 'imob' || product === 'both') {
                          const plan = imobPlan;
                          const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 12;
                          const additional = Math.max(0, metrics.imobUsers - included);
                          if (additional > 0) {
                            if (plan === 'prime') totalPostPaid += additional * 57;
                            else if (plan === 'k') {
                              const tier1 = Math.min(additional, 15);
                              const tier2 = Math.max(0, additional - 15);
                              totalPostPaid += (tier1 * 47) + (tier2 * 37);
                            } else {
                              const tier1 = Math.min(additional, 15);
                              const tier2 = Math.min(Math.max(0, additional - 15), 35);
                              const tier3 = Math.max(0, additional - 50);
                              totalPostPaid += (tier1 * 47) + (tier2 * 37) + (tier3 * 27);
                            }
                          }
                        }
                        if (product === 'loc' || product === 'both') {
                          const plan = locPlan;
                          const included = plan === 'prime' ? 100 : plan === 'k' ? 250 : 500;
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
                          const includedBoletos = plan === 'prime' ? 2 : plan === 'k' ? 10 : 20;
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
                          const included = 150;
                          const totalLeads = metrics.leadsPerMonth;
                          const additional = Math.max(0, totalLeads - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 200);
                            const tier2 = Math.min(Math.max(0, additional - 200), 150);
                            const tier3 = Math.min(Math.max(0, additional - 350), 650);
                            const tier4 = Math.max(0, additional - 1000);
                            totalPostPaid += (tier1 * 2.5) + (tier2 * 2) + (tier3 * 1.5) + (tier4 * 1.2);
                          }
                        }
                        if (addons.assinatura) {
                          const included = 20;
                          let totalSignatures = 0;
                          if (product === 'imob') totalSignatures = metrics.closingsPerMonth;
                          else if (product === 'loc') totalSignatures = metrics.newContractsPerMonth;
                          else totalSignatures = metrics.closingsPerMonth + metrics.newContractsPerMonth;
                          const additional = Math.max(0, totalSignatures - included);
                          if (additional > 0) {
                            const tier1 = Math.min(additional, 20);
                            const tier2 = Math.min(Math.max(0, additional - 20), 20);
                            const tier3 = Math.max(0, additional - 40);
                            totalPostPaid += (tier1 * 1.9) + (tier2 * 1.7) + (tier3 * 1.5);
                          }
                        }
                        if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
                          totalPostPaid += metrics.contractsUnderManagement * 3.00;
                        }
                        if (addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both')) {
                          totalPostPaid += metrics.contractsUnderManagement * 3.00;
                        }
                        // Support Services
                        if (product === 'imob' || product === 'both') {
                          if (metrics.imobVipSupport && imobPlan === 'prime') totalPostPaid += 99;
                          if (metrics.imobDedicatedCS && imobPlan !== 'k2') totalPostPaid += 99;
                        }
                        if (product === 'loc' || product === 'both') {
                          if (metrics.locVipSupport && locPlan === 'prime') totalPostPaid += 99;
                          if (metrics.locDedicatedCS && locPlan !== 'k2') totalPostPaid += 99;
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

                {/* Sticky Bottom Summary Bar - Kenlo Brand Colors */}
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-t border-gray-700">
                  <div className="container py-2 sm:py-3">
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                      {/* Products Badge - Primary (Kenlo Red) */}
                      <div className="bg-primary text-white px-3 py-1.5 rounded-full font-semibold shadow-md">
                        {product === "imob" && `Imob-${imobPlan.toUpperCase()}`}
                        {product === "loc" && `Loc-${locPlan.toUpperCase()}`}
                        {product === "both" && `Imob-${imobPlan.toUpperCase()} + Loc-${locPlan.toUpperCase()}`}
                      </div>

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

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 mb-24">
                  <Button className="flex-1 min-h-[50px]" size="lg" onClick={() => setShowExportDialog(true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Proposta (PDF)
                  </Button>
                  <Button variant="outline" size="lg" className="min-h-[50px] sm:flex-1">
                    Compartilhar com Cliente
                  </Button>
                </div>

            </CardContent>
          </Card>
        </div>

        {/* Export Dialog */}
        <ProposalExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
        onExport={async (salesPersonName, clientName) => {
          try {
            // Get selected addons as array
            const selectedAddons = Object.entries(addons)
              .filter(([_, enabled]) => enabled)
              .map(([name, _]) => name);

            // Calculate totals
            const items = getLineItems();
            const totalMonthly = items.reduce((sum: number, item: any) => sum + (detectKombo() ? item.priceComKombo : item.priceSemKombo), 0);
            const totalAnnual = totalMonthly * 12;
            const implantationFee = calculateTotalImplementation(detectKombo() !== null);
            const firstYearTotal = totalAnnual + implantationFee;
            
            // Calculate post-paid total
            let postPaidTotal = 0;
            
            // Support Services
            if (product === 'imob' || product === 'both') {
              if (metrics.imobVipSupport && imobPlan === 'prime') postPaidTotal += 99;
              if (metrics.imobDedicatedCS && imobPlan !== 'k2') postPaidTotal += 99;
            }
            if (product === 'loc' || product === 'both') {
              if (metrics.locVipSupport && locPlan === 'prime') postPaidTotal += 99;
              if (metrics.locDedicatedCS && locPlan !== 'k2') postPaidTotal += 99;
            }
            
            // Additional Users (Imob)
            if (product === 'imob' || product === 'both') {
              const plan = imobPlan;
              const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 12;
              const additional = Math.max(0, metrics.imobUsers - included);
              if (additional > 0) {
                const tier1 = Math.min(additional, 15);
                const tier2 = Math.min(Math.max(0, additional - 15), 35);
                const tier3 = Math.max(0, additional - 50);
                postPaidTotal += tier1 * 47 + tier2 * 37 + tier3 * 27;
              }
            }
            
            // Additional Contracts (Loc)
            if (product === 'loc' || product === 'both') {
              const plan = locPlan;
              const included = plan === 'prime' ? 100 : plan === 'k' ? 250 : 500;
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
              const included = 150;
              const additional = Math.max(0, metrics.leadsPerMonth - included);
              if (additional > 0) {
                const tier1 = Math.min(additional, 200);
                const tier2 = Math.min(Math.max(0, additional - 200), 150);
                const tier3 = Math.min(Math.max(0, additional - 350), 650);
                const tier4 = Math.max(0, additional - 1000);
                postPaidTotal += tier1 * 2.5 + tier2 * 2 + tier3 * 1.5 + tier4 * 1.2;
              }
            }
            
            // Digital Signatures
            if (addons.assinatura) {
              const included = 20;
              let totalSignatures = 0;
              if (product === 'imob' || product === 'both') totalSignatures += metrics.closingsPerMonth;
              if (product === 'loc' || product === 'both') totalSignatures += metrics.newContractsPerMonth;
              const additional = Math.max(0, totalSignatures - included);
              if (additional > 0) {
                const tier1 = Math.min(additional, 30);
                const tier2 = Math.min(Math.max(0, additional - 30), 50);
                const tier3 = Math.max(0, additional - 80);
                postPaidTotal += tier1 * 1.9 + tier2 * 1.5 + tier3 * 1.2;
              }
            }
            
            // Boleto costs (Pay)
            if (addons.pay && metrics.chargesBoletoToTenant && (product === 'loc' || product === 'both')) {
              postPaidTotal += metrics.contractsUnderManagement * 3.00;
            }
            
            // Split costs (Pay)
            if (addons.pay && metrics.chargesSplitToOwner && (product === 'loc' || product === 'both')) {
              postPaidTotal += metrics.contractsUnderManagement * 3.00;
            }
            
            // The Kenlo Effect
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

            const proposalData = {
              salesPersonName,
              clientName,
              productType: product,
              imobPlan: (product === "imob" || product === "both") ? imobPlan : undefined,
              locPlan: (product === "loc" || product === "both") ? locPlan : undefined,
              imobUsers: metrics.imobUsers,
              closings: metrics.closingsPerMonth,
              leads: metrics.leadsPerMonth,
              externalAI: metrics.usesExternalAI ? 1 : 0,
              whatsapp: metrics.wantsWhatsApp ? 1 : 0,
              imobVipSupport: metrics.imobVipSupport ? 1 : 0,
              imobDedicatedCS: metrics.imobDedicatedCS ? 1 : 0,
              contracts: metrics.contractsUnderManagement,
              newContracts: metrics.newContractsPerMonth,
              locVipSupport: metrics.locVipSupport ? 1 : 0,
              locDedicatedCS: metrics.locDedicatedCS ? 1 : 0,
              chargesBoleto: metrics.chargesBoletoToTenant ? 1 : 0,
              boletoAmount: metrics.boletoChargeAmount,
              chargesSplit: metrics.chargesSplitToOwner ? 1 : 0,
              splitAmount: metrics.splitChargeAmount,
              selectedAddons: JSON.stringify(selectedAddons),
              paymentPlan: frequency,
              totalMonthly,
              totalAnnual,
              implantationFee,
              firstYearTotal,
              postPaidTotal,
              revenueFromBoletos,
              revenueFromInsurance,
              netGain,
            };

            // Generate PDF
            toast.loading("Gerando PDF...");
            const pdfResult = await generatePDF.mutateAsync(proposalData);
            
            if (pdfResult.success && pdfResult.pdf) {
              // Download PDF
              console.log("PDF base64 length:", pdfResult.pdf.length);
              const pdfBlob = new Blob(
                [Uint8Array.from(atob(pdfResult.pdf), c => c.charCodeAt(0))],
                { type: "application/pdf" }
              );
              console.log("PDF Blob size:", pdfBlob.size);
              const url = URL.createObjectURL(pdfBlob);
              const a = document.createElement("a");
              a.href = url;
              a.download = pdfResult.filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);

              // Save to database
              await createProposal.mutateAsync(proposalData);
              
              toast.dismiss();
              toast.success("Proposta gerada e salva com sucesso!");
            }
          } catch (error) {
            toast.dismiss();
            toast.error("Erro ao gerar proposta. Tente novamente.");
            console.error("Error generating proposal:", error);
            throw error;
          }
        }}
        />
      </div>
  );
}
