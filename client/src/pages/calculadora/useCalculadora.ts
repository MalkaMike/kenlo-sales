/**
 * useCalculadora - Custom hook for all Calculadora state and logic
 * Composes domain-specific hooks for better modularity:
 *   - usePricing: pricing calculations
 *   - useExampleGenerator: 3-example PDF generation
 *   - useUrlParams: URL parameter loading and shareable URL generation
 *   - useAutoEffects: auto-recommendation and sync effects
 */

import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { KomboColumnData } from "@/components/KomboComparisonTable";
import type { QuoteInfo } from "@/components/QuoteInfoDialog";

import {
  type ProductSelection,
  type PlanTier,
  type PaymentFrequency,
  type KomboType,
  type BusinessNatureState,
  type MetricsState,
  type AddonsState,
  KOMBOS,
  isAuthorizedEmail,
  DEFAULT_BUSINESS_NATURE,
  DEFAULT_METRICS,
  DEFAULT_ADDONS,
  RESET_ADDONS,
  RESET_METRICS,
} from "./types";

import { usePricing } from "./hooks/usePricing";
import { useExampleGenerator } from "./hooks/useExampleGenerator";
import { useUrlParams } from "./hooks/useUrlParams";
import { useAutoEffects } from "./hooks/useAutoEffects";
import { useKomboRecommendation } from "./hooks/useKomboRecommendation";

export function useCalculadora() {
  // ─── Authentication ─────────────────────────────────────────────────────────
  const { user: oauthUser } = useAuth();
  const canExportPDF = isAuthorizedEmail(oauthUser?.email);

  // Derive salesperson-compatible object from OAuth user for backward compatibility
  const salesperson = oauthUser ? {
    id: -1,
    name: oauthUser.name || oauthUser.email || "Usuário",
    email: oauthUser.email || "",
    phone: "",
    isMaster: true,
  } : null;

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
    setBusinessNature({ ...DEFAULT_BUSINESS_NATURE });
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

  // ─── Composed Hooks ────────────────────────────────────────────────────────

  // Pricing calculations
  const pricing = usePricing({
    product,
    imobPlan,
    locPlan,
    addons,
    frequency,
    metrics,
    komboInfo,
    isAddonAvailable,
    prepayAdditionalUsers,
    prepayAdditionalContracts,
  });

  // Kombo recommendation
  const { komboRecommendation } = useKomboRecommendation({
    activeKombo,
    addons,
    product,
    getLineItems: pricing.getLineItems,
  });

  // Example generation
  const { isGeneratingExamples, handleGenerate3Examples } = useExampleGenerator({
    canExportPDF,
  });

  // URL params
  const { generateShareableURL } = useUrlParams({
    product,
    imobPlan,
    locPlan,
    frequency,
    addons,
    metrics,
    setProduct,
    setImobPlan,
    setLocPlan,
    setFrequency,
    setAddons,
    setMetrics,
  });

  // Auto-effects (plan recommendation, premium services sync, product sync, sticky bar)
  useAutoEffects({
    product,
    imobPlan,
    locPlan,
    metrics,
    businessNature,
    setProduct,
    setImobPlan,
    setLocPlan,
    setRecommendedImobPlan,
    setRecommendedLocPlan,
    setMetrics,
    setShowStickyBar,
    configSectionRef,
  });

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
    getLineItems: pricing.getLineItems,
    calculateMonthlyReference: pricing.calculateMonthlyReference,
    calculatePrice: pricing.calculatePrice,
    calculateMonthlyRecurring: pricing.calculateMonthlyRecurring,
    calculateMonthlyReferenceTotal: pricing.calculateMonthlyReferenceTotal,
    calculateTotalImplementation: pricing.calculateTotalImplementation,
    calculateKomboDiscount: pricing.calculateKomboDiscount,
    calculateFirstYearTotal: pricing.calculateFirstYearTotal,
    calculatePrepaymentAmount: pricing.calculatePrepaymentAmount,
    calculatePayPostPago: pricing.calculatePayPostPago,
    calculateImobPlanCost: pricing.calculateImobPlanCost,
    calculateLocPlanCost: pricing.calculateLocPlanCost,

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
