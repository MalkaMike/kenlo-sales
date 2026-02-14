import { useEffect, useRef, useState } from "react";

/**
 * Hook that detects when a thead element becomes "stuck" (sticky positioned).
 * Adds/removes the `is-stuck` class for shadow effects.
 * Uses IntersectionObserver with a sentinel element approach.
 */
export function useStickyHeader() {
  const theadRef = useRef<HTMLTableSectionElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const thead = theadRef.current;
    if (!thead) return;

    // Create a sentinel element just above the thead
    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    sentinel.style.width = "1px";
    sentinel.style.position = "absolute";
    sentinel.style.top = "-1px";
    sentinel.style.left = "0";
    sentinel.style.pointerEvents = "none";
    sentinel.setAttribute("aria-hidden", "true");

    // Insert sentinel before the table (relative to the scroll container)
    const table = thead.closest("table");
    if (!table) return;
    
    table.style.position = "relative";
    table.prepend(sentinel);

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel is not visible, the header is stuck
        setIsStuck(!entry.isIntersecting);
      },
      {
        // Account for the navbar height (64px)
        rootMargin: "-65px 0px 0px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  useEffect(() => {
    const thead = theadRef.current;
    if (!thead) return;

    if (isStuck) {
      thead.classList.add("is-stuck");
    } else {
      thead.classList.remove("is-stuck");
    }
  }, [isStuck]);

  return { theadRef, isStuck };
}
