import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, AlertCircle, Chrome } from "lucide-react";
import { useSalesperson } from "@/hooks/useSalesperson";
import { getLoginUrl } from "@/const";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, isLoading: isCheckingAuth, isAuthenticated } = useSalesperson();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      setLocation("/calculadora");
    }
  }, [isAuthenticated, isCheckingAuth, setLocation]);

  if (isAuthenticated && !isCheckingAuth) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    
    if (result.success) {
      setLocation("/calculadora");
    } else {
      setError(result.error || "Erro ao fazer login");
    }
    
    setIsSubmitting(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = getLoginUrl();
  };

  if (isCheckingAuth) {
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
            <nav className="flex items-center gap-6">
              <Link href="/kombos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Kombos
              </Link>
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Início
              </Link>
            </nav>
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
          <nav className="flex items-center gap-6">
            <Link href="/kombos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Kombos
            </Link>
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Início
            </Link>
          </nav>
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
              Faça login para acessar a calculadora de cotações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Login Button */}
            <Button 
              type="button"
              variant="outline"
              className="w-full h-12 text-base"
              onClick={handleGoogleLogin}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Entrar com Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  ou continue com email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@kenlo.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              Acesso restrito a vendedores Kenlo autorizados.
              <br />
              Use seu email @kenlo.com.br ou @i-value.com.br
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
