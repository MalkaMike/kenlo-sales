import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, User, Mail, Phone, Globe, Package, Zap, DollarSign, Eye } from "lucide-react";

interface BusinessNature {
  businessType: "broker" | "rental_admin" | "both";
  companyName: string;
  ownerName: string;
  email: string;
  cellphone: string;
  landline: string;
  hasWebsite: boolean;
  websiteUrl: string;
  hasCRM: boolean;
  crmSystem: string;
  crmOther: string;
  hasERP: boolean;
  erpSystem: string;
  erpOther: string;
}

interface PreviewData {
  businessNature: BusinessNature;
  product: string;
  imobPlan?: string;
  locPlan?: string;
  komboName?: string;
  komboDiscount?: number;
  frequency: string;
  addons: {
    leads: boolean;
    inteligencia: boolean;
    assinatura: boolean;
    pay: boolean;
    seguros: boolean;
    cash: boolean;
  };
  totals: {
    monthly: number;
    annual: number;
    implantation: number;
    postPaid: number;
    firstYear: number;
  };
}

interface PreviewDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PreviewData;
  onConfirm: () => void;
}

const businessTypeLabels = {
  broker: "Corretora",
  rental_admin: "Administrador de Aluguel",
  both: "Ambos (Corretora + Administrador)",
};

const frequencyLabels = {
  monthly: "Mensal",
  semestral: "Semestral",
  annual: "Anual",
  biennial: "Bienal",
};

const productLabels = {
  imob: "Kenlo Imob (CRM + Site para vendas)",
  loc: "Kenlo Locação (Gestão de locações)",
  both: "Kenlo Imob + Locação (Solução completa)",
};

const planLabels = {
  prime: "PRIME",
  k: "K",
  k2: "K2",
};

const addonLabels = {
  leads: "Leads",
  inteligencia: "Inteligência",
  assinatura: "Assinatura",
  pay: "Pay",
  seguros: "Seguros",
  cash: "Cash",
};

export function PreviewDataDialog({ open, onOpenChange, data, onConfirm }: PreviewDataDialogProps) {
  const { businessNature, product, imobPlan, locPlan, komboName, komboDiscount, frequency, addons, totals } = data;

  const activeAddons = Object.entries(addons)
    .filter(([_, active]) => active)
    .map(([name]) => addonLabels[name as keyof typeof addonLabels]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Pré-visualização dos Dados
          </DialogTitle>
          <DialogDescription>
            Revise todas as informações antes de exportar a cotação em PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Business Nature Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              1. Natureza do Negócio
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Tipo de Negócio</p>
                  <p className="text-sm font-medium">{businessTypeLabels[businessNature.businessType]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nome da Imobiliária</p>
                  <p className="text-sm font-medium">{businessNature.companyName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Proprietário</p>
                  <p className="text-sm font-medium">{businessNature.ownerName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{businessNature.email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Celular</p>
                  <p className="text-sm font-medium">{businessNature.cellphone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Telefone Fixo</p>
                  <p className="text-sm font-medium">{businessNature.landline || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Website</p>
                  <p className="text-sm font-medium">
                    {businessNature.hasWebsite ? businessNature.websiteUrl : "Cliente não tem site ainda"}
                  </p>
                </div>
                {businessNature.hasCRM && (
                  <div>
                    <p className="text-xs text-gray-500">CRM Atual</p>
                    <p className="text-sm font-medium">
                      {businessNature.crmSystem === "Outro" ? businessNature.crmOther : businessNature.crmSystem}
                    </p>
                  </div>
                )}
                {businessNature.hasERP && (
                  <div>
                    <p className="text-xs text-gray-500">ERP Atual</p>
                    <p className="text-sm font-medium">
                      {businessNature.erpSystem === "Outro" ? businessNature.erpOther : businessNature.erpSystem}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Product Configuration Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              2. Configuração de Produtos
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Produto Selecionado</p>
                <p className="text-sm font-medium">{productLabels[product as keyof typeof productLabels]}</p>
              </div>
              {imobPlan && (
                <div>
                  <p className="text-xs text-gray-500">Plano Imob</p>
                  <Badge variant="secondary">{planLabels[imobPlan as keyof typeof planLabels]}</Badge>
                </div>
              )}
              {locPlan && (
                <div>
                  <p className="text-xs text-gray-500">Plano Locação</p>
                  <Badge variant="secondary">{planLabels[locPlan as keyof typeof planLabels]}</Badge>
                </div>
              )}
              {komboName && (
                <div>
                  <p className="text-xs text-gray-500">Kombo</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{komboName}</p>
                    {komboDiscount && komboDiscount > 0 && (
                      <Badge className="bg-green-100 text-green-800">
                        {(komboDiscount * 100).toFixed(0)}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Período de Pagamento</p>
                <p className="text-sm font-medium">{frequencyLabels[frequency as keyof typeof frequencyLabels]}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Add-ons Section */}
          {activeAddons.length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  3. Add-ons Selecionados
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {activeAddons.map((addon) => (
                      <Badge key={addon} variant="outline" className="bg-white">
                        {addon}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Totals Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Totais
            </h3>
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mensalidade</span>
                <span className="text-sm font-semibold">R$ {totals.monthly.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Licença Anual</span>
                <span className="text-sm font-semibold">R$ {totals.annual.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Implantação (única vez)</span>
                <span className="text-sm font-semibold">R$ {totals.implantation.toLocaleString("pt-BR")}</span>
              </div>
              {totals.postPaid > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Custos Pós-Pago</span>
                  <span className="text-sm font-semibold">R$ {totals.postPaid.toLocaleString("pt-BR")}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-base font-bold text-gray-900">Total Primeiro Ano</span>
                <span className="text-base font-bold text-primary">
                  R$ {totals.firstYear.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Editar
          </Button>
          <Button onClick={onConfirm} className="bg-primary hover:bg-primary/90">
            Confirmar e Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
