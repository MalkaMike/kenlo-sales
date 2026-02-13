/**
 * BusinessNatureSection - Business nature form, company info, and contact fields
 * Extracted from CalculadoraPage.tsx (lines ~1526-1782)
 */

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CRM_SYSTEMS, ERP_SYSTEMS, type CRMSystem, type ERPSystem } from "@/constants/systems";
import { useCalc } from "./CalculadoraContext";
import type { BusinessType } from "./types";

export function BusinessNatureSection() {
  const {
    businessNature,
    setBusinessNature,
    showValidationErrors,
  } = useCalc();

  return (
    <div id="business-nature-section" className="mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Natureza do Negócio</h3>
      <Card>
        <CardContent className="pt-4">
          {/* Business type selector */}
          <div className="flex items-center gap-1.5 mb-4">
            {([
              { value: "broker", label: "Corretora" },
              { value: "rental_admin", label: "Administradora" },
              { value: "both", label: "Ambos" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setBusinessNature(prev => ({
                    ...prev,
                    businessType: opt.value as BusinessType,
                    hasWebsite: null,
                    websiteUrl: "",
                    hasCRM: null,
                    crmSystem: "" as CRMSystem | "",
                    crmOther: "",
                    hasERP: null,
                    erpSystem: "" as ERPSystem | "",
                    erpOther: "",
                  }));
                }}
                className={`px-4 py-2 text-sm rounded-lg transition-all border ${
                  businessNature.businessType === opt.value
                    ? "bg-primary text-white font-semibold border-primary shadow-sm"
                    : "bg-white hover:bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Conditional questions based on business type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tem site? - Show for Corretora or Ambos */}
            {(businessNature.businessType === "broker" || businessNature.businessType === "both") && (
              <div>
                <Label className={`text-sm font-medium mb-2 block ${showValidationErrors && businessNature.hasWebsite === null ? "text-red-600" : ""}`}>Tem site? *</Label>
                <div className={`flex items-center gap-2 mb-2 ${showValidationErrors && businessNature.hasWebsite === null ? "ring-1 ring-red-500 rounded-md p-1" : ""}`}>
                  <button
                    onClick={() => setBusinessNature({ ...businessNature, hasWebsite: true })}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                      businessNature.hasWebsite === true
                        ? "bg-green-50 text-green-700 border-green-300 font-semibold"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setBusinessNature({ ...businessNature, hasWebsite: false, websiteUrl: "" })}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                      businessNature.hasWebsite === false
                        ? "bg-red-50 text-red-700 border-red-300 font-semibold"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Não
                  </button>
                  {businessNature.hasWebsite === null && (
                    <span className="text-[10px] text-amber-600 italic">Selecione</span>
                  )}
                </div>
                {businessNature.hasWebsite === true && (
                  <Input
                    value={businessNature.websiteUrl}
                    onChange={(e) => setBusinessNature({ ...businessNature, websiteUrl: e.target.value })}
                    placeholder="https://www.imobiliaria.com.br"
                    className="text-sm"
                  />
                )}
              </div>
            )}

            {/* Tem CRM? - Show for Corretora or Ambos */}
            {(businessNature.businessType === "broker" || businessNature.businessType === "both") && (
              <div>
                <Label className={`text-sm font-medium mb-2 block ${showValidationErrors && businessNature.hasCRM === null ? "text-red-600" : ""}`}>Já usa CRM? *</Label>
                <div className={`flex items-center gap-2 mb-2 ${showValidationErrors && businessNature.hasCRM === null ? "ring-1 ring-red-500 rounded-md p-1" : ""}`}>
                  <button
                    onClick={() => setBusinessNature({ ...businessNature, hasCRM: true })}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                      businessNature.hasCRM === true
                        ? "bg-green-50 text-green-700 border-green-300 font-semibold"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setBusinessNature({ ...businessNature, hasCRM: false, crmSystem: "" as CRMSystem | "", crmOther: "" })}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                      businessNature.hasCRM === false
                        ? "bg-red-50 text-red-700 border-red-300 font-semibold"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Não
                  </button>
                  {businessNature.hasCRM === null && (
                    <span className="text-[10px] text-amber-600 italic">Selecione</span>
                  )}
                </div>
                {businessNature.hasCRM === true && (
                  <div className="space-y-2">
                    <Select
                      value={businessNature.crmSystem}
                      onValueChange={(value) => setBusinessNature({ ...businessNature, crmSystem: value as CRMSystem, crmOther: value !== "Outro" ? "" : businessNature.crmOther })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Selecione o CRM" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {CRM_SYSTEMS.map((crm) => (
                          <SelectItem key={crm} value={crm}>{crm}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {businessNature.crmSystem === "Outro" && (
                      <Input
                        value={businessNature.crmOther}
                        onChange={(e) => setBusinessNature({ ...businessNature, crmOther: e.target.value })}
                        placeholder="Digite o nome do CRM"
                        className="text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tem ERP? - Show for Administradora or Ambos */}
            {(businessNature.businessType === "rental_admin" || businessNature.businessType === "both") && (
              <div>
                <Label className={`text-sm font-medium mb-2 block ${showValidationErrors && businessNature.hasERP === null ? "text-red-600" : ""}`}>Já usa ERP? *</Label>
                <div className={`flex items-center gap-2 mb-2 ${showValidationErrors && businessNature.hasERP === null ? "ring-1 ring-red-500 rounded-md p-1" : ""}`}>
                  <button
                    onClick={() => setBusinessNature({ ...businessNature, hasERP: true })}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                      businessNature.hasERP === true
                        ? "bg-green-50 text-green-700 border-green-300 font-semibold"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setBusinessNature({ ...businessNature, hasERP: false, erpSystem: "" as ERPSystem | "", erpOther: "" })}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-all ${
                      businessNature.hasERP === false
                        ? "bg-red-50 text-red-700 border-red-300 font-semibold"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Não
                  </button>
                  {businessNature.hasERP === null && (
                    <span className="text-[10px] text-amber-600 italic">Selecione</span>
                  )}
                </div>
                {businessNature.hasERP === true && (
                  <div className="space-y-2">
                    <Select
                      value={businessNature.erpSystem}
                      onValueChange={(value) => setBusinessNature({ ...businessNature, erpSystem: value as ERPSystem, erpOther: value !== "Outro" ? "" : businessNature.erpOther })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Selecione o ERP" />
                      </SelectTrigger>
                      <SelectContent>
                        {ERP_SYSTEMS.map((erp) => (
                          <SelectItem key={erp} value={erp}>{erp}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {businessNature.erpSystem === "Outro" && (
                      <Input
                        value={businessNature.erpOther}
                        onChange={(e) => setBusinessNature({ ...businessNature, erpOther: e.target.value })}
                        placeholder="Digite o nome do ERP"
                        className="text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName" className={`text-sm font-semibold mb-2 block ${showValidationErrors && !businessNature.companyName.trim() ? "text-red-600" : ""}`}>Nome da Imobiliária *</Label>
              <Input
                id="companyName"
                value={businessNature.companyName}
                onChange={(e) => setBusinessNature({ ...businessNature, companyName: e.target.value })}
                placeholder="Ex: Imobiliária XYZ"
                className={showValidationErrors && !businessNature.companyName.trim() ? "border-red-500 ring-1 ring-red-500" : ""}
              />
            </div>
            <div>
              <Label htmlFor="ownerName" className={`text-sm font-semibold mb-2 block ${showValidationErrors && !businessNature.ownerName.trim() ? "text-red-600" : ""}`}>Nome do Proprietário *</Label>
              <Input
                id="ownerName"
                value={businessNature.ownerName}
                onChange={(e) => setBusinessNature({ ...businessNature, ownerName: e.target.value })}
                placeholder="Ex: João Silva"
                className={showValidationErrors && !businessNature.ownerName.trim() ? "border-red-500 ring-1 ring-red-500" : ""}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email" className={`text-sm font-semibold mb-2 block ${showValidationErrors && !businessNature.email.trim() ? "text-red-600" : ""}`}>Email *</Label>
              <Input
                id="email"
                type="email"
                value={businessNature.email}
                onChange={(e) => setBusinessNature({ ...businessNature, email: e.target.value })}
                placeholder="contato@imobiliaria.com"
                className={showValidationErrors && !businessNature.email.trim() ? "border-red-500 ring-1 ring-red-500" : ""}
              />
            </div>
            <div>
              <Label htmlFor="cellphone" className={`text-sm font-semibold mb-2 block ${showValidationErrors && !businessNature.cellphone.trim() ? "text-red-600" : ""}`}>Celular *</Label>
              <Input
                id="cellphone"
                value={businessNature.cellphone}
                onChange={(e) => setBusinessNature({ ...businessNature, cellphone: e.target.value })}
                placeholder="(11) 98765-4321"
                className={showValidationErrors && !businessNature.cellphone.trim() ? "border-red-500 ring-1 ring-red-500" : ""}
              />
            </div>
            <div>
              <Label htmlFor="landline" className="text-sm font-semibold mb-2 block">Telefone Fixo</Label>
              <Input
                id="landline"
                value={businessNature.landline}
                onChange={(e) => setBusinessNature({ ...businessNature, landline: e.target.value })}
                placeholder="(11) 3456-7890"
              />
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
