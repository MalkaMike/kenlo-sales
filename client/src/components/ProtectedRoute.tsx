import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useSalesperson } from "@/hooks/useSalesperson";
import { useAuth } from "@/_core/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/** Allowed email domains for access */
const ALLOWED_DOMAINS = ["kenlo.com.br", "i-value.com.br", "laik.com.br"];

function isAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false;
  const domain = email.toLowerCase().split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated: isSalespersonAuth, isLoading: isSalespersonLoading } = useSalesperson();
  const { user: oauthUser, loading: isOAuthLoading } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  // Check if user is authenticated via OAuth with allowed domain
  const isOAuthAuthenticated = oauthUser && isAllowedDomain(oauthUser.email);
  
  // User is authenticated if either:
  // 1. Logged in via salesperson system (email/password)
  // 2. Logged in via OAuth with allowed domain (@kenlo.com.br, @i-value.com.br, @laik.com.br)
  const isAuthenticated = isSalespersonAuth || isOAuthAuthenticated;
  const isLoading = isSalespersonLoading || isOAuthLoading;

  useEffect(() => {
    if (!isLoading) {
      setHasChecked(true);
      if (!isAuthenticated) {
        setLocation("/login");
      }
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
