/**
 * useAutoEffects - Auto-recommendation and sync effects
 * Extracted from useCalculadora for better modularity
 */

import { useEffect, type RefObject } from "react";
import {
  type ProductSelection,
  type PlanTier,
  type MetricsState,
  type BusinessNatureState,
  toNum,
} from "../types";

interface UseAutoEffectsParams {
  product: ProductSelection;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  metrics: MetricsState;
  businessNature: BusinessNatureState;
  setProduct: (p: ProductSelection) => void;
  setImobPlan: (p: PlanTier) => void;
  setLocPlan: (p: PlanTier) => void;
  setRecommendedImobPlan: (p: PlanTier) => void;
  setRecommendedLocPlan: (p: PlanTier) => void;
  setMetrics: (fn: (prev: MetricsState) => MetricsState) => void;
  setShowStickyBar: (show: boolean) => void;
  configSectionRef: RefObject<HTMLDivElement | null>;
}

export function useAutoEffects({
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
}: UseAutoEffectsParams) {
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
}
