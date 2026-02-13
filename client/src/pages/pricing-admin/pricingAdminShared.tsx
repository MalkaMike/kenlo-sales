/**
 * Shared UI atoms and helpers for PricingAdmin sub-components.
 */

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Info, ChevronDown, ChevronRight, Eye } from "lucide-react";

// ── Format helpers (from shared) ──────────────────────────────
import { formatNumberFlexible } from "@shared/formatters";
export const formatNumber = formatNumberFlexible;

export const parseFormattedNumber = (str: string): number =>
  parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;

export const roundToSeven = (price: number): number => {
  const tens = Math.ceil(price / 10) * 10;
  return tens - 3;
};

// ── NumberInput ─────────────────────────────────────────────────
export const NumberInput = ({
  value,
  onChange,
  step = "1",
  className = "",
  disabled = false,
}: {
  value: number;
  onChange: (val: number) => void;
  step?: string;
  className?: string;
  disabled?: boolean;
}) => {
  const [displayValue, setDisplayValue] = useState(formatNumber(value));

  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const parsed = parseFormattedNumber(raw);
    if (!isNaN(parsed)) onChange(parsed);
  };

  const handleBlur = () => {
    setDisplayValue(formatNumber(parseFormattedNumber(displayValue)));
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className={`h-7 text-sm ${className}`}
    />
  );
};

// ── HelperText ──────────────────────────────────────────────────
export const HelperText = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] text-muted-foreground italic mt-1 flex items-start gap-1">
    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
    <span>{children}</span>
  </p>
);

// ── SectionHeader ───────────────────────────────────────────────
export const SectionHeader = ({
  letter,
  title,
  description,
  collapsed,
  onToggle,
}: {
  letter: string;
  title: string;
  description: string;
  collapsed: boolean;
  onToggle: () => void;
}) => (
  <div className="mb-4 cursor-pointer select-none" onClick={onToggle}>
    <div className="flex items-center gap-3 mb-1">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-lg font-bold text-primary">{letter}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{title}</h2>
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

// ── PricePreview ────────────────────────────────────────────────
export const PricePreview = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded text-xs">
    <Eye className="w-3 h-3 text-primary" />
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-semibold text-primary">{value}</span>
  </div>
);

// ── TOC sections ────────────────────────────────────────────────
export const SECTIONS = [
  { id: "section-a", letter: "A", title: "Ciclo de Pagamento" },
  { id: "section-b", letter: "B", title: "Planos Base" },
  { id: "section-c", letter: "C", title: "Add-ons" },
  { id: "section-d", letter: "D", title: "Serviços Premium" },
  { id: "section-e", letter: "E", title: "Kombos" },
  { id: "section-f", letter: "F", title: "Custos Variáveis" },
  { id: "section-g", letter: "G", title: "Funcionalidades" },
];

// ── Shared prop types ───────────────────────────────────────────
export interface SectionProps {
  formData: any;
  updateValue: (path: string[], value: any) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export interface SectionWithPreviewProps extends SectionProps {
  getPreviewPrices: (annualPrice: number) => {
    monthly: number;
    semestral: number;
    annual: number;
    biennial: number;
  } | null;
}
