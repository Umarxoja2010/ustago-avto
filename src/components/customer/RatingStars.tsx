import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function RatingStars({ value, className }: { value: number; className?: string }) {
  const { t } = useTranslation("customer");
  return (
    <span
      className={cn("flex items-center gap-0.5", className)}
      aria-label={t("components.ratingAria", { value })}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(value) ? "fill-warning text-warning" : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}
