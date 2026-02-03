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
import { Menu, Calculator, Package, Layers } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { cn } from "@/lib/utils";

const products = [
  {
    title: "Kenlo Imob",
    href: "/produtos/imob",
    description: "CRM + Site para vendas de imóveis",
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
  { title: "Leads", href: "/addons/leads", description: "Gestão automatizada de leads" },
  { title: "Inteligência", href: "/addons/inteligencia", description: "BI de KPIs de performance" },
  { title: "Assinatura", href: "/addons/assinatura", description: "Assinatura digital integrada" },
  { title: "Pay", href: "/addons/pay", description: "Boleto e Split digital" },
  { title: "Seguros", href: "/addons/seguros", description: "Seguros embutido no boleto" },
  { title: "Cash", href: "/addons/cash", description: "Antecipação de recebíveis" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-2xl font-bold text-primary">kenlo</span>
            <span className="text-2xl font-bold text-secondary">.</span>

          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
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

              {/* Kombos */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/kombos"
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      location === "/kombos" && "bg-accent"
                    )}
                  >
                    Kombos
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Calculator */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/calculadora"
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      location === "/calculadora" && "bg-accent"
                    )}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Monte seu plano
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Spacer for alignment */}
          <div className="hidden lg:flex" />

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
                      className="block py-2 px-3 rounded-md hover:bg-accent"
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
                      className="block py-2 px-3 rounded-md hover:bg-accent"
                    >
                      <span className="font-medium">{addon.title}</span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/kombos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-md hover:bg-accent font-medium"
                >
                  Kombos
                </Link>
                <Link
                  href="/calculadora"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-md hover:bg-accent font-medium"
                >
                  Monte seu plano
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
              <Link href="/" className="flex items-center gap-1">
                <span className="text-xl font-bold text-primary">kenlo</span>
                <span className="text-xl font-bold text-secondary">.</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                O sistema operacional de IA para o mercado imobiliário brasileiro.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produtos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/produtos/imob" className="hover:text-foreground transition-colors">Kenlo Imob</Link></li>
                <li><Link href="/produtos/locacao" className="hover:text-foreground transition-colors">Kenlo Locação</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Add-ons</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {addons.slice(0, 4).map((addon) => (
                  <li key={addon.href}>
                    <Link href={addon.href} className="hover:text-foreground transition-colors">{addon.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ferramentas</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/kombos" className="hover:text-foreground transition-colors">Kombos</Link></li>
                <li><Link href="/calculadora" className="hover:text-foreground transition-colors">Monte seu plano</Link></li>
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
