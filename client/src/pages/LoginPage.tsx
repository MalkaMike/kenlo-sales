import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

/** Allowed email domains for access */
const ALLOWED_DOMAINS = ["kenlo.com.br", "i-value.com.br", "laik.com.br"];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user: oauthUser, loading: isCheckingOAuth } = useAuth();

  const isAuthenticated = !!oauthUser;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isCheckingOAuth) {
      setLocation("/");
    }
  }, [isAuthenticated, isCheckingOAuth, setLocation]);

  if (isAuthenticated && !isCheckingOAuth) {
    return null;
  }

  const handleGoogleLogin = () => {
    window.location.href = getLoginUrl();
  };

  if (isCheckingOAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <img 
                src="/kenlo-logo-final.svg" 
                alt="Kenlo" 
                className="h-7 w-auto"
              />
            </Link>
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <img 
              src="/kenlo-logo-final.svg" 
              alt="Kenlo" 
              className="h-7 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img 
                src="/kenlo-logo-final.svg" 
                alt="Kenlo" 
                className="h-10 mx-auto"
              />
            </div>
            <CardTitle className="text-2xl">Portal de Vendas</CardTitle>
            <CardDescription>
              Faça login com sua conta Google corporativa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Login Button */}
            <Button 
              type="button"
              className="w-full h-12 text-base bg-primary hover:bg-primary/90 gap-2"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#fff"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
              </svg>
              Entrar com Google
            </Button>

            {/* Domain restriction info */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Mail className="w-4 h-4" />
                <span className="font-medium">Domínios permitidos:</span>
              </div>
              {ALLOWED_DOMAINS.map((domain) => (
                <p key={domain} className="text-center">@{domain}</p>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Acesso restrito a colaboradores Kenlo, I-Value e Laik.
              <br />
              Use sua conta Google corporativa para entrar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
