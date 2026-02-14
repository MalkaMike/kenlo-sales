/**
 * Cell renderer functions for the Kombo Comparison Table.
 * Each function returns a React node for a specific row type.
 */

import React from "react";
import { TrendingUp } from "lucide-react";
import { KOMBO_DEFINITIONS } from "./komboDefinitions";
import { formatCurrency, CYCLE_LABELS } from "./komboColumnCalculators";
import { ColumnCycleSelector } from "./ColumnCycleSelector";
import type {
  PaymentFrequency,
  KomboId,
  KomboColumnData,
  KomboComparisonProps,
  ColumnOverrides,
} from "./komboComparisonTypes";

/** Context passed to cell renderers from the main component */
export interface CellRenderContext {
  colIndex: number;
  colKey: string;
  column: KomboColumnData;
  columns: KomboColumnData[];
  props: KomboComparisonProps;
  overrides: ColumnOverrides | null;
  isSuaSelecao: boolean;
  isCustom: boolean;
  isPersoKombo: boolean;
  isKomboCol: boolean;
  columnOverrides: Record<string, ColumnOverrides>;
  getDefaultOverrides: () => ColumnOverrides;
  getCustomDefaultOverrides: () => ColumnOverrides;
  getColumnKey: (colIndex: number) => string;
  updateColumnOverride: (colKey: string, update: Partial<ColumnOverrides>) => void;
  handlePlanCellClick: (colIndex: number, planType: "imob" | "loc", e: React.MouseEvent) => void;
  handleAddonCellClick: (colIndex: number, addonKey: string, e: React.MouseEvent) => void;
  handlePremiumCellClick: (colIndex: number, serviceKey: "vipSupport" | "dedicatedCS" | "training", e: React.MouseEvent) => void;
  setPrePaidUsers: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setPrePaidContracts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

// ─── Plan Cell ───────────────────────────────────────────────────────────────

export function renderPlanCell(
  price: number | null,
  planType: "imob" | "loc",
  ctx: CellRenderContext
): React.ReactNode {
  if (price === null) return <span className="text-gray-300">—</span>;
  const currentPlan = ctx.overrides
    ? (planType === "imob" ? ctx.overrides.imobPlan : ctx.overrides.locPlan)
    : (planType === "imob" ? ctx.props.imobPlan : ctx.props.locPlan);

  const isEditable = !ctx.isSuaSelecao;

  return (
    <div
      className={`flex flex-col items-center gap-0.5 ${isEditable ? "cursor-pointer group" : ""}`}
      onClick={isEditable ? (e) => ctx.handlePlanCellClick(ctx.colIndex, planType, e) : undefined}
    >
      <span className="font-medium text-gray-700 text-sm">R$ {formatCurrency(price)}</span>
      <span className={`text-[9px] font-bold ${isEditable ? "text-primary group-hover:underline" : "text-gray-500"}`}>
        {currentPlan === "k2" ? <>K<sup className="text-[0.6em]">2</sup></> : currentPlan.toUpperCase()}
      </span>
    </div>
  );
}

// ─── Add-on Cell ─────────────────────────────────────────────────────────────

export function renderAddonCell(
  price: number | null,
  addonKey: string,
  ctx: CellRenderContext
): React.ReactNode {
  // Sua Seleção: read-only
  if (ctx.isSuaSelecao) {
    if (["pay", "seguros", "cash"].includes(addonKey)) {
      const isOn = ctx.props.addons[addonKey as keyof typeof ctx.props.addons];
      if (!isOn) return <span className="text-gray-300 text-sm">—</span>;
      return <span className="font-medium text-gray-700 text-sm">{addonKey === "cash" ? "Grátis" : "Pós-pago"}</span>;
    }
    if (price === null) return <span className="text-gray-300 text-sm">—</span>;
    return <span className="font-medium text-gray-700 text-sm">R$ {formatCurrency(price)}</span>;
  }

  // Kombo columns: fixed
  if (ctx.isKomboCol) {
    if (["pay", "seguros", "cash"].includes(addonKey)) {
      const effectiveKomboId = (ctx.isPersoKombo ? ctx.column.sourceKombo : ctx.column.id) as Exclude<KomboId, "none">;
      const isIncluded = KOMBO_DEFINITIONS[effectiveKomboId]?.includedAddons.includes(addonKey);
      if (isIncluded) {
        const label = addonKey === "cash" ? "Grátis" : "Pós-pago";
        return <span className="font-medium text-gray-700 text-sm">{label}</span>;
      }
      return <span className="text-gray-300 text-sm">—</span>;
    }
    if (price !== null) {
      return <span className="font-medium text-gray-700 text-sm">R$ {formatCurrency(price)}</span>;
    }
    return <span className="text-gray-300 text-sm">—</span>;
  }

  // Custom columns: toggleable
  if (["pay", "seguros", "cash"].includes(addonKey)) {
    const label = addonKey === "cash" ? "Grátis" : "Pós-pago";
    const isActive = ctx.overrides?.addons[addonKey as keyof typeof ctx.overrides.addons] ?? false;
    return (
      <div
        className="cursor-pointer group"
        onClick={(e) => ctx.handleAddonCellClick(ctx.colIndex, addonKey, e)}
      >
        {isActive ? (
          <span className="text-green-600 font-semibold text-xs group-hover:underline">{label}</span>
        ) : (
          <span className="text-gray-300 group-hover:text-gray-500 transition-colors">—</span>
        )}
      </div>
    );
  }

  // Paid add-ons in custom columns
  const isActive = ctx.overrides?.addons[addonKey as keyof typeof ctx.overrides.addons] ?? false;
  if (isActive && price !== null) {
    return (
      <div
        className="cursor-pointer group"
        onClick={(e) => ctx.handleAddonCellClick(ctx.colIndex, addonKey, e)}
      >
        <span className="font-medium text-gray-700 text-sm group-hover:line-through group-hover:text-red-400 transition-colors">
          R$ {formatCurrency(price)}
        </span>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer group"
      onClick={(e) => ctx.handleAddonCellClick(ctx.colIndex, addonKey, e)}
    >
      <span className="text-gray-300 group-hover:text-green-500 transition-colors">—</span>
    </div>
  );
}

// ─── Premium Service Cell ────────────────────────────────────────────────────

export function renderPremiumCell(
  priceOrLabel: number | string | null,
  serviceKey: "vipSupport" | "dedicatedCS",
  ctx: CellRenderContext
): React.ReactNode {
  if (priceOrLabel === "Incluído") {
    return <span className="text-green-600 font-semibold text-xs">Incluído</span>;
  }

  // Custom columns (not Perso-Kombo): toggleable
  if (ctx.isCustom && !ctx.isPersoKombo) {
    if (typeof priceOrLabel === "number") {
      return (
        <div
          className="cursor-pointer group"
          onClick={(e) => ctx.handlePremiumCellClick(ctx.colIndex, serviceKey, e)}
        >
          <span className="font-medium text-gray-700 text-sm group-hover:line-through group-hover:text-red-400 transition-colors">
            R$ {formatCurrency(priceOrLabel)}
          </span>
        </div>
      );
    }

    return (
      <div
        className="cursor-pointer group"
        onClick={(e) => ctx.handlePremiumCellClick(ctx.colIndex, serviceKey, e)}
      >
        <span className="text-gray-300 group-hover:text-green-500 transition-colors">—</span>
      </div>
    );
  }

  // Non-custom columns
  if (typeof priceOrLabel === "number") {
    return <span className="font-medium text-sm">R$ {formatCurrency(priceOrLabel)}</span>;
  }
  return <span className="text-gray-300 text-sm">—</span>;
}

// ─── Training Cell ───────────────────────────────────────────────────────────

export function renderTrainingCell(ctx: CellRenderContext): React.ReactNode {
  const { column } = ctx;

  if (column.trainingPrice === "Incluído") return <span className="text-green-600 font-semibold text-xs">Incluído</span>;
  if (typeof column.trainingPrice === "string" && column.trainingPrice) {
    return <span className="text-green-600 font-semibold text-xs">{column.trainingPrice}</span>;
  }

  // Custom columns (not Perso-Kombo): toggleable
  if (ctx.isCustom && !ctx.isPersoKombo) {
    if (typeof column.trainingPrice === "number") {
      return (
        <div
          className="cursor-pointer group"
          onClick={(e) => ctx.handlePremiumCellClick(ctx.colIndex, "training", e)}
        >
          <span className="font-medium text-gray-700 text-sm group-hover:line-through group-hover:text-red-400 transition-colors">
            R$ {formatCurrency(column.trainingPrice)}
          </span>
        </div>
      );
    }
    return (
      <div
        className="cursor-pointer group"
        onClick={(e) => ctx.handlePremiumCellClick(ctx.colIndex, "training", e)}
      >
        <span className="text-gray-300 group-hover:text-green-500 transition-colors">—</span>
      </div>
    );
  }

  if (typeof column.trainingPrice === "number") {
    return <span className="font-medium text-sm">R$ {formatCurrency(column.trainingPrice)}</span>;
  }
  return <span className="text-gray-300 text-sm">—</span>;
}

// ─── Post-Paid Cells ─────────────────────────────────────────────────────────

export function renderPostPaidUsersCell(ctx: CellRenderContext): React.ReactNode {
  const pp = ctx.column.postPaidUsers;
  if (!pp) return <span className="text-gray-300 text-xs">—</span>;
  if (pp.cost === 0) return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-green-600 font-medium">No Plano</span>
      <span className="text-[8px] text-gray-400 italic">{pp.included} incluídos</span>
    </div>
  );
  const isPrepaid = ctx.column.prePaidUsersActive;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[8px] text-gray-400 italic">R$ {pp.perUnit.toFixed(2)}/usuário</span>
      {isPrepaid ? (
        <span className="text-[10px] text-green-600 font-semibold">Pré-pago ✓</span>
      ) : (
        <span className="text-[10px] text-amber-700 font-semibold">R$ {formatCurrency(pp.cost)}</span>
      )}
      <span className="text-[8px] text-gray-400 italic">{pp.additional} adic. ({pp.included} incl.)</span>
      <button
        className={`text-[8px] mt-0.5 px-1.5 py-0.5 rounded border transition-colors ${
          isPrepaid
            ? "border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
            : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          const ck = ctx.getColumnKey(ctx.colIndex);
          ctx.setPrePaidUsers(prev => ({ ...prev, [ck]: !prev[ck] }));
        }}
      >
        {isPrepaid ? "Voltar pós-pago" : "Pré-pagar"}
      </button>
    </div>
  );
}

export function renderPostPaidContractsCell(ctx: CellRenderContext): React.ReactNode {
  const pp = ctx.column.postPaidContracts;
  if (!pp) return <span className="text-gray-300 text-xs">—</span>;
  if (pp.cost === 0) return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-green-600 font-medium">No Plano</span>
      <span className="text-[8px] text-gray-400 italic">{pp.included} incluídos</span>
    </div>
  );
  const isPrepaidC = ctx.column.prePaidContractsActive;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[8px] text-gray-400 italic">R$ {pp.perUnit.toFixed(2)}/contrato</span>
      {isPrepaidC ? (
        <span className="text-[10px] text-green-600 font-semibold">Pré-pago ✓</span>
      ) : (
        <span className="text-[10px] text-amber-700 font-semibold">R$ {formatCurrency(pp.cost)}</span>
      )}
      <span className="text-[8px] text-gray-400 italic">{pp.additional} adic. ({pp.included} incl.)</span>
      <button
        className={`text-[8px] mt-0.5 px-1.5 py-0.5 rounded border transition-colors ${
          isPrepaidC
            ? "border-green-400 bg-green-50 text-green-700 hover:bg-green-100"
            : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          const ck = ctx.getColumnKey(ctx.colIndex);
          ctx.setPrePaidContracts(prev => ({ ...prev, [ck]: !prev[ck] }));
        }}
      >
        {isPrepaidC ? "Voltar pós-pago" : "Pré-pagar"}
      </button>
    </div>
  );
}

