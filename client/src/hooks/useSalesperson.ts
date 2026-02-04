import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useState } from "react";

export interface Salesperson {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const STORAGE_KEY = "kenlo_salesperson_token";
const SALESPERSON_DATA_KEY = "kenlo_salesperson_data";

// Check if token is expired (expires at end of day)
function isTokenExpired(): boolean {
  const storedDate = localStorage.getItem("kenlo_salesperson_date");
  if (!storedDate) return true;
  
  const today = new Date().toDateString();
  return storedDate !== today;
}

export function useSalesperson() {
  const [salesperson, setSalesperson] = useState<Salesperson | null>(() => {
    // Initialize from localStorage if available and not expired
    if (typeof window === "undefined") return null;
    
    if (isTokenExpired()) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SALESPERSON_DATA_KEY);
      localStorage.removeItem("kenlo_salesperson_date");
      return null;
    }
    
    const stored = localStorage.getItem(SALESPERSON_DATA_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = trpc.salesperson.login.useMutation();
  const logoutMutation = trpc.salesperson.logout.useMutation();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isTokenExpired()) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SALESPERSON_DATA_KEY);
        localStorage.removeItem("kenlo_salesperson_date");
        setSalesperson(null);
        setIsLoading(false);
        return;
      }

      const stored = localStorage.getItem(SALESPERSON_DATA_KEY);
      if (stored) {
        try {
          setSalesperson(JSON.parse(stored));
        } catch {
          setSalesperson(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      try {
        const result = await loginMutation.mutateAsync({ email, password });
        if (result.success && result.salesperson && result.token) {
          // Store token and salesperson data in localStorage
          localStorage.setItem(STORAGE_KEY, result.token);
          localStorage.setItem(SALESPERSON_DATA_KEY, JSON.stringify(result.salesperson));
          localStorage.setItem("kenlo_salesperson_date", new Date().toDateString());
          
          setSalesperson(result.salesperson);
          return { success: true };
        } else {
          setError(result.error || "Erro ao fazer login");
          return { success: false, error: result.error };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao fazer login";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (err) {
      console.error("Logout error:", err);
    }
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SALESPERSON_DATA_KEY);
    localStorage.removeItem("kenlo_salesperson_date");
    setSalesperson(null);
  }, [logoutMutation]);

  return {
    salesperson,
    isLoading,
    isAuthenticated: !!salesperson,
    error,
    login,
    logout,
  };
}

// Helper to get token for API calls
export function getSalespersonToken(): string | null {
  if (typeof window === "undefined") return null;
  if (isTokenExpired()) return null;
  return localStorage.getItem(STORAGE_KEY);
}
