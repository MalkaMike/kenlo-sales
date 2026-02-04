import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSalesperson } from "@/hooks/useSalesperson";
import { User, Mail, Phone, Briefcase } from "lucide-react";

export interface QuoteInfo {
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorRole: string;
  agencyName: string;
  ownerName: string;
  cellPhone: string;
  landlinePhone: string;
  websiteUrl: string;
  hasWebsite: boolean;
}

interface QuoteInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (info: QuoteInfo) => void;
  actionType?: "pdf";
}

export function QuoteInfoDialog({ open, onOpenChange, onSubmit }: QuoteInfoDialogProps) {
  const { salesperson } = useSalesperson();
  
  const [agencyName, setAgencyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [cellPhone, setCellPhone] = useState("");
  const [landlinePhone, setLandlinePhone] = useState("");
  const [hasWebsite, setHasWebsite] = useState<"yes" | "no">("yes");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setErrors({});
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

    // Use logged-in salesperson data automatically
    onSubmit({
      vendorName: salesperson?.name || "",
      vendorEmail: salesperson?.email || "",
      vendorPhone: salesperson?.phone || "",
      vendorRole: "Executivo(a) de Vendas",
      agencyName: agencyName.trim(),
      ownerName: ownerName.trim(),
      cellPhone: cellPhone.trim(),
      landlinePhone: landlinePhone.trim(),
      websiteUrl: hasWebsite === "yes" ? websiteUrl.trim() : "Cliente não tem site ainda",
      hasWebsite: hasWebsite === "yes",
    });

    // Reset form
    setAgencyName("");
    setOwnerName("");
    setCellPhone("");
    setLandlinePhone("");
    setWebsiteUrl("");
    setHasWebsite("yes");
    setErrors({});
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
          {/* Logged-in Salesperson Info (auto-filled, read-only display) */}
          {salesperson && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
              <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Vendedor Responsável</p>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-primary" />
                <span className="font-medium">{salesperson.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{salesperson.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{salesperson.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Executivo(a) de Vendas</span>
              </div>
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

          {/* Website */}
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
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="has-website-no" />
                <Label htmlFor="has-website-no" className="font-normal cursor-pointer">
                  Cliente não tem site ainda
                </Label>
              </div>
            </RadioGroup>

            {hasWebsite === "yes" && (
              <Input
                id="websiteUrl"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://exemplo.com.br"
                className={errors.websiteUrl ? "border-red-500" : ""}
              />
            )}
            {errors.websiteUrl && (
              <p className="text-sm text-red-500">{errors.websiteUrl}</p>
            )}
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
