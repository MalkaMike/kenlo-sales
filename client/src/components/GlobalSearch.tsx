import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Search data - products, add-ons, and content
const searchData = [
  // Products
  { title: "Kenlo Imob", description: "CRM completo para vendas de imóveis", href: "/produtos/imob", category: "Produtos" },
  { title: "Kenlo Locação", description: "ERP para gestão de contratos de locação", href: "/produtos/locacao", category: "Produtos" },
  { title: "Site/CMS", description: "Site personalizado com CMS integrado", href: "/produtos/site", category: "Produtos" },
  
  // Add-ons
  { title: "Kenlo Leads", description: "Gestão automatizada de leads", href: "/addons/leads", category: "Add-ons" },
  { title: "Kenlo Inteligência", description: "BI de KPIs e analytics avançado", href: "/addons/inteligencia", category: "Add-ons" },
  { title: "Kenlo Assinatura", description: "Assinatura digital embutida", href: "/addons/assinatura", category: "Add-ons" },
  { title: "Kenlo Pay", description: "Boleto e Split digital", href: "/addons/pay", category: "Add-ons" },
  { title: "Kenlo Seguros", description: "Seguros embutido no boleto", href: "/addons/seguros", category: "Add-ons" },
  { title: "Kenlo Cash", description: "Antecipação de aluguel", href: "/addons/cash", category: "Add-ons" },
  
  // Content
  { title: "Conteúdo", description: "Vídeos e materiais de capacitação", href: "/conteudo", category: "Conteúdo" },
  
  // Tools
  { title: "Cotação", description: "Simulador de propostas", href: "/calculadora", category: "Ferramentas" },
  { title: "Performance", description: "Métricas de uso do portal", href: "/performance", category: "Ferramentas" },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(searchData);

  // Handle Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        setOpen(true);
      }
      
      // Close on Escape
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults(searchData);
      return;
    }

    const filtered = searchData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
    
    setResults(filtered);
  }, [query]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  // Group results by category
  const groupedResults = results.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof searchData>);

  return (
    <>
      {/* Search Icon Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="hidden lg:flex"
        title="Buscar (Ctrl+S)"
      >
        <Search className="w-5 h-5" />
      </Button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[600px] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="sr-only">Busca Global</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar produtos, add-ons, conteúdo... (Ctrl+S)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base"
                autoFocus
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setQuery("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Search Results */}
          <div className="overflow-y-auto max-h-[480px] p-4">
            {results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Nenhum resultado encontrado para "{query}"</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleClose}
                        >
                          <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{item.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Pressione <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">Ctrl+S</kbd> para abrir a busca
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
