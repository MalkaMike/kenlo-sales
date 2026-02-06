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
      setInstallments(1); // Reset to "À vista" when dialog opens
    }
  }, [open]);

  const handleSubmit = () => {
    // Use logged-in user data (salesperson or OAuth user)
    onSubmit({
      vendorName: currentUser?.name || "",
      vendorEmail: currentUser?.email || "",
      vendorPhone: currentUser?.phone || "",
      vendorRole: currentUser?.role || "Colaborador Kenlo",
      salespersonId: currentUser?.source === "salesperson" ? currentUser.id : undefined,
      installments: installments,
    });

    // Reset form
    setInstallments(1);
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
