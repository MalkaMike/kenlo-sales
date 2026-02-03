import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  Building2, 
  Home, 
  Users, 
  Brain, 
  FileSignature, 
  CreditCard, 
  Shield, 
  Banknote,
  Download,
  Share2,
  TrendingUp,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  Headphones,
  UserCog
} from "lucide-react";

// Pricing data - prices ending in 7 as per requirements
const imobPlans = {
  prime: { name: "Prime", price: 247, users: 2, implantacao: 1497 },
  k: { name: "K", price: 497, users: 5, implantacao: 1497 },
  k2: { name: "K2", price: 1247, users: 12, implantacao: 2997 },
};

const locacaoPlans = {
  prime: { name: "Prime", price: 247, contracts: 100, implantacao: 1497 },
  k: { name: "K", price: 497, contracts: 250, implantacao: 1497 },
  k2: { name: "K2", price: 1247, contracts: 500, implantacao: 2997 },
};

const addonsData = {
  leads: { 
    name: "Leads", 
    price: 627, 
    perUnit: 2.50, 
    included: 150, 
    unit: "mensagem", 
    forImob: true, 
    forLoc: false,
    icon: Users,
    description: "Gestão automatizada de leads"
  },
  inteligencia: { 
    name: "Inteligência", 
    price: 377, 
    perUnit: 0, 
    included: 0, 
    unit: "", 
    forImob: true, 
    forLoc: true,
    icon: Brain,
    description: "BI de KPIs de performance"
  },
  assinatura: { 
    name: "Assinatura", 
    price: 47, 
    perUnit: 4.90, 
    included: 20, 
    unit: "assinatura", 
    forImob: true, 
    forLoc: true,
    icon: FileSignature,
    description: "Assinatura digital embutida"
  },
  pay: { 
    name: "Pay", 
    price: 0, 
    perUnit: 3.00, 
    included: 0, 
    unit: "boleto", 
    forImob: false, 
    forLoc: true,
    icon: CreditCard,
    description: "Boleto e Split digital"
  },
  seguros: { 
    name: "Seguros", 
    price: 0, 
    perUnit: 0, 
    revenue: 10, 
    unit: "contrato", 
    forImob: false, 
    forLoc: true,
    icon: Shield,
    description: "Ganhe R$10/contrato/mês"
  },
  cash: { 
    name: "Cash", 
    price: 0, 
    perUnit: 0, 
    included: 0, 
    unit: "", 
    forImob: false, 
    forLoc: true,
    icon: Banknote,
    description: "Financie proprietários até 24 meses"
  },
};

const paymentPlans = {
  mensal: { name: "Mensal", multiplier: 1.20, discount: 0 },
  semestral: { name: "Semestral", multiplier: 1.10, discount: 0.10 },
  anual: { name: "Anual", multiplier: 1.00, discount: 0.20 },
  bienal: { name: "Bienal", multiplier: 0.90, discount: 0.25 },
};

type ProductType = "imob" | "locacao" | "both";
type ImobPlan = "prime" | "k" | "k2";
type LocacaoPlan = "prime" | "k" | "k2";
type PaymentPlan = "mensal" | "semestral" | "anual" | "bienal";

