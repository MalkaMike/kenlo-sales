import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX, ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";

export default function AcessoNegado() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
          <CardDescription className="text-base mt-2">
            Este portal é exclusivo para colaboradores Kenlo e I-Value.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 justify-center mb-2">
              <Mail className="w-4 h-4" />
              <span className="font-medium">Domínios permitidos:</span>
            </div>
            <p>@kenlo.com.br</p>
            <p>@i-value.com.br</p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Se você é colaborador e está tendo problemas de acesso, entre em contato com o suporte.
          </p>
          
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
