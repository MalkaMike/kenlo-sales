/**
 * buildProposalData.ts
 * Main builder that composes extracted utility modules to assemble
 * the proposal data object for PDF generation and the quote save data.
 *
 * This function is pure: it takes all required state as input and returns
 * the fully assembled proposal data object. No side effects, no React hooks.
 */

import type { QuoteInfo } from "@/components/QuoteInfoDialog";
import * as Pricing from "@/utils/pricing";
import { KOMBOS, toNum } from "../types";
import type {
  ProductSelection,
  PlanTier,
  PaymentFrequency,
  AddonsState,
  MetricsState,
  BusinessNatureState,
  LineItem,
  KomboType,
} from "../types";

// Extracted builder modules
import { calculatePostPaidTotal, buildPostPaidBreakdown } from "./postPaidBuilder";
import { buildKomboComparison, buildFrequencyComparison } from "./comparisonBuilders";
import {
  classifyAddons,
  calculatePremiumServices,
  calculateRevenue,
  getProductPrice,
  getAddonPrices,
} from "./proposalHelpers";

// ─── Input Types ────────────────────────────────────────────────────────────

export interface ProposalDataInput {
  quoteInfo: QuoteInfo;
  product: ProductSelection;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  addons: AddonsState;
  metrics: MetricsState;
  frequency: PaymentFrequency;
  activeKombo: KomboType;
  komboInfo: (typeof KOMBOS)[keyof typeof KOMBOS] | null;
  businessNature: BusinessNatureState;
  prepayAdditionalUsers: boolean;
  prepayAdditionalContracts: boolean;
  selectedColumnsData: any[];
  getLineItems: () => LineItem[];
  calculateTotalImplementation: (withKombo: boolean) => number;
  calculatePrepaymentAmount: () => { users: number; contracts: number };
}

// ─── Main Builder ───────────────────────────────────────────────────────────

export function buildProposalData(input: ProposalDataInput): Record<string, any> {
  const {
    quoteInfo,
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    frequency,
    activeKombo,
    komboInfo,
    businessNature,
    selectedColumnsData,
    getLineItems,
    calculateTotalImplementation,
    calculatePrepaymentAmount,
  } = input;

  // Get selected addons (exclude Cash from PDFs per business rule)
  const selectedAddons = Object.entries(addons)
    .filter(([name, enabled]) => enabled && name !== "cash")
    .map(([name]) => name);

  // Calculate totals from line items
  const lineItems = getLineItems();
  const totalMonthly = lineItems.reduce(
    (sum: number, item: LineItem) =>
      sum + (activeKombo !== "none" ? item.priceComKombo : item.priceSemKombo),
    0
  );
  const totalAnnual = totalMonthly * 12;
  const implantationFee = calculateTotalImplementation(activeKombo !== "none");
  const firstYearTotal = totalAnnual + implantationFee;

  // Post-paid total (using extracted builder)
  const postPaidInput = {
    product,
    imobPlan,
    locPlan,
    addons,
    metrics,
    prepayAdditionalUsers: input.prepayAdditionalUsers,
    prepayAdditionalContracts: input.prepayAdditionalContracts,
  };
  const postPaidTotal = calculatePostPaidTotal(postPaidInput);

  // Revenue (using extracted helper)
  const { revenueFromBoletos, revenueFromInsurance } = calculateRevenue(product, addons, metrics);
  const netGain =
    revenueFromBoletos + revenueFromInsurance - totalMonthly - (postPaidTotal || 0);

  // Prepayment
  const prepayment = calculatePrepaymentAmount();
  const prepaymentMonths =
    frequency === "annual" ? 12 : frequency === "biennial" ? 24 : 0;

  // Addon compatibility (using extracted helper)
  const { compatible: compatibleAddons } = classifyAddons(selectedAddons, product);

  // Premium services (using extracted helper)
  const { hasPremiumIncluded, premiumServicesPrice } = calculatePremiumServices(
    komboInfo,
    metrics
  );

  return {
    // Vendor info
    vendorName: quoteInfo.vendorName,
    vendorEmail: quoteInfo.vendorEmail,
    vendorPhone: quoteInfo.vendorPhone,
    vendorRole: quoteInfo.vendorRole,

    // Client info
    clientName: businessNature.ownerName,
    agencyName: businessNature.companyName,
    businessType: businessNature.businessType,
    email: businessNature.email,
    cellphone: businessNature.cellphone,

    // Product configuration
    productType: product,
    komboName: komboInfo?.name,
    komboDiscount: komboInfo ? Math.round(komboInfo.discount * 100) : undefined,
    imobPlan: product === "imob" || product === "both" ? imobPlan : undefined,
    locPlan: product === "loc" || product === "both" ? locPlan : undefined,

    // Metrics
    imobUsers: typeof metrics.imobUsers === "number" ? metrics.imobUsers : 0,
    closings:
      typeof metrics.closingsPerMonth === "number"
        ? metrics.closingsPerMonth
        : 0,
    contracts:
      typeof metrics.contractsUnderManagement === "number"
        ? metrics.contractsUnderManagement
        : 0,
    newContracts:
      typeof metrics.newContractsPerMonth === "number"
        ? metrics.newContractsPerMonth
        : 0,
    leadsPerMonth:
      typeof metrics.leadsPerMonth === "number" ? metrics.leadsPerMonth : 0,
    usesExternalAI: metrics.usesExternalAI,
    wantsWhatsApp: metrics.wantsWhatsApp,
    chargesSplitToOwner: metrics.chargesSplitToOwner,
    chargesBoletoToTenant: metrics.chargesBoletoToTenant,
    boletoAmount: toNum(metrics.boletoChargeAmount),
    splitAmount: toNum(metrics.splitChargeAmount),

    // Addons & payment
    selectedAddons: JSON.stringify(compatibleAddons),
    paymentPlan: frequency,

    // Financial totals
    totalMonthly,
    totalAnnual,
    implantationFee,
    firstYearTotal,

    // Price breakdown (for PDF transparency)
    monthlyBeforeDiscounts: lineItems.reduce(
      (sum: number, item: LineItem) => sum + item.monthlyRefSemKombo,
      0
    ),
    komboDiscountAmount: activeKombo !== "none"
      ? lineItems.reduce(
          (sum: number, item: LineItem) => sum + (item.monthlyRefComKombo - item.monthlyRefSemKombo),
          0
        )
      : 0,
    cycleDiscountAmount: lineItems.reduce(
      (sum: number, item: LineItem) => {
        const ref = activeKombo !== "none" ? item.monthlyRefComKombo : item.monthlyRefSemKombo;
        const final = activeKombo !== "none" ? item.priceComKombo : item.priceSemKombo;
        return sum + (final - ref);
      },
      0
    ),
    postPaidTotal,
    revenueFromBoletos,
    revenueFromInsurance,
    netGain,

    // Prepayment
    prepayAdditionalUsers: input.prepayAdditionalUsers,
    prepayAdditionalContracts: input.prepayAdditionalContracts,
    prepaymentUsersAmount: prepayment.users,
    prepaymentContractsAmount: prepayment.contracts,
    prepaymentMonths,
    monthlyLicenseBase: totalMonthly,

    // Premium services
    hasPremiumServices:
      hasPremiumIncluded ||
      ((metrics.imobVipSupport || metrics.locVipSupport) &&
        (metrics.imobDedicatedCS || metrics.locDedicatedCS)),
    premiumServicesPrice,
    installments: quoteInfo.installments,
    validityDays: quoteInfo.validityDays,

    // Line item prices
    imobPrice: getProductPrice(lineItems, "Imob", activeKombo),
    locPrice: getProductPrice(lineItems, "Loc", activeKombo),
    addonPrices: getAddonPrices(lineItems, activeKombo),

    // Premium service details
    vipIncluded:
      hasPremiumIncluded &&
      (metrics.imobVipSupport || metrics.locVipSupport),
    csIncluded:
      hasPremiumIncluded &&
      (metrics.imobDedicatedCS || metrics.locDedicatedCS),
    vipPrice:
      !hasPremiumIncluded && (metrics.imobVipSupport || metrics.locVipSupport)
        ? Pricing.getVipSupportPrice()
        : 0,
    csPrice:
      !hasPremiumIncluded &&
      (metrics.imobDedicatedCS || metrics.locDedicatedCS)
        ? Pricing.getCSDedicadoPrice()
        : 0,

    // PDF sections (using extracted builders)
    postPaidBreakdown: buildPostPaidBreakdown(postPaidInput, postPaidTotal),
    komboComparison: buildKomboComparison(lineItems, activeKombo, product),
    frequencyComparison: buildFrequencyComparison(lineItems, komboInfo, frequency),
    selectedColumnsJson:
      selectedColumnsData.length > 0
        ? JSON.stringify(selectedColumnsData)
        : undefined,
  };
}

