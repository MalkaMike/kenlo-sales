/**
 * CalculadoraContext - React Context for sharing calculator state across sub-components
 */

import React, { createContext, useContext } from "react";
import { useCalculadora, type UseCalculadoraReturn } from "./useCalculadora";

const CalculadoraContext = createContext<UseCalculadoraReturn | null>(null);

export function CalculadoraProvider({ children }: { children: React.ReactNode }) {
  const calc = useCalculadora();
  return (
    <CalculadoraContext.Provider value={calc}>
      {children}
    </CalculadoraContext.Provider>
  );
}

export function useCalc(): UseCalculadoraReturn {
  const ctx = useContext(CalculadoraContext);
  if (!ctx) {
    throw new Error("useCalc must be used within a CalculadoraProvider");
  }
  return ctx;
}
