import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Lista de vendedores com dados completos
const VENDORS = [
  { name: "AMANDA DE OLIVEIRA MATOS", email: "amanda.matos@kenlo.com.br", phone: "(11) 99999-0001", role: "Executiva de Vendas" },
  { name: "BRUNO RIBEIRO DA SILVA", email: "bruno.silva@kenlo.com.br", phone: "(11) 99999-0002", role: "Executivo de Vendas" },
  { name: "CASSIA MOREIRA BARBOSA", email: "cassia.barbosa@kenlo.com.br", phone: "(11) 99999-0003", role: "Executiva de Vendas" },
  { name: "EMERSON DE MORAES", email: "emerson.moraes@kenlo.com.br", phone: "(11) 99999-0004", role: "Executivo de Vendas" },
  { name: "IVAN KERR CODO", email: "ivan.codo@kenlo.com.br", phone: "(11) 99999-0005", role: "Executivo de Vendas" },
  { name: "JAQUELINE SILVA GRANELLI", email: "jaqueline.granelli@kenlo.com.br", phone: "(11) 99999-0006", role: "Executiva de Vendas" },
  { name: "LARISSA BRANDALISE FAVI", email: "larissa.favi@kenlo.com.br", phone: "(11) 99999-0007", role: "Executiva de Vendas" },
  { name: "MARINA KIYOMI YOKOMUN", email: "marina.yokomun@kenlo.com.br", phone: "(11) 99999-0008", role: "Executiva de Vendas" },
  { name: "YR MADEIRAS DE GASPERIN", email: "yr.gasperin@kenlo.com.br", phone: "(11) 99999-0009", role: "Executivo de Vendas" },
  { name: "ROBERTA PACHECO DE AZEVEDO", email: "roberta.azevedo@kenlo.com.br", phone: "(11) 99999-0010", role: "Executiva de Vendas" },
];

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
  actionType: "pdf" | "link";
}

export function QuoteInfoDialog({ open, onOpenChange, onSubmit, actionType }: QuoteInfoDialogProps) {
  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorRole, setVendorRole] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [cellPhone, setCellPhone] = useState("");
  const [landlinePhone, setLandlinePhone] = useState("");
  const [hasWebsite, setHasWebsite] = useState<"yes" | "no">("yes");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Quando seleciona um vendedor, preenche automaticamente os dados
  const handleVendorChange = (name: string) => {
    setVendorName(name);
    const vendor = VENDORS.find(v => v.name === name);
    if (vendor) {
      setVendorEmail(vendor.email);
      setVendorPhone(vendor.phone);
      setVendorRole(vendor.role);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!vendorName.trim()) {
      newErrors.vendorName = "Nome do vendedor é obrigatório";
    }

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

    onSubmit({
      vendorName: vendorName.trim(),
      vendorEmail: vendorEmail.trim(),
      vendorPhone: vendorPhone.trim(),
      vendorRole: vendorRole.trim(),
      agencyName: agencyName.trim(),
      ownerName: ownerName.trim(),
      cellPhone: cellPhone.trim(),
      landlinePhone: landlinePhone.trim(),
      websiteUrl: hasWebsite === "yes" ? websiteUrl.trim() : "Cliente não tem site ainda",
      hasWebsite: hasWebsite === "yes",
    });

    // Reset form
    setVendorName("");
    setVendorEmail("");
    setVendorPhone("");
    setVendorRole("");
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
            Preencha as informações abaixo antes de {actionType === "pdf" ? "exportar o PDF" : "copiar o link"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Vendor Name */}
          <div className="space-y-2">
            <Label htmlFor="vendorName">
              Nome do Vendedor <span className="text-red-500">*</span>
            </Label>
            <Select value={vendorName} onValueChange={handleVendorChange}>
              <SelectTrigger className={errors.vendorName ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o vendedor" />
              </SelectTrigger>
              <SelectContent>
                {VENDORS.map((vendor) => (
                  <SelectItem key={vendor.name} value={vendor.name}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vendorName && (
              <p className="text-sm text-red-500">{errors.vendorName}</p>
            )}
          </div>

          {/* Vendor Info (auto-filled, read-only display) */}
          {vendorName && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">E-mail:</span>
                <span className="font-medium">{vendorEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Telefone:</span>
                <span className="font-medium">{vendorPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Cargo:</span>
                <span className="font-medium">{vendorRole}</span>
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
            {actionType === "pdf" ? "Exportar PDF" : "Copiar Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
