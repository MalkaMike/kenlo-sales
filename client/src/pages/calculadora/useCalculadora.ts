/**
 * useCalculadora - Custom hook for all Calculadora state and logic
 * Extracted from CalculadoraPage.tsx for better modularity
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearch } from "wouter";
import { useSalesperson } from "@/hooks/useSalesperson";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { downloadProposalPDF } from "@/utils/generateProposalPDF";
import * as Pricing from "@/utils/pricing";
import type { KomboColumnData } from "@/components/KomboComparisonTable";
import type { QuoteInfo } from "@/components/QuoteInfoDialog";

import {
  type ProductSelection,
  type PlanTier,
  type PaymentFrequency,
  type KomboType,
  type BusinessType,
  type BusinessNatureState,
  type MetricsState,
  type AddonsState,
  type LineItem,
  KOMBOS,
  PLAN_ANNUAL_PRICES,
  ADDON_ANNUAL_PRICES,
  IMPLEMENTATION_COSTS,
  PAYMENT_FREQUENCY_MULTIPLIERS,
  roundToEndIn7,
  calculateAdditionalUsersCost,
  toNum,
  parseIntegerInput,
  parseCurrency,
  formatCurrency,
  fmtNum,
  fmtPrice,
  isAuthorizedEmail,
  DEFAULT_BUSINESS_NATURE,
  DEFAULT_METRICS,
  DEFAULT_ADDONS,
  RESET_ADDONS,
  RESET_METRICS,
  frequencyLabels,
  frequencyBadges,
  frequencyInstallments,
} from "./types";

export function useCalculadora() {
  // ─── Authentication ─────────────────────────────────────────────────────────
  const { salesperson, isAuthenticated: isSalespersonAuth } = useSalesperson();
  const { user: oauthUser } = useAuth();
  const canExportPDF = isSalespersonAuth || isAuthorizedEmail(oauthUser?.email);

  // ─── Business Nature State ──────────────────────────────────────────────────
  const [businessNature, setBusinessNature] = useState<BusinessNatureState>(DEFAULT_BUSINESS_NATURE);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const isBusinessNatureComplete = useCallback((): boolean => {
    if (businessNature.businessType === "broker" || businessNature.businessType === "both") {
      if (businessNature.hasWebsite === null) return false;
      if (businessNature.hasWebsite && businessNature.websiteUrl === "") return false;
    }
    if (businessNature.businessType === "broker" || businessNature.businessType === "both") {
      if (businessNature.hasCRM === null) return false;
      if (businessNature.hasCRM && businessNature.crmSystem === "") return false;
    }
    if (businessNature.businessType === "rental_admin" || businessNature.businessType === "both") {
      if (businessNature.hasERP === null) return false;
      if (businessNature.hasERP && businessNature.erpSystem === "") return false;
    }
    return true;
  }, [businessNature]);

  // ─── Product & Plan State ───────────────────────────────────────────────────
  const [product, setProduct] = useState<ProductSelection>("imob");
  const [addons, setAddons] = useState<AddonsState>(DEFAULT_ADDONS);
  const [metrics, setMetrics] = useState<MetricsState>(DEFAULT_METRICS);
  const [frequency, setFrequency] = useState<PaymentFrequency>("annual");
  const [prepayAdditionalUsers, setPrepayAdditionalUsers] = useState(false);
  const [prepayAdditionalContracts, setPrepayAdditionalContracts] = useState(false);

  // ─── Quote & UI State ───────────────────────────────────────────────────────
  const [showQuoteInfoDialog, setShowQuoteInfoDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [selectedColumnsData, setSelectedColumnsData] = useState<KomboColumnData[]>([]);
  const [pendingQuoteInfo, setPendingQuoteInfo] = useState<QuoteInfo | null>(null);
  const [animateMetrics, setAnimateMetrics] = useState(false);
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);
  const prevProductRef = useRef<ProductSelection>(product);
  const configSectionRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // ─── Plan Recommendations ──────────────────────────────────────────────────
  const [imobPlan, setImobPlan] = useState<PlanTier>("k");
  const [locPlan, setLocPlan] = useState<PlanTier>("k");
  const [recommendedImobPlan, setRecommendedImobPlan] = useState<PlanTier>("k");
  const [recommendedLocPlan, setRecommendedLocPlan] = useState<PlanTier>("k");

  // ─── tRPC Mutations ────────────────────────────────────────────────────────
  const generatePDF = trpc.proposals.generatePDF.useMutation();
  const createProposal = trpc.proposals.create.useMutation();
  const saveQuoteMutation = trpc.quotes.save.useMutation();

  // ─── Reset Handler ─────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setBusinessNature({
      ...DEFAULT_BUSINESS_NATURE,
    });
    setProduct("imob");
    setAddons(RESET_ADDONS);
    setMetrics(RESET_METRICS);
    setFrequency("annual");
    setPrepayAdditionalUsers(false);
    setPrepayAdditionalContracts(false);
    setSelectedPlan(null);
    setImobPlan("k");
    setLocPlan("k");
    setRecommendedImobPlan("k");
    setRecommendedLocPlan("k");
  }, []);

  // ─── Addon Availability ────────────────────────────────────────────────────
  const isAddonAvailable = useCallback((addon: keyof AddonsState) => {
    if (addon === "leads") return product === "imob" || product === "both";
    if (addon === "inteligencia") return true;
    if (addon === "assinatura") return true;
    if (addon === "pay") return product === "loc" || product === "both";
    if (addon === "seguros") return product === "loc" || product === "both";
    if (addon === "cash") return product === "loc" || product === "both";
    return false;
  }, [product]);

  // ─── Kombo Detection ──────────────────────────────────────────────────────
  const detectKombo = useCallback((): KomboType => {
    const activeAddons = Object.entries(addons)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name);

    if (product === "both") {
      const allAddonsPresent = KOMBOS.elite.requiredAddons.every(addon => activeAddons.includes(addon));
      if (allAddonsPresent) return "elite";
    }
    if (product === "both" && activeAddons.length === 0) {
      return "core_gestao";
    }
    if (product === "imob") {
      const hasRequired = KOMBOS.imob_pro.requiredAddons.every(addon => activeAddons.includes(addon));
      if (hasRequired) return "imob_pro";
    }
    if (product === "imob") {
      const hasRequired = KOMBOS.imob_start.requiredAddons.every(addon => activeAddons.includes(addon));
      const hasForbidden = activeAddons.includes("inteligencia");
      if (hasRequired && !hasForbidden) return "imob_start";
    }
    if (product === "loc") {
      const hasRequired = KOMBOS.locacao_pro.requiredAddons.every(addon => activeAddons.includes(addon));
      const hasForbidden = activeAddons.includes("leads");
      if (hasRequired && !hasForbidden) return "locacao_pro";
    }
    return "none";
  }, [addons, product]);

  const activeKombo: KomboType = detectKombo();
  const komboInfo = activeKombo !== "none" ? KOMBOS[activeKombo] : null;

  // ─── Pricing Calculations ──────────────────────────────────────────────────
  const calculateMonthlyReference = useCallback((annualPrice: number): number => {
    const monthlyPrice = annualPrice * PAYMENT_FREQUENCY_MULTIPLIERS.monthly;
    return roundToEndIn7(Math.round(monthlyPrice));
  }, []);

  const calculatePrice = useCallback((annualPrice: number, freq: PaymentFrequency): number => {
    const multiplier = PAYMENT_FREQUENCY_MULTIPLIERS[freq];
    const price = annualPrice * multiplier;
    return roundToEndIn7(Math.round(price));
  }, []);

  const getLineItems = useCallback((): LineItem[] => {
    const komboDiscount = komboInfo ? (1 - komboInfo.discount) : 1;
    const items: LineItem[] = [];

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

    return items;
  }, [product, imobPlan, locPlan, addons, frequency, komboInfo, calculateMonthlyReference, calculatePrice, isAddonAvailable]);

  const recommendBestKombo = useCallback((): { kombo: KomboType; savings: number; message: string } | null => {
    if (activeKombo !== "none") return null;

    const currentActiveAddons = Object.entries(addons)
      .filter(([_, enabled]) => enabled)
      .map(([name, _]) => name as keyof AddonsState);

    const currentCost = getLineItems().reduce((sum, item) => sum + item.priceSemKombo, 0);

    let bestKombo: KomboType | null = null;
    let bestSavings = 0;
    let bestMessage = "";

    Object.entries(KOMBOS).forEach(([komboKey, kombo]) => {
      const komboType = komboKey as KomboType;
      if (!kombo.requiredProducts.includes(product)) return;

      const missingAddons = kombo.requiredAddons.filter(
        addon => !currentActiveAddons.includes(addon as keyof AddonsState)
      );

      if ('forbiddenAddons' in kombo && kombo.forbiddenAddons?.some((addon: string) => currentActiveAddons.includes(addon as keyof AddonsState))) return;

      const komboDiscount = 1 - kombo.discount;
      let projectedCost = currentCost * komboDiscount;

      missingAddons.forEach(addon => {
        if (addon === "leads") projectedCost += Pricing.getAddonAnnualPrice('leads') * komboDiscount;
        if (addon === "inteligencia") projectedCost += Pricing.getAddonAnnualPrice('inteligencia') * komboDiscount;
        if (addon === "assinatura") projectedCost += 0;
        if (addon === "pay") projectedCost += 0;
      });

      const savings = currentCost - projectedCost;

      if (savings > 50 && savings > bestSavings) {
        bestKombo = komboType;
        bestSavings = savings;

        if (missingAddons.length === 0) {
          bestMessage = `Ative o ${kombo.name} e economize R$${Math.round(bestSavings).toLocaleString('pt-BR')}/mês!`;
        } else {
          const addonNames = missingAddons.map(a => {
            if (a === "leads") return "Leads";
            if (a === "inteligencia") return "Inteligência";
            if (a === "assinatura") return "Assinatura";
            if (a === "pay") return "Pay";
            return a;
          }).join(", ");
          bestMessage = `Adicione ${addonNames} e ative o ${kombo.name} para economizar R$${Math.round(bestSavings).toLocaleString('pt-BR')}/mês!`;
        }
      }
    });

    return bestKombo ? { kombo: bestKombo, savings: bestSavings, message: bestMessage } : null;
  }, [activeKombo, addons, product, getLineItems]);

  const komboRecommendation = recommendBestKombo();

  const calculateImobPlanCost = useCallback((plan: PlanTier, users: number): number => {
    const baseCost = PLAN_ANNUAL_PRICES[plan];
    const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
    const additional = Math.max(0, users - included);
    let additionalCost = 0;
    if (additional > 0) {
      additionalCost = calculateAdditionalUsersCost(plan, additional);
    }
    return baseCost + additionalCost;
  }, []);

  const calculateLocPlanCost = useCallback((plan: PlanTier, contracts: number): number => {
    const baseCost = PLAN_ANNUAL_PRICES[plan];
    const included = plan === 'prime' ? 100 : plan === 'k' ? 150 : 500;
    const additional = Math.max(0, contracts - included);
    let additionalCost = 0;
    if (additional > 0) {
      if (plan === 'prime') additionalCost = additional * 3;
      else if (plan === 'k') {
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
  }, []);

  const calculateTotalImplementation = useCallback((withKombo: boolean = false) => {
    if (withKombo && komboInfo) {
      return 1497;
    }
    const items = getLineItems();
    return items.reduce((sum, item) => sum + (item.implantation || 0), 0);
  }, [komboInfo, getLineItems]);

  const calculateKomboDiscount = useCallback(() => {
    if (!komboInfo) return 0;
    const lineItems = getLineItems();
    const subtotal = lineItems.reduce((sum, item) => sum + item.priceSemKombo, 0);
    return Math.round(subtotal * komboInfo.discount);
  }, [komboInfo, getLineItems]);

  const calculateMonthlyReferenceTotal = useCallback((withKombo: boolean = false): number => {
    const lineItems = getLineItems();
    return lineItems.reduce((sum, item) =>
      sum + (withKombo ? item.monthlyRefComKombo : item.monthlyRefSemKombo), 0
    );
  }, [getLineItems]);

  const calculateMonthlyRecurring = useCallback((withKombo: boolean = false): number => {
    const lineItems = getLineItems();
    const subtotal = lineItems.reduce((sum, item) => sum + (withKombo ? item.priceComKombo : item.priceSemKombo), 0);
    return subtotal;
  }, [getLineItems]);

  const calculatePrepaymentAmount = useCallback((): { users: number; contracts: number; total: number } => {
    const months = frequency === 'annual' ? 12 : frequency === 'biennial' ? 24 : 0;
    if (months === 0) return { users: 0, contracts: 0, total: 0 };

    let usersPrepayment = 0;
    let contractsPrepayment = 0;

    if ((product === 'imob' || product === 'both') && prepayAdditionalUsers) {
      const plan = imobPlan;
      const included = plan === 'prime' ? 2 : plan === 'k' ? 5 : 10;
      const additional = Math.max(0, toNum(metrics.imobUsers) - included);
      if (additional > 0) {
        const monthlyCost = calculateAdditionalUsersCost(plan, additional);
        usersPrepayment = monthlyCost * months;
      }
    }

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
  }, [frequency, product, prepayAdditionalUsers, prepayAdditionalContracts, imobPlan, locPlan, metrics.imobUsers, metrics.contractsUnderManagement]);

  const calculateFirstYearTotal = useCallback((withKombo: boolean = false) => {
    const monthlyRecurring = calculateMonthlyRecurring(withKombo);
    const implementation = calculateTotalImplementation(withKombo);
    const prepayment = calculatePrepaymentAmount();
    return (monthlyRecurring * 12) + implementation + prepayment.total;
  }, [calculateMonthlyRecurring, calculateTotalImplementation, calculatePrepaymentAmount]);

  const calculatePayPostPago = useCallback(() => {
    if (!addons.pay || !(product === "loc" || product === "both")) return 0;
    const avgRent = 2000;
    const monthlyVolume = toNum(metrics.contractsUnderManagement) * avgRent;
    return Math.round(monthlyVolume * 0.015);
  }, [addons.pay, product, metrics.contractsUnderManagement]);

  // ─── URL Params ────────────────────────────────────────────────────────────
  const searchString = useSearch();

  const generateShareableURL = useCallback((): string => {
    const params = new URLSearchParams();
    params.set('p', product);
    params.set('ip', imobPlan);
    params.set('lp', locPlan);
    params.set('f', frequency);
    params.set('a', [
      addons.leads ? '1' : '0',
      addons.inteligencia ? '1' : '0',
      addons.assinatura ? '1' : '0',
      addons.pay ? '1' : '0',
      addons.seguros ? '1' : '0',
      addons.cash ? '1' : '0',
    ].join(''));
    params.set('iu', metrics.imobUsers.toString());
    params.set('cm', metrics.closingsPerMonth.toString());
    params.set('lm', metrics.leadsPerMonth.toString());
    params.set('cu', metrics.contractsUnderManagement.toString());
    params.set('nc', metrics.newContractsPerMonth.toString());
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
    params.set('ba', String(toNum(metrics.boletoChargeAmount)));
    params.set('sa', String(toNum(metrics.splitChargeAmount)));
    const baseUrl = window.location.origin + '/cotacao';
    return `${baseUrl}?${params.toString()}`;
  }, [product, imobPlan, locPlan, frequency, addons, metrics]);

  // ─── Effects ───────────────────────────────────────────────────────────────

  // Load from URL params
  useEffect(() => {
    if (!searchString) return;
    const params = new URLSearchParams(searchString);
    const p = params.get('p');
    if (p && ['imob', 'loc', 'both'].includes(p)) setProduct(p as ProductSelection);
    const ip = params.get('ip');
    if (ip && ['prime', 'k', 'k2'].includes(ip)) setImobPlan(ip as PlanTier);
    const lp = params.get('lp');
    if (lp && ['prime', 'k', 'k2'].includes(lp)) setLocPlan(lp as PlanTier);
    const f = params.get('f');
    if (f && ['monthly', 'semestral', 'annual', 'biennial'].includes(f)) setFrequency(f as PaymentFrequency);
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
    const iu = params.get('iu');
    const cm = params.get('cm');
    const lm = params.get('lm');
    const cu = params.get('cu');
    const nc = params.get('nc');
    const ba = params.get('ba');
    const sa = params.get('sa');
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

  // Auto-recommend plans based on metrics
  useEffect(() => {
    if (product === "imob" || product === "both") {
      const users = toNum(metrics.imobUsers);
      let recommended: PlanTier = 'prime';
      if (users >= 16) recommended = 'k2';
      else if (users >= 5) recommended = 'k';
      else recommended = 'prime';
      setRecommendedImobPlan(recommended);
      setImobPlan(recommended);
    }
    if (product === "loc" || product === "both") {
      const contracts = toNum(metrics.contractsUnderManagement);
      let recommended: PlanTier = 'prime';
      if (contracts >= 500) recommended = 'k2';
      else if (contracts >= 200) recommended = 'k';
      else recommended = 'prime';
      setRecommendedLocPlan(recommended);
      setLocPlan(recommended);
    }
  }, [metrics.imobUsers, metrics.contractsUnderManagement, product]);

  // Auto-set premium services based on plan tier
  useEffect(() => {
    setMetrics(prev => {
      const newMetrics = { ...prev };
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
      newMetrics.imobVipSupport = vipIncluded;
      newMetrics.locVipSupport = vipIncluded;
      newMetrics.imobDedicatedCS = csIncluded;
      newMetrics.locDedicatedCS = csIncluded;
      return newMetrics;
    });
  }, [imobPlan, locPlan, product]);

  // Sync product from business type
  useEffect(() => {
    const bt = businessNature.businessType;
    if (bt === "broker") setProduct("imob");
    else if (bt === "rental_admin") setProduct("loc");
    else if (bt === "both") setProduct("both");
  }, [businessNature.businessType]);

  // Sticky bar intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    if (configSectionRef.current) {
      observer.observe(configSectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // ─── Example Generation ────────────────────────────────────────────────────
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

    const komboConfigs = [
      { product: "imob" as ProductSelection, addons: ["leads", "assinatura"], komboId: "imob_start", komboName: "Kombo Imob Start", discount: 10 },
      { product: "imob" as ProductSelection, addons: ["leads", "inteligencia", "assinatura"], komboId: "imob_pro", komboName: "Kombo Imob Pro", discount: 15 },
      { product: "loc" as ProductSelection, addons: ["inteligencia", "assinatura"], komboId: "locacao_pro", komboName: "Kombo Locação Pro", discount: 10 },
      { product: "both" as ProductSelection, addons: [] as string[], komboId: "core_gestao", komboName: "Kombo Core Gestão", discount: 0 },
      { product: "both" as ProductSelection, addons: ["leads", "inteligencia", "assinatura", "pay", "seguros"], komboId: "elite", komboName: "Kombo Elite", discount: 20 },
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

        const imobUsers = randInt(2, 30);
        const closings = randInt(2, 20);
        const leadsMonth = randInt(50, 500);
        const contracts = randInt(50, 800);
        const newContracts = randInt(2, 25);

        const iplan = planForImobUsers(imobUsers);
        const lplan = planForLocContracts(contracts);
        const wantsWA = config.addons.includes("leads") ? randBool() : false;
        const chargesBoleto = config.addons.includes("pay") ? randBool() : false;
        const chargesSplit = config.addons.includes("pay") ? randBool() : false;
        const boletoAmt = chargesBoleto ? pick([5, 7.5, 8.5, 10, 12]) : 0;
        const splitAmt = chargesSplit ? pick([5, 8, 10, 12, 15]) : 0;

        const freqMult = PAYMENT_FREQUENCY_MULTIPLIERS[freq];
        const discountMult = config.komboId ? (1 - config.discount / 100) : 1;

        let totalMonthly = 0;
        if (config.product === "imob" || config.product === "both") {
          totalMonthly += roundToEndIn7(PLAN_ANNUAL_PRICES[iplan] * freqMult * discountMult);
        }
        if (config.product === "loc" || config.product === "both") {
          totalMonthly += roundToEndIn7(PLAN_ANNUAL_PRICES[lplan] * freqMult * discountMult);
        }
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

        const vipIncluded = !!config.komboId;
        const csIncluded = !!config.komboId;
        const vipPrice = 0;
        const csPrice = 0;

        let postPaidTotal = 0;
        const ppBreakdown: any = { total: 0 };

        // IMOB: Additional Users
        if (config.product === "imob" || config.product === "both") {
          const included = iplan === "prime" ? 2 : iplan === "k" ? 5 : 10;
          const additional = Math.max(0, imobUsers - included);
          if (additional > 0) {
            const userCost = calculateAdditionalUsersCost(iplan, additional);
            postPaidTotal += userCost;
            if (!ppBreakdown.imobAddons) ppBreakdown.imobAddons = { groupLabel: "IMOB", groupTotal: 0, items: [] };
            ppBreakdown.imobAddons.items.push({ label: "Usuários Adicionais", included, additional, total: userCost, perUnit: iplan === "prime" ? 57 : iplan === "k" ? 47 : 37, unitLabel: "usuário" });
            ppBreakdown.imobAddons.groupTotal += userCost;
          }
        }

        // LOC: Additional Contracts
        if (config.product === "loc" || config.product === "both") {
          const included = lplan === "prime" ? 100 : lplan === "k" ? 150 : 500;
          const additional = Math.max(0, contracts - included);
          if (additional > 0) {
            let contractCost = 0;
            if (lplan === "prime") contractCost = additional * 3;
            else if (lplan === "k") { const t1 = Math.min(additional, 250); const t2 = Math.max(0, additional - 250); contractCost = t1 * 3 + t2 * 2.5; }
            else { const t1 = Math.min(additional, 250); const t2 = Math.min(Math.max(0, additional - 250), 250); const t3 = Math.max(0, additional - 500); contractCost = t1 * 3 + t2 * 2.5 + t3 * 2; }
            postPaidTotal += contractCost;
            if (!ppBreakdown.locAddons) ppBreakdown.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
            ppBreakdown.locAddons.items.push({ label: "Contratos Adicionais", included, additional, total: contractCost, perUnit: 3, unitLabel: "contrato" });
            ppBreakdown.locAddons.groupTotal += contractCost;
          }

          if (chargesBoleto && config.addons.includes("pay")) {
            const inclBoletos = lplan === "prime" ? 2 : lplan === "k" ? 5 : 15;
            const addBoletos = Math.max(0, contracts - inclBoletos);
            if (addBoletos > 0) {
              let boletoCost = 0;
              if (lplan === "prime") boletoCost = addBoletos * 4;
              else if (lplan === "k") { const bt1 = Math.min(addBoletos, 250); const bt2 = Math.max(0, addBoletos - 250); boletoCost = bt1 * 4 + bt2 * 3.5; }
              else { const bt1 = Math.min(addBoletos, 250); const bt2 = Math.min(Math.max(0, addBoletos - 250), 250); const bt3 = Math.max(0, addBoletos - 500); boletoCost = bt1 * 4 + bt2 * 3.5 + bt3 * 3; }
              postPaidTotal += boletoCost;
              if (!ppBreakdown.locAddons) ppBreakdown.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
              ppBreakdown.locAddons.items.push({ label: "Custo Boletos (Pay)", included: inclBoletos, additional: addBoletos, total: boletoCost, perUnit: 4, unitLabel: "boleto" });
              ppBreakdown.locAddons.groupTotal += boletoCost;
            }
          }

          if (chargesSplit && config.addons.includes("pay")) {
            const inclSplits = lplan === "prime" ? 2 : lplan === "k" ? 5 : 15;
            const addSplits = Math.max(0, contracts - inclSplits);
            if (addSplits > 0) {
              let splitCost = 0;
              if (lplan === "prime") splitCost = addSplits * 4;
              else if (lplan === "k") { const st1 = Math.min(addSplits, 250); const st2 = Math.max(0, addSplits - 250); splitCost = st1 * 4 + st2 * 3.5; }
              else { const st1 = Math.min(addSplits, 250); const st2 = Math.min(Math.max(0, addSplits - 250), 250); const st3 = Math.max(0, addSplits - 500); splitCost = st1 * 4 + st2 * 3.5 + st3 * 3; }
              postPaidTotal += splitCost;
              if (!ppBreakdown.locAddons) ppBreakdown.locAddons = { groupLabel: "LOCAÇÃO", groupTotal: 0, items: [] };
              ppBreakdown.locAddons.items.push({ label: "Custo Split (Pay)", included: inclSplits, additional: addSplits, total: splitCost, perUnit: 4, unitLabel: "split" });
              ppBreakdown.locAddons.groupTotal += splitCost;
            }
          }
        }

        // Shared: Digital Signatures
        if (config.addons.includes("assinatura")) {
          const included = 15;
          let totalSigs = 0;
          if (config.product === "imob" || config.product === "both") totalSigs += closings;
          if (config.product === "loc" || config.product === "both") totalSigs += newContracts;
          const additional = Math.max(0, totalSigs - included);
          if (additional > 0) {
            const st1 = Math.min(additional, 20); const st2 = Math.min(Math.max(0, additional - 20), 20); const st3 = Math.max(0, additional - 40);
            const sigCost = st1 * 1.8 + st2 * 1.7 + st3 * 1.5;
            postPaidTotal += sigCost;
            if (!ppBreakdown.sharedAddons) ppBreakdown.sharedAddons = { groupLabel: "Add-ons Compartilhados (IMOB + LOC)", groupTotal: 0, items: [] };
            ppBreakdown.sharedAddons.items.push({ label: "Assinaturas Digitais (compartilhado)", included, additional, total: sigCost, perUnit: 1.8, unitLabel: "assinatura" });
            ppBreakdown.sharedAddons.groupTotal += sigCost;
          }
        }

        // WhatsApp Messages
        if (config.addons.includes("leads") && wantsWA) {
          const included = 100;
          const additional = Math.max(0, leadsMonth - included);
          if (additional > 0) {
            const wt1 = Math.min(additional, 200); const wt2 = Math.min(Math.max(0, additional - 200), 150); const wt3 = Math.min(Math.max(0, additional - 350), 650); const wt4 = Math.max(0, additional - 1000);
            const waCost = wt1 * 2 + wt2 * 1.8 + wt3 * 1.5 + wt4 * 1.2;
            postPaidTotal += waCost;
            if (!ppBreakdown.sharedAddons) ppBreakdown.sharedAddons = { groupLabel: "Add-ons Compartilhados (IMOB + LOC)", groupTotal: 0, items: [] };
            ppBreakdown.sharedAddons.items.push({ label: "Mensagens WhatsApp", included, additional, total: waCost, perUnit: 2, unitLabel: "msg" });
            ppBreakdown.sharedAddons.groupTotal += waCost;
          }
        }

        ppBreakdown.total = postPaidTotal;

        const revenueFromBoletos = (chargesBoleto || chargesSplit) && (config.product === "loc" || config.product === "both")
          ? contracts * (boletoAmt + splitAmt) : 0;
        const revenueFromInsurance = config.addons.includes("seguros") && (config.product === "loc" || config.product === "both")
          ? contracts * 10 : 0;
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

  // ─── Return ────────────────────────────────────────────────────────────────
  return {
    // Auth
    canExportPDF,
    salesperson,
    oauthUser,

    // Business Nature
    businessNature,
    setBusinessNature,
    showValidationErrors,
    setShowValidationErrors,
    isBusinessNatureComplete,

    // Product & Plans
    product,
    setProduct,
    addons,
    setAddons,
    metrics,
    setMetrics,
    frequency,
    setFrequency,
    imobPlan,
    setImobPlan,
    locPlan,
    setLocPlan,
    recommendedImobPlan,
    recommendedLocPlan,
    isAddonAvailable,

    // Prepayment
    prepayAdditionalUsers,
    setPrepayAdditionalUsers,
    prepayAdditionalContracts,
    setPrepayAdditionalContracts,

    // Kombo
    activeKombo,
    komboInfo,
    komboRecommendation,

    // Quote UI
    showQuoteInfoDialog,
    setShowQuoteInfoDialog,
    showPreviewDialog,
    setShowPreviewDialog,
    selectedPlan,
    setSelectedPlan,
    selectedPlans,
    setSelectedPlans,
    selectedColumnsData,
    setSelectedColumnsData,
    pendingQuoteInfo,
    setPendingQuoteInfo,
    animateMetrics,
    setAnimateMetrics,
    isGeneratingExamples,
    configSectionRef,
    showStickyBar,

    // Calculations
    getLineItems,
    calculateMonthlyReference,
    calculatePrice,
    calculateMonthlyRecurring,
    calculateMonthlyReferenceTotal,
    calculateTotalImplementation,
    calculateKomboDiscount,
    calculateFirstYearTotal,
    calculatePrepaymentAmount,
    calculatePayPostPago,
    calculateImobPlanCost,
    calculateLocPlanCost,

    // Actions
    handleReset,
    handleGenerate3Examples,
    generateShareableURL,

    // tRPC mutations
    generatePDF,
    createProposal,
    saveQuoteMutation,

    // Refs
    prevProductRef,
  };
}

export type UseCalculadoraReturn = ReturnType<typeof useCalculadora>;
