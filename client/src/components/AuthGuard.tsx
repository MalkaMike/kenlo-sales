import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

/** Allowed email domains for access */
const ALLOWED_DOMAINS = ["kenlo.com.br", "i-value.com.br", "laik.com.br"];

/** Routes that require admin role */
const ADMIN_ROUTES = ["/admin/pricing", "/admin/users", "/performance"];

function isAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false;
  const domain = email.toLowerCase().split("@")[1];
  return ALLOWED_DOMAINS.includes(domain);
}

function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some((route) => path === route || path.startsWith(route + "/"));
}

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard wraps the entire app (except /login and /acesso-negado).
 * It requires the user to be logged in via Google OAuth with an allowed domain.
 * Admin routes (/admin/pricing, /performance) require role === "admin".
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setHasChecked(true);
      if (!user) {
        setLocation("/login");
      } else if (!isAllowedDomain(user.email)) {
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

  // Admin route check — block non-admin users with a friendly message
  if (isAdminRoute(location) && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">
            Esta página é exclusiva para administradores. Entre em contato com seu gestor
            para solicitar acesso.
          </p>
          <Button onClick={() => setLocation("/")} variant="default">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
