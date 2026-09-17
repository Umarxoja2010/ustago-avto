import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  accepted: "bg-success/10 text-success border-success/20",
  verified: "bg-success/10 text-success border-success/20",
  completed: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  hidden: "bg-muted text-muted-foreground border-border",
  visible: "bg-info/10 text-info border-info/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { t } = useTranslation("common");
  const tone = tones[status.toLowerCase()] ?? "bg-primary-soft text-primary border-primary/20";
  const key = status.toLowerCase();
  const label = t(`status.${key}`, { defaultValue: status });
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
