import { useCountUp } from "@/hooks/useCountUp";
import { LucideIcon } from "lucide-react";
import { formatNumber } from "@shared/formatters";

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

  // formatNumber imported from @shared/formatters

  return (
    <div ref={elementRef} className="text-center group p-3 sm:p-4">
      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl ${bgColor} ${color} mb-2 sm:mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
      </div>
      <div className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${color} mb-1 sm:mb-2 whitespace-nowrap`}>
        {prefix}{formatNumber(count)}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground font-medium leading-tight">{label}</div>
    </div>
  );
}