export function renderPostPaidWhatsAppCell(ctx: CellRenderContext): React.ReactNode {
  const pp = ctx.column.postPaidWhatsApp;
  if (!pp) return <span className="text-gray-300 text-xs">—</span>;
  if (pp.cost === 0) return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-green-600 font-semibold">Sem custos</span>
      <span className="text-[8px] text-gray-400 italic">{pp.included} incl./mês</span>
    </div>
  );
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3 text-amber-600" />
        <span className="text-[8px] text-gray-400 italic">
          R$ {pp.perUnit.toFixed(2)}/lead × {pp.additional} add.
        </span>
      </div>
      <span className="text-[11px] text-amber-700 font-bold">
        R$ {pp.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês
      </span>
    </div>
  );
}

export function renderPostPaidAssinaturasCell(ctx: CellRenderContext): React.ReactNode {
  const pp = ctx.column.postPaidAssinaturas;
  if (!pp) return <span className="text-gray-300 text-xs">—</span>;
  if (pp.cost === 0) return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-green-600 font-medium">No Plano</span>
      <span className="text-[8px] text-gray-400 italic">{pp.included} incl., {pp.total} usadas</span>
    </div>
  );
  return (
    <div className="flex flex-col items-center">
      <span className="text-[8px] text-gray-400 italic">R$ {pp.perUnit.toFixed(2)}/assinatura</span>
      <span className="text-[10px] text-amber-700 font-semibold">R$ {pp.cost.toFixed(2).replace('.', ',')}</span>
      <span className="text-[8px] text-gray-400 italic">{pp.additional} adic. ({pp.included} incl.)</span>
    </div>
  );
}

