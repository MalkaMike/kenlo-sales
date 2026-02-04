import { useCountUp } from "@/hooks/useCountUp";
import { LucideIcon } from "lucide-react";

interface AnimatedStatProps {
  icon: LucideIcon;
  numericValue: number;
  label: string;
  prefix?: string;
  suffix?: string;
  color?: string;
  bgColor?: string;
}

export function AnimatedStat({ icon: Icon, numericValue, label, prefix = "", suffix = "", color = "text-primary", bgColor = "bg-primary/10" }: AnimatedStatProps) {
  const { count, elementRef } = useCountUp({ end: numericValue, duration: 2000 });

  // Formatar o número com separador de milhares
  const formatNumber = (num: number) => {
    // Para números decimais (como 1.2), manter o decimal
    if (num % 1 !== 0) {
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    // Para números inteiros, adicionar separador de milhares
    return num.toLocaleString('pt-BR');
  };

  return (
    <div ref={elementRef} className="text-center group">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${bgColor} ${color} mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-8 h-8" />
      </div>
      <div className={`text-3xl md:text-4xl font-bold ${color} mb-2`}>
        {prefix}{formatNumber(count)}{suffix}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
}
