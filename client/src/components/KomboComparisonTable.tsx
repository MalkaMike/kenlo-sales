/**
 * Kombo Comparison Table Component
 *
 * Displays a comparison table showing prices for:
 * - Sua Seleção (no discount) — editable cycle, read-only plan/addons
 * - Compatible Kombos with their respective discounts
 * - Custom scenario columns the user can build from scratch (no Kombo base)
 *
 * All types, constants, calculation logic, definitions, and cell renderers
 * are extracted into the `kombo/` sub-modules for maintainability.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, CheckCircle2, Sparkles, Plus, X, Minus, RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PrePagoPosPagoModal } from "@/components/PrePagoPosPagoModal";

// Sub-module imports
import type {
  ProductSelection,
  PlanTier,
  PaymentFrequency,
  KomboId,
  ColumnId,
  ColumnOverrides,
  KomboColumnData,
  KomboComparisonProps,
} from "./kombo/komboComparisonTypes";
import { PLAN_TIERS, MAX_CUSTOM_COLUMNS, MAX_SELECTED_PLANS } from "./kombo/komboComparisonTypes";
import { KOMBO_DEFINITIONS, PRODUCT_BANNER_CONFIG, getRecommendedKombo, getCompatibleKomboIds } from "./kombo/komboDefinitions";
import { calculateKomboColumn, calculateCustomColumn, formatCurrency } from "./kombo/komboColumnCalculators";
import { ColumnCycleSelector } from "./kombo/ColumnCycleSelector";
import { PersoKomboSelector } from "./kombo/PersoKomboSelector";
import { getCellValue } from "./kombo/KomboCellRenderers";
import type { CellRenderContext } from "./kombo/KomboCellRenderers";

// Re-export types for consumers
export type { KomboComparisonProps, KomboColumnData, ColumnId, KomboId } from "./kombo/komboComparisonTypes";

// ─── Row Definitions ────────────────────────────────────────────────────────

const rows = [
  { key: "products", label: "Produtos", isHeader: true },
  { key: "imob", label: "Imob", indent: true },
  { key: "loc", label: "Loc", indent: true },
  { key: "addons", label: "Add-ons", isHeader: true, needsTopSpacing: true },
  { key: "leads", label: "Leads", indent: true },
  { key: "inteligencia", label: "Inteligência", indent: true },
  { key: "assinatura", label: "Assinatura", indent: true },

  { key: "premium", label: "Serviços Premium", isHeader: true, needsTopSpacing: true },
  { key: "vipSupport", label: "Suporte VIP", indent: true },
  { key: "dedicatedCS", label: "CS Dedicado", indent: true },
  { key: "training", label: "Treinamentos", indent: true },
  { key: "descontos", label: "Descontos", isHeader: true, needsTopSpacing: true },
  { key: "monthlyBeforeDiscounts", label: "Mensalidade (antes) Pré-Pago", indent: true, isBreakdownRow: true },
  { key: "komboDiscount", label: "Desconto Kombo", indent: true, isDiscountRow: true, isBreakdownRow: true },
  { key: "cycleDiscount", label: "Desconto Ciclo", indent: true, isDiscountRow: true, isBreakdownRow: true },
  { key: "totalMonthlyFinal", label: "Mensalidade (depois) Pré-Pago", isTotal: true, isMensalidadeRow: true, isFinalPrice: true },
  { key: "cycle", label: "Ciclo Pré-Pago", isTotal: true, needsBottomSpacing: true },

  { key: "implantacao", label: "Implantação", isHeader: true, needsTopSpacing: true },
  { key: "implImob", label: "Imob", indent: true },
  { key: "implLoc", label: "Locação", indent: true },
  { key: "implLeads", label: "Leads", indent: true },
  { key: "implInteligencia", label: "Inteligência", indent: true },
  { key: "implTotal", label: "Total Implantação", isTotal: true, needsBottomSpacing: true },

  { key: "cycleTotal", label: "Total 1º Ano", isTotal: true, needsBottomSpacing: true },

  { key: "postpaid", label: "Pós-Pago", isHeader: true, needsTopSpacing: true },
  { key: "postpaidUsers", label: "Usuários adic.", indent: true },
  { key: "postpaidContracts", label: "Contratos adic.", indent: true },
  { key: "postpaidWhatsApp", label: "WhatsApp Leads", indent: true },
  { key: "postpaidAssinaturas", label: "Assinaturas", indent: true },
  { key: "postpaidBoletos", label: "Boletos", indent: true },
  { key: "postpaidSplits", label: "Splits", indent: true },
  { key: "postpaidTotal", label: "Mensalidade (est.)", sublabel: "Pós-Pago¹", isTotal: true, needsBottomSpacing: true, isMensalidadeRow: true },

  { key: "totalMonthlyEstimate", label: "Total Mensalidade (est.)", sublabel: "Pré-Pago¹ + Pós-Pago¹", isTotal: true, isGrandTotal: true, isMensalidadeRow: true },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function KomboComparisonTable(props: KomboComparisonProps) {
  // ── Selection State ──
  const [selectedPlans, setSelectedPlans] = useState<ColumnId[]>([]);
  const [hoveredColumn, setHoveredColumn] = useState<ColumnId | null>(null);

  // ── Transition Animation ──
  const prevProductRef = useRef<ProductSelection>(props.product);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ── Hidden Kombos (persisted in localStorage) ──
  const HIDDEN_KOMBOS_KEY = `kenlo_hidden_kombos_${props.product}`;
  const [hiddenKombos, setHiddenKombos] = useState<KomboId[]>(() => {
    try {
      const stored = localStorage.getItem(HIDDEN_KOMBOS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync hiddenKombos to localStorage whenever it changes
  useEffect(() => {
    try {
      if (hiddenKombos.length > 0) {
        localStorage.setItem(HIDDEN_KOMBOS_KEY, JSON.stringify(hiddenKombos));
      } else {
        localStorage.removeItem(HIDDEN_KOMBOS_KEY);
      }
    } catch {
      // localStorage unavailable, silently ignore
    }
  }, [hiddenKombos, HIDDEN_KOMBOS_KEY]);

  // ── Perso Columns ──
  const [customColumns, setCustomColumns] = useState<{ id: string; name: string; sourceKombo: KomboId | null }[]>([]);
  const customCounterRef = useRef(0);

  // ── Per-Column Overrides ──
  const [columnOverrides, setColumnOverrides] = useState<Record<string, ColumnOverrides>>({});
  const [prePaidUsers, setPrePaidUsers] = useState<Record<string, boolean>>({});
  const [prePaidContracts, setPrePaidContracts] = useState<Record<string, boolean>>({});

  // ── Modal ──
  const [showPrePagoPosPagoModal, setShowPrePagoPosPagoModal] = useState(false);

  // ── Default Overrides Factories ──
  const getDefaultOverrides = useCallback((): ColumnOverrides => ({
    frequency: props.frequency,
    imobPlan: props.imobPlan,
    locPlan: props.locPlan,
    addons: { ...props.addons },
  }), [props.frequency, props.imobPlan, props.locPlan, props.addons]);

  const getCustomDefaultOverrides = useCallback((): ColumnOverrides => ({
    frequency: "annual" as PaymentFrequency,
    imobPlan: props.imobPlan,
    locPlan: props.locPlan,
    addons: { leads: false, inteligencia: false, assinatura: false, pay: false, seguros: false, cash: false },
    vipSupport: false,
    dedicatedCS: false,
    training: false,
  }), [props.imobPlan, props.locPlan]);

  // ── Product Change: Reset ──
  useEffect(() => {
    if (prevProductRef.current !== props.product) {
      setColumnOverrides({});
      setCustomColumns([]);
      // Load hidden kombos for the new product from localStorage
      const newKey = `kenlo_hidden_kombos_${props.product}`;
      try {
        const stored = localStorage.getItem(newKey);
        setHiddenKombos(stored ? JSON.parse(stored) : []);
      } catch {
        setHiddenKombos([]);
      }
      customCounterRef.current = 0;

      setSelectedPlans(prev => {
        const newCompatible = getCompatibleKomboIds(props.product);
        const filtered = prev.filter(p =>
          p === "none" || String(p).startsWith("custom_") || newCompatible.includes(p as KomboId)
        );
        if (filtered.length !== prev.length) {
          setTimeout(() => {
            props.onPlansSelected?.(filtered);
            props.onPlanSelected?.(filtered.length > 0 ? filtered[0] as KomboId : null);
          }, 0);
        }
        return filtered;
      });

      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 400);
      prevProductRef.current = props.product;
      return () => clearTimeout(timer);
    }
  }, [props.product]);

  // ── Override Helpers ──
  const updateColumnOverride = useCallback((colKey: string, update: Partial<ColumnOverrides>) => {
    setColumnOverrides(prev => {
      const isCustom = colKey.startsWith("custom_");
      const current = prev[colKey] || (isCustom ? getCustomDefaultOverrides() : getDefaultOverrides());
      return {
        ...prev,
        [colKey]: {
          ...current,
          ...update,
          addons: update.addons ? { ...current.addons, ...update.addons } : current.addons,
        },
      };
    });
  }, [getDefaultOverrides, getCustomDefaultOverrides]);

  // ── Custom Column Management ──
  const addCustomColumn = useCallback(() => {
    if (customColumns.length >= MAX_CUSTOM_COLUMNS) return;
    const newId = `custom_${customCounterRef.current++}`;
    const newName = `Perso ${customColumns.length + 1}`;
    setCustomColumns(prev => [...prev, { id: newId, name: newName, sourceKombo: null }]);
    setColumnOverrides(prev => ({ ...prev, [newId]: getCustomDefaultOverrides() }));
  }, [customColumns.length, getCustomDefaultOverrides]);

  const addCustomColumnFromSelection = useCallback(() => {
    if (customColumns.length >= MAX_CUSTOM_COLUMNS) return;
    const newId = `custom_${customCounterRef.current++}`;
    const newName = `Cópia ${customColumns.length + 1}`;
    setCustomColumns(prev => [...prev, { id: newId, name: newName, sourceKombo: null }]);
    // Copy the current selection's config (products, addons, premium services) but allow cycle editing
    setColumnOverrides(prev => ({
      ...prev,
      [newId]: {
        ...getDefaultOverrides(),
        vipSupport: props.vipSupport ?? false,
        dedicatedCS: props.dedicatedCS ?? false,
        training: false,
      },
    }));
  }, [customColumns.length, getDefaultOverrides, props.vipSupport, props.dedicatedCS]);

  const removeCustomColumn = useCallback((customId: string) => {
    setCustomColumns(prev => prev.filter(c => c.id !== customId));
    setColumnOverrides(prev => { const next = { ...prev }; delete next[customId]; return next; });
    setSelectedPlans(prev => {
      const filtered = prev.filter(p => p !== customId);
      if (filtered.length !== prev.length) {
        setTimeout(() => {
          props.onPlansSelected?.(filtered);
          props.onPlanSelected?.(filtered.length > 0 ? filtered[0] as KomboId : null);
        }, 0);
      }
      return filtered;
    });
  }, [props.onPlansSelected, props.onPlanSelected]);

  const setPersoSourceKombo = useCallback((customId: string, komboId: KomboId | null) => {
    setCustomColumns(prev => prev.map(c => c.id !== customId ? c : { ...c, sourceKombo: komboId }));
    if (komboId && komboId !== "none") {
      const kombo = KOMBO_DEFINITIONS[komboId as Exclude<KomboId, "none">];
      if (kombo) {
        setColumnOverrides(prev => {
          const current = prev[customId] || getCustomDefaultOverrides();
          return {
            ...prev,
            [customId]: {
              ...current,
              addons: {
                leads: kombo.includedAddons.includes("leads"),
                inteligencia: kombo.includedAddons.includes("inteligencia"),
                assinatura: kombo.includedAddons.includes("assinatura"),
                pay: kombo.includedAddons.includes("pay"),
                seguros: kombo.includedAddons.includes("seguros"),
                cash: kombo.includedAddons.includes("cash"),
              },
              vipSupport: kombo.includesPremiumServices,
              dedicatedCS: kombo.includesPremiumServices,
              training: kombo.includesTraining,
            },
          };
        });
      }
    } else {
      setColumnOverrides(prev => ({ ...prev, [customId]: getCustomDefaultOverrides() }));
    }
  }, [getCustomDefaultOverrides]);

  // ── Plan Selection ──
  const handlePlanSelect = (planId: ColumnId) => {
    setSelectedPlans(prev => {
      let next: ColumnId[];
      if (prev.includes(planId)) {
        // Deselect if already selected
        next = [];
      } else {
        // Single plan mode: always replace
        next = [planId];
      }
      setTimeout(() => {
        props.onPlansSelected?.(next);
        const firstKombo = next.find(p => !String(p).startsWith("custom_"));
        props.onPlanSelected?.(firstKombo ? firstKombo as KomboId : null);
      }, 0);
      return next;
    });
  };

  // ── Cell Click Handlers ──
  const handlePlanCellClick = (colIndex: number, planType: "imob" | "loc", e: React.MouseEvent) => {
    if (colIndex === 0) return;
    e.stopPropagation();
    const colKey = getColumnKey(colIndex);
    const isCustom = colKey.startsWith("custom_");
    const overrides = columnOverrides[colKey] || (isCustom ? getCustomDefaultOverrides() : getDefaultOverrides());
    const currentPlan = planType === "imob" ? overrides.imobPlan : overrides.locPlan;
    const currentIdx = PLAN_TIERS.indexOf(currentPlan);
    const nextPlan = PLAN_TIERS[(currentIdx + 1) % PLAN_TIERS.length];
    updateColumnOverride(colKey, planType === "imob" ? { imobPlan: nextPlan } : { locPlan: nextPlan });
  };

  const handleAddonCellClick = (colIndex: number, addonKey: string, e: React.MouseEvent) => {
    if (colIndex === 0) return;
    e.stopPropagation();
    const colKey = getColumnKey(colIndex);
    const col = columns[colIndex];
    if (!col.isCustom && col.id !== "none") return;
    if (col.isCustom && col.sourceKombo && col.sourceKombo !== "none") return;
    const isCustom = colKey.startsWith("custom_");
    const overrides = columnOverrides[colKey] || (isCustom ? getCustomDefaultOverrides() : getDefaultOverrides());
    const currentValue = overrides.addons[addonKey as keyof typeof overrides.addons];
    updateColumnOverride(colKey, { addons: { ...overrides.addons, [addonKey]: !currentValue } });
  };

  const handlePremiumCellClick = (colIndex: number, serviceKey: "vipSupport" | "dedicatedCS" | "training", e: React.MouseEvent) => {
    e.stopPropagation();
    const colKey = getColumnKey(colIndex);
    const col = columns[colIndex];
    if (!col.isCustom) return;
    if (col.sourceKombo && col.sourceKombo !== "none") return;
    const overrides = columnOverrides[colKey] || getCustomDefaultOverrides();
    const currentValue = overrides[serviceKey] ?? false;
    updateColumnOverride(colKey, { [serviceKey]: !currentValue });
  };

  // ── Derived Data ──
  const recommendedKombo = getRecommendedKombo(props.product, props.addons);
  const compatibleKomboIds = useMemo(() => getCompatibleKomboIds(props.product), [props.product]);
  const visibleKomboIds = useMemo(() => compatibleKomboIds.filter(id => !hiddenKombos.includes(id)), [compatibleKomboIds, hiddenKombos]);
  const komboColumnCount = visibleKomboIds.length;

  // ── Hide/Restore Kombo Helpers ──
  const hideKombo = useCallback((komboId: KomboId) => {
    setHiddenKombos(prev => [...prev, komboId]);
    // Deselect if it was selected
    setSelectedPlans(prev => {
      const filtered = prev.filter(p => p !== komboId);
      if (filtered.length !== prev.length) {
        setTimeout(() => {
          props.onPlansSelected?.(filtered);
          props.onPlanSelected?.(filtered.length > 0 ? filtered[0] as KomboId : null);
        }, 0);
      }
      return filtered;
    });
  }, [props.onPlansSelected, props.onPlanSelected]);

  const restoreKombo = useCallback((komboId: KomboId) => {
    setHiddenKombos(prev => prev.filter(id => id !== komboId));
  }, []);

  const restoreAllKombos = useCallback(() => {
    setHiddenKombos([]);
  }, []);

  const resetAll = useCallback(() => {
    setHiddenKombos([]);
    setCustomColumns([]);
    setColumnOverrides({});
    customCounterRef.current = 0;
    setSelectedPlans(prev => {
      if (prev.length > 0) {
        setTimeout(() => {
          props.onPlansSelected?.([]);
          props.onPlanSelected?.(null);
        }, 0);
      }
      return [];
    });
    // Clear all localStorage keys for hidden kombos
    try {
      localStorage.removeItem(`kenlo_hidden_kombos_imob`);
      localStorage.removeItem(`kenlo_hidden_kombos_loc`);
      localStorage.removeItem(`kenlo_hidden_kombos_both`);
    } catch {
      // silently ignore
    }
  }, [props.onPlansSelected, props.onPlanSelected]);

  // ── Column Computation ──
  const columns: KomboColumnData[] = useMemo(() => {
    const suaSelecaoOverrides = columnOverrides["sua_selecao"];
    const suaSelecaoFreqOverride = suaSelecaoOverrides
      ? { ...getDefaultOverrides(), frequency: suaSelecaoOverrides.frequency }
      : undefined;
    const suaSelecao = calculateKomboColumn("none", props, recommendedKombo, suaSelecaoFreqOverride);

    const komboColumns = visibleKomboIds.map((id, idx) => {
      const colKey = `kombo_${idx}`;
      const overrides = columnOverrides[colKey] || undefined;
      return calculateKomboColumn(id, props, recommendedKombo, overrides);
    });

    const customCols = customColumns.map((custom, idx) => {
      const overrides = columnOverrides[custom.id] || getCustomDefaultOverrides();
      if (custom.sourceKombo && custom.sourceKombo !== "none") {
        const komboResult = calculateKomboColumn(custom.sourceKombo, props, recommendedKombo, overrides);
        return { ...komboResult, id: custom.id, name: custom.name, shortName: custom.name, isCustom: true, sourceKombo: custom.sourceKombo, isRecommended: false };
      }
      const result = calculateCustomColumn(custom.id, idx, custom.name, props, overrides);
      return { ...result, sourceKombo: null };
    });

    const allCols = [suaSelecao, ...komboColumns, ...customCols];

    // Apply pre-paid transformations
    return allCols.map((col, idx) => {
      const colKey = idx === 0 ? "sua_selecao" : idx <= visibleKomboIds.length ? `kombo_${idx - 1}` : (customColumns[idx - visibleKomboIds.length - 1]?.id || "");
      const isPrepaidUsers = prePaidUsers[colKey] ?? false;
      const isPrepaidContracts = prePaidContracts[colKey] ?? false;

      if (!isPrepaidUsers && !isPrepaidContracts) {
        return { ...col, prePaidUsersActive: false, prePaidContractsActive: false };
      }

      let extraMonthly = 0;
      let newPostPaidTotal = col.postPaidTotal;

      if (isPrepaidUsers && col.postPaidUsers && col.postPaidUsers.cost > 0) {
        extraMonthly += col.postPaidUsers.cost;
        newPostPaidTotal -= col.postPaidUsers.cost;
      }
      if (isPrepaidContracts && col.postPaidContracts && col.postPaidContracts.cost > 0) {
        extraMonthly += col.postPaidContracts.cost;
        newPostPaidTotal -= col.postPaidContracts.cost;
      }

      const newTotalMonthly = col.totalMonthly + extraMonthly;
      return {
        ...col,
        prePaidUsersActive: isPrepaidUsers,
        prePaidContractsActive: isPrepaidContracts,
        totalMonthly: newTotalMonthly,
        annualEquivalent: newTotalMonthly * 12 + col.implementation,
        cycleTotalValue: newTotalMonthly * col.cycleMonths + col.implementation,
        postPaidTotal: Math.max(0, newPostPaidTotal),
      };
    });
  }, [props, props.wantsWhatsApp, props.leadsPerMonth, recommendedKombo, visibleKomboIds, columnOverrides, customColumns, getCustomDefaultOverrides, getDefaultOverrides, prePaidUsers, prePaidContracts]);

  // ── Column Key Mapper ──
  const getColumnKey = useCallback((colIndex: number): string => {
    if (colIndex === 0) return "sua_selecao";
    const komboCount = visibleKomboIds.length;
    if (colIndex <= komboCount) return `kombo_${colIndex - 1}`;
    const customIdx = colIndex - komboCount - 1;
    return customColumns[customIdx]?.id || "";
  }, [visibleKomboIds.length, customColumns]);

  // ── Emit Selected Columns Data ──
  const onSelectedColumnsDataRef = useRef(props.onSelectedColumnsData);
  onSelectedColumnsDataRef.current = props.onSelectedColumnsData;
  const selectedColumnsKey = useMemo(() => {
    return selectedPlans.map(id => {
      const col = columns.find(c => c.id === id);
      return col ? `${id}:${col.totalMonthly}:${col.implementation}:${col.cycleTotalValue}:${col.postPaidTotal ?? 0}:${col.postPaidBoletos?.cost ?? '-'}:${col.postPaidSplits?.cost ?? '-'}:pu${col.prePaidUsersActive ? 1 : 0}:pc${col.prePaidContractsActive ? 1 : 0}` : id;
    }).join('|');
  }, [selectedPlans, columns]);
  useEffect(() => {
    const cb = onSelectedColumnsDataRef.current;
    if (!cb) return;
    if (selectedPlans.length > 0) {
      const selectedCols = selectedPlans
        .map(id => columns.find(c => c.id === id))
        .filter((c): c is KomboColumnData => c !== undefined);
      cb(selectedCols);
    } else {
      cb([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColumnsKey]);

  // ── Build Cell Render Context ──
  const buildCellCtx = useCallback((colIndex: number, column: KomboColumnData): CellRenderContext => {
    const colKey = getColumnKey(colIndex);
    const isCustom = colKey.startsWith("custom_");
    const isSuaSelecao = colIndex === 0;
    const isPersoKombo = isCustom && !!column.sourceKombo && column.sourceKombo !== "none";
    const isKomboCol = (!column.isCustom && column.id !== "none") || isPersoKombo;
    const overrides = colIndex > 0 ? (columnOverrides[colKey] || (isCustom ? getCustomDefaultOverrides() : getDefaultOverrides())) : null;

    return {
      colIndex, colKey, column, columns, props, overrides,
      isSuaSelecao, isCustom, isPersoKombo, isKomboCol,
      columnOverrides, getDefaultOverrides, getCustomDefaultOverrides, getColumnKey,
      updateColumnOverride, handlePlanCellClick, handleAddonCellClick, handlePremiumCellClick,
      setPrePaidUsers, setPrePaidContracts,
    };
  }, [getColumnKey, columnOverrides, getCustomDefaultOverrides, getDefaultOverrides, columns, props, updateColumnOverride, handlePlanCellClick, handleAddonCellClick, handlePremiumCellClick]);

  // ── Render ──
  const hasCustomizations = hiddenKombos.length > 0 || customColumns.length > 0 || Object.keys(columnOverrides).length > 0 || selectedPlans.length > 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-700">Sua Seleção vs <span className="text-[#F82E52]">Kombos</span> — <span className="text-[#F82E52]">até 40% de desconto</span> na contratação (ciclo + combo cumulativos)</h3>
        {hasCustomizations && (
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-full transition-all border border-gray-200 hover:border-red-200 shrink-0 ml-3"
            title="Resetar todas as configurações da tabela"
          >
            <RotateCcw className="w-3 h-3" />
            Resetar tudo
          </button>
        )}
      </div>
      <Card>
        <CardContent className="p-4">

          <div className={`w-full transition-all duration-300 overflow-x-auto ${isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
            <table className="w-full text-sm border-collapse" onMouseLeave={() => setHoveredColumn(null)}>
              <colgroup>
                <col style={{ width: "160px" }} />
                {columns.map((_, idx) => (
                  <col key={idx} style={{ minWidth: "120px" }} />
                ))}
                {customColumns.length < MAX_CUSTOM_COLUMNS && <col style={{ width: "50px" }} />}
              </colgroup>

              {/* ── Header ── */}
              <thead className="sticky top-0 z-10 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
                <tr className="border-b border-gray-200 bg-white">
                  <th className="text-left py-2 px-2 bg-white"></th>
                  {columns.map((col, colIndex) => {
                    const isFirstCustom = col.isCustom && colIndex === 1 + komboColumnCount;

                    return (
                      <th
                        key={col.id}
                        onMouseEnter={() => setHoveredColumn(col.id)}
                        className={`text-center py-2 px-1 cursor-pointer transition-colors duration-150 relative ${
                          isFirstCustom ? "border-l-2 border-dashed border-gray-300" : ""
                        } ${
                          selectedPlans.includes(col.id)
                            ? col.isCustom
                              ? "bg-amber-50 border-t-4 border-l-4 border-r-4 border-amber-500 rounded-t-xl shadow-lg shadow-amber-100"
                              : "bg-green-50 border-t-4 border-l-4 border-r-4 border-green-600 rounded-t-xl shadow-lg shadow-green-200"
                            : hoveredColumn === col.id && !selectedPlans.includes(col.id)
                            ? col.isCustom ? "bg-amber-50/50" : "bg-blue-50/70"
                            : colIndex % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          {col.isCustom && (
                            <button
                              onClick={(e) => { e.stopPropagation(); removeCustomColumn(col.id); }}
                              className="absolute top-1 right-1 p-0.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remover cenário"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          {(!col.isCustom && col.id !== "none") && (
                            <button
                              onClick={(e) => { e.stopPropagation(); hideKombo(col.id as KomboId); }}
                              className="absolute top-1 right-1 p-0.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remover kombo da tabela"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          )}
                          {col.isCustom ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-bold text-amber-700 text-sm">{col.shortName}</span>
                              <PersoKomboSelector
                                value={col.sourceKombo ?? null}
                                options={compatibleKomboIds.filter(k => k !== "none") as Exclude<KomboId, "none">[]}
                                onChange={(komboId) => setPersoSourceKombo(col.id, komboId)}
                              />
                            </div>
                          ) : (
                            <span className="font-bold text-gray-900">{col.shortName}</span>
                          )}
                          {col.discount > 0 && (
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                              {Math.round(col.discount * 100)}% OFF
                            </Badge>
                          )}
                          {col.isCustom && !col.sourceKombo && (
                            <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-600 bg-amber-50">
                              Personalizado
                            </Badge>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  {customColumns.length < MAX_CUSTOM_COLUMNS && (
                    <th className="text-center py-2 px-1 bg-white align-middle" rowSpan={1}>
                      <div className="flex flex-col items-center gap-1.5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={addCustomColumnFromSelection}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-blue-400 text-blue-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                title="Copiar Sua Seleção"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              Copiar Sua Seleção
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={addCustomColumn}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-500 hover:bg-green-50 transition-all"
                                title="Cenário em branco"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              Cenário em branco
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>

              {/* ── Body ── */}
              <tbody>
                {rows.map((row) => {
                  // Hide Boletos and Splits rows when Pay add-on is off
                  if ((row.key === "postpaidBoletos" || row.key === "postpaidSplits") && !props.addons.pay) {
                    return null;
                  }
                  // Hide Contratos adic. when Locação is not selected
                  if (row.key === "postpaidContracts" && props.product === "imob") {
                    return null;
                  }
                  // Hide WhatsApp Leads when Leads add-on is off
                  if (row.key === "postpaidWhatsApp" && !props.addons.leads) {
                    return null;
                  }
                  // Hide Assinaturas when Assinatura add-on is off
                  if (row.key === "postpaidAssinaturas" && !props.addons.assinatura) {
                    return null;
                  }
                  const needsSpacerAfter = (row as any).needsBottomSpacing;
                  return (
                    <React.Fragment key={`row-fragment-${row.key}`}>
                      <tr
                        className={`
                          ${(row as any).needsTopSpacing ? "mt-2" : ""}
                          ${(row as any).isFinalPrice
                            ? "bg-blue-100 rounded-lg border-2 border-blue-300 shadow-sm"
                            : (row as any).isMensalidadeRow
                            ? "bg-blue-50/50 rounded-lg border-2 border-blue-200/60"
                            : (row as any).isGrandTotal ? ""
                            : row.isHeader ? "bg-blue-50/70 border-t-2 border-b-2 border-gray-200"
                            : row.isTotal ? "bg-gray-100/70 border-b border-gray-200"
                            : "border-b border-gray-100 hover:bg-gray-50/30"
                          }
                        `}
                      >
                        {/* Row Label */}
                        <td
                          colSpan={row.isHeader ? 2 : 1}
                          className={`
                            ${row.isHeader ? "py-0.5 px-4" : row.isTotal ? "py-0.5 px-4" : "py-px px-4"}
                            ${row.indent ? "pl-8" : ""}
                            ${(row as any).isFinalPrice || (row as any).isMensalidadeRow ? "rounded-l-lg" : ""}
                            ${row.isHeader ? "font-semibold text-gray-700 text-xs"
                              : (row as any).isGrandTotal ? "font-extrabold text-gray-800 text-xs"
                              : row.isTotal ? "font-bold text-gray-700 text-xs"
                              : "text-gray-600 text-xs"
                            }
                          `}
                        >
                          {(row as any).sublabel ? (
                            <div className="flex flex-col items-start">
                              <span style={{fontSize: '12px'}}>{row.label}</span>
                              <span
                                className="text-[11px] italic text-gray-500 cursor-pointer hover:text-primary transition-colors"
                                onClick={() => setShowPrePagoPosPagoModal(true)}
                                title="Clique para saber mais sobre Pré-Pago e Pós-Pago"
                              >
                                {(row as any).sublabel}
                              </span>
                            </div>
                          ) : (
                            row.label
                          )}
                        </td>

                        {/* Data Cells */}
                        {columns.map((col, colIndex) => {
                          if (row.isHeader && colIndex === 0) return null;
                          const isFirstCustom = col.isCustom && colIndex === 1 + komboColumnCount;

                          return (
                            <td
                              key={`${row.key}-${col.id}`}
                              onMouseEnter={() => setHoveredColumn(col.id)}
                              onMouseLeave={() => setHoveredColumn(null)}
                              className={`py-0.5 px-2 text-center text-xs transition-colors duration-150
                                ${((row as any).isFinalPrice || (row as any).isMensalidadeRow) && colIndex === columns.length - 1 ? "rounded-r-lg" : ""}
                                ${isFirstCustom ? "border-l-2 border-dashed border-gray-300" : ""}
                                ${selectedPlans.includes(col.id)
                                  ? col.isCustom
                                    ? "bg-amber-50 border-l-4 border-r-4 border-amber-500 shadow-lg shadow-amber-100"
                                    : "bg-green-50 border-l-4 border-r-4 border-green-600 shadow-lg shadow-green-200"
                                  : hoveredColumn === col.id && !selectedPlans.includes(col.id)
                                  ? col.isCustom ? "bg-amber-50/50" : "bg-blue-50/70"
                                  : colIndex % 2 === 1 ? "bg-gray-50/50" : ""
                                } ${(row as any).isGrandTotal ? "font-extrabold text-gray-800 text-xs" : row.isTotal ? "font-bold text-gray-700 text-xs" : "text-gray-700 text-xs"}`} style={{color: '#141313'}}
                            >
                              {row.isHeader ? null : getCellValue(row.key, buildCellCtx(colIndex, col))}
                            </td>
                          );
                        })}
                        {customColumns.length < MAX_CUSTOM_COLUMNS && <td className="text-center py-2 px-1"></td>}
                      </tr>
                      {needsSpacerAfter && (
                        <tr key={`spacer-${row.key}`} className="h-3">
                          <td colSpan={columns.length + 2}></td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>

              {/* ── Footer (Select Buttons) ── */}
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                  <td className="py-2 px-2"></td>
                  {columns.map((col, colIndex) => {
                    const isFirstCustom = col.isCustom && colIndex === 1 + komboColumnCount;
                    return (
                      <td
                        key={`select-btn-${col.id}`}
                        onMouseEnter={() => setHoveredColumn(col.id)}
                        className={`text-center py-2 px-1 cursor-pointer transition-colors duration-150 ${
                          isFirstCustom ? "border-l-2 border-dashed border-gray-300" : ""
                        } ${
                          selectedPlans.includes(col.id)
                            ? col.isCustom
                              ? "bg-amber-50 border-l-4 border-r-4 border-b-4 border-amber-500 rounded-b-xl shadow-lg shadow-amber-100"
                              : "bg-green-50 border-l-4 border-r-4 border-b-4 border-green-600 rounded-b-xl shadow-lg shadow-green-200"
                            : hoveredColumn === col.id && !selectedPlans.includes(col.id)
                            ? col.isCustom ? "bg-amber-50/50" : "bg-blue-50/70"
                            : colIndex % 2 === 1 ? "bg-gray-50/50" : ""
                        }`}
                      >
                        <Button
                          onClick={() => handlePlanSelect(col.id)}
                          variant={selectedPlans.includes(col.id) ? "default" : "outline"}
                          className={`w-full text-xs transition-all duration-300 ${
                            selectedPlans.includes(col.id)
                              ? col.isCustom
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                          }`}
                          size="sm"
                        >
                          {selectedPlans.includes(col.id) ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Selecionado
                            </>
                          ) : col.isRecommended && selectedPlans.length === 0 ? (
                            <>
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Selecionar
                            </>
                          ) : (
                            "Selecionar"
                          )}
                        </Button>
                      </td>
                    );
                  })}
                  {customColumns.length < MAX_CUSTOM_COLUMNS && <td className="text-center py-2 px-1"></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Restore hidden kombos bar */}
      {hiddenKombos.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs text-gray-500">Kombos ocultos:</span>
          {hiddenKombos.map(komboId => {
            const def = KOMBO_DEFINITIONS[komboId as Exclude<KomboId, "none">];
            return (
              <button
                key={komboId}
                onClick={() => restoreKombo(komboId)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors"
                title={`Restaurar ${def?.name || komboId}`}
              >
                <Plus className="w-3 h-3" />
                {def?.name || komboId}
              </button>
            );
          })}
          {hiddenKombos.length > 1 && (
            <button
              onClick={restoreAllKombos}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-colors"
              title="Restaurar todos os kombos"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar todos
            </button>
          )}
        </div>
      )}

      <PrePagoPosPagoModal
        open={showPrePagoPosPagoModal}
        onOpenChange={setShowPrePagoPosPagoModal}
      />
    </div>
  );
}

export default KomboComparisonTable;
