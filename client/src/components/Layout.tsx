import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, FileText, Package, Layers, User, Users, LogOut, Settings, BookOpen, BarChart3, ShieldCheck, Play, Calculator } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";

const products = [
  {
    title: "Kenlo Imob + Site",
    href: "/produtos/imob",
    description: "CRM + Site otimizado para vendas de imóveis",
    badge: "VENDAS",
  },
  {
    title: "Kenlo Locação",
    href: "/produtos/locacao",
    description: "ERP para gestão de locações",
    badge: "LOCAÇÃO",
  },
];

const addons = [
  { title: "Leads", href: "/addons/leads", description: "Captação inteligente de leads" },
  { title: "Inteligência", href: "/addons/inteligencia", description: "BI Google Looker Pro — usuários ilimitados" },
  { title: "Assinatura", href: "/addons/assinatura", description: "Contratos sem papel, sem cartório" },
  { title: "Pay", href: "/addons/pay", description: "Boleto + Split automático" },
  { title: "Seguros", href: "/addons/seguros", description: "Receita recorrente no boleto" },
  { title: "Cash", href: "/addons/cash", description: "Antecipe até 24 meses de aluguel" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img 
              src="/kenlo-logo-final.svg" 
              alt="Kenlo" 
              className="h-7 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex items-center">
            <NavigationMenuList>
              {/* Products */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">
                  <Package className="w-4 h-4 mr-2" />
                  Produtos
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    {products.map((product) => (
                      <li key={product.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={product.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              location === product.href && "bg-accent"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium leading-none">{product.title}</span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                {product.badge}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {product.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Add-ons */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">
                  <Layers className="w-4 h-4 mr-2" />
                  Add-ons
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[600px] md:grid-cols-3">
                    {addons.map((addon) => (
                      <li key={addon.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={addon.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              location === addon.href && "bg-accent"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{addon.title}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
                              {addon.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Conteúdo */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/conteudo"
                    className={cn(
                      "nav-link-hover group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/50 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      location === "/conteudo" && "bg-accent text-primary"
                    )}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Conteúdo
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Cotação */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/calculadora"
                    className={cn(
                      "nav-link-hover group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/50 focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      location === "/calculadora" && "bg-accent text-primary"
                    )}
                  >
                    <Calculator className="w-4 h-4 mr-1" />
                    Cotação
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>

          {/* User Profile / Login Button */}
          <UserProfileButton />

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Produtos</h3>
                  {products.map((product) => (
                    <Link
                      key={product.href}
                      href={product.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-link-hover block py-2 px-3 rounded-md"
                    >
                      <span className="font-medium">{product.title}</span>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </Link>
                  ))}
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Add-ons</h3>
                  {addons.map((addon) => (
                    <Link
                      key={addon.href}
                      href={addon.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="mobile-link-hover block py-2 px-3 rounded-md"
                    >
                      <span className="font-medium">{addon.title}</span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/conteudo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-link-hover block py-2 px-3 rounded-md font-medium"
                >
                  Conteúdo
                </Link>
                <Link
                  href="/calculadora"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-link-hover block py-2 px-3 rounded-md font-medium"
                >
                  Cotação
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center">
                <img 
                  src="/kenlo-logo-final.svg" 
                  alt="Kenlo" 
                  className="h-6 w-auto"
                />
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                O sistema operacional de IA para o mercado imobiliário brasileiro.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produtos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/produtos/imob" className="footer-link-hover inline-block">Kenlo Imob + Site</Link></li>
                <li><Link href="/produtos/locacao" className="footer-link-hover inline-block">Kenlo Locação</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Add-ons</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {addons.slice(0, 4).map((addon) => (
                  <li key={addon.href}>
                    <Link href={addon.href} className="footer-link-hover inline-block">{addon.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ferramentas</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/calculadora" className="footer-link-hover inline-block">Cotação</Link></li>
                <li><Link href="/playbook" className="footer-link-hover inline-block">Playbook de Vendas</Link></li>
                <li><Link href="/conteudo" className="footer-link-hover inline-block">Conteúdo</Link></li>
                {isAdmin && (
                  <li><Link href="/performance" className="footer-link-hover inline-block">Performance</Link></li>
                )}
                {isAdmin && (
                  <li><Link href="/admin/pricing" className="footer-link-hover inline-block flex items-center gap-1"><Settings className="w-3 h-3" />Configurar Preços</Link></li>
                )}
                {isAdmin && (
                  <li><Link href="/admin/users" className="footer-link-hover inline-block flex items-center gap-1"><Users className="w-3 h-3" />Gestão de Usuários</Link></li>
                )}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            © 2026 Kenlo. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

// User Profile Button Component
function UserProfileButton() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        variant="outline"
        size="sm"
        asChild
        className="hidden lg:flex"
      >
        <a href={getLoginUrl()}>Login</a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden lg:flex gap-2">
          <User className="w-4 h-4" />
          {user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/perfil" className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            Meu Perfil
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin
            </DropdownMenuLabel>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/performance" className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/pricing" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Configurar Preços
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/users" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Gestão de Usuários
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
