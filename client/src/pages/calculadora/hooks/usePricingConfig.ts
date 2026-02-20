/**
 * usePricingConfig - Load pricing configuration from server via tRPC
 * 
 * This hook ensures the calculator always uses the latest pricing configuration
 * from pricing-values.json, reflecting any changes made via /admin/pricing.
 */

import { trpc } from "@/lib/trpc";

export function usePricingConfig() {
  const { data: config, isLoading, error } = trpc.pricingAdmin.getConfig.useQuery();

  return {
    config,
    isLoading,
    error,
    isReady: !isLoading && !error && !!config,
  };
}
