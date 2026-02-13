/**
 * useUrlParams - URL parameter loading and shareable URL generation
 * Extracted from useCalculadora for better modularity
 */

import { useCallback, useEffect } from "react";
import { useSearch } from "wouter";
import type {
  ProductSelection,
  PlanTier,
  PaymentFrequency,
  AddonsState,
  MetricsState,
} from "../types";

interface UseUrlParamsParams {
  product: ProductSelection;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  frequency: PaymentFrequency;
  addons: AddonsState;
  metrics: MetricsState;
  setProduct: (p: ProductSelection) => void;
  setImobPlan: (p: PlanTier) => void;
  setLocPlan: (p: PlanTier) => void;
  setFrequency: (f: PaymentFrequency) => void;
  setAddons: (a: AddonsState) => void;
  setMetrics: (fn: (prev: MetricsState) => MetricsState) => void;
}

export function useUrlParams({
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
}: UseUrlParamsParams) {
  const searchString = useSearch();

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
    params.set('ba', String(Number(metrics.boletoChargeAmount) || 0));
    params.set('sa', String(Number(metrics.splitChargeAmount) || 0));
    const baseUrl = window.location.origin + '/cotacao';
    return `${baseUrl}?${params.toString()}`;
  }, [product, imobPlan, locPlan, frequency, addons, metrics]);

  return {
    generateShareableURL,
  };
}
