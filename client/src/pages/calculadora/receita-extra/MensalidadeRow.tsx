/**
 * MensalidadeRow - Monthly subscription (pre-paid) investment row
 */

import { useCalc } from "../CalculadoraContext";
import { formatCurrency } from "../types";

export function MensalidadeRow() {
  const { calculateMonthlyRecurring } = useCalc();

  return (
    <div className="flex justify-between items-start py-4 border-b border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">
          Mensalidade (pré-pago)
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold text-red-600">
          -{formatCurrency(calculateMonthlyRecurring(true))}/mês
        </span>
      </div>
    </div>
  );
}
