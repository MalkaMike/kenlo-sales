/**
 * PersoKomboSelector - Dropdown to choose a Kombo template or "Personalizado" for custom columns.
 */

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { KOMBO_DEFINITIONS } from "./komboDefinitions";
import type { KomboId } from "./komboComparisonTypes";

interface PersoKomboSelectorProps {
  value: KomboId | null;
  options: Exclude<KomboId, "none">[];
  onChange: (komboId: KomboId | null) => void;
}

export function PersoKomboSelector({ value, options, onChange }: PersoKomboSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLabel = value && value !== "none"
    ? KOMBO_DEFINITIONS[value as Exclude<KomboId, "none">]?.shortName ?? "Kombo"
    : "Personalizado";
  const isKomboMode = value && value !== "none";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-medium rounded border transition-all ${
          isKomboMode
            ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
            : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
        }`}
      >
        {isKomboMode && <Layers className="w-2.5 h-2.5" />}
        {currentLabel}
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
          <button
            onClick={(e) => { e.stopPropagation(); onChange(null); setOpen(false); }}
            className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-50 transition-colors ${
              !value || value === "none" ? "font-bold text-amber-600 bg-amber-50/50" : "text-gray-600"
            }`}
          >
            Personalizado
          </button>
          <div className="border-t border-gray-100 my-0.5" />
          {options.map(opt => {
            const kombo = KOMBO_DEFINITIONS[opt];
            return (
              <button
                key={opt}
                onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-50 transition-colors ${
                  value === opt ? "font-bold text-primary bg-primary/5" : "text-gray-600"
                }`}
              >
                {kombo.shortName}
                {kombo.discount > 0 && (
                  <span className="text-primary ml-1">{Math.round(kombo.discount * 100)}%</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
