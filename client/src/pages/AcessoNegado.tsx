import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

/** Allowed email domains for access */
const ALLOWED_DOMAINS = ["kenlo.com.br", "i-value.com.br", "laik.com.br"];

export default function AcessoNegado() {
  const handleTryAgain = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
          <CardDescription className="text-base mt-2">
            Este portal é exclusivo para colaboradores Kenlo, I-Value e Laik.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Mail className="w-4 h-4" />
              <span className="font-medium">Domínios permitidos:</span>
            </div>
            {ALLOWED_DOMAINS.map((domain) => (
              <p key={domain}>@{domain}</p>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Se você é colaborador e está tendo problemas de acesso, 
            verifique se está usando sua conta Google corporativa.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={handleTryAgain}
            >
              Tentar com outra conta
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao início
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
