import React from "react";

/**
 * Formats plan name for display, converting "K2" to "K²" with a readable superscript.
 * Use this for all user-facing plan name rendering.
 *
 * @param name - The plan name (e.g., "K2", "Prime", "K")
 * @returns React element with proper superscript styling
 */
export function PlanName({ name }: { name: string }) {
  if (!name) return null;

  // Replace K2 with K + styled superscript 2
  const k2Regex = /K2/gi;
  if (k2Regex.test(name)) {
    const parts = name.split(/K2/gi);
    const matches = name.match(/K2/gi) || [];
    const result: React.ReactNode[] = [];

    parts.forEach((part, i) => {
      if (part) result.push(part);
      if (i < matches.length) {
        result.push(
          <span key={i}>
            K<sup className="text-[0.7em] font-bold relative -top-[0.3em]">2</sup>
          </span>
        );
      }
    });

    return <>{result}</>;
  }

  return <>{name}</>;
}

/**
 * Formats plan name as a plain string with Unicode superscript ² character.
 * Use this for non-JSX contexts (e.g., PDF generation, tooltips, alt text).
 *
 * @param name - The plan name (e.g., "K2", "Prime", "K")
 * @returns String with K² using Unicode superscript
 */
export function formatPlanName(name: string): string {
  if (!name) return name;
  return name.replace(/K2/gi, "K\u00B2");
}
