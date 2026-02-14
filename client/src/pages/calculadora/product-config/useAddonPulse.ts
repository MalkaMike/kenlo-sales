/**
 * useAddonPulse - Hook for add-on card pulse animation on toggle
 * Returns a ref callback and CSS class to apply pulse animation when toggled
 */

import { useRef, useEffect, useCallback } from "react";

export function useAddonPulse(isActive: boolean) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prevActive = useRef(isActive);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render (initial state)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevActive.current = isActive;
      return;
    }

    // Only animate when the value actually changes
    if (prevActive.current !== isActive && cardRef.current) {
      const el = cardRef.current;
      // Remove class first to allow re-triggering
      el.classList.remove("addon-toggle-pulse");
      // Force reflow
      void el.offsetWidth;
      el.classList.add("addon-toggle-pulse");

      const handleEnd = () => {
        el.classList.remove("addon-toggle-pulse");
      };
      el.addEventListener("animationend", handleEnd, { once: true });
    }
    prevActive.current = isActive;
  }, [isActive]);

  // Active state border class
  const activeClass = isActive
    ? "border-green-500/60 bg-green-50/50 shadow-sm"
    : "";

  return { cardRef, activeClass };
}
