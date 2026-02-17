/**
 * usePricing - Pricing calculation functions for the Calculadora
 * Extracted from useCalculadora for better modularity
 */

import { useCallback } from "react";
import {
  type ProductSelection,
  type PlanTier,
  type PaymentFrequency,
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
  PREPAID_USER_PRICE_PER_MONTH,
  PREPAID_CONTRACT_PRICE_PER_MONTH,
  getPrepaidMonths,
} from "../types";
import * as Pricing from "@/utils/pricing";

type KomboDefinition = (typeof KOMBOS)[keyof typeof KOMBOS] | null;

interface UsePricingParams {
  product: ProductSelection;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  addons: AddonsState;
  frequency: PaymentFrequency;
  komboInfo: KomboDefinition;
  isAddonAvailable: (addon: keyof AddonsState) => boolean;
  metrics: {
    imobUsers: number | string;
    contractsUnderManagement: number | string;
    closingsPerMonth: number | string;
    newContractsPerMonth: number | string;
    boletoChargeAmount: number | string;
    splitChargeAmount: number | string;
    chargesBoletoToTenant: boolean;
    chargesSplitToOwner: boolean;
  };
  prepayAdditionalUsers: boolean;
  prepayAdditionalContracts: boolean;
}

export function usePricing({
  product,
  imobPlan,
  locPlan,
  addons,
  frequency,
  komboInfo,
  isAddonAvailable,
  metrics,
  prepayAdditionalUsers,
  prepayAdditionalContracts,
}: UsePricingParams) {
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
        name: `Imob - ${imobPlan === "k2" ? "K\u00B2" : imobPlan.toUpperCase()}`,
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
        name: `Loc - ${locPlan === "k2" ? "K\u00B2" : locPlan.toUpperCase()}`,
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

  const calculateImobPlanCost = useCallback((plan: PlanTier, users: number): number => {
    const baseCost = PLAN_ANNUAL_PRICES[plan];
    const included = Pricing.getIncludedQuantity("imob", plan);
    const additional = Math.max(0, users - included);
    let additionalCost = 0;
    if (additional > 0) {
      additionalCost = calculateAdditionalUsersCost(plan, additional);
    }
    return baseCost + additionalCost;
  }, []);

  const calculateLocPlanCost = useCallback((plan: PlanTier, contracts: number): number => {
    const baseCost = PLAN_ANNUAL_PRICES[plan];
    const included = Pricing.getIncludedQuantity("loc", plan);
    const additional = Math.max(0, contracts - included);
    let additionalCost = 0;
    if (additional > 0) {
      additionalCost = Pricing.calculateAdditionalContractsCost(plan, additional);
    }
    return baseCost + additionalCost;
  }, []);

  const calculateTotalImplementation = useCallback((withKombo: boolean = false) => {
    if (withKombo && komboInfo) {
      return Pricing.getImplementationCost("imob");
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

  const calculatePrepaymentAmount = useCallback((): { users: number; contracts: number; total: number; userCount: number; contractCount: number; months: number; userPricePerMonth: number; contractPricePerMonth: number } => {
    const months = getPrepaidMonths(frequency);
    if (months === 0) return { users: 0, contracts: 0, total: 0, userCount: 0, contractCount: 0, months: 0, userPricePerMonth: PREPAID_USER_PRICE_PER_MONTH, contractPricePerMonth: PREPAID_CONTRACT_PRICE_PER_MONTH };

    let usersPrepayment = 0;
    let contractsPrepayment = 0;
    let userCount = 0;
    let contractCount = 0;

    if ((product === 'imob' || product === 'both') && prepayAdditionalUsers) {
      const included = Pricing.getIncludedQuantity("imob", imobPlan);
      const additional = Math.max(0, toNum(metrics.imobUsers) - included);
      if (additional > 0) {
        userCount = additional;
        // Use flat prepaid rate regardless of plan or volume
        usersPrepayment = additional * PREPAID_USER_PRICE_PER_MONTH * months;
      }
    }

    if ((product === 'loc' || product === 'both') && prepayAdditionalContracts) {
      const included = Pricing.getIncludedQuantity("loc", locPlan);
      const additional = Math.max(0, toNum(metrics.contractsUnderManagement) - included);
      if (additional > 0) {
        contractCount = additional;
        // Use flat prepaid rate regardless of plan or volume
        contractsPrepayment = additional * PREPAID_CONTRACT_PRICE_PER_MONTH * months;
      }
    }

    return {
      users: usersPrepayment,
      contracts: contractsPrepayment,
      total: usersPrepayment + contractsPrepayment,
      userCount,
      contractCount,
      months,
      userPricePerMonth: PREPAID_USER_PRICE_PER_MONTH,
      contractPricePerMonth: PREPAID_CONTRACT_PRICE_PER_MONTH,
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

  return {
    calculateMonthlyReference,
    calculatePrice,
    getLineItems,
    calculateImobPlanCost,
    calculateLocPlanCost,
    calculateTotalImplementation,
    calculateKomboDiscount,
    calculateMonthlyReferenceTotal,
    calculateMonthlyRecurring,
    calculatePrepaymentAmount,
    calculateFirstYearTotal,
    calculatePayPostPago,
  };
}
