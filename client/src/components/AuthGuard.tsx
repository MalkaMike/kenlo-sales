import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

/** Allowed email domains for access */
const ALLOWED_DOMAINS = ["kenlo.com.br", "i-value.com.br", "laik.com.br"];

function isAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false;
  const domain = email.toLowerCase().split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
}

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard wraps the entire app (except /login and /acesso-negado).
 * It requires the user to be logged in via Google OAuth with an allowed domain.
 * If not authenticated, redirects to /login.
 * If authenticated but wrong domain, redirects to /acesso-negado.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setHasChecked(true);
      if (!user) {
        // Not logged in at all — redirect to login
        setLocation("/login");
      } else if (!isAllowedDomain(user.email)) {
        // Logged in but wrong domain — redirect to access denied
        setLocation("/acesso-negado");
      }
    }
  }, [loading, user, setLocation]);

  if (loading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or wrong domain — show nothing while redirecting
  if (!user || !isAllowedDomain(user.email)) {
    return null;
  }

  return <>{children}</>;
}
