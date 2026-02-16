import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSalesperson } from "@/hooks/useSalesperson";
import { useAuth } from "@/_core/hooks/useAuth";
import { LogOut } from "lucide-react";

export interface QuoteInfo {
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorRole: string;
  salespersonId?: number;
  installments: number; // Número de parcelas (1 = à vista)
  validityDays: number; // Validade da proposta em dias (1-7)
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
  
  const [installments, setInstallments] = useState<number>(1);
  const [validityDays, setValidityDays] = useState<number>(3);

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
    if (paymentFrequency === "semestral") {
      return [
        { value: 1, label: "À vista" },
        { value: 2, label: "2x" },
      ];
    } else if (paymentFrequency === "annual") {
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
    // Monthly doesn't have installment options
    return [];
  };

  const installmentOptions = getInstallmentOptions();
  const showInstallmentOptions = installmentOptions.length > 0;

  // Validity options (1-7 days)
  const validityOptions = [
    { value: 1, label: "1 dia" },
    { value: 2, label: "2 dias" },
    { value: 3, label: "3 dias" },
    { value: 4, label: "4 dias" },
    { value: 5, label: "5 dias" },
    { value: 6, label: "6 dias" },
    { value: 7, label: "7 dias" },
  ];

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setInstallments(1);
      setValidityDays(3); // Default: 3 days
    }
  }, [open]);

  const handleSubmit = () => {
    onSubmit({
      vendorName: currentUser?.name || "",
      vendorEmail: currentUser?.email || "",
      vendorPhone: currentUser?.phone || "",
      vendorRole: currentUser?.role || "Colaborador Kenlo",
      salespersonId: currentUser?.source === "salesperson" ? currentUser.id : undefined,
      installments: installments,
      validityDays: validityDays,
    });

    // Reset form
    setInstallments(1);
    setValidityDays(3);
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
            Exportar Cotação
          </DialogTitle>
          <DialogDescription>
            Confirme as informações abaixo antes de exportar a cotação.
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

          {/* Installment Selection */}
          {showInstallmentOptions && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Forma de Pagamento
              </Label>
              <RadioGroup
                value={installments.toString()}
                onValueChange={(value) => setInstallments(parseInt(value))}
                className="grid grid-cols-3 gap-3"
              >
                {installmentOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`installment-${option.value}`}
                    className={`relative flex items-center justify-center rounded-lg border-2 p-3 cursor-pointer transition-all ${
                      installments === option.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`installment-${option.value}`}
                      className="sr-only"
                    />
                    <span className="font-medium text-sm">
                      {option.label}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {!showInstallmentOptions && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
              Para planos mensais e semestrais, o pagamento é realizado à vista.
            </div>
          )}

          {/* Proposal Validity Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              Validade da Proposta
            </Label>
            <RadioGroup
              value={validityDays.toString()}
              onValueChange={(value) => setValidityDays(parseInt(value))}
              className="grid grid-cols-7 gap-2"
            >
              {validityOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`validity-${option.value}`}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-2 cursor-pointer transition-all ${
                    validityDays === option.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <RadioGroupItem
                    value={option.value.toString()}
                    id={`validity-${option.value}`}
                    className="sr-only"
                  />
                  <span className="font-bold text-sm">{option.value}</span>
                  <span className="text-[10px] text-muted-foreground">{option.value === 1 ? "dia" : "dias"}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
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
