/**
 * ColumnCycleSelector - Inline dropdown for selecting payment frequency per column.
 */

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { FREQUENCY_OPTIONS } from "./komboComparisonTypes";
import type { PaymentFrequency } from "./komboComparisonTypes";

interface ColumnCycleSelectorProps {
  value: PaymentFrequency;
  onChange: (freq: PaymentFrequency) => void;
}

export function ColumnCycleSelector({ value, onChange }: ColumnCycleSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = FREQUENCY_OPTIONS.find(o => o.id === value)!;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="inline-flex items-center gap-0.5 px-2 py-1 text-[10px] font-medium rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all"
      >
        {current.shortLabel}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[100px]">
          {FREQUENCY_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={(e) => { e.stopPropagation(); onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 transition-colors ${
                opt.id === value ? "font-bold text-primary bg-primary/5" : "text-gray-600"
              }`}
            >
              {opt.label} <span className="text-gray-400 ml-1">{opt.discount}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
