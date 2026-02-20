/**
 * recalculateColumns.ts
 * 
 * Recalculates the selected columns data at PDF export time to ensure
 * the data is always fresh and consistent with the current calculator state.
 * 
 * This fixes a potential race condition where selectedColumnsData from the
 * KomboComparisonTable's useEffect may be one render cycle behind the
 * current calculator state.
 */

import {
  calculateKomboColumn,
  calculateCustomColumn,
} from "@/components/kombo/komboColumnCalculators";
import { getRecommendedKombo } from "@/components/kombo/komboDefinitions";
import { PREPAID_DISCOUNT_MULTIPLIER } from "@shared/pricing-config";
import type { KomboComparisonProps, KomboColumnData, PaymentFrequency, PlanTier, ProductSelection, ColumnOverrides } from "@/components/kombo/komboComparisonTypes";

interface RecalculateInput {
  product: ProductSelection;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  addons: KomboComparisonProps["addons"];
  frequency: PaymentFrequency;
  metrics: {
    imobUsers: number | string;
    closingsPerMonth: number | string;
    leadsPerMonth: number | string;
    contractsUnderManagement: number | string;
    newContractsPerMonth: number | string;
    wantsWhatsApp: boolean;
    imobVipSupport: boolean;
    locVipSupport: boolean;
    imobDedicatedCS: boolean;
    locDedicatedCS: boolean;
  };
  selectedColumnsData: KomboColumnData[];
  prepayAdditionalUsers: boolean;
  prepayAdditionalContracts: boolean;
}