export default function CalculadoraPage() {
  // Product selection
  const [productType, setProductType] = useState<ProductType>("both");
  const [imobPlan, setImobPlan] = useState<ImobPlan>("k");
  const [locacaoPlan, setLocacaoPlan] = useState<LocacaoPlan>("k");
  
  // Business info - IMOB
  const [numUsers, setNumUsers] = useState(5);
  const [monthlyClosings, setMonthlyClosings] = useState(3);
  const [monthlyLeads, setMonthlyLeads] = useState(100);
  const [wantsWhatsApp, setWantsWhatsApp] = useState(true);
  const [wantsSuporteVip, setWantsSuporteVip] = useState(false);
  const [wantsCsDedicado, setWantsCsDedicado] = useState(false);
  
  // Business info - Locação
  const [numContracts, setNumContracts] = useState(250);
  const [newContractsPerMonth, setNewContractsPerMonth] = useState(10);
  const [wantsSuporteVipLoc, setWantsSuporteVipLoc] = useState(false);
  const [wantsCsDedicadoLoc, setWantsCsDedicadoLoc] = useState(false);
  
  // Pay charges
  const [chargeBoletoInquilino, setChargeBoletoInquilino] = useState(5);
  const [chargeSplitProprietario, setChargeSplitProprietario] = useState(5);
  
  // Add-ons
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({
    leads: true,
    inteligencia: true,
    assinatura: true,
    pay: true,
    seguros: true,
    cash: false,
  });
  
  // Payment
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("anual");
  const [isKombo, setIsKombo] = useState(true);
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate Kombo discount - 25% for combos as per requirements
  const komboDiscount = useMemo(() => {
    if (!isKombo) return 0;
    const activeAddons = Object.values(selectedAddons).filter(Boolean).length;
    if (productType === "both" && activeAddons >= 1) return 0.25;
    if (activeAddons >= 3) return 0.20;
    if (activeAddons >= 2) return 0.15;
    if (activeAddons >= 1) return 0.10;
    return 0;
  }, [productType, selectedAddons, isKombo]);

  // Calculate prices
  const calculations = useMemo(() => {
    const hasImob = productType === "imob" || productType === "both";
    const hasLoc = productType === "locacao" || productType === "both";
    
    // Base products
    let productTotal = 0;
    let implantacaoTotal = 0;
    
    if (hasImob) {
      const plan = imobPlans[imobPlan];
      productTotal += plan.price;
      implantacaoTotal += plan.implantacao;
    }
    
    if (hasLoc) {
      const plan = locacaoPlans[locacaoPlan];
      productTotal += plan.price;
      implantacaoTotal += plan.implantacao;
    }
    
    // Add-ons
    let addonsTotal = 0;
    const addonDetails: { name: string; price: number }[] = [];
    
    Object.entries(selectedAddons).forEach(([key, isSelected]) => {
      if (!isSelected) return;
      const addon = addonsData[key as keyof typeof addonsData];
      
      // Check if addon is applicable
      const isApplicable = 
        (addon.forImob && hasImob) ||
        (addon.forLoc && hasLoc);
      
      if (isApplicable && addon.price > 0) {
        addonsTotal += addon.price;
        addonDetails.push({ name: addon.name, price: addon.price });
      }
    });
    
    // Extras (Suporte VIP, CS Dedicado)
    let extrasTotal = 0;
    if (hasImob) {
      if (wantsSuporteVip) extrasTotal += 197;
      if (wantsCsDedicado) extrasTotal += 497;
    }
    if (hasLoc) {
      if (wantsSuporteVipLoc) extrasTotal += 197;
      if (wantsCsDedicadoLoc) extrasTotal += 497;
    }
    
    // Subtotal before discounts
    const subtotal = productTotal + addonsTotal + extrasTotal;
    
    // Apply Kombo discount
    const komboDiscountAmount = subtotal * komboDiscount;
    const afterKombo = subtotal - komboDiscountAmount;
    
    // Apply payment plan
    const paymentMultiplier = paymentPlans[paymentPlan].multiplier;
    const monthlyTotal = afterKombo * paymentMultiplier;
    
    // Implantação - R$1497 for any combo as per requirements
    const implantacaoFinal = isKombo ? 1497 : implantacaoTotal;
    
    // Variable costs (pós-pago)
    let variableCosts = 0;
    
    // Extra users (R$47/user)
    if (hasImob) {
      const includedUsers = imobPlans[imobPlan].users;
      const extraUsers = Math.max(0, numUsers - includedUsers);
      variableCosts += extraUsers * 47;
    }
    
    // Extra contracts (R$3/contract)
    if (hasLoc) {
      const includedContracts = locacaoPlans[locacaoPlan].contracts;
      const extraContracts = Math.max(0, numContracts - includedContracts);
      variableCosts += extraContracts * 3;
    }
    
    // WhatsApp messages (Leads add-on)
    if (selectedAddons.leads && hasImob) {
      const extraMessages = Math.max(0, monthlyLeads - 150);
      variableCosts += extraMessages * 2.50;
    }
    
    // Pay costs (R$3/boleto + R$3/split)
    if (selectedAddons.pay && hasLoc) {
      variableCosts += numContracts * 3; // Boletos
      variableCosts += numContracts * 3; // Splits
    }
    
    // Revenue from Pay and Seguros
    let revenue = 0;
    if (selectedAddons.pay && hasLoc) {
      revenue += numContracts * chargeBoletoInquilino; // Cobrar do inquilino
      revenue += numContracts * chargeSplitProprietario; // Cobrar do proprietário
    }
    if (selectedAddons.seguros && hasLoc) {
      revenue += numContracts * 10; // R$10 por contrato
    }
    
    // Net result
    const totalInvestment = monthlyTotal + variableCosts;
    const netMonthly = revenue - totalInvestment;
    
    return {
      productTotal,
      addonsTotal,
      extrasTotal,
      addonDetails,
      subtotal,
      komboDiscountAmount,
      afterKombo,
      monthlyTotal,
      implantacaoTotal,
      implantacaoFinal,
      variableCosts,
      revenue,
      totalInvestment,
      netMonthly,
      annualTotal: (monthlyTotal * 12) + implantacaoFinal,
      hasImob,
      hasLoc,
    };
  }, [productType, imobPlan, locacaoPlan, selectedAddons, paymentPlan, isKombo, komboDiscount, 
      numUsers, numContracts, monthlyLeads, wantsSuporteVip, wantsCsDedicado, 
      wantsSuporteVipLoc, wantsCsDedicadoLoc, chargeBoletoInquilino, chargeSplitProprietario]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const toggleAddon = (key: string) => {
    setSelectedAddons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="py-6 border-b border-border/40 bg-card/30">
        <div className="container">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Calculadora Inteligente</h1>
              <p className="text-sm text-muted-foreground">
                Configure a solução ideal e veja o investimento em tempo real
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-6 flex-1">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Product Selection */}
            <Card className="kenlo-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                  Escolha o Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setProductType("imob")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      productType === "imob" 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Building2 className={`w-8 h-8 mx-auto mb-2 ${productType === "imob" ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-semibold text-sm">Imob só</p>
                    <p className="text-xs text-muted-foreground mt-1">CRM + Site</p>
                  </button>
                  <button
                    onClick={() => setProductType("locacao")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      productType === "locacao" 
                        ? "border-secondary bg-secondary/10" 
                        : "border-border hover:border-secondary/50"
                    }`}
                  >
                    <Home className={`w-8 h-8 mx-auto mb-2 ${productType === "locacao" ? "text-secondary" : "text-muted-foreground"}`} />
                    <p className="font-semibold text-sm">Loc só</p>
                    <p className="text-xs text-muted-foreground mt-1">Gestão de locações</p>
                  </button>
                  <button
                    onClick={() => setProductType("both")}
                    className={`p-4 rounded-xl border-2 transition-all relative ${
                      productType === "both" 
                        ? "border-kenlo-yellow bg-kenlo-yellow/10" 
                        : "border-border hover:border-kenlo-yellow/50"
                    }`}
                  >
                    {productType === "both" && (
                      <Badge className="absolute -top-2 -right-2 bg-kenlo-yellow text-black text-[10px]">
                        -25%
                      </Badge>
                    )}
                    <div className="flex justify-center gap-1 mb-2">
                      <Building2 className={`w-6 h-6 ${productType === "both" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`${productType === "both" ? "text-kenlo-yellow" : "text-muted-foreground"}`}>+</span>
                      <Home className={`w-6 h-6 ${productType === "both" ? "text-secondary" : "text-muted-foreground"}`} />
                    </div>
                    <p className="font-semibold text-sm">Imob + Loc</p>
                    <p className="text-xs text-muted-foreground mt-1">Solução completa</p>
                  </button>
                </div>
                
                {/* Plan Selection */}
                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  {(productType === "imob" || productType === "both") && (
                    <div>
                      <Label className="mb-3 block text-sm font-medium">Plano Imob</Label>
                      <div className="flex gap-2">
                        {(["prime", "k", "k2"] as ImobPlan[]).map((plan) => (
                          <button
                            key={plan}
                            onClick={() => setImobPlan(plan)}
                            className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              imobPlan === plan
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div>{imobPlans[plan].name}</div>
                            <div className="text-[10px] opacity-80">{imobPlans[plan].users} usuários</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(productType === "locacao" || productType === "both") && (
                    <div>
                      <Label className="mb-3 block text-sm font-medium">Plano Locação</Label>
                      <div className="flex gap-2">
                        {(["prime", "k", "k2"] as LocacaoPlan[]).map((plan) => (
                          <button
                            key={plan}
                            onClick={() => setLocacaoPlan(plan)}
                            className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              locacaoPlan === plan
                                ? "border-secondary bg-secondary text-secondary-foreground"
                                : "border-border hover:border-secondary/50"
                            }`}
                          >
                            <div>{locacaoPlans[plan].name}</div>
                            <div className="text-[10px] opacity-80">{locacaoPlans[plan].contracts} contratos</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Add-ons */}
            <Card className="kenlo-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                  Add-ons Opcionais
                </CardTitle>
                <CardDescription className="text-sm">
                  Selecione os add-ons para potencializar sua operação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(addonsData).map(([key, addon]) => {
                    const isApplicable = 
                      (addon.forImob && (productType === "imob" || productType === "both")) ||
                      (addon.forLoc && (productType === "locacao" || productType === "both"));
                    
                    if (!isApplicable) return null;
                    
                    const Icon = addon.icon;
                    
                    return (
                      <div
                        key={key}
                        onClick={() => toggleAddon(key)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedAddons[key]
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 rounded-lg ${selectedAddons[key] ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <Switch checked={selectedAddons[key]} />
                        </div>
                        <p className="font-semibold text-sm">{addon.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{addon.description}</p>
                        <p className="text-xs font-medium mt-2 text-primary">
                          {addon.price > 0 ? `R$ ${addon.price}/mês` : "Sem mensalidade"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Business Info */}
            <Card className="kenlo-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                  Informações do Negócio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* IMOB Info */}
                {(productType === "imob" || productType === "both") && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Building2 className="w-4 h-4" />
                      Kenlo IMOB
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-sm">Número de usuários</Label>
                        <span className="text-sm font-medium">{numUsers}</span>
                      </div>
                      <Slider
                        value={[numUsers]}
                        onValueChange={([v]) => setNumUsers(v)}
                        min={1}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Incluídos no plano: {imobPlans[imobPlan].users} | Adicional: R$ 47/usuário
                      </p>
                    </div>
                    
                    {selectedAddons.leads && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm">Leads recebidos/mês</Label>
                          <span className="text-sm font-medium">{monthlyLeads}</span>
                        </div>
                        <Slider
                          value={[monthlyLeads]}
                          onValueChange={([v]) => setMonthlyLeads(v)}
                          min={50}
                          max={1000}
                          step={50}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Incluídas: 150 mensagens | Adicional: R$ 2,50/mensagem
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Locação Info */}
                {(productType === "locacao" || productType === "both") && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                      <Home className="w-4 h-4" />
                      Kenlo Locação
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-sm">Contratos sob gestão</Label>
                        <span className="text-sm font-medium">{numContracts}</span>
                      </div>
                      <Slider
                        value={[numContracts]}
                        onValueChange={([v]) => setNumContracts(v)}
                        min={50}
                        max={2000}
                        step={50}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Incluídos no plano: {locacaoPlans[locacaoPlan].contracts} | Adicional: R$ 3/contrato
                      </p>
                    </div>
                    
                    {selectedAddons.pay && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <Label className="text-xs text-muted-foreground">Cobra do inquilino (R$)</Label>
                          <Input
                            type="number"
                            value={chargeBoletoInquilino}
                            onChange={(e) => setChargeBoletoInquilino(Number(e.target.value))}
                            className="mt-1 h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Cobra do proprietário (R$)</Label>
                          <Input
                            type="number"
                            value={chargeSplitProprietario}
                            onChange={(e) => setChargeSplitProprietario(Number(e.target.value))}
                            className="mt-1 h-9"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Advanced Options */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Opções avançadas
                </button>
                
                {showAdvanced && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    {(productType === "imob" || productType === "both") && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">IMOB Extras</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Headphones className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Suporte VIP</span>
                            <span className="text-xs text-muted-foreground">+R$ 197/mês</span>
                          </div>
                          <Switch checked={wantsSuporteVip} onCheckedChange={setWantsSuporteVip} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCog className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">CS Dedicado</span>
                            <span className="text-xs text-muted-foreground">+R$ 497/mês</span>
                          </div>
                          <Switch checked={wantsCsDedicado} onCheckedChange={setWantsCsDedicado} />
                        </div>
                      </div>
                    )}
                    
                    {(productType === "locacao" || productType === "both") && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Locação Extras</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Headphones className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">Suporte VIP</span>
                            <span className="text-xs text-muted-foreground">+R$ 197/mês</span>
                          </div>
                          <Switch checked={wantsSuporteVipLoc} onCheckedChange={setWantsSuporteVipLoc} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCog className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">CS Dedicado</span>
                            <span className="text-xs text-muted-foreground">+R$ 497/mês</span>
                          </div>
                          <Switch checked={wantsCsDedicadoLoc} onCheckedChange={setWantsCsDedicadoLoc} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 4: Payment Plan */}
            <Card className="kenlo-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</span>
                  Plano de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6 p-4 bg-kenlo-yellow/10 rounded-xl border border-kenlo-yellow/30">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-kenlo-yellow" />
                    <div>
                      <p className="font-semibold text-sm">Ativar Kombo</p>
                      <p className="text-xs text-muted-foreground">Desconto em produtos + add-ons + implantação</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isKombo && komboDiscount > 0 && (
                      <Badge className="bg-kenlo-yellow text-black">
                        -{Math.round(komboDiscount * 100)}%
                      </Badge>
                    )}
                    <Switch checked={isKombo} onCheckedChange={setIsKombo} />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(paymentPlans) as [PaymentPlan, typeof paymentPlans[PaymentPlan]][]).map(([key, plan]) => (
                    <button
                      key={key}
                      onClick={() => setPaymentPlan(key)}
                      className={`py-3 px-2 rounded-lg border-2 text-center transition-all ${
                        paymentPlan === key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-semibold text-sm">{plan.name}</p>
                      {plan.discount > 0 && (
                        <p className="text-[10px] opacity-80">-{Math.round(plan.discount * 100)}%</p>
                      )}
                      {plan.multiplier > 1 && (
                        <p className="text-[10px] opacity-80">+{Math.round((plan.multiplier - 1) * 100)}%</p>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            <Card className="kenlo-card sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resumo do Investimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Products */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Produtos</p>
                  {calculations.hasImob && (
                    <div className="flex justify-between text-sm">
                      <span>Imob {imobPlans[imobPlan].name}</span>
                      <span>{formatCurrency(imobPlans[imobPlan].price)}</span>
                    </div>
                  )}
                  {calculations.hasLoc && (
                    <div className="flex justify-between text-sm">
                      <span>Locação {locacaoPlans[locacaoPlan].name}</span>
                      <span>{formatCurrency(locacaoPlans[locacaoPlan].price)}</span>
                    </div>
                  )}
                </div>

                {/* Add-ons */}
                {calculations.addonDetails.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add-ons</p>
                    {calculations.addonDetails.map((addon) => (
                      <div key={addon.name} className="flex justify-between text-sm">
                        <span>{addon.name}</span>
                        <span>{formatCurrency(addon.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Extras */}
                {calculations.extrasTotal > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Extras</p>
                    <div className="flex justify-between text-sm">
                      <span>Serviços adicionais</span>
                      <span>{formatCurrency(calculations.extrasTotal)}</span>
                    </div>
                  </div>
                )}

                {/* Discounts */}
                {isKombo && komboDiscount > 0 && (
                  <div className="space-y-2 pt-3 border-t border-border">
                    <div className="flex justify-between text-sm text-secondary">
                      <span>Desconto Kombo ({Math.round(komboDiscount * 100)}%)</span>
                      <span>-{formatCurrency(calculations.komboDiscountAmount)}</span>
                    </div>
                  </div>
                )}

                {/* Monthly Total */}
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">Mensalidade</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(calculations.monthlyTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Implantação: {formatCurrency(calculations.implantacaoFinal)}
                    {isKombo && calculations.implantacaoTotal > 1497 && (
                      <span className="text-secondary ml-1">(economia de {formatCurrency(calculations.implantacaoTotal - 1497)})</span>
                    )}
                  </p>
                </div>

                {/* Variable Costs */}
                {calculations.variableCosts > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Custos Variáveis (pós-pago)
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Estimativa mensal</span>
                      <span>{formatCurrency(calculations.variableCosts)}</span>
                    </div>
                  </div>
                )}

                {/* Revenue */}
                {calculations.revenue > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Receitas Geradas
                    </p>
                    <div className="flex justify-between text-sm text-secondary">
                      <span>Receita mensal</span>
                      <span>+{formatCurrency(calculations.revenue)}</span>
                    </div>
                  </div>
                )}

                {/* Net Result - The Kenlo Effect */}
                {(calculations.revenue > 0 || calculations.variableCosts > 0) && (
                  <div className="pt-4 border-t-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 -mx-6 px-6 py-4 -mb-6 rounded-b-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wider">The Kenlo Effect</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold">Resultado Líquido</span>
                      <span className={`text-xl font-bold ${calculations.netMonthly >= 0 ? "text-secondary" : "text-destructive"}`}>
                        {calculations.netMonthly >= 0 ? "+" : ""}{formatCurrency(calculations.netMonthly)}/mês
                      </span>
                    </div>
                    {calculations.netMonthly > 0 && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        "Kenlo, a única plataforma que te paga enquanto você usa."
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2 h-10">
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button variant="outline" className="flex-1 gap-2 h-10">
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>

            {/* Comparison Table */}
            <Card className="kenlo-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Comparativo</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2"></th>
                      <th className="text-right py-2">Sem Kombo</th>
                      <th className="text-right py-2 text-primary">Com Kombo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-2">Mensal</td>
                      <td className="text-right py-2">{formatCurrency(calculations.subtotal * paymentPlans[paymentPlan].multiplier)}</td>
                      <td className="text-right py-2 text-primary font-medium">{formatCurrency(calculations.monthlyTotal)}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2">Implantação</td>
                      <td className="text-right py-2">{formatCurrency(calculations.implantacaoTotal)}</td>
                      <td className="text-right py-2 text-primary font-medium">{formatCurrency(calculations.implantacaoFinal)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold">Economia/ano</td>
                      <td className="text-right py-2">-</td>
                      <td className="text-right py-2 text-secondary font-bold">
                        {formatCurrency((calculations.subtotal * paymentPlans[paymentPlan].multiplier - calculations.monthlyTotal) * 12 + (calculations.implantacaoTotal - calculations.implantacaoFinal))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
