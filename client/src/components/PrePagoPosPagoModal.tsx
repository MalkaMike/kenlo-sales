/**
 * PrePagoPosPagoModal Component
 * 
 * Modal dialog explaining the Pré-Pago and Pós-Pago model at Kenlo.
 * Triggered by clicking on the superscript ¹ next to "Pré-Pago" or "Pós-Pago" labels.
 */

import { X, Shield, TrendingUp, Handshake } from "lucide-react";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-beige-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-primary">¹</span> Como funciona o modelo Pré-Pago e Pós-Pago na Kenlo
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">Transparência, previsibilidade e parceria</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Introduction */}
          <div className="text-gray-700 leading-relaxed">
            <p>
              Na Kenlo, acreditamos em relações claras e sustentáveis.
              Nosso modelo foi desenhado para que sua imobiliária tenha previsibilidade e tranquilidade, sem surpresas ou cobranças inesperadas.
            </p>
            <p className="mt-3 font-medium">Ele se baseia em três princípios simples:</p>
          </div>

          {/* Principle 1: Transparência desde o início */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Transparência desde o início</h3>
                <div className="text-gray-700 text-sm space-y-2">
                  <p>Se você estiver no ciclo mensal, receberá dois boletos por mês:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><strong>Pré-Pago</strong> — referente à licença dos produtos contratados, já incluindo uma base de usuários, contratos, leads ou assinaturas.</li>
                    <li><strong>Pós-Pago</strong> — apurado mensalmente, considera somente o uso que exceder o volume incluído no plano contratado.</li>
                  </ul>
                  <p className="mt-3">Nos ciclos semestral, anual ou bianual:</p>
                  <ul className="list-none ml-2 space-y-1">
                    <li>→ O Pré-Pago é cobrado no início do período.</li>
                    <li>→ O Pós-Pago continua sendo apurado mensalmente conforme o uso real.</li>
                  </ul>
                  <p className="mt-3 font-medium text-primary">Você sempre sabe o que está pagando — e por quê.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Principle 2: Crescimento com eficiência */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Crescimento com eficiência</h3>
                <div className="text-gray-700 text-sm space-y-2">
                  <p>No modelo Pós-Pago, consideramos o uso efetivo da plataforma.</p>
                  <p>
                    À medida que sua imobiliária evolui e utiliza mais recursos, o valor por unidade adicional torna-se progressivamente menor.
                  </p>
                  <p>
                    Isso significa que, quanto maior o seu plano e seu volume de uso, mais eficiente se torna o seu custo unitário.
                  </p>
                  <p className="mt-3 font-medium text-primary">Seu crescimento não gera penalidade — gera escala.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Principle 3: Uma relação de longo prazo */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Handshake className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Uma relação de longo prazo</h3>
                <div className="text-gray-700 text-sm space-y-2">
                  <p>Acreditamos que tecnologia deve acompanhar o crescimento do seu negócio, não limitá-lo.</p>
                  <ul className="list-none ml-2 space-y-1">
                    <li>→ Você paga pelo que utiliza.</li>
                    <li>→ Seu custo acompanha sua evolução.</li>
                    <li>→ E o modelo se adapta à sua expansão.</li>
                  </ul>
                  <p className="mt-3 font-medium text-primary">Mais do que fornecer software, queremos construir uma parceria sólida e duradoura.</p>
                </div>
              </div>
            </div>
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