export function renderPostPaidBoletosCell(ctx: CellRenderContext): React.ReactNode {
  const pp = ctx.column.postPaidBoletos;
  if (!pp) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <div className="flex flex-col items-center">
      <span className="text-[8px] text-gray-400 italic">R$ {pp.perUnit.toFixed(2)}/boleto</span>
      <span className="text-[10px] text-amber-700 font-semibold">R$ {formatCurrency(pp.cost)}</span>
      <span className="text-[8px] text-gray-400 italic">{pp.quantity.toLocaleString('pt-BR')} boletos</span>
    </div>
  );
}

export function renderPostPaidSplitsCell(ctx: CellRenderContext): React.ReactNode {
  const pp = ctx.column.postPaidSplits;
  if (!pp) return <span className="text-gray-300 text-xs">—</span>;
  return (
    <div className="flex flex-col items-center">
      <span className="text-[8px] text-gray-400 italic">R$ {pp.perUnit.toFixed(2)}/split</span>
      <span className="text-[10px] text-amber-700 font-semibold">R$ {formatCurrency(pp.cost)}</span>
      <span className="text-[8px] text-gray-400 italic">{pp.quantity.toLocaleString('pt-BR')} splits</span>
    </div>
  );
}

// ─── Total Cells ─────────────────────────────────────────────────────────────

