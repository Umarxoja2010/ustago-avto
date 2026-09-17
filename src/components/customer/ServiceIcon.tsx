import {
  BatteryCharging,
  CircleDot,
  Cog,
  Disc3,
  Droplets,
  Gauge,
  LifeBuoy,
  Snowflake,
  SprayCan,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const map: Record<string, LucideIcon> = {
  Cog,
  Droplets,
  BatteryCharging,
  Zap,
  Gauge,
  CircleDot,
  SprayCan,
  Snowflake,
  Disc3,
  LifeBuoy,
};

const tones: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function ServiceIcon({
  icon,
  color = "primary",
  className,
  size = "md",
}: {
  icon: string;
  color?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = map[icon] ?? Wrench;
  const box =
    size === "lg"
      ? "h-14 w-14 rounded-2xl"
      : size === "sm"
        ? "h-9 w-9 rounded-xl"
        : "h-12 w-12 rounded-2xl";
  const glyph = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center",
        box,
        tones[color] ?? tones.primary,
        className,
      )}
    >
      <Icon className={glyph} strokeWidth={2.2} />
    </span>
  );
}
