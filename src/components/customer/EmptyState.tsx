import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center px-8 py-16 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-3xl bg-primary/8 text-primary">
        <Icon className="h-9 w-9" strokeWidth={1.6} />
      </span>
      <h3 className="mt-5 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
      {actionLabel ? (
        <Button className="mt-6 rounded-full px-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
