import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  suffix?: string;
}

export function StatCard({ title, value, change, icon: Icon, iconColor, iconBg, suffix }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={cn("flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl", iconBg ?? "bg-indigo-500/15")}>
          <Icon className={cn("w-5 h-5", iconColor ?? "text-indigo-400")} />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-1 rounded-lg",
            isPositive
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-red-400 bg-red-500/10"
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white mb-1">
        {value}{suffix && <span className="text-sm font-normal text-white/30 ml-1">{suffix}</span>}
      </p>
      <p className="text-[11px] sm:text-xs text-white/40">{title}</p>

      {/* subtle glow */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: iconColor?.replace("text-", "") || "rgba(99,102,241,0.4)" }} />
    </div>
  );
}