// ─── Quote Save Data Builder ────────────────────────────────────────────────

export function buildQuoteSaveData(
  input: ProposalDataInput,
  proposalData: Record<string, any>
): Record<string, any> {
  const {
    quoteInfo,
    product,
    imobPlan,
    locPlan,
    frequency,
    addons,
    metrics,
    activeKombo,
    businessNature,
  } = input;

  return {
    action: "pdf_exported",
    product,
    imobPlan: product !== "loc" ? imobPlan : undefined,
    locPlan: product !== "imob" ? locPlan : undefined,
    frequency,
    addons: JSON.stringify(addons),
    metrics: JSON.stringify(metrics),
    totals: JSON.stringify({
      monthly: proposalData.totalMonthly,
      annual: proposalData.totalAnnual,
      implantation: proposalData.implantationFee,
      postPaid: proposalData.postPaidTotal,
      firstYear: proposalData.firstYearTotal,
    }),
    komboId: activeKombo !== "none" ? activeKombo : undefined,
    komboName:
      activeKombo !== "none" ? KOMBOS[activeKombo]?.name : undefined,
    komboDiscount:
      activeKombo !== "none"
        ? Math.round((KOMBOS[activeKombo]?.discount || 0) * 100)
        : undefined,
    clientName: businessNature.ownerName,
    vendorName: quoteInfo.vendorName,
    // userId is auto-populated server-side from OAuth session
    agencyName: businessNature.companyName,
    cellPhone: businessNature.cellphone,
    landlinePhone: businessNature.landline,
    websiteUrl: businessNature.hasWebsite
      ? businessNature.websiteUrl
      : "Cliente não tem site ainda",
    businessType: businessNature.businessType,
    email: businessNature.email,
    hasCRM: businessNature.hasCRM ? 1 : 0,
    crmSystem: businessNature.hasCRM ? businessNature.crmSystem : undefined,
    crmOther:
      businessNature.hasCRM && businessNature.crmSystem === "Outro"
        ? businessNature.crmOther
        : undefined,
    hasERP: businessNature.hasERP ? 1 : 0,
    erpSystem: businessNature.hasERP ? businessNature.erpSystem : undefined,
    erpOther:
      businessNature.hasERP && businessNature.erpSystem === "Outro"
        ? businessNature.erpOther
        : undefined,
  };
}
