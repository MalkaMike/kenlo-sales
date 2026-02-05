import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSalesperson } from "@/hooks/useSalesperson";
import { useAuth } from "@/_core/hooks/useAuth";
import { LogOut } from "lucide-react";

export interface QuoteInfo {
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorRole: string;
  salespersonId?: number;
  agencyName: string;
  ownerName: string;
  cellPhone: string;
  landlinePhone: string;
  websiteUrl: string;
  hasWebsite: boolean;
  installments: number; // Número de parcelas (1 = à vista)
}

interface QuoteInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (info: QuoteInfo) => void;
  actionType?: "pdf";
  paymentFrequency?: "monthly" | "semestral" | "annual" | "biennial";
}

export function QuoteInfoDialog({ open, onOpenChange, onSubmit, paymentFrequency = "annual" }: QuoteInfoDialogProps) {
  const { salesperson } = useSalesperson();
  const { user: oauthUser, logout } = useAuth();
  
  const [agencyName, setAgencyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [cellPhone, setCellPhone] = useState("");
  const [landlinePhone, setLandlinePhone] = useState("");
  const [hasWebsite, setHasWebsite] = useState<"yes" | "no">("yes");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [installments, setInstallments] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determine the current user info (salesperson takes priority over OAuth user)
  const currentUser = salesperson 
    ? {
        name: salesperson.name,
        email: salesperson.email,
        phone: salesperson.phone,
        role: "Executivo(a) de Vendas",
        id: salesperson.id,
        source: "salesperson" as const,
      }
    : oauthUser
    ? {
        name: oauthUser.name || oauthUser.email?.split("@")[0] || "Usuário Kenlo",
        email: oauthUser.email || "",
        phone: "",
        role: "Colaborador Kenlo",
        id: undefined,
        source: "oauth" as const,
      }
    : null;

  // Get installment options based on payment frequency
  const getInstallmentOptions = () => {
    if (paymentFrequency === "annual") {
      return [
        { value: 1, label: "À vista" },
        { value: 2, label: "2x" },
        { value: 3, label: "3x" },
      ];
    } else if (paymentFrequency === "biennial") {
      return [
        { value: 1, label: "À vista" },
        { value: 2, label: "2x" },
        { value: 3, label: "3x" },
        { value: 4, label: "4x" },
        { value: 5, label: "5x" },
        { value: 6, label: "6x" },
      ];
    }
    // Monthly and Semestral don't have installment options
    return [];
  };

  const installmentOptions = getInstallmentOptions();
  const showInstallmentOptions = installmentOptions.length > 0;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setErrors({});
      setInstallments(1); // Reset to "À vista" when dialog opens
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!agencyName.trim()) {
      newErrors.agencyName = "Nome da imobiliária é obrigatório";
    }

    if (!ownerName.trim()) {
      newErrors.ownerName = "Nome do proprietário é obrigatório";
    }

    if (!cellPhone.trim() && !landlinePhone.trim()) {
      newErrors.phone = "Pelo menos um telefone (celular ou fixo) é obrigatório";
    }

    if (hasWebsite === "yes" && !websiteUrl.trim()) {
      newErrors.websiteUrl = "URL do site é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Use logged-in user data (salesperson or OAuth user)
    onSubmit({
      vendorName: currentUser?.name || "",
      vendorEmail: currentUser?.email || "",
      vendorPhone: currentUser?.phone || "",
      vendorRole: currentUser?.role || "Colaborador Kenlo",
      salespersonId: currentUser?.source === "salesperson" ? currentUser.id : undefined,
      agencyName: agencyName.trim(),
      ownerName: ownerName.trim(),
      cellPhone: cellPhone.trim(),
      landlinePhone: landlinePhone.trim(),
      websiteUrl: hasWebsite === "yes" ? websiteUrl.trim() : "Cliente não tem site ainda",
      hasWebsite: hasWebsite === "yes",
      installments: installments,
    });

    // Reset form
    setAgencyName("");
    setOwnerName("");
    setCellPhone("");
    setLandlinePhone("");
    setWebsiteUrl("");
    setHasWebsite("yes");
    setInstallments(1);
    setErrors({});
  };

  const handleLogout = async () => {
    try {
      await logout();
      onOpenChange(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Informações do Cliente
          </DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo antes de exportar a cotação.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Simplified User Identification */}
          {currentUser && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <span>Você está logado como </span>
              <span className="font-semibold">{currentUser.name}</span>
              <span>. </span>
              <button 
                onClick={handleLogout}
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Não é você? Clique aqui para deslogar
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Agency Name */}
          <div className="space-y-2">
            <Label htmlFor="agencyName">
              Nome da Imobiliária <span className="text-red-500">*</span>
            </Label>
            <Input
              id="agencyName"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Digite o nome da imobiliária"
              className={errors.agencyName ? "border-red-500" : ""}
            />
            {errors.agencyName && (
              <p className="text-sm text-red-500">{errors.agencyName}</p>
            )}
          </div>

          {/* Owner Name */}
          <div className="space-y-2">
            <Label htmlFor="ownerName">
              Nome do Proprietário <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ownerName"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Digite o nome do proprietário"
              className={errors.ownerName ? "border-red-500" : ""}
            />
            {errors.ownerName && (
              <p className="text-sm text-red-500">{errors.ownerName}</p>
            )}
          </div>

          {/* Cell Phone */}
          <div className="space-y-2">
            <Label htmlFor="cellPhone">
              Celular
            </Label>
            <Input
              id="cellPhone"
              value={cellPhone}
              onChange={(e) => setCellPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className={errors.phone ? "border-red-500" : ""}
            />
          </div>

          {/* Landline Phone */}
          <div className="space-y-2">
            <Label htmlFor="landlinePhone">
              Telefone Fixo
            </Label>
            <Input
              id="landlinePhone"
              value={landlinePhone}
              onChange={(e) => setLandlinePhone(e.target.value)}
              placeholder="(00) 0000-0000"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
            <p className="text-xs text-muted-foreground">
              * Pelo menos um telefone é obrigatório
            </p>
          </div>

          {/* Website - Checkbox first, then URL field */}
          <div className="space-y-2">
            <Label>
              Site Atual <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={hasWebsite} onValueChange={(v) => setHasWebsite(v as "yes" | "no")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="has-website-yes" />
                <Label htmlFor="has-website-yes" className="font-normal cursor-pointer">
                  Cliente tem site
                </Label>
              </div>
              {/* URL field appears immediately after "Cliente tem site" checkbox */}
              {hasWebsite === "yes" && (
                <div className="ml-6 mt-2">
                  <Input
                    id="websiteUrl"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://exemplo.com.br"
                    className={errors.websiteUrl ? "border-red-500" : ""}
                  />
                  {errors.websiteUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.websiteUrl}</p>
                  )}
                </div>
              )}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="has-website-no" />
                <Label htmlFor="has-website-no" className="font-normal cursor-pointer">
                  Cliente não tem site ainda
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Installment Options - Only for Annual and Biennial */}
          {showInstallmentOptions && (
            <div className="space-y-3 pt-2 border-t">
              <Label className="text-base font-medium">
                Quer parcelar em quantas vezes?
              </Label>
              <div className="flex flex-wrap gap-2">
                {installmentOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={installments === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInstallments(option.value)}
                    className={installments === option.value ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Exportar Cotação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
