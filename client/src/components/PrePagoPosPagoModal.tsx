/**
 * PrePagoPosPagoModal Component
 *
 * Visual modal explaining the Pré-Pago and Pós-Pago model at Kenlo.
 * Redesigned for clarity: side-by-side comparison, icons, and short text.
 */

import {
  CreditCard,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  X,
  Percent,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PrePagoPosPagoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrePagoPosPagoModal({ open, onOpenChange }: PrePagoPosPagoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Modelo de Cobrança Kenlo
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Sua fatura é composta por dois componentes:</p>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Side-by-side cards */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Pré-Pago card */}
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold text-primary text-sm">PRÉ-PAGO</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Licença fixa dos produtos contratados, com base de uso já incluída.
              </p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Valor fixo e previsível</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Usuários e contratos inclusos</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Cobrado no início do ciclo</span>
                </div>
              </div>
            </div>

            {/* Pós-Pago card */}
            <div className="rounded-xl border-2 border-emerald-300/50 bg-emerald-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-bold text-emerald-700 text-sm">PÓS-PAGO</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Uso excedente ao volume incluído, apurado mensalmente.
              </p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Paga só o que usar a mais</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Custo unitário regressivo</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Apurado todo mês</span>
                </div>
              </div>
            </div>
          </div>

          {/* How billing works - visual flow */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Como funciona o ciclo</p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 text-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <p className="text-[11px] text-gray-600 font-medium">Contrata o plano</p>
                <p className="text-[10px] text-gray-400">Pré-Pago cobrado</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <div className="flex-1 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-emerald-600 font-bold text-sm">2</span>
                </div>
                <p className="text-[11px] text-gray-600 font-medium">Usa a plataforma</p>
                <p className="text-[10px] text-gray-400">Base inclusa no plano</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <div className="flex-1 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-1.5">
                  <span className="text-amber-600 font-bold text-sm">3</span>
                </div>
                <p className="text-[11px] text-gray-600 font-medium">Excedeu a base?</p>
                <p className="text-[10px] text-gray-400">Pós-Pago apurado</p>
              </div>
            </div>
          </div>

          {/* Pre-payment discount highlight */}
          <div className="rounded-xl border-2 border-amber-300/50 bg-amber-50/50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Percent className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-bold text-amber-700 text-sm">PRÉ-PAGAMENTO COM DESCONTO</span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Ao optar pelo pré-pagamento de usuários, contratos ou leads adicionais (disponível nos ciclos Anual e Bienal), 
              você recebe <strong className="text-amber-700">10% de desconto</strong> sobre o preço pós-pago correspondente.
            </p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">Preço pré-pago = preço pós-pago × 0,90</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">Disponível para Usuários, Contratos e Leads</span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">Pagamento antecipado no início do ciclo (12 ou 24 meses)</span>
              </div>
            </div>
          </div>

          {/* Key takeaway */}
          <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
            <span className="text-xl">💡</span>
            <p className="text-xs text-gray-700">
              <strong className="text-primary">Quanto mais você cresce, menor o custo unitário.</strong>{" "}
              Seu crescimento gera escala, não penalidade. Com pré-pagamento, economize ainda mais 10%.
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