const toNum = (val: number | string): number => {
  if (typeof val === "number") return val;
  if (val === "" || val == null) return 0;
  const cleaned = String(val).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Recalculate the selected columns data using the current calculator state.
 * This ensures the PDF always gets fresh, consistent data.
 */
export function recalculateSelectedColumns(input: RecalculateInput): KomboColumnData[] {
  const { product, imobPlan, locPlan, addons, frequency, metrics, selectedColumnsData } = input;

  // If no columns were selected, return empty
  if (selectedColumnsData.length === 0) return [];

  // Build props matching KomboComparisonProps
  const props: KomboComparisonProps = {
    product,
    imobPlan,
    locPlan,
    addons,
    frequency,
    wantsWhatsApp: metrics.wantsWhatsApp,
    imobUsers: toNum(metrics.imobUsers),
    closingsPerMonth: toNum(metrics.closingsPerMonth),
    leadsPerMonth: toNum(metrics.leadsPerMonth),
    contractsUnderManagement: toNum(metrics.contractsUnderManagement),
    newContractsPerMonth: toNum(metrics.newContractsPerMonth),
    vipSupport: metrics.imobVipSupport || metrics.locVipSupport,
    dedicatedCS: metrics.imobDedicatedCS || metrics.locDedicatedCS,
  };

  const recommendedKombo = getRecommendedKombo(product, addons);

  // Recalculate each selected column
  return selectedColumnsData.map((cachedCol) => {
    try {
      let freshCol: KomboColumnData;

      if (cachedCol.isCustom && cachedCol.sourceKombo && cachedCol.sourceKombo !== "none") {
        // Custom column based on a kombo
        const komboResult = calculateKomboColumn(cachedCol.sourceKombo, props, recommendedKombo, cachedCol.overrides);
        freshCol = {
          ...komboResult,
          id: cachedCol.id,
          name: cachedCol.name,
          shortName: cachedCol.shortName || cachedCol.name,
          isCustom: true,
          sourceKombo: cachedCol.sourceKombo,
          isRecommended: false,
        };
      } else if (cachedCol.isCustom) {
        // Custom column without kombo
        const defaultOverrides: ColumnOverrides = cachedCol.overrides || {
          frequency: props.frequency,
          imobPlan: props.imobPlan,
          locPlan: props.locPlan,
          addons: { ...props.addons },
        };
        freshCol = calculateCustomColumn(cachedCol.id, 0, cachedCol.name, props, defaultOverrides);
        freshCol = { ...freshCol, sourceKombo: null };
      } else if (cachedCol.id === "none") {
        // "Sua Seleção" column (no kombo)
        freshCol = calculateKomboColumn("none", props, recommendedKombo, cachedCol.overrides);
      } else {
        // Kombo column
        freshCol = calculateKomboColumn(cachedCol.id as any, props, recommendedKombo, cachedCol.overrides);
      }

      // Apply pre-paid transformations if they were active
      const isPrepaidUsers = cachedCol.prePaidUsersActive || false;
      const isPrepaidContracts = cachedCol.prePaidContractsActive || false;

      if (isPrepaidUsers || isPrepaidContracts) {
        let extraMonthly = 0;
        let newPostPaidTotal = freshCol.postPaidTotal;

        if (isPrepaidUsers && freshCol.postPaidUsers && freshCol.postPaidUsers.cost > 0) {
          // Prepaid cost = post-paid cost * 0.90 (10% discount)
          extraMonthly += freshCol.postPaidUsers.cost * PREPAID_DISCOUNT_MULTIPLIER;
          newPostPaidTotal -= freshCol.postPaidUsers.cost;
        }
        if (isPrepaidContracts && freshCol.postPaidContracts && freshCol.postPaidContracts.cost > 0) {
          // Prepaid cost = post-paid cost * 0.90 (10% discount)
          extraMonthly += freshCol.postPaidContracts.cost * PREPAID_DISCOUNT_MULTIPLIER;
          newPostPaidTotal -= freshCol.postPaidContracts.cost;
        }

        const newTotalMonthly = freshCol.totalMonthly + extraMonthly;
        freshCol = {
          ...freshCol,
          prePaidUsersActive: isPrepaidUsers,
          prePaidContractsActive: isPrepaidContracts,
          totalMonthly: newTotalMonthly,
          annualEquivalent: newTotalMonthly * 12 + freshCol.implementation,
          cycleTotalValue: newTotalMonthly * freshCol.cycleMonths + freshCol.implementation,
          postPaidTotal: Math.max(0, newPostPaidTotal),
        };
      } else {
        freshCol = {
          ...freshCol,
          prePaidUsersActive: false,
          prePaidContractsActive: false,
        };
      }

      return freshCol;
    } catch (err) {
      console.warn("[recalculateSelectedColumns] Error recalculating column, using cached:", cachedCol.id, err);
      return cachedCol;
    }
  });
}

/**
 * Validate data integrity between the main proposal data and the selected columns.
 * Logs warnings for any divergences found.
 */
export function validateProposalDataIntegrity(
  proposalData: Record<string, any>,
  selectedColumns: KomboColumnData[]
): string[] {
  const warnings: string[] = [];

  if (selectedColumns.length === 0) return warnings;

  const mainCol = selectedColumns[0];

  // Check totalMonthly consistency
  const mainTotal = proposalData.totalMonthly;
  const colTotal = mainCol.totalMonthly;
  if (Math.abs(mainTotal - colTotal) > 1) {
    warnings.push(
      `Total mensal diverge: proposta R$ ${mainTotal.toFixed(2)} vs coluna R$ ${colTotal.toFixed(2)}`
    );
  }

  // Check implementation consistency
  const mainImpl = proposalData.implantationFee;
  const colImpl = mainCol.implementation;
  if (Math.abs(mainImpl - colImpl) > 1) {
    warnings.push(
      `Implantação diverge: proposta R$ ${mainImpl.toFixed(2)} vs coluna R$ ${colImpl.toFixed(2)}`
    );
  }

  // Check user count consistency
  if (mainCol.postPaidUsers) {
    const formUsers = proposalData.imobUsers || 0;
    const includedUsers = mainCol.postPaidUsers.included;
    const additionalUsers = mainCol.postPaidUsers.additional;
    const expectedTotal = includedUsers + additionalUsers;
    if (formUsers > 0 && formUsers !== expectedTotal && formUsers !== includedUsers) {
      warnings.push(
        `Usuários: formulário ${formUsers}, incluídos ${includedUsers}, adicionais ${additionalUsers}`
      );
    }
  }

  if (warnings.length > 0) {
    console.warn("[PDF Data Integrity] Divergences found:", warnings);
  }

  return warnings;
}
