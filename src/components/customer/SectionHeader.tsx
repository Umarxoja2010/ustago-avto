import { ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SectionHeader({
  title,
  action,
  to,
}: {
  title: string;
  action?: string;
  to?: string;
}) {
  return (
    <div className="flex items-end justify-between px-5">
      <h2 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h2>
      {action ? (
        to ? (
          <Link
            to={to}
            className="flex items-center gap-0.5 text-sm font-medium text-primary transition-opacity active:opacity-60"
          >
            {action}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-0.5 text-sm font-medium text-primary">
            {action}
            <ChevronRight className="h-4 w-4" />
          </span>
        )
      ) : null}
    </div>
  );
}
