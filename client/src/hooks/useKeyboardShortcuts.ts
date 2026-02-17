import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Global keyboard shortcuts for quick navigation
 * 
 * Shortcuts:
 * - Ctrl/Cmd + K: Go to Cotação (Calculator)
 * - Ctrl/Cmd + H: Go to Home
 * - Ctrl/Cmd + P: Go to Produtos (Imob page)
 */
export function useKeyboardShortcuts() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed
      const isModifierPressed = event.ctrlKey || event.metaKey;

      if (!isModifierPressed) return;

      // Prevent default browser behavior for our shortcuts
      const key = event.key.toLowerCase();

      switch (key) {
        case "k":
          event.preventDefault();
          setLocation("/calculadora");
          break;
        case "h":
          event.preventDefault();
          setLocation("/");
          break;
        case "p":
          event.preventDefault();
          setLocation("/produtos/imob");
          break;
        default:
          break;
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setLocation]);
}