export function renderTotalMonthlyCell(ctx: CellRenderContext): React.ReactNode {
  return (
    <div className="flex flex-col items-center gap-0">
      <span className="font-bold text-sm">R$ {formatCurrency(ctx.column.totalMonthly)}</span>
      <span className="text-[9px] text-gray-400 font-normal">
        {ctx.column.subscriptionCount} {ctx.column.subscriptionCount === 1 ? "assinatura" : "assinaturas"}
      </span>
    </div>
  );
}

export function renderImplCell(rowKey: string, ctx: CellRenderContext): React.ReactNode {
  const implKeyMap: Record<string, string> = {
    implImob: "Imob",
    implLoc: "Locação",
    implLeads: "Leads",
    implInteligencia: "Inteligência",
  };
  const implLabel = implKeyMap[rowKey];
  const item = ctx.column.implBreakdown.find(b => b.label === implLabel);
  if (!item) return <span className="text-gray-300 text-sm">—</span>;
  if (item.free) {
    return <span className="text-green-600 text-[10px] font-semibold">Ofertado</span>;
  }
  return <span className="text-xs text-gray-600">R$ {formatCurrency(item.cost)}</span>;
}

export function renderImplTotalCell(ctx: CellRenderContext): React.ReactNode {
  return <span className="font-bold text-gray-700 text-sm">R$ {formatCurrency(ctx.column.implementation)}</span>;
}

export function renderCycleTotalCell(ctx: CellRenderContext): React.ReactNode {
  const cycleLabel = CYCLE_LABELS[ctx.column.overrides?.frequency ?? ctx.props.frequency];
  return (
    <div className="flex flex-col items-center gap-0">
      <span className="font-bold text-gray-800 text-sm">R$ {formatCurrency(ctx.column.cycleTotalValue)}</span>
      <span className="text-[9px] text-gray-400 font-normal">({cycleLabel})</span>
    </div>
  );
}

export function renderCycleCell(ctx: CellRenderContext): React.ReactNode {
  const colKey2 = ctx.getColumnKey(ctx.colIndex);
  const isCustom2 = colKey2.startsWith("custom_");
  let currentFreq: PaymentFrequency;
  if (ctx.colIndex === 0) {
    currentFreq = (ctx.columnOverrides["sua_selecao"]?.frequency) ?? ctx.props.frequency;
  } else {
    currentFreq = (ctx.columnOverrides[colKey2] || (isCustom2 ? ctx.getCustomDefaultOverrides() : ctx.getDefaultOverrides())).frequency;
  }
  return (
    <ColumnCycleSelector
      value={currentFreq}
      onChange={(freq) => {
        if (ctx.colIndex === 0) {
          ctx.updateColumnOverride("sua_selecao", { frequency: freq });
          ctx.props.onFrequencyChange?.(freq);
        } else {
          ctx.updateColumnOverride(colKey2, { frequency: freq });
        }
      }}
    />
  );
}

