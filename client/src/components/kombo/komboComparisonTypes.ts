/**
 * Shared types and constants for the Kombo Comparison Table.
 */

export type ProductSelection = "imob" | "loc" | "both";
export type PlanTier = "prime" | "k" | "k2";
export type PaymentFrequency = "monthly" | "semestral" | "annual" | "biennial";
export type KomboId = "none" | "imob_start" | "imob_pro" | "locacao_pro" | "core_gestao" | "elite";
export type ColumnId = KomboId | string;
export type ViewMode = "monthly" | "semestral" | "annual" | "biennial";

export interface KomboComparisonProps {
  product: ProductSelection;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  addons: {
    leads: boolean;
    inteligencia: boolean;
    assinatura: boolean;
    pay: boolean;
    seguros: boolean;
    cash: boolean;
  };
  frequency: PaymentFrequency;
  wantsWhatsApp: boolean;
  imobUsers: number;
  closingsPerMonth: number;
  leadsPerMonth: number;
  contractsUnderManagement: number;
  newContractsPerMonth: number;
  vipSupport: boolean;
  dedicatedCS: boolean;
  onPlanSelected?: (planId: KomboId | null) => void;
  onPlansSelected?: (planIds: ColumnId[]) => void;
  onSelectedColumnsData?: (columns: KomboColumnData[]) => void;
  onFrequencyChange?: (frequency: PaymentFrequency) => void;
}

export interface ColumnOverrides {
  frequency: PaymentFrequency;
  imobPlan: PlanTier;
  locPlan: PlanTier;
  addons?: {
    leads: boolean;
    inteligencia: boolean;
    assinatura: boolean;
    pay: boolean;
    seguros: boolean;
    cash: boolean;
  };
  vipSupport?: boolean;
  dedicatedCS?: boolean;
  training?: boolean;
}

export interface KomboColumnData {
  id: ColumnId;
  name: string;
  shortName: string;
  discount: number;
  isAvailable: boolean;
  isRecommended: boolean;
  isCustom: boolean;
  sourceKombo?: KomboId | null;
  imobPrice: number | null;
  locPrice: number | null;
  leadsPrice: number | null;
  whatsAppPrice: string | null;
  inteligenciaPrice: number | null;
  assinaturaPrice: number | null;
  payPrice: string | null;
  segurosPrice: string | null;
  cashPrice: string | null;
  vipSupportPrice: number | string | null;
  dedicatedCSPrice: number | string | null;
  trainingPrice: number | string | null;
  postPaidUsers: { cost: number; additional: number; included: number; perUnit: number } | null;
  postPaidContracts: { cost: number; additional: number; included: number; perUnit: number } | null;
  postPaidWhatsApp: { cost: number; additional: number; included: number; perUnit: number } | null;
  postPaidAssinaturas: { cost: number; additional: number; included: number; total: number; perUnit: number } | null;
  postPaidBoletos: { cost: number; quantity: number; perUnit: number } | null;
  postPaidSplits: { cost: number; quantity: number; perUnit: number } | null;
  postPaidTotal: number;
  prePaidUsersActive: boolean;
  prePaidContractsActive: boolean;
  prePaidWhatsAppActive: boolean;
  subscriptionCount: number;
  implBreakdown: { label: string; cost: number; free: boolean }[];
  totalMonthly: number;
  totalMonthlyFinal: number;
  monthlyBeforeDiscounts: number;
  komboDiscountAmount: number;
  cycleDiscountAmount: number;
  theoreticalImplementation: number;
  implementation: number;
  annualEquivalent: number;
  cycleTotalValue: number;
  cycleMonths: number;
  overrides?: ColumnOverrides;
}

/** Frequency options for per-column selector */
export const FREQUENCY_OPTIONS: { id: ViewMode; label: string; shortLabel: string; discount: string }[] = [
  { id: "monthly", label: "Mensal", shortLabel: "Mensal", discount: "Ref." },
  { id: "semestral", label: "Semestral", shortLabel: "Sem.", discount: "10% OFF" },
  { id: "annual", label: "Anual", shortLabel: "Anual", discount: "20% OFF" },
  { id: "biennial", label: "Bienal", shortLabel: "Bienal", discount: "30% OFF" },
];

/** Plan tiers for clickable cycling */
export const PLAN_TIERS: PlanTier[] = ["prime", "k", "k2"];

/** Max custom (Perso) columns */
export const MAX_CUSTOM_COLUMNS = 3;

/** Max columns user can select for PDF export */
export const MAX_SELECTED_PLANS = 1;
