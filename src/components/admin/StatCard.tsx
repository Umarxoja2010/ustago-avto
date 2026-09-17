import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  hint?: string;
  className?: string;
}) {
  const up = (trend ?? 0) >= 0;
  return (
    <div
      className={cn(
        "card-elevated rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-float",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {typeof trend === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
              up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}
            {trend}%
          </span>
        ) : null}
        {hint ? <span className="truncate text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}