export function renderSavingsCell(ctx: CellRenderContext): React.ReactNode {
  const semKombo = ctx.columns[0];
  if (ctx.column.id === "none" || semKombo.cycleTotalValue === 0) return null;
  const savings = semKombo.cycleTotalValue - ctx.column.cycleTotalValue;
  if (savings <= 0) return null;
  const cycleLabel = CYCLE_LABELS[ctx.column.overrides?.frequency ?? ctx.props.frequency].toLowerCase();
  return (
    <span className="text-[11px] text-green-600 font-semibold">
      Economia de R$ {formatCurrency(savings)}/{cycleLabel}
    </span>
  );
}

export function renderPostPaidTotalCell(ctx: CellRenderContext): React.ReactNode {
  if (ctx.column.postPaidTotal === 0) {
    const hasAnyPostPaid = ctx.column.postPaidUsers || ctx.column.postPaidContracts || ctx.column.postPaidWhatsApp || ctx.column.postPaidAssinaturas || ctx.column.postPaidBoletos || ctx.column.postPaidSplits;
    if (!hasAnyPostPaid) return <span className="text-gray-300 text-xs">—</span>;
    return <span className="text-[10px] text-green-600 font-semibold">Sem custos</span>;
  }
  return (
    <span className="text-[11px] text-amber-700 font-bold">R$ {ctx.column.postPaidTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês</span>
  );
}

export function renderGrandTotalCell(ctx: CellRenderContext): React.ReactNode {
  const totalEstimate = ctx.column.totalMonthly + ctx.column.postPaidTotal;
  return (
    <span className="text-[13px] text-primary font-extrabold">R$ {totalEstimate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês</span>
  );
}

// ─── Main Cell Value Dispatcher ──────────────────────────────────────────────

export function getCellValue(rowKey: string, ctx: CellRenderContext): React.ReactNode {
  switch (rowKey) {
    case "imob":
      return renderPlanCell(ctx.column.imobPrice, "imob", ctx);
    case "loc":
      return renderPlanCell(ctx.column.locPrice, "loc", ctx);
    case "leads":
      return renderAddonCell(ctx.column.leadsPrice, "leads", ctx);
    case "inteligencia":
      return renderAddonCell(ctx.column.inteligenciaPrice, "inteligencia", ctx);
    case "assinatura":
      return renderAddonCell(ctx.column.assinaturaPrice, "assinatura", ctx);
    case "seguros":
      return renderAddonCell(null, "seguros", ctx);
    case "cash":
      return renderAddonCell(null, "cash", ctx);
    case "vipSupport":
      return renderPremiumCell(ctx.column.vipSupportPrice, "vipSupport", ctx);
    case "dedicatedCS":
      return renderPremiumCell(ctx.column.dedicatedCSPrice, "dedicatedCS", ctx);
    case "training":
      return renderTrainingCell(ctx);
    case "cycle":
      return renderCycleCell(ctx);
    case "totalMonthly":
      return renderTotalMonthlyCell(ctx);
    case "implImob":
    case "implLoc":
    case "implLeads":
    case "implInteligencia":
      return renderImplCell(rowKey, ctx);
    case "implTotal":
      return renderImplTotalCell(ctx);
    case "cycleTotal":
      return renderCycleTotalCell(ctx);
    case "savings":
      return renderSavingsCell(ctx);
    case "postpaidUsers":
      return renderPostPaidUsersCell(ctx);
    case "postpaidContracts":
      return renderPostPaidContractsCell(ctx);
    case "postpaidWhatsApp":
      return renderPostPaidWhatsAppCell(ctx);
    case "postpaidAssinaturas":
      return renderPostPaidAssinaturasCell(ctx);
    case "postpaidBoletos":
      return renderPostPaidBoletosCell(ctx);
    case "postpaidSplits":
      return renderPostPaidSplitsCell(ctx);
    case "postpaidTotal":
      return renderPostPaidTotalCell(ctx);
    case "totalMonthlyEstimate":
      return renderGrandTotalCell(ctx);
    default:
      return null;
  }
}
